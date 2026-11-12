/* 指對數實驗室 — 粒子特效（每區一張透明 canvas，只在有粒子時才繪製） */
'use strict';
(function (LG) {
  const U = LG.util;

  class FX {
    constructor(zone) {
      this.zone = zone;
      this.cv = U.el('canvas', 'fx-cv');
      zone.inner.appendChild(this.cv);
      this.ctx = this.cv.getContext('2d');
      this.parts = [];
      this.flies = [];
      this.dirty = false;
      this.w = 1; this.h = 1; this.s = 1;
    }

    resize() {
      const w = this.zone.inner.clientWidth, h = this.zone.inner.clientHeight;
      const s = LG.settings.canvasScale();
      this.w = w; this.h = h; this.s = s;
      const W = Math.max(2, Math.round(w * s)), H = Math.max(2, Math.round(h * s));
      if (this.cv.width !== W || this.cv.height !== H) { this.cv.width = W; this.cv.height = H; }
    }

    /* 元素中心相對於本區的座標 */
    rel(el) {
      const r = el.getBoundingClientRect(), z = this.zone.inner.getBoundingClientRect();
      return { x: r.left - z.left + r.width / 2, y: r.top - z.top + r.height / 2, w: r.width, h: r.height };
    }

    lite() { return LG.settings.data.fx === 'lite'; }
    k() { return this.w / 620; }

    burst(x, y, o) {
      o = o || {};
      if (this.w < 3) this.resize();
      let n = o.n || 26;
      if (this.lite()) n = Math.ceil(n / 2);
      const k = this.k();
      const colors = o.colors || ['#ffffff', '#ffd34d'];
      const sp = o.speed || [120, 420], life = o.life || [0.5, 1.1], size = o.size || [3, 7];
      for (let i = 0; i < n; i++) {
        const a = o.angle != null ? o.angle + U.rand(-(o.spread || 0.6), o.spread || 0.6) : U.rand(0, Math.PI * 2);
        const v = U.rand(sp[0], sp[1]) * k;
        this.parts.push({
          x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
          life: 0, max: U.rand(life[0], life[1]),
          size: U.rand(size[0], size[1]) * k,
          color: U.pick(colors),
          g: (o.gravity == null ? 520 : o.gravity) * k,
          drag: o.drag == null ? 1.4 : o.drag,
          shape: o.shape || 'dot',
          rot: U.rand(0, 6.28), vr: U.rand(-9, 9),
          glow: o.shape !== 'rect'
        });
      }
    }

    confetti(x, y, o) {
      o = o || {};
      this.burst(x, y, Object.assign({
        n: 46, shape: 'rect', angle: -Math.PI / 2, spread: 1.15,
        speed: [260, 720], life: [1.0, 1.8], size: [6, 12], gravity: 900, drag: 1.2,
        colors: ['#ffb547', '#ff8f73', '#4fe0b0', '#f2f6fb', '#8ec5ff', '#ffd34d']
      }, o));
    }

    /* 剩餘秒數化成光點飛進分數欄 */
    flyBetween(fromEl, toEl, n, cb) {
      this.resize();
      const a = this.rel(fromEl), b = this.rel(toEl);
      const group = { left: n, onEach: cb && cb.onEach, onDone: cb && cb.onDone };
      for (let i = 0; i < n; i++) {
        this.flies.push({
          ax: a.x + U.rand(-a.w * 0.25, a.w * 0.25), ay: a.y + U.rand(-a.h * 0.2, a.h * 0.2),
          cx: (a.x + b.x) / 2 + U.rand(-0.18, 0.18) * this.w, cy: Math.max(a.y, b.y) + U.rand(0.06, 0.2) * this.h,
          bx: b.x, by: b.y, t: -i * 0.05, dur: 0.62, i, group, color: '#ffd34d'
        });
      }
    }

    clear() {
      this.parts = []; this.flies = [];
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.cv.width, this.cv.height);
      this.dirty = false;
    }

    update(dt) {
      if (!this.parts.length && !this.flies.length) {
        if (this.dirty) { this.clear(); }
        return;
      }
      const g = this.ctx, s = this.s;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, this.cv.width, this.cv.height);
      g.setTransform(s, 0, 0, s, 0, 0);
      for (let i = this.parts.length - 1; i >= 0; i--) {
        const p = this.parts[i];
        p.life += dt;
        if (p.life >= p.max) { this.parts.splice(i, 1); continue; }
        const damp = Math.exp(-p.drag * dt);
        p.vx *= damp; p.vy = p.vy * damp + p.g * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        const k = 1 - p.life / p.max;
        g.globalAlpha = Math.min(1, k * 1.6);
        g.fillStyle = p.color;
        if (p.shape === 'rect') {
          g.globalCompositeOperation = 'source-over';
          g.save(); g.translate(p.x, p.y); g.rotate(p.rot);
          g.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.6);
          g.restore();
        } else {
          g.globalCompositeOperation = 'lighter';
          g.beginPath(); g.arc(p.x, p.y, p.size * (0.4 + 0.6 * k), 0, Math.PI * 2); g.fill();
        }
      }
      g.globalCompositeOperation = 'lighter';
      for (let i = this.flies.length - 1; i >= 0; i--) {
        const f = this.flies[i];
        f.t += dt / f.dur;
        if (f.t < 0) continue;
        const t = Math.min(1, f.t);
        const pos = tt => {
          const e = U.ease.inOutCubic(U.clamp(tt, 0, 1)), u = 1 - e;
          return [u * u * f.ax + 2 * u * e * f.cx + e * e * f.bx, u * u * f.ay + 2 * u * e * f.cy + e * e * f.by];
        };
        const r = 7 * this.k();
        for (let j = 4; j >= 0; j--) {
          const q = pos(t - j * 0.05);
          g.globalAlpha = j === 0 ? 1 : 0.5 - j * 0.09;
          g.fillStyle = j === 0 ? '#fff6d0' : f.color;
          g.beginPath(); g.arc(q[0], q[1], r * (1 - j * 0.15), 0, Math.PI * 2); g.fill();
        }
        if (t >= 1) {
          this.flies.splice(i, 1);
          this.burst(f.bx, f.by, { n: 6, speed: [60, 200], life: [0.25, 0.5], size: [2, 4], gravity: 0 });
          f.group.left--;
          if (f.group.onEach) f.group.onEach(f.i);
          if (f.group.left === 0 && f.group.onDone) f.group.onDone();
        }
      }
      g.globalAlpha = 1;
      g.globalCompositeOperation = 'source-over';
      this.dirty = true;
    }
  }

  LG.FX = FX;
})(window.LG);
