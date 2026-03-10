const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: 'slap',
    aliases: ['hit', 'punch'],
    description: 'Slap another user with a gender-based GIF',
    usage: 'slap [@mention]\n\n👩 Female users: Girl slaps boy\n👨 Male users: Boy slaps girl',
    credit: '𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭',
    hasPrefix: true,
    permission: 'PUBLIC',
    cooldown: 5,
    category: 'FUN'
  },

  run: async function({ api, message, args }) {
    const { threadID, messageID, senderID, mentions } = message;

    try {
      // 1. Check Mentions
      const mentionKeys = Object.keys(mentions);
      
      if (mentionKeys.length === 0) {
        return api.sendMessage(
          `❌ Please kisi ko mention karein!\nUsage: slap @mention`,
          threadID,
          messageID
        );
      }

      const targetID = mentionKeys[0];
      
      if (targetID === senderID) {
        return api.sendMessage(
          "🤔 Khud ko thappad maarna acchi baat nahi hai...",
          threadID,
          messageID
        );
      }

      api.setMessageReaction("⏳", messageID, () => {}, true);

      // 2. Get User Info (No dependency on Users object)
      const [senderInfoData, targetInfoData] = await Promise.all([
        api.getUserInfo(senderID),
        api.getUserInfo(targetID)
      ]);

      const senderName = senderInfoData[senderID].name;
      const targetName = targetInfoData[targetID].name;
      const senderGender = senderInfoData[senderID].gender;

      // Determine gender for API (1 = Female, 2 = Male)
      let genderType = 'male'; 
      if (senderGender === 1 || senderGender === 'FEMALE') {
        genderType = 'female';
      }

      // 3. API Setup
      const apiKey = 'apim_PHNPYM8mq_Mpav9ue8sGJ6MNPAEvKNKJ13Uq1YZGcX4';

      const response = await axios.post(
        'https://priyanshuapi.xyz/api/runner/slap-gif/fetch',
        { gender: genderType },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer',
          timeout: 20000
        }
      );

      // 4. File Handling
      const tempDir = path.join(__dirname, 'cache');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
      const tempFilePath = path.join(tempDir, `slap_${senderID}.gif`);
      fs.writeFileSync(tempFilePath, Buffer.from(response.data, 'utf-8'));

      // 5. Messages
      const slapMessages = [
        `💥 ${senderName} slapped ${targetName}!`,
        `👋 ${senderName} gave ${targetName} a good slap!`,
        `😤 ${senderName} hit ${targetName} hard!`,
        `🤜 SLAP! ${senderName} vs ${targetName}!`,
        `💢 ${senderName} delivered a powerful slap to ${targetName}!`
      ];
      const randomMessage = slapMessages[Math.floor(Math.random() * slapMessages.length)];

      // 6. Send Result
      await api.sendMessage({
          body: randomMessage,
          attachment: fs.createReadStream(tempFilePath),
          mentions: [
            { tag: senderName, id: senderID },
            { tag: targetName, id: targetID }
          ]
        },
        threadID,
        () => {
          if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        },
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
