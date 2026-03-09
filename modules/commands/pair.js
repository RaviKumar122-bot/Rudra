const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pair",
    description: "Make a pair with someone in the group",
    usage: "",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "PUBLIC",
    cooldown: 10,
    category: "GAMES"
  },

  run: async function ({ api, message }) {
    const { threadID, messageID, senderID } = message;
    
    // Cache folder setup
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    let pathImg = path.join(cacheDir, `pair_${senderID}.png`);
    let pathAvt1 = path.join(cacheDir, `avt1_${senderID}.png`);
    let pathAvt2 = path.join(cacheDir, `avt2_${senderID}.png`);

    try {
      // 1. Check for Canvas
      let canvas;
      try {
        canvas = require("canvas");
      } catch (e) {
        return api.sendMessage("❌ Error: 'canvas' install nahi hai. Render par 'canvas' package add karein.", threadID, messageID);
      }
      const { loadImage, createCanvas } = canvas;

      // 2. Get User & Partner Info (Fixed getNameUser error)
      const threadInfo = await api.getThreadInfo(threadID);
      const allUsers = threadInfo.userInfo;
      const botID = api.getCurrentUserID();

      // Apna naam nikalna
      const info1 = await api.getUserInfo(senderID);
      const name1 = info1[senderID].name;
      const gender1 = info1[senderID].gender; // 1 for Female, 2 for Male

      // Partner dhoondna
      let candidates = allUsers.filter(u => u.id !== senderID && u.id !== botID);
      
      // Gender preference logic
      let matchCandidates = candidates.filter(u => {
          if (gender1 == 2) return u.gender == 1; // Male looking for Female
          if (gender1 == 1) return u.gender == 2; // Female looking for Male
          return true;
      });

      if (matchCandidates.length == 0) matchCandidates = candidates;
      
      const id2 = matchCandidates[Math.floor(Math.random() * matchCandidates.length)].id;
      const info2 = await api.getUserInfo(id2);
      const name2 = info2[id2].name;

      // 3. Random Match Percentage
      const tile = Math.floor(Math.random() * 101);

      // 4. Download Background & Avatars
      const backgrounds = [
        "https://i.postimg.cc/Hncn7FzP/Picsart-24-07-14-02-01-33-567.jpg",
        "https://i.postimg.cc/tgts9cNG/Picsart-24-07-14-11-17-37-603.jpg",
        "https://i.postimg.cc/Qd8TqTdy/Picsart-24-07-13-22-50-27-001.jpg"
      ];
      const rdBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];

      const [resBg, resAvt1, resAvt2] = await Promise.all([
        axios.get(rdBg, { responseType: "arraybuffer" }),
        axios.get(`https://graph.facebook.com/${senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" }),
        axios.get(`https://graph.facebook.com/${id2}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })
      ]);

      fs.writeFileSync(pathImg, Buffer.from(resBg.data));
      fs.writeFileSync(pathAvt1, Buffer.from(resAvt1.data));
      fs.writeFileSync(pathAvt2, Buffer.from(resAvt2.data));

      // 5. Canvas Drawing
      const img = await loadImage(pathImg);
      const av1 = await loadImage(pathAvt1);
      const av2 = await loadImage(pathAvt2);
      
      const cvs = createCanvas(img.width, img.height);
      const ctx = cvs.getContext("2d");
      ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
      ctx.drawImage(av1, 100, 150, 300, 300);
      ctx.drawImage(av2, 900, 150, 300, 300);

      fs.writeFileSync(pathImg, cvs.toBuffer());

      // 6. Message Sending
      const bodyMsg = `‎‎🤍 ◁𝗖𝗢𝗡𝗚𝗥𝗔𝗧𝗨𝗟𝗔𝗧𝗜𝗢𝗡▷ 🤍 \n\nSuccessful with: ${name2}\nMatch: ${tile}%\nCredits: Vikas Rajput`;

      return api.sendMessage({
        body: bodyMsg,
        mentions: [{ tag: name2, id: id2 }],
        attachment: fs.createReadStream(pathImg)
      }, threadID, () => {
        [pathImg, pathAvt1, pathAvt2].forEach(p => { if(fs.existsSync(p)) fs.unlinkSync(p); });
      }, messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage(`❌ Error: ${err.message}`, threadID, messageID);
    }
  }
};
