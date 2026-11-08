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
    agents: 6,
    // 速度：再快一档，首屏约 1.6 秒
    glideMin: 90, glideMax: 220,
    drawMin: 150, drawMax: 280,
    revealMin: 140, revealMax: 320,
    startDelay: 0,
    // 二期：滚动到就重建的区块（首页 69 个 .reveal 全在这里）
    // 覆盖范围：既包括原本带 .reveal 的块，也包括没有 reveal 的结构块
    scrollSelectors: [
      '.reveal',
      '.section__title', '.kicker', '.section__lead',
      '.step', '.feature', '.card', '.faq__item', '.chg__item',
      '.stat', '.cap-chip', '.cap-row', '.blog-promo', '.footer__col',
      '.privacy__card', '.demo__panel', '.rule-item', '.mode-card', '.preset-chip',
    ].join(','),
    scrollAgents: 12,
    scrollGlide: 90, scrollDraw: 150, scrollReveal: 170,
    names: ['Ada', 'Linus', 'Grace', 'Alan', 'Margaret', 'Ken',
            'Barbara', 'Dennis', 'Radia', 'Guido', 'Hedy', 'Tim'],
    colors: ['#F24E1E', '#A259FF', '#1ABCFE', '#0ACF83', '#FF7262', '#FFC700',
             '#9747FF', '#E8467C', '#14AE5C', '#0D99FF', '#FF8A00', '#00B5CE'],
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
      '<svg viewBox="0 0 24 24"><path d="M4 2l6.5 18 2.6-7.2 7.4-2.6z" fill="' + OPTS.colors[i % OPTS.colors.length] +
      '" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/></svg>' +
      '<span class="swarm-cursor__who" style="background:' + OPTS.colors[i % OPTS.colors.length] + '">' +
      OPTS.names[i % OPTS.names.length] + '</span>';
    overlay.appendChild(el);
    const z = zoomOf();
    // 沿四周散开，避免 12 个光标叠在屏幕中央
    const ang = (i / Math.max(1, OPTS.scrollAgents)) * Math.PI * 2;
    const rx = innerWidth * 0.32, ry = innerHeight * 0.30;
    return {
      el,
      x: (innerWidth / 2 + Math.cos(ang) * rx - offX) / z,
      y: (innerHeight / 2 + Math.sin(ang) * ry - offY) / z,
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

  /** 量元素在 overlay 本地坐标系里的位置（每次现量，滚动中也不会错位） */
  function localRect(el) {
    const r = el.getBoundingClientRect();
    const z = zoomOf();
    return {
      x: (r.left - offX) / z,
      y: (r.top - offY) / z,
      w: r.width / z,
      h: r.height / z,
      // 真实视口坐标，用来判断还在不在屏幕上
      vTop: r.top,
      vBottom: r.bottom,
    };
  }

  let seq = 0;
  const idOf = (el) => {
    if (!el.dataset.swarmId) el.dataset.swarmId = 'sw' + (++seq);
    return el.dataset.swarmId;
  };

  /** 拖动克隆体：光标抓着元素的半透明副本移到最终位置，然后落下 */
  function dragGhost(el, c, rect, ms) {
    if (!rect || rect.w < 8 || rect.h < 8) return Promise.resolve(null);
    const ghost = el.cloneNode(true);
    ghost.classList.add('swarm-ghost');
    ghost.removeAttribute('data-swarm-id');
    ghost.style.cssText =
      'position:fixed;margin:0;pointer-events:none;opacity:.94 !important;z-index:1;' +
      'left:' + rect.x + 'px;top:' + rect.y + 'px;' +
      'width:' + rect.w + 'px;height:' + rect.h + 'px;';
    const dx = 110, dy = 78;
    ghost.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(.96)';
    overlay.appendChild(ghost);

    const t0 = performance.now();
    return new Promise((res) => {
      (function step() {
        const t = Math.min(1, (performance.now() - t0) / ms);
        const k = easeOut(t);
        const cur = localRect(el);
        ghost.style.left = cur.x + 'px';
        ghost.style.top = cur.y + 'px';
        ghost.style.width = cur.w + 'px';
        ghost.style.height = cur.h + 'px';
        ghost.style.transform = 'translate(' + (dx * (1 - k)) + 'px,' + (dy * (1 - k)) + 'px) scale(' + (0.96 + 0.04 * k) + ')';
        place(c, cur.x + cur.w * .22 + dx * (1 - k), cur.y + cur.h * .66 + dy * (1 - k));
        if (t < 1) requestAnimationFrame(step); else res(ghost);
      })();
    });
  }

  function drawFrame(rect, ms, label, el) {
    const f = document.createElement('div');
    f.className = 'swarm-frame';
    f.style.cssText = 'left:' + rect.x + 'px;top:' + rect.y + 'px;width:0;height:0';
    if (label) f.dataset.swarmFor = label;
    if (el) f.dataset.swarmEl = idOf(el);
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
        // 关键：每帧重新量，元素被滚动 / 布局变化时框立刻跟上
        const cur = el ? localRect(el) : rect;
        const w = Math.round(cur.w * k), h = Math.round(cur.h * k);
        f.style.left = cur.x + 'px';
        f.style.top = cur.y + 'px';
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
    // 按钮 / 徽章这类小块：光标直接把它拖到位；标题、段落这种大块：仍然拖框
    const small = rect.w * rect.h < 90000;
    let frame = null, ghost = null;
    if (small) ghost = await dragGhost(el, c, rect, 240);
    if (!ghost) {
      const tag = (el.className || el.tagName).split(' ')[0];
      frame = await drawFrame(rect, Math.min(OPTS.drawMax, OPTS.drawMin + rect.w * .18), tag, el);
    }

    // 文本类走「写出来」，按钮/徽章这类走「淡入」
    if (el.matches('.hero__kicker, .hero__sub, .hero__title, .hero__trust')) {
      await revealText(el);
    } else {
      el.classList.add('swarm-lit');
      await wait(90);
    }
    if (ghost) { ghost.style.transition = 'opacity .16s ease'; ghost.style.opacity = '0'; setTimeout(() => ghost.remove(), 200); }
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

    // 二期：整页滚动重建（不锁滚动，滚到哪画到哪）
    startScrollSwarm();
  }

  /* ---------- 二期：滚动触发，逐块重建 ---------- */
  function startScrollSwarm() {
    // 先收集所有候选，再把「包含其它候选」的容器剔掉（只画最内层，避免父子重复）
    const cand = [...document.querySelectorAll(OPTS.scrollSelectors)].filter((el) => !targets.includes(el) && !el.closest('.hero'));
    const blocks = cand.filter((el) => !cand.some((other) => other !== el && el.contains(other)));
    if (!blocks.length) return;

    const stamp = Date.now();
    blocks.forEach((el) => { el.classList.add('swarm-pending'); el.dataset.swarmPendingAt = String(stamp); });
    document.documentElement.classList.add('swarm-scroll');

    // 二期用的两个常驻光标
    if (!overlay || !overlay.isConnected) buildOverlay();
    const crew = Array.from({ length: OPTS.scrollAgents }, (_, i) => makeCursor(i));
    crew.forEach((c) => { place(c, c.x, c.y); c.el.style.opacity = '0'; });

    const queue = [];
    let busy = 0, idleTimer = null;

    const pump = () => {
      while (busy < crew.length && queue.length) {
        const { el, resolve } = queue.shift();
        const c = crew[busy++];
        buildScroll(el, c).then(() => { busy--; resolve(); pump(); });
      }
      if (!busy && !queue.length) {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => crew.forEach((c) => { c.el.style.opacity = '0'; }), 900);
      }
    };

    const enqueue = (el) => new Promise((resolve) => { queue.push({ el, resolve }); pump(); });

    async function buildScroll(el, c) {
      if (el.dataset.swarmBuilt) return;
      el.dataset.swarmBuilt = '1';
      clearTimeout(idleTimer);

      const r = localRect(el);
      if (r.w < 8 || r.h < 8) { el.classList.remove('swarm-pending'); return; }
      // 已经滚过去的块别再画框（画出来一定错位）
      if (r.vBottom <= 0) { el.classList.remove('swarm-pending'); el.classList.add('swarm-lit'); return; }

      c.el.style.opacity = '1';
      const small = r.w * r.h < 90000;
      let frame = null, ghost = null;
      if (small) ghost = await dragGhost(el, c, r, 210);
      if (!ghost) {
        await glide(c, r.x + Math.min(r.w * .25, 70), r.y + r.h * .5, OPTS.scrollGlide);
        frame = await drawFrame(r, Math.min(320, OPTS.scrollDraw + r.w * .06), 'reveal', el);
      }

      // 文本标题走揭示，其余直接淡出待建态
      const isText = el.matches('.section__title, .kicker, .step__title, h2, h3');
      if (isText) {
        el.classList.add('swarm-revealing', 'swarm-lit');
        el.classList.remove('swarm-pending');
        await new Promise((res) => requestAnimationFrame(() => {
          el.classList.add('swarm-revealed');
          setTimeout(() => { el.classList.remove('swarm-revealing', 'swarm-revealed'); res(); }, OPTS.scrollReveal);
        }));
      } else {
        el.classList.remove('swarm-pending');
        el.classList.add('swarm-lit');
        await wait(90);
      }
      if (ghost) { ghost.style.transition = 'opacity .16s ease'; ghost.style.opacity = '0'; setTimeout(() => ghost.remove(), 200); }
      if (frame) setTimeout(() => frame.remove(), 180);
    }

    // 兜底：content-visibility / 离屏布局导致框量不到时，别把内容永远藏着
    const sweep = setInterval(() => {
      const now = Date.now();
      for (const el of document.querySelectorAll('.swarm-pending')) {
        const waited = now - Number(el.dataset.swarmPendingAt || now);
        const r = el.getBoundingClientRect();
        // 只有在「屏幕上」且等了 2 秒还没轮到，才强制放出；否则交给光标去画
        const onScreen = r.height > 0 && r.top < innerHeight * 1.02 && r.bottom > 0;
        const scrolledPast = r.height > 0 && r.bottom <= 0;
        if ((waited > 2000 && onScreen) || scrolledPast) {
          el.classList.remove('swarm-pending');
          el.classList.add('swarm-lit');
          el.dataset.swarmBuilt = '1';
        }
      }
      if (!document.querySelector('.swarm-pending')) clearInterval(sweep);
    }, 500);

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        enqueue(e.target);
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });

    blocks.forEach((el) => io.observe(el));

    // 首屏附近还没建的，直接先排队（避免停在屏幕上却不画）
    blocks.slice(0, 4).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight * 1.2) { io.unobserve(el); enqueue(el); }
    });
  }

  /* 不再等字体：首帧就量，框每帧跟着元素走（字体替换后也不会错位） */
  const start = () => Promise.resolve().then(() => run()).catch((e) => {
    console.error('[swarm]', e);
    root.classList.remove('swarming');
    if (overlay) overlay.remove();
  });

  // 等首帧画出来再开始（否则动画在第一帧之前就结束了，用户什么都看不到）
  const afterPaint = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));
  if (document.readyState === 'loading') {
    addEventListener('DOMContentLoaded', () => afterPaint(start), { once: true });
  } else {
    afterPaint(start);
  }
})();
