const Botkit = require('botkit');
var _ = require('underscore');
const controller = Botkit.slackbot();

const token = process.env.HAIKU_BOT_SECRET;

if(!token){
	throw "No Slack token found for Haiku bot under the HAIKU_BOT_SECRET environment variable";
}

const bot = controller.spawn({
  token: token
});

bot.startRTM();

controller.on('ambient', function(bot,message){
	if(message.text){
		const words = expandMessage(message.text);
		const possibleHaiku = tryAndMakeHaiku(words);

		if(possibleHaiku){
			bot.reply(message,{
		      text: `>>>${formatMessage(possibleHaiku)}`,
		      username: "HaikuBot",
		      icon_emoji: ":writing_hand:",
		    });
		}
	}
});

function formatMessage(wordsPerSentence){
	return wordsPerSentence.map(x => x.join(' ')).join('\n');
}

function expandMessage(msg){
	return msg.split(/\s+/);
}

function getSyllablesPerWord(words) {
  return words.map(getSyllables);
}

function log(msg) {
  bot.say(
  {
    text: `\`\`\`Debug: ${msg}\`\`\``,
    channel: 'C1CPAD96Z'
  }
);
}

function tryAndMakeHaiku(words) {
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

function getSyllables(word){
	if(/:.*:/.test(word)){
		return { word: word, syllables: [word] };	
	} else {
		return { word: word, syllables: pseudoSyllables(word.replace(/[^A-Za-z\s]/g,'')) };
	}
}

const vowelBlocks = /a(?:ai?|e|u|y)?|e(?:eu?|i|u|y)?|i(?:eu?)?|o(?:ei?|i|oi?|ui?|y)?|u(?:e|i|u|y)?|y[aeiou]*/gi;

function pseudoSyllables(s) {
	const vowels = s.match(vowelBlocks) || [];
	const consonants = s.split(vowelBlocks);
	var syllables = vowels.map((v, i) => v + consonants[i + 1]);
	syllables[0] = consonants[0] + syllables[0];
	return syllables;
}
