
import { supabase } from '@/integrations/supabase/client';
import { RPCResponse } from '@/types/supabase';

export const getApplications = async () => {
  const { data, error } = await supabase.rpc('get_user_applications') as RPCResponse<Array<{
    id: string;
    job_id: string;
    user_id: string;
    status: string;
    applied_at: string;
    updated_at: string;
    job_title?: string;
    company?: string;
  }>>;
  
  if (error) throw error;
  
  return data || [];
};

export const getApplicationById = async (id: string) => {
  const { data, error } = await supabase.rpc('get_application_by_id', {
    application_id: id
  }) as RPCResponse<{
    id: string;
    job_id: string;
    user_id: string;
    status: string;
    applied_at: string;
    updated_at: string;
    job_title?: string;
    company?: string;
  }>;
  
  if (error) throw error;
  
  return data;
};

export const createApplication = async (jobId: string, notes?: string) => {
  const { data, error } = await supabase.rpc('create_application', {
    job_id: jobId,
    notes_content: notes || null
  }) as RPCResponse<{
    id: string;
  }>;
  
  if (error) throw error;
  
  return data;
};
