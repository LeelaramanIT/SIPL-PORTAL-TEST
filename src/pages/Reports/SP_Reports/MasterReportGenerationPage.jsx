import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  Table,
  Input,
  Button,
  Select,
  Dropdown,
  Checkbox,
  Tooltip,
  Badge,
  Segmented,
  Skeleton,
  Empty,
  Space,
  Tag,
  Slider,
  Radio,
  DatePicker,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  ColumnHeightOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  SettingOutlined,
  FilterOutlined,
  CloseCircleOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { api } from "../../../utils/axios";

const { Option } = Select;
const { RangePicker } = DatePicker;

const FILTER_TYPES = {
  TEXT: "text",
  NUMBER: "number",
  DATE: "date",
  BOOLEAN: "boolean",
  MULTI_SELECT: "multi_select",
  SINGLE_SELECT: "single_select",
};

// Enhanced column type detection
const detectColumnType = (values) => {
  if (values.length === 0) return FILTER_TYPES.TEXT;

  const numbers = values.filter(
    (v) => !isNaN(Number(v)) && Number(v) !== "",
  ).length;
  const dates = values.filter((v) => dayjs(v).isValid()).length;
  const booleans = values.filter(
    (v) => v === true || v === false || v === "true" || v === "false",
  ).length;

  if (numbers / values.length > 0.8) return FILTER_TYPES.NUMBER;
  if (dates / values.length > 0.5) return FILTER_TYPES.DATE;
  if (booleans === values.length) return FILTER_TYPES.BOOLEAN;

  const uniqueCount = new Set(values.map(String)).size;
  if (uniqueCount <= 10) return FILTER_TYPES.SINGLE_SELECT;
  if (uniqueCount <= 50) return FILTER_TYPES.MULTI_SELECT;

  return FILTER_TYPES.TEXT;
};

// ==================== ENHANCED FILTER COMPONENTS ====================
const TextFilter = ({
  columnKey,
  values,
  selectedValues,
  onChange,
  onClear,
}) => {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () =>
      values.filter((v) =>
        String(v || "")
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [values, search],
  );

  return (
    <div className="p-3 space-y-2 w-80">
      <Input
        placeholder="Search values..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        prefix={<SearchOutlined />}
        size="small"
      />
      <div className="max-h-48 overflow-auto space-y-1">
        {filtered.slice(0, 20).map((value, idx) => (
          <Tag
            key={idx}
            className={`cursor-pointer ${selectedValues.includes(value) ? "bg-blue-500" : "bg-gray-100 hover:bg-gray-200"}`}
            onClick={() => {
              const next = selectedValues.includes(value)
                ? selectedValues.filter((v) => v !== value)
                : [...selectedValues, value];
              onChange(columnKey, next);
            }}
          >
            {String(value)}
          </Tag>
        ))}
      </div>
      <div className="flex justify-between pt-2 border-t">
        <Button size="small" onClick={() => onClear(columnKey)}>
          Clear
        </Button>
        <Button type="primary" size="small">
          Apply
        </Button>
      </div>
    </div>
  );
};

const NumberFilter = ({
  columnKey,
  values,
  selectedRange,
  onChange,
  onClear,
}) => {
  const minVal = Math.min(...values.filter(Number));
  const maxVal = Math.max(...values.filter(Number));

  return (
    <div className="p-3 w-72 space-y-3">
      <Slider
        range
        min={minVal}
        max={maxVal}
        value={selectedRange}
        onChange={(range) => onChange(columnKey, range)}
        tooltip={{ formatter: (value) => `${value.toLocaleString()}` }}
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{minVal.toLocaleString()}</span>
        <span>{maxVal.toLocaleString()}</span>
      </div>
      <div className="flex justify-between pt-2 border-t">
        <Button size="small" onClick={() => onClear(columnKey)}>
          Clear
        </Button>
        <Button type="primary" size="small">
          Apply
        </Button>
      </div>
    </div>
  );
};

