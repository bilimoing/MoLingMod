// 🔧 必须修改：你的 GitHub 信息
const state = {
  lang: localStorage.getItem('lang') || 'zh',
  auth: !!localStorage.getItem('mol_admin'),
  ghToken: localStorage.getItem('gh_token') || '',
  user: 'bilimoing', // 👈 替换为你的 GitHub 用户名
  repo: 'MoLingMod',       // 👈 替换为你的仓库名
  branch: 'master',
  mode: 'upload', // 'upload' or 'update'
  editingId: null,
  isBusy: false
};

const T = {
  zh: { title:'末泠的Mod库', terraria:'泰拉瑞亚', stardew:'星露谷物语', minecraft:'我的世界', admin:'🔧 管理后台', back:'返回主页', login_t:'管理员登录', hint:'默认密码: admin123', login_b:'登录', cancel:'取消', logout:'退出', admin_t:'🔧 Mod 管理', upload:'📤 上传新 Mod', update:'🔄 更新已有 Mod', manage:'📋 管理列表', name:'Mod名称', cat:'游戏分类', ver:'版本号', icon:'图标', mod_file:'Mod文件', source_file:'源文件', desc:'描述', submit_upload:'🚀 提交上传', submit_update:'🔄 提交更新', del:'删除', none:'暂无Mod', down:'⬇️ 下载', success:'✅ 操作成功！列表已同步。', err:'❌ 失败', loading:'加载中...', token_req:'请先保存有效的 GitHub Token', del_confirm:'确定删除此 Mod？将同时清理仓库相关文件。', retrying:'⏳ SHA版本冲突，自动重试中...', please_select:'请先在上方选择要更新的 Mod' },
  en: { title:"Moling's Mods", terraria:'Terraria', stardew:'Stardew Valley', minecraft:'Minecraft', admin:'🔧 Admin', back:'Back', login_t:'Admin Login', hint:'Default: admin123', login_b:'Login', cancel:'Cancel', logout:'Logout', admin_t:'🔧 Mod Admin', upload:'📤 Upload New', update:'🔄 Update Existing', manage:'📋 Manage', name:'Mod Name', cat:'Category', ver:'Version', icon:'Icon', mod_file:'Mod File', source_file:'Source', desc:'Description', submit_upload:'🚀 Upload', submit_update:'🔄 Update', del:'Delete', none:'No mods', down:'⬇️ Download', success:'✅ Success! List synced.', err:'❌ Failed', loading:'Loading...', token_req:'Please save a valid GitHub Token', del_confirm:'Delete this mod? Files will be removed.', retrying:'⏳ SHA conflict, retrying...', please_select:'Please select a mod to update above' }
};

// 🛡️ 安全 Base64 (支持中文)
const utf8ToBase64 = str => { const b=new TextEncoder().encode(str); let s=''; b.forEach(c=>s+=String.fromCharCode(c)); return btoa(s); };
const base64ToUtf8 = b => new TextDecoder().decode(Uint8Array.from(atob(b), c=>c.charCodeAt(0)));

document.addEventListener('DOMContentLoaded', async () => {
  applyLang();
  initMusic();
  if(state.ghToken) document.getElementById('token-status').textContent = '✅ Token 已就绪';

  // 🔑 核心修复：强制等待数据加载完成后再渲染任何页面
  await loadMods();
  const page = document.body.dataset.page;
  if (['terraria','stardew','minecraft'].includes(page)) renderGamePage(page);
  if (page === 'admin') initAdmin();
});

function setLang(l) { state.lang=l; localStorage.setItem('lang',l); applyLang(); renderCurrentPage(); }
function applyLang() {
  document.querySelectorAll('[data-i18n]').forEach(e => e.textContent = T[state.lang][e.dataset.i18n] || e.textContent);
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.textContent.trim()===(state.lang==='zh'?'中':'EN')));
}
function renderCurrentPage() {
  const p = document.body.dataset.page;
  if(['terraria','stardew','minecraft'].includes(p)) renderGamePage(p);
  if(p==='admin') loadAdminList();
}

// 🎵 音乐
function initMusic() {
  const bgm = document.getElementById('bgm'), v = document.getElementById('vinyl'); if(!bgm) return;
  bgm.volume = 0.5;
  const t = localStorage.getItem('music_time'); if(t) bgm.currentTime = parseFloat(t);
  if(localStorage.getItem('music_playing')==='true') bgm.play().then(()=>v.classList.add('spin')).catch(()=>{});
}
function toggleMusic() {
  const bgm=document.getElementById('bgm'), v=document.getElementById('vinyl'); if(!bgm) return;
  if(bgm.paused) { bgm.play().then(()=>{v.classList.add('spin');localStorage.setItem('music_playing','true');}).catch(()=>{}); }
  else { bgm.pause(); v.classList.remove('spin'); localStorage.setItem('music_playing','false'); }
}
window.addEventListener('beforeunload', ()=>{const b=document.getElementById('bgm');if(b){localStorage.setItem('music_time',b.currentTime);localStorage.setItem('music_playing',!b.paused?'true':'false');}});
document.addEventListener('visibilitychange', ()=>{if(document.hidden){const b=document.getElementById('bgm');if(b)localStorage.setItem('music_playing',!b.paused?'true':'false');}});

