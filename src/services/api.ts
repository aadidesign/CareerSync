
import { supabase } from '@/integrations/supabase/client';

// Job Search API
export const searchJobs = async (params: {
  query?: string;
  location?: string;
  experienceLevel?: string;
  jobType?: string;
  remote?: boolean;
  page?: number;
  limit?: number;
}) => {
  const searchParams = new URLSearchParams();
  
  if (params.query) searchParams.append('query', params.query);
  if (params.location) searchParams.append('location', params.location);
  if (params.experienceLevel) searchParams.append('experienceLevel', params.experienceLevel);
  if (params.jobType) searchParams.append('jobType', params.jobType);
  if (params.remote !== undefined) searchParams.append('remote', String(params.remote));
  if (params.page) searchParams.append('page', String(params.page));
  if (params.limit) searchParams.append('limit', String(params.limit));
  
  const queryString = searchParams.toString();
  const { data, error } = await supabase.functions.invoke('search-jobs', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: { queryParams: queryString }
  });
  
  if (error) throw error;
  return data;
};

// Job Detail API
export const getJobById = async (jobId: string) => {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      job_skills(skill)
    `)
    .eq('id', jobId)
    .single();
  
  if (error) throw error;
  return data;
};

// Saved Jobs API
export const toggleSavedJob = async (jobId: string, action: 'save' | 'unsave') => {
  const { data, error } = await supabase.functions.invoke('toggle-saved-job', {
    method: 'POST',
    body: { jobId, action }
  });
  
  if (error) throw error;
  return data;
};

export const getSavedJobs = async () => {
  const { data, error } = await supabase
    .from('saved_jobs')
    .select(`
      job_id,
      jobs(*)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data.map(item => ({
    id: item.job_id,
    ...item.jobs
  }));
};

export const checkJobSaved = async (jobId: string) => {
  const { data, error } = await supabase
    .from('saved_jobs')
    .select('id')
    .eq('job_id', jobId)
    .maybeSingle();
  
  if (error) throw error;
  return !!data;
};

// Job Applications API
export const submitApplication = async ({
  jobId,
  resumeUrl,
  coverLetterUrl,
  notes
}: {
  jobId: string;
  resumeUrl?: string;
  coverLetterUrl?: string;
  notes?: string;
}) => {
  const { data, error } = await supabase.functions.invoke('submit-application', {
    method: 'POST',
    body: { jobId, resumeUrl, coverLetterUrl, notes }
  });
  
  if (error) throw error;
  return data;
};

export const getApplications = async () => {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      jobs(*)
    `)
    .order('applied_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getApplicationById = async (applicationId: string) => {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      jobs(*),
      application_notes(*)
    `)
    .eq('id', applicationId)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateApplicationStatus = async (applicationId: string, status: string) => {
  const { data, error } = await supabase
    .from('applications')
    .update({ 
      status, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', applicationId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const addApplicationNote = async (applicationId: string, note: string) => {
  const { data, error } = await supabase
    .from('application_notes')
    .insert([{
      application_id: applicationId,
      note,
      user_id: (await supabase.auth.getUser()).data.user?.id
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Notifications API
export const getNotifications = async (params?: {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}) => {
  const { data, error } = await supabase.functions.invoke('get-notifications', {
    method: 'POST',
    body: { 
      limit: params?.limit,
      offset: params?.offset,
      unreadOnly: params?.unreadOnly 
    }
  });
  
  if (error) throw error;
  return data;
};

export const markNotificationAsRead = async (notificationId: string) => {
  // Using the edge function instead of direct DB access for better error handling and logging
  const { data, error } = await supabase.functions.invoke('mark-notification', {
    method: 'POST',
    body: { notificationId, read: true }
  });
  
  if (error) throw error;
  return data;
};

export const markAllNotificationsAsRead = async () => {
  // Using the edge function instead of direct DB access for better error handling and logging
  const { data, error } = await supabase.functions.invoke('mark-all-notifications', {
    method: 'POST',
    body: { read: true }
  });
  
  if (error) throw error;
  return data;
};
