import { useState, useCallback } from 'react';
import * as api from '../services/api';
import { UploadJob } from '../types';
import { toast } from 'sonner';
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

          const failedAssets = fetchedAssets.filter((asset) => asset.status === 'failed');
          const allProcessed = fetchedAssets.every((asset) => asset.status === 'completed');

          if (failedAssets.length > 0 || allProcessed || attempts >= config.polling.maxAttempts) {
            clearInterval(pollInterval);

            if (failedAssets.length > 0) {
              jobs.forEach((job) => {
                setUploadJobs((prev) =>
                  prev.map((j) =>
                    j.id === job.id
                      ? { ...j, status: 'failed' as const, error: 'Asset processing failed' }
                      : j,
                  ),
                );
              });

              toast.error(
                `${failedAssets.length} ${failedAssets.length === 1 ? 'asset failed during processing' : 'assets failed during processing'}`,
              );

              setTimeout(() => {
                setUploadJobs((prev) => prev.filter((j) => !jobs.find((job) => job.id === j.id)));
              }, config.ui.failedJobRemovalDelay);

              return;
            }

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
          if (err instanceof Error && err.message === 'Asset not found') {
            clearInterval(pollInterval);

            jobs.forEach((job) => {
              setUploadJobs((prev) =>
                prev.map((j) =>
                  j.id === job.id
                    ? {
                        ...j,
                        status: 'failed' as const,
                        error: 'Uploaded asset could not be found on the server',
                      }
                    : j,
                ),
              );
            });

            toast.error('Uploaded asset could not be found on the server');

            setTimeout(() => {
              setUploadJobs((prev) => prev.filter((j) => !jobs.find((job) => job.id === j.id)));
            }, config.ui.failedJobRemovalDelay);

            return;
          }

          console.error('Error polling for asset status:', err);
        }
      }, config.polling.interval);
    },
    [onComplete],
  );

  const startUpload = useCallback(
    async (files: File[]) => {
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

      const successfulAssetIds: string[] = [];
      const successfulJobs: UploadJob[] = [];
      const failedJobs: UploadJob[] = [];

      await Promise.all(
        files.map(async (file, index) => {
          const job = newJobs[index];

          try {
            const response = await api.uploadAssetResumable(file, (bytesUploaded, bytesTotal) => {
              const progress = bytesTotal > 0 ? (bytesUploaded / bytesTotal) * 100 : 0;

              setUploadJobs((prev) =>
                prev.map((currentJob) =>
                  currentJob.id === job.id ? { ...currentJob, progress } : currentJob,
                ),
              );
            });

            successfulAssetIds.push(response.assetId);
            successfulJobs.push(job);

            setUploadJobs((prev) =>
              prev.map((currentJob) =>
                currentJob.id === job.id
                  ? { ...currentJob, status: 'processing' as const, progress: 100 }
                  : currentJob,
              ),
            );
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Upload failed';
            failedJobs.push(job);

            setUploadJobs((prev) =>
              prev.map((currentJob) =>
                currentJob.id === job.id
                  ? { ...currentJob, status: 'failed' as const, error: errorMessage }
                  : currentJob,
              ),
            );

            console.error(`Upload error for ${file.name}:`, err);
          }
        }),
      );

      if (successfulAssetIds.length > 0) {
        pollForAssetProcessing(successfulAssetIds, successfulJobs);
        toast.success(
          `Successfully uploaded ${successfulAssetIds.length} ${successfulAssetIds.length === 1 ? 'file' : 'files'}`,
        );
      }

      if (failedJobs.length > 0) {
        toast.error(
          `${failedJobs.length} ${failedJobs.length === 1 ? 'upload failed' : 'uploads failed'}`,
        );

        setTimeout(() => {
          setUploadJobs((prev) => prev.filter((j) => !failedJobs.find((job) => job.id === j.id)));
        }, config.ui.failedJobRemovalDelay);
      }

      if (successfulAssetIds.length === 0) {
        throw new Error('Upload failed');
      }

      return successfulAssetIds;
    },
    [pollForAssetProcessing],
  );

  return {
    uploadJobs,
    startUpload,
  };
}
