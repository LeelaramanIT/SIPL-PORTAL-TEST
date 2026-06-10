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
  DeleteOutlined,
  CheckCircleOutlined,
  BarcodeOutlined,
  CarOutlined,
  ClearOutlined,
  SendOutlined,
  RadarChartOutlined,
  ClockCircleOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  GetFactoryRefNo,
  scanFactoryBarcode,
  setScannedTyres,
  InsertTransaction,
  UpdateLoadDone,
  GetTransactionById,
  setFactoryRefNo,
  GetFactoryWarehouseDetails,
} from "../../../Redux/Slices/Warehouse/WarehouseSlice";
import { platform } from "@floating-ui/react";

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

// Helper functions moved outside to prevent recreation
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

// Custom Hook for Responsive Behavior
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

// Sub-components moved outside to prevent recreation on every render
const ResponsiveHeader = memo(
  ({
    isMobile,
    isTablet,
    isDesktop,
    scannedTyresCount,
    completionPercentage,
    setMobileDrawerOpen,
    transferPlan,
    setTransferPlan,
    transferFrom,
    setTransferFrom,
    transferTo,
    setTransferTo,
    state,
    isTransactionLocked,
  }) => {
    const isReceive = state?.type === "RECEIVE";
    const isNewMode = state?.mode === "NEW";
    const isExistingMode = state?.mode === "EXISTING";
    const pageTitle = isReceive ? "Stock Receive" : "Stock Transfer";
    const subTitle = isReceive
      ? "📥 Warehouse Receiving"
      : "📤 Factory → Warehouse";
    const { LocationDetails } = useSelector((state) => state.auth);
    const { factoryRefNo, factoryWarehouseDetails } = useSelector(
      (state) => state.warehouse,
    );

    const dispatch = useDispatch();

    useEffect(() => {
      if (LocationDetails?.length > 0 && !transferPlan) {
        setTransferPlan(LocationDetails[0].locationName);
      }
    }, [LocationDetails, transferPlan]);

    const selectedPlantDetails = factoryWarehouseDetails?.find(
      (item) => item.plant === transferPlan,
    );

    // Responsive widths for select containers (increased for full dropdown display)
    const selectContainerWidth = isDesktop
      ? "220px"
      : isTablet
        ? "170px"
        : "100%";
    const selectFontSize = isDesktop ? 14 : isTablet ? 13 : 11;
    const refFontSize = isDesktop ? 18 : isTablet ? 16 : 14;

    return (
      <Header
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
          height: "auto",
          minHeight: isMobile ? "auto" : "80px",
          padding: isMobile
            ? "12px 16px"
            : isTablet
              ? "12px 20px"
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
          gutter={isMobile ? 8 : isTablet ? 10 : 14}
          style={{ width: "100%" }}
          wrap={false}
        >
          {/* Title Section */}
          <Col
            flex={isMobile ? "auto" : isTablet ? "190px" : "170px"}
            style={{ minWidth: 0, flexShrink: 0 }}
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
                    fontSize: isMobile ? 15 : isTablet ? 17 : 19,
                    lineHeight: 1.2,
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
                    fontSize: isMobile ? 10 : isTablet ? 11 : 12,
                    color: "#64748b",
                    letterSpacing: 0.2,
                    textTransform: "uppercase",
                    fontWeight: 500,
                    marginTop: 2,
                    whiteSpace: "nowrap",
                  }}
                >
                  {subTitle}
                </Text>
              </Space>
            </motion.div>
          </Col>

          {/* Transfer Selects (Desktop/Tablet only) */}
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
                wrap={false}
                style={{ marginLeft: 0 }}
              >
                <Col
                  style={{
                    width: selectContainerWidth,
                    minWidth: selectContainerWidth,
                    maxWidth: selectContainerWidth,
                    flexShrink: 0,
                  }}
                >
                  <Select
                    size="small"
                    placeholder="Select Plan"
                    style={{
                      width: "100%",
                      fontSize: selectFontSize,
                      height: isDesktop ? 34 : 30,
                    }}
                    value={transferPlan}
                    onChange={setTransferPlan}
                    disabled={isTransactionLocked || isExistingMode}
                    options={factoryWarehouseDetails?.map((item) => ({
                      value: item.plant,
                      label: `${item.plant} - ${item.factoryDetails}`,
                    }))}
                    dropdownMatchSelectWidth={false}
                    dropdownStyle={{
                      minWidth: selectContainerWidth,
                      maxWidth: "300px",
                    }}
                  />
                </Col>
                <Col
                  style={{
                    width: selectContainerWidth,
                    minWidth: selectContainerWidth,
                    maxWidth: selectContainerWidth,
                    flexShrink: 0,
                  }}
                >
                  <Select
                    size="small"
                    placeholder="From Location"
                    style={{
                      width: "100%",
                      fontSize: selectFontSize,
                      height: isDesktop ? 34 : 30,
                    }}
                    value={transferFrom}
                    onChange={setTransferFrom}
                    disabled={isTransactionLocked || isExistingMode}
                    options={
                      selectedPlantDetails
                        ? [
                            {
                              value: selectedPlantDetails.factoryDetails,
                              label: selectedPlantDetails.factoryDetails,
                            },
                          ]
                        : []
                    }
                    dropdownMatchSelectWidth={false}
                    dropdownStyle={{
                      minWidth: selectContainerWidth,
                      maxWidth: "300px",
                    }}
                  />
                </Col>
                <Col
                  style={{
                    width: selectContainerWidth,
                    minWidth: selectContainerWidth,
                    maxWidth: selectContainerWidth,
                    flexShrink: 0,
                  }}
                >
                  <Select
                    size="small"
                    placeholder="To Location"
                    style={{
                      width: "100%",
                      fontSize: selectFontSize,
                      height: isDesktop ? 34 : 30,
                    }}
                    value={transferTo}
                    onChange={setTransferTo}
                    disabled={isTransactionLocked || isExistingMode}
                    options={
                      selectedPlantDetails?.warehouses?.map((warehouse) => ({
                        value: warehouse,
                        label: warehouse,
                      })) || []
                    }
                    dropdownMatchSelectWidth={false}
                    dropdownStyle={{
                      minWidth: selectContainerWidth,
                      maxWidth: "300px",
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
                          "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
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
                        REF #
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
                        {factoryRefNo}
                      </Text>
                    </div>
                  </motion.div>
                </Col>
              </Row>
            </Col>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <Col style={{ flexShrink: 0 }}>
              <Button
                type="text"
                icon={<MenuOutlined style={{ fontSize: 20 }} />}
                onClick={() => setMobileDrawerOpen(true)}
                style={{ fontSize: 16 }}
              />
            </Col>
          )}
        </Row>

        {/* Mobile Selects */}
        {isMobile && (
          <Row
            gutter={6}
            style={{ marginTop: 10, width: "100%" }}
            align="middle"
            wrap={false}
          >
            <Col span={8} style={{ minWidth: 0 }}>
              <Select
                size="small"
                placeholder="Plant"
                disabled={isTransactionLocked}
                style={{ width: "100%", fontSize: 11 }}
                value={transferPlan}
                onChange={setTransferPlan}
                options={factoryWarehouseDetails?.map((item) => ({
                  value: item.plant,
                  label: `${item.plant} - ${item.factoryDetails}`,
                }))}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ minWidth: "120px" }}
              />
            </Col>
            <Col span={8} style={{ minWidth: 0 }}>
              <Select
                size="small"
                placeholder="From"
                disabled={isTransactionLocked}
                style={{ width: "100%", fontSize: 11 }}
                value={transferFrom}
                onChange={setTransferFrom}
                options={
                  selectedPlantDetails
                    ? [
                        {
                          value: selectedPlantDetails.factoryDetails,
                          label: selectedPlantDetails.factoryDetails,
                        },
                      ]
                    : []
                }
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ minWidth: "120px" }}
              />
            </Col>
            <Col span={8} style={{ minWidth: 0 }}>
              <Select
                size="small"
                disabled={isTransactionLocked}
                placeholder="To"
                style={{ width: "100%", fontSize: 11 }}
                value={transferTo}
                onChange={setTransferTo}
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
    transferPlan,
    transferFrom,
    transferTo,
    groupedTyres,
    tableLoading,
    addLoading,
  }) => {
    const isSelectionMissing = !transferPlan || !transferFrom || !transferTo;

    if (isMobile) {
      return (
        <Content
          style={{
            flex: 1,
            padding: "8px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
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
                    : "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
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

            <AnimatePresence>
              {previewTyre && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Card
                    style={{
                      background:
                        "linear-gradient(135deg, #f0f4f8 0%, #ffffff 100%)",
                      borderRadius: 12,
                      border: "2px solid #3b82f6",
                      boxShadow: "0 10px 20px rgba(59, 130, 246, 0.1)",
                      overflow: "hidden",
                    }}
                    bodyStyle={{ padding: 0 }}
                  >
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                        padding: "12px",
                        color: "white",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text strong style={{ color: "white", fontSize: 13 }}>
                        Details
                      </Text>
                      <Tag color="gold" style={{ fontSize: 11 }}>
                        Pending
                      </Tag>
                    </div>

                    <div style={{ padding: "12px" }}>
                      <div style={{ marginBottom: 8 }}>
                        <Text type="secondary" style={{ fontSize: 10 }}>
                          Brand
                        </Text>
                        <Text strong style={{ display: "block", fontSize: 13 }}>
                          {previewTyre.brand}
                        </Text>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <Text type="secondary" style={{ fontSize: 10 }}>
                          Size
                        </Text>
                        <Text strong style={{ display: "block", fontSize: 13 }}>
                          {previewTyre.size}
                        </Text>
                      </div>
                      <div>
                        <Text type="secondary" style={{ fontSize: 10 }}>
                          Category
                        </Text>
                        <Tag style={{ display: "block", marginTop: 4 }}>
                          {previewTyre.category}
                        </Tag>
                      </div>

                      <Row gutter={6} style={{ marginTop: 12 }}>
                        <Col span={12}>
                          <Button
                            block
                            size="small"
                            onClick={() => setPreviewTyre(null)}
                            style={{
                              height: 36,
                              borderRadius: 6,
                              fontSize: 12,
                            }}
                          >
                            Discard
                          </Button>
                        </Col>
                        <Col span={12}>
                          <Button
                            type="primary"
                            block
                            size="small"
                            onClick={saveTyre}
                            loading={addLoading}
                            style={{
                              background:
                                "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                              border: "none",
                              height: 36,
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            Add
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

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
                  <Table // Mobile
                    className="responsive-transfer-table"
                    loading={tableLoading}
                    columns={columns}
                    dataSource={(Array.isArray(scannedTyres)
                      ? scannedTyres
                      : []
                    ).map((tyre, index) => ({
                      ...tyre,
                      key: index,
                    }))}
                    pagination={false}
                    size="small"
                    showHeader={false}
                    scroll={{ x: 1060 }}
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
                    "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
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
                      READY
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
                        background: "#10b981",
                        border: "none",
                        height: 36,
                        paddingLeft: 12,
                        paddingRight: 12,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      Submit
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
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
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
                              color: "#3b82f6",
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
                        : "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                      border: "none",
                      height: isDesktop ? 42 : 32,
                      fontSize: isDesktop ? 14 : 12,
                      fontWeight: 600,
                      borderRadius: 8,
                    }}
                  >
                    Manual Scan
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
                        border: "2px solid #3b82f6",
                        boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.1)",
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
                            "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
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
                            color="#3b82f6"
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
                              Sidewall
                            </Text>
                          }
                        >
                          <Badge
                            color="#3b82f6"
                            text={
                              <Text
                                strong
                                style={{ fontSize: isDesktop ? 14 : 12 }}
                              >
                                {previewTyre.sidewall}
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
                              Discard
                            </Button>
                          </Col>
                          <Col span={12}>
                            <Button
                              type="primary"
                              block
                              onClick={saveTyre}
                              loading={addLoading}
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
                              Add
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
                            Ready to scan
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
            style={{ display: "flex", flexDirection: "column", minHeight: 0 }}
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
                      "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
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
                      Transfer List
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
                      TOTAL
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
                  <Table // table
                    className="responsive-transfer-table"
                    loading={tableLoading}
                    columns={columns}
                    dataSource={groupedTyres.map((item, index) => ({
                      ...item,
                      key: index,
                    }))}
                    pagination={false}
                    size={isDesktop ? "middle" : "small"}
                    scroll={
                      isDesktop
                        ? {
                            y: "calc(100vh - 320px)",
                          }
                        : {
                            x: 1060,
                            y: `calc(100vh - ${isTablet ? "260px" : "280px"})`,
                          }
                    }
                    locale={{
                      emptyText: (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={
                            <Text
                              type="secondary"
                              style={{ fontSize: isDesktop ? 14 : 12 }}
                            >
                              No items scanned yet
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
                  ? "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)"
                  : "#cbd5e1",
            }}
          />
          <Text strong>
            {scannedTyresCount > 0 ? "Ready for Transfer" : "Awaiting Items"}
          </Text>
        </Text>

        <div
          style={{ display: "flex", gap: 8, width: isMobile ? "100%" : "auto" }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ flex: isMobile ? 1 : "auto", display: "flex" }}
          >
              {/* <Button
                icon={<ClearOutlined />}
                onClick={() => {
                  dispatch(setScannedTyres([]));

                  sessionStorage.removeItem("activeFactoryTransfer");

                  setActiveTransactionId(null);

                  setIsTransactionLocked(false);

                  dispatch(GetFactoryRefNo(transferPlan));

                  message.info("Cleared");
                }}
                disabled={scannedTyresCount === 0}
                style={{
                  height: isDesktop ? 40 : 32,
                  borderRadius: 6,
                  width: isMobile ? "100%" : "auto",
                  fontSize: isDesktop ? 14 : 12,
                }}
                size={isDesktop ? "middle" : "small"}
              >
                {isMobile ? "Clear" : "Clear All"}
              </Button> */}
          </motion.div>

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
              {isMobile ? "Submit" : `Submit (${scannedTyresCount})`}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    );
  },
);

export default function TyreStockTransferRedesign() {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  // const [scannedTyres, setScannedTyres] = useState([]);
  const [previewTyre, setPreviewTyre] = useState(null);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scanStatus, setScanStatus] = useState("ready");
  const [lastScannedTime, setLastScannedTime] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [transferPlan, setTransferPlan] = useState(null);
  const [transferFrom, setTransferFrom] = useState(null);
  const [transferTo, setTransferTo] = useState(null);
  const [isTransactionLocked, setIsTransactionLocked] = useState(false);
  const [activeTransactionId, setActiveTransactionId] = useState(null);
  const [isRestoring, setIsRestoring] = useState(true);

  const { state } = useLocation();
  const { LocationDetails } = useSelector((state) => state.auth);
  const { factoryRefNo } = useSelector((state) => state.warehouse);
  const scannedTyres = useSelector((state) =>
    Array.isArray(state.warehouse.scannedTyres)
      ? state.warehouse.scannedTyres
      : [],
  );
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const transferData = state?.transferData;
  const [tableLoading, setTableLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  console.log("transferData", transferData);
  console.log("scannedTyres", scannedTyres);

  useEffect(() => {
    dispatch(GetFactoryWarehouseDetails());
  }, []);

  useEffect(() => {
    if (state?.mode === "EXISTING" && transferData) {
      setIsTransactionLocked(true);

      setActiveTransactionId(transferData.tM_ID);

      setTransferFrom(transferData.from);

      setTransferTo(transferData.to);

      dispatch(setFactoryRefNo(transferData.id));

      if (transferData.plant) {
        setTransferPlan(transferData.plant);
      }

      dispatch(
        GetTransactionById(transferData.tM_ID, transferData.statusNo),
      ).then((res) => {
        const items = res?.data?.data || [];

        dispatch(setScannedTyres(items));
      });
    }
  }, [state]);

  useEffect(() => {
    if (LocationDetails?.length > 0 && !transferPlan) {
      setTransferPlan(LocationDetails[0].locationName);
    }
  }, [LocationDetails, transferPlan]);

  useEffect(() => {
    if (transferPlan && !activeTransactionId && isRestoring === false) {
      dispatch(GetFactoryRefNo(transferPlan));
    }
  }, [transferPlan, activeTransactionId, isRestoring]);

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleScan = useCallback(async () => {
    if (!transferPlan || !transferFrom || !transferTo) {
      message.warning("⚠ Please select Plan, From, and To locations first");
      return;
    }

    if (!barcodeInput.trim()) {
      message.error("Please scan a barcode");
      return;
    }

    if (
      Array.isArray(scannedTyres) &&
      scannedTyres.some((t) => t.barcode === barcodeInput)
    ) {
      setScanStatus("duplicate");
      message.warning("Barcode already scanned");
      setBarcodeInput("");
      return;
    }

    setScanStatus("scanning");
    setIsScanning(true);
    setTableLoading(true);

    try {
      const payload = {
        barcode: barcodeInput,
        stencilNo: barcodeInput.slice(8, -1),
        plant: transferPlan,
      };

      const res = await dispatch(scanFactoryBarcode(payload));

      const data = res.data?.data;

      if (!data) {
        message.error("No data found");
        return;
      }

      const tyreData = {
        id: data.id,
        barcode: data.barcode,
        config: data.config,
        tyreSize: data.tyresize,
        rimSize: data.rimsize,
        tyreType: data.tyretype,
        brand: data.brand,
        sidewall: data.sidewall,
        processID: data.processID,
        stencilNo: data.stencilno,
        grade: data.grade,
      };

      setPreviewTyre(tyreData);

      setScanStatus("success");
      setLastScannedTime(new Date());
      setBarcodeInput("");

      setTimeout(() => {
        setScanStatus("ready");
      }, 1500);
    } catch (err) {
      message.error(err?.response?.data?.message || "Scan failed");
      setScanStatus("ready");
    } finally {
      setIsScanning(false);
      setTableLoading(false);
    }
  }, [barcodeInput, scannedTyres, transferPlan]);

  useEffect(() => {
    // CLEAR OLD DATA FOR NEW SEND MODE
    if (state?.mode !== "EXISTING") {
      dispatch(setScannedTyres([]));

      sessionStorage.removeItem("activeFactoryTransfer");

      setActiveTransactionId(null);

      setIsTransactionLocked(false);
    }
  }, []);

  const saveTyre = useCallback(async () => {
    if (!previewTyre) return;

    try {
      setAddLoading(true);
      setTableLoading(true);

      const payload = {
        dcno: factoryRefNo,
        usename: "ADMIN",
        plant: transferPlan,
        pwD_ID: previewTyre.id,
        barcode: previewTyre.barcode,
        processID: previewTyre.processID,
        stencilNo: previewTyre.stencilNo,
        grade: previewTyre.grade,
        factoryUser: "ADMIN",
        send: transferFrom,
        recevie: transferTo,
        config: previewTyre.config,
        tyreSize: previewTyre.tyreSize,
        rimSize: previewTyre.rimSize,
        tyreType: previewTyre.tyreType,
        brand: previewTyre.brand,
        sidewall: previewTyre.sidewall,
      };

      const res = await dispatch(InsertTransaction(payload));

      const data = res?.data?.data;

      let currentTransactionId = activeTransactionId;

      if (!activeTransactionId && data?.tM_ID) {
        currentTransactionId = data.tM_ID;

        setActiveTransactionId(data.tM_ID);
        setIsTransactionLocked(true);
      }

      const updated = await dispatch(
        GetTransactionById(currentTransactionId, transferData?.statusNo || 46),
      );

      dispatch(setScannedTyres(updated?.data?.data || []));

      setPreviewTyre(null);

      message.success("✓ Tyre added successfully");

      inputRef.current?.focus();
    } catch (err) {
      setScanStatus("duplicate");

      message.error(err?.response?.data?.message || "Add failed");

      setTimeout(() => {
        setScanStatus("ready");
      }, 2000);
    } finally {
      setAddLoading(false);
      setTableLoading(false);
    }
  }, [
    previewTyre,
    transferPlan,
    transferFrom,
    transferTo,
    factoryRefNo,
    activeTransactionId,
  ]);

  const deleteTyre = useCallback(
    (index) => {
      const updatedTyres = scannedTyres.filter((_, i) => i !== index);

      dispatch(setScannedTyres(updatedTyres));

      message.info("Tyre removed");
    },
    [scannedTyres],
  );

  const groupedTyres = useMemo(() => {
    const grouped = {};
    console.log("------------------------------", scannedTyres);

    scannedTyres.forEach((item) => {
      const key = item.processID;

      if (!grouped[key]) {
        grouped[key] = {
          config: item.config,
          barcode: item.barcode,
          stencilNo: item.stencilNo,
          grade: item.grade,
          sideWall: item.sideWall,
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
    const responsiveTextStyle = {
      fontSize: isDesktop ? 14 : 11,
      whiteSpace: "normal",
      overflowWrap: "anywhere",
      wordBreak: "break-word",
      lineHeight: 1.35,
    };

    const responsiveTagStyle = {
      fontSize: isDesktop ? 13 : 10,
      margin: 0,
      whiteSpace: "normal",
      overflowWrap: "anywhere",
      wordBreak: "break-word",
      lineHeight: 1.25,
      maxWidth: "100%",
    };

    const stockColumns = [
      {
        title: "Platform",
        dataIndex: "config",
        width: 140,
        render: (text) => (
          <Text strong style={responsiveTextStyle}>
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
            style={responsiveTagStyle}
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
            style={responsiveTagStyle}
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
          <span style={responsiveTextStyle}>{text}</span>
        ),
      },
      {
        title: "Rim Size",
        dataIndex: "rimSize",
        width: 100,
        render: (text) => (
          <Text style={responsiveTextStyle}>{text}</Text>
        ),
      },

      {
        title: "Tyre Type",
        dataIndex: "tyreType",
        width: 120,
        render: (text) => (
          <Tag
            color="cyan"
            style={responsiveTagStyle}
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
          <Text strong style={responsiveTextStyle}>
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
            style={responsiveTagStyle}
          >
            {text}
          </Tag>
        ),
      },
      {
        title: "Qty",
        dataIndex: "qty",
        width: isDesktop ? 100 : 70,
        fixed: isDesktop ? undefined : "right",
        align: "center",
        render: (text) => <Tag color="green">{text || 1}</Tag>,
      },
    ];

    return stockColumns;
  }, [isDesktop]);

  const completionPercentage = Math.min(
    ((scannedTyres.length || 0) / Math.max(scannedTyres.length || 1, 10)) * 100,
    100,
  );

  const restoreTransaction = async () => {
    try {
      setIsRestoring(true);

      const saved = sessionStorage.getItem("activeFactoryTransfer");

      // NO ACTIVE TRANSACTION
      if (!saved) {
        return;
      }

      const parsed = JSON.parse(saved);
      dispatch(setFactoryRefNo(parsed.refNo));

      // CALL DB
      const res = await dispatch(GetTransactionById(parsed.transactionId));

      const data = res?.data?.data;

      // INVALID TRANSACTION
      if (!data) {
        sessionStorage.removeItem("activeFactoryTransfer");

        dispatch(GetFactoryRefNo(transferPlan));

        return;
      }

      // RESTORE UI
      setActiveTransactionId(data.id);

      setTransferPlan(parsed.plant);

      setTransferFrom(parsed.from);

      setTransferTo(parsed.to);

      setIsTransactionLocked(true);

      // RESTORE ITEMS
      dispatch(setScannedTyres(Array.isArray(data?.items) ? data.items : []));
    } catch (err) {
      console.log(err);
    } finally {
      setIsRestoring(false);
    }
  };
  useEffect(() => {
    restoreTransaction();
  }, []);

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
        transferPlan={transferPlan}
        setTransferPlan={setTransferPlan}
        transferFrom={transferFrom}
        setTransferFrom={setTransferFrom}
        transferTo={transferTo}
        setTransferTo={setTransferTo}
        state={state}
        isTransactionLocked={isTransactionLocked}
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
        previewTyre={previewTyre}
        setPreviewTyre={setPreviewTyre}
        saveTyre={saveTyre}
        scannedTyres={scannedTyres}
        setShowConfirmModal={setShowConfirmModal}
        columns={columns}
        transferPlan={transferPlan}
        transferFrom={transferFrom}
        transferTo={transferTo}
        groupedTyres={groupedTyres}
        tableLoading={tableLoading}
        addLoading={addLoading}
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
          title="Transfer Details"
          placement="right"
          onClose={() => setMobileDrawerOpen(false)}
          open={mobileDrawerOpen}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>
                REFERENCE NUMBER
              </Text>
              <Text
                code
                style={{ display: "block", marginTop: 4, fontSize: 14 }}
              >
                {factoryRefNo}
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
                {scannedTyres.length} of 10 items scanned
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
              Submit Transfer
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
            Finalize Transfer
          </Title>
          <Text
            style={{
              color: "rgba(255,255,255,0.9)",
              display: "block",
              marginTop: 6,
              fontSize: isMobile ? 12 : 13,
            }}
          >
            {scannedTyres.length} items ready
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
                vehicleNo: values.vehicleNumber,
              };
              console.log(payload, "payload");

              const res = await dispatch(UpdateLoadDone(payload));
              console.log(res?.data?.message, "res");

              message.success(
                res?.data?.message || "✓ Load completed successfully",
              );

              dispatch(setScannedTyres([]));

              sessionStorage.removeItem("activeFactoryTransfer");

              setActiveTransactionId(null);

              setIsTransactionLocked(false);

              dispatch(GetFactoryRefNo(transferPlan));
              message.info("Cleared");

              form.resetFields();

              setShowConfirmModal(false);
            } catch (err) {
              console.log(err);

              message.error(
                err?.message || err?.data?.message || "Failed to submit",
              );
            } finally {
              setIsSubmitting(false);
            }
          }}
          style={{ padding: isMobile ? "16px" : "24px" }}
        >
          <Form.Item
            label={<Text strong>Vehicle Number</Text>}
            name="vehicleNumber"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input
              size="large"
              prefix={<CarOutlined />}
              placeholder="e.g., TN-01-AB-1234"
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
              Confirm & Dispatch
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
          background: linear-gradient(90deg, rgba(59, 130, 246, 0.08) 0%, transparent 100%) !important;
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
        .ant-table-row:hover { background: linear-gradient(90deg, rgba(59, 130, 246, 0.05) 0%, transparent 100%) !important; }
        .ant-descriptions-item-label { background: #f8fafc; font-weight: 600; color: #0f172a; font-size: ${isDesktop ? "14px" : "11px"}; padding: ${isDesktop ? "12px 16px" : "4px 8px"} !important; }
        .ant-descriptions-item-content { color: #1e293b; font-size: ${isDesktop ? "14px" : "11px"}; padding: ${isDesktop ? "12px 16px" : "4px 8px"} !important; }
        .ant-table-cell { padding: ${isDesktop ? "12px 16px" : "8px 12px"} !important; font-size: ${isDesktop ? "14px" : "12px"} !important; }
        .ant-card-body { padding: 12px !important; }
        @media (max-width: 1024px) {
          .responsive-transfer-table .ant-table-container,
          .responsive-transfer-table .ant-table-content,
          .responsive-transfer-table .ant-table-body {
            overflow-x: auto !important;
          }
          .responsive-transfer-table .ant-table-cell {
            white-space: normal !important;
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
            vertical-align: top !important;
          }
          .responsive-transfer-table .ant-table-cell-fix-right {
            white-space: nowrap !important;
            vertical-align: middle !important;
          }
          .responsive-transfer-table .ant-btn {
            min-width: 36px;
            min-height: 36px;
          }
        }
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
