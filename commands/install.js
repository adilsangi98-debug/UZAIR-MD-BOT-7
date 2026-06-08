// commands/owner/install.js
// commands/owner/install.js
// commands/owner/install.js
// commands/owner/install.js
'use strict';
// ─────────────────────────────────────────────────────────
//  commands/install.js
//  Bot root: /home/container/
//  This file: /home/container/commands/install.js
//  Plugins saved to: /home/container/commands/<name>.js
// ─────────────────────────────────────────────────────────

// commands/install.js
// Fixed for Railway.com — GitHub API se permanent save
'use strict';

const axios    = require('axios');
const fs       = require('fs');
const path     = require('path');
const { exec } = require('child_process');
const config   = require('../config/config');

const COMMANDS_DIR  = path.resolve(__dirname, '..', 'commands');
const PRIMARY_OWNER = config.ownerNumber || '';

// ── GitHub Config ─────────────────────────────────────────
// Ye values config.js mein add karo ya environment variables mein
const GITHUB_TOKEN  = config.githubToken  || process.env.GITHUB_TOKEN  || '';
const GITHUB_OWNER  = config.githubOwner  || process.env.GITHUB_OWNER  || '';
const GITHUB_REPO   = config.githubRepo   || process.env.GITHUB_REPO   || '';
const GITHUB_BRANCH = config.githubBranch || process.env.GITHUB_BRANCH || 'main';

// ── Gist URL → Raw URL ────────────────────────────────────
function gistToRawUrl(gistUrl) {
  try {
    const url   = new URL(gistUrl);
    if (url.hostname === 'gist.github.com') {
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length >= 2) {
        return `https://gist.githubusercontent.com/${parts[0]}/${parts[1]}/raw`;
      }
    }
    return gistUrl;
  } catch {
    return gistUrl;
  }
}

