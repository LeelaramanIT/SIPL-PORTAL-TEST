import { useMemo, useState, useEffect } from 'react';
import { Table } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from './ChartCard';
import ChartTooltip from './ChartTooltip';
import { toSortedArray, currencyFormat, numberFormat, compactNumberFormat } from '../utils/analyticsHelpers';
import { CHART_GRID, CHART_AXIS_TEXT, CHART_LABEL_TEXT, CHART_HOVER_FILL } from '../utils/chartTheme';

export default function CustomerAnalytics({ data, onSelect }) {
  const [tablePagination, setTablePagination] = useState({ current: 1, pageSize: 20 });
  const top10 = useMemo(() => toSortedArray(new Map(data.map((d) => [d.key, d])), 'totalSales', 10), [data]);
  const tableData = useMemo(
    () => toSortedArray(new Map(data.map((d) => [d.key, d])), 'totalSales').map((d, i) => ({ ...d, rank: i + 1 })),
    [data]
  );

  useEffect(() => {
    setTablePagination((p) => ({ ...p, current: 1 }));
  }, [tableData]);

  const columns = [
    { title: '#', dataIndex: 'rank', width: 44, fixed: 'left' },
    { title: 'Customer', dataIndex: 'key', width: 220, fixed: 'left', ellipsis: true },
    {
      title: 'Total Sales',
      dataIndex: 'totalSales',
      width: 130,
      sorter: (a, b) => a.totalSales - b.totalSales,
      render: (v) => currencyFormat(v),
    },
    { title: 'Tyres', dataIndex: 'tyresSold', width: 90, sorter: (a, b) => a.tyresSold - b.tyresSold, render: (v) => numberFormat(v) },
    { title: 'Orders', dataIndex: 'orderCount', width: 90, sorter: (a, b) => a.orderCount - b.orderCount },
    {
      title: 'Avg Order Value',
      dataIndex: 'avgOrderValue',
      width: 140,
      sorter: (a, b) => a.avgOrderValue - b.avgOrderValue,
      render: (v) => currencyFormat(v),
    },
    { title: 'Region', dataIndex: 'region', width: 110 },
    { title: 'Lead CRM', dataIndex: 'leadCrm', width: 130 },
  ];

  return (
    <>
      <ChartCard title="Top Customers by Sales">
        <div style={{ height: Math.max(220, top10.length * 30) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top10} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={CHART_GRID} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: CHART_AXIS_TEXT }} axisLine={false} tickLine={false} tickFormatter={compactNumberFormat} />
              <YAxis type="category" dataKey="key" tick={{ fontSize: 11, fill: CHART_LABEL_TEXT }} axisLine={false} tickLine={false} width={130} />
              <Tooltip
                cursor={{ fill: CHART_HOVER_FILL }}
                content={
                  <ChartTooltip
                    rows={(payload) => {
                      const d = payload[0]?.payload;
                      if (!d) return [];
                      return [
                        { label: 'Sales', value: currencyFormat(d.totalSales) },
                        { label: 'Orders', value: numberFormat(d.orderCount) },
                      ];
                    }}
                  />
                }
              />
              <Bar
                dataKey="totalSales"
                radius={[0, 6, 6, 0]}
                maxBarSize={18}
                fill="var(--accent)"
                onClick={(d) => onSelect('consigneeNames', d.key)}
                cursor="pointer"
                isAnimationActive
                animationDuration={350}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Customer Performance" className="col-span-full">
        <Table
          size="small"
          dataSource={tableData}
          columns={columns}
          rowKey={(record, idx) => `${record.key ?? 'row'}__${idx}`}
          scroll={{ x: 900, y: 320 }}
          pagination={{
            current: tablePagination.current,
            pageSize: tablePagination.pageSize,
            total: tableData.length,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: (page, pageSize) => setTablePagination({ current: page, pageSize }),
            size: 'small',
          }}
          onRow={(record) => ({ onClick: () => onSelect('consigneeNames', record.key), className: 'cursor-pointer' })}
        />
      </ChartCard>
    </>
  );
}
