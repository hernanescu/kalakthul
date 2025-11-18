import { useState, useCallback } from 'react';
import { Token } from '../types';

const COLORS = [
  '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
  '#ff8800', '#8800ff', '#00ff88', '#ff0088', '#8888ff', '#ff8888',
];

export function useTokens(initialTokens: Token[] = []) {
  const [tokens, setTokens] = useState<Token[]>(initialTokens);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);

  const addToken = useCallback((x: number, y: number, gridX: number, gridY: number) => {
    const newToken: Token = {
      id: `token-${Date.now()}-${Math.random()}`,
      x,
      y,
      gridX,
      gridY,
      color: COLORS[tokens.length % COLORS.length],
      size: 1,
    };
    setTokens((prev) => [...prev, newToken]);
    setSelectedTokenId(newToken.id);
    return newToken.id;
  }, [tokens.length]);

  const updateToken = useCallback((id: string, updates: Partial<Token>) => {
    setTokens((prev) =>
      prev.map((token) => (token.id === id ? { ...token, ...updates } : token))
    );
  }, []);

  const deleteToken = useCallback((id: string) => {
    setTokens((prev) => prev.filter((token) => token.id !== id));
    if (selectedTokenId === id) {
      setSelectedTokenId(null);
    }
  }, [selectedTokenId]);

  const selectToken = useCallback((id: string | null) => {
    setSelectedTokenId(id);
  }, []);

  const moveToken = useCallback((
    id: string,
    x: number,
    y: number,
    gridX: number,
    gridY: number
  ) => {
    updateToken(id, { x, y, gridX, gridY });
  }, [updateToken]);

  const setTokenColor = useCallback((id: string, color: string) => {
    updateToken(id, { color });
  }, [updateToken]);

  const setTokenSize = useCallback((id: string, size: number) => {
    updateToken(id, { size: Math.max(1, Math.min(3, size)) });
  }, [updateToken]);

  return {
    tokens,
    selectedTokenId,
    addToken,
    updateToken,
    deleteToken,
    selectToken,
    moveToken,
    setTokenColor,
    setTokenSize,
  };
}

