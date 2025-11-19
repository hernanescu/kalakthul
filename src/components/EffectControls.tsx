import { EffectType, EffectShape } from '../types';
import './EffectControls.css';

interface EffectControlsProps {
  selectedEffectType: EffectType | null;
  selectedShape?: EffectShape;
  onAddEffect: (type: EffectType) => void;
  onDeleteEffect: () => void;
  onDeleteAllEffects: () => void;
  onShapeChange: (shape: EffectShape) => void;
  onOpacityChange: (opacity: number) => void;
  selectedOpacity?: number;
}

const EFFECT_TYPES: { type: EffectType; label: string; emoji: string }[] = [
  { type: 'fire', label: 'Fuego', emoji: '🔥' },
  { type: 'ice', label: 'Hielo', emoji: '❄️' },
  { type: 'poison', label: 'Veneno', emoji: '☠️' },
  { type: 'lightning', label: 'Rayo', emoji: '⚡' },
  { type: 'magic', label: 'Magia', emoji: '✨' },
  { type: 'wind', label: 'Viento', emoji: '💨' },
  { type: 'water', label: 'Agua', emoji: '🌊' },
  { type: 'darkness', label: 'Oscuridad', emoji: '🌑' },
];

export default function EffectControls({
  selectedEffectType,
  selectedShape = 'circle',
  onAddEffect,
  onDeleteEffect,
  onDeleteAllEffects,
  onShapeChange,
  onOpacityChange,
  selectedOpacity = 0.8,
}: EffectControlsProps) {
  return (
    <div className="effect-controls">
      <h3>Efectos</h3>
      
      <div className="effect-types">
        {EFFECT_TYPES.map(({ type, label, emoji }) => (
          <button
            key={type}
            onClick={() => onAddEffect(type)}
            className={`effect-type-btn ${selectedEffectType === type ? 'selected' : ''}`}
            title={`Añadir efecto de ${label} (haz clic y arrastra en el mapa para definir el tamaño)`}
          >
            <span className="effect-emoji">{emoji}</span>
            <span className="effect-label">{label}</span>
          </button>
        ))}
      </div>

      {selectedEffectType ? (
        <>
          <div className="control-group">
            <label>
              Forma:
              <div className="shape-selector">
                <button
                  onClick={() => onShapeChange('circle')}
                  className={`shape-btn ${selectedShape === 'circle' ? 'active' : ''}`}
                  title="Forma redonda"
                >
                  ⭕
                </button>
                <button
                  onClick={() => onShapeChange('square')}
                  className={`shape-btn ${selectedShape === 'square' ? 'active' : ''}`}
                  title="Forma cuadrada"
                >
                  ⬜
                </button>
              </div>
            </label>
          </div>

          <div className="control-group">
            <label>
              Opacidad: {Math.round(selectedOpacity * 100)}%
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={selectedOpacity}
                onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
              />
            </label>
          </div>

          <div className="control-group">
            <button onClick={onDeleteEffect} className="delete-btn">
              Eliminar Efecto
            </button>
          </div>

          <div className="control-group">
            <button
              onClick={() => {
                if (window.confirm('¿Estás seguro de que quieres eliminar TODOS los efectos?')) {
                  onDeleteAllEffects();
                }
              }}
              className="delete-all-btn"
              title="Eliminar todos los efectos del mapa"
            >
              🗑️ Borrar Todos los Efectos
            </button>
          </div>
        </>
      ) : (
        <p className="hint">Selecciona un efecto en el mapa para editarlo, o elige un tipo de efecto y arrastra en el mapa para crear uno nuevo</p>
      )}
    </div>
  );
}

