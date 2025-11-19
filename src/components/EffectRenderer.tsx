import { useEffect, useRef } from 'react';
import { Effect, ImageBounds, EffectType } from '../types';
import lottie from 'lottie-web';
import ReactEffects from './ReactEffects';

interface EffectRendererProps {
  effect: Effect;
  imageBounds: ImageBounds | null;
  canvasWidth: number;
  canvasHeight: number;
  zoom: { level: number; panX: number; panY: number };
  isPresentationMode: boolean;
}

// Configuración de efectos - Elige el tipo de animación que quieres usar
const USE_REACT_EFFECTS = true; // Cambia a true para usar animaciones React (100% local)

// Recursos de efectos - URLs externas O rutas locales (/public/effects/...)
const EFFECT_URLS: Record<string, string> = {
  // 🔥 FUENTE: Lottie Files (externo) - O cambia a '/effects/svg/fire.svg' para local
  fire: 'https://assets1.lottiefiles.com/packages/lf20_4dl0t8tb.json',

  // ❄️ FUENTE: Lottie Files (externo) - O cambia a '/effects/svg/ice.svg' para local
  ice: 'https://assets2.lottiefiles.com/packages/lf20_tGjH5A.json',

  // ☠️ FUENTE: Lottie Files (externo) - O cambia a '/effects/gifs/poison.gif' para local
  poison: 'https://assets10.lottiefiles.com/packages/lf20_8p5qh.json',

  // ⚡ FUENTE: Lottie Files (externo)
  lightning: 'https://assets2.lottiefiles.com/packages/lf20_kkflmt.json',

  // ✨ FUENTE: Lottie Files (externo)
  magic: 'https://assets2.lottiefiles.com/packages/lf20_dn6x7u.json',

  // 💨 FUENTE: Lottie Files (temporal)
  wind: 'https://assets2.lottiefiles.com/packages/lf20_8p5qh.json',

  // 🌊 FUENTE: Lottie Files (externo)
  water: 'https://assets2.lottiefiles.com/packages/lf20_n6t0j8.json',

  // 🌑 FUENTE: Lottie Files (temporal)
  darkness: 'https://assets1.lottiefiles.com/packages/lf20_4dl0t8tb.json',
};

// Función auxiliar para detectar tipo de archivo
const getEffectType = (url: string): 'lottie' | 'gif' | 'svg' | 'canvas' | 'react' => {
  if (USE_REACT_EFFECTS) return 'react';
  if (!url || url === '') return 'canvas';
  if (url.endsWith('.json') || url.includes('lottiefiles.com') || url.includes('lottie.host')) return 'lottie';
  if (url.endsWith('.gif')) return 'gif';
  if (url.endsWith('.svg')) return 'svg';
  return 'canvas'; // fallback a canvas
};

// Función para crear animaciones canvas personalizadas
function animateEffect(ctx: CanvasRenderingContext2D, type: EffectType, width: number, height: number, shape: 'square' | 'circle') {
  let frame = 0;
  const centerX = width / 2;
  const centerY = height / 2;
  let animationId: number;
  
  function draw() {
    ctx.clearRect(0, 0, width, height);
    
    // Aplicar clipping según la forma
    ctx.save();
    if (shape === 'circle') {
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, width / 2, height / 2, 0, 0, Math.PI * 2);
      ctx.clip();
    } else {
      ctx.beginPath();
      ctx.rect(0, 0, width, height);
      ctx.clip();
    }
    
    frame++;
    
    switch (type) {
      case 'fire':
        drawFire(ctx, centerX, centerY, width, height, frame);
        break;
      case 'ice':
        drawIce(ctx, centerX, centerY, width, height, frame);
        break;
      case 'poison':
        drawPoison(ctx, centerX, centerY, width, height, frame);
        break;
      case 'lightning':
        drawLightning(ctx, centerX, centerY, width, height, frame);
        break;
      case 'magic':
        drawMagic(ctx, centerX, centerY, width, height, frame);
        break;
      case 'wind':
        drawWind(ctx, centerX, centerY, width, height, frame);
        break;
      case 'water':
        drawWater(ctx, centerX, centerY, width, height, frame);
        break;
      case 'darkness':
        drawDarkness(ctx, centerX, centerY, width, height, frame);
        break;
    }
    
    ctx.restore();
    animationId = requestAnimationFrame(draw);
  }
  
  draw();
  
  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  };
}

