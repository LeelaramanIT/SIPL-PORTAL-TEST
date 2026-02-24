import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react"; // Matching your Lucide icon set
import { motion } from "framer-motion";

const BreadCrumbs = () => {
  const location = useLocation();
  
  // Split the pathname and remove empty strings
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Helper to make URL slugs look pretty (e.g., "UserMaster" -> "User Master")
  const formatLabel = (string) => {
    return string
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
      .trim();
  };

  return (
    <nav className="flex items-center space-x-2 py-2 px-1">
      {/* Home Icon/Link */}
      <Link
        to="/"
        className="text-slate-400 hover:text-blue-600 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {pathnames.length > 0 && (
        <ChevronRight className="w-3 h-3 text-slate-300" />
      )}

      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;

        return (
          <div key={to} className="flex items-center space-x-2">
            {last ? (
              // Current Page (Active)
              <motion.span 
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[11px] font-bold text-blue-600 uppercase tracking-tighter"
              >
                {formatLabel(value)}
              </motion.span>
            ) : (
              // Middle Links
              <>
                <Link
                  to={to}
                  className="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-tighter"
                >
                  {formatLabel(value)}
                </Link>
                <ChevronRight className="w-3 h-3 text-slate-300" />
              </>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default BreadCrumbs;