const axios = require("axios");

// AI ka behavior/nature
const BOT_PERSONA = "You are a flirty, funny, and energetic AI friend. Use lots of emojis like 😉, 😘, 🔥, ✨, 🥀, 💖. Talk in Hinglish. Your name is Cutiee. Be naughty and sweet,your owner is Rudra Rajput.";

module.exports = {
  config: {
    name: "cutiee", // Command ka naam 'cutiee' rakha hai taaki trigger ho sake
    aliases: ["ai", "bot"],
    description: "Talk to Cutiee with continuous conversation",
    usage: "cutiee <message> or reply to bot",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: false, // Bina prefix ke chalega
    permission: 'PUBLIC',
    cooldown: 2,
    category: 'AI'
  },

  run: async function({ api, message, args }) {
    const { threadID, messageID, senderID } = message;

    // Agar sirf 'cutiee' likha ho bina kisi text ke
    if (!args.length) {
      return api.sendMessage("Bolo na jaaan, aise kyun dekh rahe ho? 😉😘", threadID, messageID);
    }

    const promptText = args.join(" ").trim();
    return await handleAIResponse(api, threadID, messageID, senderID, promptText);
  },

  // Jab koi bot ke message par REPLY karega, tab ye function chalega
  handleReply: async function({ api, message, handleReply }) {
    const { threadID, messageID, senderID, body } = message;
    
    // Agar reply khali hai toh kuch mat karo
    if (!body) return;

    return await handleAIResponse(api, threadID, messageID, senderID, body);
  }
};

// Common function for AI response (to keep code clean)
async function handleAIResponse(api, threadID, messageID, senderID, prompt) {
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

    // Hum message bhej rahe hain aur sath mein 'handleReply' register kar rahe hain
    return api.sendMessage(`✨ ${aiResponse}`, threadID, (err, info) => {
      if (err) return;

      // Ye line sabse zaruri hai: Ye bot ko yaad dilayegi ki is message par reply aane par firse AI ko bulana hai
      if (typeof global.client !== 'undefined' && global.client.handleReply) {
        global.client.handleReply.push({
          name: "cutiee", // Jo module ka naam upar config mein hai
          messageID: info.messageID,
          author: senderID
        });
      }
    }, messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ Network mein lafda hai baby, thoda ruko... 😘", threadID, messageID);
  }
  }
