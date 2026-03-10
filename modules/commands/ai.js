const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// Persona setting: Yahan se AI ka behavior control hota hai
const BOT_PERSONA = "You are a flirty, funny, and energetic AI friend. Use lots of emojis like 😉, 😘, 🙈, ✨, 🥀, ❤️,😡,😒,🙄. Talk in Hinglish. Be naughty and cracks jokes. Your name is cutiee ai.";

module.exports = {
  config: {
    name: "cutiee",
    aliases: ["ask", "chat"],
    description: "Talk to bot (powered by Priyansh AI)",
    usage: "ai <your message>",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: false,
    permission: 'PUBLIC',
    cooldown: 5,
    category: 'AI'
  },

  run: async function({ api, message, args }) {
    const { threadID, messageID, senderID } = message;

    // Agar khali 'ai' likha ho (No prefix logic)
    if (!args.length) {
      return api.sendMessage("🥀 Batao na baby, kuch kehna hai? 😘", threadID, messageID);
    }

    const promptText = args.join(" ").trim();

    try {
      api.setMessageReaction("⏳", messageID, () => {}, true);

      // API Key Check (Directly putting the key here for safety)
      const apiKey = "apim_PHNPYM8mq_Mpav9ue8sGJ6MNPAEvKNKJ13Uq1YZGcX4";

      const res = await axios.post("https://priyanshuapi.xyz/api/runner/priyanshu-ai", {
        prompt: `${BOT_PERSONA}\n\nUser: ${promptText}`,
        model: "priyanshu-ai",
        persona: "flirty"
      }, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });

      // API Response Parsing
      const aiResponse = res.data?.data?.choices?.[0]?.message?.content || "Oh sorry baby, kuch samajh nahi aaya! 😉";
      
      api.setMessageReaction("💖", messageID, () => {}, true);
      return api.sendMessage(`✨ ${aiResponse}`, threadID, messageID);

    } catch (error) {
      console.error(error);
      return api.sendMessage("❌ Oh no baby, network mein kuch lafda ho gaya! Thoda ruko... 😘", threadID, messageID);
    }
  }
};
