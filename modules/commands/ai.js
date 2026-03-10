const axios = require("axios");

const BOT_PERSONA = "You are a flirty, funny, and energetic AI friend. Use lots of emojis like 😉, 😘, 😡, ✨, 🥀, 😭,🙄,😒,🙈. Talk in Hinglish. Your name is Cutiee. Be naughty and sweet,your owner is Rudra rajput.";

module.exports = {
  config: {
    name: "cutiee",
    aliases: ["ai", "bot"],
    description: "Talk to Cutiee with continuous conversation",
    usage: "cutiee <message> or reply to bot",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: false,
    permission: 'PUBLIC',
    cooldown: 2,
    category: 'AI'
  },

  // Ye function tab chalega jab aap pehli baar 'cutiee' likhenge
  run: async function({ api, message, args }) {
    const { threadID, messageID, senderID } = message;

    if (!args.length) {
      return api.sendMessage("Bolo na jaaan, aise kyun dekh rahe ho? 😉😘", threadID, messageID);
    }

    const promptText = args.join(" ").trim();
    return await handleAIResponse(api, threadID, messageID, senderID, promptText, this.config.name);
  },

  // Ye function tab chalega jab aap bot ke reply par bina 'cutiee' likhe reply karenge
  handleReply: async function({ api, message, handleReply }) {
    const { threadID, messageID, senderID, body } = message;
    if (!body) return;

    // Yahan hum dobara AI ko call kar rahe hain bina naam ki zarurat ke
    return await handleAIResponse(api, threadID, messageID, senderID, body, this.config.name);
  }
};

async function handleAIResponse(api, threadID, messageID, senderID, prompt, commandName) {
  try {
    api.setMessageReaction("⏳", messageID, () => {}, true);

    const apiKey = "apim_PHNPYM8mq_Mpav9ue8sGJ6MNPAEvKNKJ13Uq1YZGcX4";

    const res = await axios.post("https://priyanshuapi.xyz/api/runner/priyanshu-ai", {
      prompt: `${BOT_PERSONA}\n\nUser: ${prompt}`,
      model: "priyanshu-ai",
      persona: "flirty"
    }, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    const aiResponse = res.data?.data?.choices?.[0]?.message?.content || "Oh sorry baby, kuch samajh nahi aaya! 😉";

    return api.sendMessage(`✨ ${aiResponse}`, threadID, (err, info) => {
      if (err) return;

      // Sabse important part: Framework ko batana ki is message par reply aane par 'handleReply' chalana hai
      if (global.client && global.client.handleReply) {
        global.client.handleReply.push({
          name: commandName,
          messageID: info.messageID,
          author: senderID
        });
      }
    }, messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ Network issue hai baby, thoda ruko... 😘", threadID, messageID);
  }
        }
