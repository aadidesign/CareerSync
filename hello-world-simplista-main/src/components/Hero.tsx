
import { useEffect, useRef } from 'react';
import SearchBar from './SearchBar';

const Hero = () => {
  const floatingElementsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!floatingElementsRef.current) return;
      
      const elements = floatingElementsRef.current.querySelectorAll('.floating-element');
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      const moveX = (clientX - centerX) / 50;
      const moveY = (clientY - centerY) / 50;
      
      elements.forEach((el, i) => {
        const depth = (i + 1) * 0.5;
        const translateX = moveX * depth;
        const translateY = moveY * depth;
        (el as HTMLElement).style.transform = `translate(${translateX}px, ${translateY}px)`;
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative pt-28 pb-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-navy-800 to-navy-900 opacity-60"></div>
      
      {/* Floating graphics */}
      <div 
        ref={floatingElementsRef}
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        <div className="floating-element absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-electric-500/5 blur-3xl"></div>
        <div className="floating-element absolute bottom-1/4 left-1/4 w-56 h-56 rounded-full bg-purple-500/10 blur-3xl"></div>
        <div className="floating-element absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-electric-700/5 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-block mb-6 px-3 py-1 rounded-full glass text-sm font-medium text-electric-400 animate-fade-in">
            Unified Job Search. Intelligent Career Growth.
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight animate-fade-in">
            Synchronize Your <span className="text-gradient">Career Journey</span> Across Platforms
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl animate-fade-in animate-delay-100">
            CareerSync aggregates job listings from multiple sources, offering AI-powered recommendations 
            and smart application tracking to streamline your job search experience.
          </p>
          
          <div className="w-full max-w-2xl mx-auto mb-12 animate-fade-in animate-delay-200">
            <SearchBar />
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 animate-fade-in animate-delay-300">
            <button className="bg-gradient-to-r from-electric-500 to-electric-600 hover:from-electric-600 hover:to-electric-700 text-white px-6 py-3 rounded-lg shadow-glow transition-all duration-300 font-medium">
              Explore Jobs
            </button>
            <button className="bg-white/10 hover:bg-white/15 text-white border border-white/10 px-6 py-3 rounded-lg transition-all duration-300 font-medium">
              How It Works
            </button>
          </div>
        </div>
      </div>
      
      {/* Animated wave divider */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-navy-900 transform -translate-y-1/2">
        <svg className="absolute top-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 74">
          <path 
            fill="rgb(15, 23, 42)" 
            d="M0,37L48,46.3C96,56,192,74,288,74C384,74,480,56,576,46.3C672,37,768,37,864,42.2C960,46,1056,56,1152,56C1248,56,1344,46,1392,42.2L1440,37L1440,74L1392,74C1344,74,1248,74,1152,74C1056,74,960,74,864,74C768,74,672,74,576,74C480,74,384,74,288,74C192,74,96,74,48,74L0,74Z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default Hero;