// 📦 数据加载 (带容错与调试日志)
let modsData = [];
async function loadMods() {
  try {
    const res = await fetch(`https://api.github.com/repos/${state.user}/${state.repo}/contents/mods.json?t=${Date.now()}`);
    if(res.ok) {
      const json = await res.json();
      modsData = JSON.parse(base64ToUtf8(json.content));
      console.log(`✅ 成功加载 ${modsData.length} 个 Mod`);
    } else { console.warn('⚠️ mods.json 未找到，初始化为空'); modsData = []; }
  } catch(e) { console.error('❌ 加载失败:', e); modsData = []; }
}

// 🖼️ 渲染游戏页 (修复不显示问题)
function renderGamePage(game) {
  const grid = document.getElementById('mod-grid'); if(!grid) return;
  const t = T[state.lang];
  // 🔑 修复：严格转为小写并去除空格匹配，防止大小写/隐藏字符导致过滤失败
  const safeGame = String(game).trim().toLowerCase();
  const list = modsData.filter(m => String(m.game).trim().toLowerCase() === safeGame);

  if(list.length === 0) {
    grid.innerHTML = `<p style="text-align:center;opacity:0.6;grid-column:1/-1;font-size:1.1rem;">${modsData.length===0 ? '📡 正在同步仓库数据...' : t.none}</p>`;
    return;
  }

  grid.innerHTML = list.map(m => `
    <div class="mod-card">
      <img src="${m.icon}" class="mod-img" onerror="this.style.background='#333'">
      <div class="mod-n">${m.name}</div><div class="mod-v">${t.v}${m.version}</div>
      <a href="${m.file}" download class="glass-btn" style="margin-top:8px;font-size:0.8rem;padding:6px 12px;">${t.down}</a>
      ${m.source?`<a href="${m.source}" download class="glass-btn" style="margin-top:8px;font-size:0.8rem;padding:6px 12px;">源码</a>`:''}
    </div>`).join('');
}

// 🔑 Token & 登录
function saveToken() {
  const token = document.getElementById('gh-token').value.trim();
  if(token.startsWith('github_pat_')) {
    localStorage.setItem('gh_token', token); state.ghToken = token;
    document.getElementById('token-status').textContent = '✅ Token 已保存';
    document.getElementById('token-config').style.display='none';
    document.getElementById('auth-wrap').style.display='block';
  } else alert('Token 格式错误 (应以 github_pat_ 开头)');
}
function doLogin() {
  if(document.getElementById('admin-pass').value === 'admin123') { state.auth=true; localStorage.setItem('mol_admin','1'); initAdmin(); }
  else alert(T[state.lang].err);
}
function doLogout() { state.auth=false; localStorage.removeItem('mol_admin'); location.reload(); }

function initAdmin() {
  const wrap = document.getElementById('admin-panel');
  if(state.auth) { wrap.style.display='block'; document.getElementById('auth-wrap').style.display='none'; switchTab('upload'); }
  else { wrap.style.display='none'; document.getElementById('auth-wrap').style.display='block'; }
  if(!state.ghToken) { document.getElementById('token-config').style.display='block'; document.getElementById('auth-wrap').style.display='none'; }
}

function switchTab(t) {
  document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById(`tab-btn-${t}`)?.classList.add('active');
  document.getElementById(`tab-${t}`).classList.add('active');

  if(t==='upload') { state.mode='upload'; state.editingId=null; resetForm(); }
  if(t==='update') { state.mode='update'; populateUpdateSelect(); }
  if(t==='list') loadAdminList();
}

function populateUpdateSelect() {
  const sel = document.getElementById('update-select');
  sel.innerHTML = '<option value="">-- 请选择 --</option>';
  modsData.forEach(m => sel.innerHTML += `<option value="${m.id}">${m.name} (v${m.version}) - ${m.game}</option>`);
  // 重置更新面板状态
  document.getElementById('update-form').style.opacity='0.6';
  document.getElementById('update-form').style.pointerEvents='none';
  document.getElementById('update-btn').disabled=true;
  state.editingId=null;
}

