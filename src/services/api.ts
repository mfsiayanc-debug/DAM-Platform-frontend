import { MockDataStore, type MockAsset } from './mockData';
import { Upload } from 'tus-js-client';
import { config } from '../config';

const API_BASE_URL =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:3001/api';

// Enable mock mode when API is not available
const USE_MOCK_DATA = false;

export interface ApiAsset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  size: number;
  mimeType: string;
  uploadedAt: string;
  thumbnailUrl: string;
  url: string;
  downloads: number;
  tags: string[];
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
  };
  status: string;
}

export interface ApiStats {
  totalAssets: number;
  totalDownloads: number;
  totalStorage: number;
  assetsThisMonth: number;
  assetsByType: {
    image?: number;
    video?: number;
    document?: number;
  };
  topDownloaded: ApiAsset[];
}

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

function authHeaders() {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}

// Auth
export async function signup(
  email: string,
  password: string,
): Promise<{
  user: { id: string; email: string; role: string; createdAt: string };
  token: string;
}> {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Signup failed' }));
    throw new Error(error.error || error.message || 'Signup failed');
  }

  return response.json();
}

export async function login(
  email: string,
  password: string,
): Promise<{
  user: { id: string; email: string; role: string; createdAt: string };
  token: string;
}> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Login failed' }));
    throw new Error(error.error || error.message || 'Login failed');
  }

  return response.json();
}

// Upload multiple assets
export async function uploadAssets(files: File[]): Promise<{ assets: ApiAsset[] }> {
  if (USE_MOCK_DATA) {
    const uploads = await Promise.all(files.map((file) => MockDataStore.uploadAsset(file)));
    return { assets: uploads.map(mockAssetToApiAsset) };
  }

  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const response = await fetch(`${API_BASE_URL}/assets/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      ...authHeaders(),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || error.message || 'Upload failed');
  }

  return response.json();
}

export async function uploadAssetResumable(
  file: File,
  onProgress?: (bytesUploaded: number, bytesTotal: number) => void,
): Promise<{ assetId: string }> {
  if (USE_MOCK_DATA) {
    const asset = await MockDataStore.uploadAsset(file);
    onProgress?.(file.size, file.size);
    return { assetId: asset.id };
  }

  return new Promise((resolve, reject) => {
    const upload = new Upload(file, {
      endpoint: `${API_BASE_URL}/uploads/resumable`,
      chunkSize: config.upload.chunkSize,
      retryDelays: config.upload.retryDelays,
      removeFingerprintOnSuccess: true,
      metadata: {
        filename: file.name,
        filetype: file.type,
      },
      headers: {
        ...authHeaders(),
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        onProgress?.(bytesUploaded, bytesTotal);
      },
      onError: (error) => {
        reject(error);
      },
      onSuccess: ({ lastResponse }) => {
        const assetId =
          lastResponse.getHeader('Upload-Completed-Asset-Id') ||
          upload.url?.split('/').filter(Boolean).pop();

        if (!assetId) {
          reject(new Error('Upload finished but no asset id was returned'));
          return;
        }

        resolve({ assetId });
      },
      onShouldRetry: (error, retryAttempt) => {
        const status = error.originalResponse?.getStatus();

        if (status && status >= 400 && status < 500 && status !== 409 && status !== 423) {
          return false;
        }

        return retryAttempt < config.upload.retryDelays.length;
      },
    });

    upload
      .findPreviousUploads()
      .then((previousUploads) => {
        if (previousUploads.length > 0) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }

        upload.start();
      })
      .catch(reject);
  });
}

// Get all assets with filters
export async function getAssets(
  params: {
    type?: string;
    search?: string;
    sortBy?: string;
    order?: string;
    limit?: number;
    offset?: number;
  } = {},
): Promise<{ assets: ApiAsset[]; pagination: { total: number; limit: number; offset: number } }> {
  if (USE_MOCK_DATA) {
    const assets = MockDataStore.getAssets({
      type: params.type,
      search: params.search,
    });

    const limit = params.limit || 50;
    const offset = params.offset || 0;
    const paginatedAssets = assets.slice(offset, offset + limit);

    return {
      assets: paginatedAssets.map(mockAssetToApiAsset),
      pagination: { total: assets.length, limit, offset },
    };
  }

  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE_URL}/assets?${queryParams}`);

  if (!response.ok) {
    throw new Error('Failed to fetch assets');
  }

  return response.json();
}

