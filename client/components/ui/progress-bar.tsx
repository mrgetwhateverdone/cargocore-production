// This part of the code creates a standardized progress bar component that prevents overflow issues
// Consolidates all progress bar patterns and ensures responsive behavior

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  colorScheme?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
  // This part of the code allows custom color logic based on value
  customColorLogic?: (value: number) => string;
}

// This part of the code provides standardized progress bar with overflow protection
export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = false,
  size = "md",
  colorScheme = "default",
  className,
  customColorLogic
}: ProgressBarProps) {
  // This part of the code ensures value never exceeds max to prevent overflow
  const safeValue = Math.min(Math.max(value, 0), max);
  const percentage = (safeValue / max) * 100;

  // This part of the code determines size classes
  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  // This part of the code determines color classes with fallback safety
  const getColorClass = () => {
    if (customColorLogic) {
      return customColorLogic(safeValue);
    }

    switch (colorScheme) {
      case "success":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "danger":
        return "bg-red-500";
      case "info":
        return "bg-blue-500";
      default:
        // This part of the code provides automatic color logic for efficiency metrics
        if (percentage >= 85) return "bg-green-500";
        if (percentage >= 70) return "bg-blue-500";
        if (percentage >= 50) return "bg-yellow-500";
        return "bg-red-500";
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm font-semibold text-gray-900">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      
      {/* This part of the code creates the progress bar container with overflow protection */}
      <div className={cn("w-full bg-gray-200 rounded-full overflow-hidden", sizeClasses[size])}>
        <div
          className={cn("rounded-full transition-all duration-300 ease-out", sizeClasses[size], getColorClass())}
          style={{ 
            width: `${percentage}%`,
            minWidth: percentage > 0 ? "2px" : "0px" // This ensures small values are visible
          }}
        />
      </div>
    </div>
  );
}

// This part of the code provides a circular progress indicator for compact spaces
export function CircularProgress({
  value,
  max = 100,
  size = 48,
  strokeWidth = 4,
  label,
  colorScheme = "default",
  className
}: {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  colorScheme?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}) {
  const safeValue = Math.min(Math.max(value, 0), max);
  const percentage = (safeValue / max) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getStrokeColor = () => {
    switch (colorScheme) {
      case "success": return "stroke-green-500";
      case "warning": return "stroke-yellow-500";
      case "danger": return "stroke-red-500";
      case "info": return "stroke-blue-500";
      default:
        if (percentage >= 85) return "stroke-green-500";
        if (percentage >= 70) return "stroke-blue-500";
        if (percentage >= 50) return "stroke-yellow-500";
        return "stroke-red-500";
    }
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn("transition-all duration-300 ease-out", getStrokeColor())}
        />
      </svg>
      
      {/* Center label */}
      {label && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold text-gray-900">{label}</span>
        </div>
      )}
    </div>
  );
}

// This part of the code provides a progress indicator with multiple segments
export function SegmentedProgress({
  segments,
  total,
  height = "h-2",
  className
}: {
  segments: Array<{
    value: number;
    color: string;
    label?: string;
  }>;
  total: number;
  height?: string;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      <div className={cn("w-full bg-gray-200 rounded-full overflow-hidden flex", height)}>
        {segments.map((segment, index) => {
          const percentage = (segment.value / total) * 100;
          return (
            <div
              key={index}
              className={segment.color}
              style={{ width: `${percentage}%` }}
              title={segment.label}
            />
          );
        })}
      </div>
    </div>
  );
}
