
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService } from '@/services/notificationService';

/**
 * Hook to set up realtime connections for authenticated users
 */
export function useRealtime() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Only set up realtime connections when user is authenticated
    if (user && !isLoading) {
      // Initialize the notification service
      notificationService.initialize(user.id);
      
      // Return cleanup function
      return () => {
        notificationService.disconnect();
      };
    }
  }, [user, isLoading]);
}
