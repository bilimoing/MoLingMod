// 🔧 必须修改：你的 GitHub 信息
const state = {
  lang: localStorage.getItem('lang') || 'zh',
  auth: !!localStorage.getItem('mol_admin'),
  ghToken: localStorage.getItem('gh_token') || '',
  user: 'bilimoing', // 👈 替换为你的 GitHub 用户名
  repo: 'MoLingMod',       // 👈 替换为你的仓库名
  branch: 'main'
};

const T = {
  zh: { title:'末泠的Mod库', terraria:'泰拉瑞亚', stardew:'星露谷物语', minecraft:'我的世界', admin:'🔧 管理后台', back:'返回主页', login_t:'管理员登录', hint:'默认密码: admin123', login_b:'登录', cancel:'取消', logout:'退出', admin_t:'🔧 Mod 管理', upload:'上传/更新', manage:'管理列表', name:'Mod名称', cat:'游戏分类', ver:'版本号', icon:'图标', mod_file:'Mod文件', source_file:'源文件', desc:'描述', submit_upload:'提交上传', del:'删除', edit:'编辑', none:'暂无Mod', down:'⬇️ 下载', cmts:'评论', login_c:'登录后评论', post:'发表', v:'v', sel_file:'点击选择文件', success:'✅ 上传成功！请等待约30秒同步。', err:'❌ 失败', loading:'加载中...', token_req:'请先保存有效的 GitHub Token' },
  en: { title:"Moling's Mods", terraria:'Terraria', stardew:'Stardew Valley', minecraft:'Minecraft', admin:'🔧 Admin', back:'Back', login_t:'Admin Login', hint:'Default: admin123', login_b:'Login', cancel:'Cancel', logout:'Logout', admin_t:'🔧 Mod Admin', upload:'Upload/Update', manage:'Manage', name:'Mod Name', cat:'Category', ver:'Version', icon:'Icon', mod_file:'Mod File', source_file:'Source', desc:'Description', submit_upload:'Upload', del:'Delete', edit:'Edit', none:'No mods', down:'⬇️ Download', cmts:'Comments', login_c:'Login to comment', post:'Post', v:'v', sel_file:'Click to select', success:'✅ Upload successful! Wait ~30s for sync.', err:'❌ Failed', loading:'Loading...', token_req:'Please save a valid GitHub Token first' }
};

