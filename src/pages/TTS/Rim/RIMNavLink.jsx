import React from 'react'
import { useNavigate } from 'react-router-dom'
import  DropDownMenu  from "../../../components/InputFields/DropDownMenu";
const RIMNavLink = () => {

  const navigate = useNavigate(null)
  return (
    <nav className="flex max-w-full h-[100%] p-3 text-black rounded-t-md shadow items-center">
            <button
              className="text-sm dark:text-white px-3 py-0.5 h-8 rounded hover:bg-[var(--color-primary)] hover:text-[var(--color-text)] transition"
              onClick={() => navigate("RimOverView")}
            >
              Overview
            </button>

            <DropDownMenu
              className="text-sm dark:text-white px-3 py-1.5 hover:bg-[var(--color-primary)] hover:text-[var(--color-text)] transition"
              size="sm"
              buttonLabel="Rim Barcode"
              menuItems={[
                {
                  label: "Data Wise",
                  onClick: () => navigate('DataWise'),
                  className:'dark:text-white hover:bg-[var(--color-primary)] hover:text-[var(--color-text)]'
                },
                {
                  label: "EDC No Wise",
                  onClick: () => navigate('EDCNoWise'),
                  className:'dark:text-white hover:bg-[var(--color-primary)] hover:text-[var(--color-text)]'
                },
              ]}
            />

            <button
              className="text-sm dark:text-white px-3 py-1.5 rounded hover:bg-[var(--color-primary)] hover:text-[var(--color-text)] transition"
              onClick={() => navigate("rimstock")}
            >
             Rim Stock
            </button>
            <button
              className="text-sm dark:text-white px-3 py-1.5 rounded hover:bg-[var(--color-primary)] hover:text-[var(--color-text)] transition"
              onClick={() => navigate("/analytics")}
            >
              Analytics
            </button>

            <button
              className="text-sm dark:text-white px-3 py-1.5 rounded hover:bg-[var(--color-primary)] hover:text-[var(--color-text)] transition"
              onClick={() => navigate("/settings")}
            >
              Settings
            </button>
          </nav>
  )
}

export default RIMNavLink
