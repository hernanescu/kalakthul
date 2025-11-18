import { useEffect, useRef } from 'react';
import { Effect, ImageBounds, EffectType } from '../types';
import lottie from 'lottie-web';

interface EffectRendererProps {
  effect: Effect;
  imageBounds: ImageBounds | null;
  canvasWidth: number;
  canvasHeight: number;
  zoom: { level: number; panX: number; panY: number };
}

// URLs de animaciones Lottie (puedes reemplazarlas con tus propias animaciones)
const EFFECT_URLS: Record<string, string> = {
  fire: '', // Vacío = usar animación canvas
  ice: '',
  poison: '',
  lightning: '',
  magic: '',
  wind: '',
  water: '',
  darkness: '',
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
  const time = frame * 0.1;
  const flames = 5;
  
  for (let i = 0; i < flames; i++) {
    const angle = (i / flames) * Math.PI * 2 + time;
    const radius = (w / 3) * (0.7 + Math.sin(time + i) * 0.3);
    const flameX = x + Math.cos(angle) * radius * 0.3;
    const flameY = y + Math.sin(angle) * radius * 0.3 + Math.sin(time * 2 + i) * 5;
    
    const gradient = ctx.createRadialGradient(flameX, flameY, 0, flameX, flameY, radius);
    gradient.addColorStop(0, `rgba(255, ${100 + Math.sin(time + i) * 50}, 0, 0.9)`);
    gradient.addColorStop(0.5, `rgba(255, ${50 + Math.sin(time + i) * 30}, 0, 0.5)`);
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(flameX, flameY, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawIce(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frame: number) {
  const time = frame * 0.05;
  const particles = 8;
  
  for (let i = 0; i < particles; i++) {
    const angle = (i / particles) * Math.PI * 2 + time;
    const radius = (w / 3) * (0.5 + Math.sin(time * 2 + i) * 0.3);
    const particleX = x + Math.cos(angle) * radius;
    const particleY = y + Math.sin(angle) * radius;
    
    ctx.fillStyle = `rgba(173, 216, 230, ${0.6 + Math.sin(time + i) * 0.4})`;
    ctx.beginPath();
    ctx.arc(particleX, particleY, 3 + Math.sin(time + i) * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Líneas de hielo
    ctx.strokeStyle = `rgba(200, 230, 255, ${0.4 + Math.sin(time + i) * 0.3})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(particleX, particleY);
    ctx.stroke();
  }
}

function drawPoison(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frame: number) {
  const time = frame * 0.08;
  const bubbles = 6;
  
  for (let i = 0; i < bubbles; i++) {
    const angle = (i / bubbles) * Math.PI * 2 + time;
    const radius = (w / 4) * (0.6 + Math.sin(time * 1.5 + i) * 0.4);
    const bubbleX = x + Math.cos(angle) * radius;
    const bubbleY = y + Math.sin(angle) * radius + Math.sin(time * 2 + i) * 3;
    const bubbleSize = 4 + Math.sin(time + i) * 3;
    
    ctx.fillStyle = `rgba(0, ${150 + Math.sin(time + i) * 50}, 0, ${0.7 + Math.sin(time + i) * 0.3})`;
    ctx.beginPath();
    ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Brillo en la burbuja
    ctx.fillStyle = `rgba(100, 255, 100, ${0.5 + Math.sin(time + i) * 0.3})`;
    ctx.beginPath();
    ctx.arc(bubbleX - bubbleSize * 0.3, bubbleY - bubbleSize * 0.3, bubbleSize * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
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
}: EffectRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<any>(null);
  const canvasCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Calcular posición y tamaño con zoom
    const scaledWidth = effect.width * zoom.level;
    const scaledHeight = effect.height * zoom.level;
    
    // Convertir coordenadas del canvas a coordenadas de pantalla
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

    // Si hay una URL de animación personalizada, usarla
    const animationUrl = effect.animationUrl || EFFECT_URLS[effect.type];

    if (animationUrl) {
      // Intentar cargar como Lottie (JSON)
      if (animationUrl.endsWith('.json') || animationUrl.includes('lottie')) {
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
        }
      } else if (animationUrl.endsWith('.gif')) {
        // Cargar como GIF
        const img = document.createElement('img');
        img.src = animationUrl;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          containerRef.current.appendChild(img);
        }
      }
    } else {
      // Si no hay URL, crear animación canvas personalizada
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        containerRef.current.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Ajustar tamaño del canvas al tamaño del efecto
          canvas.width = effect.width;
          canvas.height = effect.height;
          canvasCleanupRef.current = animateEffect(ctx, effect.type, effect.width, effect.height, effect.shape);
        }
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
        pointerEvents: 'auto', // Permitir interacción con efectos
        transform: 'translate(-50%, -50%)',
        borderRadius: borderRadius,
        overflow: 'hidden',
        zIndex: 10,
      }}
    />
  );
}

