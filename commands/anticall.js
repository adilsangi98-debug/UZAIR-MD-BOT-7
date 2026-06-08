'use strict';

// ── Original run function ──
'use strict';
const fs = require('fs');
const path = require('path');
const run = async (ctx) => {
  const { sock, msg, from, args, isOwner } = ctx;
  if (!isOwner) return await sock.sendMessage(from, { text: '❌ Sirf owner use kar sakta hai!' }, { quoted: msg });
  const opt = args[0]?.toLowerCase();
  if (!opt || !['on','off'].includes(opt)) return await sock.sendMessage(from, { text: '❌ Usage: .anticall on/off' }, { quoted: msg });
  const configPath = path.resolve(__dirname, '../config/config.js');
  let content = fs.readFileSync(configPath, 'utf-8');
  content = content.replace(/antiCall:\s*(true|false)/, `antiCall: ${opt === 'on'}`);
  fs.writeFileSync(configPath, content);
  await sock.sendMessage(from, { text: `✅ Anti-call *${opt.toUpperCase()}* kar diya!` }, { quoted: msg });
};
module.exports = { run };

// ── Dynamic Plugin Wrapper ──
module.exports = {
  name: 'anticall',
  aliases: [],
  category: 'plugin',
  description: 'anticall command',
  usage: '.anticall',
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
