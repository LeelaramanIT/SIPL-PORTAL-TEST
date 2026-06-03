import React, { useState, useMemo, useCallback, memo, useEffect } from "react";
import {
  Input,
  Select,
  Button,
  Tag,
  Badge,
  Tooltip,
  Progress,
  Skeleton,
  Empty,
  DatePicker,
  Drawer,
  Modal,
  message,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  DCAapproval,
  GetTransfers,
} from "../../../Redux/Slices/Warehouse/WarehouseSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const mapStatus = (statusNo) => {
  switch (statusNo) {
    case 46:
      return "scanning_in_progress";

    case 47:
      return "pending_dc_preparation";

    case 48:
      return "pending_receipt";

    case 49:
      return "receiving_in_progress";

    case 50:
      return "inward_completed";

    default:
      return "pending";
  }
};

const mapProcess = (statusNo) => {
  switch (statusNo) {
    case 46:
      return "Sending";

    case 47:
      return "Waiting for DC Approval";

    case 48:
      return "Waiting for Receiving Warehouse";

    case 49:
      return "Receiving";

    case 50:
      return "Completed";

    default:
      return "Pending";
  }
};

// Status Configuration
const STATUS_CONFIG = {
  scanning_in_progress: {
    label: "Scanning In Progress",
    color: "processing",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: <LoadingOutlined />,
  },

  pending_dc_preparation: {
    label: "Pending DC Preparation",
    color: "warning",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    icon: <ClockCircleOutlined />,
  },

  pending_receipt: {
    label: "Pending Receipt",
    color: "gold",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    icon: <WarningOutlined />,
  },

  receiving_in_progress: {
    label: "Receiving In Progress",
    color: "cyan",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    icon: <LoadingOutlined />,
  },

  inward_completed: {
    label: "Inward Completed",
    color: "success",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    icon: <CheckCircleOutlined />,
  },

  pending: {
    label: "Pending",
    color: "default",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    icon: <ClockCircleOutlined />,
  },
};

// Loading Skeleton Component
const LoadingSkeleton = memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 h-[calc(100vh-280px)] overflow-y-auto pr-2">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    ))}
  </div>
));

LoadingSkeleton.displayName = "LoadingSkeleton";

// Empty State Component
const EmptyTransferState = memo(({ onAddNew }) => (
  <div className="flex items-center justify-center h-[calc(100vh-280px)]">
    <div className="text-center max-w-md">
      <div className="mb-6">
        <svg
          className="mx-auto w-32 h-32 text-slate-300 opacity-50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9-4v4m4-4v4"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-slate-700 mb-2">
        No Pending Inventory Transfers Found
      </h3>
      <p className="text-slate-500 mb-8">
        All inventory transfers are up to date. Create a new stock transfer to
        get started.
      </p>
      <Button
        type="primary"
        size="large"
        icon={<PlusOutlined />}
        onClick={onAddNew}
        className="h-11 px-8 text-base font-medium"
      >
        Add New Stock Transfer
      </Button>
    </div>
  </div>
));

EmptyTransferState.displayName = "EmptyTransferState";

