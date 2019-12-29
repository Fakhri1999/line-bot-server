# Simple Line Bot Server

A simple server for a line bot. You can add the bot by searching this "@810cmuce" in the line add friend or click this [link](https://line.me/R/ti/p/%40810cmuce)

## How to install

Run this in console to install the dependencies

```javascript
npm install
```

And then run this script to start the server. The server will run in port 1231 by default

```javascript
npm run dev
```

## Bot commands

|Command|Description|Example|
|-------|-----------|-------|
|,help|Show list of available commands|,help|
|,halo|Make a simple greetings to the bot|,halo|
|,apakah **_text_**?|Give a bot question and the bot will answer with 1 of this 3 option ("Ya", "Bisa jadi", "Tidak")|,apakah hari ini akan hujan?|
|,ig **_instagram_username_**|Search a photo profile of an instagram account|,ig instagram|
|,re-unsend|Send the latest message from the group (This feature only works in group)|,re-unsend|
|,tambah-fitur **_text_**|Give a feature suggestion to the bot creator|,tambah-fitur tambah fitur cari jodoh dong|
|,pilih **_choice1_** atau **_choice2_**?|Give a bot some choices and the bot will choose 1 from the choice (Choice are separated with "atau", Min 2 choice, max unlimited choice)|,pilih aku atau dia?|
|,tambah-pesan **_text_**|Send an anonymous message to the bot|,tambah-pesan ini pesan pertamaku|
|,ambil-pesan|Get 1 anonymous message from the bot|,ambil-pesan|
