
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, UserCircle } from 'lucide-react';

const formSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  professionalTitle: z.string().optional(),
  phoneNumber: z.string().optional(),
  industry: z.string().optional(),
  bio: z.string().optional(),
});

interface BasicInfoStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const industryOptions = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Media',
  'Government',
  'Non-profit',
  'Other',
];

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ 
  formData, 
  updateFormData, 
  onNext, 
  onBack,
  onSkip
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: formData.fullName || '',
      professionalTitle: formData.professionalTitle || '',
      phoneNumber: formData.phoneNumber || '',
      industry: formData.industry || '',
      bio: formData.bio || '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateFormData(values);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <UserCircle className="h-12 w-12 text-electric-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white">Basic Information</h2>
        <p className="text-gray-400 mt-2">Tell us a bit about yourself</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="John Doe" 
                    {...field} 
                    className="bg-navy-800/50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="professionalTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Professional Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Software Engineer" 
                    {...field} 
                    className="bg-navy-800/50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="+1 (555) 123-4567" 
                    {...field} 
                    className="bg-navy-800/50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger className="bg-navy-800/50">
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {industryOptions.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Professional Bio (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell us about your professional background and interests..." 
                    {...field} 
                    className="bg-navy-800/50 resize-none"
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-between pt-4">
            <div className="space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="border-gray-600"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={onSkip}
                className="text-gray-400 hover:text-white"
              >
                Skip for now
              </Button>
            </div>
            
            <Button
              type="submit"
              className="bg-gradient-to-r from-electric-500 to-purple-500 hover:from-electric-600 hover:to-purple-600"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default BasicInfoStep;
