import { useState, useEffect, useCallback } from 'react';

interface Favorite {
  ticker: string;
  added_at: string;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);

  // Load favorites from cookies
  const loadFavorites = useCallback(() => {
    setLoading(true);
    try {
      const favoritesCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('favorites='));
      
      if (favoritesCookie) {
        const favoritesData = favoritesCookie.split('=')[1];
        const favoritesList = JSON.parse(decodeURIComponent(favoritesData));
        setFavorites(favoritesList);
      } else {
        setFavorites([]);
      }
    } catch (err) {
      console.error('Error loading favorites from cookies:', err);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save favorites to cookies
  const saveFavorites = useCallback((favoritesList: Favorite[]) => {
    try {
      const favoritesData = JSON.stringify(favoritesList);
      // Set cookie to expire in 1 year
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      document.cookie = `favorites=${encodeURIComponent(favoritesData)}; expires=${expires.toUTCString()}; path=/`;
    } catch (err) {
      console.error('Error saving favorites to cookies:', err);
    }
  }, []);

  // Add favorite
  const addFavorite = useCallback((ticker: string) => {
    const newFavorite: Favorite = {
      ticker,
      added_at: new Date().toISOString()
    };
    
    const updatedFavorites = [...favorites, newFavorite];
    setFavorites(updatedFavorites);
    saveFavorites(updatedFavorites);
    return true;
  }, [favorites, saveFavorites]);

  // Remove favorite
  const removeFavorite = useCallback((ticker: string) => {
    const updatedFavorites = favorites.filter(fav => fav.ticker !== ticker);
    setFavorites(updatedFavorites);
    saveFavorites(updatedFavorites);
    return true;
  }, [favorites, saveFavorites]);

  // Check if ticker is in favorites
  const isFavorite = useCallback((ticker: string) => {
    return favorites.some(fav => fav.ticker === ticker);
  }, [favorites]);

  // Toggle favorite status
  const toggleFavorite = useCallback((ticker: string) => {
    if (isFavorite(ticker)) {
      return removeFavorite(ticker);
    } else {
      return addFavorite(ticker);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    refresh: loadFavorites,
  };
} 