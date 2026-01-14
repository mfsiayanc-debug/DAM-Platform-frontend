import { LayoutDashboard, FolderOpen, Upload, Bell } from 'lucide-react';
import { UploadJob } from '../types';
import { UploadProgress } from './UploadProgress';
import { ApiHealthIndicator } from './ApiHealthIndicator';

interface HeaderProps {
  activeView: 'dashboard' | 'assets' | 'upload';
  onViewChange: (view: 'dashboard' | 'assets' | 'upload') => void;
  uploadJobs: UploadJob[];
}

export function Header({ activeView, onViewChange, uploadJobs }: HeaderProps) {
  const activeJobs = uploadJobs.filter(job => job.status !== 'completed');
  
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <h1 className="text-slate-900">DAM Platform</h1>
            
            <nav className="flex gap-1">
              <button
                onClick={() => onViewChange('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeView === 'dashboard'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              
              <button
                onClick={() => onViewChange('assets')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeView === 'assets'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                <span>Assets</span>
              </button>
              
              <button
                onClick={() => onViewChange('upload')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeView === 'upload'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </button>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <ApiHealthIndicator />
            
            {activeJobs.length > 0 && (
              <UploadProgress jobs={activeJobs} />
            )}
            
            <button className="relative p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              {activeJobs.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}