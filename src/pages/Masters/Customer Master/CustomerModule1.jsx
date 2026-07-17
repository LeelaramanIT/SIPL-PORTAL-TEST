import React, { useEffect, useRef, useState } from "react";
import { Tabs } from "antd";
import { Building2, UserCog, ChevronDown, ChevronUp, Layers, MapPin, Anchor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import CustomerMasterPage from "./Customermasterpage";
import UserCreation from "./Usercreation";
// import "./theme.css";
import { getCustomers } from "../../../Redux/Slices/Master/CustomerMaster/CustomerMasterSlice";
import { useDispatch } from "react-redux";
import ExportCustomerAddressManagement from "./ShipBillAddress";
import UserCreationWorkspace from "./Usercreationworkspace";

/* ------------------------------------------------------------------ */
/* Collapsible Accordion Panel Component                              */
/* ------------------------------------------------------------------ */
const AccordionPanel = ({ title, icon: Icon, isOpen, onToggle, children, subtitle }) => {
  return (
    <div className="mb-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#111318] shadow-sm overflow-hidden transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 bg-slate-50/70 hover:bg-slate-100/80 dark:bg-[#161820]/40 dark:hover:bg-[#161820]/80 border-b border-slate-200 dark:border-slate-800 text-left transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-[#1a1d26] border border-slate-200 dark:border-slate-800 shadow-sm text-slate-600 dark:text-slate-400">
            <Icon size={16} />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{title}</h4>
            {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <div className="text-slate-400 dark:text-slate-500 bg-white dark:bg-[#1e222b] border border-slate-200 dark:border-slate-800 p-1.5 rounded-md shadow-2xs">
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
            className="overflow-hidden"
          >
            <div className="p-6 bg-white dark:bg-[#111318]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Wrapper Component: Customer & User Stacked Layout                  */
/* ------------------------------------------------------------------ */
const CustomerUserStepAccordion = () => {
  // Only one panel can be open at a time — opening one closes the other.
  const [openPanel, setOpenPanel] = useState("customer"); // "customer" | "user" | null

  const toggleCustomer = () =>
    setOpenPanel((prev) => (prev === "customer" ? null : "customer"));
  const toggleUser = () =>
    setOpenPanel((prev) => (prev === "user" ? null : "user"));

  return (
    <div className="p-6 flex flex-col gap-1">
      {/* Top Section: Customer Creation (One-time creation) */}
      <AccordionPanel
        title="Customer Company Profile Setup"
        subtitle="Step 1: Configure master organization, company parameters, and localization settings."
        icon={Building2}
        isOpen={openPanel === "customer"}
        onToggle={toggleCustomer}
      >
        <CustomerMasterPage />
      </AccordionPanel>

      {/* Bottom Section: User Creation (Can add multiple users/branches) */}
      <AccordionPanel
        title="Associated User Accounts & Workspace Access"
        subtitle="Step 2: Assign specific personnel, regional branches, and system operational handles to this company profile."
        icon={UserCog}
        isOpen={openPanel === "user"}
        onToggle={toggleUser}
      >
        <UserCreation />
      </AccordionPanel>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Main Layout Module                                                 */
/* ------------------------------------------------------------------ */
const TAB_ORDER = ["customer_user", "Ship & Bill Address", ];
const WORKFLOW_STEPS = ["Customer Setup", "User Provisioning", "Address Mapping", "Shipping Terminal"];

export default function CustomerModule() {
  const dispatch = useDispatch();
  const [activeKey, setActiveKey] = useState("customer_user");
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const prevIndexRef = useRef(TAB_ORDER.indexOf("customer_user"));
  const contentRef = useRef(null);

  const handleTabChange = (key) => {
    const newIndex = TAB_ORDER.indexOf(key);
    const oldIndex = prevIndexRef.current;
    setDirection(newIndex >= oldIndex ? 1 : -1);
    prevIndexRef.current = newIndex;
    setActiveKey(key);

    if (key === "customer_user") {
      dispatch(getCustomers());
    }
  };

  // Determine current active workflow step index for the visual timeline top bar
  const getCurrentStepIndex = () => {
    if (activeKey === "customer_user") return 1; // Highlight up to step 2 dynamically
    if (activeKey === "Ship & Bill Address") return 2;
    // if (activeKey === "Ship") return 3;
    return 0;
  };

  const currentStep = getCurrentStepIndex();

  const items = [
    {
      key: "customer_user",
      label: (
        <span className="flex items-center gap-2">
          <Layers size={14} />
          Customer & User Creation
        </span>
      ),
    },
    {
      key: "Ship & Bill Address",
      label: (
        <span className="flex items-center gap-2">
          <MapPin size={14} />
          Ship & Bill Address
        </span>
      ),
    },
    // {
    //   key: "Ship",
    //   label: (
    //     <span className="flex items-center gap-2">
    //       <Anchor size={14} />
    //       Ship Terminal
    //     </span>
    //   ),
    // },
  ];

  useEffect(() => {
    dispatch(getCustomers());
  }, [dispatch]);

  const renderActiveContent = () => {
    switch (activeKey) {
      case "customer_user":
        return <CustomerUserStepAccordion />;
      case "Ship & Bill Address":
        return <ExportCustomerAddressManagement />;
    //   case "Ship":
    //     return <UserCreationWorkspace />;
      default:
        return null;
    }
  };

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0b0c10]">
      {/* Dynamic Workflow Progress Header */}
      <div className="px-6 pt-5 bg-white dark:bg-[#111318] border-b border-slate-100 dark:border-slate-900/60">
        <motion.div 
          layout 
          className="mb-4 flex min-h-14 items-center overflow-x-auto rounded-xl border border-slate-200 bg-white px-5 py-2.5 shadow-xs dark:border-slate-800 dark:bg-[#14171f] dark:shadow-none"
        >
          {WORKFLOW_STEPS.map((step, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;

            return (
              <React.Fragment key={step}>
                <motion.div 
                  layout 
                  className={`flex shrink-0 items-center gap-2.5 text-xs font-semibold uppercase tracking-wider ${
                    isCompleted 
                      ? "text-emerald-500 dark:text-emerald-400" 
                      : isActive 
                        ? "text-indigo-600 dark:text-indigo-400 font-bold" 
                        : "text-slate-400 dark:text-slate-600"
                  }`}
                >
                  <b className={`flex h-[24px] w-[24px] items-center justify-center rounded-full border text-xs font-bold transition-all duration-300 ${
                    isCompleted 
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 dark:border-emerald-400 dark:bg-emerald-400/10" 
                      : isActive 
                        ? "border-indigo-600 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/40 shadow-xs" 
                        : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-[#1c1f2a]"
                  }`}>
                    {isCompleted ? "✓" : index + 1}
                  </b>
                  <span>{step}</span>
                </motion.div>
                
                {index < WORKFLOW_STEPS.length - 1 && (
                  <i className={`mx-3 h-px min-w-6 flex-1 bg-slate-200 not-italic dark:bg-slate-800 transition-colors duration-300 ${
                    index < currentStep ? "bg-emerald-500/40 dark:bg-emerald-400/30" : ""
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </motion.div>
      </div>

      {/* Main Navigation Tabs */}
      <Tabs
        activeKey={activeKey}
        items={items}
        size="large"
        className="cm-tabs"
        onChange={handleTabChange}
        tabBarStyle={{
          margin: 0,
          paddingLeft: 24,
          paddingRight: 24,
          background: "var(--background)",
          borderBottom: "1px solid var(--ink-200)",
        }}
      />

      {/* Screen Routing with Slide Animation Layout */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeKey}
            ref={contentRef}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={(definition) => {
              if (definition === "center" && contentRef.current) {
                contentRef.current.style.transform = "none";
              }
            }}
          >
            {renderActiveContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}