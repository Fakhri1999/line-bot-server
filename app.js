const express = require("express");
const app = express();
const { PORT, CHANNEL } = require("./config");
const apiController = require("./controllers/Api");
const line = require("@line/bot-sdk");


// create config for LINE SDK
const config = {
  channelAccessToken: CHANNEL.CHANNEL_ACCESS_TOKEN,
  channelSecret: CHANNEL.CHANNEL_SECRET
};

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server is running"
  });
});

app.post("/", line.middleware(config), apiController.lineApi);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
