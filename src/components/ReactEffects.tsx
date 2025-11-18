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
  if (shape === 'circle') {
    // Versión circular: copito central con aura
    return (
      <div style={{
        width: size,
        height: size,
        position: 'relative',
        borderRadius: '50%',
        overflow: 'hidden'
      }}>
        {/* Aura fría circular */}
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: size * 0.9,
            height: size * 0.9,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(173, 216, 230, 0.7), rgba(173, 216, 230, 0.3), transparent)',
            opacity,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [opacity * 0.6, opacity, opacity * 0.6],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Copito central más pequeño */}
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity,
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 6,
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
                width: '2px',
                height: size * 0.15,
                background: `rgba(173, 216, 230, ${opacity})`,
                transformOrigin: '50% 0%',
                transform: `rotate(${i * 60}deg)`,
              }}
            />
          ))}
        </motion.div>

        {/* Brillo central */}
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
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
  } else {
    // Versión cuadrada: copito hexagonal completo
    return (
      <div style={{
        width: size,
        height: size,
        position: 'relative',
        borderRadius: '0',
        overflow: 'hidden'
      }}>
        {/* Aura fría cuadrada */}
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: size * 0.8,
            height: size * 0.8,
            background: 'radial-gradient(circle, rgba(173, 216, 230, 0.6), transparent)',
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

        {/* Cristales hexagonales */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 0,
              height: 0,
              borderLeft: `${size * 0.06}px solid transparent`,
              borderRight: `${size * 0.06}px solid transparent`,
              borderBottom: `${size * 0.12}px solid rgba(173, 216, 230, ${opacity * 1.5})`,
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
  }
};

// Componente de efecto de veneno
const PoisonEffect: React.FC<{ size: number; opacity: number; shape: 'square' | 'circle' }> = ({ size, opacity, shape }) => {
  if (shape === 'circle') {
    // Versión circular: burbujas en órbita
    return (
      <div style={{
        width: size,
        height: size,
        position: 'relative',
        borderRadius: '50%',
        overflow: 'hidden'
      }}>
        {/* Niebla tóxica central */}
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: size * 0.7,
            height: size * 0.7,
            borderRadius: '50%',
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

        {/* Burbujas en órbita circular */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: size * 0.1,
              height: size * 0.1,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(0, ${160 + Math.sin(i) * 40}, 0, ${opacity * 1.3}), rgba(0, ${120 + Math.sin(i) * 30}, 0, ${opacity * 0.8}))`,
              top: '50%',
              left: '50%',
              opacity,
            }}
            animate={{
              x: Math.cos(i * Math.PI / 3) * size * 0.25,
              y: Math.sin(i * Math.PI / 3) * size * 0.25,
              scale: [0.8, 1.3, 0.8],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Núcleo pulsante */}
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: size * 0.2,
            height: size * 0.2,
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
  } else {
    // Versión cuadrada: burbujas flotando hacia arriba
    return (
      <div style={{
        width: size,
        height: size,
        position: 'relative',
        borderRadius: '0',
        overflow: 'hidden'
      }}>
        {/* Niebla tóxica de fondo */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: size * 0.9,
            height: size * 0.7,
            background: 'linear-gradient(to top, rgba(100, 150, 50, 0.6), rgba(50, 100, 25, 0.3), transparent)',
            opacity,
          }}
          animate={{
            opacity: [opacity * 0.6, opacity, opacity * 0.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Burbujas flotando */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: size * 0.08,
              height: size * 0.08,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(0, ${160 + Math.sin(i) * 40}, 0, ${opacity * 1.3}), rgba(0, ${120 + Math.sin(i) * 30}, 0, ${opacity * 0.9}))`,
              bottom: size * 0.2,
              left: '50%',
              opacity,
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * size * 0.6],
              y: [0, -size * 0.5, -size * 0.8],
              scale: [1, 1.2, 0.8],
              opacity: [opacity, opacity * 0.3, 0],
            }}
            transition={{
              duration: 3 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Centro pulsante */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: size * 0.1,
            left: '50%',
            transform: 'translateX(-50%)',
            width: size * 0.25,
            height: size * 0.25,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(150, 255, 150, ${opacity * 1.2}), rgba(50, 150, 50, ${opacity * 0.7}))`,
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
  }
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
        if (effect.shape === 'circle') {
          // Versión circular: vórtice de viento
          return (
            <div style={{
              width: size,
              height: size,
              position: 'relative',
              borderRadius: '50%',
              overflow: 'hidden'
            }}>
              {/* Núcleo de viento */}
              <motion.div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: size * 0.3,
                  height: size * 0.3,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, rgba(200, 220, 255, ${effect.opacity * 0.8}), rgba(173, 216, 230, ${effect.opacity * 0.5}), transparent)`,
                }}
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [effect.opacity * 0.7, effect.opacity, effect.opacity * 0.7],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Espirales de viento */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 2,
                    height: size * (0.15 + i * 0.08),
                    background: `linear-gradient(to bottom, rgba(173, 216, 230, ${effect.opacity * 1.2}), transparent)`,
                    transformOrigin: '50% 100%',
                    transform: `translate(-50%, -100%) rotate(${i * 60}deg)`,
                    opacity: effect.opacity,
                  }}
                  animate={{
                    rotate: [0, 360],
                    scaleY: [0.8, 1.3, 0.8],
                  }}
                  transition={{
                    rotate: { duration: 3 + i * 0.2, repeat: Infinity, ease: "linear" },
                    scaleY: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                  }}
                />
              ))}

              {/* Partículas flotantes */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  style={{
                    position: 'absolute',
                    width: 1,
                    height: 8,
                    background: `rgba(200, 220, 255, ${effect.opacity * 1.3})`,
                    top: '50%',
                    left: '50%',
                  }}
                  animate={{
                    x: Math.cos(i * Math.PI / 2) * size * 0.25,
                    y: Math.sin(i * Math.PI / 2) * size * 0.25,
                    rotate: [0, 90, 180, 270, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "linear",
                  }}
                />
              ))}
            </div>
          );
        } else {
          // Versión cuadrada: corrientes de viento horizontales
          return (
            <div style={{
              width: size,
              height: size,
              position: 'relative',
              borderRadius: '0',
              overflow: 'hidden'
            }}>
              {/* Base de viento cuadrada */}
              <motion.div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: size * 0.8,
                  height: size * 0.8,
                  background: `radial-gradient(circle, rgba(200, 220, 255, ${effect.opacity * 0.6}), transparent)`,
                }}
                animate={{
                  scale: [0.9, 1.1, 0.9],
                  opacity: [effect.opacity * 0.5, effect.opacity, effect.opacity * 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Corrientes horizontales */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: size * (0.2 + i * 0.15),
                    left: 0,
                    width: size * 0.9,
                    height: 3,
                    background: `linear-gradient(90deg, transparent, rgba(173, 216, 230, ${effect.opacity * 1.1}), rgba(200, 220, 255, ${effect.opacity * 1.2}), rgba(173, 216, 230, ${effect.opacity * 1.1}), transparent)`,
                    opacity: effect.opacity,
                  }}
                  animate={{
                    x: [-size * 0.1, size * 0.1, -size * 0.1],
                    scaleX: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 2.5 + i * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          );
        }

      case 'water':
        if (effect.shape === 'circle') {
          // Versión circular: olas concéntricas
          return (
            <div style={{
              width: size,
              height: size,
              position: 'relative',
              borderRadius: '50%',
              overflow: 'hidden'
            }}>
              {/* Base acuosa circular */}
              <motion.div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: size * 0.8,
                  height: size * 0.8,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, rgba(70, 130, 180, ${effect.opacity * 0.7}), rgba(100, 149, 237, ${effect.opacity * 0.4}), transparent)`,
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

              {/* Olas concéntricas */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: size * (0.4 + i * 0.2),
                    height: size * (0.4 + i * 0.2),
                    borderRadius: '50%',
                    border: `2px solid rgba(135, 206, 235, ${effect.opacity * (1.1 - i * 0.2)})`,
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [effect.opacity * (0.6 - i * 0.1), effect.opacity * (0.9 - i * 0.2), effect.opacity * (0.6 - i * 0.1)],
                  }}
                  transition={{
                    duration: 2.5 + i * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.3,
                  }}
                />
              ))}

              {/* Burbujas pequeñas */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={`bubble-${i}`}
                  style={{
                    position: 'absolute',
                    width: size * 0.06,
                    height: size * 0.06,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, rgba(173, 216, 230, ${effect.opacity * 1.2}), rgba(135, 206, 235, ${effect.opacity * 0.8}))`,
                    top: '50%',
                    left: '50%',
                  }}
                  animate={{
                    x: Math.cos(i * Math.PI / 2) * size * 0.2,
                    y: Math.sin(i * Math.PI / 2) * size * 0.2,
                    scale: [0.8, 1.4, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          );
        } else {
          // Versión cuadrada: flujo de agua hacia abajo
          return (
            <div style={{
              width: size,
              height: size,
              position: 'relative',
              borderRadius: '0',
              overflow: 'hidden'
            }}>
              {/* Base acuosa cuadrada */}
              <motion.div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: size * 0.9,
                  height: size * 0.6,
                  background: `linear-gradient(to top, rgba(70, 130, 180, ${effect.opacity * 0.8}), rgba(100, 149, 237, ${effect.opacity * 0.5}), transparent)`,
                  borderRadius: '50% 50% 20% 20% / 60% 60% 20% 20%',
                }}
                animate={{
                  scaleY: [0.9, 1.1, 0.9],
                  opacity: [effect.opacity * 0.8, effect.opacity, effect.opacity * 0.8],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Corrientes de agua */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  style={{
                    position: 'absolute',
                    width: size * 0.08,
                    height: size * 0.2,
                    background: `linear-gradient(to bottom, rgba(135, 206, 235, ${effect.opacity * 1.2}), rgba(70, 130, 180, ${effect.opacity * 0.9}))`,
                    borderRadius: '50%',
                    bottom: size * 0.1,
                    left: '50%',
                    opacity: effect.opacity,
                  }}
                  animate={{
                    x: [0, (Math.random() - 0.5) * size * 0.5],
                    y: [0, -size * 0.3, -size * 0.6],
                    scale: [0.8, 1.2, 0.5],
                    opacity: [effect.opacity, effect.opacity * 0.3, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>
          );
        }

      case 'darkness':
        if (effect.shape === 'circle') {
          // Versión circular: oscuridad concentrada en el centro
          return (
            <div style={{
              width: size,
              height: size,
              position: 'relative',
              borderRadius: '50%',
              overflow: 'hidden'
            }}>
              {/* Núcleo de oscuridad */}
              <motion.div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: size * 0.6,
                  height: size * 0.6,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, rgba(10, 10, 30, ${effect.opacity * 1.5}), rgba(5, 5, 15, ${effect.opacity * 1.2}), transparent)`,
                }}
                animate={{
                  scale: [0.8, 1.3, 0.8],
                  opacity: [effect.opacity * 0.7, effect.opacity, effect.opacity * 0.7],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Tentáculos de sombra radiales */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: size * 0.1,
                    height: size * 0.25,
                    background: `linear-gradient(to right, rgba(20, 20, 40, ${effect.opacity * 1.3}), transparent)`,
                    transformOrigin: '50% 0%',
                    transform: `translate(-50%, -100%) rotate(${i * 45}deg)`,
                    opacity: effect.opacity,
                  }}
                  animate={{
                    scaleY: [0.5, 1.2, 0.5],
                    opacity: [effect.opacity, effect.opacity * 0.3, effect.opacity],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          );
        } else {
          // Versión cuadrada: oscuridad expandiéndose
          return (
            <div style={{
              width: size,
              height: size,
              position: 'relative',
              borderRadius: '0',
              overflow: 'hidden'
            }}>
              {/* Oscuridad base cuadrada */}
              <motion.div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: size * 0.8,
                  height: size * 0.8,
                  background: `radial-gradient(circle, rgba(15, 15, 35, ${effect.opacity * 1.4}), rgba(5, 5, 20, ${effect.opacity * 0.9}), transparent)`,
                }}
                animate={{
                  scale: [0.9, 1.4, 0.9],
                  opacity: [effect.opacity * 0.8, effect.opacity, effect.opacity * 0.8],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Partículas de sombra flotando */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  style={{
                    position: 'absolute',
                    width: size * 0.08,
                    height: size * 0.08,
                    background: `rgba(25, 15, 45, ${effect.opacity * 1.3})`,
                    borderRadius: '50%',
                    top: '50%',
                    left: '50%',
                  }}
                  animate={{
                    x: Math.cos(i * Math.PI / 3) * size * 0.3,
                    y: Math.sin(i * Math.PI / 3) * size * 0.3,
                    scale: [0.5, 1.5, 0.5],
                    opacity: [effect.opacity, effect.opacity * 0.2, effect.opacity],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          );
        }

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
