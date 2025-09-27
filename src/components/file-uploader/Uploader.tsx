"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { X, Eye, Trash2, Download, FileIcon, ImageIcon, VideoIcon } from "lucide-react";
import { toast } from "sonner";
import { 
  RenderEmptyState, 
  RenderErrorState, 
  RenderUploadingState, 
  RenderSuccessState 
} from "./RenderState";

interface FileItem {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  errorMessage?: string;
  objectUrl: string;
  fileType: "image" | "video" | "document";
}

interface UploaderProps {
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedFileTypes?: {
    [key: string]: string[];
  };
  onUploadComplete?: (files: FileItem[]) => void;
  onFileRemove?: (fileId: string) => void;
  className?: string;
}

export default function Uploader({
  maxFiles = 5,
  maxSize = 5,
  acceptedFileTypes = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    "video/*": [".mp4", ".webm", ".mov"],
    "application/pdf": [".pdf"],
  },
  onUploadComplete,
  onFileRemove,
  className,
}: UploaderProps = {}) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "completed" | "error">("idle");
  const [globalProgress, setGlobalProgress] = useState(0);

  const generateFileId = () => `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const getFileType = (file: File): FileItem["fileType"] => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    return "document";
  };

  const getFileIcon = (fileType: FileItem["fileType"]) => {
    switch (fileType) {
      case "image": return ImageIcon;
      case "video": return VideoIcon;
      default: return FileIcon;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback((acceptedFiles: File[]) => {
      const newFiles: FileItem[] = acceptedFiles.map(file => ({
        id: generateFileId(),
        file,
        progress: 0,
        status: "pending" as const,
        objectUrl: URL.createObjectURL(file),
        fileType: getFileType(file),
      }));

      setFiles(prev => [...prev, ...newFiles]);
      toast.success(`${acceptedFiles.length} file(s) added`);
    }, []),
    
    multiple: maxFiles > 1,
    maxFiles,
    maxSize: maxSize * 1024 * 1024,
    accept: acceptedFileTypes,
    
    onDropRejected: (fileRejections) => {
      fileRejections.forEach((rejection) => {
        rejection.errors.forEach((error) => {
          switch (error.code) {
            case "file-too-large":
              toast.error(`File is too large. Max size is ${maxSize}MB.`);
              break;
            case "file-invalid-type":
              toast.error(`Invalid file type. Check supported formats.`);
              break;
            case "too-many-files":
              toast.error(`Too many files. Maximum ${maxFiles} files allowed.`);
              break;
            default:
              toast.error(error.message);
          }
        });
      });
    },
  });

  const handleRemove = useCallback((fileId: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.objectUrl);
        onFileRemove?.(fileId);
      }
      return prev.filter(f => f.id !== fileId);
    });
    toast.info("File removed");
  }, [onFileRemove]);

  const simulateUploadProgress = (fileId: string) => {
    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        setFiles(prev => prev.map(file => {
          if (file.id === fileId) {
            const newProgress = Math.min(file.progress + Math.random() * 15 + 5, 100);
            if (newProgress >= 100) {
              clearInterval(interval);
              resolve();
              return { ...file, progress: 100, status: "completed" as const };
            }
            return { ...file, progress: newProgress };
          }
          return file;
        }));
      }, 200);
    });
  };

 const handleUpload = async () => {
  if (files.length === 0) {
    toast.error("No files to upload!");
    return;
  }

  setUploadStatus("uploading");
  setGlobalProgress(0);

  try {
    // Update all files to uploading status
    setFiles(prev => prev.map(file => ({ ...file, status: "uploading" as const })));

    const uploadedFiles: FileItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const fileItem = files[i];
      const formData = new FormData();
      formData.append("file", fileItem.file);

      try {
        const response = await fetch("/api/files", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        const data = await response.json(); // { cid, url }

        uploadedFiles.push({
          ...fileItem,
          status: "completed",
          objectUrl: data.url, // replace objectUrl with Pinata gateway URL
        });

        // Update progress
        setFiles(prev =>
          prev.map(f =>
            f.id === fileItem.id ? { ...f, progress: 100, status: "completed", objectUrl: data.url } : f
          )
        );

        setGlobalProgress(((i + 1) / files.length) * 100);
      } catch (error) {
        console.error(error);
        setFiles(prev =>
          prev.map(f =>
            f.id === fileItem.id ? { ...f, status: "error", errorMessage: "Upload failed" } : f
          )
        );
      }
    }

    setUploadStatus("completed");
    onUploadComplete?.(uploadedFiles);
    toast.success("All files uploaded successfully!");

    // Reset after 3 seconds
    setTimeout(() => handleReset(), 3000);
  } catch (error) {
    setUploadStatus("error");
    toast.error("Upload failed. Please try again.");
  }
};

  const handleReset = () => {
    files.forEach(file => URL.revokeObjectURL(file.objectUrl));
    setFiles([]);
    setUploadStatus("idle");
    setGlobalProgress(0);
  };

  const handlePreview = (file: FileItem) => {
    if (file.fileType === "image") {
      // Open image in new tab or modal
      window.open(file.objectUrl, "_blank");
    } else {
      toast.info("Preview not available for this file type");
    }
  };

  const renderContent = () => {
    if (uploadStatus === "uploading") {
      const uploadingFile = files.find(f => f.status === "uploading");
      return (
        <RenderUploadingState 
          progress={globalProgress} 
          fileName={uploadingFile?.file.name || "files"} 
        />
      );
    }

    if (uploadStatus === "completed") {
      return (
        <RenderSuccessState 
          fileCount={files.length} 
          onReset={handleReset} 
        />
      );
    }

    if (uploadStatus === "error") {
      return (
        <RenderErrorState 
          message="Upload failed. Please try again." 
          onRetry={() => setUploadStatus("idle")} 
        />
      );
    }

    return (
      <>
        <RenderEmptyState 
          isDragActive={isDragActive} 
          acceptedFileTypes={Object.keys(acceptedFileTypes)} 
          maxSize={maxSize} 
        />

        {files.length > 0 && (
          <div className="mt-8 w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Selected Files ({files.length}/{maxFiles})
              </h3>
              <Button
                size="sm"
                variant="glass"
                onClick={handleReset}
                className="text-xs border-white/20 hover:border-red-400/50 text-white hover:text-red-300"
              >
                Clear All
              </Button>
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto">
              {files.map((fileItem) => {
                const FileIcon = getFileIcon(fileItem.fileType);
                return (
                  <div
                    key={fileItem.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-600/50 bg-slate-700/30 hover:bg-slate-600/30 backdrop-blur-sm transition-all duration-300"
                  >
                    <div className="flex-shrink-0">
                      {fileItem.fileType === "image" ? (
                        <img
                          src={fileItem.objectUrl}
                          alt={fileItem.file.name}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-500 shadow-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-600/50 flex items-center justify-center border border-slate-500">
                          <FileIcon className="w-6 h-6 text-slate-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {fileItem.file.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatFileSize(fileItem.file.size)}
                      </p>
                      {fileItem.status === "uploading" && (
                        <div className="mt-1">
                          <div className="flex justify-between text-xs text-slate-300 mb-1">
                            <span>Uploading...</span>
                            <span className="text-emerald-400 font-medium">{Math.round(fileItem.progress)}%</span>
                          </div>
                          <div className="w-full bg-slate-600/50 rounded-full h-1.5">
                            <div 
                              className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-1.5 rounded-full transition-all duration-300 shadow-lg shadow-emerald-500/30"
                              style={{ width: `${fileItem.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1">
                      {fileItem.fileType === "image" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreview(fileItem);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(fileItem.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleUpload();
              }}
              variant="gradient"
              size="lg"
              className="w-full"
              disabled={false}
            >
              Upload {files.length} File{files.length > 1 ? 's' : ''}
            </Button>
          </div>
        )}
      </>
    );
  };

  return (
    <Card
      {...getRootProps()}
      className={cn(
        "relative border-2 border-dashed transition-all duration-300 cursor-pointer group bg-slate-800/30 backdrop-blur-sm",
        isDragActive
          ? "border-emerald-400 bg-gradient-to-br from-emerald-900/30 to-cyan-900/30 border-solid shadow-lg shadow-emerald-500/25 scale-[1.02]"
          : "border-slate-600/50 hover:border-emerald-400/70 hover:bg-gradient-to-br hover:from-emerald-900/20 hover:to-cyan-900/20 hover:shadow-lg hover:shadow-emerald-500/10",
        uploadStatus === "uploading" && "cursor-not-allowed",
        className
      )}
    >
      <CardContent className="p-8 text-white">
        <input {...getInputProps()} />
        {renderContent()}
      </CardContent>
    </Card>
  );
}