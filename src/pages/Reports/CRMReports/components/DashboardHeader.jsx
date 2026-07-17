import { motion } from 'framer-motion';
import { BarChartOutlined } from '@ant-design/icons';

export default function DashboardHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between flex-wrap gap-3"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-[var(--radius)] bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center text-[18px]">
          <BarChartOutlined />
        </div>
        <div>
          <h1 className="text-[var(--foreground)] font-semibold text-[19px] leading-tight">
            Domestics Sales Analytics
          </h1>
          <p className="text-[var(--foreground)]/55 text-[13px]">CRM performance across regions, teams and products</p>
        </div>
      </div>
    </motion.div>
  );
}
