```javascript
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const ytSearch = require("yt-search");

module.exports.config = {
name: "music",
aliases: ["yt", "ytmusic"],
version: "2.0.0",
credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
description: "Download music from YouTube",
hasPrefix: true,
permission: "PUBLIC",
category: "MEDIA",
usages: "[url/song name]",
cooldown: 5,
};

module.exports.run = async function ({ api, message, args }) {

const { threadID, messageID } = message;

if (!args.length) {
return api.sendMessage("❌ Please enter a song name or YouTube URL.", threadID, messageID);
}

const apiKey = global.config.apiKeys?.priyanshuApi;

if (!apiKey) {
return api.sendMessage("❌ API key not found in config.", threadID, messageID);
}

const input = args.join(" ");

let videoUrl = input;
let videoTitle = "";
let videoDetails = {};

try {

const loadingMsg = await api.sendMessage(
`🎧 Processing your request...

░░░░░░░░░░ 15%`,
threadID
);

function progress(text){
api.sendMessage(text, threadID, null, loadingMsg.messageID);
}

setTimeout(()=>progress("████░░░░░░ 45% 🔍 Searching..."),800);
setTimeout(()=>progress("██████░░░░ 60% ⚙️ Fetching data..."),1600);
setTimeout(()=>progress("████████░░ 80% 📥 Preparing download..."),2400);
setTimeout(()=>progress("██████████ 100% ✅ Complete"),3200);

const isUrl = /^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)(\/|$)/.test(input);

if (!isUrl) {

const searchResult = await ytSearch(input);

if (!searchResult || !searchResult.videos.length) {
return api.sendMessage("❌ Song not found on YouTube.", threadID, messageID);
}

const video = searchResult.videos[0];

videoUrl = video.url;
videoTitle = video.title;

videoDetails = {
duration: video.duration.timestamp,
views: video.views,
author: video.author.name,
ago: video.ago,
};

}

const apiUrl = "https://priyanshuapi.xyz/api/runner/youtube-downloader-v2/download";

const response = await axios.post(
apiUrl,
{
link: videoUrl,
format: "mp3",
videoQuality: "360",
},
{
headers: {
Authorization: `Bearer ${apiKey}`,
"Content-Type": "application/json",
},
}
);

if (!response.data || !response.data.success || !response.data.data) {
return api.sendMessage("❌ Failed to generate download link.", threadID, messageID);
}

const { downloadUrl, title, filename } = response.data.data;

const finalTitle = videoTitle || title || "Unknown Title";

const formattedViews = videoDetails.views
? new Intl.NumberFormat("en-US",{notation:"compact"}).format(videoDetails.views)
: "N/A";

const videoIdMatch = videoUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);

let thumbnail = null;

if(videoIdMatch){
const videoId = videoIdMatch[1];
thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

const tempDir = path.join(__dirname, "tempsr");

if (!fs.existsSync(tempDir)) {
fs.mkdirSync(tempDir, { recursive: true });
}

const thumbPath = path.join(tempDir,"thumb.jpg");

if(thumbnail){

const thumbData = await axios({
url: thumbnail,
method: "GET",
responseType: "stream"
});

const thumbWriter = fs.createWriteStream(thumbPath);

thumbData.data.pipe(thumbWriter);

await new Promise(resolve=>thumbWriter.on("finish",resolve));

}

const crazyMsg =
`╔═══『 🎧 MUSIC PLAYER 』═══╗

🎵 ${finalTitle}

⏱ ${videoDetails.duration || "N/A"} | 👁 ${formattedViews}
🎤 ${videoDetails.author || "Unknown"}

▰▰▰▰▰▰▰▰▰▰

🔗 youtube.com
⬇ Downloading your track...

╚════════════════════╝`;

api.sendMessage({
body:crazyMsg,
attachment: thumbnail ? fs.createReadStream(thumbPath) : null
},threadID);

const safeFilename = (filename || `${Date.now()}.mp3`).replace(/[^a-zA-Z0-9.-]/g,"_");

const filePath = path.join(tempDir,safeFilename);

const writer = fs.createWriteStream(filePath);

const downloadResponse = await axios({
method:"GET",
url:downloadUrl,
responseType:"stream"
});

downloadResponse.data.pipe(writer);

writer.on("finish",()=>{

fs.stat(filePath,(err,stats)=>{

if(err || !stats || stats.size === 0){

api.sendMessage("❌ Download failed.",threadID,messageID);

return fs.unlink(filePath,()=>{});
}

api.sendMessage({
body:`🎧 ${finalTitle}`,
attachment:fs.createReadStream(filePath)
},threadID,()=>{

fs.unlink(filePath,()=>{});
if(fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);

});

});

});

writer.on("error",()=>{

api.sendMessage("❌ Failed to download the file.",threadID,messageID);

fs.unlink(filePath,()=>{});

});

}catch(error){

console.error(error);

api.sendMessage("❌ An error occurred while processing your request.",threadID,messageID);

}

};
```
