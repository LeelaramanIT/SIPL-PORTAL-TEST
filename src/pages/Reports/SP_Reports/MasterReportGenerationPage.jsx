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
  DatePicker,
  message,
  InputNumber
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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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

// ==================== EXCEL-STYLE VALUE FORMATTING/SORTING ====================
// These only affect how a value is *displayed* and *ordered* inside the
// filter checkbox list — every column still gets the exact same UI.
const formatFilterLabel = (value, type) => {
  switch (type) {
    case FILTER_TYPES.NUMBER:
      return Number(value).toLocaleString();
    case FILTER_TYPES.DATE: {
      const d = dayjs(value);
      return d.isValid() ? d.format("DD-MM-YYYY") : String(value);
    }
    case FILTER_TYPES.BOOLEAN:
      return value === true || value === "true" ? "True" : "False";
    default:
      return String(value);
  }
};

const getSortedFilterOptions = (info) => {
  const raws = info?.uniqueValues || [];
  const sorted = [...raws];

  switch (info?.type) {
    case FILTER_TYPES.NUMBER:
      sorted.sort((a, b) => Number(a) - Number(b));
      break;
    case FILTER_TYPES.DATE:
      sorted.sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf());
      break;
    case FILTER_TYPES.BOOLEAN:
      sorted.sort((a, b) => (a === b ? 0 : a ? -1 : 1));
      break;
    default:
      sorted.sort((a, b) => String(a).localeCompare(String(b)));
  }

  return sorted.map((value) => ({
    value,
    label: formatFilterLabel(value, info?.type),
  }));
};

// ==================== DATE-ONLY FILTER (range picker) ====================
// Kept as the old-style filter, used ONLY for columns auto-detected as
// dates. Every other column type still uses the Excel-style checkbox list.
const DateFilter = ({ columnKey, selectedRange, onChange, onClear }) => {
  return (
    <div className="p-3 w-72 space-y-3">
      <RangePicker
        value={
          Array.isArray(selectedRange) && selectedRange.length === 2
            ? selectedRange.map((d) => dayjs(d))
            : null
        }
        onChange={(dates) =>
          onChange(columnKey, dates?.map((d) => d.toISOString()) || [])
        }
        className="w-full"
      />
      <div className="flex justify-end pt-2 border-t">
        <Button size="small" onClick={() => onClear(columnKey)}>
          Clear
        </Button>
      </div>
    </div>
  );
};

// ==================== EXCEL-STYLE FILTER DROPDOWN (single, reusable) ====================
// Used for every column regardless of detected data type — text, numbers,
// dates, booleans, IDs, codes all get the same search + checkbox-list UI.
const FILTER_ROW_HEIGHT = 24;
const FILTER_LIST_HEIGHT = 200;
const FILTER_LIST_OVERSCAN = 6;

