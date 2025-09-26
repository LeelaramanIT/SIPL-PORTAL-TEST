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

export const data = {
  type: "Export",
  custfullname: "Global Tech Ltd",
  orderRefNo: "ORD-2025-001",
  workorderno: "WO-789",
  completedDate: "2025-09-01",
  dispatchedDate: "2025-09-03",
  rfD_Date: "2025-09-05",
  shipmentType: "COMBI",
  usercurrency: "EUR",

  billingCompanyName: "Global Tech Ltd",
  billingAddress: "123 Tech Park~Building 5~Floor 3",
  billingCity: "New York",
  billingState: "NY",
  billingCountry: "USA",
  billingZipcode: "10001",
  billingContactName: "John Doe",
  billingEmailId: "john.doe@globaltech.com",
  billingMobile: "+1-212-555-7890",

  shippingCompanyName: "Skyline Logistics",
  shippingAddress: "Warehouse 12~Dock B~Industrial Area",
  shippingCity: "Los Angeles",
  shippingState: "CA",
  shippingCountry: "USA",
  shippingZipcode: "90021",
  shippingContactName: "Jane Smith",
  shippingEmailId: "jane.smith@skyline.com",
  shippingMobile: "+1-310-555-1234",
  PreCarriageby: "sea",

  splIns: "Handle with care - Fragile items",
  specialRequset: "Deliver before end of September",

  items: [
    {
      category: "Tyre",
      platforms: "Truck",
      tyreSize: "295/80R22.5",
      tyreRim: "22.5",
      tyreType: "Radial",
      brand: "Michelin",
      sidewall: "Black",
      basicprice: 150.75,
      itemQty: 20,
      finishedWt: 45.6,
      rimItemQty: 0,
      rimUnitPrice: 0,
      additionalInfo: "High performance tyres",
      plant: "Plant-A",
      itemCode: "TYR-MIC-29580R22-1",
      o_itemid: 1,
    },
    {
      category: "Tyre",
      platforms: "Bus",
      tyreSize: "315/80R22.5",
      tyreRim: "22.5",
      tyreType: "Radial",
      brand: "Bridgestone",
      sidewall: "White",
      basicprice: 175.5,
      itemQty: 15,
      finishedWt: 50.2,
      rimItemQty: 2,
      rimUnitPrice: 30,
      additionalInfo: "",
      plant: "Plant-B",
      itemCode: "TYR-BRD-31580R22-2",
      o_itemid: 2,
    },
    {
      category: "Rim",
      platforms: "Truck",
      tyreSize: "22.5 Rim",
      tyreRim: "22.5",
      tyreType: "Steel",
      brand: "Tata Steel",
      sidewall: "N/A",
      basicprice: 90.25,
      itemQty: 10,
      finishedWt: 25.3,
      rimItemQty: 10,
      rimUnitPrice: 90.25,
      additionalInfo: "Heavy duty rims",
      plant: "Plant-A",
      itemCode: "RIM-TATA-22-3",
      o_itemid: 3,
    },
    {
      category: "Tyre",
      platforms: "Truck",
      tyreSize: "295/80R22.5",
      tyreRim: "22.5",
      tyreType: "Radial",
      brand: "Michelin",
      sidewall: "Black",
      basicprice: 150.75,
      itemQty: 20,
      finishedWt: 45.6,
      rimItemQty: 0,
      rimUnitPrice: 0,
      additionalInfo: "High performance tyres",
      plant: "Plant-A",
      itemCode: "TYR-MIC-29580R22-4",
      o_itemid: 4,
    },
  ],
};