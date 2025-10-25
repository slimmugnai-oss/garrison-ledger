import Link from 'next/link';

import AnimatedCard from './AnimatedCard';
import Icon from './Icon';

interface Resource {
  title: string;
  description: string;
  href: string;
  icon: string;
  category?: string;
}

interface RelatedResourcesProps {
  resources: Resource[];
  title?: string;
  className?: string;
}

export default function RelatedResources({ 
  resources, 
  title = "Related Resources",
  className = ""
}: RelatedResourcesProps) {
  if (resources.length === 0) return null;

  return (
    <AnimatedCard className={className} delay={200}>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-info dark:border-blue-700 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-primary dark:text-white mb-6 flex items-center gap-2">
          <Icon name="Link" className="h-6 w-6 text-info dark:text-info" />
          {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource, index) => (
            <Link key={index} href={resource.href}>
              <div className="bg-surface dark:bg-slate-800 rounded-lg p-4 border border-info dark:border-slate-600 hover:border-blue-400 dark:hover:border-info transition-all hover:shadow-lg group">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-info-subtle dark:bg-info/30 rounded-lg flex items-center justify-center">
                    <Icon name={resource.icon as 'Calculator' | 'Star' | 'MapPin' | 'Home' | 'Briefcase' | 'Sparkles' | 'Truck' | 'Wrench'} className="h-5 w-5 text-info dark:text-info" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {resource.category && (
                      <div className="text-xs text-info dark:text-info font-semibold mb-1 uppercase tracking-wide">
                        {resource.category}
                      </div>
                    )}
                    <div className="font-bold text-primary dark:text-white group-hover:text-info dark:group-hover:text-info transition-colors">
                      {resource.title}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-body dark:text-muted line-clamp-2">
                  {resource.description}
                </p>
                <div className="mt-3 flex items-center text-info dark:text-info text-sm font-semibold">
                  Learn More
                  <Icon name="ArrowRight" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AnimatedCard>
  );
}

