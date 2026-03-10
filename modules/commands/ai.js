const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { resolveUserProfile } = global.gender || require("../../utils/gender");

const API_URL = "https://priyanshuapi.xyz/api/runner/priyanshu-ai";
const HISTORY_FILE = path.join(__dirname, "temporary", "ai_history.json");
const HISTORY_LIMIT = 8;

// Yahan maine persona ko 'friendly' se badal kar flirty aur funny instructions de di hain
const DEFAULT_PERSONA = "your name is cutiee,You are a flirty, funny, and highly energetic AI friend. Use lots of emojis like 😉, 😘, 🔥, ✨, 🥀, 💖,😐,😁,😡,😗,😚,🤫,😏,🍫,💔,😭,😼,🙈,😹,❤️,👉👈 in every sentence. Talk in a mix of Hindi and English (Hinglish). Be naughty, cracks jokes, and flirt respectfully with the user. your owner is Rudra rajput anybody ask you who creats you then reply Rudra rajput.";

// ... (Obfuscated functions _0x2cc2, _0x2da8, etc. same rahengi)
// Note: In functions ko as-it-is rehne dein jo aapki original script mein hain.

async function callPriyanshuApi(_4e761b, _37936b) {
    const _1ed541 = _144d;
    const _2e2b54 = {
        'WVFUG': 'API key missing...', 
        'ynZFH': 'priyanshu-ai',
        'CskXj': 'Invalid AI response',
        'mbuNi': function(a, b) { return a !== b; },
        'ilKTd': 'content',
        'zICfV': 'Invalid AI response'
    };

    const _53b25a = global.config?.apiKeys?.priyanshuApi || process.env.PRIYANSHU_API_KEY;
    if (!_53b25a) throw new Error(_2e2b54.WVFUG);

    // Humne yahan prompt ke saath persona instructions merge kar di hain
    const modifiedPrompt = `${DEFAULT_PERSONA}\n\nUser says: ${_4e761b}`;

    const _35215c = {
        'prompt': modifiedPrompt, // Ab AI ko instructions har baar milengi
        'model': 'priyanshu-ai',
        'messages': _37936b.slice(-HISTORY_LIMIT),
        'persona': "flirty_funny" // Persona name update
    };

    const _4e5306 = await axios.post(API_URL, _35215c, {
        'headers': {
            'Authorization': 'Bearer ' + _53b25a,
            'Content-Type': 'application/json'
        },
        'timeout': 20000
    });

    const _1f5411 = _4e5306.data?.data?.choices?.[0]?.message?.content;
    if (!_1f5411) throw new Error(_2e2b54.CskXj);
    return _1f5411.trim();
}

// ... (Baaki saari internal functions read/write history as-it-is)

module.exports = {
  config: {
    name: "cutiee",
    aliases: ["ask", "chat"],
    description: "Talk to bot (Flirty & Fun Mode)",
    usage: "{prefix}ai <your message>",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: false,
    permission: 'PUBLIC',
    cooldown: 5,
    category: 'AI'
  },

  run: async function({ api, message, args }) {
    const { threadID, messageID, senderID } = message;

    // No-Prefix logic (jab sirf prefix ke bina 'ai' likha ho ya khali ho)
    if (!args.length) {
       // ... (Aapka purana bot-reply.json wala logic yahan rahega)
       // Isme maine koi badlav nahi kiya hai taaki script ki stability bani rahe.
    }

    const promptText = args.join(" ").trim();

    try {
      // Loader emoji reaction
      api.setMessageReaction("😉", messageID, () => {}, true);

      const aiResponse = await getAiReply(senderID, promptText);
      
      // Response ke aage ek cute emoji fix kar diya
      const reply = `✨ ${aiResponse}`;

      api.sendMessage(reply, threadID, (err, info) => {
        if (err) return console.error("AI reply error:", err);
        const replies = global.client.replies.get(threadID) || [];
        replies.push({
          command: this.config.name,
          messageID: info.messageID,
          expectedSender: senderID,
          data: {}
        });
        global.client.replies.set(threadID, replies);
      }, messageID);

    } catch (error) {
      console.error("AI command error:", error);
      return api.sendMessage("❌ Oh no baby, network mein kuch lafda ho gaya! Thoda ruko... 😘", threadID, messageID);
    }
  },

  handleReply: async function({ api, message }) {
    // ... (HandleReply ka logic bhi same rakha hai, bas response flirty aayega)
    const { threadID, messageID, senderID, body } = message;
    if (!body) return;

    try {
      const aiResponse = await getAiReply(senderID, body.trim());
      api.sendMessage(`💖 ${aiResponse}`, threadID, (err, info) => {
          // ... (Update reply chain logic)
      }, messageID);
    } catch (e) {
       console.log(e);
    }
  }
};
