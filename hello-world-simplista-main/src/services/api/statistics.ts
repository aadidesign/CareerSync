
import { supabase } from '@/integrations/supabase/client';
import { RPCResponse } from '@/types/supabase';

export const getStatistics = async () => {
  const { data, error } = await supabase.rpc('get_application_statistics') as RPCResponse<{
    total: number;
    applied: number;
    interview: number;
    offer: number;
    rejected: number;
  }>;
  
  if (error) throw error;
  
  return data || {
    total: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0
  };
};
