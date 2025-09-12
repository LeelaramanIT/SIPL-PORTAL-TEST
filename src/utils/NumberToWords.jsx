export function numberToWords(num) {
  const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
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
    if (num > 0) {
      word += a[num];
    }
    return word;
  };

  const convert = (num) => {
    if (num === 0) return 'zero';
    if (num < 0) return 'minus ' + convert(-num);

    let word = '';
    const billions = Math.floor(num / 1000000000);
    num %= 1000000000;
    if (billions > 0) {
      word += convertHundreds(billions) + 'billion ';
    }

    const millions = Math.floor(num / 1000000);
    num %= 1000000;
    if (millions > 0) {
      word += convertHundreds(millions) + 'million ';
    }

    const thousands = Math.floor(num / 1000);
    num %= 1000;
    if (thousands > 0) {
      word += convertHundreds(thousands) + 'thousand ';
    }

    if (num > 0) {
      word += convertHundreds(num);
    }

    return word.trim();
  };

  const [dollars, cents] = num.toFixed(2).split('.');
  const dollarWords = convert(parseInt(dollars, 10));
  const centWords = convert(parseInt(cents, 10));

  let result = dollarWords.toUpperCase() + ' DOLLARS';
  if (cents > 0) {
    result += ` AND ${centWords.toUpperCase()} CENTS`;
  }
  
  return result + ' ONLY';
}