/* ============================================================
   NekoType 官网 · main.js
   主题切换 / 星空粒子 / 导航 / 滚动显现 / 规则演示引擎 /
   Hero 打字动画 / 键盘模拟 / QQ 复制 / Toast
   ============================================================ */
'use strict';

/* i18n 助手：T() 按当前语言转换静态文案；TF() 处理带 %s 占位的动态文案 */
const T = (s) => (window.nekoT ? window.nekoT(s) : s);
const TF = (key, v) => T(key).replace('%s', v);

const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const root = document.documentElement;
const reduceMotion = false; // 站点按要求保持动态背景，不跟随系统"减弱动态效果"设置
// 移动端检测：触屏+窄屏（手机/平板竖横屏），或视口 ≤ 768px → 挂 html.is-mobile 做性能降级（桌面端不受影响）
const isMobile = window.matchMedia('(pointer: coarse) and (max-width: 1024px)').matches || window.innerWidth <= 768;
if (isMobile) document.documentElement.classList.add('is-mobile');

/* ---------------- 主题切换 ---------------- */
const THEME_KEY = 'neko-theme';
const themeToggle = $('#themeToggle');

function applyTheme(theme) {
  root.dataset.theme = theme;
  try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* 隐私模式忽略 */ }
  // 同步 meta theme-color
  const mcDark = document.querySelector('meta[name="theme-color"][media*="dark"]');
  mcDark && mcDark.setAttribute('content', theme === 'dark' ? '#0A0E1E' : '#F5F5F7');
}
applyTheme((() => {
  try { return localStorage.getItem(THEME_KEY) || 'dark'; } catch (e) { return 'dark'; }
})());

themeToggle.addEventListener('click', () =>
  applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark')
);

/* ---------------- 导航 ---------------- */
const nav = $('#nav');
const burger = $('#burger');
const mobileMenu = $('#mobileMenu');

function onScrollNav() { nav.classList.toggle('scrolled', window.scrollY > 12); }
window.addEventListener('scroll', onScrollNav, { passive: true });
onScrollNav();

burger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
  burger.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
});
$$('.nav__mobile a, .nav__links a').forEach(a => a.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
  burger.querySelector('use').setAttribute('href', '#i-menu');
}));

/* ---------------- 滚动显现 ---------------- */
const revealIO = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); }
  }
}, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });

$$('.reveal').forEach(el => {
  const d = el.dataset.revealDelay;
  if (d) el.style.transitionDelay = d + 'ms';
  revealIO.observe(el);
});

/* ---------------- Toast ---------------- */
const toastEl = $('#toast');
let toastTimer = null;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
}

/* ============================================================
   规则演示引擎（移植自 NekoType 的 TextTransformEngine 规则语义）
   ============================================================ */
const KAOMOJI = [
  '(=^･ω･^=)', '(^・ω・^)', '(=ↀωↀ=)', '(=^ᴗ^=)', 'ฅ^•ﻌ•^ฅ',
  '(✿◡‿◡)', '(。・ω・。)', '(=ＴωＴ=)', '(≧▽≦)', '(´｡• ω •｡`)',
  '(*´▽`*)', '(๑•̀ㅂ•́)و✧', '~(￣▽￣)~*', '(◕‿◕)♡', '(*≧ω≦)',
  '(=^‥^=)', 'ฅ(≈>ܫ<≈)ฅ', '(=；ω；=)', '(ö∇ö๑)', '( ˙▿˙ )',
  '(=^･ｪ･^=)', '(=;ェ;=)', '(=ＴェＴ=)', '(=⌒‿⌒=)', '(=^ω^=)',
  '(=^･ω･^=)ﾉ', '(=ェ=)', '(｡•̀ᴗ-)✧', '(๑˃ᴗ˂)ﻭ', '(づ｡◕‿‿◕｡)づ'
];

const ruleState = {
  prefix: true,    prefixVal: '~',
  suffix: true,    suffixVal: '喵',
  randSuffix: true, randSuffixVal: 'qwq|awa|nya~', randSuffixP: 60,
  kaomoji: false,  kaomojiP: 40,
  replace: true,   replaceFrom: '的', replaceTo: 'の',
  space: false,
  count: 0
};

