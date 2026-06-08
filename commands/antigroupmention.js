'use strict';

// ── Original run function ──
'use strict';
const db = require('../database/db');
const run = async (ctx) => {
  const { sock, msg, from, args, isGroup } = ctx;
  if (!isGroup) return await sock.sendMessage(from, { text: '❌ Group mein use karo!' }, { quoted: msg });
  const opt = args[0]?.toLowerCase();
  const s = db.getGroupSettings ? db.getGroupSettings(from) : {};
  if (!opt) return await sock.sendMessage(from, { text: `📌 *Anti Group Mention:* ${s.antigroupmention ? 'ON ✅' : 'OFF ❌'}\n\nUsage:\n.antigroupmention on\n.antigroupmention off` }, { quoted: msg });
  if (!['on','off'].includes(opt)) return await sock.sendMessage(from, { text: '❌ on ya off likho.' }, { quoted: msg });
  if (db.updateGroupSettings) db.updateGroupSettings(from, { antigroupmention: opt === 'on' });
  await sock.sendMessage(from, { text: `✅ Anti group mention *${opt.toUpperCase()}* ho gaya!` }, { quoted: msg });
};
module.exports = { run };

// ── Dynamic Plugin Wrapper ──
module.exports = {
  name: 'antigroupmention',
  aliases: [],
  category: 'plugin',
  description: 'antigroupmention command',
  usage: '.antigroupmention',
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
