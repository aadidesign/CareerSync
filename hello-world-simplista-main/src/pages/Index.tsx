
import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import FeatureCard from '../components/FeatureCard';
import StatisticsBar from '../components/StatisticsBar';
import Footer from '../components/Footer';
import { 
  Search, 
  Brain, 
  BarChart2, 
  Bell, 
  ChevronRight, 
  LucideProps, 
  ArrowRight, 
  CheckCircle2,
  Zap,
  Activity,
  Users
} from 'lucide-react';
import JobCard from '../components/JobCard';

// Mock data for jobs
const featuredJobs = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp Solutions',
    location: 'San Francisco, CA',
    salary: '$120k - $150k',
    logo_url: '',
    description: 'We are looking for an experienced Frontend Developer to join our team and help build amazing web applications using React, TypeScript, and more.',
    source: 'LinkedIn',
    source_url: '#',
    posted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    is_remote: false,
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    company: 'InnovateTech',
    location: 'New York, NY',
    salary: '$130k - $160k',
    logo_url: '',
    description: 'Join our dynamic team building next-generation software with Node.js, React, and AWS. Focus on scalable architecture and performance.',
    source: 'Indeed',
    source_url: '#',
    posted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    is_remote: false,
  },
  {
    id: '3',
    title: 'Product Designer',
    company: 'DesignWorks Agency',
    location: 'Austin, TX',
    salary: '$90k - $120k',
    logo_url: '',
    description: 'Creative and detail-oriented Product Designer needed for our growing UX team. Work on exciting projects for major tech clients.',
    source: 'Glassdoor',
    source_url: '#',
    posted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    is_remote: true,
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    company: 'CloudScale Systems',
    location: 'Remote',
    salary: '$115k - $145k',
    logo_url: '',
    description: 'Help us build and maintain our cloud infrastructure using Docker, Kubernetes, and AWS. CI/CD pipeline expertise is a must.',
    source: 'Monster',
    source_url: '#',
    posted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    is_remote: true,
  },
];

// Custom icons for feature cards
const AggregationIcon = (props: LucideProps) => (
  <Search {...props} className="h-6 w-6 text-white" />
);

const AIIcon = (props: LucideProps) => (
  <Brain {...props} className="h-6 w-6 text-white" />
);

const TrackerIcon = (props: LucideProps) => (
  <BarChart2 {...props} className="h-6 w-6 text-white" />
);

