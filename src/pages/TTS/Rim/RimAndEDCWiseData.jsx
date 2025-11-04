import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GiCarWheel } from "react-icons/gi";
import {
  FaDotCircle, FaCogs, FaCar, FaTachometerAlt, FaBolt, FaPalette,
  FaDatabase, FaWrench, FaTruck, FaHashtag, FaCalendarAlt,
  FaFileInvoice, FaUser, FaCircle, FaBarcode, FaRegCheckCircle
} from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

import Input from "../../../components/InputFields/Input";
import Select from "../../../components/InputFields/Select";
import Button from "../../../components/InputFields/Button";
import { useDispatch, useSelector } from "react-redux";
import { getRimSize } from "../../../Redux/Slices/RimApplicationSlice";
import toast from "react-hot-toast";




const barcodeOptions = {
  SUPPLIER: {
    icon: <FaTruck />,
    options: ["Supplier A", "Supplier B", "Supplier C"],
  },
  PO_NO: {
    icon: <FaHashtag />,
    options: ["PO123", "PO456", "PO789"],
  },
  PO_DATE: {
    icon: <FaCalendarAlt />,
    options: ["2024-01-01", "2024-02-15", "2024-03-30"],
  },
  INVOICE_NO: {
    icon: <FaFileInvoice />,
    options: ["INV001", "INV002", "INV003"],
  },
  INVOICE_DATE: {
    icon: <FaCalendarAlt />,
    options: ["2024-01-10", "2024-02-20", "2024-03-25"],
  },
  RECEIVED_BY: {
    icon: <FaUser />,
    options: ["John Doe", "Jane Smith", "Admin"],
  },
  RECEIVED_DATE: {
    icon: <FaCalendarAlt />,
    options: ["2024-01-15", "2024-02-28", "2024-04-05"],
  },
};

// Rim Form Component
export const RimForm = ({ options, onSubmit }) => (
  <form onSubmit={onSubmit} className="grid grid-cols-3 gap-5 px-5 py-4">
    {Object.entries(options).map(([key, { icon, options }]) => (
      <motion.div key={key} whileHover={{ scale: 1.02 }} whileFocus={{ scale: 1.03 }} transition={{ type: "spring" }}>
        <Select name={key} icon={icon} label={key.replace(/_/g, " ")} >
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </Select>
      </motion.div>
    ))}
    <div className="col-span-3 flex justify-center">
      <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.97 }}>
        <Button type="submit" text="Make Barcode" icon={<FaBarcode />} />
      </motion.div>
    </div>
  </form>
);

