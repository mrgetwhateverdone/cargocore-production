import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// This part of the code defines standardized loading spinner sizes and styles
interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  color?: "blue" | "gray" | "green" | "red" | "yellow";
}

export function LoadingSpinner({
  size = "md",
  className,
  color = "blue",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  const colorClasses = {
    blue: "text-blue-600",
    gray: "text-gray-500",
    green: "text-green-600",
    red: "text-red-600",
    yellow: "text-yellow-600",
  };

  return (
    <Loader2
      className={cn("animate-spin", sizeClasses[size], colorClasses[color], className)}
    />
  );
}

// This part of the code provides standardized loading state configurations
interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: "blue" | "gray" | "green" | "red" | "yellow";
}

export function LoadingState({
  message = "Loading...",
  className,
  size = "lg",
  color = "blue",
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12",
        className,
      )}
    >
      <LoadingSpinner size={size} color={color} />
      <p className="mt-4 text-sm text-gray-500">{message}</p>
    </div>
  );
}

// This part of the code provides a standardized loading card component
export function LoadingCard({ 
  className, 
  message = "Loading...",
  size = "sm" 
}: { 
  className?: string;
  message?: string;
  size?: "xs" | "sm" | "md";
}) {
  return (
    <div
      className={cn(
        "bg-white p-4 rounded-lg border border-gray-200 shadow-sm",
        "flex items-center justify-center",
        className,
      )}
    >
      <LoadingSpinner size={size} />
      <span className="ml-2 text-sm text-gray-500">{message}</span>
    </div>
  );
}

// This part of the code provides standardized inline loading patterns
export function InlineLoading({ 
  message = "Loading...",
  size = "xs",
  className 
}: {
  message?: string;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  return (
    <div className={cn("flex items-center", className)}>
      <LoadingSpinner size={size} />
      <span className="ml-2 text-sm text-gray-600">{message}</span>
    </div>
  );
}

// This part of the code provides skeleton loading for tables and lists
export function SkeletonLoader({ 
  rows = 5,
  className 
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}
