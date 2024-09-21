import {
  clockString
} from "../../lib/other-function.js";
const handler = async (m, {
  conn,
  text,
  usedPrefix,
  command
}) => {
  try {
    let who = m.isGroup ? m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted && m.quoted.sender : null;
    if (!who) {
      return m.reply("⚠️ *Error:* Mohon tag atau sebutkan seseorang.");
    }
    let user = db.data.users[who];
    if (!user) {
      return m.reply("⚠️ *Error:* Pengguna tidak terdaftar dalam DATABASE.");
    }
    let txt = text.replace("@" + who.split("@")[0], "").trim();
    if (!txt) {
      return m.reply("⚠️ *Error:* Mohon sebutkan jumlah hari.");
    }
    if (isNaN(txt)) {
      return m.reply(`⚠️ *Error:* Hanya angka yang diterima.\n\nContoh:\n${usedPrefix + command} @${m.sender.split("@")[0]} 7`);
    }
    let jumlahHari = 864e5 * txt;
    let now = Date.now();
    if (now < user.premiumTime) {
      user.premiumTime += jumlahHari;
    } else {
      user.premiumTime = now + jumlahHari;
    }
    user.premium = true;
    let prems = Object.keys(db.data.users).filter(key => db.data.users[key].premium);
    m.reply(`✔️ *Berhasil*\n\n📛 *Nama:* ${user.name}\n📆 *Hari:* ${txt} hari\n📉 *Hitung Mundur:* ${clockString(user.premiumTime - now)}`);
  } catch (error) {
    m.reply(`❌ *Terjadi kesalahan:* ${error}`);
  }
};
handler.help = ["addprem [@user] <days>"];
handler.tags = ["owner"];
handler.command = /^(add|tambah|\+)p(rem)?$/i;
handler.group = true;
handler.rowner = true;
export default handler;