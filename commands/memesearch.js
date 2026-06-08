'use strict';

// ── Original run function ──
'use strict';
const axios = require('axios');
const run = async (ctx) => {
  const { sock, msg, from, args } = ctx;
  const query = args.join(' ').trim();
  if (!query) return await sock.sendMessage(from, { text: '❌ Usage: .memesearch <query>\nExample: .memesearch funny cat' }, { quoted: msg });
  try {
    await sock.sendMessage(from, { react: { text: '🔍', key: msg.key } });
    const res = await axios.get(`https://api.shizo.top/tools/meme-search?apikey=shizo&query=${encodeURIComponent(query)}`, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0' } });
    const buf = Buffer.from(res.data);
    await sock.sendMessage(from, { image: buf, caption: `😂 Meme result for: *${query}*` }, { quoted: msg });
  } catch (e) {
    await sock.sendMessage(from, { text: `❌ Error: ${e.message}` }, { quoted: msg });
  }
};
module.exports = { run };

// ── Dynamic Plugin Wrapper ──
module.exports = {
  name: 'memesearch',
  aliases: [],
  category: 'plugin',
  description: 'memesearch command',
  usage: '.memesearch',
  async execute(sock, msg, args, extra) {
    const ctx = {
      sock,
      msg,
      from: extra.from,
      sender: extra.sender,
      args,
      isOwner: extra.isOwner,
      isGroup: extra.isGroup,
      isAdmin: extra.isAdmin,
      botNum: extra.botNum,
      reply: extra.reply,
      react: extra.react,
      config: extra.config,
    };
    await run(ctx);
  }
};
