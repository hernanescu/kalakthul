# 🏰 Kalak'thul - TTRPG Map Viewer

Un visor de mapas interactivo moderno para Dungeons & Dragons y juegos de mesa de rol, construido con React, TypeScript y HTML5 Canvas.

## ✨ Características

### 🎮 Funcionalidades Principales
- **Librería de mapas organizada**: Carpetas personalizables con miniaturas automáticas
- **Sistema de grilla inteligente**: Grilla que se ajusta automáticamente al mapa
- **Efectos dinámicos avanzados**: 8 tipos de efectos visuales con formas personalizables
- **Zoom y pan fluidos**: Navegación intuitiva con mouse y controles dedicados
- **Modo presentación**: Pantalla completa para sesiones de juego inmersivas
- **Interfaz moderna**: Header horizontal + sidebar colapsable
- **Persistencia automática**: Estado guardado en localStorage
- **Welcome screen**: Pantalla de inicio atractiva cuando no hay mapa cargado

### 🎨 Efectos Disponibles
- 🔥 **Fuego**: Llamas danzantes con chispas y partículas
- ❄️ **Hielo**: Cristales hexagonales con aura fría
- ☠️ **Veneno**: Burbujas tóxicas con niebla verde
- ⚡ **Rayo**: Descargas eléctricas con chispas
- ✨ **Magia**: Partículas brillantes y etéreas
- 💨 **Viento**: Remolinos con partículas flotantes
- 🌊 **Agua**: Burbujas y ondas acuáticas
- 🌑 **Oscuridad**: Sombras pulsantes y expansivas

**Características de efectos:**
- Formas: Cuadrado o circular
- Opacidad ajustable
- Creación por drag & drop
- Edición en tiempo real

## 🚀 Inicio Rápido

### Instalación
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### Uso Básico
1. **Cargar mapa**: Usa "📤 Cargar" en el header para subir imágenes
2. **Organizar mapas**: Crea carpetas con "➕ Carpeta" para organizar tus mapas
3. **Configurar grilla**: En "Grilla" ajusta filas, columnas, opacidad y color
4. **Añadir efectos**: En "Efectos" selecciona un tipo y arrastra en el mapa
5. **Navegar**: Rueda del mouse para zoom, Shift+click para pan
6. **Presentación**: Click en "🖥️ Pantalla completa" para modo inmersivo

## 🛠️ Tecnologías

- **React 18** con TypeScript para UI robusta
- **Framer Motion** para animaciones fluidas
- **HTML5 Canvas** para renderizado de alto rendimiento
- **Vite** para desarrollo rápido y builds optimizados
- **Tailwind CSS** para estilos responsive
- **Lottie Web** para animaciones vectoriales
- **Heroicons + Lucide React** para iconografía

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── App.tsx                 # Componente principal y estado global
│   ├── MapCanvas.tsx           # Canvas de renderizado del mapa
│   ├── MapLibrary.tsx          # Header con librería de mapas
│   ├── EffectRenderer.tsx      # Sistema de renderizado de efectos
│   ├── ReactEffects.tsx        # Efectos animados con Framer Motion
│   ├── GridControls.tsx        # Controles de configuración de grilla
│   ├── EffectControls.tsx      # Controles de efectos
│   ├── ZoomControls.tsx        # Controles de zoom
│   └── CollapsibleSection.tsx   # Componente UI colapsable
├── hooks/              # Lógica reutilizable
│   ├── useGrid.ts             # Estado y lógica de grilla
│   ├── useEffects.ts          # Estado y lógica de efectos
│   └── useMapLibrary.ts       # Gestión de librería de mapas
├── utils/              # Utilidades especializadas
│   ├── canvasUtils.ts         # Operaciones básicas de canvas
│   ├── canvasRender.ts        # Funciones de dibujo optimizadas
│   ├── gridUtils.ts           # Cálculos de grilla
│   └── imageUtils.ts          # Compresión y thumbnails
└── types/              # Definiciones TypeScript
    └── index.ts               # Interfaces y tipos

public/
├── images/             # Recursos estáticos
│   └── welcome.jpg    # Imagen de bienvenida
└── effects/            # Recursos de efectos locales
    ├── svg/           # Efectos vectoriales
    └── gifs/          # Efectos animados

docs/                   # Documentación detallada
└── SESION_DESARROLLO_KALAKTHUL.md
```

## 🎨 Personalización y Extensión

### Añadir Nuevos Efectos
Los efectos están definidos en `ReactEffects.tsx`. Para añadir uno nuevo:

```typescript
// 1. Añadir tipo en types/index.ts
export type EffectType = 'fire' | 'ice' | 'poison' | 'lightning' | 'magic' | 'wind' | 'water' | 'darkness' | 'nuevo-efecto';

