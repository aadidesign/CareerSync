
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

    // Get total applications count
    const { count: totalApplications, error: countError } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    
    if (countError) {
      console.error('Error counting applications:', countError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch application statistics' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // Get applications by status
    const { data: statusData, error: statusError } = await supabase
      .from('applications')
      .select('status, count')
      .eq('user_id', user.id)
      .group('status');
    
    if (statusError) {
      console.error('Error counting applications by status:', statusError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch application statistics' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // Transform status data into a record
    const byStatus: Record<string, number> = {};
    statusData.forEach(item => {
      byStatus[item.status] = item.count;
    });
    
    // Calculate response rate (applications that moved beyond 'applied' status)
    const appliedCount = byStatus['applied'] || 0;
    const responseCount = totalApplications - appliedCount;
    const responseRate = totalApplications > 0 ? (responseCount / totalApplications) * 100 : 0;
    
    // Calculate offer rate
    const offerCount = byStatus['offer'] || 0;
    const offerRate = totalApplications > 0 ? (offerCount / totalApplications) * 100 : 0;
    
    // Get applications over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // This is a simplified version - in a real app, you'd need more complex date handling
    const { data: dateData, error: dateError } = await supabase
      .from('applications')
      .select('applied_at')
      .eq('user_id', user.id)
      .gte('applied_at', thirtyDaysAgo.toISOString());
    
    if (dateError) {
      console.error('Error fetching applications by date:', dateError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch application statistics' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // Group by date (yyyy-mm-dd)
    const dateMap: Record<string, number> = {};
    dateData.forEach(item => {
      const date = item.applied_at.substring(0, 10); // Get yyyy-mm-dd part
      dateMap[date] = (dateMap[date] || 0) + 1;
    });
    
    // Convert to array for chart display
    const byDate = Object.entries(dateMap).map(([date, count]) => ({
      date,
      count
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    // Calculate average days to interview
    // This would need application status history data which we're assuming exists
    // This is a placeholder calculation
    const averageDaysToInterview = 7; // Just a sample value
    
    return new Response(
      JSON.stringify({
        totalApplications,
        byStatus,
        byDate,
        responseRate,
        averageDaysToInterview,
        offerRate
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error generating application statistics:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
