-- 1. Usuarios (Dueños de la data)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    subscription_tier VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Activos (Referencias a MinIO/S3 - Reemplaza Base64)
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'map' | 'token'
    storage_url TEXT NOT NULL, -- URL pública del archivo
    thumbnail_url TEXT,
    name VARCHAR(255),
    folder_id VARCHAR(255), -- Para compatibilidad con estructura de carpetas
    dimensions JSONB, -- { width: number, height: number }
    original_size INTEGER, -- tamaño original en bytes
    compressed_size INTEGER, -- tamaño comprimido en bytes
    created_at TIMESTAMP DEFAULT NOW(),
    last_used TIMESTAMP DEFAULT NOW()
);

-- Índices para assets
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_folder_id ON assets(folder_id);

-- 3. Escenas (Configuración estática del tablero)
CREATE TABLE IF NOT EXISTS scenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    background_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    grid_config JSONB, -- Configuración de filas/cols/color
    fog_data JSONB, -- Polígonos de niebla (vectores)
    image_bounds JSONB, -- Posición/Zoom inicial
    zoom_state JSONB, -- { level: number, panX: number, panY: number }
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para scenes
CREATE INDEX IF NOT EXISTS idx_scenes_user_id ON scenes(user_id);

-- 4. Tokens Activos (Entidades dinámicas para WebSockets)
CREATE TABLE IF NOT EXISTS active_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL, -- Qué imagen usa
    x NUMERIC NOT NULL,
    y NUMERIC NOT NULL,
    grid_x INTEGER,
    grid_y INTEGER,
    width NUMERIC,
    height NUMERIC,
    name VARCHAR(255),
    opacity NUMERIC DEFAULT 1.0,
    properties JSONB, -- HP, notas, visibilidad
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para active_tokens
CREATE INDEX IF NOT EXISTS idx_active_tokens_scene_id ON active_tokens(scene_id);
CREATE INDEX IF NOT EXISTS idx_active_tokens_asset_id ON active_tokens(asset_id);

-- 5. Efectos (Visual effects en el mapa)
CREATE TABLE IF NOT EXISTS effects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'fire' | 'ice' | 'poison' | etc.
    x NUMERIC NOT NULL,
    y NUMERIC NOT NULL,
    grid_x INTEGER,
    grid_y INTEGER,
    width NUMERIC NOT NULL,
    height NUMERIC NOT NULL,
    shape VARCHAR(20) NOT NULL, -- 'square' | 'circle'
    opacity NUMERIC DEFAULT 1.0,
    animation_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para effects
CREATE INDEX IF NOT EXISTS idx_effects_scene_id ON effects(scene_id);

