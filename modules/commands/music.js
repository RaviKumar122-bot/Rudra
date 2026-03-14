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
    let searchingMessageInfo = null;

    try {

        const isUrl = /^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)(\/|$)/.test(input);

        if (!isUrl) {

            searchingMessageInfo = await api.sendMessage(`🔍 Searching for: ${input}...`, threadID, messageID);

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

            searchingMessageInfo = await api.sendMessage(`🔍 Processing URL...`, threadID, messageID);

            try {

                const videoIdMatch = input.match(/(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/|v\/)|youtu\.be\/)([0-9A-Za-z_-]{11})/);

                if (videoIdMatch) {

                    const videoId = videoIdMatch[1];

                    videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

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

            if (searchingMessageInfo) api.unsendMessage(searchingMessageInfo.messageID);

            return api.sendMessage("❌ Failed to generate download link.", threadID, messageID);
        }

        const { downloadUrl, title, filename } = response.data.data;

        const finalTitle = videoTitle || title || "Unknown Title";

        const videoId = videoUrl.split("v=")[1]?.split("&")[0];
        const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

        try {

            const headResponse = await axios.head(downloadUrl);
            const contentLength = headResponse.headers["content-length"];

            if (contentLength && parseInt(contentLength) > 30 * 1024 * 1024) {

                if (searchingMessageInfo) api.unsendMessage(searchingMessageInfo.messageID);

                return api.sendMessage("❌ File size exceeds 30MB limit.", threadID, messageID);
            }

        } catch (headError) {}

        const formattedViews = videoDetails.views
            ? new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(videoDetails.views)
            : "N/A";

        let infoMsg =
`╔══════════════════════╗
   🎧 𝗠𝗨𝗦𝗜𝗖 𝗖𝗔𝗥𝗗
╚══════════════════════╝

🎵 𝗧𝗶𝘁𝗹𝗲: ${finalTitle}
👤 𝗔𝗿𝘁𝗶𝘀𝘁: ${videoDetails.author || "Unknown"}
⏱ 𝗗𝘂𝗿𝗮𝘁𝗶𝗼𝗻: ${videoDetails.duration || "N/A"}
👀 𝗩𝗶𝗲𝘄𝘀: ${formattedViews}
📅 𝗨𝗽𝗹𝗼𝗮𝗱𝗲𝗱: ${videoDetails.ago || "N/A"}

🔗 𝗦𝗼𝘂𝗿𝗰𝗲: ${videoUrl}

━━━━━━━━━━━━━━━━━━
👑 𝗢𝗪𝗡𝗘𝗥: 𝗥𝗨𝗗𝗥𝗔 𝗥𝗔𝗝𝗣𝗨𝗧
━━━━━━━━━━━━━━━━━━

⏳ 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗶𝗻𝗴 𝗔𝘂𝗱𝗶𝗼...
`;

        const thumbStream = await axios({
            url: thumbnail,
            method: "GET",
            responseType: "stream"
        });

        api.sendMessage(
        {
            body: infoMsg,
            attachment: thumbStream.data
        },
        threadID,
        () => {
            if (searchingMessageInfo) {
                api.unsendMessage(searchingMessageInfo.messageID);
            }
        });

        const tempDir = path.join(__dirname, "tempsr");

        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const safeFilename = (filename || `${Date.now()}.mp3`).replace(/[^a-zA-Z0-9.-]/g, "_");
        const filePath = path.join(tempDir, safeFilename);

        const writer = fs.createWriteStream(filePath);

        const downloadResponse = await axios({
            method: "GET",
            url: downloadUrl,
            responseType: "stream",
        });

        downloadResponse.data.pipe(writer);

        writer.on("finish", () => {

            fs.stat(filePath, (statErr, stats) => {

                if (statErr || !stats || stats.size === 0) {

                    api.sendMessage("❌ Download failed (empty file). Please try again.", threadID, messageID);

                    return fs.unlink(filePath, () => {});
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

                        fs.unlink(filePath, () => {});
                    }
                );
            });

        });

        writer.on("error", () => {

            api.sendMessage("❌ Failed to download the file.", threadID, messageID);

            fs.unlink(filePath, () => {});
        });

    } catch (error) {

        console.error("Error in music command:", error);

        api.sendMessage("❌ An error occurred while processing your request.", threadID, messageID);

    }
};
