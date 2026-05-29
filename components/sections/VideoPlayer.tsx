'use client'

import { useState } from 'react'

interface VideoPlayerProps {
  title: string
  episodeNumber: number
  links?: Record<string, string>
}

export default function VideoPlayer({
  title,
  episodeNumber,
  links = {}
}: VideoPlayerProps) {
  const [selectedServer, setSelectedServer] = useState<string>(
    Object.keys(links)[0] || ''
  )
  const [selectedQuality, setSelectedQuality] = useState<string>('auto')

  const serverList = Object.entries(links)
  const currentLink = selectedServer ? links[selectedServer] : null

  return (
    <div className="w-full">
      {/* Player Container */}
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-6 border border-border">
        {currentLink ? (
          <iframe
            src={currentLink}
            allow="fullscreen; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
            title={`${title} - Episodio ${episodeNumber}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted">
            <i className="fas fa-video text-6xl mb-4" />
            <p>No hay enlaces disponibles</p>
          </div>
        )}
      </div>

      {/* Episode Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text mb-2">
          {title} - Episodio {episodeNumber}
        </h1>
        <p className="text-sm text-muted">
          Selecciona un servidor para reproducir
        </p>
      </div>

      {/* Server Selection */}
      {serverList.length > 0 && (
        <div className="mb-6 pb-6 border-b border-border">
          <p className="text-xs text-muted uppercase tracking-wide mb-3">
            Servidor
          </p>
          <div className="grid grid-cols-auto-fill gap-2">
            {serverList.map(([server, url]) => (
              <button
                key={server}
                onClick={() => setSelectedServer(server)}
                className={`px-3 py-2 rounded font-semibold text-xs transition ${
                  selectedServer === server
                    ? 'bg-primary text-white'
                    : 'bg-bg3 border border-border2 text-muted hover:border-primary hover:text-primary'
                }`}
              >
                {server.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quality Selection (Placeholder) */}
      <div className="mb-6 pb-6 border-b border-border">
        <p className="text-xs text-muted uppercase tracking-wide mb-3">
          Calidad
        </p>
        <div className="grid grid-cols-auto-fill gap-2">
          {['AUTO', '1080p', '720p', '480p'].map(quality => (
            <button
              key={quality}
              onClick={() => setSelectedQuality(quality.toLowerCase())}
              className={`px-3 py-2 rounded font-semibold text-xs transition ${
                selectedQuality === quality.toLowerCase()
                  ? 'bg-primary text-white'
                  : 'bg-bg3 border border-border2 text-muted hover:border-primary hover:text-primary'
              }`}
            >
              {quality}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-bg3 border border-border2 text-muted rounded font-semibold hover:border-primary hover:text-primary transition">
          <i className="fas fa-download text-sm" />
          Descargar
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-bg3 border border-border2 text-muted rounded font-semibold hover:border-primary hover:text-primary transition">
          <i className="fas fa-share-alt text-sm" />
          Compartir
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-bg3 border border-border2 text-muted rounded font-semibold hover:border-primary hover:text-primary transition">
          <i className="fas fa-report-alt text-sm" />
          Reportar
        </button>
      </div>
    </div>
  )
}
