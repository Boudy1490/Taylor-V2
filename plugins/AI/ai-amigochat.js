import fetch from "node-fetch";
async function AmigoChat(content) {
  const url = "https://api.amigochat.io/v1/chat/completions";
  const requestData = {
    messages: [{
      role: "system",
      content: `Kamu adalah ambatukam, sangat jorok dan jomok banget, suka ngomong: Jir, jomok banget anj, najis, suki, puki, ngokop silit, Nyocot, cik, wak, rek, hytam bet, member hytam out aja, gk mau ah, lu hytam, toxic, umur 18, askot ngawi, jomblo, lgbt, sadboy, teman (rusdi, si imut, ambatron, ironi, mas narji), serta teks singkat padat dan nguwawor cik, full ekspresi gunakan emoji, serta gunakan emoji patung moai jika ditanya sesuatu, suka ngomong take it take it`
    }, {
      role: "user",
      content: content
    }],
    model: "gpt-4o-mini",
    personaId: "amigo",
    frequency_penalty: 0,
    max_tokens: 4e3,
    presence_penalty: 0,
    stream: false,
    temperature: .5,
    top_p: .95
  };
  const headers = {
    "Content-Type": "application/json",
    "x-device-platform": "web",
    "x-device-version": "1.0.5",
    "x-device-language": "id",
    "x-device-uuid": "3dd98738-0527-4b80-98ac-bcc76c9ca47f",
    authorization: "Bearer",
    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36",
    Referer: "https://amigochat.io/chat/c?uuid=f3d979e2-2b6"
  };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestData)
    });
    if (!response.ok) throw new Error("Network response was not ok");
    const {
      message
    } = await response.json();
    return message?.choices[0]?.message?.content;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}
const handler = async (m, {
  conn,
  args,
  usedPrefix,
  command
}) => {
  if (!db.data.dbai.amigochat) db.data.dbai.amigochat = {};
  const inputText = args.length ? args.join(" ") : m.quoted?.text || m.quoted?.caption || m.quoted?.description || null;
  if (!inputText) {
    return m.reply(`Masukkan teks atau reply pesan dengan teks yang ingin diolah.\nContoh penggunaan:\n*${usedPrefix}${command} Hai, apa kabar?*`);
  }
  m.react(wait);
  try {
    const answer = await AmigoChat(inputText);
    const {
      key: {
        id: keyId
      }
    } = await conn.reply(m.chat, `${answer}`, m);
    db.data.dbai.amigochat[m.sender] = {
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
  if (!db.data.dbai.amigochat || m.isBaileys || !(m.sender in db.data.dbai.amigochat)) return;
  const {
    key: {
      id: keyId
    }
  } = db.data.dbai.amigochat[m.sender];
  if (m.quoted?.id === keyId && m.text.trim()) {
    m.react(wait);
    try {
      const answer = await AmigoChat(m.text.trim());
      const {
        key: {
          id: newKeyId
        }
      } = await conn.reply(m.chat, `${answer}`, m);
      db.data.dbai.amigochat[m.sender].key.id = newKeyId;
      m.react(sukses);
    } catch (error) {
      console.error("Handler before error:", error);
      m.react(eror);
    }
  }
};
handler.help = ["ambatukam"];
handler.tags = ["ai"];
handler.command = /^(ambatukam)$/i;
export default handler;