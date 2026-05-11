import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Table,
  Input,
  Button,
  DatePicker,
  Select,
  Tag,
  Dropdown,
  Checkbox,
  Space,
  Tooltip,
  Badge,
  Segmented,
  Modal,
  Skeleton,
  Empty,
  Popover,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  DownloadOutlined,
  ColumnHeightOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  SettingOutlined,
  ClearOutlined,
  CloseCircleOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

// ==================== MOCK DATA GENERATOR ====================
const generateMockData = (count = 100) => {
  const statuses = ['Active', 'Pending', 'Completed', 'Cancelled', 'Processing'];
  const departments = ['Sales', 'Marketing', 'Engineering', 'HR', 'Finance', 'Operations'];
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'];
  const priorities = ['High', 'Medium', 'Low', 'Critical'];

  return Array.from({ length: count }, (_, i) => ({
    key: `record-${i + 1}`,
    id: `RPT-${String(i + 1).padStart(6, '0')}`,
    title: `Report ${i + 1}: ${['Q1 Analysis', 'Monthly Review', 'Performance Data', 'Strategic Overview', 'Operations Summary'][i % 5]}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    department: departments[Math.floor(Math.random() * departments.length)],
    region: regions[Math.floor(Math.random() * regions.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    amount: parseFloat((Math.random() * 100000).toFixed(2)),
    progress: Math.floor(Math.random() * 100),
    createdDate: dayjs().subtract(Math.floor(Math.random() * 365), 'day').format('YYYY-MM-DD'),
    modifiedDate: dayjs().subtract(Math.floor(Math.random() * 30), 'day').format('YYYY-MM-DD'),
    owner: ['John Smith', 'Sarah Johnson', 'Michael Chen', 'Emily Davis', 'Robert Wilson'][i % 5],
    tags: ['quarterly', 'annual', 'monthly', 'weekly'].slice(0, Math.floor(Math.random() * 3) + 1),
  }));
};

// ==================== FILTER TYPES ====================
const FILTER_TYPES = {
  CONTAINS: 'contains',
  EQUALS: 'equals',
  STARTS_WITH: 'startsWith',
  ENDS_WITH: 'endsWith',
  EMPTY: 'empty',
  NOT_EMPTY: 'notEmpty',
  GREATER_THAN: 'greaterThan',
  LESS_THAN: 'lessThan',
  MULTI_SELECT: 'multiSelect',
};

// ==================== MAIN COMPONENT ====================
const BarcodePage = () => {
  // ========== STATE MANAGEMENT ==========
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [globalSearch, setGlobalSearch] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [columnFilters, setColumnFilters] = useState({});
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [densityMode, setDensityMode] = useState('default');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ field: null, order: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // ========== INITIAL DATA LOAD ==========
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const mockData = generateMockData(500);
      setData(mockData);
      setLoading(false);
    }, 800);
  }, []);

  // ========== COLUMN CONFIGURATION ==========
  const allColumns = useMemo(
    () => [
      {
        title: 'Report ID',
        dataIndex: 'id',
        key: 'id',
        width: 140,
        sortable: true,
        filterable: true,
        filterType: FILTER_TYPES.CONTAINS,
      },
      {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        width: 250, // Give it a specific width
        ellipsis: true, // This is key for 'fixed' layout
        sortable: true,
        filterable: true,
        filterType: FILTER_TYPES.CONTAINS,
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 130,
        sortable: true,
        filterable: true,
        filterType: FILTER_TYPES.MULTI_SELECT,
        render: (status) => {
          const colorMap = {
            Active: 'success',
            Pending: 'warning',
            Completed: 'blue',
            Cancelled: 'error',
            Processing: 'processing',
          };
          return <Tag color={colorMap[status]}>{status}</Tag>;
        },
      },
      {
        title: 'Department',
        dataIndex: 'department',
        key: 'department',
        width: 150,
        sortable: true,
        filterable: true,
        filterType: FILTER_TYPES.MULTI_SELECT,
      },
      {
        title: 'Region',
        dataIndex: 'region',
        key: 'region',
        width: 160,
        sortable: true,
        filterable: true,
        filterType: FILTER_TYPES.MULTI_SELECT,
      },
      {
        title: 'Priority',
        dataIndex: 'priority',
        key: 'priority',
        width: 120,
        sortable: true,
        filterable: true,
        filterType: FILTER_TYPES.MULTI_SELECT,
        render: (priority) => {
          const colorMap = {
            Critical: 'error',
            High: 'warning',
            Medium: 'default',
            Low: 'success',
          };
          return <Tag color={colorMap[priority]}>{priority}</Tag>;
        },
      },
      {
        title: 'Amount',
        dataIndex: 'amount',
        key: 'amount',
        width: 150,
        sortable: true,
        filterable: true,
        filterType: FILTER_TYPES.GREATER_THAN,
        align: 'right',
        render: (amount) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      },
      {
        title: 'Progress',
        dataIndex: 'progress',
        key: 'progress',
        width: 120,
        sortable: true,
        filterable: true,
        filterType: FILTER_TYPES.GREATER_THAN,
        render: (progress) => (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-mono text-slate-600 dark:text-slate-400 w-10 text-right">
              {progress}%
            </span>
          </div>
        ),
      },
      {
        title: 'Created Date',
        dataIndex: 'createdDate',
        key: 'createdDate',
        width: 140,
        sortable: true,
        filterable: true,
        filterType: FILTER_TYPES.CONTAINS,
      },
      {
        title: 'Modified Date',
        dataIndex: 'modifiedDate',
        key: 'modifiedDate',
        width: 140,
        sortable: true,
        filterable: true,
        filterType: FILTER_TYPES.CONTAINS,
      },
      {
        title: 'Owner',
        dataIndex: 'owner',
        key: 'owner',
        width: 160,
        sortable: true,
        filterable: true,
        filterType: FILTER_TYPES.MULTI_SELECT,
      },
      {
        title: 'Tags',
        dataIndex: 'tags',
        key: 'tags',
        width: 200,
        render: (tags) => (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Tag key={tag} className="text-xs">
                {tag}
              </Tag>
            ))}
          </div>
        ),
      },
    ],
    []
  );

  // Initialize visible columns
  useEffect(() => {
    if (visibleColumns.length === 0) {
      setVisibleColumns(allColumns.map((col) => col.key));
    }
  }, [allColumns, visibleColumns.length]);

  // ========== FILTER LOGIC ==========
  const applyFilters = useCallback(
    (dataToFilter) => {
      let filtered = [...dataToFilter];

      // Global search
      if (globalSearch) {
        filtered = filtered.filter((record) =>
          Object.values(record).some((value) =>
            String(value).toLowerCase().includes(globalSearch.toLowerCase())
          )
        );
      }

      // Date range filter
      if (dateRange[0] && dateRange[1]) {
        filtered = filtered.filter((record) => {
          const recordDate = dayjs(record.createdDate);
          return recordDate.isAfter(dateRange[0]) && recordDate.isBefore(dateRange[1]);
        });
      }

      // Column-specific filters
      Object.entries(columnFilters).forEach(([columnKey, filter]) => {
        if (!filter || !filter.value) return;

        filtered = filtered.filter((record) => {
          const cellValue = String(record[columnKey] || '');

          switch (filter.type) {
            case FILTER_TYPES.CONTAINS:
              return cellValue.toLowerCase().includes(String(filter.value).toLowerCase());
            case FILTER_TYPES.EQUALS:
              return cellValue.toLowerCase() === String(filter.value).toLowerCase();
            case FILTER_TYPES.STARTS_WITH:
              return cellValue.toLowerCase().startsWith(String(filter.value).toLowerCase());
            case FILTER_TYPES.ENDS_WITH:
              return cellValue.toLowerCase().endsWith(String(filter.value).toLowerCase());
            case FILTER_TYPES.EMPTY:
              return !cellValue || cellValue.trim() === '';
            case FILTER_TYPES.NOT_EMPTY:
              return cellValue && cellValue.trim() !== '';
            case FILTER_TYPES.GREATER_THAN:
              return parseFloat(cellValue) > parseFloat(filter.value);
            case FILTER_TYPES.LESS_THAN:
              return parseFloat(cellValue) < parseFloat(filter.value);
            case FILTER_TYPES.MULTI_SELECT:
              return Array.isArray(filter.value) && filter.value.includes(cellValue);
            default:
              return true;
          }
        });
      });

      return filtered;
    },
    [globalSearch, dateRange, columnFilters]
  );

  // ========== SORTING LOGIC ==========
  const applySorting = useCallback(
    (dataToSort) => {
      if (!sortConfig.field) return dataToSort;

      return [...dataToSort].sort((a, b) => {
        const aValue = a[sortConfig.field];
        const bValue = b[sortConfig.field];

        if (aValue === bValue) return 0;

        let comparison = 0;
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else {
          comparison = String(aValue).localeCompare(String(bValue));
        }

        return sortConfig.order === 'asc' ? comparison : -comparison;
      });
    },
    [sortConfig]
  );

  // ========== PROCESSED DATA ==========
  const processedData = useMemo(() => {
    let result = applyFilters(data);
    result = applySorting(result);
    return result;
  }, [data, applyFilters, applySorting]);

  // ========== UPDATE ACTIVE FILTER COUNT ==========
  useEffect(() => {
    let count = 0;
    if (globalSearch) count++;
    if (dateRange[0] && dateRange[1]) count++;
    count += Object.keys(columnFilters).length;
    setActiveFilterCount(count);
  }, [globalSearch, dateRange, columnFilters]);

  // ========== COLUMN FILTER COMPONENT ==========
  const ColumnFilterPopover = ({ column }) => {
    const [filterValue, setFilterValue] = useState('');
    const [selectedValues, setSelectedValues] = useState([]);
    const [filterType, setFilterType] = useState(column.filterType || FILTER_TYPES.CONTAINS);

    const uniqueValues = useMemo(() => {
      if (column.filterType === FILTER_TYPES.MULTI_SELECT) {
        return [...new Set(data.map((item) => item[column.dataIndex]))].filter(Boolean);
      }
      return [];
    }, [column]);

    const handleApplyFilter = () => {
      if (filterType === FILTER_TYPES.MULTI_SELECT) {
        if (selectedValues.length > 0) {
          setColumnFilters((prev) => ({
            ...prev,
            [column.key]: { type: filterType, value: selectedValues },
          }));
        }
      } else if (filterType === FILTER_TYPES.EMPTY || filterType === FILTER_TYPES.NOT_EMPTY) {
        setColumnFilters((prev) => ({
          ...prev,
          [column.key]: { type: filterType, value: true },
        }));
      } else if (filterValue) {
        setColumnFilters((prev) => ({
          ...prev,
          [column.key]: { type: filterType, value: filterValue },
        }));
      }
    };

    const handleClearFilter = () => {
      setFilterValue('');
      setSelectedValues([]);
      setColumnFilters((prev) => {
        const newFilters = { ...prev };
        delete newFilters[column.key];
        return newFilters;
      });
    };

    const content = (
      <div className="w-64 p-2 space-y-3">
        <Select
          value={filterType}
          onChange={setFilterType}
          className="w-full"
          size="small"
          options={[
            { label: 'Contains', value: FILTER_TYPES.CONTAINS },
            { label: 'Equals', value: FILTER_TYPES.EQUALS },
            { label: 'Starts With', value: FILTER_TYPES.STARTS_WITH },
            { label: 'Ends With', value: FILTER_TYPES.ENDS_WITH },
            { label: 'Greater Than', value: FILTER_TYPES.GREATER_THAN },
            { label: 'Less Than', value: FILTER_TYPES.LESS_THAN },
            { label: 'Is Empty', value: FILTER_TYPES.EMPTY },
            { label: 'Is Not Empty', value: FILTER_TYPES.NOT_EMPTY },
            ...(column.filterType === FILTER_TYPES.MULTI_SELECT
              ? [{ label: 'Multi Select', value: FILTER_TYPES.MULTI_SELECT }]
              : []),
          ]}
        />

        {filterType === FILTER_TYPES.MULTI_SELECT ? (
          <Checkbox.Group
            value={selectedValues}
            onChange={setSelectedValues}
            className="flex flex-col gap-2 max-h-48 overflow-y-auto"
          >
            {uniqueValues.map((val) => (
              <Checkbox key={val} value={val} className="text-sm">
                {val}
              </Checkbox>
            ))}
          </Checkbox.Group>
        ) : filterType !== FILTER_TYPES.EMPTY && filterType !== FILTER_TYPES.NOT_EMPTY ? (
          <Input
            placeholder="Enter value..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            onPressEnter={handleApplyFilter}
            size="small"
            className="font-mono"
          />
        ) : null}

        <div className="flex gap-2">
          <Button onClick={handleApplyFilter} type="primary" size="small" block>
            Apply
          </Button>
          <Button onClick={handleClearFilter} size="small" icon={<ClearOutlined />}>
            Clear
          </Button>
        </div>
      </div>
    );

    return (
      <Popover content={content} trigger="click" placement="bottom">
        <Button
          size="small"
          type={columnFilters[column.key] ? 'primary' : 'text'}
          icon={<FilterOutlined />}
          className="ml-1 transition-all duration-200"
        />
      </Popover>
    );
  };

  // ========== TABLE COLUMNS WITH FILTERS ==========
  const tableColumns = useMemo(() => {
    return allColumns
      .filter((col) => visibleColumns.includes(col.key))
      .map((col) => ({
        ...col,
        title: (
          <div className="flex items-center justify-between group">
            <span className="font-semibold text-slate-700 dark:text-slate-200">{col.title}</span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {col.sortable && (
                <Button
                  size="small"
                  type="text"
                  icon={
                    sortConfig.field === col.key ? (
                      sortConfig.order === 'asc' ? (
                        <SortAscendingOutlined />
                      ) : (
                        <SortDescendingOutlined />
                      )
                    ) : (
                      <SortAscendingOutlined className="opacity-40" />
                    )
                  }
                  onClick={() => {
                    if (sortConfig.field === col.key) {
                      setSortConfig({
                        field: col.key,
                        order: sortConfig.order === 'asc' ? 'desc' : 'asc',
                      });
                    } else {
                      setSortConfig({ field: col.key, order: 'asc' });
                    }
                  }}
                />
              )}
              {col.filterable && <ColumnFilterPopover column={col} />}
            </div>
          </div>
        ),
      }));
  }, [allColumns, visibleColumns, sortConfig, columnFilters]);

  // ========== ROW SELECTION ==========
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };

  // ========== HANDLERS ==========
  const handleRefresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setData(generateMockData(500));
      setLoading(false);
    }, 800);
  }, []);

  const handleExport = useCallback(() => {
    console.log('Exporting data...', processedData);
    // Export logic would go here
  }, [processedData]);

  const handleClearAllFilters = useCallback(() => {
    setGlobalSearch('');
    setDateRange([null, null]);
    setColumnFilters({});
    setSortConfig({ field: null, order: null });
  }, []);

  const handleColumnVisibility = useCallback((keys) => {
    setVisibleColumns(keys);
  }, []);

  // ========== RENDER ==========
  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-zinc-50 dark:from-slate-950 dark:via-slate-900 dark:to-zinc-950 transition-all duration-500 ${isFullscreen ? 'fixed inset-0 z-50' : ''
        }`}
    >
      {/* Grain Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] dark:opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />

      <div className="relative p-4 md:p-6 lg:p-8 space-y-4">
        {/* ========== HEADER SECTION ========== */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200/50 dark:border-slate-800/50 p-6 transition-all duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-50 dark:via-amber-200 dark:to-slate-50 bg-clip-text text-transparent tracking-tight">
                Report Generation
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                Advanced analytics and data exploration platform
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                <Button
                  icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="hover:scale-105 transition-transform duration-200"
                />
              </Tooltip>
              <Segmented
                options={[
                  { label: 'Compact', value: 'small', icon: <ColumnHeightOutlined /> },
                  { label: 'Default', value: 'default' },
                  { label: 'Spacious', value: 'large' },
                ]}
                value={densityMode}
                onChange={setDensityMode}
                className="hidden md:inline-flex"
              />
            </div>
          </div>
        </div>

        {/* ========== TOOLBAR ========== */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200/50 dark:border-slate-800/50 p-4 transition-all duration-300">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <Input
              placeholder="Search across all fields..."
              prefix={<SearchOutlined className="text-slate-400" />}
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              allowClear
              className="lg:w-80 h-10 rounded-xl font-mono text-sm"
            />

            {/* Date Range */}
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              className="h-10 rounded-xl"
              format="YYYY-MM-DD"
            />

            <div className="flex-1" />

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              <Tooltip title="Refresh Data">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={loading}
                  className="h-10 hover:scale-105 transition-transform duration-200"
                >
                  Refresh
                </Button>
              </Tooltip>

              <Tooltip title="Export to Excel">
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleExport}
                  type="primary"
                  className="h-10 bg-gradient-to-r from-amber-500 to-orange-500 border-none hover:scale-105 transition-transform duration-200"
                >
                  Export
                </Button>
              </Tooltip>

              <Dropdown
                menu={{
                  items: allColumns.map((col) => ({
                    key: col.key,
                    label: (
                      <Checkbox
                        checked={visibleColumns.includes(col.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleColumnVisibility([...visibleColumns, col.key]);
                          } else {
                            handleColumnVisibility(visibleColumns.filter((k) => k !== col.key));
                          }
                        }}
                      >
                        {col.title}
                      </Checkbox>
                    ),
                  })),
                }}
                trigger={['click']}
              >
                <Button icon={<SettingOutlined />} className="h-10">
                  Columns
                </Button>
              </Dropdown>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Active Filters:
              </span>
              <Badge count={activeFilterCount} className="mr-2">
                <Tag color="blue">
                  <FilterOutlined /> {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}{' '}
                  active
                </Tag>
              </Badge>

              {globalSearch && (
                <Tag
                  closable
                  onClose={() => setGlobalSearch('')}
                  className="animate-fadeIn"
                >
                  Search: "{globalSearch}"
                </Tag>
              )}

              {dateRange[0] && dateRange[1] && (
                <Tag
                  closable
                  onClose={() => setDateRange([null, null])}
                  className="animate-fadeIn"
                >
                  Date: {dateRange[0].format('MMM D')} - {dateRange[1].format('MMM D')}
                </Tag>
              )}

              {Object.entries(columnFilters).map(([key, filter]) => {
                const column = allColumns.find((col) => col.key === key);
                return (
                  <Tag
                    key={key}
                    closable
                    onClose={() => {
                      setColumnFilters((prev) => {
                        const newFilters = { ...prev };
                        delete newFilters[key];
                        return newFilters;
                      });
                    }}
                    className="animate-fadeIn"
                  >
                    {column?.title}:{' '}
                    {Array.isArray(filter.value)
                      ? `${filter.value.length} selected`
                      : filter.value === true
                        ? filter.type
                        : filter.value}
                  </Tag>
                );
              })}

              <Button
                type="link"
                size="small"
                onClick={handleClearAllFilters}
                icon={<CloseCircleOutlined />}
                className="text-red-500 hover:text-red-600"
              >
                Clear All
              </Button>
            </div>
          )}

          {/* Stats Bar */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Total Records:</span>
              <Badge
                count={processedData.length}
                showZero
                className="bg-gradient-to-r from-amber-500 to-orange-500"
                style={{ backgroundColor: 'transparent' }}
              />
            </div>
            {selectedRowKeys.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Selected:</span>
                <Badge
                  count={selectedRowKeys.length}
                  className="bg-blue-500"
                  style={{ backgroundColor: '#3b82f6' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* ========== TABLE ========== */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-slate-300/30 dark:shadow-slate-950/50 border border-slate-200/50 dark:border-slate-800/50 overflow-hidden transition-all duration-300">
          {loading ? (
            <div className="p-8">
              <Skeleton active paragraph={{ rows: 10 }} />
            </div>
          ) : processedData.length === 0 ? (
            <div className="p-16">
              <Empty
                description={
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                      No data found
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Try adjusting your filters or search criteria
                    </p>
                  </div>
                }
              />
            </div>
          ) : (

            <Table
              rowSelection={rowSelection}
              columns={tableColumns}
              dataSource={processedData}
              tableLayout="fixed"
              scroll={{
                x: 1600,
                y: isFullscreen ? 'calc(100vh - 400px)' : 600
              }}
              sticky
              size={densityMode}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: processedData.length,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => (
                  <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
                    {range[0]}-{range[1]} of {total} records
                  </span>
                ),
                pageSizeOptions: ['10', '20', '50', '100', '200'],
                onChange: (page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                },
                className: 'px-4 py-3',
              }}
              rowClassName={(record, index) =>
                index % 2 === 0
                  ? 'bg-slate-50/50 dark:bg-slate-800/30 hover:bg-amber-50 dark:hover:bg-slate-700/50 transition-colors duration-200'
                  : 'bg-white dark:bg-slate-900/30 hover:bg-amber-50 dark:hover:bg-slate-700/50 transition-colors duration-200'
              }
              className="report-table"
            />
          )}
        </div>
      </div>

      {/* ========== CUSTOM STYLES ========== */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

        * {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .font-mono {
          font-family: 'IBM Plex Mono', 'Courier New', monospace !important;
        }

        .report-table .ant-table {
          background: transparent !important;
        }

        .report-table .ant-table-thead > tr > th {
          background: linear-gradient(
            to bottom,
            rgba(248, 250, 252, 0.9),
            rgba(241, 245, 249, 0.9)
          ) !important;
          border-bottom: 2px solid rgb(226, 232, 240) !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          letter-spacing: 0.025em !important;
          padding: 16px 12px !important;
          position: sticky !important;
          top: 0 !important;
          z-index: 10 !important;
        }

        .dark .report-table .ant-table-thead > tr > th {
          background: linear-gradient(
            to bottom,
            rgba(15, 23, 42, 0.9),
            rgba(30, 41, 59, 0.9)
          ) !important;
          border-bottom: 2px solid rgb(51, 65, 85) !important;
          color: rgb(226, 232, 240) !important;
        }

        .report-table .ant-table-tbody > tr > td {
          padding: 12px !important;
          font-size: 13px !important;
          border-bottom: 1px solid rgba(226, 232, 240, 0.5) !important;
        }

        .dark .report-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid rgba(51, 65, 85, 0.5) !important;
          color: rgb(203, 213, 225) !important;
        }

        .report-table .ant-table-tbody > tr.ant-table-row-selected > td {
          background: rgba(251, 191, 36, 0.1) !important;
        }

        .dark .report-table .ant-table-tbody > tr.ant-table-row-selected > td {
          background: rgba(251, 191, 36, 0.15) !important;
        }

        .ant-table-pagination {
          background: linear-gradient(to top, rgba(248, 250, 252, 0.5), transparent) !important;
        }

        .dark .ant-table-pagination {
          background: linear-gradient(to top, rgba(15, 23, 42, 0.5), transparent) !important;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        /* Custom scrollbar */
        .ant-table-body::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .ant-table-body::-webkit-scrollbar-track {
          background: rgba(226, 232, 240, 0.3);
          border-radius: 4px;
        }

        .dark .ant-table-body::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
        }

        .ant-table-body::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.5);
          border-radius: 4px;
          transition: background 0.2s;
        }

        .ant-table-body::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.8);
        }

        .dark .ant-table-body::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.5);
        }

        .dark .ant-table-body::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.8);
        }

        /* Smooth transitions for dark mode */
        * {
          transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }
          .report-table {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.report-table .ant-table-container {
  overflow-x: auto !important;
}

.report-table .ant-table-content {
  overflow-x: auto !important;
}

.report-table .ant-table-body {
  overflow-x: auto !important;
}

body {
  overflow-x: hidden;
}
      `}</style>
    </div>
  );
};

export default BarcodePage;