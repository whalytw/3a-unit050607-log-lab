/* 第 5 關｜鏡像傳送門（單元 7：對數函數的圖形與對稱）
   發光曲線穿過「傳送門」（直線 y=x、x 軸或 y 軸）後會變成哪一條？從三張卡片中選出。 */
'use strict';
(function (LG) {
  const U = LG.util;

  // 曲線：EXP(n,d) 為 y=(n/d)^x；LOG(n,d,kn,kd) 為 y=(kn/kd)·log_{n/d} x（n=10,d=1 為常用對數）
  const EXP = (n, d) => ({ k: 'exp', n, d: d || 1 });
  const LOG = (n, d, kn, kd) => ({ k: 'log', n, d: d || 1, kn: kn == null ? 1 : kn, kd: kd || 1 });
  const Q = (key, src, mirrors, opts, mid) => ({ key, src, mirrors, opts, mid });

  const BANK = {
    easy: [
      Q('e1', EXP(2), ['yx'], [LOG(2), LOG(1, 2), EXP(1, 2)]),
      Q('e2', EXP(10), ['yx'], [LOG(10), LOG(10, 1, -1), EXP(1, 10)]),
      Q('e3', LOG(10), ['xaxis'], [LOG(10, 1, -1), EXP(10), EXP(1, 10)]),
      Q('e4', EXP(3), ['yaxis'], [EXP(1, 3), LOG(3), LOG(1, 3)]),
      Q('e5', EXP(2), ['yaxis'], [EXP(1, 2), LOG(2), LOG(1, 2)]),
      Q('e6', LOG(2), ['yx'], [EXP(2), EXP(1, 2), LOG(1, 2)])
    ],
    normal: [
      Q('n1', LOG(10, 1, 2), ['xaxis'], [LOG(10, 1, -2), LOG(10, 1, 1, 2), LOG(10, 1, -1, 2)]),
      Q('n2', LOG(10, 1, -3), ['xaxis'], [LOG(10, 1, 3), LOG(10, 1, 1, 3), LOG(10, 1, -1, 3)]),
      Q('n3', EXP(1, 2), ['yx'], [LOG(1, 2), LOG(2), EXP(2)]),
      Q('n4', LOG(3), ['yx'], [EXP(3), EXP(1, 3), LOG(1, 3)]),
      Q('n5', EXP(1, 4), ['yaxis'], [EXP(4), LOG(4), LOG(1, 4)]),
      Q('n6', LOG(10, 1, 3), ['xaxis'], [LOG(10, 1, -3), LOG(10, 1, 1, 3), LOG(10, 1, -1, 3)])
    ],
    hard: [
      Q('h1', LOG(2), ['xaxis'], [LOG(1, 2), EXP(1, 2), EXP(2)]),
      Q('h2', LOG(1, 3), ['yx'], [EXP(1, 3), EXP(3), LOG(3)]),
      Q('h3', LOG(1, 2), ['xaxis'], [LOG(2), EXP(2), EXP(1, 2)]),
      Q('h4', EXP(10), ['yx', 'xaxis'], [LOG(10, 1, -1), LOG(10), EXP(1, 10)], LOG(10)),
      Q('h5', EXP(2), ['yaxis', 'yx'], [LOG(1, 2), LOG(2), EXP(1, 2)], EXP(1, 2)),
      Q('h6', EXP(3), ['yx', 'xaxis'], [LOG(1, 3), LOG(3), EXP(1, 3)], LOG(3))
    ]
  };

  const MNAME = { yx: '直線 $y=x$', xaxis: '$x$ 軸', yaxis: '$y$ 軸' };
  const MHINT = {
    yx: '$y=a^{x}$ 與 $y=\\log_a x$ 的圖形對稱於直線 $y=x$',
    xaxis: '$y=t\\log x$ 與 $y=-t\\log x$ 對稱於 $x$ 軸；$\\log_{\\frac1a}x=-\\log_a x$',
    yaxis: '$y=a^{x}$ 與 $y=\\left(\\frac1a\\right)^{x}$ 對稱於 $y$ 軸'
  };
  const WIN = {
    yx: { xmin: -3.4, xmax: 6.4, ymin: -3.4, ymax: 4.8 },
    xaxis: { xmin: -0.8, xmax: 7.4, ymin: -3.6, ymax: 3.6 },
    yaxis: { xmin: -4.2, xmax: 4.2, ymin: -0.9, ymax: 5.4 },
    'yx,xaxis': { xmin: -3.4, xmax: 6.4, ymin: -4.2, ymax: 4.6 },
    'yaxis,yx': { xmin: -4.2, xmax: 5.6, ymin: -3.4, ymax: 4.8 }
  };

  function frac(n, d) { return d === 1 ? `${n}` : `\\frac{${n}}{${d}}`; }
  function ctex(c) {
    if (c.k === 'exp') return 'y=' + (c.d === 1 ? `${c.n}` : `\\left(\\frac{${c.n}}{${c.d}}\\right)`) + '^{x}';
    const lg = (c.n === 10 && c.d === 1) ? '\\log' : `\\log_{${frac(c.n, c.d)}}`;
    let coef = '';
    if (!(c.kn === 1 && c.kd === 1)) {
      const an = Math.abs(c.kn);
      coef = (c.kn < 0 ? '-' : '') + (c.kd === 1 ? (an === 1 ? '' : `${an}`) : `\\frac{${an}}{${c.kd}}`);
    }
    return `y=${coef}${lg} x`;
  }
  function cfun(c) {
    const b = c.n / c.d;
    if (c.k === 'exp') return x => Math.pow(b, x);
    const k = c.kn / c.kd, lb = Math.log(b);
    return x => (x > 0 ? k * Math.log(x) / lb : NaN);
  }
  function sampleSpec(c, win) {
    const f = cfun(c);
    if (c.k === 'exp') return LG.Graph2D.sample(f, win.xmin - 1.5, win.xmax + 1.5, 520);
    return LG.Graph2D.sampleLog(f, win.xmax + 1.5, 620);
  }
  const REFL = {
    yx: p => [p[1], p[0]],
    xaxis: p => [p[0], -p[1]],
    yaxis: p => [-p[0], p[1]]
  };

  function build(e) {
    const two = e.mirrors.length === 2;
    const win = WIN[e.mirrors.join(',')];
    const prompt = two
      ? `曲線 $${ctex(e.src)}$ 先穿過 ① ${MNAME[e.mirrors[0]]}，再穿過 ② ${MNAME[e.mirrors[1]]}，最後變成哪一條？`
      : `發光曲線 $${ctex(e.src)}$ 穿過「${MNAME[e.mirrors[0]]}」傳送門（鏡射）後，會變成哪一條？`;
    const hint = [...new Set(e.mirrors)].map(m => MHINT[m]).join('\n');
    const explain = two
      ? `$${ctex(e.src)}$ → ① 得 $${ctex(e.mid)}$ → ② 得 $${ctex(e.opts[0])}$`
      : `$${ctex(e.src)}$ 對${MNAME[e.mirrors[0]]}對稱的圖形是 $${ctex(e.opts[0])}$`;
    return { key: e.key, src: e.src, mirrors: e.mirrors, opts: e.opts, win, prompt, hint, explain };
  }

  class L5 extends LG.LevelBase {
    static pick(diff) { return build(U.pickFresh('l5' + diff, BANK[diff], e => e.key)); }

    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.6;
      this.setQuestion(U.rich(q.prompt));
      const m = scr.main;
      m.classList.add('l5');
      m.innerHTML = `<div class="g-wrap"><canvas class="g-cv"></canvas><div class="g-tag src"></div></div><div class="opts3"></div>`;
      this.wrap = m.querySelector('.g-wrap');
      this.cv = m.querySelector('.g-cv');
      this.srcTag = m.querySelector('.g-tag.src');
      this.srcTag.innerHTML = U.tex(ctex(q.src));
      this.order = U.shuffle([0, 1, 2]);
      const box = m.querySelector('.opts3');
      this.cards = this.order.map((oi, s) => {
        const el = U.el('div', 'opt', `<div class="ox">${U.tex(ctex(q.opts[oi]))}</div>`);
        box.appendChild(el);
        LG.input.onTap(el, () => this.select(s), { sound: false, enabled: () => this.playing });
        return el;
      });
      this.graph = new LG.Graph2D(this.cv, Object.assign({ equal: true }, q.win));
      this.srcPts = sampleSpec(q.src, q.win);
      this.sel = -1;
      this.anim = null;
      this.wrong = [];
      this.final = null;
      this.time = 0;
      this.setGo('傳送！', () => this.go());
      this.setGoEnabled(false);
    }

    select(s) {
      if (!this.playing || this.cards[s].classList.contains('bad')) return;
      this.sel = s;
      LG.audio.play('select');
      this.cards.forEach((c, i) => c.classList.toggle('on', i === s));
      this.setGoEnabled(true);
    }

    layout() {
      const r = this.wrap.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;
      this.graph.resize(r.width, r.height, this.scale());
      this.cv.style.width = r.width + 'px';
      this.cv.style.height = r.height + 'px';
      // 來源曲線標籤：指數型放在曲線上方約 7 成高度處（往外側擺），對數型放在右側 8 成寬度處（上方或下方）
      const v = this.graph.view, isExp = this.q.src.k === 'exp';
      const ty = v.y0 + 0.7 * (v.y1 - v.y0), tx = v.x0 + 0.8 * (v.x1 - v.x0);
      let best = null, bd = Infinity;
      for (const p of this.srcPts) {
        if (!p || p[0] < v.x0 || p[0] > v.x1 || p[1] < v.y0 || p[1] > v.y1) continue;
        const d = isExp ? Math.abs(p[1] - ty) : Math.abs(p[0] - tx);
        if (d < bd) { bd = d; best = p; }
      }
      if (best) {
        const X = this.graph.cssX(best[0]), Y = this.graph.cssY(best[1]);
        if (isExp) {
          const right = best[0] >= 0;
          this.srcTag.style.left = (right ? X + r.width * 0.035 : X - r.width * 0.035) + 'px';
          this.srcTag.style.top = Y + 'px';
          this.srcTag.style.transform = `translate(${right ? '0' : '-100%'}, -50%)`;
        } else {
          const above = best[1] >= 0;
          this.srcTag.style.left = X + 'px';
          this.srcTag.style.top = (above ? Y - r.height * 0.07 : Y + r.height * 0.07) + 'px';
          this.srcTag.style.transform = 'translate(-60%, -50%)';
        }
      }
      this.cards.forEach(c => U.fit(c, 0.55));
    }

    go() {
      if (this.sel < 0 || this.anim) return;
      const oi = this.order[this.sel];
      this.lastPick = oi;
      const r = this.submit(oi === 0);
      if (r === 'retry') {
        this.wrong.push(sampleSpec(this.q.opts[oi], this.q.win));
        const c = this.cards[this.sel];
        c.classList.remove('on');
        c.classList.add('bad');
        this.sel = -1;
        this.setGoEnabled(false);
      }
    }

    morphPts(t) {
      // t ∈ [0, stages]：依序做各次鏡射
      const ms = this.q.mirrors;
      return this.srcPts.map(p => {
        if (!p) return null;
        let cur = p;
        for (let i = 0; i < ms.length; i++) {
          const k = U.clamp(t - i, 0, 1);
          if (k <= 0) break;
          const R = REFL[ms[i]](cur), e = U.ease.inOutCubic(k);
          cur = [cur[0] + (R[0] - cur[0]) * e, cur[1] + (R[1] - cur[1]) * e];
        }
        return cur;
      });
    }

    startMorph(kind) {
      this.anim = { t: 0, kind, dur: 0.95 * this.q.mirrors.length };
      LG.audio.play('zap');
    }

    celebrate() {
      this.cards[this.sel >= 0 ? this.sel : this.order.indexOf(0)].classList.add('ok');
      this.startMorph('ok');
    }

    reveal(reason) {
      if (reason !== 'timeout' && this.lastPick != null && this.lastPick !== 0) {
        this.wrong.push(sampleSpec(this.q.opts[this.lastPick], this.q.win));
        const s = this.order.indexOf(this.lastPick);
        this.cards[s].classList.remove('on');
        this.cards[s].classList.add('bad');
      }
      this.cards[this.order.indexOf(0)].classList.add('answer');
      this.startMorph('answer');
    }

    update(dt) {
      this.time += dt;
      if (this.anim) {
        const a = this.anim;
        a.t += dt;
        if (a.t >= a.dur && !this.final) {
          this.final = { pts: sampleSpec(this.q.opts[0], this.q.win), kind: a.kind };
          if (a.kind === 'ok') {
            const p = this.zone.fx.rel(this.wrap);
            this.zone.fx.confetti(p.x, p.y, { n: 34 });
          }
        }
      }
      this.draw();
    }

    drawPortal(type, label) {
      const g = this.graph, v = g.view;
      let a, b;
      if (type === 'yx') { const lo = Math.max(v.x0, v.y0), hi = Math.min(v.x1, v.y1); a = [lo, lo]; b = [hi, hi]; }
      else if (type === 'xaxis') { a = [v.x0, 0]; b = [v.x1, 0]; }
      else { a = [0, v.y0]; b = [0, v.y1]; }
      g.line(a[0], a[1], b[0], b[1], { color: '#bfe3ff', width: 9, alpha: 0.16, glow: false });
      const off = (this.time * 26) % 22;
      const ctx = g.ctx;
      ctx.save();
      ctx.lineDashOffset = -off * g.s;
      g.line(a[0], a[1], b[0], b[1], { color: '#d9eeff', width: 2.6, dash: [11, 11], glow: false, alpha: 0.9 });
      ctx.restore();
      // 標籤：y=x 放右上端、x 軸放右端下方、y 軸放下端右側，避開刻度與曲線標籤
      let lx, ly, opt;
      if (type === 'yx') { lx = b[0] - (b[0] - a[0]) * 0.1; ly = b[1] - (b[1] - a[1]) * 0.1; opt = { align: 'left', dx: 12, dy: 0 }; }
      else if (type === 'xaxis') { lx = v.x0 + (v.x1 - v.x0) * 0.03; ly = 0; opt = { align: 'left', dx: 0, dy: -24 }; }
      else {
        // y 軸：放在來源曲線「沒有往上衝」的那一側
        const rising = this.q.src.k === 'exp' && this.q.src.n / this.q.src.d > 1;
        lx = 0; ly = Math.floor(v.y0 + (v.y1 - v.y0) * 0.55) + 0.5; // 夾在兩個刻度之間
        opt = rising ? { align: 'right', dx: -12, dy: 0 } : { align: 'left', dx: 12, dy: 0 };
      }
      g.text(label, lx, ly, Object.assign({ color: '#d9eeff', font: `700 ${g.fontPx(0.05)}px "Microsoft JhengHei", "Noto Sans TC", sans-serif` }, opt));
    }

    draw() {
      const g = this.graph;
      if (!g.view) return;
      g.clear();
      const ms = this.q.mirrors;
      ms.forEach((m, i) => this.drawPortal(m, ms.length > 1 ? (i === 0 ? '傳送門 ①' : '傳送門 ②') : '傳送門'));
      for (const w of this.wrong) g.polyline(w, { color: '#ff5a6a', width: 3, dash: [9, 8], alpha: 0.85, glow: false });
      const uc = U.UNIT_HEX[7];
      if (this.anim) {
        const a = this.anim, t = Math.min(a.t / 0.95, ms.length);
        g.polyline(this.srcPts, { color: uc, width: 3, alpha: 0.35, glow: false });
        g.polyline(this.morphPts(t), { color: a.kind === 'ok' ? '#8cf06a' : '#ffd34d', width: 4 });
        if (this.final) g.polyline(this.final.pts, { color: this.final.kind === 'ok' ? '#8cf06a' : '#ffd34d', width: 4, alpha: 0.6 + 0.4 * Math.sin(this.time * 6) ** 2 });
      } else {
        g.polyline(this.srcPts, { color: uc, width: 4 });
      }
    }
  }

  L5.meta = { id: 5, name: '鏡像傳送門', unit: 7, topic: '對數函數的圖形' };
  L5.BANK = BANK; L5.build = build; L5.cfun = cfun; L5.ctex = ctex; L5.REFL = REFL;
  LG.registerLevel(L5);
})(window.LG);
