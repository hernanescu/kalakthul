import { FogTool } from '../types';
import './FogControls.css';

interface FogControlsProps {
  isEnabled: boolean;
  isEditMode: boolean;
  selectedTool: FogTool;
  darknessAreasCount: number;
  onToggleFog: () => void;
  onEnterEditMode: () => void;
  onExitEditMode: () => void;
  onSelectTool: (tool: FogTool) => void;
  onResetFog: () => void;
  onClearAllFog: () => void;
}

export default function FogControls({
  isEnabled,
  isEditMode,
  selectedTool,
  darknessAreasCount,
  onToggleFog,
  onEnterEditMode,
  onExitEditMode,
  onSelectTool,
  onResetFog,
  onClearAllFog,
}: FogControlsProps) {
  return (
    <div className="fog-controls">
      <h3>🌑 Zonas de Oscuridad</h3>

      <div className="fog-toggle">
        <input
          type="checkbox"
          id="fog-toggle"
          checked={isEnabled}
          onChange={onToggleFog}
        />
        <label htmlFor="fog-toggle">Activar Zonas de Oscuridad</label>
      </div>

      {isEnabled && (
        <div className="fog-edit-section">
          <h4>Modo Edición</h4>

          {!isEditMode ? (
            <button
              onClick={onEnterEditMode}
              className="fog-action-btn"
              style={{ marginBottom: '15px' }}
            >
              ✏️ Editar Zonas
            </button>
          ) : (
            <>
              <button
                onClick={onExitEditMode}
                className="fog-action-btn"
                style={{ marginBottom: '15px' }}
              >
                ✅ Terminar Edición
              </button>

              <div className="fog-tools">
                <button
                  onClick={() => onSelectTool('darkness')}
                  className={`fog-tool-btn ${selectedTool === 'darkness' ? 'active' : ''}`}
                  title="Añadir Oscuridad - Haz clic en puntos del mapa para crear un área oscura"
                  style={{ width: '100%' }}
                >
                  🌑 Añadir Oscuridad
                </button>
              </div>

              {selectedTool === 'darkness' && (
                <div className="fog-hint">
                  <strong>Instrucciones:</strong>
                  Haz clic en varios puntos del mapa para delinear el área que quieres oscurecer. Doble clic o presiona Enter para finalizar.
                </div>
              )}
            </>
          )}

          <div className="fog-stats">
            <div>Zonas oscuras: {darknessAreasCount}</div>
          </div>

          <div className="fog-actions">
            <button
              onClick={() => {
                if (window.confirm('¿Estás seguro de que quieres eliminar todas las zonas oscuras?')) {
                  onResetFog();
                }
              }}
              className="fog-action-btn danger"
              title="Eliminar todas las zonas oscuras, pero mantener la funcionalidad activada"
            >
              🔄 Eliminar Todas las Zonas
            </button>

            <button
              onClick={() => {
                if (window.confirm('¿Estás seguro de que quieres desactivar completamente las zonas de oscuridad?')) {
                  onClearAllFog();
                }
              }}
              className="fog-action-btn danger"
              title="Desactivar zonas de oscuridad y eliminar todo el estado"
            >
              🚫 Desactivar
            </button>
          </div>
        </div>
      )}

      {!isEnabled && (
        <p style={{ color: '#666', fontSize: '0.9em', margin: '10px 0' }}>
          Activa las zonas de oscuridad para ocultar áreas específicas del mapa.
        </p>
      )}
    </div>
  );
}
