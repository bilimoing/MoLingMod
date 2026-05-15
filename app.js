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

console.log('Token 状态:', state.ghToken ? '已加载 (' + state.ghToken.substring(0, 20) + '...)' : '未设置');
console.log('登录状态:', state.auth ? '已登录' : '未登录');

const T = {
  zh: { 
    title:'末泠的Mod库', 
    terraria:'泰拉瑞亚', 
    stardew:'星露谷物语', 
    minecraft:'我的世界', 
    admin:'管理后台', 
    back:'返回主页', 
    login_t:'管理员登录', 
    hint:'默认密码: admin123', 
    login_b:'登录', 
    cancel:'取消', 
    logout:'退出', 
    admin_t:'Mod 管理', 
    upload:'上传', 
    update:'更新', 
    manage:'列表', 
    name:'名称', 
    cat:'分类', 
    ver:'版本', 
    icon:'图标', 
    mod_file:'Mod文件', 
    source_file:'源码', 
    desc:'描述', 
    submit_upload:'提交', 
    submit_update:'更新', 
    del:'删除', 
    none:'暂无Mod', 
    down:'下载Mod', 
    success:'成功！', 
    err:'失败', 
    loading:'加载中...', 
    token_req:'请先保存 Token', 
    del_confirm:'确定删除？', 
    retrying:'重试中...', 
    please_select:'请先选择', 
    no_desc: '暂无描述', 
    detail:'查看详情', 
    screenshots:'预览图', 
    tags:'标签', 
    add_tag:'添加标签', 
    preset_tags:'预制标签', 
    manual_tag:'手动输入', 
    mod_detail:'Mod 详情', 
    source:'下载源码',
    search_placeholder: '搜索 Mod 名称、描述或标签...',
    search_results: '找到',
    search_no_results: '未找到匹配的 Mod',
    search_empty: '没有找到匹配的 Mod',
    token_needed: '需要 GitHub Token 才能查看 Mod',
    save_token: '保存',
    remember_me: '记住我',
    github_status_connecting: '📡 正在连接 GitHub...',
    github_status_synced: '数据已同步',
    github_status_no_file: '仓库无 mods.json',
    github_status_access_denied: '访问被拒绝，请在后台输入 Token',
    github_status_network_error: '网络错误',
    github_status_category_mismatch: '分类不匹配',
    github_status_no_mods: '当前分类无 Mod',
    github_status_no_data: '📡 暂无数据',
    token_saved_reloading: 'Token 已保存，重新加载中...',
    token_format_error: 'Token 格式错误，必须以 github_pat_ 开头',
    select_mod_to_update: '-- 请选择 --',
    replace_icon: '替换图标 (留空保留)',
    replace_mod_file: '替换Mod文件 (留空保留)',
    replace_source: '替换源代码 (留空保留)',
    update_desc: '更新描述',
    submit_update_btn: '提交更新',
    current: '当前',
    no_replace: '不替换',
    files_selected: '已选择',
    max_screenshots: '最多只能上传8个预览文件！',
    tag_exists: '标签已存在！',
    must_select_icon_mod: '必须选图标和Mod',
    record_not_found: '找不到原记录',
    delete_old_failed: '删除旧文件失败',
    first_create: '首次创建',
    play_pause_music: '播放/暂停音乐'
  },
  en: { 
    title:"Moling's Mods", 
    terraria:'Terraria', 
    stardew:'Stardew Valley', 
    minecraft:'Minecraft', 
    admin:'Admin', 
    back:'Back', 
    login_t:'Admin Login', 
    hint:'Default: admin123', 
    login_b:'Login', 
    cancel:'Cancel', 
    logout:'Logout', 
    admin_t:'Mod Admin', 
    upload:'Upload', 
    update:'Update', 
    manage:'List', 
    name:'Name', 
    cat:'Category', 
    ver:'Version', 
    icon:'Icon', 
    mod_file:'Mod File', 
    source_file:'Source', 
    desc:'Description', 
    submit_upload:'Submit', 
    submit_update:'Update', 
    del:'Delete', 
    none:'No mods', 
    down:'Download Mod', 
    success:'Success!', 
    err:'Failed', 
    loading:'Loading...', 
    token_req:'Save Token first', 
    del_confirm:'Delete?', 
    retrying:'Retrying...', 
    please_select:'Select first', 
    no_desc: 'No description', 
    detail:'View Details', 
    screenshots:'Screenshots', 
    tags:'Tags', 
    add_tag:'Add Tag', 
    preset_tags:'Preset Tags', 
    manual_tag:'Manual Input', 
    mod_detail:'Mod Details', 
    source:'Download Source',
    search_placeholder: 'Search mod name, description or tags...',
    search_results: 'Found',
    search_no_results: 'No matching mods found',
    search_empty: 'No matching mods found',
    token_needed: 'GitHub Token required to view mods',
    save_token: 'Save',
    remember_me: 'Remember me',
    github_status_connecting: '📡 Connecting to GitHub...',
    github_status_synced: 'Data synced',
    github_status_no_file: 'No mods.json in repository',
    github_status_access_denied: 'Access denied, please enter Token in admin panel',
    github_status_network_error: 'Network error',
    github_status_category_mismatch: 'Category mismatch',
    github_status_no_mods: 'No mods in this category',
    github_status_no_data: '📡 No data',
    token_saved_reloading: 'Token saved, reloading...',
    token_format_error: 'Invalid token format, must start with github_pat_',
    select_mod_to_update: '-- Select --',
    replace_icon: 'Replace icon (leave empty to keep)',
    replace_mod_file: 'Replace mod file (leave empty to keep)',
    replace_source: 'Replace source (leave empty to keep)',
    update_desc: 'Update description',
    submit_update_btn: 'Submit Update',
    current: 'Current',
    no_replace: 'No replace',
    files_selected: 'Selected',
    max_screenshots: 'Maximum 8 screenshots allowed!',
    tag_exists: 'Tag already exists!',
    must_select_icon_mod: 'Must select icon and mod file',
    record_not_found: 'Original record not found',
    delete_old_failed: 'Failed to delete old file',
    first_create: 'First creation',
    play_pause_music: 'Play/Pause Music'
  }
};

