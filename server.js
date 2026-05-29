#!/usr/bin/env node

/**
 * Servidor de anime web - Versión nativa (sin dependencias)
 * Puerto: 3001
 * Maneja rutas API para anime y episodios
 */

const http = require('http')
const fs = require('fs')
const path = require('path')
const url = require('url')

// Cargar .env.local
function loadEnv() {
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
    console.warn('⚠️  No se pudo cargar .env.local')
  }
}

loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const ANIME1V_API_URL = process.env.ANIME1V_API_URL
const ANIME1V_API_KEY = process.env.ANIME1V_API_KEY

const PORT = 3001

// Obtener animes desde Supabase
async function getAnimes(limit = 25, offset = 0) {
  const url_obj = new URL(`${SUPABASE_URL}/rest/v1/animes`)
  url_obj.searchParams.append('limit', limit)
  url_obj.searchParams.append('offset', offset)
  url_obj.searchParams.append('order', 'puntuacion.desc')

  try {
    const response = await fetch(url_obj.toString(), {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    })

    if (response.ok) {
      return await response.json()
    }
    return []
  } catch (err) {
    console.error('Error fetching animes:', err.message)
    return []
  }
}

// Buscar anime por título
async function searchAnimes(query) {
  const url_obj = new URL(`${SUPABASE_URL}/rest/v1/animes`)
  url_obj.searchParams.append('select', '*')
  url_obj.searchParams.append('titulo', `ilike.%${query}%`)

  try {
    const response = await fetch(url_obj.toString(), {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    })

    if (response.ok) {
      return await response.json()
    }
    return []
  } catch (err) {
    console.error('Error searching animes:', err.message)
    return []
  }
}

// Buscar episodios desde anime1v-api
async function searchEpisodes(query) {
  try {
    const response = await fetch(
      `${ANIME1V_API_URL}/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'X-API-Key': ANIME1V_API_KEY
        }
      }
    )

    if (response.ok) {
      const data = await response.json()
      return data.data?.results || []
    }
    return []
  } catch (err) {
    console.error('Error searching episodes:', err.message)
    return []
  }
}

// HTML de la página principal
function getHomePage(animes) {
  const animesList = animes
    .map(a => `
    <div class="anime-card">
      <img src="${a.portada_url}" alt="${a.titulo}" />
      <h3>${a.titulo}</h3>
      <p class="rating">⭐ ${a.puntuacion}/10</p>
      <p class="synopsis">${a.sinopsis.substring(0, 100)}...</p>
    </div>
  `).join('')

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Anime Web</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #fff; }
    header { padding: 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    h1 { font-size: 2.5rem; margin-bottom: 1rem; }
    .search-box { display: flex; gap: 1rem; margin-bottom: 2rem; }
    input { padding: 0.75rem; border: none; border-radius: 4px; width: 300px; }
    button { padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:hover { background: #764ba2; }
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
    .anime-card { background: #1e293b; border-radius: 8px; overflow: hidden; transition: transform 0.3s; }
    .anime-card:hover { transform: translateY(-4px); }
    .anime-card img { width: 100%; height: 300px; object-fit: cover; }
    .anime-card h3 { padding: 1rem; font-size: 1rem; }
    .anime-card .rating { color: #fbbf24; font-weight: bold; padding: 0.5rem 1rem; }
    .anime-card .synopsis { padding: 0.5rem 1rem; font-size: 0.85rem; color: #cbd5e1; }
    .status { text-align: center; padding: 1rem; color: #64748b; }
  </style>
</head>
<body>
  <header>
    <h1>🎬 Anime Web</h1>
    <p>Explora tu catálogo de anime favorito</p>
  </header>
  
  <div class="container">
    <div class="search-box">
      <input type="text" id="searchInput" placeholder="Buscar anime..." />
      <button onclick="searchAnime()">Buscar</button>
    </div>

    <div class="grid">
      ${animesList}
    </div>
    ${animes.length === 0 ? '<div class="status">⏳ Cargando animes...</div>' : ''}
  </div>

  <script>
    function searchAnime() {
      const query = document.getElementById('searchInput').value
      if (query.trim()) {
        window.location.href = '/api/buscar?q=' + encodeURIComponent(query)
      }
    }

    document.getElementById('searchInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') searchAnime()
    })
  </script>
</body>
</html>
  `
}

// Crear servidor
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true)
  const pathname = parsedUrl.pathname
  const query = parsedUrl.query

  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  try {
    // Página principal
    if (pathname === '/' && req.method === 'GET') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      const animes = await getAnimes(25, 0)
      res.writeHead(200)
      res.end(getHomePage(animes))
      return
    }

    // API: Obtener animes
    if (pathname === '/api/animes' && req.method === 'GET') {
      const limit = parseInt(query.limit) || 25
      const offset = parseInt(query.offset) || 0
      const animes = await getAnimes(limit, offset)
      res.writeHead(200)
      res.end(JSON.stringify({ data: animes }))
      return
    }

    // API: Buscar animes
    if (pathname === '/api/buscar' && req.method === 'GET') {
      const q = query.q || ''
      if (q.length < 2) {
        res.writeHead(400)
        res.end(JSON.stringify({ error: 'Query muy corto' }))
        return
      }

      const results = await searchAnimes(q)
      res.writeHead(200)
      res.end(JSON.stringify({ data: results }))
      return
    }

    // API: Buscar episodios
    if (pathname === '/api/episodios' && req.method === 'GET') {
      const q = query.q || ''
      if (q.length < 2) {
        res.writeHead(400)
        res.end(JSON.stringify({ error: 'Query muy corto' }))
        return
      }

      const episodes = await searchEpisodes(q)
      res.writeHead(200)
      res.end(JSON.stringify({ data: episodes }))
      return
    }

    // 404
    res.writeHead(404)
    res.end(JSON.stringify({ error: 'Ruta no encontrada' }))
  } catch (err) {
    console.error('Server error:', err)
    res.writeHead(500)
    res.end(JSON.stringify({ error: err.message }))
  }
})

server.listen(PORT, () => {
  console.log(`\n✅ Servidor web en http://localhost:${PORT}`)
  console.log(`   - Inicio: http://localhost:${PORT}/`)
  console.log(`   - API Animes: http://localhost:${PORT}/api/animes`)
  console.log(`   - Buscar: http://localhost:${PORT}/api/buscar?q=Naruto`)
  console.log(`   - Episodios: http://localhost:${PORT}/api/episodios?q=Naruto\n`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Puerto ${PORT} ya está en uso`)
  } else {
    console.error('Error del servidor:', err)
  }
  process.exit(1)
})
