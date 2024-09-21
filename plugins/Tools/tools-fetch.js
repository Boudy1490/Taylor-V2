import fetch from "node-fetch";
import {
  format
} from "util";
import path from "path";
let handler = async (m, {
  text,
  conn
}) => {
  try {
    if (!text) return m.reply("Please provide a URL.");
    text = /^https?:\/\//.test(text) ? text : "http://" + text;
    let _url = new URL(text);
    let url = global.API(_url.origin, _url.pathname, Object.fromEntries(_url.searchParams.entries()), "APIKEY");
    let maxRedirects = 999999,
      redirectCount = 0,
      redirectUrl = url;
    while (redirectCount < maxRedirects) {
      let res = await fetch(redirectUrl);
      if (res.headers.get("content-length") > 100 * 1024 * 1024 * 1024) {
        res.body?.destroy();
        return m.reply(`Content-Length exceeds limit: ${res.headers.get("content-length")}`);
      }
      const contentType = res.headers.get("content-type");
      let filename = path.basename(new URL(redirectUrl).pathname);
      if (/^image\//.test(contentType)) {
        conn.sendFile(m.chat, redirectUrl, filename, text, m);
      } else if (/^text\//.test(contentType)) {
        let txt = await res.text();
        m.reply(txt.slice(0, 65536));
        conn.sendFile(m.chat, Buffer.from(txt), "file.txt", null, m);
      } else if (/^application\/json/.test(contentType)) {
        let txt = await res.json();
        m.reply(format(JSON.stringify(txt, null, 2)).slice(0, 65536));
        conn.sendFile(m.chat, Buffer.from(txt), "file.json", null, m);
      } else if (/^text\/html/.test(contentType)) {
        let html = await res.text();
        conn.sendFile(m.chat, Buffer.from(html), "file.html", null, m);
      } else {
        conn.sendFile(m.chat, redirectUrl, filename, text, m);
      }
      if ([301, 302, 307, 308].includes(res.status)) {
        let location = res.headers.get("location");
        if (location) {
          redirectUrl = location;
          redirectCount++;
        } else break;
      } else break;
    }
    if (redirectCount >= maxRedirects) m.reply(`Too many redirects (max: ${maxRedirects})`);
  } catch (err) {
    m.reply(`Error: ${err.message || err}`);
  }
};
handler.help = ["fetch", "get"].map(v => v + " <url>");
handler.tags = ["internet"];
handler.command = /^(fetch|get)$/i;
handler.register = true;
handler.limit = true;
export default handler;