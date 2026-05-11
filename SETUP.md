# 📋 Guía de Setup - Anime Web

Este documento detalla los pasos necesarios para configurar el proyecto completamente.

## 1️⃣ Configuración Inicial

### Clonar y instalar

```bash
git clone https://github.com/HighLordcode/anime-web.git
cd anime-web
npm install
```

## 2️⃣ Configurar Supabase

### Crear proyecto

1. Ir a [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Guardar credenciales

### Ejecutar migraciones

1. En dashboard de Supabase, ir a **SQL Editor**
2. Crear nueva query
3. Copiar contenido de `scripts/sql/migrations.sql`
4. Ejecutar

### Copiar credenciales a `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_KEY=xxxxx
```

Encontrar en: Supabase Dashboard > Settings > API

## 3️⃣ Configurar Google/Blogger API

### Crear proyecto en Google Cloud

1. Ir a [console.cloud.google.com](https://console.cloud.google.com)
2. Crear nuevo proyecto
3. Habilitar **Blogger API**
4. Crear **OAuth 2.0** credentials (tipo: Web application)
5. Agregar redirect URI: `http://localhost:3000/api/auth/callback`

### Obtener credenciales

```env
BLOGGER_API_KEY=xxxxx
BLOGGER_BLOG_ID=xxxxx
GOOGLE_CLIENT_ID=xxxxx
GOOGLE_CLIENT_SECRET=xxxxx
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

### Obtener BLOGGER_REFRESH_TOKEN

1. Ejecutar en terminal (una sola vez):
```bash
node scripts/utils/get-refresh-token.js
```

2. Seguir instrucciones de OAuth
3. Copiar token a `.env.local`

## 4️⃣ Configurar TMDB (Opcional)

1. Ir a [themoviedb.org](https://www.themoviedb.org)
2. Crear cuenta y API key
3. Agregar a `.env.local`:

```env
NEXT_PUBLIC_TMDB_API_KEY=xxxxx
TMDB_API_ACCESS_TOKEN=xxxxx
```

## 5️⃣ Desarrollo Local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 6️⃣ Deploy en Vercel

### Conexión repositorio

1. Ir a [vercel.com](https://vercel.com)
2. Conectar repo GitHub
3. Seleccionar rama `main`

### Agregar Environment Variables

En Vercel Dashboard > Settings > Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
BLOGGER_API_KEY
BLOGGER_BLOG_ID
BLOGGER_REFRESH_TOKEN
NEXT_PUBLIC_TMDB_API_KEY
TMDB_API_ACCESS_TOKEN
```

### Deploy

```bash
git push origin main
```

Vercel desplegará automáticamente.

## 7️⃣ Configurar GitHub Actions (Cron Jobs)

### Agregar Secrets

En GitHub > Settings > Secrets and variables > Actions

```
SUPABASE_URL
SUPABASE_SERVICE_KEY
BLOGGER_API_KEY
BLOGGER_BLOG_ID
BLOGGER_REFRESH_TOKEN
DISCORD_WEBHOOK_URL (opcional)
```

### Verificar workflow

- Archivo: `.github/workflows/cron-episodes.yml`
- Se ejecuta todos los días a las 7 AM UTC
- Ver logs en: GitHub > Actions

## 8️⃣ Estructura de carpetas (.env)

```
anime-web/
├── .env.local           ← Configuración local (NO subir a git)
├── .env.example         ← Template de variables (comentado)
├── .gitignore           ← Archivos ignorados
└── ...
```

## 9️⃣ Scripts útiles

```bash
# Desarrollo
npm run dev              # Next.js dev server

# Build y producción
npm run build            # Compilar
npm start                # Ejecutar producción

# Calidad
npm run lint             # ESLint
npm run type-check       # TypeScript
npm run format           # Prettier

# Base de datos
npm run db:types         # Generar tipos Supabase
npm run db:migrate       # Ejecutar migraciones
```

## 🔟 Pruebas

### Fetch manual de episodios

```bash
node scripts/utils/jikan-fetcher.js
```

### Publicar a Blogger

```bash
node scripts/utils/blogger-publisher.js
```

## ❌ Solución de problemas

### Error: "Missing Supabase credentials"
- Verificar `.env.local` tiene `NEXT_PUBLIC_SUPABASE_URL`
- Verificar credenciales en Supabase Dashboard

### Error: "CORS" en APIs
- Las APIs internas usan proxy en `/api`
- Para APIs externas, configurar CORS headers en `next.config.js`

### Error: "Blogger API rate limit"
- Esperar 24 horas o usar cuenta diferente
- Implementar queue/retry en `blogger-publisher.js`

### Episodios no aparecen
1. Verificar que existan en Supabase (SQL: `SELECT * FROM episodios;`)
2. Verificar que la tabla `animes` tenga datos
3. Ejecutar manualmente: `node scripts/utils/jikan-fetcher.js`

### Problema con OAuth
- Verificar redirect URI coincide en Google Console y código
- Borrar cookies y caché del navegador
- Usar ventana incógnita

## 📞 Soporte

- Documentación: [README.md](README.md)
- Issues: [GitHub Issues](https://github.com/HighLordcode/anime-web/issues)
- Discussions: [GitHub Discussions](https://github.com/HighLordcode/anime-web/discussions)

---

¿Necesitas ayuda? Abre un issue o discussion en GitHub 🚀
