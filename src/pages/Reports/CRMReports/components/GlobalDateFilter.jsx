import { DatePicker, Segmented } from 'antd';
import { DATE_PRESETS } from '../utils/dateHelpers';

const { RangePicker } = DatePicker;

export default function GlobalDateFilter({ dateType, dateRange, onDateTypeChange, onDateRangeChange }) {
  const activePresetLabel = DATE_PRESETS.find(({ getRange }) => {
    if (!dateRange) return false;
    const [start, end] = getRange();
    return dateRange[0]?.isSame(start, 'day') && dateRange[1]?.isSame(end, 'day');
  })?.label;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2 flex-wrap">
        <Segmented
          value={dateType}
          onChange={onDateTypeChange}
          options={[
            { label: 'Created Date', value: 'createdDate' },
            { label: 'Dispatched Date', value: 'dispatchedDate' },
          ]}
        />
        <RangePicker
          value={dateRange}
          onChange={(range) => onDateRangeChange(range)}
          format="DD MMM YYYY"
          allowClear
          className="min-w-[260px]"
        />
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {DATE_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => onDateRangeChange(preset.getRange())}
            className={`text-[12.5px] px-2.5 py-1 rounded-[var(--radius)] border transition-colors ${
              activePresetLabel === preset.label
                ? 'bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)]'
                : 'bg-transparent border-[var(--border)] text-[var(--foreground)]/55 hover:bg-[var(--card-hover)]'
            }`}
          >
            {preset.label}
          </button>
        ))}
        {dateRange && (
          <button
            onClick={() => onDateRangeChange(null)}
            className="text-[12.5px] px-2.5 py-1 rounded-[var(--radius)] text-[var(--foreground)]/40 hover:text-[var(--destructive)]"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