const utf8ToBase64 = str => btoa(new TextEncoder().encode(str).reduce((s,c)=>s+String.fromCharCode(c),''));
const base64ToUtf8 = b64 => new TextDecoder().decode(Uint8Array.from(atob(b64), c=>c.charCodeAt(0)));

// 🏷️ 预制标签
const PRESET_TAGS = {
  zh: ['新增内容', '实用辅助', '模组类库', '体验优化', '游戏调整', '视效调整', '音效调整', '地图生成', '翻译'],
  en: ['New Content', 'Utility', 'Mod Library', 'Experience', 'Game Balance', 'Visual', 'Audio', 'Map Gen', 'Translation']
};

// 🖥️ UI 状态提示
function setStatus(msg, color='#ff9f43') {
  const el = document.getElementById('debug-status');
  if(el) { el.textContent = msg; el.style.color = color; }
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM 加载完成');
  
  applyLang(); initMusic(); init3DTilt();
  if(state.ghToken) document.getElementById('token-status').textContent = 'Token 已就绪';

  console.log('初始化开始');
  setStatus('📡 正在连接 GitHub...', '#4ade80');

  console.log('即将调用 loadMods...');
  await loadMods();
  console.log('loadMods 执行完毕, modsData.length =', modsData.length);

  const page = document.body.dataset.page;
  console.log('识别页面:', page);

  if (['terraria','stardew','minecraft'].includes(page)) {
    console.log('准备渲染游戏页面:', page);
    renderGamePage(page);
  }
  if (page === 'admin') initAdmin();
});

