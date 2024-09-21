import fetch from "node-fetch";
const AVAILABLE_MODELS = ["Amber", "Cooper", "Kate", "Bow", "Aisha", "Kelly", "Naomi", "Ema", "Jun", "Ethan", "Aaron", "Jack", "Logan", "Hunter", "Qian", "Richard", "Helen", "Regina", "Amber"];
const extractData = input => {
  try {
    return input.messages[0]?.message || "";
  } catch {
    return "";
  }
};
async function Chat(prompt, model) {
  if (!AVAILABLE_MODELS.includes(model)) {
    throw new Error("Model not available");
  }
  try {
    const url = "https://api.angel.ai/api/v1/channels/webapp/";
    const payload = {
      message: prompt,
      type: "text",
      personality: model,
      timestamp: new Date().toISOString()
    };
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI1MTk0NDgzLCJpYXQiOjE3MjUxMDgwODMsImp0aSI6ImVlZmMzM2QwMzBhNDQ5NTRhNTk4YzIzYzk2MWFkMGFhIiwidXNlcl9pZCI6MjAxMTd9.QFGGii8n4ZrtMXvWP3oWRV3CI_R-m6CCCi9_MvTrYKU",
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36",
        Referer: "https://angel.ai/chat?next=" + model
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return extractData(result);
  } catch (error) {
    console.error("Error during chat request:", error);
    throw error;
  }
}
const handler = async (m, {
  conn,
  args,
  usedPrefix,
  command
}) => {
  db.data.dbai.angleai = db.data.dbai.angleai || {};
  db.data.dbai.angleai[m.sender] = db.data.dbai.angleai[m.sender] || {
    model: "Amber"
  };
  if (command === "angleaimodel") {
    const modelIndex = parseInt(args[0]) - 1;
    const selectedModel = AVAILABLE_MODELS[modelIndex];
    if (!selectedModel) {
      const modelList = AVAILABLE_MODELS.map((v, i) => `*${i + 1}.* ${v}`).join("\n");
      return m.reply(`Nomor model tidak valid. Pilih nomor antara 1 dan ${AVAILABLE_MODELS.length}.\nModel yang tersedia:\n${modelList}`);
    }
    db.data.dbai.angleai[m.sender].model = selectedModel;
    return m.reply(`Model diatur menjadi: *${selectedModel}*`);
  }
  if (!db.data.dbai.angleai[m.sender]?.model) {
    return m.reply(`Atur model terlebih dahulu dengan command *${usedPrefix}angleaimodel*.`);
  }
  if (command === "angleai") {
    const text = args.length >= 1 ? args.slice(0).join(" ") : m.quoted?.text || m.quoted?.caption || m.quoted?.description || null;
    if (!text) {
      return m.reply(`Masukkan teks atau reply pesan dengan teks yang ingin diolah.\nContoh penggunaan:\n*${usedPrefix}${command} Hai, apa kabar?*`);
    }
    m.react(wait);
    try {
      const model = db.data.dbai.angleai[m.sender].model;
      const output = await Chat(text, model);
      if (output) {
        const response = await conn.reply(m.chat, `${output}`, m);
        db.data.dbai.angleai[m.sender].lastMessageId = response.key.id;
      } else {
        m.reply("Tidak ada output yang dihasilkan.");
      }
    } catch (error) {
      console.error("Error during angleai:", error);
      m.reply("Terjadi kesalahan selama pemrosesan.");
    }
  }
};
handler.before = async (m, {
  conn
}) => {
  db.data.dbai.angleai = db.data.dbai.angleai || {};
  db.data.dbai.angleai[m.sender] = db.data.dbai.angleai[m.sender] || {
    model: "Amber"
  };
  if (!db.data.dbai.angleai[m.sender]?.model || m.isBaileys) return;
  const {
    lastMessageId,
    model
  } = db.data.dbai.angleai[m.sender];
  if (lastMessageId && m.quoted?.id === lastMessageId && m.text.trim()) {
    m.react(wait);
    try {
      const output = await Chat(m.text.trim(), model);
      if (output) {
        const response = await conn.reply(m.chat, `${output}`, m);
        db.data.dbai.angleai[m.sender].lastMessageId = response.key.id;
      }
      m.react(sukses);
    } catch (error) {
      console.error("Handler before error:", error);
      m.react(eror);
    }
  }
};
handler.help = ["angleai", "angleaimodel"];
handler.tags = ["ai"];
handler.command = /^(angleai|angleaimodel)$/i;
handler.limit = true;
export default handler;