function roll(p) { return Math.random() * 100 < p; }
function pick(poolStr) {
  return poolStr.split('|').map(s => s.trim()).filter(Boolean);
}

function transform(text) {
  let t = text;
  // 替换文本
  if (ruleState.replace && ruleState.replaceFrom) {
    t = t.split(ruleState.replaceFrom).join(ruleState.replaceTo);
  }
  // 前缀 / 后缀
  if (ruleState.prefix && ruleState.prefixVal) t = ruleState.prefixVal + t;
  if (ruleState.suffix && ruleState.suffixVal) t = t + ruleState.suffixVal;
  // 随机后缀（触发概率）
  if (ruleState.randSuffix) {
    const pool = pick(ruleState.randSuffixVal);
    if (pool.length && roll(ruleState.randSuffixP)) t += pool[Math.floor(Math.random() * pool.length)];
  }
  // 随机颜文字
  if (ruleState.kaomoji && roll(ruleState.kaomojiP)) {
    t += KAOMOJI[Math.floor(Math.random() * KAOMOJI.length)];
  }
  // 字符间加空格
  if (ruleState.space) t = [...t].join(' ');
  return t;
}

/* --- UI 绑定 --- */
const demoInput = $('#demoInput');
const previewOut = $('#previewOut');
const demoFab = $('#demoFab');
const demoChat = $('#demoChat');
const chatCount = $('#chatCount');

function readRuleUI() {
  ruleState.prefix      = $('input[data-key="prefix"]').checked;
  ruleState.prefixVal   = $('input[data-key="prefix-val"]').value;
  ruleState.suffix      = $('input[data-key="suffix"]').checked;
  ruleState.suffixVal   = $('input[data-key="suffix-val"]').value;
  ruleState.randSuffix  = $('input[data-key="randSuffix"]').checked;
  ruleState.randSuffixVal = $('input[data-key="randSuffix-val"]').value;
  ruleState.randSuffixP = +$('input[data-key="randSuffix-p"]').value;
  ruleState.kaomoji     = $('input[data-key="kaomoji"]').checked;
  ruleState.kaomojiP    = +$('input[data-key="kaomoji-p"]').value;
  ruleState.replace     = $('input[data-key="replace"]').checked;
  ruleState.replaceFrom = $('input[data-key="replace-from"]').value;
  ruleState.replaceTo   = $('input[data-key="replace-to"]').value;
  ruleState.space       = $('input[data-key="space"]').checked;
  $('[data-key="randSuffix-pv"]').textContent = ruleState.randSuffixP + '%';
  $('[data-key="kaomoji-pv"]').textContent = ruleState.kaomojiP + '%';
}
function computePreview() {
  readRuleUI();
  const raw = demoInput.value.trim() || '喵';
  previewOut.textContent = transform(raw);
}
demoInput.addEventListener('input', computePreview);
$$('#ruleList input').forEach(el => el.addEventListener('input', computePreview));
computePreview();

/* 猫爪点击 → 发送 + 猫爪粒子 */
function pawBurst(x, y, anchor) {
  if (reduceMotion) return;
  const rect = anchor.getBoundingClientRect();
  const cx = x != null ? x : rect.left + rect.width / 2;
  const cy = y != null ? y : rect.top + rect.height / 2;
  for (let i = 0; i < 9; i++) {
    const s = document.createElement('span');
    s.className = 'paw-particle';
    s.textContent = '🐾';
    const ang = (Math.PI * 2 * i) / 9 + Math.random() * 0.6;
    const dist = 46 + Math.random() * 42;
    s.style.left = cx + 'px';
    s.style.top = cy + 'px';
    s.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
    s.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
    s.style.fontSize = (10 + Math.random() * 10) + 'px';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 750);
  }
}

function bubbleOut(raw, out) {
  const b = document.createElement('div');
  b.className = 'bubble bubble--out';
  if (raw && raw !== out) {
    const small = document.createElement('span');
    small.className = 'bubble__raw';
    small.textContent = raw;
    b.appendChild(small);
  }
  b.appendChild(document.createTextNode(out));
  return b;
}

