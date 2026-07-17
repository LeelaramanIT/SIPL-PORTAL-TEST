import { useMemo } from 'react';
import { sum, average, groupBy, percent } from '../utils/analyticsHelpers';
import { dispatchBucketFor, DISPATCH_BUCKETS } from '../utils/dateHelpers';

const mode = (values) => {
  const counts = new Map();
  values.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
  let best = null;
  let bestCount = 0;
  counts.forEach((count, value) => {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  });
  return best;
};

/** Aggregates a group of records into the common metric set used across every performance chart. */
const aggregateGroup = (records) => {
  const totalSales = sum(records, 'totalPrice');
  const tyresSold = sum(records, 'tyreCount');
  return {
    totalSales,
    tyresSold,
    orderCount: records.length,
    customerCount: new Set(records.map((r) => r.consigneeName)).size,
    avgOrderValue: records.length ? totalSales / records.length : 0,
    avgRate: average(records, 'ratePerTyre'),
    // Revenue-weighted average selling price per tyre (distinct from avgRate,
    // which averages the per-record unit rate field directly).
    avgSellingPrice: tyresSold ? totalSales / tyresSold : 0,
  };
};

const buildPerformance = (records, recordKey) => {
  const groups = groupBy(records, (r) => r[recordKey]);
  return Array.from(groups.entries()).map(([key, groupRecords]) => ({
    key,
    ...aggregateGroup(groupRecords),
  }));
};

export function useCRMAnalytics(filteredData) {
  return useMemo(() => {
    const totalSales = sum(filteredData, 'totalPrice');
    const totalTyres = sum(filteredData, 'tyreCount');
    const totalWeight = sum(filteredData, 'totalWeight');
    const activeCustomers = new Set(filteredData.map((r) => r.consigneeName)).size;
    const validDispatch = filteredData.filter((r) => r.dispatchDays !== null);

    const kpis = {
      totalSales,
      totalTyres,
      totalRecords: filteredData.length,
      activeCustomers,
      avgOrderValue: filteredData.length ? totalSales / filteredData.length : 0,
      avgRatePerTyre: average(filteredData, 'ratePerTyre'),
      totalWeight,
      avgDispatchDays: validDispatch.length ? average(validDispatch, 'dispatchDays') : null,
    };

    const leadCrmPerformance = buildPerformance(filteredData, 'leadCrm');
    const managerCrmPerformance = buildPerformance(filteredData, 'managerCrm');
    const regionPerformance = buildPerformance(filteredData, 'region');
    const statePerformance = buildPerformance(filteredData, 'state');
    const categoryPerformance = buildPerformance(filteredData, 'category').map((g) => ({
      ...g,
      salesShare: percent(g.totalSales, totalSales),
    }));
    const tyreSizePerformance = buildPerformance(filteredData, 'tyreSize');
    const platformPerformance = buildPerformance(filteredData, 'platform');
    const rimTypePerformance = buildPerformance(filteredData, 'rimType');
    const tyreTypePerformance = buildPerformance(filteredData, 'tyreType');
    const freightPerformance = buildPerformance(filteredData, 'freightCharges');

    const customerGroups = groupBy(filteredData, (r) => r.consigneeName);
    const customerPerformance = Array.from(customerGroups.entries()).map(([key, records]) => ({
      key,
      ...aggregateGroup(records),
      region: mode(records.map((r) => r.region)),
      leadCrm: mode(records.map((r) => r.leadCrm)),
    }));

    const dispatchBucketCounts = new Map(DISPATCH_BUCKETS.map((b) => [b.label, 0]));
    validDispatch.forEach((r) => {
      const bucket = dispatchBucketFor(r.dispatchDays);
      if (bucket) dispatchBucketCounts.set(bucket, dispatchBucketCounts.get(bucket) + 1);
    });
    const dispatchBuckets = DISPATCH_BUCKETS.map((b) => ({
      label: b.label,
      count: dispatchBucketCounts.get(b.label),
      percentage: percent(dispatchBucketCounts.get(b.label), validDispatch.length),
    }));

    return {
      kpis,
      leadCrmPerformance,
      managerCrmPerformance,
      regionPerformance,
      statePerformance,
      categoryPerformance,
      tyreSizePerformance,
      platformPerformance,
      rimTypePerformance,
      tyreTypePerformance,
      freightPerformance,
      customerPerformance,
      dispatchBuckets,
      validDispatchRecords: validDispatch,
    };
  }, [filteredData]);
}
