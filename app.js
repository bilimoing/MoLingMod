// 🔧 仓库配置
const state = {
  lang: localStorage.getItem('lang') || 'zh',
  auth: !!localStorage.getItem('mol_admin'),
  ghToken: localStorage.getItem('gh_token') || '',
  user: 'bilimoing',
  repo: 'MoLingMod',
  branch: 'master',
  mode: 'upload', editingId: null, isBusy: false
};

const T = {
  zh: { title:'末泠的Mod库', terraria:'泰拉瑞亚', stardew:'星露谷物语', minecraft:'我的世界', admin:'🔧 管理后台', back:'返回主页', login_t:'管理员登录', hint:'默认密码: admin123', login_b:'登录', cancel:'取消', logout:'退出', admin_t:'🔧 Mod 管理', upload:'📤 上传', update:'🔄 更新', manage:'📋 列表', name:'名称', cat:'分类', ver:'版本', icon:'图标', mod_file:'Mod文件', source_file:'源码', desc:'描述', submit_upload:'🚀 提交', submit_update:'🔄 更新', del:'删除', none:'📦 暂无Mod', down:'⬇️ 下载', success:'✅ 成功！', err:'❌ 失败', loading:'📡 加载中...', token_req:'请先保存 Token', del_confirm:'确定删除？', retrying:'⏳ 重试中...', please_select:'请先选择', no_desc: '暂无描述', debug_title: '🔍 调试面板', debug_load: '加载数据中...', debug_empty: '仓库无数据或网络错误', debug_mismatch: '分类不匹配，检查 mods.json 中的 game 字段' },
  en: { title:"Moling's Mods", terraria:'Terraria', stardew:'Stardew Valley', minecraft:'Minecraft', admin:'🔧 Admin', back:'Back', login_t:'Admin Login', hint:'Default: admin123', login_b:'Login', cancel:'Cancel', logout:'Logout', admin_t:'🔧 Mod Admin', upload:'📤 Upload', update:'🔄 Update', manage:'📋 List', name:'Name', cat:'Category', ver:'Version', icon:'Icon', mod_file:'Mod File', source_file:'Source', desc:'Description', submit_upload:'🚀 Submit', submit_update:'🔄 Update', del:'Delete', none:'📦 No mods', down:'⬇️ Download', success:'✅ Success!', err:'❌ Failed', loading:'📡 Loading...', token_req:'Save Token first', del_confirm:'Delete?', retrying:'⏳ Retrying...', please_select:'Select first', no_desc: 'No description', debug_title: '🔍 Debug', debug_load: 'Loading...', debug_empty: 'Repo empty or network error', debug_mismatch: 'Category mismatch. Check game field in mods.json' }
};

// 🛡️ Base64 工具（安全处理中文）
const utf8ToBase64 = str => btoa(new TextEncoder().encode(str).reduce((s,c)=>s+String.fromCharCode(c),''));
const base64ToUtf8 = b64 => new TextDecoder().decode(Uint8Array.from(atob(b64), c=>c.charCodeAt(0)));

