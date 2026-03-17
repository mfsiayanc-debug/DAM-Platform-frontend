import { useState, useCallback } from 'react';
import * as api from '../services/api';
import { UploadJob } from '../types';
import { toast } from 'sonner@2.0.3';
import { config } from '../config';

export function useUpload(onComplete?: (assetIds: string[]) => void) {
  const [uploadJobs, setUploadJobs] = useState<UploadJob[]>([]);

  const pollForAssetProcessing = useCallback(
    async (assetIds: string[], jobs: UploadJob[]) => {
      let attempts = 0;

      const pollInterval = setInterval(async () => {
        attempts++;

        try {
          // Check if all assets are processed
          const assetPromises = assetIds.map((id) => api.getAssetById(id));
          const fetchedAssets = await Promise.all(assetPromises);

          const allProcessed = fetchedAssets.every((asset) => asset.status === 'completed');

          if (allProcessed || attempts >= config.polling.maxAttempts) {
            clearInterval(pollInterval);

            // Mark jobs as completed
            jobs.forEach((job) => {
              setUploadJobs((prev) =>
                prev.map((j) => (j.id === job.id ? { ...j, status: 'completed' as const } : j)),
              );
            });

            // Call completion callback
            if (onComplete) {
              onComplete(assetIds);
            }

            // Remove completed jobs after delay
            setTimeout(() => {
              setUploadJobs((prev) => prev.filter((j) => !jobs.find((job) => job.id === j.id)));
            }, config.ui.jobRemovalDelay);

            if (allProcessed) {
              toast.success('All assets processed successfully');
            } else if (attempts >= config.polling.maxAttempts) {
              toast.warning(
                'Processing is taking longer than expected. Please refresh to see the latest status.',
              );
            }
          }
        } catch (err) {
          console.error('Error polling for asset status:', err);
        }
      }, config.polling.interval);
    },
    [onComplete],
  );

  const startUpload = useCallback(
    async (files: File[]) => {
      // Create upload jobs
      const newJobs: UploadJob[] = files.map((file, index) => ({
        id: `job-${Date.now()}-${index}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        status: 'uploading' as const,
        progress: 0,
        startedAt: new Date(),
      }));

      setUploadJobs((prev) => [...prev, ...newJobs]);

      try {
        // Upload files to backend
        const response = await api.uploadAssets(files);

        // Update jobs to processing status
        newJobs.forEach((job) => {
          setUploadJobs((prev) =>
            prev.map((j) =>
              j.id === job.id ? { ...j, status: 'processing' as const, progress: 100 } : j,
            ),
          );
        });

        // Poll for asset processing completion
        const assetIds = response.assets.map((a) => a.id);
        pollForAssetProcessing(assetIds, newJobs);

        toast.success(
          `Successfully uploaded ${files.length} ${files.length === 1 ? 'file' : 'files'}`,
        );

        return assetIds;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';

        // Mark all jobs as failed
        newJobs.forEach((job) => {
          setUploadJobs((prev) =>
            prev.map((j) =>
              j.id === job.id ? { ...j, status: 'failed' as const, error: errorMessage } : j,
            ),
          );
        });

        toast.error(errorMessage);
        console.error('Upload error:', err);

        // Remove failed jobs after delay
        setTimeout(() => {
          setUploadJobs((prev) => prev.filter((j) => !newJobs.find((nj) => nj.id === j.id)));
        }, config.ui.failedJobRemovalDelay);

        throw err;
      }
    },
    [pollForAssetProcessing],
  );

  return {
    uploadJobs,
    startUpload,
  };
}