function setLang(l) { state.lang=l; localStorage.setItem('lang',l); applyLang(); renderCurrentPage(); renderPresetTags(); }
function applyLang() {
  // 更新文本内容
  document.querySelectorAll('[data-i18n]').forEach(e => e.textContent = T[state.lang][e.dataset.i18n] || e.textContent);
  // 更新 placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(e => e.placeholder = T[state.lang][e.dataset.i18nPlaceholder] || e.placeholder);
  // 更新语言按钮状态
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

//  3D 微倾斜视差效果
function init3DTilt() {
  const cards = document.querySelectorAll('.big-btn');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
  });

  // 🎯 标题3D视角偏转 + 浮空呼吸效果
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    let breathPhase = 0;
    const breathSpeed = 0.02; // 呼吸速度
    const breathAmplitude = 15; // 呼吸幅度（像素）
    
    // 启动呼吸动画
    function animateBreath() {
      breathPhase += breathSpeed;
      const breathOffset = Math.sin(breathPhase) * breathAmplitude;
      
      // 获取当前的旋转角度（如果有鼠标移动）
      const currentTransform = heroTitle.style.transform;
      const match = currentTransform.match(/rotateX\([^)]+\) rotateY\([^)]+\)/);
      const rotation = match ? match[0] : 'rotateX(0deg) rotateY(0deg)';
      
      // 应用浮空 + 旋转
      heroTitle.style.transform = `translateY(${-breathOffset}px) translateZ(20px) ${rotation}`;
      
      requestAnimationFrame(animateBreath);
    }
    
    animateBreath();
    
    // 鼠标移动时添加3D偏转
    document.addEventListener('mousemove', (e) => {
      const { innerWidth, innerHeight } = window;
      const x = e.clientX;
      const y = e.clientY;
      
      // 计算鼠标相对于屏幕中心的位置（-1 到 1）
      const xPos = (x / innerWidth - 0.5) * 2;
      const yPos = (y / innerHeight - 0.5) * 2;
      
      // 极轻微的旋转角度（最大 ±3 度）
      const rotateY = xPos * 3;
      const rotateX = -yPos * 3;
      
      // 获取当前的浮空位置
      const currentTransform = heroTitle.style.transform;
      const translateYMatch = currentTransform.match(/translateY\([^)]+\)/);
      const translateY = translateYMatch ? translateYMatch[0] : 'translateY(0px)';
      
      // 应用变换
      heroTitle.style.transform = `${translateY} translateZ(20px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    // 鼠标离开窗口时复位旋转
    document.addEventListener('mouseleave', () => {
      const currentTransform = heroTitle.style.transform;
      const translateYMatch = currentTransform.match(/translateY\([^)]+\)/);
      const translateY = translateYMatch ? translateYMatch[0] : 'translateY(0px)';
      
      heroTitle.style.transform = `${translateY} translateZ(20px) rotateX(0deg) rotateY(0deg)`;
    });
  }
}

let modsData = [];
let currentGamePage = ''; // 记录当前游戏页面
let allFilteredMods = []; // 存储当前筛选后的所有mod
async function loadMods() {
  try {
    console.log('开始加载 mods.json...');
    
    // 🚀 使用 jsDelivr CDN 加载 mods.json（解决 GitHub Pages 跨域问题）
    const cdnUrl = `https://cdn.jsdelivr.net/gh/${state.user}/${state.repo}@${state.branch}/mods.json?t=${Date.now()}`;
    
    console.log('尝试加载文件:', cdnUrl);
    const res = await fetch(cdnUrl, { cache: 'no-store' });
    console.log('响应状态:', res.status);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    
    const json = await res.json();
    console.log('返回数据类型:', typeof json, '是否为数组:', Array.isArray(json));
    
    modsData = Array.isArray(json) ? json : [];
    
    console.log('✅ 最终 modsData.length =', modsData.length);
    if (modsData.length > 0) {
      console.log('📦 Mod 列表:', modsData.map(m => `${m.name} (${m.game})`).join(', '));
    }
    setStatus(T[state.lang].github_status_synced, '#4ade80');
    setTimeout(() => setStatus(''), 2000);
  } catch(e) {
    console.error('❌ 加载失败:', e);
    setStatus(`${T[state.lang].github_status_network_error}: ${e.message}`, '#ff4757');
    document.getElementById('debug-status').style.cursor = 'pointer';
    document.getElementById('debug-status').onclick = () => location.reload();
    modsData = [];
  }
}

