import {
  VoiceAPI
} from "../../lib/tools/kits-ai.js";
const kits = new VoiceAPI(),
  handler = async (m, {
    conn,
    text
  }) => {
    try {
      let models = await kits.getModelData("eleven");
      m.react(wait);
      let list = models.map((v, index) => `${index + 1}. ${v.label}: ${v.value}`).join("\n\n");
      if (!text) return m.reply("Usage: kitstts <model_number>|<text>\n\nAvailable models:\n" + list);
      let [modelIndex, inputText] = text.split("|");
      if (!modelIndex || !inputText) return m.reply("Invalid format. Usage: kitstts <model_number>|<text>\n\nAvailable models:\n" + list);
      let modelNumber = parseInt(modelIndex.trim());
      if (isNaN(modelNumber) || modelNumber <= 0 || modelNumber > models.length) return m.reply("Invalid model number. Please choose a number from the available models list.");
      let selectedModel = models[modelNumber - 1],
        output = await kits.createTTS(selectedModel.value, inputText);
      await conn.sendFile(m.chat, output.audioUrl, "audio.mp3", "", m, !0, {
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
    } catch (e) {
      console.error("Error:", e);
    }
  };
handler.help = ["kitstts <model_number>|<text>"], handler.tags = ["misc"], handler.command = /^(kitstts)$/i;
export default handler;