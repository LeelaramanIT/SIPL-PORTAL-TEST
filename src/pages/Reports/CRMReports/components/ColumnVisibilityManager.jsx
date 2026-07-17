import { Popover, Checkbox, Button, Divider } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

export default function ColumnVisibilityManager({ columns, visibleKeys, onChange }) {
  const allKeys = columns.map((c) => c.key);
  const allChecked = visibleKeys.length === allKeys.length;

  const toggle = (key) => {
    onChange(visibleKeys.includes(key) ? visibleKeys.filter((k) => k !== key) : [...visibleKeys, key]);
  };

  const content = (
    <div className="w-[220px] flex flex-col gap-1">
      <div className="flex items-center justify-between px-1 pb-1">
        <Checkbox
          checked={allChecked}
          indeterminate={!allChecked && visibleKeys.length > 0}
          onChange={(e) => onChange(e.target.checked ? allKeys : [])}
        >
          <span className="text-[13px] font-medium">Select All</span>
        </Checkbox>
      </div>
      <Divider className="!my-1" />
      <div className="max-h-[280px] overflow-y-auto flex flex-col gap-1">
        {columns.map((col) => (
          <Checkbox key={col.key} checked={visibleKeys.includes(col.key)} onChange={() => toggle(col.key)}>
            <span className="text-[13px]">{col.title}</span>
          </Checkbox>
        ))}
      </div>
    </div>
  );

  return (
    <Popover content={content} title="Show Columns" trigger="click" placement="bottomRight">
      <Button icon={<SettingOutlined />}>Columns</Button>
    </Popover>
  );
}
