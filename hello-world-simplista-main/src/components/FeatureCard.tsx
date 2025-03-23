
import { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  gradient?: 'blue' | 'purple' | 'mixed' | 'default';
  delay?: number;
}

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  gradient = 'default',
  delay = 0 
}: FeatureCardProps) => {
  const getGradientClass = () => {
    switch (gradient) {
      case 'blue':
        return 'from-electric-500/20 to-electric-500/5';
      case 'purple':
        return 'from-purple-500/20 to-purple-500/5';
      case 'mixed':
        return 'from-electric-500/20 to-purple-500/5';
      default:
        return 'from-white/10 to-white/5';
    }
  };

  const getIconClass = () => {
    switch (gradient) {
      case 'blue':
        return 'bg-gradient-to-br from-electric-400 to-electric-600 shadow-glow';
      case 'purple':
        return 'bg-gradient-to-br from-purple-400 to-purple-600 shadow-glow-purple';
      case 'mixed':
        return 'bg-gradient-to-br from-electric-500 to-purple-500 shadow-glow';
      default:
        return 'bg-white/10';
    }
  };

  return (
    <div 
      className={`group bg-gradient-to-b ${getGradientClass()} backdrop-blur-xl rounded-xl border border-white/10 p-6 transition-all duration-300 hover:shadow-glow hover:-translate-y-1 h-full flex flex-col animate-fade-in`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`${getIconClass()} rounded-lg p-3 w-12 h-12 flex items-center justify-center mb-5`}>
        {icon}
      </div>
      
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      
      <p className="text-gray-300 mb-4">{description}</p>
      
      <div className="mt-auto pt-4">
        <button className="text-electric-400 font-medium flex items-center group-hover:text-electric-300 transition-colors">
          Learn more
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 ml-1 transform transition-transform group-hover:translate-x-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FeatureCard;
