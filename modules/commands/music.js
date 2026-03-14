```javascript
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const ytSearch = require("yt-search");

module.exports.config = {
name: "music",
aliases: ["yt", "ytmusic"],
version: "1.0.0",
credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
description: "Download music from YouTube",
hasPrefix: true,
permission: 'PUBLIC',
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
let loadingMsg;

try {

// single loading message
loadingMsg = await api.sendMessage("🎧 Processing your music...\n\n15% ⏳", threadID);

// edit function
async function editProgress(text){
try{
api.editMessage(text, loadingMsg.messageID);
}catch{}
}

// progress updates
await new Promise(r=>setTimeout(r,700));
await editProgress("🎧 Processing your music...\n\n45% 🔍 Searching song...");

await new Promise(r=>setTimeout(r,700));
await editProgress("🎧 Processing your music...\n\n60% ⚙️ Fetching data...");

await new Promise(r=>setTimeout(r,700));
await editProgress("🎧 Processing your music...\n\n80% 📥 Preparing download...");

await new Promise(r=>setTimeout(r,700));
await editProgress("🎧 Processing your music...\n\n100% ✅ Complete");


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
? new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(videoDetails.views)
: "N/A";

let thumbnail;

const videoIdMatch = videoUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);

if(videoIdMatch){
thumbnail = `https://img.youtube.com/vi/${videoIdMatch[1]}/hqdefault.jpg`;
}

let infoMsg = `🎵 ${finalTitle}\n`;

if (videoDetails.duration) infoMsg += `⏱ ${videoDetails.duration}\n`;
if (videoDetails.author) infoMsg += `🎤 ${videoDetails.author}\n`;
if (videoDetails.views) infoMsg += `👁 ${formattedViews}\n`;

infoMsg += `⬇ Downloading your track...`;

api.sendMessage({
body:infoMsg,
attachment: thumbnail ? await axios({
url:thumbnail,
responseType:"stream"
}).then(res=>res.data) : null
},threadID);

const tempDir = path.join(__dirname,"tempsr");

if (!fs.existsSync(tempDir)) {
fs.mkdirSync(tempDir,{recursive:true});
}

const safeFilename = (filename || `${Date.now()}.mp3`).replace(/[^a-zA-Z0-9.-]/g,"_");

const filePath = path.join(tempDir,safeFilename);

const writer = fs.createWriteStream(filePath);

const downloadResponse = await axios({
method:"GET",
url:downloadUrl,
responseType:"stream",
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
attachment:fs.createReadStream(filePath),
},threadID,()=>{

fs.unlink(filePath,()=>{});

// remove loading message after song
if(loadingMsg) api.unsendMessage(loadingMsg.messageID);

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
              