// Barcode Modal Component
export const BarcodeModal = ({ isOpen, onClose, options }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end"
      >
        <motion.div
          initial={{ x: "100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "100%", opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl h-full overflow-y-auto bg-white dark:bg-gray-900 p-6 rounded-l-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaRegCheckCircle className="text-green-500 text-xl" />
              <h2 className="text-xl font-bold">Rim Barcode Prepare</h2>
            </div>
            <button onClick={onClose} className="text-xl text-gray-600 hover:text-black">
              <IoMdClose />
            </button>
          </div>

          <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(options).map(([key, { icon, options }]) => (
              <Select key={key} name={key} label={key.replace(/_/g, " ")} icon={icon}>
                {options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Select>
            ))}
          </form>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Main Component
const RimAndEDCWiseData = () => {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { state } = useLocation();
  const dispatch = useDispatch();
  const {loading,error,rimSize} =useSelector((state)=>state?.rimApplication)
  useEffect(() => {
    console.log(state);
    
    if (state?.type === 'DataWise') {
      dispatch(getRimSize())
    }
  }, [state])

  useEffect(()=>{
    if(loading){
      console.log('loading')
      }
      if (error) {
      toast.error(error)
      }
  },[error, loading])

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setOpen(true);
  };

  // Select Options
const rimOptions = {
  RIM_SIZE: {
    icon: <FaDotCircle />,
    options: rimSize?.map(rim=>rim?.rimSize),
  },
  RIM_TYPE: {
    icon: <FaCogs />,
    options: ["Alloy", "Steel", "Carbon Fiber"],
  },
  NO_OF_PRICE: {
    icon: <FaCircle />,
    options: ["1", "2", "3"],
  },
  TYRE_CATEGORY: {
    icon: <FaCar />,
    options: ["Passenger", "SUV", "Truck"],
  },
  PILOTED: {
    icon: <FaDotCircle />,
    options: ["Yes", "No"],
  },
  NO_OF_MOUNTING_HOLES: {
    icon: <FaBolt />,
    options: ["4", "5", "6"],
  },
  MOUNTING_HOLES_PCD: {
    icon: <FaBolt />,
    options: ["100 mm", "114.3 mm", "120 mm"],
  },
  MOUNTING_HOLES_DIA: {
    icon: <FaBolt />,
    options: ["10 mm", "12 mm", "14 mm"],
  },
  MOUNTING_HOLES_TYPE: {
    icon: <FaBolt />,
    options: ["Round", "Oval"],
  },
  RADIUS: {
    icon: <FaTachometerAlt />,
    options: ["300 mm", "350 mm", "400 mm"],
  },
  DISC_OFFSET: {
    icon: <FaTachometerAlt />,
    options: ["ET30", "ET35", "ET40"],
  },
  DISC_THICKNESS: {
    icon: <FaWrench />,
    options: ["5 mm", "6 mm", "7 mm"],
  },
  NO_OF_FIXING_HOLES: {
    icon: <FaBolt />,
    options: ["4", "5"],
  },
  FIXING_HOLES_PCD: {
    icon: <FaBolt />,
    options: ["98 mm", "108 mm"],
  },
  FIXING_HOLES_DIA: {
    icon: <FaBolt />,
    options: ["10 mm", "12 mm"],
  },
  FIXING_HOLES_TYPE: {
    icon: <FaCogs />,
    options: ["Bolt", "Nut"],
  },
  BORE_DIA: {
    icon: <FaCircle />,
    options: ["60.1 mm", "66.6 mm"],
  },
  PAINTING_COLOR: {
    icon: <FaPalette />,
    options: ["Black", "Silver", "Gunmetal"],
  },
  WALL_THICKNESS: {
    icon: <FaWrench />,
    options: ["4 mm", "5 mm"],
  },
  EDC_NO_PROCESS_ID: {
    icon: <FaDatabase />,
    options: ["EDC001", "EDC002", "EDC003"],
  },
};

  return (
    <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="w-full min-h-[36.6rem] mt-2 rounded-md shadow bg-white dark:bg-gray-900"
  >
    <div className="w-full min-h-[36.6rem] mt-2 rounded-md shadow bg-white dark:bg-gray-900">
      <div
        className="flex items-center gap-2 px-4 py-1 relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <motion.div className="relative w-10 h-10 flex items-center justify-center">
          <motion.div
            animate={hovered ? { rotate: 360 } : { rotate: 0 }}
            transition={{ repeat: hovered ? Infinity : 0, duration: 1.2, ease: "linear" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <GiCarWheel className="text-2xl text-[var(--color-primary)]" />
          </motion.div>
        </motion.div>

        <h1 className="text-2xl font-bold text-[var(--color-primary)] dark:text-white">
          {state?.type === "DataWise" ? "Rim Data Wise" : "EDC No Wise"}
        </h1>
      </div>
      {state.type === "EDCNoWise" && <div className="px-5">
        <p className="mb-1.5">Search by EDC No / ProcessID</p>
        <Input label="EDC No / ProcessID" />
      </div>}

      <RimForm options={rimOptions} onSubmit={handleFormSubmit} />
      <BarcodeModal isOpen={open} onClose={() => setOpen(false)} options={barcodeOptions} />
    </div>
    </motion.div>
  );
};

export default RimAndEDCWiseData;
