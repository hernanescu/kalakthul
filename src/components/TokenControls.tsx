import { Token } from '../types';
import './TokenControls.css';

interface TokenControlsProps {
  selectedToken: Token | null;
  onColorChange: (color: string) => void;
  onSizeChange: (size: number) => void;
  onDelete: () => void;
  onAddToken: () => void;
}

export default function TokenControls({
  selectedToken,
  onColorChange,
  onSizeChange,
  onDelete,
  onAddToken,
}: TokenControlsProps) {
  return (
    <div className="token-controls">
      <h3>Tokens</h3>
      
      <div className="control-group">
        <button onClick={onAddToken} className="add-token-btn">
          + Añadir Token
        </button>
      </div>

      {selectedToken && (
        <>
          <div className="control-group">
            <label>
              Color:
              <input
                type="color"
                value={selectedToken.color}
                onChange={(e) => onColorChange(e.target.value)}
              />
            </label>
          </div>

          <div className="control-group">
            <label>
              Tamaño:
              <select
                value={selectedToken.size}
                onChange={(e) => onSizeChange(parseInt(e.target.value))}
              >
                <option value={1}>1x1</option>
                <option value={2}>2x2</option>
                <option value={3}>3x3</option>
              </select>
            </label>
          </div>

          <div className="control-group">
            <button onClick={onDelete} className="delete-btn">
              Eliminar Token
            </button>
          </div>
        </>
      )}

      {!selectedToken && (
        <p className="hint">Selecciona un token para editarlo</p>
      )}
    </div>
  );
}

