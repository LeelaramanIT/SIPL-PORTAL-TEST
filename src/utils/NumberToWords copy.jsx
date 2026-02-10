export function numberToWords(num, currencyCode) {
  const currencyMap = {
    AED: { name: { singular: 'dirham', plural: 'dirhams' }, subUnit: { singular: 'fils', plural: 'fils' } },
    AUD: { name: { singular: 'dollar', plural: 'dollars' }, subUnit: { singular: 'cent', plural: 'cents' } },
    CAD: { name: { singular: 'dollar', plural: 'dollars' }, subUnit: { singular: 'cent', plural: 'cents' } },
    CNY: { name: { singular: 'yuan', plural: 'yuan' }, subUnit: { singular: 'jiao', plural: 'jiao' } },
    EUR: { name: { singular: 'euro', plural: 'euros' }, subUnit: { singular: 'cent', plural: 'cents' } },
    EURO: { name: { singular: 'euro', plural: 'euros' }, subUnit: { singular: 'cent', plural: 'cents' } },
    GBP: { name: { singular: 'pound', plural: 'pounds' }, subUnit: { singular: 'pence', plural: 'pence' } },
    HKD: { name: { singular: 'dollar', plural: 'dollars' }, subUnit: { singular: 'cent', plural: 'cents' } },
    INR: { name: { singular: 'rupee', plural: 'rupees' }, subUnit: { singular: 'paisa', plural: 'paise' } },
    JPY: { name: { singular: 'yen', plural: 'yen' }, subUnit: { singular: 'sen', plural: 'sen' } },
    MXN: { name: { singular: 'peso', plural: 'pesos' }, subUnit: { singular: 'centavo', plural: 'centavos' } },
    NZD: { name: { singular: 'dollar', plural: 'dollars' }, subUnit: { singular: 'cent', plural: 'cents' } },
    PKR: { name: { singular: 'rupee', plural: 'rupees' }, subUnit: { singular: 'paisa', plural: 'paise' } },
    RUB: { name: { singular: 'ruble', plural: 'rubles' }, subUnit: { singular: 'kopeck', plural: 'kopecks' } },
    SGD: { name: { singular: 'dollar', plural: 'dollars' }, subUnit: { singular: 'cent', plural: 'cents' } },
    USD: { name: { singular: 'dollar', plural: 'dollars' }, subUnit: { singular: 'cent', plural: 'cents' } },
    ZAR: { name: { singular: 'rand', plural: 'rand' }, subUnit: { singular: 'cent', plural: 'cents' } },
    KRW: { name: { singular: 'won', plural: 'won' }, subUnit: { singular: 'jeon', plural: 'jeon' } },
    BRL: { name: { singular: 'real', plural: 'reais' }, subUnit: { singular: 'centavo', plural: 'centavos' } },
    SEK: { name: { singular: 'krona', plural: 'kronor' }, subUnit: { singular: 'öre', plural: 'öre' } },
    NOK: { name: { singular: 'krone', plural: 'kroner' }, subUnit: { singular: 'øre', plural: 'øre' } },
    DKK: { name: { singular: 'krone', plural: 'kroner' }, subUnit: { singular: 'øre', plural: 'øre' } },
  };

  const currency = currencyMap[currencyCode];
  if (!currency) throw new Error(`Unsupported currency code: ${currencyCode}`);

  const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ',
    'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  const convertHundreds = (num) => {
    let word = '';
    if (num >= 100) {
      word += a[Math.floor(num / 100)] + 'hundred ';
      num %= 100;
    }
    if (num >= 20) {
      word += b[Math.floor(num / 10)] + ' ';
      num %= 10;
    }
    if (num > 0) word += a[num];
    return word;
  };

  const convert = (num) => {
    if (num === 0) return 'zero';
    if (num < 0) return 'minus ' + convert(-num);

    let word = '';

    const billions = Math.floor(num / 1000000000);
    num %= 1000000000;
    if (billions > 0) word += convertHundreds(billions) + 'billion ';

    const millions = Math.floor(num / 1000000);
    num %= 1000000;
    if (millions > 0) word += convertHundreds(millions) + 'million ';

    const thousands = Math.floor(num / 1000);
    num %= 1000;
    if (thousands > 0) word += convertHundreds(thousands) + 'thousand ';

    if (num > 0) word += convertHundreds(num);

    return word.trim();
  };

  const [mainUnit, subUnit] = num.toFixed(2).split('.');
  const mainUnitWords = convert(parseInt(mainUnit, 10));
  const subUnitWords = convert(parseInt(subUnit, 10));

  const currencyName = currency.name;
  const currencySubUnitName = currency.subUnit;

  let result = '';

  // MAIN UNIT (Currency first)
  if (parseInt(mainUnit, 10) === 1) {
    result += `${currencyName.singular.toUpperCase()} `;
  } else {
    result += `${currencyName.plural.toUpperCase()} `;
  }

  result += mainUnitWords.toUpperCase();

  // SUB UNIT
  if (parseInt(subUnit, 10) > 0) {
    result += ' AND ';
    if (parseInt(subUnit, 10) === 1) {
      result += `${currencySubUnitName.singular.toUpperCase()} `;
    } else {
      result += `${currencySubUnitName.plural.toUpperCase()} `;
    }
    result += subUnitWords.toUpperCase();
  }

  return result + ' ONLY';
}
