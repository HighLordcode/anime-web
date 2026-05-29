# 🎬 Integración Anime1v-api - Episodios y Streams

## 📋 Contenido

- Búsqueda de episodios desde múltiples proveedores
- Obtención de enlaces de video/descarga
- Soporte para 6 proveedores de anime
- Múltiples servidores de video soportados

---

## 🔧 Configuración Inicial

### 1. Variables de Entorno

Copia el archivo `.env.example` y configura:

```bash
# URL de anime1v-api (local o remoto)
ANIME1V_API_URL=http://localhost:3001/api/v1/anime

# API Key de anime1v-api (si está configurado)
ANIME1V_API_KEY=default-key
```

**Ubicación del archivo:**
```
f:/general/Descargas/anime web/implementa aqui/.env.local
```

### 2. Instalar anime1v-api Localmente

```bash
# 1. Navega a la carpeta
cd "f:\general\Descargas\anime web\apis repositorios\anime1v-api-main"

# 2. Instala dependencias
npm install

# 3. Configura .env si es necesario
cp .env.example .env

# 4. Instala puppeteer (para sitios con protección JS)
npm install puppeteer

# 5. Inicia el servidor
npm run dev
```

**Salida esperada:**
```
Server running on http://localhost:3001
```

### 3. Verificar Conexión

```bash
# Test local
curl "http://localhost:3001/api/v1/anime/search?q=Naruto"
```

---

## 🔍 Proveedores Disponibles

| ID | Proveedor | Búsqueda | Episodios | Descargas | Estado |
|:--:|-----------|:--------:|:---------:|:---------:|--------|
| 1 | **AnimeAV1** | ✅ | ✅ | ✅ | Muy estable, recomendado |
| 2 | **TioAnime** | ✅ | ✅ | ✅ | Bueno |
| 3 | **AnimeFLV** | ✅ | ✅ | ✅ | Más lento (anti-bot) |
| 4 | **JKAnime** | ✅ | ✅ | ❌ | Cifrado fuerte |
| 5 | **MonosChinos** | ✅ | ✅ | ✅ | Bueno |
| 6 | **HentaiLA** | ✅ | ✅ | ⚠️ | Parcial |

### Usar proveedor específico:

```bash
# Buscar solo en TioAnime
curl "http://localhost:3000/api/episodios/buscar?q=One%20Piece&providers=tioanime"

# Buscar en múltiples proveedores
curl "http://localhost:3000/api/episodios/buscar?q=Naruto&providers=animeav1,tioanime,animeflv"
```

---

## 🎥 Servidores de Video Soportados

| Servidor | Tipo | HLS | Calidad | Recomendación |
|----------|------|:---:|:-------:|---------------|
| **YourUpload** | Directo | No | Alta | ⭐⭐⭐ Mejor |
| **Mega** | Directo | No | Alta | ⭐⭐ Requiere API |
| **Filemoon** | Unpacker | Sí | Alta | ⭐⭐⭐ Muy bueno |
| **StreamWish** | Embed | Sí | Media | ⭐⭐ |
| **Mixdrop** | Unpacker | No | Alta | ⭐⭐ |
| **Doodstream** | Unpacker | No | Media | ⭐ |
| **StreamTape** | Embed | No | Media | ⭐ |
| **VOE** | Redirect | No | Media | ⭐ |
| **PixelDrain** | Download | No | Variable | ⭐ |

---

## 📡 Endpoints Implementados

### 1. Buscar Episodios

**Endpoint:** `GET /api/episodios/buscar`

Busca un anime en múltiples proveedores y retorna todos sus episodios.

**Parámetros:**
- `q` (string, **requerido**): Título del anime
- `providers` (string, opcional): Proveedores a usar, separados por coma

**Ejemplo:**

```bash
# Buscar "Naruto" en todos los proveedores
curl "http://localhost:3000/api/episodios/buscar?q=Naruto"

# Buscar en proveedores específicos
curl "http://localhost:3000/api/episodios/buscar?q=One%20Piece&providers=animeav1,tioanime"
```

**Respuesta:**

```json
{
  "success": true,
  "query": "Naruto",
  "totalEpisodes": 220,
  "providers": [
    {
      "id": "animeav1",
      "label": "AnimeAV1",
      "found": 220,
      "error": null
    },
    {
      "id": "tioanime",
      "label": "TioAnime",
      "found": 220,
      "error": null
    }
  ],
  "episodes": [
    {
      "number": 1,
      "title": "Introduzione - Naruto Uzumaki",
      "url": "https://animeav1.com/ver/naruto-1",
      "provider": "animeav1",
      "sources": ["animeav1", "tioanime"]
    },
    {
      "number": 2,
      "title": "Il mio nome è Naruto Uzumaki",
      "url": "https://animeav1.com/ver/naruto-2",
      "provider": "animeav1",
      "sources": ["animeav1", "tioanime"]
    }
  ],
  "message": "Se encontraron 220 episodios en 2 proveedores"
}
```

### 2. Obtener Enlaces de Video

**Endpoint:** `GET /api/episodios/enlaces`

Obtiene todos los servidores de video disponibles para un episodio específico.

**Parámetros:**
- `url` (string, **requerido**): URL del episodio
- `excludeServers` (string, opcional): Servidores a excluir (separados por coma)
- `includeMega` (boolean, opcional): Incluir servidores Mega

**Ejemplo:**

```bash
# Obtener enlaces de un episodio
curl "http://localhost:3000/api/episodios/enlaces?url=https://animeav1.com/ver/naruto-1"

# Excluir ciertos servidores
curl "http://localhost:3000/api/episodios/enlaces?url=https://animeav1.com/ver/naruto-1&excludeServers=voe,streamtape"

# Incluir Mega
curl "http://localhost:3000/api/episodios/enlaces?url=https://animeav1.com/ver/naruto-1&includeMega=true"
```