const DateFilter = ({ columnKey, selectedRange, onChange, onClear }) => {
  return (
    <div className="p-3 w-72 space-y-3">
      <RangePicker
        value={selectedRange?.map((d) => dayjs(d))}
        onChange={(dates) =>
          onChange(columnKey, dates?.map((d) => d.toISOString()) || [])
        }
        className="w-full"
      />
      <div className="flex justify-between pt-2 border-t">
        <Button size="small" onClick={() => onClear(columnKey)}>
          Clear
        </Button>
        <Button type="primary" size="small">
          Apply
        </Button>
      </div>
    </div>
  );
};

const BooleanFilter = ({ columnKey, onChange, selectedValue, onClear }) => {
  return (
    <div className="p-3 w-64 space-y-2">
      <Radio.Group
        value={selectedValue}
        onChange={(e) => onChange(columnKey, e.target.value)}
        className="space-y-2"
      >
        <Radio value={true}>True</Radio>
        <Radio value={false}>False</Radio>
        <Radio value={null}>All</Radio>
      </Radio.Group>
      <div className="flex justify-between pt-2 border-t">
        <Button size="small" onClick={() => onClear(columnKey)}>
          Clear
        </Button>
        <Button type="primary" size="small">
          Apply
        </Button>
      </div>
    </div>
  );
};

