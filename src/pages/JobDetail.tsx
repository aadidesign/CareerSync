
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, 
  Building, 
  MapPin, 
  Clock, 
  Calendar, 
  Bookmark, 
  Share2, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Briefcase, 
  GraduationCap, 
  Award, 
  DollarSign, 
  Users, 
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import JobCard from '../components/JobCard';
import Footer from '../components/Footer';

// Mock data for a job
const mockJob = {
  id: '1',
  title: 'Senior Frontend Developer',
  company: 'TechCorp Solutions',
  companyDescription: 'TechCorp Solutions is a leading technology company specializing in developing innovative software solutions for businesses across various industries. With a focus on cutting-edge technology and user-centric design, we help our clients transform their digital presence and operational efficiency.',
  location: 'San Francisco, CA',
  salary: '$120,000 - $150,000',
  logoUrl: '',
  description: 'We are looking for an experienced Frontend Developer to join our team and help build amazing web applications using React, TypeScript, and more. The ideal candidate will have a passion for creating exceptional user experiences and a track record of delivering high-quality code.',
  fullDescription: `
    <p>We are seeking a talented and motivated Senior Frontend Developer to join our engineering team. The ideal candidate will be responsible for developing and implementing user interface components using React.js and other frontend technologies. You will work with the design team to translate UI/UX wireframes into responsive and interactive features.</p>
    
    <h4>Responsibilities:</h4>
    <ul>
      <li>Develop new user-facing features using React.js and modern frontend technologies</li>
      <li>Build reusable components and libraries for future use</li>
      <li>Translate designs and wireframes into high-quality code</li>
      <li>Optimize components for maximum performance across devices and browsers</li>
      <li>Collaborate with backend developers to integrate frontend components with API services</li>
      <li>Participate in code reviews and help maintain code quality across the frontend</li>
    </ul>
    
    <h4>Requirements:</h4>
    <ul>
      <li>5+ years of experience in frontend development</li>
      <li>3+ years of experience with React.js</li>
      <li>Strong proficiency in JavaScript, HTML, and CSS</li>
      <li>Experience with modern frontend build pipelines and tools</li>
      <li>Familiarity with RESTful APIs and modern authorization mechanisms</li>
      <li>Understanding of server-side rendering and its benefits</li>
      <li>Excellent problem-solving skills and attention to detail</li>
      <li>Strong communication skills and ability to work in a team environment</li>
    </ul>
    
    <h4>Nice to have:</h4>
    <ul>
      <li>Experience with TypeScript</li>
      <li>Knowledge of state management libraries (Redux, MobX, etc.)</li>
      <li>Understanding of CI/CD practices</li>
      <li>Experience with testing frameworks (Jest, Enzyme, etc.)</li>
    </ul>
    
    <h4>Benefits:</h4>
    <ul>
      <li>Competitive salary and equity package</li>
      <li>Health, dental, and vision insurance</li>
      <li>Flexible working hours and remote work options</li>
      <li>Professional development budget</li>
      <li>Regular team events and activities</li>
      <li>Modern office in downtown San Francisco</li>
    </ul>
  `,
  source: 'LinkedIn',
  sourceUrl: '#',
  postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  isRemote: false,
  experienceLevel: 'senior' as const,
  education: "Bachelor's degree in Computer Science or related field",
  employmentType: 'Full-time',
  skills: [
    'React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Git', 'RESTful APIs', 'Redux'
  ],
  matchPercentage: 92,
  benefits: [
    'Health Insurance', 'Dental Insurance', 'Vision Insurance', 'Flexible Hours', 
    'Remote Work Option', '401(k)', 'Professional Development'
  ],
  company_size: '50-200 employees',
  industry: 'Software Development',
  companyWebsite: 'https://example.com',
  companyLinkedIn: 'https://linkedin.com/company/example'
};

