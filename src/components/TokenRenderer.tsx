import { Token, ZoomState, ImageBounds } from '../types';
import './TokenRenderer.css';

interface TokenRendererProps {
  token: Token;
  tokenImage: string; // Imagen base64 del token
  imageBounds: ImageBounds | null;
  canvasWidth: number;
  canvasHeight: number;
  zoom: ZoomState;
  isSelected: boolean;
  isPendingMode?: boolean; // Si hay un token pendiente para agregar
  onTokenClick?: (tokenId: string) => void;
  onTokenDragStart?: (tokenId: string, offsetX: number, offsetY: number) => void;
}

export default function TokenRenderer({
  token,
  tokenImage,
  imageBounds,
  canvasWidth,
  canvasHeight,
  zoom,
  isSelected,
  isPendingMode = false,
  onTokenClick,
  onTokenDragStart,
}: TokenRendererProps) {
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Si hay un token pendiente, permitir que el click pase al canvas
    if (isPendingMode) {
      return;
    }

    e.stopPropagation(); // Evitar que el canvas capture el evento
    e.preventDefault(); // Prevenir comportamiento por defecto
    if (e.button === 2 || (e.button === 0 && e.shiftKey)) {
      return; // Ignorar botón derecho y shift+click (para pan)
    }

    if (onTokenClick) {
      onTokenClick(token.id);
    }

    if (onTokenDragStart) {
      const rect = e.currentTarget.getBoundingClientRect();
      const offsetX = (e.clientX - rect.left - rect.width / 2) / zoom.level;
      const offsetY = (e.clientY - rect.top - rect.height / 2) / zoom.level;
      onTokenDragStart(token.id, offsetX, offsetY);
    }
  };
  // Calcular posición y tamaño en pantalla
  const scaledWidth = token.width * zoom.level;
  const scaledHeight = token.height * zoom.level;
  const screenX = token.x * zoom.level + zoom.panX;
  const screenY = token.y * zoom.level + zoom.panY;

  // No renderizar si está fuera del viewport
  if (
    screenX + scaledWidth / 2 < 0 ||
    screenX - scaledWidth / 2 > canvasWidth ||
    screenY + scaledHeight / 2 < 0 ||
    screenY - scaledHeight / 2 > canvasHeight
  ) {
    return null;
  }

  return (
    <div
      className={`token-renderer ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'absolute',
        left: `${screenX - scaledWidth / 2}px`,
        top: `${screenY - scaledHeight / 2}px`,
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
        opacity: token.opacity,
        transform: 'translateZ(0)', // Aceleración de hardware
        pointerEvents: isPendingMode ? 'none' : 'auto', // Permitir clicks al canvas cuando hay token pendiente
      }}
      onMouseDown={handleMouseDown}
    >
      <img
        src={tokenImage}
        alt={token.name || 'Token'}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
        draggable={false}
      />
      {token.name && (
        <div className="token-name-label">
          {token.name}
        </div>
      )}
    </div>
  );
}

