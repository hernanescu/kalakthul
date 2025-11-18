# ⚙️ Configuración Rápida de Efectos

## 🎯 Elegir Tipo de Efectos

Edita `src/components/EffectRenderer.tsx` y cambia esta línea:

### Opción A: Efectos React (RECOMENDADO - 100% Local)
```typescript
const USE_REACT_EFFECTS = true;
```

### Opción B: GIFs/SVG Locales
```typescript
const USE_REACT_EFFECTS = false;

// Luego configura las rutas:
const EFFECT_URLS = {
  fire: '/effects/gifs/fire.gif',
  ice: '/effects/svg/ice.svg',
  poison: '/effects/gifs/poison.gif',
  // ...
};
```

### Opción C: Lottie Externos
```typescript
const USE_REACT_EFFECTS = false;

const EFFECT_URLS = {
  fire: 'https://assets1.lottiefiles.com/packages/lf20_4dl0t8tb.json',
  // URLs de Lottie...
};
```

### Opción D: Canvas (Fallback)
```typescript
const USE_REACT_EFFECTS = false;

const EFFECT_URLS = {
  fire: '', // Vacío = usa canvas
  ice: '',
  // ...
};
```

## 📁 Archivos Disponibles

### GIFs descargados:
```
/public/effects/gifs/
```

### SVG animados incluidos:
- `/public/effects/svg/fire.svg`
- `/public/effects/svg/ice.svg`

### Efectos React incluidos:
- 🔥 Fuego con llamas y chispas
- ❄️ Hielo con cristales giratorios
- ☠️ Veneno con burbujas tóxicas

## 🧪 Probar Cambios

1. Cambia la configuración
2. Recarga la aplicación (`Ctrl+R`)
3. Coloca efectos en el mapa
4. Verifica que funcionen correctamente

## 🔄 Cambiar Entre Opciones

Puedes cambiar entre tipos de efectos en cualquier momento editando la configuración y recargando.

¡Experimenta y elige la opción que más te guste! 🎨
