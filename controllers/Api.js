const line = require("@line/bot-sdk");
const axios = require("axios");
const fs = require("fs");
const moment = require("moment");

const { CHANNEL, SECRET_KEY } = require("../config");
const { textBuilder, imageBuilder } = require("../helper/Builder");

// create config for LINE SDK
const config = {
  channelAccessToken: CHANNEL.CHANNEL_ACCESS_TOKEN,
  channelSecret: CHANNEL.CHANNEL_SECRET
};

// create LINE SDK
const client = new line.Client(config);

const apiController = {
  lineApi: (req, res) => {
    Promise.all(req.body.events.map(eventHandler))
      .then(result => res.json(result))
      .catch(err => {
        console.error(err);
        res.status(500).end();
      });
  }
};

async function eventHandler(event) {
  if (event.type !== "message") {
    // if someone invite this bot to a group / room
    if (event.type == "join") {
      let replyMessage = 'Terimakasih telah mengundang aku ke grup ini. Ketik ",help" untuk melihat daftar perintah yang tersedia';
      return client.replyMessage(event.replyToken, textBuilder(replyMessage));
    }
  }

  let userMessage = event.message.text || "";
  // if the message contain the "," in the beginning
  if (userMessage.startsWith(",")) {
    userMessage = userMessage.substring(1).toLowerCase();
    keyword = userMessage.split(" ")[0];
    userMessageArray = userMessage.split(" ");
    // replyMessage var used to send reply to the user
    if (keyword == "halo") {
      replyMessage = "Halo juga";
    } else if (keyword == "apakah" && userMessage.endsWith("?")) {
      // get a random number and return replyMessage based on that random number
      random = Math.floor(Math.random() * 3);
      switch (random) {
        case 0:
          replyMessage = "Ya";
          break;
        case 1:
          replyMessage = "Bisa jadi";
          break;
        case 2:
          replyMessage = "Tidak";
          break;
      }
    } else if (keyword == "ig") {
      try {
        // get the user data from instagram api
        let { data, status } = await axios.get(
          `https://www.instagram.com/${userMessageArray[1]}/?__a=1`
        );

        // if the instagram api successfull
        if (status === 200) {
          user = data.graphql.user;
          previewUrl = user.profile_pic_url;
          originalUrl = user.profile_pic_url_hd;

          // return the replyMessage with the image
          return client.replyMessage(
            event.replyToken,
            imageBuilder(previewUrl, originalUrl)
          );
        }
      } catch (error) {
        replyMessage = "Salah ngetik username instagram yaaa....";
      }
    } else if (keyword == "re-unsend") {
      // take the groupID from the message
      groupId = event.source.groupId;

      // read the chats from the chat.json file
      chatFile = JSON.parse(fs.readFileSync("chat.json", "utf8")).chats;
      chatAda = false;

      // search the chats that has the same groupID with the groupID message
      for (let i = 0; i < chatFile.length; i++) {
        // if found the chat with the same groupID, take the message and stop the looping
        if (chatFile[i].groupId == groupId) {
          chatAda = true;
          replyMessage = `Nama : ${chatFile[i].displayName}\nWaktu : ${chatFile[i].time}\nPesan : ${chatFile[i].userMessage}`;
          break;
        }
      }

      // if there is no chat that has the same groupID, it will return this message
      if (!chatAda) {
        replyMessage = "Belum ada history chat di grup ini";
      }
    } else if (keyword == "pilih" && userMessage.endsWith("?")) {
      // remove the ',pilih' & '?' from the message
      userMessage = userMessage.substring(6, userMessage.length - 1);

      // take the fitur from the message by splitting with 'atau'
      pilihan = userMessage.split("atau");

      // if the fitur are more than 1
      if (pilihan.length > 1) {
        // generate a random number and use that number as an index
        pilihanAcak = Math.floor(Math.random() * pilihan.length);
        replyMessage = pilihan[pilihanAcak].trim();
      } else {
        replyMessage = "Aku gak mau milih kalo pilihannya cuma 1 :(";
      }
    } else if (keyword == "tambah-fitur") {
      // remove the ',tambah-fitur' from the message
      let fitur = userMessage.substring(13);

      // check if the user send empty message
      if (fitur.length == 0) {
        replyMessage = "Pesanmu kosong";
      } else {
        // get the display name of the user
        let displayName = (await client.getProfile(event.source.userId)).displayName;

        // import models and make the insert config
        const apiModel = require("../models/Api");
        const insertConfig = {
          nama: displayName,
          fitur,
          waktu: moment().format("DD-MM-YYYY, HH:mm:ss")
        };

        // insert the fitur to database. if the function is success, it will return insertConfig value
        let insertFitur = await apiModel.insertFitur(insertConfig);
        if (insertFitur == insertConfig) {
          replyMessage = "Saran kamu telah diterima. Terimakasih :)";
          // if the insertFitur produce error, show the error message
        } else {
          replyMessage = "Oopss... terjadi error. Silahkan coba lagi lain waktu";
        }
      }
    } else if (keyword == "ambil-fitur") {
      let auth = userMessage.substring(12);

      // check if the message contain the secret key before giving the fitur list to the user
      if (auth != SECRET_KEY) {
        replyMessage = "Kunci rahasia salah";
      } else {
        // import models & get fitur from db
        const apiModel = require("../models/Api");
        let fitur = await apiModel.getFitur();

        // insert the fitur to var replyMessage
        replyMessage = "";
        fitur.forEach(e => {
          replyMessage += `Nama : ${e.nama}\nFitur : ${e.fitur}\nWaktu : ${e.waktu}\n\n`;
        });
      }
    } else if (keyword == "tambah-pesan") {
      // remove the ',tambah-fitur' from the message
      let pesan = userMessage.substring(13);

      // check if the user send empty message
      if (pesan.length == 0) {
        replyMessage = "Pesanmu kosong";
      } else {
        // get the display name of the user
        let displayName = (await client.getProfile(event.source.userId)).displayName;

        // import models and make the insert config
        const apiModel = require("../models/Api");
        const insertConfig = {
          nama: displayName,
          pesan,
          waktu: moment().format("DD-MM-YYYY, HH:mm:ss")
        };

        // insert the fitur to database. if the function is success, it will return insertConfig value
        let insertPesan = await apiModel.insertPesan(insertConfig);
        if (insertPesan == insertConfig) {
          replyMessage = `Pesan kamu telah disimpan. Gunakan ,ambil-pesan untuk menampilkan 1 pesan secara acak`;
          // if the insertFitur produce error, show the error message
        } else {
          replyMessage = "Oopss... terjadi error. Silahkan coba lagi lain waktu";
        }
      }
    } else if (keyword == "ambil-pesan"){
      // import models & get fitur from db
      const apiModel = require("../models/Api");
      let pesan = await apiModel.getPesan();

      // generate a random number and use that number as an index
      random = Math.floor(Math.random() * pesan.length);
      replyMessage = `Pesan = ${pesan[random].pesan}`
    } else if (keyword == "help") {
      replyMessage = `1. Untuk mendapatkan jawaban dari kerang ajaib :\n,apakah <text> ?
      \n2. Untuk menampilkan foto profil IG seseorang :\n,ig <username_ig>
      \n3. Untuk menampilkan 1 pesan terakhir yang diunsent (Sementara, hanya bisa untuk teks) :\n,re-unsend
      \n4. Untuk memberi saran tambahan fitur untuk bot ini :\n,tambah-fitur <text>
      \n5. Untuk mendapatkan jawaban dari beberapa pilihan (pilihan dipisahkan dengan \"atau\", jumlah pilihan bebas) : \n,pilih <pilihan_1> atau <pilihan_2>?
      \n6. Untuk mengirimkan pesan rahasia : \n,tambah-pesan <text>
      \n7. Untuk mengambil 1 pesan rahasia : \n,ambil-pesan
      \nBACA DOKUMENTASI LENGKAP : https://github.com/Fakhri1999/line-bot-server`;
    } else {
      replyMessage =
        "Hayo lho ngetik apaan tuh. Ketik ,help untuk menampilkan list perintah";
    }
    return client.replyMessage(event.replyToken, textBuilder(replyMessage));
  } else {
    // take the groupID from the message
    groupId = event.source.groupId;

    // if the message is from a group
    if (groupId != null) {
      // read the chats from the chat.json file
      chatFile = fs.readFileSync("chat.json", "utf8");

      // get the displayName from the message
      displayName = (await client.getProfile(event.source.userId)).displayName;

      // if the chats is empty
      if (chatFile.length == 0) {
        // create empty array
        let chatNew = {
          chats: []
        };

        // push a new chats to the array
        chatNew.chats.push({
          groupId,
          displayName,
          userMessage,
          time: moment().format("DD-MM-YYYY, HH:mm:ss")
        });

        // insert the data to chat.json file
        fs.appendFileSync("chat.json", JSON.stringify(chatNew));
      } else {
        chatFile = JSON.parse(chatFile);
        chatNew = "";
        grupSama = false;

        // search the chats that has the same groupID with the groupID message
        for (let i = 0; i < chatFile.chats.length; i++) {
          // if found, replace the value with the newest message
          if (chatFile.chats[i].groupId == groupId) {
            chatFile.chats[i].displayName = displayName;
            chatFile.chats[i].userMessage = userMessage;
            chatFile.chats[i].time = moment().format("DD-MM-YYYY, HH:mm:ss");
            grupSama = true;
          }
        }

        // if the loop doenst found the chat with the same groupID
        if (!grupSama) {
          chatFile.chats.push({
            groupId,
            displayName,
            userMessage,
            time: moment().format("DD-MM-YYYY, HH:mm:ss")
          });
        }

        // write the chats to the chat.json file
        fs.writeFileSync("chat.json", JSON.stringify(chatFile));
      }
    }
  }
}

module.exports = apiController;
