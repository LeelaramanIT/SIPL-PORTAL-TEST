import { Outlet } from "react-router-dom";


const MasterLayout = () => {

  return (
    <div className="w-full rounded-2xl bg-[var(--color-background)] dark:bg-gray-900">
    <Outlet/>
    </div>
  );
};

export default MasterLayout;
