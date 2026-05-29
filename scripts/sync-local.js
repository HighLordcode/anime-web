#!/usr/bin/env node

/**
 * Script de sincronización usando datos locales de ejemplo
 * Útil para desarrollo y testing sin depender de APIs externas
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_KEY son requeridos')
  process.exit(1)
}

// Datos de ejemplo de animes populares
const SAMPLE_ANIMES = [
  {
    mal_id: 5,
    title: "Cowboy Bebop",
    title_english: "Cowboy Bebop",
    title_japanese: "カウボーイビバップ",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/4/19644.jpg",
        small_image_url: "https://cdn.myanimelist.net/images/anime/4/19644t.jpg",
        large_image_url: "https://cdn.myanimelist.net/images/anime/4/19644l.jpg"
      }
    },
    score: 8.75,
    scored_by: 500000,
    rank: 34,
    popularity: 10,
    status: "Finished Airing",
    type: "TV",
    episodes: 26,
    year: 1998,
    season: "fall",
    synopsis: "In the year 2071, humanity has colonized several planets and moons. Flint, a bounty hunter, travels the solar system...this is the tale of his adventures.",
    genres: [{name: "Action"}, {name: "Adventure"}, {name: "Sci-Fi"}],
    url: "https://myanimelist.net/anime/5/Cowboy_Bebop"
  },
  {
    mal_id: 1,
    title: "Fullmetal Alchemist: Brotherhood",
    title_english: "Fullmetal Alchemist: Brotherhood",
    title_japanese: "鋼の錬金術師 FULLMETAL ALCHEMIST",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/6/17451.jpg",
        small_image_url: "https://cdn.myanimelist.net/images/anime/6/17451t.jpg",
        large_image_url: "https://cdn.myanimelist.net/images/anime/6/17451l.jpg"
      }
    },
    score: 9.16,
    scored_by: 600000,
    rank: 1,
    popularity: 2,
    status: "Finished Airing",
    type: "TV",
    episodes: 64,
    year: 2009,
    season: "spring",
    synopsis: "Fullmetal Alchemist is a masterpiece of anime.",
    genres: [{name: "Action"}, {name: "Adventure"}, {name: "Drama"}, {name: "Fantasy"}],
    url: "https://myanimelist.net/anime/5081/Fullmetal_Alchemist__Brotherhood"
  },
  {
    mal_id: 9253,
    title: "Steins;Gate",
    title_english: "Steins;Gate",
    title_japanese: "STEINS;GATE",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/5/50385.jpg",
        small_image_url: "https://cdn.myanimelist.net/images/anime/5/50385t.jpg",
        large_image_url: "https://cdn.myanimelist.net/images/anime/5/50385l.jpg"
      }
    },
    score: 9.09,
    scored_by: 550000,
    rank: 3,
    popularity: 1,
    status: "Finished Airing",
    type: "TV",
    episodes: 24,
    year: 2011,
    season: "spring",
    synopsis: "A group of scientists discover time travel.",
    genres: [{name: "Sci-Fi"}, {name: "Thriller"}, {name: "Drama"}],
    url: "https://myanimelist.net/anime/9253/Steins_Gate"
  },
  {
    mal_id: 438,
    title: "Bleach",
    title_english: "Bleach",
    title_japanese: "BLEACH",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/7/40449.jpg",
        small_image_url: "https://cdn.myanimelist.net/images/anime/7/40449t.jpg",
        large_image_url: "https://cdn.myanimelist.net/images/anime/7/40449l.jpg"
      }
    },
    score: 7.92,
    scored_by: 400000,
    rank: 75,
    popularity: 5,
    status: "Finished Airing",
    type: "TV",
    episodes: 366,
    year: 2004,
    season: "fall",
    synopsis: "Ichigo Kurosaki becomes a Soul Reaper to protect the living world.",
    genres: [{name: "Action"}, {name: "Adventure"}, {name: "Super Power"}, {name: "Shounen"}],
    url: "https://myanimelist.net/anime/439/Bleach"
  },
  {
    mal_id: 21,
    title: "One Piece",
    title_english: "One Piece",
    title_japanese: "ONE PIECE",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/6/73245.jpg",
        small_image_url: "https://cdn.myanimelist.net/images/anime/6/73245t.jpg",
        large_image_url: "https://cdn.myanimelist.net/images/anime/6/73245l.jpg"
      }
    },
    score: 8.56,
    scored_by: 700000,
    rank: 13,
    popularity: 3,
    status: "Currently Airing",
    type: "TV",
    episodes: 1000,
    year: 1999,
    season: "fall",
    synopsis: "Monkey D. Luffy sails the seas to become the Pirate King.",
    genres: [{name: "Action"}, {name: "Adventure"}, {name: "Comedy"}, {name: "Shounen"}],
    url: "https://myanimelist.net/anime/21/One_Piece"
  }
]

function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    dryRun: false,
    verbose: false
  }

  args.forEach(arg => {
    if (arg === '--dry-run' || arg === '--test') {
      options.dryRun = true
    } else if (arg === '--verbose') {
      options.verbose = true
    }
  })

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

async function main() {
  const options = parseArgs()

  console.log('🎬 Script de Sincronización con Datos Locales')
  console.log(`📋 Configuración:`)
  console.log(`   Animes a sincronizar: ${SAMPLE_ANIMES.length}`)
  console.log(`   Modo: ${options.dryRun ? 'TEST (dry-run)' : 'PRODUCCIÓN'}`)
  console.log(`   Verbose: ${options.verbose ? 'Sí' : 'No'}`)
  console.log('')

  let successCount = 0
  let errorCount = 0

  for (const anime of SAMPLE_ANIMES) {
    try {
      const transformed = transformAnime(anime)

      if (!options.dryRun) {
        const existing = await checkAnimeExists(anime.mal_id)

        if (existing) {
          await updateAnime(anime.mal_id, transformed)
          if (options.verbose) console.log(`  ✏️  Actualizado: ${transformed.titulo}`)
        } else {
          await insertAnime(transformed)
          if (options.verbose) console.log(`  ✅ Insertado: ${transformed.titulo}`)
        }
      } else if (options.verbose) {
        console.log(`  🔍 [TEST] ${transformed.titulo} (${anime.score}/10)`)
      }

      successCount++
    } catch (err) {
      errorCount++
      console.error(`  ❌ Error con ${anime.title}:`, err.message)
    }
  }

  console.log('')
  console.log('📊 Resumen Final:')
  console.log(`   Total procesados: ${SAMPLE_ANIMES.length}`)
  console.log(`   Éxitos: ${successCount} ✅`)
  console.log(`   Errores: ${errorCount} ❌`)
  console.log(`   Modo: ${options.dryRun ? 'TEST (sin guardar)' : 'PRODUCCIÓN (guardados)'}`)

  if (options.dryRun) {
    console.log('')
    console.log('ℹ️  Para sincronizar en producción, ejecuta:')
    console.log(`   node scripts/sync-local.js`)
  }
}

main().catch(err => {
  console.error('❌ Error fatal:', err.message)
  process.exit(1)
})