// ── Fix wrong require paths ───────────────────────────────
function patchPluginPaths(content) {
  return content
    .replace(/require\(['"]\.\.\/.\.\/config(?:\/config)?['"]\)/g, "require('../config/config')")
    .replace(/require\(['"]\.\.\/.\.\/utils\//g,     "require('../utils/")
    .replace(/require\(['"]\.\.\/.\.\/database\//g,  "require('../database/")
    .replace(/require\(['"]\.\.\/.\.\/core\//g,      "require('../core/")
    .replace(/require\(['"]\.\.\/.\.\/handlers\//g,  "require('../handlers/")
    .replace(/require\(['"]\.\.\/.\.\/middleware\//g,"require('../middleware/");
}

// ── Parse Plugin Metadata ─────────────────────────────────
function parsePlugin(content) {
  const info = {};
  const exportMatch = content.match(/module\.exports\s*=\s*({[\s\S]*?})/);
  if (!exportMatch) return info;
  const objStr = exportMatch[1];

  const extractString  = (key) => { const m = objStr.match(new RegExp(`${key}\\s*:\\s*['"]([^'"]+)['"]`)); return m ? m[1] : null; };
  const extractBoolean = (key) => { const m = objStr.match(new RegExp(`${key}\\s*:\\s*(true|false)`)); return m ? m[1] === 'true' : false; };
  const extractArray   = (key) => {
    const m = objStr.match(new RegExp(`${key}\\s*:\\s*\\[([\\s\\S]*?)\\]`));
    if (!m) return [];
    const items = []; const re = /['"]([^'"]+)['"]/g; let mm;
    while ((mm = re.exec(m[1])) !== null) items.push(mm[1]);
    return items;
  };

  info.name           = extractString('name');
  info.description    = extractString('description');
  info.usage          = extractString('usage');
  info.aliases        = extractArray('aliases');
  info.ownerOnly      = extractBoolean('ownerOnly');
  info.adminOnly      = extractBoolean('adminOnly');
  info.groupOnly      = extractBoolean('groupOnly');
  info.privateOnly    = extractBoolean('privateOnly');
  info.botAdminNeeded = extractBoolean('botAdminNeeded');
  return info;
}

// ── GitHub API: File push karo ────────────────────────────
async function pushToGitHub(fileName, content) {
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    console.log('[Install] GitHub config nahi mili — skip GitHub push');
    return false;
  }

  try {
    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/commands/${fileName}`;
    const headers = {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'UZAIR-MD-BOT'
    };

    // Check: file pehle se exist karti hai? SHA chahiye update ke liye
    let sha = null;
    try {
      const existing = await axios.get(apiUrl, { headers, timeout: 10000 });
      sha = existing.data?.sha;
    } catch (e) {
      // File nahi hai — new file banayenge
    }

    const body = {
      message: `🤖 Install: ${fileName}`,
      content: Buffer.from(content, 'utf8').toString('base64'),
      branch: GITHUB_BRANCH,
    };
    if (sha) body.sha = sha;

    await axios.put(apiUrl, body, { headers, timeout: 15000 });
    console.log(`[Install] ✅ GitHub par push ho gaya: commands/${fileName}`);
    return true;
  } catch (e) {
    console.log('[Install] GitHub push failed:', e.response?.data?.message || e.message);
    return false;
  }
}

// ── Bot Restart ───────────────────────────────────────────
function restartBot() {
  exec('pm2 restart all', (err) => {
    if (err) {
      console.log('[Install] PM2 not found, process exit...');
      setTimeout(() => process.exit(0), 1000);
    }
  });
}

// ── Notify Primary Owner ──────────────────────────────────
async function notifyPrimaryOwner(sock, pluginInfo, installerJid) {
  try {
    if (!PRIMARY_OWNER) return;
    const who  = String(installerJid || '').split('@')[0] || 'unknown';
    const text = [
      '🧩 *Plugin Installed*', '',
      `👤 By: ${who}`,
      `🧾 Name: ${pluginInfo?.name || 'unknown'}`,
      pluginInfo?.description ? `📝 ${pluginInfo.description}` : null,
      '', `🕒 ${new Date().toLocaleString()}`
    ].filter(Boolean).join('\n');
    await sock.sendMessage(`${PRIMARY_OWNER}@s.whatsapp.net`, { text });
  } catch { /* ignore */ }
}

// ── Main Command ──────────────────────────────────────────
module.exports = {
  name: 'install',
  aliases: ['plugin', 'addplugin'],
  category: 'owner',
  description: 'Install a plugin from GitHub Gist URL or by replying to a .js file',
  usage: '.install [-r] <gist_url>  OR  reply to a .js file with .install',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      if (!extra.isOwner) {
        return extra.reply('❌ Sirf Owner use kar sakta hai!');
      }

      let autoRestart = false;
      const filteredArgs = args.filter(arg => {
        if (arg === '-r' || arg === '--restart') { autoRestart = true; return false; }
        return true;
      });

      let content = null;

      // ── Method 1: Gist / Raw URL ──────────────────────
      if (filteredArgs.length > 0) {
        const rawUrl = gistToRawUrl(filteredArgs[0].trim());
        await extra.react('⏳');
        const res = await axios.get(rawUrl, {
          timeout: 15000,
          responseType: 'text',
          headers: { 'User-Agent': 'WhatsApp-Bot-Installer' }
        });
        content = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
      }

      // ── Method 2: Reply to .js file ───────────────────
      else {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) {
          return extra.reply(
            '❌ Gist URL do ya kisi `.js` file ko reply karke `.install` likho.\n' +
            '📌 Usage: ' + this.usage
          );
        }
        const doc = quoted.documentMessage;
        if (!doc) return extra.reply('❌ Reply mein .js file honi chahiye.');
        if (!(doc.fileName || '').endsWith('.js')) {
          return extra.reply('❌ Sirf `.js` JavaScript files install ho sakti hain.');
        }

        await extra.react('⏳');

        let downloadMediaMessage;
        try {
          downloadMediaMessage = require('@whiskeysockets/baileys').downloadMediaMessage;
        } catch (e) {
          return extra.reply('❌ Baileys load nahi hua: ' + e.message);
        }

        const buffer = await downloadMediaMessage(
          { key: msg.key, message: quoted },
          'buffer',
          {},
          { logger: undefined, reuploadRequest: sock.updateMediaMessage }
        );
        content = buffer.toString('utf8');
      }

      if (!content || !content.trim()) {
        throw new Error('Plugin content nahi mila ya file empty hai.');
      }

      content = patchPluginPaths(content);

      const pluginInfo = parsePlugin(content);
      if (!pluginInfo.name) {
        throw new Error(
          'Plugin ka naam nahi mila.\n' +
          'Plugin mein `name:` field honi chahiye module.exports mein.'
        );
      }

      const fileName   = `${pluginInfo.name}.js`;
      const targetFile = path.join(COMMANDS_DIR, fileName);

      // ── Step 1: Local file save karo ─────────────────
      fs.writeFileSync(targetFile, content, 'utf8');
      console.log(`[Install] Local save: ${targetFile}`);

      // ── Step 2: Test load karo ────────────────────────
      try {
        delete require.cache[require.resolve(targetFile)];
        require(targetFile);
      } catch (loadErr) {
        try { fs.unlinkSync(targetFile); } catch {}
        throw new Error(`Plugin save hua lekin load nahi hua:\n${loadErr.message}`);
      }

      // ── Step 3: GitHub par push karo (Railway persistence) ──
      const githubPushed = await pushToGitHub(fileName, content);

      // ── Step 4: Hot reload karo ───────────────────────
      let hotLoaded = false;
      try {
        if (typeof global.reloadCommands === 'function') {
          global.reloadCommands();
          hotLoaded = true;
          console.log('[Install] Hot-reload complete.');
        }
      } catch (e) {
        console.log('[Install] Hot-reload skip:', e.message);
      }

      // ── Step 5: Success message ───────────────────────
      const prefix = config.prefix || '.';
      const details = [
        '╔══════════════════════╗',
        '║  ✅ Plugin Installed  ║',
        '╚══════════════════════╝',
        '',
        `📄 *File:* ${fileName}`,
        `🔖 *Command:* ${prefix}${pluginInfo.name}`,
      ];

      if (pluginInfo.aliases?.length) {
        details.push(`🔁 *Aliases:* ${pluginInfo.aliases.map(a => `${prefix}${a}`).join(', ')}`);
      }
      if (pluginInfo.description) details.push(`📝 *Info:* ${pluginInfo.description}`);
      if (pluginInfo.usage)       details.push(`⚙️ *Usage:* ${pluginInfo.usage}`);

      const flags = [];
      if (pluginInfo.ownerOnly)      flags.push('👑 Owner only');
      if (pluginInfo.adminOnly)      flags.push('🛡️ Admin only');
      if (pluginInfo.groupOnly)      flags.push('👥 Group only');
      if (pluginInfo.privateOnly)    flags.push('💬 Private only');
      if (pluginInfo.botAdminNeeded) flags.push('🤖 Bot admin needed');
      if (flags.length) details.push(`🚩 *Flags:* ${flags.join(' · ')}`);

      details.push('');

      if (githubPushed) {
        details.push('📦 *GitHub:* ✅ Permanently saved!');
        details.push('🔄 *Railway:* Command restart ke baad bhi rahega!');
      } else {
        details.push('⚠️ *GitHub:* Push nahi hua — sirf memory mein hai');
        details.push('💡 *Tip:* GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO set karo Railway mein');
      }

      details.push('');

      if (autoRestart) {
        details.push('♻️ *Auto-restarting bot...*');
        details.push(`🕒 ${new Date().toLocaleString()}`);
        await sock.sendMessage(extra.from, { text: details.join('\n') }, { quoted: msg });
        await extra.react('✅');
        await notifyPrimaryOwner(sock, pluginInfo, extra.sender);
        restartBot();
      } else {
        details.push(hotLoaded
          ? '⚡ *Loaded instantly — no restart needed!*'
          : '🔄 *Restart required to activate.*'
        );
        details.push(`🕒 ${new Date().toLocaleString()}`);
        await sock.sendMessage(extra.from, { text: details.join('\n') }, { quoted: msg });
        await extra.react('✅');
        await notifyPrimaryOwner(sock, pluginInfo, extra.sender);
      }

    } catch (error) {
      console.error('[Install] Error:', error);
      const errMsg = error.response
        ? `HTTP ${error.response.status} — ${error.response.statusText}`
        : error.message;
      await extra.reply(`❌ *Installation failed:*\n\n${errMsg}`);
      await extra.react('❌');
    }
  }
};





