import { ArrowRight, Factory, Cog, Users } from 'lucide-react';
import { useSelector } from 'react-redux';

const Hero = () => {
  const theme = useSelector((state) => state.global.theme);
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
          {/* <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}>  
          </div> */}
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 xl:py-32">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                Welcome to <span className={`${theme==="navi-blue"?'text-blue-400':"text-[var(--accent)]"}`}>SIPL</span>
                <br />
                <span className="text-gray-300">Employee Portal</span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed">
                Your central hub for project management, production tracking, and team collaboration. 
                Access all your work tools and stay connected with manufacturing operations.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button className={`bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 shadow-lg text-sm sm:text-base`}>
                Access Your Dashboard
                <ArrowRight size={16} className="sm:w-5 sm:h-5" />
              </button>
              <button className={`border-1 ${theme==="navi-blue"?'border-white/30 hover:border-white':"border-[var(--border)] hover:border-[var(--ring)]"} text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold transition-all duration-200 hover:bg-white/10 text-sm sm:text-base`}>
                My Projects
              </button>
            </div>
          </div>

          <div className="lg:pl-8">
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-blue-600 rounded-lg">
                    <Factory size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white">Production Management</h3>
                    <p className="text-sm sm:text-base text-gray-300">Track tyre & rim manufacturing progress</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-green-600 rounded-lg">
                    <Cog size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white">Quality Control</h3>
                    <p className="text-sm sm:text-base text-gray-300">Monitor standards and compliance</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-purple-600 rounded-lg">
                    <Users size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white">Team Communication</h3>
                    <p className="text-sm sm:text-base text-gray-300">Collaborate with your colleagues</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;