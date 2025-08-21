import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This part of the code formats numbers by removing unnecessary decimals
// Examples: 6,992.00 → 6,992, 1,234.56 → 1,234.56, 100.0 → 100
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A";
  if (value === 0) return "0";
  
  // This part of the code checks if the number is effectively a whole number
  if (Number.isInteger(value) || value % 1 === 0) {
    return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  
  // This part of the code formats non-whole numbers with minimal decimal places
  return value.toLocaleString('en-US', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 2 
  });
}

// This part of the code formats currency for impact statements with proper spacing
// Examples: $3,149,821.00 → $3,149,821 impact, $1,234.56 → $1,234.56 impact
export function formatCurrencyForImpact(value: number | null | undefined): string {
  if (value === null || value === undefined || value === 0) return "$0 impact";
  
  // This part of the code checks if the number is effectively a whole number
  let formattedValue: string;
  if (Number.isInteger(value) || value % 1 === 0) {
    formattedValue = value.toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0 
    });
  } else {
    formattedValue = value.toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2 
    });
  }
  
  return `${formattedValue} impact`;
}

// This part of the code formats percentages by removing unnecessary decimals
// Examples: 0.0% → 0%, 100.0% → 100%, 45.67% → 45.67%
export function formatPercentage(value: number | null | undefined, showSign: boolean = false): string {
  if (value === null || value === undefined) return "N/A";
  
  const sign = showSign && value > 0 ? "+" : "";
  
  // This part of the code checks if the percentage is effectively a whole number
  if (Number.isInteger(value) || value % 1 === 0) {
    return `${sign}${value}%`;
  }
  
  // This part of the code formats non-whole percentages with minimal decimal places
  return `${sign}${value.toFixed(1)}%`;
}

// This part of the code formats currency values while preserving meaningful decimals
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A";
  if (value === 0) return "$0";
  
  // This part of the code handles large currency values with K/M suffixes
  if (value >= 1000000) {
    const millions = value / 1000000;
    return millions % 1 === 0 ? `$${millions}M` : `$${millions.toFixed(1)}M`;
  }
  if (value >= 1000) {
    const thousands = value / 1000;
    return thousands % 1 === 0 ? `$${thousands}K` : `$${thousands.toFixed(1)}K`;
  }
  
  // This part of the code formats smaller currency values
  return value % 1 === 0 ? `$${value.toLocaleString()}` : `$${value.toFixed(2)}`;
}
