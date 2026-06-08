/**
 * Group Extra Commands
 * warn, resetwarn, vote, upvote, downvote, checkvote, delvote, getbio, mulaiabsen, absen, cekabsen
 * BY UZAIR
 */
'use strict';

const makeBox = (title, content) =>
  `╭─  ${title}  ─╮\n${content.split('\n').map(l => `│ ${l}`).join('\n')}\n╰──────────────╯\n\n        *BY UZAIR*`;

const warnings = {};
const votes = {};
const absenData = {};

module.exports = {
  name: 'warn',
  aliases: ['resetwarn','vote','upvote','downvote','checkvote','delvote','getbio','mulaiabsen','absen','cekabsen'],
  category: 'group',
  description: '👥 Group extra commands',
  usage: '.warn @user | .vote <topic> | .upvote | .downvote | .checkvote | .absen | .cekabsen',

  async execute(sock, msg, args, extra) {
    const { reply, react } = extra;
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const command = msg.body?.split(' ')[0].replace(/^[^a-zA-Z0-9]/, '').toLowerCase();
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const text = args.join(' ');
    const isGroup = from.endsWith('@g.us');

    if (!isGroup && command !== 'getbio')
      return reply(makeBox('❌', 'This command is for groups only!'));

    // group info for admin check
    let isAdmin = false;
    try {
      let groupData = await sock.groupMetadata(from);
      isAdmin = groupData.participants.find(p => p.id === sender)?.admin != null;
    } catch(e) {}

    // ── warn ──
    if (command === 'warn') {
      if (!isAdmin) return reply(makeBox('WARN', '❌ Admins only!'));
      if (!mentioned[0]) return reply(makeBox('WARN', '❌ Tag a member!\nExample: .warn @user'));
      let target = mentioned[0];
      if (!warnings[from]) warnings[from] = {};
      if (!warnings[from][target]) warnings[from][target] = 0;
      warnings[from][target]++;
      let count = warnings[from][target];
      await sock.sendMessage(from, {
        text: makeBox(`⚠️ WARNING ${count}/3`, `@${target.split('@')[0]} has been warned!\n\n${count>=3?'🚫 Max warnings reached!':count+' warning(s) so far.'}`)
      }, { quoted: msg, mentions: [target] });
    }

    // ── resetwarn ──
    else if (command === 'resetwarn') {
      if (!isAdmin) return reply(makeBox('RESETWARN', '❌ Admins only!'));
      if (!mentioned[0]) return reply(makeBox('RESETWARN', '❌ Tag a member!'));
      let target = mentioned[0];
      if (warnings[from]) warnings[from][target] = 0;
      await sock.sendMessage(from, {
        text: makeBox('✅ WARN RESET', `Warnings cleared for @${target.split('@')[0]}`)
      }, { quoted: msg, mentions: [target] });
    }

    // ── vote ──
    else if (command === 'vote') {
      if (!text) return reply(makeBox('VOTE', '❌ Example: .vote Best player of 2025?'));
      votes[from] = { question: text, up: 0, down: 0, voters: [] };
      await reply(makeBox('🗳️ VOTE STARTED', `❓ ${text}\n\n👍 .upvote — Yes\n👎 .downvote — No\n📊 .checkvote — Results`));
    }

    // ── upvote ──
    else if (command === 'upvote') {
      if (!votes[from]) return reply(makeBox('UPVOTE', '❌ No active vote! Use .vote first'));
      if (votes[from].voters.includes(sender)) return reply(makeBox('❌', 'Already voted!'));
      votes[from].up++;
      votes[from].voters.push(sender);
      await reply(makeBox('👍 VOTED', `Yes count: *${votes[from].up}*`));
    }

    // ── downvote ──
    else if (command === 'downvote') {
      if (!votes[from]) return reply(makeBox('DOWNVOTE', '❌ No active vote! Use .vote first'));
      if (votes[from].voters.includes(sender)) return reply(makeBox('❌', 'Already voted!'));
      votes[from].down++;
      votes[from].voters.push(sender);
      await reply(makeBox('👎 VOTED', `No count: *${votes[from].down}*`));
    }

    // ── checkvote ──
    else if (command === 'checkvote') {
      if (!votes[from]) return reply(makeBox('CHECKVOTE', '❌ No active vote!'));
      let v = votes[from];
      let total = v.up + v.down;
      let upPct = total ? Math.round((v.up/total)*100) : 0;
      let downPct = total ? Math.round((v.down/total)*100) : 0;
      await reply(makeBox('📊 VOTE RESULTS', `❓ ${v.question}\n\n👍 Yes: ${v.up} (${upPct}%)\n👎 No: ${v.down} (${downPct}%)\n👥 Total: ${total}`));
    }

    // ── delvote ──
    else if (command === 'delvote') {
      if (!isAdmin) return reply(makeBox('DELVOTE', '❌ Admins only!'));
      delete votes[from];
      await reply(makeBox('✅', 'Vote deleted!'));
    }

    // ── getbio ──
    else if (command === 'getbio') {
      let target = mentioned[0] || sender;
      await react('⏳');
      try {
        let info = await sock.fetchStatus(target);
        await sock.sendMessage(from, {
          text: makeBox('📋 USER BIO', `@${target.split('@')[0]}\n\n${info?.status || 'No bio set.'}`)
        }, { quoted: msg, mentions: [target] });
        await react('✅');
      } catch(e) { reply(makeBox('❌', 'Could not fetch bio.')); }
    }

    // ── mulaiabsen ──
    else if (command === 'mulaiabsen') {
      if (!isAdmin) return reply(makeBox('MULAIABSEN', '❌ Admins only!'));
      absenData[from] = { active: true, list: [], topic: text || 'General' };
      await reply(makeBox('✅ ATTENDANCE STARTED', `Topic: ${text || 'General'}\n\nType *.absen* to mark attendance!`));
    }

    // ── absen ──
    else if (command === 'absen') {
      if (!absenData[from]?.active) return reply(makeBox('ABSEN', '❌ No active session! Admin use .mulaiabsen'));
      if (absenData[from].list.find(u => u.jid === sender))
        return reply(makeBox('❌', 'Already marked present!'));
      absenData[from].list.push({ jid: sender, name: msg.pushName || sender.split('@')[0], time: new Date().toLocaleTimeString() });
      let no = absenData[from].list.length;
      await sock.sendMessage(from, {
        text: makeBox('✅ PRESENT', `@${sender.split('@')[0]} marked present!\nNumber: ${no}`)
      }, { quoted: msg, mentions: [sender] });
    }

    // ── cekabsen ──
    else if (command === 'cekabsen') {
      if (!absenData[from]?.list?.length) return reply(makeBox('CEKABSEN', '❌ No attendance data!'));
      let list = absenData[from].list;
      let teks = `Topic: ${absenData[from].topic}\n\n`;
      list.forEach((u, i) => { teks += `${i+1}. ${u.name} — ${u.time}\n`; });
      teks += `\nTotal: ${list.length}`;
      await reply(makeBox('📋 ATTENDANCE LIST', teks));
    }
  }
};
