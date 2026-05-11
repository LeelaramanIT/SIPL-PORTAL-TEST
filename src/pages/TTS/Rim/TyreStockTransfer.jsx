import React, { useState, useCallback, useEffect, useRef } from "react";
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
} from "antd";

import {
  ScanOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  BarcodeOutlined,
  CarOutlined,
  ClearOutlined,
  SendOutlined,
} from "@ant-design/icons";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function TyreStockTransferRedesign() {
  const [scannedTyres, setScannedTyres] = useState([]);
  const [previewTyre, setPreviewTyre] = useState(null);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceNumber] = useState(generateReferenceNumber());

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleScan = useCallback(async () => {
    if (!barcodeInput.trim()) {
      message.error("Please scan barcode");
      return;
    }
    if (scannedTyres.some((t) => t.barcode === barcodeInput)) {
      message.error("Barcode already scanned");
      return;
    }

    setIsScanning(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const tyreData = {
        barcode: barcodeInput,
        tyreNumber: `TYR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        brand: ["Michelin", "Bridgestone", "Continental", "Goodyear"][Math.floor(Math.random() * 4)],
        size: ["195/65R15", "205/55R16", "215/60R17"][Math.floor(Math.random() * 3)],
        pattern: "All Season",
        batchNumber: `BT-${Math.floor(Math.random() * 10000)}`,
        manufacturingDate: "2026-01-10",
      };
      setPreviewTyre(tyreData);
      setBarcodeInput("");
    } catch (err) {
      message.error("Scan failed");
    } finally {
      setIsScanning(false);
    }
  }, [barcodeInput, scannedTyres]);

  const saveTyre = useCallback(() => {
    if (!previewTyre) return;
    const tyre = { ...previewTyre, scanTime: new Date().toLocaleTimeString() };
    setScannedTyres((prev) => [tyre, ...prev]); // Newest on top
    setPreviewTyre(null);
    message.success("Tyre added");
    inputRef.current?.focus();
  }, [previewTyre]);

  const columns = [
    { title: "Barcode", dataIndex: "barcode", width: 120 },
    { title: "Tyre No.", dataIndex: "tyreNumber", width: 120 },
    { title: "Brand", dataIndex: "brand", render: (t) => <Tag color="blue">{t}</Tag> },
    { title: "Size", dataIndex: "size" },
    {
      title: "",
      width: 50,
      render: (_, __, index) => (
        <Button 
          danger 
          type="text" 
          icon={<DeleteOutlined />} 
          onClick={() => setScannedTyres(prev => prev.filter((_, i) => i !== index))} 
        />
      ),
    },
  ];

  return (
    <Layout style={{ height: "82vh", overflow: "hidden", background: "#f0f2f5"  }}>
      {/* HEADER: Compact height */}
      <Header style={{ 
        background: "#fff", 
        height: 64, 
        padding: "0 20px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        borderBottom: "1px solid #d9d9d9"
      }}>
        <Space direction="vertical" size={0} style={{ lineHeight: 1.2 }}>
          <Title level={4} style={{ margin: 0 }}>Stock Transfer</Title>
          <Text type="secondary" style={{ fontSize: 12 }}>Factory → Warehouse</Text>
        </Space>
        
        <Space size="large">
          <Badge status="processing" text={<Text strong>{referenceNumber}</Text>} />
          <Divider type="vertical" />
          <StatisticItem label="" value={scannedTyres.length} color="#1677ff" />
        </Space>
      </Header>

      <Content style={{ height: "calc(100vh - 124px)", padding: 16, overflow: "hidden" }}>
        <Row gutter={16} style={{ height: "100%" }}>
          
          {/* LEFT: SCAN & PREVIEW */}
          <Col span={8} style={{ height: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
            <Card title="Scanner" size="small" style={{ borderRadius: 12 }}>
              <Input
                ref={inputRef}
                size="large"
                value={barcodeInput}
                placeholder="Scan Barcode..."
                prefix={<BarcodeOutlined />}
                onPressEnter={handleScan}
                onChange={(e) => setBarcodeInput(e.target.value)}
                suffix={isScanning && <ScanOutlined spin />}
              />
              <Button type="primary" block size="large" onClick={handleScan} style={{ marginTop: 12, borderRadius: 8 }}>
                Manual Scan
              </Button>
            </Card>

            <div style={{ flex: 1, overflowY: "auto" }}>
              <AnimatePresence mode="wait">
                {previewTyre ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <Card 
                      title="Item Details" 
                      size="small" 
                      extra={<Tag color="green">Pending Save</Tag>}
                      style={{ borderRadius: 12, border: "1px solid #91caff" }}
                    >
                      <Descriptions column={1} size="small" bordered>
                        <Descriptions.Item label="Brand">{previewTyre.brand}</Descriptions.Item>
                        <Descriptions.Item label="Size">{previewTyre.size}</Descriptions.Item>
                        <Descriptions.Item label="Batch">{previewTyre.batchNumber}</Descriptions.Item>
                      </Descriptions>
                      <Row gutter={8} style={{ marginTop: 16 }}>
                        <Col span={12}><Button block onClick={() => setPreviewTyre(null)}>Discard</Button></Col>
                        <Col span={12}><Button type="primary" block onClick={saveTyre}>Add to List</Button></Col>
                      </Row>
                    </Card>
                  </motion.div>
                ) : (
                  <Card style={{ textAlign: "center", borderRadius: 12, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Empty description="Waiting for scan..." image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  </Card>
                )}
              </AnimatePresence>
            </div>
          </Col>

          {/* RIGHT: LIST */}
          <Col span={16} style={{ height: "100%" }}>
            <Card 
              title="Transfer List" 
              size="small"
              bodyStyle={{ padding: 0 }} 
              style={{ height: "100%", borderRadius: 12, overflow: "hidden" }}
            >
              <Table
                columns={columns}
                dataSource={scannedTyres}
                pagination={false}
                size="small"
                scroll={{ y: "calc(100vh - 280px)" }} // Adjust based on header/footer
                locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Scan a tyre to begin" /> }}
              />
            </Card>
          </Col>
        </Row>
      </Content>

      {/* FOOTER: Fixed height Action Bar */}
      <div style={{ 
        height: 60, 
        background: "#fff", 
        borderTop: "1px solid #d9d9d9", 
        padding: "0 24px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between" 
      }}>
        <Space size="large">
           <Text type="secondary">Status: <Tag color={scannedTyres.length > 0 ? "processing" : "default"}>Ready</Tag></Text>
        </Space>
        
        <Space>
          <Button icon={<ClearOutlined />} onClick={() => setScannedTyres([])} disabled={scannedTyres.length === 0}>
            Clear
          </Button>
          <Button 
            type="primary" 
            size="large" 
            icon={<SendOutlined />} 
            onClick={() => setShowConfirmModal(true)}
            disabled={scannedTyres.length === 0}
            style={{ minWidth: 180, borderRadius: 8 }}
          >
            Submit Transfer ({scannedTyres.length})
          </Button>
        </Space>
      </div>

      {/* MODAL (Unchanged logic) */}
      <Modal open={showConfirmModal} onCancel={() => setShowConfirmModal(false)} footer={null} centered>
          <Form layout="vertical" onFinish={(v) => { setIsSubmitting(true); setTimeout(() => { message.success("Success"); setScannedTyres([]); setShowConfirmModal(false); setIsSubmitting(false); }, 1000); }}>
            <Title level={4}>Finalize Transfer</Title>
            <Form.Item label="Vehicle Number" name="vehicleNumber" rules={[{ required: true }]}>
              <Input size="large" prefix={<CarOutlined />} placeholder="EX: TN-01-AB-1234" />
            </Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={isSubmitting}>Confirm & Dispatch</Button>
          </Form>
      </Modal>
    </Layout>
  );
}

// Sub-component for cleaner header
const StatisticItem = ({ label, value, color }) => (
  <div style={{ textAlign: 'right' }}>
    <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{label}</Text>
    <Text strong style={{ fontSize: 18, color }}>{value}</Text>
  </div>
);

function generateReferenceNumber() {
  return `TRF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
}