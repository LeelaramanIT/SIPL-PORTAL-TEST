import React, { useEffect, useState } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
// import { setMode } from '../../../Redux/Slices/PDIDispatchMaster/PDIMaster'
import { motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import SaleReportHeader from './SaleReportHeader'

const SaleRepostMaster = () => {
  const modeOrder = [
    "PowerBIReport",
    "SaleOrder"
  ];
  const [mode, setMode] = useState('SaleOrder')

  const { plant } = useParams();
  // const { mode } = useSelector(state => state.PDIDispatchMaster);
  const prevModeRef = useRef(mode);
  const currentIndex = modeOrder.indexOf(mode);
  const prevIndex = modeOrder.indexOf(prevModeRef.current);
  const [sheetMode, setSheetMode] = useState("tyres");
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

  console.log(plant)  
  return (
  <div className="w-full h-full flex flex-col overflow-scroll">

    {/* HEADER */}
    <div className="shrink-0">
      <SaleReportHeader
        plant={plant}
        mode={mode}
        setMode={setMode}
        sheetMode={sheetMode}
        setSheetMode={setSheetMode}
      />
    </div>

    {/* CONTENT */}
    <div className="flex-1 min-h-0 overflow-y-auto">
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
          <Outlet context={{ sheetMode }} />
        </motion.div>
      </AnimatePresence>
    </div>

  </div>
);
}

export default SaleRepostMaster
