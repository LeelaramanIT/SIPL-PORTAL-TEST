import { DatePicker, Button, Space } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

function DateRangeDropdown({ setSelectedKeys, selectedKeys, confirm, clearFilters }) {
  return (
    <div className="p-2 flex flex-col gap-2">
      <RangePicker
        value={selectedKeys[0]}
        onChange={(range) => setSelectedKeys(range ? [range] : [])}
        format="DD MMM YYYY"
      />
      <Space>
        <Button type="primary" size="small" icon={<CalendarOutlined />} onClick={() => confirm()}>
          Apply
        </Button>
        <Button
          size="small"
          onClick={() => {
            clearFilters?.();
            confirm();
          }}
        >
          Reset
        </Button>
      </Space>
    </div>
  );
}

/** Date-range column filter for date columns (expects the record field to hold a dayjs instance). */
export function getDateRangeFilterProps(dataIndex) {
  return {
    filterDropdown: (props) => <DateRangeDropdown {...props} />,
    filterIcon: (filtered) => <CalendarOutlined style={{ color: filtered ? 'var(--accent)' : undefined }} />,
    onFilter: (value, record) => {
      const [start, end] = value;
      const d = record[dataIndex];
      if (!d) return false;
      return !d.isBefore(start, 'day') && !d.isAfter(end, 'day');
    },
  };
}
