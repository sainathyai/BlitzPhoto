import { AnimatePresence } from 'framer-motion';
import FilePreview from './FilePreview';
import type { FileUploadState } from '../../hooks/useFileUpload';
import { getFileKey } from '../../lib/utils';

type UploadStateSummary = Pick<FileUploadState, 'status' | 'progress' | 'error'>;

interface FileListProps {
  files: File[];
  uploadStates?: Map<string, UploadStateSummary>;
  onRemove?: (file: File) => void;
  compact?: boolean;
}

/**
 * FileList Component
 * 
 * Displays list of selected files with previews and status.
 */
export default function FileList({ files, uploadStates, onRemove, compact = false }: FileListProps) {
  if (files.length === 0) {
    return null;
  }

  if (compact) {
    // Grid layout for compact mode
    return (
      <AnimatePresence>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {files.map((file) => {
            const key = getFileKey(file);
            const state = uploadStates?.get(key);
            return (
              <FilePreview
                key={key}
                file={file}
                status={state?.status ?? 'pending'}
                progress={state?.progress ?? 0}
                error={state?.error}
                onRemove={onRemove ? () => onRemove(file) : undefined}
                compact={true}
              />
            );
          })}
        </div>
      </AnimatePresence>
    );
  }

  // List layout for normal mode
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-900">
        Selected Files ({files.length})
      </h3>
      <AnimatePresence>
        <div className="space-y-2">
          {files.map((file) => {
            const key = getFileKey(file);
            const state = uploadStates?.get(key);
            return (
              <FilePreview
                key={key}
                file={file}
                status={state?.status ?? 'pending'}
                progress={state?.progress ?? 0}
                error={state?.error}
                onRemove={onRemove ? () => onRemove(file) : undefined}
              />
            );
          })}
        </div>
      </AnimatePresence>
    </div>
  );
}

