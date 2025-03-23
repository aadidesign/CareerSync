
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Bell, Check, Loader2 } from 'lucide-react';

const formSchema = z.object({
  email: z.boolean().default(true),
  whatsapp: z.boolean().default(false),
  telegram: z.boolean().default(false),
  frequency: z.enum(['immediate', 'daily', 'weekly']),
});

interface AlertSettingsStepProps {
  alertSettings: {
    email: boolean;
    whatsapp: boolean;
    telegram: boolean;
    frequency: string;
  };
  updateAlertSettings: (settings: any) => void;
  onBack: () => void;
  onComplete: () => void;
  isLoading: boolean;
}

const AlertSettingsStep: React.FC<AlertSettingsStepProps> = ({
  alertSettings,
  updateAlertSettings,
  onBack,
  onComplete,
  isLoading,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: alertSettings.email,
      whatsapp: alertSettings.whatsapp,
      telegram: alertSettings.telegram,
      frequency: (alertSettings.frequency as 'immediate' | 'daily' | 'weekly') || 'daily',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateAlertSettings(values);
    onComplete();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Bell className="h-12 w-12 text-electric-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white">Alert Settings</h2>
        <p className="text-gray-400 mt-2">Choose how you want to be notified about new opportunities</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Notification Channels</h3>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-navy-700 p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Email Notifications</FormLabel>
                    <FormDescription className="text-gray-400">
                      Receive job matches and alerts via email
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-navy-700 p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>WhatsApp Notifications</FormLabel>
                    <FormDescription className="text-gray-400">
                      Get alerts via WhatsApp message
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="telegram"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-navy-700 p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Telegram Notifications</FormLabel>
                    <FormDescription className="text-gray-400">
                      Get alerts via Telegram message
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Notification Frequency</h3>
            
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="space-y-3"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border border-navy-700 p-3">
                        <FormControl>
                          <RadioGroupItem value="immediate" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer flex-1">
                          <span className="font-medium">Immediate</span>
                          <p className="text-sm text-gray-400">Get notified as soon as new matching jobs are found</p>
                        </FormLabel>
                      </FormItem>
                      
                      <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border border-navy-700 p-3">
                        <FormControl>
                          <RadioGroupItem value="daily" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer flex-1">
                          <span className="font-medium">Daily Digest</span>
                          <p className="text-sm text-gray-400">Receive a daily summary of new job matches</p>
                        </FormLabel>
                      </FormItem>
                      
                      <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border border-navy-700 p-3">
                        <FormControl>
                          <RadioGroupItem value="weekly" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer flex-1">
                          <span className="font-medium">Weekly Roundup</span>
                          <p className="text-sm text-gray-400">Get a weekly summary of all your job matches</p>
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="border-gray-600"
              disabled={isLoading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <Button
              type="submit"
              className="bg-gradient-to-r from-electric-500 to-purple-500 hover:from-electric-600 hover:to-purple-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing Setup...
                </>
              ) : (
                <>
                  Complete Setup
                  <Check className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AlertSettingsStep;
