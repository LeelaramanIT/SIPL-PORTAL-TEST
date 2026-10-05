import React, { useMemo, useState, useEffect } from "react";
import { Dropdown } from "antd";
import {
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { DynamicDataTable } from "../../../../../components/DynamicDataTable";
import StatusBadge from "./StatusBadge";

export const BASE_COLUMNS = [
  { key: "customer", title: "Customer", width: "170px" },
  { key: "shipAddress", title: "Ship Address", width: "220px" },
  { key: "companyName", title: "Company Name", width: "200px" },
  { key: "customerProcessId", title: "Customer Process ID", width: "190px" },
  { key: "ourProcessId", title: "Our Process ID", width: "150px" },
  { key: "platform", title: "Platform", width: "100px" },
  { key: "brand", title: "Brand", width: "140px" },
  { key: "sideWall", title: "Side Wall", width: "120px" },
  { key: "tyreSize", title: "Tyre Size", width: "160px" },
  { key: "rimSize", title: "Rim Size", width: "110px" },
  { key: "tyreType", title: "Tyre Type", width: "110px" },
  { key: "directional", title: "Direction", width: "90px" },
  { key: "status", title: "Status", width: "120px" },
  { key: "lastUpdated", title: "Last Updated", width: "150px" },
  { key: "updatedBy", title: "Updated By", width: "150px" },
];

const MappingTable = ({
  data,
  loading,
  visible,
  onView,
  onEdit,
  onToggleStatus,
  onBulkStatusChange,
  duplicateIds, // Set<id> — rows whose customer+ship+ProcessID combo repeats in the fetched data
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [bulkBusy, setBulkBusy] = useState(null); // "activate" | "deactivate" | null

  // Drop stale ids (filtered out / refreshed away) without wiping a
  // selection the user is still actively using.
  useEffect(() => {
    setSelectedRowKeys((prev) => prev.filter((id) => data.some((r) => r.id === id)));
  }, [data]);

  const toggleRow = (id) =>
    setSelectedRowKeys((prev) => (prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]));

  const toggleAll = () =>
    setSelectedRowKeys((prev) => (prev.length === data.length ? [] : data.map((r) => r.id)));

  const allChecked = data.length > 0 && selectedRowKeys.length === data.length;
  const someChecked = selectedRowKeys.length > 0 && !allChecked;
  const selectedCount = selectedRowKeys.length;
  const multiSelected = selectedCount > 1;

  const selectedRecords = useMemo(
    () => data.filter((r) => selectedRowKeys.includes(r.id)),
    [data, selectedRowKeys],
  );

  const runBulk = async (isActive) => {
    if (!selectedRecords.length || bulkBusy) return;
    setBulkBusy(isActive ? "activate" : "deactivate");
    try {
      await onBulkStatusChange?.(selectedRecords, isActive);
      setSelectedRowKeys([]); // clear selection once the action completes
    } finally {
      setBulkBusy(null);
    }
  };

  const rowMenu = (record) => ({
    items: [
      { key: "view", label: "View", icon: <EyeOutlined /> },
      { key: "edit", label: "Edit", icon: <EditOutlined /> },
      { type: "divider" },
      record.status === "Active"
        ? { key: "toggle", label: "Deactivate", icon: <StopOutlined /> }
        : { key: "toggle", label: "Activate", icon: <CheckCircleOutlined /> },
    ],
    onClick: ({ key, domEvent }) => {
      // antd's Dropdown menu renders in a Portal — its clicks still bubble
      // through the React tree (not the DOM tree) up to the row's onClick.
      domEvent?.stopPropagation();
      if (key === "view") onView(record);
      if (key === "edit") onEdit(record);
      if (key === "toggle") onToggleStatus(record);
    },
  });

  const columns = useMemo(() => {
    const cols = BASE_COLUMNS.filter((c) => visible[c.key]).map((c) => {
      const common = { accessor: c.key, header: c.title, width: c.width };

      if (c.key === "status") return { ...common, render: (v) => <StatusBadge status={v} /> };

      if (c.key === "lastUpdated")
        return { ...common, render: (v) => (v ? new Date(v).toLocaleDateString() : "-") };

      if (c.key === "ourProcessId") {
        // Duplicate badge sits here — this is the field the dup check
        // groups on (customer + ship + Process ID).
        return {
          ...common,
          render: (v, record) => (
            <span className="inline-flex items-center gap-1.5">
              <span className="font-semibold text-slate-800 dark:text-slate-100">{v}</span>
              {duplicateIds?.has(record.id) && (
                <span
                  title="Backend returned this Customer + Ship Address + Process ID combination more than once"
                  className="rounded-full bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400"
                >
                  Dup
                </span>
              )}
            </span>
          ),
        };
      }

      if (c.key === "customerProcessId") {
        return { ...common, render: (v) => <span className="font-semibold text-slate-800 dark:text-slate-100">{v}</span> };
      }

      return common;
    });

    cols.unshift({
      accessor: "__select",
      header: (
        <input
          type="checkbox"
          checked={allChecked}
          ref={(el) => el && (el.indeterminate = someChecked)}
          onChange={toggleAll}
          onClick={(e) => e.stopPropagation()}
          className="h-3.5 w-3.5 cursor-pointer rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/30"
        />
      ),
      width: "36px",
      align: "center",
      render: (_, record) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-center">
          <input
            type="checkbox"
            checked={selectedRowKeys.includes(record.id)}
            onChange={() => toggleRow(record.id)}
            className="h-3.5 w-3.5 cursor-pointer rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/30"
          />
        </div>
      ),
    });

    cols.push({
      accessor: "actions",
      header: "Actions",
      width: "70px",
      align: "center",
      render: (_, record) => (
        <Dropdown
          menu={rowMenu(record)}
          trigger={multiSelected ? [] : ["click"]}
          disabled={multiSelected}
          placement="bottomRight"
        >
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            disabled={multiSelected}
            title={multiSelected ? "Select only one row to use row actions" : "Actions"}
            className={`rounded-lg p-1.5 transition-colors ${
              multiSelected
                ? "cursor-not-allowed pointer-events-none text-slate-300 dark:text-slate-600 opacity-50"
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            }`}
          >
            <MoreOutlined />
          </button>
        </Dropdown>
      ),
    });

    return cols;
  }, [visible, selectedRowKeys, allChecked, someChecked, multiSelected, data, duplicateIds]);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Bulk toolbar — appears once 2+ rows are selected */}
      {multiSelected && (
        <div className="flex shrink-0 items-center gap-2 border-b border-blue-100 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/30 px-3 py-2">
          <span className="text-[12px] font-semibold text-blue-700 dark:text-blue-300">
            {selectedCount} selected
          </span>
          <button
            type="button"
            onClick={() => runBulk(true)}
            disabled={!!bulkBusy}
            className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircleOutlined /> {bulkBusy === "activate" ? "Activating…" : "Activate Selected"}
          </button>
          <button
            type="button"
            onClick={() => runBulk(false)}
            disabled={!!bulkBusy}
            className="flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <StopOutlined /> {bulkBusy === "deactivate" ? "Deactivating…" : "Deactivate Selected"}
          </button>
          <button
            type="button"
            onClick={() => setSelectedRowKeys([])}
            className="ml-auto text-[12px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            Clear selection
          </button>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden">
        <DynamicDataTable
          columns={columns}
          data={data}
          loading={loading}
          onRowClick={onView}
          rowKey="id"
          rowClassName={(row) =>
            duplicateIds?.has(row.id)
              ? "!border-amber-300 dark:!border-amber-700 !bg-amber-50/70 dark:!bg-amber-950/20"
              : ""
          }
          pagination
          pageSize={10}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      </div>
    </div>
  );
};

export default MappingTable;