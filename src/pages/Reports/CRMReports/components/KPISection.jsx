import {
  DollarCircleOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  TeamOutlined,
  RiseOutlined,
  TagOutlined,
  DashboardOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import KPICard from './KPICard';
import { currencyFormat, numberFormat } from '../utils/analyticsHelpers';

export default function KPISection({ kpis }) {
  const cards = [
    {
      icon: <DollarCircleOutlined />,
      label: 'Total Sales Value',
      value: currencyFormat(kpis.totalSales),
    },
    {
      icon: <ShoppingOutlined />,
      label: 'Total Tyres Sold',
      value: numberFormat(kpis.totalTyres),
    },
    {
      icon: <FileTextOutlined />,
      label: 'Total Sale Orders',
      value: numberFormat(kpis.totalRecords),
    },
    {
      icon: <TeamOutlined />,
      label: 'Customers',
      value: numberFormat(kpis.activeCustomers),
    },
    {
      icon: <RiseOutlined />,
      label: 'Average Order Value',
      value: currencyFormat(kpis.avgOrderValue),
    },
    {
      icon: <TagOutlined />,
      label: 'Avg. Rate Per Tyre',
      value: `₹${numberFormat(kpis.avgRatePerTyre, 0)}`,
    },
    {
      icon: <DashboardOutlined />,
      label: 'Total Weight',
      value: `${numberFormat(kpis.totalWeight / 1000, 1)} T`,
      subtext: `${numberFormat(kpis.totalWeight)} kg`,
    },
    {
      icon: <ClockCircleOutlined />,
      label: 'Avg. Dispatch Days',
      value: kpis.avgDispatchDays === null ? '—' : `${kpis.avgDispatchDays.toFixed(1)} days`,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <KPICard key={card.label} {...card} />
      ))}
    </div>
  );
}
