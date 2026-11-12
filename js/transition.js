/* 指對數實驗室 — 關卡轉場（2 秒）：
   一張藍圖紙從上方掃下蓋住畫面 → 繪圖筆畫出該單元的代表曲線、關卡編號蓋章 → 紙張往下滑走露出新關卡 */
'use strict';
(function (LG) {
  const U = LG.util;
  const DUR = 2.0, SWAP = 0.36;

  class Transition {
    constructor(zone) {
      this.zone = zone;
      const el = this.el = U.el('div', 'trans');
      el.innerHTML = `
        <div class="tr-sheet">
          <canvas class="tr-cv"></canvas>
          <div class="tr-text">
            <div class="tr-big"></div>
            <div class="tr-name"></div>
            <div class="tr-unit"></div>
          </div>
        </div>`;
      zone.stage.appendChild(el);
      this.cv = el.querySelector('.tr-cv');
      this.ctx = this.cv.getContext('2d');
      this.big = el.querySelector('.tr-big');
      this.name = el.querySelector('.tr-name');
      this.unit = el.querySelector('.tr-unit');
      this.active = false;
      this.t = 0;
      this.sparks = [];
    }

    resize() {
      const r = this.el.getBoundingClientRect();
      const s = Math.min(LG.settings.canvasScale(), 1.5);
      this.w = r.width; this.h = r.height; this.s = s;
      const W = Math.max(2, Math.round(r.width * s)), H = Math.max(2, Math.round(r.height * s));
      if (this.cv.width !== W || this.cv.height !== H) { this.cv.width = W; this.cv.height = H; }
    }

    /* info: { kind:'level', num, total, meta } 或 { kind:'finish' } */
    play(info, onSwap, onDone) {
      const z = this.zone;
      this.info = info; this.t = 0; this.active = true; this.sparks = [];
      if (info.kind === 'finish') {
        this.color = '#f2f6fb';
        this.curve = 'all';
        this.big.innerHTML = '<span class="w">完成</span>';
        this.name.textContent = '六關挑戰結束';
        this.unit.textContent = '正在結算總分';
      } else {
        const m = info.meta;
        this.color = U.UNIT_HEX[m.unit];
        this.curve = m.unit === 5 ? 'exp' : m.unit === 6 ? 'log' : 'mirror';
        this.big.innerHTML = `<span class="pre">第</span><span class="n">${info.num}</span><span class="post">關</span>`;
        this.name.textContent = m.name;
        this.unit.textContent = `單元 ${m.unit}｜${m.topic}`;
      }
      this.el.style.setProperty('--tc', this.color);
      this.el.classList.remove('run');
      void this.el.offsetWidth;
      this.el.classList.add('run');
      this.resize();
      LG.audio.play('whoosh');
      const token = this.token = {};
      z.after(SWAP, () => { if (this.token !== token) return; try { onSwap(); } catch (e) { console.error(e); } });
      z.after(0.62, () => { if (this.token === token) LG.audio.play('stamp'); });
      z.after(DUR, () => {
        if (this.token !== token) return;
        this.stop();
        try { onDone(); } catch (e) { console.error(e); }
      });
    }

    stop() {
      this.token = null;
      this.active = false;
      this.el.classList.remove('run');
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.cv.width, this.cv.height);
    }

    update(dt) {
      if (!this.active) return;
      this.t += dt;
      this.draw(dt);
    }

    draw(dt) {
      const g = this.ctx, W = this.cv.width, H = this.cv.height, s = this.s, t = this.t;
      if (W < 3) return;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, W, H);
      const fade = t < 1.5 ? U.clamp((t - 0.12) / 0.25, 0, 1) : U.clamp(1 - (t - 1.5) / 0.35, 0, 1);
      if (fade <= 0) return;
      // 座標系：原點偏左下，讓曲線斜穿整張紙
      const unit = Math.min(W, H) / 6.2;
      const ox = W * 0.42, oy = H * 0.66;
      const X = x => ox + x * unit, Y = y => oy - y * unit;
      g.globalAlpha = fade * 0.5;
      g.strokeStyle = 'rgba(220, 236, 255, 0.9)';
      g.lineWidth = 2 * s;
      g.beginPath(); g.moveTo(0, oy); g.lineTo(W, oy); g.moveTo(ox, H); g.lineTo(ox, 0); g.stroke();
      const p = U.ease.inOutCubic(U.clamp((t - 0.28) / 0.95, 0, 1));
      const curves = [];
      const xL = -ox / unit - 0.2, xR = (W - ox) / unit + 0.2;
      if (this.curve === 'exp' || this.curve === 'mirror' || this.curve === 'all') {
        curves.push({ f: x => Math.pow(2, x), x0: xL, x1: Math.min(xR, Math.log2(oy / unit + 1)), color: this.curve === 'all' ? U.UNIT_HEX[5] : this.color });
      }
      if (this.curve === 'log' || this.curve === 'mirror' || this.curve === 'all') {
        curves.push({ f: x => Math.log2(x), x0: Math.pow(2, -(H - oy) / unit - 0.2), x1: xR, color: this.curve === 'all' ? U.UNIT_HEX[7] : this.curve === 'mirror' ? '#f2f6fb' : this.color, log: true });
      }
      if (this.curve === 'mirror' || this.curve === 'all') {
        g.globalAlpha = fade * 0.55;
        g.setLineDash([10 * s, 9 * s]);
        g.beginPath(); g.moveTo(X(xL), Y(xL)); g.lineTo(X(xR), Y(xR)); g.stroke();
        g.setLineDash([]);
      }
      for (const c of curves) {
        const N = 160, pts = [];
        for (let i = 0; i <= N * p; i++) {
          const u = i / N;
          const x = c.log ? c.x0 * Math.pow(c.x1 / c.x0, u) : c.x0 + (c.x1 - c.x0) * u;
          pts.push([X(x), Y(c.f(x))]);
        }
        if (pts.length < 2) continue;
        g.lineJoin = 'round'; g.lineCap = 'round';
        g.strokeStyle = c.color;
        g.globalAlpha = fade * 0.25; g.lineWidth = 22 * s;
        g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.stroke();
        g.globalAlpha = fade; g.lineWidth = 7 * s;
        g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.stroke();
        // 筆尖與火花
        const tip = pts[pts.length - 1];
        if (p < 1) {
          g.globalAlpha = fade;
          g.fillStyle = '#ffffff';
          g.beginPath(); g.arc(tip[0], tip[1], 9 * s, 0, Math.PI * 2); g.fill();
          if (dt > 0 && LG.settings.data.fx !== 'lite') {
            for (let k = 0; k < 3; k++) {
              const a = U.rand(0, Math.PI * 2), v = U.rand(60, 260) * s;
              this.sparks.push({ x: tip[0], y: tip[1], vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: U.rand(0.25, 0.6), color: c.color });
            }
          }
        }
      }
      g.globalCompositeOperation = 'lighter';
      for (let i = this.sparks.length - 1; i >= 0; i--) {
        const k = this.sparks[i];
        k.life += dt;
        if (k.life > k.max) { this.sparks.splice(i, 1); continue; }
        k.x += k.vx * dt; k.y += k.vy * dt; k.vy += 300 * s * dt;
        g.globalAlpha = fade * (1 - k.life / k.max);
        g.fillStyle = k.color;
        g.beginPath(); g.arc(k.x, k.y, 3.2 * s, 0, Math.PI * 2); g.fill();
      }
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = 1;
    }
  }

  Transition.DUR = DUR;
  LG.Transition = Transition;
})(window.LG);
