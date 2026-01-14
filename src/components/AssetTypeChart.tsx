import { FileImage, FileVideo, FileText } from 'lucide-react';

interface AssetTypeChartProps {
  imageCount: number;
  videoCount: number;
  documentCount: number;
}

export function AssetTypeChart({ imageCount, videoCount, documentCount }: AssetTypeChartProps) {
  const total = imageCount + videoCount + documentCount;
  
  const imagePercent = (imageCount / total) * 100;
  const videoPercent = (videoCount / total) * 100;
  const documentPercent = (documentCount / total) * 100;

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200">
      <h3 className="text-slate-900 mb-6">Asset Distribution</h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileImage className="w-4 h-4 text-blue-600" />
              <span className="text-slate-700">Images</span>
            </div>
            <span className="text-slate-900">{imageCount}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${imagePercent}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileVideo className="w-4 h-4 text-purple-600" />
              <span className="text-slate-700">Videos</span>
            </div>
            <span className="text-slate-900">{videoCount}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all"
              style={{ width: `${videoPercent}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-600" />
              <span className="text-slate-700">Documents</span>
            </div>
            <span className="text-slate-900">{documentCount}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${documentPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Total Assets</span>
          <span className="text-slate-900">{total}</span>
        </div>
      </div>
    </div>
  );
}
