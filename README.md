# 🍥 Anime Web - Plataforma de Streaming de Anime

Plataforma moderna de streaming de anime con soporte multi-API (Jikan, TMDB), base de datos Supabase, integración con Blogger y automatización con GitHub Actions.

## 🚀 Quick Start

### Requisitos
- Node.js 18+
- Git
- Cuenta en Supabase
- Cuenta en Vercel
- Cuenta de Google (para Blogger API)

### Instalación Local

```bash
# Clonar repositorio
git clone https://github.com/HighLordcode/anime-web.git
cd anime-web

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local

# Llenar .env.local con tus credenciales

# Ejecutar desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🗂️ Estructura del Proyecto

```
anime-web/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── anime/             # Páginas dinámicas
│   ├── buscar/            # Búsqueda
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/            # Componentes React
│   ├── sections/          # Secciones grandes
│   ├── shared/            # Componentes compartidos
│   └── ui/                # Componentes UI atómicos
├── lib/                   # Utilidades
│   ├── types/             # TypeScript types
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Funciones auxiliares
│   ├── supabase.ts        # SDK Supabase
│   ├── jikan.ts           # SDK Jikan API
│   └── blogger.ts         # SDK Blogger API
├── scripts/               # Scripts de utilidad
│   ├── utils/
│   │   ├── jikan-fetcher.js       # Cron job
│   │   └── blogger-publisher.js   # Publicador
│   └── sql/
│       └── migrations.sql          # Schema BD
├── .github/
│   └── workflows/
│       └── cron-episodes.yml       # GitHub Action
├── public/                # Archivos estáticos
├── blogger/               # Archivos Blogger XML
├── .env.example
└── package.json
```

## 🔧 Configuración

### 1. Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ejecutar migraciones SQL:
   ```sql
   -- Ejecutar contenido de scripts/sql/migrations.sql
   ```
3. Copiar credenciales a `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`

### 2. Blogger API

1. Crear proyecto en [Google Cloud Console](https://console.cloud.google.com)
2. Habilitar Blogger API
3. Crear OAuth 2.0 credentials
4. Copiar a `.env.local`:
   - `BLOGGER_API_KEY`
   - `BLOGGER_BLOG_ID`
   - `BLOGGER_REFRESH_TOKEN` (obtener vía OAuth)

### 3. Vercel

1. Conectar repo GitHub a Vercel
2. Agregar Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_KEY
   BLOGGER_API_KEY
   BLOGGER_BLOG_ID
   BLOGGER_REFRESH_TOKEN
   ```
3. Deploy

### 4. GitHub Actions

Configurar secrets en Settings > Secrets:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `BLOGGER_API_KEY`
- `BLOGGER_BLOG_ID`
- `BLOGGER_REFRESH_TOKEN`
- `DISCORD_WEBHOOK_URL` (opcional)

## 📡 APIs Integradas

### Jikan API
- Búsqueda de anime
- Información de anime
- Episodios
- Animes de temporada
- Datos de MyAnimeList

### TMDB API
- Información de películas/series (fallback)
- Imágenes de alta resolución

### Blogger API
- Publicación automática de episodios
- Gestión de posts
- Sincronización de etiquetas

## 🤖 Automatización (GitHub Actions)

**Cron Job diario a las 7 AM UTC**

1. Obtiene episodios nuevos de Jikan
2. Inserta en Supabase
3. Publica posts en Blogger
4. Envía notificación a Discord (opcional)

Archivo: `.github/workflows/cron-episodes.yml`

## 📊 Base de Datos (Supabase)

### Tablas principales

- `animes` - Catálogo de anime
- `episodios` - Lista de episodios
- `usuarios` - Usuarios del sistema
- `favoritos` - Animes favoritos del usuario
- `historial` - Episodios vistos
- `blogger_sync_log` - Log de sincronización

Ver schema completo en `scripts/sql/migrations.sql`

## 🎨 Diseño

- **Colores**: Tema oscuro (#101010) + gradiente azul (#4FC3F7 → #1976D2)
- **Tipografía**: Inter (body) + Barlow Condensed (headings)
- **Framework CSS**: Tailwind CSS
- **Responsive**: Mobile-first, soporta todas las resoluciones

## 📦 Deploy en Producción

### Vercel (Recomendado)

```bash
# Conectar repo a Vercel y agregar env vars
# Deploy automático en push a main
```

### Docker (Alternativa)

```bash
docker build -t anime-web .
docker run -p 3000:3000 anime-web
```

## 🧪 Testing

```bash
npm run test            # Ejecutar tests
npm run type-check      # TypeScript check
npm run lint           # ESLint
```

## 📝 Roadmap

- [ ] Autenticación de usuarios (Supabase Auth)
- [ ] Sistema de comentarios
- [ ] Sincronización con MyAnimeList
- [ ] Reproductor nativo con HLS
- [ ] Sistema de recomendaciones
- [ ] Dark/Light mode toggle
- [ ] PWA (Progressive Web App)
- [ ] API pública para terceros

## 🤝 Contribuir

1. Fork el repo
2. Crear rama feature (`git checkout -b feature/nueva-feature`)
3. Commit cambios (`git commit -m 'Add nueva feature'`)
4. Push a la rama (`git push origin feature/nueva-feature`)
5. Abrir Pull Request

## 📄 Licencia

MIT - Ver LICENSE para detalles

## 🆘 Soporte

- Issues: [GitHub Issues](https://github.com/HighLordcode/anime-web/issues)
- Discussions: [GitHub Discussions](https://github.com/HighLordcode/anime-web/discussions)

---

**Hecho con ❤️ por el equipo de Anime Web**
