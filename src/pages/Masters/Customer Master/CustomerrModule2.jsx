import React, { useEffect, useRef, useState } from "react";
import { Tabs } from "antd";
import { Building2, UserCog, ChevronDown, MapPin, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import CustomerMasterPage from "./Customermasterpage";
import UserCreation from "./Usercreation";
// import "./theme.css";
import { getCustomers } from "../../../Redux/Slices/Master/CustomerMaster/CustomerMasterSlice";
import { useDispatch } from "react-redux";
import ExportCustomerAddressManagement from "./ShipBillAddress";
import UserCreationWorkspace from "./Usercreationworkspace";
import CustomerUserMaster from "./CustomerMasterUser";

/* ------------------------------------------------------------------ */
/* Accent tokens — reuses the same copper/plum/moss/clay system        */
/* already established in Customermasterpage.jsx / Usercreation.jsx    */
/* ------------------------------------------------------------------ */
const ACCENT = {
  copper: {
    bar: "bg-[var(--copper-500)]",
    chip: "bg-[var(--copper-100)] text-[var(--copper-700)]",
    ring: "border-[var(--copper-500)]",
    fill: "bg-[var(--copper-500)]",
  },
  plum: {
    bar: "bg-[var(--plum-600)]",
    chip: "bg-[var(--plum-100)] text-[var(--plum-600)]",
    ring: "border-[var(--plum-600)]",
    fill: "bg-[var(--plum-600)]",
  },
};

/* ------------------------------------------------------------------ */
/* Collapsible Accordion Panel — numbered, accent-striped card         */
/* ------------------------------------------------------------------ */
const AccordionPanel = ({ index, title, subtitle, icon: Icon, accent, isOpen, onToggle, children }) => {
  const a = ACCENT[accent] || ACCENT.copper;
  return (
    <div className="relative mb-4 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[var(--shadow-raised)]">
      <span className={`absolute left-0 top-0 h-full w-[3px] ${a.bar}`} />

      <button
        type="button"
        onClick={onToggle}
        className="flex w-full select-none items-center justify-between gap-4 px-6 py-4 pl-7 text-left transition-colors hover:bg-[var(--ink-100)]/40"
      >
        <div className="flex min-w-0 items-center gap-3.5">
          <span className="cm-mono shrink-0 text-[11px] font-semibold tracking-[0.14em] text-[var(--ink-950)] opacity-30">
            {index}
          </span>
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${a.chip}`}>
            <Icon size={16} />
          </div>
          <div className="min-w-0">
            <h4 className="cm-serif truncate text-[15px] font-medium text-[var(--ink-950)]">{title}</h4>
            {subtitle && <p className="mt-0.5 truncate text-[12px] text-[var(--ink-500)]">{subtitle}</p>}
          </div>
        </div>

        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--ink-500)]"
        >
          <ChevronDown size={14} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-[var(--border)]"
          >
            <div className="bg-[var(--ink-100)]/20">{children}</div>
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
  const [isCustomerOpen, setIsCustomerOpen] = useState(true);
  const [isUserOpen, setIsUserOpen] = useState(true);

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <AccordionPanel
        index="01"
        title="Customer Company Profile Setup"
        subtitle="Configure master organization, company parameters, and localization settings."
        icon={Building2}
        accent="copper"
        isOpen={isCustomerOpen}
        onToggle={() => setIsCustomerOpen(!isCustomerOpen)}
      >
        <CustomerMasterPage />
      </AccordionPanel>

      <AccordionPanel
        index="02"
        title="Associated User Accounts & Workspace Access"
        subtitle="Assign personnel, regional branches, and system operational handles to this company profile."
        icon={UserCog}
        accent="plum"
        isOpen={isUserOpen}
        onToggle={() => setIsUserOpen(!isUserOpen)}
      >
        <UserCreation />
      </AccordionPanel>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Main Layout Module                                                 */
/* ------------------------------------------------------------------ */
const TAB_ORDER = ["customer_user", "Ship & Bill Address"];
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
      // dispatch(getCustomers());
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
          <Building2 size={14} />
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
    // dispatch(getCustomers());
  }, [dispatch]);

  const renderActiveContent = () => {
    switch (activeKey) {
      case "customer_user":
        return <CustomerUserMaster />;
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
    <div className="cm-grain min-h-screen bg-[var(--background)]">
      {/* Dynamic Workflow Progress Header */}
      <div className="border-b border-[var(--border)] bg-[var(--background)] px-6 pt-5">
        <motion.div
          layout
          className="mb-4 flex min-h-14 items-center overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--ink-100)]/30 px-5 py-3 shadow-[var(--shadow-card)]"
        >
          {WORKFLOW_STEPS.map((step, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;

            return (
              <React.Fragment key={step}>
                <motion.div
                  layout
                  className={`flex shrink-0 items-center gap-2.5 cm-mono text-[11px] font-semibold uppercase tracking-[0.12em] ${
                    isCompleted
                      ? "text-[var(--moss-600)]"
                      : isActive
                      ? "text-[var(--copper-700)]"
                      : "text-[var(--ink-400)]"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold transition-all duration-300 ${
                      isCompleted
                        ? "border-[var(--moss-600)] bg-[var(--moss-100)] text-[var(--moss-700)]"
                        : isActive
                        ? "border-[var(--copper-600)] bg-[var(--copper-100)] text-[var(--copper-700)] shadow-[var(--shadow-card)]"
                        : "border-[var(--border)] bg-[var(--background)]"
                    }`}
                  >
                    {isCompleted ? <Check size={12} /> : index + 1}
                  </span>
                  <span className="cm-serif normal-case tracking-normal text-[13px] font-medium">{step}</span>
                </motion.div>

                {index < WORKFLOW_STEPS.length - 1 && (
                  <i className="relative mx-3 h-px min-w-6 flex-1 overflow-hidden not-italic bg-[var(--border)]">
                    <motion.span
                      initial={false}
                      animate={{ width: index < currentStep ? "100%" : "0%" }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-y-0 left-0 block bg-[var(--moss-500)]"
                    />
                  </i>
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