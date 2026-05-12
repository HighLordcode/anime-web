import type { Metadata } from 'next'
import type React from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Anime Online - Mira los mejores animes',
  description: 'Plataforma de streaming de anime con subtítulos en español. Últimos episodios, temporada actual, búsqueda avanzada.',
  keywords: 'anime online, anime sub español, ver anime, streaming anime',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://anime-web.vercel.app',
    title: 'Anime Online',
    description: 'Plataforma de streaming de anime con subtítulos en español',
    images: [
      {
        url: 'https://anime-web.vercel.app/og-image.png',
        width: 1200,
        height: 630
      }
    ]
  }
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Barlow+Condensed:wght@700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg text-text antialiased">{children}</body>
    </html>
  )
}
