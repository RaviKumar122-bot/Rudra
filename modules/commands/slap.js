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
    const { threadID, messageID, senderID } = message;

    let mentionName = null;

    // ✅ ONLY FAKE @NAME SUPPORT
    if (args.length > 0) {
      let text = args.join(" ");
      text = text.replace(/^@/, "");
      mentionName = text;
    } else {
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

    // 🔥 CRAZY RANDOM LINES (BOLD)
    const funnyLines = [
      "💀 𝐢𝐭𝐧𝐚 𝐳𝐨𝐫 𝐤𝐚 𝐩𝐚𝐝𝐚 𝐤𝐢 5𝐆 𝐬𝐞 2𝐆 𝐩𝐞 𝐚𝐚 𝐠𝐚𝐲𝐚!😂😂",
      "😂 𝐠𝐚𝐚𝐥 𝐧𝐞 𝐛𝐨𝐥𝐚 — 𝐛𝐡𝐚𝐢 𝐛𝐚𝐬 𝐤𝐚𝐫!😂😂",
      "🔥 𝐬𝐲𝐬𝐭𝐞𝐦 𝐡𝐚𝐧𝐠 𝐡𝐨 𝐠𝐚𝐲𝐚 𝐛𝐞𝐜𝐡𝐚𝐫𝐞 𝐤𝐚!😂😂",
      "🤣 𝐭𝐡𝐚𝐩𝐩𝐚𝐝 𝐧𝐚𝐡𝐢 𝐞𝐚𝐫𝐭𝐡𝐪𝐮𝐚𝐤𝐞 𝐭𝐡𝐚!😂😂",
      "⚡ 𝐡𝐚𝐰𝐚 𝐦𝐞 2 𝐬𝐞𝐜 𝐟𝐫𝐞𝐞𝐳𝐞 𝐡𝐨 𝐠𝐚𝐲𝐚!😂😂",
      "💢 𝐝𝐢𝐦𝐚𝐚𝐠 𝐫𝐞𝐛𝐨𝐨𝐭 𝐡𝐨 𝐠𝐚𝐲𝐚 𝐭𝐮𝐫𝐚𝐧𝐭!😂😂",
      "😆 𝐦𝐮𝐡 𝐥𝐞𝐟𝐭 𝐠𝐚𝐲𝐚 𝐚𝐮𝐫 𝐛𝐨𝐝𝐲 𝐫𝐢𝐠𝐡𝐭!😂😂",
      "🥴 𝐚𝐚𝐧𝐤𝐡𝐨𝐧 𝐤𝐞 𝐬𝐚𝐚𝐦𝐧𝐞 𝐭𝐚𝐫𝐞 𝐠𝐡𝐨𝐨𝐦 𝐠𝐚𝐲𝐞!😂😂",
      "😈 𝐫𝐞𝐬𝐩𝐞𝐜𝐭 𝐮𝐧𝐢𝐧𝐬𝐭𝐚𝐥𝐥 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲!😂😂",
      "💥 𝐬𝐞𝐞𝐝𝐡𝐚 𝐬𝐨𝐮𝐥 𝐭𝐚𝐤 𝐡𝐢𝐭 𝐤𝐢𝐲𝐚!😂😂",
      "🤣 𝐧𝐞𝐭𝐰𝐨𝐫𝐤 𝐮𝐧𝐬𝐭𝐚𝐛𝐥𝐞 𝐡𝐨 𝐠𝐚𝐲𝐚!😂😂",
      "⚡ 𝐥𝐚𝐠𝐭𝐚 𝐡𝐚𝐢 𝐮𝐩𝐝𝐚𝐭𝐞 𝐩𝐞𝐧𝐝𝐢𝐧𝐠 𝐭𝐡𝐚!😂😂",
      "💀 𝐲𝐞 𝐭𝐡𝐚𝐩𝐩𝐚𝐝 𝐡𝐢𝐬𝐭𝐨𝐫𝐲 𝐦𝐞 𝐥𝐢𝐤𝐡𝐚 𝐣𝐚𝐲𝐞𝐠𝐚!😂😂",
      "😂 𝐍𝐀𝐒𝐀 𝐛𝐡𝐢 𝐭𝐫𝐚𝐜𝐤 𝐧𝐚𝐡𝐢 𝐤𝐚𝐫 𝐩𝐚𝐲𝐚!😂😂",
      "🔥 𝐠𝐫𝐚𝐯𝐢𝐭𝐲 𝐟𝐚𝐢𝐥 𝐡𝐨 𝐠𝐚𝐲𝐢 𝐢𝐬𝐬 𝐬𝐥𝐚𝐩 𝐩𝐞!😂😂"
    ];

    const randomLine = funnyLines[Math.floor(Math.random() * funnyLines.length)];

    try {
      const res = await axios.get("https://api.waifu.pics/sfw/slap");
      const imageUrl = res.data.url;

      const imgPath = path.join(__dirname, `slap_${Date.now()}.jpg`);
      const img = (await axios.get(imageUrl, { responseType: "arraybuffer" })).data;

      fs.writeFileSync(imgPath, Buffer.from(img, "utf-8"));

      const msg =
`╭───〔 𝐒𝐋𝐀𝐏 👋 〕───╮

😁 ${senderName} 😁 𝐧𝐞 😂 ${mentionName} 😂 𝐤𝐨 𝐭𝐡𝐚𝐩𝐩𝐚𝐝 𝐦𝐚𝐫𝐚!

${randomLine}

╰─────────────────╯`;

      return api.sendMessage({
        body: msg,
        attachment: fs.createReadStream(imgPath)
      }, threadID, () => {
        fs.unlinkSync(imgPath);
      }, messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Slap image lane me fail ho gaya!", threadID, messageID);
    }
  }
};
