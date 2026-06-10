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
const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const getStatusColor = (status) => {
  switch (status) {
    case "success":
      return "#10b981";
    case "scanning":
      return "#3b82f6";
    case "duplicate":
      return "#ef4444";
    default:
      return "#6b7280";
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "success":
      return "✓ Ready";
    case "scanning":
      return "◈ Scanning";
    case "duplicate":
      return "⚠ Duplicate";
    default:
      return "● Ready";
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
    binLocations = [], // Default to empty array to prevent map errors
    selectedBinLocation,
    setSelectedBinLocation,
  }) => {
    const isReceive = state?.type === "RECEIVE";
    const isNewMode = state?.mode === "NEW";
    const pageTitle = "Stock Receive";
    const subTitle = "📥 Warehouse Receiving";
    const { LocationDetails } = useSelector((state) => state.auth);

    const dispatch = useDispatch();

    // Track what the user is typing so we can capture custom inputs
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
      if (LocationDetails?.length > 0 && !receivePlan) {
        setReceivePlan(LocationDetails[0].locationName);
      }
    }, [LocationDetails, receivePlan]);

    const selectedPlantDetails = warehouseDetails?.find(
      (item) => item.plant === receivePlan,
    );

    const selectContainerWidth = isDesktop
      ? "220px"
      : isTablet
        ? "180px"
        : "100%";
    const selectFontSize = isDesktop ? 14 : isTablet ? 13 : 11;
    const refFontSize = isDesktop ? 18 : isTablet ? 16 : 14;

    // --- Helper logic for Free-Text Select ---
    // If user typed something that isn't in the list, inject it as a valid option
    const binOptions = [...binLocations];
    if (searchValue && !binOptions.includes(searchValue)) {
      binOptions.unshift(searchValue);
    }
    // Ensure currently selected custom value stays visible in the options list
    if (selectedBinLocation && !binOptions.includes(selectedBinLocation)) {
      binOptions.unshift(selectedBinLocation);
    }

    const formattedBinOptions = binOptions.map((item) => ({
      value: item,
      label: binLocations.includes(item) ? item : `New: ${item}`, 
    }));

    // Capture custom input when user presses Enter or leaves the field
    const handleBinSearch = (value) => {
      setSearchValue(value);
    };

    const handleBinChange = (value) => {
      setSelectedBinLocation(value);
      setSearchValue(""); // Reset search after selection
    };

    return (
      <Header
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
          height: "auto",
          minHeight: isMobile ? "56px" : isTablet ? "68px" : "80px",
          padding: isMobile
            ? "8px 10px 10px"
            : isTablet
              ? "10px 12px"
              : "12px 28px",
          borderBottom: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.08)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Row
          justify="space-between"
          align="middle"
          gutter={isMobile ? 6 : isTablet ? 8 : 14}
          style={{ width: "100%", maxWidth: "100%" }}
          wrap={isMobile || isTablet}
        >
          {/* Title Section */}
          <Col
            flex={isMobile ? "1 1 auto" : isTablet ? "1 1 180px" : "170px"}
            style={{ minWidth: 0, flexShrink: 1 }}
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Space direction="vertical" size={0}>
                <Title
                  level={isMobile ? 5 : 4}
                  style={{
                    margin: 0,
                    color: "#0f172a",
                    fontWeight: 700,
                    fontSize: isMobile ? 14 : isTablet ? 16 : 19,
                    lineHeight: 1.1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {pageTitle}
                </Title>

                <Text
                  type="secondary"
                  style={{
                    fontSize: isMobile ? 9 : isTablet ? 10 : 12,
                    color: "#64748b",
                    letterSpacing: 0.2,
                    textTransform: "uppercase",
                    fontWeight: 500,
                    marginTop: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {subTitle}
                </Text>
              </Space>
            </motion.div>
          </Col>

          {/* Receive Selects (Desktop/Tablet only) */}
          {!isMobile && (
            <Col
              flex="auto"
              style={{
                minWidth: 0,
                overflowX: "auto",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Row
                gutter={isDesktop ? 12 : 10}
                align="middle"
                justify="flex-start"
                wrap={isTablet}
                style={{ marginLeft: 0, width: "100%", maxWidth: "100%" }}
              >
                {/* Warehouse Select */}
                <Col
                  style={{
                    width: selectContainerWidth,
                    minWidth: isTablet ? "150px" : "160px",
                    maxWidth: isTablet ? "100%" : selectContainerWidth,
                    flex: isTablet ? "1 1 180px" : "0 0 auto",
                    flexShrink: 1,
                  }}
                >
                  <Select
                    size="small"
                    placeholder="Select Warehouse"
                    style={{
                      width: "100%",
                      fontSize: selectFontSize,
                      height: isDesktop ? 34 : 30,
                    }}
                    value={receivePlan}
                    onChange={setReceivePlan}
                    disabled={true}
                    options={[
                      {
                        value: receiveData?.plant,
                        label: receiveData?.plant,
                      },
                    ]}
                    dropdownMatchSelectWidth={false}
                    dropdownStyle={{
                      minWidth: selectContainerWidth,
                      maxWidth: "300px",
                    }}
                  />
                </Col>

                {/* Send From Select */}
                <Col
                  style={{
                    width: selectContainerWidth,
                    minWidth: isTablet ? "150px" : "160px",
                    maxWidth: isTablet ? "100%" : selectContainerWidth,
                    flex: isTablet ? "1 1 180px" : "0 0 auto",
                    flexShrink: 1,
                  }}
                >
                  <Select
                    size="small"
                    placeholder="Send from"
                    style={{
                      width: "100%",
                      fontSize: selectFontSize,
                      height: isDesktop ? 34 : 30,
                    }}
                    value={receiveData?.send}
                    onChange={setReceiveLocation}
                    disabled={true}
                    options={[
                      {
                        value: receiveData?.send,
                        label: receiveData?.send,
                      },
                    ]}
                    dropdownMatchSelectWidth={false}
                    dropdownStyle={{
                      minWidth: selectContainerWidth,
                      maxWidth: "300px",
                    }}
                  />
                </Col>

                {/* Receive At Select */}
                <Col
                  style={{
                    width: selectContainerWidth,
                    minWidth: isTablet ? "150px" : "160px",
                    maxWidth: isTablet ? "100%" : selectContainerWidth,
                    flex: isTablet ? "1 1 180px" : "0 0 auto",
                    flexShrink: 1,
                  }}
                >
                  <Select
                    size="small"
                    placeholder="Receive At"
                    style={{
                      width: "100%",
                      fontSize: selectFontSize,
                      height: isDesktop ? 34 : 30,
                    }}
                    value={receiveData?.to}
                    onChange={setReceiveLocation}
                    disabled={true}
                    options={[
                      {
                        value: receiveData?.to,
                        label: receiveData?.to,
                      },
                    ]}
                    dropdownMatchSelectWidth={false}
                    dropdownStyle={{
                      minWidth: selectContainerWidth,
                      maxWidth: "300px",
                    }}
                  />
                </Col>

                {/* Bin Location Combobox (Modified Section) */}
                <Col
                  style={{
                    width: selectContainerWidth,
                    minWidth: isTablet ? "150px" : "160px",
                    maxWidth: isTablet ? "100%" : selectContainerWidth,
                    flex: isTablet ? "1 1 220px" : "0 0 auto",
                    flexShrink: 1,
                  }}
                >
                  <Select
                    showSearch
                    size="small"
                    placeholder="Bin Location"
                    style={{
                      width: "100%",
                      fontSize: selectFontSize,
                      height: isDesktop ? 34 : 30,
                    }}
                    value={selectedBinLocation}
                    onChange={handleBinChange}
                    onSearch={handleBinSearch}
                    searchValue={searchValue}
                    options={formattedBinOptions}
                    filterOption={(input, option) =>
                      (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    onBlur={() => {
                      // If user clicks away while typing a new item, auto-select it
                      if (searchValue && !binLocations.includes(searchValue)) {
                        handleBinChange(searchValue);
                      }
                    }}
                  />
                </Col>
              </Row>
            </Col>
          )}

          {/* REF Number Section */}
          {!isMobile && (
            <Col style={{ flexShrink: 0, minWidth: 0 }}>
              <Row gutter={isTablet ? 8 : 10} align="middle">
                <Col>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        padding: isDesktop ? "8px 14px" : "6px 12px",
                        borderRadius: 6,
                        color: "white",
                        width: "fit-content",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        minWidth: "80px",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: isDesktop ? 11 : 10,
                          color: "rgba(255,255,255,0.85)",
                          display: "block",
                          lineHeight: 1.1,
                          fontWeight: 600,
                          letterSpacing: "0.02em",
                        }}
                      >
                        REC #
                      </Text>
                      <Text
                        strong
                        style={{
                          fontSize: refFontSize,
                          color: "white",
                          fontFamily: "monospace",
                          lineHeight: 1.1,
                          whiteSpace: "nowrap",
                          display: "inline-block",
                        }}
                      >
                        {refNumber}
                      </Text>
                    </div>
                  </motion.div>
                </Col>
              </Row>
            </Col>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <Col style={{ flexShrink: 0, paddingLeft: 4 }}>
              <Button
                type="text"
                icon={<MenuOutlined style={{ fontSize: 18 }} />}
                onClick={() => setMobileDrawerOpen(true)}
                style={{ fontSize: 14, padding: "4px 6px", height: 32 }}
              />
            </Col>
          )}
        </Row>

        {/* Mobile Selects */}
        {isMobile && (
          <Space direction="vertical" style={{ width: "100%", marginTop: 6 }} size={4}>
            <Row gutter={6} style={{ width: "100%" }} align="middle" wrap={false}>
              <Col span={12} style={{ minWidth: 0 }}>
                <Select
                  size="small"
                  placeholder="Warehouse"
                  disabled={true}
                  style={{ width: "100%", fontSize: 10, minHeight: 30 }}
                  value={receivePlan}
                  onChange={setReceivePlan}
                  options={warehouseDetails?.map((item) => ({
                    value: item.plant,
                    label: `${item.plant} - ${item.factoryDetails}`,
                  }))}
                  dropdownMatchSelectWidth={false}
                  dropdownStyle={{ minWidth: "120px" }}
                />
              </Col>
              <Col span={12} style={{ minWidth: 0 }}>
                <Select
                  size="small"
                  placeholder="Receive At"
                  disabled={isTransactionLocked}
                  style={{ width: "100%", fontSize: 10, minHeight: 30 }}
                  value={receiveLocation}
                  onChange={setReceiveLocation}
                  options={
                    selectedPlantDetails?.warehouses?.map((warehouse) => ({
                      value: warehouse,
                      label: warehouse,
                    })) || []
                  }
                  dropdownMatchSelectWidth={false}
                  dropdownStyle={{ minWidth: "120px" }}
                />
              </Col>
            </Row>

            {/* Mobile Bin Location row (Added for complete mobile responsive behavior) */}
            <Row style={{ width: "100%" }}>
              <Col span={24}>
                <Select
                  showSearch
                  size="small"
                  placeholder="Bin Location"
                  style={{ width: "100%", fontSize: 10, minHeight: 30 }}
                  value={selectedBinLocation}
                  onChange={handleBinChange}
                  onSearch={handleBinSearch}
                  searchValue={searchValue}
                  options={formattedBinOptions}
                  filterOption={(input, option) =>
                    (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  onBlur={() => {
                    if (searchValue && !binLocations.includes(searchValue)) {
                      handleBinChange(searchValue);
                    }
                  }}
                />
              </Col>
            </Row>
          </Space>
        )}
      </Header>
    );
  },
);

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
    previewTyre,
    setPreviewTyre,
    saveTyre,
    scannedTyres,
    setShowConfirmModal,
    columns,
    receivePlan,
    receiveLocation,
    selectedBinLocation,
    groupedTyres,
    tableLoading,
  }) => {
    const isSelectionMissing =
      !receivePlan || !receiveLocation || !selectedBinLocation;

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
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <Card
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                flex: previewTyre ? 0 : 1,
                overflow: "hidden",
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,
              }}
              bodyStyle={{ padding: 12 }}
            >
              <div style={{ marginBottom: 10 }}>
                <motion.div
                  animate={{
                    boxShadow:
                      scanStatus === "scanning"
                        ? "0 0 15px rgba(59, 130, 246, 0.4)"
                        : scanStatus === "success"
                          ? "0 0 15px rgba(16, 185, 129, 0.3)"
                          : "0 0 0px rgba(0, 0, 0, 0)",
                  }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 6,
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
                    animate={
                      scanStatus === "scanning"
                        ? { rotate: 360 }
                        : { rotate: 0 }
                    }
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <RadarChartOutlined
                      style={{
                        color: getStatusColor(scanStatus),
                        fontSize: 14,
                      }}
                    />
                  </motion.div>
                  <Text
                    strong
                    style={{ color: getStatusColor(scanStatus), fontSize: 12 }}
                  >
                    {getStatusLabel(scanStatus)}
                  </Text>
                </motion.div>
              </div>

              <Input
                ref={inputRef}
                size="large"
                value={barcodeInput}
                placeholder="Scan or enter..."
                prefix={<BarcodeOutlined style={{ color: "#64748b" }} />}
                onPressEnter={handleScan}
                onChange={(e) => setBarcodeInput(e.target.value)}
                style={{
                  fontFamily: "monospace",
                  fontSize: 13,
                  fontWeight: 500,
                  marginBottom: 10,
                }}
                maxLength={50}
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
                    : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  border: "none",
                  height: 40,
                  fontSize: 13,
                  fontWeight: 600,
                  borderRadius: 8,
                }}
              >
                Scan
              </Button>

              {lastScannedTime && (
                <Text
                  type="secondary"
                  style={{ fontSize: 11, display: "block", marginTop: 8 }}
                >
                  <ClockCircleOutlined /> {lastScannedTime.toLocaleTimeString()}
                </Text>
              )}
            </Card>

            {scannedTyres.length > 0 && (
              <Card
                style={{
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  flex: 2,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  width: "100%",
                  maxWidth: "100%",
                  minWidth: 0,
                }}
                bodyStyle={{
                  padding: 0,
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    padding: "8px 12px",
                    background: "#f1f5f9",
                    borderBottom: "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text strong style={{ fontSize: 12 }}>
                    Items ({scannedTyres.length})
                  </Text>
                </div>
                <div style={{ flex: 1, overflow: "auto" }}>
                  <Table
                    columns={columns}
                    loading={{
                      spinning: tableLoading,
                      tip: "Loading items...",
                    }}
                    dataSource={groupedTyres.map((item, index) => ({
                      ...item,
                      key: index,
                    }))}
                    pagination={false}
                    size="small"
                    showHeader={false}
                    tableLayout="fixed"
                    scroll={{ x: "100%" }}
                    style={{ width: "100%", maxWidth: "100%" }}
                    locale={{
                      emptyText: (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={
                            <Text style={{ fontSize: 11 }}>No items</Text>
                          }
                        />
                      ),
                    }}
                  />
                </div>
              </Card>
            )}

            {scannedTyres.length > 0 && (
              <Card
                style={{
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  borderRadius: 12,
                  border: "none",
                  padding: "8px 12px",
                  color: "white",
                }}
                bodyStyle={{ padding: "8px" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: 10,
                        display: "block",
                      }}
                    >
                      RECEIVED
                    </Text>
                    <Text
                      strong
                      style={{ color: "white", fontSize: 16, display: "block" }}
                    >
                      {scannedTyres.length} items
                    </Text>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="primary"
                      size="middle"
                      icon={<SendOutlined />}
                      onClick={() => setShowConfirmModal(true)}
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        border: "1px solid rgba(255,255,255,0.4)",
                        color: "white",
                        height: 36,
                        paddingLeft: 12,
                        paddingRight: 12,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      Finalize
                    </Button>
                  </motion.div>
                </div>
              </Card>
            )}
          </motion.div>
        </Content>
      );
    }

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
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                  overflow: "hidden",
                  width: "100%",
                  maxWidth: "100%",
                  minWidth: 0,
                }}
                bodyStyle={{ padding: isTablet ? 8 : 12 }}
              >
                <div style={{ marginBottom: 12 }}>
                  <motion.div
                    animate={{
                      boxShadow:
                        scanStatus === "scanning"
                          ? "0 0 10px rgba(59, 130, 246, 0.4)"
                          : scanStatus === "success"
                            ? "0 0 10px rgba(16, 185, 129, 0.3)"
                            : "0 0 0px rgba(0, 0, 0, 0)",
                    }}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 6,
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
                      animate={
                        scanStatus === "scanning"
                          ? { rotate: 360 }
                          : { rotate: 0 }
                      }
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <RadarChartOutlined
                        style={{
                          color: getStatusColor(scanStatus),
                          fontSize: 13,
                        }}
                      />
                    </motion.div>
                    <Text
                      strong
                      style={{
                        color: getStatusColor(scanStatus),
                        fontSize: 11,
                      }}
                    >
                      {getStatusLabel(scanStatus)}
                    </Text>
                  </motion.div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <Input
                    ref={inputRef}
                    size={isDesktop ? "middle" : "small"}
                    value={barcodeInput}
                    placeholder="Scan barcode..."
                    prefix={<BarcodeOutlined style={{ color: "#64748b" }} />}
                    onPressEnter={handleScan}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    style={{
                      fontFamily: "monospace",
                      fontSize: isDesktop ? 16 : 12,
                      fontWeight: 500,
                    }}
                    maxLength={50}
                    suffix={
                      isScanning ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <ScanOutlined
                            style={{
                              color: "#10b981",
                              fontSize: isDesktop ? 18 : 12,
                            }}
                          />
                        </motion.div>
                      ) : null
                    }
                  />
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
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
                        : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
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
                  <Text
                    type="secondary"
                    style={{ fontSize: 11, display: "block", marginTop: 10 }}
                  >
                    <ClockCircleOutlined />{" "}
                    {lastScannedTime.toLocaleTimeString()}
                  </Text>
                )}
              </Card>
            </motion.div>

            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <AnimatePresence mode="wait">
                {previewTyre ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Card
                      style={{
                        background:
                          "linear-gradient(135deg, #f0f4f8 0%, #ffffff 100%)",
                        borderRadius: isTablet ? 12 : 16,
                        border: "2px solid #10b981",
                        boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.1)",
                        overflow: "hidden",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                      bodyStyle={{
                        padding: 0,
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div
                        style={{
                          background:
                            "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                          padding: isDesktop ? "12px 20px" : "8px 12px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          strong
                          style={{
                            color: "white",
                            fontSize: isDesktop ? 16 : 12,
                          }}
                        >
                          Item Details
                        </Text>
                        <Tag
                          color="gold"
                          style={{ fontSize: isDesktop ? 12 : 10 }}
                        >
                          Pending
                        </Tag>
                      </div>

                      <Descriptions
                        column={1}
                        size={isDesktop ? "default" : "small"}
                        bordered
                      >
                        <Descriptions.Item
                          label={
                            <Text
                              strong
                              style={{
                                fontSize: isDesktop ? 14 : isTablet ? 11 : 12,
                              }}
                            >
                              Barcode
                            </Text>
                          }
                        >
                          <Text
                            code
                            style={{
                              fontSize: isDesktop ? 14 : isTablet ? 11 : 12,
                            }}
                          >
                            {previewTyre.barcode}
                          </Text>
                        </Descriptions.Item>

                        <Descriptions.Item
                          label={
                            <Text
                              strong
                              style={{
                                fontSize: isDesktop ? 14 : isTablet ? 11 : 12,
                              }}
                            >
                              Process ID
                            </Text>
                          }
                        >
                          <Text
                            strong
                            style={{ fontSize: isDesktop ? 14 : 12 }}
                          >
                            {previewTyre.processID}
                          </Text>
                        </Descriptions.Item>

                        <Descriptions.Item
                          label={
                            <Text
                              strong
                              style={{
                                fontSize: isDesktop ? 14 : isTablet ? 11 : 12,
                              }}
                            >
                              Brand
                            </Text>
                          }
                        >
                          <Badge
                            color="#10b981"
                            text={
                              <Text
                                strong
                                style={{ fontSize: isDesktop ? 14 : 12 }}
                              >
                                {previewTyre.brand}
                              </Text>
                            }
                          />
                        </Descriptions.Item>

                        <Descriptions.Item
                          label={
                            <Text
                              strong
                              style={{
                                fontSize: isDesktop ? 14 : isTablet ? 11 : 12,
                              }}
                            >
                              Tyre Size
                            </Text>
                          }
                        >
                          <Text
                            strong
                            style={{ fontSize: isDesktop ? 14 : 12 }}
                          >
                            {previewTyre.tyreSize}
                          </Text>
                        </Descriptions.Item>

                        <Descriptions.Item
                          label={
                            <Text
                              strong
                              style={{
                                fontSize: isDesktop ? 14 : isTablet ? 11 : 12,
                              }}
                            >
                              Rim Size
                            </Text>
                          }
                        >
                          <Text
                            strong
                            style={{ fontSize: isDesktop ? 14 : 12 }}
                          >
                            {previewTyre.rimSize}
                          </Text>
                        </Descriptions.Item>

                        <Descriptions.Item
                          label={
                            <Text
                              strong
                              style={{
                                fontSize: isDesktop ? 14 : isTablet ? 11 : 12,
                              }}
                            >
                              Tyre Type
                            </Text>
                          }
                        >
                          <Tag
                            color="cyan"
                            style={{ fontSize: isDesktop ? 13 : 11 }}
                          >
                            {previewTyre.tyreType}
                          </Tag>
                        </Descriptions.Item>

                        <Descriptions.Item
                          label={
                            <Text
                              strong
                              style={{
                                fontSize: isDesktop ? 14 : isTablet ? 11 : 12,
                              }}
                            >
                              Grade
                            </Text>
                          }
                        >
                          <Tag
                            color={
                              previewTyre.grade === "A" ? "green" : "orange"
                            }
                            style={{ fontSize: isDesktop ? 13 : 11 }}
                          >
                            {previewTyre.grade}
                          </Tag>
                        </Descriptions.Item>

                        <Descriptions.Item
                          label={
                            <Text
                              strong
                              style={{
                                fontSize: isDesktop ? 14 : isTablet ? 11 : 12,
                              }}
                            >
                              Stencil No
                            </Text>
                          }
                        >
                          <Text
                            type="secondary"
                            style={{ fontSize: isDesktop ? 14 : 12 }}
                          >
                            {previewTyre.stencilNo}
                          </Text>
                        </Descriptions.Item>
                      </Descriptions>

                      <div
                        style={{
                          padding: isDesktop ? "16px 24px" : "8px 12px",
                          borderTop: "1px solid #e2e8f0",
                        }}
                      >
                        <Row gutter={isDesktop ? 12 : 4}>
                          <Col span={12}>
                            <Button
                              block
                              onClick={() => setPreviewTyre(null)}
                              size={isDesktop ? "large" : "small"}
                              style={{
                                height: isDesktop ? 44 : 28,
                                borderRadius: 6,
                                fontWeight: 600,
                                fontSize: isDesktop ? 14 : 11,
                              }}
                            >
                              Reject
                            </Button>
                          </Col>
                          <Col span={12}>
                            <Button
                              type="primary"
                              block
                              onClick={saveTyre}
                              size={isDesktop ? "large" : "small"}
                              style={{
                                background:
                                  "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                border: "none",
                                height: isDesktop ? 44 : 28,
                                borderRadius: 6,
                                fontWeight: 600,
                                fontSize: isDesktop ? 14 : 11,
                              }}
                            >
                              Accept
                            </Button>
                          </Col>
                        </Row>
                      </div>
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
                        background:
                          "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                        borderRadius: isTablet ? 12 : 16,
                        border: "2px dashed #cbd5e1",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
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
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                  borderRadius: isTablet ? 12 : 16,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                  height: "100%",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
                bodyStyle={{
                  padding: 0,
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    padding: isDesktop ? "10px 20px" : "10px 16px",
                    color: "white",
                    display: "flex",
                    justifyContent: "space-between",
                    borderRadius: "16px 16px 0 0",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <Title
                      level={5}
                      style={{
                        margin: 0,
                        color: "white",
                        fontSize: isDesktop ? 18 : 14,
                        fontWeight: 700,
                      }}
                    >
                      Received Items
                    </Title>
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: isDesktop ? 12 : 10,
                        marginTop: 1,
                        display: "block",
                      }}
                    >
                      {scannedTyres.length} item
                      {scannedTyres.length !== 1 ? "s" : ""}
                    </Text>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: isDesktop ? 11 : 9,
                        display: "block",
                        marginBottom: 2,
                      }}
                    >
                      COUNT
                    </Text>
                    <Text
                      strong
                      style={{ color: "white", fontSize: isDesktop ? 22 : 16 }}
                    >
                      {scannedTyres.length}
                    </Text>
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Table
                    columns={columns}
                    loading={{
                      spinning: tableLoading,
                      tip: "Loading items...",
                    }}
                    dataSource={groupedTyres.map((item, index) => ({
                      ...item,
                      key: index,
                    }))}
                    pagination={false}
                    size={isDesktop ? "middle" : "small"}
                    tableLayout="auto"
                    className="responsive-receive-table"
                    scroll={{
                      x: "max-content",
                      y: `calc(100vh - ${isDesktop ? "320px" : isTablet ? "260px" : "280px"})`,
                    }}
                    style={{ width: "100%", maxWidth: "100%" }}
                    locale={{
                      emptyText: (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={
                            <Text
                              type="secondary"
                              style={{ fontSize: isDesktop ? 14 : 12 }}
                            >
                              No items received yet
                            </Text>
                          }
                        />
                      ),
                    }}
                    rowClassName={(record, index) =>
                      index === 0 ? "ant-table-row-highlight" : ""
                    }
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

const ResponsiveFooter = memo(
  ({
    isMobile,
    isTablet,
    isDesktop,
    scannedTyresCount,
    setScannedTyres,
    setShowConfirmModal,
  }) => {
    const dispatch = useDispatch();
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
          borderTop: "1px solid #e2e8f0",
          padding: isMobile ? "8px" : isTablet ? "10px 12px" : "10px 32px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          justifyContent: "space-between",
          gap: isMobile ? 8 : 12,
          minHeight: isMobile ? "auto" : 60,
          boxShadow: "0 -1px 3px 0 rgba(0, 0, 0, 0.08)",
        }}
      >
        <Text
          type="secondary"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: isMobile ? 11 : isDesktop ? 15 : 12,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background:
                scannedTyresCount > 0
                  ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                  : "#cbd5e1",
            }}
          />
          <Text strong>
            {scannedTyresCount > 0 ? "Ready to Finalize" : "Awaiting Items"}
          </Text>
        </Text>

        <div
          style={{ display: "flex", gap: 8, width: isMobile ? "100%" : "auto" }}
        >
          {/* Clear All removed from footer by design */}

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ flex: isMobile ? 1 : "auto", display: "flex" }}
          >
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => setShowConfirmModal(true)}
              disabled={scannedTyresCount === 0}
              style={{
                background:
                  scannedTyresCount > 0
                    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    : "",
                border: "none",
                height: isDesktop ? 40 : 32,
                borderRadius: 6,
                fontSize: isDesktop ? 14 : 12,
                fontWeight: 600,
                width: isMobile ? "100%" : "auto",
                minWidth: isMobile ? "auto" : isDesktop ? 180 : 140,
              }}
              size={isDesktop ? "middle" : "small"}
            >
              {isMobile ? "Finalize" : `Finalize (${scannedTyresCount})`}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    );
  },
);

