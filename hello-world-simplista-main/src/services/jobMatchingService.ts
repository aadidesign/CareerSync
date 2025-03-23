import { supabase } from '@/integrations/supabase/client';
import { MatchingPreferences } from '@/types/supabase';
import { RPCResponse } from '@/types/supabase';

// Define the interface for matching preferences return type
interface MatchingPreferencesResponse {
  job_titles: string[];
  locations: string[];
  is_remote: boolean;
  min_salary: number;
  max_salary: number;
  threshold: number;
  skills: string[];
}

class JobMatchingService {
  // Get job matches based on user profile and preferences
  public async getJobMatches(page: number = 1, limit: number = 10): Promise<{
    jobs: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error('User not authenticated');
    }
    
    const userId = userData.user.id;
    
    // Call the job-matches edge function
    const { data, error } = await supabase.functions.invoke('job-matches', {
      body: { page, limit, userId }
    });
    
    if (error) {
      console.error('Error fetching job matches:', error);
      throw error;
    }
    
    return data;
  }
  
  // Configure job matching preferences
  public async updateMatchingPreferences(preferences: Partial<{
    jobTitles: string[];
    skills: string[];
    locations: string[];
    remote: boolean;
    salaryMin: number;
    salaryMax: number;
    matchThreshold: number;
  }>): Promise<boolean> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error('User not authenticated');
    }
    
    try {
      const { error } = await supabase.rpc('update_matching_preferences', {
        job_titles: preferences.jobTitles || [],
        user_locations: preferences.locations || [],
        is_remote: preferences.remote || false,
        min_salary: preferences.salaryMin || 0,
        max_salary: preferences.salaryMax || 200000,
        threshold: preferences.matchThreshold || 60,
        user_skills: preferences.skills || []
      }) as RPCResponse<unknown>;
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating matching preferences:', error);
      return false;
    }
  }
  
  // Get the current matching preferences
  public async getMatchingPreferences(): Promise<{
    jobTitles: string[];
    skills: string[];
    locations: string[];
    remote: boolean;
    salaryMin: number;
    salaryMax: number;
    matchThreshold: number;
  } | null> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error('User not authenticated');
    }
    
    try {
      const { data, error } = await supabase.rpc('get_matching_preferences') as RPCResponse<MatchingPreferencesResponse>;
      
      if (error) throw error;
      
      if (!data) return null;
      
      return {
        jobTitles: data.job_titles || [],
        locations: data.locations || [],
        remote: data.is_remote || false,
        salaryMin: data.min_salary || 0,
        salaryMax: data.max_salary || 200000,
        matchThreshold: data.threshold || 60,
        skills: data.skills || []
      };
    } catch (error) {
      console.error('Error fetching preferences:', error);
      return null;
    }
  }
  
  // Get trending jobs in user's field
  public async getTrendingJobs(limit: number = 5): Promise<any[]> {
    const { data, error } = await supabase.functions.invoke('trending-jobs', {
      body: { limit }
    });
    
    if (error) {
      console.error('Error fetching trending jobs:', error);
      throw error;
    }
    
    return data.jobs;
  }
}

export const jobMatchingService = new JobMatchingService();
