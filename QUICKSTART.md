# 🚀 Guía Rápida de Inicio - Anime Web con anime1v-api

## ⚡ Inicio en 5 minutos

### 1️⃣ Instalar dependencias

```bash
cd "f:\general\Descargas\anime web\implementa aqui"
npm install
```

### 2️⃣ Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env.local

# Editar .env.local con tus credenciales:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_KEY
# - ANIME1V_API_URL (ver paso 3)
```

### 3️⃣ Iniciar anime1v-api en otra terminal

```bash
cd "f:\general\Descargas\anime web\apis repositorios\anime1v-api-main"
npm install
npm run dev
```

**Debería ver:**
```
Server running on http://localhost:3001
```

### 4️⃣ Iniciar el sitio web

```bash
cd "f:\general\Descargas\anime web\implementa aqui"
npm run dev
```

**Debería ver:**
```
▲ Next.js 14.2.0
  - Local:        http://localhost:3000
```

### 5️⃣ Llenar base de datos con animes

En una **tercera terminal**:

```bash
cd "f:\general\Descargas\anime web\implementa aqui"

# Test primero (sin guardar)
npm run sync:test

# Sincronizar primeros 125 animes (5 páginas)
npm run sync -- --pages 1-5 --verbose
```

---

## 🧪 Verificar que todo funciona

### Test 1: Verificar anime1v-api

```bash
curl "http://localhost:3001/api/v1/anime/search?q=Naruto"
```

### Test 2: Verificar búsqueda de episodios

```bash
curl "http://localhost:3000/api/episodios/buscar?q=One%20Piece"
```

### Test 3: Abrir el sitio

```
http://localhost:3000
```

---

## 📂 Estructura de Carpetas Importante

```
f:\general\Descargas\anime web\
├── implementa aqui/                 ← El sitio web (Next.js)
│   ├── app/
│   │   ├── api/
│   │   │   ├── sync/               ← Sincronizar desde Jikan
│   │   │   ├── animes/
│   │   │   │   ├── buscar/         ← Buscar en Jikan
│   │   │   │   ├── temporada/      ← Temporada actual
│   │   │   └── episodios/
│   │   │       ├── buscar/         ← Buscar en anime1v
│   │   │       └── enlaces/        ← Obtener servidores
│   │   └── page.tsx               ← Portada
│   ├── lib/
│   │   ├── anime1v.ts             ← Cliente de anime1v
│   │   ├── jikan.ts               ← Cliente de Jikan
│   │   ├── hooks/                 ← React hooks
│   │   └── types/                 ← TypeScript types
│   ├── .env.example               ← Variables de ambiente
│   ├── package.json
│   ├── JIKAN_API_DOCS.md          ← Docs de Jikan
│   └── ANIME1V_INTEGRATION.md     ← Docs de anime1v
│
└── apis repositorios/
    └── anime1v-api-main/          ← Backend de anime1v
        ├── src/
        │   ├── services/          ← Servicios por proveedor
        │   ├── routes/            ← Endpoints
        │   └── server.js
        ├── package.json
        └── .env.example
```

---

## 🛠️ Comandos Útiles

### Desarrollo

```bash
# Iniciar en modo desarrollo
npm run dev

# Linter
npm run lint

# Verificar tipos TypeScript
npm run type-check

# Formato de código
npm run format
```

### Sincronización de Datos

```bash
# Test sin guardar
npm run sync:test

# Sincronizar página 1
npm run sync -- --page 1

# Sincronizar páginas 1 a 5 con logs
npm run sync -- --pages 1-5 --verbose

# Sincronizar 10 páginas
npm run sync -- --pages 1-10
```

### Base de Datos

```bash
# Migrar base de datos
npm run db:migrate

# Generar tipos TypeScript de Supabase
npm run db:types
```

---

## 📚 Documentación Completa

- **Jikan API**: Ver [JIKAN_API_DOCS.md](./JIKAN_API_DOCS.md)
- **Anime1v Integration**: Ver [ANIME1V_INTEGRATION.md](./ANIME1V_INTEGRATION.md)
- **Jikan Oficial**: https://docs.api.jikan.moe/
- **anime1v-api**: https://github.com/FxxMorgan/anime1v-api

---

## 🎯 Próximo Flujo Completo

1. ✅ Usuario entra a la portada
2. ✅ Ve animes de la temporada actual (desde Jikan)
3. ✅ Busca un anime (desde Jikan)
4. ✅ Entra en un anime y ve episodios (desde anime1v)
5. ✅ Hace click en un episodio y ve servidores disponibles
6. ⏭️ Hace click en un servidor y reproduce o descarga

---

## ⚠️ Problemas Comunes

### "Error: Cannot find module 'puppeteer'"

```bash
cd "f:\general\Descargas\anime web\apis repositorios\anime1v-api-main"
npm install puppeteer
```

### "Error: ANIME1V_API_URL is not configured"

Asegúrate de que:
1. anime1v-api está corriendo en puerto 3001
2. `.env.local` tiene `ANIME1V_API_URL=http://localhost:3001/api/v1/anime`

### "No se encontraron episodios"

1. Verifica que el nombre sea correcto
2. Intenta con otro proveedor: `?providers=tioanime`
3. Revisa la consola de anime1v por errores

### "La portada está vacía"

1. Ejecuta: `npm run sync -- --pages 1-5`
2. Espera a que termine
3. Recarga la página

---

## 📞 Soporte

Si tienes problemas:

1. Verifica la consola del navegador (F12)
2. Verifica los logs de Next.js en terminal
3. Verifica que anime1v-api esté corriendo
4. Lee [ANIME1V_INTEGRATION.md](./ANIME1V_INTEGRATION.md) sección "Errores"

---

## ✨ Características Implementadas

- ✅ Búsqueda de animes desde Jikan
- ✅ Animes de temporada actual
- ✅ Sincronización de datos desde Jikan
- ✅ Búsqueda de episodios desde anime1v
- ✅ Obtención de servidores de video
- ✅ Soporte para 6 proveedores
- ✅ Soporte para múltiples servidores de video

---

## 🚀 Próximas Mejoras

- [ ] Caché de episodios en Supabase
- [ ] Botón de descarga directa
- [ ] VidSrc para embeds
- [ ] Historial de usuario
- [ ] Sistema de favoritos
- [ ] Reproductor de video integrado

¡Disfruta! 🎬
