"use client";

interface ProgressBarProps {
  progress: number;
  status: string;
  showRetry?: boolean;
  retryCount?: number;
}

export default function ProgressBar({ progress, status, showRetry, retryCount }: ProgressBarProps) {
  return (
    <div className="w-full bg-gray-100 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{status}</span>
        {showRetry && retryCount !== undefined && retryCount > 0 && (
          <span className="text-xs text-amber-600 flex items-center">
            <svg className="w-3 h-3 mr-1 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Retry attempt {retryCount}
          </span>
        )}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-2.5 rounded-full bg-indigo-600 transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {progress > 5 && (
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          )}
        </div>
      </div>
      
      <div className="text-xs text-gray-600 text-right">
        {progress}%
      </div>
    </div>
  );
}
