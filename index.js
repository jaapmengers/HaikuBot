var express = require('express')
var app = express()
const Botkit = require('botkit');
const Promise = require('bluebird');
var _ = require('underscore');
const controller = Botkit.slackbot();

const token = process.env.HAIKU_BOT_SECRET;

if(!token){
	throw "No Slack token found for Haiku bot under the HAIKU_BOT_SECRET environment variable";
}

const bot = controller.spawn({
  token: token
});

const channelInfo = Promise.promisify(bot.api.channels.info);
const userInfo = Promise.promisify(bot.api.users.info);

bot.startRTM();

try {
	controller.on('ambient', function(bot,message){
		if(message.text){
			const words = expandMessage(message.text);
			const possibleHaiku = tryAndMakeHaiku(words);

			if(possibleHaiku){
				bot.reply(message,{
			      text: `>>>${formatMessage(possibleHaiku)}`,
			      username: "HaikuBot",
			      icon_emoji: ":writing_hand:",
			    }, logSuccesfulHaiku(message));
			}
		}
	});
} catch(err){
	console.error('Something failed', err);
}

function logSuccesfulHaiku(originalMsg) {
	return (err, haikuMsg) => {
		if(!err) {
			const userPromise = userInfo({user: originalMsg.user});
			const channelPromise = channelInfo({ channel: haikuMsg.channel });

			Promise.all([userPromise, channelPromise]).then(x => {
				const messageId = haikuMsg.ts.replace('.', '');
				const link = `https://q42.slack.com/archives/${x[1].channel.name}/p${messageId}`

				log(`Haiku door ${x[0].user.name} in ${x[1].channel.name}.\n${link}`)
			});
		}
	}
}

function formatMessage(wordsPerSentence){
	return wordsPerSentence.map(x => x.join(' ')).join('\n');
}

function expandMessage(msg){
	return msg.split(/\s+/);
}

function getSyllablesPerWord(words) {
  return words.map(getSyllables);
}

function debug(msg) {
	log(`\`\`\`Debug: ${msg}\`\`\``);
}

function log(msg) {
  bot.say({
    text: msg,
    channel: 'C1CPAD96Z'
  });
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

      debug(`17 syllables, but can't create Haiku while still respecting word boundaries: ${formatLogMessage(syllablesPerWord, totalSyllables)}`);
  		return undefined;
  	}
  } else {
    if (totalSyllables > 12 && totalSyllables < 20) {
      debug(formatLogMessage(syllablesPerWord, totalSyllables));
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

const vowelBlocks = /a(?:ai?|e|i|u|y)?|e(?:eu?|i|u|y)?|i(?:eu?)?|o(?:ei?|i|oi?|ui?|y)?|u(?:e|i|u|y)?|y[aeiou]*/gi;

function pseudoSyllables(s) {
	const vowels = s.match(vowelBlocks) || [];
	const consonants = s.split(vowelBlocks);
	var syllables = vowels.map((v, i) => v + consonants[i + 1]);
	syllables[0] = consonants[0] + syllables[0];
	return syllables;
}

app.get('/', function (req, res) {
  res.send('ping')
});

app.listen(process.env.PORT, function () {
  console.log(`Example app listening on port ${process.env.PORT}!`)
})
