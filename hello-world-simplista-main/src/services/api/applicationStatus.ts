
import { supabase } from '@/integrations/supabase/client';
import { RPCResponse } from '@/types/supabase';

export const updateApplicationStatus = async (applicationId: string, status: string) => {
  const { data, error } = await supabase.rpc('update_application_status', {
    application_id: applicationId,
    new_status: status
  }) as RPCResponse<unknown>;
  
  if (error) throw error;
  
  return data;
};

export const getApplicationStatusHistory = async (applicationId: string) => {
  const { data, error } = await supabase.rpc('get_application_status_history', {
    application_id: applicationId
  }) as RPCResponse<Array<{
    id: string;
    status: string;
    date: string;
    updated_by: string;
  }>>;
  
  if (error) throw error;
  
  return data || [];
};

export const getApplicationStatusHistoryForApplication = async (applicationId: string) => {
  return getApplicationStatusHistory(applicationId);
};

export const addApplicationStatusHistory = async (applicationId: string, status: string) => {
  const { data, error } = await supabase.rpc('add_application_status_history', {
    application_id: applicationId,
    status_value: status
  }) as RPCResponse<unknown>;
  
  if (error) throw error;
  
  return data;
};
