import React from 'react';

/**
 * This part of the code creates the footer component with Heft IQ branding
 * Displays "Powered by Heft IQ" with logo on all dashboard pages
 */
export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-4 md:px-6">
      <div className="flex items-center justify-center space-x-3">
        {/* Powered by text */}
        <span className="text-gray-500 text-sm">
          Powered by
        </span>
        
        {/* Heft IQ Logo */}
        <div className="flex items-center space-x-2">
          {/* This part of the code creates the Heft IQ logo using SVG */}
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-purple-600"
          >
            {/* Central hub */}
            <circle 
              cx="50" 
              cy="50" 
              r="12" 
              stroke="currentColor" 
              strokeWidth="3" 
              fill="none"
            />
            
            {/* Connecting lines and outer nodes */}
            {/* Top */}
            <line x1="50" y1="38" x2="50" y2="20" stroke="currentColor" strokeWidth="3"/>
            <circle cx="50" cy="15" r="5" stroke="currentColor" strokeWidth="3" fill="none"/>
            
            {/* Top Right */}
            <line x1="58.5" y1="41.5" x2="70.7" y2="29.3" stroke="currentColor" strokeWidth="3"/>
            <circle cx="75.3" cy="24.7" r="5" stroke="currentColor" strokeWidth="3" fill="none"/>
            
            {/* Right */}
            <line x1="62" y1="50" x2="80" y2="50" stroke="currentColor" strokeWidth="3"/>
            <circle cx="85" cy="50" r="5" stroke="currentColor" strokeWidth="3" fill="none"/>
            
            {/* Bottom Right */}
            <line x1="58.5" y1="58.5" x2="70.7" y2="70.7" stroke="currentColor" strokeWidth="3"/>
            <circle cx="75.3" cy="75.3" r="5" stroke="currentColor" strokeWidth="3" fill="none"/>
            
            {/* Bottom */}
            <line x1="50" y1="62" x2="50" y2="80" stroke="currentColor" strokeWidth="3"/>
            <circle cx="50" cy="85" r="5" stroke="currentColor" strokeWidth="3" fill="none"/>
            
            {/* Bottom Left */}
            <line x1="41.5" y1="58.5" x2="29.3" y2="70.7" stroke="currentColor" strokeWidth="3"/>
            <circle cx="24.7" cy="75.3" r="5" stroke="currentColor" strokeWidth="3" fill="none"/>
            
            {/* Left */}
            <line x1="38" y1="50" x2="20" y2="50" stroke="currentColor" strokeWidth="3"/>
            <circle cx="15" cy="50" r="5" stroke="currentColor" strokeWidth="3" fill="none"/>
            
            {/* Top Left */}
            <line x1="41.5" y1="41.5" x2="29.3" y2="29.3" stroke="currentColor" strokeWidth="3"/>
            <circle cx="24.7" cy="24.7" r="5" stroke="currentColor" strokeWidth="3" fill="none"/>
          </svg>
          
          {/* This part of the code displays the Heft IQ text logo */}
          <span className="text-lg font-bold text-purple-600">HEFT IQ</span>
        </div>
      </div>
    </footer>
  );
}
