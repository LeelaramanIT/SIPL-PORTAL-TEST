import { motion } from "framer-motion";
import Header from "./Header";
import { Outlet } from "react-router-dom";

const ItemIDMaster = () => {

  return (
    <div className="bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200 p-2 h-full flex flex-col min-h-0 custom-scrollbar transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
        className="max-w-full mx-auto rounded-lg bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col flex-1 min-h-0"
      >
        <div className="shrink-0">
          <Header />
        </div>
        <Outlet />
      </motion.div>
    </div>
  );
};

export default ItemIDMaster;
