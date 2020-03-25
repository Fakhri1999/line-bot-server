const line = require("@line/bot-sdk");
const axios = require("axios");
const moment = require("moment");
const { CHANNEL, SECRET_KEY } = require("../config");
const config = {
  channelAccessToken: CHANNEL.CHANNEL_ACCESS_TOKEN,
  channelSecret: CHANNEL.CHANNEL_SECRET
};
const client = new line.Client(config);

const botCommand = {
  halo: () => "Halo juga",
  help: () => {
    return `1. Untuk mendapatkan jawaban dari kerang ajaib :\n,apakah {text} ?
    \n2. Untuk menampilkan foto profil IG seseorang :\n,ig {username_ig}
    \n3. Untuk menampilkan pesan terakhir yang diunsent (Hanya bisa digunakan dalam grup chat) :\n,re-unsend
    \n4. Untuk memberi saran tambahan fitur untuk bot ini :\n,tambah-fitur {text}
    \n5. Untuk mendapatkan jawaban dari beberapa pilihan (pilihan dipisahkan dengan \"atau\", jumlah pilihan bebas) : \n,pilih {pilihan_1} atau {pilihan_2}?
    \n6. Untuk mengirimkan pesan rahasia : \n,tambah-pesan {text}
    \n7. Untuk mengambil 1 pesan rahasia : \n,ambil-pesan
    \nBACA DOKUMENTASI LENGKAP : https://github.com/Fakhri1999/line-bot-server`;
  },
  apakah: () => {
    let random = Math.floor(Math.random() * 3);
    let result;
    switch (random) {
      case 0:
        result = "Ya";
        break;
      case 1:
        result = "Bisa jadi";
        break;
      case 2:
        result = "Tidak";
        break;
    }
    return result;
  },
  instagram: async userMessage => {
    try {
      let { data, status } = await axios.get(
        `https://www.instagram.com/${userMessage.split(" ")[1]}/?__a=1`
      );
      console.log(status);
      if (status == 200) {
        let user = data.graphql.user;
        return {
          error: false,
          data: {
            user,
            previewUrl: user.profile_pic_url,
            originalUrl: user.profile_pic_url_hd
          }
        };
      }
    } catch (error) {
      return {
        error: true,
        data: "Salah ngetik username instagram yaaa...."
      };
    }
  },
  reUnsend: (groupId, chatFile, userMessage, baseUrl) => {
    if(groupId == undefined){
      return "Fitur ini hanya bisa digunakan didalam grup chat";
    }
    let jumlah = userMessage.split(" ")[1] || undefined;
    if (jumlah > 5) {
      return "Oopss... cuma bisa nampilin max 5 pesan terakhir cuy";
    }
    let chatAda = false;
    for (let i = 0; i < chatFile.length; i++) {
      if (chatFile[i].groupId == groupId) {
        chatAda = true;
        let chats = chatFile[i].chats;        
        let tempText = [];
        let temp = [];
        let batas = jumlah || chats.length;
        for (let j = 0; j < batas; j++) {
          if(chats[j].messageType == 'image'){
            temp.push({
              url: `${baseUrl}/${chats[j].userMessage}`
            })
          }
          tempText.push(
            `Nama : ${chats[j].displayName}\nWaktu : ${chats[j].time}\nPesan : ${chats[j].userMessage}\n\n`
          );
        }
        tempText = tempText.join("");
        tempText.push(temp)
        console.log(tempText)
        // return tempText;
      }
    }
    if (!chatAda) {
      return "Belum ada history chat di grup ini";
    }
  },
  pilih: userMessage => {
    let message = userMessage.substring(6, userMessage.length - 1);
    pilihan = message.split("atau");

    if (pilihan.length > 1) {
      pilihanAcak = Math.floor(Math.random() * pilihan.length);
      return pilihan[pilihanAcak].trim();
    } else {
      return "Aku gak mau milih kalo pilihannya cuma 1 :(";
    }
  },
  tambahFitur: async (userMessage, userId) => {
    let fitur = userMessage.substring(13);
    if (fitur.length == 0) {
      return "Pesanmu kosong";
    } else {
      try {
        profile = userId == null ? null : await client.getProfile(userId);
      } catch (err) {
        profile = null;
      }
      displayName = profile == null ? null : profile.displayName;
      const apiModel = require("../models/Api");
      const insertConfig = {
        nama: displayName,
        fitur,
        waktu: moment().format("DD-MM-YYYY, HH:mm:ss")
      };
      let insertFitur = await apiModel.insertFitur(insertConfig);
      if (insertFitur == insertConfig) {
        return "Saran kamu telah diterima. Terimakasih :)";
      } else {
        return "Oopss... terjadi error. Silahkan coba lagi lain waktu";
      }
    }
  },
  ambilFitur: async userMessage => {
    let auth = userMessage.substring(12);
    if (auth != SECRET_KEY) {
      return "Kunci rahasia salah";
    } else {
      const apiModel = require("../models/Api");
      let fitur = await apiModel.getFitur();
      let temp = [];
      fitur.forEach(e => {
        temp.push(
          `Nama : ${e.nama}\nFitur : ${e.fitur}\nWaktu : ${e.waktu}\n\n`
        );
      });
      return temp.join("");
    }
  },
  tambahPesan: async (userMessage, userId) => {
    let pesan = userMessage.substring(13);
    if (pesan.length == 0) {
      return "Pesanmu kosong";
    } else {
      try {
        profile = userId == null ? null : await client.getProfile(userId);
      } catch (err) {
        profile = null;
      }
      displayName = profile == null ? null : profile.displayName;
      const apiModel = require("../models/Api");
      const insertConfig = {
        nama: displayName,
        pesan,
        waktu: moment().format("DD-MM-YYYY, HH:mm:ss")
      };
      let insertPesan = await apiModel.insertPesan(insertConfig);
      if (insertPesan == insertConfig) {
        return "Pesan kamu telah disimpan. Gunakan ,ambil-pesan untuk menampilkan 1 pesan secara acak";
      } else {
        return "Oopss... terjadi error. Silahkan coba lagi lain waktu";
      }
    }
  },
  ambilPesan: async () => {
    const apiModel = require("../models/Api");
    let pesan = await apiModel.getPesan();
    random = Math.floor(Math.random() * pesan.length);
    return pesan[random].pesan;
  }
};

module.exports = botCommand;
