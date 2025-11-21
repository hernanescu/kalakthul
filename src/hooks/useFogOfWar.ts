import { useState, useCallback } from 'react';
import { FogOfWarState, Polygon, FogTool } from '../types';

const DEFAULT_FOG_STATE: FogOfWarState = {
  isEnabled: false,
  darknessAreas: [],
};

export function useFogOfWar(initialState?: FogOfWarState) {
  const [fogState, setFogState] = useState<FogOfWarState>(initialState || DEFAULT_FOG_STATE);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTool, setSelectedTool] = useState<FogTool>(null);
  const [currentPolygon, setCurrentPolygon] = useState<{ x: number; y: number }[]>([]);
  const [selectedDarknessAreaId, setSelectedDarknessAreaId] = useState<string | null>(null);

  const toggleFog = useCallback(() => {
    setFogState(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
  }, []);

  const enterEditMode = useCallback(() => {
    setIsEditMode(true);
    setSelectedTool(null);
    setCurrentPolygon([]);
    setSelectedDarknessAreaId(null);
  }, []);

  const exitEditMode = useCallback(() => {
    setIsEditMode(false);
    setSelectedTool(null);
    setCurrentPolygon([]);
    setSelectedDarknessAreaId(null);
  }, []);

  const selectTool = useCallback((tool: FogTool) => {
    setSelectedTool(tool);
    setCurrentPolygon([]);
    // Si cambiamos de herramienta, deseleccionar zona
    if (tool !== 'select') {
      setSelectedDarknessAreaId(null);
    }
  }, []);

  const addPolygonPoint = useCallback((x: number, y: number) => {
    setCurrentPolygon(prev => [...prev, { x, y }]);
  }, []);

  const finishPolygon = useCallback(() => {
    if (currentPolygon.length < 3) {
      // No crear polígonos con menos de 3 puntos
      setCurrentPolygon([]);
      return;
    }

    const newPolygon: Polygon = {
      id: `fog-${Date.now()}-${Math.random()}`,
      points: [...currentPolygon],
    };

    setFogState(prev => ({
      ...prev,
      darknessAreas: [...prev.darknessAreas, newPolygon],
    }));

    setCurrentPolygon([]);
  }, [currentPolygon]);

  const deletePolygon = useCallback((polygonId: string) => {
    setFogState(prev => ({
      ...prev,
      darknessAreas: prev.darknessAreas.filter(p => p.id !== polygonId),
    }));
    // Si eliminamos la zona seleccionada, limpiar selección
    if (selectedDarknessAreaId === polygonId) {
      setSelectedDarknessAreaId(null);
    }
  }, [selectedDarknessAreaId]);

  const clearAllFog = useCallback(() => {
    setFogState(DEFAULT_FOG_STATE);
  }, []);

  const resetFog = useCallback(() => {
    setFogState(prev => ({
      ...prev,
      darknessAreas: [],
    }));
  }, []);

  const resetAllFog = useCallback(() => {
    setFogState(DEFAULT_FOG_STATE);
    setIsEditMode(false);
    setSelectedTool(null);
    setCurrentPolygon([]);
    setSelectedDarknessAreaId(null);
  }, []);

  const selectDarknessArea = useCallback((polygonId: string | null) => {
    setSelectedDarknessAreaId(polygonId);
  }, []);

  return {
    fogState,
    isEditMode,
    selectedTool,
    currentPolygon,
    selectedDarknessAreaId,
    toggleFog,
    enterEditMode,
    exitEditMode,
    selectTool,
    addPolygonPoint,
    finishPolygon,
    deletePolygon,
    clearAllFog,
    resetFog,
    resetAllFog,
    selectDarknessArea,
  };
}
