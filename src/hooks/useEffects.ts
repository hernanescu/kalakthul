import { useState, useCallback } from 'react';
import { Effect, EffectType, EffectShape } from '../types';

const DEFAULT_OPACITY = 0.8;
const DEFAULT_SIZE = 50; // Tamaño por defecto en píxeles

export function useEffects(initialEffects: Effect[] = []) {
  const [effects, setEffects] = useState<Effect[]>(initialEffects);
  const [selectedEffectId, setSelectedEffectId] = useState<string | null>(null);

  const addEffect = useCallback((
    type: EffectType,
    x: number,
    y: number,
    width: number,
    height: number,
    shape: EffectShape,
    gridX: number,
    gridY: number,
    animationUrl?: string
  ) => {
    const newEffect: Effect = {
      id: `effect-${Date.now()}-${Math.random()}`,
      type,
      x,
      y,
      gridX,
      gridY,
      width,
      height,
      shape,
      opacity: DEFAULT_OPACITY,
      animationUrl,
    };
    setEffects((prev) => [...prev, newEffect]);
    setSelectedEffectId(newEffect.id);
    return newEffect.id;
  }, []);

  const updateEffect = useCallback((id: string, updates: Partial<Effect>) => {
    setEffects((prev) =>
      prev.map((effect) => (effect.id === id ? { ...effect, ...updates } : effect))
    );
  }, []);

  const deleteEffect = useCallback((id: string) => {
    setEffects((prev) => prev.filter((effect) => effect.id !== id));
    if (selectedEffectId === id) {
      setSelectedEffectId(null);
    }
  }, [selectedEffectId]);

  const selectEffect = useCallback((id: string | null) => {
    setSelectedEffectId(id);
  }, []);

  const moveEffect = useCallback((
    id: string,
    x: number,
    y: number,
    gridX: number,
    gridY: number
  ) => {
    updateEffect(id, { x, y, gridX, gridY });
  }, [updateEffect]);

  const resizeEffect = useCallback((
    id: string,
    width: number,
    height: number
  ) => {
    updateEffect(id, { width: Math.max(20, width), height: Math.max(20, height) });
  }, [updateEffect]);

  const setEffectShape = useCallback((id: string, shape: EffectShape) => {
    updateEffect(id, { shape });
  }, [updateEffect]);

  const setEffectOpacity = useCallback((id: string, opacity: number) => {
    updateEffect(id, { opacity: Math.max(0, Math.min(1, opacity)) });
  }, [updateEffect]);

  return {
    effects,
    selectedEffectId,
    addEffect,
    updateEffect,
    deleteEffect,
    selectEffect,
    moveEffect,
    resizeEffect,
    setEffectShape,
    setEffectOpacity,
  };
}