// Get single asset by ID
export async function getAssetById(assetId: string): Promise<ApiAsset> {
  if (USE_MOCK_DATA) {
    const asset = MockDataStore.getAsset(assetId);
    if (!asset) throw new Error('Asset not found');
    return mockAssetToApiAsset(asset);
  }

  const response = await fetch(`${API_BASE_URL}/assets/${assetId}`);

  if (!response.ok) {
    throw new Error('Asset not found');
  }

  return response.json();
}

// Download asset
export async function downloadAsset(assetId: string, fileName: string): Promise<void> {
  if (USE_MOCK_DATA) {
    MockDataStore.trackDownload(assetId);
    // Simulate download
    const link = document.createElement('a');
    link.href = '#';
    link.download = fileName;
    link.click();
    return;
  }

  const response = await fetch(`${API_BASE_URL}/assets/${assetId}/download`);

  if (!response.ok) {
    throw new Error('Download failed');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// Delete asset
export async function deleteAsset(assetId: string): Promise<void> {
  if (USE_MOCK_DATA) {
    const success = MockDataStore.deleteAsset(assetId);
    if (!success) throw new Error('Delete failed');
    return;
  }

  const response = await fetch(`${API_BASE_URL}/assets/${assetId}`, {
    method: 'DELETE',
    headers: {
      ...authHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error('Delete failed');
  }
}

// Update asset tags
export async function updateAssetTags(assetId: string, tags: string[]): Promise<ApiAsset> {
  if (USE_MOCK_DATA) {
    const updated = MockDataStore.updateAsset(assetId, { tags });
    if (!updated) throw new Error('Failed to update tags');
    return mockAssetToApiAsset(updated);
  }

  const response = await fetch(`${API_BASE_URL}/assets/${assetId}/tags`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ tags }),
  });

  if (!response.ok) {
    throw new Error('Failed to update tags');
  }

  return response.json();
}

// Get dashboard statistics
export async function getStats(): Promise<ApiStats> {
  if (USE_MOCK_DATA) {
    const stats = MockDataStore.getStats();
    const assets = MockDataStore.getAssets();
    const topDownloaded = assets
      .sort((a, b) => b.downloadCount - a.downloadCount)
      .slice(0, 5)
      .map(mockAssetToApiAsset);

    return {
      totalAssets: stats.totalAssets,
      totalDownloads: stats.recentDownloads,
      totalStorage: stats.totalStorage,
      assetsThisMonth: Math.floor(stats.totalAssets * 0.3), // Mock: 30% uploaded this month
      assetsByType: stats.assetsByType,
      topDownloaded,
    };
  }

  const response = await fetch(`${API_BASE_URL}/stats`);

  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }

  return response.json();
}

// Check API health
export async function checkHealth(): Promise<boolean> {
  if (USE_MOCK_DATA) {
    const health = await MockDataStore.checkHealth();
    return health.status === 'healthy';
  }

  try {
    const response = await fetch(API_BASE_URL.replace('/api', '/health'));
    return response.ok;
  } catch {
    return false;
  }
}

// Convert API asset to app asset format
export function convertApiAsset(apiAsset: ApiAsset) {
  return {
    id: apiAsset.id,
    name: apiAsset.name,
    type: apiAsset.type,
    size: apiAsset.size,
    mimeType: apiAsset.mimeType,
    uploadedAt: new Date(apiAsset.uploadedAt),
    thumbnailUrl: apiAsset.thumbnailUrl.startsWith('http')
      ? apiAsset.thumbnailUrl
      : `${API_BASE_URL.replace('/api', '')}${apiAsset.thumbnailUrl}`,
    url: apiAsset.url.startsWith('http')
      ? apiAsset.url
      : `${API_BASE_URL.replace('/api', '')}${apiAsset.url}`,
    downloads: apiAsset.downloads,
    tags: apiAsset.tags,
    metadata: apiAsset.metadata,
  };
}

// Helper function to convert mock asset to API asset format
function mockAssetToApiAsset(asset: MockAsset): ApiAsset {
  let type: 'image' | 'video' | 'document' = 'document';
  if (asset.mimeType.startsWith('image')) type = 'image';
  else if (asset.mimeType.startsWith('video')) type = 'video';

  return {
    id: asset.id,
    name: asset.originalName,
    type,
    size: asset.size,
    mimeType: asset.mimeType,
    uploadedAt: asset.createdAt,
    thumbnailUrl: asset.thumbnailPath || '/placeholder-thumbnail.jpg',
    url: `/assets/${asset.filename}`,
    downloads: asset.downloadCount,
    tags: asset.tags,
    metadata: {
      width: asset.width,
      height: asset.height,
      duration: asset.duration,
    },
    status: asset.status,
  };
}
