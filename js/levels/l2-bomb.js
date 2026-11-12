/* 第 2 關｜拆彈小組（單元 5：指數方程式、不等式與應用）
   四條電線各掛一個答案，用手指「劃過」電線把正確那條剪斷。 */
'use strict';
(function (LG) {
  const U = LG.util;

  // opts 第一個是正解；verify 只給自動測試用
  const Q = (key, prompt, opts, hint, explain, verify) => ({ key, prompt, opts, hint, explain, verify });
  const BANK = {
    easy: [
      Q('e1', '解方程式 $2^{x+1}=16$', ['$x=3$', '$x=4$', '$x=7$', '$x=8$'],
        '把 $16$ 寫成 $2^{4}$，再比較指數',
        '$2^{x+1}=2^{4}\\Rightarrow x+1=4\\Rightarrow x=3$',
        { t: 'eq', f: x => Math.pow(2, x + 1) - 16, roots: [3] }),
      Q('e2', '解方程式 $\\left(\\dfrac12\\right)^{x}=8$', ['$x=-3$', '$x=3$', '$x=-\\dfrac13$', '$x=4$'],
        '$8=2^{3}=\\left(\\frac12\\right)^{-3}$',
        '$\\left(\\frac12\\right)^{x}=\\left(\\frac12\\right)^{-3}\\Rightarrow x=-3$',
        { t: 'eq', f: x => Math.pow(0.5, x) - 8, roots: [-3] }),
      Q('e3', '解方程式 $3^{x}=\\dfrac{1}{9}$', ['$x=-2$', '$x=2$', '$x=-\\dfrac12$', '$x=-3$'],
        '$\\frac19=\\frac{1}{3^{2}}=3^{-2}$',
        '$3^{x}=3^{-2}\\Rightarrow x=-2$',
        { t: 'eq', f: x => Math.pow(3, x) - 1 / 9, roots: [-2] }),
      Q('e4', '解不等式 $2^{x}<8$', ['$x<3$', '$x>3$', '$x<4$', '$0<x<3$'],
        '$8=2^{3}$；底數 $2>1$，不等號方向不變',
        '$2^{x}<2^{3}$，底數大於 1，所以 $x<3$',
        { t: 'ineq', p: x => Math.pow(2, x) < 8, a: x => x < 3 }),
      Q('e5', '解不等式 $\\left(\\dfrac13\\right)^{x}>\\dfrac19$', ['$x<2$', '$x>2$', '$x<-2$', '$x>-2$'],
        '$\\frac19=\\left(\\frac13\\right)^{2}$；底數小於 1，不等號要變向',
        '$\\left(\\frac13\\right)^{x}>\\left(\\frac13\\right)^{2}$，底數 $0<\\frac13<1$，所以 $x<2$',
        { t: 'ineq', p: x => Math.pow(1 / 3, x) > 1 / 9, a: x => x < 2 }),
      Q('e6', '解方程式 $9^{x}=27$', ['$x=\\dfrac32$', '$x=3$', '$x=\\dfrac23$', '$x=\\dfrac13$'],
        '化成同底數：$9=3^{2}$、$27=3^{3}$',
        '$3^{2x}=3^{3}\\Rightarrow 2x=3\\Rightarrow x=\\frac32$',
        { t: 'eq', f: x => Math.pow(9, x) - 27, roots: [1.5] }),
      Q('e7', '碘 131 的半衰期是 8 天。經過 24 天後，剩下原來的幾分之幾？', ['$\\dfrac18$', '$\\dfrac13$', '$\\dfrac1{16}$', '$\\dfrac1{24}$'],
        '24 天是 3 個半衰期：$\\left(\\frac12\\right)^{\\frac{24}{8}}$',
        '$\\left(\\frac12\\right)^{\\frac{24}{8}}=\\left(\\frac12\\right)^{3}=\\frac18$',
        { t: 'val', got: Math.pow(0.5, 24 / 8), want: 1 / 8 }),
      Q('e8', '大腸桿菌每 30 分鐘數量變為 2 倍。經過 2 小時，數量變為原來的幾倍？', ['$16$ 倍', '$4$ 倍', '$8$ 倍', '$32$ 倍'],
        '2 小時是 4 個 30 分鐘',
        '$2^{\\frac{120}{30}}=2^{4}=16$',
        { t: 'val', got: Math.pow(2, 120 / 30), want: 16 })
    ],
    normal: [
      Q('n1', '解方程式 $2^{\\frac{x}{30}}=1024$', ['$x=300$', '$x=10$', '$x=30$', '$x=320$'],
        '$1024=2^{10}$',
        '$2^{\\frac{x}{30}}=2^{10}\\Rightarrow\\frac{x}{30}=10\\Rightarrow x=300$',
        { t: 'eq', f: x => x / 30 - 10, roots: [300], range: [-2000, 2000] }),
      Q('n2', '解方程式 $3^{x}=3\\sqrt{3}$', ['$x=\\dfrac32$', '$x=3$', '$x=\\dfrac12$', '$x=\\dfrac23$'],
        '$3\\sqrt3=3^{1}\\times3^{\\frac12}$',
        '$3\\sqrt3=3^{\\frac32}\\Rightarrow x=\\frac32$',
        { t: 'eq', f: x => Math.pow(3, x) - 3 * Math.sqrt(3), roots: [1.5] }),
      Q('n3', '解方程式 $4^{x}=8$', ['$x=\\dfrac32$', '$x=2$', '$x=\\dfrac23$', '$x=\\dfrac12$'],
        '$4=2^{2}$、$8=2^{3}$',
        '$2^{2x}=2^{3}\\Rightarrow x=\\frac32$',
        { t: 'eq', f: x => Math.pow(4, x) - 8, roots: [1.5] }),
      Q('n4', '解不等式 $(0.7)^{x^{2}}>(0.49)^{x}$', ['$0<x<2$', '$x<0$ 或 $x>2$', '$x>2$', '$x<2$'],
        '$0.49=(0.7)^{2}$；底數 $0.7<1$，函數遞減，不等號要變向',
        '$(0.7)^{x^{2}}>(0.7)^{2x}\\Rightarrow x^{2}<2x\\Rightarrow 0<x<2$',
        { t: 'ineq', p: x => Math.pow(0.7, x * x) > Math.pow(0.49, x), a: x => x > 0 && x < 2 }),
      Q('n5', '解不等式 $\\left(\\dfrac12\\right)^{x}>4$', ['$x<-2$', '$x>-2$', '$x>2$', '$x<2$'],
        '$4=\\left(\\frac12\\right)^{-2}$；底數小於 1，不等號要變向',
        '$\\left(\\frac12\\right)^{x}>\\left(\\frac12\\right)^{-2}\\Rightarrow x<-2$',
        { t: 'ineq', p: x => Math.pow(0.5, x) > 4, a: x => x < -2 }),
      Q('n6', '解不等式 $3^{2x+1}>\\dfrac13$', ['$x>-1$', '$x<-1$', '$x>0$', '$x>-2$'],
        '$\\frac13=3^{-1}$；底數 $3>1$',
        '$3^{2x+1}>3^{-1}\\Rightarrow 2x+1>-1\\Rightarrow x>-1$',
        { t: 'ineq', p: x => Math.pow(3, 2 * x + 1) > 1 / 3, a: x => x > -1 }),
      Q('n7', '碘 131 的半衰期是 8 天。食材含量 3200 要降到 100 以下，至少要超過幾天？', ['$40$ 天', '$32$ 天', '$48$ 天', '$25$ 天'],
        '$\\frac{100}{3200}=\\frac{1}{32}=\\left(\\frac12\\right)^{5}$',
        '$\\left(\\frac12\\right)^{\\frac{x}{8}}<\\left(\\frac12\\right)^{5}\\Rightarrow\\frac{x}{8}>5\\Rightarrow x>40$',
        { t: 'ineq', p: x => 3200 * Math.pow(0.5, x / 8) < 100, a: x => x > 40, range: [0, 300] }),
      Q('n8', '電晶體數目每 2 年變為 2 倍。若 $t$ 年後變為原來的 $a^{t}$ 倍，則 $a=$？', ['$a=\\sqrt{2}$', '$a=2$', '$a=4$', '$a=\\dfrac12$'],
        '$t$ 年有 $\\frac{t}{2}$ 個「2 年」：變為 $2^{\\frac{t}{2}}$ 倍',
        '$2^{\\frac{t}{2}}=\\left(2^{\\frac12}\\right)^{t}\\Rightarrow a=\\sqrt2$',
        { t: 'val', got: Math.pow(2, 1 / 2), want: Math.SQRT2 }),
      Q('n9', '解方程式 $25^{x-1}=5$', ['$x=\\dfrac32$', '$x=\\dfrac12$', '$x=2$', '$x=\\dfrac52$'],
        '$25=5^{2}$',
        '$5^{2x-2}=5^{1}\\Rightarrow 2x-2=1\\Rightarrow x=\\frac32$',
        { t: 'eq', f: x => Math.pow(25, x - 1) - 5, roots: [1.5] }),
      Q('n10', '碳 14 的半衰期約 5700 年。某化石的碳 14 剩下原來的 $\\dfrac18$，大約是幾年前的生物？', ['$17100$ 年', '$11400$ 年', '$22800$ 年', '$5700$ 年'],
        '$\\frac18=\\left(\\frac12\\right)^{3}$：經過 3 個半衰期',
        '$\\left(\\frac12\\right)^{\\frac{x}{5700}}=\\left(\\frac12\\right)^{3}\\Rightarrow x=3\\times5700=17100$',
        { t: 'eq', f: x => x / 5700 - 3, roots: [17100], range: [0, 60000] }),
      Q('n11', '解不等式 $\\left(\\dfrac45\\right)^{x+2}>1$', ['$x<-2$', '$x>-2$', '$x>2$', '$x<2$'],
        '$1=\\left(\\frac45\\right)^{0}$；底數小於 1，不等號要變向',
        '$\\left(\\frac45\\right)^{x+2}>\\left(\\frac45\\right)^{0}\\Rightarrow x+2<0\\Rightarrow x<-2$',
        { t: 'ineq', p: x => Math.pow(0.8, x + 2) > 1, a: x => x < -2 })
    ],
    hard: [
      Q('h1', '解方程式 $4^{x}-7\\cdot2^{x}-8=0$', ['$x=3$', '$x=8$ 或 $x=-1$', '$x=8$', '$x=3$ 或 $x=-1$'],
        '設 $t=2^{x}>0$，得 $t^{2}-7t-8=0$',
        '$(t-8)(t+1)=0$，因為 $t=2^{x}>0$，只取 $t=8$，所以 $x=3$',
        { t: 'eq', f: x => Math.pow(4, x) - 7 * Math.pow(2, x) - 8, roots: [3] }),
      Q('h2', '解方程式 $9^{x}+3^{x+1}-18=0$', ['$x=1$', '$x=1$ 或 $x=-6$', '$x=3$', '$x=3$ 或 $x=-6$'],
        '設 $t=3^{x}>0$，得 $t^{2}+3t-18=0$',
        '$(t+6)(t-3)=0$，只取 $t=3$，所以 $x=1$',
        { t: 'eq', f: x => Math.pow(9, x) + Math.pow(3, x + 1) - 18, roots: [1] }),
      Q('h3', '解不等式 $4^{x}-3\\cdot2^{x}+2<0$', ['$0<x<1$', '$1<x<2$', '$x<0$ 或 $x>1$', '$x>1$'],
        '設 $t=2^{x}$，得 $(t-1)(t-2)<0$',
        '$1<2^{x}<2\\Rightarrow 0<x<1$',
        { t: 'ineq', p: x => Math.pow(4, x) - 3 * Math.pow(2, x) + 2 < 0, a: x => x > 0 && x < 1 }),
      Q('h4', '解不等式 $4^{x}-2^{x+1}-8>0$', ['$x>2$', '$x>4$', '$x<-2$ 或 $x>4$', '$x<-1$ 或 $x>2$'],
        '設 $t=2^{x}>0$，得 $t^{2}-2t-8>0$',
        '$(t-4)(t+2)>0$ 且 $t>0$，所以 $t>4$，即 $2^{x}>2^{2}$，$x>2$',
        { t: 'ineq', p: x => Math.pow(4, x) - Math.pow(2, x + 1) - 8 > 0, a: x => x > 2 }),
      Q('h5', '解不等式 $(0.3)^{x^{2}-x}>(0.09)^{2x+3}$', ['$-1<x<6$', '$x<-1$ 或 $x>6$', '$-6<x<1$', '$x<-6$ 或 $x>1$'],
        '$0.09=(0.3)^{2}$；底數小於 1，不等號要變向',
        '$x^{2}-x<4x+6\\Rightarrow x^{2}-5x-6<0\\Rightarrow -1<x<6$',
        { t: 'ineq', p: x => (x * x - x) * Math.log(0.3) > (2 * x + 3) * Math.log(0.09), a: x => x > -1 && x < 6 }),
      Q('h6', '解方程式 $2^{3x^{2}}=4\\cdot2^{5x}$', ['$x=2$ 或 $x=-\\dfrac13$', '$x=2$', '$x=-2$ 或 $x=\\dfrac13$', '$x=\\dfrac13$'],
        '$4\\cdot2^{5x}=2^{5x+2}$，比較兩邊的指數',
        '$3x^{2}=5x+2\\Rightarrow(3x+1)(x-2)=0\\Rightarrow x=2$ 或 $x=-\\frac13$',
        { t: 'eq', f: x => 3 * x * x - (5 * x + 2), roots: [2, -1 / 3] }),
      Q('h7', '甲、乙兩種放射性物質起初質量相同，甲的半衰期是 30 小時。120 小時後甲的質量是乙的 2 倍，乙的半衰期是幾小時？', ['$24$ 小時', '$20$ 小時', '$40$ 小時', '$60$ 小時'],
        '120 小時後甲剩 $\\left(\\frac12\\right)^{4}$，所以乙剩 $\\left(\\frac12\\right)^{5}$',
        '乙經過 5 個半衰期：$\\frac{120}{5}=24$ 小時',
        { t: 'val', got: Math.pow(0.5, 120 / 30) / Math.pow(0.5, 120 / 24), want: 2 }),
      Q('h8', '碳 14 的半衰期約 5700 年。某雕像的碳 14 少於原來的 $\\dfrac1{16}$，它至少是幾年前的古物？', ['$22800$ 年', '$17100$ 年', '$11400$ 年', '$28500$ 年'],
        '$\\frac1{16}=\\left(\\frac12\\right)^{4}$；底數小於 1，不等號要變向',
        '$\\left(\\frac12\\right)^{\\frac{x}{5700}}<\\left(\\frac12\\right)^{4}\\Rightarrow\\frac{x}{5700}>4\\Rightarrow x>22800$',
        { t: 'ineq', p: x => Math.pow(0.5, x / 5700) < 1 / 16, a: x => x > 22800, range: [0, 100000] })
    ]
  };

  const WIRE = ['#ff5d5d', '#4da3ff', '#ffd34d', '#5ee08a'];

  const BOMB = `<svg class="bomb-svg" viewBox="0 0 320 128" aria-hidden="true">
    <g class="sticks"><rect x="18" y="16" width="284" height="28" rx="13"/><rect x="18" y="50" width="284" height="28" rx="13"/><rect x="18" y="84" width="284" height="28" rx="13"/></g>
    <rect class="strap" x="50" y="10" width="13" height="108" rx="3"/><rect class="strap" x="257" y="10" width="13" height="108" rx="3"/>
    <rect class="box" x="92" y="18" width="136" height="92" rx="10"/>
    <rect class="screen" x="104" y="31" width="112" height="52" rx="6"/>
    <text class="bt" x="160" y="69" text-anchor="middle">00:45</text>
    <circle class="led" cx="211" cy="97" r="5"/>
    <rect class="grill" x="110" y="92" width="70" height="4" rx="2"/><rect class="grill" x="110" y="99" width="52" height="4" rx="2"/>
  </svg>`;

  const bez = (a, b, c, d, t) => {
    const u = 1 - t;
    return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
  };

  class L2 extends LG.LevelBase {
    static pick(diff) { return U.pickFresh('l2' + diff, BANK[diff], q => q.key); }

    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.2;
      this.setQuestion(U.rich(q.prompt));
      const m = scr.main;
      m.classList.add('l2');
      m.innerHTML = `<div class="bomb">${BOMB}</div>
        <div class="wires"><svg class="w-svg"></svg><canvas class="w-blade"></canvas><div class="w-tags"></div></div>`;
      this.bombEl = m.querySelector('.bomb');
      this.timeTxt = m.querySelector('.bomb .bt');
      this.wiresEl = m.querySelector('.wires');
      this.svg = m.querySelector('.w-svg');
      this.blade = m.querySelector('.w-blade');
      this.bctx = this.blade.getContext('2d');
      this.tagsEl = m.querySelector('.w-tags');
      const order = U.shuffle([0, 1, 2, 3]);
      this.wires = order.map((oi, s) => ({ s, oi, color: WIRE[s], cut: false, cutX: 0, cutT: 0, droop: 0, state: '' }));
      this.tags = this.wires.map(w => {
        const t = U.el('div', 'w-tag', U.rich(q.opts[w.oi]));
        t.style.setProperty('--wc', w.color);
        this.tagsEl.appendChild(t);
        return t;
      });
      this.bombState = 'live';
      this.trail = [];
      this.setGoLabel('<span class="sc">✂</span> 用手指劃過電線來剪斷');
      LG.input.onDrag(this.wiresEl, {
        down: (e, p) => {
          if (!this.playing) return false;
          this.stroke = { flags: this.wires.map(() => ({ a: false, b: false })), done: false };
          this.sid = (this.sid || 0) + 1;
          this.addTrail(p);
        },
        move: (e, p) => this.onMove(p),
        up: () => { this.stroke = null; },
        cancel: () => { this.stroke = null; }
      });
    }

    layout() {
      const r = this.wiresEl.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;
      this.W = r.width; this.H = r.height;
      this.svg.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
      const s = Math.min(this.scale(), 2);
      this.bs = s;
      this.blade.width = Math.round(r.width * s);
      this.blade.height = Math.round(r.height * s);
      const xL = r.width * 0.035, xR = r.width * 0.965, sag = r.height * 0.045;
      this.wires.forEach((w, i) => {
        const y = r.height * (0.125 + i * 0.25);
        Object.assign(w, { y, xL, xR, sag });
        w.pts = [];
        for (let k = 0; k <= 48; k++) {
          const t = k / 48;
          w.pts.push([bez(xL, xL + (xR - xL) * 0.3, xR - (xR - xL) * 0.3, xR, t), bez(y, y + sag, y + sag, y, t)]);
        }
        const tag = this.tags[i];
        tag.style.left = (r.width / 2) + 'px';
        tag.style.top = (y + sag * 0.75) + 'px';
      });
      this.renderWires();
      this.tags.forEach(t => U.fit(t, 0.6, true));
    }

    yAt(w, x) {
      const p = w.pts;
      for (let i = 1; i < p.length; i++) {
        if (p[i][0] >= x) {
          const a = p[i - 1], b = p[i], t = (x - a[0]) / Math.max(1e-6, b[0] - a[0]);
          return a[1] + (b[1] - a[1]) * t;
        }
      }
      return p[p.length - 1][1];
    }

    cutPieces(w) {
      const gap = this.W * 0.018, d = w.droop, left = [], right = [];
      for (const p of w.pts) {
        if (p[0] < w.cutX - gap) {
          const k = (p[0] - w.xL) / Math.max(1, w.cutX - gap - w.xL);
          left.push([p[0], p[1] + d * k * k]);
        } else if (p[0] > w.cutX + gap) {
          const k = (w.xR - p[0]) / Math.max(1, w.xR - w.cutX - gap);
          right.push([p[0], p[1] + d * k * k]);
        }
      }
      return [left, right].filter(a => a.length > 1);
    }

    renderWires() {
      if (!this.W) return;
      const sw = Math.max(4, this.W * 0.016);
      let html = '';
      for (const w of this.wires) {
        if (!w.pts) continue;
        const pieces = w.cut ? this.cutPieces(w) : [w.pts];
        for (const pc of pieces) {
          const d = 'M' + pc.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
          html += `<path d="${d}" class="w-shadow" stroke-width="${(sw * 1.9).toFixed(1)}"/>`;
          html += `<path d="${d}" class="w-line ${w.state}" stroke="${w.color}" stroke-width="${sw.toFixed(1)}"/>`;
        }
        const th = sw * 2.6;
        html += `<rect class="w-term" x="${(w.xL - th * 0.6).toFixed(1)}" y="${(w.y - th / 2).toFixed(1)}" width="${(th * 0.9).toFixed(1)}" height="${th.toFixed(1)}" rx="3"/>`;
        html += `<rect class="w-term" x="${(w.xR - th * 0.3).toFixed(1)}" y="${(w.y - th / 2).toFixed(1)}" width="${(th * 0.9).toFixed(1)}" height="${th.toFixed(1)}" rx="3"/>`;
      }
      this.svg.innerHTML = html;
    }

    addTrail(p) { this.trail.push({ x: p.x, y: p.y, age: 0, sid: this.sid }); }

    onMove(p) {
      this.addTrail(p);
      const st = this.stroke;
      if (!st || st.done || !this.playing) return;
      const d = Math.max(5, LG.settings.dragPx(this.zone.inner.clientWidth) * 0.8);
      for (let i = 0; i < this.wires.length; i++) {
        const w = this.wires[i];
        if (w.cut || !w.pts || p.x < w.xL || p.x > w.xR) continue;
        const wy = this.yAt(w, p.x), f = st.flags[i];
        if (p.y < wy - d) f.a = true;
        if (p.y > wy + d) f.b = true;
        if (f.a && f.b) { st.done = true; this.cut(w, p.x); break; }
      }
    }

    cut(w, x) {
      w.cut = true; w.cutX = x; w.cutT = 0;
      LG.audio.play('cut');
      const o = this.zoff(this.wiresEl);
      this.zone.fx.burst(o.x + x, o.y + this.yAt(w, x), { n: 22, colors: ['#fff6c0', '#ffd34d', w.color], speed: [120, 380], gravity: 700 });
      this.lastCut = w;
      const r = this.submit(w.oi === 0);
      if (r === 'retry') {
        w.state = 'bad';
        this.tags[w.s].classList.add('bad');
        this.bombEl.classList.remove('angry'); void this.bombEl.offsetWidth; this.bombEl.classList.add('angry');
      }
      this.renderWires();
    }

    setBomb(state) {
      this.bombState = state;
      this.bombEl.classList.add(state);
      this.timeTxt.textContent = state === 'safe' ? 'SAFE' : 'BOOM';
    }

    celebrate() {
      if (!this.lastCut) { const w0 = this.wires.find(x => x.oi === 0); w0.cut = true; w0.cutX = (w0.xL + w0.xR) / 2 || 0; this.lastCut = w0; }
      const w = this.lastCut;
      w.state = 'ok';
      this.tags[w.s].classList.add('ok');
      this.tags.forEach((t, i) => { if (i !== w.s) t.classList.add('dim'); });
      this.setBomb('safe');
      const p = this.zone.fx.rel(this.bombEl);
      this.zone.fx.confetti(p.x, p.y, { n: 40 });
      this.renderWires();
    }

    reveal() {
      if (this.lastCut && this.lastCut.oi !== 0 && this.lastCut.state !== 'bad') {
        this.lastCut.state = 'bad';
        this.tags[this.lastCut.s].classList.add('bad');
      }
      this.setBomb('boom');
      LG.audio.play('boom');
      const right = this.wires.find(w => w.oi === 0);
      right.state = 'answer';
      this.tags[right.s].classList.add('answer');
      const p = this.zone.fx.rel(this.bombEl);
      this.zone.fx.burst(p.x, p.y, { n: 36, colors: ['#ff8f73', '#ffd34d', '#ffffff'], speed: [200, 560], gravity: 300, size: [4, 10] });
      this.renderWires();
    }

    update(dt) {
      if (this.bombState === 'live') {
        const t = Math.max(0, Math.ceil(this.zone.timeLeft - 1e-6));
        if (t !== this.lastT) {
          this.lastT = t;
          this.timeTxt.textContent = String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
          this.bombEl.classList.toggle('hurry', t <= 10 && this.playing);
        }
      }
      let anim = false;
      for (const w of this.wires) {
        if (w.cut && w.cutT < 1) {
          w.cutT = Math.min(1, w.cutT + dt / 0.55);
          w.droop = this.H * 0.17 * U.ease.outBack(w.cutT);
          anim = true;
        }
      }
      if (anim) this.renderWires();
      this.drawTrail(dt);
    }

    drawTrail(dt) {
      const g = this.bctx;
      if (!this.trail.length) {
        if (this.trailDirty) { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, this.blade.width, this.blade.height); this.trailDirty = false; }
        return;
      }
      for (const p of this.trail) p.age += dt;
      while (this.trail.length && this.trail[0].age > 0.22) this.trail.shift();
      const s = this.bs || 1;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, this.blade.width, this.blade.height);
      g.setTransform(s, 0, 0, s, 0, 0);
      g.lineCap = 'round';
      for (let i = 1; i < this.trail.length; i++) {
        const a = this.trail[i - 1], b = this.trail[i];
        if (a.sid !== b.sid) continue;
        const k = 1 - b.age / 0.22;
        g.strokeStyle = `rgba(255, 246, 200, ${(0.9 * k).toFixed(3)})`;
        g.lineWidth = Math.max(2, this.W * 0.012 * k);
        g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
      }
      this.trailDirty = true;
    }
  }

  L2.meta = { id: 2, name: '拆彈小組', unit: 5, topic: '指數方程式與不等式' };
  L2.BANK = BANK;
  LG.registerLevel(L2);
})(window.LG);
