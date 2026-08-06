import React, { useMemo } from "react";
import { Dropdown } from "antd";
import {
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  CopyOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { DynamicDataTable } from "../../../../../components/DynamicDataTable";
import StatusBadge from "./StatusBadge";

export const BASE_COLUMNS = [
  { key: "customer", title: "Customer", width: "170px" },
  { key: "customerProcessId", title: "Customer Process ID", width: "190px" },
  { key: "ourProcessId", title: "Our Process ID", width: "150px" },
  { key: "platform", title: "Platform", width: "100px" },
  { key: "brand", title: "Brand", width: "140px" },
  { key: "sideWall", title: "Side Wall", width: "120px" },
  { key: "tyreSize", title: "Tyre Size", width: "160px" },
  { key: "rimSize", title: "Rim Size", width: "110px" },
  { key: "tyreType", title: "Tyre Type", width: "110px" },
  { key: "revision", title: "Rev", width: "80px" },
  { key: "status", title: "Status", width: "120px" },
  { key: "lastUpdated", title: "Last Updated", width: "150px" },
  { key: "updatedBy", title: "Updated By", width: "150px" },
];

const MappingTable = ({ data, loading, visible, onView, onEdit, onClone, onHistory, onToggleStatus }) => {
  const rowMenu = (record) => ({
    items: [
      { key: "view", label: "View", icon: <EyeOutlined /> },
      { key: "edit", label: "Edit", icon: <EditOutlined /> },
      { key: "clone", label: "Clone", icon: <CopyOutlined /> },
      { key: "history", label: "History", icon: <HistoryOutlined /> },
      { type: "divider" },
      record.status === "Active"
        ? { key: "toggle", label: "Deactivate", icon: <StopOutlined /> }
        : { key: "toggle", label: "Activate", icon: <CheckCircleOutlined /> },
    ],
    onClick: ({ key }) => {
      if (key === "view") onView(record);
      if (key === "edit") onEdit(record);
      if (key === "clone") onClone(record);
      if (key === "history") onHistory(record);
      if (key === "toggle") onToggleStatus(record);
    },
  });

  // DynamicDataTable expects { accessor, header, width, align, render }
  const columns = useMemo(() => {
    const cols = BASE_COLUMNS.filter((c) => visible[c.key]).map((c) => {
      const common = { accessor: c.key, header: c.title, width: c.width };

      if (c.key === "status") {
        return { ...common, render: (v) => <StatusBadge status={v} /> };
      }
      if (c.key === "lastUpdated") {
        return { ...common, render: (v) => (v ? new Date(v).toLocaleDateString() : "-") };
      }
      if (c.key === "customerProcessId" || c.key === "ourProcessId") {
        return { ...common, render: (v) => <span className="font-semibold text-slate-800 dark:text-slate-100">{v}</span> };
      }
      return common;
    });

    cols.push({
      accessor: "actions",
      header: "Actions",
      width: "70px",
      align: "center",
      render: (_, record) => (
        <Dropdown menu={rowMenu(record)} trigger={["click"]} placement="bottomRight">
          <button
            onClick={(e) => e.stopPropagation()}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            <MoreOutlined />
          </button>
        </Dropdown>
      ),
    });

    return cols;
  }, [visible]);

  return (
    <div className="flex-1 min-h-0 overflow-hidden">
      <DynamicDataTable
        columns={columns}
        data={data}
        loading={loading}
        pagination
        pageSize={10}
        pageSizeOptions={[10, 25, 50, 100]}
      />
    </div>
  );
};

export default MappingTable;