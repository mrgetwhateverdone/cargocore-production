import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * This part of the code creates a protected route wrapper that prevents flash issues
 * Shows loading state while authentication is being determined
 */
export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isSignedIn, isLoaded } = useUser();

  // This part of the code shows loading state while authentication loads
  if (!isLoaded) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading CargoCore...</p>
        </div>
      </div>
    );
  }

  // This part of the code renders protected content only when user is authenticated
  if (!isSignedIn) {
    return null; // Let Clerk's SignedIn component handle the redirect
  }

  return <>{children}</>;
}
