import { BarChart3, Shield, Clock, Wrench, FileText, Target } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const Features = () => {
  const [visibleFeatures, setVisibleFeatures] = useState([]);
  const featureRefs = useRef([]);

  const features = [
    {
      icon: BarChart3,
      title: "Production Analytics",
      description: "Real-time insights into manufacturing performance, quality metrics, and production efficiency.",
      color: "bg-blue-500"
    },
    {
      icon: Shield,
      title: "Quality Assurance",
      description: "Comprehensive quality control systems ensuring every tyre and rim meets industry standards.",
      color: "bg-green-500"
    },
    {
      icon: Clock,
      title: "Timeline Management",
      description: "Track project milestones, delivery schedules, and optimize production timelines.",
      color: "bg-purple-500"
    },
    {
      icon: Wrench,
      title: "Equipment Monitoring",
      description: "Monitor machinery performance, maintenance schedules, and operational efficiency.",
      color: "bg-orange-500"
    },
    {
      icon: FileText,
      title: "Documentation Hub",
      description: "Centralized storage for specifications, compliance reports, and project documentation.",
      color: "bg-cyan-500"
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set and monitor production targets, KPIs, and performance objectives across teams.",
      color: "bg-red-500"
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            setVisibleFeatures(prev => {
              if (!prev.includes(index)) {
                return [...prev, index];
              }
              return prev;
            });
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    featureRefs.current.forEach((ref) => {
      if (ref) {
        observer.observe(ref);
      }
    });

    return () => {
      featureRefs.current.forEach((ref) => {
        if (ref) {
          observer.unobserve(ref);
        }
      });
    };
  }, []);

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Powerful Features for Manufacturing Excellence
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our comprehensive portal provides all the tools needed to manage your tyre and rim manufacturing projects efficiently.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              ref={(el) => (featureRefs.current[index] = el)}
              data-index={index}
              className={`bg-white dark:bg-gray-800 group rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-700 border border-gray-100 dark:border-gray-700 hover:border-[var(--color-primary)] dark:hover:border-[var(--color-primary)] transform ${
                visibleFeatures.includes(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: `${index * 100}ms`
              }}
            >
              <div className={`inline-flex p-3 rounded-lg ${feature.color} text-white mb-6 transform transition-transform duration-300 group-hover:scale-110`}>
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-[var(--color-primary)] mb-3 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
