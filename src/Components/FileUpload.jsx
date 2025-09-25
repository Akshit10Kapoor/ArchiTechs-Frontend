import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronUp, ChevronDown, FileText } from 'lucide-react';

const FileUpload = ({ files = [], onUploadComplete, onCancel, onRemoveFile }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [fileProgress, setFileProgress] = useState({});
  const [uploadSession, setUploadSession] = useState(null);
  const timersRef = useRef({});
  const completionTimeoutRef = useRef(null);


  useEffect(() => {
    if (files.length === 0) {

      setFileProgress({});
      setUploadSession(null);
      Object.values(timersRef.current).forEach(clearInterval);
      timersRef.current = {};
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
        completionTimeoutRef.current = null;
      }
      return;
    }

    const currentFileIds = files.map(f => f.id);
    const newSession = currentFileIds.join(',');


    if (uploadSession !== newSession) {
      setUploadSession(newSession);


      Object.values(timersRef.current).forEach(clearInterval);
      timersRef.current = {};

      const newProgress = {};
      files.forEach(file => {
        newProgress[file.id] = {
          progress: 0,
          timeLeft: 10,
          status: 'uploading'
        };
      });
      setFileProgress(newProgress);

      // Start upload simulation for all files
      files.forEach(file => {
        simulateUpload(file.id);
      });
    } else {
      // Handle added files to existing session
      const existingIds = Object.keys(fileProgress);
      const newFileIds = currentFileIds.filter(id => !existingIds.includes(id));

      if (newFileIds.length > 0) {
        setFileProgress(prev => {
          const updated = { ...prev };
          newFileIds.forEach(fileId => {
            updated[fileId] = {
              progress: 0,
              timeLeft: 10,
              status: 'uploading'
            };
          });
          return updated;
        });

        // Start upload for new files
        newFileIds.forEach(fileId => {
          simulateUpload(fileId);
        });
      }
    }
  }, [files, uploadSession]);

  // Clean up removed files from progress
  useEffect(() => {
    const currentFileIds = files.map(f => f.id);
    const progressFileIds = Object.keys(fileProgress);
    const removedFileIds = progressFileIds.filter(id => !currentFileIds.includes(id));

    if (removedFileIds.length > 0) {
      setFileProgress(prev => {
        const updated = { ...prev };
        removedFileIds.forEach(id => {
          delete updated[id];
          // Clear timer for removed file
          if (timersRef.current[id]) {
            clearInterval(timersRef.current[id]);
            delete timersRef.current[id];
          }
        });
        return updated;
      });
    }
  }, [files, fileProgress]);

  // Check for completion
  useEffect(() => {
    if (files.length === 0) return;

    const progressEntries = Object.entries(fileProgress);
    const currentFileIds = files.map(f => f.id);

    // Only check completion if we have progress for all current files
    const hasAllProgress = currentFileIds.every(id => fileProgress[id]);

    if (hasAllProgress && progressEntries.length > 0) {
      const allCompleted = progressEntries
        .filter(([id]) => currentFileIds.includes(id))
        .every(([, progress]) => progress.status === 'completed');

      if (allCompleted && onUploadComplete) {
        // Clear any existing timeout
        if (completionTimeoutRef.current) {
          clearTimeout(completionTimeoutRef.current);
        }

        // Immediate completion trigger for smooth transition
        onUploadComplete();
      }
    }
  }, [fileProgress, files, onUploadComplete]);

  const simulateUpload = useCallback((fileId) => {
    // Clear any existing timer for this file
    if (timersRef.current[fileId]) {
      clearInterval(timersRef.current[fileId]);
    }

    let progress = 0;
    const totalTime = 10000; // 10 seconds
    const interval = 100; // Update every 100ms
    const increment = (interval / totalTime) * 100;

    const timer = setInterval(() => {
      progress += increment;
      const currentProgress = Math.min(Math.round(progress), 100);
      const timeLeft = Math.max(0, Math.ceil((totalTime - (progress / 100) * totalTime) / 1000));
      const status = progress >= 100 ? 'completed' : 'uploading';

      setFileProgress(prev => {
        // Only update if the file still exists
        if (!prev[fileId]) return prev;

        return {
          ...prev,
          [fileId]: {
            progress: currentProgress,
            timeLeft,
            status
          }
        };
      });

      if (progress >= 100) {
        clearInterval(timer);
        delete timersRef.current[fileId];
      }
    }, interval);

    timersRef.current[fileId] = timer;
  }, []);

  // Calculate derived values with safety checks
  const totalFiles = files.length;
  const currentFileIds = files.map(f => f.id);
  const relevantProgress = Object.entries(fileProgress)
    .filter(([id]) => currentFileIds.includes(id))
    .map(([, progress]) => progress);

  const avgProgress = relevantProgress.length > 0
    ? Math.round(relevantProgress.reduce((sum, fp) => sum + (fp?.progress || 0), 0) / relevantProgress.length)
    : 0;

  const avgTimeLeft = relevantProgress.length > 0
    ? Math.max(...relevantProgress.map(fp => fp?.timeLeft || 0))
    : 0;

  const handleRemoveFile = useCallback((fileId) => {
    // Clear timer for this file
    if (timersRef.current[fileId]) {
      clearInterval(timersRef.current[fileId]);
      delete timersRef.current[fileId];
    }

    if (onRemoveFile) {
      onRemoveFile(fileId);
    }
  }, [onRemoveFile]);

  const handleCancel = useCallback(() => {
    // Clear all timers
    Object.values(timersRef.current).forEach(clearInterval);
    timersRef.current = {};

    // Clear completion timeout
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
    }

    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(clearInterval);
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
    };
  }, []);

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {/* File list with smooth expand/collapse animation */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-2">
          {files.map(file => {
            const fileProgressData = fileProgress[file.id] || { progress: 0, timeLeft: 10, status: 'uploading' };

            return (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-100 rounded-lg border border-gray-200 transform transition-all duration-300 ease-out"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#fef0fe] p-2 rounded-lg flex items-center justify-center">
                    <FileText size={20} className="" />
                  </div>
                  <span className="text-base font-medium text-gray-900">{file.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </span>
                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors duration-200"
                  >
                    <X size={20} className="" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload summary bar */}
      <div className="flex items-center justify-between p-3 bg-white border-t border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-base font-normal">
            Uploading {totalFiles} file{totalFiles !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Progress circle */}
          <div className="relative w-6 h-6">
            <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 24 24">
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7636D9" />
                  <stop offset="100%" stopColor="#E16CDF" />
                </linearGradient>
              </defs>
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="#E5E7EB"
                strokeWidth="2"
                fill="none"
              />
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="url(#progressGradient)"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${Math.min(avgProgress, 100) * 0.628} 62.8`}
                className="transition-all duration-300"
              />
            </svg>
          </div>
          {avgTimeLeft > 0 && (
            <span className="text-xs text-gray-500">
              {avgTimeLeft} sec left
            </span>
          )}
          <span className="text-xs text-gray-500">
            {Math.min(avgProgress, 100)}%
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {isExpanded ? <ChevronUp size={25} /> : <ChevronDown size={25} />}
          </button>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={20} className="" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;