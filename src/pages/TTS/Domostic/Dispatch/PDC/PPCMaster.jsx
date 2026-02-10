import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import PDIScanForInspection from './Substitution/PPCSubstitution'
import { useSelector } from 'react-redux'
import { setMode } from '../../../../../Redux/Slices/PPCSubstitutionMaster/PPCMaster'
import { motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import InspectionInComplete from './Inspection In Complete/InspecttionInComplete'
import LoadingCheck from './Loading Check/LoadingCheck'
import BarcodeDelete from './Barcode Delete/BarcodeDelete'
import ApprovalForLoading from './Approval For Loading/ApprovalForLoading'
import FinalInspectionReport from './Final Inspection Report/FinalInspectionReport'
import PPCHeader from './PPCHeader'
import PPCSubstitution from './Substitution/PPCSubstitution'

const PPCMaster = () => {
  const modeOrder = [
    "substitutiondetails",
    "inspectionincomplite",
    "loadingcheck",
    "barcodedelete",
    "approvalforloading",
    "finalinspectionreport"
  ];

  const { plant, custtype } = useParams()
  const { mode } = useSelector(state => state.PPCMaster)
  const data = {
    plant,custtype
  }
  console.log(mode);
  // const handleModeChange = (newMode) => {
  //   dispatch(setModeAction(newMode));
  // };
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

  console.log(data)  
  return (
    <div className="h-[calc(100vh-62px)] flex flex-col ">
      <PPCHeader plant={data} mode={mode} setMode={setMode} sheetMode={sheetMode} setSheetMode={setSheetMode} />
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
            className="h-full"
          >
              {mode === "substitutiondetails" && <PPCSubstitution sheetMode={sheetMode} />}
              {/* {mode === "inspectionincomplite" && <InspectionInComplete />} */}
              {/* {mode === "loadingcheck" && <LoadingCheck />} */}
              {/* {mode === "barcodedelete" && <BarcodeDelete />} */}
              {/* {mode === "approvalforloading" && <ApprovalForLoading />} */}
              {/* {mode === "finalinspectionreport" && <FinalInspectionReport  />} */}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default PPCMaster