function sendMessage(anchor) {
  readRuleUI();
  const raw = (demoInput.value.trim() || '喵');
  const out = transform(raw);
  ruleState.count++;
  chatCount.textContent = T('今日变换 0 次').replace('0', ruleState.count);

  // 打字指示器
  const typing = document.createElement('div');
  typing.className = 'bubble bubble--in typing';
  typing.innerHTML = '<i></i><i></i><i></i>';
  demoChat.appendChild(typing);
  demoChat.scrollTop = demoChat.scrollHeight;

  setTimeout(() => {
    typing.remove();
    demoChat.appendChild(bubbleOut(raw, out));
    demoChat.scrollTop = demoChat.scrollHeight;
  }, 620);

  pawBurst(null, null, anchor);
}

demoFab.addEventListener('click', () => sendMessage(demoFab));
demoInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(demoFab); });

/* 清空聊天 */
$('#clearChat').addEventListener('click', () => {
  demoChat.querySelectorAll('.bubble').forEach(b => b.remove());
  const seed = document.createElement('div');
  seed.className = 'bubble bubble--in';
  seed.textContent = '想去看电影嘛？';
  demoChat.appendChild(seed);
});

/* 随机演示 */
const SAMPLES = ['好的', '在干嘛', '今天天气不错', '吃过饭了吗', '晚安', '哈哈哈哈', '么么哒', '到家了', '我去洗澡', '明天见'];
$('#randomDemo').addEventListener('click', () => {
  demoInput.value = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
  computePreview();
  sendMessage(demoFab);
});

/* 预设 */
const PRESET_LABEL = { cat: '猫语', kira: '闪闪', weeb: '中二', clean: '清空' };
const PRESETS = {
  cat:   () => setRules({ prefix:1, suffix:1, randSuffix:1, kaomoji:0, replace:0, space:0 }, ['~', '喵', 'qwq|awa|nya~', null, null, null]),
  kira:  () => { setRules({ prefix:1, suffix:1, randSuffix:0, kaomoji:1, replace:0, space:0 }, ['✧', '✧·ﾟ', null, null, null, null]); setVal('kaomoji-p', 100); },
  weeb:  () => { setRules({ prefix:0, suffix:1, randSuffix:1, kaomoji:1, replace:1, space:0 }, [null, '…', '…♪|…☆', null, '我', '俺']); setVal('randSuffix-p', 80); setVal('kaomoji-p', 70); },
  clean: () => setRules({ prefix:0, suffix:0, randSuffix:0, kaomoji:0, replace:0, space:0 }, [null, null, null, null, null, null])
};
function setVal(key, v) { const el = $('input[data-key="' + key + '"]'); el.value = v; el.dispatchEvent(new Event('input')); }
function setRules(o, vals) {
  $('input[data-key="prefix"]').checked = !!o.prefix;
  $('input[data-key="suffix"]').checked = !!o.suffix;
  $('input[data-key="randSuffix"]').checked = !!o.randSuffix;
  $('input[data-key="kaomoji"]').checked = !!o.kaomoji;
  $('input[data-key="replace"]').checked = !!o.replace;
  $('input[data-key="space"]').checked = !!o.space;
  if (vals[0] != null) $('input[data-key="prefix-val"]').value = vals[0];
  if (vals[1] != null) $('input[data-key="suffix-val"]').value = vals[1];
  if (vals[2] != null) $('input[data-key="randSuffix-val"]').value = vals[2];
  if (vals[4] != null) $('input[data-key="replace-from"]').value = vals[4];
  if (vals[5] != null) $('input[data-key="replace-to"]').value = vals[5];
  computePreview();
}
$$('.chip-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.chip-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    PRESETS[btn.dataset.preset]();
    toast(TF('已应用「%s」预设', T(PRESET_LABEL[btn.dataset.preset])));
  });
});

/* ============================================================
   Hero 手机自动演示（打字 → 悬浮球改写 → 发出）
   ============================================================ */
