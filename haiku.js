function formatMessage(wordsPerSentence){
  return wordsPerSentence.map(x => x.join(' ')).join('\n');
}

function expandMessage(msg){
  return msg.split(/\s+/).filter(x => x.length > 0 && x != "\u200B");
}

function getSyllablesPerWord(words) {
  return words.map(getSyllables);
}

function tryAndMakeHaiku(words, log) {
  const syllablesPerWord = getSyllablesPerWord(words);
  const totalSyllables = syllablesPerWord.reduce((prev, cur) => prev + cur.syllables.length, 0);

  if(totalSyllables == 17){
    try {
      [firstSentence, restA] = takeNSyllablesFromList(syllablesPerWord, 5);
      [secondSentence, restB] = takeNSyllablesFromList(restA, 7);
      [thirdSentence, restC] = takeNSyllablesFromList(restB, 5);

      return [firstSentence, secondSentence, thirdSentence];
    } catch(err) {

      log(`17 syllables, but can't create Haiku while still respecting word boundaries: ${formatLogMessage(syllablesPerWord, totalSyllables)}`);
      return undefined;
    }
  } else {
    if (totalSyllables > 12 && totalSyllables < 20) {
      log(formatLogMessage(syllablesPerWord, totalSyllables));
    }
    return undefined;
  }
}

function formatLogMessage(syllablesPerWord, totalSyllables) {
  const msg = syllablesPerWord.map(x => x.syllables.join("-")).join(" ");
  return `${msg} (total: ${totalSyllables})`;
}

function takeNSyllablesFromList(list, n) {
  function recurse(l, sentence, syllableCount) {
    [a, ...rest] = l;

    const sum = syllableCount + a.syllables.length;
    const newSentence = sentence.concat([a.word]);

    if(sum < n) {
      return recurse(rest, newSentence, sum);
    } else if(sum == n){
      return [newSentence, rest];
    } else if(sum > n){
      throw `Can't form a sentence with exactly ${n} syllables from these words`;
    }
  }

  return recurse(list, [], 0);
}

const emoji = /:.*:/;
const punctuation = /(-|–|'|"|:|;)/;

function getSyllables(word){
  if(emoji.test(word)){
    return { word: word, syllables: [word] };
  } else if(punctuation.test(word)) {
    return { word: word, syllables: [] };
  } else {
    return { word: word, syllables: pseudoSyllables(word.replace(/[^A-Za-z\s]/g, '')) };
  }
}

const vowelBlocks = /a(?:ai?|e|i|u|y)?|e(?:eu?|i|u|y)?|i(?:eu?)?|o(?:ei?|i|oi?|ui?|y)?|u(?:e|i|u|y)?|y[aeiou]*/gi;

function pseudoSyllables(s) {
  const vowels = s.match(vowelBlocks) || [];
  const consonants = s.split(vowelBlocks);
  var syllables = vowels.map((v, i) => v + consonants[i + 1]);
  syllables[0] = consonants[0] + syllables[0];
  return syllables;
}

module.exports = {
  tryAndMakeHaiku: tryAndMakeHaiku,
  expandMessage: expandMessage,
  formatMessage: formatMessage,
};