import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  memo,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layout,
  Row,
  Col,
  Card,
  Input,
  Button,
  Table,
  Badge,
  Tag,
  Modal,
  Form,
  message,
  Typography,
  Divider,
  Empty,
  Space,
  Descriptions,
  Progress,
  Drawer,
  Select,
} from "antd";

import {
  ScanOutlined,
  CheckCircleOutlined,
  BarcodeOutlined,
  TruckOutlined,
  SendOutlined,
  RadarChartOutlined,
  ClockCircleOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CloseOutlined } from "@ant-design/icons";
import {
  scanFactoryBarcode,
  scanReceiveBarcode,
  setScannedTyres,
  UpdateLoadDone,
  GetTransactionById,
  GetFactoryWarehouseDetails,
  GetBinLocationMaster,
  FinalSubmit,
} from "../../../Redux/Slices/Warehouse/WarehouseSlice";
import toast from "react-hot-toast";

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const getStatusColor = (status) => {
  switch (status) {
    case "success":   return "#10b981";
    case "scanning":  return "#3b82f6";
    case "duplicate": return "#ef4444";
    default:          return "#6b7280";
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "success":   return "✓ Ready";
    case "scanning":  return "◈ Scanning";
    case "duplicate": return "⚠ Duplicate";
    default:          return "● Ready";
  }
};

const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1200,
        isDesktop: width >= 1200,
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return screenSize;
};

// ─────────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────────
const ResponsiveHeader = memo(
  ({
    isMobile,
    isTablet,
    isDesktop,
    setMobileDrawerOpen,
    receivePlan,
    setReceivePlan,
    receiveLocation,
    setReceiveLocation,
    state,
    isTransactionLocked,
    warehouseDetails,
    refNumber,
    receiveData,
    binLocations = [],
    selectedBinLocation,
    setSelectedBinLocation,
  }) => {
    const { LocationDetails } = useSelector((s) => s.auth);
    const dispatch = useDispatch();
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
      if (LocationDetails?.length > 0 && !receivePlan) {
        setReceivePlan(LocationDetails[0].locationName);
      }
    }, [LocationDetails, receivePlan, setReceivePlan]);

    const selectedPlantDetails = useMemo(
      () => warehouseDetails?.find((item) => item.plant === receivePlan),
      [warehouseDetails, receivePlan],
    );

    const selectContainerWidth = isDesktop ? "220px" : isTablet ? "180px" : "100%";
    const selectFontSize      = isDesktop ? 14 : isTablet ? 13 : 11;
    const refFontSize         = isDesktop ? 18 : isTablet ? 16 : 14;

    const warehouseOptions = useMemo(
      () =>
        warehouseDetails?.map((item) => ({
          value: item.plant,
          label: isMobile ? `${item.plant} - ${item.factoryDetails}` : item.plant,
        })) || [{ value: receiveData?.plant, label: receiveData?.plant }],
      [warehouseDetails, receiveData?.plant, isMobile],
    );

    const receiveAtOptions = useMemo(
      () =>
        selectedPlantDetails?.warehouses?.map((w) => ({ value: w, label: w })) ||
        [{ value: receiveData?.to, label: receiveData?.to }],
      [selectedPlantDetails, receiveData?.to],
    );

    const sendFromOptions = useMemo(
      () => [{ value: receiveData?.send, label: receiveData?.send }],
      [receiveData?.send],
    );

    const formattedBinOptions = useMemo(() => {
      const opts = [...binLocations];
      if (searchValue && !opts.includes(searchValue)) opts.unshift(searchValue);
      if (selectedBinLocation && !opts.includes(selectedBinLocation))
        opts.unshift(selectedBinLocation);
      return opts.map((item) => ({
        value: item,
        label: binLocations.includes(item) ? item : `New: ${item}`,
      }));
    }, [binLocations, searchValue, selectedBinLocation]);

    const handleBinSearch = (value) => setSearchValue(value);
    const handleBinChange = (value) => {
      setSelectedBinLocation(value);
      setSearchValue("");
    };

    const BinSelect = ({ style }) => (
      <Select
        showSearch
        size="small"
        placeholder="Bin Location"
        style={{ width: "100%", fontSize: selectFontSize, ...style }}
        value={selectedBinLocation}
        onChange={handleBinChange}
        onSearch={handleBinSearch}
        searchValue={searchValue}
        options={formattedBinOptions}
        filterOption={(input, option) =>
          (option?.value ?? "").toLowerCase().includes(input.toLowerCase())
        }
        onBlur={() => {
          if (searchValue && !binLocations.includes(searchValue))
            handleBinChange(searchValue);
        }}
      />
    );

    return (
      <header
        className={`sticky top-0 z-[100] flex items-center flex-wrap bg-gradient-to-br from-white to-slate-100 border-b border-slate-200 shadow-sm ${
          isMobile
            ? "min-h-[56px] px-[10px] pt-[8px] pb-[10px]"
            : isTablet
              ? "min-h-[68px] px-[12px] py-[10px]"
              : "min-h-[80px] px-[28px] py-[12px]"
        }`}
      >
        <div
          className={`flex justify-between items-center w-full max-w-full ${
            isMobile || isTablet ? "flex-wrap" : ""
          } ${isMobile ? "gap-[6px]" : isTablet ? "gap-[8px]" : "gap-[14px]"}`}
        >
          {/* Title */}
          <div
            className="min-w-0 flex-shrink"
            style={{ flex: isMobile ? "1 1 auto" : isTablet ? "1 1 180px" : "170px" }}
          >
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex flex-col gap-0">
                <h2
                  className="m-0 text-slate-900 font-bold leading-tight whitespace-nowrap overflow-hidden text-ellipsis"
                  style={{ fontSize: isMobile ? 14 : isTablet ? 16 : 19 }}
                >
                  Stock Receive
                </h2>
                <span
                  className="text-slate-500 tracking-[0.2px] uppercase font-medium mt-[1px] whitespace-nowrap"
                  style={{ fontSize: isMobile ? 9 : isTablet ? 10 : 12 }}
                >
                  📥 Warehouse Receiving
                </span>
              </div>
            </motion.div>
          </div>

          {/* Desktop / Tablet selects */}
          {!isMobile && (
            <div className="flex-auto min-w-0 overflow-x-auto flex items-center">
              <div
                className={`flex items-center justify-start w-full max-w-full ${isTablet ? "flex-wrap" : ""} ${isDesktop ? "gap-[12px]" : "gap-[10px]"}`}
              >
                {[
                  {
                    placeholder: "Select Warehouse",
                    value: receivePlan,
                    onChange: setReceivePlan,
                    disabled: true,
                    options: warehouseOptions,
                  },
                  {
                    placeholder: "Send from",
                    value: receiveData?.send,
                    onChange: setReceiveLocation,
                    disabled: true,
                    options: sendFromOptions,
                  },
                  {
                    placeholder: "Receive At",
                    value: receiveLocation || receiveData?.to,
                    onChange: setReceiveLocation,
                    disabled: isTransactionLocked,
                    options: receiveAtOptions,
                  },
                ].map((sel, i) => (
                  <div
                    key={i}
                    className="flex-shrink"
                    style={{
                      width: selectContainerWidth,
                      minWidth: isTablet ? "150px" : "160px",
                      maxWidth: isTablet ? "100%" : selectContainerWidth,
                      flex: isTablet ? "1 1 180px" : "0 0 auto",
                    }}
                  >
                    <Select
                      size="small"
                      placeholder={sel.placeholder}
                      style={{
                        width: "100%",
                        fontSize: selectFontSize,
                        height: isDesktop ? 34 : 30,
                      }}
                      value={sel.value}
                      onChange={sel.onChange}
                      disabled={sel.disabled}
                      options={sel.options}
                      dropdownMatchSelectWidth={false}
                      dropdownStyle={{ minWidth: selectContainerWidth, maxWidth: "300px" }}
                    />
                  </div>
                ))}

                {/* Bin Location */}
                <div
                  className="flex-shrink"
                  style={{
                    width: selectContainerWidth,
                    minWidth: isTablet ? "150px" : "160px",
                    maxWidth: isTablet ? "100%" : selectContainerWidth,
                    flex: isTablet ? "1 1 220px" : "0 0 auto",
                  }}
                >
                  <BinSelect style={{ height: isDesktop ? 34 : 30 }} />
                </div>
              </div>
            </div>
          )}

          {/* REF badge */}
          {!isMobile && (
            <div className="flex-shrink-0 min-w-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div
                  className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-md text-white flex flex-col items-center min-w-[80px]"
                  style={{ padding: isDesktop ? "8px 14px" : "6px 12px" }}
                >
                  <span
                    className="text-white/85 block leading-[1.1] font-semibold tracking-[0.02em]"
                    style={{ fontSize: isDesktop ? 11 : 10 }}
                  >
                    REC #
                  </span>
                  <span
                    className="font-bold text-white font-mono leading-[1.1] whitespace-nowrap inline-block"
                    style={{ fontSize: refFontSize }}
                  >
                    {refNumber}
                  </span>
                </div>
              </motion.div>
            </div>
          )}

          {/* Mobile menu button */}
          {isMobile && (
            <div className="flex-shrink-0 pl-1">
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="flex items-center justify-center text-slate-700 hover:bg-slate-200/50 rounded transition-colors"
                style={{ fontSize: 14, padding: "4px 6px", height: 32 }}
              >
                <MenuOutlined style={{ fontSize: 18 }} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile inline selects */}
        {isMobile && (
          <div className="flex flex-col w-full mt-[6px] gap-[4px]">
            <div className="flex items-center w-full gap-[6px]">
              <div className="min-w-0 w-1/2">
                <Select
                  size="small"
                  placeholder="Warehouse"
                  disabled={true}
                  style={{ width: "100%", fontSize: 10, minHeight: 30 }}
                  value={receivePlan}
                  onChange={setReceivePlan}
                  options={warehouseOptions}
                  dropdownMatchSelectWidth={false}
                  dropdownStyle={{ minWidth: "120px" }}
                />
              </div>
              <div className="min-w-0 w-1/2">
                <Select
                  size="small"
                  placeholder="Receive At"
                  disabled={isTransactionLocked}
                  style={{ width: "100%", fontSize: 10, minHeight: 30 }}
                  value={receiveLocation}
                  onChange={setReceiveLocation}
                  options={receiveAtOptions}
                  dropdownMatchSelectWidth={false}
                  dropdownStyle={{ minWidth: "120px" }}
                />
              </div>
            </div>
            <div className="w-full">
              <BinSelect style={{ minHeight: 30, fontSize: 10 }} />
            </div>
          </div>
        )}
      </header>
    );
  },
);

