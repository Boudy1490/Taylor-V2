import {
  clockString
} from "../../lib/other-function.js";
const handler = async (m, {
  conn
}) => {
  try {
    let message = `*⏳ Runtime Overview ⏳*\n────────────────────\n${clockString(await new Promise(resolve => setTimeout(resolve, 0)) || 1e3 * process.uptime())}\n────────────────────`;
    await conn.reply(m.chat, message, m, {
      contextInfo: {
        mentionedJid: [m.sender],
        externalAdReply: {
          title: "🤖 Runtime",
          body: "",
          mediaType: 1,
          previewType: 0,
          renderLargerThumbnail: false,
          thumbnailUrl: "https://cdn-icons-png.flaticon.com/128/9160/9160777.png",
          sourceUrl: ""
        }
      }
    });
  } catch (error) {
    console.error(error);
  }
};
handler.help = ["runtime"], handler.tags = ["info"], handler.command = /^r(untime?|t)$/i;
export default handler;