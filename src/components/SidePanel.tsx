import GridControls from './GridControls';
import EffectControls from './EffectControls';
import FogControls from './FogControls';
import ParticleControls from './ParticleControls';
import TokenControls from './TokenControls';
import ZoomControls from './ZoomControls';
import CollapsibleSection from './CollapsibleSection';
import { GridConfig, EffectType, FogTool, ParticleType, TokenEntry } from '../types';
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
  fogSelectedDarknessAreaId: string | null;
  onToggleFog: () => void;
  onEnterEditMode: () => void;
  onExitEditMode: () => void;
  onSelectTool: (tool: FogTool) => void;
  onResetFog: () => void;
  onClearAllFog: () => void;
  onDeleteSelectedDarknessArea: () => void;

  // Zoom props
  zoom: { level: number; panX: number; panY: number };
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;

  // Particle props
  particleIsEnabled: boolean;
  particleType: ParticleType;
  particleIntensity: number;
  particleSpeed: number;
  onToggleParticles: () => void;
  onParticleTypeChange: (type: ParticleType) => void;
  onParticleIntensityChange: (intensity: number) => void;
  onParticleSpeedChange: (speed: number) => void;

  // Token props
  selectedTokenId: string | null;
  selectedTokenName?: string;
  selectedTokenOpacity?: number;
  tokensInLibrary: TokenEntry[];
  onSelectToken: (tokenEntry: TokenEntry) => void;
  onDeleteToken: () => void;
  onDeleteAllTokens: () => void;
  onTokenNameChange: (name: string) => void;
  onTokenOpacityChange: (opacity: number) => void;
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
  fogSelectedDarknessAreaId,
  onToggleFog,
  onEnterEditMode,
  onExitEditMode,
  onSelectTool,
  onResetFog,
  onClearAllFog,
  onDeleteSelectedDarknessArea,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  particleIsEnabled,
  particleType,
  particleIntensity,
  particleSpeed,
  onToggleParticles,
  onParticleTypeChange,
  onParticleIntensityChange,
  onParticleSpeedChange,
  selectedTokenId,
  selectedTokenName,
  selectedTokenOpacity,
  tokensInLibrary,
  onSelectToken,
  onDeleteToken,
  onDeleteAllTokens,
  onTokenNameChange,
  onTokenOpacityChange,
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
          selectedDarknessAreaId={fogSelectedDarknessAreaId}
          onToggleFog={onToggleFog}
          onEnterEditMode={onEnterEditMode}
          onExitEditMode={onExitEditMode}
          onSelectTool={onSelectTool}
          onResetFog={onResetFog}
          onClearAllFog={onClearAllFog}
          onDeleteSelectedDarknessArea={onDeleteSelectedDarknessArea}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Partículas Ambientales" defaultExpanded={false}>
        <ParticleControls
          isEnabled={particleIsEnabled}
          particleType={particleType}
          intensity={particleIntensity}
          speed={particleSpeed}
          onToggle={onToggleParticles}
          onTypeChange={onParticleTypeChange}
          onIntensityChange={onParticleIntensityChange}
          onSpeedChange={onParticleSpeedChange}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Tokens" defaultExpanded={false}>
        <TokenControls
          selectedTokenId={selectedTokenId}
          selectedTokenName={selectedTokenName}
          selectedTokenOpacity={selectedTokenOpacity}
          tokensInLibrary={tokensInLibrary}
          onSelectToken={onSelectToken}
          onDeleteToken={onDeleteToken}
          onDeleteAllTokens={onDeleteAllTokens}
          onTokenNameChange={onTokenNameChange}
          onTokenOpacityChange={onTokenOpacityChange}
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
