import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Filter, 
  SlidersHorizontal, 
  Briefcase, 
  MapPin, 
  Clock, 
  BarChart, 
  List, 
  Grid, 
  Search as SearchIcon,
  X,
  ChevronDown,
  Award,
  Building,
  Banknote,
  Wifi,
  Clock3,
  CalendarDays
} from 'lucide-react';
import JobCard from '../components/JobCard';
import SearchBar from '../components/SearchBar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

// Updated mock job data to match JobCard expected structure
const mockJobs = [
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
    posted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    is_remote: false,
    experience_level: 'senior',
    matchPercentage: 92,
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
    posted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    is_remote: false,
    experience_level: 'mid',
    matchPercentage: 85,
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
    posted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    is_remote: true,
    experience_level: 'mid',
    matchPercentage: 78,
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
    posted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    is_remote: true,
    experience_level: 'mid',
    matchPercentage: 88,
  },
  {
    id: '5',
    title: 'Junior Software Developer',
    company: 'StartupLaunch',
    location: 'Chicago, IL',
    salary: '$70k - $90k',
    logo_url: '',
    description: 'Great opportunity for a recent graduate to join our growing team. Work on our core product using modern technologies.',
    source: 'ZipRecruiter',
    source_url: '#',
    posted_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    is_remote: false,
    experience_level: 'entry',
    matchPercentage: 95,
  },
  {
    id: '6',
    title: 'Data Scientist',
    company: 'AnalyticsPro',
    location: 'Boston, MA',
    salary: '$110k - $140k',
    logo_url: '',
    description: 'Join our data team to build models and derive insights from large datasets. Experience with ML and statistical analysis required.',
    source: 'LinkedIn',
    source_url: '#',
    posted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    is_remote: false,
    experience_level: 'mid',
    matchPercentage: 82,
  },
  {
    id: '7',
    title: 'UX/UI Designer',
    company: 'CreativeMinds',
    location: 'Los Angeles, CA',
    salary: '$80k - $110k',
    logo_url: '',
    description: 'Creative designer needed to craft user experiences for our clients. Strong portfolio showing mobile and web interfaces required.',
    source: 'Behance',
    source_url: '#',
    posted_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    is_remote: false,
    experience_level: 'mid',
    matchPercentage: 90,
  },
  {
    id: '8',
    title: 'Engineering Manager',
    company: 'TechGiants',
    location: 'Seattle, WA',
    salary: '$160k - $200k',
    logo_url: '',
    description: 'Lead a team of engineers building our next-generation products. Strong technical and leadership skills required.',
    source: 'Indeed',
    source_url: '#',
    posted_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    is_remote: false,
    experience_level: 'senior',
    matchPercentage: 87,
  },
];

// Filter categories
const filterCategories = [
  {
    name: 'Experience Level',
    key: 'experienceLevel',
    icon: Award,
    options: [
      { value: 'entry', label: 'Entry Level' },
      { value: 'mid', label: 'Mid Level' },
      { value: 'senior', label: 'Senior Level' },
      { value: 'executive', label: 'Executive' },
    ],
  },
  {
    name: 'Job Type',
    key: 'jobType',
    icon: Briefcase,
    options: [
      { value: 'full-time', label: 'Full-time' },
      { value: 'part-time', label: 'Part-time' },
      { value: 'contract', label: 'Contract' },
      { value: 'internship', label: 'Internship' },
      { value: 'temporary', label: 'Temporary' },
    ],
  },
  {
    name: 'Company',
    key: 'company',
    icon: Building,
    options: [
      { value: 'techcorp', label: 'TechCorp Solutions' },
      { value: 'innovatetech', label: 'InnovateTech' },
      { value: 'designworks', label: 'DesignWorks Agency' },
      { value: 'cloudscale', label: 'CloudScale Systems' },
      { value: 'analyticspro', label: 'AnalyticsPro' },
    ],
  },
  {
    name: 'Salary Range',
    key: 'salary',
    icon: Banknote,
    options: [
      { value: '0-50000', label: '$0 - $50,000' },
      { value: '50000-80000', label: '$50,000 - $80,000' },
      { value: '80000-120000', label: '$80,000 - $120,000' },
      { value: '120000-150000', label: '$120,000 - $150,000' },
      { value: '150000-', label: '$150,000+' },
    ],
  },
  {
    name: 'Remote Options',
    key: 'remote',
    icon: Wifi,
    options: [
      { value: 'remote', label: 'Remote' },
      { value: 'hybrid', label: 'Hybrid' },
      { value: 'onsite', label: 'On-site' },
    ],
  },
  {
    name: 'Date Posted',
    key: 'datePosted',
    icon: CalendarDays,
    options: [
      { value: 'today', label: 'Today' },
      { value: 'week', label: 'Past week' },
      { value: 'month', label: 'Past month' },
      { value: '3months', label: 'Past 3 months' },
    ],
  },
];