// ─────────────────────────────────────────────
// CONTENT
// ─────────────────────────────────────────────
const ResponsiveContent = memo(
  ({
    isMobile,
    isTablet,
    isDesktop,
    scanStatus,
    barcodeInput,
    setBarcodeInput,
    handleScan,
    isScanning,
    lastScannedTime,
    inputRef,
    scannedTyres,
    setShowConfirmModal,
    columns,
    receivePlan,
    receiveLocation,
    selectedBinLocation,
    groupedTyres,
    tableLoading,
    lastScannedTyre,
    setLastScannedTyre,
  }) => {
    const totalScannedQty = scannedTyres?.[0]?.whScannedQty || 0;
    const user = useSelector((s) => s.auth);
    const disableCopyPaste = user?.roles !== "admin";

    const isSelectionMissing = !receivePlan || !receiveLocation || !selectedBinLocation;

    // ── MOBILE LAYOUT ──────────────────────────────────────────────
    if (isMobile) {
      return (
        <Content
          style={{
            flex: 1,
            padding: "8px",
            overflowX: "hidden",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            width: "100%",
            maxWidth: "100vw",
            gap: 10,
          }}
        >
          {/* Scan card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
              bodyStyle={{ padding: 12 }}
            >
              {/* Status bar */}
              <motion.div
                animate={{
                  boxShadow:
                    scanStatus === "scanning"
                      ? "0 0 15px rgba(59,130,246,0.4)"
                      : scanStatus === "success"
                        ? "0 0 15px rgba(16,185,129,0.3)"
                        : "none",
                }}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  marginBottom: 10,
                  background:
                    scanStatus === "scanning"
                      ? "#eff6ff"
                      : scanStatus === "success"
                        ? "#ecfdf5"
                        : scanStatus === "duplicate"
                          ? "#fef2f2"
                          : "#f1f5f9",
                  border: `1px solid ${getStatusColor(scanStatus)}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <motion.div
                  animate={scanStatus === "scanning" ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <RadarChartOutlined style={{ color: getStatusColor(scanStatus), fontSize: 14 }} />
                </motion.div>
                <Text strong style={{ color: getStatusColor(scanStatus), fontSize: 12 }}>
                  {getStatusLabel(scanStatus)}
                </Text>
              </motion.div>

              {/* Input */}
              <Input
                ref={inputRef}
                size="large"
                value={barcodeInput}
                placeholder="Scan or enter barcode..."
                prefix={<BarcodeOutlined style={{ color: "#64748b" }} />}
                onPressEnter={handleScan}
                onChange={(e) => setBarcodeInput(e.target.value.slice(0, 19))}
                onKeyDown={(e) => {
                  if (
                    disableCopyPaste &&
                    e.ctrlKey &&
                    ["c", "v", "x"].includes(e.key.toLowerCase())
                  ) {
                    e.preventDefault();
                    toast.error("Copy and Paste are not allowed.");
                  }
                }}
                onCopy={(e) => {
                  if (disableCopyPaste) { e.preventDefault(); toast.error("Copy is not allowed."); }
                }}
                onPaste={(e) => {
                  if (disableCopyPaste) { e.preventDefault(); toast.error("Paste is not allowed."); }
                }}
                style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 500, marginBottom: 10 }}
                maxLength={19}
              />

              <Button
                type="primary"
                block
                size="large"
                onClick={handleScan}
                loading={isScanning}
                disabled={isSelectionMissing}
                style={{
                  background: isSelectionMissing
                    ? "#cbd5e1"
                    : "linear-gradient(135deg,#10b981 0%,#059669 100%)",
                  border: "none",
                  height: 40,
                  fontSize: 13,
                  fontWeight: 600,
                  borderRadius: 8,
                }}
              >
                {isScanning ? "Scanning..." : "Scan"}
              </Button>

              {lastScannedTime && (
                <Text type="secondary" style={{ fontSize: 11, display: "block", marginTop: 8 }}>
                  <ClockCircleOutlined /> {lastScannedTime.toLocaleTimeString()}
                </Text>
              )}
            </Card>
          </motion.div>

          {/* Last scanned tyre card */}
          <AnimatePresence>
            {lastScannedTyre && (
              <motion.div
                key="last-scanned-mobile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card
                  size="small"
                  style={{
                    borderRadius: 10,
                    border: "1px solid #10b981",
                    background: "linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 100%)",
                  }}
                  bodyStyle={{ padding: 10 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                      paddingBottom: 6,
                      borderBottom: "1px solid #d1fae5",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircleOutlined style={{ color: "#16a34a", fontSize: 14 }} />
                      <Text strong style={{ color: "#15803d", fontSize: 12 }}>
                        Last Scanned
                      </Text>
                    </div>
                    <Button
                      type="text"
                      size="small"
                      icon={<CloseOutlined />}
                      onClick={() => setLastScannedTyre(null)}
                      style={{ width: 24, height: 24, minWidth: 24, padding: 0, color: "#64748b" }}
                    />
                  </div>
                  <Row gutter={[8, 6]}>
                    {[
                      { label: "Barcode",    value: <Text code style={{ fontSize: 10 }}>{lastScannedTyre?.barcode}</Text> },
                      { label: "Process ID", value: <Text strong style={{ fontSize: 11 }}>{lastScannedTyre?.processID}</Text> },
                      { label: "Brand",      value: <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>{lastScannedTyre?.brand}</Tag> },
                      { label: "Sidewall",   value: <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>{lastScannedTyre?.sideWall}</Tag> },
                      { label: "Grade",      value: <Tag color={lastScannedTyre?.grade === "A" ? "green" : "orange"} style={{ fontSize: 10, margin: 0 }}>{lastScannedTyre?.grade}</Tag> },
                      { label: "Tyre Size",  value: <Text style={{ fontSize: 11 }}>{lastScannedTyre?.tyreSize}</Text> },
                      { label: "Rim Size",   value: <Text style={{ fontSize: 11 }}>{lastScannedTyre?.rimSize}</Text> },
                      { label: "Tyre Type",  value: <Tag color="cyan" style={{ fontSize: 10, margin: 0 }}>{lastScannedTyre?.tyreType}</Tag> },
                    ].map(({ label, value }) => (
                      <Col xs={12} key={label}>
                        <Text type="secondary" style={{ fontSize: 10, display: "block" }}>{label}</Text>
                        <div style={{ marginTop: 2 }}>{value}</div>
                      </Col>
                    ))}
                  </Row>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scanned items table — always visible on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            style={{ flex: 1, minHeight: 0 }}
          >
            <Card
              style={{
                background: "linear-gradient(135deg,#ffffff 0%,#f8fafc 100%)",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                overflow: "hidden",
              }}
              bodyStyle={{ padding: 0 }}
            >
              {/* Table header strip */}
              <div
                style={{
                  background: "linear-gradient(135deg,#10b981 0%,#059669 100%)",
                  padding: "10px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <Text strong style={{ color: "white", fontSize: 13 }}>
                  Received Items
                </Text>
                <div style={{ display: "flex", gap: 14 }}>
                  {[
                    { label: "TOTAL",   val: scannedTyres.length },
                    { label: "SCANNED", val: totalScannedQty },
                    { label: "PENDING", val: scannedTyres.length - totalScannedQty },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 9, display: "block" }}>
                        {label}
                      </Text>
                      <Text strong style={{ color: "white", fontSize: 15, lineHeight: 1.2 }}>
                        {val}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>

              {/* Table body — horizontally scrollable */}
              <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "40vh" }}>
                <Table
                  columns={columns}
                  loading={{ spinning: tableLoading, tip: "Loading..." }}
                  dataSource={groupedTyres.map((item, i) => ({ ...item, key: i }))}
                  pagination={false}
                  size="small"
                  tableLayout="fixed"
                  style={{ width: "100%", minWidth: 0 }}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={<Text style={{ fontSize: 11 }}>No items scanned yet</Text>}
                      />
                    ),
                  }}
                  rowClassName={(_, i) => (i === 0 ? "ant-table-row-highlight" : "")}
                />
              </div>
            </Card>
          </motion.div>

          {/* Mobile finalize button */}
          {scannedTyres.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                type="primary"
                block
                icon={<SendOutlined />}
                onClick={() => setShowConfirmModal(true)}
                style={{
                  background: "linear-gradient(135deg,#10b981 0%,#059669 100%)",
                  border: "none",
                  height: 44,
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Finalize ({scannedTyres.length} items)
              </Button>
            </motion.div>
          )}
        </Content>
      );
    }

    // ── TABLET / DESKTOP LAYOUT ────────────────────────────────────
    return (
      <Content
        style={{
          flex: 1,
          padding: isTablet ? "16px" : "24px 32px",
          overflowX: "hidden",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          width: "100%",
          maxWidth: "100vw",
        }}
      >
        <Row gutter={isTablet ? 12 : 24} style={{ flex: 1, minHeight: 0 }}>
          {/* Left column — scanner + last scanned */}
          <Col
            xs={24}
            sm={24}
            md={isTablet ? 10 : 8}
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: isTablet ? 12 : 20,
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card
                style={{
                  background: "linear-gradient(135deg,#ffffff 0%,#f8fafc 100%)",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  overflow: "hidden",
                }}
                bodyStyle={{ padding: isTablet ? 8 : 12 }}
              >
                {/* Status bar */}
                <motion.div
                  animate={{
                    boxShadow:
                      scanStatus === "scanning"
                        ? "0 0 10px rgba(59,130,246,0.4)"
                        : scanStatus === "success"
                          ? "0 0 10px rgba(16,185,129,0.3)"
                          : "none",
                  }}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 6,
                    marginBottom: 12,
                    background:
                      scanStatus === "scanning"
                        ? "#eff6ff"
                        : scanStatus === "success"
                          ? "#ecfdf5"
                          : scanStatus === "duplicate"
                            ? "#fef2f2"
                            : "#f1f5f9",
                    border: `1px solid ${getStatusColor(scanStatus)}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <motion.div
                    animate={scanStatus === "scanning" ? { rotate: 360 } : { rotate: 0 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <RadarChartOutlined style={{ color: getStatusColor(scanStatus), fontSize: 13 }} />
                  </motion.div>
                  <Text strong style={{ color: getStatusColor(scanStatus), fontSize: 11 }}>
                    {getStatusLabel(scanStatus)}
                  </Text>
                </motion.div>

                <Input
                  ref={inputRef}
                  value={barcodeInput}
                  placeholder="Scan barcode..."
                  maxLength={19}
                  style={{ marginBottom: 12 }}
                  onChange={(e) => setBarcodeInput(e.target.value.slice(0, 19))}
                  onPressEnter={handleScan}
                  onKeyDown={(e) => {
                    if (
                      disableCopyPaste &&
                      e.ctrlKey &&
                      ["c", "v", "x"].includes(e.key.toLowerCase())
                    ) {
                      e.preventDefault();
                      toast.error("Copy and Paste are not allowed.");
                    }
                  }}
                  onCopy={(e) => {
                    if (disableCopyPaste) { e.preventDefault(); toast.error("Copy is not allowed."); }
                  }}
                  onPaste={(e) => {
                    if (disableCopyPaste) { e.preventDefault(); toast.error("Paste is not allowed."); }
                  }}
                />

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="primary"
                    block
                    size={isDesktop ? "large" : "middle"}
                    onClick={handleScan}
                    loading={isScanning}
                    disabled={isSelectionMissing}
                    style={{
                      background: isSelectionMissing
                        ? "#cbd5e1"
                        : "linear-gradient(135deg,#10b981 0%,#059669 100%)",
                      border: "none",
                      height: isDesktop ? 42 : 32,
                      fontSize: isDesktop ? 14 : 12,
                      fontWeight: 600,
                      borderRadius: 8,
                    }}
                  >
                    Scan Item
                  </Button>
                </motion.div>

                {lastScannedTime && (
                  <Text type="secondary" style={{ fontSize: 11, display: "block", marginTop: 10 }}>
                    <ClockCircleOutlined /> {lastScannedTime.toLocaleTimeString()}
                  </Text>
                )}
              </Card>
            </motion.div>

            {/* Last scanned tyre / empty state */}
            <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              <AnimatePresence mode="wait">
                {lastScannedTyre ? (
                  <motion.div
                    key="last-scanned"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card
                      size="small"
                      style={{
                        marginTop: 12,
                        borderRadius: 10,
                        border: "1px solid #10b981",
                        background: "linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 100%)",
                        overflow: "hidden",
                      }}
                      bodyStyle={{ padding: isTablet ? 12 : 14 }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 8,
                          paddingBottom: 6,
                          borderBottom: "1px solid #d1fae5",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <CheckCircleOutlined style={{ color: "#16a34a", fontSize: 16 }} />
                          <Text strong style={{ color: "#15803d", fontSize: isTablet ? 13 : 14 }}>
                            Last Scanned Tyre
                          </Text>
                        </div>
                        <Button
                          type="text"
                          size="small"
                          icon={<CloseOutlined />}
                          onClick={() => setLastScannedTyre(null)}
                          style={{ width: 24, height: 24, minWidth: 24, padding: 0, color: "#64748b" }}
                        />
                      </div>
                      <Row gutter={[8, 8]}>
                        {[
                          { label: "Barcode",    span: 24, value: <Text code style={{ fontSize: isTablet ? 10 : 12 }}>{lastScannedTyre?.barcode}</Text> },
                          { label: "Process ID", span: 12, value: <Text strong>{lastScannedTyre?.processID}</Text> },
                          { label: "Brand",      span: 12, value: <Tag color="blue">{lastScannedTyre?.brand}</Tag> },
                          { label: "Sidewall",   span: 12, value: <Tag color="blue">{lastScannedTyre?.sideWall}</Tag> },
                          { label: "Grade",      span: 12, value: <Tag color={lastScannedTyre?.grade === "A" ? "green" : "orange"}>{lastScannedTyre?.grade}</Tag> },
                          { label: "Tyre Size",  span: 12, value: <Text>{lastScannedTyre?.tyreSize}</Text> },
                          { label: "Rim Size",   span: 12, value: <Text>{lastScannedTyre?.rimSize}</Text> },
                          { label: "Tyre Type",  span: 12, value: <Tag color="cyan">{lastScannedTyre?.tyreType}</Tag> },
                        ].map(({ label, span, value }) => (
                          <Col xs={span} key={label}>
                            <Text type="secondary" style={{ fontSize: 11 }}>{label}</Text>
                            <div style={{ marginTop: 2 }}>{value}</div>
                          </Col>
                        ))}
                      </Row>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ flex: 1 }}
                  >
                    <Card
                      style={{
                        background: "linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%)",
                        borderRadius: isTablet ? 12 : 16,
                        border: "2px dashed #cbd5e1",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 12,
                      }}
                      bodyStyle={{ padding: 20 }}
                    >
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Ready to receive
                          </Text>
                        }
                        style={{ margin: 0 }}
                      />
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Col>

          {/* Right column — items table */}
          <Col
            xs={24}
            sm={24}
            md={isTablet ? 14 : 16}
            style={{ display: "flex", flexDirection: "column", minHeight: 0, minWidth: 0, width: "100%" }}
          >
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              style={{ flex: 1, display: "flex", flexDirection: "column" }}
            >
              <Card
                style={{
                  background: "linear-gradient(135deg,#ffffff 0%,#f8fafc 100%)",
                  borderRadius: isTablet ? 12 : 16,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  height: "100%",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
                bodyStyle={{ padding: 0, flex: 1, display: "flex", flexDirection: "column" }}
              >
                {/* Table header strip */}
                <div
                  style={{
                    background: "linear-gradient(135deg,#10b981 0%,#059669 100%)",
                    padding: isDesktop ? "12px 20px" : "10px 16px",
                    color: "white",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderRadius: "16px 16px 0 0",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <Title
                      level={5}
                      style={{ margin: 0, color: "white", fontSize: isDesktop ? 18 : 15, fontWeight: 700, lineHeight: 1.2 }}
                    >
                      Received Items
                    </Title>
                    <Text
                      style={{ color: "rgba(255,255,255,0.85)", fontSize: isDesktop ? 12 : 11, display: "block", marginTop: 4 }}
                    >
                      Progress: {totalScannedQty} / {scannedTyres.length}
                    </Text>
                  </div>

                  {[
                    { label: "TOTAL",   val: scannedTyres.length },
                    { label: "SCANNED", val: totalScannedQty },
                    { label: "PENDING", val: scannedTyres.length - totalScannedQty },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ textAlign: "center", minWidth: 70 }}>
                      <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: isDesktop ? 11 : 10, display: "block" }}>
                        {label}
                      </Text>
                      <Text strong style={{ color: "white", fontSize: isDesktop ? 22 : 18, lineHeight: 1.2 }}>
                        {val}
                      </Text>
                    </div>
                  ))}
                </div>

                {/* Table */}
                <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <Table
                    columns={columns}
                    loading={{ spinning: tableLoading, tip: "Loading items..." }}
                    dataSource={groupedTyres.map((item, i) => ({ ...item, key: i }))}
                    pagination={false}
                    size={isDesktop ? "middle" : "small"}
                    tableLayout="auto"
                    className="responsive-receive-table"
                    scroll={{
                      x: "max-content",
                      y: `calc(100vh - ${isDesktop ? "320px" : "260px"})`,
                    }}
                    style={{ width: "100%", maxWidth: "100%" }}
                    locale={{
                      emptyText: (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={
                            <Text type="secondary" style={{ fontSize: isDesktop ? 14 : 12 }}>
                              No items received yet
                            </Text>
                          }
                        />
                      ),
                    }}
                    rowClassName={(_, i) => (i === 0 ? "ant-table-row-highlight" : "")}
                  />
                </div>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Content>
    );
  },
);

// ─────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────
const ResponsiveFooter = memo(
  ({
    isMobile,
    isTablet,
    isDesktop,
    scannedTyresCount,
    setScannedTyres,
    groupedTyres,
    setShowConfirmModal,
  }) => {
    // On mobile the finalize button lives inside ResponsiveContent,
    // so we hide this footer on mobile to avoid duplication.
    if (isMobile) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          background: "linear-gradient(135deg,#ffffff 0%,#f0f4f8 100%)",
          borderTop: "1px solid #e2e8f0",
          padding: isTablet ? "10px 12px" : "10px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          minHeight: 60,
          boxShadow: "0 -1px 3px 0 rgba(0,0,0,0.08)",
        }}
      >
        <Text
          type="secondary"
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: isDesktop ? 15 : 12 }}
        >
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background:
                scannedTyresCount > 0
                  ? "linear-gradient(135deg,#10b981 0%,#059669 100%)"
                  : "#cbd5e1",
            }}
          />
          <Text strong>{scannedTyresCount > 0 ? "Ready to Finalize" : "Awaiting Items"}</Text>
        </Text>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => {
              const totalQty   = groupedTyres.reduce((s, i) => s + i.qty, 0);
              const scannedQty = groupedTyres.reduce((s, i) => s + i.scannedQty, 0);
              const pending    = totalQty - scannedQty;
              if (pending > 0) {
                message.warning(`Please scan all tyres before finalizing. Pending Qty: ${pending}`);
                toast.error(`Please scan all tyres before finalizing. Pending Qty: ${pending}`);
                return;
              }
              setShowConfirmModal(true);
            }}
            disabled={scannedTyresCount === 0}
            style={{
              background:
                scannedTyresCount > 0
                  ? "linear-gradient(135deg,#10b981 0%,#059669 100%)"
                  : "",
              border: "none",
              height: isDesktop ? 40 : 32,
              borderRadius: 6,
              fontSize: isDesktop ? 14 : 12,
              fontWeight: 600,
              minWidth: isDesktop ? 180 : 140,
            }}
            size={isDesktop ? "middle" : "small"}
          >
            {`Finalize (${scannedTyresCount})`}
          </Button>
        </motion.div>
      </motion.div>
    );
  },
);

