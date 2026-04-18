// 🔧 仓库配置
const state = {
  lang: localStorage.getItem('lang') || 'zh',
  auth: !!(localStorage.getItem('mol_admin') || sessionStorage.getItem('mol_admin_session')),
  ghToken: decode(localStorage.getItem('gh_token_enc')) || decode(sessionStorage.getItem('gh_token_session_enc')) || '',
  user: 'bilimoing',
  repo: 'MoLingMod',
  branch: 'master',
  mode: 'upload', editingId: null, isBusy: false
};

console.log('🔑 Token 状态:', state.ghToken ? '已加载 (' + state.ghToken.substring(0, 20) + '...)' : '未设置');
console.log('🔐 登录状态:', state.auth ? '已登录' : '未登录');

const T = {
  zh: { title:'末泠的Mod库', terraria:'泰拉瑞亚', stardew:'星露谷物语', minecraft:'我的世界', admin:'🔧 管理后台', back:'返回主页', login_t:'管理员登录', hint:'默认密码: admin123', login_b:'登录', cancel:'取消', logout:'退出', admin_t:'🔧 Mod 管理', upload:'📤 上传', update:'🔄 更新', manage:'📋 列表', name:'名称', cat:'分类', ver:'版本', icon:'图标', mod_file:'Mod文件', source_file:'源码', desc:'描述', submit_upload:'🚀 提交', submit_update:'🔄 更新', del:'删除', none:'📦 暂无Mod', down:'⬇️ 下载', success:'✅ 成功！', err:'❌ 失败', loading:'📡 加载中...', token_req:'请先保存 Token', del_confirm:'确定删除？', retrying:'⏳ 重试中...', please_select:'请先选择', no_desc: '暂无描述' },
  en: { title:"Moling's Mods", terraria:'Terraria', stardew:'Stardew Valley', minecraft:'Minecraft', admin:'🔧 Admin', back:'Back', login_t:'Admin Login', hint:'Default: admin123', login_b:'Login', cancel:'Cancel', logout:'Logout', admin_t:'🔧 Mod Admin', upload:'📤 Upload', update:'🔄 Update', manage:'📋 List', name:'Name', cat:'Category', ver:'Version', icon:'Icon', mod_file:'Mod File', source_file:'Source', desc:'Description', submit_upload:'🚀 Submit', submit_update:'🔄 Update', del:'Delete', none:'📦 No mods', down:'⬇️ Download', success:'✅ Success!', err:'❌ Failed', loading:'📡 Loading...', token_req:'Save Token first', del_confirm:'Delete?', retrying:'⏳ Retrying...', please_select:'Select first', no_desc: 'No description' }
};

const utf8ToBase64 = str => btoa(new TextEncoder().encode(str).reduce((s,c)=>s+String.fromCharCode(c),''));
const base64ToUtf8 = b64 => new TextDecoder().decode(Uint8Array.from(atob(b64), c=>c.charCodeAt(0)));

