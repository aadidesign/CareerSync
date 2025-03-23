
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FileText, Upload, Info, ArrowRight, Loader2 } from 'lucide-react';

interface ResumeUploadStepProps {
  onNext: () => void;
  onSkip: () => void;
  onResumeData: (data: any) => void;
  updateFormData: (data: any) => void;
}

const ResumeUploadStep: React.FC<ResumeUploadStepProps> = ({ 
  onNext, 
  onSkip, 
  onResumeData,
  updateFormData
}) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setUploadedFile(file);
    
    // Upload file to Supabase Storage
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);
      
      setResumeUrl(urlData.publicUrl);
      updateFormData({ resumeUrl: urlData.publicUrl });
      
      // Parse resume if it's a PDF or docx
      if (fileExt === 'pdf' || fileExt === 'docx' || fileExt === 'doc') {
        await parseResume(file);
      }
      
      toast({
        title: 'Resume Uploaded',
        description: 'Your resume has been uploaded successfully.',
      });
    } catch (error: any) {
      console.error('Error uploading resume:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'An error occurred while uploading your resume',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [user, updateFormData]);

  const parseResume = async (file: File) => {
    setIsParsing(true);
    try {
      // This is a placeholder for resume parsing functionality
      // In a real implementation, you would send the file to a resume parsing service
      // For now, we'll simulate parsing with a timeout
      
      // Mock resume data (this would come from your parsing service)
      setTimeout(() => {
        const mockResumeData = {
          basics: {
            name: 'John Doe',
            label: 'Software Engineer',
            phone: '+1 (555) 123-4567',
            email: user?.email,
          },
          skills: [
            { name: 'JavaScript' },
            { name: 'React' },
            { name: 'Node.js' },
            { name: 'TypeScript' },
          ],
          work: [
            {
              company: 'Tech Company',
              position: 'Senior Developer',
              startDate: '2020-01-01',
              endDate: '2023-05-30',
              summary: 'Led development of web applications using React and Node.js',
            },
            {
              company: 'Startup Inc',
              position: 'Junior Developer',
              startDate: '2018-06-01',
              endDate: '2019-12-31',
              summary: 'Assisted in front-end development with React',
            },
          ],
          education: [
            {
              institution: 'University of Technology',
              studyType: 'Bachelor',
              area: 'Computer Science',
              endDate: '2018-05-15',
            },
          ],
        };
        
        onResumeData(mockResumeData);
        setIsParsing(false);
        
        toast({
          title: 'Resume Parsed',
          description: 'Your resume has been analyzed and information extracted.',
        });
      }, 2000);
    } catch (error: any) {
      console.error('Error parsing resume:', error);
      toast({
        title: 'Parsing Failed',
        description: error.message || 'An error occurred while parsing your resume',
        variant: 'destructive',
      });
      setIsParsing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    disabled: isUploading || isParsing,
  });

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <FileText className="h-12 w-12 text-electric-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white">Upload Your Resume</h2>
        <p className="text-gray-400 mt-2">Upload your resume to help us pre-fill your profile information</p>
      </div>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-electric-500 ${
          isDragActive ? 'border-electric-500 bg-electric-500/10' : 'border-gray-600'
        } ${isUploading || isParsing ? 'opacity-75 pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-300 mb-2">
          {isDragActive
            ? 'Drop your resume here...'
            : 'Drag and drop your resume here, or click to select'}
        </p>
        <p className="text-gray-500 text-sm">Supported formats: PDF, DOC, DOCX</p>
      </div>
      
      {(isUploading || isParsing) && (
        <div className="text-center p-4">
          <Loader2 className="h-8 w-8 text-electric-400 mx-auto animate-spin" />
          <p className="text-gray-300 mt-2">
            {isUploading ? 'Uploading your resume...' : 'Analyzing your resume...'}
          </p>
        </div>
      )}
      
      {uploadedFile && !isUploading && !isParsing && (
        <Alert className="bg-green-500/20 border-green-500">
          <FileText className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-300">
            Successfully uploaded: {uploadedFile.name}
          </AlertDescription>
        </Alert>
      )}
      
      <TooltipProvider>
        <div className="bg-navy-700/50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Info className="h-4 w-4 text-electric-400 mr-2" />
            <h3 className="text-white font-medium">Why upload your resume?</h3>
          </div>
          <p className="text-gray-400 text-sm">
            Uploading your resume helps us:
          </p>
          <ul className="text-gray-400 text-sm list-disc list-inside mt-2 space-y-1">
            <li>Pre-fill your profile information</li>
            <li>
              Identify your skills
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-gray-500 ml-1 inline cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-60">
                    We analyze your resume to identify skills you have, which helps
                    match you with relevant job opportunities.
                  </p>
                </TooltipContent>
              </Tooltip>
            </li>
            <li>
              Suggest relevant job recommendations
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-gray-500 ml-1 inline cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-60">
                    Our job matching algorithm uses information from your resume to
                    find jobs that match your experience and qualifications.
                  </p>
                </TooltipContent>
              </Tooltip>
            </li>
          </ul>
        </div>
      </TooltipProvider>
      
      <div className="flex justify-between pt-4">
        <Button
          variant="ghost"
          onClick={onSkip}
          className="text-gray-400 hover:text-white"
        >
          Skip for now
        </Button>
        
        <Button
          onClick={onNext}
          className="bg-gradient-to-r from-electric-500 to-purple-500 hover:from-electric-600 hover:to-purple-600"
          disabled={isUploading || isParsing}
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ResumeUploadStep;
