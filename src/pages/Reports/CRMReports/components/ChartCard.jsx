import { motion } from 'framer-motion';

export default function ChartCard({ title, controls, children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`bg-[var(--card)] border border-[var(--border)] rounded-[calc(var(--radius)*2)] shadow-[var(--shadow-card)] p-5 flex flex-col gap-3 min-w-0 ${className}`}
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-[var(--foreground)] font-semibold text-[14.5px]">{title}</h3>
        {controls}
      </div>
      {children}
    </motion.div>
  );
}
