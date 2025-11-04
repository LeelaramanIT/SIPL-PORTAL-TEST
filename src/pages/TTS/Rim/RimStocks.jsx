import React from "react";
import { FaRegDotCircle } from "react-icons/fa";
import { motion } from "framer-motion";


const RimStocks = () => {
  const WheelSpecCard = ({ spec }) => {
    return (
      <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-6 transition-transform hover:scale-[1.02]">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b pb-2">
          Wheel Specification
        </h2>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-800 dark:text-gray-300">
          {Object.entries(spec).map(([label, value]) => (
            <div key={label} className="space-y-0.5">
              <p className="font-medium text-gray-700 dark:text-gray-400">
                {label}
              </p>
              <p className="text-gray-900 dark:text-gray-100">{value}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const Example = ()=>{
    return(
      <div class="max-w-xl mx-auto p-4 bg-white shadow-md rounded-xl space-y-2">
  <h2 class="text-xl font-bold mb-4">Rim Specification</h2>
  <div class="grid grid-cols-2 gap-x-4 gap-y-2">
    <div><strong>EDC No / Process ID:</strong> 00321X12</div>
    <div><strong>Stock Qty:</strong> 15</div>
    <div><strong>Rim Size:</strong> 6.00G-12/V</div>
    <div><strong>Rim Type:</strong> SPLIT RIMS - 2</div>
    <div><strong>Tyre Category:</strong> SOLID & PNEUMATIC</div>
    <div><strong>Piloted:</strong> STUD</div>
    <div><strong>Mounting Holes:</strong> 5</div>
    <div><strong>PCD:</strong> 180.00</div>
    <div><strong>Hole Dia:</strong> 16.5</div>
    <div><strong>Hole Type:</strong> ROUND</div>
    <div><strong>Fixing Holes:</strong> 5</div>
    <div><strong>Fixing PCD:</strong> 190.0</div>
    <div><strong>Fixing Dia:</strong> 14.0</div>
    <div><strong>Fixing Type:</strong> PLAIN</div>
    <div><strong>Bore Dia:</strong> 140.00</div>
    <div><strong>Wall Thickness:</strong> 05.5</div>
    <div><strong>Disc Offset:</strong> 010.0</div>
    <div><strong>Disc Thickness:</strong> 05.0</div>
    <div><strong>Painting Color:</strong> SILVER</div>
  </div>
</div>

    )
  }

  const dummyWheelSpecs = [
    {
      "EDC NO / PROCESS ID": "00321X12",
      "STOCK QTY": 15,
      "RIM SIZE": "6.00G-12/V",
      "RIM TYPE": "SPLIT RIMS - 2",
      "TYRE CATEGORY": "SOLID & PNEUMATIC",
      PILOTED: "STUD",
      "NO. OF MOUNTING HOLES": 5,
      "MOUNTING HOLES PCD": "180.00",
      "MOUNTING HOLES DIA": "16.5",
      "MOUNTING HOLES TYPE": "ROUND",
      "NO. OF FIXING HOLES": 5,
      "FIXING HOLES PCD": "190.0",
      "FIXING HOLES DIA": "14.0",
      "FIXING HOLES TYPE": "PLAIN",
      "BORE DIA": "140.00",
      "WALL THICKNESS": "05.5",
      "DISC OFFSET": "010.0",
      "DISC THICKNESS": "05.0",
      "PAINTING COLOR": "SILVER",
    },
    {
      "EDC NO / PROCESS ID": "00788Z45",
      "STOCK QTY": 10,
      "RIM SIZE": "7.00J-15/C",
      "RIM TYPE": "ALLOY",
      "TYRE CATEGORY": "TRUCK",
      PILOTED: "STUD",
      "NO. OF MOUNTING HOLES": 8,
      "MOUNTING HOLES PCD": "225.00",
      "MOUNTING HOLES DIA": "18.0",
      "MOUNTING HOLES TYPE": "OVAL",
      "NO. OF FIXING HOLES": 8,
      "FIXING HOLES PCD": "230.0",
      "FIXING HOLES DIA": "15.0",
      "FIXING HOLES TYPE": "NUT",
      "BORE DIA": "170.00",
      "WALL THICKNESS": "06.5",
      "DISC OFFSET": "015.0",
      "DISC THICKNESS": "06.0",
      "PAINTING COLOR": "GUNMETAL",
    },
    {
      "EDC NO / PROCESS ID": "00456K09",
      "STOCK QTY": 30,
      "RIM SIZE": "5.50F-10/V",
      "RIM TYPE": "SPLIT RIMS - 2",
      "TYRE CATEGORY": "SUV",
      PILOTED: "STUD",
      "NO. OF MOUNTING HOLES": 4,
      "MOUNTING HOLES PCD": "160.00",
      "MOUNTING HOLES DIA": "14.0",
      "MOUNTING HOLES TYPE": "ROUND",
      "NO. OF FIXING HOLES": 4,
      "FIXING HOLES PCD": "165.0",
      "FIXING HOLES DIA": "13.5",
      "FIXING HOLES TYPE": "PLAIN",
      "BORE DIA": "130.00",
      "WALL THICKNESS": "05.0",
      "DISC OFFSET": "005.0",
      "DISC THICKNESS": "04.5",
      "PAINTING COLOR": "BLACK",
    },
    {
      "EDC NO / PROCESS ID": "00999P88",
      "STOCK QTY": 5,
      "RIM SIZE": "6.50H-14/A",
      "RIM TYPE": "STEEL",
      "TYRE CATEGORY": "PASSENGER",
      PILOTED: "NO",
      "NO. OF MOUNTING HOLES": 6,
      "MOUNTING HOLES PCD": "200.00",
      "MOUNTING HOLES DIA": "17.5",
      "MOUNTING HOLES TYPE": "COUNTERSINK CONICAL - ANGLE 60",
      "NO. OF FIXING HOLES": 6,
      "FIXING HOLES PCD": "206.4",
      "FIXING HOLES DIA": "13.0",
      "FIXING HOLES TYPE": "BOLT",
      "BORE DIA": "165.00",
      "WALL THICKNESS": "06.0",
      "DISC OFFSET": "000.0",
      "DISC THICKNESS": "00.0",
      "PAINTING COLOR": "BLACK",
    },
    {
      "EDC NO / PROCESS ID": "00112A77",
      "STOCK QTY": 12,
      "RIM SIZE": "6.00G-13/B",
      "RIM TYPE": "CARBON FIBER",
      "TYRE CATEGORY": "SUV",
      PILOTED: "YES",
      "NO. OF MOUNTING HOLES": 5,
      "MOUNTING HOLES PCD": "170.00",
      "MOUNTING HOLES DIA": "16.0",
      "MOUNTING HOLES TYPE": "OVAL",
      "NO. OF FIXING HOLES": 5,
      "FIXING HOLES PCD": "180.0",
      "FIXING HOLES DIA": "14.0",
      "FIXING HOLES TYPE": "NUT",
      "BORE DIA": "150.00",
      "WALL THICKNESS": "05.0",
      "DISC OFFSET": "010.0",
      "DISC THICKNESS": "04.0",
      "PAINTING COLOR": "SILVER",
    },
    {
      "EDC NO / PROCESS ID": "00666D44",
      "STOCK QTY": 18,
      "RIM SIZE": "5.50F-10/V",
      "RIM TYPE": "SPLIT RIMS - 2",
      "TYRE CATEGORY": "TRUCK",
      PILOTED: "NO",
      "NO. OF MOUNTING HOLES": 6,
      "MOUNTING HOLES PCD": "195.00",
      "MOUNTING HOLES DIA": "16.5",
      "MOUNTING HOLES TYPE": "ROUND",
      "NO. OF FIXING HOLES": 6,
      "FIXING HOLES PCD": "200.0",
      "FIXING HOLES DIA": "14.0",
      "FIXING HOLES TYPE": "PLAIN",
      "BORE DIA": "160.00",
      "WALL THICKNESS": "06.0",
      "DISC OFFSET": "005.0",
      "DISC THICKNESS": "03.0",
      "PAINTING COLOR": "GUNMETAL",
    },
    {
      "EDC NO / PROCESS ID": "00234M23",
      "STOCK QTY": 9,
      "RIM SIZE": "7.00J-16/D",
      "RIM TYPE": "ALLOY",
      "TYRE CATEGORY": "PASSENGER",
      PILOTED: "YES",
      "NO. OF MOUNTING HOLES": 4,
      "MOUNTING HOLES PCD": "155.00",
      "MOUNTING HOLES DIA": "14.0",
      "MOUNTING HOLES TYPE": "COUNTERSINK CONICAL - ANGLE 60",
      "NO. OF FIXING HOLES": 4,
      "FIXING HOLES PCD": "158.0",
      "FIXING HOLES DIA": "13.0",
      "FIXING HOLES TYPE": "BOLT",
      "BORE DIA": "135.00",
      "WALL THICKNESS": "05.0",
      "DISC OFFSET": "007.0",
      "DISC THICKNESS": "04.0",
      "PAINTING COLOR": "BLACK",
    },
    {
      "EDC NO / PROCESS ID": "00876R91",
      "STOCK QTY": 21,
      "RIM SIZE": "6.00G-13/A",
      "RIM TYPE": "STEEL",
      "TYRE CATEGORY": "SUV",
      PILOTED: "STUD",
      "NO. OF MOUNTING HOLES": 5,
      "MOUNTING HOLES PCD": "185.00",
      "MOUNTING HOLES DIA": "15.5",
      "MOUNTING HOLES TYPE": "ROUND",
      "NO. OF FIXING HOLES": 5,
      "FIXING HOLES PCD": "188.0",
      "FIXING HOLES DIA": "14.0",
      "FIXING HOLES TYPE": "PLAIN",
      "BORE DIA": "145.00",
      "WALL THICKNESS": "05.5",
      "DISC OFFSET": "008.0",
      "DISC THICKNESS": "04.0",
      "PAINTING COLOR": "SILVER",
    },
    {
      "EDC NO / PROCESS ID": "00559V65",
      "STOCK QTY": 7,
      "RIM SIZE": "6.50H-14/V",
      "RIM TYPE": "ALLOY",
      "TYRE CATEGORY": "PASSENGER",
      PILOTED: "YES",
      "NO. OF MOUNTING HOLES": 4,
      "MOUNTING HOLES PCD": "162.00",
      "MOUNTING HOLES DIA": "14.5",
      "MOUNTING HOLES TYPE": "OVAL",
      "NO. OF FIXING HOLES": 4,
      "FIXING HOLES PCD": "165.0",
      "FIXING HOLES DIA": "12.5",
      "FIXING HOLES TYPE": "NUT",
      "BORE DIA": "138.00",
      "WALL THICKNESS": "04.5",
      "DISC OFFSET": "006.0",
      "DISC THICKNESS": "03.0",
      "PAINTING COLOR": "GUNMETAL",
    },
    {
      "EDC NO / PROCESS ID": "00901T33",
      "STOCK QTY": 11,
      "RIM SIZE": "7.50K-16/C",
      "RIM TYPE": "CARBON FIBER",
      "TYRE CATEGORY": "TRUCK",
      PILOTED: "NO",
      "NO. OF MOUNTING HOLES": 8,
      "MOUNTING HOLES PCD": "240.00",
      "MOUNTING HOLES DIA": "19.0",
      "MOUNTING HOLES TYPE": "COUNTERSINK CONICAL - ANGLE 60",
      "NO. OF FIXING HOLES": 8,
      "FIXING HOLES PCD": "245.0",
      "FIXING HOLES DIA": "16.0",
      "FIXING HOLES TYPE": "PLAIN",
      "BORE DIA": "175.00",
      "WALL THICKNESS": "06.5",
      "DISC OFFSET": "012.0",
      "DISC THICKNESS": "05.0",
      "PAINTING COLOR": "BLACK",
    },
  ];

  return (
    <div className="w-full h-full p-4 overflow-y-auto custom-scrollbar">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
        Rim Stock List
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
         {" "}
        {dummyWheelSpecs.map((spec, idx) => (
          <motion.div
            key={spec["EDC NO / PROCESS ID"] || idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: idx * 0.05,
              type: "spring",
              stiffness: 75,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            
            <Example />
            {/* <WheelSpecCard spec={spec} /> {" "} */}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RimStocks;
