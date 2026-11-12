/* 第 6 關｜骨牌魔王關（單元 7：對數方程式、不等式與應用）
   3D 骨牌排向臺北 101：答對後骨牌一路倒下、101 放煙火；答錯骨牌搖晃停住。 */
'use strict';
(function (LG) {
  const U = LG.util;
  const lg = Math.log10, L = (a, b) => Math.log(b) / Math.log(a);

  // 骨牌題：第 1 張高 h0，每張是前一張的 r 倍，第幾張開始超過 H？
  const dominoN = (h0, r, H) => { let n = 1, h = h0; while (h <= H) { h *= r; n++; } return n; };

  const Q = (key, prompt, opts, hint, explain, verify) => ({ key, prompt, opts, hint, explain, verify });
  const BANK = {
    easy: [
      Q('e1', '解方程式 $\\log_{2}x=3$', ['$x=8$', '$x=6$', '$x=9$', '$x=\\dfrac32$'],
        '$\\log_2 x=3 \\iff x=2^{3}$',
        '$x=2^{3}=8$',
        { t: 'eq', f: x => L(2, x) - 3, roots: [8], dom: x => x > 0 }),
      Q('e2', '解方程式 $\\log x=-2$', ['$x=\\dfrac{1}{100}$', '$x=-100$', '$x=-20$', '$x=100$'],
        '$\\log x=-2 \\iff x=10^{-2}$',
        '$x=10^{-2}=\\frac{1}{100}$',
        { t: 'eq', f: x => lg(x) + 2, roots: [0.01], dom: x => x > 0, range: [0.0001, 50] }),
      Q('e3', '解方程式 $\\log_{2}(x-1)=2$', ['$x=5$', '$x=3$', '$x=4$', '$x=9$'],
        '$x-1=2^{2}$',
        '$x-1=4\\Rightarrow x=5$',
        { t: 'eq', f: x => L(2, x - 1) - 2, roots: [5], dom: x => x > 1 }),
      Q('e4', '解不等式 $\\log_{2}x>3$', ['$x>8$', '$0<x<8$', '$x>6$', '$x>9$'],
        '$3=\\log_2 8$；底數 $2>1$，不等號方向不變',
        '$\\log_2 x>\\log_2 8\\Rightarrow x>8$',
        { t: 'ineq', p: x => x > 0 && L(2, x) > 3, a: x => x > 8 }),
      Q('e5', '第 1 張骨牌高 2 英吋，之後每張是前一張的 $1.5$ 倍。從第幾張開始，高度超過 10 英吋？', ['第 5 張', '第 4 張', '第 6 張', '第 7 張'],
        '依序算：$2,\\ 3,\\ 4.5,\\ \\ldots$',
        '$2,\\ 3,\\ 4.5,\\ 6.75,\\ 10.125$，第 5 張開始超過 10 英吋',
        { t: 'n', got: dominoN(2, 1.5, 10), want: 5 }),
      Q('e6', '第 1 張骨牌高 1 公分，之後每張是前一張的 2 倍。從第幾張開始，高度超過 1000 公分？', ['第 11 張', '第 10 張', '第 12 張', '第 9 張'],
        '第 $n$ 張高 $2^{n-1}$ 公分，而 $2^{10}=1024$',
        '$2^{n-1}>1000$，$2^{9}=512$、$2^{10}=1024$，所以 $n-1=10$，第 11 張',
        { t: 'n', got: dominoN(1, 2, 1000), want: 11 }),
      Q('e7', '解方程式 $\\log_{3}x=-1$', ['$x=\\dfrac13$', '$x=-3$', '$x=3$', '$x=-\\dfrac13$'],
        '$\\log_3 x=-1 \\iff x=3^{-1}$',
        '$x=3^{-1}=\\frac13$',
        { t: 'eq', f: x => L(3, x) + 1, roots: [1 / 3], dom: x => x > 0, range: [0.001, 50] })
    ],
    normal: [
      Q('n1', '解方程式 $\\log x=2\\log\\sqrt{6}$', ['$x=6$', '$x=12$', '$x=\\sqrt6$', '$x=36$'],
        '$2\\log\\sqrt6=\\log(\\sqrt6)^{2}$',
        '$\\log x=\\log 6\\Rightarrow x=6$',
        { t: 'eq', f: x => lg(x) - 2 * lg(Math.sqrt(6)), roots: [6], dom: x => x > 0 }),
      Q('n2', '解方程式 $\\log(x+2)-\\log x=\\log 3$', ['$x=1$', '$x=2$', '$x=3$', '$x=-1$'],
        '$\\log(x+2)-\\log x=\\log\\frac{x+2}{x}$；真數要為正',
        '$\\frac{x+2}{x}=3\\Rightarrow x+2=3x\\Rightarrow x=1$',
        { t: 'eq', f: x => lg(x + 2) - lg(x) - lg(3), roots: [1], dom: x => x > 0 }),
      Q('n3', '解方程式 $\\log_{2}(x+3)-\\log_{2}(x-1)=1$', ['$x=5$', '$x=1$', '$x=3$', '$x=7$'],
        '$\\log_2\\frac{x+3}{x-1}=1$，所以 $\\frac{x+3}{x-1}=2$',
        '$x+3=2x-2\\Rightarrow x=5$（$x>1$ 符合）',
        { t: 'eq', f: x => L(2, x + 3) - L(2, x - 1) - 1, roots: [5], dom: x => x > 1 }),
      Q('n4', '解不等式 $\\log(x-1)<1$', ['$1<x<11$', '$x<11$', '$x>11$', '$0<x<10$'],
        '先看真數 $x-1>0$；再把 $1$ 寫成 $\\log 10$',
        '$x>1$ 且 $x-1<10$，所以 $1<x<11$',
        { t: 'ineq', p: x => x > 1 && lg(x - 1) < 1, a: x => x > 1 && x < 11 }),
      Q('n5', '解方程式 $\\log_{3}x+\\log_{3}2=2$', ['$x=\\dfrac92$', '$x=7$', '$x=3$', '$x=4$'],
        '$\\log_3 2x=2$，所以 $2x=3^{2}$',
        '$2x=9\\Rightarrow x=\\frac92$',
        { t: 'eq', f: x => L(3, x) + L(3, 2) - 2, roots: [4.5], dom: x => x > 0 }),
      Q('n6', '解不等式 $\\log_{2}(x+1)\\le2$', ['$-1<x\\le3$', '$x\\le3$', '$0<x\\le3$', '$x\\le4$'],
        '真數 $x+1>0$；再把 $2$ 寫成 $\\log_2 4$',
        '$x>-1$ 且 $x+1\\le4$，所以 $-1<x\\le3$',
        { t: 'ineq', p: x => x > -1 && L(2, x + 1) <= 2 + 1e-12, a: x => x > -1 && x <= 3 }),
      Q('n7', '視星等 $y=-\\frac52\\log\\frac{x}{a}$（$a$ 為織女星亮度）。某星視星等為 $-5$，亮度是織女星的幾倍？', ['$100$ 倍', '$10$ 倍', '$2$ 倍', '$1000$ 倍'],
        '$-5=-\\frac52\\log\\frac{x}{a}$，先求 $\\log\\frac{x}{a}$',
        '$\\log\\frac{x}{a}=2\\Rightarrow\\frac{x}{a}=100$',
        { t: 'val', got: Math.pow(10, -5 / (-5 / 2)), want: 100 }),
      Q('n8', '第 1 張骨牌高 1 公分，之後每張是前一張的 2 倍。從第幾張開始，高度超過臺北 101（約 50000 公分）？', ['第 17 張', '第 16 張', '第 18 張', '第 15 張'],
        '$2^{n-1}>50000$，兩邊取 $\\log$：$(n-1)\\log2>\\log50000\\approx4.7$',
        '$n-1>\\frac{4.7}{0.301}\\approx15.6$，所以 $n-1=16$，第 17 張（$2^{16}=65536$）',
        { t: 'n', got: dominoN(1, 2, 50000), want: 17 })
    ],
    hard: [
      Q('h1', '解方程式 $\\log_{3}x+\\log_{3}(x-1)=1+\\log_{3}2$', ['$x=3$', '$x=3$ 或 $x=-2$', '$x=-2$', '$x=6$'],
        '先看真數：$x>1$；再化成 $\\log_3 x(x-1)=\\log_3 6$',
        '$x^{2}-x-6=0\\Rightarrow x=3$ 或 $-2$；但 $x>1$，所以 $x=3$',
        { t: 'eq', f: x => L(3, x) + L(3, x - 1) - 1 - L(3, 2), roots: [3], dom: x => x > 1 }),
      Q('h2', '解方程式 $\\log 3x+\\log(x-3)=\\log 12$', ['$x=4$', '$x=4$ 或 $x=-1$', '$x=-1$', '$x=5$'],
        '先看真數：$x>3$；再化成 $3x(x-3)=12$',
        '$x^{2}-3x-4=0\\Rightarrow x=4$ 或 $-1$；但 $x>3$，所以 $x=4$',
        { t: 'eq', f: x => lg(3 * x) + lg(x - 3) - lg(12), roots: [4], dom: x => x > 3 }),
      Q('h3', '解不等式 $\\log_{\\frac13}x+\\log_{\\frac13}(x-2)>-1$', ['$2<x<3$', '$-1<x<3$', '$x>3$', '$0<x<3$'],
        '真數：$x>2$；底數小於 1，去掉 $\\log$ 時不等號要變向',
        '$x(x-2)<3\\Rightarrow -1<x<3$，再配合 $x>2$，得 $2<x<3$',
        { t: 'ineq', p: x => x > 2 && L(1 / 3, x) + L(1 / 3, x - 2) > -1, a: x => x > 2 && x < 3 }),
      Q('h4', '解不等式 $\\log_{3}(x-3)+\\log_{3}(x-5)<1$', ['$5<x<6$', '$2<x<6$', '$x>6$', '$3<x<6$'],
        '真數：$x>5$；$(x-3)(x-5)<3$',
        '$x^{2}-8x+12<0\\Rightarrow 2<x<6$，再配合 $x>5$，得 $5<x<6$',
        { t: 'ineq', p: x => x > 5 && L(3, x - 3) + L(3, x - 5) < 1, a: x => x > 5 && x < 6 }),
      Q('h5', '解不等式 $\\log x^{2}>0$', ['$x<-1$ 或 $x>1$', '$x>1$', '$-1<x<1$', '$x>0$'],
        '$\\log x^{2}>\\log 1$，所以 $x^{2}>1$（$x\\ne0$）',
        '$x^{2}>1\\Rightarrow x<-1$ 或 $x>1$',
        { t: 'ineq', p: x => x !== 0 && lg(x * x) > 0, a: x => x < -1 || x > 1 }),
      Q('h6', '比較 $a=\\log_{3}4$、$b=\\log_{9}25$、$c=-\\log_{\\frac13}6$ 的大小', ['$a<b<c$', '$c<b<a$', '$b<a<c$', '$a<c<b$'],
        '都換成以 3 為底：$\\log_9 25=\\log_3 5$',
        '$a=\\log_3 4$、$b=\\log_3 5$、$c=\\log_3 6$，所以 $a<b<c$',
        { t: 'order', vals: [L(3, 4), L(9, 25), -L(1 / 3, 6)] }),
      Q('h7', '第 1 張骨牌高 1 公分，之後每張是前一張的 3 倍。從第幾張開始，高度超過 10000 公分？', ['第 10 張', '第 9 張', '第 11 張', '第 8 張'],
        '$3^{n-1}>10^{4}$，兩邊取 $\\log$：$(n-1)\\times0.4771>4$',
        '$n-1>\\frac{4}{0.4771}\\approx8.4$，所以 $n-1=9$，第 10 張',
        { t: 'n', got: dominoN(1, 3, 10000), want: 10 }),
      Q('h8', '解不等式 $\\log_{\\frac12}(x-1)>2$', ['$1<x<\\dfrac54$', '$x<\\dfrac54$', '$x>\\dfrac54$', '$1<x<5$'],
        '真數 $x-1>0$；$2=\\log_{\\frac12}\\frac14$，底數小於 1 要變向',
        '$0<x-1<\\frac14\\Rightarrow 1<x<\\frac54$',
        { t: 'ineq', p: x => x > 1 && L(0.5, x - 1) > 2, a: x => x > 1 && x < 1.25 })
    ]
  };

  class L6 extends LG.LevelBase {
    static pick(diff) { return U.pickFresh('l6' + diff, BANK[diff], q => q.key); }

    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 3.7;
      this.setQuestion(U.rich(q.prompt));
      const m = scr.main;
      m.classList.add('l6');
      m.innerHTML = `<div class="v3d"><canvas class="v3d-cv"></canvas><div class="v3d-tag">目標：超越臺北 101</div></div><div class="cards4"></div>`;
      this.v3d = m.querySelector('.v3d');
      this.cv = m.querySelector('.v3d-cv');
      this.ctx2d = this.cv.getContext('2d', { alpha: false });
      this.order = U.shuffle([0, 1, 2, 3]);
      const box = m.querySelector('.cards4');
      this.cards = this.order.map((oi, s) => {
        const el = U.el('div', 'opt', `<div class="ox">${U.rich(q.opts[oi])}</div>`);
        box.appendChild(el);
        LG.input.onTap(el, () => this.select(s), { sound: false, enabled: () => this.playing });
        return el;
      });
      this.sel = -1;
      if (LG.Shared3D.init()) {
        this.scene = new LG.DominoScene();
        this.view = { scene: this.scene.scene, camera: this.scene.camera, ctx: this.ctx2d, w: 0, h: 0 };
        LG.Shared3D.add(this.view);
      } else {
        this.scene = new LG.Domino2D(this.ctx2d);
        this.is2d = true;
      }
      this.setGo('推倒骨牌！', () => this.go());
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
      const r = this.v3d.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;
      const s = Math.min(this.scale(), 1.5);
      const w = Math.round(r.width * s), h = Math.round(r.height * s);
      if (this.cv.width !== w) this.cv.width = w;
      if (this.cv.height !== h) this.cv.height = h;
      if (this.view) { this.view.w = w; this.view.h = h; }
      this.scene.resize(w, h);
      this.cards.forEach(c => U.fit(c, 0.55));
    }

    go() {
      if (this.sel < 0) return;
      const oi = this.order[this.sel];
      this.lastPick = oi;
      const r = this.submit(oi === 0);
      if (r === 'retry') {
        const c = this.cards[this.sel];
        c.classList.remove('on');
        c.classList.add('bad');
        this.sel = -1;
        this.setGoEnabled(false);
        this.scene.wobble();
      }
    }

    celebrate() {
      this.cards[this.sel >= 0 ? this.sel : this.order.indexOf(0)].classList.add('ok');
      this.scene.topple();
      this.zone.after(2.3, () => {
        const p = this.zone.fx.rel(this.v3d);
        this.zone.fx.confetti(p.x, p.y, { n: 40 });
      });
    }

    reveal(reason) {
      if (reason !== 'timeout' && this.lastPick != null && this.lastPick !== 0) {
        const s = this.order.indexOf(this.lastPick);
        this.cards[s].classList.remove('on');
        this.cards[s].classList.add('bad');
        this.scene.wobble();
      }
      this.cards[this.order.indexOf(0)].classList.add('answer');
    }

    update(dt) {
      this.scene.update(dt);
      if (this.is2d) this.scene.render();
    }

    destroy() {
      super.destroy();
      if (this.view) LG.Shared3D.remove(this.view);
      try { this.scene.dispose(); } catch (e) { /* ignore */ }
    }
  }

  L6.meta = { id: 6, name: '骨牌魔王關', unit: 7, topic: '對數方程式與不等式' };
  L6.BANK = BANK; L6.dominoN = dominoN;
  LG.registerLevel(L6);
})(window.LG);
