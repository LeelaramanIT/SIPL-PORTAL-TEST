import { useMemo, useState } from 'react';
import { Input, Button, Space, Checkbox, Divider } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

function MultiSelectDropdown({ options, setSelectedKeys, selectedKeys, confirm, clearFilters }) {
  const [search, setSearch] = useState('');
  // Normalize options to { label, value }
  const normalized = useMemo(
    () =>
      (options || []).map((o) =>
        typeof o === 'object' && o !== null && 'value' in o
          ? { label: String(o.label ?? o.value), value: o.value }
          : { label: String(o), value: o }
      ),
    [options]
  );

  const filteredOptions = useMemo(
    () => normalized.filter((o) => o.label.toLowerCase().includes(search.toLowerCase())),
    [normalized, search]
  );

  const anySelected = filteredOptions.length > 0 && filteredOptions.some((o) => selectedKeys.includes(o.value));

  return (
    <div className="p-2 w-[240px]">
      <Input placeholder="Search options" value={search} onChange={(e) => setSearch(e.target.value)} className="mb-2" allowClear />
      <div className="flex gap-2 mb-2">
        <Button
          size="small"
          type="link"
          onClick={() => {
            const all = filteredOptions.map((o) => o.value);
            if (anySelected) {
              setSelectedKeys([]);
            } else {
              setSelectedKeys(all);
            }
          }}
        >
          {anySelected ? 'Unselect' : 'Select All'}
        </Button>
      </div>
      <div className="max-h-[200px] overflow-y-auto flex flex-col gap-1 pr-1">
        {filteredOptions.map((option) => (
          <Checkbox
            key={String(option.value)}
            checked={selectedKeys.includes(option.value)}
            onChange={(e) => {
              const next = e.target.checked ? [...selectedKeys, option.value] : selectedKeys.filter((v) => v !== option.value);
              setSelectedKeys(next);
            }}
          >
            <span className="text-[13px]">{option.label}</span>
          </Checkbox>
        ))}
        {filteredOptions.length === 0 && <span className="text-[var(--foreground)]/40 text-[12.5px] py-1">No matches</span>}
      </div>
      <Divider className="!my-2" />
      <Space>
        <Button type="primary" size="small" onClick={() => confirm()}>
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

/** Checkbox + search column filter for categorical text columns. */
export function getMultiSelectColumnFilterProps(dataIndex, options) {
  return {
    filterDropdown: (props) => <MultiSelectDropdown options={options} {...props} />,
    filterIcon: (filtered) => <FilterOutlined style={{ color: filtered ? 'var(--accent)' : undefined }} />,
    onFilter: (value, record) => {
      const recordValue = record[dataIndex];
      // Compare primitives directly (numbers/strings). For objects, fall back to string compare.
      if (recordValue === value) return true;
      return String(recordValue) === String(value);
    },
  };
}
