-- ============================================================
-- ANIME WEB DATABASE SCHEMA (Supabase PostgreSQL)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: animes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.animes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jikan_id INTEGER UNIQUE NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  titulo_alternativo VARCHAR(255),
  portada_url TEXT,
  sinopsis TEXT,
  estado VARCHAR(50) CHECK (estado IN ('EN_EMISION', 'FINALIZADO')) DEFAULT 'EN_EMISION',
  generos TEXT[] DEFAULT '{}',
  puntuacion DECIMAL(3,1),
  episodios_totales INTEGER,
  blogger_page_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_animes_jikan_id ON public.animes(jikan_id);
CREATE INDEX IF NOT EXISTS idx_animes_titulo ON public.animes(titulo);
CREATE INDEX IF NOT EXISTS idx_animes_estado ON public.animes(estado);

-- ============================================================
-- TABLE: episodios
-- ============================================================
CREATE TABLE IF NOT EXISTS public.episodios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anime_id UUID NOT NULL REFERENCES public.animes(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  titulo VARCHAR(255),
  fecha_estreno TIMESTAMP WITH TIME ZONE,
  sinopsis TEXT,
  imagen_url TEXT,
  duracion_minutos INTEGER,
  enlaces JSONB DEFAULT '{}'::jsonb,
  blogger_post_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(anime_id, numero)
);

CREATE INDEX IF NOT EXISTS idx_episodios_anime_id ON public.episodios(anime_id);
CREATE INDEX IF NOT EXISTS idx_episodios_fecha ON public.episodios(fecha_estreno DESC);
CREATE INDEX IF NOT EXISTS idx_episodios_blogger_post_id ON public.episodios(blogger_post_id);

-- ============================================================
-- TABLE: usuarios (con Auth integrada)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(100) UNIQUE,
  avatar_url TEXT,
  mal_username VARCHAR(100),
  simkl_token VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_usuarios_username ON public.usuarios(username);

-- ============================================================
-- TABLE: favoritos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.favoritos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  anime_id UUID NOT NULL REFERENCES public.animes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(usuario_id, anime_id)
);

CREATE INDEX IF NOT EXISTS idx_favoritos_usuario ON public.favoritos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_anime ON public.favoritos(anime_id);

-- ============================================================
-- TABLE: historial (episodios vistos)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.historial (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  episodio_id UUID NOT NULL REFERENCES public.episodios(id) ON DELETE CASCADE,
  progreso_segundos INTEGER DEFAULT 0,
  completado BOOLEAN DEFAULT FALSE,
  fecha_visto TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(usuario_id, episodio_id)
);

CREATE INDEX IF NOT EXISTS idx_historial_usuario ON public.historial(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historial_episodio ON public.historial(episodio_id);
CREATE INDEX IF NOT EXISTS idx_historial_fecha ON public.historial(fecha_visto DESC);

-- ============================================================
-- TABLE: blogger_sync_log
-- ============================================================
CREATE TABLE IF NOT EXISTS public.blogger_sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  episodio_id UUID REFERENCES public.episodios(id) ON DELETE SET NULL,
  blogger_post_id VARCHAR(255),
  estado VARCHAR(50) CHECK (estado IN ('SUCCESS', 'ERROR')) DEFAULT 'SUCCESS',
  mensaje TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_blogger_sync_episodio ON public.blogger_sync_log(episodio_id);
CREATE INDEX IF NOT EXISTS idx_blogger_sync_estado ON public.blogger_sync_log(estado);

-- ============================================================
-- VIEWS
-- ============================================================

-- Vista: Últimos episodios
CREATE OR REPLACE VIEW public.ultimos_episodios AS
SELECT 
  ep.id,
  ep.numero,
  ep.titulo,
  ep.fecha_estreno,
  ep.imagen_url,
  an.titulo AS anime_titulo,
  an.id AS anime_id,
  an.portada_url
FROM public.episodios ep
JOIN public.animes an ON ep.anime_id = an.id
ORDER BY ep.fecha_estreno DESC
LIMIT 20;

-- Vista: Animes en emisión
CREATE OR REPLACE VIEW public.animes_en_emision AS
SELECT *
FROM public.animes
WHERE estado = 'EN_EMISION'
ORDER BY puntuacion DESC
LIMIT 50;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes (si existen)
DROP POLICY IF EXISTS "usuarios_can_read_own_profile" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_can_update_own_profile" ON public.usuarios;
DROP POLICY IF EXISTS "favoritos_can_read_own" ON public.favoritos;
DROP POLICY IF EXISTS "favoritos_can_insert_own" ON public.favoritos;
DROP POLICY IF EXISTS "favoritos_can_delete_own" ON public.favoritos;
DROP POLICY IF EXISTS "historial_can_read_own" ON public.historial;
DROP POLICY IF EXISTS "historial_can_insert_own" ON public.historial;
DROP POLICY IF EXISTS "historial_can_update_own" ON public.historial;

-- Policy: Usuarios solo ven su perfil
CREATE POLICY "usuarios_can_read_own_profile"
ON public.usuarios
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "usuarios_can_update_own_profile"
ON public.usuarios
FOR UPDATE
USING (auth.uid() = id);

-- Policy: Favoritos solo del usuario autenticado
CREATE POLICY "favoritos_can_read_own"
ON public.favoritos
FOR SELECT
USING (auth.uid() = usuario_id);

CREATE POLICY "favoritos_can_insert_own"
ON public.favoritos
FOR INSERT
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "favoritos_can_delete_own"
ON public.favoritos
FOR DELETE
USING (auth.uid() = usuario_id);

-- Policy: Historial solo del usuario autenticado
CREATE POLICY "historial_can_read_own"
ON public.historial
FOR SELECT
USING (auth.uid() = usuario_id);

CREATE POLICY "historial_can_insert_own"
ON public.historial
FOR INSERT
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "historial_can_update_own"
ON public.historial
FOR UPDATE
USING (auth.uid() = usuario_id);

-- Tablas públicas sin RLS (animes y episodios)
ALTER TABLE public.animes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogger_sync_log DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- SEED DATA (Opcional - Para desarrollo)
-- ============================================================

-- Descomenta para cargar datos de prueba

/*
INSERT INTO public.animes (jikan_id, titulo, portada_url, sinopsis, estado, generos, puntuacion, episodios_totales)
VALUES 
  (1, 'Cowboy Bebop', 'https://cdn.myanimelist.net/images/anime/4/19644.jpg', 'Una nave espacial con tripulación de cazarrecompensas...', 'FINALIZADO', '{"Sci-Fi","Space","Noir"}', 8.7, 26),
  (5, 'Fullmetal Alchemist', 'https://cdn.myanimelist.net/images/anime/13/8234.jpg', 'Dos hermanos buscan la Piedra Filosofal...', 'FINALIZADO', '{"Action","Adventure","Supernatural"}', 9.1, 64);
*/

-- ============================================================
-- PERMISOS
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.animes TO anon, authenticated;
GRANT SELECT ON public.episodios TO anon, authenticated;
GRANT SELECT ON public.ultimos_episodios TO anon, authenticated;
GRANT SELECT ON public.animes_en_emision TO anon, authenticated;

GRANT ALL ON public.usuarios TO authenticated;
GRANT ALL ON public.favoritos TO authenticated;
GRANT ALL ON public.historial TO authenticated;
