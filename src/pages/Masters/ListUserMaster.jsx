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
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className='text-2xl font-bold text-[var(--color-primary)] mb-6'>User Management</h1>
      
      <div className='bg-[var(--color-background)] p-6 rounded-lg border border-[var(--color-secondary)]'>
        <h2 className='text-lg font-semibold text-[var(--color-primary)] mb-4'>User List</h2>
        
        <div className="flex flex-col md:flex-row w-full py-3 px-3 items-center gap-4 justify-between mb-4">
          {/* Search Bar */}
          <div className="flex relative w-full md:w-[60%] lg:w-[40%]">
            <input
              className="w-full bg-transparent placeholder:text-[var(--color-text)]/50 text-[var(--color-text)] text-sm border border-[var(--color-secondary)] rounded-md pl-3 pr-28 py-2 transition duration-300 ease-in-out focus:outline-none focus:border-[var(--color-primary)] hover:border-[var(--color-primary)]/50 shadow-sm focus:shadow"
              placeholder="Search..."
            />
            <button
              className="absolute top-1 right-1 flex items-center rounded bg-[var(--color-primary)] py-1 px-2.5 border border-transparent text-sm text-[var(--color-text-hover)] transition-all shadow-sm hover:bg-[var(--color-primary-hover)]"
              type="button"
            >
              <IoMdSearch className="w-5 h-5 mr-2" />
              Search
            </button>
          </div>

          {/* Add User Button */}
          <button
            onClick={() => navigate("/Masters/UserMaster/UserCreate")}
            className="bg-[var(--color-primary)] text-[var(--color-text-hover)] py-1.5 px-5 rounded-md hover:bg-[var(--color-primary-hover)] transition duration-300 w-full md:w-auto"
          >
            + ADD USER
          </button>
        </div>

        {/* Content Area */}
        <div className="w-full h-[35.5rem] rounded-sm bg-[var(--color-background)] overflow-auto">
          <TableComponent headers={headers} data={tableData}  />
        </div>
      </div>
    </div>
  );
};

export default ListUserMaster;
