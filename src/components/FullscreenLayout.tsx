import { useState } from 'react';
import { useFullscreen } from '../hooks/useFullscreen';
import { SidePanel } from './SidePanel';
import { GridConfig, EffectType, FogTool, ParticleType, TokenEntry } from '../types';
import './FullscreenLayout.css';

interface FullscreenLayoutProps {
  children: React.ReactNode;

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

export function FullscreenLayout({
  children,
  ...sidePanelProps
}: FullscreenLayoutProps) {
  const isFullscreen = useFullscreen();
  const [isPanelVisible, setPanelVisible] = useState(false);

  if (!isFullscreen) {
    // En modo normal, mostrar solo el contenido sin panel lateral
    return (
      <div className="layout-normal">
        <main className="content-full">{children}</main>
      </div>
    );
  }

  // Lógica para modo pantalla completa
  return (
    <div className="fullscreen-layout">
      <div
        className="hover-trigger-zone"
        onMouseEnter={() => setPanelVisible(true)}
      />
      <div
        className={`fullscreen-panel ${isPanelVisible ? 'visible' : ''}`}
        onMouseLeave={() => setPanelVisible(false)}
      >
        <SidePanel {...sidePanelProps} />
      </div>
      <main className="fullscreen-content">{children}</main>
    </div>
  );
}
