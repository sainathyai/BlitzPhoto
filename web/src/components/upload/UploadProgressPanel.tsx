import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { FileUploadState } from '../../hooks/useFileUpload';
import { formatFileSize } from '../../lib/utils';

interface UploadProgressPanelProps {
  uploads: FileUploadState[];
  onClear?: () => void;
}

function getStatusBadge(status: FileUploadState['status']) {
  switch (status) {
    case 'completed':
      return {
        label: 'Completed',
        color: 'bg-emerald-500',
        textColor: 'text-emerald-600',
      };
    case 'failed':
      return {
        label: 'Failed',
        color: 'bg-rose-500',
        textColor: 'text-rose-600',
      };
    case 'uploading':
      return {
        label: 'Uploading',
        color: 'bg-blue-500',
        textColor: 'text-blue-600',
      };
    default:
      return {
        label: 'Pending',
        color: 'bg-slate-400',
        textColor: 'text-slate-600',
      };
  }
}

export default function UploadProgressPanel({ uploads, onClear }: UploadProgressPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { overallProgress, activeCount, completedCount, hasActiveUploads } = useMemo(() => {
    if (uploads.length === 0) {
      return { overallProgress: 0, activeCount: 0, completedCount: 0, hasActiveUploads: false };
    }

    const totalProgress = uploads.reduce((sum, upload) => sum + (upload.progress ?? 0), 0);
    const active = uploads.filter((upload) => upload.status === 'pending' || upload.status === 'uploading').length;
    const completed = uploads.filter((upload) => upload.status === 'completed').length;
    const hasActive = active > 0;

    return {
      overallProgress: Math.round(totalProgress / uploads.length),
      activeCount: active,
      completedCount: completed,
      hasActiveUploads: hasActive,
    };
  }, [uploads]);

  if (uploads.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Upload activity</p>
            <p className="text-xs text-slate-500">
              {hasActiveUploads
                ? `${activeCount} file${activeCount === 1 ? '' : 's'} uploading • ${overallProgress}% overall`
                : completedCount === uploads.length
                  ? 'All uploads finished'
                  : 'Some uploads failed'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
            >
              {isCollapsed ? 'Show' : 'Hide'}
            </button>
            <button
              type="button"
              onClick={onClear}
              disabled={hasActiveUploads}
              className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              key="upload-items"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="max-h-96 space-y-3 overflow-y-auto px-4 py-3"
            >
              {uploads.map((upload) => {
                const badge = getStatusBadge(upload.status);
                return (
                  <motion.div
                    key={`${upload.photoId ?? upload.file.name}-${upload.file.lastModified}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 shadow-sm"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{upload.file.name}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(upload.file.size ?? 0)}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.textColor} bg-slate-100`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`${badge.color} h-full transition-all duration-300 ease-out`}
                        style={{ width: `${upload.progress ?? 0}%` }}
                      />
                    </div>

                    {upload.error && (
                      <p className="mt-2 text-xs font-medium text-rose-500">
                        {upload.error}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

