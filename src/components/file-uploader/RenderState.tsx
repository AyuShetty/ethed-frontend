import { cn } from "@/lib/utils"
import { CloudUploadIcon, FileIcon, ImageIcon, VideoIcon } from "lucide-react"

interface RenderEmptyStateProps {
  isDragActive: boolean;
  acceptedFileTypes?: string[];
  maxSize?: number;
}

export function RenderEmptyState({ 
  isDragActive, 
  acceptedFileTypes = ["images"], 
  maxSize = 5 
}: RenderEmptyStateProps) {
  const getFileTypeIcon = () => {
    if (acceptedFileTypes.includes("image")) return ImageIcon;
    if (acceptedFileTypes.includes("video")) return VideoIcon;
    return FileIcon;
  };

  const FileTypeIcon = getFileTypeIcon();

  return (
    <div className="text-center">
      <div className={cn(
        "flex items-center mx-auto justify-center size-20 rounded-full mb-6 transition-all duration-300",
        isDragActive 
          ? "bg-gradient-to-br from-emerald-100 to-cyan-100 scale-110" 
          : "bg-gradient-to-br from-slate-100 to-slate-50 hover:from-emerald-50 hover:to-cyan-50"
      )}>
        <div className="relative">
          <CloudUploadIcon
            className={cn(
              "h-10 w-10 transition-all duration-300",
              isDragActive 
                ? "text-emerald-600 animate-bounce scale-110" 
                : "text-slate-400 group-hover:text-emerald-500"
            )}
          />
          <FileTypeIcon className={cn(
            "absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white p-0.5",
            isDragActive ? "text-cyan-600" : "text-slate-500"
          )} />
        </div>
      </div>
      
      <h3 className={cn(
        "text-lg font-semibold mb-2 transition-colors duration-200",
        isDragActive ? "text-emerald-300" : "text-white"
      )}>
        {isDragActive ? "Drop files here" : "Upload your files"}
      </h3>
      
      <p className="text-sm text-slate-300 mb-4">
        Drag and drop or click to select files
      </p>
      
      <div className="space-y-1 text-xs text-slate-400">
        <p>Supported: {acceptedFileTypes.join(", ")}</p>
        <p>Max size: {maxSize}MB per file</p>
      </div>
    </div>
  );
}


interface RenderErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function RenderErrorState({ message, onRetry }: RenderErrorStateProps) {
  return (
    <div className="text-center">
      <div className="flex items-center mx-auto justify-center size-20 rounded-full bg-gradient-to-br from-red-100 to-pink-100 mb-6">
        <svg
          className="mx-auto h-10 w-10 text-red-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}    
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Upload Failed</h3>
      <p className="text-sm text-red-400 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}

interface RenderUploadingStateProps {
  progress: number;
  fileName: string;
}

export function RenderUploadingState({ progress, fileName }: RenderUploadingStateProps) {
  return (
    <div className="text-center">
      <div className="flex items-center mx-auto justify-center size-20 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 mb-6">
        <CloudUploadIcon className="h-10 w-10 text-blue-600 animate-pulse" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Uploading...</h3>
      <p className="text-sm text-slate-300 mb-4 truncate max-w-xs mx-auto">{fileName}</p>
      
      <div className="w-full max-w-xs mx-auto">
        <div className="flex justify-between text-xs text-slate-300 mb-1">
          <span>Progress</span>
          <span className="text-emerald-400 font-medium">{progress}%</span>
        </div>
        <div className="w-full bg-slate-600/50 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full transition-all duration-300 ease-out shadow-lg shadow-emerald-500/30"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

interface RenderSuccessStateProps {
  fileCount: number;
  onReset?: () => void;
}

export function RenderSuccessState({ fileCount, onReset }: RenderSuccessStateProps) {
  return (
    <div className="text-center">
      <div className="flex items-center mx-auto justify-center size-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 mb-6">
        <svg
          className="h-10 w-10 text-green-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Upload Successful!</h3>
      <p className="text-sm text-slate-300 mb-4">
        {fileCount} {fileCount === 1 ? 'file' : 'files'} uploaded successfully
      </p>
      {onReset && (
        <button
          onClick={onReset}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          Upload more files
        </button>
      )}
    </div>
  );
}