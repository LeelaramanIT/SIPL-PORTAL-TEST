function formatCustomDate(date) {
    const day = date.getDate();
    const suffix = getDaySuffix(day);
    const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
    const year = date.getFullYear().toString().slice(-2);
  
    return `${day}${suffix} ${month}-${year}`;
  }
  
  function getDaySuffix(day) {
    if (day > 3 && day < 21) return "th"; // 4th to 20th
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  }
  

  export default formatCustomDate
  