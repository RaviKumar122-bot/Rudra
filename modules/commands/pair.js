const axios = require("axios");
const fs = require("fs-extra");
const { loadImage, createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "pair",
    description: "Make a pair with someone in the group",
    usage: "",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭", // Credits same rakha hai
    hasPrefix: true,
    permission: "PUBLIC",
    cooldown: 10,
    category: "GAMES"
  },

  run: async function ({ api, message, Users, Threads }) {
    const { threadID, messageID, senderID } = message;

    // Cache paths
    let pathImg = __dirname + `/cache/pair_${senderID}.png`;
    let pathAvt1 = __dirname + `/cache/avt1_${senderID}.png`;
    let pathAvt2 = __dirname + `/cache/avt2_${senderID}.png`;

    try {
      if (!fs.existsSync(__dirname + "/cache")) fs.mkdirSync(__dirname + "/cache");

      var id1 = senderID;
      var name1 = await Users.getNameUser(id1);
      var ThreadInfo = await api.getThreadInfo(threadID);
      var all = ThreadInfo.userInfo;
      
      let gender1 = "";
      for (let c of all) {
        if (c.id == id1) gender1 = c.gender;
      }

      const botID = api.getCurrentUserID();
      let ungvien = [];

      // Gender logic same rakha hai
      if (gender1 == "FEMALE") {
        for (let u of all) {
          if (u.gender == "MALE" && u.id !== id1 && u.id !== botID) ungvien.push(u.id);
        }
      } else if (gender1 == "MALE") {
        for (let u of all) {
          if (u.gender == "FEMALE" && u.id !== id1 && u.id !== botID) ungvien.push(u.id);
        }
      } else {
        for (let u of all) {
          if (u.id !== id1 && u.id !== botID) ungvien.push(u.id);
        }
      }

      if (ungvien.length == 0) return api.sendMessage("❌ Aapke liye koi partner nahi mila!", threadID, messageID);

      var id2 = ungvien[Math.floor(Math.random() * ungvien.length)];
      var name2 = await Users.getNameUser(id2);
      
      // Luck/Percentage logic
      var rd1 = Math.floor(Math.random() * 100) + 1;
      var cc = ["0", "-1", "99.99", "-99", "-100", "101", "0.01"];
      var rd2 = cc[Math.floor(Math.random() * cc.length)];
      var djtme = [rd1, rd1, rd1, rd1, rd1, rd2, rd1, rd1, rd1, rd1];
      var tile = djtme[Math.floor(Math.random() * djtme.length)];

      // Background Images
      var background = [
        "https://i.postimg.cc/Hncn7FzP/Picsart-24-07-14-02-01-33-567.jpg",
        "https://i.postimg.cc/tgts9cNG/Picsart-24-07-14-11-17-37-603.jpg",
        "https://i.postimg.cc/Qd8TqTdy/Picsart-24-07-13-22-50-27-001.jpg"
      ];
      var rd = background[Math.floor(Math.random() * background.length)];

      // Avatars fetch karna
      let getAvtmot = (await axios.get(`https://graph.facebook.com/${id1}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(pathAvt1, Buffer.from(getAvtmot, "utf-8"));

      let getAvthai = (await axios.get(`https://graph.facebook.com/${id2}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(pathAvt2, Buffer.from(getAvthai, "utf-8"));

      let getbackground = (await axios.get(`${rd}`, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(pathImg, Buffer.from(getbackground, "utf-8"));

      // Canvas Drawing
      let baseImage = await loadImage(pathImg);
      let baseAvt1 = await loadImage(pathAvt1);
      let baseAvt2 = await loadImage(pathAvt2);
      let canvas = createCanvas(baseImage.width, baseImage.height);
      let ctx = canvas.getContext("2d");
      
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(baseAvt1, 100, 150, 300, 300);
      ctx.drawImage(baseAvt2, 900, 150, 300, 300);
      
      const imageBuffer = canvas.toBuffer();
      fs.writeFileSync(pathImg, imageBuffer);

      // Final Message
      const bodyMsg = `‎‎🤍 ◁𝗖𝗢𝗡𝗚𝗥𝗔𝗧𝗨𝗟𝗔𝗧𝗜𝗢𝗡▷ 🤍 \n\n𝑇ℎ𝑖𝑠 𝑙𝑖𝑛𝑒 𝑓𝑜𝑟 𝑦𝑜𝑢 ➤➤➤➤➤\n\n💞 »»\n『\n   🥲┼┼──🦋 𝐊ɪɴ 𝐋ᴀғᴢᴏɴ 𝐌ᴇ 𝐁ʏᴀɴ 𝐊ᴀʀᴜ      🥲┼┼──🍁                         𝐀ʜᴇᴍɪʏᴀᴛ 𝐓ᴇʀɪ  🥲┼┼──🦋°          𝐊ɪ 𝐁ɪɴ 𝐓ᴇʀᴇ 𝐍ᴀᴍᴜᴍ𝐊ɪɴ 𝐒ɪ 𝐋ᴀɢᴛɪ 𝐇ᴀ𝐢•||•●┼ᚐ🩵 ꯭←̟̽ __  ꯭←̟̽🩷💋┼──                                🥲┼┼──°   𝐙ɪɴᴅᴀɢɪ 𝐌ᴇʀɪ  』  ${name1} \n   😽𝑆𝑢𝑐𝑐𝑒𝑠𝑓𝑢𝑙𝑙𝑦 𝑤𝑖𝑡ℎ😽 ${name2}\n 𝓐𝒑𝒑 𝓓𝒐𝒏𝒐 𝓚𝒆 𝙂𝒖𝒏 💌 ${tile}%\n     𝓒𝓻𝓮𝓭𝓲𝓽𝓼 ➺➤ 𝙑𝓲𝓴𝓪𝑠 𝓡𝓪𝓳𝒑𝒖𝑡`;

      return api.sendMessage({
        body: bodyMsg,
        mentions: [{ tag: name2, id: id2 }],
        attachment: fs.createReadStream(pathImg)
      }, threadID, () => {
        // Cleanup files after sending
        if (fs.existsSync(pathImg)) fs.unlinkSync(pathImg);
        if (fs.existsSync(pathAvt1)) fs.unlinkSync(pathAvt1);
        if (fs.existsSync(pathAvt2)) fs.unlinkSync(pathAvt2);
      }, messageID);

    } catch (e) {
      console.log(e);
      return api.sendMessage("❌ Kuch error aaya hai!", threadID, messageID);
    }
  }
};
