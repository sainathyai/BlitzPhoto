import { useMemo, useState, useEffect } from 'react';
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
  const [isCollapsed, setIsCollapsed] = useState(true); // Collapsed by default
  
  // Auto-expand when there are active uploads
  useEffect(() => {
    const hasActive = uploads.some(u => u.status === 'pending' || u.status === 'uploading');
    if (hasActive && isCollapsed) {
      setIsCollapsed(false);
    }
  }, [uploads, isCollapsed]);

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

  // Always show the panel, even when empty

  // Don't render if no uploads and collapsed
  if (uploads.length === 0 && isCollapsed) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed top-6 right-6 z-50 w-80 bg-white rounded-xl shadow-xl border border-neutral-200 flex flex-col max-h-[600px]"
    >
      <button
        type="button"
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors w-full text-left border-b border-neutral-200"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-900">Upload Status</p>
          <p className="text-xs text-neutral-500 truncate">
            {uploads.length === 0
              ? 'No active uploads'
              : hasActiveUploads
                ? `${activeCount} uploading • ${overallProgress}%`
                : completedCount === uploads.length
                  ? 'All finished'
                  : 'Some failed'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!isCollapsed && uploads.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear?.();
              }}
              disabled={hasActiveUploads}
              className="rounded-lg bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear
            </button>
          )}
          <span className="text-neutral-400 text-xs">
            {isCollapsed ? '▼' : '▲'}
          </span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            key="upload-items"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-3 overflow-y-auto px-4 py-3 max-h-[500px]"
          >
              {uploads.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-neutral-500">
                  No active uploads
                </div>
              ) : (
                uploads.map((upload) => {
                const badge = getStatusBadge(upload.status);
                return (
                  <motion.div
                    key={`${upload.photoId ?? upload.file.name}-${upload.file.lastModified}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="rounded-xl border border-neutral-100 bg-neutral-50/60 p-3 shadow-sm"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-neutral-900">{upload.file.name}</p>
                        <p className="text-xs text-neutral-500">{formatFileSize(upload.file.size ?? 0)}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.textColor} bg-neutral-100`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
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
              }))}
            </motion.div>
          )}
        </AnimatePresence>
    </motion.div>
  );
}

