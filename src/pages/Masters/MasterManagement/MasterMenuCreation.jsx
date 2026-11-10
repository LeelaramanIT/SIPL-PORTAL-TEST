import React from "react";
import { Link } from "react-router-dom";
import {
  UserOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { LayoutGrid, FileText, Route } from "lucide-react";

export const masterMenuItems = [
  {
    key: "/Masters/Master-creation",
    icon: <LayoutGrid size={18} />,
    label: <Link to="/Masters/Master-creation">Master Hub</Link>,
  },
  {
    key: "/Masters/Master-creation/legal-entity",
    icon: <UserOutlined />,
    label: (
      <Link to="/Masters/Master-creation/legal-entity">
        Legal Entity Master
      </Link>
    ),
  },
  {
    key: "/Masters/Master-creation/reports-master",
    icon: <FileText size={18} />,
    label: (
      <Link to="/Masters/Master-creation/reports-master">
        Reports Master
      </Link>
    ),
  },
  {
    key: "/Masters/Master-creation/order-routes",
    icon: <Route size={18} />,
    label: (
      <Link to="/Masters/Master-creation/order-routes">
        Order Routes
      </Link>
    ),
  },
  // {
  //   key: "/Masters/Usermaster",
  //   icon: <PlusCircleOutlined />,
  //   label: <Link to="/Masters/Usermaster">User Creation</Link>,
  // },
];