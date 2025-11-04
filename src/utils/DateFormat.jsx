function formatCustomDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string" || !dateStr.includes("-")) {
    return ""; // Return a fallback or handle gracefully
  }

  const parts = dateStr.split("-");
  if (parts.length !== 3) {
    return ""; // Invalid date format
  }

  const [day, month, year] = parts;

  const date = new Date(`${year}-${month}-${day}`);
  if (isNaN(date)) return ""; // Invalid date

  const dayNum = date.getDate();
  const suffix = getDaySuffix(dayNum);
  const monthStr = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const yearStr = date.getFullYear().toString().slice(-2);

  return `${dayNum}${suffix} ${monthStr}-${yearStr}`;
}

function getDaySuffix(day) {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

export default formatCustomDate;