const HERO_SEQ = [
  { raw: '好的',       out: '~好的喵' },
  { raw: '今天好开心', out: '今天好开心awa' },
  { raw: '我到家了',   out: '~我到家了(=^･ω･^=)' }
];
const heroChat = $('#heroChat');
const heroInput = $('#heroInput');
const heroSendBtn = $('#heroSendBtn');
const heroFab = $('#heroFab');
let heroStep = 0;

function heroTick() {
  const seq = HERO_SEQ[heroStep % HERO_SEQ.length];
  heroStep++;
  heroInput.textContent = seq.raw;
  setTimeout(() => {
    heroSendBtn.classList.add('flash');
    const t = document.createElement('div');
    t.className = 'bubble bubble--in typing';
    t.innerHTML = '<i></i><i></i><i></i>';
    heroChat.appendChild(t);
    setTimeout(() => {
      t.remove();
      heroChat.appendChild(bubbleOut(seq.raw, seq.out));
      while (heroChat.children.length > 4) heroChat.firstElementChild.remove();
      heroSendBtn.classList.remove('flash');
      setTimeout(heroTick, 1900);
    }, 620);
  }, 800);
}
if (!isMobile) heroTick(); // 移动端跳过 Hero 自动演示，提升流畅度

heroFab.addEventListener('click', () => pushHeroNow());
function pushHeroNow() {
  const seq = HERO_SEQ[Math.floor(Math.random() * HERO_SEQ.length)];
  heroInput.textContent = seq.raw;
  heroChat.appendChild(bubbleOut(seq.raw, seq.out));
  while (heroChat.children.length > 4) heroChat.firstElementChild.remove();
  pawBurst(null, null, heroFab);
}

/* ============================================================
   键盘模拟（特性区 02）
   ============================================================ */
const kbdRaw = $('#kbdRaw');
const kbdOut = $('#kbdOut');
const KBD_SEQ = ['我今天好开心', '在吗？', '吃饭没', '下班了', '哈哈哈哈哈'];
let kbdIdx = 0;
function kbdTick() {
  const raw = KBD_SEQ[kbdIdx % KBD_SEQ.length];
  kbdIdx++;
  kbdRaw.textContent = T(raw);
  kbdOut.textContent = T(raw) + (Math.random() < 0.55 ? '喵' : 'awa');
  setTimeout(kbdTick, 2400);
}
if (!reduceMotion && kbdOut) { kbdTick(); }

/* ---------------- QQ 群复制 ---------------- */
$('#qqGroup').addEventListener('click', async () => {
  const qq = '1007865515';
  try { await navigator.clipboard.writeText(qq); toast(TF('已复制 QQ 群号：%s', qq)); }
  catch (e) {
    const ta = document.createElement('textarea');
    ta.value = qq; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast(TF('已复制 QQ 群号：%s', qq)); } catch (e2) { toast(TF('QQ 群号：%s', qq)); }
    ta.remove();
  }
});

/* ============================================================
   鼠标视差 + 统计计数 + 卡片光斑
   ============================================================ */
/* 鼠标视差 + Hero 手机 3D 倾斜 */
let mx = 0, my = 0, px = 0, py = 0, parallaxRAF = null;
const heroPhone = $('.hero__visual .phone');
function applyParallax() {
  px += (mx - px) * 0.06; py += (my - py) * 0.06;
  root.style.setProperty('--px', (px * 34).toFixed(2) + 'px');
  root.style.setProperty('--py', (py * 34).toFixed(2) + 'px');
  if (heroPhone && !reduceMotion) {
    heroPhone.style.transform = `perspective(1600px) rotateY(${(-8 + px * 18).toFixed(2)}deg) rotateX(${(4 - py * 18).toFixed(2)}deg)`;
  }
  if (Math.abs(mx - px) > 0.001 || Math.abs(my - py) > 0.001) {
    parallaxRAF = requestAnimationFrame(applyParallax);
  } else { parallaxRAF = null; }
}
window.addEventListener('mousemove', (e) => {
  mx = (e.clientX / window.innerWidth - 0.5);
  my = (e.clientY / window.innerHeight - 0.5);
  if (!parallaxRAF && !reduceMotion) parallaxRAF = requestAnimationFrame(applyParallax);
}, { passive: true });

