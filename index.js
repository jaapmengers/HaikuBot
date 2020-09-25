const express = require("express");
const app = express();
const Botkit = require("botkit");
const Promise = require("bluebird");
const _ = require("underscore");
const controller = Botkit.slackbot();
const haiku = require("./haiku");

const token = process.env.HAIKU_BOT_SECRET;

if (!token) {
  throw "No Slack token found for Haiku bot under the HAIKU_BOT_SECRET environment variable";
}

const bot = controller.spawn({
  token,
});

const channelInfo = Promise.promisify(bot.api.channels.info);
const userInfo = Promise.promisify(bot.api.users.info);

function restart() {
  bot.closeRTM();
  bot.startRTM();
}

restart();

setInterval(() => restart(), 60 * 60 * 1000);

try {
  controller.on("ambient", function (bot, message) {
    if (message.text) {
      const words = haiku.expandMessage(message.text);
      const possibleHaiku = haiku.tryAndMakeHaiku(words, debug);

      if (possibleHaiku) {
        bot.reply(
          message,
          {
            text: `>>>${haiku.formatMessage(possibleHaiku)}`,
            username: "HaikuBot",
            icon_emoji: ":writing_hand:",
          },
          function (err, haikuMsg) {
            if (err) {
              return;
            }

            logSuccesfulHaiku(haikuMsg, message);
            addReaction(haikuMsg);
          }
        );
      }
    }
  });
} catch (err) {
  console.error("Something failed", err);
}

function addReaction(message) {
  bot.api.reactions.add({
    timestamp: message.ts,
    channel: message.channel,
    name: "cherry_blossom",
  });
}

function logSuccesfulHaiku(haikuMsg, originalMsg) {
  const userPromise = userInfo({ user: originalMsg.user });
  const channelPromise = channelInfo({ channel: haikuMsg.channel });

  Promise.all([userPromise, channelPromise]).then((x) => {
    const messageId = haikuMsg.ts.replace(".", "");
    const link = `https://q42.slack.com/archives/${x[1].channel.name}/p${messageId}`;

    log(`Haiku door ${x[0].user.name} in ${x[1].channel.name}.\n${link}`);
  });
}

function debug(msg) {
  log(`\`\`\`Debug: ${msg}\`\`\``);
}

function log(msg) {
  bot.say({
    text: msg,
    channel: "C1CPAD96Z",
  });
}

app.get("/", function (req, res) {
  res.send("ping");
});

app.listen(process.env.PORT, function () {
  console.log(`Example app listening on port ${process.env.PORT}!`);
});
