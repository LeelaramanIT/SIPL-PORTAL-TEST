import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, UserCog, Check } from "lucide-react";

import CustomerMasterPage from "./Customermasterpage";
import UserCreation from "./Usercreation";

// Vertical step accordion: Step 1 (Customer) is shown first. Clicking Step 2
// collapses Step 1 and reveals User Creation below it. Once Step 2 is opened,
// Step 1 is permanently locked for the rest of the session (matches the
// earlier tab-lock behavior, just stacked vertically instead of tabbed).
export default function CustomerUserStepFlow() {
  const [activeStep, setActiveStep] = useState(1); // 1 = customer, 2 = user
  const [step1Closed, setStep1Closed] = useState(false);

  const goToStep = (step) => {
    if (step1Closed && step === 1) return; // Step 1 permanently closed
    setActiveStep(step);
    if (step === 2) setStep1Closed(true);
  };

  return (
    <div className="w-full">
      {/* Step indicator */}
      <div className="sticky top-0 z-20 flex items-center gap-4 border-b border-[var(--ink-200)] bg-[var(--background)] px-6 py-3">
        <button
          type="button"
          disabled={step1Closed}
          onClick={() => goToStep(1)}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${
            activeStep === 1 ? "text-[var(--primary)]" : "text-[var(--ink-400)]"
          } ${step1Closed ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
              activeStep === 1 ? "border-[var(--primary)] text-[var(--primary)]" : "border-[var(--ink-300)]"
            }`}
          >
            {step1Closed ? <Check size={12} /> : "1"}
          </span>
          <Building2 size={14} />
          Customer Creation
        </button>

        <div className="h-[1px] w-10 bg-[var(--ink-200)]" />

        <button
          type="button"
          onClick={() => goToStep(2)}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${
            activeStep === 2 ? "text-[var(--primary)]" : "text-[var(--ink-400)]"
          }`}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
              activeStep === 2 ? "border-[var(--primary)] text-[var(--primary)]" : "border-[var(--ink-300)]"
            }`}
          >
            2
          </span>
          <UserCog size={14} />
          User Creation
        </button>
      </div>

      {/* Vertical stacked content */}
      <div className="flex flex-col">
        <AnimatePresence initial={false}>
          {activeStep === 1 && (
            <motion.div
              key="customer-step"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <CustomerMasterPage />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {activeStep === 2 && (
            <motion.div
              key="user-step"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <UserCreation />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}