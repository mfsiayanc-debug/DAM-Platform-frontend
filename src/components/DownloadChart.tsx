import { Asset } from '../types';
import { TrendingUp } from 'lucide-react';

interface DownloadChartProps {
  assets: Asset[];
}

export function DownloadChart({ assets }: DownloadChartProps) {
  // Get top 5 most downloaded assets
  const topAssets = [...assets]
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 5);

  const maxDownloads = topAssets[0]?.downloads || 1;

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-slate-900">Most Downloaded</h3>
        <TrendingUp className="w-5 h-5 text-green-600" />
      </div>

      <div className="space-y-4">
        {topAssets.map((asset, index) => {
          const percentage = (asset.downloads / maxDownloads) * 100;
          
          return (
            <div key={asset.id}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-slate-400 w-4">{index + 1}</span>
                  <span className="text-slate-900 truncate">{asset.name}</span>
                </div>
                <span className="text-slate-600 ml-4">{asset.downloads}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden ml-7">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
