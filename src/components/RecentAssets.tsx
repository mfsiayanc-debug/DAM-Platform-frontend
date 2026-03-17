import { FileImage, FileVideo, FileText, Clock } from 'lucide-react';
import { Asset } from '../types';

interface RecentAssetsProps {
  assets: Asset[];
}

export function RecentAssets({ assets }: RecentAssetsProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <h3 className="text-slate-900">Recent Uploads</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-slate-700">Asset</th>
              <th className="px-6 py-3 text-left text-slate-700">Type</th>
              <th className="px-6 py-3 text-left text-slate-700">Size</th>
              <th className="px-6 py-3 text-left text-slate-700">Downloads</th>
              <th className="px-6 py-3 text-left text-slate-700">Uploaded</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {assets.map((asset) => (
              <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={asset.thumbnailUrl}
                      alt={asset.name}
                      className="w-10 h-10 rounded object-cover bg-slate-100"
                    />
                    <span className="text-slate-900">{asset.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {asset.type === 'image' && <FileImage className="w-4 h-4 text-blue-600" />}
                    {asset.type === 'video' && <FileVideo className="w-4 h-4 text-purple-600" />}
                    {asset.type === 'document' && <FileText className="w-4 h-4 text-green-600" />}
                    <span className="text-slate-700 capitalize">{asset.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700">{formatBytes(asset.size)}</td>
                <td className="px-6 py-4 text-slate-700">{asset.downloads}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(asset.uploadedAt)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
