/* 第 6 關｜觀念法庭（單元 6：對數的觀念判斷，取材自課本「觀念澄清」）
   一次一張敘述卡：成立就往右滑（或按 ○），不成立就往左滑（或按 ✗）。全部判對才過關。 */
'use strict';
(function (LG) {
  const U = LG.util;
  const L = (a, b) => Math.log(b) / Math.log(a);
  const lg = Math.log10;
  const near = (a, b) => Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));

  // S(敘述, 是否成立, 提示, 理由, 驗算) —— 驗算只給自動測試用
  const S = (tex, truth, hint, why, check) => ({ tex, truth, hint, why, check });
  const BANK = {
    easy: [
      S('$\\log_{2}8=3$', true, '$2$ 的幾次方是 $8$？', '$2^{3}=8$，所以 $\\log_2 8=3$', () => near(L(2, 8), 3)),
      S('$\\log 1=0$', true, '$10$ 的幾次方是 $1$？', '$10^{0}=1$，所以 $\\log 1=0$', () => lg(1) === 0),
      S('$\\log_{3}1=1$', false, '$3$ 的幾次方是 $1$？', '$3^{0}=1$，所以 $\\log_3 1=0$', () => near(L(3, 1), 1)),
      S('$\\log_{5}5=1$', true, '$5$ 的幾次方是 $5$？', '$5^{1}=5$，所以 $\\log_5 5=1$', () => near(L(5, 5), 1)),
      S('$\\log 1000=4$', false, '$1000=10^{?}$', '$1000=10^{3}$，所以 $\\log 1000=3$', () => near(lg(1000), 4)),
      S('$\\log_{2}\\dfrac12=-1$', true, '$\\frac12=2^{?}$', '$\\frac12=2^{-1}$，所以等於 $-1$', () => near(L(2, 0.5), -1)),
      S('$\\log_{4}2=2$', false, '$4$ 的幾次方是 $2$？', '$4^{\\frac12}=2$，所以 $\\log_4 2=\\frac12$', () => near(L(4, 2), 2)),
      S('$10^{\\log 7}=7$', true, '想想 $a^{\\log_a b}$ 等於多少', '$a^{\\log_a b}=b$，所以 $10^{\\log 7}=7$', () => near(Math.pow(10, lg(7)), 7)),
      S('$\\log 2+\\log 5=1$', true, '$\\log r+\\log s=\\log rs$', '$\\log 2+\\log 5=\\log 10=1$', () => near(lg(2) + lg(5), 1)),
      S('$\\log_{2}(-4)=-2$', false, '真數可以是負數嗎？', '真數必須為正，$\\log_2(-4)$ 沒有意義', () => false),
      S('$\\log 0.1=-1$', true, '$0.1=10^{?}$', '$0.1=10^{-1}$，所以 $\\log 0.1=-1$', () => near(lg(0.1), -1))
    ],
    normal: [
      S('$2^{\\log_{2}3}=3$', true, '想想 $a^{\\log_a b}$ 等於多少', '$a^{\\log_a b}=b$', () => near(Math.pow(2, L(2, 3)), 3)),
      S('$\\log(5+9)=\\log 5\\times\\log 9$', false, '對數律是 $\\log rs=\\log r+\\log s$，有「和的對數」公式嗎？', '$\\log(5+9)=\\log 14$，沒有這種公式', () => near(lg(14), lg(5) * lg(9))),
      S('$\\log\\sqrt{5}=\\dfrac12\\log 5$', true, '$\\sqrt5=5^{\\frac12}$，而 $\\log r^{t}=t\\log r$', '$\\log 5^{\\frac12}=\\frac12\\log 5$', () => near(lg(Math.sqrt(5)), lg(5) / 2)),
      S('$\\log_{2}3=\\dfrac{1}{\\log_{3}2}$', true, '用換底公式把兩邊都寫成 $\\frac{\\log ?}{\\log ?}$', '$\\log_2 3=\\frac{\\log 3}{\\log 2}$，$\\log_3 2=\\frac{\\log 2}{\\log 3}$，互為倒數', () => near(L(2, 3), 1 / L(3, 2))),
      S('若 $\\log a=5.67$，則 $a$ 的整數部分是 5 位數', false, '$a=10^{5.67}$ 介於哪兩個 10 的次方之間？', '$10^{5}<a<10^{6}$，是 6 位數', () => Math.floor(5.67) + 1 === 5),
      S('$\\log(2\\times5)=\\log 2\\times\\log 5$', false, '$\\log rs$ 應該等於什麼？', '$\\log(2\\times5)=\\log 2+\\log 5=1$', () => near(lg(10), lg(2) * lg(5))),
      S('$\\log\\dfrac{20}{2}=\\dfrac{\\log 20}{\\log 2}$', false, '$\\log\\frac{r}{s}$ 應該等於什麼？', '$\\log\\frac{20}{2}=\\log 20-\\log 2=1$', () => near(lg(10), lg(20) / lg(2))),
      S('$\\log 8=3\\log 2$', true, '$8=2^{3}$', '$\\log 2^{3}=3\\log 2$', () => near(lg(8), 3 * lg(2))),
      S('$\\log_{4}5\\times\\log_{5}4=1$', true, '換底：$\\frac{\\log 5}{\\log 4}\\times\\frac{\\log 4}{\\log 5}$', '換底後分子分母互相約掉，等於 1', () => near(L(4, 5) * L(5, 4), 1)),
      S('$\\log_{3}5=\\dfrac{\\log 5}{\\log 3}$', true, '換底公式：$\\log_a b=\\frac{\\log b}{\\log a}$', '這正是換底公式', () => near(L(3, 5), lg(5) / lg(3))),
      S('$(\\log 3)^{2}=2\\log 3$', false, '$2\\log 3$ 是 $\\log$ 什麼？', '$2\\log 3=\\log 9$，不等於 $(\\log 3)^{2}$', () => near(lg(3) * lg(3), 2 * lg(3))),
      S('$\\log_{2}6=\\log_{2}2+\\log_{2}3$', true, '$6=2\\times3$', '$\\log_2(2\\times3)=\\log_2 2+\\log_2 3$', () => near(L(2, 6), L(2, 2) + L(2, 3))),
      S('$\\log 2-\\log 20=1$', false, '$\\log r-\\log s=\\log\\frac{r}{s}$', '$\\log\\frac{2}{20}=\\log\\frac1{10}=-1$', () => near(lg(2) - lg(20), 1))
    ],
    hard: [
      S('$\\log_{8}\\sqrt{2}=\\dfrac16$', true, '$8=2^{3}$、$\\sqrt2=2^{\\frac12}$', '$\\frac{\\frac12\\log 2}{3\\log 2}=\\frac16$', () => near(L(8, Math.SQRT2), 1 / 6)),
      S('$\\log_{\\frac12}8=3$', false, '$\\left(\\frac12\\right)^{?}=8$', '$\\left(\\frac12\\right)^{-3}=8$，所以等於 $-3$', () => near(L(0.5, 8), 3)),
      S('$\\log_{25}\\dfrac15=-\\dfrac12$', true, '$25^{?}=\\frac15$', '$25^{-\\frac12}=\\frac15$', () => near(L(25, 0.2), -0.5)),
      S('$2^{50}$ 是 15 位數（$\\log 2\\approx0.3010$）', false, '先算 $50\\log 2$', '$50\\log 2\\approx15.05$，是 16 位數', () => (2n ** 50n).toString().length === 15),
      S('若 $x=\\log_{2}3$，則 $4^{x}=9$', true, '$4^{x}=(2^{x})^{2}$，而 $2^{x}=3$', '$4^{x}=(2^{x})^{2}=3^{2}=9$', () => near(Math.pow(4, L(2, 3)), 9)),
      S('若 $x=\\log_{2}3$，則 $2^{-x}=-3$', false, '$2^{-x}=\\frac{1}{2^{x}}$', '$2^{-x}=\\frac{1}{2^{x}}=\\frac13$', () => near(Math.pow(2, -L(2, 3)), -3)),
      S('$\\log_{3}5\\times\\log_{5}7\\times\\log_{7}9=2$', true, '換底後連乘可以約分', '約分後剩 $\\frac{\\log 9}{\\log 3}=2$', () => near(L(3, 5) * L(5, 7) * L(7, 9), 2)),
      S('$3\\log 2+\\log 5-2\\log 20=1$', false, '先合併成 $\\log\\frac{2^{3}\\times5}{20^{2}}$', '$\\log\\frac{40}{400}=\\log\\frac1{10}=-1$', () => near(3 * lg(2) + lg(5) - 2 * lg(20), 1)),
      S('$\\ln 3=\\log 3$', false, '$\\ln$ 和 $\\log$ 的底數各是多少？', '$\\ln$ 以 $e$ 為底，$\\log$ 以 10 為底，兩者不同', () => near(Math.log(3), lg(3))),
      S('$\\log_{\\sqrt2}4=4$', true, '$(\\sqrt2)^{?}=4$', '$(\\sqrt2)^{4}=4$', () => near(L(Math.SQRT2, 4), 4)),
      S('把 $(0.5)^{10}$ 寫成小數，從小數點後第 3 位開始不為 0', false, '先算 $10\\log 0.5=-10\\log 2$', '$(0.5)^{10}\\approx9.8\\times10^{-4}$，從第 4 位開始', () => Math.pow(0.5, 10) >= 1e-3),
      S('$\\log_{9}25=\\log_{3}5$', true, '$9=3^{2}$、$25=5^{2}$', '$\\frac{2\\log 5}{2\\log 3}=\\log_3 5$', () => near(L(9, 25), L(3, 5)))
    ]
  };
  const COUNT = { easy: 3, normal: 3, hard: 4 };

  const recent = [];
  function build(diff) {
    const pool = BANK[diff], n = COUNT[diff];
    let pick = null;
    for (let t = 0; t < 80 && !pick; t++) {
      const fresh = t < 50 ? pool.filter(s => !recent.includes(s.tex)) : pool;
      const c = U.shuffle(fresh.length >= n ? fresh : pool).slice(0, n);
      if (c.some(s => s.truth) && c.some(s => !s.truth)) pick = c;   // 一定同時有 ○ 和 ✗
    }
    pick.forEach(s => recent.push(s.tex));
    while (recent.length > 8) recent.shift();
    return { key: pick.map(s => s.tex).join('|'), list: pick, diff };
  }

  const mark = t => (t ? '○' : '✗');

  class L6 extends LG.LevelBase {
    static pick(diff) { return build(diff); }

    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.3;
      this.i = 0;
      this.setQuestion(U.rich('判斷每一句敘述是否成立：成立往右滑（或按 ○），不成立往左滑（或按 ✗）') +
        `<span class="ct-prog">第 <b>1</b>／${q.list.length} 句</span>`);
      const m = scr.main;
      m.classList.add('l6c');
      m.innerHTML = `
        <div class="ct-stage">
          <div class="ct-stack"></div>
          <div class="ct-list"></div>
        </div>
        <div class="ct-btns"><div class="btn ct-no">✗ 不成立</div><div class="btn ct-yes">○ 成立</div></div>`;
      this.stack = m.querySelector('.ct-stack');
      this.listEl = m.querySelector('.ct-list');
      this.cards = q.list.map((s, k) => {
        const el = U.el('div', 'ct-card', `<div class="ct-no-mark">✗</div><div class="ct-yes-mark">○</div><div class="ct-num">${k + 1}</div><div class="ct-tx">${U.rich(s.tex)}</div>`);
        el.style.zIndex = String(10 - k);
        this.stack.appendChild(el);
        return el;
      });
      this.btnNo = m.querySelector('.ct-no');
      this.btnYes = m.querySelector('.ct-yes');
      LG.input.onTap(this.btnNo, () => this.judge(false), { sound: false, enabled: () => this.playing && !this.busy });
      LG.input.onTap(this.btnYes, () => this.judge(true), { sound: false, enabled: () => this.playing && !this.busy });
      this.dx = 0;
      LG.input.onDrag(this.stack, {
        down: (e, p) => { if (!(this.playing && !this.busy && this.i < this.cards.length)) return false; this.x0 = p.x; },
        start: () => { this.cur().classList.add('drag'); },
        move: (e, p) => { this.dx = p.x - this.x0; this.paintDrag(); },
        up: (e, p, started) => this.release(started),
        cancel: () => this.release(false)
      }, { threshold: true });
      this.setGoLabel('左滑 ✗ 不成立　右滑 ○ 成立');
      this.restack();
    }

    cur() { return this.cards[this.i]; }

    hintHTML() {
      const s = this.q.list[Math.min(this.i, this.q.list.length - 1)];
      return U.rich(`第 ${Math.min(this.i, this.q.list.length - 1) + 1} 句：${s.hint}`);
    }

    answerHTML() {
      const s = this.q.list[Math.min(this.i, this.q.list.length - 1)];
      return U.rich(`第 ${Math.min(this.i, this.q.list.length - 1) + 1} 句 ${s.truth ? '○ 成立' : '✗ 不成立'}：${s.why}`);
    }

    layout() { this.cards.forEach(c => U.fit(c.querySelector('.ct-tx'), 0.5)); }

    restack() {
      this.cards.forEach((c, k) => {
        const d = k - this.i;
        if (d < 0) return;
        c.style.transform = `translate(${d * 1.6}%, ${d * 5}%) scale(${1 - d * 0.04})`;
        c.style.opacity = d > 2 ? '0' : String(1 - d * 0.25);
        c.classList.toggle('top', d === 0);
      });
    }

    paintDrag() {
      const c = this.cur();
      if (!c) return;
      const w = this.stack.clientWidth || 1, k = U.clamp(this.dx / (w * 0.3), -1, 1);
      c.style.transform = `translate(${this.dx}px, 0) rotate(${k * 9}deg)`;
      c.querySelector('.ct-yes-mark').style.opacity = String(Math.max(0, k));
      c.querySelector('.ct-no-mark').style.opacity = String(Math.max(0, -k));
    }

    release(started) {
      const c = this.cur();
      const w = this.stack.clientWidth || 1;
      const dx = this.dx;
      this.dx = 0; this.x0 = null;
      if (!c) return;
      c.classList.remove('drag');
      c.querySelector('.ct-yes-mark').style.opacity = '';
      c.querySelector('.ct-no-mark').style.opacity = '';
      if (started && Math.abs(dx) > w * 0.22 && this.playing) this.judge(dx > 0);
      else this.restack();
    }

    judge(v) {
      if (!this.playing || this.busy || this.i >= this.cards.length) return;
      const s = this.q.list[this.i], c = this.cur();
      if (v === s.truth) {
        LG.audio.play('select');
        c.classList.add(v ? 'fly-r' : 'fly-l');
        c.style.transform = '';
        this.done = (this.done || 0) + 1;
        this.i++;
        const prog = this.scr.q.querySelector('.ct-prog b');
        if (prog) prog.textContent = String(Math.min(this.i + 1, this.cards.length));
        if (this.i >= this.cards.length) { this.submit(true); return; }
        this.busy = true;
        setTimeout(() => {
          this.busy = false;
          this.restack();
          if (this.zone.helpUsed && this.zone.state === 'playing') this.zone.showHint();   // 求救卡用過：提示跟著換到下一句
        }, 260);
        return;
      }
      this.wrongPick = v;
      const r = this.submit(false);
      if (r === 'retry') {
        c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake');
        this.restack();
      }
    }

    showList(kind) {
      this.stack.style.display = 'none';
      this.listEl.style.display = 'flex';
      this.listEl.innerHTML = this.q.list.map((s, k) => {
        const cls = k < this.i ? 'done' : (kind === 'ok' ? 'done' : 'ans');
        return `<div class="ct-row ${cls} ${s.truth ? 'yes' : 'no'}"><span class="mk">${mark(s.truth)}</span><span class="tx">${U.rich(s.tex)}</span></div>`;
      }).join('');
      this.listEl.querySelectorAll('.ct-row .tx').forEach(t => U.fit(t, 0.45, true, true));
    }

    celebrate() {
      this.i = this.cards.length;
      setTimeout(() => this.showList('ok'), 300);
      const p = this.zone.fx.rel(this.stack);
      this.zone.fx.confetti(p.x, p.y, { n: 36 });
    }

    reveal() { this.showList('answer'); }
  }

  L6.meta = { id: 6, name: '觀念法庭', unit: 6, topic: '對數的觀念判斷' };
  L6.BANK = BANK; L6.build = build;
  LG.registerLevel(L6);
})(window.LG);
