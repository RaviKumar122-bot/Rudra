const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: 'slap',
    aliases: ['hit', 'punch'],
    description: 'Slap another user with a gender-based GIF',
    usage: 'slap @mention',
    credit: '𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭',
    hasPrefix: true,
    permission: 'PUBLIC',
    cooldown: 5,
    category: 'FUN'
  },

  run: async function({ api, message, event }) {
    // Universal handle: Kuch frameworks 'message' dete hain, kuch 'event'
    const data = message || event;
    const { threadID, messageID, senderID } = data;
    
    // Mentions ko extract karne ka naya tarika (Universal)
    const mentions = data.mentions || (data.messageReply ? data.messageReply.mentions : {});
    const mentionKeys = Object.keys(mentions);

    try {
      // 1. Check Mentions
      if (mentionKeys.length === 0) {
        return api.sendMessage(
          `❌ Kisi ko mention toh karo!\nUsage: slap @mention`,
          threadID,
          messageID
        );
      }

      const targetID = mentionKeys[0];
      
      if (targetID === senderID) {
        return api.sendMessage("🤔 Khud ko thappad maarna acchi baat nahi hai...", threadID, messageID);
      }

      api.setMessageReaction("⏳", messageID, () => {}, true);

      // 2. Fetch Info
      const [senderInfoData, targetInfoData] = await Promise.all([
        api.getUserInfo(senderID),
        api.getUserInfo(targetID)
      ]);

      const senderName = senderInfoData[senderID].name;
      const targetName = targetInfoData[targetID].name;
      const senderGender = senderInfoData[senderID].gender;

      let genderType = (senderGender === 1 || senderGender === 'FEMALE') ? 'female' : 'male';

      // 3. API Call
      const apiKey = 'apim_PHNPYM8mq_Mpav9ue8sGJ6MNPAEvKNKJ13Uq1YZGcX4';
      const response = await axios.post(
        'https://priyanshuapi.xyz/api/runner/slap-gif/fetch',
        { gender: genderType },
        {
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          responseType: 'arraybuffer',
          timeout: 20000
        }
      );

      // 4. File Handling
      const cacheDir = path.join(__dirname, 'cache');
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      
      const tempFilePath = path.join(cacheDir, `slap_${senderID}.gif`);
      fs.writeFileSync(tempFilePath, Buffer.from(response.data, 'utf-8'));

      // 5. Send
      const slapMessages = [
        `💥 ${senderName} ne ${targetName} ko jor ka thappad mara!`,
        `👋 ${senderName} ne ${targetName} ki achi thukai kar di!`,
        `😤 ${senderName} ne ${targetName} ko slap kar diya!`
      ];
      const randomMessage = slapMessages[Math.floor(Math.random() * slapMessages.length)];

      await api.sendMessage({
          body: randomMessage,
          attachment: fs.createReadStream(tempFilePath),
          mentions: [{ tag: targetName, id: targetID }]
        },
        threadID,
        () => { if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath); },
        messageID
      );

      api.setMessageReaction("✅", messageID, () => {}, true);

    } catch (error) {
      console.error(error);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
    }
  }
};