function loadModForUpdate(id) {
  const form = document.getElementById('update-form');
  const btn = document.getElementById('update-btn');
  if(!id) { form.style.opacity='0.6'; form.style.pointerEvents='none'; btn.disabled=true; return; }

  const mod = modsData.find(m => m.id === id);
  if(!mod) return;

  state.editingId = id;
  document.getElementById('edit-id').value = id;
  document.getElementById('u-name').value = mod.name;
  document.getElementById('u-cat').value = mod.game;
  document.getElementById('u-ver').value = mod.version;
  document.getElementById('u-desc').value = mod.desc;

  // 显示当前文件路径
  document.getElementById('u-lbl-icon').textContent = `当前: ${mod.icon.split('/').pop()}`;
  document.getElementById('u-lbl-mod').textContent = `当前: ${mod.file.split('/').pop()}`;
  document.getElementById('u-lbl-src').textContent = mod.source ? `当前: ${mod.source.split('/').pop()}` : '无源码';

  form.style.opacity='1'; form.style.pointerEvents='auto'; btn.disabled=false;
  state.mode = 'update';
}

function previewFile(inp, lblId) {
  const lbl=document.getElementById(lblId);
  if(inp.files?.length) lbl.textContent = `✅ ${inp.files.length} 文件已选 (将替换)`;
  else lbl.textContent = '不替换';
}

function resetForm() {
  document.getElementById('mod-form').reset();
  document.querySelectorAll('[id^=lbl-]').forEach(l=>l.textContent='选择文件');
}

async function handleFormSubmit(e) {
  e.preventDefault();
  if(state.isBusy) return alert('操作中，请稍候...');
  if(!state.ghToken) return alert(T[state.lang].token_req);
  if(state.mode==='update' && !state.editingId) return alert(T[state.lang].please_select);

  state.isBusy = true;
  const btnId = state.mode==='update' ? 'update-btn' : 'submit-btn';
  const btn = document.getElementById(btnId);
  const origText = btn.textContent;
  btn.disabled = true; btn.textContent = '⏳ 处理中...';

  try {
    const name = state.mode==='update' ? document.getElementById('u-name').value : document.getElementById('f-name').value;
    const cat = state.mode==='update' ? document.getElementById('u-cat').value : document.getElementById('f-cat').value;
    const ver = state.mode==='update' ? document.getElementById('u-ver').value : document.getElementById('f-ver').value;
    const desc = state.mode==='update' ? document.getElementById('u-desc').value : document.getElementById('f-desc').value;

    const iconFile = document.getElementById(state.mode==='update'?'u-icon':'f-icon').files[0];
    const modFile = document.getElementById(state.mode==='update'?'u-mod':'f-mod').files[0];
    const srcFile = document.getElementById(state.mode==='update'?'u-src':'f-src').files[0];

    if(state.mode==='upload' && (!iconFile || !modFile)) throw new Error("上传必须选择图标和Mod文件");

    const b64 = f => f ? new Promise(r => { const rd = new FileReader(); rd.onload = () => r(rd.result.split(',')[1]); rd.readAsDataURL(f); }) : Promise.resolve(null);
    const iconB64 = await b64(iconFile);
    const modB64 = await b64(modFile);
    const srcB64 = srcFile ? await b64(srcFile) : null;

    let targetMod = null;
    let jsonContent = [];
    try { const raw = await ghGet('mods.json'); jsonContent = JSON.parse(base64ToUtf8(raw.content)); } catch(e) {}

    if(state.mode === 'update') {
      const oldIdx = jsonContent.findIndex(m => m.id === state.editingId);
      if(oldIdx === -1) throw new Error('找不到原 Mod 记录');
      targetMod = jsonContent[oldIdx];

      if(iconB64) await ghPut(targetMod.icon, iconB64, `Update icon: ${name}`);
      if(modB64) await ghPut(targetMod.file, modB64, `Update mod: ${name} v${ver}`);
      if(srcB64) await ghPut(targetMod.source, srcB64, `Update source: ${name}`);

      targetMod.name = name; targetMod.game = cat; targetMod.version = ver; targetMod.desc = desc;
      jsonContent[oldIdx] = targetMod;
    } else {
      const safeName = name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
      const paths = {
        icon: `mods/${safeName}_${ver}_icon.${iconFile.name.split('.').pop()}`,
        mod: `mods/${safeName}_${ver}.${modFile.name.split('.').pop()}`,
        source: srcFile ? `mods/${safeName}_${ver}_src.${srcFile.name.split('.').pop()}` : null
      };

      // ✅ 修复：所有 ghPut 都传 message
      await Promise.all([
        ghPut(paths.icon, iconB64, `Add icon: ${name}`),
        ghPut(paths.mod, modB64, `Add mod: ${name} v${ver}`),
        srcB64 ? ghPut(paths.source, srcB64, `Add source: ${name}`) : Promise.resolve()
      ]);

      targetMod = { id: Date.now().toString(), name, game: cat, version: ver, icon: paths.icon, file: paths.mod, source: paths.source, desc, screenshots: [] };
      jsonContent.push(targetMod);
    }

    await ghPut('mods.json', utf8ToBase64(JSON.stringify(jsonContent, null, 2)), `${state.mode==='update'?'Update':'Add'} Mod: ${name} v${ver}`);

    if(state.mode === 'update') {
      const idx = modsData.findIndex(m => m.id === state.editingId);
      if(idx !== -1) modsData[idx] = targetMod;
    } else {
      modsData.push(targetMod);
    }
    renderCurrentPage();
    resetForm();
    populateUpdateSelect();
    alert(T[state.lang].success);
  } catch(err) {
    console.error(err);
    alert(T[state.lang].err + ': ' + (err.message || '网络/API错误'));
  } finally {
    state.isBusy = false;
    btn.disabled = false; btn.textContent = origText;
  }
}

