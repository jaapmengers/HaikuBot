const haikubot = require('./haiku');

// Sources:
// - https://www.robinkerkhof.nl/poezie/haiku/haiku-gedichten/
// - https://nl.wikipedia.org/wiki/Haiku_(dichtvorm)
const validHaikus = [
  "Een bliksemschicht flitst, en een purperreiger schreeuwt in de duisternis.",
  "Een bliksemschicht flitst, en een purperreiger :scream_cat: in de duisternis.",
  "In het morgenrood op de tip van het graanblad de rijp van voorjaar.",
  "Velden geel koolzaad de maan staat in het oosten de zon in westen.",
  "Dikke huisjesslak, ook jij beklimt de Fuji – maar langzaam, langzaam.",
  "Ach oude vijver, de kikkers springen erin - geluid van water.",
  "door zomerregens zijn de kraanvogelpoten korter geworden",
  "Twitterende kwal, Kwetteren is wat je zal, Maar niet in mijn nest.",
  "na de plechtigheid. tientallen handen schudden. geen naam onthouden",
  "het druppelen van een waterkraan beklemtoont de stilte in huis",
  "Denk je nou echt dat je de haiku bot kan fop? Stomme guido san",
  "Animaties kan ik nog in meekomen, maar die scrolljacking :cry:",
  "zou ik ze pakken, de witvis in 't wier bijeen, dan schoten ze weg",
];

const invalidHaikus = [
  "jaap ​ hij ​ is ​ stuk ​ alles ​ is een haiku zie je", // Contains unicode zero width spacers ("\u200B")
  "Laag over de spoorlijn vliegen de wilde ganzen door maan beschenen.",
];

function log() { }

validHaikus.forEach((haiku) => {
  test(`'${haiku}' is a valid haiku.`, () => {
    const words = haikubot.expandMessage(haiku);
    const possibleHaiku = haikubot.tryAndMakeHaiku(words, log);

    expect(possibleHaiku).toBeDefined();
    expect(typeof possibleHaiku).toEqual('object'); // Array
    expect(possibleHaiku.length).toEqual(3); // Three word groups
  });
})

invalidHaikus.forEach((haiku) => {
  test(`'${haiku}' is not a valid haiku.`, () => {
    const words = haikubot.expandMessage(haiku);
    const possibleHaiku = haikubot.tryAndMakeHaiku(words, log);

    expect(possibleHaiku).toBeUndefined();
  });
})