#!/usr/bin/env node

/**
 * Script para poblar la base de datos con animes y episodios de Jikan API
 * Uso: node scripts/populate-jikan.js
 */

const https = require('https')
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Cargar variables de .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('❌ Error: .env.local no encontrado')
    process.exit(1)
  }

  const env = {}
  const content = fs.readFileSync(envPath, 'utf-8')
  content.split('\n').forEach((line) => {
    if (line && !line.startsWith('#')) {
      const [key, ...rest] = line.split('=')
      env[key] = rest.join('=').replace(/^"/, '').replace(/"$/, '')
    }
  })

  return env
}

const envVars = loadEnv()
const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = envVars.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_KEY son requeridos')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          try {
            resolve(JSON.parse(data))
          } catch {
            reject(new Error(`Invalid JSON from ${url}`))
          }
        })
      })
      .on('error', reject)
  })
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchAnimeSeasons() {
  console.log('📡 Obteniendo animes de temporada actual de Jikan...')

  try {
    // Obtener animes actuales
    const seasonUrl = 'https://api.jikan.moe/v4/seasons/now?limit=25'
    const seasonData = await fetchJSON(seasonUrl)

    console.log(`✅ Obtenidos ${seasonData.data.length} animes`)

    const animes = []

    for (const anime of seasonData.data) {
      await delay(500) // Respetar rate limit de Jikan (1 request por segundo)

      console.log(`📺 Procesando: ${anime.title}`)

      // Insertar anime
      const { error: animeError } = await supabase
        .from('animes')
        .upsert(
          {
            jikan_id: anime.mal_id,
            titulo: anime.title,
            titulo_alternativo: anime.title_english,
            portada_url: anime.images?.jpg?.image_url,
            sinopsis: anime.synopsis,
            estado: anime.status === 'Currently Airing' ? 'EN_EMISION' : 'FINALIZADO',
            generos: anime.genres?.map((g) => g.name) || [],
            puntuacion: anime.score || 0,
            episodios_totales: anime.episodes
          },
          { onConflict: 'jikan_id' }
        )

      if (animeError) {
        console.error(`  ❌ Error insertando anime: ${animeError.message}`)
        continue
      }

      animes.push(anime)

      // Obtener episodios
      try {
        const episodesUrl = `https://api.jikan.moe/v4/anime/${anime.mal_id}/episodes?limit=5`
        const episodesData = await fetchJSON(episodesUrl)

        // Obtener anime_id de Supabase
        const { data: animeData } = await supabase
          .from('animes')
          .select('id')
          .eq('jikan_id', anime.mal_id)
          .single()

        if (!animeData) {
          console.error(`  ❌ No se pudo obtener ID del anime`)
          continue
        }

        // Insertar episodios
        for (const ep of episodesData.data) {
          const { error: epError } = await supabase.from('episodios').upsert(
            {
              anime_id: animeData.id,
              numero: ep.mal_id,
              titulo: ep.title,
              fecha_estreno: ep.aired?.from,
              sinopsis: ep.synopsis,
              imagen_url: ep.images?.jpg?.image_url,
              duracion_minutos: 24
            },
            { onConflict: 'anime_id,numero' }
          )

          if (epError) {
            console.error(`    ❌ Error insertando episodio ${ep.mal_id}: ${epError.message}`)
          } else {
            console.log(`    ✅ Episodio ${ep.mal_id} insertado`)
          }

          await delay(100)
        }
      } catch (episodeError) {
        console.error(`  ⚠️ Error obteniendo episodios: ${episodeError.message}`)
      }
    }

    console.log(`\n✨ ¡Proceso completado! ${animes.length} animes procesados`)
  } catch (error) {
    console.error(`❌ Error: ${error.message}`)
    process.exit(1)
  }
}

async function main() {
  console.log('🎬 Iniciando poblacion de datos...\n')

  await fetchAnimeSeasons()

  console.log('\n🎉 ¡Base de datos poblada exitosamente!')
  process.exit(0)
}

main()
