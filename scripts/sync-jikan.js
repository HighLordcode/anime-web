#!/usr/bin/env node

/**
 * Script de sincronización de Jikan API a Supabase
 * Uso:
 *   - Sync test (dry run):     npm run sync:test
 *   - Sync page 1:             npm run sync -- --page 1
 *   - Sync pages 1-5:          npm run sync -- --pages 1-5
 *   - Sync con verbose:        npm run sync -- --page 1 --verbose
 */

// Load .env.local if available, but don't crash if it's not
try {
  require('dotenv').config({ path: '.env.local' })
} catch (e) {
  // dotenv is optional
}

const axios = require('axios')
const { createClient } = require('@supabase/supabase-js')

const JIKAN_API_URL = 'https://api.jikan.moe/v4'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_KEY son requeridos')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    startPage: 1,
    endPage: 1,
    dryRun: false,
    verbose: false,
    limit: 25
  }

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--page') {
      options.startPage = parseInt(args[i + 1])
      options.endPage = options.startPage
      i++
    } else if (args[i] === '--pages') {
      const range = args[i + 1].split('-')
      options.startPage = parseInt(range[0])
      options.endPage = parseInt(range[1])
      i++
    } else if (args[i] === '--dry-run' || args[i] === '--test') {
      options.dryRun = true
    } else if (args[i] === '--verbose') {
      options.verbose = true
    } else if (args[i] === '--limit') {
      options.limit = parseInt(args[i + 1])
      i++
    }
  }

  return options
}

function transformAnime(anime) {
  return {
    jikan_id: anime.mal_id,
    titulo: anime.title || 'Sin título',
    titulo_alternativo: anime.title_english || anime.title_japanese,
    portada_url: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
    sinopsis: anime.synopsis || 'Sin sinopsis',
    estado: anime.status === 'Finished Airing' ? 'FINALIZADO' : 'EN_EMISION',
    generos: anime.genres?.map(g => g.name) || [],
    puntuacion: anime.score || 0,
    episodios_totales: anime.episodes || 0,
    tipo: anime.type,
    url_jikan: anime.url,
    ranking: anime.rank || null,
    popularidad: anime.popularity || 0,
    anio: anime.year,
    temporada: anime.season
  }
}

async function syncPage(pageNum, limit, dryRun, verbose) {
  try {
    if (verbose) console.log(`📄 Obteniendo página ${pageNum}...`)

    const response = await axios.get(`${JIKAN_API_URL}/anime`, {
      params: {
        page: pageNum,
        limit,
        order_by: 'score',
        sort: 'desc',
        status: 'airing'
      },
      timeout: 10000
    })

    const animes = response.data.data
    let successCount = 0
    let errorCount = 0

    for (const anime of animes) {
      try {
        const transformed = transformAnime(anime)

        if (!dryRun) {
          const { data: existing } = await supabase
            .from('animes')
            .select('id')
            .eq('jikan_id', anime.mal_id)
            .maybeSingle()

          if (existing) {
            await supabase
              .from('animes')
              .update(transformed)
              .eq('jikan_id', anime.mal_id)
            if (verbose) console.log(`  ✏️  Actualizado: ${transformed.titulo}`)
          } else {
            await supabase.from('animes').insert([transformed])
            if (verbose) console.log(`  ✅ Insertado: ${transformed.titulo}`)
          }
        } else if (verbose) {
          console.log(`  🔍 [DRY] ${transformed.titulo} (${anime.score}/10)`)
        }

        successCount++
      } catch (err) {
        errorCount++
        if (verbose) console.error(`  ❌ Error con ${anime.title}:`, err.message)
      }
    }

    return { successCount, errorCount, total: animes.length }
  } catch (error) {
    if (error.response) {
      console.error(`❌ Error de Jikan API (página ${pageNum}):`, error.message)
    } else {
      console.error(`❌ Error:`, error.message)
    }
    return { successCount: 0, errorCount: 0, total: 0 }
  }
}

async function main() {
  const options = parseArgs()

  console.log('🎬 Script de Sincronización Jikan → Supabase')
  console.log(`📋 Configuración:`)
  console.log(`   Páginas: ${options.startPage}${options.endPage !== options.startPage ? `-${options.endPage}` : ''}`)
  console.log(`   Límite por página: ${options.limit}`)
  console.log(`   Modo: ${options.dryRun ? 'TEST (dry-run)' : 'PRODUCCIÓN'}`)
  console.log(`   Verbose: ${options.verbose ? 'Sí' : 'No'}`)
  console.log('')

  let totalSuccess = 0
  let totalError = 0
  const startTime = Date.now()

  for (let page = options.startPage; page <= options.endPage; page++) {
    const result = await syncPage(page, options.limit, options.dryRun, options.verbose)
    totalSuccess += result.successCount
    totalError += result.errorCount

    console.log(`✨ Página ${page}: ${result.successCount}/${result.total} exitosos, ${result.errorCount} errores`)

    // Rate limiting
    if (page < options.endPage) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
  console.log('')
  console.log('📊 Resumen Final:')
  console.log(`   Total exitosos: ${totalSuccess}`)
  console.log(`   Total errores: ${totalError}`)
  console.log(`   Tiempo: ${elapsed}s`)
  console.log(`   Modo: ${options.dryRun ? 'TEST' : 'PRODUCCIÓN'}`)

  if (options.dryRun) {
    console.log('')
    console.log('💡 Esto fue un TEST. Usa sin --test para sincronizar realmente.')
  }

  process.exit(0)
}

main().catch(err => {
  console.error('❌ Error fatal:', err.message)
  process.exit(1)
})
