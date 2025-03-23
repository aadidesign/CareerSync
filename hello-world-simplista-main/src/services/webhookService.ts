
import { supabase } from '@/integrations/supabase/client';
import { RPCResponse } from '@/types/supabase';

class WebhookService {
  // Get all webhooks for current user
  public async getWebhooks() {
    const { data, error } = await supabase.rpc('get_user_webhooks') as RPCResponse<Array<{
      id: string;
      name: string;
      url: string;
      events: string[];
      active: boolean;
      created_at: string;
      updated_at: string | null;
    }>>;
    
    if (error) throw error;
    
    return data || [];
  }
  
  // Create webhook
  public async createWebhook(name: string, url: string, events: string[]) {
    const { data, error } = await supabase.rpc('create_webhook', {
      webhook_name: name,
      webhook_url: url,
      webhook_events: events
    }) as RPCResponse<{
      id: string;
    }>;
    
    if (error) throw error;
    
    return data;
  }
  
  // Update webhook
  public async updateWebhook(id: string, params: {
    name?: string;
    url?: string;
    events?: string[];
    active?: boolean;
  }) {
    const { data, error } = await supabase.rpc('update_webhook', {
      webhook_id: id,
      webhook_name: params.name,
      webhook_url: params.url,
      webhook_events: params.events,
      webhook_active: params.active
    }) as RPCResponse<unknown>;
    
    if (error) throw error;
    
    return true;
  }
  
  // Delete webhook
  public async deleteWebhook(id: string) {
    const { data, error } = await supabase.rpc('delete_webhook', {
      webhook_id: id
    }) as RPCResponse<unknown>;
    
    if (error) throw error;
    
    return true;
  }
  
  // Test webhook
  public async testWebhook(id: string) {
    const { data, error } = await supabase.functions.invoke('test-webhook', {
      body: { webhookId: id }
    });
    
    if (error) throw error;
    
    return data?.success || false;
  }
}

export const webhookService = new WebhookService();
