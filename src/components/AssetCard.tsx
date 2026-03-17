import { FileImage, FileVideo, FileText, Download } from 'lucide-react';
import { Asset } from '../types';

interface AssetCardProps {
  asset: Asset;
  onClick: () => void;
}

export function AssetCard({ asset, onClick }: AssetCardProps) {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer"
    >
      <div className="aspect-video bg-slate-100 relative overflow-hidden">
        <img
          src={asset.thumbnailUrl}
          alt={asset.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <div className="absolute top-2 right-2">
          <div className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-white flex items-center gap-1">
            {asset.type === 'image' && <FileImage className="w-3 h-3" />}
            {asset.type === 'video' && <FileVideo className="w-3 h-3" />}
            {asset.type === 'document' && <FileText className="w-3 h-3" />}
            <span className="capitalize">{asset.type}</span>
          </div>
        </div>

        {asset.type === 'video' && asset.metadata.duration && (
          <div className="absolute bottom-2 right-2">
            <div className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-white">
              {formatDuration(asset.metadata.duration)}
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <h4 className="text-slate-900 mb-2 truncate">{asset.name}</h4>

        <div className="flex items-center justify-between text-slate-600 mb-3">
          <span>{formatBytes(asset.size)}</span>
          <div className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            <span>{asset.downloads}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {asset.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm">
              {tag}
            </span>
          ))}
          {asset.tags.length > 3 && (
            <span className="px-2 py-1 text-slate-500 text-sm">+{asset.tags.length - 3}</span>
          )}
        </div>
      </div>
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

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
