export const uniqueValues = (records, key) => {
  const set = new Set();
  records.forEach((r) => {
    if (r[key] !== undefined && r[key] !== null && r[key] !== '') set.add(r[key]);
  });
  return Array.from(set).sort((a, b) => String(a).localeCompare(String(b)));
};

export const sum = (records, key) => records.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);

export const average = (records, key) => (records.length ? sum(records, key) / records.length : 0);

/**
 * Groups records by the value returned from keyFn, and reduces each group
 * with reducer (defaults to just returning the group's records).
 */
export const groupBy = (records, keyFn) => {
  const map = new Map();
  records.forEach((r) => {
    const k = keyFn(r);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(r);
  });
  return map;
};

/** Indian numbering: ₹1.25 Cr / ₹45.6 L / ₹85.2 K */
export const currencyFormat = (value) => {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(2)} L`;
  if (abs >= 1e3) return `${sign}₹${(abs / 1e3).toFixed(1)} K`;
  return `${sign}₹${abs.toFixed(0)}`;
};

export const numberFormat = (value, decimals = 0) => {
  const n = Number(value) || 0;
  const safeDecimals = Number.isInteger(decimals) && decimals >= 0 && decimals <= 20 ? decimals : 0;
  return n.toLocaleString('en-IN', { maximumFractionDigits: safeDecimals, minimumFractionDigits: safeDecimals });
};

export const compactNumberFormat = (value) => {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  if (abs >= 1e7) return `${(n / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `${(n / 1e5).toFixed(2)} L`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(1)} K`;
  return numberFormat(n);
};

/**
 * Sorts a Map produced by groupBy-style aggregation into an array of
 * { key, ...metrics } sorted desc by sortKey, optionally capped to topN.
 */
export const toSortedArray = (aggregateMap, sortKey, topN) => {
  const arr = Array.from(aggregateMap.values()).sort((a, b) => b[sortKey] - a[sortKey]);
  return topN ? arr.slice(0, topN) : arr;
};

export const percent = (part, whole) => (whole > 0 ? (part / whole) * 100 : 0);

/**
 * Sorts filter/column option values. If every value parses as a finite
 * number (e.g. Rim Type's "2.50", "10.00"), sorts numerically ascending so
 * options read in size order instead of alphabetically ("10.00" before
 * "2.00"). Otherwise falls back to locale string sort.
 */
export const sortOptionValues = (values) => {
  const arr = Array.from(values);
  const allNumeric = arr.length > 0 && arr.every((v) => v !== '' && Number.isFinite(Number(v)));
  if (allNumeric) return arr.sort((a, b) => Number(a) - Number(b));
  return arr.sort((a, b) => String(a).localeCompare(String(b)));
};
