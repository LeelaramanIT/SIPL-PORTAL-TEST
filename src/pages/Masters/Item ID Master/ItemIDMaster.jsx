import { motion, AnimatePresence } from "framer-motion";
import Header from "./Header";

const ItemIDMaster = () => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200 p-2 min-h-[88vh] custom-scrollbar transition-colors duration-300">
        <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
        // Added dark:bg-slate-800 and dark:border-slate-700
        className="max-w-full mx-auto rounded-lg bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col h-[89vh]">
            <Header/>   
        </motion.div>
    </div>
  )
}

export default ItemIDMaster