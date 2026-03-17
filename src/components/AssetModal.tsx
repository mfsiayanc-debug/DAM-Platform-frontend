import { X, Download, Trash2, Calendar, HardDrive, Tag } from 'lucide-react';
import { Asset } from '../types';

interface AssetModalProps {
  asset: Asset;
  onClose: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

export function AssetModal({ asset, onClose, onDownload, onDelete }: AssetModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-slate-900">{asset.name}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden mb-6">
              {asset.type === 'image' ? (
                <img src={asset.url} alt={asset.name} className="w-full h-full object-contain" />
              ) : asset.type === 'video' ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-10 h-10 text-slate-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                    <p className="text-slate-600">Video preview</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-slate-600">Document preview</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-slate-900 mb-4">Details</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-slate-600">Uploaded</p>
                      <p className="text-slate-900">
                        {asset.uploadedAt.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <HardDrive className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-slate-600">File Size</p>
                      <p className="text-slate-900">{formatBytes(asset.size)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Download className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-slate-600">Downloads</p>
                      <p className="text-slate-900">{asset.downloads}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-slate-900 mb-4">Metadata</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-slate-600 mb-1">Type</p>
                    <p className="text-slate-900 capitalize">{asset.type}</p>
                  </div>

                  <div>
                    <p className="text-slate-600 mb-1">MIME Type</p>
                    <p className="text-slate-900">{asset.mimeType}</p>
                  </div>

                  {asset.metadata.width && asset.metadata.height && (
                    <div>
                      <p className="text-slate-600 mb-1">Dimensions</p>
                      <p className="text-slate-900">
                        {asset.metadata.width} × {asset.metadata.height}
                      </p>
                    </div>
                  )}

                  {asset.metadata.duration && (
                    <div>
                      <p className="text-slate-600 mb-1">Duration</p>
                      <p className="text-slate-900">{formatDuration(asset.metadata.duration)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-slate-600" />
                <h4 className="text-slate-900">Tags</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {asset.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onDelete}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>

          <button
            onClick={onDownload}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
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