/* 统计数字滚动计数 */
const countIO = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    const el = e.target;
    const target = +el.dataset.count; const suf = el.dataset.suffix || '';
    if (target === 0) { el.textContent = '0' + suf; }
    else {
      const dur = 1200; const t0 = performance.now();
      (function step(t) {
        const k = Math.min(1, (t - t0) / dur);
        const v = Math.round(target * (0.5 - Math.cos(Math.PI * k) / 2));
        el.textContent = v + suf;
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    }
    countIO.unobserve(el);
  }
}, { threshold: 0.5 });
$$('.stat b[data-count]').forEach(b => { b.textContent = '0' + (b.dataset.suffix || ''); countIO.observe(b); });

/* 卡片 3D 倾斜 + 光斑跟随 */
$$('.card').forEach(c => {
  c.addEventListener('mouseenter', () => c.classList.add('tilting'));
  c.addEventListener('mousemove', (e) => {
    const r = c.getBoundingClientRect();
    const cx = (e.clientX - r.left) / r.width - 0.5;
    const cy = (e.clientY - r.top) / r.height - 0.5;
    c.style.setProperty('--gx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--gy', (e.clientY - r.top) + 'px');
    c.style.transform = `translateY(-8px) rotateX(${(-cy * 10).toFixed(2)}deg) rotateY(${(cx * 12).toFixed(2)}deg)`;
  });
  c.addEventListener('mouseleave', () => { c.classList.remove('tilting'); c.style.transform = ''; });
});

/* 按钮磁性吸附 */
$$('.btn--lg').forEach(b => {
  b.addEventListener('mousemove', (e) => {
    const r = b.getBoundingClientRect();
    const cx = (e.clientX - r.left) / r.width - 0.5;
    const cy = (e.clientY - r.top) / r.height - 0.5;
    b.style.transform = `translate(${(cx * 8).toFixed(1)}px, ${(cy * 6).toFixed(1)}px)`;
  });
  b.addEventListener('mouseleave', () => { b.style.transform = ''; });
});

/* 滚动进度条 + 滚动视差变量 */
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.appendChild(progressBar);
let scrollMotionRAF = null;
function onScrollMotion() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  root.style.setProperty('--sp', max > 0 ? (y / max) : 0);
  root.style.setProperty('--scroll', y + 'px');
  scrollMotionRAF = null;
}
window.addEventListener('scroll', () => {
  if (!scrollMotionRAF) scrollMotionRAF = requestAnimationFrame(onScrollMotion);
}, { passive: true });
onScrollMotion();

/* ---------------- 备用下载渠道弹窗 ---------------- */
const dlModal = $('#dlModal');
function setDlModal(open) {
  if (!dlModal) return;
  dlModal.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) { const first = $('.dlm__item', dlModal); first && first.focus(); }
}
$$('[data-dl-open]').forEach((el) => {
  el.addEventListener('click', (e) => { e.preventDefault(); setDlModal(true); });
});
if (dlModal) {
  $$('[data-dl-close]', dlModal).forEach((el) => el.addEventListener('click', () => setDlModal(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dlModal.classList.contains('open')) setDlModal(false);
  });
}
/* 通用复制：优先 Clipboard API，失败回退 execCommand */
function copyText(text) {
  if (!text) return Promise.resolve(false);
  return navigator.clipboard.writeText(text).then(() => true).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    let done = false;
    try { done = document.execCommand('copy'); } catch (e) { done = false; }
    ta.remove();
    return done;
  });
}
const dlmPwdEl = $('#dlmPwd');
async function copyDlPwd() {
  const pwd = (dlmPwdEl && dlmPwdEl.textContent) || '';
  if (!pwd) return;
  const okc = await copyText(pwd);
  toast(okc ? TF('已复制提取码：%s', pwd) : TF('提取码：%s', pwd));
}
const dlmCopyBtn = $('#dlmCopyPwd');
if (dlmCopyBtn) dlmCopyBtn.addEventListener('click', copyDlPwd);
// 点蓝奏云跳转时顺手把提取码放进剪贴板；target=_blank，不拦默认行为
const dlmLanzou = $('#dlLanzou');
if (dlmLanzou) dlmLanzou.addEventListener('click', copyDlPwd);
// 文件校验：复制 SHA-256 / MD5
[['#dlmCopySha', '#dlmSha', '已复制 SHA-256：%s', 'SHA-256：%s'],
 ['#dlmCopyMd5', '#dlmMd5', '已复制 MD5：%s', 'MD5：%s']].forEach(([btnSel, codeSel, okKey, fallbackKey]) => {
  const btn = $(btnSel);
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const v = (($(codeSel) || {}).textContent || '').trim();
    if (!v) return;
    toast((await copyText(v)) ? TF(okKey, v) : TF(fallbackKey, v));
  });
});

