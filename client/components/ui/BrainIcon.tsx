// This part of the code creates a reusable Robot Head icon component to indicate AI-generated content
// It uses the app's primary blue color for consistency and follows the Lucide icon pattern

import React from 'react';

interface RobotIconProps {
  className?: string;
  size?: number;
}

export function BrainIcon({ className = "h-5 w-5", size }: RobotIconProps) {
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
      {/* This part of the code draws the robot head shape */}
      <rect x="6" y="6" width="12" height="12" rx="2" ry="2" />
      {/* This part of the code adds the robot antenna */}
      <path d="M12 2v4" />
      <circle cx="12" cy="2" r="1" />
      {/* This part of the code creates the robot eyes */}
      <circle cx="9" cy="10" r="1" />
      <circle cx="15" cy="10" r="1" />
      {/* This part of the code adds the robot mouth */}
      <rect x="9" y="14" width="6" height="2" rx="1" />
      {/* This part of the code adds side details to make it more robotic */}
      <path d="M6 12h-2" />
      <path d="M20 12h-2" />
    </svg>
  );
}
