import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { RealtimeChannel } from '@supabase/supabase-js';
import { NotificationSettings } from '@/types/supabase';
import { RPCResponse } from '@/types/supabase';

interface NotificationSettingsResponse {
  email_alerts: boolean;
  push_alerts: boolean;
  sms_alerts: boolean;
  telegram_alerts: boolean;
  whatsapp_alerts: boolean;
}

class NotificationService {
  private channels: Record<string, RealtimeChannel> = {};
  private userId: string | null = null;

  public initialize(userId: string) {
    this.userId = userId;
    this.setupUserChannel();
    this.setupJobsChannel();
    this.setupApplicationsChannel();
    
    console.log('Notification service initialized for user:', userId);
    return this;
  }

  public disconnect() {
    Object.values(this.channels).forEach(channel => {
      channel.unsubscribe();
    });
    this.channels = {};
    this.userId = null;
    console.log('Notification service disconnected');
  }

  private setupUserChannel() {
    if (!this.userId) return;
    
    this.channels.user = supabase.channel(`user:${this.userId}`)
      .on('broadcast', { event: 'notification' }, (payload) => {
        console.log('Received notification:', payload);
        this.handleNotification(payload.payload);
      })
      .on('broadcast', { event: 'jobAlert' }, (payload) => {
        console.log('Received job alert:', payload);
        this.handleJobAlert(payload.payload);
      })
      .on('broadcast', { event: 'applicationUpdate' }, (payload) => {
        console.log('Received application update:', payload);
        this.handleApplicationUpdate(payload.payload);
      })
      .subscribe();
  }

  private setupJobsChannel() {
    if (!this.userId) return;
    
    this.channels.jobs = supabase.channel('jobs')
      .on('broadcast', { event: 'newJobMatch' }, (payload) => {
        if (payload.payload.userIds.includes(this.userId)) {
          console.log('Received job match:', payload);
          this.handleJobMatch(payload.payload);
        }
      })
      .subscribe();
  }

  private setupApplicationsChannel() {
    if (!this.userId) return;
    
    this.channels.applications = supabase
      .channel('application_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'applications',
          filter: `user_id=eq.${this.userId}`
        },
        (payload) => {
          console.log('Application updated:', payload);
          this.handleDatabaseApplicationUpdate(payload.new);
        }
      )
      .subscribe();
  }

  private handleNotification(data: any) {
    toast({
      title: data.title,
      description: data.message,
    });
  }

  private handleJobAlert(data: any) {
    toast({
      title: '🔍 New Job Alert',
      description: `${data.count} new jobs match your search criteria.`,
    });
  }

  private handleApplicationUpdate(data: any) {
    toast({
      title: '📝 Application Update',
      description: `Status changed to: ${data.status}`,
    });
  }

  private handleDatabaseApplicationUpdate(data: any) {
    toast({
      title: '📝 Application Updated',
      description: `Your application for ${data.job_title || 'a position'} has been updated.`,
    });
  }

  private handleJobMatch(data: any) {
    toast({
      title: '✨ New Job Match',
      description: `Found ${data.count} new jobs matching your profile!`,
    });
  }

  public async getNotificationSettings(): Promise<NotificationSettings | null> {
    if (!this.userId) return null;
    
    try {
      const { data, error } = await supabase.rpc('get_notification_settings') as RPCResponse<NotificationSettingsResponse>;
      
      if (error) throw error;
      
      if (!data) return null;
      
      return {
        email_alerts: data.email_alerts,
        push_alerts: data.push_alerts,
        sms_alerts: data.sms_alerts,
        telegram_alerts: data.telegram_alerts,
        whatsapp_alerts: data.whatsapp_alerts
      };
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      return null;
    }
  }

  public async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<boolean> {
    if (!this.userId) return false;
    
    try {
      const { error } = await supabase.rpc('update_notification_settings', {
        email_alerts: settings.email_alerts,
        push_alerts: settings.push_alerts,
        sms_alerts: settings.sms_alerts,
        telegram_alerts: settings.telegram_alerts,
        whatsapp_alerts: settings.whatsapp_alerts
      }) as RPCResponse<unknown>;
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return false;
    }
  }

  public async testNotification(type: 'email' | 'push' | 'sms' | 'telegram' | 'whatsapp'): Promise<boolean> {
    if (!this.userId) return false;
    
    const { data, error } = await supabase.functions.invoke('test-notification', {
      body: { type, userId: this.userId }
    });
    
    if (error) {
      console.error('Error testing notification:', error);
      return false;
    }
    
    return data?.success || false;
  }
}

export const notificationService = new NotificationService();
