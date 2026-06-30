import { Outlet } from "react-router-dom";


const MasterLayout = () => {

  return (
    <div className="w-full h-full bg-[var(--color-background)] dark:bg-gray-900">
    {/* <div className="w-full h-5/6 bg-black dark:bg-gray-900"> */}
    <Outlet/>
    </div>
  );
};

export default MasterLayout;