**Respuesta:**

```json
{
  "success": true,
  "episodeUrl": "https://animeav1.com/ver/naruto-1",
  "totalServers": 5,
  "servers": [
    {
      "id": "server-0",
      "label": "YourUpload",
      "type": "direct",
      "url": "https://yourupload.com/watch/...",
      "quality": "1080p",
      "isWorkingNow": true
    },
    {
      "id": "server-1",
      "label": "Filemoon",
      "type": "unpacker",
      "url": "https://filemoon.sx/...",
      "quality": "720p",
      "isWorkingNow": true
    }
  ],
  "recommendations": [
    "YourUpload disponible (muy recomendado)",
    "2 servidores directos disponibles"
  ],
  "message": "Se encontraron 5 servidores disponibles"
}
```

---

## 🪝 Hooks para React

### useEpisodeSearch

Busca episodios de un anime:

```typescript
const { episodes, providers, loading } = useEpisodeSearch('Naruto')

// Con proveedores específicos
const { episodes } = useEpisodeSearch('One Piece', ['animeav1', 'tioanime'])
```

### useEpisodeLinks

Obtiene los enlaces de un episodio:

```typescript
const { servers, recommendations } = useEpisodeLinks(
  'https://animeav1.com/ver/naruto-1'
)

// Con opciones
const { servers } = useEpisodeLinks(
  'https://animeav1.com/ver/naruto-1',
  'voe,streamtape', // excluir
  true // incluir Mega
)
```

### useAnimeWithEpisodes

Combina búsqueda de episodios con datos de Jikan:

```typescript
const { episodes, providers, episodesLoading } = useAnimeWithEpisodes(
  'Naruto',
  20595 // jikanId
)
```

---

## 💡 Ejemplos de Uso en Componentes

### Ejemplo 1: Mostrar episodios de un anime

```tsx
'use client'

import { useEpisodeSearch } from '@/lib/hooks/useEpisodeSearch'

export default function EpisodeList({ animeTitle }) {
  const { episodes, loading } = useEpisodeSearch(animeTitle)

  if (loading) return <div>Buscando episodios...</div>

  return (
    <div>
      {episodes.map(ep => (
        <div key={ep.number} className="p-2 border">
          <h4>Ep. {ep.number}: {ep.title}</h4>
          <p className="text-sm text-gray-500">{ep.provider}</p>
        </div>
      ))}
    </div>
  )
}
```

### Ejemplo 2: Mostrar servidores disponibles

```tsx
'use client'

import { useEpisodeLinks } from '@/lib/hooks/useEpisodeSearch'

export default function VideoServers({ episodeUrl }) {
  const { servers, recommendations, loading } = useEpisodeLinks(episodeUrl)

  if (loading) return <div>Cargando servidores...</div>

  return (
    <div>
      <div className="recommendations mb-4">
        {recommendations.map((rec, i) => (
          <p key={i} className="text-sm text-green-600">
            ✓ {rec}
          </p>
        ))}
      </div>

      <div className="servers grid gap-2">
        {servers.map(server => (
          <a
            key={server.id}
            href={server.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 border rounded hover:bg-gray-100"
          >
            <strong>{server.label}</strong> - {server.quality}
            {server.type === 'direct' && ' (Directo)'}
          </a>
        ))}
      </div>
    </div>
  )
}
```

---

## ⚠️ Limitaciones Conocidas

### AnimeFLV
- Usa JavaScript anti-bot (fingerprinting)
- Requiere Puppeteer
- Más lento (~5-10 segundos por búsqueda)

### JKAnime
- Usa cifrado JKPlayer propietario
- No se puede descargar directamente
- Bueno para streaming bajo demanda

### HentaiLA
- Usa SvelteKit con devalue anidado
- Solo parcialmente soportado
- Mejor usar otros proveedores

### Servidores Problemáticos
Algunos servidores sirven contenido falso si detectan acceso automatizado:
- StreamWish
- VOE
- VidHide

---

## 🚨 Manejo de Errores

### Error: "No se pudo conectar con anime1v-api"

**Causa:** anime1v-api no está corriendo

**Solución:**
```bash
cd "f:\general\Descargas\anime web\apis repositorios\anime1v-api-main"
npm run dev
```

### Error: "No encontrado" en un proveedor

**Causa:** El anime no existe en ese proveedor

**Solución:** Usar otro proveedor o buscar con título alternativo

### Error: "No se encontraron enlaces"

**Causa:** Posible cambio en estructura del proveedor

**Solución:** Verificar en la web, puede requerir actualización de anime1v-api

---

## 🔄 Flujo Completo de Uso

```
Usuario busca "Naruto"
    ↓
Busca en Jikan → Obtiene info (portada, sinopsis, rating)
Busca en anime1v → Obtiene episodios y enlaces
    ↓
Sitio muestra:
  - Información general (Jikan)
  - Lista de episodios (anime1v)
    ↓
Usuario hace click en Ep. 1
    ↓
Obtiene servidores disponibles (anime1v)
    ↓
Usuario elige servidor
    ↓
Reproduce o descarga el video
```

---

## 📚 Referencias

- **anime1v-api**: https://github.com/FxxMorgan/anime1v-api
- **Jikan API**: https://jikan.moe
- **Documentación endpoints**: Ver archivo JIKAN_API_DOCS.md

---

## 🎯 Próximos Pasos

- [ ] Implementar caché de episodios en Supabase
- [ ] Agregar botón de descarga desde el sitio
- [ ] Integrar VidSrc para embeds
- [ ] Agregar historial de usuario
- [ ] Sistema de favoritos con episodios guardados