const Search = () => {
  const location = useLocation();
  const [jobs, setJobs] = useState(mockJobs);
  const [filteredJobs, setFilteredJobs] = useState(mockJobs);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [expandedFilters, setExpandedFilters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Parse URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    const locationParam = params.get('location');
    
    // Simulate loading state
    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      let filtered = [...mockJobs];
      
      if (query) {
        const queryLower = query.toLowerCase();
        filtered = filtered.filter(job => 
          job.title.toLowerCase().includes(queryLower) ||
          job.company.toLowerCase().includes(queryLower) ||
          job.description.toLowerCase().includes(queryLower)
        );
      }
      
      if (locationParam) {
        const locationLower = locationParam.toLowerCase();
        filtered = filtered.filter(job => 
          job.location.toLowerCase().includes(locationLower) ||
          (locationLower === 'remote' && job.is_remote)
        );
      }
      
      setFilteredJobs(filtered);
      setIsLoading(false);
    }, 800);
  }, [location.search]);
  
  const toggleFilter = (category: string, value: string) => {
    setActiveFilters(prev => {
      const currentFilters = { ...prev };
      if (!currentFilters[category]) {
        currentFilters[category] = [value];
      } else if (currentFilters[category].includes(value)) {
        currentFilters[category] = currentFilters[category].filter(v => v !== value);
        if (currentFilters[category].length === 0) {
          delete currentFilters[category];
        }
      } else {
        currentFilters[category] = [...currentFilters[category], value];
      }
      return currentFilters;
    });
  };
  
  const clearAllFilters = () => {
    setActiveFilters({});
  };
  
  const toggleExpandFilter = (category: string) => {
    setExpandedFilters(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const getActiveFilterCount = () => {
    return Object.values(activeFilters).reduce((sum, values) => sum + values.length, 0);
  };
  
  // Apply filters and sorting to jobs
  useEffect(() => {
    let result = [...jobs];
    
    // Apply active filters
    Object.entries(activeFilters).forEach(([category, values]) => {
      if (values.length > 0) {
        result = result.filter(job => {
          // This is a simplified implementation; in a real app, you'd map the filter
          // categories to the job properties more precisely
          switch(category) {
            case 'experienceLevel':
              return values.includes(job.experience_level || '');
            case 'remote':
              return (values.includes('remote') && job.is_remote) || 
                     (values.includes('onsite') && !job.is_remote);
            default:
              return true;
          }
        });
      }
    });
    
    // Apply sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime());
    } else if (sortBy === 'match') {
      result.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
    }
    
    setFilteredJobs(result);
  }, [jobs, activeFilters, sortBy]);

  return (
    <div className="min-h-screen bg-premium-gradient text-white">
      <Helmet>
        <title>Job Search | CareerSync</title>
        <meta name="description" content="Search for jobs, internships, and career opportunities on CareerSync" />
      </Helmet>
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 md:px-6">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2">Find Your Perfect Career Match</h1>
            <p className="text-silver-400 mb-6">
              Browse thousands of jobs from top companies around the world
            </p>
            
            <SearchBar />
          </div>
          
          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters Sidebar */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <motion.div 
                className="premium-glass rounded-lg overflow-hidden sticky top-24"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-navy-500" />
                    <h2 className="font-medium">Filters</h2>
                  </div>
                  
                  {getActiveFilterCount() > 0 && (
                    <button 
                      className="text-xs text-navy-500 hover:text-teal-500 transition-colors"
                      onClick={clearAllFilters}
                    >
                      Clear all
                    </button>
                  )}
                </div>
                
                <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto premium-scrollbar">
                  {filterCategories.map((category) => (
                    <div key={category.key} className="mb-4 pb-4 border-b border-white/10 last:border-b-0 last:mb-0 last:pb-0">
                      <button 
                        className="w-full flex items-center justify-between text-silver-300 hover:text-white transition-colors mb-2"
                        onClick={() => toggleExpandFilter(category.key)}
                        aria-expanded={expandedFilters.includes(category.key)}
                      >
                        <div className="flex items-center gap-2">
                          <category.icon className="h-4 w-4 text-navy-500" />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <ChevronDown 
                          className={`h-4 w-4 transition-transform ${
                            expandedFilters.includes(category.key) ? 'rotate-180' : ''
                          }`} 
                        />
                      </button>
                      
                      {expandedFilters.includes(category.key) && (
                        <div className="mt-2 space-y-2">
                          {category.options.map((option) => (
                            <label 
                              key={option.value} 
                              className="flex items-center gap-2 text-sm text-silver-400 hover:text-white transition-colors cursor-pointer"
                            >
                              <input 
                                type="checkbox" 
                                className="form-checkbox h-4 w-4 rounded border-white/20 text-navy-500 focus:ring-navy-500"
                                checked={(activeFilters[category.key] || []).includes(option.value)}
                                onChange={() => toggleFilter(category.key, option.value)}
                              />
                              {option.label}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
            
            {/* Results */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="premium-glass rounded-lg p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-medium">
                    {isLoading ? 'Searching...' : `${filteredJobs.length} jobs found`}
                  </h2>
                  {getActiveFilterCount() > 0 && (
                    <p className="text-sm text-silver-400">
                      {getActiveFilterCount()} active {getActiveFilterCount() === 1 ? 'filter' : 'filters'}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="flex-1 sm:flex-none">
                    <select 
                      className="premium-glass text-white rounded-lg px-3 py-2 border border-white/10 w-full focus:border-navy-500 focus:ring-1 focus:ring-navy-500 focus:outline-none"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="relevance">Relevance</option>
                      <option value="newest">Newest</option>
                      <option value="match">Match Score</option>
                    </select>
                  </div>
                  
                  <div className="premium-glass rounded-lg border border-white/10 flex">
                    <button 
                      className={`p-2 ${viewMode === 'grid' ? 'bg-white/10 text-navy-500' : 'text-silver-500'}`}
                      onClick={() => setViewMode('grid')}
                      aria-label="Grid view"
                    >
                      <Grid className="h-5 w-5" />
                    </button>
                    <button 
                      className={`p-2 ${viewMode === 'list' ? 'bg-white/10 text-navy-500' : 'text-silver-500'}`}
                      onClick={() => setViewMode('list')}
                      aria-label="List view"
                    >
                      <List className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Active Filters */}
              {getActiveFilterCount() > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {Object.entries(activeFilters).map(([category, values]) => 
                    values.map(value => {
                      const categoryObj = filterCategories.find(c => c.key === category);
                      const optionObj = categoryObj?.options.find(o => o.value === value);
                      
                      return (
                        <div 
                          key={`${category}-${value}`} 
                          className="premium-glass rounded-full px-3 py-1 flex items-center gap-1 text-sm border border-white/10"
                        >
                          <span>{categoryObj?.name}: {optionObj?.label}</span>
                          <button 
                            onClick={() => toggleFilter(category, value)}
                            className="text-silver-500 hover:text-white transition-colors"
                            aria-label={`Remove ${optionObj?.label} filter`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
              
              {/* Job Results */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((_, index) => (
                    <div key={index} className="premium-card rounded-lg p-5 animate-pulse">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="h-12 w-12 rounded-md bg-white/10 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="h-5 bg-white/10 rounded mb-2 w-3/4"></div>
                          <div className="h-4 bg-white/10 rounded mb-3 w-1/2"></div>
                          <div className="h-3 bg-white/10 rounded w-2/3"></div>
                        </div>
                      </div>
                      <div className="h-4 bg-white/10 rounded mb-2 w-full"></div>
                      <div className="h-4 bg-white/10 rounded mb-6 w-5/6"></div>
                      <div className="h-3 bg-white/10 rounded mt-auto"></div>
                    </div>
                  ))}
                </div>
              ) : filteredJobs.length > 0 ? (
                <div className={`${
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 gap-6' 
                    : 'space-y-4'
                }`}>
                  {filteredJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <div className="premium-glass rounded-lg p-8 text-center">
                  <div className="mb-4 mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-white/5">
                    <SearchIcon className="h-8 w-8 text-silver-500" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No jobs found</h3>
                  <p className="text-silver-400 mb-6">
                    Try adjusting your search criteria or filters to find more job opportunities.
                  </p>
                  <button 
                    onClick={clearAllFilters}
                    className="premium-button rounded-lg px-6 py-2.5"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Search;