function renderGamePage(game) {
  const grid = document.getElementById('mod-grid');
  if(!grid) { setStatus('页面缺少 #mod-grid', '#ff4757'); return; }

  currentGamePage = game; // 保存当前页面

  const catMap = {
    '泰拉瑞亚': 'terraria', 'terraria': 'terraria', '泰拉': 'terraria',
    '星露谷物语': 'stardew', 'stardew': 'stardew', '星露谷': 'stardew',
    '我的世界': 'minecraft', 'minecraft': 'minecraft', 'mc': 'minecraft', 'MC': 'minecraft'
  };

  console.log(`渲染 ${game} | 数据量: ${modsData.length}`);
  console.log('所有mod数据:', modsData);

  if(!modsData?.length) {
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;opacity:0.6;">${T[state.lang].github_status_no_data}</p>`;
    return;
  }

  const target = String(game).trim().toLowerCase();
  console.log('目标分类:', target);
  
  allFilteredMods = modsData.filter(m => {
    const raw = String(m.game || '').trim();
    const mapped = (catMap[raw] || raw).toLowerCase();
    console.log(`检查mod "${m.name}": game="${raw}" -> mapped="${mapped}" -> 匹配=${mapped === target}`);
    return mapped === target;
  });
  
  console.log('筛选结果:', allFilteredMods);

  if(!allFilteredMods.length) {
    const allCats = [...new Set(modsData.map(m => m.game))].join(', ');
    setStatus(`${T[state.lang].github_status_category_mismatch}: ${state.lang === 'zh' ? '页面' : 'Page'}="${game}" | ${state.lang === 'zh' ? '仓库' : 'Repo'}="${allCats}"`, '#ff9f43');
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;opacity:0.6;">${T[state.lang].github_status_no_mods}</p>`;
    return;
  }

  setStatus('');
  
  // 清空搜索栏
  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');
  const searchInfo = document.getElementById('search-info');
  if (searchInput) searchInput.value = '';
  if (searchClear) searchClear.classList.remove('visible');
  if (searchInfo) searchInfo.textContent = '';
  
  renderModList(allFilteredMods);
}

// 🔍 搜索功能
function handleSearch(keyword) {
  const searchClear = document.getElementById('search-clear');
  const searchInfo = document.getElementById('search-info');
  
  if (!keyword || keyword.trim() === '') {
    // 清空搜索，显示全部
    if (searchClear) searchClear.classList.remove('visible');
    if (searchInfo) searchInfo.textContent = '';
    renderModList(allFilteredMods);
    return;
  }
  
  // 显示清除按钮
  if (searchClear) searchClear.classList.add('visible');
  
  const lowerKeyword = keyword.toLowerCase().trim();
  
  // 搜索匹配：名称、描述、标签
  const searchedMods = allFilteredMods.filter(m => {
    const nameMatch = m.name && m.name.toLowerCase().includes(lowerKeyword);
    const descMatch = m.desc && m.desc.toLowerCase().includes(lowerKeyword);
    const tagMatch = m.tags && m.tags.some(tag => tag.toLowerCase().includes(lowerKeyword));
    return nameMatch || descMatch || tagMatch;
  });
  
  // 显示搜索结果信息
  if (searchInfo) {
    if (searchedMods.length === 0) {
      searchInfo.textContent = T[state.lang].search_no_results;
    } else {
      searchInfo.textContent = `${T[state.lang].search_results} ${searchedMods.length} ${state.lang === 'zh' ? '个 Mod' : 'mods'}`;
    }
  }
  
  renderModList(searchedMods);
}

function clearSearch() {
  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');
  const searchInfo = document.getElementById('search-info');
  
  if (searchInput) searchInput.value = '';
  if (searchClear) searchClear.classList.remove('visible');
  if (searchInfo) searchInfo.textContent = '';
  
  renderModList(allFilteredMods);
}

