import { Outlet } from "react-router-dom";


const InvoiceLayout = () => {

  return (
    <div className="w-full py-1 px-2.5 rounded-2xl">
    <Outlet/>
    </div>
  );
};

export default InvoiceLayout;