document.addEventListener('DOMContentLoaded', async () => {
  applyLang();
  initMusic();
  if(state.ghToken) document.getElementById('token-status').textContent = '✅ Token 已就绪';
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

// 📦 数据加载 (从 GitHub 读取 mods.json)
let modsData = [];
async function loadMods() {
  try {
    const res = await fetch(`https://api.github.com/repos/${state.user}/${state.repo}/contents/mods.json?t=${Date.now()}`);
    if(res.ok) { const json = await res.json(); modsData = JSON.parse(atob(json.content)); }
    else modsData = [];
  } catch(e) { modsData = []; }
}

function renderGamePage(game) {
  const grid = document.getElementById('mod-grid'); if(!grid) return;
  const t = T[state.lang];
  const list = modsData.filter(m => m.game === game);
  grid.innerHTML = list.length ? list.map(m => `
    <div class="mod-card">
      <img src="${m.icon}" class="mod-img" onerror="this.style.background='#333'">
      <div class="mod-n">${m.name}</div><div class="mod-v">${t.v}${m.version}</div>
      <a href="${m.file}" download class="glass-btn" style="margin-top:8px;font-size:0.8rem;padding:6px 12px;">${t.down}</a>
      ${m.source?`<a href="${m.source}" download class="glass-btn" style="margin-top:8px;font-size:0.8rem;padding:6px 12px;">源码</a>`:''}
    </div>`).join('') : `<p style="text-align:center;opacity:0.6;grid-column:1/-1;">${t.none}</p>`;
}

// 🔑 Token & 登录
function saveToken() {
  const token = document.getElementById('gh-token').value.trim();
  if(token.startsWith('github_pat_')) {
    localStorage.setItem('gh_token', token); state.ghToken = token;
    document.getElementById('token-status').textContent = '✅ Token 已保存，可上传';
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
  document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active', b.textContent.includes(T[state.lang][t]||t)));
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.toggle('active', p.id===`tab-${t}`));
  if(t==='list') loadAdminList();
}

function previewFile(inp, lblId) {
  const lbl=document.getElementById(lblId);
  if(inp.files?.length) lbl.textContent = inp.id==='f-scr' ? `✅ ${inp.files.length} 文件` : `✅ 已选择`;
  else lbl.textContent = T[state.lang].sel_file;
}

// 🚀 核心：GitHub API 自动上传
async function handleUpload(e) {
  e.preventDefault();
  if(!state.ghToken) return alert(T[state.lang].token_req);
  
  const btn = document.getElementById('submit-btn');
  btn.disabled = true; btn.textContent = '🚀 上传中...';

  try {
    const name = document.getElementById('f-name').value;
    const ver = document.getElementById('f-ver').value;
    const cat = document.getElementById('f-cat').value;
    const desc = document.getElementById('f-desc').value;
    
    const iconFile = document.getElementById('f-icon').files[0];
    const modFile = document.getElementById('f-mod').files[0];
    const srcFile = document.getElementById('f-src').files[0];

    if(!iconFile || !modFile) throw new Error("必须选择图标和Mod文件");

    // 生成安全路径
    const safeName = name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
    const extIcon = iconFile.name.split('.').pop();
    const extMod = modFile.name.split('.').pop();
    const extSrc = srcFile ? srcFile.name.split('.').pop() : 'zip';

    const paths = {
      icon: `mods/${safeName}_${ver}_icon.${extIcon}`,
      mod: `mods/${safeName}_${ver}.${extMod}`,
      source: srcFile ? `mods/${safeName}_${ver}_src.${extSrc}` : null
    };

    // 读取 Base64
    const b64 = f => new Promise(r => { const rd = new FileReader(); rd.onload = () => r(rd.result.split(',')[1]); rd.readAsDataURL(f); });
    const iconB64 = await b64(iconFile);
    const modB64 = await b64(modFile);
    const srcB64 = srcFile ? await b64(srcFile) : null;

    // 并行上传文件
    await Promise.all([
      ghPut(paths.icon, iconB64, `Add icon: ${name}`),
      ghPut(paths.mod, modB64, `Add mod: ${name} v${ver}`),
      srcB64 ? ghPut(paths.source, srcB64, `Add source: ${name}`) : Promise.resolve()
    ]);

    // 更新 mods.json
    let jsonContent = [];
    try { const res = await ghGet('mods.json'); jsonContent = JSON.parse(atob(res.content)); } catch(e) {}
    
    jsonContent.push({
      id: Date.now().toString(),
      name, game: cat, version: ver,
      icon: paths.icon, file: paths.mod, source: paths.source,
      desc, screenshots: []
    });

    await ghPut('mods.json', btoa(JSON.stringify(jsonContent, null, 2)), `Add Mod: ${name} v${ver}`);

    alert(T[state.lang].success);
    location.reload();
  } catch(err) {
    console.error(err);
    alert(T[state.lang].err + ': ' + (err.message || '网络/API错误'));
  } finally {
    btn.disabled = false; btn.textContent = T[state.lang].submit_upload;
  }
}

// GitHub API 封装
function ghAPI(path, method='GET', body=null, sha=null) {
  return fetch(`https://api.github.com/repos/${state.user}/${state.repo}/contents/${path}`, {
    method, headers: {
      'Authorization': `Bearer ${state.ghToken}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    },
    body: body ? JSON.stringify({ message: 'Auto update', content: body, ...(sha ? {sha} : {}) }) : null
  }).then(res => {
    if(!res.ok) return res.json().then(e => Promise.reject(e));
    return res.json();
  });
}

function ghGet(path) { return ghAPI(path, 'GET'); }
async function ghPut(path, base64, msg) {
  try {
    const file = await ghGet(path);
    return ghAPI(path, 'PUT', base64, file.sha);
  } catch { return ghAPI(path, 'PUT', base64); }
}

function loadAdminList() {
  const t=T[state.lang];
  document.getElementById('mod-list').innerHTML = modsData.length ? modsData.map(m => `
    <div class="m-item"><img src="${m.icon}"><div class="m-info"><strong>${m.name}</strong><br><small style="opacity:0.7;">${m.game} | ${t.v}${m.version}</small></div>
    <a href="${m.file}" download class="glass-btn" style="font-size:0.8rem;padding:6px 12px;">下载</a>
    ${m.source?`<a href="${m.source}" download class="glass-btn" style="font-size:0.8rem;padding:6px 12px;">源码</a>`:''}</div>
  `).join('') : `<p style="text-align:center;opacity:0.6;padding:30px;">${t.none}</p>`;
}