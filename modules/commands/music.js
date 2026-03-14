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
  let loadingMessage = null;

  try {
    const loadingSteps = [
      "🎧 Processing your request...\n\n░░░░░░░░░░ 15% ⏳",
      "🎧 Processing your request...\n\n███░░░░░░░ 45% 🔍 Searching...",
      "🎧 Processing your request...\n\n██████░░░░ 60% ⚙️ Fetching data...",
      "🎧 Processing your request...\n\n████████░░ 80% 📥 Preparing download...",
      "🎧 Processing your request...\n\n██████████ 100% ✅ Complete\n✨ Preparing your music...",
    ];

    loadingMessage = await api.sendMessage(loadingSteps[0], threadID);
    await new Promise(r => setTimeout(r, 700));

    // Check if input is YouTube URL
    const isUrl = /^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)(\/|$)/.test(input);
    if (!isUrl) {
      loadingMessage = await api.editMessage(loadingSteps[1], loadingMessage.messageID, threadID);
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
    } else {
      loadingMessage = await api.editMessage(loadingSteps[1], loadingMessage.messageID, threadID);
      try {
        const videoIdMatch = input.match(/(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/|v\/)|youtu\.be\/)([0-9A-Za-z_-]{11})/);
        if (videoIdMatch) {
          const videoId = videoIdMatch[1];
          videoUrl = `https:                                      
          const searchResult = await ytSearch({ videoId: videoId });
          if (searchResult) {
            videoTitle = searchResult.title;
            videoDetails = {
              duration: searchResult.duration.timestamp,
              views: searchResult.views,
              author: searchResult.author.name,
              ago: searchResult.ago,
            };
          }
        }
      } catch (e) {}
    }

    loadingMessage = await api.editMessage(loadingSteps[2], loadingMessage.messageID, threadID);
    const apiUrl = "https:                                                              
    const response = await axios.post(
      apiUrl,
      {
        link: videoUrl,
        format: "mp3",
        videoQuality: "360",
      },
      {
        headers: {
          Authorization: `//www.youtube.com/watch?v=${videoId}`;
          const searchResult = await ytSearch({ videoId: videoId });
          if (searchResult) {
            videoTitle = searchResult.title;
            videoDetails = {
              duration: searchResult.duration.timestamp,
              views: searchResult.views,
              author: searchResult.author.name,
              ago: searchResult.ago,
            };
          }
        }
      } catch (e) {}
    }

    loadingMessage = await api.editMessage(loadingSteps[2], loadingMessage.messageID, threadID);
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

    loadingMessage = await api.editMessage(loadingSteps[3], loadingMessage.messageID, threadID);

                      
    try {
      const headResponse = await axios.head(downloadUrl);
      const contentLength = headResponse.headers["content-length"];
      if (contentLength && parseInt(contentLength) > 30 * 1024 * 1024) {
        return api.sendMessage("❌ File size exceeds 30MB limit.", threadID, messageID);
      }
    } catch (headError) {}

    loadingMessage = await api.editMessage(loadingSteps[4], loadingMessage.messageID, threadID);

    const formattedViews = videoDetails.views ? new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(videoDetails.views) : "N/A";
    let infoMsg = `// Check file size
    try {
      const headResponse = await axios.head(downloadUrl);
      const contentLength = headResponse.headers["content-length"];
      if (contentLength && parseInt(contentLength) > 30 * 1024 * 1024) {
        return api.sendMessage("❌ File size exceeds 30MB limit.", threadID, messageID);
      }
    } catch (headError) {}

    loadingMessage = await api.editMessage(loadingSteps[4], loadingMessage.messageID, threadID);

    const formattedViews = videoDetails.views ? new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(videoDetails.views) : "N/A";
    let infoMsg = `🎵 Title: ${finalTitle}\n`;
    if (videoDetails.duration) infoMsg += `⏱ Duration: ${videoDetails.duration}\n`;
    if (videoDetails.author) infoMsg += `👤 Artist: ${videoDetails.author}\n`;
    if (videoDetails.views) infoMsg += `👀 Views: ${formattedViews}\n`;
    if (videoDetails.ago) infoMsg += `📅 Uploaded: ${videoDetails.ago}\n`;
    infoMsg += `🔗 Source: ${videoUrl}\n`;
    infoMsg += `📥 Download Link: ${downloadUrl}\n`;

    api.unsendMessage(loadingMessage.messageID);
    api.sendMessage(infoMsg, threadID, () => {
      const tempDir = path.join(__dirname, "tempsr");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      const safeFilename = (filename || `${Date.now()}.mp3`).replace(/[^a-zA-Z0-9.-]/g, "_");
      const filePath = path.join(tempDir, safeFilename);
      const writer = fs.createWriteStream(filePath);
      const downloadResponse = axios({
        method: "GET",
        url: downloadUrl,
        responseType: "stream",
      });
      downloadResponse.data.pipe(writer);
      writer.on("finish", () => {
        fs.stat(filePath, (statErr, stats) => {
          if (statErr || !stats || stats.size === 0) {
            api.sendMessage("❌ Download failed (empty file).", threadID, messageID);
            return fs.unlink(filePath, () => { });
          }
          api.sendMessage(
            {
              body: `🎧 ${finalTitle}`,
              attachment: fs.createReadStream(filePath),
            },
            threadID,
            (err) => {
              if (err) {
                api.sendMessage("❌ Failed to send audio file.", threadID, messageID);
              }
              fs.unlink(filePath, () => { });
            }
          );
        });
      });
      writer.on("error", () => {
        api.sendMessage("❌ Failed to download the file.", threadID, messageID);
        fs.unlink(filePath, () => { });
      });
    });
  } catch (error) {
    api.sendMessage("❌ An error occurred while processing your request.", threadID, messageID);
  }
};
