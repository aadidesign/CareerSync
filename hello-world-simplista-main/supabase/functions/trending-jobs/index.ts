
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Parse request body
    const { limit = 5 } = await req.json();
    
    // Get trending jobs - those with most applications or saves in the last 7 days
    // This is just an example. In a real implementation, you'd need more sophisticated logic.
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateString = sevenDaysAgo.toISOString();
    
    // Count applications per job in the last 7 days
    const { data: jobsWithApplications, error: appError } = await supabase
      .from('applications')
      .select('job_id, count')
      .gte('applied_at', dateString)
      .group('job_id')
      .order('count', { ascending: false })
      .limit(limit);
    
    if (appError) {
      console.error('Error fetching application counts:', appError);
      
      return new Response(
        JSON.stringify({ error: 'Failed to fetch trending jobs' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // Get the actual job details
    if (jobsWithApplications.length === 0) {
      // Fallback: get latest jobs
      const { data: latestJobs, error: latestError } = await supabase
        .from('jobs')
        .select('*')
        .order('posted_at', { ascending: false })
        .limit(limit);
      
      if (latestError) {
        console.error('Error fetching latest jobs:', latestError);
        
        return new Response(
          JSON.stringify({ error: 'Failed to fetch trending jobs' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ jobs: latestJobs, trending: false }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }
    
    // Get details for trending jobs
    const jobIds = jobsWithApplications.map(j => j.job_id);
    
    const { data: trendingJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .in('id', jobIds)
      .order('posted_at', { ascending: false });
    
    if (jobsError) {
      console.error('Error fetching trending jobs:', jobsError);
      
      return new Response(
        JSON.stringify({ error: 'Failed to fetch trending jobs' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    return new Response(
      JSON.stringify({ jobs: trendingJobs, trending: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error fetching trending jobs:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