const AlertsIcon = (props: LucideProps) => (
  <Bell {...props} className="h-6 w-6 text-white" />
);

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`min-h-screen bg-navy-900 text-white transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <Hero />

      {/* Features section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Modern Tools for the Modern <span className="text-gradient">Job Seeker</span>
            </h2>
            <p className="text-gray-300 text-lg">
              CareerSync combines cutting-edge technology with intuitive design to streamline 
              every aspect of your job search journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <FeatureCard
              icon={<AggregationIcon />}
              title="Job Aggregation"
              description="Search thousands of jobs from hundreds of sources in one place, saving you time and effort."
              gradient="blue"
              delay={100}
            />
            <FeatureCard
              icon={<AIIcon />}
              title="AI Recommendations"
              description="Get personalized job recommendations based on your skills, experience, and preferences."
              gradient="purple"
              delay={200}
            />
            <FeatureCard
              icon={<TrackerIcon />}
              title="Application Tracker"
              description="Keep track of all your applications in one place with our intuitive kanban board."
              gradient="mixed"
              delay={300}
            />
            <FeatureCard
              icon={<AlertsIcon />}
              title="Real-time Alerts"
              description="Receive notifications about new job postings, application updates, and interview reminders."
              gradient="blue"
              delay={400}
            />
          </div>
          
          <div className="text-center">
            <a 
              href="/search" 
              className="inline-flex items-center text-electric-400 font-medium hover:text-electric-300 transition-colors"
            >
              Explore all features
              <ChevronRight className="h-5 w-5 ml-1" />
            </a>
          </div>
        </div>
      </section>

      {/* Statistics bar */}
      <StatisticsBar />

      {/* Featured jobs section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Jobs</h2>
              <p className="text-gray-300">Curated opportunities matching popular searches</p>
            </div>
            <a 
              href="/search" 
              className="text-electric-400 font-medium flex items-center hover:text-electric-300 transition-colors"
            >
              View all jobs
              <ArrowRight className="h-5 w-5 ml-1" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="py-20 bg-navy-800/50 border-y border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              How <span className="text-gradient">CareerSync</span> Works
            </h2>
            <p className="text-gray-300 text-lg">
              Our platform simplifies your job search with powerful automation and intelligent features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            <div className="glass p-6 rounded-xl text-center relative">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-electric-500 w-10 h-10 rounded-full flex items-center justify-center text-xl font-semibold">
                1
              </div>
              <div className="mb-5 h-16 flex items-center justify-center">
                <Zap className="h-12 w-12 text-electric-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Create Your Profile</h3>
              <p className="text-gray-300">
                Upload your resume or fill out your profile details. Our AI will analyze your skills and experience.
              </p>
            </div>

            <div className="glass p-6 rounded-xl text-center relative">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-purple-500 w-10 h-10 rounded-full flex items-center justify-center text-xl font-semibold">
                2
              </div>
              <div className="mb-5 h-16 flex items-center justify-center">
                <Activity className="h-12 w-12 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Discover Opportunities</h3>
              <p className="text-gray-300">
                Browse personalized job recommendations or search across multiple platforms with advanced filters.
              </p>
            </div>

            <div className="glass p-6 rounded-xl text-center relative">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-electric-500 to-purple-500 w-10 h-10 rounded-full flex items-center justify-center text-xl font-semibold">
                3
              </div>
              <div className="mb-5 h-16 flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-gradient" style={{ color: 'transparent' }} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Apply & Track</h3>
              <p className="text-gray-300">
                Apply directly or save jobs for later. Track your application status and receive timely updates.
              </p>
            </div>
          </div>

          <div className="text-center">
            <button className="bg-gradient-to-r from-electric-500 to-purple-500 hover:from-electric-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg shadow-glow transition-all duration-300 font-medium">
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Trusted by <span className="text-gradient">Thousands</span> of Job Seekers
            </h2>
            <p className="text-gray-300 text-lg">
              Don't just take our word for it. Here's what our users have to say about CareerSync.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card rounded-xl p-6 relative">
              <div className="text-4xl text-electric-500 absolute -top-4 -left-2">"</div>
              <p className="text-gray-300 mb-6">
                CareerSync helped me land my dream job in just three weeks. The AI recommendations were spot-on!
              </p>
              <div className="flex items-center">
                <div className="bg-gray-700 h-10 w-10 rounded-full mr-3 flex items-center justify-center">
                  <Users className="h-6 w-6 text-gray-300" />
                </div>
                <div>
                  <p className="font-medium">Sarah Johnson</p>
                  <p className="text-sm text-gray-400">UX Designer at TechCorp</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-6 relative">
              <div className="text-4xl text-electric-500 absolute -top-4 -left-2">"</div>
              <p className="text-gray-300 mb-6">
                The application tracking feature is a game-changer. I can finally keep track of everything in one place.
              </p>
              <div className="flex items-center">
                <div className="bg-gray-700 h-10 w-10 rounded-full mr-3 flex items-center justify-center">
                  <Users className="h-6 w-6 text-gray-300" />
                </div>
                <div>
                  <p className="font-medium">Michael Chen</p>
                  <p className="text-sm text-gray-400">Software Engineer</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-6 relative">
              <div className="text-4xl text-electric-500 absolute -top-4 -left-2">"</div>
              <p className="text-gray-300 mb-6">
                As a career changer, CareerSync's skill recommendations helped me identify transferable skills for my resume.
              </p>
              <div className="flex items-center">
                <div className="bg-gray-700 h-10 w-10 rounded-full mr-3 flex items-center justify-center">
                  <Users className="h-6 w-6 text-gray-300" />
                </div>
                <div>
                  <p className="font-medium">Emily Patel</p>
                  <p className="text-sm text-gray-400">Marketing Specialist</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 bg-gradient-to-br from-navy-800 to-navy-900 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-radial from-electric-500/10 to-transparent opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-purple-500/10 to-transparent opacity-50"></div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Supercharge Your <span className="text-gradient">Job Search</span>?
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Join thousands of job seekers who have found their dream careers using CareerSync.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-gradient-to-r from-electric-500 to-purple-500 hover:from-electric-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg shadow-glow transition-all duration-300 font-medium">
                Create Free Account
              </button>
              <button className="bg-white/10 hover:bg-white/15 text-white border border-white/10 px-6 py-3 rounded-lg transition-all duration-300 font-medium">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
