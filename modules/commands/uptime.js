/**
 * Uptime Command
 * Shows how long the bot has been running
 */

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up"],
    description: "Shows how long the bot has been running",
    usages: "{prefix}uptime",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    category: "GENERAL",
    hasPrefix: true,
    permission: "PUBLIC",
    cooldowns: 5
  },

  run: async function ({ api, message, args }) {
    const { threadID, messageID } = message;

    let uptimeStr;
    if (global.server && global.server.formatUptime) {
      uptimeStr = global.server.formatUptime();
    } else {
      const uptimeMs = process.uptime() * 1000;

      const seconds = Math.floor((uptimeMs / 1000) % 60);
      const minutes = Math.floor((uptimeMs / (1000 * 60)) % 60);
      const hours = Math.floor((uptimeMs / (1000 * 60 * 60)) % 24);
      const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));

      uptimeStr = '';
      if (days > 0) uptimeStr += `${days} day${days > 1 ? 's' : ''}, `;
      if (hours > 0) uptimeStr += `${hours} hour${hours > 1 ? 's' : ''}, `;
      if (minutes > 0) uptimeStr += `${minutes} minute${minutes > 1 ? 's' : ''}, `;
      uptimeStr += `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }

    const memoryUsage = process.memoryUsage();
    const memoryUsedMB = Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100;

    const botID = api.getCurrentUserID();
    const isRestarted = typeof global.isRestart !== 'undefined' && global.isRestart;

    const uniqueCommands = new Set();
    for (const [key, cmd] of global.client.commands.entries()) {
      if (key === cmd.config.name) {
        uniqueCommands.add(key);
      }
    }

    const totalThreads = await global.Thread.countDocuments();
    const totalUsers = await global.User.countDocuments();

    const ownerID = global.config.ownerID;
    let ownerData = await global.User.findOne({ userID: ownerID });

    const botName = "𝐜𝐮𝐭𝐢𝐞𝐞👀❤️";
    const ownerName = ownerData?.name || 'Owner';

    const statusMessage =
`╭━━━〔 𝐑𝐔𝐃𝐑𝐀'𝐒 𝐁𝐎𝐓 〕━━━╮

✨ 𝐁𝐎𝐓 𝐒𝐓𝐀𝐓𝐔𝐒 ✨

🤖 𝐁𝐨𝐭 : ${botName}
⏱️ 𝐔𝐩𝐭𝐢𝐦𝐞 : ${uptimeStr}
🧠 𝐌𝐞𝐦𝐨𝐫𝐲 : ${memoryUsedMB} MB
🔄 𝐑𝐞𝐬𝐭𝐚𝐫𝐭𝐞𝐝 : ${isRestarted ? '𝐘𝐞𝐬' : '𝐍𝐨'}

📊 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 : ${uniqueCommands.size}
📋 𝐄𝐯𝐞𝐧𝐭𝐬 : ${global.client.events.size}

👥 𝐔𝐬𝐞𝐫𝐬 : ${totalUsers}
💬 𝐆𝐫𝐨𝐮𝐩𝐬 : ${totalThreads}

👑 𝐎𝐰𝐧𝐞𝐫 : ${ownerName}

🟢 𝐒𝐭𝐚𝐭𝐮𝐬 : 𝐎𝐧𝐥𝐢𝐧𝐞 & 𝐑𝐮𝐧𝐧𝐢𝐧𝐠 🚀

╰━━━━━━━━━━━━━━━━━━━━╯`;

    const mentions = [
      {
        tag: botName,
        id: botID
      },
      {
        tag: ownerName,
        id: ownerID
      }
    ];

    return api.sendMessage({
      body: statusMessage,
      mentions: mentions
    }, threadID, messageID);
  }
};
