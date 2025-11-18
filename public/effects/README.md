# 📁 Efectos Locales - Kalak'thuling

Esta carpeta contiene todos los efectos que se cargan localmente, sin depender de internet.

## 📂 Estructura
```
/effects/
├── gifs/           # GIFs animados
├── sprites/        # Spritesheets
├── svg/           # SVG animados
└── particles/     # Configuraciones de partículas
```

## 🎯 Cómo Usar

### Para GIFs:
1. Coloca tu archivo `.gif` en `/public/effects/gifs/`
2. En `EffectRenderer.tsx`, agrega la ruta:
```typescript
fire: '/effects/gifs/fire-spell.gif',
```

### Para Spritesheets:
1. Coloca tu spritesheet en `/public/effects/sprites/`
2. Implementa la lógica de animación por frames

## 🔧 Configuración en el Código

Edita `src/components/EffectRenderer.tsx`:

```typescript
const EFFECT_URLS: Record<string, string> = {
  fire: '/effects/gifs/fire.gif',
  ice: '/effects/gifs/ice.gif',
  poison: '/effects/gifs/poison.gif',
  // ...
};
```

## 📋 Lista de Efectos Recomendados

### 🔥 Fuego
- `fire.gif` - Llamas danzantes
- `fire-explosion.gif` - Explosión de fuego
- `fire-wall.gif` - Muro de llamas

### ❄️ Hielo
- `ice.gif` - Cristales flotantes
- `ice-storm.gif` - Tormenta de hielo
- `frost-nova.gif` - Nova de escarcha

### ☠️ Veneno
- `poison.gif` - Burbujas tóxicas
- `acid.gif` - Charco ácido
- `plague.gif` - Nube de peste

### ⚡ Eléctrico
- `lightning.gif` - Rayos zigzagueantes
- `chain-lightning.gif` - Cadena de rayos
- `electric-field.gif` - Campo eléctrico

### ✨ Mágico
- `magic-sparkles.gif` - Chispas mágicas
- `teleport.gif` - Efecto de teletransporte
- `shield.gif` - Escudo mágico

### 💨 Elemental
- `wind.gif` - Remolino de viento
- `water.gif` - Ondas de agua
- `earth.gif` - Terremoto
- `shadow.gif` - Sombras oscuras
