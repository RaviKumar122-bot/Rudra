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

  run: async function ({ api, message, args }) {
    const { threadID, messageID, senderID, mentions } = message;

    let mentionID = null;
    let mentionName = null;

    // Real mention
    if (mentions && Object.keys(mentions).length > 0) {
      mentionID = Object.keys(mentions)[0];
      mentionName = mentions[mentionID];
    }

    // Fake @name support
    else if (args.length > 0) {
      let text = args.join(" ");
      text = text.replace(/^@/, "");
      mentionName = text;
    }

    else {
      return api.sendMessage(
        "⚠️ Kisi ka naam likh ke slap karo 😆",
        threadID,
        messageID
      );
    }

    // Sender name
    let senderName = "Someone";
    try {
      const user = await global.User.findOne({ userID: senderID });
      senderName = user?.name || "Someone";
    } catch (e) {}

    // 🔥 CRAZY RANDOM LINES
    const funnyLines = [
      "💀 itna zor ka pada ki 5G se 2G pe aa gaya!",
      "😂 gaal ne bola — bhai bas kar!",
      "🔥 system hang ho gaya bechare ka!",
      "🤣 thappad nahi earthquake tha!",
      "⚡ hawa me 2 sec freeze ho gaya!",
      "💢 dimaag reboot ho gaya turant!",
      "😆 muh left gaya aur body right!",
      "🥴 aankhon ke saamne tare ghoom gaye!",
      "😈 respect uninstall successfully!",
      "💥 seedha soul tak hit kiya!",
      "🤣 network unstable ho gaya!",
      "⚡ lagta hai update pending tha!",
      "💀 ye thappad history me likha jayega!",
      "😂 NASA bhi track nahi kar paya speed!",
      "🔥 gravity bhi fail ho gayi iss slap pe!"
    ];

    const randomLine = funnyLines[Math.floor(Math.random() * funnyLines.length)];

    try {
      const res = await axios.get("https://api.waifu.pics/sfw/slap");
      const imageUrl = res.data.url;

      const imgPath = path.join(__dirname, `slap_${Date.now()}.jpg`);
      const img = (await axios.get(imageUrl, { responseType: "arraybuffer" })).data;

      fs.writeFileSync(imgPath, Buffer.from(img, "utf-8"));

      const msg =
`╭───〔 𝐒𝐋𝐀𝐏 💥 〕───╮

💥 ${senderName} ne ${mentionName} ko thappad mara!

${randomLine}

╰──────────────────╯`;

      return api.sendMessage({
        body: msg,
        attachment: fs.createReadStream(imgPath),
        mentions: mentionID ? [
          {
            tag: mentionName,
            id: mentionID
          }
        ] : []
      }, threadID, () => {
        fs.unlinkSync(imgPath);
      }, messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Slap image lane me fail ho gaya!", threadID, messageID);
    }
  }
};
