
import { useState, useEffect } from 'react';

interface Statistic {
  label: string;
  value: string;
  target: number;
  prefix?: string;
  suffix?: string;
}

const statistics: Statistic[] = [
  { label: 'Jobs Aggregated', value: '0', target: 1250000, suffix: '+' },
  { label: 'Partner Platforms', value: '0', target: 42 },
  { label: 'Successful Matches', value: '0', target: 85000, suffix: '+' },
  { label: 'User Success Rate', value: '0', target: 92, suffix: '%' },
];

const StatisticsBar = () => {
  const [counts, setCounts] = useState<string[]>(statistics.map(() => '0'));
  const [animationStarted, setAnimationStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animationStarted) {
          setAnimationStarted(true);
          statistics.forEach((stat, index) => {
            animateCounter(index, stat.target);
          });
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('statistics-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [animationStarted]);

  const animateCounter = (index: number, target: number) => {
    const duration = 2000; // 2 seconds
    const frameDuration = 1000 / 60; // 60 fps
    const totalFrames = Math.round(duration / frameDuration);
    const increment = target / totalFrames;
    
    let currentFrame = 0;
    let currentCount = 0;
    
    const counter = setInterval(() => {
      currentCount += increment;
      currentFrame++;
      
      setCounts(prev => {
        const newCounts = [...prev];
        
        if (target >= 1000) {
          // Format large numbers with commas
          newCounts[index] = Math.min(Math.floor(currentCount), target).toLocaleString();
        } else {
          // Format percentages or smaller numbers
          newCounts[index] = Math.min(Math.floor(currentCount), target).toString();
        }
        
        return newCounts;
      });
      
      if (currentFrame === totalFrames) {
        clearInterval(counter);
      }
    }, frameDuration);
  };

  return (
    <div id="statistics-section" className="bg-navy-800/50 py-14 backdrop-blur-md border-y border-white/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {statistics.map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2 text-gradient">
                {stat.prefix}{counts[index]}{stat.suffix}
              </div>
              <div className="text-sm md:text-base text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatisticsBar;
