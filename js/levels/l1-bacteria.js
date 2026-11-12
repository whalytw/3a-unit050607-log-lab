/* 第 1 關｜細菌培養皿（單元 5：指數函數的圖形）
   拖動底數滑桿選 a，按「培養！」後菌落才沿著 y = a^x 從 (0,1) 長出來，
   要長到目標點（或與參考曲線對稱於 y 軸）才算成功。 */
'use strict';
(function (LG) {
  const U = LG.util;

  // 滑桿上的 9 個位置；中間的 1 不能選（底數 a ≠ 1）
  const SLOTS = [[1, 5], [1, 4], [1, 3], [1, 2], null, [2, 1], [3, 1], [4, 1], [5, 1]];
  const val = s => s[0] / s[1];
  const aTex = s => (s[1] === 1 ? `${s[0]}` : `\\frac{${s[0]}}{${s[1]}}`);
  const aPow = (s, e) => (s[1] === 1 ? `${s[0]}` : `\\left(\\frac{${s[0]}}{${s[1]}}\\right)`) + `^{${e}}`;
  const fr = (n, d) => (d === 1 ? `${n}` : (n < 0 ? `-\\frac{${-n}}{${d}}` : `\\frac{${n}}{${d}}`));

  // P(底數位置, x 分子, x 分母, y)：目標點 (x, y) 在 y = a^x 上；M(參考曲線位置)：找對稱於 y 軸者
  const P = (ai, xn, xd, y) => ({ type: 'point', ai, x: [xn, xd], y });
  const M = bi => ({ type: 'mirror', bi, ai: 8 - bi });
  const BANK = {
    easy: [P(5, 1, 1, 2), P(6, 1, 1, 3), P(7, 1, 1, 4), P(8, 1, 1, 5), P(3, -1, 1, 2), P(2, -1, 1, 3),
      P(1, -1, 1, 4), P(0, -1, 1, 5), P(5, 2, 1, 4), P(6, 2, 1, 9)],
    normal: [P(5, 2, 1, 4), P(6, 2, 1, 9), P(3, -2, 1, 4), P(2, -2, 1, 9), P(5, 3, 1, 8), P(3, -3, 1, 8),
      P(7, 1, 2, 2), M(6), M(5), M(2), M(1)],
    hard: [P(1, -1, 2, 2), P(7, 3, 2, 8), P(1, -3, 2, 8), P(7, 1, 2, 2), P(2, -2, 1, 9), P(3, -3, 1, 8),
      M(0), M(1), M(7)]
  };

  function hintFor(xn, xd, y) {
    switch (`${xn}/${xd}`) {
      case '1/1': return `$x=1$ 時 $y=a^{1}=a$，看目標點的 $y$ 坐標`;
      case '-1/1': return `把點代入：$a^{-1}=\\dfrac{1}{a}=${y}$`;
      case '2/1': return `把點代入：$a^{2}=${y}$，而且 $a>0$`;
      case '-2/1': return `把點代入：$a^{-2}=\\dfrac{1}{a^{2}}=${y}$`;
      case '3/1': return `把點代入：$a^{3}=${y}$`;
      case '-3/1': return `把點代入：$a^{-3}=\\dfrac{1}{a^{3}}=${y}$`;
      case '1/2': return `把點代入：$a^{\\frac12}=\\sqrt{a}=${y}$`;
      case '-1/2': return `把點代入：$a^{-\\frac12}=\\dfrac{1}{\\sqrt{a}}=${y}$`;
      case '3/2': return `把點代入：$a^{\\frac32}=\\left(\\sqrt{a}\\right)^{3}=${y}$`;
      case '-3/2': return `把點代入：$a^{-\\frac32}=\\dfrac{1}{\\left(\\sqrt{a}\\right)^{3}}=${y}$`;
      default: return '把目標點代入 $y=a^{x}$';
    }
  }

  function build(e) {
    const a = SLOTS[e.ai];
    if (e.type === 'point') {
      const [xn, xd] = e.x, xs = fr(xn, xd);
      return {
        key: `p${e.ai}_${xn}_${xd}`, type: 'point', ai: e.ai, a: val(a), x: xn / xd, y: e.y, xs,
        prompt: `拖動底數 $a$，讓菌落沿著 $y=a^{x}$ 長到發光的目標點 $\\left(${xs},\\,${e.y}\\right)$。`,
        hint: hintFor(xn, xd, e.y),
        explain: `$${aPow(a, xs)}=${e.y}$，所以 $a=${aTex(a)}$`
      };
    }
    const b = SLOTS[e.bi];
    return {
      key: `m${e.bi}`, type: 'mirror', ai: e.ai, a: val(a), b: val(b), bTex: `y=${aPow(b, 'x')}`,
      prompt: `培養出與 $y=${aPow(b, 'x')}$（虛線）的圖形對稱於 $y$ 軸的菌落 $y=a^{x}$。`,
      hint: '$y=a^{x}$ 與 $y=\\left(\\frac{1}{a}\\right)^{x}$ 的圖形對稱於 $y$ 軸',
      explain: `$y=${aPow(b, 'x')}$ 對 $y$ 軸對稱後是 $y=${aPow(a, 'x')}$，所以 $a=${aTex(a)}$`
    };
  }

  const XR = 3.7, N = 370; // 取樣範圍 [-3.7, 3.7]，中點 (index 185) 為 x = 0
  const COLORS = { ok: '#8cf06a', bad: '#ff5a6a', answer: '#8cf06a' };

  class L1 extends LG.LevelBase {
    static pick(diff) { return build(U.pickFresh('l1' + diff, BANK[diff], e => JSON.stringify(e))); }

    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.5;
      this.setQuestion(U.rich(q.prompt));
      const m = scr.main;
      m.classList.add('l1');
      m.innerHTML = `
        <div class="g-wrap"><canvas class="g-cv"></canvas><div class="g-target"></div><div class="g-tag"></div></div>
        <div class="base-pane">
          <div class="base-read"><span class="lab">底數</span><span class="val"></span></div>
          <div class="slider"><div class="sl-track"></div><div class="sl-stops"></div><div class="sl-knob"></div></div>
        </div>`;
      this.wrap = m.querySelector('.g-wrap');
      this.cv = m.querySelector('.g-cv');
      this.targetEl = m.querySelector('.g-target');
      this.tagEl = m.querySelector('.g-tag');
      this.readEl = m.querySelector('.base-read .val');
      this.slider = m.querySelector('.slider');
      this.knob = m.querySelector('.sl-knob');
      this.stopsEl = m.querySelector('.sl-stops');
      this.stopsEl.innerHTML = SLOTS.map((s, i) =>
        `<div class="sl-stop${s ? '' : ' no'}" data-i="${i}">${s ? U.tex(s[1] === 1 ? `${s[0]}` : `\\dfrac{${s[0]}}{${s[1]}}`) : '<span class="one">1</span>'}</div>`).join('');
      this.stops = Array.from(this.stopsEl.children);

      this.graph = new LG.Graph2D(this.cv, { xmin: -3.5, xmax: 3.5, ymin: -0.8, ymax: 9.6 });
      this.sel = null;
      this.preview = null;
      this.knobPos = 4.5 / 9;
      this.curves = [];
      this.dirty = true;
      if (q.type === 'mirror') this.refPts = LG.Graph2D.sample(x => Math.pow(q.b, x), -XR, XR, N);
      else this.tagEl.innerHTML = U.tex(`\\left(${q.xs},\\,${q.y}\\right)`);
      if (q.type === 'mirror') this.tagEl.innerHTML = U.tex(q.bTex);
      this.targetEl.style.display = q.type === 'point' ? '' : 'none';

      this.updateKnob(false);
      this.updateRead();
      this.setGo('培養！', () => this.go());
      this.setGoEnabled(false);

      LG.input.onDrag(this.slider, {
        down: () => this.playing && !this.busy,
        start: (e, p) => { this.slider.classList.add('drag'); this.moveTo(p.x); },
        move: (e, p) => this.moveTo(p.x),
        up: () => this.release(),
        cancel: () => this.release()
      });
    }

    slotAt(pos) {
      let i = U.clamp(Math.round(pos * 9 - 0.5), 0, 8);
      if (i === 4) i = pos < 0.5 ? 3 : 5;
      return i;
    }

    moveTo(px) {
      const w = this.slider.clientWidth || 1;
      this.knobPos = U.clamp(px / w, 0.5 / 9, 8.5 / 9);
      const i = this.slotAt(this.knobPos);
      if (i !== this.preview) { this.preview = i; LG.audio.play('dial'); }
      this.updateKnob(false);
      this.updateRead();
    }

    release() {
      this.slider.classList.remove('drag');
      if (this.preview == null) return;
      this.sel = this.preview;
      this.knobPos = (this.sel + 0.5) / 9;
      this.updateKnob(true);
      this.updateRead();
      this.setGoEnabled(true);
    }

    updateKnob(snap) {
      this.knob.classList.toggle('snap', !!snap);
      this.knob.style.left = (this.knobPos * 100).toFixed(2) + '%';
      const cur = this.preview;
      this.stops.forEach((s, i) => s.classList.toggle('on', i === cur));
    }

    updateRead() {
      const i = this.preview;
      this.readEl.innerHTML = i == null ? U.tex('a=\\,?') : U.tex(`a=${aTex(SLOTS[i])}`);
    }

    layout() {
      const r = this.wrap.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;
      this.graph.resize(r.width, r.height, this.scale());
      this.cv.style.width = r.width + 'px';
      this.cv.style.height = r.height + 'px';
      const q = this.q, g = this.graph;
      if (q.type === 'point') {
        const X = g.cssX(q.x), Y = g.cssY(q.y);
        this.targetEl.style.left = X + 'px';
        this.targetEl.style.top = Y + 'px';
        const right = q.x < 1.2;
        this.tagEl.style.left = (right ? X + r.width * 0.05 : X - r.width * 0.05) + 'px';
        this.tagEl.style.top = Y + 'px';
        this.tagEl.style.transform = `translate(${right ? '0' : '-100%'}, -50%)`;
      } else {
        const yl = 6.2, xl = Math.log(yl) / Math.log(q.b);
        const X = g.cssX(xl), Y = g.cssY(yl);
        const right = xl > 0;
        this.tagEl.style.left = (right ? X + r.width * 0.035 : X - r.width * 0.035) + 'px';
        this.tagEl.style.top = Y + 'px';
        this.tagEl.style.transform = `translate(${right ? '0' : '-100%'}, -50%)`;
      }
      this.dirty = true;
    }

    go() {
      if (this.sel == null || this.busy) return;
      this.lastPick = this.sel;
      const ok = this.sel === this.q.ai;
      const r = this.submit(ok);
      if (r === 'retry') {
        this.grow(this.sel, 'bad');
        this.stops[this.sel].classList.add('bad');
      }
    }

    grow(slot, kind, delay) {
      const a = val(SLOTS[slot]);
      const c = {
        pts: LG.Graph2D.sample(x => Math.pow(a, x), -XR, XR, N),
        color: COLORS[kind], dash: kind === 'answer' ? [12, 8] : null,
        alpha: 1, prog: 0, t: -(delay || 0), kind
      };
      this.curves.push(c);
      this.busy = true;
      if (!delay) LG.audio.play('grow');
      return c;
    }

    celebrate() { this.grow(this.lastPick != null ? this.lastPick : this.q.ai, 'ok'); }

    reveal(reason) {
      if (reason !== 'timeout' && this.lastPick != null && this.lastPick !== this.q.ai) {
        this.grow(this.lastPick, 'bad');
        this.stops[this.lastPick].classList.add('bad');
      }
      this.grow(this.q.ai, 'answer', reason === 'timeout' ? 0 : 0.7);
      this.stops[this.q.ai].classList.add('ans');
    }

    update(dt) {
      let anim = false;
      for (const c of this.curves) {
        if (c.prog < 1) {
          c.t += dt;
          if (c.t > 0) {
            c.prog = U.ease.outCubic(U.clamp(c.t / 1.05, 0, 1));
            anim = true;
            if (c.prog >= 1) this.onGrown(c);
          }
        } else if (c.kind === 'bad' && c.alpha > 0.28) {
          c.alpha = Math.max(0.28, c.alpha - dt * 0.9);
          anim = true;
        }
      }
      if (!anim && this.busy && this.curves.every(c => c.prog >= 1)) this.busy = false;
      if (anim) this.dirty = true;
      if (this.dirty) { this.draw(); this.dirty = false; }
    }

    onGrown(c) {
      if (c.kind === 'ok') {
        this.targetEl.classList.add('hit');
        const o = this.zoff(this.wrap);
        let x, y;
        if (this.q.type === 'point') { x = this.graph.cssX(this.q.x); y = this.graph.cssY(this.q.y); }
        else { x = this.graph.cssX(0); y = this.graph.cssY(1); }
        this.zone.fx.burst(o.x + x, o.y + y, { n: 40, colors: ['#8cf06a', '#f2f6fb', '#ffd34d'], speed: [140, 460], gravity: 200 });
        this.zone.fx.confetti(o.x + x, o.y + y, { n: 28 });
      }
    }

    draw() {
      const g = this.graph;
      if (!g.view) return;
      g.clear();
      if (this.refPts) g.polyline(this.refPts, { color: 'rgba(242,246,251,0.8)', width: 2.8, dash: [10, 8], glow: false });
      for (const c of this.curves) {
        const mid = N / 2, k = c.prog;
        if (k <= 0) continue;
        g.polyline(c.pts, { color: c.color, alpha: c.alpha, width: 3.8, dash: c.dash, from: mid - k * mid, to: mid + k * mid });
      }
      g.dot(0, 1, { r: 6, color: '#f2f6fb', halo: 'rgba(242,246,251,0.18)' });
    }
  }

  L1.meta = { id: 1, name: '細菌培養皿', unit: 5, topic: '指數函數的圖形' };
  L1.BANK = BANK; L1.build = build; L1.SLOTS = SLOTS;
  LG.registerLevel(L1);
})(window.LG);
