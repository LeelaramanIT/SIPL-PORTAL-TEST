import { motion } from 'framer-motion';

/**
 * value is passed pre-formatted (string) so this component stays dumb
 * and reusable across every KPI, regardless of unit (currency, count, days...).
 */
export default function KPICard({ icon, label, value, subtext, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="bg-[var(--card)] border border-[var(--border)] rounded-[calc(var(--radius)*2)] shadow-[var(--shadow-card)] px-5 py-4 flex flex-col gap-2 min-w-0"
    >
      <div className="flex items-center justify-between">
        <span className="text-[var(--foreground)]/55 text-[13px] font-medium truncate">{label}</span>
        <span className="text-[var(--accent)] shrink-0 opacity-80">{icon}</span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-[var(--foreground)] text-[22px] font-semibold tracking-tight truncate tabular-nums">
          {value}
        </span>
        {trend !== undefined && trend !== null && (
          <span
            className="text-[12px] font-semibold tabular-nums shrink-0"
            style={{ color: trend >= 0 ? '#059669' : 'var(--destructive)' }}
          >
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      {subtext && <span className="text-[var(--foreground)]/40 text-[12px]">{subtext}</span>}
    </motion.div>
  );
}
