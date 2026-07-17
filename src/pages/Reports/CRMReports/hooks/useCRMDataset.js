import { useEffect, useState } from 'react';
import { normalizeDataset } from '../utils/crmDataNormalizer';

/**
 * Loads the raw CRM sales feed and normalizes it once.
 * Swap the fetch URL below for the real .NET endpoint (e.g. via the
 * project's existing axios instance) when wiring this into the live app —
 * everything downstream already consumes the normalized shape either way.
 */
export function useCRMDataset() {
  const [dataset, setDataset] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const backendUrl = 'http://localhost:4000' || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5300';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const loadRecords = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/crm-sales/domestic-sales`);
        if (!res.ok) throw new Error(`Failed to load sales data (${res.status})`);

        const raw = await res.json();
        const records = Array.isArray(raw) ? raw : raw?.data;
        if (!Array.isArray(records)) {
          throw new Error('Unexpected sales data format from backend');
        }

        if (!cancelled) {
          setDataset(normalizeDataset(records));
          setError(null);
        }
      } catch (backendErr) {
        try {
          const fallbackRes = await fetch('/data/sales.json');
          if (!fallbackRes.ok) throw new Error(`Failed to load local sales data (${fallbackRes.status})`);

          const fallbackRaw = await fallbackRes.json();
          const fallbackRecords = Array.isArray(fallbackRaw) ? fallbackRaw : fallbackRaw?.data;

          if (!Array.isArray(fallbackRecords)) {
            throw new Error('Unexpected sales data format from local fallback');
          }

          if (!cancelled) {
            setDataset(normalizeDataset(fallbackRecords));
            setError(null);
          }
        } catch (fallbackErr) {
          if (!cancelled) {
            setError(`Unable to load sales data. Backend: ${backendErr.message}. Fallback: ${fallbackErr.message}`);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadRecords();

    return () => {
      cancelled = true;
    };
  }, [backendUrl]);

  return { dataset, loading, error };
}
