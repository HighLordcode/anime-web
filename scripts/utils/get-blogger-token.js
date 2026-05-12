#!/usr/bin/env node

const https = require('https')
const url = require('url')
const qs = require('querystring')
const readline = require('readline')

const CLIENT_ID = process.env.BLOGGER_OAUTH_CLIENT_ID || 'your_client_id_here'
const CLIENT_SECRET = process.env.BLOGGER_OAUTH_CLIENT_SECRET || 'your_client_secret_here'
const REDIRECT_URI = 'http://localhost:3000/api/auth/callback'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

function httpsPost(hostname, path, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data)
      }
    }

    const req = https.request(options, res => {
      let body = ''
      res.on('data', chunk => (body += chunk))
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) })
        } catch {
          resolve({ status: res.statusCode, data: body })
        }
      })
    })

    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

async function openBrowser(authUrl) {
  try {
    const platform = process.platform
    const escapedUrl = authUrl.replace(/[&]/g, '^&')
    
    if (platform === 'win32') {
      require('child_process').exec(`start "" "${authUrl}"`)
    } else if (platform === 'darwin') {
      require('child_process').exec(`open "${authUrl}"`)
    } else {
      require('child_process').exec(`xdg-open "${authUrl}"`)
    }
    return true
  } catch {
    return false
  }
}

async function main() {
  console.log('\n🚀 Obteniendo BLOGGER_REFRESH_TOKEN\n')
  console.log('='.repeat(70))

  // Construir URL de autorización
  const authUrl = new url.URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.append('client_id', CLIENT_ID)
  authUrl.searchParams.append('redirect_uri', REDIRECT_URI)
  authUrl.searchParams.append('response_type', 'code')
  authUrl.searchParams.append('scope', 'https://www.googleapis.com/auth/blogger')
  authUrl.searchParams.append('access_type', 'offline')
  authUrl.searchParams.append('prompt', 'consent')

  console.log('\n📱 Abriendo navegador para autorizar...\n')

  const opened = await openBrowser(authUrl.toString())
  if (opened) {
    console.log('✅ Navegador abierto automáticamente\n')
  } else {
    console.log('⚠️ No se pudo abrir el navegador automáticamente\n')
  }

  console.log('🔗 Si el navegador no se abre, accede a:\n')
  console.log(authUrl.toString() + '\n')
  console.log('='.repeat(70) + '\n')

  const authCode = await question(
    '📋 Pega aquí el código de autorización (después del redirect):\n> '
  )

  if (!authCode.trim()) {
    console.error('❌ No se proporcionó código')
    rl.close()
    process.exit(1)
  }

  console.log('\n⏳ Intercambiando código por tokens...\n')

  try {
    const postData = qs.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: authCode.trim(),
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI
    })

    const response = await httpsPost('oauth2.googleapis.com', '/token', postData)

    if (response.status !== 200) {
      console.error('\n❌ Error:', response.data)
      rl.close()
      process.exit(1)
    }

    const refreshToken = response.data.refresh_token

    if (!refreshToken) {
      console.error('\n❌ No se obtuvo refresh_token')
      console.error('Respuesta:', response.data)
      rl.close()
      process.exit(1)
    }

    console.log('\n' + '='.repeat(70))
    console.log('✅ ¡ÉXITO! Token obtenido:\n')
    console.log('📝 Copia esto a tu .env.local:\n')
    console.log(`BLOGGER_REFRESH_TOKEN=${refreshToken}\n`)
    console.log('='.repeat(70))
    console.log('\n✨ Token válido por 6 meses\n')

    rl.close()
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    rl.close()
    process.exit(1)
  }
}

main()
