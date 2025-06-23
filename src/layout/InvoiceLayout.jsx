import { Outlet } from "react-router-dom";

const InvoiceLayout = () => {
  return (
    <div className="w-full flex layout-scroll flex-col dark:bg-gray-900">
      {/* Content wrapper with fixed navbar height offset */}
      <div className="flex-1 overflow-auto bg-[#f8f8f8] layout-scroll dark:bg-gray-800">
        <Outlet />
      </div>
    </div>
  );
};

export default InvoiceLayout;
