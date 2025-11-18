import { GridConfig } from '../types';
import './GridControls.css';

interface GridControlsProps {
  grid: GridConfig;
  onRowsChange: (rows: number) => void;
  onColumnsChange: (columns: number) => void;
  onOpacityChange: (opacity: number) => void;
  onColorChange: (color: string) => void;
  onToggleVisibility: () => void;
}

export default function GridControls({
  grid,
  onRowsChange,
  onColumnsChange,
  onOpacityChange,
  onColorChange,
  onToggleVisibility,
}: GridControlsProps) {
  return (
    <div className="grid-controls">
      <h3>Grilla</h3>
      
      <div className="control-group">
        <label>
          Filas:
          <input
            type="number"
            min="1"
            max="100"
            value={grid.rows}
            onChange={(e) => onRowsChange(parseInt(e.target.value) || 1)}
          />
        </label>
      </div>

      <div className="control-group">
        <label>
          Columnas:
          <input
            type="number"
            min="1"
            max="100"
            value={grid.columns}
            onChange={(e) => onColumnsChange(parseInt(e.target.value) || 1)}
          />
        </label>
      </div>

      <div className="control-group">
        <label>
          Opacidad: {Math.round(grid.opacity * 100)}%
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={grid.opacity}
            onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
          />
        </label>
      </div>

      <div className="control-group">
        <label>
          Color:
          <input
            type="color"
            value={grid.color}
            onChange={(e) => onColorChange(e.target.value)}
          />
        </label>
      </div>

      <div className="control-group">
        <button onClick={onToggleVisibility}>
          {grid.visible ? 'Ocultar' : 'Mostrar'} Grilla
        </button>
      </div>
    </div>
  );
}

