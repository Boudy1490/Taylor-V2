import fetch from "node-fetch";
async function duforestAI(message) {
  const url = "https://duforest.ai/wp-json/mwai-ui/v1/chats/submit";
  const headers = {
    "Content-Type": "application/json",
    "X-WP-Nonce": "5c11980c69",
    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36",
    Referer: "https://duforest.ai/spark/"
  };
  const timestamp = Date.now();
  const body = {
    botId: "default",
    customId: null,
    session: "66ee6a0255cef",
    chatId: "0ucb0n9dsvop",
    contextId: 5664,
    messages: [{
      id: "m5o2yzqfwt",
      role: "user",
      content: message,
      who: "User: ",
      timestamp: timestamp
    }],
    newMessage: message,
    newFileId: null,
    stream: false
  };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
      compress: true
    });
    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error("Error:", error);
  }
}
const handler = async (m, {
  conn,
  args,
  usedPrefix,
  command
}) => {
  if (!db.data.dbai.duforestai) db.data.dbai.duforestai = {};
  const inputText = args.length ? args.join(" ") : m.quoted?.text || m.quoted?.caption || m.quoted?.description || null;
  if (!inputText) {
    return m.reply(`Masukkan teks atau reply pesan dengan teks yang ingin diolah.\nContoh penggunaan:\n*${usedPrefix}${command} Hai, apa kabar?*`);
  }
  m.react(wait);
  try {
    const answer = await duforestAI(inputText);
    const {
      key: {
        id: keyId
      }
    } = await conn.reply(m.chat, `${answer}`, m);
    db.data.dbai.duforestai[m.sender] = {
      key: {
        id: keyId
      }
    };
    m.react(sukses);
  } catch (error) {
    console.error("Handler error:", error);
    m.react(eror);
  }
};
handler.before = async (m, {
  conn
}) => {
  if (!db.data.dbai.duforestai || m.isBaileys || !(m.sender in db.data.dbai.duforestai)) return;
  const {
    key: {
      id: keyId
    }
  } = db.data.dbai.duforestai[m.sender];
  if (m.quoted?.id === keyId && m.text.trim()) {
    m.react(wait);
    try {
      const answer = await duforestAI(m.text.trim());
      const {
        key: {
          id: newKeyId
        }
      } = await conn.reply(m.chat, `${answer}`, m);
      db.data.dbai.duforestai[m.sender].key.id = newKeyId;
      m.react(sukses);
    } catch (error) {
      console.error("Handler before error:", error);
      m.react(eror);
    }
  }
};
handler.help = ["duforestai"];
handler.tags = ["ai"];
handler.command = /^(duforestai)$/i;
export default handler;