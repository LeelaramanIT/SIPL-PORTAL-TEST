import { Tag } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';

export default function ActiveFilterTags({ chips, onRemove }) {
  if (!chips.length) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <AnimatePresence initial={false}>
        {chips.map((chip) => (
          <motion.div
            key={`${chip.filterKey}-${chip.value}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
          >
            <Tag
              closable
              onClose={() => onRemove(chip.filterKey, chip.value)}
              className="!bg-[var(--accent)]/10 !border-[var(--accent)]/25 !text-[var(--accent)] !rounded-[var(--radius)] !py-0.5 !px-2 !text-[12.5px]"
            >
              {chip.label}
            </Tag>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