// 🖥️ UI 状态提示
function setStatus(msg, color='#ff9f43') {
  const el = document.getElementById('debug-status');
  if(el) { el.textContent = msg; el.style.color = color; }
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('✅ DOM 加载完成');
  applyLang(); initMusic();
  if(state.ghToken) document.getElementById('token-status').textContent = '✅ Token 已就绪';

  console.log('🚀 初始化开始');
  setStatus('📡 正在连接 GitHub...', '#4ade80');

  console.log('⏳ 即将调用 loadMods...');
  await loadMods();
  console.log('✅ loadMods 执行完毕, modsData.length =', modsData.length);

  const page = document.body.dataset.page;
  console.log('📄 识别页面:', page);

  if (['terraria','stardew','minecraft'].includes(page)) {
    console.log('🎮 准备渲染游戏页面:', page);
    renderGamePage(page);
  }
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

let modsData = [];
async function loadMods() {
  try {
    console.log('🔄 开始加载 mods.json...');
    console.log('🔑 Token 状态:', state.ghToken ? '已设置' : '未设置');
    
    // 🔑 强制禁用缓存
    const url = `https://api.github.com/repos/${state.user}/${state.repo}/contents/mods.json?ref=${state.branch}&t=${Date.now()}`;
    
    const headers = {
      'Accept': 'application/vnd.github.v3+json'
    };
    // 使用 Token（如果有）
    if(state.ghToken) {
      headers['Authorization'] = `Bearer ${state.ghToken}`;
      console.log('🔑 使用 Token 认证');
    } else {
      console.log('⚠️ 未检测到 Token，尝试匿名访问');
    }
    
    console.log('📡 请求 URL:', url);
    const res = await fetch(url, { 
      cache: 'no-store',
      headers: headers
    });

    console.log('📡 GitHub API 响应状态:', res.status);

    if(res.status === 404) {
      setStatus('⚠️ 仓库无 mods.json，请先去后台上传', '#ff4757');
      modsData = []; return;
    }
    if(res.status === 403) {
      setStatus('❌ 访问被拒绝，请检查 Token 或仓库权限', '#ff4757');
      modsData = []; return;
    }
    if(!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    console.log('📦 GitHub 返回数据类型:', typeof json);
    
    modsData = json.content ? JSON.parse(base64ToUtf8(json.content)) : [];
    console.log('✅ 数据加载成功，共', modsData.length, '个mod');
    console.log('📋 Mod 列表:', modsData.map(m => `${m.name} (${m.game})`).join(', '));
    setStatus('✅ 数据已同步', '#4ade80');
    setTimeout(() => setStatus(''), 2000);
  } catch(e) {
    console.error('❌ 加载失败:', e);
    setStatus(`❌ 网络错误: ${e.message}`, '#ff4757');
    document.getElementById('debug-status').style.cursor = 'pointer';
    document.getElementById('debug-status').onclick = () => location.reload();
    modsData = [];
  }
}

function renderGamePage(game) {
  const grid = document.getElementById('mod-grid');
  if(!grid) { setStatus('❌ 页面缺少 #mod-grid', '#ff4757'); return; }

  const catMap = {
    '泰拉瑞亚': 'terraria', 'terraria': 'terraria', '泰拉': 'terraria',
    '星露谷物语': 'stardew', 'stardew': 'stardew', '星露谷': 'stardew',
    '我的世界': 'minecraft', 'minecraft': 'minecraft', 'mc': 'minecraft', 'MC': 'minecraft'
  };

  console.log(`🎨 渲染 ${game} | 数据量: ${modsData.length}`);
  console.log('📦 所有mod数据:', modsData);

  if(!modsData?.length) {
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;opacity:0.6;">📡 暂无数据</p>`;
    return;
  }

  const target = String(game).trim().toLowerCase();
  console.log('🎯 目标分类:', target);
  
  const list = modsData.filter(m => {
    const raw = String(m.game || '').trim();
    const mapped = (catMap[raw] || raw).toLowerCase();
    console.log(`检查mod "${m.name}": game="${raw}" -> mapped="${mapped}" -> 匹配=${mapped === target}`);
    return mapped === target;
  });
  
  console.log('✅ 筛选结果:', list);

  if(!list.length) {
    const allCats = [...new Set(modsData.map(m => m.game))].join(', ');
    setStatus(`🔍 分类不匹配: 页面="${game}" | 仓库="${allCats}"`, '#ff9f43');
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;opacity:0.6;">当前分类无 Mod</p>`;
    return;
  }

  setStatus('');
  
  const baseUrl = `https://cdn.jsdelivr.net/gh/${state.user}/${state.repo}@${state.branch}/`;
  
  grid.innerHTML = list.map(m => {
    const iconUrl = m.icon.startsWith('http') ? m.icon : baseUrl + m.icon;
    const fileUrl = m.file.startsWith('http') ? m.file : baseUrl + m.file;
    const sourceUrl = m.source && !m.source.startsWith('http') ? baseUrl + m.source : m.source;
    
    return `
    <div class="mod-card">
      <img src="${iconUrl}" class="mod-img" onerror="this.style.background='#333'">
      <div class="mod-header"><h3 class="mod-name">${m.name}</h3><span class="mod-ver">v${m.version}</span></div>
      <p class="mod-desc">${m.desc || T[state.lang].no_desc}</p>
      <div class="mod-actions">
        <a href="${fileUrl}" download class="glass-btn">⬇️ 下载</a>
        ${m.source ? `<a href="${sourceUrl}" download class="glass-btn" style="opacity:0.7">📦 源码</a>` : ''}
      </div>
    </div>`;
  }).join('');
}

// 🔑 后台逻辑 (保持原样，已验证可用)
// 🔐 简单的 Base64 编码/解码（轻量级混淆）
function encode(str) {
  if(!str) return '';
  try { return btoa(encodeURIComponent(str)); } catch(e) { return str; }
}
function decode(encoded) {
  if(!encoded) return '';
  try { return decodeURIComponent(atob(encoded)); } catch(e) { return encoded; }
}

function saveToken() {
  const t=document.getElementById('gh-token').value.trim();
  const rememberToken = document.getElementById('remember-token')?.checked;
  
  console.log('💾 尝试保存 Token:', t.substring(0, 20) + '...');
  console.log('💾 记住 Token:', rememberToken ? '是' : '否');
  
  if(t.startsWith('github_pat_')) { 
    const encrypted = encode(t);
    if(rememberToken) {
      localStorage.setItem('gh_token_enc', encrypted); 
      console.log('✅ Token 已加密保存到 localStorage');
    } else {
      // 不记住，只保存在内存中
      sessionStorage.setItem('gh_token_session_enc', encrypted);
      console.log('✅ Token 仅加密保存到会话（关闭浏览器后失效）');
    }
    state.ghToken=t; 
    document.getElementById('token-status').textContent='✅ 已保存'; 
    document.getElementById('token-config').style.display='none'; 
    document.getElementById('auth-wrap').style.display='block'; 
  } else {
    console.log('❌ Token 格式错误');
    alert('Token 格式错误');
  }
}

function doLogin() { 
  const pass = document.getElementById('admin-pass').value;
  const rememberPass = document.getElementById('remember-pass')?.checked;
  
  console.log('🔐 尝试登录 | 记住密码:', rememberPass ? '是' : '否');
  
  if(pass==='admin123') {
    state.auth=true;
    if(rememberPass) {
      localStorage.setItem('mol_admin','1');
      console.log('✅ 登录状态已保存');
    } else {
      sessionStorage.setItem('mol_admin_session','1');
      console.log('✅ 登录状态仅保存到会话');
    }
    initAdmin();
  } else {
    alert(T[state.lang].err); 
  }
}

function doLogout() { 
  state.auth=false;
  localStorage.removeItem('mol_admin');
  sessionStorage.removeItem('mol_admin_session');
  location.reload(); 
}

// 🛡️ 防止 label 点击事件冒泡导致的问题
function preventLabelJump(e) {
  e.stopPropagation();
}
function initAdmin() {
  const w=document.getElementById('admin-panel');
  const tokenConfig = document.getElementById('token-config');
  const authWrap = document.getElementById('auth-wrap');
  const tokenStatus = document.getElementById('token-status');
  
  console.log('🔧 initAdmin 调用 | Token:', state.ghToken ? '存在' : '不存在', '| Auth:', state.auth);
  
  if(state.ghToken) {
    // 已有 Token，隐藏输入框，显示状态
    if(tokenConfig) {
      tokenConfig.style.display = 'none';
      if(tokenStatus) tokenStatus.textContent = '✅ Token 已加载';
    }
  } else {
    // 没有 Token，显示输入框
    if(tokenConfig) tokenConfig.style.display = 'block';
  }
  
  if(state.auth){
    w.style.display='block';
    if(authWrap) authWrap.style.display='none';
    switchTab('upload');
  } else {
    w.style.display='none';
    if(authWrap) authWrap.style.display='block';
  }
}
function switchTab(t) {
  document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById(`tab-btn-${t}`)?.classList.add('active');
  document.getElementById(`tab-${t}`).classList.add('active');
  if(t==='upload'){state.mode='upload';state.editingId=null;resetForm();}
  if(t==='update'){state.mode='update';populateUpdateSelect();}
  if(t==='list')loadAdminList();
}
function populateUpdateSelect() {
  const s=document.getElementById('update-select'); s.innerHTML='<option value="">-- 请选择 --</option>';
  modsData.forEach(m=>s.innerHTML+=`<option value="${m.id}">${m.name} (v${m.version})</option>`);
  document.getElementById('update-form').style.opacity='0.6';document.getElementById('update-form').style.pointerEvents='none';document.getElementById('update-btn').disabled=true;state.editingId=null;
}
function loadModForUpdate(id) {
  const f=document.getElementById('update-form'),b=document.getElementById('update-btn');
  if(!id){f.style.opacity='0.6';f.style.pointerEvents='none';b.disabled=true;return;}
  const m=modsData.find(x=>x.id===id); if(!m)return;
  state.editingId=id; document.getElementById('edit-id').value=id;
  document.getElementById('u-name').value=m.name; document.getElementById('u-cat').value=m.game;
  document.getElementById('u-ver').value=m.version; document.getElementById('u-desc').value=m.desc;
  document.getElementById('u-lbl-icon').textContent=`当前: ${m.icon.split('/').pop()}`;
  document.getElementById('u-lbl-mod').textContent=`当前: ${m.file.split('/').pop()}`;
  document.getElementById('u-lbl-src').textContent=m.source?`当前: ${m.source.split('/').pop()}`:'无';
  f.style.opacity='1';f.style.pointerEvents='auto';b.disabled=false;state.mode='update';
}
function previewFile(i,l) { const lb=document.getElementById(l); lb.textContent=i.files?.length?`✅ ${i.files.length} 个`:'不替换'; }
function resetForm() { document.getElementById('mod-form').reset(); document.querySelectorAll('[id^=lbl-]').forEach(l=>l.textContent='选择文件'); }

async function handleFormSubmit(e) {
  e.preventDefault();
  e.stopPropagation(); // 防止事件冒泡
  if(state.isBusy)return alert('操作中...'); if(!state.ghToken)return alert(T[state.lang].token_req); if(state.mode==='update'&&!state.editingId)return alert(T[state.lang].please_select);
  state.isBusy=true; const bid=state.mode==='update'?'update-btn':'submit-btn', btn=document.getElementById(bid), orig=btn.textContent; btn.disabled=true;btn.textContent='⏳';
  try {
    const name=state.mode==='update'?document.getElementById('u-name').value:document.getElementById('f-name').value;
    const cat=state.mode==='update'?document.getElementById('u-cat').value:document.getElementById('f-cat').value;
    const ver=state.mode==='update'?document.getElementById('u-ver').value:document.getElementById('f-ver').value;
    const desc=state.mode==='update'?document.getElementById('u-desc').value:document.getElementById('f-desc').value;
    const iF=document.getElementById(state.mode==='update'?'u-icon':'f-icon').files[0];
    const mF=document.getElementById(state.mode==='update'?'u-mod':'f-mod').files[0];
    const sF=document.getElementById(state.mode==='update'?'u-src':'f-src').files[0];
    if(state.mode==='upload'&&(!iF||!mF)) throw new Error("必须选图标和Mod");

    const b64=f=>f?new Promise(r=>{const rd=new FileReader();rd.onload=()=>r(rd.result.split(',')[1]);rd.readAsDataURL(f);}):Promise.resolve(null);
    const [iB,mB,sB]=await Promise.all([b64(iF),b64(mF),sF?b64(sF):null]);

    let tgt=null, jc=[];
    try{const r=await ghGet('mods.json');jc=JSON.parse(base64ToUtf8(r.content));}catch(e){console.log('首次创建');}

    if(state.mode==='update'){
      const idx=jc.findIndex(m=>m.id===state.editingId); if(idx===-1)throw new Error('找不到原记录'); tgt=jc[idx];
      if(iB) await ghPut(tgt.icon,iB,`Upd icon`); if(mB) await ghPut(tgt.file,mB,`Upd mod`); if(sB) await ghPut(tgt.source,sB,`Upd src`);
      Object.assign(tgt,{name,game:cat,version:ver,desc}); jc[idx]=tgt;
    } else {
      const sf=name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g,'_');
      const p={icon:`mods/${sf}_${ver}_ic.${iF.name.split('.').pop()}`,mod:`mods/${sf}_${ver}.${mF.name.split('.').pop()}`,src:sF?`mods/${sf}_${ver}_src.${sF.name.split('.').pop()}`:null};
      await Promise.all([ghPut(p.icon,iB,'Add ic'),ghPut(p.mod,mB,'Add mod'),sB?ghPut(p.src,sB,'Add src'):null]);
      tgt={id:Date.now().toString(),name,game:cat,version:ver,icon:p.icon,file:p.mod,source:p.src,desc,screenshots:[]}; jc.push(tgt);
    }

    await ghPut('mods.json',utf8ToBase64(JSON.stringify(jc,null,2)),`${state.mode==='update'?'Upd':'Add'}: ${name}`);
    if(state.mode==='update'){const i=modsData.findIndex(m=>m.id===state.editingId);if(i!==-1)modsData[i]=tgt;} else modsData.push(tgt);
    renderCurrentPage(); resetForm(); populateUpdateSelect(); alert(T[state.lang].success);
  } catch(err){console.error(err);alert(T[state.lang].err+': '+err.message);}
  finally{state.isBusy=false;btn.disabled=false;btn.textContent=orig;}
}

async function deleteMod(id) {
  if(!confirm(T[state.lang].del_confirm)) return;
  const m = modsData.find(x => x.id === id); if(!m) return;
  state.isBusy = true;
  try {
    let jc = []; try { const r = await ghGet('mods.json'); jc = JSON.parse(base64ToUtf8(r.content)); } catch(e){}
    await ghPut('mods.json', utf8ToBase64(JSON.stringify(jc.filter(x => x.id !== id), null, 2)), `Del: ${m.name}`);
    const files = [m.icon, m.file, m.source].filter(Boolean);
    for(const fp of files) {
      try { const fData = await ghGet(fp); if(fData?.sha) {
        await fetch(`https://api.github.com/repos/${state.user}/${state.repo}/contents/${fp}`, {
          method: 'DELETE', headers: { 'Authorization': `Bearer ${state.ghToken}`, 'Accept': 'application/vnd.github.v3+json' },
          body: JSON.stringify({ message: `Del ${fp}`, sha: fData.sha })
        });
      }} catch(e) {}
    }
    modsData = modsData.filter(x => x.id !== id); loadAdminList(); renderCurrentPage(); alert('✅ 删除成功');
  } catch(e) { alert('❌ 失败: ' + e.message); } finally { state.isBusy = false; }
}

async function ghGet(p) {
  const r = await fetch(`https://api.github.com/repos/${state.user}/${state.repo}/contents/${p}?ref=${state.branch}&t=${Date.now()}`, { cache: 'no-store', headers: { 'Authorization': `Bearer ${state.ghToken}`, 'Accept': 'application/vnd.github.v3+json' } });
  if(!r.ok) throw new Error(`GET ${r.status}`);
  return await r.json();
}

async function ghPut(p, b64, msg='Update', retries=3) {
  if(!b64) return;
  for(let i=0; i<retries; i++) {
    let sha = null; try { sha = (await ghGet(p)).sha; } catch(e) {}
    const res = await fetch(`https://api.github.com/repos/${state.user}/${state.repo}/contents/${p}?ref=${state.branch}`, {
      method: 'PUT', headers: { 'Authorization': `Bearer ${state.ghToken}`, 'Accept': 'application/vnd.github.v3+json' },
      body: JSON.stringify({ message: msg, content: b64, ...(sha ? {sha} : {}) })
    });
    if(res.ok) return await res.json();
    const err = await res.json();
    if((err.message?.includes('expected') || err.message?.includes('match')) && i < retries-1) { await new Promise(r => setTimeout(r, 1000*(i+1))); continue; }
    throw err;
  }
}

function loadAdminList() {
  document.getElementById('mod-list').innerHTML = modsData.length ? modsData.map(m => `
    <div class="m-item" id="item-${m.id}"><img src="${m.icon}"><div class="m-info"><strong>${m.name}</strong><br><small>${m.game} | v${m.version}</small></div>
    <a href="${m.file}" download class="glass-btn" style="font-size:0.8rem;padding:6px 12px;">${T[state.lang].down}</a>
    <button class="del-btn" onclick="deleteMod('${m.id}')">${T[state.lang].del}</button></div>`).join('') : `<p style="text-align:center;opacity:0.6;padding:30px;">${T[state.lang].none}</p>`;
}