// Transfer Card Component
const TransferCard = memo(({ transfer, onViewDetails }) => {
  const pendingItems = transfer.totalItems - transfer.scannedItems;
  const scanProgress = Math.round(
    (transfer.scannedItems / transfer.totalItems) * 100,
  );
  const status = STATUS_CONFIG[transfer.status];

  

  return (
    <div
      onClick={() => onViewDetails(transfer)}
      className={`group cursor-pointer bg-white rounded-2xl border-2 ${status.borderColor} 
        ${status.bgColor} p-6 transition-all duration-300 
        hover:shadow-xl hover:-translate-y-1 hover:border-opacity-100
        overflow-hidden relative backdrop-blur-sm bg-opacity-40`}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {transfer.id}
            </h3>
            <Tag
              icon={status.icon}
              color={status.color}
              className="mt-2 text-xs font-semibold"
            >
              {status.label}
            </Tag>
          </div>
          <Badge
            count={transfer.scannedItems}
            style={{
              backgroundColor: "#3b82f6",
              fontSize: "12px",
              height: "24px",
              lineHeight: "24px",
            }}
          />
        </div>

        {/* Locations */}
        <div className="space-y-2 mb-5 pb-5 border-b border-slate-200">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500 font-medium">Plant:</span>
            <span className="text-slate-900 font-semibold">
              {transfer?.plant}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500 font-medium">From:</span>
            <span className="text-slate-900 font-semibold">
              {transfer.from}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500 font-medium">To:</span>
            <span className="text-slate-900 font-semibold">{transfer.to}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500 font-medium">Process:</span>
            <span className="text-slate-900 font-semibold">{transfer.process}</span>
          </div>
        </div>

        {/* Show only Total Qty for 46 & 47 */}
        {["scanning_in_progress", "pending_dc_preparation"].includes(
          transfer.status,
        ) ? (
          <div className="mb-5 pb-5 border-b border-slate-200">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900">
                {transfer.totalItems}
              </p>
              <p className="text-sm text-slate-500 font-medium">Total Qty</p>
            </div>
          </div>
        ) : (
          <>
            {/* Progress Section */}
            <div className="space-y-3 mb-5 pb-5 border-b border-slate-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 font-medium">
                  Scan Progress
                </span>

                <span className="text-slate-900 font-bold">
                  {scanProgress}%
                </span>
              </div>

              <Progress
                percent={scanProgress}
                strokeColor={{
                  "0%": "#3b82f6",
                  "100%": "#06b6d4",
                }}
                format={() => null}
                size="small"
              />
            </div>

            {/* Items Info */}
            <div className="grid grid-cols-3 gap-3 mb-5 pb-5 border-b border-slate-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">
                  {transfer.totalItems}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  Total Items
                </p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {transfer.scannedItems}
                </p>
                <p className="text-xs text-slate-500 font-medium">Scanned</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {pendingItems}
                </p>
                <p className="text-xs text-slate-500 font-medium">Pending</p>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Created:</span>
            <span className="font-medium text-slate-900">
              {dayjs(transfer.createdDate).format("MMM DD, YYYY")}
            </span>
          </div>
          <div className="flex justify-between">
            <span>By:</span>
            <span className="font-medium text-slate-900">
              {transfer.createdBy}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

TransferCard.displayName = "TransferCard";

// Transfer Grid Component
const TransferGrid = memo(({ transfers, isLoading, onViewDetails }) => {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (transfers.length === 0) {
    return <EmptyTransferState onAddNew={() => {}} />;
  }

  return (
    <div className="h-[calc(100vh-280px)] overflow-y-auto pr-2 scroll-smooth">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pb-4">
        {transfers.map((transfer) => (
          <TransferCard
            key={transfer.id}
            transfer={transfer}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  );
});

TransferGrid.displayName = "TransferGrid";

// Filter Section Component
const TransferFilters = memo(
  ({
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusChange,
    locationFilter,
    onLocationChange,
    dateFilter,
    onDateChange,
    onAddNew,
  }) => {
    const locations = [
      "Warehouse A",
      "Warehouse B",
      "Warehouse C",
      "Store C",
      "Store D",
      "Store E",
      "Store F",
      "Store G",
      "Distribution Center",
      "Regional Hub",
    ];

    return (
      <div className="sticky top-0 z-40 bg-gradient-to-b from-white to-white/95 backdrop-blur-lg border-b border-slate-200 p-6 rounded-xl mb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search Input */}
          <div className="lg:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Search Transfer
            </label>
            <Input
              placeholder="Search by ID..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 rounded-lg"
              allowClear
            />
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Status
            </label>
            <Select
              value={statusFilter}
              onChange={onStatusChange}
              placeholder="All Status"
              className="w-full"
              options={[
                { label: "All Status", value: "all" },

                {
                  label: "Scanning In Progress",
                  value: "scanning_in_progress",
                },

                {
                  label: "Pending DC Preparation",
                  value: "pending_dc_preparation",
                },

                {
                  label: "Pending Receipt",
                  value: "pending_receipt",
                },

                {
                  label: "Receiving In Progress",
                  value: "receiving_in_progress",
                },

                {
                  label: "Inward Completed",
                  value: "inward_completed",
                },
              ]}
            />
          </div>

          {/* Location Filter */}
          {/* <div className="lg:col-span-1">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              From Location
            </label>
            <Select
              value={locationFilter}
              onChange={onLocationChange}
              placeholder="All Locations"
              className="w-full"
              showSearch
              options={[
                { label: "All Locations", value: "all" },
                ...locations.map((loc) => ({ label: loc, value: loc })),
              ]}
            />
          </div> */}

          {/* Date Filter */}
          <div className="lg:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Date Range
            </label>
            <DatePicker
              value={dateFilter ? dayjs(dateFilter) : null}
              onChange={(date) =>
                onDateChange(date ? date.format("YYYY-MM-DD") : null)
              }
              placeholder="Select date"
              className="w-full h-8"
            />
          </div>

          {/* Action Button */}
          <div className="lg:col-span-1 flex items-end">
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={onAddNew}
              className="w-full h-8 font-semibold"
            >
              Add Transfer
            </Button>
          </div>
        </div>
      </div>
    );
  },
);

TransferFilters.displayName = "TransferFilters";

// Main Page Component
const PendingTransferPage = memo(() => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(null);
  // const [isLoading, setIsLoading] = useState(false);
  // const [transfers, setTransfers] = useState([]);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const { transfers, loading } = useSelector((state) => state.warehouse);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const dispatch = useDispatch();

  const formattedTransfers = useMemo(() => {
    return transfers.map((item) => ({
      id: item.dcno,
      tM_ID: item.tM_ID,
      plant: item.plant || "-",
      from: item.send || "-",
      to: item.recevie || "-",
      totalItems: item.totalQty,
      scannedItems: item.whScannedQty,
      createdDate: item.scanningDate,
      createdBy: item.username,
      status: mapStatus(item.statusNo),
      rawStatus: item.statusName,
      vehicleNo: item?.vehicleNo || "",
      send: item?.send || "",
      receive: item?.receive || "",
      sendId: item?.sendId || "",
      receiveId: item?.receiveId || "",
      statusNo: item?.statusNo || "",
      process: mapProcess(item.statusNo),
    }));
  }, [transfers]);

  // Filter transfers with useMemo
  const filteredTransfers = useMemo(() => {
    let result = formattedTransfers;

    // Search filter
    if (searchTerm) {
      result = result.filter((t) =>
        t.id.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Location filter
    if (locationFilter !== "all") {
      result = result.filter((t) => t.from === locationFilter);
    }

    // Date filter
    if (dateFilter) {
      result = result.filter(
        (t) =>
          dayjs(t.createdDate).format("YYYY-MM-DD") ===
          dayjs(dateFilter).format("YYYY-MM-DD"),
      );
    }

    return result;
  }, [
    formattedTransfers,
    searchTerm,
    statusFilter,
    locationFilter,
    dateFilter,
  ]);

  useEffect(() => {
    dispatch(GetTransfers());
  }, [dispatch]);

  // Callback handlers
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleStatusChange = useCallback((value) => {
    setStatusFilter(value);
  }, []);

  const handleLocationChange = useCallback((value) => {
    setLocationFilter(value);
  }, []);

  const handleDateChange = useCallback((value) => {
    setDateFilter(value);
  }, []);

  const handleAddNew = useCallback(() => {
    console.log("Add new transfer");
  }, []);

  const handleViewDetails = useCallback((transfer) => {
    setSelectedTransfer(transfer);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedTransfer(null), 300);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-4">
      {/* Header */}
      <div className="mb-2 animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Pending Inventory Transfers
        </h1>
        <p className="text-slate-600 text-sm">
          Monitor and manage stock transfers across your warehouse network
        </p>
      </div>

      {/* Filter Section */}
      <TransferFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        locationFilter={locationFilter}
        onLocationChange={handleLocationChange}
        dateFilter={dateFilter}
        onDateChange={handleDateChange}
        onAddNew={handleAddNew}
      />

      {/* Grid Content */}
      <TransferGrid
        transfers={filteredTransfers}
        isLoading={loading}
        onViewDetails={handleViewDetails}
      />

      {/* Detail Drawer */}
      <Drawer
        title={selectedTransfer?.id}
        placement="right"
        onClose={handleCloseDrawer}
        open={drawerOpen}
        width={400}
        bodyStyle={{ padding: "24px" }}
      >
        {selectedTransfer && (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">
                Transfer Details
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">
                    From
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedTransfer.from}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">
                    To
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedTransfer.to}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">
                    Status
                  </p>
                  <Tag
                    color={STATUS_CONFIG[selectedTransfer.status].color}
                    className="mt-2"
                  >
                    {STATUS_CONFIG[selectedTransfer.status].label}
                  </Tag>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Items Count</h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedTransfer.totalItems}
                  </p>
                  <p className="text-xs text-slate-500">Total</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {selectedTransfer.scannedItems}
                  </p>
                  <p className="text-xs text-slate-500">Scanned</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-2xl font-bold text-amber-600">
                    {selectedTransfer.totalItems -
                      selectedTransfer.scannedItems}
                  </p>
                  <p className="text-xs text-slate-500">Pending</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4">
                Scan Progress
              </h4>
              <Progress
                percent={Math.round(
                  (selectedTransfer.scannedItems /
                    selectedTransfer.totalItems) *
                    100,
                )}
                strokeColor={{ "0%": "#3b82f6", "100%": "#06b6d4" }}
              />
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Metadata</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">
                    Created Date
                  </p>
                  <p className="text-slate-900 font-medium">
                    {dayjs(selectedTransfer.createdDate).format(
                      "MMMM DD, YYYY",
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">
                    Created By
                  </p>
                  <p className="text-slate-900 font-medium">
                    {selectedTransfer.createdBy}
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => {
                // 46
                console.log(selectedTransfer);
                if (selectedTransfer.status === "scanning_in_progress") {
                  navigate("/TTS/Warehouse/factory", {
                    state: {
                      type: "SEND",
                      mode: "EXISTING",
                      transferData: selectedTransfer,
                    },
                  });

                  return;
                }

                // 47
                if (selectedTransfer.statusNo === 47) {
                  setDrawerOpen(false);
                  // setApprovalOpen(true);
                  navigate("/TTS/Warehouse/DCPreparationApproval", {
                    state: {
                      type: "APPROVAL",
                      mode: "EXISTING",
                      transferData: selectedTransfer,
                    },
                  });

                  return;
                }

                // 48 & 49
                if (
                  selectedTransfer.status === "pending_receipt" ||
                  selectedTransfer.status === "receiving_in_progress"
                ) {
                  navigate("/TTS/Warehouse/warehouse", {
                    state: {
                      type: "RECEIVE",
                      mode: "EXISTING",
                      transferData: selectedTransfer,
                    },
                  });

                  return;
                }

                // 50
                if (selectedTransfer.status === "inward_completed") {
                  message.success("Transfer already completed");
                }
              }}
              type="primary"
              block
              className="h-10 font-semibold mt-6"
            >
              View Full Transfer Details
            </Button>
          </div>
        )}
      </Drawer>
      {/* Approval Modal */}
      <Modal
        open={approvalOpen}
        title="DC Approval"
        onCancel={() => setApprovalOpen(false)}
        onOk={async () => {
          try {
            console.log(selectedTransfer);

            const res = await dispatch(DCAapproval(selectedTransfer.tM_ID));

            message.success(res?.data?.message || "DC Approved Successfully");

            setApprovalOpen(false);

            dispatch(GetTransfers());

            handleCloseDrawer();
          } catch (err) {
            console.log(err);

            message.error(err?.response?.data?.message || "DC Approval Failed");
          }
        }}
      >
        <p>Do you want to approve this DC preparation?</p>
      </Modal>

      {/* Custom CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }

        /* Custom scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: rgb(203, 213, 225);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgb(148, 163, 184);
        }

        /* Smooth scroll behavior */
        .scroll-smooth {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
});

PendingTransferPage.displayName = "PendingTransferPage";

export default PendingTransferPage;