document.addEventListener('DOMContentLoaded', async () => {
  applyLang(); initMusic();
  if(state.ghToken) document.getElementById('token-status').textContent = '✅ Token 已就绪';

  console.log('🚀 页面初始化');
  await loadMods();
  const page = document.body.dataset.page;
  console.log('📄 识别页面:', page);

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

// 📦 数据加载（带完整调试）
let modsData = [];
async function loadMods() {
  const grid = document.getElementById('mod-grid');
  if(grid) grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;opacity:0.6;">${T[state.lang].loading}</p>`;

  try {
    const url = `https://api.github.com/repos/${state.user}/${state.repo}/contents/mods.json?ref=${state.branch}&t=${Date.now()}`;
    console.log('🔗 请求:', url);
    const res = await fetch(url);

    if(res.status === 404) {
      console.warn('⚠️ 仓库无 mods.json');
      modsData = [];
      if(grid) grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;background:rgba(255,0,0,0.1);border-radius:12px;border:1px dashed rgba(255,0,0,0.3);">
        <h3>${T[state.lang].debug_title}</h3><p>${T[state.lang].debug_empty}</p>
        <p style="font-size:0.8rem;opacity:0.7;margin-top:8px;">请去后台上传第一个 Mod</p></div>`;
      return;
    }

    if(!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    if(!json.content) throw new Error('Invalid JSON structure');

    modsData = JSON.parse(base64ToUtf8(json.content));
    console.log('✅ 数据加载成功:', modsData);
    if(!modsData.length) console.warn('⚠️ mods.json 为空数组');
  } catch(e) {
    console.error('❌ 加载失败:', e);
    modsData = [];
    if(grid) grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;background:rgba(255,0,0,0.1);border-radius:12px;border:1px dashed rgba(255,0,0,0.3);">
      <h3>${T[state.lang].debug_title}</h3><p style="color:#ff6b6b;">${e.message}</p>
      <p style="font-size:0.8rem;opacity:0.7;margin-top:8px;">检查 Token 权限或网络连接</p></div>`;
  }
}

// 🖼️ 渲染游戏页（严格匹配 + 调试输出）
function renderGamePage(game) {
  const grid = document.getElementById('mod-grid');
  if(!grid) { console.error('❌ 页面缺少 #mod-grid'); return; }

  console.log(`🎨 渲染 ${game} | 当前数据量: ${modsData.length}`);
  console.log('📦 原始数据:', modsData);

  if(!modsData || !modsData.length) {
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;opacity:0.6;">📭 ${T[state.lang].none}</p>`;
    return;
  }

  const target = String(game).trim().toLowerCase();
  const list = modsData.filter(m => {
    const mGame = String(m.game || '').trim().toLowerCase();
    console.log(`🔍 比对: "${mGame}" === "${target}" ? ${mGame === target}`);
    return mGame === target;
  });

  console.log(`✅ 过滤结果: ${list.length} 个 Mod`);

  if(!list.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;background:rgba(255,165,0,0.1);border-radius:12px;border:1px dashed rgba(255,165,0,0.3);">
      <h3>${T[state.lang].debug_title}</h3><p>${T[state.lang].debug_mismatch}</p>
      <p style="font-size:0.8rem;opacity:0.7;margin-top:8px;">仓库中 game 字段值: ${modsData.map(m=>m.game).join(', ')}</p></div>`;
    return;
  }

  grid.innerHTML = list.map(m => `
    <div class="mod-card">
      <img src="${m.icon}" class="mod-img" onerror="this.style.background='#333'">
      <div class="mod-header"><h3 class="mod-name">${m.name}</h3><span class="mod-ver">v${m.version}</span></div>
      <p class="mod-desc">${m.desc || T[state.lang].no_desc}</p>
      <div class="mod-actions">
        <a href="${m.file}" download class="glass-btn">⬇️ 下载</a>
        ${m.source ? `<a href="${m.source}" download class="glass-btn" style="opacity:0.7">📦 源码</a>` : ''}
      </div>
    </div>`).join('');
}

// 🔑 后台逻辑
function saveToken() {
  const t=document.getElementById('gh-token').value.trim();
  if(t.startsWith('github_pat_')) { localStorage.setItem('gh_token',t); state.ghToken=t; document.getElementById('token-status').textContent='✅ 已保存'; document.getElementById('token-config').style.display='none'; document.getElementById('auth-wrap').style.display='block'; }
  else alert('Token 格式错误');
}
function doLogin() { if(document.getElementById('admin-pass').value==='admin123'){state.auth=true;localStorage.setItem('mol_admin','1');initAdmin();} else alert(T[state.lang].err); }
function doLogout() { state.auth=false;localStorage.removeItem('mol_admin');location.reload(); }
function initAdmin() {
  const w=document.getElementById('admin-panel');
  if(state.auth){w.style.display='block';document.getElementById('auth-wrap').style.display='none';switchTab('upload');}
  else{w.style.display='none';document.getElementById('auth-wrap').style.display='block';}
  if(!state.ghToken){document.getElementById('token-config').style.display='block';document.getElementById('auth-wrap').style.display='none';}
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

// 🚀 提交处理
async function handleFormSubmit(e) {
  e.preventDefault(); if(state.isBusy)return alert('操作中...'); if(!state.ghToken)return alert(T[state.lang].token_req); if(state.mode==='update'&&!state.editingId)return alert(T[state.lang].please_select);
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
    try{const r=await ghGet('mods.json');jc=JSON.parse(base64ToUtf8(r.content));}catch(e){console.log('首次创建 mods.json');}

    if(state.mode==='update'){
      const idx=jc.findIndex(m=>m.id===state.editingId); if(idx===-1)throw new Error('找不到原记录'); tgt=jc[idx];
      if(iB) await ghPut(tgt.icon,iB,`Upd icon`);
      if(mB) await ghPut(tgt.file,mB,`Upd mod`);
      if(sB) await ghPut(tgt.source,sB,`Upd src`);
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

// 🗑️ 删除修复版（彻底解决 sha 报错）
async function deleteMod(id) {
  if(!confirm(T[state.lang].del_confirm)) return;
  const m = modsData.find(x => x.id === id);
  if(!m) return alert('找不到该 Mod');

  state.isBusy = true;
  try {
    // 1. 更新 mods.json
    let jc = [];
    try { const r = await ghGet('mods.json'); jc = JSON.parse(base64ToUtf8(r.content)); } catch(e){}
    const newJc = jc.filter(x => x.id !== id);
    await ghPut('mods.json', utf8ToBase64(JSON.stringify(newJc, null, 2)), `Del: ${m.name}`);

    // 2. 删除仓库文件（安全获取 SHA）
    const files = [m.icon, m.file, m.source].filter(Boolean);
    for(const fp of files) {
      try {
        const fData = await ghGet(fp);
        const sha = fData?.sha;
        if(!sha) { console.warn(`⚠️ ${fp} 无 SHA，跳过删除`); continue; }
        await fetch(`https://api.github.com/repos/${state.user}/${state.repo}/contents/${fp}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${state.ghToken}`, 'Accept': 'application/vnd.github.v3+json' },
          body: JSON.stringify({ message: `Delete ${fp}`, sha: sha })
        });
      } catch(e) { console.warn(`删除文件 ${fp} 失败:`, e); }
    }

    // 3. 更新本地状态
    modsData = modsData.filter(x => x.id !== id);
    loadAdminList();
    renderCurrentPage();
    alert('✅ 删除成功！');
  } catch(e) {
    console.error(e);
    alert('❌ 删除失败: ' + e.message);
  } finally {
    state.isBusy = false;
  }
}

