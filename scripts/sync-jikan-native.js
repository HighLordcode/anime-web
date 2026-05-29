#!/usr/bin/env node

/**
 * Script de sincronización de Jikan API a Supabase
 * USO NATIVO: Sin dependencias externas, solo Node.js incorporado
 * 
 * Uso:
 *   node scripts/sync-jikan-native.js --test
 *   node scripts/sync-jikan-native.js --page 1
 *   node scripts/sync-jikan-native.js --pages 1-5
 *   node scripts/sync-jikan-native.js --page 1 --verbose
 */

// Cargar variables de entorno manualmente desde .env.local
function loadEnv() {
  const fs = require('fs')
  const path = require('path')
  
  try {
    const envPath = path.join(__dirname, '..', '.env.local')
    const envContent = fs.readFileSync(envPath, 'utf-8')
    const lines = envContent.split('\n')
    
    lines.forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        const value = valueParts.join('=')
        if (key && value) {
          process.env[key] = value
        }
      }
    })
  } catch (e) {
    console.warn('⚠️  No se pudo cargar .env.local, usando variables del sistema')
  }
}

loadEnv()

const JIKAN_API_URL = 'https://api.jikan.moe/v4'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_KEY son requeridos')
  process.exit(1)
}

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
    episodios_totales: anime.episodes || 0
  }
}

async function fetchFromJikan(path, params = {}, retries = 3) {
  const url = new URL(`${JIKAN_API_URL}${path}`)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value)
  })

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url.toString(), {
        timeout: 20000
      })
      
      if (response.ok) {
        return response.json()
      }
      
      if (response.status === 504 && attempt < retries) {
        console.log(`   ⚠️  Gateway timeout, reintentando (${attempt}/${retries})...`)
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt))
        continue
      }
      
      throw new Error(`Jikan API error: ${response.status}`)
    } catch (err) {
      if (attempt === retries) {
        throw err
      }
      console.log(`   ⚠️  Error de conexión, reintentando (${attempt}/${retries})...`)
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt))
    }
  }
}

async function checkAnimeExists(jikanId) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/animes`)
  url.searchParams.append('jikan_id', `eq.${jikanId}`)
  url.searchParams.append('select', 'id')

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.length > 0 ? data[0] : null
  } catch (err) {
    return null
  }
}

async function insertAnime(anime) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/animes`)

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(anime)
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Supabase insert error: ${response.status} - ${text}`)
  }
}

async function updateAnime(jikanId, anime) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/animes`)
  url.searchParams.append('jikan_id', `eq.${jikanId}`)

  const response = await fetch(url.toString(), {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(anime)
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Supabase update error: ${response.status} - ${text}`)
  }
}

async function syncPage(pageNum, limit, dryRun, verbose) {
  try {
    if (verbose) console.log(`📄 Obteniendo página ${pageNum}...`)

    const data = await fetchFromJikan('/anime', {
      page: pageNum,
      limit,
      order_by: 'score',
      sort: 'desc',
      status: 'airing'
    })

    const animes = data.data
    let successCount = 0
    let errorCount = 0

    for (const anime of animes) {
      try {
        const transformed = transformAnime(anime)

        if (!dryRun) {
          const existing = await checkAnimeExists(anime.mal_id)

          if (existing) {
            await updateAnime(anime.mal_id, transformed)
            if (verbose) console.log(`  ✏️  Actualizado: ${transformed.titulo}`)
          } else {
            await insertAnime(transformed)
            if (verbose) console.log(`  ✅ Insertado: ${transformed.titulo}`)
          }
        } else if (verbose) {
          console.log(`  🔍 [TEST] ${transformed.titulo} (${anime.score}/10)`)
        }

        successCount++
      } catch (err) {
        errorCount++
        if (verbose) {
          console.error(`  ❌ Error con ${anime.title}:`, err.message)
        }
      }
    }

    return { successCount, errorCount, total: animes.length }
  } catch (error) {
    console.error(`❌ Error en página ${pageNum}:`, error.message)
    return { successCount: 0, errorCount: 0, total: 0 }
  }
}

async function main() {
  const options = parseArgs()

  console.log('🎬 Script de Sincronización Jikan → Supabase (NATIVO)')
  console.log(`📋 Configuración:`)
  console.log(`   Páginas: ${options.startPage}${options.endPage !== options.startPage ? `-${options.endPage}` : ''}`)
  console.log(`   Límite por página: ${options.limit}`)
  console.log(`   Modo: ${options.dryRun ? 'TEST (dry-run)' : 'PRODUCCIÓN'}`)
  console.log(`   Verbose: ${options.verbose ? 'Sí' : 'No'}`)
  console.log('')

  let totalSuccess = 0
  let totalError = 0
  let totalAnimes = 0

  for (let page = options.startPage; page <= options.endPage; page++) {
    const result = await syncPage(page, options.limit, options.dryRun, options.verbose)
    totalSuccess += result.successCount
    totalError += result.errorCount
    totalAnimes += result.total

    if (options.verbose) {
      console.log(`   Página ${page}: ${result.successCount} ✅ / ${result.errorCount} ❌ (total: ${result.total})`)
    }

    // Pequeña pausa entre páginas para no sobrecargar
    if (page < options.endPage) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  console.log('')
  console.log('📊 Resumen Final:')
  console.log(`   Total procesados: ${totalAnimes}`)
  console.log(`   Éxitos: ${totalSuccess} ✅`)
  console.log(`   Errores: ${totalError} ❌`)
  console.log(`   Modo: ${options.dryRun ? 'TEST (sin guardar)' : 'PRODUCCIÓN (guardados)'}`)

  if (options.dryRun) {
    console.log('')
    console.log('ℹ️  Para sincronizar en producción, ejecuta:')
    console.log(`   node scripts/sync-jikan-native.js --page ${options.startPage}`)
  }
}

main().catch(err => {
  console.error('❌ Error fatal:', err.message)
  process.exit(1)
})
