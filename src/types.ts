export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  size: number;
  mimeType: string;
  uploadedAt: Date;
  thumbnailUrl: string;
  url: string;
  downloads: number;
  tags: string[];
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
  };
}

export interface UploadJob {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  startedAt: Date;
  error?: string;
}

export interface DashboardStats {
  totalAssets: number;
  totalDownloads: number;
  totalStorage: number;
  assetsThisMonth: number;
}
