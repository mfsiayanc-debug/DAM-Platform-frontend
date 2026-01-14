import { useState } from 'react';
import { Search, Filter, Grid3x3, List, SortDesc } from 'lucide-react';
import { Asset } from '../types';
import { AssetCard } from './AssetCard';
import { AssetModal } from './AssetModal';

interface AssetGalleryProps {
  assets: Asset[];
  onDownload: (assetId: string) => void;
  onDelete: (assetId: string) => void;
}

export function AssetGallery({ assets, onDownload, onDelete }: AssetGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video' | 'document'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'downloads'>('date');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Filter assets
  let filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Sort assets
  filteredAssets = [...filteredAssets].sort((a, b) => {
    if (sortBy === 'date') {
      return b.uploadedAt.getTime() - a.uploadedAt.getTime();
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return b.downloads - a.downloads;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex-1 w-full lg:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search assets by name or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date">Latest First</option>
            <option value="name">Name A-Z</option>
            <option value="downloads">Most Downloaded</option>
          </select>

          <div className="flex gap-1 border border-slate-200 rounded-lg p-1 bg-white">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-slate-600">
          {filteredAssets.length} {filteredAssets.length === 1 ? 'asset' : 'assets'} found
        </p>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAssets.map(asset => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onClick={() => setSelectedAsset(asset)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
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
              {filteredAssets.map(asset => (
                <tr
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={asset.thumbnailUrl}
                        alt={asset.name}
                        className="w-12 h-12 rounded object-cover bg-slate-100"
                      />
                      <span className="text-slate-900">{asset.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-700 capitalize">{asset.type}</td>
                  <td className="px-6 py-4 text-slate-700">{formatBytes(asset.size)}</td>
                  <td className="px-6 py-4 text-slate-700">{asset.downloads}</td>
                  <td className="px-6 py-4 text-slate-500">{formatDate(asset.uploadedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <Filter className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-slate-900 mb-2">No assets found</h3>
          <p className="text-slate-600">Try adjusting your search or filters</p>
        </div>
      )}

      {selectedAsset && (
        <AssetModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onDownload={() => {
            onDownload(selectedAsset.id);
            setSelectedAsset(null);
          }}
          onDelete={() => {
            onDelete(selectedAsset.id);
            setSelectedAsset(null);
          }}
        />
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

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}
