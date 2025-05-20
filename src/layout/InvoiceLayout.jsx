import { Outlet } from "react-router-dom";

const InvoiceLayout = () => {
return (
<div className="w-full flex flex-col bg-[#F7F2EF] dark:bg-gray-900">
<div className="flex-1 overflow-auto bg-white dark:bg-gray-800">
<Outlet />
</div>
</div>
);
};

export default InvoiceLayout;