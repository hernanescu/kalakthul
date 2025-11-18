import { useState, useCallback } from 'react';
import { GridConfig } from '../types';

const DEFAULT_GRID: GridConfig = {
  rows: 10,
  columns: 10,
  opacity: 0.5,
  color: '#ffffff',
  visible: true,
};

export function useGrid(initialGrid?: GridConfig) {
  const [grid, setGrid] = useState<GridConfig>(initialGrid || DEFAULT_GRID);

  const updateGrid = useCallback((updates: Partial<GridConfig>) => {
    setGrid((prev) => ({ ...prev, ...updates }));
  }, []);

  const setRows = useCallback((rows: number) => {
    setGrid((prev) => ({ ...prev, rows: Math.max(1, rows) }));
  }, []);

  const setColumns = useCallback((columns: number) => {
    setGrid((prev) => ({ ...prev, columns: Math.max(1, columns) }));
  }, []);

  const setOpacity = useCallback((opacity: number) => {
    setGrid((prev) => ({ ...prev, opacity: Math.max(0, Math.min(1, opacity)) }));
  }, []);

  const setColor = useCallback((color: string) => {
    setGrid((prev) => ({ ...prev, color }));
  }, []);

  const toggleVisibility = useCallback(() => {
    setGrid((prev) => ({ ...prev, visible: !prev.visible }));
  }, []);

  return {
    grid,
    updateGrid,
    setRows,
    setColumns,
    setOpacity,
    setColor,
    toggleVisibility,
  };
}

