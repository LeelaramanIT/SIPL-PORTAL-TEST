import { BarChart3, Shield, Clock, Wrench, FileText, Target } from 'lucide-react';

const Features = () => {
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

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Manufacturing Excellence
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive portal provides all the tools needed to manage your tyre and rim manufacturing projects efficiently.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
            >
              <div className={`inline-flex p-3 rounded-lg ${feature.color} text-white mb-6`}>
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
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
