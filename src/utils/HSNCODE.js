export const HSN_CODE = [
  {
    name: "Rubber Patches",
    hsn: "40169990",
    description: "Other articles of vulcanized rubber, except hard rubber"
  },
  {
    name: "Pneumatic Tyres",
    hsn: "40119900",
    description: "New pneumatic tyres of rubber - other than bicycle/motorcycle"
  },
  {
    name: "POB (Press-On Band Tyres)",
    hsn: "40129020",
    description: "SOLID INDUSTRIAL TYRES"
  },
  {
    name: "POB Wheel Assemblies",
    hsn: "87087000",
    description: "Road wheels & wheel parts for industrial and motor vehicles"
  },
  {
    name: "Tyre Moulds",
    hsn: "84807900",
    description: "Moulds for rubber or plastics – tyre moulds"
  },  
  {
    name: "Fitment Tools / Gauges",
    hsn: "82055990",
    description: "Hand tools (not elsewhere specified)"
  },
  {
    name: "Metal Components / Others",
    hsn: "73181110",
    description: "Other screws and bolts of iron or steel"
  },
  {
    name: "Handling Charges",
    hsn: "84312010",
    description: "SOLID INDUSTRIAL TYRES WITH RIM"
  },
  {
    name: "Fitment Hydraulic Press",
    hsn: "84798999",
    description: "Other machinery and mechanical appliances (industrial use)"
  }
];

// Function to get description by HSN code
export const getDescriptionByHSN = (hsnCode, isAssRimstatus) => {
  if (isAssRimstatus) {
    // Display your custom message if isAssRimstatus is true
    return "SOLID INDUSTRIAL TYRES WITH RIM ASSEMBLY";
  } else {
    // Find the matching item by HSN code and return its description
    const item = HSN_CODE.find((entry) => entry.hsn === hsnCode);
    return item ? item.description : "SOLID INDUSTRIAL TYRES";
  }
};
