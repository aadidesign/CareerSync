
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
    // Get authentication details
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });

    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    // Parse request body
    const { page = 1, limit = 10, userId } = await req.json();
    
    if (userId !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403 
        }
      );
    }
    
    const offset = (page - 1) * limit;
    
    // Get user preferences and skills
    const { data: preferences, error: prefError } = await supabase
      .from('user_preferences')
      .select('job_title_pref, location_pref, remote_pref, salary_min, salary_max')
      .eq('user_id', userId)
      .single();
    
    if (prefError) {
      console.error('Error fetching preferences:', prefError);
      
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user preferences' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    const { data: skills, error: skillsError } = await supabase
      .from('user_skills')
      .select('skill')
      .eq('user_id', userId);
    
    if (skillsError) {
      console.error('Error fetching skills:', skillsError);
      
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user skills' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // Build the job query based on user preferences
    let jobQuery = supabase
      .from('jobs')
      .select(`
        *,
        job_skills(skill)
      `, { count: 'exact' });
    
    // Apply job title filter if present
    if (preferences.job_title_pref && preferences.job_title_pref.length > 0) {
      const titleConditions = preferences.job_title_pref.map(title => `title.ilike.%${title}%`).join(',');
      jobQuery = jobQuery.or(titleConditions);
    }
    
    // Apply location filter if present
    if (preferences.location_pref && preferences.location_pref.length > 0) {
      const locationConditions = preferences.location_pref.map(loc => `location.ilike.%${loc}%`).join(',');
      jobQuery = jobQuery.or(locationConditions);
    }
    
    // Apply remote filter if needed
    if (preferences.remote_pref) {
      jobQuery = jobQuery.eq('is_remote', true);
    }
    
    // Apply salary range filter if present
    if (preferences.salary_min) {
      // This assumes salary is stored as a string like "$50,000-$70,000"
      // In a real implementation, you'd need a more robust way to filter by salary
      jobQuery = jobQuery.gte('salary', preferences.salary_min.toString());
    }
    
    // Add pagination
    jobQuery = jobQuery
      .order('posted_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const { data: jobs, error: jobsError, count } = await jobQuery;
    
    if (jobsError) {
      console.error('Error fetching jobs:', jobsError);
      
      return new Response(
        JSON.stringify({ error: 'Failed to fetch matching jobs' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // Calculate match percentage for each job based on skills
    const userSkills = skills.map(s => s.skill.toLowerCase());
    
    const jobsWithMatch = jobs.map(job => {
      const jobSkills = job.job_skills.map((s: any) => s.skill.toLowerCase());
      
      // Calculate match percentage based on skills overlap
      let matchPercentage = 0;
      if (userSkills.length > 0 && jobSkills.length > 0) {
        const matchingSkills = jobSkills.filter(skill => userSkills.includes(skill));
        matchPercentage = Math.round((matchingSkills.length / jobSkills.length) * 100);
      }
      
      return {
        ...job,
        match_percentage: matchPercentage
      };
    });
    
    // Sort by match percentage (highest first)
    jobsWithMatch.sort((a, b) => b.match_percentage - a.match_percentage);
    
    return new Response(
      JSON.stringify({
        jobs: jobsWithMatch,
        total: count,
        page,
        totalPages: Math.ceil((count || 0) / limit)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error processing job matches:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