// 🛡️ API 封装
async function ghGet(p) {
  const r = await fetch(`https://api.github.com/repos/${state.user}/${state.repo}/contents/${p}?ref=${state.branch}&t=${Date.now()}`, {
    headers: { 'Authorization': `Bearer ${state.ghToken}`, 'Accept': 'application/vnd.github.v3+json' }
  });
  if(!r.ok) throw new Error(`GET ${p} 失败: ${r.status}`);
  return await r.json();
}

async function ghPut(p, b64, msg='Update', retries=3) {
  if(!b64) return;
  for(let i=0; i<retries; i++) {
    let sha = null;
    try { const f = await ghGet(p); sha = f.sha; } catch(e) {}

    const res = await fetch(`https://api.github.com/repos/${state.user}/${state.repo}/contents/${p}?ref=${state.branch}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${state.ghToken}`, 'Accept': 'application/vnd.github.v3+json' },
      body: JSON.stringify({ message: msg, content: b64, ...(sha ? {sha} : {}) })
    });

    if(res.ok) return await res.json();
    const err = await res.json();
    const isConflict = err.message?.includes('expected') || err.message?.includes('match');
    if(isConflict && i < retries-1) {
      console.warn(`⏳ SHA 冲突，重试 ${i+1}...`);
      await new Promise(r => setTimeout(r, 1000*(i+1)));
      continue;
    }
    throw err;
  }
}

function loadAdminList() {
  document.getElementById('mod-list').innerHTML = modsData.length ? modsData.map(m => `
    <div class="m-item" id="item-${m.id}"><img src="${m.icon}"><div class="m-info"><strong>${m.name}</strong><br><small>${m.game} | v${m.version}</small></div>
    <a href="${m.file}" download class="glass-btn" style="font-size:0.8rem;padding:6px 12px;">${T[state.lang].down}</a>
    <button class="del-btn" onclick="deleteMod('${m.id}')">${T[state.lang].del}</button></div>`).join('') : `<p style="text-align:center;opacity:0.6;padding:30px;">${T[state.lang].none}</p>`;
}