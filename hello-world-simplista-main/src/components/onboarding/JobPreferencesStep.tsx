
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, ArrowRight, Briefcase, X, Info, MapPin, DollarSign } from 'lucide-react';

// Job titles for autocomplete
const commonJobTitles = [
  'Software Engineer',
  'Product Manager',
  'Data Scientist',
  'UX Designer',
  'Marketing Manager',
  'Sales Representative',
  'Project Manager',
  'Business Analyst',
  'Customer Success Manager',
  'DevOps Engineer',
  'Financial Analyst',
  'Human Resources Manager',
  'UI Developer',
  'Content Writer',
  'Operations Manager',
];

// Locations for autocomplete
const commonLocations = [
  'New York, NY',
  'San Francisco, CA',
  'Los Angeles, CA',
  'Chicago, IL',
  'Austin, TX',
  'Seattle, WA',
  'Boston, MA',
  'Denver, CO',
  'Atlanta, GA',
  'Washington, D.C.',
  'Miami, FL',
  'Dallas, TX',
  'Phoenix, AZ',
  'Portland, OR',
  'Nashville, TN',
];

const formSchema = z.object({
  jobTitleInput: z.string().optional(),
  locationInput: z.string().optional(),
  remote: z.boolean().default(false),
  salaryRange: z.array(z.number()).length(2),
});

interface JobPreferencesStepProps {
  preferences: {
    jobTypes: string[];
    locations: string[];
    remote: boolean;
    salaryMin: number;
    salaryMax: number;
    industries: string[];
  };
  updatePreferences: (preferences: any) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const JobPreferencesStep: React.FC<JobPreferencesStepProps> = ({
  preferences,
  updatePreferences,
  onNext,
  onBack,
  onSkip,
}) => {
  const [jobTypes, setJobTypes] = React.useState<string[]>(preferences.jobTypes);
  const [locations, setLocations] = React.useState<string[]>(preferences.locations);
  const [jobSuggestions, setJobSuggestions] = React.useState<string[]>([]);
  const [locationSuggestions, setLocationSuggestions] = React.useState<string[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobTitleInput: '',
      locationInput: '',
      remote: preferences.remote,
      salaryRange: [preferences.salaryMin || 40000, preferences.salaryMax || 120000],
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const updatedPreferences = {
      jobTypes,
      locations,
      remote: values.remote,
      salaryMin: values.salaryRange[0],
      salaryMax: values.salaryRange[1],
    };
    
    updatePreferences(updatedPreferences);
    onNext();
  };

  const handleRemoveJobType = (jobType: string) => {
    setJobTypes(jobTypes.filter(jt => jt !== jobType));
  };

  const handleRemoveLocation = (location: string) => {
    setLocations(locations.filter(loc => loc !== location));
  };

  const handleJobTitleInputChange = (value: string) => {
    form.setValue('jobTitleInput', value);
    
    if (value.trim().length > 0) {
      const filtered = commonJobTitles.filter(job => 
        job.toLowerCase().includes(value.toLowerCase())
      );
      setJobSuggestions(filtered.slice(0, 5));
    } else {
      setJobSuggestions([]);
    }
  };

  const handleLocationInputChange = (value: string) => {
    form.setValue('locationInput', value);
    
    if (value.trim().length > 0) {
      const filtered = commonLocations.filter(location => 
        location.toLowerCase().includes(value.toLowerCase())
      );
      setLocationSuggestions(filtered.slice(0, 5));
    } else {
      setLocationSuggestions([]);
    }
  };

  const addJobType = (jobType: string) => {
    if (jobType.trim() && !jobTypes.includes(jobType)) {
      setJobTypes([...jobTypes, jobType]);
      form.setValue('jobTitleInput', '');
      setJobSuggestions([]);
    }
  };

  const addLocation = (location: string) => {
    if (location.trim() && !locations.includes(location)) {
      setLocations([...locations, location]);
      form.setValue('locationInput', '');
      setLocationSuggestions([]);
    }
  };

  const handleJobTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = form.getValues('jobTitleInput');
      addJobType(value);
    }
  };

  const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = form.getValues('locationInput');
      addLocation(value);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Briefcase className="h-12 w-12 text-electric-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white">Job Preferences</h2>
        <p className="text-gray-400 mt-2">Tell us what you're looking for in your next role</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="jobTitleInput"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Job Titles</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-60">
                            Add multiple job titles you're interested in to expand your search.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="Add job titles you're interested in"
                        {...field}
                        onChange={(e) => handleJobTitleInputChange(e.target.value)}
                        onKeyDown={handleJobTitleKeyDown}
                        className="bg-navy-800/50"
                      />
                    </FormControl>
                    {jobSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-navy-800 border border-gray-600 rounded-md shadow-lg">
                        {jobSuggestions.map((job) => (
                          <div
                            key={job}
                            className="px-4 py-2 cursor-pointer hover:bg-navy-700"
                            onClick={() => addJobType(job)}
                          >
                            {job}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <FormMessage />
                  
                  {jobTypes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {jobTypes.map((jobType) => (
                        <Badge 
                          key={jobType} 
                          variant="secondary"
                          className="bg-navy-700 hover:bg-navy-600 py-1.5"
                        >
                          {jobType}
                          <button
                            type="button"
                            onClick={() => handleRemoveJobType(jobType)}
                            className="ml-1 text-gray-400 hover:text-white"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="locationInput"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Locations</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-60">
                            Add multiple locations you're willing to work in.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="relative">
                    <div className="absolute top-2.5 left-3 text-gray-400">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <FormControl>
                      <Input
                        placeholder="Add cities or regions"
                        {...field}
                        onChange={(e) => handleLocationInputChange(e.target.value)}
                        onKeyDown={handleLocationKeyDown}
                        className="bg-navy-800/50 pl-10"
                      />
                    </FormControl>
                    {locationSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-navy-800 border border-gray-600 rounded-md shadow-lg">
                        {locationSuggestions.map((location) => (
                          <div
                            key={location}
                            className="px-4 py-2 cursor-pointer hover:bg-navy-700"
                            onClick={() => addLocation(location)}
                          >
                            {location}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <FormMessage />
                  
                  {locations.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {locations.map((location) => (
                        <Badge 
                          key={location} 
                          variant="secondary"
                          className="bg-navy-700 hover:bg-navy-600 py-1.5"
                        >
                          {location}
                          <button
                            type="button"
                            onClick={() => handleRemoveLocation(location)}
                            className="ml-1 text-gray-400 hover:text-white"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="remote"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-navy-700 p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Remote Work</FormLabel>
                    <FormDescription className="text-gray-400">
                      Are you interested in remote positions?
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
              name="salaryRange"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel>Salary Range</FormLabel>
                    <div className="flex items-center text-electric-400">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>
                        ${field.value[0].toLocaleString()} - ${field.value[1].toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <FormControl>
                    <Slider
                      min={0}
                      max={300000}
                      step={5000}
                      value={field.value}
                      onValueChange={field.onChange}
                      className="py-4"
                    />
                  </FormControl>
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>$0</span>
                    <span>$300,000+</span>
                  </div>
                </FormItem>
              )}
            />
          </div>
          
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

export default JobPreferencesStep;
