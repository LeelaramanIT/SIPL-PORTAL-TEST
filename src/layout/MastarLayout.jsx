import { Outlet } from "react-router-dom";


const MasterLayout = () => {

  return (
    <div className="w-full py-1 px-2.5 rounded-2xl bg-[var(--color-background)]">
    <Outlet/>
    </div>
  );
};

export default MasterLayout;
