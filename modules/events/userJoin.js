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

      if (addedParticipants.length === 0) {
        return;
      }

      const botAdded = addedParticipants.some(user => user.userFbId === global.client.botID);

      if (botAdded) {
        global.logger.system(`Bot was added to thread ${threadID}`);

        if (global.config.botNickname) {
          try {
            await new Promise((resolve, reject) => {
              api.changeNickname(global.config.botNickname, threadID, global.client.botID, (err) => {
                if (err) reject(err);
                else resolve();
              });
            }).catch(() => { });
          } catch (nicknameError) {}
        }

        try {
          const threadInfo = await new Promise((resolve, reject) => {
            api.getThreadInfo(threadID, (err, info) => {
              if (err) return reject(err);
              resolve(info);
            });
          });

          const participants = [];

          const userInfoArray = Array.isArray(threadInfo.userInfo)
            ? threadInfo.userInfo
            : (threadInfo.participantIDs && Array.isArray(threadInfo.participantIDs))
              ? threadInfo.participantIDs.map(id => ({ id, name: 'Facebook User' }))
              : [];

          for (const participant of userInfoArray) {
            if (!participant || !participant.id) continue;
            if (participant.id === global.client.botID) continue;

            let nickname = null;
            if (threadInfo.nicknames && threadInfo.nicknames[participant.id]) {
              nickname = threadInfo.nicknames[participant.id];
            }

            participants.push({
              id: participant.id,
              name: participant.name || 'Facebook User',
              nickname: nickname,
              gender: participant.gender || null,
              vanity: participant.vanity && participant.vanity.trim() !== '' ? participant.vanity : null
            });

            await global.handleCreateDatabase?.createUser(participant.id, participant.name || 'Facebook User');
          }

          await global.controllers.thread.createOrUpdateThread(
            threadInfo.threadID,
            {
              threadName: threadInfo.threadName || 'Unnamed Group',
              users: participants
            }
          );

        } catch (dbError) {}

        return global.api.sendMessage(
          `👋 Hello! I'm ${global.config.botNickname || 'a Facebook Messenger Bot'}

Use ${global.config.prefix}help to see available commands.

Thank you for adding me to the group!`,
          threadID
        );
      }

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

      let welcomeMessage = '👋 Welcome to the group!';
      let attachment = [];

      if (addedParticipants.length === 1) {

        const user = addedParticipants[0];

        welcomeMessage =
`╭━━━〔 ✦ 𝑾𝑬𝑳𝑪𝑶𝑴𝑬 ✦ 〕━━━╮

✧ 𝐍𝐞𝐰 𝐌𝐞𝐦𝐛𝐞𝐫 𝐉𝐨𝐢𝐧𝐞𝐝

➤ 𝐍𝐚𝐦𝐞 : ${user.fullName}
➤ 𝐆𝐫𝐨𝐮𝐩 : ${threadName}

✦ 𝐖𝐞'𝐫𝐞 𝐠𝐥𝐚𝐝 𝐭𝐨 𝐡𝐚𝐯𝐞 𝐲𝐨𝐮 𝐡𝐞𝐫𝐞!

✨ 𝐄𝐧𝐣𝐨𝐲 𝐜𝐡𝐚𝐭𝐢𝐧𝐠 𝐚𝐧𝐝 𝐡𝐚𝐯𝐞 𝐟𝐮𝐧 ✨

⚡ 𝐓𝐨 𝐬𝐞𝐞 𝐛𝐨𝐭 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬
➤ ${global.config.prefix}help

╰━━━〔 ✦ 𝑬𝑵𝑱𝑶𝒀 ✦ 〕━━━╯`;

        try {
          const avatarUrl = `https://graph.facebook.com/${user.userFbId}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
          const imageBuffer = await generateWelcomeImage(user.fullName, threadName, avatarUrl);

          const imagePath = path.join(__dirname, `welcome_${user.userFbId}_${Date.now()}.png`);

          fs.writeFileSync(imagePath, imageBuffer);
          attachment.push(fs.createReadStream(imagePath));

          setTimeout(() => {
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
          }, 30000);

        } catch (imgErr) {
          global.logger.error("Error generating welcome image:", imgErr);
        }

      } else {

        welcomeMessage =
`╭━━━✦ 𝑮𝑹𝑶𝑼𝑷 𝑾𝑬𝑳𝑪𝑶𝑴𝑬 ✦━━━╮

🎉 𝐍𝐞𝐰 𝐌𝐞𝐦𝐛𝐞𝐫𝐬 𝐉𝐨𝐢𝐧𝐞𝐝

${addedParticipants.map(user => `✧ ${user.fullName}`).join('\n')}

➤ 𝐆𝐫𝐨𝐮𝐩 : ${threadName}

✨ 𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐭𝐨 𝐭𝐡𝐞 𝐟𝐚𝐦𝐢𝐥𝐲 ✨

⚡ 𝐔𝐬𝐞 ${global.config.prefix}help
𝐭𝐨 𝐬𝐞𝐞 𝐚𝐥𝐥 𝐛𝐨𝐭 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬

╰━━━ 〔 ✦ 𝑬𝑵𝑱𝑶𝒀 ✦ 〕 ━━━╯`;

      }

      await global.api.sendMessage({
        body: welcomeMessage,
        attachment: attachment
      }, threadID);

      try {

        let threadInfo = null;

        try {
          threadInfo = await new Promise((resolve, reject) => {
            api.getThreadInfo(threadID, (err, info) => {
              if (err) return reject(err);
              resolve(info);
            });
          });
        } catch (threadInfoError) {}

        for (const participant of addedParticipants) {

          if (participant.userFbId === global.client.botID) continue;

          let userInfo = null;

          if (threadInfo && threadInfo.userInfo && Array.isArray(threadInfo.userInfo)) {
            userInfo = threadInfo.userInfo.find(u => u.id === participant.userFbId);
          }

          const nickname = threadInfo?.nicknames?.[participant.userFbId] || null;

          await global.controllers.thread.addUserToThread(
            threadID,
            participant.userFbId,
            participant.fullName,
            nickname,
            userInfo?.gender || null,
            userInfo?.vanity && userInfo.vanity.trim() !== '' ? userInfo.vanity : null
          );
        }

      } catch (dbError) {}

    } catch (error) {
      global.logger.error('Error in userJoin event:', error.message);
    }
  }
};
                                                          
