import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const SaleReportRedirect = () => {
  const { Menus, roles } = useSelector((state) => state.auth);
  console.log(Menus);
  

  if (roles?.toLowerCase() === "admin") {
    return <Navigate to="SaleRepost" replace />;
  }

  const menuUrls = Menus?.map((m) => m.menuUrl) || [];

  if (menuUrls.includes("/Reports/TTSReports/Sale/SaleRepost")) {
    return <Navigate to="SaleRepost" replace />;
  }

  if (menuUrls.includes("/Reports/TTSReports/Sale/PowerBIReport")) {
    return <Navigate to="PowerBIReport" replace />;
  }

  if (menuUrls.includes("/Reports/TTSReports/Sale/ProductionRepost")) {
    return <Navigate to="ProductionRepost" replace />;
  }

  if (menuUrls.includes("/Reports/TTSReports/Sale/MasterReportGeneration")) {
    return <Navigate to="MasterReportGeneration" replace />;
  }

  return <Navigate to="/" replace />;
};

export default SaleReportRedirect;