// ─────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────
export default function TyreStockReceiveRedesign() {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [barcodeInput, setBarcodeInput]         = useState("");
  const [isScanning, setIsScanning]             = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting]         = useState(false);
  const [scanStatus, setScanStatus]             = useState("ready");
  const [lastScannedTime, setLastScannedTime]   = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [receivePlan, setReceivePlan]           = useState(null);
  const [receiveLocation, setReceiveLocation]   = useState(null);
  const [isTransactionLocked, setIsTransactionLocked] = useState(false);
  const [activeTransactionId, setActiveTransactionId] = useState(null);
  const [binLocations, setBinLocations]         = useState([]);
  const [selectedBinLocation, setSelectedBinLocation] = useState(null);
  const [tableLoading, setTableLoading]         = useState(false);
  const [lastScannedTyre, setLastScannedTyre]   = useState(null);

  const { state }           = useLocation();
  const { LocationDetails } = useSelector((s) => s.auth);
  const { factoryWarehouseDetails } = useSelector((s) => s.warehouse);
  const scannedTyres        = useSelector((s) =>
    Array.isArray(s.warehouse.scannedTyres) ? s.warehouse.scannedTyres : [],
  );
  const [form]    = Form.useForm();
  const dispatch  = useDispatch();
  const receiveData = state?.transferData;
  const refNumber   = receiveData?.id;
  const inputRef    = useRef(null);

  useEffect(() => { dispatch(GetFactoryWarehouseDetails()); }, []);

  useEffect(() => {
    if (receiveData) {
      setReceivePlan(receiveData.plant);
      setReceiveLocation(receiveData.to);
    }
  }, [receiveData]);

  useEffect(() => {
    if (receiveData?.tM_ID) {
      const load = async () => {
        try {
          setIsTransactionLocked(true);
          setActiveTransactionId(receiveData.tM_ID);
          const res   = await dispatch(GetTransactionById(receiveData.tM_ID, receiveData.statusNo));
          const items = res?.data?.data || [];
          dispatch(setScannedTyres(items));
        } catch (err) {
          console.log(err);
          message.error("Failed to load transaction");
        }
      };
      load();
    }
  }, [receiveData, dispatch]);

  useEffect(() => {
    const loadBins = async () => {
      try {
        const res  = await dispatch(GetBinLocationMaster());
        const data = res?.data?.data || [];
        const plantData = data.find(
          (item) => item.plant?.toLowerCase() === receivePlan?.toLowerCase(),
        );
        if (plantData) setBinLocations(plantData.phyloc || []);
      } catch (err) {
        console.log(err);
        message.error("Failed to load bin locations");
      }
    };
    if (receivePlan) loadBins();
  }, [receivePlan]);

  useEffect(() => {
    if (LocationDetails?.length > 0 && !receivePlan) {
      setReceivePlan(LocationDetails[0].locationName);
    }
  }, [LocationDetails, receivePlan]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleScan = useCallback(async () => {
    if (!receivePlan || !receiveLocation) {
      const msg = "⚠ Please select Warehouse and Receive Location first";
      message.warning(msg); toast.error(msg); return;
    }
    if (!selectedBinLocation) {
      const msg = "⚠ Please select Bin Location";
      message.warning(msg); toast.error(msg); return;
    }
    if (!barcodeInput.trim()) {
      message.error("Please scan a barcode"); toast.error("Please scan a barcode"); return;
    }

    setScanStatus("scanning");
    setIsScanning(true);
    setTableLoading(true);

    try {
      const payload = {
        binLocation: selectedBinLocation,
        barcode: barcodeInput,
        plant: receivePlan,
        tM_ID: receiveData?.tM_ID,
      };

      await dispatch(scanReceiveBarcode(payload));

      const updated     = await dispatch(GetTransactionById(receiveData?.tM_ID, receiveData?.statusNo || 46));
      const updatedList = updated?.data?.data || [];

      dispatch(setScannedTyres(updatedList));

      const currentTyre = updatedList.find((item) => item.barcode === barcodeInput);
      if (currentTyre) setLastScannedTyre(currentTyre);

      setBarcodeInput("");
      setLastScannedTime(new Date());
      setScanStatus("success");
      message.success("Barcode scanned successfully");
      toast.success("Barcode scanned successfully");

      setTimeout(() => setScanStatus("ready"), 1500);
    } catch (err) {
      console.log(err);
      setScanStatus("duplicate");
      const errMsg = err?.response?.data?.message || "Scan failed";
      message.error(errMsg); toast.error(errMsg);
      setTimeout(() => setScanStatus("ready"), 1500);
    } finally {
      setIsScanning(false);
      setTableLoading(false);
      // Re-focus input after every scan attempt
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [barcodeInput, receivePlan, receiveLocation, selectedBinLocation, receiveData, dispatch]);

  const groupedTyres = useMemo(() => {
    const grouped = {};
    scannedTyres.forEach((item) => {
      const key = item.processID;
      if (!grouped[key]) {
        grouped[key] = {
          config: item.config, barcode: item.barcode, stencilNo: item.stencilNo,
          grade: item.grade, sideWall: item.sideWall, processID: item.processID,
          brand: item.brand, tyreSize: item.tyreSize, rimSize: item.rimSize,
          tyreType: item.tyreType, qty: 0, scannedQty: 0,
        };
      }
      grouped[key].qty += 1;
      if (item.whstatus === true) grouped[key].scannedQty += 1;
    });
    return Object.values(grouped);
  }, [scannedTyres]);

  const columns = useMemo(() => {
    // ── Mobile: single stacked cell ──
    if (isMobile) {
      return [
        {
          title: "Tyre Details",
          dataIndex: "tyreDetails",
          render: (_, record) => (
            <div style={{ padding: "2px 0" }}>
              <Text
                strong
                style={{ fontSize: 12, display: "block", marginBottom: 4, lineHeight: 1.4 }}
              >
                {[record.config, record.brand, record.tyreSize, record.tyreType]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  flexWrap: "wrap",
                  marginBottom: 4,
                }}
              >
                {record.processID && (
                  <Tag style={{ fontSize: 10, margin: 0, lineHeight: "18px" }}>
                    {record.processID}
                  </Tag>
                )}
                {record.grade && (
                  <Tag
                    color={record.grade === "A" ? "green" : "orange"}
                    style={{ fontSize: 10, margin: 0, lineHeight: "18px" }}
                  >
                    {record.grade}
                  </Tag>
                )}
                {record.rimSize && (
                  <Tag style={{ fontSize: 10, margin: 0, lineHeight: "18px" }}>
                    Rim {record.rimSize}
                  </Tag>
                )}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: "#64748b" }}>
                  Total: <Text strong>{record.qty}</Text>
                </span>
                <span style={{ fontSize: 11, color: "#16a34a" }}>
                  Scanned: <Text strong style={{ color: "#16a34a" }}>{record.scannedQty}</Text>
                </span>
                <span style={{ fontSize: 11, color: "#ea580c" }}>
                  Pending:{" "}
                  <Text strong style={{ color: "#ea580c" }}>
                    {record.qty - record.scannedQty}
                  </Text>
                </span>
              </div>
            </div>
          ),
        },
      ];
    }

    // ── Tablet: compact columns ──
 // ── Tablet: Same as Mobile with slightly larger sizing ──
if (isTablet) {
  return [
    {
      title: "Tyre Details",
      dataIndex: "tyreDetails",
      render: (_, record) => (
        <div style={{ padding: "4px 0" }}>
          {/* Description */}
          <Text
            strong
            style={{
              fontSize: 13,
              display: "block",
              marginBottom: 6,
              lineHeight: 1.5,
              wordBreak: "break-word",
            }}
          >
            {[
              record.config,
              record.brand,
              record.sideWall,
              record.tyreSize,
              record.tyreType,
            ]
              .filter(Boolean)
              .join(" · ")}
          </Text>

          {/* Tags */}
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              marginBottom: 6,
            }}
          >
            {record.processID && (
              <Tag
                style={{
                  fontSize: 11,
                  margin: 0,
                  lineHeight: "20px",
                }}
              >
                {record.processID}
              </Tag>
            )}

            {record.grade && (
              <Tag
                color={record.grade === "A" ? "green" : "orange"}
                style={{
                  fontSize: 11,
                  margin: 0,
                  lineHeight: "20px",
                }}
              >
                {record.grade}
              </Tag>
            )}

            {record.rimSize && (
              <Tag
                style={{
                  fontSize: 11,
                  margin: 0,
                  lineHeight: "20px",
                }}
              >
                Rim {record.rimSize}
              </Tag>
            )}
          </div>

          {/* Qty Details */}
          <div
            style={{
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 12, color: "#64748b" }}>
              Total: <Text strong>{record.qty}</Text>
            </span>

            <span style={{ fontSize: 12, color: "#16a34a" }}>
              Scanned:{" "}
              <Text strong style={{ color: "#16a34a" }}>
                {record.scannedQty}
              </Text>
            </span>

            <span style={{ fontSize: 12, color: "#ea580c" }}>
              Pending:{" "}
              <Text strong style={{ color: "#ea580c" }}>
                {record.qty - record.scannedQty}
              </Text>
            </span>
          </div>
        </div>
      ),
    },
  ];
}

    // ── Desktop: full columns ──
    return [
      { title: "Platform",    dataIndex: "config",     width: 140, render: (t) => <Text strong style={{ fontSize: 14 }}>{t}</Text> },
      { title: "Brand",       dataIndex: "brand",      width: 100, render: (t) => <Tag color="blue" style={{ fontSize: 13, margin: 0 }}>{t}</Tag> },
      { title: "SideWall",    dataIndex: "sideWall",   width: 100, render: (t) => <Tag color="blue" style={{ fontSize: 13, margin: 0 }}>{t}</Tag> },
      { title: "Tyre Size",   dataIndex: "tyreSize",   width: 140, render: (t) => <span style={{ fontSize: 14 }}>{t}</span> },
      { title: "Rim Size",    dataIndex: "rimSize",    width: 100, render: (t) => <Text style={{ fontSize: 14 }}>{t}</Text> },
      { title: "Tyre Type",   dataIndex: "tyreType",   width: 120, render: (t) => <Tag color="cyan" style={{ fontSize: 13, margin: 0 }}>{t}</Tag> },
      { title: "Process ID",  dataIndex: "processID",  width: 140, render: (t) => <Text strong style={{ fontSize: 14 }}>{t}</Text> },
      { title: "Grade",       dataIndex: "grade",      width: 80,  render: (t) => <Tag color={t === "A" ? "green" : "orange"} style={{ fontSize: 13, margin: 0 }}>{t}</Tag> },
      { title: "Qty",         dataIndex: "qty",        width: 100, render: (t) => <Tag color="green">{t}</Tag> },
      { title: "Scanned Qty", dataIndex: "scannedQty", width: 120, render: (t) => <Tag color="green">{t}</Tag> },
      { title: "Pending Qty", width: 120, render: (_, r) => <Tag color="orange">{r.qty - r.scannedQty}</Tag> },
    ];
  }, [isMobile, isTablet, isDesktop]);

  const completionPercentage = Math.min(
    ((scannedTyres.length || 0) / Math.max(scannedTyres.length || 1, 10)) * 100,
    100,
  );

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ResponsiveHeader
        isMobile={isMobile}
        isTablet={isTablet}
        isDesktop={isDesktop}
        scannedTyresCount={scannedTyres.length}
        completionPercentage={completionPercentage}
        setMobileDrawerOpen={setMobileDrawerOpen}
        receivePlan={receivePlan}
        setReceivePlan={setReceivePlan}
        receiveLocation={receiveLocation}
        setReceiveLocation={setReceiveLocation}
        state={state}
        isTransactionLocked={isTransactionLocked}
        warehouseDetails={factoryWarehouseDetails || []}
        refNumber={refNumber}
        receiveData={receiveData}
        binLocations={binLocations}
        selectedBinLocation={selectedBinLocation}
        setSelectedBinLocation={setSelectedBinLocation}
      />

      <ResponsiveContent
        isMobile={isMobile}
        isTablet={isTablet}
        isDesktop={isDesktop}
        scanStatus={scanStatus}
        barcodeInput={barcodeInput}
        setBarcodeInput={setBarcodeInput}
        handleScan={handleScan}
        isScanning={isScanning}
        lastScannedTime={lastScannedTime}
        inputRef={inputRef}
        scannedTyres={scannedTyres}
        setShowConfirmModal={setShowConfirmModal}
        columns={columns}
        receivePlan={receivePlan}
        receiveLocation={receiveLocation}
        selectedBinLocation={selectedBinLocation}
        groupedTyres={groupedTyres}
        tableLoading={tableLoading}
        lastScannedTyre={lastScannedTyre}
        setLastScannedTyre={setLastScannedTyre}
      />

      <ResponsiveFooter
        isMobile={isMobile}
        isTablet={isTablet}
        isDesktop={isDesktop}
        scannedTyresCount={scannedTyres.length}
        groupedTyres={groupedTyres}
        setScannedTyres={setScannedTyres}
        setShowConfirmModal={setShowConfirmModal}
      />

      {/* Mobile info drawer */}
      {isMobile && (
        <Drawer
          title="Receipt Details"
          placement="right"
          onClose={() => setMobileDrawerOpen(false)}
          open={mobileDrawerOpen}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>RECEIPT NUMBER</Text>
              <Text code style={{ display: "block", marginTop: 4, fontSize: 14 }}>{refNumber}</Text>
            </div>
            <Divider />
            <div>
              <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>PROGRESS</Text>
              <Progress percent={completionPercentage} style={{ marginTop: 8 }} />
              <Text style={{ fontSize: 12, marginTop: 8, display: "block" }}>
                {scannedTyres.length} items received
              </Text>
            </div>
            <Divider />
            <Button
              type="primary"
              block
              onClick={() => { setShowConfirmModal(true); setMobileDrawerOpen(false); }}
              disabled={scannedTyres.length === 0}
              style={{
                background: "linear-gradient(135deg,#10b981 0%,#059669 100%)",
                border: "none",
                height: 40,
                borderRadius: 8,
              }}
            >
              Finalize Receipt
            </Button>
          </Space>
        </Drawer>
      )}

      {/* Confirm modal */}
      <Modal
        open={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        footer={null}
        centered
        width={isMobile ? "95vw" : isTablet ? 400 : 450}
        bodyStyle={{ padding: 0 }}
        style={{ borderRadius: 16 }}
      >
        <div
          style={{
            background: "linear-gradient(135deg,#10b981 0%,#059669 100%)",
            padding: isMobile ? "24px 16px" : "32px 24px",
            borderRadius: "8px 8px 0 0",
            color: "white",
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          <CheckCircleOutlined style={{ fontSize: 36, marginBottom: 10, display: "block" }} />
          <Title level={3} style={{ margin: 0, color: "white", fontSize: isMobile ? 18 : 20 }}>
            Finalize Receipt
          </Title>
          <Text
            style={{ color: "rgba(255,255,255,0.9)", display: "block", marginTop: 6, fontSize: isMobile ? 12 : 13 }}
          >
            {scannedTyres.length} items received
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={async () => {
            try {
              setIsSubmitting(true);
              const payload = { id: scannedTyres?.[0]?.tM_ID || 0 };
              const res = await dispatch(FinalSubmit(payload));
              message.success(res?.data?.message || "✓ Receipt completed successfully");
              dispatch(setScannedTyres([]));
              sessionStorage.removeItem("activeReceiveTransaction");
              setActiveTransactionId(null);
              setIsTransactionLocked(false);
              form.resetFields();
              setShowConfirmModal(false);
            } catch (err) {
              console.log(err);
              message.error(err?.message || err?.data?.message || "Failed to finalize");
            } finally {
              setIsSubmitting(false);
            }
          }}
          style={{ padding: isMobile ? "16px" : "24px" }}
        >
          <Form.Item
            label={<Text strong>Received By</Text>}
            name="receivedBy"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input
              size="large"
              prefix={<TruckOutlined />}
              placeholder="Enter receiver name"
              style={{ borderRadius: 8, fontSize: isMobile ? 13 : 14 }}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isSubmitting}
              style={{
                background: "linear-gradient(135deg,#10b981 0%,#059669 100%)",
                border: "none",
                height: isMobile ? 40 : 44,
                borderRadius: 8,
                fontSize: isMobile ? 13 : 14,
                fontWeight: 600,
              }}
            >
              Complete Receipt
            </Button>
          </Form.Item>
          <Button
            block
            onClick={() => setShowConfirmModal(false)}
            style={{ height: isMobile ? 36 : 40, borderRadius: 8, fontSize: isMobile ? 12 : 13 }}
          >
            Cancel
          </Button>
        </Form>
      </Modal>

      <style>{`
        .ant-table-row-highlight {
          background: linear-gradient(90deg,rgba(16,185,129,0.08) 0%,transparent 100%) !important;
          animation: slideInTable 0.4s ease-out;
        }
        @keyframes slideInTable {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .ant-table-body { scrollbar-width: thin; scrollbar-color: #cbd5e1 #f1f5f9; }
        .ant-table-body::-webkit-scrollbar       { width: 4px; height: 4px; }
        .ant-table-body::-webkit-scrollbar-track { background: #f1f5f9; }
        .ant-table-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
        .ant-table-body::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .ant-table-row:hover {
          background: linear-gradient(90deg,rgba(16,185,129,0.05) 0%,transparent 100%) !important;
        }
        .ant-table-cell {
          padding: ${isDesktop ? "12px 16px" : "8px 10px"} !important;
          font-size: ${isDesktop ? "14px" : "12px"} !important;
          white-space: normal !important;
          word-break: break-word;
        }
        .ant-table-wrapper    { width: 100%; max-width: 100%; overflow-x: auto; }
        .responsive-receive-table .ant-table { width: 100%; }
        @media (max-width: 768px) {
          .ant-card                  { border-radius: 8px !important; }
          .ant-btn                   { font-size: 11px !important; }
          .ant-input, .ant-select    { font-size: 12px !important; }
          .ant-modal                 { max-width: 95vw !important; }
          .ant-table-cell            { padding: 8px 10px !important; font-size: 12px !important; }
        }
        @media (hover: none) and (pointer: coarse) {
          .ant-btn, .ant-input, button, input, [role="button"] { min-height: 36px; }
        }
      `}</style>
    </Layout>
  );
}