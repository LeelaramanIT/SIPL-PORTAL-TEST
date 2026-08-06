import React from "react";
import { Drawer, Button } from "antd";
import { motion } from "framer-motion";
import StatusBadge from "./StatusBadge";

const HistoryDrawer = ({ open, record, onClose }) => {
  if (!record) return null;
  const events = [...(record.history || [])].reverse(); // newest first

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={typeof window !== "undefined" ? Math.min(460, window.innerWidth) : 460}
      closable={false}
      classNames={{
        header: "!px-3 !py-2.5 sm:!px-6 sm:!py-4 dark:!border-slate-700",
        body: "!p-3 sm:!p-6",
        footer: "!p-1 dark:!border-slate-700",
        content: "dark:!bg-slate-800",
      }}
      title={
        <div>
          <p className="text-[13px] sm:text-[15px] font-semibold text-slate-900 dark:text-slate-100">History</p>
          <p className="text-[11px] sm:text-[12px] font-normal text-slate-500 dark:text-slate-400">
            {record.customerProcessId} · Revision {record.revision}
          </p>
        </div>
      }
      footer={
        <div className="flex justify-end p-1">
          <Button onClick={onClose} className="rounded-lg dark:!bg-slate-700 dark:!text-slate-100 dark:!border-slate-600">
            Close
          </Button>
        </div>
      }
    >
      <div className="relative pl-4 sm:pl-5">
        <div className="absolute bottom-2 left-[5px] sm:left-[7px] top-2 w-px bg-slate-200 dark:bg-slate-700" />
        <div className="space-y-4 sm:space-y-6">
          {events.map((ev, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className="relative"
            >
              <span className="absolute -left-4 sm:-left-5 top-1 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full border-2 border-white dark:border-slate-800 bg-blue-500 shadow-sm" />
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <p className="text-[12px] sm:text-[13px] font-semibold text-slate-800 dark:text-slate-100">{ev.action}</p>
                <StatusBadge status={ev.status} />
              </div>
              <p className="mt-0.5 text-[11px] sm:text-[12px] text-slate-500 dark:text-slate-400">
                {new Date(ev.date).toLocaleString()} · {ev.by}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </Drawer>
  );
};

export default HistoryDrawer;
