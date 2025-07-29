import { useState, useEffect, useCallback } from 'react';

interface Favorite {
  id: number;
  user_id: string;
  ticker: string;
  added_at: string;
  company_name?: string;
  market_cap?: number;
}

export function useFavorites(userId?: string) {
  const effectiveUserId = userId || 'default';
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

    // Load favorites from database
  const loadFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/favorites');
      const data = await response.json();

      if (data.success) {
        setFavorites(data.data);
      } else {
        setError(data.error || 'Failed to load favorites');
      }
    } catch (err) {
      setError('Failed to load favorites');
      console.error('Error loading favorites:', err);
    } finally {
      setLoading(false);
    }
  }, []);

    // Add favorite to database
  const addFavorite = useCallback(async (ticker: string) => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticker }),
      });

      const data = await response.json();

      if (data.success) {
        // Reload favorites to get updated list
        await loadFavorites();
        return true;
      } else {
        setError(data.error || 'Failed to add favorite');
        return false;
      }
    } catch (err) {
      setError('Failed to add favorite');
      console.error('Error adding favorite:', err);
      return false;
    }
  }, [loadFavorites]);

    // Remove favorite from database
  const removeFavorite = useCallback(async (ticker: string) => {
    try {
      const response = await fetch(`/api/favorites?ticker=${ticker}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Reload favorites to get updated list
        await loadFavorites();
        return true;
      } else {
        setError(data.error || 'Failed to remove favorite');
        return false;
      }
    } catch (err) {
      setError('Failed to remove favorite');
      console.error('Error removing favorite:', err);
      return false;
    }
  }, [loadFavorites]);

  // Check if ticker is in favorites
  const isFavorite = useCallback((ticker: string) => {
    return favorites.some(fav => fav.ticker === ticker);
  }, [favorites]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (ticker: string) => {
    if (isFavorite(ticker)) {
      return await removeFavorite(ticker);
    } else {
      return await addFavorite(ticker);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    refresh: loadFavorites,
  };
} 