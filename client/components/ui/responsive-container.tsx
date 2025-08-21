// This part of the code creates standardized responsive container components
// Ensures consistent breakpoints and prevents overflow issues across all pages

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ResponsiveContainerProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

// This part of the code provides a standardized container with responsive padding
export function ResponsiveContainer({
  children,
  maxWidth = "full",
  padding = "md",
  className
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full"
  };

  const paddingClasses = {
    sm: "p-2 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8",
    xl: "p-8 sm:p-12"
  };

  return (
    <div className={cn("w-full mx-auto", maxWidthClasses[maxWidth], paddingClasses[padding], className)}>
      {children}
    </div>
  );
}

// This part of the code provides a responsive grid layout system
interface ResponsiveGridProps {
  children: ReactNode;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function ResponsiveGrid({
  children,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = "md",
  className
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8"
  };

  const getGridCols = () => {
    const classes = ["grid"];
    
    if (columns.sm) classes.push(`grid-cols-${columns.sm}`);
    if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
    
    return classes.join(" ");
  };

  return (
    <div className={cn(getGridCols(), gapClasses[gap], className)}>
      {children}
    </div>
  );
}

// This part of the code provides responsive card layouts with consistent spacing
interface ResponsiveCardProps {
  children: ReactNode;
  variant?: "default" | "elevated" | "outlined" | "flat";
  padding?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

export function ResponsiveCard({
  children,
  variant = "default",
  padding = "md",
  className,
  onClick
}: ResponsiveCardProps) {
  const variantClasses = {
    default: "bg-white border border-gray-200 shadow-sm",
    elevated: "bg-white border border-gray-200 shadow-lg",
    outlined: "bg-white border-2 border-gray-300",
    flat: "bg-gray-50"
  };

  const paddingClasses = {
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6", 
    lg: "p-6 sm:p-8"
  };

  return (
    <div 
      className={cn(
        "rounded-lg transition-all duration-200",
        variantClasses[variant],
        paddingClasses[padding],
        onClick && "cursor-pointer hover:shadow-md",
        "overflow-hidden", // This prevents content overflow
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// This part of the code provides responsive flex layouts
interface ResponsiveFlexProps {
  children: ReactNode;
  direction?: "row" | "col" | "row-reverse" | "col-reverse";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  wrap?: boolean;
  gap?: "sm" | "md" | "lg" | "xl";
  className?: string;
  responsive?: {
    sm?: Partial<ResponsiveFlexProps>;
    md?: Partial<ResponsiveFlexProps>;
    lg?: Partial<ResponsiveFlexProps>;
  };
}

export function ResponsiveFlex({
  children,
  direction = "row",
  align = "start",
  justify = "start",
  wrap = false,
  gap = "md",
  className,
  responsive = {}
}: ResponsiveFlexProps) {
  const directionClasses = {
    row: "flex-row",
    col: "flex-col",
    "row-reverse": "flex-row-reverse",
    "col-reverse": "flex-col-reverse"
  };

  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch"
  };

  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly"
  };

  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8"
  };

  const getResponsiveClasses = () => {
    let classes = [];
    
    // Base classes
    classes.push("flex");
    classes.push(directionClasses[direction]);
    classes.push(alignClasses[align]);
    classes.push(justifyClasses[justify]);
    classes.push(gapClasses[gap]);
    if (wrap) classes.push("flex-wrap");

    // Responsive classes
    Object.entries(responsive).forEach(([breakpoint, props]) => {
      if (props.direction) classes.push(`${breakpoint}:${directionClasses[props.direction]}`);
      if (props.align) classes.push(`${breakpoint}:${alignClasses[props.align]}`);
      if (props.justify) classes.push(`${breakpoint}:${justifyClasses[props.justify]}`);
      if (props.gap) classes.push(`${breakpoint}:${gapClasses[props.gap]}`);
    });

    return classes.join(" ");
  };

  return (
    <div className={cn(getResponsiveClasses(), className)}>
      {children}
    </div>
  );
}

// This part of the code provides a responsive table wrapper that handles overflow
interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className={cn("overflow-x-auto -mx-4 sm:mx-0", className)}>
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
