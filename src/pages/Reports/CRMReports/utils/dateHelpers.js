import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear.js';
import weekOfYear from 'dayjs/plugin/weekOfYear.js';
import isoWeek from 'dayjs/plugin/isoWeek.js';

dayjs.extend(quarterOfYear);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

export const DATE_PRESETS = [
  { label: 'Today', getRange: () => [dayjs().startOf('day'), dayjs().endOf('day')] },
  { label: 'Yesterday', getRange: () => [dayjs().subtract(1, 'day').startOf('day'), dayjs().subtract(1, 'day').endOf('day')] },
  { label: 'Last 7 Days', getRange: () => [dayjs().subtract(6, 'day').startOf('day'), dayjs().endOf('day')] },
  { label: 'Last 30 Days', getRange: () => [dayjs().subtract(29, 'day').startOf('day'), dayjs().endOf('day')] },
  { label: 'This Month', getRange: () => [dayjs().startOf('month'), dayjs().endOf('month')] },
  { label: 'Last Month', getRange: () => [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
  { label: 'This Quarter', getRange: () => [dayjs().startOf('quarter'), dayjs().endOf('quarter')] },
  { label: 'This Year', getRange: () => [dayjs().startOf('year'), dayjs().endOf('year')] },
];

/** Bucket key + display label for a given date at a given granularity. */
export const bucketForDate = (date, granularity) => {
  switch (granularity) {
    case 'daily':
      return { key: date.format('YYYY-MM-DD'), label: date.format('DD MMM') };
    case 'weekly': {
      const weekStart = date.startOf('week');
      return { key: weekStart.format('YYYY-[W]WW'), label: `${weekStart.format('DD MMM')}` };
    }
    case 'monthly':
      return { key: date.format('YYYY-MM'), label: date.format('MMM YYYY') };
    case 'quarterly':
      return { key: `${date.year()}-Q${date.quarter()}`, label: `Q${date.quarter()} ${date.year()}` };
    case 'yearly':
      return { key: date.format('YYYY'), label: date.format('YYYY') };
    default:
      return { key: date.format('YYYY-MM-DD'), label: date.format('DD MMM') };
  }
};

/**
 * Groups records into time buckets by dateKey field ('createdDate' | 'dispatchedDate'),
 * returning a chronologically sorted array with the aggregated metrics already computed.
 */
export const groupDataByDate = (records, dateField, granularity, aggregator) => {
  const buckets = new Map();
  records.forEach((r) => {
    const date = r[dateField];
    if (!date) return;
    const { key, label } = bucketForDate(date, granularity);
    if (!buckets.has(key)) buckets.set(key, { key, label, sortDate: date, records: [] });
    buckets.get(key).records.push(r);
  });

  return Array.from(buckets.values())
    .sort((a, b) => a.sortDate.valueOf() - b.sortDate.valueOf())
    .map((bucket) => ({ label: bucket.label, ...aggregator(bucket.records) }));
};

export const DISPATCH_BUCKETS = [
  { label: 'Same Day', test: (d) => d === 0 },
  { label: '1-3 Days', test: (d) => d >= 1 && d <= 3 },
  { label: '4-7 Days', test: (d) => d >= 4 && d <= 7 },
  { label: '8-15 Days', test: (d) => d >= 8 && d <= 15 },
  { label: 'Above 15 Days', test: (d) => d > 15 },
];

export const dispatchBucketFor = (days) => {
  if (days === null || days === undefined) return null;
  return DISPATCH_BUCKETS.find((b) => b.test(days))?.label ?? null;
};
