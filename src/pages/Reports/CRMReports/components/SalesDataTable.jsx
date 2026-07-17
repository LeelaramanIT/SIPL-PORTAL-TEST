import { useMemo, useState } from 'react';
import { Table, Input, Button } from 'antd';
import { SearchOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import ChartCard from './ChartCard';
import ColumnVisibilityManager from './ColumnVisibilityManager';
import { getMultiSelectColumnFilterProps } from '../filters/MultiSelectColumnFilter';
import { getDateRangeFilterProps } from '../filters/DateRangeColumnFilter';
import { currencyFormat, numberFormat } from '../utils/analyticsHelpers';

const SEARCH_FIELDS = ['consigneeName', 'tyreSize', 'leadCrm', 'managerCrm', 'state', 'category', 'tyreType'];

function buildColumns(filterOptions, data) {
  const uniqueOptions = (dataArray, dataIndex, { numeric = false, formatter } = {}) => {
    const set = new Set();
    (dataArray || []).forEach((r) => {
      const v = r[dataIndex];
      if (v === undefined || v === null || v === '') return;
      set.add(v);
    });
    const arr = Array.from(set);
    if (numeric) arr.sort((a, b) => Number(a) - Number(b));
    else arr.sort((a, b) => String(a).localeCompare(String(b)));
    return arr.map((v) => ({ label: formatter ? formatter(v) : String(v), value: v }));
  };

  const numFmt = (v) => numberFormat(v);
  const currencyFmt = (v) => currencyFormat(v);

  return [
    {
      title: 'Consignee Name',
      dataIndex: 'consigneeName',
      key: 'consigneeName',
      width: 210,
      fixed: 'left',
      ellipsis: true,
      ...getMultiSelectColumnFilterProps('consigneeName', filterOptions.consigneeNames),
    },
    {
      title: 'Tyre Size',
      dataIndex: 'tyreSize',
      key: 'tyreSize',
      width: 140,
      ...getMultiSelectColumnFilterProps('tyreSize', filterOptions.tyreSizes),
    },
    {
      title: 'Rim Type',
      dataIndex: 'rimType',
      key: 'rimType',
      width: 100,
      ...getMultiSelectColumnFilterProps('rimType', filterOptions.rimTypes),
    },
    {
      title: 'Tyre Type',
      dataIndex: 'tyreType',
      key: 'tyreType',
      width: 110,
      ...getMultiSelectColumnFilterProps('tyreType', filterOptions.tyreTypes),
    },
    {
      title: 'Platform',
      dataIndex: 'platform',
      key: 'platform',
      width: 100,
      ...getMultiSelectColumnFilterProps('platform', filterOptions.platforms),
    },
    {
      title: 'No. of Tyres',
      dataIndex: 'tyreCount',
      key: 'tyreCount',
      width: 110,
      sorter: (a, b) => a.tyreCount - b.tyreCount,
      render: (v) => numberFormat(v),
      ...getMultiSelectColumnFilterProps('tyreCount', uniqueOptions(data, 'tyreCount', { numeric: true, formatter: numFmt })),
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      key: 'weight',
      width: 100,
      sorter: (a, b) => a.weight - b.weight,
      render: (v) => numberFormat(v, 2),
      ...getMultiSelectColumnFilterProps('weight', uniqueOptions(data, 'weight', { numeric: true, formatter: (v) => numberFormat(v, 2) })),
    },
    {
      title: 'Rim Weight',
      dataIndex: 'rimWeight',
      key: 'rimWeight',
      width: 100,
      sorter: (a, b) => a.rimWeight - b.rimWeight,
      render: (v) => numberFormat(v, 2),
      ...getMultiSelectColumnFilterProps('rimWeight', uniqueOptions(data, 'rimWeight', { numeric: true, formatter: (v) => numberFormat(v, 2) })),
    },
    {
      title: 'Rate/Tyre',
      dataIndex: 'ratePerTyre',
      key: 'ratePerTyre',
      width: 110,
      sorter: (a, b) => a.ratePerTyre - b.ratePerTyre,
      render: (v) => `₹${numberFormat(v)}`,
      ...getMultiSelectColumnFilterProps('ratePerTyre', uniqueOptions(data, 'ratePerTyre', { numeric: true, formatter: currencyFmt })),
    },
    {
      title: 'Rate/Rim',
      dataIndex: 'ratePerRim',
      key: 'ratePerRim',
      width: 100,
      sorter: (a, b) => a.ratePerRim - b.ratePerRim,
      render: (v) => `₹${numberFormat(v)}`,
      ...getMultiSelectColumnFilterProps('ratePerRim', uniqueOptions(data, 'ratePerRim', { numeric: true, formatter: currencyFmt })),
    },
    {
      title: 'Total Price',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 130,
      sorter: (a, b) => a.totalPrice - b.totalPrice,
      defaultSortOrder: 'descend',
      render: (v) => <span className="font-medium text-[var(--foreground)]">{currencyFormat(v)}</span>,
      ...getMultiSelectColumnFilterProps('totalPrice', uniqueOptions(data, 'totalPrice', { numeric: true, formatter: currencyFmt })),
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: 130,
      ...getMultiSelectColumnFilterProps('state', filterOptions.states),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      ...getMultiSelectColumnFilterProps('category', filterOptions.categories),
    },
    {
      title: 'Region',
      dataIndex: 'region',
      key: 'region',
      width: 100,
      ...getMultiSelectColumnFilterProps('region', filterOptions.regions),
    },
    {
      title: 'Created Date',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: 130,
      sorter: (a, b) => a.createdDate?.valueOf() - b.createdDate?.valueOf(),
      render: (d) => d?.format('DD MMM YYYY'),
      ...getDateRangeFilterProps('createdDate'),
    },
    {
      title: 'Freight',
      dataIndex: 'freightCharges',
      key: 'freightCharges',
      width: 100,
      ...getMultiSelectColumnFilterProps('freightCharges', filterOptions.freightTypes),
    },
    {
      title: 'Lead CRM',
      dataIndex: 'leadCrm',
      key: 'leadCrm',
      width: 130,
      ...getMultiSelectColumnFilterProps('leadCrm', filterOptions.leadCrms),
    },
    {
      title: 'Manager CRM',
      dataIndex: 'managerCrm',
      key: 'managerCrm',
      width: 140,
      ...getMultiSelectColumnFilterProps('managerCrm', filterOptions.managerCrms),
    },
    {
      title: 'Dispatched Date',
      dataIndex: 'dispatchedDate',
      key: 'dispatchedDate',
      width: 140,
      sorter: (a, b) => a.dispatchedDate?.valueOf() - b.dispatchedDate?.valueOf(),
      render: (d) => d?.format('DD MMM YYYY'),
      ...getDateRangeFilterProps('dispatchedDate'),
    },
    {
      title: 'Dispatch Days',
      dataIndex: 'dispatchDays',
      key: 'dispatchDays',
      width: 120,
      sorter: (a, b) => (a.dispatchDays ?? -1) - (b.dispatchDays ?? -1),
      render: (v) => (v === null ? '—' : `${v}d`),
    },
  ];
}

function exportToCsv(rows, columns) {
  const header = columns.map((c) => c.title).join(',');
  const lines = rows.map((row) =>
    columns
      .map((c) => {
        const raw = row[c.dataIndex];
        const value = raw?.format ? raw.format('YYYY-MM-DD') : raw ?? '';
        return `"${String(value).replace(/"/g, '""')}"`;
      })
      .join(',')
  );
  const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `crm-sales-export-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function SalesDataTable({ filteredData, filterOptions }) {
  const [search, setSearch] = useState('');
  const [visibleKeys, setVisibleKeys] = useState(null); // null = all visible
  const [resetKey, setResetKey] = useState(0);
  const [tablePagination, setTablePagination] = useState({ current: 1, pageSize: 20 });

  const allColumns = useMemo(() => buildColumns(filterOptions, filteredData), [filterOptions, filteredData]);
  const columns = useMemo(
    () => (visibleKeys ? allColumns.filter((c) => visibleKeys.includes(c.key)) : allColumns),
    [allColumns, visibleKeys]
  );

  const searchedData = useMemo(() => {
    if (!search.trim()) return filteredData;
    const q = search.toLowerCase();
    return filteredData.filter((r) => SEARCH_FIELDS.some((f) => String(r[f] ?? '').toLowerCase().includes(q)));
  }, [filteredData, search]);

  return (
    <ChartCard
      title="Sales Data"
      className="col-span-full"
      controls={
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            placeholder="Search customer, tyre size, CRM..."
            prefix={<SearchOutlined className="text-[var(--foreground)]/40" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[240px]"
            allowClear
          />
          <ColumnVisibilityManager
            columns={allColumns}
            visibleKeys={visibleKeys ?? allColumns.map((c) => c.key)}
            onChange={setVisibleKeys}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setResetKey((k) => k + 1);
              setSearch('');
            }}
          >
            Reset Table
          </Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={() => exportToCsv(searchedData, columns)}>
            Export
          </Button>
        </div>
      }
    >
      <Table
        key={resetKey}
        size="small"
        dataSource={searchedData}
        columns={columns}
        rowKey={(record) =>
          record.id ?? record.key ?? `${record.consigneeName ?? 'row'}__${record.createdDate?.valueOf?.() ?? ''}__${String(
            record.tyreSize ?? ''
          )}`
        }
        sticky
        scroll={{ x: columns.reduce((acc, c) => acc + (c.width || 120), 0), y: 480 }}
        // pagination={{ pageSize: 25, pageSizeOptions: [10, 25, 50, 100], showSizeChanger: true }}
         pagination={{
            current: tablePagination.current,
            pageSize: tablePagination.pageSize,
            total: searchedData.length,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: (page, pageSize) => setTablePagination({ current: page, pageSize }),
            size: 'small',
          }}
      />
    </ChartCard>
  );
}
