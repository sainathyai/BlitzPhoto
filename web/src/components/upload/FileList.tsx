import { AnimatePresence } from 'framer-motion';
import FilePreview from './FilePreview';
import type { FileUploadState } from '../../hooks/useFileUpload';
import { getFileKey } from '../../lib/utils';

type UploadStateSummary = Pick<FileUploadState, 'status' | 'progress' | 'error'>;

interface FileListProps {
  files: File[];
  uploadStates?: Map<string, UploadStateSummary>;
  onRemove?: (file: File) => void;
}

/**
 * FileList Component
 * 
 * Displays list of selected files with previews and status.
 */
export default function FileList({ files, uploadStates, onRemove }: FileListProps) {
  if (files.length === 0) {
    return null;
  }

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

