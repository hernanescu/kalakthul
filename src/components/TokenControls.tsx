import { TokenEntry } from '../types';
import './TokenControls.css';

interface TokenControlsProps {
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

export default function TokenControls({
  selectedTokenId,
  selectedTokenName,
  selectedTokenOpacity,
  tokensInLibrary,
  onSelectToken,
  onDeleteToken,
  onDeleteAllTokens,
  onTokenNameChange,
  onTokenOpacityChange,
}: TokenControlsProps) {
  return (
    <div className="token-controls">
      <h3>🎴 Tokens</h3>

      <div className="token-library-section">
        <label>Seleccionar Token</label>
        <div className="token-selector">
          {tokensInLibrary.length === 0 ? (
            <p className="token-hint">No hay tokens en la librería. Carga tokens desde el header.</p>
          ) : (
            <div className="token-mini-grid">
              {tokensInLibrary.slice(0, 12).map(token => (
                <button
                  key={token.id}
                  className="token-mini-btn"
                  onClick={() => onSelectToken(token)}
                  title={token.name}
                >
                  <img src={token.thumbnail} alt={token.name} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedTokenId && (
        <div className="token-edit-section">
          <h4>Token Seleccionado</h4>

          <div className="control-group">
            <label>Nombre (opcional)</label>
            <input
              type="text"
              value={selectedTokenName || ''}
              onChange={(e) => onTokenNameChange(e.target.value)}
              placeholder="Nombre del token"
            />
          </div>

          <div className="control-group">
            <label>
              Opacidad: {selectedTokenOpacity !== undefined ? Math.round(selectedTokenOpacity * 100) : 100}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={selectedTokenOpacity ?? 1}
              onChange={(e) => onTokenOpacityChange(parseFloat(e.target.value))}
            />
          </div>

          <div className="token-actions">
            <button
              className="token-action-btn danger"
              onClick={onDeleteToken}
            >
              🗑️ Eliminar Token
            </button>
          </div>
        </div>
      )}

      <div className="token-actions">
        <button
          className="token-action-btn danger"
          onClick={onDeleteAllTokens}
          disabled={!selectedTokenId}
        >
          🗑️ Eliminar Todos los Tokens
        </button>
      </div>
    </div>
  );
}

