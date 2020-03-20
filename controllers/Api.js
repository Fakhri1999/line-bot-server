const line = require("@line/bot-sdk");
const moment = require("moment");
const botCommand = require("../helper/EventHandlers");
const chatFile = require("../data/chat");
const utils = require("../utils/utils");
const { CHANNEL, SECRET_KEY } = require("../config");
const { textBuilder, imageBuilder } = require("../helper/Builder");
const fs = require("fs");
const FileType = require("file-type");
let baseUrl = "";
// create config for LINE SDK
const config = {
  channelAccessToken: CHANNEL.CHANNEL_ACCESS_TOKEN,
  channelSecret: CHANNEL.CHANNEL_SECRET
};

// create LINE SDK
const client = new line.Client(config);

const apiController = {
  lineApi: (req, res) => {
    baseUrl = `${req.protocol}://${req.headers.host}`
    Promise.all(req.body.events.map(eventHandler))
      .then(result => res.json(result))
      .catch(err => {
        console.error(err);
        res.status(500).end();
      });
  }
};

async function eventHandler(event, baseUrl) {
  if (event.type !== "message") {
    if (event.type == "join") {
      let replyMessage =
        'Terimakasih telah mengundang aku ke grup ini. Ketik ",help" untuk melihat daftar perintah yang tersedia';
      return client.replyMessage(event.replyToken, textBuilder(replyMessage));
    }
  }
  let userMessage = event.message.text || event.message.type;
  console.log(userMessage);
  if (userMessage.startsWith(",")) {
    userMessage = userMessage.substring(1).toLowerCase();
    keyword = userMessage.split(" ")[0];
    if (keyword == "halo") {
      replyMessage = botCommand.halo();
    } else if (keyword == "apakah" && userMessage.endsWith("?")) {
      replyMessage = botCommand.apakah();
    } else if (keyword == "ig") {
      let result = await botCommand.instagram(userMessage);
      if (!result.error) {
        let data = result.data;
        return client.replyMessage(
          event.replyToken,
          imageBuilder(data.previewUrl, data.originalUrl)
        );
      } else {
        replyMessage = result.data;
      }
    } else if (keyword == "re-unsend") {
      replyMessage = botCommand.reUnsend(
        event.source.groupId,
        chatFile,
        userMessage,
        baseUrl
      );
    } else if (keyword == "pilih" && userMessage.endsWith("?")) {
      replyMessage = botCommand.pilih(userMessage);
    } else if (keyword == "tambah-fitur") {
      replyMessage = await botCommand.tambahFitur(
        userMessage,
        event.source.userId
      );
    } else if (keyword == "ambil-fitur") {
      replyMessage = await botCommand.ambilFitur(userMessage);
    } else if (keyword == "tambah-pesan") {
      replyMessage = await botCommand.tambahPesan(
        userMessage,
        event.source.userId
      );
    } else if (keyword == "ambil-pesan") {
      replyMessage = await botCommand.ambilPesan();
    } else if (keyword == "help") {
      replyMessage = botCommand.help();
    } else {
      replyMessage =
        "Hayo lho ngetik apaan tuh. Ketik ,help untuk menampilkan list perintah";
    }
    if (Array.isArray(replyMessage)) {
      // let kotak = []
      // replyMessage.forEach(e => {
      // });
    } else {
      return client.replyMessage(event.replyToken, textBuilder(replyMessage));
    }
  } else {
    groupId = event.source.groupId;
    userId = event.source.userId;
    messageId = event.message.id;
    messageType = event.message.type;
    if (groupId != null) {
      try {
        profile =
          userId == null
            ? null
            : await client.getGroupMemberProfile(groupId, userId);
        displayName = profile == null ? null : profile.displayName;
        tempImageName = [];
        if (messageType == "image") {
          content = await client.getMessageContent(messageId).then(async stream => {
            stream.on("data", async chunk => {
              try {
                let imageBuffer = chunk;
                let type = await FileType.fromBuffer(imageBuffer);
                // chatFile.forEach(e => {
                //   if ()
                // });
                let imageName = `public/img/${displayName}.${type.ext}`;
                tempImageName.push(imageName);
                fs.createWriteStream(imageName).write(imageBuffer);
              } catch (error) { }
            });
          });
        }
      } catch (err) {
        profile = "";
      }
      // userMessage = tempImageName[0];
      let chatNew = {
        groupId,
        chats: [
          {
            messageType,
            displayName,
            userMessage,
            time: moment().format("HH:mm:ss")
          }
        ]
      };
      if (utils.isEmpty(chatFile)) {
        chatFile.push(chatNew);
      } else {
        let grupSama = false;
        for (let i = 0; i < chatFile.length; i++) {
          if (chatFile[i].groupId == groupId) {
            if (chatFile[i].chats.length == 5) {
              await chatFile[i].chats.shift();
            }
            await chatFile[i].chats.push({
              messageType,
              displayName,
              userMessage,
              time: moment().format("HH:mm:ss")
            });
            grupSama = true;
          }
        }
        if (!grupSama) {
          chatFile.push(chatNew);
        }
      }
    }
  }
}

module.exports = apiController;
