/**
 * Anime Action Commands
 * hug, kiss, slap, pat, cry, bite, lick, bonk, cuddle, wink, poke, wave, dance etc
 * BY UZAIR
 */
'use strict';
const axios = require('axios');

const makeBox = (title, content) =>
  `╭─  ${title}  ─╮\n${content.split('\n').map(l => `│ ${l}`).join('\n')}\n╰──────────────╯\n\n        *BY UZAIR*`;

const animeApis = {
  hug:      'https://nekos.life/api/v2/img/hug',
  kiss:     'https://nekos.life/api/v2/img/kiss',
  slap:     'https://nekos.life/api/v2/img/slap',
  pat:      'https://nekos.life/api/v2/img/pat',
  cry:      'https://nekos.life/api/v2/img/cry',
  bite:     'https://nekos.life/api/v2/img/bite',
  lick:     'https://nekos.life/api/v2/img/lick',
  bonk:     'https://nekos.life/api/v2/img/slap',
  cuddle:   'https://nekos.life/api/v2/img/cuddle',
  wink:     'https://nekos.life/api/v2/img/wink',
  poke:     'https://nekos.life/api/v2/img/poke',
  wave:     'https://nekos.life/api/v2/img/wave',
  dance:    'https://nekos.life/api/v2/img/dance',
  smile:    'https://nekos.life/api/v2/img/smile',
  blush:    'https://nekos.life/api/v2/img/blush',
  nom:      'https://nekos.life/api/v2/img/nom',
  happy:    'https://nekos.life/api/v2/img/happy',
  kill:     'https://nekos.life/api/v2/img/kill',
  yeet:     'https://nekos.life/api/v2/img/yeet',
  bully:    'https://nekos.life/api/v2/img/bully',
  tickle:   'https://nekos.life/api/v2/img/tickle',
  highfive: 'https://nekos.life/api/v2/img/pat',
  spank:    'https://nekos.life/api/v2/img/spank',
  feed:     'https://nekos.life/api/v2/img/feed',
  smug:     'https://nekos.life/api/v2/img/smug',
  cringe:   'https://nekos.life/api/v2/img/cringe',
  glomp:    'https://nekos.life/api/v2/img/glomp',
};

const actionText = {
  hug: 'gives a warm hug to', kiss: 'kisses', slap: 'slaps',
  pat: 'headpats', cry: 'is crying because of', bite: 'bites',
  lick: 'licks', bonk: 'bonks', cuddle: 'cuddles with',
  wink: 'winks at', poke: 'pokes', wave: 'waves at',
  dance: 'dances with', smile: 'smiles at', blush: 'is blushing at',
  nom: 'noms on', happy: 'is happy with', kill: 'attacks',
  yeet: 'yeets', bully: 'bullies', tickle: 'tickles',
  highfive: 'high fives', spank: 'spanks', feed: 'feeds',
  smug: 'looks smug at', cringe: 'cringes at', glomp: 'glomps',
};

module.exports = {
  name: 'hug',
  aliases: Object.keys(animeApis).filter(k => k !== 'hug'),
  category: 'anime',
  description: '🎌 Anime action commands',
  usage: '.hug @user | .kiss @user | .slap @user | etc',

  async execute(sock, msg, args, extra) {
    const { reply, react } = extra;
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const command = msg.body?.split(' ')[0].replace(/^[^a-zA-Z0-9]/, '').toLowerCase();
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    if (!animeApis[command]) return;

    let senderName = `@${sender.split('@')[0]}`;
    let targetName = mentioned[0] ? `@${mentioned[0].split('@')[0]}` : 'themselves';
    let action = actionText[command] || command + 's';

    await react('⏳');
    try {
      let res = await axios.get(animeApis[command]);
      let gifUrl = res.data?.url;
      await sock.sendMessage(from, {
        image: { url: gifUrl },
        caption: makeBox(`🎌 ${command.toUpperCase()}`, `${senderName} ${action} ${targetName}!`),
      }, { quoted: msg, mentions: mentioned.length ? [sender, ...mentioned] : [sender] });
      await react('✅');
    } catch(e) {
      await reply(makeBox(`🎌 ${command.toUpperCase()}`, `${senderName} ${action} ${targetName}!`));
    }
  }
};