const SelectFilter = ({
  columnKey,
  uniqueValues,
  selectedValues,
  multiple,
  onChange,
  onClear,
}) => {
  return (
    <div className="p-3 w-72 space-y-2">
      <Select
        mode={multiple ? "multiple" : "single"}
        value={selectedValues}
        onChange={(values) =>
          onChange(columnKey, Array.isArray(values) ? values : [values])
        }
        style={{ width: "100%" }}
        placeholder="Select values..."
        size="small"
        maxTagCount={3}
      >
        {uniqueValues.map((value, idx) => (
          <Option key={idx} value={value}>
            {String(value)}
          </Option>
        ))}
      </Select>
      <div className="flex justify-between pt-2 border-t">
        <Button size="small" onClick={() => onClear(columnKey)}>
          Clear
        </Button>
        <Button type="primary" size="small">
          Apply
        </Button>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
const MasterReportGenerationPage = () => {
  // Core state
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Report selection
  const [reportTypes, setReportTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  // Enhanced filter state
  const [columnFilters, setColumnFilters] = useState({});
  const [globalSearch, setGlobalSearch] = useState("");

  // UI state
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [densityMode, setDensityMode] = useState("default");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Column metadata
  const [columnMetadata, setColumnMetadata] = useState({});

  const isInitialized = useRef(false);

  // Fetch report types
  useEffect(() => {
    fetchReportTypes();
  }, []);

  const fetchReportTypes = useCallback(async () => {
    try {
      const response = await api.get("/BulkReport/report-details");
      setReportTypes(response?.data?.data || []);
    } catch (error) {
      console.error("Error fetching report types:", error);
    }
  }, []);

  // Report handlers
  const handleTypeChange = (value) => {
    setSelectedType(value);
    const selectedData = reportTypes.find((item) => item.typeId === value);
    setReports(selectedData?.reports || []);
    setSelectedReport(null);
    setData([]);
    setColumnFilters({});
    setVisibleColumns([]);
  };

  const handleReportChange = (value) => {
    setSelectedReport(value);
  };

  // Execute report with proper data processing
  const executeReport = useCallback(async () => {
    if (!selectedType || !selectedReport) return;

    setLoading(true);
    try {
      const response = await api.post("/BulkReport/Execute-Report", {
        reportTypeID: selectedType,
        reportNameID: selectedReport,
      });

      const responseData = response.data;
      let tableData = [];

      // Handle different response structures
      if (Array.isArray(responseData)) {
        tableData = responseData;
      } else if (responseData && typeof responseData === "object") {
        const firstKey = Object.keys(responseData).find(
          (key) =>
            Array.isArray(responseData[key]) && responseData[key].length > 0,
        );
        tableData = firstKey ? responseData[firstKey] : [];
      }

      setData(tableData);
    } catch (error) {
      console.error("Error executing report:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedReport]);

  // Auto-execute on selection
  useEffect(() => {
    if (selectedType && selectedReport) {
      executeReport();
    }
  }, [selectedType, selectedReport, executeReport]);

  // Analyze columns when data changes
  useEffect(() => {
    if (data.length > 0 && !isInitialized.current) {
      const metadata = analyzeColumns(data);
      setColumnMetadata(metadata);
      setVisibleColumns(Object.keys(metadata));
      isInitialized.current = true;
    }
  }, [data]);

  // Column analysis with proper typing
  const analyzeColumns = useCallback((data) => {
    const scanLimit = Math.min(data.length, 1000);
    const columnInfo = {};

    for (let i = 0; i < scanLimit; i++) {
      const row = data[i];
      if (!row) continue;

      Object.entries(row).forEach(([key, value]) => {
        if (!columnInfo[key]) {
          columnInfo[key] = {
            values: new Set(),
            type: FILTER_TYPES.TEXT,
            sampleValues: [],
          };
        }

        const info = columnInfo[key];
        if (value != null && value !== "") {
          info.values.add(value);
          info.sampleValues.push(value);
          if (info.sampleValues.length > 100) {
            info.sampleValues.shift();
          }
        }
      });
    }

    // Determine types and prepare unique values
    Object.entries(columnInfo).forEach(([key, info]) => {
      info.uniqueValues = Array.from(info.values);
      info.type = detectColumnType(info.sampleValues);
      info.title = formatColumnTitle(key);
    });

    return columnInfo;
  }, []);

  // Enhanced filtering logic
  const fullyFilteredData = useMemo(() => {
    let filtered = data.map((item, index) => ({
      ...item,
      rowKey: item?.id || item?.ID || item?._id || item?.code || `row-${index}`,
    }));

    // Global search
    if (globalSearch.trim()) {
      const searchLower = globalSearch.toLowerCase();
      filtered = filtered.filter((item) =>
        Object.values(item).some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(searchLower),
        ),
      );
    }

    // Column filters
    Object.entries(columnFilters).forEach(([columnKey, filterValue]) => {
      if (
        !filterValue ||
        (Array.isArray(filterValue) && filterValue.length === 0)
      )
        return;

      filtered = filtered.filter((row) => {
        const rowValue = row[columnKey];

        switch (columnMetadata[columnKey]?.type) {
          case FILTER_TYPES.NUMBER:
            if (Array.isArray(filterValue) && filterValue.length === 2) {
              const numValue = Number(rowValue);
              return numValue >= filterValue[0] && numValue <= filterValue[1];
            }
            break;

          case FILTER_TYPES.DATE:
            if (Array.isArray(filterValue) && filterValue.length === 2) {
              const dateValue = dayjs(rowValue);
              const startDate = dayjs(filterValue[0]);
              const endDate = dayjs(filterValue[1]);
              return (
                dateValue.isValid() &&
                dateValue.isAfter(startDate) &&
                dateValue.isBefore(endDate)
              );
            }
            break;

          case FILTER_TYPES.BOOLEAN:
            return rowValue === filterValue;

          default:
            // Multi-select or text filter
            return filterValue.includes(rowValue);
        }
        return true;
      });
    });

    return filtered;
  }, [data, globalSearch, columnFilters, columnMetadata]);

  // Dynamic table columns
  const tableColumns = useMemo(() => {
    if (!columnMetadata || Object.keys(columnMetadata).length === 0) return [];

    return Object.entries(columnMetadata)
      .filter(([key]) => visibleColumns.includes(key))
      .map(([key, info]) => ({
        title: info.title,
        dataIndex: key,
        key,
        width: Math.min(Math.max(info.title.length * 8, 120), 300),
        sorter: (a, b) => {
          const aVal = a[key];
          const bVal = b[key];
          if (aVal == null && bVal == null) return 0;
          if (aVal == null) return 1;
          if (bVal == null) return -1;

          if (info.type === FILTER_TYPES.NUMBER) {
            return Number(aVal) - Number(bVal);
          }
          return String(aVal).localeCompare(String(bVal));
        },
        filterDropdown: ({ confirm, clearFilters }) => {
          const filterValue = columnFilters[key] || [];
          const handleFilterChange = (colKey, value) => {
            setColumnFilters((prev) => ({
              ...prev,
              [colKey]: value,
            }));
            confirm({ closeDropdown: false });
          };

          const handleClear = () => {
            setColumnFilters((prev) => {
              const newFilters = { ...prev };
              delete newFilters[key];
              return newFilters;
            });
            clearFilters();
          };

          const renderFilter = () => {
            switch (info.type) {
              case FILTER_TYPES.NUMBER:
                return (
                  <NumberFilter
                    columnKey={key}
                    values={info.sampleValues.map(Number)}
                    selectedRange={
                      Array.isArray(filterValue) && filterValue.length === 2
                        ? filterValue
                        : [0, 100]
                    }
                    onChange={handleFilterChange}
                    onClear={handleClear}
                  />
                );
              case FILTER_TYPES.DATE:
                return (
                  <DateFilter
                    columnKey={key}
                    selectedRange={filterValue}
                    onChange={handleFilterChange}
                    onClear={handleClear}
                  />
                );
              case FILTER_TYPES.BOOLEAN:
                return (
                  <BooleanFilter
                    columnKey={key}
                    selectedValue={filterValue[0] || null}
                    onChange={handleFilterChange}
                    onClear={handleClear}
                  />
                );
              case FILTER_TYPES.SINGLE_SELECT:
                return (
                  <SelectFilter
                    columnKey={key}
                    uniqueValues={info.uniqueValues}
                    selectedValues={filterValue}
                    multiple={false}
                    onChange={handleFilterChange}
                    onClear={handleClear}
                  />
                );
              default:
                return (
                  <SelectFilter
                    columnKey={key}
                    uniqueValues={info.uniqueValues.slice(0, 50)}
                    selectedValues={filterValue}
                    multiple={true}
                    onChange={handleFilterChange}
                    onClear={handleClear}
                  />
                );
            }
          };

          return <div className="p-2">{renderFilter()}</div>;
        },
        filterIcon: () => (
          <FilterOutlined
            style={{
              color: columnFilters[key] ? "#1890ff" : undefined,
            }}
          />
        ),
        render: (value, record) => {
          if (value == null || value === "") {
            return <span className="text-gray-400">-</span>;
          }

          const colInfo = columnMetadata[key];
          switch (colInfo?.type) {
            case FILTER_TYPES.NUMBER:
              return (
                <span className="font-mono">
                  {Number(value).toLocaleString()}
                </span>
              );
            case FILTER_TYPES.DATE:
              return dayjs(value).format("DD MMM YYYY");
            case FILTER_TYPES.BOOLEAN:
              return (
                <Badge
                  status={value ? "success" : "default"}
                  text={value ? "Yes" : "No"}
                />
              );
            default:
              return String(value);
          }
        },
      }));
  }, [columnMetadata, visibleColumns, columnFilters]);

  // Filter management
  const clearAllFilters = () => {
    setColumnFilters({});
    setGlobalSearch("");
  };

  const activeFilterCount = Object.values(columnFilters).filter(
    (f) => f && f.length > 0,
  ).length;

  // UI handlers
  const handleRefresh = () => executeReport();
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);
  const toggleColumn = (columnKey) => {
    setVisibleColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((k) => k !== columnKey)
        : [...prev, columnKey],
    );
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 dark:from-slate-900 dark:to-slate-950 p-6 ${isFullscreen ? "fixed inset-0 z-50 overflow-auto" : ""}`}
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:text-white bg-clip-text text-transparent">
              Advanced Report Viewer
            </h1>
            <p className="text-gray-600 mt-1">
              Dynamic data analysis with smart filtering
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button icon={<FullscreenOutlined />} onClick={toggleFullscreen} />
            <Segmented
              options={[
                { label: "Compact", value: "small" },
                { label: "Default", value: "default" },
                { label: "Spacious", value: "large" },
              ]}
              value={densityMode}
              onChange={(value) => setDensityMode(value)}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
          <Select
            placeholder="Report Type"
            value={selectedType}
            onChange={handleTypeChange}
            className="w-full"
            size="large"
          >
            {reportTypes.map((type) => (
              <Option key={type.typeId} value={type.typeId}>
                {type.typeName}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Report"
            value={selectedReport}
            onChange={handleReportChange}
            disabled={!selectedType}
            className="w-full"
            size="large"
          >
            {reports.map((report) => (
              <Option key={report.reportId} value={report.reportId}>
                {report.reportName}
              </Option>
            ))}
          </Select>

          <Input
            placeholder="Global Search..."
            prefix={<SearchOutlined />}
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full"
            size="large"
          />

          <div className="flex gap-2">
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
              disabled={!selectedReport}
            >
              Refresh
            </Button>
            <Button
              icon={<DownloadOutlined />}
              type="primary"
              disabled={fullyFilteredData.length === 0}
            >
              Export
            </Button>
            {/* Column Visibility - Fixed Position */}
            <Dropdown
              menu={{
                items: Object.entries(columnMetadata).map(([key, info]) => ({
                  key,
                  label: (
                    <div className="flex items-center p-2">
                      <Checkbox
                        checked={visibleColumns.includes(key)}
                        onChange={(e) => toggleColumn(key)}
                      >
                        {info.title}
                      </Checkbox>
                    </div>
                  ),
                })),
              }}
              trigger={["click"]}
              placement="topRight"
            >
              <Button icon={<SettingOutlined />}>
                Columns ({visibleColumns.length})
              </Button>
            </Dropdown>
          </div>
        </div>

        {/* Stats & Filters */}
        {fullyFilteredData.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 bg-white/50 backdrop-blur-sm rounded-t-lg p-3 border">
            <div className="flex items-center gap-2">
              <span className="font-medium">Records:</span>
              <Badge count={fullyFilteredData.length.toLocaleString()} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Columns:</span>
              <Badge
                count={`${visibleColumns.length}/${Object.keys(columnMetadata).length}`}
              />
            </div>
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Filters:</span>
                <Badge count={activeFilterCount} color="blue" />
                <Button size="small" onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Table */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border overflow-hidden">
          {loading ? (
            <div className="p-12">
              <Skeleton active paragraph={{ rows: 12 }} />
            </div>
          ) : fullyFilteredData.length === 0 ? (
            <Empty
              className="p-24"
              description={
                !selectedReport
                  ? "Select a report to view data"
                  : "No data matches your filters"
              }
            />
          ) : (
            <Table
              rowKey="rowKey"
              columns={tableColumns}
              dataSource={fullyFilteredData}
              pagination={{
                current: currentPage,
                pageSize,
                total: fullyFilteredData.length,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50", "100"],
                onChange: (page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                },
              }}
              scroll={{ x: "max-content" }}
              size={densityMode}
              className="custom-report-table"
              sticky
              virtual
            />
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-report-table :global(.ant-table-thead) th {
          background: linear-gradient(
            135deg,
            #f8fafc 0%,
            #f1f5f9 100%
          ) !important;
          font-weight: 600 !important;
          border-bottom: 2px solid #e2e8f0 !important;
        }
        .dark .custom-report-table :global(.ant-table-thead) th {
          background: linear-gradient(
            135deg,
            #0f172a 0%,
            #1e293b 100%
          ) !important;
          color: #e2e8f0 !important;
        }
      `}</style>
    </div>
  );
};

const formatColumnTitle = (key) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

export default MasterReportGenerationPage;
