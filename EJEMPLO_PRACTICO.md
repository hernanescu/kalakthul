# Ejemplo Práctico: Agregar un Efecto de Fuego

## Paso 1: Descargar un GIF de fuego

1. Ve a Google Images: https://images.google.com
2. Busca: "fire gif transparent background"
3. En "Herramientas" → "Tipo" → selecciona "Animado"
4. Elige un GIF que te guste
5. Haz clic derecho → "Guardar imagen como..."
6. Guárdalo como `fire.gif`

## Paso 2: Crear la carpeta en tu proyecto

En la terminal, ejecuta:
```bash
mkdir -p public/effects
```

Luego mueve el archivo `fire.gif` a esa carpeta:
```bash
mv ~/Descargas/fire.gif public/effects/fire.gif
```

## Paso 3: Actualizar el código

Abre el archivo `src/components/EffectRenderer.tsx` y busca esta parte:

```typescript
const EFFECT_URLS: Record<string, string> = {
  fire: 'https://lottie.host/embed/...', // ❌ Esto no funciona
  // ...
};
```

Cámbialo por:

```typescript
const EFFECT_URLS: Record<string, string> = {
  fire: '/effects/fire.gif', // ✅ Esto sí funciona
  ice: 'https://lottie.host/embed/...',
  poison: 'https://lottie.host/embed/...',
  // ... (deja los otros como están por ahora)
};
```

## Paso 4: ¡Listo!

Ahora cuando agregues un efecto de fuego en tu aplicación, verás el GIF animado en lugar del emoji 🔥.

---

## Alternativa: Usar URLs públicas (más fácil aún)

Si encuentras un GIF en internet con una URL directa, puedes usarla directamente:

```typescript
const EFFECT_URLS: Record<string, string> = {
  fire: 'https://ejemplo.com/fire.gif', // URL directa al GIF
  // ...
};
```

Esto es más fácil porque no necesitas descargar nada, pero depende de que la URL siga funcionando.

---

## ¿Quieres que te ayude a configurarlo?

Puedo:
1. Buscar URLs de GIFs gratuitos que puedas usar directamente
2. Crear la estructura de carpetas
3. Actualizar el código con URLs reales

¿Te ayudo con alguno de estos pasos?

