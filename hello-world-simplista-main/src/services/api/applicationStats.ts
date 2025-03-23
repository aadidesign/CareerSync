
import { supabase } from './base';

// Get application statistics
export const getStatistics = async (): Promise<any> => {
  const { data, error } = await supabase.functions.invoke('application-statistics', {
    body: {}
  });
  
  if (error) {
    console.error('Error fetching application statistics:', error);
    throw error;
  }
  
  return data;
};
