import { TrendingUp, Users, Factory, Award } from 'lucide-react';

const Stats = () => {
  const stats = [
    {
      icon: Factory,
      number: "25+",
      label: "Active Projects",
      description: "Manufacturing projects in progress"
    },
    {
      icon: Users,
      number: "150+",
      label: "Team Members",
      description: "Skilled professionals across departments"
    },
    {
      icon: TrendingUp,
      number: "98%",
      label: "Efficiency Rate",
      description: "Production efficiency improvement"
    },
    {
      icon: Award,
      number: "15+",
      label: "Years Experience",
      description: "In tyre and rim manufacturing"
    }
  ];

  return (
    <section className="py-24 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Sundaram Industries by the Numbers
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Driving excellence in manufacturing with proven results and continuous innovation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center group hover:scale-105 transition-transform duration-300"
            >
              <div className="inline-flex p-4 bg-blue-600 rounded-full mb-6 group-hover:bg-blue-500 transition-colors">
                <stat.icon size={32} />
              </div>
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {stat.number}
              </div>
              <div className="text-xl font-semibold mb-2">
                {stat.label}
              </div>
              <div className="text-gray-400">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;