/* 第 4 關｜電路接線（單元 6：對數的定義、對數律、換底公式）
   左邊 3 個算式、右邊 4 個數值（1 個用不到），把算式拖線接到它的值。 */
'use strict';
(function (LG) {
  const U = LG.util;
  const L = (a, b) => Math.log(b) / Math.log(a);
  const lg = Math.log10;

  // E(算式 TeX, 值, 類型, 驗算)；類型：def 定義、law 對數律、chg 換底、pow 指數與對數
  const E = (tex, v, t, f) => ({ tex, v, t, f });
  const BANK = {
    easy: [
      E('\\log_{2}8', '3', 'def', () => L(2, 8)),
      E('\\log_{2}16', '4', 'def', () => L(2, 16)),
      E('\\log_{3}9', '2', 'def', () => L(3, 9)),
      E('\\log_{3}27', '3', 'def', () => L(3, 27)),
      E('\\log_{5}25', '2', 'def', () => L(5, 25)),
      E('\\log_{4}1', '0', 'def', () => L(4, 1)),
      E('\\log_{6}6', '1', 'def', () => L(6, 6)),
      E('\\log 1000', '3', 'def', () => lg(1000)),
      E('\\log 0.01', '-2', 'def', () => lg(0.01)),
      E('\\log_{2}\\dfrac{1}{4}', '-2', 'def', () => L(2, 1 / 4)),
      E('\\log_{3}\\dfrac{1}{9}', '-2', 'def', () => L(3, 1 / 9)),
      E('\\log_{5}\\dfrac{1}{5}', '-1', 'def', () => L(5, 1 / 5)),
      E('\\log 2+\\log 5', '1', 'law', () => lg(2) + lg(5)),
      E('\\log 4+\\log 25', '2', 'law', () => lg(4) + lg(25)),
      E('\\log_{2}32', '5', 'def', () => L(2, 32))
    ],
    normal: [
      E('\\log_{4}8', '3/2', 'def', () => L(4, 8)),
      E('\\log_{9}27', '3/2', 'def', () => L(9, 27)),
      E('\\log_{5}5\\sqrt{5}', '3/2', 'def', () => L(5, 5 * Math.sqrt(5))),
      E('\\log_{2}\\sqrt{2}', '1/2', 'def', () => L(2, Math.SQRT2)),
      E('\\log_{8}2', '1/3', 'def', () => L(8, 2)),
      E('\\log_{\\frac{1}{3}}27', '-3', 'def', () => L(1 / 3, 27)),
      E('\\log_{\\frac{1}{2}}8', '-3', 'def', () => L(1 / 2, 8)),
      E('\\log 4+\\log 25', '2', 'law', () => lg(4) + lg(25)),
      E('\\log 2+\\log 50', '2', 'law', () => lg(2) + lg(50)),
      E('\\log 20-\\log 2', '1', 'law', () => lg(20) - lg(2)),
      E('\\log 2-\\log 20', '-1', 'law', () => lg(2) - lg(20)),
      E('\\log 8+\\log 125', '3', 'law', () => lg(8) + lg(125)),
      E('2\\log 5+\\log 4', '2', 'law', () => 2 * lg(5) + lg(4)),
      E('\\log_{6}4+\\log_{6}9', '2', 'law', () => L(6, 4) + L(6, 9)),
      E('\\log_{2}24-\\log_{2}3', '3', 'law', () => L(2, 24) - L(2, 3)),
      E('\\log_{3}18-\\log_{3}2', '2', 'law', () => L(3, 18) - L(3, 2)),
      E('\\log_{4}5\\times\\log_{5}4', '1', 'chg', () => L(4, 5) * L(5, 4)),
      E('\\log_{2}3\\times\\log_{3}8', '3', 'chg', () => L(2, 3) * L(3, 8)),
      E('\\log_{3}5\\times\\log_{5}9', '2', 'chg', () => L(3, 5) * L(5, 9)),
      E('2^{\\log_{2}3}', '3', 'pow', () => Math.pow(2, L(2, 3))),
      E('10^{\\log 7}', '7', 'pow', () => Math.pow(10, lg(7)))
    ],
    hard: [
      E('\\log_{8}\\sqrt{2}', '1/6', 'chg', () => L(8, Math.SQRT2)),
      E('\\log_{25}\\dfrac{1}{5}', '-1/2', 'chg', () => L(25, 1 / 5)),
      E('3\\log 2+\\log 5-2\\log 20', '-1', 'law', () => 3 * lg(2) + lg(5) - 2 * lg(20)),
      E('\\log_{3}5\\times\\log_{5}7\\times\\log_{7}9', '2', 'chg', () => L(3, 5) * L(5, 7) * L(7, 9)),
      E('4^{\\log_{2}3}', '9', 'pow', () => Math.pow(4, L(2, 3))),
      E('3^{2\\log_{3}5}', '25', 'pow', () => Math.pow(3, 2 * L(3, 5))),
      E('\\log_{16}64', '3/2', 'chg', () => L(16, 64)),
      E('\\log_{2}3\\times\\log_{3}7\\times\\log_{7}8', '3', 'chg', () => L(2, 3) * L(3, 7) * L(7, 8)),
      E('\\log_{\\sqrt{2}}8', '6', 'chg', () => L(Math.SQRT2, 8)),
      E('2\\log_{6}2+\\log_{6}45-\\log_{6}5', '2', 'law', () => 2 * L(6, 2) + L(6, 45) - L(6, 5)),
      E('\\log_{\\frac{1}{4}}8', '-3/2', 'chg', () => L(1 / 4, 8)),
      E('\\log 15+\\log\\dfrac{2}{3}', '1', 'law', () => lg(15) + lg(2 / 3))
    ]
  };
  // 干擾選項（用不到的值）
  const DIST = {
    easy: ['-3', '-1', '0', '1', '2', '3', '4', '5', '-2'],
    normal: ['-3', '-2', '-1', '0', '1', '2', '3', '4', '1/2', '3/2', '1/3', '2/3', '-1/2'],
    hard: ['-2', '-1', '0', '1', '2', '3', '6', '9', '1/6', '1/2', '3/2', '-1/2', '-3/2', '5/2', '1/3']
  };
  const TYPE_HINT = {
    def: '定義：$\\log_a b=x \\iff a^{x}=b$',
    law: '對數律：$\\log rs=\\log r+\\log s$，$\\log\\frac{r}{s}=\\log r-\\log s$，$\\log r^{t}=t\\log r$',
    chg: '換底：$\\log_a b=\\frac{\\log b}{\\log a}$，連乘時可以約分',
    pow: '$a^{\\log_a b}=b$'
  };

  const recent = [];
  function build(diff) {
    const pool = BANK[diff];
    let chosen = null;
    for (let attempt = 0; attempt < 60 && !chosen; attempt++) {
      const pick = [];
      for (const it of U.shuffle(pool)) {
        if (pick.some(c => c.v === it.v)) continue;
        if (pick.filter(c => c.t === it.t).length >= 2) continue;
        if (attempt < 40 && recent.includes(it.tex)) continue;
        pick.push(it);
        if (pick.length === 3) break;
      }
      if (pick.length === 3) chosen = pick;
    }
    chosen.forEach(c => { recent.push(c.tex); });
    while (recent.length > 6) recent.shift();
    const used = chosen.map(c => c.v);
    const dist = U.pick(DIST[diff].filter(v => !used.includes(v)));
    const types = [...new Set(chosen.map(c => c.t))];
    return {
      key: chosen.map(c => c.tex).join('|'),
      items: chosen,
      values: U.shuffle(used.concat([dist])),
      dist,
      hint: types.map(t => TYPE_HINT[t]).join('\n'),
      explain: chosen.map(c => `$${c.tex.replace(/\\dfrac/g, '\\frac')}=${U.fracTex(c.v, false)}$`).join('；')
    };
  }

  class L3 extends LG.LevelBase {
    static pick(diff) { return build(diff); }

    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.3;
      this.setQuestion(U.rich('把左邊每個算式拖線接到它的值（右邊有一個值用不到）') +
        '<span class="l3-prog">已接通 <b>0</b>／3</span>');
      const m = scr.main;
      m.classList.add('l3');
      m.innerHTML = `<div class="board"><svg class="c-svg"></svg><div class="col col-l"></div><div class="col col-r"></div></div>`;
      this.board = m.querySelector('.board');
      this.svg = m.querySelector('.c-svg');
      const colL = m.querySelector('.col-l'), colR = m.querySelector('.col-r');
      this.left = q.items.map((it, i) => {
        const el = U.el('div', 'sock sock-l', `<div class="sx">${U.tex(it.tex)}</div><i class="plug"></i>`);
        colL.appendChild(el);
        return { side: 'l', i, el, v: it.v, done: false };
      });
      this.right = q.values.map((v, j) => {
        const el = U.el('div', 'sock sock-r', `<i class="plug"></i><div class="sx">${U.tex(U.fracTex(v))}</div><i class="bulb"></i>`);
        colR.appendChild(el);
        return { side: 'r', i: j, el, v, done: false };
      });
      this.links = [];
      this.drag = null;
      this.count = 0;
      this.setGoLabel('拖曳連線來作答');
      LG.input.onDrag(this.board, {
        down: (e, p) => this.onDown(p),
        move: (e, p) => this.onMove(p),
        up: () => this.onUp(),
        cancel: () => this.retract()
      });
    }

    layout() {
      const b = this.board.getBoundingClientRect();
      if (b.width < 4) return;
      this.bw = b.width; this.bh = b.height;
      this.svg.setAttribute('viewBox', `0 0 ${b.width} ${b.height}`);
      const geo = s => {
        const r = s.el.getBoundingClientRect();
        s.rect = { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height };
        s.plug = s.side === 'l' ? { x: s.rect.x + s.rect.w, y: s.rect.y + s.rect.h / 2 } : { x: s.rect.x, y: s.rect.y + s.rect.h / 2 };
      };
      this.left.forEach(geo);
      this.right.forEach(geo);
      this.left.concat(this.right).forEach(s => U.fit(s.el.querySelector('.sx'), 0.5, true));
      this.render();
    }

    hit(list, p) {
      const k = LG.settings.hitScale();
      for (const s of list) {
        const r = s.rect;
        if (!r) continue;
        const ex = r.w * (k - 1) / 2 + 4, ey = r.h * (k - 1) / 2 + 4;
        if (p.x >= r.x - ex && p.x <= r.x + r.w + ex && p.y >= r.y - ey && p.y <= r.y + r.h + ey) return s;
      }
      return null;
    }

    onDown(p) {
      if (!this.playing) return false;
      const s = this.hit(this.left, p) || this.hit(this.right, p);
      if (!s || s.done) return false;
      this.drag = { from: s, x: p.x, y: p.y, hover: null };
      s.el.classList.add('active');
      LG.audio.play('plug');
      this.render();
    }

    onMove(p) {
      const d = this.drag;
      if (!d) return;
      d.x = p.x; d.y = p.y;
      const other = d.from.side === 'l' ? this.right : this.left;
      const h = this.hit(other, p);
      const hv = h && !h.done ? h : null;
      if (hv !== d.hover) {
        if (d.hover) d.hover.el.classList.remove('hover');
        if (hv) hv.el.classList.add('hover');
        d.hover = hv;
      }
      this.render();
    }

    onUp() {
      const d = this.drag;
      if (!d) return;
      if (d.hover && this.playing) {
        const a = d.from.side === 'l' ? d.from : d.hover;
        const b = d.from.side === 'l' ? d.hover : d.from;
        this.clearDrag();
        this.connect(a, b);
      } else this.retract();
    }

    clearDrag() {
      const d = this.drag;
      if (!d) return;
      d.from.el.classList.remove('active');
      if (d.hover) d.hover.el.classList.remove('hover');
      this.drag = null;
    }

    retract() {
      const d = this.drag;
      if (!d) return;
      this.retractAnim = { from: d.from, x: d.x, y: d.y, t: 0 };
      this.clearDrag();
    }

    connect(a, b) {
      const ok = a.v === b.v;
      if (ok) {
        a.done = b.done = true;
        a.el.classList.add('done'); b.el.classList.add('done');
        this.links.push({ a, b, state: 'ok' });
        this.count++;
        LG.audio.play('plug');
        this.scr.q.querySelector('.l3-prog b').textContent = String(this.count);
        const o = this.zoff(this.board);
        this.zone.fx.burst(o.x + b.plug.x, o.y + b.plug.y, { n: 16, colors: [U.UNIT_HEX[6], '#fff6c0'], speed: [80, 300], gravity: 200 });
        if (this.count === 3) this.submit(true);
        this.render();
        return;
      }
      this.flash = { a, b, t: 0 };
      this.lastWrong = { a, b };
      const r = this.submit(false);
      if (r === 'retry') {
        a.el.classList.add('bad'); b.el.classList.add('bad');
        setTimeout(() => { a.el.classList.remove('bad'); b.el.classList.remove('bad'); }, 650);
      }
      this.render();
    }

    celebrate() {
      this.links.forEach(l => { l.state = 'flow'; });
      this.right.forEach(s => { if (s.done) s.el.classList.add('lit'); });
      LG.audio.play('zap');
      const p = this.zone.fx.rel(this.board);
      this.zone.fx.confetti(p.x, p.y, { n: 36 });
      this.render();
    }

    reveal() {
      this.clearDrag();
      for (const a of this.left) {
        if (a.done) continue;
        const b = this.right.find(s => s.v === a.v);
        this.links.push({ a, b, state: 'answer' });
        b.el.classList.add('answer');
        a.el.classList.add('answer');
      }
      this.render();
    }

    path(ax, ay, bx, by) {
      const dx = Math.max(30, Math.abs(bx - ax) * 0.45);
      const sgn = bx >= ax ? 1 : -1;
      return `M${ax.toFixed(1)} ${ay.toFixed(1)}C${(ax + dx * sgn).toFixed(1)} ${ay.toFixed(1)} ${(bx - dx * sgn).toFixed(1)} ${by.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`;
    }

    render() {
      if (!this.bw) return;
      const sw = Math.max(3, this.bw * 0.011);
      let h = '';
      const wire = (d, cls) => {
        h += `<path d="${d}" class="cw-shadow" stroke-width="${(sw * 2).toFixed(1)}"/>`;
        h += `<path d="${d}" class="cw ${cls}" stroke-width="${sw.toFixed(1)}"/>`;
      };
      for (const l of this.links) wire(this.path(l.a.plug.x, l.a.plug.y, l.b.plug.x, l.b.plug.y), l.state);
      if (this.flash) {
        const f = this.flash;
        wire(this.path(f.a.plug.x, f.a.plug.y, f.b.plug.x, f.b.plug.y), 'bad');
      }
      if (this.drag) {
        const d = this.drag, s = d.from.plug;
        const tx = d.hover ? d.hover.plug.x : d.x, ty = d.hover ? d.hover.plug.y : d.y;
        wire(d.from.side === 'l' ? this.path(s.x, s.y, tx, ty) : this.path(tx, ty, s.x, s.y), 'live');
        h += `<circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="${(sw * 1.6).toFixed(1)}" class="cw-tip"/>`;
      }
      if (this.retractAnim) {
        const r = this.retractAnim, s = r.from.plug, k = U.ease.outCubic(U.clamp(r.t / 0.2, 0, 1));
        const tx = U.lerp(r.x, s.x, k), ty = U.lerp(r.y, s.y, k);
        wire(r.from.side === 'l' ? this.path(s.x, s.y, tx, ty) : this.path(tx, ty, s.x, s.y), 'live');
      }
      this.svg.innerHTML = h;
    }

    update(dt) {
      let dirty = false;
      if (this.flash) {
        this.flash.t += dt;
        if (this.flash.t > 0.65) { this.flash = null; }
        dirty = true;
      }
      if (this.retractAnim) {
        this.retractAnim.t += dt;
        if (this.retractAnim.t > 0.2) this.retractAnim = null;
        dirty = true;
      }
      if (dirty) this.render();
    }
  }

  L3.meta = { id: 4, name: '電路接線', unit: 6, topic: '對數定義與對數律' };
  L3.BANK = BANK; L3.DIST = DIST; L3.build = build;
  LG.registerLevel(L3);
})(window.LG);
