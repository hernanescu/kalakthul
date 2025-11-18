# 🗺️ Kalak'thuling - TTRPG Map Viewer

Un visor de mapas interactivo para Dungeons & Dragons y juegos de mesa de rol.

## ✨ Características

### 🎮 Funcionalidades Principales
- **Carga de mapas**: Soporte para imágenes JPG, PNG y WebP
- **Sistema de grilla**: Grilla personalizable con filas/columnas, opacidad y color
- **Tokens interactivos**: Añade, mueve y elimina tokens con colores personalizables
- **Efectos dinámicos**: 8 tipos de efectos visuales (fuego, hielo, veneno, rayo, magia, viento, agua, oscuridad)
- **Zoom y pan**: Navegación fluida con mouse y controles dedicados
- **Modo presentación**: Vista limpia para sesiones de juego
- **Persistencia**: Guarda automáticamente el estado de tu mapa

### 🎨 Efectos Disponibles
- 🔥 **Fuego**: Llamas danzantes con chispas
- ❄️ **Hielo**: Cristales hexagonales giratorios
- ☠️ **Veneno**: Burbujas tóxicas con niebla
- ⚡ **Rayo**: Línea eléctrica con chispas
- ✨ **Magia**: Partículas brillantes
- 💨 **Viento**: Remolinos giratorios
- 🌊 **Agua**: Burbujas flotantes
- 🌑 **Oscuridad**: Sombras expansivas

## 🚀 Inicio Rápido

### Instalación
```bash
npm install
npm run dev
```

### Uso Básico
1. **Cargar mapa**: Click en "Cargar Mapa" y selecciona tu imagen
2. **Configurar grilla**: Ajusta filas, columnas, opacidad y color
3. **Añadir tokens**: Click en "Añadir Token" y arrastra para posicionar
4. **Añadir efectos**: Selecciona un tipo de efecto y arrastra en el mapa
5. **Zoom/Pan**: Usa la rueda del mouse para zoom, Shift+click para pan

## 🛠️ Tecnologías

- **React 18** con TypeScript
- **Framer Motion** para animaciones
- **HTML5 Canvas** para renderizado
- **Vite** para desarrollo
- **Tailwind CSS** para estilos

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── MapCanvas.tsx   # Canvas principal del mapa
│   ├── EffectRenderer.tsx # Renderizado de efectos
│   ├── ReactEffects.tsx # Efectos con Framer Motion
│   └── ...
├── hooks/              # Hooks personalizados
├── utils/              # Utilidades
└── types/              # Definiciones TypeScript

public/
└── effects/            # Recursos locales de efectos
```

## 🎨 Personalización de Efectos

### Efectos Locales
Puedes añadir tus propios efectos guardando archivos en `/public/effects/`:

```typescript
// En src/components/EffectRenderer.tsx
const EFFECT_URLS = {
  fire: '/effects/svg/fire.svg',
  custom: '/effects/gifs/custom.gif',
};
```

### Fuentes de Recursos
- **Flaticon**: https://www.flaticon.com/ (SVGs gratuitos)
- **IconScout**: https://iconscout.com/ (Iconos animados)
- **GIPHY**: https://giphy.com/ (GIFs animados)

## 🔧 Desarrollo

### Scripts Disponibles
```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Vista previa del build
```

### Arquitectura
- **Canvas-based**: Renderizado eficiente con HTML5 Canvas
- **Component-based**: Arquitectura modular con React
- **Hook-based**: Lógica reutilizable con custom hooks
- **Type-safe**: TypeScript completo

## 📝 Notas de Desarrollo

### Efectos
- Los efectos React (Framer Motion) son los más fluidos
- Soporte fallback a Canvas para compatibilidad
- Efectos locales no requieren internet

### Performance
- Renderizado optimizado con `requestAnimationFrame`
- Lazy loading de imágenes
- Componentes memoizados

## 🎲 Próximas Funcionalidades

- [ ] Herramientas de dibujo
- [ ] Capas múltiples
- [ ] Compartir mapas
- [ ] Plantillas de efectos
- [ ] Modo colaborativo

---

**¡Disfruta tu campaña de D&D con Kalak'thuling!** 🐉⚔️
