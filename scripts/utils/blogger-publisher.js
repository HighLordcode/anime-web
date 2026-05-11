#!/usr/bin/env node

/**
 * Script para publicar episodios nuevos en Blogger
 */

require('dotenv').config()
const axios = require('axios')
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY
const bloggerApiKey = process.env.BLOGGER_API_KEY
const bloggerBlogId = process.env.BLOGGER_BLOG_ID

if (!supabaseUrl || !supabaseKey || !bloggerApiKey || !bloggerBlogId) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

async function getUnpublishedEpisodes() {
  try {
    console.log('📋 Fetching unpublished episodes...')
    const { data, error } = await supabase
      .from('episodios')
      .select('*, animes(*)')
      .is('blogger_post_id', null)
      .order('fecha_estreno', { ascending: false })
      .limit(10)

    if (error) throw error
    console.log(`✅ Found ${data?.length || 0} unpublished episodes`)
    return data || []
  } catch (error) {
    console.error('❌ Error fetching episodes:', error.message)
    throw error
  }
}

function generatePostContent(episode, anime) {
  return `
<div class="post-container">
  <h2>${anime.titulo} - Episodio ${episode.numero}</h2>
  <div class="post-meta">
    <p><strong>Título:</strong> ${episode.titulo}</p>
    <p><strong>Fecha:</strong> ${new Date(episode.fecha_estreno).toLocaleDateString('es-ES')}</p>
  </div>
  <div class="post-synopsis">
    <p>${episode.sinopsis || anime.sinopsis}</p>
  </div>
  <div class="post-player">
    <p><em>El reproductor estará disponible en el sitio web principal.</em></p>
  </div>
</div>
`
}

async function publishToBlogger(episode, anime) {
  try {
    const title = `${anime.titulo} - Episodio ${episode.numero}`
    const content = generatePostContent(episode, anime)
    const labels = [
      `anime:${anime.titulo.toLowerCase().replace(/\s+/g, '-')}`,
      'temporada-actual',
      `episodio-${episode.numero}`
    ]

    const response = await axios.post(
      `https://www.googleapis.com/blogger/v3/blogs/${bloggerBlogId}/posts`,
      {
        kind: 'blogger#post',
        blog: { id: bloggerBlogId },
        title,
        content,
        labels,
        published: new Date().toISOString(),
        updated: new Date().toISOString()
      },
      {
        params: { key: bloggerApiKey },
        headers: { 'Content-Type': 'application/json' }
      }
    )

    console.log(`✨ Published: ${title}`)
    return response.data.id
  } catch (error) {
    console.error(`❌ Error publishing to Blogger:`, error.response?.data || error.message)
    throw error
  }
}

async function updateEpisodePostId(episodeId, bloggerPostId) {
  try {
    const { error } = await supabase
      .from('episodios')
      .update({ blogger_post_id: bloggerPostId })
      .eq('id', episodeId)

    if (error) throw error
  } catch (error) {
    console.error(`❌ Error updating episode:`, error.message)
    throw error
  }
}

async function main() {
  try {
    console.log('🚀 Starting Blogger publisher...\n')

    const episodes = await getUnpublishedEpisodes()

    let published = 0

    for (const episode of episodes) {
      try {
        const postId = await publishToBlogger(episode, episode.animes)
        await updateEpisodePostId(episode.id, postId)
        published++

        // Respetar rate limit
        await new Promise(r => setTimeout(r, 1000))
      } catch (error) {
        console.error(`❌ Failed to publish episode ${episode.id}`)
        // Continuar con el siguiente
      }
    }

    console.log(`\n✅ Publisher completed!`)
    console.log(`   Episodes published: ${published}`)
  } catch (error) {
    console.error('❌ Fatal error:', error.message)
    process.exit(1)
  }
}

main()
