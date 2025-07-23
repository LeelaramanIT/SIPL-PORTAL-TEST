import React, { useState } from "react";
import TitleText from "../../../components/TitleText";
import Select from "../../../components/InputFields/Select";
import Button from "../../../components/InputFields/Button";
import { AnimatePresence, motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { FaBarcode, FaRegCheckCircle, FaRegDotCircle } from "react-icons/fa";
import { GiCarWheel } from "react-icons/gi";
import { FaUser, FaFileInvoice, FaCalendarAlt, FaTruck, FaHashtag } from "react-icons/fa";
import {
  FaDotCircle,          // generic icon
  FaCircle,             // options
  FaCogs,               // for categories
  FaCar,                // for passenger/SUV
  FaTachometerAlt,      // for radius/disc
  FaBolt,               // for mounting holes
  FaPalette,            // painting color
  FaDatabase,           // process/EDC
  FaWrench              // disc thickness, tooling
} from "react-icons/fa";
const RimDataWise = () => {
  const [open, setOpen] = useState(true);
  const [hovered, setHovered] = useState(false);
  console.log(open);

  const selectOptions = {
    RIM_SIZE: {
      icon: <FaDotCircle />,
      options: ["14 inch", "15 inch", "16 inch"],
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

  const selectOptions1 = {
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


  const handleSubmit = (e) => {
    e.preventDefault();
    setOpen(!open);
  };

  const handleSubmitBarcode = (e) => {
    e.preventDefault();
  };

  return (
    <div className="w-full h-full mt-2 rounded-md shadow bg-white dark:bg-gray-900">
      <div
        className="flex items-center gap-2 p-4 relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative w-10 h-10 flex items-center justify-center">
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.7, opacity: 0.15 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 m-auto w-10 h-10 rounded-full  z-0 flex items-center justify-center"
              />
            )}
          </AnimatePresence>
          {/* Spinning icon on hover (continuous) */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={hovered ? { rotate: 360 } : { rotate: 0 }}
            transition={{
              repeat: hovered ? Infinity : 0,
              repeatType: "loop",
              duration: 1.2,
              ease: "linear",
            }}
          >
            <GiCarWheel className="z-10 text-2xl text-[var(--color-primary)] dark:text-white" />
          </motion.div>
        </div>

        <h1 className="text-2xl font-bold text-[var(--color-primary)] dark:text-gray-200">
          Rim Data Wise
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-5 p-5">
  {Object.entries(selectOptions).map(([key, { icon, options }], i) => (
    <motion.div
      key={key}
      whileFocus={{ scale: 1.03, boxShadow: "0 0 0 2px #2563EB" }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Select
        name={key}
        icon={icon}
        label={key.replace(/_/g, " ")}
        className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
            className="dark:bg-gray-800 dark:text-white"
          >
            {option}
          </option>
        ))}
      </Select>
    </motion.div>
  ))}
  <div className="col-span-3 flex justify-center">
    <motion.div
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Button
        type="submit"
        text="Make Barcode"
        icon={<FaBarcode className="text-lg" />}
        className="dark:bg-gray-700 dark:text-white"
      />
    </motion.div>
  </div>
</form>

      <AnimatePresence>
  {open && (
    <motion.div
      key="modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 dark:bg-black/70 backdrop-blur-sm layout-scroll flex justify-end"
    >
      <motion.div
        key="modal-content"
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative w-full max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl h-full sm:h-auto overflow-y-auto bg-white dark:bg-gray-900 p-6 rounded-l-lg shadow-xl border border-gray-300 dark:border-gray-700 custom-scrollbar"
      >
        <div className="flex items-center gap-2 mb-4">
          <FaRegCheckCircle className="text-2xl text-green-500" />
          <h2 className="text-xl font-bold text-[var(--color-primary)] dark:text-white">
            Rim Barcode Prepare
          </h2>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="absolute top-5 right-5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white z-20"
        >
          <IoMdClose className="text-2xl" />
        </button>

        <div className="w-full">
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  {Object.entries(selectOptions1).map(([key, { icon, options }], i) => (
    <motion.div
      key={key}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Select
        name={key}
        label={key.replace(/_/g, " ")}
        icon={icon}
        className={i === 0 ? "col-span-2" : ""}
      >
        {options.map((option, idx) => (
          <option key={idx} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </motion.div>
  ))}
</form>

        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

    </div>
  );
};

export default RimDataWise;
