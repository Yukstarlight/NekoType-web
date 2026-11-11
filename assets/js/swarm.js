/*!
 * NekoType · 光标重建（自研，零依赖）
 *
 * 多光标按角色把页面重画一遍：
 *   crosshair → 拖出矩形（实时 W×H），真内容随后淡入
 *   ibeam     → 拖出文本框，再逐字「打字」，字尾带闪烁光标
 *   pen       → 钢笔工具画分隔线
 *   arrow     → 选中母版（蓝框）后 ⌥ 拖出副本，带红色间距标注
 *
 * 元素位置每帧现量，滚动时光标与框都不会错位。
 * 关闭：URL 加 ?noswarm、系统开启「减少动态效果」、或 <html class="no-swarm">。
 */
(() => {
  'use strict';

  const SCRIPT = document.currentScript;
  const OPTS = {
    // data-swarm-targets 的页面（/starlight）只画这些，不接管整页
    only: (SCRIPT && SCRIPT.dataset.swarmTargets) || '',
    selectors: [
      '.reveal', '.section__title', '.kicker', '.section__lead', '.step', '.feature', '.card',
      '.faq__item', '.chg__item', '.stat', '.cap-chip', '.cap-row', '.blog-promo', '.footer__col',
      '.privacy__card', '.demo__panel', '.rule-item', '.mode-card', '.preset-chip'
    ].join(','),
    heroSelectors: '.hero__kicker, .hero__badge, .hero__title, .hero__sub, .hero__cta, .hero__trust',
    maxCursors: 12,
    rectMs: 260, textStepMin: 9, textStepMax: 16, textMsMax: 900, lineMs: 220, dupMs: 240,
    reach: 1.35,
    names: ['Ada', 'Linus', 'Grace', 'Alan', 'Margaret', 'Ken',
      'Barbara', 'Dennis', 'Radia', 'Guido', 'Hedy', 'Tim'],
    colors: ['#F24E1E', '#A259FF', '#1ABCFE', '#0ACF83', '#FF7262', '#FFC700',
      '#9747FF', '#E8467C', '#14AE5C', '#0D99FF', '#FF8A00', '#00B5CE']
  };

  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (/[?&]noswarm\b/.test(location.search)) return;
  if (document.documentElement.classList.contains('no-swarm')) return;

  /* ---------------- 工具 ---------------- */
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const raf = () => new Promise((r) => requestAnimationFrame(r));

  let overlay = null, offX = 0, offY = 0;

  const zoomOf = () => {
    const z = parseFloat(getComputedStyle(document.documentElement).zoom);
    return z > 0 ? z : 1;
  };

  /** 元素在 overlay 坐标系里的矩形（每次现量） */
  function box(el) {
    const r = el.getBoundingClientRect(), z = zoomOf();
    return {
      x: (r.left - offX) / z, y: (r.top - offY) / z,
      w: r.width / z, h: r.height / z,
      vTop: r.top, vBottom: r.bottom
    };
  }

  const place = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; };

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'sw-overlay';
    document.body.appendChild(overlay);
    const r = overlay.getBoundingClientRect();
    offX = r.left; offY = r.top;
  }

  /* ---------------- 光标 ---------------- */
  // 参考实现里光标就是普通白色指针（带一点描边保证在浅色背景上也能看清），没有名字牌
  const ICONS = {
    arrow: '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M5 3l6.7 16.4 2.2-6.5 6.6-2.2z" fill="#fff" stroke="#0b0f1a" stroke-width="1.15" stroke-linejoin="round"/></svg>',
    crosshair: '<svg viewBox="0 0 24 24" width="20" height="20"><g stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M12 3v18M3 12h18"/></g><g stroke="#0b0f1a" stroke-width="1.2" stroke-linecap="round"><path d="M12 4.4v15.2M4.4 12h15.2"/></g></svg>',
    ibeam: '<svg viewBox="0 0 24 24" width="18" height="18"><g stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M8 4h8M12 4v16M8 20h8"/></g><g stroke="#0b0f1a" stroke-width="1.2" stroke-linecap="round"><path d="M8.6 4.4h6.8M12 4.4v15.2M8.6 19.6h6.8"/></g></svg>',
    pen: '<svg viewBox="0 0 24 24" width="19" height="19"><path d="M5 19l1.4-4.2L16.6 4.6a1.8 1.8 0 012.6 0l.2.2a1.8 1.8 0 010 2.6L9.2 17.6z" fill="#fff" stroke="#0b0f1a" stroke-width="1.15" stroke-linejoin="round"/></svg>'
  };

  function makeCursor(i) {
    const el = document.createElement('div');
    el.className = 'sw-cursor';
    el.style.color = OPTS.colors[i % OPTS.colors.length];
    el.style.setProperty('--c', OPTS.colors[i % OPTS.colors.length]);
    el.innerHTML = '<span class="sw-cursor__ico">' + ICONS.arrow + '</span>';
    el.style.opacity = '0';
    overlay.appendChild(el);
    const c = {
      el, ico: el.querySelector('.sw-cursor__ico'), x: 0, y: 0, busy: false,
      kind(k) { this.ico.innerHTML = ICONS[k] || ICONS.arrow; this.el.dataset.kind = k; },
      show() { this.el.style.opacity = '1'; }
    };
    c.x = (innerWidth * 0.5 - offX) / zoomOf();
    c.y = (innerHeight * 0.5 - offY) / zoomOf();
    c.wx = c.x + (Math.random() - 0.5) * innerWidth * 0.5;
    c.wy = c.y + (Math.random() - 0.5) * innerHeight * 0.5;
    c.nextWander = 0;
    place(el, c.x, c.y);
    return c;
  }

  /** 移向「每帧现算」的目标点 */
  function moveTo(c, getX, getY, ms) {
    const t0 = performance.now(), sx = c.x, sy = c.y;
    return new Promise((res) => {
      (function step() {
        const t = Math.min(1, (performance.now() - t0) / ms), k = easeOut(t);
        c.x = sx + (getX() - sx) * k;
        c.y = sy + (getY() - sy) * k;
        place(c.el, c.x, c.y);
        t < 1 ? requestAnimationFrame(step) : res();
      })();
    });
  }

  /* ---------------- 画面元素 ---------------- */
  function makeFrame() {
    const el = document.createElement('div');
    el.className = 'sw-frame';
    ['tl', 'tr', 'bl', 'br'].forEach((pos) => {
      const h = document.createElement('i');
      h.className = 'sw-frame__h sw-frame__h--' + pos;
      el.appendChild(h);
    });
    const dim = document.createElement('span');
    dim.className = 'sw-frame__dim';
    el.appendChild(dim);
    overlay.appendChild(el);
    return { el, dim };
  }

  /** 十字准星拖框：从 0 拉到目标大小，每帧跟元素对齐 */
  function makeGuides() {
    const g = {
      v: document.createElement('i'), h: document.createElement('i')
    };
    g.v.className = 'sw-guide sw-guide--v';
    g.h.className = 'sw-guide sw-guide--h';
    overlay.appendChild(g.v); overlay.appendChild(g.h);
    return g;
  }

  function fadeOut(g) {
    if (!g) return;
    [g.v, g.h].forEach((n) => {
      n.style.transition = 'opacity .3s ease';
      n.style.opacity = '0';
      setTimeout(() => n.remove(), 340);
    });
  }

  function dragRect(c, fr, el, ms, guides) {
    const t0 = performance.now();
    return new Promise((res) => {
      (function step() {
        const t = Math.min(1, (performance.now() - t0) / ms), k = easeOut(t);
        const b = box(el);
        if (guides) {
          guides.v.style.left = b.x + 'px';
          guides.v.style.top = Math.max(0, b.y) + 'px';
          guides.v.style.height = Math.min(innerHeight, b.h * k) + 'px';
          guides.h.style.top = b.y + 'px';
          guides.h.style.left = Math.max(0, b.x) + 'px';
          guides.h.style.width = Math.min(innerWidth, b.w * k) + 'px';
        }
        fr.el.style.left = b.x + 'px';
        fr.el.style.top = b.y + 'px';
        fr.el.style.width = Math.max(2, b.w * k) + 'px';
        fr.el.style.height = Math.max(2, b.h * k) + 'px';
        fr.dim.textContent = Math.round(b.w * k) + ' × ' + Math.round(b.h * k);
        c.x = b.x + b.w * k; c.y = b.y + b.h * k;      // 光标牵着右下角
        place(c.el, c.x, c.y);
        t < 1 ? requestAnimationFrame(step) : res();
      })();
    });
  }

  async function taskRect(el, c) {
    c.kind('crosshair'); c.show();
    const b0 = box(el);
    c.x = b0.x + b0.w + 26; c.y = b0.y + b0.h + 22;
    place(c.el, c.x, c.y);
    await moveTo(c, () => box(el).x + box(el).w - 6, () => box(el).y + box(el).h - 6, 170);
    const fr = makeFrame();
    const guides = makeGuides();
    await dragRect(c, fr, el, OPTS.rectMs, guides);
    await wait(50);
    el.classList.remove('sw-pending');
    el.classList.add('sw-done');
    fr.el.classList.add('sw-frame--gone');
    fadeOut(guides);
    setTimeout(() => fr.el.remove(), 220);
  }

  async function taskMedia(el, c) {
    c.kind('crosshair'); c.show();
    await moveTo(c, () => box(el).x + box(el).w + 24, () => box(el).y + box(el).h + 20, 150);
    const fr = makeFrame();
    await dragRect(c, fr, el, OPTS.rectMs);
    el.classList.remove('sw-pending');
    el.classList.add('sw-media-in');
    setTimeout(() => el.classList.remove('sw-media-in'), 280);
    fr.el.classList.add('sw-frame--gone');
    setTimeout(() => fr.el.remove(), 220);
  }

  /** 打字：先出文本框，再逐字 clip 出来，光标贴在字尾 */
  async function taskText(el, c) {
    c.kind('ibeam'); c.show();
    el.classList.remove('sw-pending');
    el.classList.add('sw-typing');
    await moveTo(c, () => box(el).x + 8, () => box(el).y + box(el).h * 0.75, 150);

    const chars = (el.textContent || '').trim().length;
    const steps = clamp(chars, 3, 46);
    const stepMs = clamp(OPTS.textMsMax / steps, OPTS.textStepMin, OPTS.textStepMax);

    const caret = document.createElement('i');
    caret.className = 'sw-caret';
    overlay.appendChild(caret);

    for (let i = 1; i <= steps; i++) {
      const k = i / steps;
      el.style.clipPath = 'inset(-10% ' + (100 - k * 100).toFixed(2) + '% -10% 0)';
      const b = box(el);
      caret.style.left = (b.x + b.w * k) + 'px';
      caret.style.top = b.y + 'px';
      caret.style.height = b.h + 'px';
      c.x = b.x + b.w * k; c.y = b.y + b.h * 0.75;
      place(c.el, c.x, c.y);
      await wait(stepMs);
    }
    caret.style.opacity = '0';
    el.style.clipPath = '';
    el.classList.remove('sw-typing');
    el.classList.add('sw-done');
    setTimeout(() => caret.remove(), 220);
  }

  async function taskLine(el, c) {
    c.kind('pen'); c.show();
    const b0 = box(el);
    c.x = b0.x - 18; c.y = b0.y + b0.h * 0.5;
    place(c.el, c.x, c.y);
    const line = document.createElement('div');
    line.className = 'sw-line';
    overlay.appendChild(line);
    const t0 = performance.now();
    await new Promise((res) => {
      (function step() {
        const t = Math.min(1, (performance.now() - t0) / OPTS.lineMs), k = easeOut(t);
        const bb = box(el);
        line.style.left = bb.x + 'px';
        line.style.top = (bb.y + bb.h * 0.5) + 'px';
        line.style.width = (bb.w * k) + 'px';
        c.x = bb.x + bb.w * k; c.y = bb.y + bb.h * 0.5;
        place(c.el, c.x, c.y);
        t < 1 ? requestAnimationFrame(step) : res();
      })();
    });
    el.classList.remove('sw-pending');
    el.classList.add('sw-done');
    setTimeout(() => line.remove(), 260);
  }

  /** ⌥ 拖副本：蓝框选中母版 → 拖出副本 → 红色间距标注 */
  async function taskDup(el, master, c) {
    c.kind('arrow'); c.show();
    const sel = document.createElement('div');
    sel.className = 'sw-select';
    overlay.appendChild(sel);
    const t0 = performance.now();
    for (;;) {
      const t = Math.min(1, (performance.now() - t0) / 170);
      const mb = box(master);
      sel.style.left = mb.x + 'px'; sel.style.top = mb.y + 'px';
      sel.style.width = mb.w + 'px'; sel.style.height = mb.h + 'px';
      sel.style.opacity = t;
      c.x = mb.x + mb.w * 0.5; c.y = mb.y + mb.h * 0.5;
      place(c.el, c.x, c.y);
      if (t >= 1) break;
      await raf();
    }

    const copy = master.cloneNode(true);
    copy.classList.add('sw-copy');
    copy.classList.remove('sw-pending', 'sw-done');
    overlay.appendChild(copy);

    const msr = document.createElement('div');
    msr.className = 'sw-measure';
    overlay.appendChild(msr);

    const t1 = performance.now();
    for (;;) {
      const t = Math.min(1, (performance.now() - t1) / OPTS.dupMs), k = easeOut(t);
      const mb = box(master), tb = box(el);
      const x = mb.x + (tb.x - mb.x) * k, y = mb.y + (tb.y - mb.y) * k;
      copy.style.left = x + 'px'; copy.style.top = y + 'px';
      copy.style.width = tb.w + 'px'; copy.style.height = tb.h + 'px';
      msr.textContent = Math.round(Math.abs(tb.x - mb.x)) + ' px';
      msr.style.left = (Math.max(mb.x, tb.x) + tb.w + 8) + 'px';
      msr.style.top = (y + tb.h * 0.5) + 'px';
      c.x = x + tb.w * 0.85; c.y = y + tb.h * 0.75;
      place(c.el, c.x, c.y);
      if (t >= 1) break;
      await raf();
    }

    el.classList.remove('sw-pending');
    el.classList.add('sw-done');
    [copy, sel, msr].forEach((n) => {
      n.style.transition = 'opacity .16s ease';
      n.style.opacity = '0';
      setTimeout(() => n.remove(), 220);
    });
  }

  /* ---------------- 分类 ---------------- */
  function classify(el) {
    if (el.tagName === 'HR') return 'line';
    const imgs = el.querySelectorAll('img, svg, video, canvas').length;
    const txt = (el.textContent || '').trim();
    const textish = /^(H1|H2|H3|H4|H5|P|LI|SPAN|STRONG|EM|B|I|A|BLOCKQUOTE)$/.test(el.tagName);
    if (textish && txt && !imgs) return 'text';
    if (imgs && !txt) return 'media';
    if (txt && el.children.length <= 1 && txt.length <= 90) return 'text';
    return 'rect';
  }

  function masterOf(el) {
    const p = el.parentElement;
    if (!p) return null;
    const cls = Array.prototype.slice.call(el.classList).sort().join('.');
    if (!cls) return null;
    const sibs = Array.prototype.filter.call(p.children, (s) =>
      s.tagName === el.tagName && Array.prototype.slice.call(s.classList).sort().join('.') === cls);
    if (sibs.length < 3) return null;
    return sibs[0] === el ? null : sibs[0];
  }

  /* ---------------- 主流程 ---------------- */
  async function run() {
    let targets;
    if (OPTS.only) {
      targets = Array.prototype.slice.call(document.querySelectorAll(OPTS.only));
    } else {
      const hero = Array.prototype.slice.call(document.querySelectorAll(OPTS.heroSelectors));
      const cand = Array.prototype.slice.call(document.querySelectorAll(OPTS.selectors))
        .filter((el) => !el.closest('.hero'));
      const blocks = cand.filter((el) => !cand.some((o) => o !== el && el.contains(o)));
      targets = hero.concat(blocks);
    }
    if (!targets.length) return;

    buildOverlay();
    document.documentElement.classList.add('swarming');
    targets.forEach((el) => el.classList.add('sw-pending'));

    const cursors = [];
    for (let i = 0; i < OPTS.maxCursors; i++) cursors.push(makeCursor(i));

    const queue = targets.slice();
    let busy = 0, done = 0, finished = false;

    // 由 IntersectionObserver 标记「已进入视口附近」，只从这里取任务：
    // 元素离屏时 getBoundingClientRect 会给出 0 或错误值，直接看 top 会把光标拉到页面最下方
    function takeNext() {
      for (let i = 0; i < queue.length; i++) {
        const el = queue[i];
        if (el.dataset.swReady !== '1') continue;
        const b = el.getBoundingClientRect();
        if (b.height === 0) { queue.splice(i, 1); el.classList.remove('sw-pending'); i--; continue; }
        queue.splice(i, 1);
        return el;
      }
      return null;
    }

    function pump() {
      if (queue.some((e) => e.dataset.swReady === '1')) startWander();
      while (busy < cursors.length) {
        const free = cursors.find((c) => !c.busy);
        if (!free) break;
        const el = takeNext();
        if (!el) break;
        free.busy = true; busy++;
        free.el.style.opacity = '1';
        startWander();
        settle(el, free)
          .then(() => {
            busy--; done++; free.busy = false;
            if (done >= targets.length) finale();
            else { pump(); settleIdle(); }
          })
          .catch((e) => { console.warn('[swarm]', e); busy--; free.busy = false; });
      }
    }

    function settle(el, c) {
      const master = masterOf(el);
      if (master && !master.classList.contains('sw-pending')) return taskDup(el, master, c);
      const kind = classify(el);
      if (kind === 'text') return taskText(el, c);
      if (kind === 'media') return taskMedia(el, c);
      if (kind === 'line') return taskLine(el, c);
      return taskRect(el, c);
    }

    // 视口附近才放行（含 400px 提前量，滚到之前就开始画）
    const io = new IntersectionObserver((entries) => {
      let any = false;
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.dataset.swReady = '1';
        io.unobserve(e.target);
        any = true;
      }
      if (any) pump();
    }, { rootMargin: '0px 0px 420px 0px', threshold: 0.01 });
    targets.forEach((el) => io.observe(el));

    // 空闲光标缓慢漂移：参考实现里光标一直在动，屏幕才有"很多人在一起干活"的感觉
    let wanderRaf = 0, wanderOn = false, idleTimer = 0;

    function startWander() {
      clearTimeout(idleTimer);
      if (finished || wanderOn) return;
      wanderOn = true;
      wanderRaf = requestAnimationFrame(wander);
    }

    // 没活干了：光标淡出并停住（滚到新内容时会再出来）
    function settleIdle() {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (finished || busy > 0) return;
        wanderOn = false;
        cancelAnimationFrame(wanderRaf);
        for (const c of cursors) if (!c.busy) c.el.style.opacity = '0';
      }, 700);
    }

    function wander(now) {
      if (finished || !wanderOn) return;
      const z = zoomOf();
      for (const c of cursors) {
        if (c.busy) continue;
        if (now > c.nextWander) {
          c.nextWander = now + 1200 + Math.random() * 1800;
          c.wx = (innerWidth * (0.08 + Math.random() * 0.84) - offX) / z;
          c.wy = (innerHeight * (0.12 + Math.random() * 0.72) - offY) / z;
        }
        c.x += (c.wx - c.x) * 0.012;
        c.y += (c.wy - c.y) * 0.012;
        place(c.el, c.x, c.y);
      }
      wanderRaf = requestAnimationFrame(wander);
    }

    pump();

    let ticking = false;
    addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { ticking = false; startWander(); pump(); settleIdle(); });
    }, { passive: true });

    // 兜底：屏幕上等了 2.6 秒还没被画的，直接放出来（绝不留下看不见的内容）
    const sweep = setInterval(() => {
      const left = document.querySelectorAll('.sw-pending');
      if (!left.length) { clearInterval(sweep); return; }
      for (const el of left) {
        const b = el.getBoundingClientRect();
        if (b.height > 0 && b.top < innerHeight && b.bottom > 0) {
          const w = Number(el.dataset.swWaited || 0) + 500;
          el.dataset.swWaited = String(w);
          if (w > 2600) { el.classList.remove('sw-pending'); el.classList.add('sw-done'); }
        }
      }
      pump();
    }, 500);

    function finale() {
      if (finished) return;
      finished = true;
      clearInterval(sweep);
      try { io.disconnect(); } catch (e) {}
      try { cancelAnimationFrame(wanderRaf); } catch (e) {}
      cursors.forEach((c) => {
        c.el.style.transition = 'opacity .55s ease';
        c.el.style.opacity = '0';
      });
      setTimeout(() => {
        document.documentElement.classList.remove('swarming');
        if (overlay) overlay.remove();
        document.dispatchEvent(new CustomEvent('swarm:done'));
      }, 640);
    }
  }

  let started = false;
  const start = () => { if (!started) { started = true; run().catch((e) => console.warn('[swarm]', e)); } };
  const afterPaint = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));

  if (document.readyState === 'loading') {
    addEventListener('DOMContentLoaded', () => afterPaint(start), { once: true });
  } else {
    afterPaint(start);
  }
})();