function drawFire(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frame: number) {
  const time = frame * 0.08;
  const flames = 7;

  // Base del fuego
  const baseGradient = ctx.createRadialGradient(x, y + h * 0.3, 0, x, y + h * 0.3, w * 0.6);
  baseGradient.addColorStop(0, `rgba(255, 150, 0, 0.8)`);
  baseGradient.addColorStop(0.7, `rgba(255, 80, 0, 0.4)`);
  baseGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
  ctx.fillStyle = baseGradient;
  ctx.beginPath();
  ctx.ellipse(x, y + h * 0.2, w * 0.4, h * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < flames; i++) {
    const angle = (i / flames) * Math.PI * 2 + time;
    const radius = (w / 4) * (0.8 + Math.sin(time * 1.5 + i) * 0.4);
    const flameX = x + Math.cos(angle) * radius * 0.5;
    const flameY = y + Math.sin(angle) * radius * 0.5 + Math.sin(time * 2.5 + i) * 8;

    // Gradiente de llama individual
    const gradient = ctx.createRadialGradient(flameX, flameY, 0, flameX, flameY, radius);
    const hue = 20 + Math.sin(time + i) * 10; // Naranja-rojizo
    gradient.addColorStop(0, `hsla(${hue}, 100%, 60%, 0.9)`);
    gradient.addColorStop(0.4, `hsla(${hue + 10}, 100%, 50%, 0.6)`);
    gradient.addColorStop(0.8, `hsla(${hue + 20}, 80%, 40%, 0.2)`);
    gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(flameX, flameY, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Chispas
  for (let i = 0; i < 3; i++) {
    const sparkX = x + (Math.random() - 0.5) * w * 0.8;
    const sparkY = y + Math.random() * h * 0.4;
    const sparkSize = 1 + Math.random() * 2;

    ctx.fillStyle = `rgba(255, 255, 100, ${0.6 + Math.random() * 0.4})`;
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawIce(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frame: number) {
  const time = frame * 0.06;
  const particles = 10;

  // Aura fría
  const auraGradient = ctx.createRadialGradient(x, y, 0, x, y, w * 0.7);
  auraGradient.addColorStop(0, `rgba(200, 240, 255, 0.3)`);
  auraGradient.addColorStop(0.7, `rgba(173, 216, 230, 0.1)`);
  auraGradient.addColorStop(1, 'rgba(173, 216, 230, 0)');
  ctx.fillStyle = auraGradient;
  ctx.beginPath();
  ctx.arc(x, y, w * 0.6, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < particles; i++) {
    const angle = (i / particles) * Math.PI * 2 + time;
    const radius = (w / 3) * (0.6 + Math.sin(time * 1.5 + i) * 0.4);
    const particleX = x + Math.cos(angle) * radius;
    const particleY = y + Math.sin(angle) * radius;

    // Cristales de hielo
    ctx.save();
    ctx.translate(particleX, particleY);
    ctx.rotate(time + i);

    // Cristal hexagonal
    ctx.fillStyle = `rgba(200, 240, 255, ${0.7 + Math.sin(time + i) * 0.3})`;
    ctx.strokeStyle = `rgba(150, 200, 255, ${0.5 + Math.sin(time + i) * 0.3})`;
    ctx.lineWidth = 1;

    ctx.beginPath();
    for (let j = 0; j < 6; j++) {
      const hexAngle = (j / 6) * Math.PI * 2;
      const hexX = Math.cos(hexAngle) * (4 + Math.sin(time + i) * 2);
      const hexY = Math.sin(hexAngle) * (4 + Math.sin(time + i) * 2);
      if (j === 0) ctx.moveTo(hexX, hexY);
      else ctx.lineTo(hexX, hexY);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // Brillo central
  const centerGradient = ctx.createRadialGradient(x, y, 0, x, y, w * 0.3);
  centerGradient.addColorStop(0, `rgba(255, 255, 255, ${0.4 + Math.sin(time * 2) * 0.2})`);
  centerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = centerGradient;
  ctx.beginPath();
  ctx.arc(x, y, w * 0.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawPoison(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frame: number) {
  const time = frame * 0.07;
  const bubbles = 8;

  // Niebla tóxica de fondo
  const mistGradient = ctx.createRadialGradient(x, y, 0, x, y, w * 0.8);
  mistGradient.addColorStop(0, `rgba(100, 150, 50, 0.2)`);
  mistGradient.addColorStop(0.6, `rgba(50, 100, 25, 0.1)`);
  mistGradient.addColorStop(1, 'rgba(25, 50, 0, 0)');
  ctx.fillStyle = mistGradient;
  ctx.beginPath();
  ctx.arc(x, y, w * 0.7, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < bubbles; i++) {
    const angle = (i / bubbles) * Math.PI * 2 + time;
    const radius = (w / 4) * (0.7 + Math.sin(time * 1.3 + i) * 0.5);
    const bubbleX = x + Math.cos(angle) * radius;
    const bubbleY = y + Math.sin(angle) * radius + Math.sin(time * 1.8 + i) * 4;
    const bubbleSize = 5 + Math.sin(time * 1.2 + i) * 3;

    // Burbuja principal
    const bubbleGradient = ctx.createRadialGradient(bubbleX, bubbleY, 0, bubbleX, bubbleY, bubbleSize);
    bubbleGradient.addColorStop(0, `rgba(0, ${160 + Math.sin(time + i) * 40}, 0, ${0.8 + Math.sin(time + i) * 0.2})`);
    bubbleGradient.addColorStop(0.7, `rgba(0, ${120 + Math.sin(time + i) * 30}, 0, ${0.6 + Math.sin(time + i) * 0.2})`);
    bubbleGradient.addColorStop(1, 'rgba(0, 80, 0, 0)');
    ctx.fillStyle = bubbleGradient;
    ctx.beginPath();
    ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
    ctx.fill();

    // Brillo verde
    ctx.fillStyle = `rgba(150, 255, 150, ${0.6 + Math.sin(time * 1.5 + i) * 0.3})`;
    ctx.beginPath();
    ctx.arc(bubbleX - bubbleSize * 0.4, bubbleY - bubbleSize * 0.4, bubbleSize * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Partículas tóxicas
    for (let j = 0; j < 2; j++) {
      const particleAngle = time * 2 + i * 0.5 + j * Math.PI;
      const particleRadius = bubbleSize * (0.8 + Math.sin(time * 3 + i + j) * 0.4);
      const particleX = bubbleX + Math.cos(particleAngle) * particleRadius;
      const particleY = bubbleY + Math.sin(particleAngle) * particleRadius;

      ctx.fillStyle = `rgba(100, 200, 100, ${0.4 + Math.sin(time * 2 + i + j) * 0.3})`;
      ctx.beginPath();
      ctx.arc(particleX, particleY, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Centro pulsante
  const centerSize = w * 0.15 + Math.sin(time * 2) * w * 0.05;
  const centerGradient = ctx.createRadialGradient(x, y, 0, x, y, centerSize);
  centerGradient.addColorStop(0, `rgba(150, 255, 150, ${0.5 + Math.sin(time * 3) * 0.3})`);
  centerGradient.addColorStop(1, 'rgba(50, 150, 50, 0)');
  ctx.fillStyle = centerGradient;
  ctx.beginPath();
  ctx.arc(x, y, centerSize, 0, Math.PI * 2);
  ctx.fill();
}

function drawLightning(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frame: number) {
  const time = frame * 0.2;
  const bolts = 3;
  
  for (let i = 0; i < bolts; i++) {
    const angle = (i / bolts) * Math.PI * 2 + time;
    const length = w / 2;
    const boltX = x + Math.cos(angle) * length;
    const boltY = y + Math.sin(angle) * length;
    
    ctx.strokeStyle = `rgba(255, 255, ${100 + Math.sin(time + i) * 100}, ${0.8 + Math.sin(time * 3 + i) * 0.2})`;
    ctx.lineWidth = 2 + Math.sin(time + i);
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    // Crear línea zigzag
    const segments = 5;
    for (let j = 1; j <= segments; j++) {
      const segX = x + (boltX - x) * (j / segments) + Math.sin(time * 5 + j + i) * 5;
      const segY = y + (boltY - y) * (j / segments) + Math.cos(time * 5 + j + i) * 5;
      ctx.lineTo(segX, segY);
    }
    ctx.stroke();
  }
  
  // Centro brillante
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, w / 4);
  gradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
  gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, w / 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawMagic(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frame: number) {
  const time = frame * 0.1;
  const stars = 12;
  
  for (let i = 0; i < stars; i++) {
    const angle = (i / stars) * Math.PI * 2 + time;
    const radius = (w / 3) * (0.4 + Math.sin(time * 2 + i) * 0.4);
    const starX = x + Math.cos(angle) * radius;
    const starY = y + Math.sin(angle) * radius;
    const starSize = 2 + Math.sin(time + i) * 2;
    
    const hue = (i * 30 + frame * 2) % 360;
    ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${0.8 + Math.sin(time + i) * 0.2})`;
    ctx.beginPath();
    ctx.arc(starX, starY, starSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Estrella de 4 puntas
    ctx.save();
    ctx.translate(starX, starY);
    ctx.rotate(time + i);
    ctx.fillStyle = `hsla(${hue}, 100%, 80%, 0.6)`;
    ctx.beginPath();
    for (let j = 0; j < 4; j++) {
      const angle = (j / 4) * Math.PI * 2;
      const px = Math.cos(angle) * starSize * 1.5;
      const py = Math.sin(angle) * starSize * 1.5;
      if (j === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function drawWind(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frame: number) {
  const time = frame * 0.15;
  const lines = 8;
  
  for (let i = 0; i < lines; i++) {
    const angle = (i / lines) * Math.PI * 2 + time;
    const startRadius = w / 4;
    const endRadius = w / 2;
    const startX = x + Math.cos(angle) * startRadius;
    const startY = y + Math.sin(angle) * startRadius;
    const endX = x + Math.cos(angle) * endRadius;
    const endY = y + Math.sin(angle) * endRadius;
    
    const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
    gradient.addColorStop(0, `rgba(200, 200, 255, ${0.8 + Math.sin(time + i) * 0.2})`);
    gradient.addColorStop(1, 'rgba(200, 200, 255, 0)');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
}

function drawWater(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frame: number) {
  const time = frame * 0.06;
  const waves = 3;
  
  for (let i = 0; i < waves; i++) {
    const radius = (w / 3) * (0.5 + i * 0.2);
    const waveTime = time + i * 0.5;
    
    ctx.strokeStyle = `rgba(100, 150, 255, ${0.6 + Math.sin(waveTime) * 0.3})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
      const waveRadius = radius + Math.sin(angle * 3 + waveTime) * 5;
      const px = x + Math.cos(angle) * waveRadius;
      const py = y + Math.sin(angle) * waveRadius;
      
      if (angle === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }
  
  // Gotas
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 + time;
    const dropX = x + Math.cos(angle) * (w / 3);
    const dropY = y + Math.sin(angle) * (w / 3);
    
    ctx.fillStyle = `rgba(150, 200, 255, ${0.7 + Math.sin(time + i) * 0.3})`;
    ctx.beginPath();
    ctx.arc(dropX, dropY, 2 + Math.sin(time + i), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDarkness(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frame: number) {
  const time = frame * 0.05;
  const particles = 10;
  
  // Niebla oscura
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, w / 2);
  gradient.addColorStop(0, `rgba(20, 20, 40, ${0.7 + Math.sin(time) * 0.2})`);
  gradient.addColorStop(0.5, `rgba(10, 10, 30, ${0.5 + Math.sin(time) * 0.2})`);
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, w / 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Partículas oscuras
  for (let i = 0; i < particles; i++) {
    const angle = (i / particles) * Math.PI * 2 + time;
    const radius = (w / 3) * (0.4 + Math.sin(time * 2 + i) * 0.3);
    const particleX = x + Math.cos(angle) * radius;
    const particleY = y + Math.sin(angle) * radius;
    
    ctx.fillStyle = `rgba(30, 20, 50, ${0.8 + Math.sin(time + i) * 0.2})`;
    ctx.beginPath();
    ctx.arc(particleX, particleY, 2 + Math.sin(time + i), 0, Math.PI * 2);
    ctx.fill();
  }
}

export default function EffectRenderer({
  effect,
  imageBounds,
  canvasWidth,
  canvasHeight,
  zoom,
  isPresentationMode,
}: EffectRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<any>(null);
  const canvasCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Calcular posición y tamaño con zoom
    const scaledWidth = effect.width * zoom.level;
    const scaledHeight = effect.height * zoom.level;
    
    // Las coordenadas de los efectos son absolutas del canvas considerando zoom y pan
    const screenX = effect.x * zoom.level + zoom.panX;
    const screenY = effect.y * zoom.level + zoom.panY;


    // Verificar si está dentro del viewport
    if (
      screenX + scaledWidth / 2 < 0 ||
      screenX - scaledWidth / 2 > canvasWidth ||
      screenY + scaledHeight / 2 < 0 ||
      screenY - scaledHeight / 2 > canvasHeight
    ) {
      return; // No renderizar si está fuera de la vista
    }

        // Determinar qué tipo de efecto usar
        const animationUrl = effect.animationUrl || EFFECT_URLS[effect.type];
        const effectType = getEffectType(animationUrl);

        // Limpiar contenedor
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        if (effectType === 'react') {
          // Usar componente React con Framer Motion (100% local)
          // El componente se renderiza directamente en el return del componente
          // No necesitamos hacer nada aquí
        } else if (effectType === 'lottie') {
          // Cargar animación Lottie
          if (animationRef.current) {
            animationRef.current.destroy();
          }

          try {
            animationRef.current = lottie.loadAnimation({
              container: containerRef.current,
              renderer: 'svg',
              loop: true,
              autoplay: true,
              path: animationUrl,
            });
          } catch (error) {
            console.warn(`[EffectRenderer] Failed to load Lottie animation for ${effect.type}:`, error);
            // Fallback a canvas
            renderCanvasFallback();
          }
        } else if (effectType === 'gif' || effectType === 'svg') {
          // Cargar imagen/GIF/SVG
          const img = document.createElement('img');
          img.src = animationUrl;
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'contain';
          img.onerror = () => {
            console.warn(`[EffectRenderer] Failed to load ${effectType.toUpperCase()} for ${effect.type}, using canvas fallback`);
            renderCanvasFallback();
          };
          if (containerRef.current) {
            containerRef.current.appendChild(img);
          }
        } else {
          // Usar animación canvas personalizada
          renderCanvasFallback();
        }

        function renderCanvasFallback() {
          if (!containerRef.current) return;

          const canvas = document.createElement('canvas');
          canvas.width = 100;
          canvas.height = 100;
          canvas.style.width = '100%';
          canvas.style.height = '100%';
          containerRef.current.appendChild(canvas);

          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = effect.width;
            canvas.height = effect.height;
            canvasCleanupRef.current = animateEffect(ctx, effect.type, effect.width, effect.height, effect.shape);
          }
        }

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
      }
      if (canvasCleanupRef.current) {
        canvasCleanupRef.current();
        canvasCleanupRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [effect, imageBounds, canvasWidth, canvasHeight, zoom]);

  // Calcular posición y tamaño en pantalla
  const scaledWidth = effect.width * zoom.level;
  const scaledHeight = effect.height * zoom.level;
  const screenX = effect.x * zoom.level + zoom.panX;
  const screenY = effect.y * zoom.level + zoom.panY;

  // No renderizar si está fuera del viewport
  if (
    screenX + scaledWidth / 2 < 0 ||
    screenX - scaledWidth / 2 > canvasWidth ||
    screenY + scaledHeight / 2 < 0 ||
    screenY - scaledHeight / 2 > canvasHeight
  ) {
    return null;
  }

  // Aplicar forma con border-radius
  const borderRadius = effect.shape === 'circle' ? '50%' : '0';

  // Si usamos efectos React, renderizar directamente el componente
  const animationUrl = effect.animationUrl || EFFECT_URLS[effect.type];
  const effectType = getEffectType(animationUrl);

  if (effectType === 'react') {
    return (
      <ReactEffects
        effect={effect}
        imageBounds={imageBounds}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        zoom={zoom}
      />
    );
  }

  // Para otros tipos de efectos, usar el contenedor normal
  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        left: `${screenX}px`,
        top: `${screenY}px`,
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
        opacity: effect.opacity,
        pointerEvents: 'none', // Los clics se manejan desde el canvas
        transform: 'translate(-50%, -50%)',
        borderRadius: borderRadius,
        overflow: 'hidden',
        zIndex: 10,
      }}
    />
  );
}

