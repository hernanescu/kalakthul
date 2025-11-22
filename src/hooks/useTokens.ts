import { useState, useCallback } from 'react';
import { Token } from '../types';

const DEFAULT_OPACITY = 1.0;
const DEFAULT_SIZE = 50; // Tamaño por defecto en píxeles

export function useTokens(initialTokens: Token[] = []) {
  const [tokens, setTokens] = useState<Token[]>(initialTokens);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);

  const addToken = useCallback((
    tokenEntryId: string,
    x: number,
    y: number,
    width: number,
    height: number,
    gridX: number,
    gridY: number,
    name?: string
  ) => {
    const newToken: Token = {
      id: `token-${Date.now()}-${Math.random()}`,
      tokenEntryId,
      x,
      y,
      gridX,
      gridY,
      width: Math.max(20, width),
      height: Math.max(20, height),
      name,
      opacity: DEFAULT_OPACITY,
    };
    setTokens((prev) => [...prev, newToken]);
    setSelectedTokenId(newToken.id);
    return newToken.id;
  }, []);

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

  const resizeToken = useCallback((
    id: string,
    width: number,
    height: number
  ) => {
    updateToken(id, { width: Math.max(20, width), height: Math.max(20, height) });
  }, [updateToken]);

  const setTokenName = useCallback((id: string, name: string | undefined) => {
    updateToken(id, { name });
  }, [updateToken]);

  const setTokenOpacity = useCallback((id: string, opacity: number) => {
    updateToken(id, { opacity: Math.max(0, Math.min(1, opacity)) });
  }, [updateToken]);

  const deleteAllTokens = useCallback(() => {
    setTokens([]);
    setSelectedTokenId(null);
  }, []);

  return {
    tokens,
    selectedTokenId,
    addToken,
    updateToken,
    deleteToken,
    selectToken,
    moveToken,
    resizeToken,
    setTokenName,
    setTokenOpacity,
    deleteAllTokens,
  };
}

