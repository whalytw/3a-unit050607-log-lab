/* 第 4 關｜巨數望遠鏡（單元 6：常用對數與科學記號）
   望遠鏡看到一個巨大（或極小）的數，轉動數字轉盤輸入位數，按「觀測！」。 */
'use strict';
(function (LG) {
  const U = LG.util;
  const LOG2 = 0.3010, LOG3 = 0.4771;
  const GIVEN = '已知 $\\log 2\\approx0.3010$，$\\log 3\\approx0.4771$';

  // 底數的「學生版」常用對數（只用 log2、log3 組合）與提示
  const BASE = {
    2: { lg: LOG2, how: '' },
    3: { lg: LOG3, how: '' },
    4: { lg: 2 * LOG2, how: '$\\log 4=2\\log 2$；' },
    5: { lg: 1 - LOG2, how: '$\\log 5=1-\\log 2$；' },
    6: { lg: LOG2 + LOG3, how: '$\\log 6=\\log 2+\\log 3$；' },
    12: { lg: 2 * LOG2 + LOG3, how: '$\\log 12=2\\log 2+\\log 3$；' }
  };
  const DEC = {
    '0.5': { v: 0.5, tex: '(0.5)', lt: '0.5', lg: -LOG2, how: '$\\log 0.5=-\\log 2$；' },
    '1/3': { v: 1 / 3, tex: '\\left(\\frac{1}{3}\\right)', lt: '\\frac{1}{3}', lg: -LOG3, how: '$\\log\\frac13=-\\log 3$；' },
    '0.3': { v: 0.3, tex: '(0.3)', lt: '0.3', lg: LOG3 - 1, how: '$\\log 0.3=\\log 3-1$；' },
    '0.2': { v: 0.2, tex: '(0.2)', lt: '0.2', lg: LOG2 - 1, how: '$\\log 0.2=\\log 2-1$；' },
    '0.4': { v: 0.4, tex: '(0.4)', lt: '0.4', lg: 2 * LOG2 - 1, how: '$\\log 0.4=2\\log 2-1$；' }
  };

  const fmt = (x, d) => {
    const s = x.toFixed(d === undefined ? 2 : d);
    return s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
  };

  function sci(L) { // 10^L → [尾數字串, 次方]
    const k = Math.floor(L);
    let m = Math.pow(10, L - k);
    let ms = m.toFixed(1);
    if (ms === '10.0') return ['1.0', k + 1];
    return [ms, k];
  }

  function build(e) {
    if (e.t === 'dig') {
      const B = BASE[e.b], approx = e.n * B.lg;
      const ans = Math.floor(e.n * Math.log10(e.b)) + 1;
      const [m, k] = sci(e.n * Math.log10(e.b));
      return {
        key: `d${e.b}_${e.n}`, answer: ans, unit: '位數', prefix: '',
        lens: `${e.b}^{${e.n}}`,
        prompt: `望遠鏡發現一個巨數：$${e.b}^{${e.n}}$ 是幾位數？`, given: GIVEN,
        hint: `${B.how}先算 $${e.n}\\log ${e.b}$；若 $N=10^{k.\\cdots}$（$k$ 為整數），則 $N$ 是 $k+1$ 位數`,
        explain: `$${e.b}^{${e.n}}=10^{${e.n}\\log ${e.b}}\\approx10^{${fmt(approx)}}\\approx${m}\\times10^{${k}}$，是 ${ans} 位數`,
        sci: `${e.b}^{${e.n}}\\approx${m}\\times10^{${k}}`
      };
    }
    if (e.t === 'dec') {
      const D = DEC[e.b], approx = e.n * D.lg;
      const L = e.n * Math.log10(D.v);
      const ans = -Math.floor(L);
      const [m, k] = sci(L);
      return {
        key: `f${e.b}_${e.n}`, answer: ans, unit: '位', prefix: '第',
        lens: `${D.tex}^{${e.n}}`,
        prompt: `把 $${D.tex}^{${e.n}}$ 寫成小數，從小數點後第幾位開始出現不為 0 的數字？`, given: GIVEN,
        hint: `${D.how}先算 $${e.n}\\log ${D.lt}$；$10^{-3.2}=10^{0.8}\\times10^{-4}$ 是從第 4 位開始`,
        explain: `$${D.tex}^{${e.n}}\\approx10^{${fmt(approx)}}\\approx${m}\\times10^{${k}}$，從小數點後第 ${ans} 位開始`,
        sci: `${D.tex}^{${e.n}}\\approx${m}\\times10^{${k}}`
      };
    }
    if (e.t === 'mix') {
      const approx = 20 * LOG2 + 10 * (1 - LOG2);
      const L = 20 * Math.log10(2) + 10 * Math.log10(5);
      const [m, k] = sci(L);
      return {
        key: 'mix', answer: Math.floor(L) + 1, unit: '位數', prefix: '',
        lens: '2^{20}\\times5^{10}',
        prompt: '$2^{20}\\times5^{10}$ 是幾位數？', given: GIVEN,
        hint: '$\\log(2^{20}\\times5^{10})=20\\log 2+10\\log 5$，而 $\\log 5=1-\\log 2$',
        explain: `$20\\times0.3010+10\\times0.6990=${fmt(approx)}$，$\\approx${m}\\times10^{${k}}$，是 ${Math.floor(L) + 1} 位數`,
        sci: `2^{20}\\times5^{10}\\approx${m}\\times10^{${k}}`
      };
    }
    if (e.t === 'lg') {
      const Lv = parseFloat(e.L), ans = Math.floor(Lv) + 1;
      return {
        key: `lg${e.L}`, answer: ans, unit: '位數', prefix: '',
        lens: `\\log a=${e.L}`,
        prompt: `若 $\\log a=${e.L}$，則 $a$ 的整數部分是幾位數？`, given: '',
        hint: `$a=10^{${e.L}}$，介於 $10^{${Math.floor(Lv)}}$ 與 $10^{${Math.floor(Lv) + 1}}$ 之間`,
        explain: `$a=10^{${e.L}}=10^{${fmt(Lv - Math.floor(Lv))}}\\times10^{${Math.floor(Lv)}}$，整數部分是 ${ans} 位數`,
        sci: `a=10^{${e.L}}\\approx${sci(Lv)[0]}\\times10^{${Math.floor(Lv)}}`
      };
    }
    if (e.t === 'tsu') {
      const ans = Math.pow(2, e.b - e.a);
      return {
        key: `tsu${e.a}${e.b}`, answer: ans, unit: '倍', prefix: '',
        lens: 'I=\\frac{1}{2}+\\log_2 H',
        prompt: `海嘯等級 $I=\\frac12+\\log_2 H$（$H$ 為平均浪高）。等級 ${e.b} 的浪高是等級 ${e.a} 的幾倍？`, given: '',
        hint: `等級差 $${e.b - e.a}$，就是 $\\log_2 H$ 差 $${e.b - e.a}$`,
        explain: `$\\log_2 H_{${e.b}}-\\log_2 H_{${e.a}}=${e.b - e.a}\\Rightarrow\\frac{H_{${e.b}}}{H_{${e.a}}}=2^{${e.b - e.a}}=${ans}$`,
        sci: `\\frac{H_{${e.b}}}{H_{${e.a}}}=2^{${e.b - e.a}}=${ans}`
      };
    }
    if (e.t === 'star') {
      return {
        key: 'star', answer: 10, unit: '倍', prefix: '',
        lens: 'y=-\\frac{5}{2}\\log\\frac{x}{a}',
        prompt: '視星等 $y=-\\frac52\\log\\frac{x}{a}$（$a$ 為織女星亮度）。視星等 $-2.5$ 的星，亮度是織女星的幾倍？', given: '',
        hint: '$-2.5=-\\frac52\\log\\frac{x}{a}$，先求 $\\log\\frac{x}{a}$',
        explain: '$\\log\\frac{x}{a}=1\\Rightarrow\\frac{x}{a}=10$，是 10 倍',
        sci: '\\log\\frac{x}{a}=1\\Rightarrow x=10a'
      };
    }
    // 'db'
    return {
      key: 'db', answer: 100, unit: '倍', prefix: '',
      lens: 'd=10\\log\\frac{w}{10^{-12}}',
      prompt: '音量 $d=10\\log\\frac{w}{10^{-12}}$（$w$ 為聲音強度）。音量增加 20 分貝，聲音強度變為幾倍？', given: '',
      hint: '$d$ 增加 20，代表 $\\log\\frac{w}{10^{-12}}$ 增加 2',
      explain: '$10\\log\\frac{w_2}{w_1}=20\\Rightarrow\\log\\frac{w_2}{w_1}=2\\Rightarrow\\frac{w_2}{w_1}=100$',
      sci: '\\frac{w_2}{w_1}=10^{2}=100'
    };
  }

  const D = (b, n) => ({ t: 'dig', b, n });
  const F = (b, n) => ({ t: 'dec', b, n });
  const BANK = {
    easy: [D(2, 10), D(2, 20), D(3, 10), D(2, 30), F('0.5', 10), { t: 'lg', L: '5.67' }, { t: 'lg', L: '3.2' }, { t: 'tsu', a: 3, b: 4 }],
    normal: [D(2, 50), D(2, 100), D(3, 20), D(3, 50), D(6, 10), F('0.5', 50), F('0.5', 100), F('1/3', 20),
      { t: 'tsu', a: 3, b: 5 }, { t: 'star' }, { t: 'db' }],
    hard: [D(5, 20), D(12, 10), D(3, 100), D(4, 25), F('0.3', 10), F('0.2', 10), F('0.4', 100), { t: 'mix' }, { t: 'db' }]
  };

  class L4 extends LG.LevelBase {
    static pick(diff) { return build(U.pickFresh('l4' + diff, BANK[diff], e => JSON.stringify(e))); }

    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.4;
      this.setQuestion(U.rich(q.prompt) + (q.given ? `<div class="given">${U.rich(q.given)}</div>` : ''));
      const nd = q.answer >= 100 ? 3 : 2;
      this.digits = new Array(nd).fill(0);
      this.touched = false;
      const m = scr.main;
      m.classList.add('l4');
      m.innerHTML = `
        <div class="scope"><div class="lens"><div class="stars"></div><div class="cross"></div>
          <div class="lens-num">${U.tex(q.lens)}</div><div class="lens-sci">${U.tex(q.sci)}</div></div></div>
        <div class="dials">
          ${q.prefix ? `<span class="dl-pre">${q.prefix}</span>` : ''}
          ${this.digits.map((d, i) => `<div class="dial" data-i="${i}"><div class="dl-btn up">▲</div><div class="dl-win"><span class="dl-d">0</span></div><div class="dl-btn dn">▼</div></div>`).join('')}
          <span class="dl-unit">${q.unit}</span>
        </div>`;
      this.lens = m.querySelector('.lens');
      this.dials = Array.from(m.querySelectorAll('.dial'));
      this.dials.forEach((el, i) => {
        LG.input.onTap(el.querySelector('.up'), () => this.bump(i, 1), { sound: false, enabled: () => this.playing });
        LG.input.onTap(el.querySelector('.dn'), () => this.bump(i, -1), { sound: false, enabled: () => this.playing });
        const win = el.querySelector('.dl-win');
        let acc = 0, lastY = 0;
        LG.input.onDrag(win, {
          down: (e, p) => { if (!this.playing) return false; acc = 0; lastY = p.y; },
          move: (e, p) => {
            const step = Math.max(14, win.clientHeight * 0.32);
            acc += lastY - p.y; lastY = p.y;
            while (acc > step) { acc -= step; this.bump(i, 1); }
            while (acc < -step) { acc += step; this.bump(i, -1); }
          }
        }, { threshold: true });
      });
      this.setGo('觀測！', () => this.go());
      this.setGoEnabled(false);
    }

    layout() {
      U.fit(this.lens.querySelector('.lens-num'), 0.5, true);
      U.fit(this.lens.querySelector('.lens-sci'), 0.5, true);
    }

    bump(i, d) {
      if (!this.playing) return;
      this.digits[i] = (this.digits[i] + d + 10) % 10;
      this.touched = true;
      LG.audio.play('dial');
      const el = this.dials[i];
      el.querySelector('.dl-d').textContent = String(this.digits[i]);
      el.classList.remove('up-anim', 'dn-anim');
      void el.offsetWidth;
      el.classList.add(d > 0 ? 'up-anim' : 'dn-anim');
      this.dials.forEach(x => x.classList.remove('bad'));
      this.setGoEnabled(this.value() > 0);
    }

    value() { return parseInt(this.digits.join(''), 10) || 0; }

    setDigits(n) {
      const s = String(n).padStart(this.digits.length, '0');
      this.digits = s.split('').map(Number);
      this.dials.forEach((el, i) => { el.querySelector('.dl-d').textContent = s[i]; });
    }

    go() {
      if (!this.touched) return;
      const v = this.value();
      const r = this.submit(v === this.q.answer);
      if (r === 'retry') {
        this.dials.forEach(x => x.classList.add('bad'));
        this.lens.classList.remove('blur'); void this.lens.offsetWidth; this.lens.classList.add('blur');
      }
    }

    celebrate() {
      this.lens.classList.add('ok');
      this.dials.forEach(x => x.classList.add('ok'));
      const p = this.zone.fx.rel(this.lens);
      this.zone.fx.burst(p.x, p.y, { n: 40, colors: ['#ff8f73', '#ffd34d', '#ffffff'], speed: [160, 520], gravity: 120 });
    }

    reveal() {
      this.setDigits(this.q.answer);
      this.dials.forEach(x => { x.classList.remove('bad'); x.classList.add('answer'); });
      this.lens.classList.add('ok', 'answer');
    }
  }

  L4.meta = { id: 4, name: '巨數望遠鏡', unit: 6, topic: '常用對數與科學記號' };
  L4.BANK = BANK; L4.build = build;
  LG.registerLevel(L4);
})(window.LG);
