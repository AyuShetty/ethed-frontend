import { cn } from "@/lib/utils"
import { CloudUploadIcon, FileIcon, ImageIcon, VideoIcon, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

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
    if (acceptedFileTypes.some(type => type.includes("image"))) return ImageIcon;
    if (acceptedFileTypes.some(type => type.includes("video"))) return VideoIcon;
    return FileIcon;
  };

  const FileTypeIcon = getFileTypeIcon();

  const formatAcceptedTypes = () => {
    return acceptedFileTypes
      .map(type => {
        if (type.includes("image")) return "Images";
        if (type.includes("video")) return "Videos";
        if (type.includes("pdf")) return "PDFs";
        return "Documents";
      })
      .filter((value, index, self) => self.indexOf(value) === index)
      .join(", ");
  };

  return (
    <div className="text-center py-8">
      <div className={cn(
        "flex items-center mx-auto justify-center size-20 rounded-full mb-6 transition-all duration-300 shadow-lg",
        isDragActive 
          ? "bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 scale-110 shadow-emerald-500/20" 
          : "bg-gradient-to-br from-slate-700/50 to-slate-600/50 hover:from-emerald-500/10 hover:to-cyan-500/10 hover:scale-105"
      )}>
        <div className="relative">
          <CloudUploadIcon
            className={cn(
              "h-10 w-10 transition-all duration-300",
              isDragActive 
                ? "text-emerald-400 animate-bounce scale-110" 
                : "text-slate-300 group-hover:text-emerald-400"
            )}
          />
          <FileTypeIcon className={cn(
            "absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-slate-800 border border-slate-600 p-0.5",
            isDragActive ? "text-cyan-400 border-cyan-400" : "text-slate-400 border-slate-600"
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
        <p className="font-medium">Supported: {formatAcceptedTypes()}</p>
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
    <div className="text-center py-8">
      <div className="flex items-center mx-auto justify-center size-20 rounded-full bg-gradient-to-br from-red-500/20 to-pink-500/20 mb-6 shadow-lg shadow-red-500/20">
        <svg
          className="mx-auto h-10 w-10 text-red-400"
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
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Upload Failed</h3>
      <p className="text-sm text-red-400 mb-4 max-w-sm mx-auto">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="glass"
          size="sm"
          className="border-red-400/50 hover:border-red-400 text-red-300 hover:text-red-200"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
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
    <div className="text-center py-8">
      <div className="flex items-center mx-auto justify-center size-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 mb-6 shadow-lg shadow-cyan-500/20">
        <CloudUploadIcon className="h-10 w-10 text-cyan-400 animate-pulse" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Uploading Files...</h3>
      <p className="text-sm text-slate-300 mb-4 truncate max-w-xs mx-auto font-medium">{fileName}</p>
      
      <div className="w-full max-w-xs mx-auto space-y-2">
        <div className="flex justify-between text-xs text-slate-300">
          <span>Progress</span>
          <span className="text-emerald-400 font-semibold">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-slate-600/50 rounded-full h-2.5 shadow-inner">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2.5 rounded-full transition-all duration-300 ease-out shadow-lg shadow-emerald-500/30"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-slate-400">
          Please don't close this page
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
    <div className="text-center py-8">
      <div className="flex items-center mx-auto justify-center size-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 mb-6 shadow-lg shadow-emerald-500/20">
        <svg
          className="h-10 w-10 text-emerald-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Upload Successful!</h3>
      <p className="text-sm text-slate-300 mb-4">
        {fileCount} {fileCount === 1 ? 'file' : 'files'} uploaded successfully
      </p>
      {onReset && (
        <Button
          onClick={onReset}
          variant="gradient"
          size="sm"
          className="shadow-lg hover:shadow-xl"
        >
          Upload More Files
        </Button>
      )}
    </div>
  );
}