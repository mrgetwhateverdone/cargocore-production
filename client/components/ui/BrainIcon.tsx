// This part of the code creates a reusable Brain icon component to indicate AI-generated content
// It uses the app's primary blue color for consistency and follows the Lucide icon pattern

import React from 'react';

interface BrainIconProps {
  className?: string;
  size?: number;
}

export function BrainIcon({ className = "h-4 w-4", size }: BrainIconProps) {
  // This part of the code determines the size based on either className or explicit size prop
  const sizeStyle = size ? { width: size, height: size } : {};
  
  return (
    <svg
      className={className}
      style={sizeStyle}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="AI Generated"
    >
      {/* This part of the code draws the brain shape using SVG paths */}
      <path d="M12 5a3 3 0 0 0-3 3 3 3 0 0 0-3 3c0 2 1.5 3 1.5 3s1.5 1 1.5 3c0 1 0 1 0 1h6s0 0 0-1c0-2 1.5-3 1.5-3s1.5-1 1.5-3a3 3 0 0 0-3-3 3 3 0 0 0-3-3z"/>
      <path d="M9.5 12.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
      <path d="M17.5 12.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
      {/* This part of the code adds the brain fold lines for detail */}
      <path d="M9 16c.5.5 1.5 1 3 1s2.5-.5 3-1"/>
      <path d="M8 12c0-1 .5-2 1.5-2.5"/>
      <path d="M16 12c0-1-.5-2-1.5-2.5"/>
    </svg>
  );
}
