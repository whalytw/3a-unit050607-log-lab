/* 指對數實驗室 — 3D（第 6 關骨牌場景）
   三區共用同一個 WebGL 渲染器：輪流把各區的場景畫好，再複製到該區自己的 canvas，
   避免三區同時進到第 6 關時開三個 3D 引擎拖慢筆電。
   若電腦不支援 WebGL，自動改用 2D 版骨牌動畫。 */
'use strict';
(function (LG) {
  const U = LG.util;

  const Shared3D = {
    renderer: null,
    failed: false,
    views: new Set(),
    init() {
      if (this.renderer) return true;
      if (this.failed || !window.THREE) return false;
      try {
        const canvas = document.createElement('canvas');
        canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); this.lost = true; });
        canvas.addEventListener('webglcontextrestored', () => { this.lost = false; });
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
        this.renderer.setPixelRatio(1);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.size = { w: 0, h: 0 };
      } catch (e) {
        console.warn('WebGL 無法使用，改用 2D 骨牌動畫', e);
        this.failed = true;
        this.renderer = null;
      }
      return !!this.renderer;
    },
    add(v) { this.views.add(v); },
    remove(v) { this.views.delete(v); },
    render() {
      if (!this.renderer || this.lost || !this.views.size) return;
      let mw = 0, mh = 0;
      for (const v of this.views) { mw = Math.max(mw, v.w); mh = Math.max(mh, v.h); }
      if (mw < 2 || mh < 2) return;
      const r = this.renderer;
      if (this.size.w < mw || this.size.h < mh) {
        this.size = { w: Math.max(mw, this.size.w), h: Math.max(mh, this.size.h) };
        r.setSize(this.size.w, this.size.h, false);
      }
      const H = this.size.h;
      r.setScissorTest(true);
      for (const v of this.views) {
        if (v.w < 2 || v.h < 2) continue;
        r.setViewport(0, 0, v.w, v.h);
        r.setScissor(0, 0, v.w, v.h);
        r.render(v.scene, v.camera);
        try { v.ctx.drawImage(r.domElement, 0, H - v.h, v.w, v.h, 0, 0, v.w, v.h); } catch (e) { /* ignore */ }
      }
      r.setScissorTest(false);
    }
  };

  /* ---------- 3D 骨牌場景 ---------- */
  function makeGround() {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const x = c.getContext('2d');
    x.fillStyle = '#0d2747'; x.fillRect(0, 0, 256, 256);
    x.strokeStyle = 'rgba(130, 190, 255, 0.16)'; x.lineWidth = 2;
    for (let i = 64; i < 256; i += 64) {
      x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 256); x.moveTo(0, i); x.lineTo(256, i); x.stroke();
    }
    x.strokeStyle = 'rgba(130, 190, 255, 0.45)'; x.lineWidth = 4;
    x.strokeRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(36, 36);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(144, 144), new THREE.MeshBasicMaterial({ map: tex }));
    m.rotation.x = -Math.PI / 2;
    return m;
  }

  function makeStars() {
    const n = 420, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, e = U.rand(0.08, 1.2), r = 70;
      pos[i * 3] = Math.cos(a) * Math.cos(e) * r;
      pos[i * 3 + 1] = Math.sin(e) * r;
      pos[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xdbe8ff, size: 0.42, sizeAttenuation: true, fog: false, transparent: true, opacity: 0.85 }));
  }

  function makeTower() {
    const g = new THREE.Group();
    const glass = new THREE.MeshLambertMaterial({ color: 0x3a9c93, emissive: 0x0b2b29 });
    const gold = new THREE.MeshBasicMaterial({ color: 0xffd36b });
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.3, 2.6), glass);
    base.position.y = 0.65; g.add(base);
    let y = 1.3;
    const seg = new THREE.CylinderGeometry(1.02, 0.74, 0.95, 4, 1); seg.rotateY(Math.PI / 4);
    const band = new THREE.CylinderGeometry(1.06, 1.06, 0.07, 4, 1); band.rotateY(Math.PI / 4);
    for (let i = 0; i < 8; i++) {
      const m = new THREE.Mesh(seg, glass); m.position.y = y + 0.475; g.add(m);
      const b = new THREE.Mesh(band, gold); b.position.y = y + 0.95; g.add(b);
      y += 0.95;
    }
    const t1 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.7, 1.1), glass); t1.position.y = y + 0.35; g.add(t1); y += 0.7;
    const t2 = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.6, 0.62), glass); t2.position.y = y + 0.3; g.add(t2); y += 0.6;
    const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.09, 2.3, 8), gold); sp.position.y = y + 1.15; g.add(sp);
    g.userData = { height: y + 2.3, gold };
    return g;
  }

  function makeFireworks() {
    const N = 420;
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) pos[i * 3 + 1] = -999;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({ size: 0.34, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    const P = [];
    for (let i = 0; i < N; i++) P.push({ alive: false, x: 0, y: -999, z: 0, vx: 0, vy: 0, vz: 0, life: 0, max: 1, r: 1, g: 1, b: 1 });
    return { points, geo, pos, col, P, next: 0, N };
  }

  const DOMINO_COLORS = [0xffb547, 0xff8f73, 0x4fe0b0, 0xf2f6fb];

  class DominoScene {
    constructor() {
      const T = THREE;
      this.scene = new T.Scene();
      this.scene.background = new T.Color(0x0a1a33);
      this.scene.fog = new T.Fog(0x0a1a33, 16, 52);
      this.camera = new T.PerspectiveCamera(52, 1.6, 0.1, 200);
      this.scene.add(new T.HemisphereLight(0xd2e4ff, 0x1a2440, 1.25));
      const sun = new T.DirectionalLight(0xffffff, 1.6);
      sun.position.set(-6, 12, 8);
      this.scene.add(sun);
      this.scene.add(makeGround());
      this.scene.add(makeStars());

      this.dir = new T.Vector3(0.5, 0, -1).normalize();
      this.right = new T.Vector3().crossVectors(this.dir, new T.Vector3(0, 1, 0)).normalize();
      const yaw = Math.atan2(this.dir.x, this.dir.z);
      this.dominos = [];
      let s = 0, h = 0.62;
      const N = 13;
      for (let i = 0; i < N; i++) {
        const th = h * 0.17, w = h * 0.52;
        const outer = new T.Group();
        outer.rotation.y = yaw;
        outer.position.copy(this.dir.clone().multiplyScalar(s));
        const inner = new T.Group();
        outer.add(inner);
        const geo = new T.BoxGeometry(w, h, th);
        const mesh = new T.Mesh(geo, new T.MeshLambertMaterial({ color: DOMINO_COLORS[i % 4] }));
        mesh.position.set(0, h / 2, -th / 2);
        inner.add(mesh);
        const edges = new T.LineSegments(new T.EdgesGeometry(geo), new T.LineBasicMaterial({ color: 0x0a1a33, transparent: true, opacity: 0.6 }));
        edges.position.copy(mesh.position);
        inner.add(edges);
        this.scene.add(outer);
        this.dominos.push({ outer, inner, h, s });
        s += h * 0.62;
        h *= 1.17;
      }
      this.rowEnd = s;
      this.tower = makeTower();
      this.towerPos = this.dir.clone().multiplyScalar(s + 4.6);
      this.tower.position.copy(this.towerPos);
      this.scene.add(this.tower);
      this.fw = makeFireworks();
      this.scene.add(this.fw.points);

      const up = new T.Vector3(0, 1, 0);
      // 斜側面視角：骨牌由左往右變大，臺北 101 在右側
      this.camA = this.right.clone().multiplyScalar(7.5).add(up.clone().multiplyScalar(3.0));
      this.lookA = this.dir.clone().multiplyScalar(9).add(up.clone().multiplyScalar(3.4));
      this.camB = this.dir.clone().multiplyScalar(this.rowEnd - 7).add(this.right.clone().multiplyScalar(13)).add(up.clone().multiplyScalar(4.6));
      this.lookB = this.towerPos.clone().add(up.clone().multiplyScalar(6.5));
      this.mode = 'idle';
      this.t = 0;
      this.clock = 0;
      this.tmpP = new T.Vector3();
      this.tmpL = new T.Vector3();
      this.placeCamera(0);
    }

    resize(w, h) { this.camera.aspect = w / Math.max(1, h); this.camera.updateProjectionMatrix(); }

    placeCamera(k) {
      const e = U.ease.inOutCubic(U.clamp(k, 0, 1));
      this.tmpP.lerpVectors(this.camA, this.camB, e);
      this.tmpL.lerpVectors(this.lookA, this.lookB, e);
      const bob = Math.sin(this.clock * 0.8) * 0.08;
      this.camera.position.set(this.tmpP.x, this.tmpP.y + bob, this.tmpP.z);
      this.camera.lookAt(this.tmpL);
    }

    topple() { this.mode = 'topple'; this.t = 0; this.clacked = 0; this.bursts = 0; }
    wobble() { if (this.mode === 'idle' || this.mode === 'wobble') { this.mode = 'wobble'; this.t = 0; } }
    fail() { this.mode = 'fail'; this.t = 0; }

    burst(center, color) {
      const f = this.fw, c = new THREE.Color(color);
      const n = LG.settings.data.fx === 'lite' ? 70 : 130;
      for (let k = 0; k < n; k++) {
        const p = f.P[f.next]; f.next = (f.next + 1) % f.N;
        const a = Math.random() * Math.PI * 2, z = U.rand(-1, 1), r = Math.sqrt(1 - z * z), v = U.rand(2.4, 5.4);
        p.alive = true; p.life = 0; p.max = U.rand(1.0, 1.7);
        p.x = center.x; p.y = center.y; p.z = center.z;
        p.vx = Math.cos(a) * r * v; p.vy = z * v + 1.2; p.vz = Math.sin(a) * r * v;
        const tint = U.rand(0.75, 1.15);
        p.r = Math.min(1, c.r * tint + 0.15); p.g = Math.min(1, c.g * tint + 0.15); p.b = Math.min(1, c.b * tint + 0.15);
      }
    }

    update(dt) {
      this.clock += dt;
      this.t += dt;
      const D = this.dominos;
      if (this.mode === 'topple') {
        const step = 0.15, fall = 0.34;
        for (let i = 0; i < D.length; i++) {
          const u = U.clamp((this.t - i * step) / fall, 0, 1);
          const maxA = i === D.length - 1 ? 1.52 : 1.2;
          D[i].inner.rotation.x = maxA * U.ease.inQuad(u);
          if (u > 0 && this.clacked <= i) { this.clacked = i + 1; LG.audio.play('clack'); }
        }
        const total = (D.length - 1) * step + fall;
        this.placeCamera(this.t / (total + 0.3));
        const top = this.towerPos.clone().add(new THREE.Vector3(0, this.tower.userData.height * 0.82, 0));
        const times = [total + 0.05, total + 0.4, total + 0.8];
        const cols = [0xffd36b, 0x4fe0b0, 0xff8f73];
        while (this.bursts < 3 && this.t >= times[this.bursts]) {
          const off = new THREE.Vector3(U.rand(-2.2, 2.2), U.rand(-1.5, 1.8), U.rand(-1, 1));
          this.burst(top.clone().add(off), cols[this.bursts]);
          LG.audio.play('firework');
          this.bursts++;
        }
        const glow = this.t > total ? 0.5 + 0.5 * Math.sin((this.t - total) * 14) : 0;
        this.tower.userData.gold.color.setRGB(1, 0.83 + 0.17 * glow, 0.42 + 0.58 * glow);
      } else if (this.mode === 'wobble') {
        const a = this.t < 1.3 ? 0.24 * Math.sin(this.t * 13) * Math.exp(-this.t * 3.2) : 0;
        D[0].inner.rotation.x = Math.max(0, a) + (a < 0 ? a * 0.3 : 0);
        if (this.t >= 1.3) { this.mode = 'idle'; D[0].inner.rotation.x = 0; }
        this.placeCamera(0);
      } else {
        this.placeCamera(0);
        const pulse = 0.5 + 0.5 * Math.sin(this.clock * 2.2);
        this.tower.userData.gold.color.setRGB(1, 0.78 + 0.08 * pulse, 0.36 + 0.12 * pulse);
      }
      // 煙火粒子
      const f = this.fw;
      let any = false;
      for (let i = 0; i < f.N; i++) {
        const p = f.P[i];
        if (!p.alive) continue;
        any = true;
        p.life += dt;
        if (p.life >= p.max) { p.alive = false; f.pos[i * 3 + 1] = -999; f.col[i * 3] = f.col[i * 3 + 1] = f.col[i * 3 + 2] = 0; continue; }
        const damp = Math.exp(-1.1 * dt);
        p.vx *= damp; p.vz *= damp; p.vy = p.vy * damp - 3.2 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
        const k = 1 - p.life / p.max;
        f.pos[i * 3] = p.x; f.pos[i * 3 + 1] = p.y; f.pos[i * 3 + 2] = p.z;
        f.col[i * 3] = p.r * k; f.col[i * 3 + 1] = p.g * k; f.col[i * 3 + 2] = p.b * k;
      }
      if (any || this.fwWas) {
        f.geo.attributes.position.needsUpdate = true;
        f.geo.attributes.color.needsUpdate = true;
      }
      this.fwWas = any;
    }

    dispose() {
      this.scene.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          const ms = Array.isArray(o.material) ? o.material : [o.material];
          ms.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
        }
      });
    }
  }

  /* ---------- 2D 備援版（無 WebGL 時） ---------- */
  class Domino2D {
    constructor(ctx) {
      this.ctx = ctx; this.mode = 'idle'; this.t = 0; this.clock = 0; this.w = 2; this.h = 2;
      this.n = 11; this.ang = new Array(this.n).fill(0); this.parts = [];
    }
    resize(w, h) { this.w = w; this.h = h; }
    topple() { this.mode = 'topple'; this.t = 0; this.clacked = 0; this.boomed = false; }
    wobble() { if (this.mode === 'idle') { this.mode = 'wobble'; this.t = 0; } }
    fail() { this.mode = 'fail'; this.t = 0; }
    update(dt) {
      this.t += dt; this.clock += dt;
      if (this.mode === 'topple') {
        for (let i = 0; i < this.n; i++) {
          const u = U.clamp((this.t - i * 0.15) / 0.34, 0, 1);
          this.ang[i] = (i === this.n - 1 ? 1.5 : 1.15) * u * u;
          if (u > 0 && this.clacked <= i) { this.clacked = i + 1; LG.audio.play('clack'); }
        }
        if (!this.boomed && this.t > (this.n - 1) * 0.15 + 0.4) {
          this.boomed = true; LG.audio.play('firework');
          for (let k = 0; k < 90; k++) {
            const a = U.rand(0, 6.28), v = U.rand(40, 200);
            this.parts.push({ x: this.w * 0.86, y: this.h * 0.18, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: U.rand(0.8, 1.4), c: U.pick(['#ffd36b', '#4fe0b0', '#ff8f73']) });
          }
        }
      } else if (this.mode === 'wobble') {
        this.ang[0] = this.t < 1.2 ? Math.max(0, 0.25 * Math.sin(this.t * 13) * Math.exp(-this.t * 3)) : 0;
        if (this.t >= 1.2) this.mode = 'idle';
      }
      for (let i = this.parts.length - 1; i >= 0; i--) {
        const p = this.parts[i]; p.life += dt;
        if (p.life > p.max) { this.parts.splice(i, 1); continue; }
        p.vy += 120 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      }
    }
    render() {
      const g = this.ctx, W = this.w, H = this.h;
      const sky = g.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#081a33'); sky.addColorStop(1, '#14335c');
      g.fillStyle = sky; g.fillRect(0, 0, W, H);
      const gy = H * 0.86;
      g.fillStyle = '#0d2747'; g.fillRect(0, gy, W, H - gy);
      g.strokeStyle = 'rgba(130,190,255,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, gy); g.lineTo(W, gy); g.stroke();
      // 101 剪影
      const tx = W * 0.86, tw = W * 0.07;
      g.fillStyle = '#3a9c93';
      let y = gy;
      g.fillRect(tx - tw * 0.8, y - H * 0.05, tw * 1.6, H * 0.05); y -= H * 0.05;
      for (let i = 0; i < 8; i++) {
        const sh = H * 0.07;
        g.beginPath(); g.moveTo(tx - tw * 0.45, y); g.lineTo(tx + tw * 0.45, y); g.lineTo(tx + tw * 0.62, y - sh); g.lineTo(tx - tw * 0.62, y - sh); g.closePath(); g.fill();
        g.fillStyle = '#ffd36b'; g.fillRect(tx - tw * 0.62, y - sh - 2, tw * 1.24, 3); g.fillStyle = '#3a9c93';
        y -= sh;
      }
      g.fillRect(tx - tw * 0.3, y - H * 0.06, tw * 0.6, H * 0.06); y -= H * 0.06;
      g.fillStyle = '#ffd36b'; g.fillRect(tx - 1.5, y - H * 0.1, 3, H * 0.1);
      // 骨牌
      let x = W * 0.06, h = H * 0.09;
      const cols = ['#ffb547', '#ff8f73', '#4fe0b0', '#f2f6fb'];
      for (let i = 0; i < this.n; i++) {
        const th = h * 0.2;
        g.save(); g.translate(x + th, gy); g.rotate(this.ang[i]);
        g.fillStyle = cols[i % 4]; g.fillRect(-th, -h, th, h);
        g.restore();
        x += h * 0.6; h *= 1.16;
      }
      g.globalCompositeOperation = 'lighter';
      for (const p of this.parts) { g.globalAlpha = 1 - p.life / p.max; g.fillStyle = p.c; g.beginPath(); g.arc(p.x, p.y, 3, 0, 6.28); g.fill(); }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }
    dispose() {}
  }

  LG.Shared3D = Shared3D;
  LG.DominoScene = DominoScene;
  LG.Domino2D = Domino2D;
})(window.LG);
