
import { supabase } from '@/integrations/supabase/client';

// Interface for notification data
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationQueryResult {
  notifications: Notification[];
  unreadCount: number;
}

// Fetch notifications
export const getNotifications = async ({ limit = 10 }: { limit?: number } = {}): Promise<NotificationQueryResult> => {
  const { data, error } = await supabase.functions.invoke('get-notifications', {
    body: { limit }
  });
  
  if (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
  
  return data || { notifications: [], unreadCount: 0 };
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  const { error } = await supabase.functions.invoke('mark-notification-read', {
    body: { notificationId }
  });
  
  if (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<void> => {
  const { error } = await supabase.functions.invoke('mark-all-notifications-read', {
    body: {}
  });
  
  if (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};