export default function TyreStockReceiveRedesign() {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scanStatus, setScanStatus] = useState("ready");
  const [lastScannedTime, setLastScannedTime] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [receivePlan, setReceivePlan] = useState(null);
  const [receiveLocation, setReceiveLocation] = useState(null);
  const [isTransactionLocked, setIsTransactionLocked] = useState(false);
  const [activeTransactionId, setActiveTransactionId] = useState(null);
  const [binLocations, setBinLocations] = useState([]);
  const [selectedBinLocation, setSelectedBinLocation] = useState(null);
  const [tableLoading, setTableLoading] = useState(false);

  const { state } = useLocation();
  const { LocationDetails } = useSelector((state) => state.auth);
  const { factoryWarehouseDetails } = useSelector((state) => state.warehouse);
  const scannedTyres = useSelector((state) =>
    Array.isArray(state.warehouse.scannedTyres)
      ? state.warehouse.scannedTyres
      : [],
  );
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const receiveData = state?.transferData;
  const refNumber = receiveData?.id;

  useEffect(() => {
    dispatch(GetFactoryWarehouseDetails());
  }, []);

  useEffect(() => {
    if (receiveData) {
      setReceivePlan(receiveData.plant);
      setReceiveLocation(receiveData.to);
    }
  }, [receiveData]);

  useEffect(() => {
    if (receiveData?.tM_ID) {
      const loadTransaction = async () => {
        try {
          setIsTransactionLocked(true);
          setActiveTransactionId(receiveData.tM_ID);

          const res = await dispatch(
            GetTransactionById(receiveData.tM_ID, receiveData.statusNo),
          );

          const items = res?.data?.data || [];

          dispatch(setScannedTyres(items));
        } catch (err) {
          console.log(err);
          message.error("Failed to load transaction");
        }
      };

      loadTransaction();
    }
  }, [receiveData, dispatch]);

  useEffect(() => {
    const loadBinLocations = async () => {
      try {
        const res = await dispatch(GetBinLocationMaster());
        console.log("binLocations", res?.data?.data);
        const data = res?.data?.data || [];

        const plantData = data.find(
          (item) => item.plant?.toLowerCase() === receivePlan?.toLowerCase(),
        );

        if (plantData) {
          setBinLocations(plantData.phyloc || []);
        }
      } catch (err) {
        console.log(err);
        message.error("Failed to load bin locations");
      }
    };

    if (receivePlan) {
      loadBinLocations();
    }
  }, [receivePlan]);

  useEffect(() => {
    if (LocationDetails?.length > 0 && !receivePlan) {
      setReceivePlan(LocationDetails[0].locationName);
    }
  }, [LocationDetails, receivePlan]);

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleScan = useCallback(async () => {
    if (!receivePlan || !receiveLocation) {
      message.warning("⚠ Please select Warehouse and Receive Location first");
      return;
    }

    if (!selectedBinLocation) {
      message.warning("⚠ Please select Bin Location");
      return;
    }

    if (!barcodeInput.trim()) {
      message.error("Please scan a barcode");
      return;
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

      const updated = await dispatch(
        GetTransactionById(receiveData?.tM_ID, receiveData?.statusNo || 46),
      );

      dispatch(setScannedTyres(updated?.data?.data || []));

      setBarcodeInput("");
      setLastScannedTime(new Date());

      setScanStatus("success");

      message.success("Barcode scanned successfully");

      setTimeout(() => {
        setScanStatus("ready");
      }, 1500);
    } catch (err) {
      console.log(err);

      setScanStatus("duplicate");

      message.error(err?.response?.data?.message || "Scan failed");

      setTimeout(() => {
        setScanStatus("ready");
      }, 1500);
    } finally {
      setIsScanning(false);
      setTableLoading(false);
    }
  }, [
    barcodeInput,
    receivePlan,
    receiveLocation,
    selectedBinLocation,
    receiveData,
    dispatch,
  ]);

  // Removed per-row delete action (UI-only removal). Deleting items
  // should remain possible via backend/submit flows if needed.

  const groupedTyres = useMemo(() => {
    const grouped = {};

    scannedTyres.forEach((item) => {
      const key = item.processID;

      if (!grouped[key]) {
        grouped[key] = {
          config: item.config,
          barcode: item.barcode,
          stencilNo: item.stencilNo,
          grade: item.grade,
          sideWall: item.sideWall, // FIXED
          processID: item.processID,
          brand: item.brand,
          tyreSize: item.tyreSize,
          rimSize: item.rimSize,
          tyreType: item.tyreType,
          qty: 1,
        };
      } else {
        grouped[key].qty += 1;
      }
    });

    return Object.values(grouped);
  }, [scannedTyres]);

  const columns = useMemo(() => {
    if (isMobile || isTablet) {
      return [
        {
          title: "Tyre Details",
          dataIndex: "tyreDetails",
          render: (_, record) => {
            const details = [
              record.config,
              record.tyreSize,
              record.tyreType,
              record.rimSize,
              record.brand,
              record.sideWall,
              record.processID,
            ]
              .filter(Boolean)
              .join(" • ");

            return (
              <div
                style={{
                  display: "grid",
                  gap: 4,
                  width: "100%",
                  minWidth: 0,
                }}
              >
                <Text
                  strong
                  style={{
                    fontSize: isMobile ? 12 : 13,
                    lineHeight: 1.4,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  }}
                >
                  {details}
                </Text>
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    flexWrap: "wrap",
                  }}
                >
                  Qty: <Text strong style={{ color: "#0f172a" }}>{record.qty}</Text>
                </div>
              </div>
            );
          },
        },
      ];
    }

    return [
      {
        title: "Platform",
        dataIndex: "config",
        width: 140,
        render: (text) => (
          <Text strong style={{ fontSize: isDesktop ? 14 : 11 }}>
            {text}
          </Text>
        ),
      },
      {
        title: "Brand",
        dataIndex: "brand",
        width: 100,
        render: (text) => (
          <Tag
            color="blue"
            style={{ fontSize: isDesktop ? 13 : 10, margin: 0 }}
          >
            {text}
          </Tag>
        ),
      },
      {
        title: "SideWall",
        dataIndex: "sideWall",
        width: 100,
        render: (text) => (
          <Tag
            color="blue"
            style={{ fontSize: isDesktop ? 13 : 10, margin: 0 }}
          >
            {text}
          </Tag>
        ),
      },
      {
        title: "Tyre Size",
        dataIndex: "tyreSize",
        width: 140,
        render: (text) => (
          <span style={{ fontSize: isDesktop ? 14 : 10 }}>{text}</span>
        ),
      },
      {
        title: "Rim Size",
        dataIndex: "rimSize",
        width: 100,
        render: (text) => (
          <Text style={{ fontSize: isDesktop ? 14 : 10 }}>{text}</Text>
        ),
      },

      {
        title: "Tyre Type",
        dataIndex: "tyreType",
        width: 120,
        render: (text) => (
          <Tag
            color="cyan"
            style={{ fontSize: isDesktop ? 13 : 10, margin: 0 }}
          >
            {text}
          </Tag>
        ),
      },
      {
        title: "Process ID",
        dataIndex: "processID",
        width: 140,
        render: (text) => (
          <Text strong style={{ fontSize: isDesktop ? 14 : 11 }}>
            {text}
          </Text>
        ),
      },
      {
        title: "Grade",
        dataIndex: "grade",
        width: 80,
        render: (text) => (
          <Tag
            color={text === "A" ? "green" : "orange"}
            style={{ fontSize: isDesktop ? 13 : 10, margin: 0 }}
          >
            {text}
          </Tag>
        ),
      },
      {
        title: "Qty",
        dataIndex: "qty",
        width: 100,
        render: (text) => <Tag color="green">{text}</Tag>,
      },
    ];
  }, [isMobile, isTablet]);

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
      />

      <ResponsiveFooter
        isMobile={isMobile}
        isTablet={isTablet}
        isDesktop={isDesktop}
        scannedTyresCount={scannedTyres.length}
        setScannedTyres={setScannedTyres}
        setShowConfirmModal={setShowConfirmModal}
      />

      {isMobile && (
        <Drawer
          title="Receipt Details"
          placement="right"
          onClose={() => setMobileDrawerOpen(false)}
          open={mobileDrawerOpen}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>
                RECEIPT NUMBER
              </Text>
              <Text
                code
                style={{ display: "block", marginTop: 4, fontSize: 14 }}
              >
                {refNumber}
              </Text>
            </div>
            <Divider />
            <div>
              <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>
                PROGRESS
              </Text>
              <Progress
                percent={completionPercentage}
                style={{ marginTop: 8 }}
              />
              <Text style={{ fontSize: 12, marginTop: 8, display: "block" }}>
                {scannedTyres.length} items received
              </Text>
            </div>
            <Divider />
            <Button
              type="primary"
              block
              onClick={() => {
                setShowConfirmModal(true);
                setMobileDrawerOpen(false);
              }}
              disabled={scannedTyres.length === 0}
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
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
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            padding: isMobile ? "24px 16px" : "32px 24px",
            borderRadius: "8px 8px 0 0",
            color: "white",
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          <CheckCircleOutlined
            style={{ fontSize: 36, marginBottom: 10, display: "block" }}
          />
          <Title
            level={3}
            style={{ margin: 0, color: "white", fontSize: isMobile ? 18 : 20 }}
          >
            Finalize Receipt
          </Title>
          <Text
            style={{
              color: "rgba(255,255,255,0.9)",
              display: "block",
              marginTop: 6,
              fontSize: isMobile ? 12 : 13,
            }}
          >
            {scannedTyres.length} items received
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            try {
              setIsSubmitting(true);
              console.log(scannedTyres, "scannedTyres");

              const payload = {
                id: scannedTyres?.[0]?.tM_ID || 0,
              };
              console.log(payload, "payload");

              // TODO: Replace with your UpdateReceiveLoadDone API
              const res = await dispatch(FinalSubmit(payload));
              console.log(res?.data?.message, "res");

              message.success(
                res?.data?.message || "✓ Receipt completed successfully",
              );

              dispatch(setScannedTyres([]));
              sessionStorage.removeItem("activeReceiveTransaction");
              setActiveTransactionId(null);
              setIsTransactionLocked(false);
              form.resetFields();
              setShowConfirmModal(false);
            } catch (err) {
              console.log(err);
              message.error(
                err?.message || err?.data?.message || "Failed to finalize",
              );
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
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
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
            style={{
              height: isMobile ? 36 : 40,
              borderRadius: 8,
              fontSize: isMobile ? 12 : 13,
            }}
          >
            Cancel
          </Button>
        </Form>
      </Modal>

      <style>{`
        .ant-table-row-highlight {
          background: linear-gradient(90deg, rgba(16, 185, 129, 0.08) 0%, transparent 100%) !important;
          animation: slideInTable 0.4s ease-out;
        }
        @keyframes slideInTable {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .ant-table-body { scrollbar-width: thin; scrollbar-color: #cbd5e1 #f1f5f9; }
        .ant-table-body::-webkit-scrollbar { width: 4px; }
        .ant-table-body::-webkit-scrollbar-track { background: #f1f5f9; }
        .ant-table-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
        .ant-table-body::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .ant-table-row:hover { background: linear-gradient(90deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%) !important; }
        .ant-descriptions-item-label { background: #f8fafc; font-weight: 600; color: #0f172a; font-size: ${isDesktop ? "14px" : "11px"}; padding: ${isDesktop ? "12px 16px" : "4px 8px"} !important; }
        .ant-descriptions-item-content { color: #1e293b; font-size: ${isDesktop ? "14px" : "11px"}; padding: ${isDesktop ? "12px 16px" : "4px 8px"} !important; }
        .ant-table-cell { padding: ${isDesktop ? "12px 16px" : "8px 12px"} !important; font-size: ${isDesktop ? "14px" : "12px"} !important; white-space: normal !important; word-break: break-word; }
        .ant-table-wrapper { width: 100%; max-width: 100%; overflow-x: auto; }
        .responsive-receive-table .ant-table { width: 100%; min-width: 640px; }
        .ant-card-body { padding: 12px !important; }
        @media (max-width: 768px) {
          .ant-card { border-radius: 8px !important; }
          .ant-btn { font-size: 11px !important; }
          .ant-input, .ant-input-number, .ant-select { font-size: 12px !important; }
          .ant-modal { max-width: 95vw !important; }
        }
        @media (hover: none) and (pointer: coarse) {
          .ant-btn, .ant-input, button, input, [role="button"] { min-height: 36px; }
        }
      `}</style>
    </Layout>
  );
}
