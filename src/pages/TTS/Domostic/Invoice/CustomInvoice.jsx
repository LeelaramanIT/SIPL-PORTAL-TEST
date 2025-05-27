import React from 'react'
import TableComponent from '../../../../components/TableComponent'
import { IoMdSearch } from 'react-icons/io'

const CustomInvoice = () => {
  return (
    <div className="w-full p-4 rounded-2xl">
      <div className="flex flex-col md:flex-row w-full py-3 px-3 items-center gap-4 justify-between">
        {/* Search Bar */}
        <div className="flex relative w-full md:w-[60%] lg:w-[40%]">
          <input
            className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-28 py-2 transition duration-300 ease-in-out focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
            placeholder="Search..."
          />
          <button
            className="absolute top-1 right-1 flex items-center rounded bg-slate-800 py-1 px-2.5 border border-transparent text-sm text-white transition-all shadow-sm hover:bg-slate-700"
            type="button"
          >
            <IoMdSearch className="w-5 h-5 mr-2" />
            Search
          </button>
        </div>

        {/* Add User Button */}
        <button
          onClick={() => navigate("/Masters/UserMaster/UserCreate")}
          className="bg-slate-800 text-white py-1.5 px-5 rounded-md hover:bg-slate-700 transition duration-300 w-full md:w-auto"
        >
          + ADD USER
        </button>
      </div>

      {/* Content Area */}
      <div className="w-full h-[35.5rem] rounded-sm bg-background overflow-auto">
        <TableComponent headers={headers} data={tableData}  />
      </div>
    </div>
  )
}

export default CustomInvoice
