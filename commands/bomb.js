'use strict';

// ── Original run function ──
'use strict';
const games = new Map();
const run = async (ctx) => {
  const { sock, msg, from, sender, body } = ctx;
  const timeout = 180000;
  if (games.has(sender)) {
    const g = games.get(sender);
    if (['suren','surrender'].includes(body?.toLowerCase().trim())) {
      const bomb = g.arr.find(v => v.e === '💥');
      clearTimeout(g.tid); games.delete(sender);
      return await sock.sendMessage(from, { text: `😔 Surrender! Bomb box number ${bomb.n} mein tha.` }, { quoted: g.msgKey });
    }
    const num = parseInt(body?.trim());
    if (isNaN(num) || num < 1 || num > 9) return;
    const box = g.arr.find(v => v.p === num);
    if (!box || box.opened) return;
    box.opened = true;
    if (box.e === '💥') {
      let t = `💥 *BOOM! Bomb mil gaya!*\n\n`;
      for (let i=0;i<g.arr.length;i+=3) t += g.arr.slice(i,i+3).map(v=>v.e).join('')+'\n';
      clearTimeout(g.tid); games.delete(sender);
      return await sock.sendMessage(from, { text: t }, { quoted: msg });
    }
    const safe = g.arr.filter(v=>v.e==='✅');
    if (safe.every(v=>v.opened)) {
      let t = `🎉 *Tum Jeet Gaye! Sab safe boxes khole!*\n\n`;
      for (let i=0;i<g.arr.length;i+=3) t += g.arr.slice(i,i+3).map(v=>v.e).join('')+'\n';
      clearTimeout(g.tid); games.delete(sender);
      return await sock.sendMessage(from, { text: t }, { quoted: msg });
    }
    let t = `乂 *B O M B*\n\nBox ${box.n} khola: ${box.e}\n\nNumber bhejo (1-9):\n`;
    const nums = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣'];
    for (let i=0;i<g.arr.length;i+=3) t += g.arr.slice(i,i+3).map(v=>v.opened?v.e:nums[v.p-1]).join('')+'\n';
    t += `\nType *suren* to surrender.`;
    return await sock.sendMessage(from, { text: t }, { quoted: msg });
  }
  const emojis = ['💥','✅','✅','✅','✅','✅','✅','✅','✅'].sort(()=>Math.random()-0.5);
  const nums = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣'];
  const arr = emojis.map((e,i)=>({ e, n: nums[i], p: i+1, opened: false }));
  let t = `乂 *B O M B*\n\n9 boxes mein se number bhejo:\n\n`;
  for (let i=0;i<arr.length;i+=3) t += arr.slice(i,i+3).map(v=>v.n).join('')+'\n';
  t += `\nTimeout: 3 min | *suren* to surrender`;
  const sentMsg = await sock.sendMessage(from, { text: t }, { quoted: msg });
  const tid = setTimeout(async () => {
    if (games.has(sender)) {
      const bomb = games.get(sender).arr.find(v=>v.e==='💥');
      games.delete(sender);
      await sock.sendMessage(from, { text: `⏰ Time up! Bomb box number ${bomb.n} mein tha.` });
    }
  }, timeout);
  games.set(sender, { arr, msgKey: sentMsg, tid });
};
module.exports = { run };

// ── Dynamic Plugin Wrapper ──
module.exports = {
  name: 'bomb',
  aliases: [],
  category: 'plugin',
  description: 'bomb command',
  usage: '.bomb',
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
