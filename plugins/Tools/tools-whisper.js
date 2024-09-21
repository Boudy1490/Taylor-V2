import {
  FormData,
  Blob
} from "formdata-node";
import {
  fileTypeFromBuffer
} from "file-type";
import fetch from "node-fetch";
const handler = async (m, {
  command,
  usedPrefix,
  conn,
  text,
  args
}) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || "";
  if (!mime) return m.reply("No media found. Please reply to an audio file.");
  const media = await q.download();
  if (!/^audio\//.test(mime)) return m.reply("Unsupported audio type. Please reply to an audio file.");
  m.react(wait);
  try {
    const output = await Whisper(media);
    const responseMessage = output && output ? output : "Failed.";
    m.reply(responseMessage);
  } catch (e) {
    m.react(eror);
    console.log(e);
  }
};
handler.help = ["whisper *[Reply audio]*"];
handler.tags = ["tools"];
handler.command = /^(whisper)$/i;
export default handler;
const Whisper = async buffer => {
  try {
    const formData = new FormData();
    const {
      ext
    } = await fileTypeFromBuffer(buffer) || {
      ext: "wav"
    };
    const blob = new Blob([buffer], {
      type: `audio/${ext}`
    });
    formData.append("file", blob, `voice.${ext}`);
    const whisperResp = await fetch("https://lalaland.chat/api/magic/whisper", {
      method: "POST",
      body: formData
    });
    if (!whisperResp.ok) {
      throw new Error(`HTTP error! status: ${whisperResp.status}`);
    }
    const whisperText = await whisperResp.json();
    return whisperText;
  } catch (error) {
    console.error("Error during file upload or response processing:", error);
    throw error;
  }
};