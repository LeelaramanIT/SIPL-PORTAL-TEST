import { InputNumber, Button, Space } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

function NumberRangeDropdown({ setSelectedKeys, selectedKeys, confirm, clearFilters }) {
  const [min, max] = selectedKeys[0] || [undefined, undefined];

  const update = (nextMin, nextMax) => setSelectedKeys([[nextMin, nextMax]]);

  return (
    <div className="p-2 w-[220px] flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <InputNumber placeholder="Min" value={min} onChange={(v) => update(v, max)} className="w-full" />
        <span className="text-[var(--foreground)]/40">–</span>
        <InputNumber placeholder="Max" value={max} onChange={(v) => update(min, v)} className="w-full" />
      </div>
      <Space>
        <Button type="primary" size="small" icon={<FilterOutlined />} onClick={() => confirm()}>
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

/** Min/max range column filter for numeric columns. */
export function getNumberRangeFilterProps(dataIndex) {
  return {
    filterDropdown: (props) => <NumberRangeDropdown {...props} />,
    filterIcon: (filtered) => <FilterOutlined style={{ color: filtered ? 'var(--accent)' : undefined }} />,
    onFilter: (value, record) => {
      const [min, max] = value;
      const n = Number(record[dataIndex]);
      if (min !== undefined && n < min) return false;
      if (max !== undefined && n > max) return false;
      return true;
    },
  };
}
