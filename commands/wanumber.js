/**
 * WA Number Checker
 * wanumber — Check if number is on WhatsApp
 * BY UZAIR
 */
'use strict';

const makeBox = (title, content) =>
  `╭─  ${title}  ─╮\n${content.split('\n').map(l => `│ ${l}`).join('\n')}\n╰──────────────╯\n\n        *BY UZAIR*`;

module.exports = {
  name: 'wanumber',
  aliases: ['nowa', 'checkwa'],
  category: 'utility',
  description: '📱 Check if number is on WhatsApp',
  usage: '.wanumber 923001234567',

  async execute(sock, msg, args, extra) {
    const { reply, react } = extra;
    const from = msg.key.remoteJid;
    const text = args.join(' ');

    if (!text) return reply(makeBox('WANUMBER', '❌ Example: .wanumber 923001234567'));

    await react('⏳');
    try {
      let number = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      let [result] = await sock.onWhatsApp(number);
      if (result?.exists) {
        await reply(makeBox('📱 WA CHECKER', `Number : ${text}\nStatus : ✅ ON WhatsApp\nJID    : ${result.jid}`));
      } else {
        await reply(makeBox('📱 WA CHECKER', `Number : ${text}\nStatus : ❌ NOT on WhatsApp`));
      }
      await react('✅');
    } catch(e) {
      reply(makeBox('❌ ERROR', 'Could not check number!'));
    }
  }
};
