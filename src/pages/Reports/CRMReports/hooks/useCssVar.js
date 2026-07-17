import { useEffect, useState } from 'react';

/**
 * Ant Design's ConfigProvider computes hover/active shades from colorPrimary
 * using real color math — it can't do that with a raw "var(--accent)" string,
 * it needs the resolved value. This hook reads the computed value of a CSS
 * custom property off <html>/<body> and re-reads it whenever your theme
 * class changes, so AntD stays in sync with whichever .theme-* is active.
 */
export function useCssVar(varName, fallback) {
  const [value, setValue] = useState(fallback);

  useEffect(() => {
    const read = () => {
      const resolved = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      if (resolved) setValue(resolved);
    };
    read();

    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [varName]);

  return value;
}
