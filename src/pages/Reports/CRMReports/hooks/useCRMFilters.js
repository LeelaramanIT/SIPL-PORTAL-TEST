import { useMemo, useState, useCallback, useEffect } from 'react';
import { sortOptionValues } from '../utils/analyticsHelpers';

const MULTI_SELECT_FIELDS = {
  consigneeNames: 'consigneeName',
  leadCrms: 'leadCrm',
  managerCrms: 'managerCrm',
  regions: 'region',
  states: 'state',
  categories: 'category',
  platforms: 'platform',
  tyreSizes: 'tyreSize',
  rimTypes: 'rimType',
  tyreTypes: 'tyreType',
  freightTypes: 'freightCharges',
};

export const INITIAL_FILTERS = {
  dateType: 'createdDate', // 'createdDate' | 'dispatchedDate'
  dateRange: null, // [dayjs, dayjs] | null
  consigneeNames: [],
  leadCrms: [],
  managerCrms: [],
  regions: [],
  states: [],
  categories: [],
  platforms: [],
  tyreSizes: [],
  rimTypes: [],
  tyreTypes: [],
  freightTypes: [],
};

const FILTER_LABELS = {
  consigneeNames: 'Customer',
  leadCrms: 'Lead CRM',
  managerCrms: 'Manager CRM',
  regions: 'Region',
  states: 'State',
  categories: 'Category',
  platforms: 'Platform',
  tyreSizes: 'Tyre Size',
  rimTypes: 'Rim Type',
  tyreTypes: 'Tyre Type',
  freightTypes: 'Freight',
};

/**
 * Owns the single centralized filter object and produces filteredData.
 * Every KPI/chart/table in the dashboard should read from filteredData —
 * no component should re-filter the raw dataset on its own.
 */
export function useCRMFilters(dataset) {
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  /** Used by charts: clicking a bar/slice adds that single value as a filter. */
  const applyPointFilter = useCallback((key, value) => {
    setFilters((prev) => {
      const current = prev[key] || [];
      if (current.includes(value)) return prev;
      return { ...prev, [key]: [...current, value] };
    });
  }, []);

  const removeFilterValue = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: (prev[key] || []).filter((v) => v !== value) }));
  }, []);

  const resetFilters = useCallback(() => setFilters(INITIAL_FILTERS), []);

  const filteredData = useMemo(() => {
    const dateField = filters.dateType;
    const [rangeStart, rangeEnd] = filters.dateRange || [null, null];

    return dataset.filter((record) => {
      if (rangeStart && rangeEnd) {
        const d = record[dateField];
        if (!d || d.isBefore(rangeStart, 'day') || d.isAfter(rangeEnd, 'day')) return false;
      }

      for (const [filterKey, recordKey] of Object.entries(MULTI_SELECT_FIELDS)) {
        const selected = filters[filterKey];
        if (selected && selected.length > 0 && !selected.includes(record[recordKey])) {
          return false;
        }
      }
      return true;
    });
  }, [dataset, filters]);

  /** Removable tag list for the active-filter chips row. */
  const activeFilterChips = useMemo(() => {
    const chips = [];
    Object.keys(MULTI_SELECT_FIELDS).forEach((filterKey) => {
      (filters[filterKey] || []).forEach((value) => {
        chips.push({ filterKey, value, label: `${FILTER_LABELS[filterKey]}: ${value}` });
      });
    });
    return chips;
  }, [filters]);

  // Determine whether a record passes all active filters except the one named excludeKey.
  const recordPassesFilters = (record, activeFilters, excludeKey = null) => {
    const dateField = activeFilters.dateType;
    const [rangeStart, rangeEnd] = activeFilters.dateRange || [null, null];

    if (rangeStart && rangeEnd) {
      const d = record[dateField];
      if (!d || d.isBefore(rangeStart, 'day') || d.isAfter(rangeEnd, 'day')) return false;
    }

    for (const [filterKey, recordKey] of Object.entries(MULTI_SELECT_FIELDS)) {
      if (filterKey === excludeKey) continue; // do not apply this filter
      const selected = activeFilters[filterKey];
      if (selected && selected.length > 0 && !selected.includes(record[recordKey])) return false;
    }
    return true;
  };

  const filterOptions = useMemo(() => {
    const options = {};
    Object.entries(MULTI_SELECT_FIELDS).forEach(([filterKey, recordKey]) => {
      const set = new Set();
      dataset.forEach((r) => {
        if (recordPassesFilters(r, filters, filterKey)) {
          const v = r[recordKey];
          if (v !== undefined && v !== null && v !== '') set.add(v);
        }
      });
      options[filterKey] = sortOptionValues(set);
    });
    return options;
  }, [dataset, filters]);

  // Remove any selected filter values that are no longer valid under the
  // current set of other active filters. This keeps filter selections sane
  // instead of leaving impossible combinations that yield empty results.
  useEffect(() => {
    let changed = false;
    const next = { ...filters };
    Object.keys(MULTI_SELECT_FIELDS).forEach((filterKey) => {
      const allowed = filterOptions[filterKey] || [];
      const sel = next[filterKey] || [];
      const pruned = sel.filter((v) => allowed.includes(v));
      if (pruned.length !== sel.length) {
        next[filterKey] = pruned;
        changed = true;
      }
    });
    if (changed) setFilters(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterOptions]);

  return {
    filters,
    setFilter,
    applyPointFilter,
    removeFilterValue,
    resetFilters,
    filteredData,
    activeFilterChips,
    filterOptions,
  };
}
