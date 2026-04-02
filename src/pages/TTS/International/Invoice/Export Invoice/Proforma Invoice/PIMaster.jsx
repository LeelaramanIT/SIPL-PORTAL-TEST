import React, { useEffect, useState } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { setMode } from '../../../../../../Redux/Slices/ProformaInvoice/PIMasterSlice'
import { motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import PIHeader from './Header'

const PIMaster = () => {
  const modeOrder = [
    "Draft Proforma Invoice",
    "Proforma Invoice"
  ];

  const { plant } = useParams();
  const { mode } = useSelector(state => state.PIMaster);
  const prevModeRef = useRef(mode);
  const currentIndex = modeOrder.indexOf(mode);
  const prevIndex = modeOrder.indexOf(prevModeRef.current);
  const [sheetMode, setSheetMode] = useState("tyres");
  const [searchQuery, setSearchQuery] = useState("");
  // if going forward → slide left, backward → slide right
  const direction = currentIndex > prevIndex ? 1 : -1;
  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0
    })
  };

  // update ref for next render
  useEffect(() => {
    prevModeRef.current = mode;
  }, [mode]);

  return (
  <div className="w-full h-full flex flex-col overflow-hidden">

    {/* HEADER */}
    <div className="shrink-0">
      <PIHeader
        plant={plant}
        mode={mode}
        setMode={setMode}
        sheetMode={sheetMode}
        setSheetMode={setSheetMode}
        setSearchQuery={setSearchQuery}
        searchQuery={searchQuery}
      />
    </div>

    {/* CONTENT */}
    <div className="flex-1 min-h-0 relative overflow-hidden">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={mode}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25 }}
          className="h-full w-full"
        >
          <Outlet context={{ sheetMode, setSearchQuery, searchQuery }} />
        </motion.div>
      </AnimatePresence>
    </div>

  </div>
);
}

export default PIMaster
