/* 第 3 關｜能量塔排序（單元 5：指數的大小比較）
   三顆能量電池上各有一個指數，依「小 → 大」點選放進能量塔；
   送出後能量柱升到真實大小，看得見誰大誰小。 */
'use strict';
(function (LG) {
  const U = LG.util;

  const I = (tex, v) => ({ tex, v });
  const Q = (key, items, hint) => ({ key, items, hint });
  const BANK = {
    easy: [
      Q('e1', [I('2^{3}', 8), I('2^{-1}', 0.5), I('2^{\\frac12}', Math.SQRT2)], '底數 $2>1$：指數越大，值越大'),
      Q('e2', [I('3^{2}', 9), I('3^{0}', 1), I('3^{-2}', 1 / 9)], '底數 $3>1$：指數越大，值越大'),
      Q('e3', [I('\\left(\\frac12\\right)^{2}', 0.25), I('\\left(\\frac12\\right)^{-1}', 2), I('\\left(\\frac12\\right)^{0}', 1)], '底數 $0<\\frac12<1$：指數越大，值反而越小'),
      Q('e4', [I('5^{0.5}', Math.sqrt(5)), I('5^{0.2}', Math.pow(5, 0.2)), I('5^{1}', 5)], '底數 $5>1$：指數越大，值越大'),
      Q('e5', [I('(0.3)^{2}', 0.09), I('(0.3)^{1}', 0.3), I('(0.3)^{\\frac12}', Math.sqrt(0.3))], '底數 $0<0.3<1$：指數越大，值反而越小'),
      Q('e6', [I('\\left(\\frac13\\right)^{-2}', 9), I('\\left(\\frac13\\right)^{1}', 1 / 3), I('\\left(\\frac13\\right)^{-\\frac12}', Math.sqrt(3))], '底數 $0<\\frac13<1$：指數越大，值反而越小')
    ],
    normal: [
      Q('n1', [I('\\sqrt{2}', Math.SQRT2), I('\\sqrt[3]{4}', Math.pow(2, 2 / 3)), I('\\sqrt[4]{8}', Math.pow(2, 0.75))], '都化成以 2 為底：$2^{\\frac12}$、$2^{\\frac23}$、$2^{\\frac34}$'),
      Q('n2', [I('\\sqrt{0.3}', Math.sqrt(0.3)), I('(0.09)^{0.5}', 0.3), I('\\left(\\frac{10}{3}\\right)^{-\\frac32}', Math.pow(0.3, 1.5))], '都化成以 0.3 為底：$(0.3)^{\\frac12}$、$(0.3)^{1}$、$(0.3)^{\\frac32}$；底數小於 1'),
      Q('n3', [I('\\sqrt{125}', Math.sqrt(125)), I('\\sqrt[3]{25}', Math.pow(25, 1 / 3)), I('\\sqrt[4]{5}', Math.pow(5, 0.25))], '都化成以 5 為底：$5^{\\frac32}$、$5^{\\frac23}$、$5^{\\frac14}$'),
      Q('n4', [I('4^{\\frac13}', Math.pow(4, 1 / 3)), I('8^{\\frac14}', Math.pow(8, 0.25)), I('2^{\\frac12}', Math.SQRT2)], '都化成以 2 為底：$2^{\\frac23}$、$2^{\\frac34}$、$2^{\\frac12}$'),
      Q('n5', [I('\\left(\\frac12\\right)^{-3}', 8), I('4^{1}', 4), I('2^{\\frac52}', Math.pow(2, 2.5))], '都化成以 2 為底：$2^{3}$、$2^{2}$、$2^{\\frac52}$'),
      Q('n6', [I('9^{\\frac13}', Math.pow(9, 1 / 3)), I('3^{\\frac12}', Math.sqrt(3)), I('27^{\\frac14}', Math.pow(27, 0.25))], '都化成以 3 為底：$3^{\\frac23}$、$3^{\\frac12}$、$3^{\\frac34}$')
    ],
    hard: [
      Q('h1', [I('(0.5)^{-2}', 4), I('(0.25)^{-\\frac32}', 8), I('\\sqrt{32}', Math.sqrt(32))], '都化成以 2 為底：$2^{2}$、$2^{3}$、$2^{\\frac52}$'),
      Q('h2', [I('\\left(\\frac13\\right)^{-\\frac12}', Math.sqrt(3)), I('9^{\\frac13}', Math.pow(9, 1 / 3)), I('\\sqrt[4]{27}', Math.pow(27, 0.25))], '都化成以 3 為底：$3^{\\frac12}$、$3^{\\frac23}$、$3^{\\frac34}$'),
      Q('h3', [I('(0.2)^{-1}', 5), I('\\sqrt[3]{25}', Math.pow(25, 1 / 3)), I('(0.04)^{-\\frac34}', Math.pow(0.04, -0.75))], '都化成以 5 為底：$5^{1}$、$5^{\\frac23}$、$5^{\\frac32}$'),
      Q('h4', [I('(0.3)^{-\\frac12}', Math.pow(0.3, -0.5)), I('(0.09)^{-1}', 1 / 0.09), I('\\left(\\frac{10}{3}\\right)^{\\frac32}', Math.pow(10 / 3, 1.5))], '都化成以 0.3 為底：$(0.3)^{-\\frac12}$、$(0.3)^{-2}$、$(0.3)^{-\\frac32}$；底數小於 1'),
      Q('h5', [I('(0.7)^{-1}', 1 / 0.7), I('(0.49)^{0.3}', Math.pow(0.49, 0.3)), I('1', 1)], '化成以 0.7 為底：$(0.7)^{-1}$、$(0.7)^{0.6}$、$(0.7)^{0}$；底數小於 1'),
      Q('h6', [I('8^{-\\frac13}', 0.5), I('\\left(\\frac14\\right)^{\\frac34}', Math.pow(0.25, 0.75)), I('\\left(\\frac{1}{16}\\right)^{\\frac18}', Math.pow(1 / 16, 1 / 8))], '都化成以 2 為底：$2^{-1}$、$2^{-\\frac32}$、$2^{-\\frac12}$')
    ]
  };

  const fmt = v => (Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : String(Number(v.toPrecision(3))));

  function build(e) {
    const sorted = e.items.slice().sort((a, b) => a.v - b.v);
    return {
      key: e.key, items: e.items, sorted,
      prompt: '依照數值由小到大，點選能量電池放進能量塔（點塔裡的電池可以退回）',
      hint: e.hint,
      explain: `$${sorted.map(x => x.tex).join('<')}$（約 ${sorted.map(x => fmt(x.v)).join('、')}）`
    };
  }

  const LABELS = ['最小', '中間', '最大'];

  class L3 extends LG.LevelBase {
    static pick(diff) { return build(U.pickFresh('l3s' + diff, BANK[diff], e => e.key)); }

    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.4;
      this.setQuestion(U.rich(q.prompt));
      const m = scr.main;
      m.classList.add('l3s');
      m.innerHTML = `
        <div class="tower">${LABELS.map((t, k) => `
          <div class="tw-col" data-k="${k}">
            <div class="tw-bar"><i class="fill"></i><span class="bv"></span></div>
            <div class="tw-slot"><span class="tw-lab">${t}</span></div>
          </div>`).join('<div class="tw-lt">&lt;</div>')}
        </div>
        <div class="tray"></div>`;
      this.cols = Array.from(m.querySelectorAll('.tw-col'));
      this.slots = this.cols.map(c => c.querySelector('.tw-slot'));
      const tray = m.querySelector('.tray');
      const order = U.shuffle([0, 1, 2]);
      this.cells = [];
      this.cards = order.map((oi, h) => {
        const cell = U.el('div', 'tr-cell');
        tray.appendChild(cell);
        this.cells.push(cell);
        const el = U.el('div', 'cell-card', `<i class="pole"></i><div class="cx">${U.tex(q.items[oi].tex)}</div>`);
        cell.appendChild(el);
        const card = { el, item: q.items[oi], home: h, slot: -1 };
        LG.input.onTap(el, () => this.tapCard(card), { sound: false, enabled: () => this.playing });
        return card;
      });
      this.placed = [null, null, null];
      this.setGo('啟動能量塔！', () => this.go());
      this.setGoEnabled(false);
    }

    layout() { this.cards.forEach(c => U.fit(c.el.querySelector('.cx'), 0.55, true)); }

    tapCard(c) {
      if (!this.playing) return;
      if (c.slot < 0) {
        const k = this.placed.indexOf(null);
        if (k < 0) return;
        this.placed[k] = c; c.slot = k;
        this.slots[k].appendChild(c.el);
        LG.audio.play('plug');
      } else {
        this.placed[c.slot] = null; c.slot = -1;
        this.cells[c.home].appendChild(c.el);
        LG.audio.play('tap');
      }
      c.el.classList.remove('pop'); void c.el.offsetWidth; c.el.classList.add('pop');
      this.slots.forEach(s => s.classList.remove('bad'));
      this.setGoEnabled(this.placed.every(Boolean));
    }

    go() {
      if (!this.placed.every(Boolean)) return;
      const v = this.placed.map(c => c.item.v);
      const ok = v[0] < v[1] && v[1] < v[2];
      const r = this.submit(ok);
      if (r === 'retry') {
        this.slots.forEach(s => s.classList.add('bad'));
        this.cards.forEach(c => { if (c.slot >= 0) { this.placed[c.slot] = null; c.slot = -1; this.cells[c.home].appendChild(c.el); } });
        this.setGoEnabled(false);
      }
    }

    /* 能量柱依真實數值升起（以最大值為滿格） */
    raise(kind) {
      const max = Math.max(...this.placed.map(c => c.item.v));
      this.placed.forEach((c, k) => {
        const col = this.cols[k];
        col.classList.add(kind);
        const h = Math.max(0.1, c.item.v / max);
        col.querySelector('.fill').style.transform = `scaleY(${h.toFixed(3)})`;
        col.querySelector('.bv').textContent = '≈ ' + fmt(c.item.v);
      });
    }

    celebrate() {
      if (!this.placed.every(Boolean)) this.placeAnswer();
      this.raise('ok');
      LG.audio.play('zap');
      const p = this.zone.fx.rel(this.cols[1]);
      this.zone.fx.confetti(p.x, p.y, { n: 36 });
    }

    placeAnswer() {
      this.cards.forEach(c => { if (c.slot >= 0) { this.placed[c.slot] = null; c.slot = -1; } });
      this.q.sorted.forEach((it, k) => {
        const c = this.cards.find(x => x.item === it);
        this.placed[k] = c; c.slot = k;
        this.slots[k].appendChild(c.el);
      });
    }

    reveal() {
      this.slots.forEach(s => s.classList.remove('bad'));
      this.placeAnswer();
      this.raise('answer');
    }
  }

  L3.meta = { id: 3, name: '能量塔排序', unit: 5, topic: '指數的大小比較' };
  L3.BANK = BANK; L3.build = build;
  LG.registerLevel(L3);
})(window.LG);
