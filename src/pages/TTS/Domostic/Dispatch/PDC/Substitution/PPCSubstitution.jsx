import React, { useEffect, useState } from 'react'
import { DynamicDataTable } from '../../../../../../components/DynamicDataTable'
import { useDispatch, useSelector } from 'react-redux'

import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from "framer-motion";
import { getListOfSubstitutionData } from '../../../../../../Redux/Slices/PPCSubstitutionMaster/PPCSubstitutionSlice'

const PPCSubstitution = ({sheetMode}) => {
    const dispatch = useDispatch()
    const { listOfSubstitutionData , search} = useSelector(state => state.PPCSubstitution)
    const { loading, mode } = useSelector(state => state.PPCMaster)
    const [visibleRows, setVisibleRows] = useState(50);
    const { plant,custtype } = useParams()
    const navigate = useNavigate();

    useEffect(() => {
        setVisibleRows(50);
    }, [search,sheetMode]);

    const onActionClick = (row) => {
        navigate("/TTS/Domestic/Dispatch/PPC/Substitution/Details",{state:row})
    };

    const formatDateTime = (value) => {
        if (!value) return "-";

        // If already ISO or Date compatible
        const parsed = new Date(value);

        if (!isNaN(parsed)) {
            return parsed.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        }

        // Handle "MM/DD/YYYY HH:mm:ss" manually
        const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
        if (match) {
            const [, mm, dd, yyyy] = match;
            return `${dd}/${mm}/${yyyy}`;
        }

        return value; // fallback
    };
    const filteredInspectionData = useMemo(() => {
    const safe = (v) => String(v ?? "").toLowerCase();
    console.log(sheetMode);
    

    let data = listOfSubstitutionData;

    // 🔹 FIRST FILTER: Sheet Mode (Tyres / Split Rims / Claims)
    if (sheetMode) {
        data = data.filter(item => {
            const type = safe(item.processType);

            if (sheetMode === "tyres") return type === "order" || type === "ORDER"
            if (sheetMode === "splitRims") return type === "splitrim" || type === "rim";
            if (sheetMode === "claims") return type === "claim";

            return true;
        });
    }

    // 🔹 SECOND FILTER: Search
    if (!search.trim()) return data;

    const term = search.toLowerCase();

    return data.filter(item => {
        return (
            safe(item.custFullName).includes(term) ||
            safe(item.orderRefNo).includes(term) ||
            safe(item.workOrderNo).includes(term) ||
            safe(item.plant).includes(term) ||
            safe(formatDateTime(item.orderDate)).includes(term) ||
            safe(formatDateTime(item.revisedDate)).includes(term) ||
            safe(formatDateTime(item.desiredShipDate)).includes(term) ||
            safe(item.itemQty).includes(term)
        );
    });

}, [listOfSubstitutionData, search, sheetMode]);

console.log(filteredInspectionData)
    const data = []
    const uploadColumns = [
        { header: "CUSTOMER NAME", accessor: "custfullname", width: "2fr", align: "center" },
        { header: "WORK ORDER", accessor: "workOrderNo", width: "1.2fr", align: "center" },
        { header: "ORDER REF NO", accessor: "orderRefNo", width: "1.2fr", align: "center" },
        // { header: "ORDERED DATE", accessor: "orderDate", width: "1.2fr", align: "center", render: (value) => formatDateTime(value) },
        // { header: "LAST REVISED DATE", accessor: "revisedDate", width: "1.2fr", align: "center", render: (value) => formatDateTime(value) },
        { header: "DESIRED SHIP DATE",title:'CUSTOMER DESIRED SHIP DATE', accessor: "desiredShipDate", width: "1.3fr", align: "center", render: (value) => formatDateTime(value) },
        { header: "ITEM QTY", accessor: "itemQty", width: "1fr", align: "center" },
        { header: "SUBSTITUTION QTY", accessor: "substitutionQty", width: "1fr", align: "center" },
        { header: "PLANT", accessor: "plant", width: "1fr", align: "center" },
        {
            header: "ACTION", accessor: "action", width: "1.2fr", align: "center", render: (_, row) => (
                <button
                    onClick={() => onActionClick(row)}
                    className="px-2 py-1 text-[0.65rem] rounded bg-[var(--primary)] cursor-pointer text-white hover:opacity-90"
                >View
                </button>
            )
        }
    ];

    useEffect(() => {
        dispatch(getListOfSubstitutionData(plant,custtype))
    }, [plant,custtype])

    return (
        <div className='h-full flex flex-col min-h-0 p-3 bg-gray-50 dark:bg-slate-900'>
            {loading ? (<motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex flex-col items-center text-center justify-center text-slate-500 dark:text-slate-400"
          >
            <div className="relative w-32 h-16 mb-4">
              <svg
                viewBox="0 0 100 50"
                className="w-full h-full fill-none"
                style={{ stroke: 'var(--primary, #2563eb)' }}
              >
                {/* Pure Mathematical Infinity Path */}
                {/* The 'd' attribute below defines a perfect smooth figure-eight loop */}
                <path
                  id="infinity-path"
                  d="M31.6,15.5C21,15.5,12.5,24,12.5,34.5S21,53.5,31.6,53.5c6.2,0,11.7-3,15.1-7.5L66.7,21.5c3.4-4.5,8.9-7.5,15.1-7.5,10.6,0,19.1,8.5,19.1,19.1S92.4,52.4,81.8,52.4c-6.2,0-11.7-3-15.1-7.5L31.6,15.5Z"
                  transform="scale(0.8) translate(12, 5)"
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                <motion.path
                  d="M31.6,15.5C21,15.5,12.5,24,12.5,34.5S21,53.5,31.6,53.5c6.2,0,11.7-3,15.1-7.5L66.7,21.5c3.4-4.5,8.9-7.5,15.1-7.5,10.6,0,19.1,8.5,19.1,19.1S92.4,52.4,81.8,52.4c-6.2,0-11.7-3-15.1-7.5L31.6,15.5Z"
                  transform="scale(0.8) translate(12, 5)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, pathOffset: 0 }}
                  animate={{
                    pathLength: [0.1, 0.4, 0.1],
                    pathOffset: [0, 1]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </svg>
            </div>

            <p className="text-[0.8rem] ml-4 font-bold uppercase tracking-[0.2em] text-center text-slate-500 dark:text-slate-400">
              Loading {mode}...
            </p>
          </motion.div>) : (
            <DynamicDataTable columns={uploadColumns} data={filteredInspectionData} visibleRows={visibleRows} onLoadMore={() =>
                setVisibleRows(prev => Math.min(prev + 50, filteredInspectionData.length))} headerClassName='bg-[var(--primary)]/85 text-[var(--text)] dark:bg-slate-900' />
          )}
        </div>
    )
}

export default PPCSubstitution