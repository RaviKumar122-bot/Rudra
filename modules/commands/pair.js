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
    // Note: Maine yahan se Users aur Threads hata diya hai kyunki aapka bot inhe support nahi kar raha
    const { threadID, messageID, senderID } = message;
    
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    let pathImg = path.join(cacheDir, `pair_${senderID}.png`);
    let pathAvt1 = path.join(cacheDir, `avt1_${senderID}.png`);
    let pathAvt2 = path.join(cacheDir, `avt2_${senderID}.png`);

    try {
      // 1. Load Canvas
      let canvas;
      try {
        canvas = require("canvas");
      } catch (e) {
        return api.sendMessage("❌ Error: Render par 'canvas' package nahi mila. package.json mein 'canvas' add karein.", threadID, messageID);
      }
      const { loadImage, createCanvas } = canvas;

      // 2. Fetch Info using API (Not Users object)
      api.sendMessage("🔍 Matching wait...", threadID, (err, info) => {
          setTimeout(() => api.unsendMessage(info.messageID), 3000);
      }, messageID);

      const [userData, threadInfo] = await Promise.all([
        api.getUserInfo(senderID),
        api.getThreadInfo(threadID)
      ]);

      const name1 = userData[senderID].name;
      const gender1 = userData[senderID].gender; // 1 = Female, 2 = Male
      const allUsers = threadInfo.userInfo;
      const botID = api.getCurrentUserID();

      // 3. Find Partner
      let candidates = allUsers.filter(u => u.id !== senderID && u.id !== botID);
      let matchCandidates = candidates.filter(u => {
          if (gender1 == 2) return u.gender == 1; 
          if (gender1 == 1) return u.gender == 2;
          return true;
      });

      if (matchCandidates.length == 0) matchCandidates = candidates;
      const id2 = matchCandidates[Math.floor(Math.random() * matchCandidates.length)].id;
      const partnerData = await api.getUserInfo(id2);
      const name2 = partnerData[id2].name;

      const tile = Math.floor(Math.random() * 101);

      // 4. Download Assets
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

      // 5. Drawing
      const img = await loadImage(pathImg);
      const av1 = await loadImage(pathAvt1);
      const av2 = await loadImage(pathAvt2);
      
      const cvs = createCanvas(img.width, img.height);
      const ctx = cvs.getContext("2d");
      ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
      ctx.drawImage(av1, 100, 150, 300, 300);
      ctx.drawImage(av2, 900, 150, 300, 300);

      fs.writeFileSync(pathImg, cvs.toBuffer());

      // 6. Send
      const bodyMsg = `‎‎🤍 ◁𝗖𝗢𝗡𝗚𝗥𝗔𝗧𝗨𝗟𝗔𝗧𝗜𝗢𝗡▷ 🤍 \n\nSuccessful with: ${name2}\nMatch: ${tile}%\nCredits: Vikas Rajput`;

      return api.sendMessage({
        body: bodyMsg,
        mentions: [{ tag: name2, id: id2 }],
        attachment: fs.createReadStream(pathImg)
      }, threadID, () => {
        [pathImg, pathAvt1, pathAvt2].forEach(p => { if(fs.existsSync(p)) fs.unlinkSync(p); });
      }, messageID);

    } catch (err) {
      return api.sendMessage(`❌ System Error: ${err.message}`, threadID, messageID);
    }
  }
};
