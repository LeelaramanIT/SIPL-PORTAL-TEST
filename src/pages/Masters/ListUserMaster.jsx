import React from "react";
import { IoMdSearch } from "react-icons/io";
import TableComponent from "../../components/TableComponent";
import { useNavigate } from "react-router-dom";

const ListUserMaster = () => {
  const navigate = useNavigate()
  const headers = ["ID", "Name", "Email", "Phone", "Role", "Status", "Actions"];

  const generateTableData = (num) => {
    const roles = ["Admin", "User", "Seller"];
    const statuses = ["Active", "Inactive"];

    return Array.from({ length: num }, (_, index) => ({
        id: index + 1,
        name: `User ${index + 1}`,
        email: `user${index + 1}@example.com`,
        phone: `9${Math.floor(1000000000 + Math.random() * 900000000)}`,
        role: roles[Math.floor(Math.random() * roles.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        actions: "Edit | Delete",
    }));
};

const tableData = generateTableData(1000);
console.log(tableData);

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
  );
};

export default ListUserMaster;
