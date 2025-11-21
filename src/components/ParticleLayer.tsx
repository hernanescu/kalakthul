import { useRef, useEffect } from 'react';
import { ParticleType } from '../types';
import './ParticleLayer.css';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

interface ParticleLayerProps {
  isEnabled: boolean;
  particleType: ParticleType;
  intensity: number;
  speed: number;
  canvasWidth: number;
  canvasHeight: number;
}

// Configuración por tipo de partícula
const PARTICLE_CONFIGS: Record<NonNullable<ParticleType>, {
  colors: string[];
  sizeRange: [number, number];
  speedRange: [number, number];
  gravity: number;
  wind: number;
  opacityRange: [number, number];
}> = {
  sand: {
    colors: ['#d4a574', '#c19a6b', '#b8956a', '#a0825d'],
    sizeRange: [1, 3],
    speedRange: [0.5, 2],
    gravity: 0.1,
    wind: 0.3,
    opacityRange: [0.4, 0.8],
  },
  leaves: {
    colors: ['#8b4513', '#a0522d', '#cd853f', '#daa520', '#b8860b'],
    sizeRange: [4, 8],
    speedRange: [0.3, 1.5],
    gravity: 0.05,
    wind: 0.5,
    opacityRange: [0.5, 0.9],
  },
  wind: {
    colors: ['#e0e0e0', '#d0d0d0', '#c0c0c0', '#b0b0b0'],
    sizeRange: [1, 2],
    speedRange: [1, 3],
    gravity: 0,
    wind: 1,
    opacityRange: [0.3, 0.6],
  },
  snow: {
    colors: ['#ffffff', '#f8f8f8', '#f0f0f0'],
    sizeRange: [2, 5],
    speedRange: [0.5, 1.5],
    gravity: 0.05,
    wind: 0.1,
    opacityRange: [0.6, 1],
  },
  dust: {
    colors: ['#888888', '#777777', '#666666', '#555555'],
    sizeRange: [1, 2],
    speedRange: [0.2, 1],
    gravity: 0.02,
    wind: 0.4,
    opacityRange: [0.3, 0.7],
  },
  sparks: {
    colors: ['#ffd700', '#ffed4e', '#ffaa00', '#ff6b00', '#ffeb3b'],
    sizeRange: [1, 3],
    speedRange: [1.5, 3.5],
    gravity: -0.05, // Las chispas suben
    wind: 0.2,
    opacityRange: [0.7, 1],
  },
  greenLeaves: {
    colors: ['#228b22', '#32cd32', '#90ee90', '#7cfc00', '#00ff00', '#2e8b57'],
    sizeRange: [4, 8],
    speedRange: [0.3, 1.5],
    gravity: 0.05,
    wind: 0.5,
    opacityRange: [0.5, 0.9],
  },
};

export default function ParticleLayer({
  isEnabled,
  particleType,
  intensity,
  speed,
  canvasWidth,
  canvasHeight,
}: ParticleLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastTimeRef = useRef<number>(0);

  // Inicializar partículas
  useEffect(() => {
    if (!isEnabled || !particleType || !canvasRef.current) {
      particlesRef.current = [];
      return;
    }

    const config = PARTICLE_CONFIGS[particleType];
    const maxParticles = Math.floor(50 + intensity * 150); // Entre 50 y 200 partículas
    const particles: Particle[] = [];

    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle(canvasWidth, canvasHeight, config, speed));
    }

    particlesRef.current = particles;
  }, [isEnabled, particleType, intensity, speed, canvasWidth, canvasHeight]);

  // Función para crear una partícula
  const createParticle = (
    width: number,
    height: number,
    config: typeof PARTICLE_CONFIGS[NonNullable<ParticleType>],
    speedMultiplier: number
  ): Particle => {
    const size = config.sizeRange[0] + Math.random() * (config.sizeRange[1] - config.sizeRange[0]);
    const baseSpeed = config.speedRange[0] + Math.random() * (config.speedRange[1] - config.speedRange[0]);
    const actualSpeed = baseSpeed * (0.5 + speedMultiplier * 0.5);

    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (config.wind * actualSpeed) + (Math.random() - 0.5) * 0.5,
      vy: (config.gravity * actualSpeed) + (Math.random() - 0.5) * 0.3,
      size,
      opacity: config.opacityRange[0] + Math.random() * (config.opacityRange[1] - config.opacityRange[0]),
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
    };
  };

  // Loop de animación
  useEffect(() => {
    if (!isEnabled || !particleType || !canvasRef.current) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: false });
    if (!ctx) return;

    const config = PARTICLE_CONFIGS[particleType];

    const animate = (currentTime: number) => {
      if (!canvas || !ctx) return;

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;
      const delta = Math.min(deltaTime / 16, 2); // Normalizar a ~60fps

      // Limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Actualizar y dibujar partículas
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Actualizar posición
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.rotation += p.rotationSpeed * delta;

        // Aplicar gravedad y viento según el tipo
        if (config.gravity !== 0) {
          p.vy += config.gravity * delta * 0.1;
        }
        if (config.wind > 0) {
          p.vx += (Math.random() - 0.5) * config.wind * 0.1 * delta;
        }

        // Regenerar partícula si sale de la pantalla
        if (p.x < -10) {
          p.x = canvas.width + 10;
          p.y = Math.random() * canvas.height;
        } else if (p.x > canvas.width + 10) {
          p.x = -10;
          p.y = Math.random() * canvas.height;
        }

        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        } else if (p.y > canvas.height + 10) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }

        // Dibujar partícula
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        // Dibujar según el tipo
        if (particleType === 'leaves' || particleType === 'greenLeaves') {
          // Hojas: forma elíptica
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (particleType === 'snow') {
          // Nieve: círculos con suavizado
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
          // Agregar brillo
          ctx.globalAlpha = p.opacity * 0.5;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(-p.size * 0.3, -p.size * 0.3, p.size * 0.3, 0, Math.PI * 2);
          ctx.fill();
        } else if (particleType === 'sparks') {
          // Chispas: círculos brillantes con efecto de resplandor
          ctx.shadowBlur = 5;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
          // Agregar núcleo brillante
          ctx.shadowBlur = 0;
          ctx.globalAlpha = p.opacity * 0.8;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Otras partículas: círculos simples
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isEnabled, particleType, canvasWidth, canvasHeight]);

  if (!isEnabled || !particleType) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="particle-layer"
      width={canvasWidth}
      height={canvasHeight}
    />
  );
}

