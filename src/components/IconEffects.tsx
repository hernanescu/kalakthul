import React from 'react';
import { motion } from 'framer-motion';
import { FireIcon, SparklesIcon, BoltIcon } from '@heroicons/react/24/solid';
import { Flame, Zap, Snowflake, Skull, Wind, Droplets } from 'lucide-react';
import { ClipLoader, PulseLoader } from 'react-spinners';

interface IconEffectProps {
  size?: number;
  opacity?: number;
}

// 🔥 Efecto de Fuego con Heroicons
export const HeroFireEffect: React.FC<IconEffectProps> = ({ size = 48, opacity = 1 }) => (
  <motion.div
    animate={{
      scale: [1, 1.2, 1],
      rotate: [0, 5, -5, 0],
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    style={{ opacity }}
  >
    <FireIcon style={{ width: size, height: size, color: '#ff4500' }} />
  </motion.div>
);

// ❄️ Efecto de Hielo con Lucide
export const LucideIceEffect: React.FC<IconEffectProps> = ({ size = 48, opacity = 1 }) => (
  <motion.div
    animate={{
      rotate: 360,
      scale: [1, 1.1, 1],
    }}
    transition={{
      rotate: { duration: 6, repeat: Infinity, ease: "linear" },
      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    }}
    style={{ opacity }}
  >
    <Snowflake size={size} color="#87ceeb" />
  </motion.div>
);

// ⚡ Efecto de Rayo con Heroicons
export const HeroLightningEffect: React.FC<IconEffectProps> = ({ size = 48, opacity = 1 }) => (
  <motion.div
    animate={{
      scale: [1, 1.3, 1],
      opacity: [opacity, opacity * 0.7, opacity],
    }}
    transition={{
      duration: 0.8,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    style={{ opacity }}
  >
    <BoltIcon style={{ width: size, height: size, color: '#ffff00' }} />
  </motion.div>
);

// ✨ Efecto Mágico con Heroicons
export const HeroMagicEffect: React.FC<IconEffectProps> = ({ size = 48, opacity = 1 }) => (
  <motion.div
    animate={{
      rotate: [0, 180, 360],
      scale: [1, 1.2, 1],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    style={{ opacity }}
  >
    <SparklesIcon style={{ width: size, height: size, color: '#dda0dd' }} />
  </motion.div>
);

// 💀 Efecto de Veneno con Lucide
export const LucidePoisonEffect: React.FC<IconEffectProps> = ({ size = 48, opacity = 1 }) => (
  <motion.div
    animate={{
      scale: [1, 1.1, 1],
      y: [0, -3, 0],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    style={{ opacity }}
  >
    <Skull size={size} color="#32cd32" />
  </motion.div>
);

// 💨 Efecto de Viento con Lucide
export const LucideWindEffect: React.FC<IconEffectProps> = ({ size = 48, opacity = 1 }) => (
  <motion.div
    animate={{
      x: [0, 10, 0],
      rotate: [0, 5, -5, 0],
    }}
    transition={{
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    style={{ opacity }}
  >
    <Wind size={size} color="#87ceeb" />
  </motion.div>
);

// 🌊 Efecto de Agua con Lucide
export const LucideWaterEffect: React.FC<IconEffectProps> = ({ size = 48, opacity = 1 }) => (
  <motion.div
    animate={{
      scale: [1, 1.05, 1],
      y: [0, -2, 0],
    }}
    transition={{
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    style={{ opacity }}
  >
    <Droplets size={size} color="#4682b4" />
  </motion.div>
);

// 🔥 Efecto de Fuego Alternativo con Lucide
export const LucideFlameEffect: React.FC<IconEffectProps> = ({ size = 48, opacity = 1 }) => (
  <motion.div
    animate={{
      scale: [1, 1.3, 1],
      rotate: [0, 10, -10, 0],
    }}
    transition={{
      duration: 1.2,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    style={{ opacity }}
  >
    <Flame size={size} color="#ff6347" />
  </motion.div>
);

// ⚡ Efecto de Rayo Alternativo con Lucide
export const LucideZapEffect: React.FC<IconEffectProps> = ({ size = 48, opacity = 1 }) => (
  <motion.div
    animate={{
      scale: [1, 1.4, 1],
      opacity: [opacity, opacity * 0.6, opacity],
    }}
    transition={{
      duration: 0.6,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    style={{ opacity }}
  >
    <Zap size={size} color="#ffd700" />
  </motion.div>
);

// 🎯 Spinner Mágico (para efectos de carga/transformación)
export const MagicSpinnerEffect: React.FC<IconEffectProps> = ({ size = 48, opacity = 1 }) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    style={{ opacity }}
  >
    <ClipLoader size={size} color="#dda0dd" />
  </motion.div>
);

// 💫 Pulso Mágico
export const MagicPulseEffect: React.FC<IconEffectProps> = ({ size = 48, opacity = 1 }) => (
  <motion.div
    animate={{
      scale: [1, 1.5, 1],
      opacity: [opacity, 0, opacity],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    style={{ opacity }}
  >
    <PulseLoader size={size / 3} color="#ff69b4" />
  </motion.div>
);

// 📋 Mapa de efectos disponibles
export const EFFECT_ICONS = {
  fire: HeroFireEffect,
  ice: LucideIceEffect,
  lightning: HeroLightningEffect,
  magic: HeroMagicEffect,
  poison: LucidePoisonEffect,
  wind: LucideWindEffect,
  water: LucideWaterEffect,
  flame: LucideFlameEffect,
  zap: LucideZapEffect,
  spinner: MagicSpinnerEffect,
  pulse: MagicPulseEffect,
} as const;

export type EffectIconType = keyof typeof EFFECT_ICONS;

// 🎯 Componente principal para usar cualquier efecto
interface EffectIconProps {
  type: EffectIconType;
  size?: number;
  opacity?: number;
}

export const EffectIcon: React.FC<EffectIconProps> = ({ type, size = 48, opacity = 1 }) => {
  const IconComponent = EFFECT_ICONS[type];
  return <IconComponent size={size} opacity={opacity} />;
};

// 📖 Lista de todos los efectos disponibles
export const AVAILABLE_EFFECTS: EffectIconType[] = Object.keys(EFFECT_ICONS) as EffectIconType[];
