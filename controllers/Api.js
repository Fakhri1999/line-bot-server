const line = require("@line/bot-sdk");
const axios = require('axios');
const fs = require('fs');
const moment = require('moment')

const { CHANNEL } = require("../config");

// create config for LINE SDK
const config = {
  channelAccessToken: CHANNEL.CHANNEL_ACCESS_TOKEN,
  channelSecret: CHANNEL.CHANNEL_SECRET
};

// create LINE SDK
const client = new line.Client(config);

async function eventHandler(event) {
  if (event.type !== "message") {
    return Promise.resolve(null);
  }

  let userMessage = event.message.text;
  if (userMessage.startsWith(",")) {
    userMessage = userMessage.substring(1).toLowerCase();
    keyword = userMessage.split(" ")[0];
    userMessageArray = userMessage.split(" ");
    if (keyword == 'halo'){
      replyMessage = 'Halo juga'
    } else if(keyword == "apakah" && userMessage.endsWith("?")) {
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
    } else if(keyword == 'ig'){
      try {
        let { data, status } = await axios.get(`https://www.instagram.com/${userMessageArray[1]}/?__a=1`)
        if(status === 200){
          user = data.graphql.user
          previewUrl = user.profile_pic_url
          originalUrl = user.profile_pic_url_hd
  
          return client.replyMessage(event.replyToken, imageBuilder(previewUrl, originalUrl))
        } 
      } catch (error) {
        replyMessage = 'Salah ngetik username instagram yaaa....'
      }
    } else if(keyword == 're-unsend'){
      groupId = event.source.groupId
      chatFile = JSON.parse(fs.readFileSync('chat.json', 'utf8')).chats
      chatAda = false
      for (let i = 0; i < chatFile.length; i++) {
        if(chatFile[i].groupId == groupId){
          chatAda = true
          replyMessage = `Nama : ${chatFile[i].displayName}\nWaktu : ${chatFile[i].time}\nPesan : ${chatFile[i].userMessage}`
          break;
        }
        
        if(!chatAda){
          replyMessage = 'Belum ada history chat di grup ini'
        }
      }
    } else if(keyword == 'pilih' && userMessage.endsWith('?')){
      userMessage = userMessage.substring(6, userMessage.length - 1)
      pilihan = userMessage.split('atau')
      if(pilihan.length > 1){
        pilihanAcak = Math.floor(Math.random() * pilihan.length)
        replyMessage = pilihan[pilihanAcak].trim()
      } else {
        replyMessage = 'Aku gak mau milih kalo pilihannya cuma 1 :('
      }
    } else if(keyword == 'help'){
      replyMessage = `1. Untuk mendapatkan jawaban dari kerang ajaib :\n,apakah <text> ?
      \n2. Untuk menampilkan foto profil IG seseorang :\n,ig <username IG>
      \n3. Untuk menampilkan 1 pesan terakhir yang diunsent (Sementara, hanya bisa untuk teks) :\n,re-unsend
      \n4. Untuk mendapatkan jawaban dari beberapa pilihan (pilihan dipisahkan dengan \"atau\", jumlah pilihan bebas) : \n,pilih <text> atau <text>`
      // \n4. Untuk memberi saran tambahan fitur untuk bot ini :\n,tambah-fitur <text>
    } else {
      replyMessage = 'Hayo lho ngetik apaan tuh. Ketik ,help untuk menampilkan list perintah'
    }
    return client.replyMessage(event.replyToken, textBuilder(replyMessage));
  } else {
    groupId = event.source.groupId

    if(groupId != null){
      chatFile = fs.readFileSync('chat.json', 'utf8')
      displayName = (await client.getProfile(event.source.userId)).displayName
      if(chatFile.length == 0){
        let chatNew = {
          chats : []
        }
        chatNew.chats.push({
          groupId,
          displayName,
          userMessage,
          time : moment().format("DD-MM-YYYY, hh:mm:ss")
        })
        fs.appendFileSync('chat.json', JSON.stringify(chatNew))
      } else {
        chatFile = (JSON.parse(chatFile))
        chatNew = ''
        grupSama = false
        for (let i = 0; i < chatFile.chats.length; i++) {
          if(chatFile.chats[i].groupId == groupId){
            chatFile.chats[i].displayName = displayName
            chatFile.chats[i].userMessage = userMessage
            chatFile.chats[i].time = moment().format("DD-MM-YYYY, hh:mm:ss")
            grupSama = true
          }          
        }
        if(!grupSama){
          chatFile.chats.push({
            groupId,
            displayName,
            userMessage,
            time : moment().format("DD-MM-YYYY, hh:mm:ss")
          })
        }

        fs.writeFileSync('chat.json', JSON.stringify(chatFile))
      }
    }
  }

}

function textBuilder(message) {
  return {
    type: "text",
    text: message
  };
}

function imageBuilder(previewUrl, originalUrl){
  return {
    type : 'image',
    originalContentUrl : originalUrl,
    previewImageUrl : previewUrl
  }
}

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

module.exports = apiController;
