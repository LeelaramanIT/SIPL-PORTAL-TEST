export function numberToWords(num, currencyCode) {
  const currencyMap = {
    AED: { mainUnit: { singular: "dirham", plural: "dirhams" }, subUnit: { singular: "fils", plural: "fils" } },
    AUD: { mainUnit: { singular: "dollar", plural: "dollars" }, subUnit: { singular: "cent", plural: "cents" } },
    CAD: { mainUnit: { singular: "dollar", plural: "dollars" }, subUnit: { singular: "cent", plural: "cents" } },
    CNY: { mainUnit: { singular: "yuan", plural: "yuan" }, subUnit: { singular: "jiao", plural: "jiao" } },
    EUR: { mainUnit: { singular: "euro", plural: "euros" }, subUnit: { singular: "cent", plural: "cents" } },
    EURO: { mainUnit: { singular: "euro", plural: "euros" }, subUnit: { singular: "cent", plural: "cents" } },
    GBP: { mainUnit: { singular: "pound", plural: "pounds" }, subUnit: { singular: "pence", plural: "pence" } },
    INR: { mainUnit: { singular: "rupee", plural: "rupees" }, subUnit: { singular: "paisa", plural: "paise" } },
    JPY: { mainUnit: { singular: "yen", plural: "yen" }, subUnit: { singular: "", plural: "" } },
    NZD: { mainUnit: { singular: "dollar", plural: "dollars" }, subUnit: { singular: "cent", plural: "cents" } },
    RUB: { mainUnit: { singular: "ruble", plural: "rubles" }, subUnit: { singular: "kopeck", plural: "kopecks" } },
    SGD: { mainUnit: { singular: "dollar", plural: "dollars" }, subUnit: { singular: "cent", plural: "cents" } },
    USD: { mainUnit: { singular: "dollar", plural: "dollars" }, subUnit: { singular: "cent", plural: "cents" } },
    ZAR: { mainUnit: { singular: "rand", plural: "rand" }, subUnit: { singular: "cent", plural: "cents" } },
    KRW: { mainUnit: { singular: "won", plural: "won" }, subUnit: { singular: "", plural: "" } },
    CHF: { mainUnit: { singular: "franc", plural: "francs" }, subUnit: { singular: "rappen", plural: "rappen" } },
    SAR: { mainUnit: { singular: "riyal", plural: "riyals" }, subUnit: { singular: "halala", plural: "halalas" } },
    PKR: { mainUnit: { singular: "rupee", plural: "rupees" }, subUnit: { singular: "paisa", plural: "paise" } },
    NPR: { mainUnit: { singular: "rupee", plural: "rupees" }, subUnit: { singular: "paisa", plural: "paise" } },
    BDT: { mainUnit: { singular: "taka", plural: "taka" }, subUnit: { singular: "paisa", plural: "paise" } },
    LKR: { mainUnit: { singular: "rupee", plural: "rupees" }, subUnit: { singular: "cent", plural: "cents" } },
  };

  // Currencies that use the Indian numbering system (lakh / crore)
  // instead of the international system (thousand / million / billion)
  const indianNumberingCurrencies = ["INR", "PKR", "NPR", "BDT", "LKR"];

  const safeCurrencyCode = currencyCode || "USD"; // fallback
  const currency = currencyMap[safeCurrencyCode];

  // if still not found → fallback silently
  if (!currency) {
    return `${safeCurrencyCode} ${Number(num || 0).toFixed(2)} ONLY`;
  }

  const ones = [
    "",
    "one ",
    "two ",
    "three ",
    "four ",
    "five ",
    "six ",
    "seven ",
    "eight ",
    "nine ",
    "ten ",
    "eleven ",
    "twelve ",
    "thirteen ",
    "fourteen ",
    "fifteen ",
    "sixteen ",
    "seventeen ",
    "eighteen ",
    "nineteen ",
  ];

  const tens = [
    "",
    "",
    "twenty ",
    "thirty ",
    "forty ",
    "fifty ",
    "sixty ",
    "seventy ",
    "eighty ",
    "ninety ",
  ];

  const convertHundreds = (n) => {
    let str = "";
    if (n > 99) {
      str += ones[Math.floor(n / 100)] + "hundred ";
      n %= 100;
    }
    if (n > 19) {
      str += tens[Math.floor(n / 10)];
      n %= 10;
    }
    if (n > 0) {
      str += ones[n];
    }
    return str;
  };

  // International system: thousand / million / billion
  const convertInternational = (n) => {
    if (n === 0) return "zero ";
    let str = "";

    const billions = Math.floor(n / 1000000000);
    n %= 1000000000;
    if (billions) str += convertHundreds(billions) + "billion ";

    const millions = Math.floor(n / 1000000);
    n %= 1000000;
    if (millions) str += convertHundreds(millions) + "million ";

    const thousands = Math.floor(n / 1000);
    n %= 1000;
    if (thousands) str += convertHundreds(thousands) + "thousand ";

    if (n) str += convertHundreds(n);

    return str;
  };

  // Indian system: thousand / lakh / crore
  const convertIndian = (n) => {
    if (n === 0) return "zero ";
    let str = "";

    const crore = Math.floor(n / 10000000);
    n %= 10000000;
    if (crore) str += convertHundreds(crore) + "crore ";

    const lakh = Math.floor(n / 100000);
    n %= 100000;
    if (lakh) str += convertHundreds(lakh) + "lakh ";

    const thousand = Math.floor(n / 1000);
    n %= 1000;
    if (thousand) str += convertHundreds(thousand) + "thousand ";

    if (n) str += convertHundreds(n);

    return str;
  };

  const useIndianSystem = indianNumberingCurrencies.includes(safeCurrencyCode);
  const convert = useIndianSystem ? convertIndian : convertInternational;

  const [mainPart, decimalPart] = Number(num).toFixed(2).split(".");
  const mainNumber = parseInt(mainPart, 10);
  const decimalNumber = parseInt(decimalPart, 10);

  let result = currencyCode + " ";
  result += convert(mainNumber).trim().toUpperCase();

  // ✅ Add main unit name (dollars, rupees, etc.)
  result += " " + (mainNumber === 1
    ? currency.mainUnit.singular
    : currency.mainUnit.plural
  ).toUpperCase();

  if (decimalNumber > 0 && currency.subUnit.singular) {
    result += " AND ";
    result += convert(decimalNumber).trim().toUpperCase() + " ";
    result += (decimalNumber === 1
      ? currency.subUnit.singular
      : currency.subUnit.plural
    ).toUpperCase();
  }

  return result + " ONLY";
}