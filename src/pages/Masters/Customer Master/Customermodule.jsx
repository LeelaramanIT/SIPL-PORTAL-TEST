import React, { useEffect, useRef, useState } from "react";
import { Tabs } from "antd";
import { Building2, UserCog } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import CustomerMasterPage from "./Customermasterpage";
import UserCreation from "./Usercreation";
// import "./theme.css";
import { getCustomers } from "../../../Redux/Slices/Master/CustomerMaster/CustomerMasterSlice";
import { useDispatch } from "react-redux";
import ExportCustomerAddressManagement from "./ShipBillAddress";

// Order matters here — it's what determines slide direction (left vs right).
const TAB_ORDER = ["customer", "user", "Ship & Bill Address"];

export default function CustomerModule() {
  const dispatch = useDispatch();
  const [activeKey, setActiveKey] = useState("customer");
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const prevIndexRef = useRef(TAB_ORDER.indexOf("customer"));
  const contentRef = useRef(null);

  const handleTabChange = (key) => {
    const newIndex = TAB_ORDER.indexOf(key);
    const oldIndex = prevIndexRef.current;
    setDirection(newIndex >= oldIndex ? 1 : -1);
    prevIndexRef.current = newIndex;
    setActiveKey(key);

    console.log("Active Tab:", key);

    if (key === "customer") {
      // Call Customer API
      dispatch(getCustomers());
    }

    if (key === "user") {
      // Call User API
      // getUserList();
    }
  };
  const items = [
    {
      key: "customer",
      label: (
        <span className="flex items-center gap-2">
          <Building2 size={14} />
          Customer Creation
        </span>
      ),
    },
    {
      key: "user",
      label: (
        <span className="flex items-center gap-2">
          <UserCog size={14} />
          User Creation
        </span>
      ),
    },
    {
      key: "Ship & Bill Address",
      label: (
        <span className="flex items-center gap-2">
          <Building2 size={14} />
          ship & Bill Address
        </span>
      ),
    },
    // {
    //   key: "Ship",
    //   label: (
    //     <span className="flex items-center gap-2">
    //       <Building2 size={14} />
    //       ship
    //     </span>
    //   ),
    // },
  ];

  useEffect(() => {
    dispatch(getCustomers());
  }, []);

  const renderActiveContent = () => {
    switch (activeKey) {
      case "customer":
        return <CustomerMasterPage />;
      case "user":
        return <UserCreation />;
      case "Ship & Bill Address":
        return <ExportCustomerAddressManagement />;
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
    <div className="cm-grain min-h-screen">
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