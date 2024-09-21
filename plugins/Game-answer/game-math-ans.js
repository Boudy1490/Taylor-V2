let handler = m => m;
handler.before = async function(m) {
  if (!m.quoted || !m.quoted?.fromMe || !m.quoted?.isBaileys || !m.text || !(/🕹️ GAME - MATH[\s\S]*Balas pesan ini untuk menjawab/i.test(m.text || "") || /🕹️ GAME - MATH[\s\S]*Balas pesan ini untuk menjawab/i.test(m.quoted?.text || ""))) return !0;
  if (!/^-?[0-9]+(\.[0-9]+)?$/.test(m.text)) return !0;
  let id = m.chat;
  if (db.data.game.math = db.data.game.math ? db.data.game.math : {}, !(id in db.data.game.math)) return await this.reply(m.chat, "Soal math itu telah berakhir", m);
  if (m.quoted?.id === db.data.game.math[id][0]?.id) {
    let math = JSON.parse(JSON.stringify(db.data.game.math[id][1]));
    m.text === math.result ? (db.data.users[m.sender].exp += math.bonus, clearTimeout(db.data.game.math[id][3]), delete db.data.game.math[id], await this.reply(m.chat, `✅ *Benar!*\n+${math.bonus} XP`, m, {
      contextInfo: {
        mentionedJid: [m.sender],
        externalAdReply: {
          title: "JAWABAN BENAR",
          renderLargerThumbnail: false,
          thumbnailUrl: "https://cdn-icons-png.flaticon.com/128/8832/8832108.png"
        }
      }
    })) : 0 == --db.data.game.math[id][2] ? (clearTimeout(db.data.game.math[id][3]), delete db.data.game.math[id], await this.reply(m.chat, `❗ *Kesempatan habis!*\nJawaban: *${math.result}*`, m, {
      contextInfo: {
        mentionedJid: [m.sender],
        externalAdReply: {
          title: "KESEMPATAN HABIS",
          renderLargerThumbnail: false,
          thumbnailUrl: "https://cdn-icons-png.flaticon.com/128/5683/5683325.png"
        }
      }
    })) : await this.reply(m.chat, `❌ *Jawaban Salah!*\nMasih ada ${db.data.game.math[id][2]} kesempatan`, m, {
      contextInfo: {
        mentionedJid: [m.sender],
        externalAdReply: {
          title: "JAWABAN SALAH",
          renderLargerThumbnail: false,
          thumbnailUrl: "https://cdn-icons-png.flaticon.com/128/11378/11378648.png"
        }
      }
    });
  }
  return !0;
};
export default handler;