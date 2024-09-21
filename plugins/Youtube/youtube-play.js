import fetch from "node-fetch";
import yts from "yt-search";
import _ from "lodash";
import {
  socialDl
} from "../../lib/download/social-dl.js";
import {
  Ytdl
} from "../../lib/download/youtube.js";
const handler = async (m, {
  conn,
  command,
  args,
  usedPrefix
}) => {
  try {
    const text = _.get(args, "length") ? args.join(" ") : _.get(m, "quoted.text") || _.get(m, "quoted.caption") || _.get(m, "quoted.description") || null;
    if (!text) {
      console.log("No text provided. Replying with usage instructions.");
      return m.reply(`Masukkan teks atau balas pesan dengan teks yang ingin diolah.\nContoh penggunaan:\n*${usedPrefix}${command} Hai, apa kabar?*`);
    }
    const isMP3 = /^(play|ytplay|ytmp3|playmp3)$/i.test(command);
    m.react(wait);
    console.log("Reaction set to 'wait'");
    let vid, data = null;
    const isYouTubeUrl = /^(https?:\/\/)?(www\.)?((youtube\.com\/(?:embed\/|v\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11}))$/.test(text);
    if (isYouTubeUrl) {
      console.log("YouTube URL detected. Fetching video data.");
      data = await ytdl(text, isMP3 ? "audio" : "video");
      console.log("Data fetched from ytdl:", data);
      const ytSearchResult = await ytsearch(data.title);
      console.log("YouTube search result:", ytSearchResult);
      vid = ytSearchResult;
    } else {
      console.log("Searching for video with text:", text);
      vid = await ytsearch(text);
      console.log("YouTube search result:", vid);
    }
    if (!vid?.url) {
      console.log("Video not found. Replying with error message.");
      return m.reply("Video tidak ditemukan. Silakan coba kata kunci lain.");
    }
    const {
      title = "Tidak Diketahui",
        thumbnail,
        timestamp = "Tidak Diketahui",
        views = "Tidak Diketahui",
        ago = "Tidak Diketahui",
        url
    } = vid;
    const formattedViews = (n => n.toLocaleString("id-ID", {
      maximumFractionDigits: 1
    }).replace(/\.0$/, "") + ["", "rb", "jt", "m"][Math.floor(Math.log10(parseInt(views)) / 3)])(parseInt(views) / Math.pow(1e3, Math.floor(Math.log10(parseInt(views)) / 3)));
    const captvid = `📺 *Judul:* ${title}\n⌛ *Durasi:* ${timestamp}\n👀 *Views:* ${formattedViews}\n📅 *Upload:* ${ago}\n🔗 *Link:* ${url}`;
    console.log("Video caption prepared:", captvid);
    const ytthumb = (await conn.getFile(thumbnail))?.data;
    console.log("Thumbnail data fetched.");
    const infoReply = {
      contextInfo: {
        externalAdReply: {
          body: `Mengunduh ${isMP3 ? "audio" : "video"}, harap tunggu...`,
          mediaType: isMP3 ? 1 : 2,
          mediaUrl: url,
          previewType: 0,
          renderLargerThumbnail: true,
          sourceUrl: url,
          thumbnail: ytthumb,
          title: `Y O U T U B E - ${isMP3 ? "A U D I O" : "V I D E O"}`
        }
      }
    };
    await conn.reply(m.chat, captvid, m, infoReply);
    console.log("Reply sent with video info.");
    infoReply.contextInfo.externalAdReply.body = `Berhasil memutar ${isMP3 ? "audio" : "video"}`;
    console.log("Updating reply body to success message.");
    if (!data) {
      data = await ytdl(url, isMP3 ? "audio" : "video");
      console.log("Data fetched from ytdl for URL:", data);
    }
    const {
      buffer,
      contentType
    } = data;
    console.log("Data buffer and content type:", {
      buffer: buffer,
      contentType: contentType
    });
    if (contentType?.startsWith("audio") || contentType?.startsWith("video")) {
      await conn.sendMessage(m.chat, {
        [isMP3 ? "audio" : "video"]: buffer,
        caption: captvid,
        mimetype: isMP3 ? "audio/mpeg" : "video/mp4",
        contextInfo: infoReply.contextInfo
      }, {
        quoted: m
      });
      console.log("Media sent successfully.");
      m.react(sukses);
    } else {
      await conn.sendMessage(m.chat, {
        text: `Media tidak ditemukan dalam format yang diinginkan.`,
        contextInfo: infoReply.contextInfo
      }, {
        quoted: m
      });
      console.log("Error: Media not found in the desired format.");
    }
  } catch (e) {
    console.error("Handler error:", e);
    m.react(eror);
  }
};
handler.help = ["play <pencarian>"];
handler.tags = ["downloader"];
handler.command = /^(play|ytplay|ytmp3|playmp3|playmp4|ytplaymp4)$/i;
handler.exp = 15;
handler.register = true;
handler.limit = 3;
export default handler;
async function ytdl(ytUrl, type = "audio") {
  ytUrl = getId(ytUrl);
  console.log("Fetching video ID:", ytUrl);
  const apis = [{
    link: null,
    param: {
      url: ytUrl
    },
    isSocialDl: true
  }, {
    link: "https://api.yowes.net/youtube/download",
    param: {
      url: ytUrl
    }
  }, {
    link: "https://downloader-six.vercel.app/api/getVideoInfo",
    param: {
      url: ytUrl
    }
  }, {
    link: "https://api.freedl.cc/api/info",
    param: {
      query: ytUrl
    }
  }, {
    link: "https://yozora.vercel.app/api/info",
    param: {
      query: ytUrl
    }
  }];
  let result, mediaList = [],
    socialDlResult;
  for (const api of apis) {
    if (api.isSocialDl) {
      try {
        console.log("Trying socialDl API.");
        socialDlResult = await socialDl(api.param.url);
        if (socialDlResult?.medias?.length) {
          mediaList = socialDlResult.medias.map(item => item.url);
          result = socialDlResult;
          console.log("SocialDl result:", socialDlResult);
          break;
        }
      } catch (e) {
        console.error("SocialDl API error:", e);
        continue;
      }
    }
    try {
      console.log(`Trying API: ${api.link}`);
      const params = new URLSearchParams(api.param).toString();
      const data = await fetch(`${api.link}?${params}`).then(res => res.json().catch(() => null));
      mediaList = [...data?.urls || [], ...data?.formats?.map(item => item.url) || []];
      if (mediaList.length) {
        result = data;
        console.log("API result:", data);
        break;
      }
    } catch (e) {
      console.error(`API fetch error for ${api.link}:`, e);
      continue;
    }
  }
  if (!result || !mediaList.length) {
    console.error("No result or media list is empty.");
    throw new Error("Failed to fetch video info.");
  }
  const cafirexosUrls = [`https://api.cafirexos.com/api/v1/yt${type === "audio" ? "mp3" : "mp4"}?url=${ytUrl}`, `https://api.cafirexos.com/api/v2/yt${type === "audio" ? "mp3" : "mp4"}?url=${ytUrl}`];
  mediaList = [...mediaList, ...cafirexosUrls];
  console.log("Media list with cafirexos URLs:", mediaList);
  let validMedia = (await Promise.all(mediaList.map(async url => {
    try {
      const headRes = await fetch(url, {
        method: "HEAD"
      });
      const contentType = headRes.headers.get("content-type");
      return headRes.ok && (contentType?.startsWith("video") || contentType?.startsWith("audio")) ? {
        url: url,
        buffer: Buffer.from(await fetch(url).then(res => res.arrayBuffer())),
        contentType: contentType
      } : null;
    } catch (e) {
      console.error("Valid media fetch error:", e);
      return null;
    }
  }))).find(v => v);
  if (!validMedia) {
    console.log("Valid media not found. Trying alternative methods.");
    validMedia = (type === "audio" ? await Ytdl.mp3(ytUrl) : await Ytdl.mp4(ytUrl)) || await Ytdl.all(ytUrl, type === "audio" ? "mp3" : "mp4");
  }
  if (!validMedia) {
    console.error("No valid media found.");
    throw new Error("No valid media found.");
  }
  console.log("Valid media found:", validMedia);
  return {
    title: socialDlResult?.title ?? result?.videoDetail?.title ?? result?.title ?? "DJ 30 Detik",
    ...validMedia
  };
}
async function ytsearch(query, maxResults = 5, similarityThreshold = .5) {
  try {
    console.log("Performing YouTube search with query:", query);
    const res = await yts(query);
    console.log("Search result:", res);
    const videos = _.filter(res.videos.slice(0, maxResults), video => {
      const titleWords = _.words(_.toLower(video.title));
      const queryWords = _.words(_.toLower(query));
      const matchedWords = _.intersection(titleWords, queryWords);
      const similarity = _.size(matchedWords) / _.size(titleWords);
      return similarity >= similarityThreshold || _.size(matchedWords) >= _.size(queryWords) - 1;
    });
    console.log("Filtered videos:", videos);
    return _.isEmpty(videos) ? {} : _.first(videos);
  } catch (e) {
    console.error("YTSearch error:", e);
    return {};
  }
}

function getId(url) {
  const regex = /youtu(?:\.be|be\.com)\/(?:.*v(?:\/|=)|(?:.*\/)?)([\w'-]+)/i;
  const match = url.match(regex);
  const videoId = match ? `https://youtube.com/watch?v=${match[1]}` : null;
  console.log("Extracted video ID:", videoId);
  return videoId;
}