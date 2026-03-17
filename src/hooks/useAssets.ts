import { useState, useCallback } from 'react';
import * as api from '../services/api';
import { Asset } from '../types';
import { toast } from 'sonner@2.0.3';

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAssets = useCallback(async (params?: Parameters<typeof api.getAssets>[0]) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getAssets(
        params || { limit: 100, sortBy: 'uploadedAt', order: 'desc' },
      );
      const convertedAssets = response.assets.map((apiAsset) => api.convertApiAsset(apiAsset));
      setAssets(convertedAssets);
      return convertedAssets;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load assets';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error loading assets:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addAssets = useCallback((newAssets: Asset[]) => {
    setAssets((prev) => [...newAssets, ...prev]);
  }, []);

  const updateAsset = useCallback((assetId: string, updates: Partial<Asset>) => {
    setAssets((prev) =>
      prev.map((asset) => (asset.id === assetId ? { ...asset, ...updates } : asset)),
    );
  }, []);

  const removeAsset = useCallback((assetId: string) => {
    setAssets((prev) => prev.filter((asset) => asset.id !== assetId));
  }, []);

  return {
    assets,
    loading,
    error,
    loadAssets,
    addAssets,
    updateAsset,
    removeAsset,
  };
}
