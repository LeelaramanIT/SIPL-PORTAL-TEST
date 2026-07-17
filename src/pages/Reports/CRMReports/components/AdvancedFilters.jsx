import { useState } from 'react';
import { Select, Button, Divider } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { DownOutlined, UpOutlined, ReloadOutlined } from '@ant-design/icons';
import { numberFormat } from '../utils/analyticsHelpers';

const PRIMARY_FIELDS = [
  { key: 'regions', label: 'Region' },
  { key: 'states', label: 'State' },
  { key: 'categories', label: 'Category' },
  { key: 'leadCrms', label: 'Lead CRM' },
];

const MORE_FIELDS = [
  { key: 'consigneeNames', label: 'Customer' },
  { key: 'managerCrms', label: 'Manager CRM' },
  { key: 'platforms', label: 'Platform' },
  { key: 'tyreSizes', label: 'Tyre Size' },
  { key: 'rimTypes', label: 'Rim Type' },
  { key: 'tyreTypes', label: 'Tyre Type' },
  { key: 'freightTypes', label: 'Freight' },
];

function FilterSelect({ field, filters, filterOptions, setFilter }) {
  const options = filterOptions[field.key] || [];
  const selected = filters[field.key] || [];
  const allSelected = options.length > 0 && selected.length === options.length;

  return (
    <Select
      mode="multiple"
      showSearch
      allowClear
      maxTagCount="responsive"
      placeholder={field.label}
      value={selected}
      onChange={(vals) => setFilter(field.key, vals)}
      options={options.map((v) => ({ label: v, value: v }))}
      className="min-w-[168px] flex-1"
      popupMatchSelectWidth={220}
      popupRender={(menu) => (
        <div>
          <div className="flex items-center justify-between px-2 py-1.5">
            <Button
              type="link"
              size="small"
              className="!px-0"
              onClick={() => setFilter(field.key, allSelected ? [] : options)}
            >
              {allSelected ? 'Unselect All' : 'Select All'}
            </Button>
            <Button type="link" size="small" className="!px-0" disabled={!selected.length} onClick={() => setFilter(field.key, [])}>
              Clear
            </Button>
          </div>
          <Divider className="!my-1" />
          {menu}
        </div>
      )}
    />
  );
}

export default function AdvancedFilters({ filters, filterOptions, setFilter, resetFilters, filteredCount, totalCount }) {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[calc(var(--radius)*2)] shadow-[var(--shadow-card)] p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        {PRIMARY_FIELDS.map((field) => (
          <FilterSelect key={field.key} field={field} filters={filters} filterOptions={filterOptions} setFilter={setFilter} />
        ))}
        <Button
          onClick={() => setShowMore((v) => !v)}
          icon={showMore ? <UpOutlined /> : <DownOutlined />}
          iconPosition="end"
        >
          {showMore ? 'Collapse Filters' : 'More Filters'}
        </Button>
        <Button icon={<ReloadOutlined />} onClick={resetFilters}>
          Reset All
        </Button>
      </div>

      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-[var(--border)]/60 mt-1">
              {MORE_FIELDS.map((field) => (
                <FilterSelect key={field.key} field={field} filters={filters} filterOptions={filterOptions} setFilter={setFilter} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-[12.5px] text-[var(--foreground)]/55 pt-1 border-t border-[var(--border)]/60">
        Showing <span className="font-medium text-[var(--foreground)]">{numberFormat(filteredCount)}</span> of{' '}
        <span className="font-medium text-[var(--foreground)]">{numberFormat(totalCount)}</span> records
      </div>
    </div>
  );
}
