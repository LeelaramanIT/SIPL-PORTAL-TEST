import React, { useMemo, useState } from "react";
import TableComponent from "../../../components/TableComponent";
import { useNavigate } from "react-router-dom";
import assets from "../../../assets/assets";
import ToggleButton from "../../../components/ToggleButton";
import DialogBox from "../../../components/DialogBox";
import SearchBar from "../../../components/SearchBar";
import { TbEdit } from "react-icons/tb";

const AllUSers = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [nextStatus, setNextStatus] = useState(null);
  const [pendingChanges, setPendingChanges] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [viewUser, setViewUser] = useState(null);

  const [tableData, setTableData] = useState(() => {
    const departments = ["HR", "Engineering", "Marketing", "Sales", "Finance"];
    const designations = ["Manager", "Developer", "Analyst", "Intern", "Lead"];

    return Array.from({ length: 1000 }, (_, index) => ({
      id: index + 1,
      profile: assets.DefaultLogo,
      employeeid: `EMP${1000 + index}`,
      name: `User ${index + 1}`,
      email: `user${index + 1}@example.com`,
      phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
      department: departments[Math.floor(Math.random() * departments.length)],
      designation:
        designations[Math.floor(Math.random() * designations.length)],
      status: Math.random() > 0.5 ? "Active" : "Inactive",
      view: "Edit | Delete",
    }));
  });

  const filteredData = useMemo(() => {
    if (!searchQuery?.trim()) return tableData;

    const lowerCaseQuery = searchQuery.toLowerCase();

    return tableData.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(lowerCaseQuery)
      )
    );
  }, [searchQuery, tableData]);

  const navigate = useNavigate();
  const headers = [
    "ID",
    "Profile",
    "Employee ID",
    "Name",
    "Email",
    "Phone",
    "Department",
    "Designation",
    "Status",
    "Edit",
  ];

  const handleViewClick = (user) => {
    setViewUser(user);
  };

  const handleToggleClick = (user, newStatus) => {
    setSelectedUser(user);
    setNextStatus(newStatus);
    // Immediately update the pending changes for visual feedback
    setPendingChanges((prev) => ({
      ...prev,
      [user.id]: newStatus,
    }));
    setDialogOpen(true);
  };

  const handleConfirmStatusChange = () => {
    if (selectedUser && nextStatus) {
      // Permanently update the table data
      setTableData((prevData) =>
        prevData.map((user) =>
          user.id === selectedUser.id ? { ...user, status: nextStatus } : user
        )
      );
      // Clear the pending change
      setPendingChanges((prev) => {
        const newPending = { ...prev };
        delete newPending[selectedUser.id];
        return newPending;
      });
    }
    setDialogOpen(false);
    setSelectedUser(null);
    setNextStatus(null);
  };

  const handleCancelStatusChange = () => {
    // Revert the pending change
    setPendingChanges((prev) => {
      const newPending = { ...prev };
      delete newPending[selectedUser.id];
      return newPending;
    });
    setDialogOpen(false);
    setSelectedUser(null);
    setNextStatus(null);
  };

  return (
    <div className="w-full bg-[#F9FAFB] dark:bg-gray-900">
      <h1 className="text-2xl font-bold text-[var(--color-primary)] dark:text-white p-2">
        User Management
      </h1>

      <div className="px-4 mx-2 h-[38.6rem] bg-white dark:bg-gray-800 rounded-lg border border-[var(--color-secondary)] dark:border-gray-700">
        <h2 className="text-lg font-semibold text-[var(--color-primary)] dark:text-white mt-1">
          User List
        </h2>

        <div className="flex flex-col md:flex-row w-full pt-2 items-center gap-4 justify-between mb-4">
          {/* Search Bar */}
          <div className="flex relative w-full md:w-[60%]">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={() => {}}
            />
          </div>

          {/* Add User Button */}
          <button
            onClick={() => navigate("/Masters/UserMaster/UserCreate")}
            className="bg-[var(--color-primary)] text-[var(--color-text)] dark:text-white py-1 px-5 rounded-md hover:bg-[var(--color-primary-hover)] hover:text-[var(--color-text-hover)] dark:hover:text-black transition duration-300 w-full md:w-auto"
          >
            + ADD USER
          </button>
        </div>

        {/* Content Area */}
        <div className="w-full h-[32.6rem] rounded-sm bg-[var(--color-background)] dark:bg-gray-900 custom-scrollbar overflow-auto">
          <div className="min-w-[900px]">
            <TableComponent
              headers={headers}
              data={filteredData}
              highlightQuery={searchQuery}
              renderCell={({ row, header }) => {
                const key = header.toLowerCase().replace(/\s/g, "");

                if (key === "profile") {
                  return (
                    <img
                      className="w-10 h-10 rounded-full border-primary border cursor-pointer"
                      src={row.profile}
                      alt="UserLogo"
                      onClick={() => handleViewClick(row)}
                    />
                  );
                }

                if (key === "status") {
                  const currentStatus = pendingChanges[row.id] || row[key];
                  const isActive = currentStatus === "Active";

                  return (
                    <div className="flex justify-center min-w-[4rem]">
                      <ToggleButton
                        isChecked={isActive}
                        setIsChecked={(newValue) => {
                          const newStatus = newValue ? "Active" : "Inactive";
                          handleToggleClick(row, newStatus);
                        }}
                        onClick={() => {
                          // This will be called after setIsChecked
                          // We can handle any additional logic here if needed
                        }}
                      />
                    </div>
                  );
                }

                if (key === "edit") {
                  return (
                    <TbEdit
                      className="w-6 h-6 cursor-pointer text-[var(--color-text)]/80 dark:text-white"
                      onClick={() => {
                        console.log(row);
                      }}
                    />
                  );
                }
                return row[key] || "-";
              }}
            />
          </div>
        </div>
      </div>
      {dialogOpen && (
        <DialogBox
          isOpen={dialogOpen}
          onClose={handleCancelStatusChange}
          onConfirm={handleConfirmStatusChange}
          onCancel={handleCancelStatusChange}
          title="Confirm Status Change"
          confirmText="Yes"
          message={`You're about to change ${selectedUser?.name}'s status to ${nextStatus}. Do you want to proceed?`}
        />
      )}
      {viewUser && (
        <DialogBox
          isOpen={!!viewUser}
          onClose={() => setViewUser(null)}
          cancelText="Close"
          title={`Profile: ${viewUser?.name}`}
          hideFooter={true}
          message={
            <div className="text-gray-700 dark:text-gray-200 flex flex-col items-center">
              <img
                src={viewUser?.profile}
                className="w-40 h-40 rounded-full mx-auto mb-2 border-2 border-gray-300 dark:border-gray-700"
                alt="Profile"
              />
              <div className="text-gray-700 dark:text-gray-200">ID: {viewUser?.employeeid}</div>
              <div className="text-gray-700 dark:text-gray-200">Email: {viewUser?.email}</div>
              <div className="text-gray-700 dark:text-gray-200">Phone: {viewUser?.phone}</div>
            </div>
          }
        />
      )}
    </div>
  );
};

export default AllUSers;
