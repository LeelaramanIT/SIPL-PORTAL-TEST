import { Outlet } from "react-router-dom";

const InvoiceLayout = () => {
  return (
    <div className="w-full h-[calc(100vh-63px)] bg-[#ececec] dark:bg-gray-800">
      <Outlet />
    </div>
  );
};

export default InvoiceLayout;