// Similar jobs data
const similarJobs = [
  {
    id: '2',
    title: 'Frontend Developer',
    company: 'InnovateTech',
    location: 'New York, NY',
    salary: '$100k - $130k',
    logoUrl: '',
    description: 'Join our dynamic team building next-generation web applications with React and TypeScript.',
    source: 'Indeed',
    sourceUrl: '#',
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isRemote: false,
    experienceLevel: 'mid' as const,
    matchPercentage: 85,
  },
  {
    id: '3',
    title: 'Senior UI Developer',
    company: 'DesignHub',
    location: 'Remote',
    salary: '$130k - $160k',
    logoUrl: '',
    description: 'Looking for a UI developer with strong React skills to create beautiful, responsive interfaces.',
    source: 'Glassdoor',
    sourceUrl: '#',
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isRemote: true,
    experienceLevel: 'senior' as const,
    matchPercentage: 88,
  },
];

const JobDetail = () => {
  const { id } = useParams();
  const [job] = useState(mockJob); // In real app, fetch job by ID
  const [isSaved, setIsSaved] = useState(false);
  
  // Function to calculate application deadline
  const getApplicationDeadline = () => {
    const expiryDate = new Date(job.expiresAt);
    return `${expiryDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  };
  
  // Function to format posted date
  const getPostedDate = () => {
    const postedDate = new Date(job.postedAt);
    return `${postedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  };
  
  // Toggle saved state
  const handleSaveJob = () => {
    setIsSaved(!isSaved);
  };
  
  // Function to determine skill match class
  const getSkillMatchClass = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-teal-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Function to get experience level text
  const getExperienceLevelText = (level?: string) => {
    switch (level) {
      case 'entry':
        return 'Entry Level';
      case 'mid':
        return 'Mid Level';
      case 'senior':
        return 'Senior Level';
      case 'executive':
        return 'Executive';
      default:
        return 'Not Specified';
    }
  };

  return (
    <div className="min-h-screen bg-premium-gradient text-white">
      <Helmet>
        <title>{job.title} at {job.company} | CareerSync</title>
        <meta name="description" content={`Apply for ${job.title} position at ${job.company}. ${job.description.substring(0, 160)}...`} />
      </Helmet>
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 md:px-6">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Link to="/search" className="flex items-center text-silver-400 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to search results
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Job Header */}
              <motion.div 
                className="premium-glass rounded-lg p-6 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-start gap-5">
                  <div className="h-16 w-16 rounded-md bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10">
                    {job.logoUrl ? (
                      <img 
                        src={job.logoUrl} 
                        alt={`${job.company} logo`} 
                        className="w-full h-full object-contain p-1" 
                      />
                    ) : (
                      <Building className="h-8 w-8 text-silver-400" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-medium text-white mb-2">
                      {job.title}
                    </h1>
                    
                    <div className="flex items-center text-silver-300 mb-4">
                      <span className="font-medium">{job.company}</span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-silver-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-navy-500" />
                        {job.isRemote ? 'Remote' : job.location}
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4 text-navy-500" />
                        {job.employmentType}
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4 text-navy-500" />
                        {job.salary}
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-navy-500" />
                        Posted {getPostedDate()}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-6">
                  <button 
                    className="premium-button rounded-lg px-6 py-2.5 font-medium flex items-center gap-2"
                    onClick={() => window.open(job.sourceUrl, '_blank')}
                  >
                    Apply Now
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  
                  <button 
                    className={`premium-button-outline rounded-lg px-4 py-2.5 flex items-center gap-2 ${
                      isSaved ? 'bg-navy-500/10 border-navy-500/30 text-navy-400' : ''
                    }`}
                    onClick={handleSaveJob}
                  >
                    <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-navy-500 text-navy-500' : ''}`} />
                    {isSaved ? 'Saved' : 'Save Job'}
                  </button>
                  
                  <button 
                    className="premium-button-outline rounded-lg px-4 py-2.5 flex items-center gap-2"
                    onClick={() => navigator.share && navigator.share({
                      title: `${job.title} at ${job.company}`,
                      text: job.description,
                      url: window.location.href,
                    })}
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                </div>
              </motion.div>
              
              {/* Match Score */}
              <motion.div 
                className="premium-glass rounded-lg p-6 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <h2 className="text-xl font-medium mb-4">Match Analysis</h2>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-silver-300">Overall Match</span>
                    <span className="font-medium text-white">{job.matchPercentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-navy-500 to-teal-500 rounded-full"
                      style={{ width: `${job.matchPercentage}%` }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-silver-300 mb-3">Skills Match</h3>
                    <ul className="space-y-2">
                      {job.skills.slice(0, 5).map((skill, index) => (
                        <li key={index} className="flex items-center justify-between">
                          <span className="text-sm text-silver-400">{skill}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs text-white ${
                            index < 3 ? 'bg-teal-500' : 'bg-white/10'
                          }`}>
                            {index < 3 ? 'Strong' : 'Basic'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-silver-300 mb-3">Requirements</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-teal-500" />
                        <span className="text-sm text-silver-400">Experience Level</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-teal-500" />
                        <span className="text-sm text-silver-400">Technical Skills</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-teal-500" />
                        <span className="text-sm text-silver-400">Education</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-silver-500" />
                        <span className="text-sm text-silver-500 line-through">Location</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
              
              {/* Job Description */}
              <motion.div 
                className="premium-glass rounded-lg p-6 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <h2 className="text-xl font-medium mb-4">Job Description</h2>
                <div 
                  className="prose prose-invert max-w-none text-silver-300"
                  dangerouslySetInnerHTML={{ __html: job.fullDescription }}
                />
              </motion.div>
              
              {/* Company Information */}
              <motion.div 
                className="premium-glass rounded-lg p-6 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <h2 className="text-xl font-medium mb-4">About {job.company}</h2>
                <p className="text-silver-300 mb-4">{job.companyDescription}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h3 className="text-sm font-medium text-silver-300 mb-3">Company Details</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-navy-500" />
                        <span className="text-sm text-silver-400">{job.company_size}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-navy-500" />
                        <span className="text-sm text-silver-400">{job.industry}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-navy-500" />
                        <a 
                          href={job.companyWebsite} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-navy-400 hover:text-navy-300 transition-colors"
                        >
                          Company Website
                        </a>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-silver-300 mb-3">Benefits</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.benefits.map((benefit, index) => (
                        <span key={index} className="px-3 py-1 bg-white/5 rounded-full text-xs text-silver-400">
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Application Deadline */}
              <motion.div 
                className="premium-glass rounded-lg p-5 mb-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h3 className="text-lg font-medium mb-3">Application Details</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-navy-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-silver-300">Application Deadline</p>
                      <p className="text-silver-400">{getApplicationDeadline()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-navy-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-silver-300">Experience Level</p>
                      <p className="text-silver-400">
                        {getExperienceLevelText(job.experienceLevel)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <GraduationCap className="h-5 w-5 text-navy-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-silver-300">Education</p>
                      <p className="text-silver-400">{job.education}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Similar Jobs */}
              <motion.div 
                className="premium-glass rounded-lg p-5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Similar Jobs</h3>
                  <Link to="/search" className="text-sm text-navy-400 hover:text-teal-400 transition-colors">
                    View All
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {similarJobs.map(job => (
                    <Link to={`/job/${job.id}`} key={job.id} className="block">
                      <div className="premium-card rounded-lg p-4 hover:bg-white/5 transition-all">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-md bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10">
                            {job.logoUrl ? (
                              <img 
                                src={job.logoUrl} 
                                alt={`${job.company} logo`} 
                                className="w-full h-full object-contain p-1" 
                              />
                            ) : (
                              <Building className="h-5 w-5 text-silver-400" />
                            )}
                          </div>
                          
                          <div>
                            <h4 className="text-base font-medium text-white line-clamp-1">{job.title}</h4>
                            <p className="text-sm text-silver-400 mb-1">{job.company}</p>
                            <div className="flex items-center gap-2 text-xs text-silver-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {job.isRemote ? 'Remote' : job.location}
                              </span>
                              
                              {job.matchPercentage && (
                                <span className="px-1.5 py-0.5 bg-teal-500/20 rounded-sm text-teal-300 flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  {job.matchPercentage}% Match
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default JobDetail;