// 🗑️ 删除逻辑
async function deleteMod(id) {
  if(!confirm(T[state.lang].del_confirm)) return;
  const mod = modsData.find(m => m.id === id);
  if(!mod) return;

  state.isBusy = true;
  const btn = document.querySelector(`#item-${id} .del-btn`);
  if(btn) { btn.disabled=true; btn.textContent='...'; }

  try {
    let jsonContent = [];
    try { const raw = await ghGet('mods.json'); jsonContent = JSON.parse(base64ToUtf8(raw.content)); } catch(e) {}
    const newJson = jsonContent.filter(m => m.id !== id);
    await ghPut('mods.json', utf8ToBase64(JSON.stringify(newJson, null, 2)), `Delete Mod: ${mod.name}`);

    const filesToDelete = [mod.icon, mod.file];
    if(mod.source) filesToDelete.push(mod.source);
    for(const fp of filesToDelete) {
      if(!fp) continue;
      try {
        const f = await ghGet(fp);
        await fetch(`https://api.github.com/repos/${state.user}/${state.repo}/contents/${fp}`, {
          method: 'DELETE', headers: { 'Authorization': `Bearer ${state.ghToken}`, 'Accept': 'application/vnd.github.v3+json' },
          body: JSON.stringify({ message: `Delete file: ${fp}`, sha: f.sha })
        });
      } catch(e) {}
    }
    modsData = modsData.filter(m => m.id !== id);
    loadAdminList(); renderCurrentPage();
    alert('✅ 删除成功！');
  } catch(err) { alert('❌ 删除失败: ' + err.message); }
  finally { state.isBusy=false; if(btn){btn.disabled=false;btn.textContent=T[state.lang].del;} }
}

// 🛡️ GitHub API (防冲突重试)
async function ghGet(path) {
  const res = await fetch(`https://api.github.com/repos/${state.user}/${state.repo}/contents/${path}?t=${Date.now()}`, {
    headers: { 'Authorization': `Bearer ${state.ghToken}`, 'Accept': 'application/vnd.github.v3+json' }
  });
  if(!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return await res.json();
}

async function ghPut(path, base64Content, message = 'Update file', maxRetries = 3) {
  if(!base64Content) return; // 无内容不上传

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    let sha = null;
    try { sha = (await ghGet(path)).sha; } catch(e) {}

    // 🔑 确保 message 永远有值
    const commitMessage = message || `Update ${path}`;

    const res = await fetch(`https://api.github.com/repos/${state.user}/${state.repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${state.ghToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        message: commitMessage,  // 🔑 确保这里有值
        content: base64Content,
        ...(sha ? {sha} : {})
      })
    });

    if(res.ok) return await res.json();

    const err = await res.json();
    const isConflict = err.message?.includes('expected') || err.message?.includes('does not match');
    if(isConflict && attempt < maxRetries-1) {
      console.warn(`⏳ SHA conflict on ${path}. Retrying ${attempt+1}...`);
      await new Promise(r => setTimeout(r, 1000*(attempt+1)));
      continue;
    }
    throw err;
  }
}

function loadAdminList() {
  const t=T[state.lang];
  document.getElementById('mod-list').innerHTML = modsData.length ? modsData.map(m => `
    <div class="m-item" id="item-${m.id}">
      <img src="${m.icon}">
      <div class="m-info"><strong>${m.name}</strong><br><small style="opacity:0.7;">${m.game} | ${t.v}${m.version}</small></div>
      <a href="${m.file}" download class="glass-btn" style="font-size:0.8rem;padding:6px 12px;">${t.down}</a>
      ${m.source?`<a href="${m.source}" download class="glass-btn" style="font-size:0.8rem;padding:6px 12px;">源码</a>`:''}
      <button class="del-btn" onclick="deleteMod('${m.id}')">${t.del}</button>
    </div>`).join('') : `<p style="text-align:center;opacity:0.6;padding:30px;">${t.none}</p>`;
}