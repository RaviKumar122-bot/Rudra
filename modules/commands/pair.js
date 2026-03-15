const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const VIP_UID = "100090065722539";
const secretAliases = ["love","pyar","jodi"];

module.exports = {
  config: {
    name: "pair",
    aliases: ["pyar","love","jodi"],
    description: "Make a pair with someone in the group",
    usage: "",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "PUBLIC",
    cooldown: 10,
    category: "GAMES"
  },

  run: async function ({ api, message }) {

    const { threadID, messageID, senderID, body } = message;

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    let pathImg = path.join(cacheDir, `pair_${senderID}.png`);
    let pathAvt1 = path.join(cacheDir, `avt1_${senderID}.png`);
    let pathAvt2 = path.join(cacheDir, `avt2_${senderID}.png`);

    try {

      const canvas = require("canvas");
      const { loadImage, createCanvas } = canvas;

      api.sendMessage("🔍 Matching pair...👀", threadID, (err, info) => {
        setTimeout(() => api.unsendMessage(info.messageID), 3000);
      }, messageID);

      const [userData, threadInfo] = await Promise.all([
        api.getUserInfo(senderID),
        api.getThreadInfo(threadID)
      ]);

      const name1 = userData[senderID].name;
      const gender1 = userData[senderID].gender;

      const allUsers = threadInfo.userInfo;
      const botID = api.getCurrentUserID();

      const isUsingAlias = secretAliases.some(a => body.toLowerCase().includes(a));
      const cheatMode = senderID === VIP_UID && isUsingAlias;

      let id2;
      let name2;
      let forcedMatch = false;

      // 🔥 CHEAT MODE
      if (cheatMode) {
        try {

          const history = await api.getThreadHistory(threadID, 20);
          const reversed = history.reverse();

          for (const msg of reversed) {

            if (
              msg.messageReactions &&
              msg.messageReactions.some(r => r.userID == senderID)
            ) {
              if (msg.senderID !== senderID) {
                id2 = msg.senderID;

                const info = await api.getUserInfo(id2);
                name2 = info[id2].name;

                forcedMatch = true;
                break;
              }
            }
          }

        } catch(e){}
      }

      // 🎲 NORMAL RANDOM MATCH
      if (!id2) {

        let candidates = allUsers.filter(u => u.id !== senderID && u.id !== botID);

        let matchCandidates = candidates.filter(u => {

          if (gender1 == 2) return u.gender == 1;
          if (gender1 == 1) return u.gender == 2;

          return true;

        });

        if (matchCandidates.length == 0) matchCandidates = candidates;

        const random = matchCandidates[Math.floor(Math.random() * matchCandidates.length)];

        id2 = random.id;
        name2 = random.name;

      }

      // ❤️ MATCH PERCENT
      let tile;

      if (forcedMatch) {
        tile = (Math.random() * (100 - 98) + 98).toFixed(1);
      } else {
        tile = (Math.random() * 100).toFixed(1);
      }

      const percent = parseFloat(tile);

      let quote;

      if (percent <= 20) {
        const q = [
          "Isse badhiya toh zeher kha lo ☠️",
          "Ye jodi nahi tabahi hai 💣",
          "Police case ho jayega 🚓"
        ];
        quote = q[Math.floor(Math.random()*q.length)];
      }

      else if (percent <= 40) {
        const q = [
          "Friendzone Pro Max 😬",
          "Rakhi bandhwa lo 🧵",
          "Thoda mushkil hai boss 📉"
        ];
        quote = q[Math.floor(Math.random()*q.length)];
      }

      else if (percent <= 70) {
        const q = [
          "Time pass jodi ⏳",
          "Adjust karoge toh chal jayega 🛠️",
          "Average chemistry 🧪"
        ];
        quote = q[Math.floor(Math.random()*q.length)];
      }

      else if (percent <= 90) {
        const q = [
          "Mast jodi hai 🔥",
          "Nazar na lage 🧿",
          "Chemistry solid hai 🧪✨"
        ];
        quote = q[Math.floor(Math.random()*q.length)];
      }

      else {
        const q = [
          "Rab ne bana di jodi 💑",
          "Made for each other ❤️",
          "Shaadi ka card kab bhej rahe ho 💌"
        ];
        quote = q[Math.floor(Math.random()*q.length)];
      }

      // 🖼 BACKGROUND
      const backgrounds = [
        "https://i.postimg.cc/Hncn7FzP/Picsart-24-07-14-02-01-33-567.jpg",
        "https://i.postimg.cc/tgts9cNG/Picsart-24-07-14-11-17-37-603.jpg"
      ];

      const rdBg = backgrounds[Math.floor(Math.random()*backgrounds.length)];

      const [resBg, resAvt1, resAvt2] = await Promise.all([

        axios.get(rdBg,{responseType:"arraybuffer"}),

        axios.get(`https://graph.facebook.com/${senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,{responseType:"arraybuffer"}),

        axios.get(`https://graph.facebook.com/${id2}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,{responseType:"arraybuffer"})

      ]);

      fs.writeFileSync(pathImg,Buffer.from(resBg.data));
      fs.writeFileSync(pathAvt1,Buffer.from(resAvt1.data));
      fs.writeFileSync(pathAvt2,Buffer.from(resAvt2.data));

      // 🎨 DRAW
      const img = await loadImage(pathImg);
      const av1 = await loadImage(pathAvt1);
      const av2 = await loadImage(pathAvt2);

      const cvs = createCanvas(img.width,img.height);
      const ctx = cvs.getContext("2d");

      ctx.drawImage(img,0,0,cvs.width,cvs.height);

      ctx.drawImage(av1,100,150,300,300);
      ctx.drawImage(av2,900,150,300,300);

      fs.writeFileSync(pathImg,cvs.toBuffer());

      const bodyMsg =
`🤍 ◁𝗖𝗢𝗡𝗚𝗥𝗔𝗧𝗨𝗟𝗔𝗧𝗜𝗢𝗡▷ 🤍

${name1} 💖 ${name2}

📊 Match: ${tile}%

💬 "${quote}"`;

      return api.sendMessage({

        body: bodyMsg,

        mentions:[
          {tag:name1,id:senderID},
          {tag:name2,id:id2}
        ],

        attachment: fs.createReadStream(pathImg)

      },threadID,()=>{

        [pathImg,pathAvt1,pathAvt2].forEach(p=>{
          if(fs.existsSync(p)) fs.unlinkSync(p)
        })

      },messageID);

    } catch(err){

      return api.sendMessage(`❌ System Error: ${err.message}`,threadID,messageID)

    }

  }
};
          
