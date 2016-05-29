const Botkit = require('botkit');
const Hyphenator = require('./hyphenate.js');
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
	return msg.replace(/[^A-Za-z\s]/g,'').split(' ').filter(x => !!x);
}

function getSyllablesPerWord(words) {
	return words.map(getSyllables);
}

function tryAndMakeHaiku(words) {
	const syllablesPerWord = getSyllablesPerWord(words);
	const totalSyllables = syllablesPerWord.reduce((prev, cur) => prev + cur.syllables, 0);

	if(totalSyllables != 17) {
		return undefined;
	}

	try {
		[firstSentence, restA] = takeNSyllablesFromList(syllablesPerWord, 5);
		[secondSentence, restB] = takeNSyllablesFromList(restA, 7);
		[thirdSentence, restC] = takeNSyllablesFromList(restB, 5);

		return [firstSentence, secondSentence, thirdSentence];
	} catch(err) {
		console.log(err);
		return undefined;		
	}
}

function takeNSyllablesFromList(list, n) {
	function recurse(l, sentence, syllableCount) {
		[a, ...rest] = l;

		const sum = syllableCount + a.syllables;
		const newSentence = sentence.concat([a.word]);

		if(sum < n) {
			return recurse(rest, newSentence, sum);
		} else if(sum == n){
			return [newSentence, rest];
		} else if(sum > n){
			console.log(list, sum, sentence);

			throw `Can't form a sentence with exactly ${n} syllables from these words`;
		}
	}

	return recurse(list, [], 0);
}

function getSyllables(word){
	return { word: word, syllables: Hyphenator.Hyphenator.hyphenate_word(word).length };
}
