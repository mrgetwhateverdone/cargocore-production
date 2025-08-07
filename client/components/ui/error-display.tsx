import { cn } from "@/lib/utils";
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Button } from "./button";

interface ErrorDisplayProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
  showRetry?: boolean;
}

export function ErrorDisplay({
  message = "Unable to load data - Refresh to retry or check API connection",
  onRetry,
  className,
  showRetry = true,
}: ErrorDisplayProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12",
        className,
      )}
    >
      <div className="flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
        <WifiOff className="h-8 w-8 text-red-600" />
      </div>

      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Connection Error
      </h3>
      <p className="text-sm text-gray-500 text-center max-w-md mb-6">
        {message}
      </p>

      {showRetry && onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="inline-flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      )}
    </div>
  );
}

export function ErrorCard({
  message = "Unable to load data - Refresh to retry or check API connection",
  onRetry,
  className,
}: ErrorDisplayProps) {
  return (
    <div
      className={cn(
        "bg-white p-6 rounded-lg border border-red-200 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-800 mb-1">
            Data Loading Error
          </h4>
          <p className="text-sm text-red-700 mb-3">{message}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface APIStatusProps {
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  children: React.ReactNode;
  loadingMessage?: string;
}

export function APIStatus({
  isLoading,
  error,
  onRetry,
  children,
  loadingMessage = "Loading data...",
}: APIStatusProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-3" />
          <span className="text-sm text-gray-500">{loadingMessage}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay message={error.message} onRetry={onRetry} />;
  }

  return <>{children}</>;
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  );
}