// 渲染 Mod 列表（抽取为独立函数）
function renderModList(modList) {
  const grid = document.getElementById('mod-grid');
  if (!grid) return;
  
  if (!modList || modList.length === 0) {
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;opacity:0.6;padding:40px;">😕 ${T[state.lang].search_empty}</p>`;
    return;
  }
  
  // 🚀 使用 GitHub Pages 路径或 jsDelivr CDN
  const useCDN = true; // 设置为 false 则使用 GitHub Pages 路径
  const baseUrl = useCDN 
    ? `https://cdn.jsdelivr.net/gh/${state.user}/${state.repo}@${state.branch}/`
    : (window.location.pathname.includes('/MoLingMod/') ? '/MoLingMod/' : '/');
  
  grid.innerHTML = modList.map(m => {
    const iconUrl = m.icon.startsWith('http') ? m.icon : baseUrl + m.icon;
    const fileUrl = m.file.startsWith('http') ? m.file : baseUrl + m.file;
    const sourceUrl = m.source && !m.source.startsWith('http') ? baseUrl + m.source : m.source;
    const tagsHtml = (m.tags || []).map(t => `<span class="mod-tag">${t}</span>`).join('');
    
    return `
    <div class="mod-card" onclick="showModDetail('${m.id}')" style="cursor:pointer;">
      <img src="${iconUrl}" class="mod-img" onerror="this.style.background='#333'" alt="">
      <div class="mod-header"><h3 class="mod-name">${m.name}</h3><span class="mod-ver">v${m.version}</span></div>
      ${tagsHtml ? `<div class="mod-tags">${tagsHtml}</div>` : ''}
      <div class="mod-actions">
        <a href="${fileUrl}" download class="glass-btn" onclick="event.stopPropagation()">${T[state.lang].down}</a>
        ${m.source && state.auth ? `<a href="${sourceUrl}" download class="glass-btn" style="opacity:0.7" onclick="event.stopPropagation()">${T[state.lang].source}</a>` : ''}
        <button class="glass-btn" style="opacity:0.8" onclick="event.stopPropagation();showModDetail('${m.id}')">${T[state.lang].detail}</button>
      </div>
    </div>`;
  }).join('');
}

