const haikubot = require('./haiku');

function log() {}

describe(`Valid haikus`, () => {
  // Sources:
  // - https://www.robinkerkhof.nl/poezie/haiku/haiku-gedichten/
  // - https://nl.wikipedia.org/wiki/Haiku_(dichtvorm)
  const validHaikus = [
    "Een bliksemschicht flitst, en een purperreiger schreeuwt in de duisternis.",
    "In het morgenrood op de tip van het graanblad de rijp van voorjaar.",
    "Velden geel koolzaad de maan staat in het oosten de zon in westen.",
    "Dikke huisjesslak, ook jij beklimt de Fuji – maar langzaam, langzaam.",
    "Ach oude vijver, de kikkers springen erin - geluid van water.",
    "door zomerregens zijn de kraanvogelpoten korter geworden",
    "Twitterende kwal, Kwetteren is wat je zal, Maar niet in mijn nest.",
    "na de plechtigheid. tientallen handen schudden. geen naam onthouden",
    "het druppelen van een waterkraan beklemtoont de stilte in huis",
    "Denk je nou echt dat je de haiku bot kan fop? Stomme guido san",
    "zou ik ze pakken, de witvis in 't wier bijeen, dan schoten ze weg",
  ];
  it.each(validHaikus)("'%s' is a valid haiku", (haiku) => {
    const words = haikubot.expandMessage(haiku);
    const possibleHaiku = haikubot.tryAndMakeHaiku(words, log);

    expect(possibleHaiku).toBeDefined();
    expect(typeof possibleHaiku).toEqual('object'); // Array
    expect(possibleHaiku.length).toEqual(3); // Three word groups
  });
});

describe(`Invalid haikus`, () => {
  const invalidHaikus = [
    "jaap ​ hij ​ is ​ stuk ​ alles ​ is een haiku zie je", // Contains unicode zero width spacers ("\u200B")
    "Laag over de spoorlijn vliegen de wilde ganzen door maan beschenen.",
    "Een bliksemschicht flitst, en een purperreiger :scream_cat: in de duisternis.",
    "Animaties kan ik nog in meekomen, maar die scrolljacking :cry:",
  ];
  it.each(invalidHaikus)("'%s' is not a valid haiku", (haiku) => {
    const words = haikubot.expandMessage(haiku);
    const possibleHaiku = haikubot.tryAndMakeHaiku(words, log);

    expect(possibleHaiku).toBeUndefined();
  });
});

describe(`Valid emojis`, () => {
  const emojis = [
    ":writing_hand:", ":cherry_blossom:", ":scream_cat:", 
    ":1000-9138:", ":björkloven:", ":bitterballen-party:", ":aliensguy-8174:",
    ":1337:", ":1337-pride:"
  ];
  it.each(emojis)("'%s' is a valid emoji", (emoji) => {
    expect(haikubot.isEmoji(emoji)).toBeTruthy();
  });
});

describe(`Invalid emojis`, () => {
  const notEmojis = [
    ":writing_hand", "writing_hand:", "writing_hand", "writing_hand", "writing_hand", "writing_hand",
    "Hey: I thought.:", "What: is: this:?", "This is a sentence with a :emoji: in it", "This is a sentence with a :emoji: in it",
    ":foo bar:", ":foo", "bar:", "Hello", "World", "word", "w0rd", "1234",
  ];
  it.each(notEmojis)("'%s' is not a valid emoji", (emoji) => {
    expect(haikubot.isEmoji(emoji)).toBeFalsy();
  });
});
