import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
  showLoginPrompt?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallbackPath = '/auth',
  showLoginPrompt = true 
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-premium-gradient text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-silver-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated
  if (!user) {
    // If showLoginPrompt is true, show a login prompt instead of redirecting
    if (showLoginPrompt) {
      return (
        <div className="min-h-screen bg-premium-gradient text-white">
          <main className="pt-24 pb-20">
            <div className="container mx-auto px-4 md:px-6">
              <div className="max-w-md mx-auto text-center">
                <Card className="premium-glass border-white/10">
                  <CardHeader>
                    <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-white/5 mb-4">
                      <LogIn className="h-8 w-8 text-navy-500" />
                    </div>
                    <CardTitle className="text-2xl font-semibold">Authentication Required</CardTitle>
                    <CardDescription className="text-silver-400">
                      You need to be logged in to access this page and all its features.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      onClick={() => window.location.href = `${fallbackPath}?redirect=${encodeURIComponent(location.pathname)}`}
                      className="w-full premium-button"
                      size="lg"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Log In
                    </Button>
                    <p className="text-sm text-silver-400">
                      Don't have an account?{' '}
                      <button 
                        onClick={() => window.location.href = `${fallbackPath}?mode=register&redirect=${encodeURIComponent(location.pathname)}`}
                        className="text-navy-500 hover:text-teal-500 transition-colors underline"
                      >
                        Sign up here
                      </button>
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      );
    }

    // Redirect to login page with return URL
    return <Navigate to={`${fallbackPath}?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