// 2. Implementar componente en ReactEffects.tsx
const NuevoEfecto: React.FC<EfectoProps> = ({ size, opacity, shape }) => {
  // Tu animación con Framer Motion
};

// 3. Añadir al switch en ReactEffects.tsx
case 'nuevo-efecto':
  return <NuevoEfecto size={size} opacity={effect.opacity} shape={effect.shape} />;
```

### Efectos Locales
Añade recursos personalizados en `/public/effects/`:
- **SVG**: Para efectos vectoriales estáticos
- **GIF/Lottie**: Para animaciones complejas

### Fuentes de Recursos Gratuitos
- **LottieFiles**: https://lottiefiles.com/ (Animaciones JSON)
- **Flaticon**: https://www.flaticon.com/ (SVGs)
- **IconScout**: https://iconscout.com/ (Iconos animados)
- **GIPHY**: https://giphy.com/ (GIFs)

## 🔧 Desarrollo

### Scripts Disponibles
```bash
npm run dev      # Servidor de desarrollo con hot reload
npm run build    # Build optimizado para producción
npm run preview  # Vista previa del build de producción
```

### Arquitectura Técnica
- **Canvas-based rendering**: HTML5 Canvas para máximo rendimiento
- **Component architecture**: React components modulares y reutilizables
- **Custom hooks**: Lógica de estado encapsulada y reutilizable
- **Type-safe**: TypeScript completo con interfaces estrictas
- **Atomic design**: Componentes pequeños y especializados

## 📊 Estado Actual del Proyecto

### ✅ Funcionalidades Completadas
- **Librería de mapas** con carpetas y thumbnails
- **Sistema de grilla** automático e inteligente
- **8 efectos dinámicos** con formas personalizables
- **Zoom/pan fluido** con controles dedicados
- **Modo presentación** con pantalla completa
- **Interfaz moderna** con header + sidebar colapsable
- **Sistema de ayuda** integrado
- **Welcome screen** atractiva
- **Persistencia automática** de estado

### ⚠️ Limitaciones Conocidas

#### Sistema de Coordenadas de Efectos
**Problema:** Los efectos no se crean exactamente donde se hace click, especialmente al cambiar entre modos normal y presentación.

**Workaround funcional:**
1. Crear efecto en **Modo Normal** (aproximadamente)
2. Cambiar a **Modo Presentación**
3. Los efectos aparecen en posiciones incorrectas pero **estáticos**
4. **Hacer click y arrastrar** cada efecto a su posición correcta
5. **Zoom y pan funcionan perfectamente** en presentación
6. Repetir para múltiples efectos

**Estado:** Semi-productivo con flujo workaround documentado.

### 🎯 Próximos Pasos Prioritarios

#### 1. Corregir Sistema de Coordenadas
- Implementar coordenadas relativas al mapa original
- Sistema consistente entre modos normal/presentación
- Eliminación del workaround manual

#### 2. Optimizaciones de Performance
- Debouncing de eventos de zoom/pan
- Lazy loading avanzado de imágenes
- Virtualización para mapas muy grandes

#### 3. Mejoras de UX
- Undo/redo para efectos
- Shortcuts de teclado personalizables
- Tooltips contextuales
- Indicadores visuales de estado

#### 4. Features Adicionales
- Exportar mapa con efectos aplicados
- Temas de color personalizables
- Efectos personalizados del usuario
- Modo colaborativo básico

## 📈 Métricas de Desarrollo

- **Tiempo total**: ~12-14 horas de desarrollo activo
- **Archivos modificados**: 20+ archivos principales
- **Líneas de código**: ~2000+ líneas añadidas
- **Iteraciones de debugging**: 15+ ciclos
- **Problemas técnicos resueltos**: 8+ complejos

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Añade nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---

## 📚 Documentación Adicional

Para información detallada sobre el proceso de desarrollo, problemas encontrados y soluciones implementadas, consulta:

📖 **[Sesión de Desarrollo Completa](docs/SESION_DESARROLLO_KALAKTHUL.md)**

## 📄 FinOps así nomás

Datos extraídos del consumo de Cursor, analizados por Gemini.

(Período: Posterior a 18-11-2025 17:10 GMT-3)

| Columna | Suma |
|:---|:---|
| Costos (USD) | $3.88 |
| Tokens Totales | 34,064,710 |
| Tokens de Entrada (con Cache Write) | 268 |
| Tokens de Entrada (sin Cache Write) | 1,496,558 |
| Tokens de Lectura de Caché | 32,485,679 |
| Tokens de Salida | 82,205 |
| Eventos Contabilizados | 104 |


---

**Dedicado a Anthalion, Baldewyne, Shakka, Solare y Skady** 🏰⚔️

*Construido con ❤️ para la comunidad de juegos de mesa*
