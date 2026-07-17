import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Tags,
  CreditCard,
  ArrowUpRight,
  Lock,
} from "lucide-react";

/* ============================================================
   CUSTOMER HUB — INDEX PAGE
   Shown when a user lands on /Customers (index route)
   before picking a specific customer action.
   ============================================================ */

const MODULES = [
  {
    key: "customer-directory",
    to: "/Customers/Directory",
    tag: "01",
    icon: Users,
    title: "Customer Directory",
    description:
      "View, edit, and manage your complete customer list, contact details, shipping addresses, and core communication preferences.",
    status: "active",
  },
  {
    key: "add-customer",
    to: "/Customers/New",
    tag: "02",
    icon: UserPlus,
    title: "Onboard New Customer",
    description:
      "Register new client accounts, assign primary account managers, and set up initial account configurations.",
    status: "active",
  },
  {
    key: "customer-groups",
    to: "/Customers/Groups",
    tag: "03",
    icon: Tags,
    title: "Segments & Groups",
    description:
      "Categorize accounts by region, industry, or tier to streamline price lists, bulk discounts, and targeted reporting.",
    status: "active",
  },
  {
    key: "credit-billing",
    to: "/Customers/Credit-Billing",
    tag: "04",
    icon: CreditCard,
    title: "Credit & Billing Control",
    description:
      "Manage risk by enforcing credit limits, custom payment terms, payment methods, and automated overdue alerts.",
    status: "soon",
  },
]; 

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const ModuleCard = ({ module }) => {
  const Icon = module.icon;
  const isLocked = module.status === "soon";

  const cardContent = (
    <motion.div
      variants={cardVariant}
      whileHover={isLocked ? undefined : { y: -4 }}
      className={`group relative h-full rounded-2xl border p-6 transition-colors duration-200 ${
        isLocked
          ? "border-slate-200/70 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/30"
          : "border-slate-200/80 bg-white hover:border-indigo-200 hover:shadow-[0_8px_24px_-8px_rgba(79,70,229,0.18)] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800/60"
      }`}
    >
      <div className="flex items-start justify-between">
        <span
          className={`text-[11px] font-semibold tracking-[0.15em] tabular-nums ${
            isLocked ? "text-slate-300 dark:text-slate-600" : "text-indigo-400"
          }`}
        >
          {module.tag}
        </span>
        {isLocked ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10.5px] font-medium text-slate-400 dark:bg-slate-800 dark:text-slate-500">
            <Lock className="h-3 w-3" />
            Coming soon
          </span>
        ) : (
          <ArrowUpRight className="h-4 w-4 text-slate-300 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-indigo-500" />
        )}
      </div>

      <div
        className={`mt-5 flex h-11 w-11 items-center justify-center rounded-xl ${
          isLocked
            ? "bg-slate-100 dark:bg-slate-800"
            : "bg-indigo-50 dark:bg-indigo-500/10"
        }`}
      >
        <Icon
          className={`h-5 w-5 ${
            isLocked ? "text-slate-400" : "text-indigo-600 dark:text-indigo-400"
          }`}
          strokeWidth={1.75}
        />
      </div>

      <h3
        className={`mt-4 text-[15px] font-semibold tracking-tight ${
          isLocked ? "text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-white"
        }`}
      >
        {module.title}
      </h3>
      <p
        className={`mt-1.5 text-[13px] leading-relaxed ${
          isLocked ? "text-slate-400 dark:text-slate-600" : "text-slate-500 dark:text-slate-400"
        }`}
      >
        {module.description}
      </p>
    </motion.div>
  );

  if (isLocked) {
    return <div className="cursor-not-allowed">{cardContent}</div>;
  }

  return (
    <Link to={module.to} className="block h-full">
      {cardContent}
    </Link>
  );
};

const CustomerHubHome = () => {
  return (
    <div className="h-full overflow-y-auto px-6 py-10 sm:px-10 lg:px-14">
      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="mx-auto max-w-5xl"
      >
        {/* Eyebrow + heading */}
        <motion.div variants={cardVariant}>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-500">
            Customer Relations
          </span>
          <h1 className="mt-3 text-[28px] font-semibold tracking-tight text-slate-900 dark:text-white sm:text-[32px]">
            Your central engine for client accounts.
          </h1>
          <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-slate-500 dark:text-slate-400">
            Every quote, shipment, and payment milestone downstream depends on how
            clean your customer records are. Search your directory below or select a tool to get started.
          </p>
        </motion.div>

        {/* Module cards */}
        <motion.div
          variants={container}
          className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {MODULES.map((m) => (
            <ModuleCard key={m.key} module={m} />
          ))}
        </motion.div>

        {/* Footer note */}
        <motion.div
          variants={cardVariant}
          className="mt-10 flex items-center gap-2 border-t border-slate-100 pt-6 text-[12.5px] text-slate-400 dark:border-slate-800 dark:text-slate-500"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Customer profile updates reflect live across sales and billing systems immediately.
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CustomerHubHome;