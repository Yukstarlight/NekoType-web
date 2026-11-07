/*!
 * NekoType · 光标重建（自研，零依赖）
 * 进站时把首屏的关键元素「量尺 → 拖框 → 写出」一次。
 * 用法：<script src="assets/js/swarm.js?v=…" defer data-swarm-auto></script>
 * 关闭：URL 加 ?noswarm，或系统开启「减少动态效果」，或元素上有 data-no-swarm。
 */
(() => {
  'use strict';

  const SCRIPT = document.currentScript;
  const OPTS = {
    // 从上到下依次重建的目标（首位先建）
    selectors: (SCRIPT && SCRIPT.dataset.swarmTargets) ||
      '.hero__kicker, .hero__badge, .hero__title, .hero__sub, .hero__cta, .hero__trust',
    agents: 3,
    // 速度：整体偏快，整段控制在 2.6 秒左右
    glideMin: 180, glideMax: 420,
    drawMin: 300, drawMax: 520,
    revealMin: 260, revealMax: 620,
    startDelay: 120,
    names: ['Ada', 'Linus', 'Grace'],
    colors: ['#F24E1E', '#A259FF', '#1ABCFE'],
  };

  // CSS zoom 会把 fixed 元素的坐标整体放大/缩小，量尺后要除掉它
  const zoomOf = () => parseFloat(getComputedStyle(document.documentElement).zoom) || 1;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const off = /(?:\?|&)noswarm\b/.test(location.search) ||
    document.documentElement.classList.contains('no-swarm') ||
    (SCRIPT && SCRIPT.hasAttribute('data-swarm-off'));
  if (reduce || off) return;

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const lerp = (a, b, t) => a + (b - a) * t;

  const targets = [...document.querySelectorAll(OPTS.selectors)].filter((el) => el && !el.hasAttribute('data-no-swarm'));
  if (!targets.length) return;

  const root = document.documentElement;
  root.classList.add('swarming');

  let overlay, cursorEls = [], lit = 0;

  let offX = 0, offY = 0;   // overlay 自身的原点（zoom / 滚动条槽会把它挤偏几个像素）

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'swarm-overlay';
    document.body.appendChild(overlay);
    const r = overlay.getBoundingClientRect();
    offX = r.left;
    offY = r.top;
  }

  function makeCursor(i) {
    const el = document.createElement('div');
    el.className = 'swarm-cursor';
    el.style.opacity = '0';
    el.innerHTML =
      '<svg viewBox="0 0 24 24"><path d="M4 2l6.5 18 2.6-7.2 7.4-2.6z" fill="' + OPTS.colors[i % 3] +
      '" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/></svg>' +
      '<span class="swarm-cursor__who" style="background:' + OPTS.colors[i % 3] + '">' +
      OPTS.names[i % OPTS.names.length] + '</span>';
    overlay.appendChild(el);
    const z = zoomOf();
    return {
      el,
      x: (innerWidth * (0.35 + 0.08 * i) - offX) / z,
      y: (innerHeight * 0.58 - offY) / z,
    };
  }

  function place(c, x, y) {
    c.x = x; c.y = y;
    c.el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  }

  function glide(c, toX, toY, ms) {
    const fx = c.x, fy = c.y, t0 = performance.now();
    return new Promise((res) => {
      (function step() {
        const t = Math.min(1, (performance.now() - t0) / ms);
        const k = easeInOut(t);
        place(c, lerp(fx, toX, k), lerp(fy, toY, k));
        t < 1 ? requestAnimationFrame(step) : res();
      })();
    });
  }

  function drawFrame(rect, ms, label) {
    const f = document.createElement('div');
    f.className = 'swarm-frame';
    f.style.cssText = 'left:' + rect.x + 'px;top:' + rect.y + 'px;width:0;height:0';
    if (label) f.dataset.swarmFor = label;
    const dim = document.createElement('span');
    dim.className = 'swarm-frame__dim';
    dim.textContent = '0 × 0';
    f.appendChild(dim);
    overlay.appendChild(f);
    const t0 = performance.now();
    return new Promise((res) => {
      (function step() {
        const t = Math.min(1, (performance.now() - t0) / ms);
        const k = easeOut(t);
        const w = Math.round(rect.w * k), h = Math.round(rect.h * k);
        f.style.width = w + 'px';
        f.style.height = h + 'px';
        dim.textContent = w + ' × ' + h;
        t < 1 ? requestAnimationFrame(step) : res(f);
      })();
    });
  }

  /* 文本：裁剪揭示，保留 <br>/<span class="grad-text">/<strong> 结构 */
  function revealText(el) {
    const chars = (el.textContent || '').trim().length;
    const ms = Math.min(OPTS.revealMax, Math.max(OPTS.revealMin, 180 + chars * 4));
    el.classList.add('swarm-revealing', 'swarm-lit');
    return new Promise((res) => {
      requestAnimationFrame(() => {
        el.classList.add('swarm-revealed');
        setTimeout(() => {
          el.classList.remove('swarm-revealing', 'swarm-revealed');
          res();
        }, ms);
      });
    });
  }

  async function build(el, c, i) {
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) { el.classList.add('swarm-lit'); return; }
    const z = zoomOf();
    const rect = {
      x: (r.left - offX) / z,
      y: (r.top - offY) / z,
      w: r.width / z,
      h: r.height / z,
    };
    const goX = rect.x + Math.min(rect.w * .3, 90);
    const goY = rect.y + rect.h * .5;

    c.el.style.opacity = '1';
    const dist = Math.hypot(goX - c.x, goY - c.y);
    await glide(c, goX, goY, Math.min(OPTS.glideMax, OPTS.glideMin + dist * .35));
    const tag = (el.className || el.tagName).split(' ')[0];
    const frame = await drawFrame(rect, Math.min(OPTS.drawMax, OPTS.drawMin + rect.w * .18), tag);

    // 文本类走「写出来」，按钮/徽章这类走「淡入」
    if (el.matches('.hero__kicker, .hero__sub, .hero__title, .hero__trust')) {
      await revealText(el);
    } else {
      el.classList.add('swarm-lit');
      await wait(110);
    }
    if (frame) setTimeout(() => frame.remove(), 200);

    lit++;
    root.style.setProperty('--swarm-progress', (lit / targets.length).toFixed(3));
    await wait(60 + i * 6);
  }

  async function run() {
    buildOverlay();
    const agents = Math.min(OPTS.agents, targets.length);
    const cursors = Array.from({ length: agents }, (_, i) => makeCursor(i));
    cursors.forEach((c) => place(c, c.x, c.y));

    await wait(OPTS.startDelay);

    let next = 0;
    await Promise.all(cursors.map(async (c) => {
      while (next < targets.length) {
        const i = next++;
        await build(targets[i], c, i);
      }
      c.el.style.opacity = '0';
    }));

    await wait(140);
    // 收尾：撤掉遮罩与标记，让页面回到正常交互
    cursors.forEach((c) => c.el.remove());
    overlay.remove();
    root.classList.remove('swarming');
    root.style.removeProperty('--swarm-progress');
    targets.forEach((el) => el.classList.remove('swarm-lit'));
    document.dispatchEvent(new CustomEvent('swarm:done'));
  }

  /* 字体就绪后再量尺，否则框和文字会错位 */
  const ready = document.fonts ? document.fonts.ready : Promise.resolve();
  const start = () => ready.then(() => run()).catch((e) => {
    console.error('[swarm]', e);
    root.classList.remove('swarming');
    if (overlay) overlay.remove();
  });

  if (document.readyState === 'complete') start();
  else addEventListener('load', start, { once: true });
})();
