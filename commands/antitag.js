'use strict';

// ── Original run function ──
'use strict';
const db = require('../database/db');
const run = async (ctx) => {
  const { sock, msg, from, args, isGroup } = ctx;
  if (!isGroup) return await sock.sendMessage(from, { text: '❌ Group mein use karo!' }, { quoted: msg });
  const opt = args[0]?.toLowerCase();
  const s = db.getGroupSettings ? db.getGroupSettings(from) : {};
  if (!opt) return await sock.sendMessage(from, { text: `📛 *Anti Tag:* ${s.antitag ? 'ON ✅' : 'OFF ❌'}\n\nUsage:\n.antitag on\n.antitag off` }, { quoted: msg });
  if (!['on','off'].includes(opt)) return await sock.sendMessage(from, { text: '❌ on ya off likho.' }, { quoted: msg });
  if (db.updateGroupSettings) db.updateGroupSettings(from, { antitag: opt === 'on' });
  await sock.sendMessage(from, { text: `✅ Anti tag *${opt.toUpperCase()}* ho gaya!` }, { quoted: msg });
};
module.exports = { run };

// ── Dynamic Plugin Wrapper ──
module.exports = {
  name: 'antitag',
  aliases: [],
  category: 'plugin',
  description: 'antitag command',
  usage: '.antitag',
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
