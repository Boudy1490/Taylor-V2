import TicTacToe from "../../lib/tictactoe.js";
const handler = async (m, {
  conn,
  usedPrefix,
  command,
  text
}) => {
  if (!db.data.game.tictactoe) db.data.game.tictactoe = {};
  switch (command) {
    case "tictactoe":
    case "ttt":
      if (Object.values(db.data.game.tictactoe).find(room => room.id.startsWith("tictactoe") && [room.game.playerX, room.game.playerO].includes(m.sender))) {
        throw "Kamu masih dalam game";
      }
      let room = Object.values(db.data.game.tictactoe).find(room => room.state === "WAITING" && (!text || room.name === text));
      if (room) {
        m.reply("Partner ditemukan!");
        room.o = m.chat;
        room.game.playerO = m.sender;
        room.state = "PLAYING";
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
        let str = `\nRoom ID: ${room.id}\n${arr.slice(0, 3).join("")}\n${arr.slice(3, 6).join("")}\n${arr.slice(6).join("")}\nMenunggu @${room.game.currentTurn.split("@")[0]}\nKetik *nyerah* untuk menyerah\n`.trim();
        if (room.x !== room.o) {
          await conn.reply(room.x, str, m, {
            mentions: conn.parseMention(str)
          });
        }
        await conn.reply(room.o, str, m, {
          mentions: conn.parseMention(str)
        });
      } else {
        room = {
          id: "tictactoe-" + +new Date(),
          x: m.chat,
          o: "",
          game: new TicTacToe(m.sender, "o"),
          state: "WAITING"
        };
        if (text) room.name = text;
        let str = `Menunggu partner${text ? ` mengetik command berikut\n${usedPrefix}${command} ${text}` : ""}`;
        await conn.reply(room.x, str, m, {
          mentions: conn.parseMention(str)
        });
        db.data.game.tictactoe[room.id] = room;
      }
      break;
    case "delttt":
      let delRoom = Object.values(db.data.game.tictactoe).find(room => [room.game.playerX, room.game.playerO].includes(m.sender));
      if (!delRoom) throw "Kamu tidak sedang dalam game apapun";
      delete db.data.game.tictactoe[delRoom.id];
      m.reply("Game Tic-Tac-Toe berhasil dihapus");
      break;
    default:
      throw "Perintah tidak dikenal!";
  }
};
handler.help = ["tictactoe", "ttt", "delttt"].map(v => v + " [custom room name]");
handler.tags = ["game"];
handler.command = /^(tictactoe|ttt|delttt)$/;
export default handler;