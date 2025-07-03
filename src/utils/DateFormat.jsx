function formatCustomDate(dateStr) {
    const [day, month, year] = dateStr?.split("-");
    const date = new Date(`${year}-${month}-${day}`); // Parse string to Date object
  
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
  