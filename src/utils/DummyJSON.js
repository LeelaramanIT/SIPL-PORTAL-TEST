export function generateTableData(count) {
    const shipmentTypes = ["COMBI",'DIRECT'];
    const locations = ["New York Warehouse", "Los Angeles Port", "Chicago Hub", "Houston Dock", "Miami Terminal"];
    const customers = ["John Doe Enterprises", "Global Tech Ltd", "Bright Future Inc", "Skyline Logistics", "NextGen Supplies"];
  
    const data = [];
  
    for (let i = 1; i <= count; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const shipmentType = shipmentTypes[Math.floor(Math.random() * shipmentTypes.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const qty = Math.floor(Math.random() * 500) + 50; // between 50 and 550
      const wt = parseFloat((Math.random() * 2000 + 100).toFixed(2)); // 100–2100.00
  
      // Generate some dates
      const baseDate = new Date(2025, 8, 1); // Sept 2025
      const completedDate = new Date(baseDate.getTime() + Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000);
      const dispatchedDate = new Date(completedDate.getTime() + Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000);
      const rfdDate = new Date(dispatchedDate.getTime() + Math.floor(Math.random() * 2) * 24 * 60 * 60 * 1000);
  
      data.push({
        custfullname: customer,
        orderRefNo: `ORD-${1000 + i}`,
        workorderno: `WO-${500 + i}`,
        completedDate: completedDate.toISOString().split("T")[0],
        dispatchedDate: dispatchedDate.toISOString().split("T")[0],
        rfD_Date: rfdDate.toISOString().split("T")[0],
        shipmentType: shipmentType,
        containerLoadFrom: location,
        totalqty: qty,
        totalwt: wt
      });
    }
  
    return data;
}