#!/usr/bin/env node

/**
 * Script para obtener episodios nuevos de Jikan API
 * y guardarlos en Supabase
 */

require('dotenv').config()
const axios = require('axios')
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

const jikanClient = axios.create({
  baseURL: 'https://api.jikan.moe/v4',
  timeout: 10000
})

async function getSeasonalAnime() {
  try {
    console.log('📺 Fetching seasonal anime from Jikan...')
    const now = new Date()
    const year = now.getFullYear()
    let season

    const month = now.getMonth() + 1
    if (month >= 1 && month <= 3) season = 'winter'
    else if (month >= 4 && month <= 6) season = 'spring'
    else if (month >= 7 && month <= 9) season = 'summer'
    else season = 'fall'

    const response = await jikanClient.get(`/seasons/${year}/${season}`, {
      params: { limit: 50 }
    })

    console.log(`✅ Got ${response.data.data.length} anime for ${season} ${year}`)
    return response.data.data
  } catch (error) {
    console.error('❌ Error fetching seasonal anime:', error.message)
    throw error
  }
}

async function getAnimeEpisodes(malId) {
  try {
    console.log(`  📖 Fetching episodes for anime ${malId}...`)
    const response = await jikanClient.get(`/anime/${malId}/episodes`, {
      params: { limit: 100 }
    })

    return response.data.data || []
  } catch (error) {
    console.error(`  ❌ Error fetching episodes for ${malId}:`, error.message)
    return []
  }
}

async function upsertAnime(animeData, malId) {
  try {
    const { data: existing } = await supabase
      .from('animes')
      .select('id')
      .eq('jikan_id', malId)
      .single()

    if (existing) {
      const { error } = await supabase
        .from('animes')
        .update(animeData)
        .eq('jikan_id', malId)

      if (error) throw error
      return existing.id
    } else {
      const { data, error } = await supabase
        .from('animes')
        .insert([animeData])
        .select('id')
        .single()

      if (error) throw error
      return data.id
    }
  } catch (error) {
    console.error(`  ❌ Error upserting anime ${malId}:`, error.message)
    throw error
  }
}

async function upsertEpisode(episodeData) {
  try {
    const { data: existing } = await supabase
      .from('episodios')
      .select('id')
      .eq('anime_id', episodeData.anime_id)
      .eq('numero', episodeData.numero)
      .maybeSingle()

    if (existing) {
      // Ya existe, no actualizar
      return existing.id
    } else {
      const { data, error } = await supabase
        .from('episodios')
        .insert([episodeData])
        .select('id')
        .single()

      if (error) throw error
      return data.id
    }
  } catch (error) {
    console.error('  ❌ Error upserting episode:', error.message)
    throw error
  }
}

async function main() {
  try {
    console.log('🚀 Starting episode fetch process...\n')

    const animes = await getSeasonalAnime()

    let episodeCount = 0
    let newEpisodeCount = 0

    for (const anime of animes) {
      try {
        // Upsert anime
        const animeId = await upsertAnime({
          jikan_id: anime.mal_id,
          titulo: anime.title,
          titulo_alternativo: anime.title_english,
          portada_url: anime.images.jpg.large_image_url,
          sinopsis: anime.synopsis,
          estado: anime.status === 'Currently Airing' ? 'EN_EMISION' : 'FINALIZADO',
          generos: anime.genres.map(g => g.name),
          puntuacion: anime.score || 0,
          episodios_totales: anime.episodes || 0
        }, anime.mal_id)

        console.log(`✨ Updated anime: ${anime.title}`)

        // Obtener episodios
        const episodes = await getAnimeEpisodes(anime.mal_id)

        for (const ep of episodes) {
          const episodeData = {
            anime_id: animeId,
            numero: ep.mal_id,
            titulo: ep.title,
            fecha_estreno: ep.aired,
            sinopsis: ep.synopsis,
            imagen_url: ep.images?.jpg?.image_url || anime.images.jpg.image_url,
            duracion_minutos: 24, // Default
            enlaces: {}
          }

          const episodeId = await upsertEpisode(episodeData)
          if (episodeId) {
            newEpisodeCount++
          }
          episodeCount++
        }
      } catch (error) {
        console.error(`❌ Error processing anime ${anime.mal_id}:`, error.message)
      }

      // Respetar rate limit
      await new Promise(r => setTimeout(r, 500))
    }

    console.log(`\n✅ Process completed!`)
    console.log(`   Total episodes processed: ${episodeCount}`)
    console.log(`   New episodes added: ${newEpisodeCount}`)
  } catch (error) {
    console.error('❌ Fatal error:', error.message)
    process.exit(1)
  }
}

main()
