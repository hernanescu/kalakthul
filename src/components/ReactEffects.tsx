import React from 'react';
import { motion } from 'framer-motion';
import { Effect } from '../types';
import { EffectIcon, EffectIconType, EFFECT_ICONS } from './IconEffects';

interface ReactEffectsProps {
  effect: Effect;
  imageBounds: { x: number; y: number; width: number; height: number } | null;
  canvasWidth: number;
  canvasHeight: number;
  zoom: { level: number; panX: number; panY: number };
}

// Componente de efecto de fuego con Framer Motion
const FireEffect: React.FC<{ size: number; opacity: number }> = ({ size, opacity }) => (
  <div style={{ width: size, height: size, position: 'relative' }}>
    {/* Llamas principales */}
    <motion.div
      style={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: size * 0.6,
        height: size * 0.8,
        background: 'linear-gradient(to top, #ff4500, #ff6347, #ffa500, transparent)',
        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
        filter: 'blur(1px)',
        opacity,
      }}
      animate={{
        scaleY: [1, 1.2, 0.9, 1.1, 1],
        scaleX: [1, 0.9, 1.1, 0.95, 1],
        y: [0, -5, 0, -3, 0],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />

    {/* Chispas */}
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        style={{
          position: 'absolute',
          width: 3,
          height: 3,
          background: '#ffff00',
          borderRadius: '50%',
          bottom: size * 0.3,
          left: '50%',
          opacity,
        }}
        animate={{
          x: [0, (Math.random() - 0.5) * size * 0.8],
          y: [0, -Math.random() * size * 0.4],
          opacity: [opacity, 0, opacity],
        }}
        transition={{
          duration: 2 + Math.random(),
          repeat: Infinity,
          delay: i * 0.3,
        }}
      />
    ))}
  </div>
);

