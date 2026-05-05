import React, { useEffect, useState, useRef } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { setMode } from '../../Redux/Slices/Customer_Item_Management/CIMMasterSlice'
import { motion, AnimatePresence } from "framer-motion";
import CPMHeader from './CPMHeader'

const CPMMaster = () => {
  const modeOrder = ["BarcodePrint"];
  const { plant } = useParams();
  const { mode } = useSelector(state => state.CIMMaster);
  const prevModeRef = useRef(mode);
  const currentIndex = modeOrder.indexOf(mode);
  const prevIndex = modeOrder.indexOf(prevModeRef.current);
  const [sheetMode, setSheetMode] = useState("tyres");
  
  const direction = currentIndex > prevIndex ? 1 : -1;

  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? 30 : -30, // Reduced distance for smoother feel
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir) => ({
      x: dir > 0 ? -30 : 30,
      opacity: 0
    })
  };

  useEffect(() => {
    prevModeRef.current = mode;
  }, [mode]);

  return (
    /* 1. Use h-screen to lock the container to the browser height */
    /* 2. overflow-hidden prevents the whole page from bouncing */
    <div className="w-full h-[calc(100vh-67px)] flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">

      {/* HEADER: Shrink-0 ensures it only takes the height it needs */}
      <div className="shrink-0 z-20 shadow-sm">
        <CPMHeader
          plant={plant}
          mode={mode}
          setMode={setMode}
          sheetMode={sheetMode}
          setSheetMode={setSheetMode}
        />
      </div>

      {/* CONTENT AREA */}
 
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={mode}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeInOut" }}
            /* 5. h-full ensures the motion div covers the scrollable area */
            className="min-h-0 w-full lg:p-2"
          >
            <Outlet context={{ sheetMode }} />
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}

export default CPMMaster;