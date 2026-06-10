// RIMNavLink.jsx — add these imports
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { ConfigProvider, Menu, Modal, theme } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "antd/es/layout/layout";

const RIMNavLink = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  // ── Guard state ──────────────────────────────────────────────
  const [openScanModal, setOpenScanModal] = useState(false);
  const [openScanRefs, setOpenScanRefs] = useState([]);

  const transfers = useSelector((state) => state.warehouse.transfers);
  // console.log(transfers);
  

  const handleSendClick = () => {
    const inProgress = transfers.filter((t) => t.statusNo === 46); // scanning_in_progress

    if (inProgress.length > 0) {
      setOpenScanRefs(inProgress.map((t) => t.dcno));
      setOpenScanModal(true);
      return;
    }

    navigate("factory", { state: { type: "SEND", mode: "NEW" } });
  };
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const items = [
    {
      key: "PendingTransfer",
      label: "PendingTransfer",
      onClick: () => navigate("PendingTransfer"),
    },
    {
      key: "factory",
      label: "Send",
      onClick: handleSendClick, // ← was direct navigate, now guarded
    },
    { key: "warehouse", label: "Receive" },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Header
        className="flex items-center justify-between px-4 py-3 shadow-sm border-b transition-all duration-300"
        style={{
          height: "64px",
          backgroundColor: token.colorBgContainer,
          borderBottomColor: token.colorBorderSecondary,
          lineHeight: "64px",
        }}
      >
        <div className="flex items-center flex-1">
          <Menu
            mode="horizontal"
            theme={isDarkMode ? "dark" : "light"}
            selectedKeys={[location.pathname.split("/").pop() || "overview"]}
            items={items}
            className="border-none bg-transparent flex-1"
            style={{ minWidth: 0 }}
          />
        </div>
      </Header>

      {/* ── Open Scan Guard Modal ── */}
      <Modal
        open={openScanModal}
        title="Transfer Already In Progress"
        onCancel={() => setOpenScanModal(false)}
        onOk={() => {
          setOpenScanModal(false);
          navigate("factory", { state: { type: "SEND", mode: "NEW" } });
        }}
        okText="Continue Anyway"
        cancelText="Go Back"
        okButtonProps={{ danger: true }}
      >
        <p className="text-slate-700 mb-3">
          The following transfer{openScanRefs.length > 1 ? "s are" : " is"}{" "}
          currently open and scanning in progress:
        </p>
        <div className="space-y-2">
          {openScanRefs.map((ref) => (
            <div
              key={ref}
              className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg"
            >
              <WarningOutlined className="text-orange-500" />
              <span className="font-semibold text-slate-900">{ref}</span>
            </div>
          ))}
        </div>
        <p className="text-slate-500 text-sm mt-3">
          Do you still want to create a new transfer?
        </p>
      </Modal>
    </ConfigProvider>
  );
};

export default RIMNavLink;