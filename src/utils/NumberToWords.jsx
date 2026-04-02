export function numberToWords(num, currencyCode) {
  const currencyMap = {
    AED: { subUnit: { singular: "fils", plural: "fils" } },
    AUD: { subUnit: { singular: "cent", plural: "cents" } },
    CAD: { subUnit: { singular: "cent", plural: "cents" } },
    CNY: { subUnit: { singular: "jiao", plural: "jiao" } },
    EUR: { subUnit: { singular: "cent", plural: "cents" } },
    EURO: { subUnit: { singular: "cent", plural: "cents" } },
    GBP: { subUnit: { singular: "pence", plural: "pence" } },
    INR: { subUnit: { singular: "paisa", plural: "paise" } },
    JPY: { subUnit: { singular: "", plural: "" } }, // no decimals normally
    NZD: { subUnit: { singular: "cent", plural: "cents" } },
    RUB: { subUnit: { singular: "kopeck", plural: "kopecks" } },
    SGD: { subUnit: { singular: "cent", plural: "cents" } },
    USD: { subUnit: { singular: "cent", plural: "cents" } },
    ZAR: { subUnit: { singular: "cent", plural: "cents" } },
    KRW: { subUnit: { singular: "", plural: "" } },
    CHF: { subUnit: { singular: "rappen", plural: "rappen" } },
    SAR: { subUnit: { singular: "halala", plural: "halalas" } },
  };

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

  const convert = (n) => {
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

  const [mainPart, decimalPart] = Number(num).toFixed(2).split(".");
  const mainNumber = parseInt(mainPart, 10);
  const decimalNumber = parseInt(decimalPart, 10);

  let result = currencyCode + " ";
  result += convert(mainNumber).trim().toUpperCase();

  if (decimalNumber > 0 && currency.subUnit.singular) {
    result += " AND ";
    result += convert(decimalNumber).trim().toUpperCase() + " ";
    result +=
      decimalNumber === 1
        ? currency.subUnit.singular.toUpperCase()
        : currency.subUnit.plural.toUpperCase();
  }

  return result + " ONLY";
}