// Componente de efecto de hielo
const IceEffect: React.FC<{ size: number; opacity: number }> = ({ size, opacity }) => (
  <div style={{ width: size, height: size, position: 'relative' }}>
    {/* Aura fría */}
    <motion.div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: size * 0.8,
        height: size * 0.8,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(173, 216, 230, 0.3), transparent)',
        opacity,
      }}
      animate={{
        scale: [1, 1.1, 1],
        opacity: [opacity * 0.5, opacity, opacity * 0.5],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />

    {/* Cristales */}
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 0,
          height: 0,
          borderLeft: `${size * 0.08}px solid transparent`,
          borderRight: `${size * 0.08}px solid transparent`,
          borderBottom: `${size * 0.15}px solid rgba(173, 216, 230, ${opacity})`,
          transformOrigin: '50% 0%',
          opacity,
        }}
        animate={{
          rotate: [i * 60, i * 60 + 360],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          rotate: { duration: 8, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        }}
      />
    ))}

    {/* Brillo central */}
    <motion.div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: size * 0.2,
        height: size * 0.2,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8), transparent)',
        opacity,
      }}
      animate={{
        scale: [1, 1.3, 1],
        opacity: [opacity, opacity * 0.6, opacity],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  </div>
);

// Componente de efecto de veneno
const PoisonEffect: React.FC<{ size: number; opacity: number }> = ({ size, opacity }) => (
  <div style={{ width: size, height: size, position: 'relative' }}>
    {/* Niebla tóxica */}
    <motion.div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: size * 0.9,
        height: size * 0.9,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(100, 150, 50, 0.2), transparent)',
        opacity,
      }}
      animate={{
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />

    {/* Burbujas */}
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        style={{
          position: 'absolute',
          width: size * 0.1,
          height: size * 0.1,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(0, ${160 + Math.sin(i) * 40}, 0, ${opacity}), rgba(0, ${120 + Math.sin(i) * 30}, 0, ${opacity * 0.5}))`,
          top: '50%',
          left: '50%',
          opacity,
        }}
        animate={{
          x: [0, Math.cos(i * Math.PI / 4) * size * 0.3],
          y: [0, Math.sin(i * Math.PI / 4) * size * 0.3],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 3 + i * 0.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.1,
        }}
      />
    ))}

    {/* Centro pulsante */}
    <motion.div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: size * 0.25,
        height: size * 0.25,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(150, 255, 150, ${opacity}), rgba(50, 150, 50, ${opacity * 0.5}))`,
      }}
      animate={{
        scale: [1, 1.4, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  </div>
);

// Componente principal que elige el efecto correcto
export default function ReactEffects({
  effect,
  imageBounds,
  canvasWidth,
  canvasHeight,
  zoom
}: ReactEffectsProps) {
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

  const renderEffect = () => {
    const size = Math.max(scaledWidth, scaledHeight);


    switch (effect.type) {
      case 'fire':
        return <FireEffect size={size} opacity={effect.opacity} />;
      case 'ice':
        return <IceEffect size={size} opacity={effect.opacity} />;
      case 'poison':
        return <PoisonEffect size={size} opacity={effect.opacity} />;
      case 'lightning':
        return (
          <motion.div
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(255, 255, 0, ${effect.opacity}), rgba(255, 165, 0, ${effect.opacity * 0.5}), transparent)`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [effect.opacity, effect.opacity * 0.7, effect.opacity],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Líneas del rayo */}
            <motion.div
              style={{
                position: 'absolute',
                top: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 3,
                height: size * 0.6,
                background: '#ffff00',
                boxShadow: `0 0 10px rgba(255, 255, 0, ${effect.opacity})`,
              }}
              animate={{
                opacity: [effect.opacity, 0.5, effect.opacity],
                scaleY: [1, 1.3, 1],
              }}
              transition={{
                duration: 0.3,
                repeat: Infinity,
              }}
            />

            {/* Chispas simples */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                style={{
                  position: 'absolute',
                  width: 4,
                  height: 4,
                  background: '#ffffff',
                  borderRadius: '50%',
                  top: '50%',
                  left: '50%',
                }}
                animate={{
                  x: Math.cos(i * Math.PI / 2) * size * 0.2,
                  y: Math.sin(i * Math.PI / 2) * size * 0.2,
                  opacity: [effect.opacity, 0, effect.opacity],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        );

      case 'wind':
        return (
          <div style={{ width: size, height: size, position: 'relative' }}>
            {/* Remolinos de viento */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: size * (0.8 - i * 0.2),
                  height: 2,
                  background: `linear-gradient(90deg, transparent, rgba(173, 216, 230, ${effect.opacity}), transparent)`,
                  transformOrigin: 'left center',
                  opacity: effect.opacity,
                }}
                animate={{
                  rotate: [0, 360],
                  scaleX: [1, 1.5, 1],
                }}
                transition={{
                  rotate: { duration: 2 + i, repeat: Infinity, ease: "linear" },
                  scaleX: { duration: 1, repeat: Infinity, ease: "easeInOut" },
                }}
              />
            ))}
          </div>
        );

      case 'water':
        return (
          <div style={{ width: size, height: size, position: 'relative' }}>
            {/* Burbujas de agua */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                style={{
                  position: 'absolute',
                  width: size * 0.08,
                  height: size * 0.08,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, rgba(100, 149, 237, ${effect.opacity}), rgba(70, 130, 180, ${effect.opacity * 0.7}))`,
                  top: '50%',
                  left: '50%',
                  opacity: effect.opacity,
                }}
                animate={{
                  x: Math.cos(i * Math.PI / 4) * size * 0.25,
                  y: Math.sin(i * Math.PI / 4) * size * 0.25 + Math.sin(Date.now() * 0.001 + i) * 5,
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2 + i * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        );

      case 'darkness':
        return (
          <div style={{ width: size, height: size, position: 'relative' }}>
            {/* Sombras oscuras */}
            <motion.div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: size * 0.9,
                height: size * 0.9,
                borderRadius: '50%',
                background: `radial-gradient(circle, rgba(20, 20, 40, ${effect.opacity}), rgba(10, 10, 30, ${effect.opacity * 0.5}), transparent)`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [effect.opacity, effect.opacity * 0.8, effect.opacity],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* Partículas oscuras */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                style={{
                  position: 'absolute',
                  width: 4,
                  height: 4,
                  background: `rgba(30, 20, 50, ${effect.opacity})`,
                  borderRadius: '50%',
                  top: '50%',
                  left: '50%',
                }}
                animate={{
                  x: (Math.random() - 0.5) * size * 0.8,
                  y: (Math.random() - 0.5) * size * 0.8,
                  opacity: [effect.opacity, 0, effect.opacity],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        );

      default:
        // Para otros efectos, usar un efecto de icono si está disponible
        const iconType = effect.type as EffectIconType;
        if (['fire', 'ice', 'lightning', 'magic', 'poison', 'wind', 'water', 'flame', 'zap'].includes(iconType)) {
          return (
            <div style={{
              width: size,
              height: size,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <EffectIcon type={iconType} size={size * 0.8} opacity={effect.opacity} />
            </div>
          );
        }

        // Fallback: efecto genérico
        return (
          <motion.div
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(255, 255, 255, ${effect.opacity}), transparent)`,
            }}
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${screenX}px`,
        top: `${screenY}px`,
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
        pointerEvents: 'none',
        transform: 'translate(-50%, -50%)',
        borderRadius: effect.shape === 'circle' ? '50%' : '0',
        overflow: 'hidden',
        zIndex: 10,
      }}
    >
      {renderEffect()}
    </div>
  );
}
