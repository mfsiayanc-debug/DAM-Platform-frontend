import { useRef, useState } from 'react';
import { Upload, FileImage, FileVideo, FileText, X, AlertCircle } from 'lucide-react';
import { validateFiles, formatFileSize } from '../utils/fileValidation';
import { toast } from 'sonner@2.0.3';

interface UploadZoneProps {
  onUpload: (files: File[]) => void;
}

export function UploadZone({ onUpload }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      addFiles(files);
    }
  };

  const addFiles = (files: File[]) => {
    const { valid, invalid } = validateFiles(files);
    
    // Show errors for invalid files
    if (invalid.length > 0) {
      invalid.forEach(({ file, error }) => {
        toast.error(`${file.name}: ${error}`);
      });
    }
    
    // Add valid files
    if (valid.length > 0) {
      setSelectedFiles(prev => [...prev, ...valid]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
      setSelectedFiles([]);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return FileImage;
    if (file.type.startsWith('video/')) return FileVideo;
    return FileText;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-slate-900 mb-2">Upload Assets</h2>
        <p className="text-slate-600">
          Upload images, videos, or documents to your asset library
        </p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
          ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50'
          }
        `}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          
          <div>
            <p className="text-slate-900 mb-1">
              Drop files here or click to browse
            </p>
            <p className="text-slate-500">
              Supports images, videos, and documents up to 100MB
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-slate-900">
              Selected Files ({selectedFiles.length})
            </h3>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Clear all
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {selectedFiles.map((file, index) => {
              const Icon = getFileIcon(file);
              
              return (
                <div
                  key={index}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-slate-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 truncate">{file.name}</p>
                      <p className="text-slate-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
            <button
              onClick={handleUpload}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-blue-50 rounded-xl p-6">
        <h4 className="text-slate-900 mb-3">Processing Pipeline</h4>
        <p className="text-slate-600 mb-4">
          Once uploaded, your assets will be automatically processed:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <span className="text-blue-600">1</span>
            </div>
            <p className="text-slate-900 mb-1">Thumbnail Generation</p>
            <p className="text-slate-600">Auto-generate preview thumbnails</p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <span className="text-blue-600">2</span>
            </div>
            <p className="text-slate-900 mb-1">Metadata Extraction</p>
            <p className="text-slate-600">Extract dimensions and file info</p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <span className="text-blue-600">3</span>
            </div>
            <p className="text-slate-900 mb-1">Auto-Tagging</p>
            <p className="text-slate-600">Generate searchable tags</p>
          </div>
        </div>
      </div>
    </div>
  );
}