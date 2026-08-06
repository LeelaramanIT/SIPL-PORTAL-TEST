import React from "react";
import { Link } from "react-router-dom";
import {
  UserOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { LayoutGrid, FileText } from "lucide-react";

export const CustomerMasterMenuItems = [
  {
    key: "",
    icon: <LayoutGrid size={18} />,
    label: <Link to="">Master Hub</Link>,
  },
  {
    key: "/Masters/CustomerMaster/Creation",
    icon: <UserOutlined />,
    label: (
      <Link to="/Masters/CustomerMaster/Creation">
        Customer Creation
      </Link>
    ),
  },
  {
    key: "/Masters/CustomerMaster/Creation1",
    icon: <FileText size={18} />,
    label: (
      <Link to="/Masters/CustomerMaster/Creation1">
        Customer Creation 1
      </Link>
    ),
  },
  {
    key: "/Masters/CustomerMaster/Creation2",
    icon: <FileText size={18} />,
    label: (
      <Link to="/Masters/CustomerMaster/Creation2">
        Customer Creation 2
      </Link>
    ),
  },
  {
    key: "/Masters/CustomerMaster/ProcessIDMapping",
    icon: <FileText size={18} />,
    label: (
      <Link to="/Masters/CustomerMaster/ProcessIDMapping">
        Customer ProcessID Mapping
      </Link>
    ),
  },
//   {
//     key: "/Masters/Usermaster",
//     icon: <PlusCircleOutlined />,
//     label: <Link to="/Masters/Usermaster">User Creation</Link>,
//   },
];