
import { supabase } from '@/integrations/supabase/client';

// Check if job is saved by current user
export const checkJobSaved = async (jobId: string): Promise<boolean> => {
  const user = (await supabase.auth.getUser()).data.user;
  
  if (!user) {
    return false;
  }
  
  const { data, error } = await supabase
    .from('saved_jobs')
    .select('*')
    .eq('job_id', jobId)
    .eq('user_id', user.id)
    .maybeSingle();
  
  if (error) {
    console.error('Error checking saved job status:', error);
    throw error;
  }
  
  return !!data;
};

// Toggle job saved status
export const toggleSavedJob = async (jobId: string, action: 'save' | 'unsave'): Promise<void> => {
  const user = (await supabase.auth.getUser()).data.user;
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  if (action === 'save') {
    const { error } = await supabase
      .from('saved_jobs')
      .insert({
        job_id: jobId,
        user_id: user.id,
        saved_at: new Date().toISOString()
      });
      
    if (error) {
      console.error('Error saving job:', error);
      throw error;
    }
  } else {
    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('job_id', jobId)
      .eq('user_id', user.id);
      
    if (error) {
      console.error('Error unsaving job:', error);
      throw error;
    }
  }
};

// Re-export functions from notificationApiService so components can still import from api.ts
export { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from './notificationApiService';
