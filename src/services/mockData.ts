// Mock data for DAM platform when backend is not available

export interface MockAsset {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  thumbnailPath?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  downloadCount: number;
}

export interface MockStats {
  totalAssets: number;
  totalStorage: number;
  processingJobs: number;
  recentDownloads: number;
  assetsByType: {
    image: number;
    video: number;
    document: number;
  };
}

// Generate mock assets
const createMockAsset = (id: number, type: 'image' | 'video' | 'document'): MockAsset => {
  const types = {
    image: { mime: 'image/jpeg', ext: 'jpg', size: 2.5 * 1024 * 1024 },
    video: { mime: 'video/mp4', ext: 'mp4', size: 15 * 1024 * 1024 },
    document: { mime: 'application/pdf', ext: 'pdf', size: 500 * 1024 },
  };

  const config = types[type];
  const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

  return {
    id: `asset-${id}`,
    filename: `${type}-${id}.${config.ext}`,
    originalName: `Sample ${type} ${id}.${config.ext}`,
    mimeType: config.mime,
    size: Math.floor(config.size + Math.random() * config.size),
    width: type === 'image' ? 1920 : undefined,
    height: type === 'image' ? 1080 : undefined,
    duration: type === 'video' ? 120 : undefined,
    thumbnailPath: type !== 'document' ? `/mock-thumbnails/${type}-${id}.jpg` : undefined,
    status: 'completed',
    tags: [`${type}`, 'sample', Math.random() > 0.5 ? 'featured' : 'archive'],
    createdAt: date.toISOString(),
    updatedAt: date.toISOString(),
    downloadCount: Math.floor(Math.random() * 100),
  };
};

// Initialize mock data
let mockAssets: MockAsset[] = [
  ...Array.from({ length: 15 }, (_, i) => createMockAsset(i + 1, 'image')),
  ...Array.from({ length: 8 }, (_, i) => createMockAsset(i + 16, 'video')),
  ...Array.from({ length: 5 }, (_, i) => createMockAsset(i + 24, 'document')),
];

// Mock data store
export class MockDataStore {
  private static uploadCounter = 100;

  static getAssets(filters?: { type?: string; tag?: string; search?: string }): MockAsset[] {
    let filtered = [...mockAssets];

    if (filters?.type) {
      filtered = filtered.filter((a) => a.mimeType.startsWith(filters.type!));
    }

    if (filters?.tag) {
      filtered = filtered.filter((a) => a.tags.includes(filters.tag!));
    }

    if (filters?.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.originalName.toLowerCase().includes(query) ||
          a.tags.some((t) => t.toLowerCase().includes(query)),
      );
    }

    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  static getAsset(id: string): MockAsset | undefined {
    return mockAssets.find((a) => a.id === id);
  }

  static getStats(): MockStats {
    const totalStorage = mockAssets.reduce((sum, a) => sum + a.size, 0);
    const processingJobs = mockAssets.filter((a) => a.status === 'processing').length;
    const recentDownloads = mockAssets.reduce((sum, a) => sum + a.downloadCount, 0);

    return {
      totalAssets: mockAssets.length,
      totalStorage,
      processingJobs,
      recentDownloads,
      assetsByType: {
        image: mockAssets.filter((a) => a.mimeType.startsWith('image')).length,
        video: mockAssets.filter((a) => a.mimeType.startsWith('video')).length,
        document: mockAssets.filter((a) => a.mimeType.startsWith('application')).length,
      },
    };
  }

  static async uploadAsset(file: File): Promise<MockAsset> {
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const id = `asset-${++this.uploadCounter}`;
    let type: 'image' | 'video' | 'document' = 'document';

    if (file.type.startsWith('image')) type = 'image';
    else if (file.type.startsWith('video')) type = 'video';

    const newAsset: MockAsset = {
      id,
      filename: `${id}-${file.name}`,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      width: type === 'image' ? 1920 : undefined,
      height: type === 'image' ? 1080 : undefined,
      duration: type === 'video' ? 60 : undefined,
      thumbnailPath: type !== 'document' ? `/mock-thumbnails/${id}.jpg` : undefined,
      status: 'processing',
      tags: [type],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      downloadCount: 0,
    };

    mockAssets = [newAsset, ...mockAssets];

    // Simulate processing completion
    setTimeout(() => {
      const asset = mockAssets.find((a) => a.id === id);
      if (asset) {
        asset.status = 'completed';
      }
    }, 2000);

    return newAsset;
  }

  static updateAsset(id: string, updates: Partial<MockAsset>): MockAsset | null {
    const index = mockAssets.findIndex((a) => a.id === id);
    if (index === -1) return null;

    mockAssets[index] = {
      ...mockAssets[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return mockAssets[index];
  }

  static deleteAsset(id: string): boolean {
    const index = mockAssets.findIndex((a) => a.id === id);
    if (index === -1) return false;

    mockAssets = mockAssets.filter((a) => a.id !== id);
    return true;
  }

  static trackDownload(id: string): void {
    const asset = mockAssets.find((a) => a.id === id);
    if (asset) {
      asset.downloadCount++;
    }
  }

  static async checkHealth(): Promise<{ status: string; message: string }> {
    return {
      status: 'healthy',
      message: 'Mock API is running',
    };
  }
}
