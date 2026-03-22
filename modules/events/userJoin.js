const { generateWelcomeImage } = require("../../utils/welcomeImage");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: 'userJoin',
    description: 'Welcomes new users to a group',
    version: '1.0.0',
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭"
  },

  run: async function ({ api, message, logMessageData }) {
    const { threadID } = message;

    try {
      const thread = await global.Thread.findOne({ threadID });

      if (thread && thread.settings && thread.settings.welcome === false) {
        return global.logger.debug(`Welcome message disabled for thread ${threadID}`);
      }

      const addedParticipants = logMessageData.addedParticipants || [];
      if (addedParticipants.length === 0) return;

      const botAdded = addedParticipants.some(user => user.userFbId === global.client.botID);

      // ================= BOT JOIN =================
      if (botAdded) {

  // 👇 YE PART MUST HAI
  if (global.config.botNickname) {
    try {
      await new Promise((resolve, reject) => {
        api.changeNickname(
          global.config.botNickname,
          threadID,
          global.client.botID,
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      }).catch(() => {});
    } catch (e) {}
  }

  // 👇 fir baaki system (random image etc.)

        // 🔥 RANDOM IMAGE SYSTEM
        const botJoinImages = [
          "https://i.postimg.cc/2Sk7DyKD/IMG-20260322-WA0000.jpg"
        ];

        const botJoinImage = botJoinImages[Math.floor(Math.random() * botJoinImages.length)];

        let botMsg =
`╭━━━〔 𝐀𝐂𝐓𝐈𝐕𝐀𝐓𝐄𝐃 〕━━━╮

✨ 𝐇𝐞𝐥𝐥𝐨 𝐄𝐯𝐞𝐫𝐲𝐨𝐧𝐞 ✨

➤ 𝐈'𝐦 CUTIEE
➤ 𝐍𝐨𝐰 𝐀𝐜𝐭𝐢𝐯𝐞 𝐈𝐧 𝐓𝐡𝐢𝐬 𝐆𝐫𝐨𝐮𝐩

➤𝐑𝐞𝐚𝐝𝐲 𝐓𝐨 𝐌𝐚𝐤𝐞 𝐂𝐡𝐚𝐭𝐢𝐧𝐠

💎 𝐄𝐧𝐣𝐨𝐲 𝐏𝐫𝐞𝐦𝐢𝐮𝐦 𝐅𝐞𝐚𝐭𝐮𝐫𝐞𝐬

👑𝐎𝐖𝐍𝐄𝐑 : 𝐑𝐔𝐃𝐑𝐀 𝐑𝐀𝐉𝐏𝐔𝐓

╰━━━〔 ✦ 𝐄𝐍𝐉𝐎𝐘 ✦ 〕━━━╯`;

        let botAttachment = [];

        if (botJoinImage) {
          try {
            const axios = require("axios");
            const img = await axios.get(botJoinImage, { responseType: "arraybuffer" });

            const imgPath = path.join(__dirname, `bot_join_${Date.now()}.png`);
            fs.writeFileSync(imgPath, Buffer.from(img.data, "binary"));

            botAttachment.push(fs.createReadStream(imgPath));

            setTimeout(() => {
              if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
            }, 30000);

          } catch (e) {
            global.logger.error("Bot join image error:", e);
          }
        }

        return global.api.sendMessage({
          body: botMsg,
          attachment: botAttachment
        }, threadID);
      }

      // ================= USER JOIN =================
      for (const participant of addedParticipants) {
        await global.handleCreateDatabase.createUser(participant.userFbId, participant.fullName);

        const currencyExists = await global.Currency.exists({ userID: participant.userFbId });
        if (!currencyExists) {
          await global.Currency.create({ userID: participant.userFbId });
        }
      }

      let threadName = "Group";
      try {
        const info = await api.getThreadInfo(threadID);
        threadName = info.threadName || "Group";
      } catch (e) {}

      let welcomeMessage = '👋 Welcome!';
      let attachment = [];

      if (addedParticipants.length === 1) {
        const user = addedParticipants[0];

        welcomeMessage =
`╭━━━〔  𝑾𝑬𝑳𝑪𝑶𝑴𝑬  〕━━━╮

✧ 𝐍𝐞𝐰 𝐌𝐞𝐦𝐛𝐞𝐫 𝐉𝐨𝐢𝐧𝐞𝐝

➤ 𝐍𝐚𝐦𝐞 : ${user.fullName}
➤ 𝐆𝐫𝐨𝐮𝐩 : ${threadName}

✦ 𝐖𝐞'𝐫𝐞 𝐠𝐥𝐚𝐝 𝐭𝐨 𝐡𝐚𝐯𝐞 𝐲𝐨𝐮 𝐡𝐞𝐫𝐞!

✨ 𝐄𝐧𝐣𝐨𝐲 𝐜𝐡𝐚𝐭𝐢𝐧𝐠 ✨

╰━━━〔 ✦ 𝑬𝑵𝑱𝑶𝒀 ✦ 〕━━━╯`;

        try {
          const avatarUrl = `https://graph.facebook.com/${user.userFbId}/picture?height=720&width=720`;
          const imageBuffer = await generateWelcomeImage(user.fullName, threadName, avatarUrl);

          const imagePath = path.join(__dirname, `welcome_${Date.now()}.png`);
          fs.writeFileSync(imagePath, imageBuffer);

          attachment.push(fs.createReadStream(imagePath));

          setTimeout(() => {
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
          }, 30000);

        } catch (e) {}
      } else {
        welcomeMessage =
`╭━━━𝑮𝑹𝑶𝑼𝑷 𝑾𝑬𝑳𝑪𝑶𝑴𝑬━━━╮

🎉 𝐍𝐞𝐰 𝐌𝐞𝐦𝐛𝐞𝐫𝐬 𝐉𝐨𝐢𝐧𝐞𝐝

${addedParticipants.map(u => `✧ ${u.fullName}`).join('\n')}

➤ 𝐆𝐫𝐨𝐮𝐩 : ${threadName}

✨ 𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐭𝐨 𝐭𝐡𝐞 𝐟𝐚𝐦𝐢𝐥𝐲 ✨

╰━━━〔 ✦ 𝑬𝑵𝑱𝑶𝒀 ✦ 〕━━━╯`;
      }

      await global.api.sendMessage({
        body: welcomeMessage,
        attachment: attachment
      }, threadID);

    } catch (error) {
      global.logger.error('Error in userJoin event:', error.message);
    }
  }
};
