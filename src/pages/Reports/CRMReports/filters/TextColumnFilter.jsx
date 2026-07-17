import { Input, Button, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

/** Simple substring-search column filter. Returns Table column props to spread. */
export function getTextColumnFilterProps(dataIndex) {
  return {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div className="p-2 w-[220px]">
        <Input
          autoFocus
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          className="mb-2"
        />
        <Space>
          <Button type="primary" size="small" icon={<SearchOutlined />} onClick={() => confirm()}>
            Search
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
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? 'var(--accent)' : undefined }} />,
    onFilter: (value, record) => String(record[dataIndex] ?? '').toLowerCase().includes(String(value).toLowerCase()),
  };
}
