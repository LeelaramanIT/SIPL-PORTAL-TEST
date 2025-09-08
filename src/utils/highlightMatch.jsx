export const highlightMatch = (text, query) => {
    
  if (!query || typeof text !== "string" && typeof text !== "number") return text;

  // Escape special regex characters in the query string
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const regex = new RegExp(`(${escapedQuery})`, "gi");
  const parts = String(text).split(regex);

  return parts.map((part, i) =>
    part.toString().toLowerCase().trim() === query.toString().toLowerCase().trim() ? (
      <span key={i} className="bg-[var(--color-primary-hover)]/30 text-[var(--color-text-hover)] font-semibold rounded px-1">
        {part}
      </span>
    ) : (
      part
    )
  );
};