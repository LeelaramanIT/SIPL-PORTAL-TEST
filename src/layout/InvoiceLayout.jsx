import { Outlet } from "react-router-dom";

const InvoiceLayout = () => {
  return (
    <div className="w-full flex flex-col">
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};
export default InvoiceLayout