/* ---------------- 官网迁移公告（每次进入都弹，不做「不再提示」） ---------------- */
const ntcModal = $('#ntcModal');
function setNtcModal(open) {
  if (!ntcModal) return;
  ntcModal.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) { const ok = $('#ntcOk'); ok && ok.focus(); }
}
if (ntcModal) {
  $$('[data-ntc-close]', ntcModal).forEach((el) => el.addEventListener('click', () => setNtcModal(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && ntcModal.classList.contains('open')) setNtcModal(false);
  });
  // 等首屏画完再弹，避免和初始化抢帧
  setTimeout(() => setNtcModal(true), 400);
}
const ntcCopyBtn = $('#ntcCopy');
if (ntcCopyBtn) ntcCopyBtn.addEventListener('click', async () => {
  const v = (($('#ntcDomain') || {}).textContent || '').trim();
  if (!v) return;
  toast((await copyText(v)) ? TF('已复制新域名：%s', v) : TF('新域名：%s', v));
});

/* ---------------- 下载点击计数 ----------------
   纯静态站没有后端，用 abacus 公共计数器（无需任何密钥）：
   GET  https://abacus.jasoncameron.dev/get/<ns>/<key>  读
   GET  https://abacus.jasoncameron.dev/hit/<ns>/<key>  读并 +1
   同一浏览器对同一渠道 10 分钟内只计一次（localStorage），避免刷新刷数。 */
const DL_API = 'https://abacus.jasoncameron.dev';
const DL_NS = 'nekotype-site';
/* 计数器 key 带上当前 APK 版本：链接一换（发新版本），key 就变，计数自动从 0 开始，
   不需要任何人去手动重置。版本号从主下载链接里取，三个渠道共用同一个版本后缀。 */
const DL_VER = (function () {
  const a = document.getElementById('heroDownload');
  const m = a && (a.getAttribute('href') || '').match(/NekoType-v([\d.]+)\.apk/);
  return m ? m[1].replace(/\./g, '') : 'v0';
})();
const dlKey = (ch) => 'dl-' + ch + '-' + DL_VER;
const DL_CH = { github: dlKey('github'), lanzou: dlKey('lanzou'), feiji: dlKey('feiji') };

function dlOnce(id) {
  const key = 'neko-dl-' + id;
  try {
    const raw = localStorage.getItem(key);
    if (raw && Date.now() - +raw < 5 * 60 * 1000) return true;   // 5 分钟内同一渠道只计一次
    localStorage.setItem(key, String(Date.now()));
  } catch (e) { /* 隐私模式下存不了，就每次都算 */ }
  return false;
}

function dlHit(ch) {
  if (!DL_CH[ch] || dlOnce(ch)) return;
  fetch(DL_API + '/hit/' + DL_NS + '/' + DL_CH[ch], { mode: 'cors', cache: 'no-store' })
    .catch(() => { /* 计数失败不影响下载 */ });
}



[['#heroDownload', 'github'], ['#ctaDownload', 'github'], ['#dlLanzou', 'lanzou'],
 ['#dlFeiji', 'feiji'], ['#dlGithub', 'github']].forEach(([sel, ch]) => {
  const el = $(sel);
  if (el) el.addEventListener('click', () => dlHit(ch));
});

/* ---------------- 启动 ---------------- */
