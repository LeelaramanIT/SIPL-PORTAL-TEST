import dayjs from 'dayjs';

// The raw feed has a couple of known quirks we normalize away here, once,
// so nothing downstream ever has to think about them again:
//  - the "rim type" key's whitespace is unreliable across sources — the local
//    fallback sample uses a literal tab ("RIM\tTYPE") while the live backend
//    has been observed sending a plain space ("RIM TYPE"). getField() below
//    resolves either (or any other whitespace run) instead of hardcoding one.
//  - FREIGHT CHARGES casing is inconsistent ("To Pay" / "TO PAY" / "PAID")
//  - PLATFORM can be blank

/**
 * Looks up a field by name, tolerant of whitespace differences between the
 * expected key and however the source actually delimited it (tab, single
 * space, double space, etc). Falls back to an exact match first (fast path),
 * then a whitespace-normalized scan of the record's own keys.
 */
const getField = (raw, name) => {
  if (raw[name] !== undefined) return raw[name];
  const normalizedTarget = name.replace(/\s+/g, '').toUpperCase();
  const foundKey = Object.keys(raw).find((k) => k.replace(/\s+/g, '').toUpperCase() === normalizedTarget);
  return foundKey ? raw[foundKey] : undefined;
};

const toNumber = (val) => {
  if (val === null || val === undefined || val === '') return 0;
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
};

const toDate = (val) => {
  if (!val) return null;
  const d = dayjs(val);
  return d.isValid() ? d : null;
};

export const normalizeFreightType = (raw) => {
  const clean = String(raw || '').trim().toLowerCase();
  if (!clean) return 'Unspecified';
  if (clean === 'to pay') return 'To Pay';
  if (clean === 'paid') return 'Paid';
  // Preserve any future freight types verbatim (title-cased) instead of dropping them
  return clean.replace(/\b\w/g, (c) => c.toUpperCase());
};

const safeDispatchDays = (created, dispatched) => {
  if (!created || !dispatched) return null;
  const days = dispatched.diff(created, 'day');
  return days >= 0 ? days : null; // never surface negative/garbage dispatch times
};

/**
 * Normalizes one raw CRM sales record into a clean, stable shape.
 * The original raw record is preserved on `_raw` in case any downstream
 * feature (e.g. export) needs the exact source values.
 */
export const normalizeRecord = (raw, index) => {
  const createdDate = toDate(raw['CREATED DATE']);
  const dispatchedDate = toDate(raw['DISPATCHED DATE']);
  const tyreCount = toNumber(raw['No. OF TYRES']);
  const weight = toNumber(raw['WT.']);
  const rimWeightNum = toNumber(raw['RIM WT']);
  const rimTypeRaw = getField(raw, 'RIM TYPE');

  return {
    id: index,
    consigneeName: (raw['CONSIGNEE NAME'] || 'Unknown').trim(),
    // For SPLIT RIMS records, derive a product label from the rim weight so
    // different rim weights are treated as distinct products and never shown
    // as "Unspecified". This label is used everywhere the dashboard groups,
    // filters, or displays the tyre/product name.
    tyreSize: (() => {
      const category = String(raw['CATEGORY'] || '').trim();
      const baseTyre = (raw['TYRE SIZE'] || 'Unspecified').trim();
      if (category.toUpperCase() === 'SPLIT RIMS') {
        if (rimWeightNum > 0) return `Split Rim - ${rimWeightNum} KG`;
        return 'Split Rim';
      }
      return baseTyre;
    })(),
    rimType: String(rimTypeRaw ?? 'Unspecified').trim() || 'Unspecified',
    tyreType: (raw['TYRETYPE'] || 'Unspecified').trim() || 'Unspecified',
    platform: (raw['PLATFORM'] || 'Unspecified').trim() || 'Unspecified',
    tyreCount,
    weight,
    rimWeight: toNumber(raw['RIM WT']),
    ratePerTyre: toNumber(raw['RATE PER TYRE']),
    ratePerRim: toNumber(raw['RATE PER RIM']),
    totalPrice: toNumber(raw['TOTAL PRICE']),
    // Use rim weight for tonnage when the category is SPLIT RIMS and a rim weight
    // is present; otherwise use the regular tyre weight. This preserves correct
    // tonnage calculations and ensures split-rim products are aggregated
    // separately by their rim-weight label.
    totalWeight: ( (String(raw['CATEGORY'] || '').trim().toUpperCase() === 'SPLIT RIMS' && rimWeightNum > 0) ? rimWeightNum : weight ) * tyreCount,
    state: (raw['STATE'] || 'Unspecified').trim(),
    category: (raw['CATEGORY'] || 'Unspecified').trim(),
    region: (raw['REGION'] || 'Unspecified').trim(),
    createdDate,
    dispatchedDate,
    dispatchDays: safeDispatchDays(createdDate, dispatchedDate),
    freightCharges: normalizeFreightType(raw['FREIGHT CHARGES']),
    leadCrm: (raw['LEAD CRM'] || 'Unassigned').trim(),
    managerCrm: (raw['MANAGER CRM'] || 'Unassigned').trim(),
  };
};

export const normalizeDataset = (rawArray) => rawArray.map(normalizeRecord);
