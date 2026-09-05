/* ============================================================
   NekoType 官网 · main.js
   主题切换 / 星空粒子 / 导航 / 滚动显现 / 规则演示引擎 /
   Hero 打字动画 / 键盘模拟 / QQ 复制 / Toast
   ============================================================ */
'use strict';

const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

/* ---------------- 星空粒子 ---------------- */
const starCanvas = $('#starfield');
const sctx = starCanvas.getContext('2d');
let stars = [], W = 0, H = 0, shooters = [], rafId = null;

function resizeStars() {
  W = starCanvas.width = window.innerWidth;
  H = starCanvas.height = window.innerHeight;
}
function buildStars() {
  const count = Math.min(220, Math.floor(W * H / 7500));
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.5 + 0.3,
    tw: Math.random() * Math.PI * 2,
    sp: Math.random() * 0.026 + 0.008,
    vx: (Math.random() - 0.5) * 0.06,
    vy: (Math.random() - 0.5) * 0.04,
    depth: Math.random() < 0.5 ? 0.35 : 1,
    hue: Math.random() < 0.78 ? '200,214,255' : (Math.random() < 0.5 ? '255,127,190' : '245,176,66')
  }));
}
function drawStars(t) {
  sctx.clearRect(0, 0, W, H);
  const ox = (typeof px !== 'undefined') ? px : 0;
  const oy = (typeof py !== 'undefined') ? py : 0;
  for (const s of stars) {
    s.x += s.vx; s.y += s.vy;
    if (s.x < -6) s.x = W + 6; else if (s.x > W + 6) s.x = -6;
    if (s.y < -6) s.y = H + 6; else if (s.y > H + 6) s.y = -6;
    const dx = s.x + ox * s.depth * 26;
    const dy = s.y + oy * s.depth * 26;
    const a = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.sp + s.tw));
    sctx.beginPath();
    sctx.arc(dx, dy, s.r, 0, Math.PI * 2);
    sctx.fillStyle = `rgba(${s.hue},${a})`;
    sctx.fill();
    if (s.r > 1.1) {
      sctx.beginPath();
      sctx.arc(dx, dy, s.r * 3, 0, Math.PI * 2);
      sctx.fillStyle = `rgba(${s.hue},${a * 0.12})`;
      sctx.fill();
    }
  }
  // 流星
  if (Math.random() < 0.008 && shooters.length < 3) {
    shooters.push({
      x: Math.random() * W * 0.8 + W * 0.1,
      y: Math.random() * H * 0.3,
      vx: -(4 + Math.random() * 4),
      vy: 2 + Math.random() * 2.2,
      life: 1
    });
  }
  shooters = shooters.filter(s => s.life > 0);
  for (const s of shooters) {
    s.x += s.vx; s.y += s.vy; s.life -= 0.018;
    const grad = sctx.createLinearGradient(s.x, s.y, s.x - s.vx * 9, s.y - s.vy * 9);
    grad.addColorStop(0, `rgba(200,162,255,${0.9 * s.life})`);
    grad.addColorStop(1, 'rgba(200,162,255,0)');
    sctx.strokeStyle = grad;
    sctx.lineWidth = 1.6;
    sctx.beginPath();
    sctx.moveTo(s.x, s.y);
    sctx.lineTo(s.x - s.vx * 9, s.y - s.vy * 9);
    sctx.stroke();
  }
}
let loopRunning = false;
function starLoop(t) {
  drawStars(t);
  rafId = requestAnimationFrame(starLoop);
}
function stopStars() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  loopRunning = false;
}
function startStars() {
  if (loopRunning) return;
  loopRunning = true;
  starLoop(performance.now());
}
function initStars() {
  resizeStars();
  buildStars();
  stopStars();
  sctx.clearRect(0, 0, W, H);
  const isDark = root.dataset.theme === 'dark';
  if (isDark && reduceMotion) drawStars(0); // 静态星空
  else if (isDark) startStars();
}
window.addEventListener('resize', initStars);

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
  chatCount.textContent = '今日变换 ' + ruleState.count + ' 次';

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
    toast('已应用「' + PRESET_LABEL[btn.dataset.preset] + '」预设');
  });
});

/* ============================================================
   Hero 悬浮球（装饰性，点击撒猫爪粒子）
   ============================================================ */
const heroFab = $('#heroFab');
if (heroFab) heroFab.addEventListener('click', () => pawBurst(null, null, heroFab));

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
  kbdRaw.textContent = raw;
  kbdOut.textContent = raw + (Math.random() < 0.55 ? '喵' : 'awa');
  setTimeout(kbdTick, 2400);
}
if (!reduceMotion && kbdOut) { kbdTick(); }

/* ---------------- QQ 群复制 ---------------- */
$('#qqGroup').addEventListener('click', async () => {
  const qq = '1007865515';
  try { await navigator.clipboard.writeText(qq); toast('已复制 QQ 群号：' + qq); }
  catch (e) {
    const ta = document.createElement('textarea');
    ta.value = qq; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('已复制 QQ 群号：' + qq); } catch (e2) { toast('QQ 群号：' + qq); }
    ta.remove();
  }
});

/* ============================================================
   动态背景层：漂浮符号雨 + 鼠标视差 + 统计计数 + 卡片光斑
   ============================================================ */
const GLYPHS = ['🐾','ฅ','(=^･ω･^=)','(^・ω・^)','nya~','~喵','(=^ᴗ^=)','ฅ^•ﻌ•^ฅ','awa','qwq','(｡•̀ᴗ-)✧','(=ↀωↀ=)'];
const glyphRain = $('#glyphRain');
function spawnGlyphs() {
  if (reduceMotion || !glyphRain) return;
  const n = 18;
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    s.style.left = Math.random() * 100 + '%';
    s.style.fontSize = (12 + Math.random() * 24) + 'px';
    s.style.animationDuration = (16 + Math.random() * 24) + 's';
    s.style.animationDelay = (-Math.random() * 30) + 's';
    glyphRain.appendChild(s);
  }
}

/* 鼠标视差 + Hero 手机 3D 倾斜 */
let mx = 0, my = 0, px = 0, py = 0, parallaxRAF = null;
const heroPhone = $('.hero__visual .appshot');
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

/* ---------------- 启动 ---------------- */
initStars();
spawnGlyphs();
// 主题切换后重绘星空
new MutationObserver(() => initStars()).observe(root, { attributes: true, attributeFilter: ['data-theme'] });