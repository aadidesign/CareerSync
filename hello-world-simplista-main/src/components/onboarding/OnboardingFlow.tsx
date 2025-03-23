
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import ResumeUploadStep from './ResumeUploadStep';
import BasicInfoStep from './BasicInfoStep';
import JobPreferencesStep from './JobPreferencesStep';
import AlertSettingsStep from './AlertSettingsStep';

const steps = [
  { id: 'resume', title: 'Resume Upload' },
  { id: 'basic-info', title: 'Basic Information' },
  { id: 'job-preferences', title: 'Job Preferences' },
  { id: 'alert-settings', title: 'Alert Settings' },
];

const OnboardingFlow = () => {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    professionalTitle: profile?.professional_title || '',
    phoneNumber: profile?.phone_number || '',
    industry: profile?.industry || '',
    resumeUrl: '',
    skills: [] as string[],
    experience: [] as {
      title: string;
      company: string;
      startDate: string;
      endDate: string;
      description: string;
    }[],
    education: [] as {
      institution: string;
      degree: string;
      field: string;
      graduationDate: string;
    }[],
    preferences: {
      jobTypes: [] as string[],
      locations: [] as string[],
      remote: false,
      salaryMin: 0,
      salaryMax: 0,
      industries: [] as string[],
    },
    alertSettings: {
      email: true,
      whatsapp: false,
      telegram: false,
      frequency: 'daily',
    },
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const updateFormData = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const updatePreferences = (preferences: any) => {
    setFormData((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, ...preferences },
    }));
  };

  const updateAlertSettings = (alertSettings: any) => {
    setFormData((prev) => ({
      ...prev,
      alertSettings: { ...prev.alertSettings, ...alertSettings },
    }));
  };

  const handleResumeData = (data: any) => {
    setResumeData(data);
    if (data) {
      // Pre-fill form data from resume
      const newFormData = { ...formData };
      if (data.basics?.name) newFormData.fullName = data.basics.name;
      if (data.basics?.label) newFormData.professionalTitle = data.basics.label;
      if (data.basics?.phone) newFormData.phoneNumber = data.basics.phone;
      
      // Extract skills
      if (data.skills && Array.isArray(data.skills)) {
        newFormData.skills = data.skills.map((skill: any) => skill.name);
      }
      
      // Extract work experience
      if (data.work && Array.isArray(data.work)) {
        newFormData.experience = data.work.map((work: any) => ({
          title: work.position || '',
          company: work.company || '',
          startDate: work.startDate || '',
          endDate: work.endDate || '',
          description: work.summary || '',
        }));
      }
      
      // Extract education
      if (data.education && Array.isArray(data.education)) {
        newFormData.education = data.education.map((edu: any) => ({
          institution: edu.institution || '',
          degree: edu.studyType || '',
          field: edu.area || '',
          graduationDate: edu.endDate || '',
        }));
      }
      
      setFormData(newFormData);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      // Update user profile
      await updateProfile({
        full_name: formData.fullName,
        professional_title: formData.professionalTitle,
        phone_number: formData.phoneNumber,
        industry: formData.industry,
      });
      
      // Save user skills
      if (formData.skills.length > 0) {
        for (const skill of formData.skills) {
          await supabase.from('user_skills').insert({
            user_id: user?.id,
            skill,
          });
        }
      }
      
      // Save user preferences
      await supabase.from('user_preferences').upsert({
        user_id: user?.id,
        job_title_pref: formData.preferences.jobTypes,
        location_pref: formData.preferences.locations,
        remote_pref: formData.preferences.remote,
        salary_min: formData.preferences.salaryMin,
        salary_max: formData.preferences.salaryMax,
        email_alerts: formData.alertSettings.email,
        whatsapp_alerts: formData.alertSettings.whatsapp,
        telegram_alerts: formData.alertSettings.telegram,
      });
      
      // Update user metadata to mark as onboarded
      const { error } = await supabase.auth.updateUser({
        data: { onboarded: true }
      });
      
      if (error) throw error;
      
      toast({
        title: 'Onboarding Complete',
        description: 'Your profile has been set up successfully!',
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      toast({
        title: 'Onboarding Failed',
        description: error.message || 'An error occurred while setting up your profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Set Up Your Profile</h1>
          <p className="text-gray-400">Complete your profile to get personalized job recommendations</p>
        </div>
        
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between w-full relative">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center relative z-10">
                <div 
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    index < currentStep
                      ? 'bg-green-500'
                      : index === currentStep
                      ? 'bg-electric-500'
                      : 'bg-navy-700'
                  } transition-colors duration-300`}
                >
                  {index < currentStep ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <span className="text-white">{index + 1}</span>
                  )}
                </div>
                <span className={`mt-2 text-sm ${
                  index === currentStep ? 'text-electric-400' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
              </div>
            ))}
            
            {/* Progress Line */}
            <div className="absolute top-5 h-0.5 bg-navy-700 w-full transform -translate-y-1/2 z-0" />
            <div 
              className="absolute top-5 h-0.5 bg-electric-500 transform -translate-y-1/2 z-0 transition-all duration-300" 
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Step Content */}
        <div className="glass-card rounded-xl p-6 md:p-8 animate-fade-in">
          {currentStep === 0 && (
            <ResumeUploadStep 
              onNext={handleNext} 
              onSkip={handleSkip}
              onResumeData={handleResumeData}
              updateFormData={updateFormData}
            />
          )}
          
          {currentStep === 1 && (
            <BasicInfoStep 
              formData={formData} 
              updateFormData={updateFormData}
              onNext={handleNext}
              onBack={handlePrevious}
              onSkip={handleSkip}
            />
          )}
          
          {currentStep === 2 && (
            <JobPreferencesStep 
              preferences={formData.preferences}
              updatePreferences={updatePreferences}
              onNext={handleNext}
              onBack={handlePrevious}
              onSkip={handleSkip}
            />
          )}
          
          {currentStep === 3 && (
            <AlertSettingsStep 
              alertSettings={formData.alertSettings}
              updateAlertSettings={updateAlertSettings}
              onBack={handlePrevious}
              onComplete={handleComplete}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
