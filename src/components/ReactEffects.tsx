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
const FireEffect: React.FC<{ size: number; opacity: number; shape: 'square' | 'circle' }> = ({ size, opacity, shape }) => {
  const fireSize = shape === 'circle' ? size * 0.8 : size * 0.9;

  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        borderRadius: shape === 'circle' ? '50%' : '0',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Fuego principal - un solo elemento centrado */}
      <motion.div
        style={{
          width: fireSize,
          height: fireSize,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255, 69, 0, ${opacity * 1.2}), rgba(255, 140, 0, ${opacity * 0.9}), rgba(255, 215, 0, ${opacity * 0.6}), transparent)`,
          filter: 'blur(0.5px)',
        }}
        animate={{
          scale: [0.9, 1.1, 0.9],
          opacity: [opacity * 0.8, opacity, opacity * 0.8],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Chispas simples alrededor */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: 2,
            height: 2,
            background: '#ffff00',
            borderRadius: '50%',
            top: '50%',
            left: '50%',
          }}
          animate={{
            x: Math.cos(i * Math.PI / 2) * (fireSize * 0.4),
            y: Math.sin(i * Math.PI / 2) * (fireSize * 0.4),
            opacity: [opacity * 1.5, 0, opacity * 1.5],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
};

// Componente de efecto de hielo
const IceEffect: React.FC<{ size: number; opacity: number; shape: 'square' | 'circle' }> = ({ size, opacity, shape }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        borderRadius: shape === 'circle' ? '50%' : '0',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Aura fría */}
      <motion.div
        style={{
          width: size * 0.9,
          height: size * 0.9,
          borderRadius: shape === 'circle' ? '50%' : '0',
          background: 'radial-gradient(circle, rgba(173, 216, 230, 0.8), rgba(255, 255, 255, 0.6), rgba(173, 216, 230, 0.4), transparent)',
          opacity,
          boxShadow: `0 0 20px rgba(173, 216, 230, ${opacity * 0.5})`,
        }}
        animate={{
          scale: [0.9, 1.1, 0.9],
          opacity: [opacity * 0.6, opacity, opacity * 0.6],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Copito central */}
      <motion.div
        style={{
          position: 'absolute',
          width: size * 0.4,
          height: size * 0.4,
          opacity,
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {/* Ramas del copito */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '3px',
              height: size * 0.18,
              background: `linear-gradient(to bottom, rgba(255, 255, 255, ${opacity * 1.2}), rgba(173, 216, 230, ${opacity}))`,
              transformOrigin: '50% 0%',
              transform: `translate(-50%, -100%) rotate(${i * 60}deg)`,
              top: '0%',
              left: '50%',
              borderRadius: '1px',
              boxShadow: `0 0 3px rgba(173, 216, 230, ${opacity * 0.8})`,
            }}
          />
        ))}
      </motion.div>

      {/* Brillo central */}
      <motion.div
        style={{
          position: 'absolute',
          width: size * 0.15,
          height: size * 0.15,
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
};

// Componente de efecto de veneno
const PoisonEffect: React.FC<{ size: number; opacity: number; shape: 'square' | 'circle' }> = ({ size, opacity, shape }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        borderRadius: shape === 'circle' ? '50%' : '0',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Niebla tóxica central */}
      <motion.div
        style={{
          width: size * 0.8,
          height: size * 0.8,
          borderRadius: shape === 'circle' ? '50%' : '0',
          background: 'radial-gradient(circle, rgba(100, 150, 50, 0.6), rgba(50, 100, 25, 0.3), transparent)',
          opacity,
        }}
        animate={{
          scale: [0.9, 1.1, 0.9],
          opacity: [opacity * 0.7, opacity, opacity * 0.7],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Burbujas alrededor */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: size * 0.12,
            height: size * 0.12,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(0, ${160 + Math.sin(i) * 40}, 0, ${opacity * 1.3}), rgba(0, ${120 + Math.sin(i) * 30}, 0, ${opacity * 0.8}))`,
            opacity,
          }}
          animate={{
            x: Math.cos(i * Math.PI * 2 / 5) * size * 0.25,
            y: Math.sin(i * Math.PI * 2 / 5) * size * 0.25,
            scale: [0.8, 1.3, 0.8],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Núcleo pulsante */}
      <motion.div
        style={{
          position: 'absolute',
          width: size * 0.25,
          height: size * 0.25,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(150, 255, 150, ${opacity * 1.2}), rgba(50, 150, 50, ${opacity * 0.8}))`,
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [opacity, opacity * 0.5, opacity],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

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
        return <FireEffect size={size} opacity={effect.opacity} shape={effect.shape} />;
      case 'ice':
        return <IceEffect size={size} opacity={effect.opacity} shape={effect.shape} />;
      case 'poison':
        return <PoisonEffect size={size} opacity={effect.opacity} shape={effect.shape} />;
      case 'lightning':
        return (
          <motion.div
            style={{
              width: size,
              height: size,
              borderRadius: effect.shape === 'circle' ? '50%' : '0',
              overflow: 'hidden',
              background: `radial-gradient(circle, rgba(255, 255, 0, ${effect.opacity * 1.1}), rgba(255, 165, 0, ${effect.opacity * 0.7}), transparent)`,
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
                boxShadow: `0 0 15px rgba(255, 255, 0, ${effect.opacity * 1.2})`,
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
                  opacity: [effect.opacity * 1.3, 0, effect.opacity * 1.3],
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
          <div
            style={{
              width: size,
              height: size,
              position: 'relative',
              borderRadius: effect.shape === 'circle' ? '50%' : '0',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Núcleo de viento */}
            <motion.div
              style={{
                width: size * 0.7,
                height: size * 0.7,
                borderRadius: effect.shape === 'circle' ? '50%' : '0',
                background: `radial-gradient(circle, rgba(200, 220, 255, ${effect.opacity * 0.8}), rgba(173, 216, 230, ${effect.opacity * 0.5}), transparent)`,
              }}
              animate={{
                scale: [0.9, 1.1, 0.9],
                opacity: [effect.opacity * 0.7, effect.opacity, effect.opacity * 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Partículas de viento */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                style={{
                  position: 'absolute',
                  width: 2,
                  height: size * 0.2,
                  background: `linear-gradient(to bottom, rgba(173, 216, 230, ${effect.opacity * 1.2}), transparent)`,
                  opacity: effect.opacity,
                }}
                animate={{
                  x: Math.cos(i * Math.PI / 3) * size * 0.2,
                  y: Math.sin(i * Math.PI / 3) * size * 0.2,
                  rotate: [0, 180, 360],
                  scaleY: [0.8, 1.3, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}

            {/* Partículas pequeñas flotando */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`small-${i}`}
                style={{
                  position: 'absolute',
                  width: 1,
                  height: 6,
                  background: `rgba(200, 220, 255, ${effect.opacity * 1.3})`,
                  opacity: effect.opacity,
                }}
                animate={{
                  x: Math.cos(i * Math.PI * 2 / 3) * size * 0.15,
                  y: Math.sin(i * Math.PI * 2 / 3) * size * 0.15,
                  rotate: [0, 120, 240, 360],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "linear",
                }}
              />
            ))}
          </div>
        );

      case 'water':
        return (
          <div
            style={{
              width: size,
              height: size,
              position: 'relative',
              borderRadius: effect.shape === 'circle' ? '50%' : '0',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Base acuosa */}
            <motion.div
              style={{
                width: size * 0.85,
                height: size * 0.85,
                borderRadius: effect.shape === 'circle' ? '50%' : '0',
                background: `radial-gradient(circle, rgba(25, 25, 112, ${effect.opacity * 0.8}), rgba(0, 0, 139, ${effect.opacity * 0.5}), rgba(70, 130, 180, ${effect.opacity * 0.3}))`,
              }}
              animate={{
                scale: [0.9, 1.1, 0.9],
                opacity: [effect.opacity * 0.7, effect.opacity, effect.opacity * 0.7],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Olas/Ondas */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                style={{
                  position: 'absolute',
                  width: size * 0.1,
                  height: size * 0.25,
                  background: `linear-gradient(to bottom, rgba(135, 206, 250, ${effect.opacity * 1.3}), rgba(25, 25, 112, ${effect.opacity * 0.9}))`,
                  borderRadius: '50%',
                  opacity: effect.opacity,
                }}
                animate={{
                  x: Math.cos(i * Math.PI / 2) * size * 0.25,
                  y: Math.sin(i * Math.PI / 2) * size * 0.25,
                  scaleY: [0.8, 1.4, 0.8],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeInOut",
                }}
              />
            ))}

            {/* Burbujas */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`bubble-${i}`}
                style={{
                  position: 'absolute',
                  width: size * 0.08,
                  height: size * 0.08,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, rgba(173, 216, 230, ${effect.opacity * 1.2}), rgba(135, 206, 250, ${effect.opacity * 0.8}))`,
                  opacity: effect.opacity,
                }}
                animate={{
                  x: Math.cos(i * Math.PI * 2 / 3) * size * 0.2,
                  y: Math.sin(i * Math.PI * 2 / 3) * size * 0.2,
                  scale: [0.7, 1.5, 0.7],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        );

      case 'darkness':
        return (
          <div
            style={{
              width: size,
              height: size,
              position: 'relative',
              borderRadius: effect.shape === 'circle' ? '50%' : '0',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Núcleo de oscuridad */}
            <motion.div
              style={{
                width: size * 0.8,
                height: size * 0.8,
                borderRadius: effect.shape === 'circle' ? '50%' : '0',
                background: `radial-gradient(circle, rgba(5, 5, 15, ${effect.opacity * 1.4}), rgba(2, 2, 8, ${effect.opacity * 1.1}), rgba(0, 0, 0, ${effect.opacity * 0.8}))`,
              }}
              animate={{
                scale: [0.9, 1.2, 0.9],
                opacity: [effect.opacity * 0.8, effect.opacity, effect.opacity * 0.8],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Partículas de sombra */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                style={{
                  position: 'absolute',
                  width: size * 0.12,
                  height: size * 0.12,
                  background: `rgba(10, 5, 20, ${effect.opacity * 1.3})`,
                  borderRadius: '50%',
                  opacity: effect.opacity,
                }}
                animate={{
                  x: Math.cos(i * Math.PI * 2 / 5) * size * 0.25,
                  y: Math.sin(i * Math.PI * 2 / 5) * size * 0.25,
                  scale: [0.7, 1.4, 0.7],
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeInOut",
                }}
              />
            ))}

            {/* Efecto pulsante exterior */}
            <motion.div
              style={{
                position: 'absolute',
                width: size * 0.95,
                height: size * 0.95,
                borderRadius: effect.shape === 'circle' ? '50%' : '0',
                border: `3px solid rgba(20, 10, 35, ${effect.opacity * 1.0})`,
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [effect.opacity * 0.3, effect.opacity * 0.6, effect.opacity * 0.3],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
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
              justifyContent: 'center',
              borderRadius: effect.shape === 'circle' ? '50%' : '0',
              overflow: 'hidden'
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
              borderRadius: effect.shape === 'circle' ? '50%' : '0',
              overflow: 'hidden',
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
        zIndex: 10,
      }}
    >
      {renderEffect()}
    </div>
  );
}