// 📄 显示 Mod 详情页
function showModDetail(id) {
  const m = modsData.find(x => x.id === id);
  if (!m) return;
  
  // 🚀 使用 GitHub Pages 路径或 jsDelivr CDN
  const useCDN = true; // 设置为 false 则使用 GitHub Pages 路径
  const baseUrl = useCDN 
    ? `https://cdn.jsdelivr.net/gh/${state.user}/${state.repo}@${state.branch}/`
    : (window.location.pathname.includes('/MoLingMod/') ? '/MoLingMod/' : '/');
  
  const fileUrl = m.file.startsWith('http') ? m.file : baseUrl + m.file;
  const sourceUrl = m.source && !m.source.startsWith('http') ? baseUrl + m.source : m.source;
  
  const tagsHtml = (m.tags || []).map(t => `<span class="modal-tag">${t}</span>`).join('');
  
  let screenshotsHtml = '';
  if (m.screenshots && m.screenshots.length > 0) {
    const ssItems = m.screenshots.map(s => {
      const url = s.startsWith('http') ? s : baseUrl + s;
      const isVideo = s.match(/\.(mp4|webm|ogg)$/i);
      if (isVideo) {
        return `<video class="screenshot-item" src="${url}" onclick="openLightbox('${url}', 'video')"></video>`;
      } else {
        return `<img class="screenshot-item" src="${url}" onclick="openLightbox('${url}', 'image')" alt="">`;
      }
    }).join('');
    screenshotsHtml = `
      <h4 class="modal-screenshots-title">${T[state.lang].screenshots}</h4>
      <div class="screenshot-grid">${ssItems}</div>
    `;
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
      <h2 class="modal-title">${m.name}</h2>
      <div class="modal-version"><span class="mod-ver">v${m.version}</span></div>
      ${tagsHtml ? `<div class="modal-tags">${tagsHtml}</div>` : ''}
      <div class="modal-desc">${m.desc || T[state.lang].no_desc}</div>
      ${screenshotsHtml}
      <div class="modal-actions">
        <a href="${fileUrl}" download class="glass-btn">${T[state.lang].down}</a>
        ${m.source && state.auth ? `<a href="${sourceUrl}" download class="glass-btn" style="opacity:0.8">${T[state.lang].source}</a>` : ''}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// 🖼️ 灯箱放大功能
function openLightbox(url, type) {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox-overlay';
  lightbox.onclick = (e) => { if (e.target === lightbox) lightbox.remove(); };
  
  let content = '';
  if (type === 'video') {
    content = `<video class="lightbox-content" controls autoplay src="${url}"></video>`;
  } else {
    content = `<img class="lightbox-content" src="${url}">`;
  }
  
  lightbox.innerHTML = `
    <button class="lightbox-close" onclick="this.closest('.lightbox-overlay').remove()">✕</button>
    ${content}
  `;
  document.body.appendChild(lightbox);
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
  
  console.log('尝试保存 Token:', t.substring(0, 20) + '...');
  console.log('记住 Token:', rememberToken ? '是' : '否');
  
  if(t.startsWith('github_pat_')) { 
    const encrypted = encode(t);
    if(rememberToken) {
      localStorage.setItem('gh_token_enc', encrypted); 
      console.log('Token 已加密保存到 localStorage');
    } else {
      // 不记住，只保存在内存中
      sessionStorage.setItem('gh_token_session_enc', encrypted);
      console.log('Token 仅加密保存到会话（关闭浏览器后失效）');
    }
    state.ghToken=t; 
    document.getElementById('token-status').textContent='已保存';
    document.getElementById('token-config').style.display='none'; 
    document.getElementById('auth-wrap').style.display='block'; 
  } else {
    console.log('Token 格式错误');
    alert('Token 格式错误');
  }
}

function doLogin() { 
  const pass = document.getElementById('admin-pass').value;
  const rememberPass = document.getElementById('remember-pass')?.checked;
  
  console.log('尝试登录 | 记住密码:', rememberPass ? '是' : '否');
  
  if(pass==='admin123') {
    state.auth=true;
    if(rememberPass) {
      localStorage.setItem('mol_admin','1');
      console.log('登录状态已保存');
    } else {
      sessionStorage.setItem('mol_admin_session','1');
      console.log('登录状态仅保存到会话');
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
      if(tokenStatus) tokenStatus.textContent = 'Token 已加载';
    }
  } else {
    // 没有 Token，显示输入框
    if(tokenConfig) tokenConfig.style.display = 'block';
  }
  
  if(state.auth){
    w.style.display='block';
    if(authWrap) authWrap.style.display='none';
    switchTab('upload');
    renderPresetTags(); // 初始化预制标签
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
function previewFile(i,l) { const lb=document.getElementById(l); lb.textContent=i.files?.length?` ${i.files.length} 个`:'不替换'; }
function resetForm() { 
  document.getElementById('mod-form').reset(); 
  document.querySelectorAll('[id^=lbl-]').forEach(l=>l.textContent='选择文件');
  document.getElementById('screenshot-preview').innerHTML = '';
  document.getElementById('selected-tags').innerHTML = '';
  window._selectedTags = [];
  renderPresetTags();
}

// 🖼️ 预览截图
let _screenshotFiles = [];
function previewScreenshots(input) {
  const preview = document.getElementById('screenshot-preview');
  const lbl = document.getElementById('lbl-screenshots');
  
  if (input.files && input.files.length > 0) {
    const newFiles = Array.from(input.files);
    const totalFiles = _screenshotFiles.length + newFiles.length;
    
    if (totalFiles > 8) {
      alert('最多只能上传8个预览文件！');
      input.value = '';
      return;
    }
    
    _screenshotFiles = _screenshotFiles.concat(newFiles);
    lbl.textContent = `已选择 ${_screenshotFiles.length} 个文件`;
    
    preview.innerHTML = '';
    _screenshotFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const div = document.createElement('div');
        div.style.position = 'relative';
        div.style.display = 'inline-block';
        
        if (file.type.startsWith('video/')) {
          div.innerHTML = `
            <video class="screenshot-thumb" src="${e.target.result}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;"></video>
            <button class="screenshot-remove" onclick="removeScreenshot(${index})">✕</button>
          `;
        } else {
          div.innerHTML = `
            <img class="screenshot-thumb" src="${e.target.result}">
            <button class="screenshot-remove" onclick="removeScreenshot(${index})">✕</button>
          `;
        }
        preview.appendChild(div);
      };
      reader.readAsDataURL(file);
    });
  }
}

function removeScreenshot(index) {
  _screenshotFiles.splice(index, 1);
  const input = document.getElementById('f-screenshots');
  const lbl = document.getElementById('lbl-screenshots');
  lbl.textContent = _screenshotFiles.length > 0 ? `已选择 ${_screenshotFiles.length} 个文件` : '选择文件';
  
  const preview = document.getElementById('screenshot-preview');
  preview.innerHTML = '';
  _screenshotFiles.forEach((file, i) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement('div');
      div.style.position = 'relative';
      div.style.display = 'inline-block';
      if (file.type.startsWith('video/')) {
        div.innerHTML = `<video class="screenshot-thumb" src="${e.target.result}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;"></video><button class="screenshot-remove" onclick="removeScreenshot(${i})">✕</button>`;
      } else {
        div.innerHTML = `<img class="screenshot-thumb" src="${e.target.result}"><button class="screenshot-remove" onclick="removeScreenshot(${i})">✕</button>`;
      }
      preview.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
}

// 🏷️ 标签管理
let _selectedTags = [];

function renderPresetTags() {
  const container = document.getElementById('preset-tags');
  if (!container) return;
  
  const tags = PRESET_TAGS[state.lang] || PRESET_TAGS.zh;
  container.innerHTML = tags.map(tag => 
    `<div class="tag-option ${_selectedTags.includes(tag) ? 'selected' : ''}" onclick="toggleTag('${tag}')">${tag}</div>`
  ).join('');
}

function toggleTag(tag) {
  const index = _selectedTags.indexOf(tag);
  if (index > -1) {
    _selectedTags.splice(index, 1);
  } else {
    _selectedTags.push(tag);
  }
  renderPresetTags();
  renderSelectedTags();
}

function addManualTag() {
  const input = document.getElementById('manual-tag');
  const tag = input.value.trim();
  
  if (!tag) return;
  if (_selectedTags.includes(tag)) {
    alert('标签已存在！');
    return;
  }
  
  _selectedTags.push(tag);
  input.value = '';
  renderSelectedTags();
  renderPresetTags();
}

function removeTag(tag) {
  _selectedTags = _selectedTags.filter(t => t !== tag);
  renderSelectedTags();
  renderPresetTags();
}

function renderSelectedTags() {
  const container = document.getElementById('selected-tags');
  if (!container) return;
  
  container.innerHTML = _selectedTags.map(tag => 
    `<div class="selected-tag">${tag}<button onclick="removeTag('${tag}')">✕</button></div>`
  ).join('');
}

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
      const idx=jc.findIndex(m=>m.id===state.editingId); if(idx===-1)throw new Error('找不到原记录'); 
      const oldTgt = jc[idx];
      
      // 只删除被替换的旧文件
      if(iB) {
        try { 
          const fData = await ghGet(oldTgt.icon); 
          if(fData?.sha) {
            await fetch(`https://api.github.com/repos/${state.user}/${state.repo}/contents/${oldTgt.icon}`, {
              method: 'DELETE', 
              headers: { 'Authorization': `Bearer ${state.ghToken}`, 'Accept': 'application/vnd.github.v3+json' },
              body: JSON.stringify({ message: `Del old icon`, sha: fData.sha })
            });
          }
        } catch(e) { console.log('删除旧图标失败:', e); }
      }
      
      if(mB) {
        try { 
          const fData = await ghGet(oldTgt.file); 
          if(fData?.sha) {
            await fetch(`https://api.github.com/repos/${state.user}/${state.repo}/contents/${oldTgt.file}`, {
              method: 'DELETE', 
              headers: { 'Authorization': `Bearer ${state.ghToken}`, 'Accept': 'application/vnd.github.v3+json' },
              body: JSON.stringify({ message: `Del old mod`, sha: fData.sha })
            });
          }
        } catch(e) { console.log('删除旧Mod失败:', e); }
      }
      
      if(sB && oldTgt.source) {
        try { 
          const fData = await ghGet(oldTgt.source); 
          if(fData?.sha) {
            await fetch(`https://api.github.com/repos/${state.user}/${state.repo}/contents/${oldTgt.source}`, {
              method: 'DELETE', 
              headers: { 'Authorization': `Bearer ${state.ghToken}`, 'Accept': 'application/vnd.github.v3+json' },
              body: JSON.stringify({ message: `Del old source`, sha: fData.sha })
            });
          }
        } catch(e) { console.log('删除旧源码失败:', e); }
      }
      
      // 如果上传了新预览图，删除旧的
      if (_screenshotFiles.length > 0 && oldTgt.screenshots && oldTgt.screenshots.length > 0) {
        for(const ss of oldTgt.screenshots) {
          try {
            const fData = await ghGet(ss);
            if(fData?.sha) {
              await fetch(`https://api.github.com/repos/${state.user}/${state.repo}/contents/${ss}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${state.ghToken}`, 'Accept': 'application/vnd.github.v3+json' },
                body: JSON.stringify({ message: `Del old screenshot`, sha: fData.sha })
              });
            }
          } catch(e) { console.log('删除旧预览图失败:', e); }
        }
      }
      
      // 构建新文件路径
      tgt={...oldTgt};
      const sf=name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g,'_');
      const p={
        icon: iB ? `mods/${sf}_${ver}_ic.${iF.name.split('.').pop()}` : oldTgt.icon,
        mod: mB ? `mods/${sf}_${ver}.${mF.name.split('.').pop()}` : oldTgt.file,
        src: sB ? `mods/${sf}_${ver}_src.${sF.name.split('.').pop()}` : (oldTgt.source || null)
      };
      
      // 上传新预览图
      const screenshotPaths = [];
      for (let i = 0; i < _screenshotFiles.length; i++) {
        const ssFile = _screenshotFiles[i];
        const ext = ssFile.name.split('.').pop();
        const ssPath = `mods/${sf}_${ver}_ss${i+1}.${ext}`;
        const ssB64 = await b64(ssFile);
        await ghPut(ssPath, ssB64, `Add screenshot ${i+1}`);
        screenshotPaths.push(ssPath);
      }
      
      // 上传被替换的文件
      if(iB) await ghPut(p.icon,iB,'Upd icon'); 
      if(mB) await ghPut(p.mod,mB,'Upd mod'); 
      if(sB && p.src) await ghPut(p.src,sB,'Upd src');
      
      Object.assign(tgt,{
        name, 
        game:cat, 
        version:ver, 
        icon:p.icon, 
        file:p.mod, 
        source:p.src, 
        desc, 
        tags:[..._selectedTags], 
        screenshots: _screenshotFiles.length > 0 ? screenshotPaths : oldTgt.screenshots
      }); 
      jc[idx]=tgt;
    } else {
      const sf=name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g,'_');
      const p={icon:`mods/${sf}_${ver}_ic.${iF.name.split('.').pop()}`,mod:`mods/${sf}_${ver}.${mF.name.split('.').pop()}`,src:sF?`mods/${sf}_${ver}_src.${sF.name.split('.').pop()}`:null};
      
      // 上传预览图
      const screenshotPaths = [];
      for (let i = 0; i < _screenshotFiles.length; i++) {
        const ssFile = _screenshotFiles[i];
        const ext = ssFile.name.split('.').pop();
        const ssPath = `mods/${sf}_${ver}_ss${i+1}.${ext}`;
        const ssB64 = await b64(ssFile);
        await ghPut(ssPath, ssB64, `Add screenshot ${i+1}`);
        screenshotPaths.push(ssPath);
      }
      
      await Promise.all([ghPut(p.icon,iB,'Add ic'),ghPut(p.mod,mB,'Add mod'),sB?ghPut(p.src,sB,'Add src'):null]);
      tgt={id:Date.now().toString(),name,game:cat,version:ver,icon:p.icon,file:p.mod,source:p.src,desc,tags:[..._selectedTags],screenshots:screenshotPaths}; 
      jc.push(tgt);
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
    modsData = modsData.filter(x => x.id !== id); loadAdminList(); renderCurrentPage(); alert('删除成功');
  } catch(e) { alert('失败: ' + e.message); } finally { state.isBusy = false; }
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