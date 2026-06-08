'use strict';

// ── Original run function ──
'use strict';
const run = async (ctx) => {
  const { sock, msg, from, isGroup } = ctx;
  if (!isGroup) return await sock.sendMessage(from, { text: '❌ Group mein use karo!' }, { quoted: msg });
  try {
    const code = await sock.groupInviteCode(from);
    await sock.sendMessage(from, { text: `🔗 *Group Invite Link*\n\nhttps://chat.whatsapp.com/${code}\n\n⚠️ Publicly share mat karo!` }, { quoted: msg });
  } catch (e) {
    await sock.sendMessage(from, { text: `❌ Error: ${e.message}` }, { quoted: msg });
  }
};
module.exports = { run };

// ── Dynamic Plugin Wrapper ──
module.exports = {
  name: 'grouplink',
  aliases: [],
  category: 'plugin',
  description: 'grouplink command',
  usage: '.grouplink',
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
