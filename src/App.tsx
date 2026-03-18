import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { AssetGallery } from './components/AssetGallery';
import { UploadZone } from './components/UploadZone';
import { Header } from './components/Header';
import { AuthForm } from './components/AuthForm';
import { toast, Toaster } from 'sonner';
import { useAssets } from './hooks/useAssets';
import { useUpload } from './hooks/useUpload';
import { useAuth } from './hooks/useAuth';
import * as api from './services/api';

export default function App() {
  type ActiveView = 'dashboard' | 'assets' | 'upload';
  const [activeView, setActiveView] = useState('dashboard' as ActiveView);
  const { isAuthenticated, loading: authLoading } = useAuth();

  const { assets, loading, error, loadAssets, updateAsset, removeAsset } = useAssets();
  const { uploadJobs, startUpload } = useUpload(() => {
    // Reload assets when upload completes
    loadAssets();
  });

  // Load assets on mount (and when auth state changes, so authenticated calls get token)
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    loadAssets();
  }, [loadAssets, isAuthenticated]);

  const handleUpload = async (files: File[]) => {
    try {
      await startUpload(files);
    } catch (_err) {
      // Error handling is done in the hook
    }
  };

  const handleDownload = async (assetId: string) => {
    try {
      const asset = assets.find((a) => a.id === assetId);
      if (!asset) return;

      await api.downloadAsset(assetId, asset.name);

      // Update local state to increment download count
      updateAsset(assetId, { downloads: asset.downloads + 1 });

      toast.success('Download started');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Download failed';
      toast.error(errorMessage);
      console.error('Download error:', err);
    }
  };

  const handleDelete = async (assetId: string) => {
    try {
      await api.deleteAsset(assetId);
      removeAsset(assetId);
      toast.success('Asset deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      toast.error(errorMessage);
      console.error('Delete error:', err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <AuthForm onAuthenticated={() => setActiveView('dashboard')} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" richColors />
      <Header activeView={activeView} onViewChange={setActiveView} uploadJobs={uploadJobs} />

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {loading && assets.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading assets...</p>
            </div>
          </div>
        ) : error && assets.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">!</span>
              </div>
              <h3 className="text-slate-900 mb-2">Failed to load assets</h3>
              <p className="text-slate-600 mb-4">{error}</p>
              <button
                onClick={() => loadAssets()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            {activeView === 'dashboard' && <Dashboard assets={assets} />}

            {activeView === 'assets' && (
              <AssetGallery assets={assets} onDownload={handleDownload} onDelete={handleDelete} />
            )}

            {activeView === 'upload' && <UploadZone onUpload={handleUpload} />}
          </>
        )}
      </main>
    </div>
  );
}
