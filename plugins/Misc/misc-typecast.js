import {
  Typecast
} from "../../lib/tools/typecast.js";
const handler = async (m, {
  conn,
  args,
  usedPrefix,
  command
}) => {
  const inputText = args.length ? args.join(" ") : m.quoted?.text || m.quoted?.caption || m.quoted?.description || null;
  if (!inputText) {
    return m.reply(`Masukkan pesan atau reply pesan dengan teks yang ingin diolah.\nContoh penggunaan:\n*${usedPrefix}${command} Hai, apa kabar?*`);
  }
  m.react(wait);
  try {
    const typecast = new Typecast();
    const res = await typecast.create(inputText);
    await conn.sendFile(m.chat, res, "audio.mp3", "", m, !0, {
      mimetype: "audio/mp4",
      ptt: !0,
      waveform: [100, 0, 100, 0, 100, 0, 100],
      contextInfo: {
        ...adReply.contextInfo,
        mentionedJid: [m.sender],
        externalAdReply: {
          ...adReply.contextInfo.externalAdReply,
          title: "TEXT TO SPEECH",
          body: "",
          mediaType: 1,
          previewType: 0,
          renderLargerThumbnail: true,
          thumbnailUrl: "https://www.respeecher.com/hs-fs/hubfs/What-is-Text-to-Speech-TTS%29-Initial-Speech-Synthesis-Explained-Respeecher-voice-cloning-software.jpeg?width=1191&height=744&name=What-is-Text-to-Speech-TTS%29-Initial-Speech-Synthesis-Explained-Respeecher-voice-cloning-software.jpeg",
          sourceUrl: ""
        }
      }
    });
    m.react(sukses);
  } catch (error) {
    console.error("Handler error:", error);
    m.react(eror);
  }
};
handler.help = ["typecast"];
handler.tags = ["misc"];
handler.command = /^(typecast)$/i;
export default handler;