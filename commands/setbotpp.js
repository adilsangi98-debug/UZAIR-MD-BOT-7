'use strict';

// ── Original run function ──
'use strict';
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const run = async (ctx) => {
  const { sock, msg, from, isOwner } = ctx;
  if (!isOwner) return await sock.sendMessage(from, { text: '❌ Sirf owner use kar sakta hai!' }, { quoted: msg });
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (!quoted) return await sock.sendMessage(from, { text: '⚠️ Kisi image ko reply karo .setbotpp se!' }, { quoted: msg });
  const imgMsg = quoted.imageMessage || quoted.stickerMessage;
  if (!imgMsg) return await sock.sendMessage(from, { text: '❌ Sirf image ya sticker reply karo!' }, { quoted: msg });
  try {
    await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } });
    const type = quoted.imageMessage ? 'image' : 'sticker';
    const stream = await downloadContentFromMessage(imgMsg, type);
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);
    await sock.updateProfilePicture(sock.user.id, buffer);
    await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
    await sock.sendMessage(from, { text: '✅ Bot ki profile picture update ho gayi!' }, { quoted: msg });
  } catch (e) {
    await sock.sendMessage(from, { text: `❌ Error: ${e.message}` }, { quoted: msg });
  }
};
module.exports = { run };

// ── Dynamic Plugin Wrapper ──
module.exports = {
  name: 'setbotpp',
  aliases: [],
  category: 'plugin',
  description: 'setbotpp command',
  usage: '.setbotpp',
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
