# 🎬 GIFs Locales

Coloca aquí tus archivos GIF animados.

## 📝 Ejemplos de nombres recomendados:
- `fire.gif` - Llamas danzantes
- `ice.gif` - Cristales de hielo
- `poison.gif` - Burbujas verdes tóxicas
- `lightning.gif` - Rayos eléctricos
- `magic.gif` - Partículas mágicas
- `wind.gif` - Remolino de viento
- `water.gif` - Ondas de agua
- `darkness.gif` - Sombras oscuras

## 🔧 Configuración:

En `src/components/EffectRenderer.tsx`, cambia las URLs:

```typescript
const EFFECT_URLS: Record<string, string> = {
  fire: '/effects/gifs/fire.gif',
  ice: '/effects/gifs/ice.gif',
  // ... etc
};
```

## 📚 Dónde conseguir GIFs:

### Sitios gratuitos:
- **GIPHY**: https://giphy.com/
- **Tenor**: https://tenor.com/
- **Imgur**: https://imgur.com/

### Buscar con términos:
- "fire animation transparent"
- "ice crystal animated"
- "magic sparkles gif"
- "lightning bolt effect"

### Consejos para GIFs RPG:
- **Transparencia**: Fondos transparentes funcionan mejor
- **Tamaño**: Máximo 500KB por archivo
- **Loop**: GIFs que hacen loop continuo
- **Calidad**: 256x256px es suficiente
