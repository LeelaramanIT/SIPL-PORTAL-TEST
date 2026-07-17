/**
 * Every color here is a CSS var() or color-mix() expression, not a hex code —
 * charts render whichever .theme-* class is active on <html>/<body> with no
 * extra wiring, since the browser resolves these at paint time.
 */
export const CHART_GRID = 'var(--border)';
export const CHART_AXIS_TEXT = 'color-mix(in srgb, var(--foreground) 60%, transparent)';
export const CHART_LABEL_TEXT = 'color-mix(in srgb, var(--foreground) 85%, transparent)';
export const CHART_HOVER_FILL = 'color-mix(in srgb, var(--foreground) 6%, transparent)';
export const CHART_TOOLTIP_BG = 'color-mix(in srgb, var(--foreground) 92%, transparent)';

/** Tonal ramp built off the active accent, so multi-series charts stay on-brand for any theme. */
export const CHART_PALETTE = [
  'var(--accent)',
  'color-mix(in srgb, var(--accent) 70%, white)',
  'color-mix(in srgb, var(--primary) 75%, var(--accent) 25%)',
  'color-mix(in srgb, var(--accent) 55%, black)',
  'color-mix(in srgb, var(--accent) 40%, white)',
  'color-mix(in srgb, var(--primary) 40%, black)',
  'var(--destructive)',
  'color-mix(in srgb, var(--destructive) 55%, var(--accent) 45%)',
];

// Kept as fixed, theme-independent signal colors — up/down indicators are
// conventionally green/red regardless of brand accent.
export const POSITIVE_COLOR = '#059669';
export const NEGATIVE_COLOR = 'var(--destructive)';
