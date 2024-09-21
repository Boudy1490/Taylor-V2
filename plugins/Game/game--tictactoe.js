import {
  format
} from "util";
let debugMode = false;
const winScore = Math.floor(Math.random() * 5001) + 5e3;
const playScore = 99;
export async function before(m) {
  let isWin = false,
    isTie = false,
    isSurrender = false;
  if (!db.data.game.tictactoe) db.data.game.tictactoe = {};
  let room = Object.values(db.data.game.tictactoe).find(room => room.id && room.game && room.state && room.id.startsWith("tictactoe") && [room.game.playerX, room.game.playerO].includes(m.sender) && room.state === "PLAYING");
  if (room) {
    const isValidMove = /^([1-9]|(me)?nyerah|surr?ender)$/i.test(m.text);
    if (!isValidMove) return true;
    isSurrender = !/^[1-9]$/.test(m.text);
    if (m.sender !== room.game.currentTurn && !isSurrender) return true;
    if (debugMode) {
      m.reply("[DEBUG]\n" + format({
        isSurrender: isSurrender,
        text: m.text
      }));
    }
    if (!isSurrender) {
      const turnResult = room.game.turn(m.sender === room.game.playerO, parseInt(m.text) - 1);
      if (turnResult <= 0) {
        return m.reply({
          "-3": "Game telah berakhir",
          "-2": "Invalid",
          "-1": "Posisi Invalid",
          0: "Posisi Invalid"
        } [turnResult]), true;
      }
    }
    if (m.sender === room.game.winner) {
      isWin = true;
    } else if (room.game.board === 511) {
      isTie = true;
    }
    let arr = room.game.render().map(v => ({
      X: "❌",
      O: "⭕",
      1: "1️⃣",
      2: "2️⃣",
      3: "3️⃣",
      4: "4️⃣",
      5: "5️⃣",
      6: "6️⃣",
      7: "7️⃣",
      8: "8️⃣",
      9: "9️⃣"
    })[v]);
    if (isSurrender) {
      room.game._currentTurn = m.sender === room.game.playerX;
      isWin = true;
    }
    let winner = isSurrender ? room.game.currentTurn : room.game.winner;
    let str = `
${arr.slice(0, 3).join("")}
${arr.slice(3, 6).join("")}
${arr.slice(6).join("")}
${isWin ? `@${winner.split("@")[0]} Menang! (+${winScore} XP)` : isTie ? `Game berakhir (+${playScore} XP)` : `Giliran ${[ "❌", "⭕" ][+room.game._currentTurn]} (@${room.game.currentTurn.split("@")[0]})`}
❌: @${room.game.playerX.split("@")[0]}
⭕: @${room.game.playerO.split("@")[0]}
Ketik *nyerah* untuk nyerah
Room ID: ${room.id}
`.trim();
    const users = db.data.users;
    room[room.game._currentTurn ^ isSurrender ? "x" : "o"] = m.chat;
    if (room.x !== room.o) {
      await conn.reply(room.x, str, m, {
        mentions: this.parseMention(str)
      });
    }
    await conn.reply(room.o, str, m, {
      mentions: this.parseMention(str)
    });
    if (isTie || isWin) {
      users[room.game.playerX].exp += playScore;
      users[room.game.playerO].exp += playScore;
      if (isWin) users[winner].exp += winScore - playScore;
      if (debugMode) {
        m.reply("[DEBUG]\n" + format(room));
      }
      delete db.data.game.tictactoe[room.id];
    }
  }
  return true;
}