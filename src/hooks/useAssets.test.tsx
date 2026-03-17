import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAssets } from './useAssets';
import * as api from '../services/api';

vi.mock('../services/api', () => ({
  getAssets: vi.fn(),
  convertApiAsset: vi.fn(),
}));

describe('useAssets', () => {
  it('loads assets and handles success', async () => {
    const mockApiAssets = [{ id: '1' }];
    (api.getAssets as any).mockResolvedValue({
      assets: mockApiAssets,
      pagination: { total: 1, limit: 100, offset: 0 },
    });
    (api.convertApiAsset as any).mockImplementation((a: any) => ({ id: a.id, name: 'asset' }));

    const { result } = renderHook(() => useAssets());

    await act(async () => {
      await result.current.loadAssets();
    });

    expect(result.current.assets).toHaveLength(1);
    expect(result.current.assets[0]).toMatchObject({ id: '1', name: 'asset' });
  });
});
