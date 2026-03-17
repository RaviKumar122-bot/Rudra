const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "slap",
    aliases: [],
    description: "Slap someone with image 😆",
    usages: "{prefix}slap @user",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    category: "FUN",
    hasPrefix: true,
    permission: "PUBLIC",
    cooldowns: 3
  },

  run: async function ({ api, message }) {
    const { threadID, messageID, senderID, mentions } = message;

    let mentionID, mentionName;

    // ✅ Method 1: Proper mention
    if (mentions && Object.keys(mentions).length > 0) {
      mentionID = Object.keys(mentions)[0];
      mentionName = mentions[mentionID];
    }

    // ✅ Method 2: Reply system (important fix)
    else if (message.messageReply) {
      mentionID = message.messageReply.senderID;
      mentionName = message.messageReply.body || "User";
    }

    // ❌ No user found
    else {
      return api.sendMessage(
        "⚠️ Please mention or reply to someone to slap 😆",
        threadID,
        messageID
      );
    }

    // Get sender name
    let senderName = "Someone";
    try {
      const user = await global.User.findOne({ userID: senderID });
      senderName = user?.name || "Someone";
    } catch (e) {}

    try {
      // 🔥 API CALL
      const res = await axios.get("https://api.waifu.pics/sfw/slap");
      const imageUrl = res.data.url;

      const imgPath = path.join(__dirname, `slap_${Date.now()}.jpg`);
      const img = (await axios.get(imageUrl, { responseType: "arraybuffer" })).data;

      fs.writeFileSync(imgPath, Buffer.from(img, "utf-8"));

      const msg =
`╭━━━〔𝐒𝐋𝐀𝐏 𝐀𝐓𝐓𝐀𝐂𝐊〕━━━╮

💥 ${senderName} slapped ${mentionName} 😆

╰━━━━━━━━━━━━━━━━━━╯`;

      return api.sendMessage({
        body: msg,
        attachment: fs.createReadStream(imgPath),
        mentions: [
          {
            tag: mentionName,
            id: mentionID
          }
        ]
      }, threadID, () => {
        fs.unlinkSync(imgPath);
      }, messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Failed to fetch slap image!", threadID, messageID);
    }
  }
};
