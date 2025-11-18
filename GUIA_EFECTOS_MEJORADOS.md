# 🎨 Guía para Efectos Mejorados - Kalak'thuling

## 🚀 Opciones para Conseguir Efectos Animados

### 1. 🎭 **Lottie Files** (Recomendado)
**Sitio:** https://lottiefiles.com/
**Ventajas:**
- Miles de animaciones gratuitas y premium
- Animaciones vectoriales de alta calidad
- Compatible nativamente con el proyecto
- Fácil de integrar

**Cómo usar:**
1. Ve a https://lottiefiles.com/
2. Busca efectos como "fire", "ice", "magic", etc.
3. Descarga el archivo .json
4. Sube el archivo a un hosting (GitHub, CDN, etc.)
5. Copia la URL en `EFFECT_URLS` en `EffectRenderer.tsx`

**Ejemplos de búsqueda:**
- "fire animation"
- "ice crystal"
- "lightning bolt"
- "magic sparkles"
- "poison bubble"
- "wind swirl"

### 2. 🎬 **GIPHY / Tenor**
**Sitios:**
- https://giphy.com/
- https://tenor.com/

**Cómo usar:**
1. Busca GIFs transparentes
2. Descarga el GIF
3. Sube a un hosting
4. Cambia la extensión en `EFFECT_URLS` a `.gif`

### 3. 🖼️ **IconScout / Flaticon**
**Sitios:**
- https://iconscout.com/
- https://flaticon.com/

**Cómo usar:**
- Busca "animated icons" o "animated illustrations"
- Descarga animaciones en formato GIF/Lottie

### 4. ⚡ **Animaciones Personalizadas**
Si quieres efectos únicos, puedes:

#### Opción A: Crear con Canva
1. Ve a https://www.canva.com/
2. Crea una animación simple
3. Exporta como GIF

#### Opción B: Usar herramientas online
- **Hippani Animator:** https://www.hippani.com/
- **Adobe Express:** https://www.adobe.com/express/
- **Kapwing:** https://www.kapwing.com/

## 🔧 Implementación en el Código

### Para Lottie (JSON):
```typescript
const EFFECT_URLS: Record<string, string> = {
  fire: 'https://tu-url-aqui.com/fire.json',
  ice: 'https://tu-url-aqui.com/ice.json',
  // ...
};
```

### Para GIFs:
```typescript
const EFFECT_URLS: Record<string, string> = {
  fire: 'https://tu-url-aqui.com/fire.gif',
  ice: 'https://tu-url-aqui.com/ice.gif',
  // ...
};
```

## 📁 Hosting de Archivos

### Opción 1: GitHub (Gratis)
1. Sube los archivos a un repo público
2. Usa URLs como: `https://raw.githubusercontent.com/tu-usuario/tu-repo/main/efectos/fire.json`

### Opción 2: CDN (Recomendado)
- **GitHub Pages:** Gratis, confiable
- **Netlify:** Gratis para archivos estáticos
- **Vercel:** Gratis con buena performance

### Opción 3: Local
- Coloca los archivos en `/public/efectos/`
- Usa URLs relativas: `/efectos/fire.json`

## 🎯 Consejos para Efectos RPG

### Tamaño y Performance
- **Tamaño máximo:** 100KB por animación
- **Formato preferido:** Lottie (.json) para mejor calidad
- **Resolución:** 256x256px es suficiente

### Estilo Recomendado
- **Colores vibrantes** pero no demasiado saturados
- **Transparencia** para que se vean bien sobre el mapa
- **Loop continuo** para efectos persistentes
- **Animaciones suaves** sin movimientos bruscos

### Categorías Útiles
- 🔥 **Daño por fuego:** llamas, explosiones
- ❄️ **Daño por hielo:** cristales, nieve
- ☠️ **Veneno:** burbujas verdes, humo tóxico
- ⚡ **Eléctrico:** rayos, chispas azules
- ✨ **Mágico:** partículas brillantes, runas
- 💨 **Viento:** remolinos, hojas volando
- 🌊 **Agua:** olas, gotas, burbujas
- 🌑 **Oscuridad:** sombras, niebla negra

## 🔄 Cómo Cambiar Efectos Existentes

1. Encuentra URLs nuevas
2. Edita `src/components/EffectRenderer.tsx`
3. Modifica el objeto `EFFECT_URLS`
4. Recarga la aplicación

## 🚀 Próximos Pasos

Una vez que tengas las URLs, el sistema automáticamente detectará si es Lottie (.json) o GIF (.gif) y usará el renderer apropiado.

¡Experimenta con diferentes estilos hasta encontrar los que más te gusten para tu campaña de D&D!
