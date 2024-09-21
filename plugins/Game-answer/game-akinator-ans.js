import {
  somematch
} from "../../lib/other-function.js";
const teks = "0 - Ya\n1 - Tidak\n2 - Saya Tidak Tau\n3 - Mungkin\n4 - Mungkin Tidak\n5 - Kembali ke pertanyaan sebelumnya";
export async function before(m) {
  if (!db.data.users[m.sender].banned) {
    if (!(m.quoted && m.quoted?.fromMe && m.quoted?.isBaileys && m.text)) return !0;
    if (db.data.game.akinator = db.data.game.akinator || {}, db.data.game.akinator[m.sender] && m.quoted?.id == db.data.game.akinator[m.sender].msg.key.id) {
      try {
        if (!somematch(["0", "1", "2", "3", "4", "5"], m.text)) return await this.sendMessage(m.chat, {
          text: `[!] Jawab dengan angka 1, 2, 3, 4, atau 5\n\n${teks}`
        }, {
          quoted: db.data.game.akinator[m.sender].msg
        });
        if ("0" === db.data.game.akinator[m.sender].currentStep && "5" === m.text) return m.reply("Anda telah mencapai pertanyaan pertama");
        if ("5" === m.text) {
          await db.data.game.akinator[m.sender].back();
          let soal = await this.sendMessage(m.chat, {
            text: `🎮 *Akinator Back* 🎮\n_step ${db.data.game.akinator[m.sender].currentStep} ( ${db.data.game.akinator[m.sender].progress.toFixed(2)} % )_\n\n@${m.sender.split("@")[0]}\n    ${db.data.game.akinator[m.sender].question}\n\n${teks}`,
            mentions: [m.sender]
          }, {
            quoted: m
          });
          db.data.game.akinator[m.sender].msg = soal, db.data.game.akinator[m.sender].currentStep = db.data.game.akinator[m.sender].currentStep,
            db.data.game.akinator[m.sender].progress = db.data.game.akinator[m.sender].progress;
        } else if (await db.data.game.akinator[m.sender].step(m.text), db.data.game.akinator[m.sender].progress >= 70 || db.data.game.akinator[m.sender].currentStep >= 78) {
          await db.data.game.akinator[m.sender].win();
          const anu = db.data.game.akinator[m.sender].answers[0];
          await this.sendMessage(m.chat, {
            image: {
              url: anu.absolute_picture_path
            },
            caption: `🎮 *Akinator Answer* 🎮\n\nDia adalah *${anu.name}*\n_${anu.description}_`,
            mentions: [m.sender]
          }, {
            quoted: m
          }), delete db.data.game.akinator[m.sender];
        } else {
          let soal = await this.sendMessage(m.chat, {
            text: `🎮 *Akinator* 🎮\n_step ${db.data.game.akinator[m.sender].currentStep} ( ${db.data.game.akinator[m.sender].progress.toFixed(2)} % )_\n\n@${m.sender.split("@")[0]}\n    ${db.data.game.akinator[m.sender].question}\n\n${teks}`,
            mentions: [m.sender]
          }, {
            quoted: m
          });
          db.data.game.akinator[m.sender].msg = soal, db.data.game.akinator[m.sender].currentStep = db.data.game.akinator[m.sender].currentStep,
            db.data.game.akinator[m.sender].progress = db.data.game.akinator[m.sender].progress;
        }
      } catch (e) {
        m.react(eror);
      }
      return !0;
    }
  }
}