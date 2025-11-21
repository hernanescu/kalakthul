import { useState, useCallback } from 'react';
import { ParticleLayerState, ParticleType } from '../types';

const DEFAULT_PARTICLE_STATE: ParticleLayerState = {
  isEnabled: false,
  particleType: null,
  intensity: 0.5,
  speed: 0.5,
};

export function useParticleLayer(initialState?: ParticleLayerState) {
  const [particleState, setParticleState] = useState<ParticleLayerState>(
    initialState || DEFAULT_PARTICLE_STATE
  );

  const toggleParticles = useCallback(() => {
    setParticleState(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
  }, []);

  const setParticleType = useCallback((type: ParticleType) => {
    setParticleState(prev => ({ ...prev, particleType: type }));
  }, []);

  const setIntensity = useCallback((intensity: number) => {
    setParticleState(prev => ({
      ...prev,
      intensity: Math.max(0, Math.min(1, intensity)),
    }));
  }, []);

  const setSpeed = useCallback((speed: number) => {
    setParticleState(prev => ({
      ...prev,
      speed: Math.max(0, Math.min(1, speed)),
    }));
  }, []);

  const resetParticles = useCallback(() => {
    setParticleState(DEFAULT_PARTICLE_STATE);
  }, []);

  return {
    particleState,
    toggleParticles,
    setParticleType,
    setIntensity,
    setSpeed,
    resetParticles,
  };
}

