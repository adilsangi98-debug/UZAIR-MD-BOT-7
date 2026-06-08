'use strict';

// ── Original run function ──
'use strict';
const axios = require('axios');
const run = async (ctx) => {
  const { sock, msg, from, args } = ctx;
  const q = args.join(' ').trim();
  if (!q) return await sock.sendMessage(from, { text: '❌ Usage: .ai <question>\nExample: .ai What is AI?' }, { quoted: msg });
  try {
    await sock.sendMessage(from, { react: { text: '🤖', key: msg.key } });
    const res = await axios.get(`https://api.siputzx.my.id/api/ai/llama?prompt=${encodeURIComponent(q)}`);
    const answer = res.data?.data || res.data?.result || res.data?.message || 'No response.';
    await sock.sendMessage(from, { text: `🤖 *AI*\n\n${answer}` }, { quoted: msg });
  } catch (e) {
    await sock.sendMessage(from, { text: `❌ Error: ${e.message}` }, { quoted: msg });
  }
};
module.exports = { run };

// ── Dynamic Plugin Wrapper ──
module.exports = {
  name: 'ai',
  aliases: [],
  category: 'plugin',
  description: 'ai command',
  usage: '.ai',
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
