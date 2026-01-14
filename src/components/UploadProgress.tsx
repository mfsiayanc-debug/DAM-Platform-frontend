import { useState } from 'react';
import { CheckCircle, Clock, Loader2, XCircle } from 'lucide-react';
import { UploadJob } from '../types';

interface UploadProgressProps {
  jobs: UploadJob[];
}

export function UploadProgress({ jobs }: UploadProgressProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (jobs.length === 0) return null;

  const activeJobs = jobs.filter(job => job.status !== 'completed');
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>{activeJobs.length} processing</span>
      </button>

      {isExpanded && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsExpanded(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <h3 className="text-slate-900">Processing Queue</h3>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {jobs.map(job => (
                <div key={job.id} className="px-4 py-3 border-b border-slate-100 last:border-0">
                  <div className="flex items-start gap-3">
                    {job.status === 'uploading' && (
                      <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    )}
                    {job.status === 'processing' && (
                      <Loader2 className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5 animate-spin" />
                    )}
                    {job.status === 'completed' && (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    )}
                    {job.status === 'failed' && (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 truncate">{job.fileName}</p>
                      <p className="text-slate-500">
                        {formatBytes(job.fileSize)}
                      </p>
                      
                      {job.status === 'uploading' && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-slate-600">Uploading...</span>
                            <span className="text-slate-600">{Math.round(job.progress)}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 transition-all duration-300"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {job.status === 'processing' && (
                        <p className="text-amber-600 mt-1">Processing thumbnails and metadata...</p>
                      )}
                      
                      {job.status === 'completed' && (
                        <p className="text-green-600 mt-1">Ready to use</p>
                      )}
                      
                      {job.status === 'failed' && job.error && (
                        <p className="text-red-600 mt-1">{job.error}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
