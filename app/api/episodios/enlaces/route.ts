import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const ANIME1V_API_URL = process.env.ANIME1V_API_URL || 'http://localhost:3000/api/v1/anime'
const ANIME1V_API_KEY = process.env.ANIME1V_API_KEY || 'default-key'

const anime1vClient = axios.create({
  baseURL: ANIME1V_API_URL,
  timeout: 30000,
  headers: {
    'X-API-Key': ANIME1V_API_KEY
  }
})

interface VideoServer {
  id: string
  label: string
  type: 'direct' | 'embed' | 'redirect' | 'unpacker' | 'download'
  url?: string
  quality?: string
}

interface EpisodeLink {
  server: string
  url: string
  quality?: string
  type: string
  isWorkingNow?: boolean
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const episodeUrl = searchParams.get('url')
    const excludeServers = searchParams.get('excludeServers')
    const includeMega = searchParams.get('includeMega') === 'true'

    if (!episodeUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'El parámetro "url" es requerido'
        },
        { status: 400 }
      )
    }

    // Obtener enlaces del episodio desde anime1v-api
    const response = await anime1vClient.get('/episode', {
      params: {
        url: episodeUrl,
        includeMega,
        excludeServers
      }
    })

    if (!response.data?.data?.length) {
      return NextResponse.json({
        success: true,
        episodeUrl,
        servers: [],
        message: 'No se encontraron enlaces disponibles'
      })
    }

    // Transformar respuesta
    const servers: VideoServer[] = response.data.data.map(
      (link: any, index: number) => ({
        id: `server-${index}`,
        label: link.server || 'Servidor Desconocido',
        type: determineServerType(link.server || ''),
        url: link.url,
        quality: link.quality || 'Standard',
        isWorkingNow: !link.error
      })
    )

    // Agrupar por tipo de servidor
    const groupedServers = groupBy(servers, 'label')

    return NextResponse.json({
      success: true,
      episodeUrl,
      totalServers: servers.length,
      servers,
      groupedByServer: Object.entries(groupedServers).map(([server, links]) => ({
        server,
        total: (links as any[]).length,
        links
      })),
      recommendations: getRecommendations(servers),
      message: `Se encontraron ${servers.length} servidores disponibles`
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Anime1v API error:', error.message)
      return NextResponse.json(
        {
          success: false,
          error: `No se pudo conectar con anime1v-api: ${error.message}`,
          hint: 'Asegúrate de que anime1v-api está corriendo en el puerto configurado'
        },
        { status: error.response?.status || 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message
      },
      { status: 500 }
    )
  }
}

function determineServerType(server: string): string {
  const serverLower = server.toLowerCase()

  if (serverLower.includes('yourupload')) return 'direct'
  if (serverLower.includes('mega')) return 'direct'
  if (serverLower.includes('1fichier')) return 'direct'
  if (
    serverLower.includes('streamwish') ||
    serverLower.includes('streamtape')
  )
    return 'embed'
  if (serverLower.includes('voe')) return 'redirect'
  if (
    serverLower.includes('filemoon') ||
    serverLower.includes('doodstream') ||
    serverLower.includes('mixdrop')
  )
    return 'unpacker'
  if (serverLower.includes('pixeldrain')) return 'download'

  return 'unknown'
}

function groupBy<T extends Record<string, any>>(
  array: T[],
  key: keyof T
): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key])
      if (!result[groupKey]) {
        result[groupKey] = []
      }
      result[groupKey].push(item)
      return result
    },
    {} as Record<string, T[]>
  )
}

function getRecommendations(servers: VideoServer[]): string[] {
  const recommendations = []

  // Buscar YourUpload (más confiable)
  const hasYourUpload = servers.some(s =>
    s.label.toLowerCase().includes('yourupload')
  )
  if (hasYourUpload) {
    recommendations.push('YourUpload disponible (muy recomendado)')
  }

  // Buscar servidores directos
  const directServers = servers.filter(s => s.type === 'direct')
  if (directServers.length > 0) {
    recommendations.push(
      `${directServers.length} servidores directos disponibles`
    )
  }

  // Advertencia si solo hay servidores problemáticos
  const workingServers = servers.filter(s => s.isWorkingNow)
  if (workingServers.length === 0) {
    recommendations.push('⚠️ Posibles problemas con los servidores disponibles')
  }

  return recommendations
}
