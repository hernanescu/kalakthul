import { ParticleType } from '../types';
import './ParticleControls.css';

interface ParticleControlsProps {
  isEnabled: boolean;
  particleType: ParticleType;
  intensity: number;
  speed: number;
  onToggle: () => void;
  onTypeChange: (type: ParticleType) => void;
  onIntensityChange: (intensity: number) => void;
  onSpeedChange: (speed: number) => void;
}

export default function ParticleControls({
  isEnabled,
  particleType,
  intensity,
  speed,
  onToggle,
  onTypeChange,
  onIntensityChange,
  onSpeedChange,
}: ParticleControlsProps) {
  const particleTypes: { type: ParticleType; label: string; emoji: string }[] = [
    { type: 'sand', label: 'Arena', emoji: '🏜️' },
    { type: 'leaves', label: 'Hojas', emoji: '🍂' },
    { type: 'greenLeaves', label: 'Hojas Verdes', emoji: '🍃' },
    { type: 'wind', label: 'Viento', emoji: '💨' },
    { type: 'snow', label: 'Nieve', emoji: '❄️' },
    { type: 'dust', label: 'Polvo', emoji: '🌫️' },
    { type: 'sparks', label: 'Chispas', emoji: '✨' },
  ];

  return (
    <div className="particle-controls">
      <h3>🌬️ Partículas Ambientales</h3>

      <div className="particle-toggle">
        <input
          type="checkbox"
          id="particle-toggle"
          checked={isEnabled}
          onChange={onToggle}
        />
        <label htmlFor="particle-toggle">Activar Partículas</label>
      </div>

      {isEnabled && (
        <div className="particle-settings">
          <div className="control-group">
            <label>Tipo de Partícula</label>
            <div className="particle-type-selector">
              {particleTypes.map(({ type, label, emoji }) => (
                <button
                  key={type}
                  onClick={() => onTypeChange(type)}
                  className={`particle-type-btn ${particleType === type ? 'active' : ''}`}
                  title={label}
                >
                  {emoji} {label}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <label>
              Intensidad: {Math.round(intensity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={intensity}
              onChange={(e) => onIntensityChange(parseFloat(e.target.value))}
            />
          </div>

          <div className="control-group">
            <label>
              Velocidad: {Math.round(speed * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={speed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            />
          </div>
        </div>
      )}

      {!isEnabled && (
        <p className="particle-hint">
          Activa las partículas para añadir efectos atmosféricos al mapa.
        </p>
      )}
    </div>
  );
}

