import { ZoomState } from '../types';
import './ZoomControls.css';

interface ZoomControlsProps {
  zoom: ZoomState;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  compact?: boolean; // Para modo presentación
}

export default function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  compact = false,
}: ZoomControlsProps) {
  const zoomPercent = Math.round(zoom.level * 100);

  if (compact) {
    return (
      <div className="zoom-controls compact">
        <button onClick={onZoomOut} className="zoom-btn" title="Alejar">
          −
        </button>
        <span className="zoom-level">{zoomPercent}%</span>
        <button onClick={onZoomIn} className="zoom-btn" title="Acercar">
          +
        </button>
        <button onClick={onZoomReset} className="zoom-reset-btn" title="Resetear zoom">
          ⌂
        </button>
      </div>
    );
  }

  return (
    <div className="zoom-controls">
      <h3>Zoom</h3>
      <div className="control-group">
        <div className="zoom-buttons">
          <button onClick={onZoomOut} className="zoom-btn">
            − Alejar
          </button>
          <span className="zoom-level">{zoomPercent}%</span>
          <button onClick={onZoomIn} className="zoom-btn">
            + Acercar
          </button>
        </div>
        <button onClick={onZoomReset} className="zoom-reset-btn">
          Resetear Zoom
        </button>
        <p className="hint">Rueda del mouse para zoom • Shift+Click para pan</p>
      </div>
    </div>
  );
}

