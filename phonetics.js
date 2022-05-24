const phoneticTable = {
  'анна': 'a',
  'антон': 'a',
  'алексей': 'a',
  'борис': 'b',
  'семен': 'c',
  'цапля': 'c',
  'дмитрий': 'd',
  'елена': 'e',
  'федор': 'f',
  'фёдор': 'f',
  'харитон': 'x',
}

// 0xfB2A2c470d75f6Fc1cb85A592840D960C000e94c

module.exports = (tokens) => {
  return tokens.map((token) => {
    if (!isNaN(token)) {
      return parseInt(token);
    } else {
      const lowerToken = token.toLowerCase();

      if (phoneticTable.hasOwnProperty(lowerToken)) {
        return phoneticTable[lowerToken];
      } else {
        return ' не расслышала ';
      }
    }
  }).join()
}
