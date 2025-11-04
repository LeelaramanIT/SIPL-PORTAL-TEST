import { Mail, Phone, MapPin } from 'lucide-react';
import { useSelector } from 'react-redux';

const Footer = () => {
  const theme = useSelector((state) => state.global.theme);
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">
              <span className={`${theme==="navi-blue"?'text-blue-400':"text-[var(--accent)]"}`}>SUNDARAM</span> INDUSTRIES
            </h3>
            <p className="text-gray-300 dark:text-gray-400 mb-6">
              Leading manufacturer of high-quality tyres and rims, committed to excellence in production and innovation.
            </p>
            <div className="text-sm text-gray-400 dark:text-gray-500">
              SIPL Internal Portal - Project Management System - Tyre Tracking System
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 text-gray-300 dark:text-gray-400">
              <li><a href="#" className={`${theme==="navi-blue"?'hover:text-blue-400':"hover:text-[var(--accent)]"} transition-colors`}>Dashboard</a></li>
              <li><a href="#" className={`${theme==="navi-blue"?'hover:text-blue-400':"hover:text-[var(--accent)]"} transition-colors`}>Active Projects</a></li>
              <li><a href="#" className={`${theme==="navi-blue"?'hover:text-blue-400':"hover:text-[var(--accent)]"} transition-colors`}>Manufacturing</a></li>
              <li><a href="#" className={`${theme==="navi-blue"?'hover:text-blue-400':"hover:text-[var(--accent)]"} transition-colors`}>Quality Control</a></li>
              <li><a href="#" className={`${theme==="navi-blue"?'hover:text-blue-400':"hover:text-[var(--accent)]"} transition-colors`}>Reports</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Contact Information</h4>
            <div className="space-y-3 text-gray-300 dark:text-gray-400">
              <div className="flex items-center gap-3">
                <Mail size={18} className={`${theme==="navi-blue"?'text-blue-400':"text-[var(--accent)]"}`} />
                <span>info@sundaramindustries.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className={`${theme==="navi-blue"?'text-blue-400':"text-[var(--accent)]"}`} />
                <span>+91 XX XXXX XXXX</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={18} className={`${theme==="navi-blue"?'text-blue-400':"text-[var(--accent)]"}`} />
                <span>Manufacturing Plant, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 dark:border-gray-800 mt-12 pt-8 text-center text-gray-400 dark:text-gray-500">
          <p>&copy; 2024 Sundaram Industries. All rights reserved. | Internal Portal System</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;