const ExcelFilterDropdown = ({
  columnKey,
  options,
  pendingValues,
  searchText,
  onSearchChange,
  onToggleValue,
  onToggleSelectAll,
  onApply,
  onClear,
  onCancel,
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  // Jump back to the top of the list whenever the search narrows/widens it.
  useEffect(() => {
    setScrollTop(0);
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [searchText]);

  const filteredOptions = useMemo(() => {
    if (!searchText.trim()) return options;
    const lower = searchText.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(lower));
  }, [options, searchText]);

  const totalCount = filteredOptions.length;
  const allSelected =
    totalCount > 0 &&
    filteredOptions.every((opt) => pendingValues.includes(opt.value));
  const someSelected =
    !allSelected &&
    filteredOptions.some((opt) => pendingValues.includes(opt.value));

  // Lightweight manual virtualization so lists with thousands of unique
  // values (e.g. IDs, invoice numbers) stay smooth without extra deps.
  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / FILTER_ROW_HEIGHT) - FILTER_LIST_OVERSCAN,
  );
  const visibleCount =
    Math.ceil(FILTER_LIST_HEIGHT / FILTER_ROW_HEIGHT) + FILTER_LIST_OVERSCAN * 2;
  const endIndex = Math.min(totalCount, startIndex + visibleCount);
  const visibleOptions = filteredOptions.slice(startIndex, endIndex);
  const topPadding = startIndex * FILTER_ROW_HEIGHT;
  const bottomPadding = (totalCount - endIndex) * FILTER_ROW_HEIGHT;

  return (
    <div
      className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-[90vw]"
      style={{ width: 220 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-1.5 border-b border-gray-100">
        <Input
          placeholder="Search..."
          size="small"
          allowClear
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="px-2 py-1 border-b border-gray-100">
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          onChange={(e) => onToggleSelectAll(filteredOptions, e.target.checked)}
        >
          Select All
        </Checkbox>
      </div>

      <div
        ref={containerRef}
        className="overflow-auto"
        style={{ height: FILTER_LIST_HEIGHT }}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      >
        {totalCount === 0 ? (
          <div className="px-3 py-6 text-xs text-gray-400 text-center">
            No matching values
          </div>
        ) : (
          <div style={{ paddingTop: topPadding, paddingBottom: bottomPadding }}>
            {visibleOptions.map((opt, idx) => (
              <div
                key={`${columnKey}-${startIndex + idx}`}
                className="flex items-center px-2 hover:bg-gray-50"
                style={{ height: FILTER_ROW_HEIGHT }}
              >
                <Checkbox
                  checked={pendingValues.includes(opt.value)}
                  onChange={() => onToggleValue(opt.value)}
                >
                  {opt.label}
                </Checkbox>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center gap-2 px-2 py-1.5 border-t border-gray-100">
        <Button size="small" onClick={onClear}>
          Clear Filter
        </Button>
        <div className="flex gap-2">
          <Button size="small" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="primary" size="small" onClick={onApply}>
            Apply
          </Button>
        </div>
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
  const [reportParams, setReportParams] = useState([]);
  const [paramValues, setParamValues] = useState({});

  // Enhanced filter state
  const [columnFilters, setColumnFilters] = useState({});
  const [globalSearch, setGlobalSearch] = useState("");

  // UI state
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [densityMode, setDensityMode] = useState("default");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Column visibility panel: temporary/pending selection state so the table
  // and export only react once the user clicks "Apply".
  const [pendingColumns, setPendingColumns] = useState([]);
  const [columnDropdownOpen, setColumnDropdownOpen] = useState(false);

  // Excel-style column filter panel: only one column's filter dropdown is
  // open at a time. `pendingFilterValues` holds the in-progress checkbox
  // selection until the user clicks Apply — nothing filters until then.
  const [activeFilterColumn, setActiveFilterColumn] = useState(null);
  const [pendingFilterValues, setPendingFilterValues] = useState([]);
  const [filterSearchText, setFilterSearchText] = useState("");

  // Column metadata
  const [columnMetadata, setColumnMetadata] = useState({});
  const [selectedReportName, setSelectedReportName] = useState("");

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

    const report = reports.find((item) => item.reportId === value);

    setSelectedReportName(report?.reportName || "Report");

    // Dynamic params
    setReportParams(report?.reportParams || []);

    // Reset old values
    setParamValues({});
  };

  const handleParamChange = (key, value) => {
    setParamValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Execute report with proper data processing
  const executeReport = useCallback(async () => {
    if (!selectedType || !selectedReport) return;

    // Validate required params
    const missingParams = reportParams.filter(
      (param) =>
        param.required &&
        !paramValues[param.paramName]
    );

    if (missingParams.length > 0) {
      message.warning(
        `Please fill: ${missingParams
          .map((p) => p.paramName)
          .join(", ")}`
      );
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/BulkReport/Execute-Report",
        {
          reportTypeID: selectedType,
          reportNameID: selectedReport,
          parameters: paramValues,
        }
      );

      const responseData = response.data;

      let tableData = [];

      if (Array.isArray(responseData)) {
        tableData = responseData;
      } else if (
        responseData &&
        typeof responseData === "object"
      ) {
        const firstKey = Object.keys(responseData).find(
          (key) =>
            Array.isArray(responseData[key]) &&
            responseData[key].length > 0
        );

        tableData = firstKey
          ? responseData[firstKey]
          : [];
      }

      setData(tableData);
    } catch (error) {
      console.error(error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [
    selectedType,
    selectedReport,
    paramValues,
    reportParams,
  ]);
  // Auto-execute on selection
  useEffect(() => {
    if (selectedType && selectedReport) {
      executeReport();
    }
  }, [selectedType, selectedReport, executeReport]);

  // Column analysis with proper typing
  const analyzeColumns = useCallback((data) => {
    // Type detection only needs a bounded sample for performance — sampling
    // here doesn't affect which values are offered in the filter dropdowns.
    const typeScanLimit = Math.min(data.length, 1000);
    const columnInfo = {};

    // Unique values must be collected from the ENTIRE dataset, not just a
    // scanned prefix — column filter dropdowns are built from
    // `info.values`, so limiting this loop previously meant values that
    // only occurred later in the (6000+ row) dataset silently never
    // appeared as filter options, even though every row's data was already
    // loaded in memory.
    for (let i = 0; i < data.length; i++) {
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
          if (i < typeScanLimit) {
            info.sampleValues.push(value);
            if (info.sampleValues.length > 100) {
              info.sampleValues.shift();
            }
          }
        }
      });
    }

    // Determine types and prepare unique values
    Object.entries(columnInfo).forEach(([key, info]) => {
      info.uniqueValues = Array.from(info.values);
      info.type = detectColumnType(info.sampleValues);
      info.title = formatColumnTitle(key);

      // ProcessID is an opaque string identifier (e.g. "P-002364"), not a
      // date — the generic dayjs-based heuristic in detectColumnType can
      // still misclassify it as FILTER_TYPES.DATE if enough sampled values
      // happen to satisfy dayjs's lenient native Date-parsing fallback.
      // Force it back to TEXT so it always renders/filters/sorts as a
      // plain string, without touching detection for any other column.
      if (key === "ProcessID") {
        info.type = FILTER_TYPES.TEXT;
      }
    });

    return columnInfo;
  }, []);

  // Analyze columns when data changes
  useEffect(() => {
    if (data.length > 0) {
      const metadata = analyzeColumns(data);

      setColumnMetadata(metadata);

      // Reset visible columns for new dataset
      const allKeys = Object.keys(metadata);
      setVisibleColumns(allKeys);
      setPendingColumns(allKeys);

      // Reset filters because columns changed
      setColumnFilters({});

      // Reset pagination
      setCurrentPage(1);
    } else {
      // Clear everything when no data
      setColumnMetadata({});
      setVisibleColumns([]);
      setPendingColumns([]);
    }
  }, [data, analyzeColumns]);

  const tableWrapperRef = useRef(null);

useEffect(() => {
  const el = tableWrapperRef.current;
  if (!el) return;

  let rafId;
  const observer = new ResizeObserver(() => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
    });
  });

  observer.observe(el);
  return () => {
    cancelAnimationFrame(rafId);
    observer.disconnect();
  };
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

    // Column filters — date columns use a start/end range (old-style range
    // picker); every other column type uses the Excel-style "selected raw
    // values" rule, uniformly.
    Object.entries(columnFilters).forEach(([columnKey, filterValue]) => {
      if (!filterValue) return;
      const colType = columnMetadata[columnKey]?.type;

      if (colType === FILTER_TYPES.DATE) {
        if (Array.isArray(filterValue) && filterValue.length === 2) {
          const startDate = dayjs(filterValue[0]).startOf("day");
          const endDate = dayjs(filterValue[1]).endOf("day");
          filtered = filtered.filter((row) => {
            const dateValue = dayjs(row[columnKey]);
            return (
              dateValue.isValid() &&
              !dateValue.isBefore(startDate) &&
              !dateValue.isAfter(endDate)
            );
          });
        }
        return;
      }

      if (Array.isArray(filterValue)) {
        filtered = filtered.filter((row) =>
          filterValue.includes(row[columnKey]),
        );
      }
    });

    return filtered;
  }, [data, globalSearch, columnFilters, columnMetadata]);

  // If a column/global filter shrinks the result set enough that the page
  // currently being viewed no longer exists, fall back to page 1 instead of
  // leaving AntD's controlled pagination pointed at an out-of-range page.
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(fullyFilteredData.length / pageSize));
    if (currentPage > maxPage) {
      setCurrentPage(1);
    }
  }, [fullyFilteredData.length, pageSize, currentPage]);

  // Dynamic table columns
  // NOTE: this is the single source of truth for column order used both by
  // the <Table> and by the Excel export, so the two can never drift apart.
  const tableColumns = useMemo(() => {
    if (!columnMetadata || Object.keys(columnMetadata).length === 0) return [];

    return Object.entries(columnMetadata)
      .filter(([key]) => visibleColumns.includes(key))
      .map(([key, info]) => {
        const isDateColumn = info.type === FILTER_TYPES.DATE;

        const dateFilterDropdown = ({ confirm, clearFilters }) => {
          const filterValue = columnFilters[key] || [];

          const handleDateChange = (colKey, value) => {
            setColumnFilters((prev) => {
              const next = { ...prev };
              if (!value || value.length === 0) {
                delete next[colKey];
              } else {
                next[colKey] = value;
              }
              return next;
            });
            confirm({ closeDropdown: false });
          };

          const handleDateClear = () => {
            setColumnFilters((prev) => {
              const next = { ...prev };
              delete next[key];
              return next;
            });
            clearFilters();
          };

          return (
            <div className="p-2">
              <DateFilter
                columnKey={key}
                selectedRange={filterValue}
                onChange={handleDateChange}
                onClear={handleDateClear}
              />
            </div>
          );
        };

        const excelFilterDropdown = () => {
          const filterOptions = getSortedFilterOptions(info);
          const allRawValues = filterOptions.map((opt) => opt.value);
          const isActiveColumn = activeFilterColumn === key;

          return (
            <ExcelFilterDropdown
              columnKey={key}
              options={filterOptions}
              pendingValues={
                isActiveColumn
                  ? pendingFilterValues
                  : columnFilters[key] || allRawValues
              }
              searchText={isActiveColumn ? filterSearchText : ""}
              onSearchChange={setFilterSearchText}
              onToggleValue={(value) => toggleFilterValue(value)}
              onToggleSelectAll={(visibleOpts, checked) =>
                toggleSelectAllFiltered(visibleOpts, checked)
              }
              onApply={() => applyColumnFilter(key, allRawValues)}
              onClear={() => clearColumnFilter(key)}
              onCancel={() => cancelColumnFilter()}
            />
          );
        };

        return {
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
          filterDropdown: isDateColumn ? dateFilterDropdown : excelFilterDropdown,
          // Date columns manage their own popup visibility (old behavior);
          // only the Excel-style panel needs the controlled Apply/Cancel flow.
          ...(!isDateColumn && {
            filterDropdownOpen: activeFilterColumn === key,
            onFilterDropdownOpenChange: (open) =>
              handleFilterDropdownOpenChange(
                key,
                open,
                getSortedFilterOptions(info).map((opt) => opt.value),
              ),
          }),
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
                    {value}
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
        };
      });
  }, [
    columnMetadata,
    visibleColumns,
    columnFilters,
    activeFilterColumn,
    pendingFilterValues,
    filterSearchText,
  ]);

  // Filter management
  const clearAllFilters = () => {
    setColumnFilters({});
    setGlobalSearch("");
    setActiveFilterColumn(null);
    setPendingFilterValues([]);
    setFilterSearchText("");
  };

  // A column key is only ever present in columnFilters once a narrowed
  // selection has been applied, so presence itself means "active".
  const activeFilterCount = Object.keys(columnFilters).length;

  // ---- Excel-style column filter panel handlers ----
  const toggleFilterValue = (value) => {
    setPendingFilterValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  // "Select All" only affects whatever is currently visible under the
  // search box, matching Excel's behavior when a search is active.
  const toggleSelectAllFiltered = (visibleOptions, checked) => {
    const visibleValues = visibleOptions.map((opt) => opt.value);
    setPendingFilterValues((prev) => {
      if (checked) {
        const merged = new Set(prev);
        visibleValues.forEach((v) => merged.add(v));
        return Array.from(merged);
      }
      const toRemove = new Set(visibleValues);
      return prev.filter((v) => !toRemove.has(v));
    });
  };

  const applyColumnFilter = (key, allRawValues) => {
    setColumnFilters((prev) => {
      const next = { ...prev };
      if (pendingFilterValues.length === allRawValues.length) {
        // Everything selected is equivalent to no filter — keep state tidy
        // so the filter icon/badge only lights up when it's meaningful.
        delete next[key];
      } else {
        next[key] = [...pendingFilterValues];
      }
      return next;
    });
    setActiveFilterColumn(null);
    setPendingFilterValues([]);
    setFilterSearchText("");
  };

  const clearColumnFilter = (key) => {
    setColumnFilters((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setActiveFilterColumn(null);
    setPendingFilterValues([]);
    setFilterSearchText("");
  };

  const cancelColumnFilter = () => {
    // Discard in-progress checkbox changes; nothing was applied.
    setActiveFilterColumn(null);
    setPendingFilterValues([]);
    setFilterSearchText("");
  };

  const handleFilterDropdownOpenChange = (key, open, allRawValues) => {
    if (open) {
      setActiveFilterColumn(key);
      setFilterSearchText("");
      // Seed the pending selection from whatever is already applied, or
      // default to "everything selected" (Excel's default state).
      setPendingFilterValues(
        columnFilters[key] ? [...columnFilters[key]] : [...allRawValues],
      );
    } else {
      // Outside click / escape behaves like Cancel.
      setActiveFilterColumn(null);
      setPendingFilterValues([]);
      setFilterSearchText("");
    }
  };

  // UI handlers
  const handleRefresh = () => executeReport();

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  // ---- Column visibility panel handlers (operate on the *pending* selection) ----
  const togglePendingColumn = (columnKey) => {
    setPendingColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((k) => k !== columnKey)
        : [...prev, columnKey],
    );
  };

  const handleSelectAllColumns = () => {
    setPendingColumns(Object.keys(columnMetadata));
  };

  const handleClearAllColumns = () => {
    setPendingColumns([]);
  };

  const handleApplyColumns = () => {
    // Commit the pending selection as the single source of truth.
    // Both the <Table> and the Excel export read from `visibleColumns`.
    setVisibleColumns(pendingColumns);
    setColumnDropdownOpen(false);
  };

  const handleCancelColumns = () => {
    // Discard any in-progress changes; revert pending back to what's applied.
    setPendingColumns(visibleColumns);
    setColumnDropdownOpen(false);
  };

  const handleColumnDropdownOpenChange = (open) => {
    if (open) {
      // Re-seed the pending selection with whatever is currently applied
      // every time the panel is opened, so reopening retains prior choices.
      setPendingColumns(visibleColumns);
      setColumnDropdownOpen(true);
    } else {
      // Clicking outside behaves like Cancel — no partial commits.
      setPendingColumns(visibleColumns);
      setColumnDropdownOpen(false);
    }
  };

  const handleExportExcel = () => {
    if (!fullyFilteredData || fullyFilteredData.length === 0) return;

    // Single source of truth: export exactly the columns (and order) shown
    // in the table right now. tableColumns is already filtered/ordered by
    // visibleColumns, so this can never drift from what the user sees.
    const exportKeys = tableColumns.map((col) => col.key);

    if (exportKeys.length === 0) return;

    const cleanedData = fullyFilteredData.map((row) => {
      const obj = {};
      exportKeys.forEach((key) => {
        obj[key] = row[key] ?? "";
      });
      return obj;
    });

    // Create worksheet, explicitly pinning header order to exportKeys so
    // hidden columns can never leak in and order always matches the table.
    const worksheet = XLSX.utils.json_to_sheet(cleanedData, {
      header: exportKeys,
    });

    // Auto column width (computed only over the exported columns)
    const columnWidths = exportKeys.map((key) => ({
      wch: Math.max(
        key.length,
        ...cleanedData.map((row) => String(row[key] ?? "").length),
      ),
    }));

    worksheet["!cols"] = columnWidths;
    const sheetName = selectedReportName || "Report";

    // Create workbook
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      sheetName,
    );

    // Generate excel buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Save file
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(
      blob,
      `${sheetName}_Report_${dayjs().format("DD-MM-YYYY_HH-mm")}.xlsx`,
    );
  };
  return (
    <div
      className={`min-h-screen w-full min-w-0 overflow-x-hidden bg-gradient-to-br from-slate-50 to-stone-100 dark:from-slate-900 dark:to-slate-950 p-3 sm:p-4 ${isFullscreen ? "fixed inset-0 z-50 overflow-auto" : ""}`}
    >
      {/* Header */}
      <div className={`${isFullscreen ? "max-w-7xl" : "max-w-[87rem]"} w-full min-w-0 mx-auto space-y-2`}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="min-w-0">
            <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:text-white bg-clip-text text-transparent truncate">
              Advanced Report Viewer
            </h1>
            <p className="text-gray-600 text-xs mt-0.5 break-words">
              Dynamic data analysis with smart filtering
            </p>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <Button size="small" icon={<FullscreenOutlined />} onClick={toggleFullscreen} style={{
              backgroundColor: "var(--primary)",
              borderColor: "var(--primary)",
              color: "#fff",
            }} />
            <Segmented
              size="small"
              options={[
                { label: "Compact", value: "small" },
                { label: "Default", value: "default" },
                { label: "Spacious", value: "large" },
              ]}
              value={densityMode}
              onChange={(value) => setDensityMode(value)}
              style={{
                backgroundColor: "var(--primary)",
                borderColor: "var(--primary)",
                color: "#fff",
                maxWidth: "100%",
              }}
            />
          </div>
        </div>

        {/* Toolbar — filters/search cluster grows & wraps on the left,
            action buttons stay grouped and fixed-size on the right. */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          {/* Filters + search */}
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          <Select
            placeholder="Report Type"
            value={selectedType}
            onChange={handleTypeChange}
            className="w-full sm:w-auto sm:min-w-[170px]"
            size="middle"
          >
            {reportTypes.map((type) => (
              <Option key={type.typeId} value={type.typeId} >
                {type.typeName}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Report"
            value={selectedReport}
            onChange={handleReportChange}
            disabled={!selectedType}
            className="w-full sm:w-auto sm:min-w-[170px]"
            size="middle"
          >
            {reports.map((report) => (
              <Option key={report.reportId} value={report.reportId}>
                {report.reportName}
              </Option>
            ))}
          </Select>
          {/* Dynamic Params */}
          {reportParams.map((param) => {
  const key = param.paramName;
  const value = paramValues[key];

  // If options exist always show dropdown
  if (param.options?.length > 0) {
    return (
      <Select
        key={key}
        className="w-full sm:w-auto sm:min-w-[150px]"
        size="middle"
        placeholder={`Select ${key}`}
        value={value}
        onChange={(val) => handleParamChange(key, val)}
      >
        {param.options.map((option) => (
          <Select.Option key={option} value={option}>
            {option}
          </Select.Option>
        ))}
      </Select>
    );
  }

  switch (param.dataType?.toLowerCase()) {
    // =========================
    // Text
    // =========================
    case "nvarchar":
    case "varchar":
    case "char":
    case "nchar":
    case "text":
    case "ntext":
    case "uniqueidentifier":
      return (
        <Input
          key={key}
          className="w-full sm:w-auto sm:min-w-[150px]"
          size="middle"
          placeholder={`Enter ${key}`}
          value={value}
          onChange={(e) =>
            handleParamChange(key, e.target.value)
          }
        />
      );

    // =========================
    // Numbers
    // =========================
    case "int":
    case "bigint":
    case "smallint":
    case "tinyint":
    case "decimal":
    case "numeric":
    case "money":
    case "smallmoney":
    case "float":
    case "real":
      return (
        <InputNumber
          key={key}
          className="w-full sm:w-auto sm:min-w-[150px]"
          size="middle"
          placeholder={`Enter ${key}`}
          value={value}
          onChange={(val) =>
            handleParamChange(key, val)
          }
        />
      );

    // =========================
    // Date
    // =========================
    case "date":
      return (
        <DatePicker
          key={key}
          className="w-full sm:w-auto sm:min-w-[150px]"
          size="middle"
          placeholder={`Select ${key}`}
          value={value ? dayjs(value) : null}
          onChange={(date) =>
            handleParamChange(
              key,
              date ? date.format("YYYY-MM-DD") : null
            )
          }
        />
      );

    // =========================
    // DateTime
    // =========================
    case "datetime":
    case "datetime2":
    case "smalldatetime":
      return (
        <DatePicker
          key={key}
          className="w-full sm:w-auto sm:min-w-[150px]"
          size="middle"
          showTime
          placeholder={`Select ${key}`}
          value={value ? dayjs(value) : null}
          onChange={(date) =>
            handleParamChange(
              key,
              date
                ? date.format("YYYY-MM-DD HH:mm:ss")
                : null
            )
          }
        />
      );

    // =========================
    // Time
    // =========================
    case "time":
      return (
        <TimePicker
          key={key}
          className="w-full sm:w-auto sm:min-w-[150px]"
          size="middle"
          placeholder={`Select ${key}`}
          value={value ? dayjs(value, "HH:mm:ss") : null}
          onChange={(time) =>
            handleParamChange(
              key,
              time ? time.format("HH:mm:ss") : null
            )
          }
        />
      );

    // =========================
    // Boolean
    // =========================
    case "bit":
      return (
        <div
          key={key}
          className="w-full sm:w-auto sm:min-w-[150px] flex items-center justify-between border rounded-lg px-2.5 h-8 text-sm"
        >
          <span>{key}</span>

          <Switch
            checked={!!value}
            onChange={(checked) =>
              handleParamChange(key, checked)
            }
          />
        </div>
      );

    // =========================
    // Default
    // =========================
    default:
      return (
        <Input
          key={key}
          className="w-full sm:w-auto sm:min-w-[150px]"
          size="middle"
          placeholder={`Enter ${key}`}
          value={value}
          onChange={(e) =>
            handleParamChange(key, e.target.value)
          }
        />
      );
  }
})}

          <Input
            placeholder="Global Search..."
            prefix={<SearchOutlined />}
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full sm:flex-1 sm:min-w-[200px]"
            size="middle"
          />
          </div>

          {/* Action buttons — grouped, fixed-size, never grows */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
            <Button
              size="middle"
              icon={<ReloadOutlined />}
              onClick={executeReport}
              loading={loading}
              disabled={!selectedReport}
              className="w-full sm:w-auto"
              style={{
                backgroundColor: "var(--primary-light)",
                borderColor: "var(--primary)",
                color: "var(--primary)",
              }}
            >
              Refresh
            </Button>
            <Button
              size="middle"
              icon={<DownloadOutlined />}
              type="primary"
              onClick={handleExportExcel}
              disabled={fullyFilteredData.length === 0}
              className="w-full sm:w-auto"
              style={{
                backgroundColor: "var(--primary)",
                borderColor: "var(--primary)",
                color: "#fff",
              }}
            >
              Export
            </Button>
            {/* Column Visibility - multi-select panel with Select All / Clear All / Apply / Cancel */}
            <Dropdown
              open={columnDropdownOpen}
              onOpenChange={handleColumnDropdownOpenChange}
              trigger={["click"]}
              placement="topRight"
              dropdownRender={() => (
                <div
                  className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-[90vw]"
                  style={{ width: 220 }}
                  // Prevent AntD's internal click-outside handling from
                  // treating a click inside the panel as an "outside" click.
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center px-2 py-1.5 border-b border-gray-100">
                    <Button
                      type="link"
                      size="small"
                      style={{ padding: 0 }}
                      onClick={handleSelectAllColumns}
                    >
                      Select All
                    </Button>
                    <Button
                      type="link"
                      size="small"
                      style={{ padding: 0 }}
                      onClick={handleClearAllColumns}
                    >
                      Clear All
                    </Button>
                  </div>
                  <div className="max-h-56 overflow-auto py-1">
                    {Object.entries(columnMetadata).map(([key, info]) => (
                      <div
                        key={key}
                        className="flex items-center px-2 py-1 hover:bg-gray-50"
                      >
                        <Checkbox
                          checked={pendingColumns.includes(key)}
                          onChange={() => togglePendingColumn(key)}
                        >
                          {info.title}
                        </Checkbox>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2 px-2 py-1.5 border-t border-gray-100">
                    <Button size="small" onClick={handleCancelColumns}>
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      onClick={handleApplyColumns}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}
            >
              <Button
                size="middle"
                icon={<SettingOutlined />}
                className="w-full sm:w-auto"
                style={{
                  backgroundColor: "var(--primary-light)",
                  borderColor: "var(--primary)",
                  color: "var(--primary)",
                }}
              >
                Columns ({visibleColumns.length})
              </Button>
            </Dropdown>
          </div>
        </div>

        {/* Stats & Filters */}
        {fullyFilteredData.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-[var(--background)] rounded-lg px-3 py-1.5 border border-[var(--border)] shadow-sm text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-medium">Records:</span>
              <Badge count={fullyFilteredData.length.toLocaleString()} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium">Columns:</span>
              <Badge
                count={`${visibleColumns.length}/${Object.keys(columnMetadata).length}`}
              />
            </div>
            {activeFilterCount > 0 && (
              <div className="flex items-center flex-wrap gap-1.5">
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
        <div
          ref={tableWrapperRef}
          className="w-full min-w-0 bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-[var(--primary)] overflow-hidden">
          {loading ? (
            <div className="p-4 sm:p-8">
              <Skeleton active paragraph={{ rows: 12 }} />
            </div>
          ) : fullyFilteredData.length === 0 ? (
            <Empty
              className="px-4 py-10 sm:p-16 font-medium text-sm"
              description={
                <span style={{ color: "var(--primary)" }}>
                  {!selectedReport
                    ? "Select a report to view data"
                    : "No data matches your filters"}
                </span>
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
          padding-top: 6px !important;
          padding-bottom: 6px !important;
          font-size: 12px !important;
        }
        .dark .custom-report-table :global(.ant-table-thead) th {
          background: linear-gradient(
            135deg,
            #0f172a 0%,
            #1e293b 100%
          ) !important;
          color: #e2e8f0 !important;
        }
        .custom-report-table :global(.ant-table-tbody) > tr > td {
          padding-top: 5px !important;
          padding-bottom: 5px !important;
          font-size: 12px !important;
        }
        .custom-report-table :global(.ant-table-pagination) {
          margin: 8px 0 !important;
          flex-wrap: wrap !important;
          row-gap: 6px;
        }
        /* Long option labels wrap/truncate instead of pushing the
           select or its dropdown wider than the viewport. */
        :global(.ant-select-selection-item),
        :global(.ant-select-item-option-content) {
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }
        @media (max-width: 767px) {
          .custom-report-table :global(.ant-table-pagination) {
            justify-content: center !important;
          }
          .custom-report-table :global(.ant-pagination-options) {
            margin-inline-start: 0 !important;
          }
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