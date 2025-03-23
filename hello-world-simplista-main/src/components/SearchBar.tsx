
import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, Briefcase, Filter, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchFilters {
  experienceLevel?: string;
  jobType?: string;
  datePosted?: string;
  salary?: string;
}

const SearchBar = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const filtersRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load saved search params on mount
  useEffect(() => {
    const url = new URL(window.location.href);
    const q = url.searchParams.get('q');
    const loc = url.searchParams.get('location');
    const expLevel = url.searchParams.get('experienceLevel');
    const jType = url.searchParams.get('jobType');
    const datePosted = url.searchParams.get('datePosted');
    const salary = url.searchParams.get('salary');
    
    if (q) setJobTitle(q);
    if (loc) setLocation(loc);
    
    const newFilters: SearchFilters = {};
    if (expLevel) newFilters.experienceLevel = expLevel;
    if (jType) newFilters.jobType = jType;
    if (datePosted) newFilters.datePosted = datePosted;
    if (salary) newFilters.salary = salary;
    
    if (Object.keys(newFilters).length > 0) {
      setFilters(newFilters);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const queryParams = new URLSearchParams();
    
    if (jobTitle) queryParams.append('q', jobTitle);
    if (location) queryParams.append('location', location);
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    navigate(`/search?${queryParams.toString()}`);
  };

  const clearSearch = () => {
    setJobTitle('');
    setLocation('');
    setFilters({});
  };
  
  const updateFilter = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      <form 
        onSubmit={handleSubmit}
        className={`premium-glass rounded-lg flex flex-col md:flex-row items-center transition-all duration-400 ${
          isFocused ? 'shadow-premium border-white/10' : ''
        }`}
      >
        <div className="relative flex items-center flex-1 w-full px-4 py-4 border-b md:border-b-0 md:border-r border-white/10">
          <Briefcase className="h-5 w-5 text-silver-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Job title, keywords, or company"
            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-white px-3 py-1 placeholder-silver-600"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {jobTitle && (
            <button 
              type="button" 
              onClick={() => setJobTitle('')}
              className="text-silver-500 hover:text-white transition-colors"
              aria-label="Clear job title"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="relative flex items-center flex-1 w-full px-4 py-4">
          <MapPin className="h-5 w-5 text-silver-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Location or Remote"
            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-white px-3 py-1 placeholder-silver-600"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {location && (
            <button 
              type="button" 
              onClick={() => setLocation('')}
              className="text-silver-500 hover:text-white transition-colors"
              aria-label="Clear location"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="flex p-4 gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="premium-button-outline rounded-lg px-4 py-2.5 flex items-center gap-2"
            aria-expanded={showFilters}
            aria-controls="search-filters"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          <button
            type="submit"
            className="premium-button rounded-lg px-6 py-2.5 font-medium flex-1 flex items-center justify-center gap-2"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </form>
      
      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 mt-2 w-full"
            ref={filtersRef}
          >
            <div className="premium-glass rounded-lg p-5 shadow-premium">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-silver-300">Experience Level</label>
                  <select 
                    className="w-full premium-glass text-white rounded-lg px-3 py-2 border border-white/10 focus:border-navy-500 focus:ring-1 focus:ring-navy-500 focus:outline-none"
                    value={filters.experienceLevel || ''}
                    onChange={(e) => updateFilter('experienceLevel', e.target.value)}
                  >
                    <option value="">All levels</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-silver-300">Job Type</label>
                  <select 
                    className="w-full premium-glass text-white rounded-lg px-3 py-2 border border-white/10 focus:border-navy-500 focus:ring-1 focus:ring-navy-500 focus:outline-none"
                    value={filters.jobType || ''}
                    onChange={(e) => updateFilter('jobType', e.target.value)}
                  >
                    <option value="">All types</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="temporary">Temporary</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-silver-300">Date Posted</label>
                  <select 
                    className="w-full premium-glass text-white rounded-lg px-3 py-2 border border-white/10 focus:border-navy-500 focus:ring-1 focus:ring-navy-500 focus:outline-none"
                    value={filters.datePosted || ''}
                    onChange={(e) => updateFilter('datePosted', e.target.value)}
                  >
                    <option value="">Any time</option>
                    <option value="today">Today</option>
                    <option value="week">Past week</option>
                    <option value="month">Past month</option>
                    <option value="3months">Past 3 months</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-silver-300">Salary Range</label>
                  <select 
                    className="w-full premium-glass text-white rounded-lg px-3 py-2 border border-white/10 focus:border-navy-500 focus:ring-1 focus:ring-navy-500 focus:outline-none"
                    value={filters.salary || ''}
                    onChange={(e) => updateFilter('salary', e.target.value)}
                  >
                    <option value="">Any salary</option>
                    <option value="0-50000">$0 - $50,000</option>
                    <option value="50000-80000">$50,000 - $80,000</option>
                    <option value="80000-120000">$80,000 - $120,000</option>
                    <option value="120000-150000">$120,000 - $150,000</option>
                    <option value="150000-">$150,000+</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-between mt-5 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-silver-400 text-sm hover:text-white transition-colors"
                >
                  Clear all filters
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="premium-button-alt rounded-lg px-4 py-1.5 text-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
