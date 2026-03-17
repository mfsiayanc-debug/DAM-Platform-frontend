import { useState, useEffect } from 'react';
import { HardDrive, Download, FileImage, TrendingUp } from 'lucide-react';
import { Asset } from '../types';
import { StatsCard } from './StatsCard';
import { RecentAssets } from './RecentAssets';
import { AssetTypeChart } from './AssetTypeChart';
import { DownloadChart } from './DownloadChart';
import * as api from '../services/api';

interface DashboardProps {
  assets: Asset[];
}

export function Dashboard({ assets }: DashboardProps) {
  const [stats, setStats] = useState<api.ApiStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const fetchedStats = await api.getStats();
      setStats(fetchedStats);
    } catch (err) {
      console.error('Error loading stats:', err);
      // Fall back to calculating from assets prop if API fails
    } finally {
      setLoading(false);
    }
  };

  // Use API stats if available, otherwise calculate from assets
  const totalAssets = stats?.totalAssets ?? assets.length;
  const totalDownloads =
    stats?.totalDownloads ?? assets.reduce((sum, asset) => sum + asset.downloads, 0);
  const totalStorage = stats?.totalStorage ?? assets.reduce((sum, asset) => sum + asset.size, 0);
  const assetsThisMonth =
    stats?.assetsThisMonth ??
    (() => {
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      return assets.filter((asset) => asset.uploadedAt >= thisMonth).length;
    })();

  const imageCount = stats?.assetsByType?.image ?? assets.filter((a) => a.type === 'image').length;
  const videoCount = stats?.assetsByType?.video ?? assets.filter((a) => a.type === 'video').length;
  const documentCount =
    stats?.assetsByType?.document ?? assets.filter((a) => a.type === 'document').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-900 mb-6">Dashboard Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Assets"
            value={totalAssets.toString()}
            icon={FileImage}
            trend={`+${assetsThisMonth} this month`}
            trendUp={true}
          />

          <StatsCard
            title="Total Downloads"
            value={totalDownloads.toString()}
            icon={Download}
            trend="+12% from last month"
            trendUp={true}
          />

          <StatsCard
            title="Storage Used"
            value={formatBytes(totalStorage)}
            icon={HardDrive}
            trend={`${Math.round((totalStorage / (100 * 1024 * 1024)) * 100)}% of 100 GB`}
            trendUp={false}
          />

          <StatsCard
            title="Avg Downloads"
            value={Math.round(totalDownloads / totalAssets).toString()}
            icon={TrendingUp}
            trend="per asset"
            trendUp={true}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AssetTypeChart
          imageCount={imageCount}
          videoCount={videoCount}
          documentCount={documentCount}
        />

        <DownloadChart assets={assets} />
      </div>

      <RecentAssets assets={assets.slice(0, 6)} />
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
