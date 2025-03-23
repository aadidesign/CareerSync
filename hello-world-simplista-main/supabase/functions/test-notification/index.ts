
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
    const { type } = await req.json();
    
    if (!type || !['email', 'push', 'sms', 'telegram', 'whatsapp'].includes(type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid notification type' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }
    
    // Create test notification in database
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title: 'Test Notification',
        message: `This is a test ${type} notification`,
        type: 'test',
        is_read: false
      })
      .select()
      .single();
    
    if (notificationError) {
      console.error('Error creating test notification:', notificationError);
      return new Response(
        JSON.stringify({ error: 'Failed to create test notification' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // Send test notification via broadcast channel
    supabase
      .channel(`user:${user.id}`)
      .send({
        type: 'broadcast',
        event: 'notification',
        payload: {
          title: 'Test Notification',
          message: `This is a test ${type} notification`,
          type: 'test'
        }
      });
    
    // For email notifications, we'd typically use an email service
    if (type === 'email') {
      // In a real implementation, you'd integrate with an email service
      console.log(`Sending test email to ${user.email}`);
    }
    
    // For SMS, Telegram, or WhatsApp, you'd integrate with those services
    // This is just a placeholder
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Test ${type} notification sent` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error sending test notification:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
