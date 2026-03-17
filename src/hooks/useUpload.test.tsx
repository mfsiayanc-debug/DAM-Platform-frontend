import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUpload } from './useUpload';
import * as api from '../services/api';
import { toast } from 'sonner@2.0.3';
import { config } from '../config';

vi.mock('../services/api', () => ({
  uploadAssetResumable: vi.fn(),
  getAssetById: vi.fn(),
}));

vi.mock('sonner@2.0.3', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

describe('useUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('uploads files, polls for completion, and calls onComplete', async () => {
    const onComplete = vi.fn();
    const file = new File(['hello'], 'asset.jpg', { type: 'image/jpeg' });

    vi.mocked(api.uploadAssetResumable).mockImplementation(async (_file, onProgress) => {
      onProgress?.(50, 100);
      onProgress?.(100, 100);
      return { assetId: 'asset-1' };
    });
    vi.mocked(api.getAssetById).mockResolvedValue({
      id: 'asset-1',
      name: 'asset.jpg',
      type: 'image',
      size: 5,
      mimeType: 'image/jpeg',
      uploadedAt: new Date().toISOString(),
      thumbnailUrl: '/thumb',
      url: '/file',
      downloads: 0,
      tags: [],
      metadata: {},
      status: 'completed',
    });

    const { result } = renderHook(() => useUpload(onComplete));

    await act(async () => {
      await result.current.startUpload([file]);
    });

    expect(result.current.uploadJobs[0]).toMatchObject({
      fileName: 'asset.jpg',
      status: 'processing',
      progress: 100,
    });

    await act(async () => {
      vi.advanceTimersByTime(config.polling.interval);
      await Promise.resolve();
    });

    expect(onComplete).toHaveBeenCalledWith(['asset-1']);
    expect(toast.success).toHaveBeenCalledWith('All assets processed successfully');
  });

  it('marks jobs as failed when all uploads fail', async () => {
    const file = new File(['hello'], 'asset.jpg', { type: 'image/jpeg' });

    vi.mocked(api.uploadAssetResumable).mockRejectedValue(new Error('Network down'));

    const { result } = renderHook(() => useUpload());

    await act(async () => {
      await expect(result.current.startUpload([file])).rejects.toThrow('Upload failed');
    });

    expect(result.current.uploadJobs[0]).toMatchObject({
        fileName: 'asset.jpg',
        status: 'failed',
        error: 'Network down',
      });
    expect(toast.error).toHaveBeenCalledWith('1 upload failed');
  });

  it('removes failed jobs after the configured delay', async () => {
    const file = new File(['hello'], 'asset.jpg', { type: 'image/jpeg' });

    vi.mocked(api.uploadAssetResumable).mockRejectedValue(new Error('Network down'));

    const { result } = renderHook(() => useUpload());

    await act(async () => {
      await expect(result.current.startUpload([file])).rejects.toThrow('Upload failed');
    });

    expect(result.current.uploadJobs).toHaveLength(1);

    await act(async () => {
      vi.advanceTimersByTime(config.ui.failedJobRemovalDelay);
      await Promise.resolve();
    });

    expect(result.current.uploadJobs).toHaveLength(0);
  });
});
