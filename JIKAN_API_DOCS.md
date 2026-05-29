# 📚 Documentación de APIs Implementadas

## 🔄 Endpoint de Sincronización

### `GET /api/sync`

Sincroniza animes desde Jikan API a Supabase.

**Parámetros Query:**
- `source` (string): Fuente de datos. Solo `jikan` está soportado. Default: `jikan`
- `page` (number): Número de página. Default: `1`
- `limit` (number): Resultados por página. Default: `25`
- `dryRun` (boolean): Modo test (no guarda datos). Default: `false`

**Ejemplo de uso:**

```bash
# Test sin guardar (recomendado primero)
curl "http://localhost:3000/api/sync?dryRun=true&page=1"

# Sincronizar página 1
curl "http://localhost:3000/api/sync?page=1"

# Sincronizar página 5
curl "http://localhost:3000/api/sync?page=5&limit=25"
```

**Respuesta exitosa:**

```json
{
  "success": true,
  "source": "jikan",
  "page": 1,
  "limit": 25,
  "synced": 25,
  "errors": 0,
  "total": 63,
  "message": "Sincronización completada: 25 exitosos, 0 errores"
}
```

---

## 🔍 Búsqueda en Tiempo Real

### `GET /api/animes/buscar`

Busca animes directamente desde Jikan API en tiempo real.

**Parámetros Query:**
- `q` (string, **requerido**): Término de búsqueda
- `page` (number): Número de página. Default: `1`
- `limit` (number): Resultados por página. Default: `25`

**Ejemplo de uso:**

```bash
# Buscar "One Piece"
curl "http://localhost:3000/api/animes/buscar?q=One%20Piece"

# Buscar con paginación
curl "http://localhost:3000/api/animes/buscar?q=Naruto&page=2&limit=10"
```

**Respuesta exitosa:**

```json
{
  "success": true,
  "data": [
    {
      "id": "jikan-1",
      "jikan_id": 1,
      "titulo": "Cowboy Bebop",
      "titulo_alternativo": "Cowboy Bebop",
      "portada_url": "https://cdn.myanimelist.net/images/anime/...",
      "sinopsis": "En el año 2071...",
      "estado": "FINALIZADO",
      "generos": ["Action", "Adventure", "Sci-Fi"],
      "puntuacion": 8.73,
      "episodios_totales": 26,
      "tipo": "TV",
      "url_jikan": "https://myanimelist.net/anime/1/...",
      "ranking": 27,
      "popularidad": 34
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "has_next_page": true,
    "last_visible_page": 1
  }
}
```

---

## 📅 Animes de Temporada Actual

### `GET /api/animes/temporada`

Obtiene animes de la temporada actual (se calcula automáticamente).

**Parámetros Query:**
- `page` (number): Número de página. Default: `1`
- `limit` (number): Resultados por página. Default: `25`

**Ejemplo de uso:**

```bash
# Obtener temporada actual página 1
curl "http://localhost:3000/api/animes/temporada"

# Obtener página 2 con 50 resultados
curl "http://localhost:3000/api/animes/temporada?page=2&limit=50"
```

**Respuesta exitosa:**

```json
{
  "success": true,
  "data": [
    {
      "id": "jikan-5...",
      "jikan_id": 5...,
      "titulo": "Frieren: Beyond Journey's End",
      "titulo_alternativo": "Frieren at the Funeral",
      "portada_url": "https://cdn.myanimelist.net/images/anime/...",
      "sinopsis": "After a ten-year-long journey...",
      "estado": "FINALIZADO",
      "generos": ["Adventure", "Drama", "Fantasy"],
      "puntuacion": 9.0,
      "episodios_totales": 28,
      "tipo": "TV",
      "url_jikan": "https://myanimelist.net/anime/...",
      "ranking": 1,
      "popularidad": 2,
      "temporada": "spring_2026"
    }
  ],
  "season": {
    "year": 2026,
    "season": "spring"
  },
  "pagination": {
    "page": 1,
    "limit": 25,
    "has_next_page": true,
    "last_visible_page": 2
  }
}
```

---

## 🛠️ Scripts de Sincronización

### npm run sync:test

Ejecuta un test de sincronización (dry-run) sin guardar datos reales.

```bash
npm run sync:test
```

### npm run sync -- --page N

Sincroniza una página específica.

```bash
# Sincronizar página 1
npm run sync -- --page 1

# Sincronizar página 5
npm run sync -- --page 5
```

### npm run sync -- --pages N-M

Sincroniza un rango de páginas.

```bash
# Sincronizar páginas 1 a 5
npm run sync -- --pages 1-5

# Sincronizar páginas 10 a 15
npm run sync -- --pages 10-15
```

### npm run sync -- --verbose

Muestra logs detallados durante la sincronización.

```bash
npm run sync -- --page 1 --verbose
```

---

## 📊 Estructura de Datos

Todos los endpoints devuelven animes con la siguiente estructura:

```typescript
interface AnimeResponse {
  id: string                    // ID único (format: "jikan-{malId}")
  jikan_id: number             // ID de MyAnimeList
  titulo: string               // Título principal
  titulo_alternativo?: string  // Título en inglés
  portada_url: string          // URL de imagen (JPG grande)
  sinopsis: string             // Descripción del anime
  estado: 'EN_EMISION' | 'FINALIZADO'
  generos: string[]            // Lista de géneros
  puntuacion: number           // Puntuación 0-10
  episodios_totales: number    // Cantidad de episodios
  tipo: string                 // TV, Movie, OVA, etc.
  url_jikan: string            // Link a MyAnimeList
  ranking?: number             // Ranking global
  popularidad: number          // Posición de popularidad
  temporada?: string           // Temporada (e.g., "spring_2026")
}
```

---

## 🚨 Manejo de Errores

Todos los endpoints siguen el mismo formato de error:

```json
{
  "success": false,
  "error": "Descripción del error"
}
```

**Códigos HTTP comunes:**
- `200`: Éxito
- `400`: Error de validación (parámetro inválido)
- `500`: Error del servidor

---

## 💡 Recomendaciones

### Para llenar la BD inicialmente:

```bash
# 1. Hacer test primero
npm run sync:test

# 2. Sincronizar las primeras 5 páginas (125 animes)
npm run sync -- --pages 1-5 --verbose

# 3. Opcional: más páginas según lo necesites
npm run sync -- --pages 6-10
```

### Para búsqueda en vivo:

Los usuarios pueden usar directamente `/api/animes/buscar?q=...` desde el frontend. No consume la BD, siempre obtiene datos frescos de Jikan.

### Para datos actualizados de temporada:

El endpoint `/api/animes/temporada` se calcula dinámicamente cada vez, así siempre tendrás los datos actuales.

---

## 🔗 Relación con Anime1v API

**Anime1v API** se usará posteriormente para:
- Obtener episodios específicos
- Buscar links de descarga/streaming
- Acceder a múltiples proveedores

Por ahora, Jikan API es suficiente para catálogos e información.
