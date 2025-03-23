import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, MapPin, X, Briefcase, Filter, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from '@/contexts/SearchContext';
import { searchJobs } from '@/services/api';

const SearchBar = () => {
  const { 
    searchParams, 
    setSearchParams,
    setSearchResults,
    setIsLoading,
    setError
  } = useSearch();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    site: 'all',
    days_old: 7,
    results: 10,
    remote_only: false,
  });
  const filtersRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isInitialMount = useRef(true);
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Update local state when searchParams change - ONLY on initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      
      // Only set these values initially if they exist in searchParams
      if (searchParams.search) setSearchQuery(searchParams.search);
      if (searchParams.location) setLocation(searchParams.location);
      
      // Only update filters if any of them are defined in searchParams
      if (searchParams.site || searchParams.days_old || searchParams.results || searchParams.remote_only !== undefined) {
        setFilters({
          site: searchParams.site || 'all',
          days_old: searchParams.days_old || 7,
          results: searchParams.results || 10,
          remote_only: searchParams.remote_only || false,
        });
      }
    }
  }, []); // Empty dependency array - only runs once on mount

  // Load saved search params from URL on mount
  useEffect(() => {
    const url = new URL(window.location.href);
    const q = url.searchParams.get('q');
    const loc = url.searchParams.get('location');
    const site = url.searchParams.get('site');
    const daysOld = url.searchParams.get('days_old');
    const results = url.searchParams.get('results');
    const remoteOnly = url.searchParams.get('remote_only');
    
    // Only set these values if they exist in URL
    if (q) setSearchQuery(q);
    if (loc) setLocation(loc);
    
    const newFilters = { ...filters };
    if (site) newFilters.site = site;
    if (daysOld) newFilters.days_old = parseInt(daysOld);
    if (results) newFilters.results = parseInt(results);
    if (remoteOnly) newFilters.remote_only = remoteOnly === 'true';
    
    setFilters(newFilters);
  }, []); // Empty dependency array - only runs once on mount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const queryParams = new URLSearchParams();
    
    if (searchQuery) queryParams.append('q', searchQuery);
    if (location) queryParams.append('location', location);
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
    
    // First navigate to update the URL
    navigate(`/search?${queryParams.toString()}`);
    
    // Then explicitly fetch the data
    setIsLocalLoading(true);
    setLocalError(null);
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare search parameters
      const searchParams = {
        search: searchQuery || '',
        location: location || '',
        site: filters.site,
        days_old: filters.days_old,
        results: filters.results,
        remote_only: filters.remote_only
      };
      
      // Call the API with the search parameters
      const response = await searchJobs(searchParams);
      
      if (response.success) {
        // Update the global context with the results
        setSearchResults(response.data);
        setIsLoading(false);
      } else {
        setError(response.message || 'Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to fetch jobs. Please try again later.');
    } finally {
      setIsLocalLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setLocation('');
    setFilters({
      site: 'all',
      days_old: 7,
      results: 10,
      remote_only: false,
    });
  };
  
  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);
  
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => setSearchQuery('')}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-silver-300">Site</label>
                  <select 
                    className="w-full premium-glass text-white rounded-lg px-3 py-2 border border-white/10 focus:border-navy-500 focus:ring-1 focus:ring-navy-500 focus:outline-none"
                    value={filters.site}
                    onChange={(e) => updateFilter('site', e.target.value)}
                  >
                    <option value="all">All Sites</option>
                    <option value="indeed">Indeed</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="glassdoor">Glassdoor</option>
                    <option value="zip_recruiter">ZipRecruiter</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-silver-300">Job Age (Days)</label>
                  <select 
                    className="w-full premium-glass text-white rounded-lg px-3 py-2 border border-white/10 focus:border-navy-500 focus:ring-1 focus:ring-navy-500 focus:outline-none"
                    value={filters.days_old}
                    onChange={(e) => updateFilter('days_old', parseInt(e.target.value))}
                  >
                    <option value="1">1 day</option>
                    <option value="3">3 days</option>
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-silver-300">Results Count</label>
                  <select 
                    className="w-full premium-glass text-white rounded-lg px-3 py-2 border border-white/10 focus:border-navy-500 focus:ring-1 focus:ring-navy-500 focus:outline-none"
                    value={filters.results}
                    onChange={(e) => updateFilter('results', parseInt(e.target.value))}
                  >
                    <option value="5">5 results</option>
                    <option value="10">10 results</option>
                    <option value="20">20 results</option>
                    <option value="50">50 results</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="inline-flex items-center gap-2 text-sm text-silver-400 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="form-checkbox h-4 w-4 rounded border-white/20 text-navy-500 focus:ring-navy-500"
                    checked={filters.remote_only}
                    onChange={(e) => updateFilter('remote_only', e.target.checked)}
                  />
                  Remote jobs only
                </label>
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
                  className="premium-button rounded-lg px-4 py-1.5 text-sm font-medium"
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
