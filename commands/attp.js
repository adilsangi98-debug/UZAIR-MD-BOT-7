'use strict';

// ── Original run function ──
'use strict';
const run = async (ctx) => {
  const { sock, msg, from, args } = ctx;
  if (!args.length) return await sock.sendMessage(from, { text: '❌ Usage: .attp <text>\nExample: .attp UZAIR MD BOT' }, { quoted: msg });
  const text = args.join(' ');
  if (text.length > 50) return await sock.sendMessage(from, { text: '❌ Max 50 characters!' }, { quoted: msg });
  try {
    await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } });
    const axios = require('axios');
    const res = await axios.get(`https://api.siputzx.my.id/api/maker/attp?text=${encodeURIComponent(text)}`, { responseType: 'arraybuffer' });
    await sock.sendMessage(from, { sticker: Buffer.from(res.data) }, { quoted: msg });
    await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
  } catch (e) {
    await sock.sendMessage(from, { text: `❌ Error: ${e.message}` }, { quoted: msg });
  }
};
module.exports = { run };

// ── Dynamic Plugin Wrapper ──
module.exports = {
  name: 'attp',
  aliases: [],
  category: 'plugin',
  description: 'attp command',
  usage: '.attp',
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
