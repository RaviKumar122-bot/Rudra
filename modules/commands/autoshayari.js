module.exports = {
  config: {
    name: "autoShayari",
    version: "4.0.0",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭"
  },

  run: async function ({ api }) {

    const schedule = require("node-schedule");

    // 🧠 India Time Function
    const getIndianHour = () => {
      return parseInt(
        new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
          hour: "numeric",
          hour12: false
        })
      );
    };

    // 🔥 HOURLY SHAYARI (EDITABLE)
    const hourlyShayari = {
      5:  "🌅 𝐒𝐮𝐛𝐚𝐡 𝐡𝐨𝐭𝐞 𝐡𝐢 𝐧𝐚𝐲𝐢 𝐮𝐦𝐦𝐞𝐞𝐝 𝐣𝐚𝐠𝐭𝐢 𝐡𝐚𝐢,\n𝐇𝐚𝐫 𝐝𝐢𝐧 𝐞𝐤 𝐧𝐚𝐲𝐢 𝐤𝐡𝐮𝐬𝐡𝐢 𝐥𝐚𝐭𝐢 𝐡𝐚𝐢…",
      6:  "☀️ 𝐔𝐭𝐡 𝐣𝐚𝐨, 𝐬𝐮𝐛𝐚𝐡 𝐤𝐚 𝐬𝐢𝐠𝐧𝐚𝐥 𝐚𝐚 𝐠𝐚𝐲𝐚,\n𝐒𝐚𝐩𝐧𝐨 𝐤𝐨 𝐫𝐞𝐚𝐥𝐢𝐭𝐲 𝐦𝐞 𝐛𝐚𝐝𝐚𝐥𝐧𝐞 𝐤𝐚 𝐭𝐢𝐦𝐞 𝐚𝐚 𝐠𝐚𝐲𝐚…",
      7:  "🌄 𝐒𝐮𝐛𝐚𝐡 𝐤𝐢 𝐜𝐡𝐚𝐲 𝐚𝐮𝐫 𝐭𝐮𝐦𝐡𝐚𝐫𝐢 𝐲𝐚𝐚𝐝,\n𝐃𝐨𝐧𝐨 𝐦𝐢𝐥𝐤𝐞 𝐝𝐢𝐧 𝐤𝐨 𝐬𝐩𝐞𝐜𝐢𝐚𝐥 𝐛𝐚𝐧𝐚 𝐝𝐞𝐭𝐞…",
      8:  "🔥 𝐀𝐣 𝐤𝐚 𝐝𝐢𝐧 𝐤𝐮𝐜𝐡 𝐚𝐥𝐚𝐠 𝐤𝐚𝐫 𝐝𝐢𝐤𝐡𝐚𝐨…",
      9:  "😎 𝐌𝐨𝐫𝐧𝐢𝐧𝐠 𝐯𝐢𝐛𝐞 𝐨𝐧, 𝐧𝐞𝐠𝐚𝐭𝐢𝐯𝐢𝐭𝐲 𝐨𝐟𝐟…",
      10: "💪 𝐌𝐞𝐡𝐧𝐚𝐭 𝐚𝐚𝐣 𝐤𝐫𝐨, 𝐟𝐚𝐦𝐞 𝐤𝐚𝐥 𝐦𝐢𝐥𝐞𝐠𝐚…",
      11: "⚡ 𝐃𝐢𝐧 𝐬𝐡𝐮𝐫𝐮 𝐡𝐨 𝐜𝐡𝐮𝐤𝐚 𝐡𝐚𝐢 𝐩𝐮𝐫𝐞 𝐬𝐩𝐞𝐞𝐝 𝐦𝐞…",

      12: "🌞 𝐃𝐨𝐩𝐚𝐡𝐚𝐫 𝐤𝐢 𝐠𝐚𝐫𝐦𝐢 𝐲𝐞 𝐬𝐢𝐤𝐡𝐚𝐭𝐢 𝐡𝐚𝐢…",
      13: "😂 𝐊𝐡𝐚𝐧𝐚 𝐤𝐡𝐚 𝐤𝐞 𝐧𝐞𝐞𝐧𝐝 𝐚𝐚 𝐫𝐡𝐢 𝐡𝐚𝐢…",
      14: "🔥 𝐃𝐨𝐩𝐚𝐡𝐚𝐫 𝐤𝐚 𝐭𝐢𝐦𝐞 = 𝐟𝐮𝐥𝐥 𝐟𝐨𝐜𝐮𝐬 𝐦𝐨𝐝𝐞…",
      15: "💢 𝐓𝐡𝐨𝐝𝐚 𝐭𝐡𝐚𝐤 𝐠𝐚𝐲𝐞 𝐡𝐨 𝐭𝐨 𝐤𝐲𝐚…",
      16: "😆 𝐁𝐨𝐝𝐲 𝐨𝐟𝐟, 𝐝𝐫𝐞𝐚𝐦𝐬 𝐨𝐧…",

      17:30 "🌆 𝐒𝐡𝐚𝐚𝐦 𝐤𝐚 𝐬𝐮𝐤𝐨𝐨𝐧 𝐤𝐚𝐡𝐭𝐚 𝐡𝐚𝐢…",
      18: "✨ 𝐃𝐡𝐚𝐥𝐭𝐚 𝐬𝐮𝐫𝐚𝐣 𝐤𝐚𝐡𝐭𝐚 𝐡𝐚𝐢…",
      19: "💭 𝐒𝐡𝐚𝐚𝐦 𝐤𝐢 𝐡𝐚𝐰𝐚 𝐦𝐞 𝐞𝐤 𝐚𝐥𝐚𝐠 𝐛𝐚𝐚𝐭…",
      20: "😌 𝐂𝐡𝐚𝐲 + 𝐬𝐮𝐤𝐨𝐨𝐧 + 𝐬𝐡𝐚𝐚𝐦…",

      21: "🌙 𝐑𝐚𝐚𝐭 𝐤𝐢 𝐬𝐡𝐚𝐧𝐭𝐢 𝐤𝐚𝐡𝐭𝐢 𝐡𝐚𝐢…",
      22: "💤 𝐒𝐨𝐧𝐞 𝐬𝐞 𝐩𝐞𝐡𝐥𝐞 𝐬𝐨𝐜𝐡𝐨…",
      23: "🌌 𝐒𝐢𝐭𝐚𝐫𝐨𝐧 𝐤𝐞 𝐧𝐞𝐞𝐜𝐡𝐞 𝐬𝐚𝐜𝐡𝐚𝐢…",
      0:  "🌙 𝐌𝐢𝐝𝐧𝐢𝐠𝐡𝐭 𝐯𝐢𝐛𝐞𝐬…",
      1:  "💭 𝐑𝐚𝐚𝐭 𝐛𝐨𝐥𝐭𝐢 𝐡𝐚𝐢…",
      2:  "😴 𝐒𝐨 𝐣𝐚𝐨…",
      3:  "🌌 𝐂𝐡𝐮𝐩 𝐫𝐚𝐚𝐭…",
      4:  "🌄 𝐒𝐮𝐛𝐚𝐡 𝐚𝐧𝐞 𝐰𝐚𝐥𝐢 𝐡𝐚𝐢…"
    };

    const sendShayari = async () => {
      const hour = getIndianHour(); // ✅ fixed timezone
      const threads = await global.Thread.find();

      const line = hourlyShayari[hour];
      if (!line) return;

      const msg =
`╭───〔 ✦ 𝐋𝐈𝐍𝐄𝐒 ✦ 〕───╮

${line}

👑𝐎𝐖𝐍𝐄𝐑: 𝐑𝐔𝐃𝐑𝐀 𝐑𝐀𝐉𝐏𝐔𝐓

╰───────────────────╯`;

      for (const thread of threads) {
        api.sendMessage(msg, thread.threadID);
      }
    };

    // 🔥 Start pe bhi run (miss fix)
    sendShayari();

    // ⏰ Har hour exact run
    schedule.scheduleJob("0 * * * *", sendShayari);
  }
};
