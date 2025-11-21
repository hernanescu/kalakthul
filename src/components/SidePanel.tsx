import GridControls from './GridControls';
import EffectControls from './EffectControls';
import FogControls from './FogControls';
import ZoomControls from './ZoomControls';
import CollapsibleSection from './CollapsibleSection';
import { GridConfig, EffectType, FogTool } from '../types';
import './SidePanel.css';

interface SidePanelProps {
  // Grid props
  grid: GridConfig;
  onRowsChange: (rows: number) => void;
  onColumnsChange: (columns: number) => void;
  onOpacityChange: (opacity: number) => void;
  onColorChange: (color: string) => void;
  onToggleVisibility: () => void;

  // Effect props
  selectedEffectType: EffectType | null;
  selectedShape: 'square' | 'circle';
  selectedOpacity?: number;
  onAddEffect: (type: EffectType) => void;
  onDeleteEffect: () => void;
  onDeleteAllEffects: () => void;
  onShapeChange: (shape: 'square' | 'circle') => void;
  onEffectOpacityChange: (opacity: number) => void;

  // Fog props
  fogIsEnabled: boolean;
  fogIsEditMode: boolean;
  fogSelectedTool: FogTool;
  fogDarknessAreasCount: number;
  onToggleFog: () => void;
  onEnterEditMode: () => void;
  onExitEditMode: () => void;
  onSelectTool: (tool: FogTool) => void;
  onResetFog: () => void;
  onClearAllFog: () => void;

  // Zoom props
  zoom: { level: number; panX: number; panY: number };
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export function SidePanel({
  grid,
  onRowsChange,
  onColumnsChange,
  onOpacityChange,
  onColorChange,
  onToggleVisibility,
  selectedEffectType,
  selectedShape,
  selectedOpacity,
  onAddEffect,
  onDeleteEffect,
  onDeleteAllEffects,
  onShapeChange,
  onEffectOpacityChange,
  fogIsEnabled,
  fogIsEditMode,
  fogSelectedTool,
  fogDarknessAreasCount,
  onToggleFog,
  onEnterEditMode,
  onExitEditMode,
  onSelectTool,
  onResetFog,
  onClearAllFog,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}: SidePanelProps) {
  return (
    <div className="side-panel">
      <CollapsibleSection title="Grilla" defaultExpanded={false}>
        <GridControls
          grid={grid}
          onRowsChange={onRowsChange}
          onColumnsChange={onColumnsChange}
          onOpacityChange={onOpacityChange}
          onColorChange={onColorChange}
          onToggleVisibility={onToggleVisibility}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Efectos" defaultExpanded={false}>
        <EffectControls
          selectedEffectType={selectedEffectType}
          selectedShape={selectedShape}
          onAddEffect={onAddEffect}
          onDeleteEffect={onDeleteEffect}
          onDeleteAllEffects={onDeleteAllEffects}
          onShapeChange={onShapeChange}
          onOpacityChange={onEffectOpacityChange}
          selectedOpacity={selectedOpacity}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Zonas de Oscuridad" defaultExpanded={false}>
        <FogControls
          isEnabled={fogIsEnabled}
          isEditMode={fogIsEditMode}
          selectedTool={fogSelectedTool}
          darknessAreasCount={fogDarknessAreasCount}
          onToggleFog={onToggleFog}
          onEnterEditMode={onEnterEditMode}
          onExitEditMode={onExitEditMode}
          onSelectTool={onSelectTool}
          onResetFog={onResetFog}
          onClearAllFog={onClearAllFog}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Zoom" defaultExpanded={false}>
        <ZoomControls
          zoom={zoom}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onZoomReset={onZoomReset}
        />
      </CollapsibleSection>
    </div>
  );
}
