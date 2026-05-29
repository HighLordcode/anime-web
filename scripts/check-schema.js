#!/usr/bin/env node

// Cargar variables de entorno manualmente
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
    console.warn('⚠️  No se pudo cargar .env.local')
  }
}

loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY

async function getTableSchema() {
  const url = new URL(`${SUPABASE_URL}/rest/v1/animes`)
  url.searchParams.append('limit', '1')

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
      }
    })

    if (response.ok) {
      const data = await response.json()
      if (data.length > 0) {
        console.log('Columnas encontradas en tabla animes:')
        console.log(Object.keys(data[0]).sort())
      }
    }
  } catch (err) {
    console.error('Error:', err.message)
  }
}

getTableSchema()
