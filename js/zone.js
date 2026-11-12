/* 指對數實驗室 — 單一遊戲區（左／中／右各一個，彼此完全獨立）
   狀態：idle 待機 → trans 轉場 → ready → playing 作答 → resolving 結算 → … → finishing → result 總分 */
'use strict';
(function (LG) {
  const U = LG.util;
  const ZN = [{ name: '左區', mark: '●' }, { name: '中區', mark: '▲' }, { name: '右區', mark: '■' }];
  const TITLES = [
    [0.8, '對數大師', '🏆'],
    [0.6, '指對數專家', '🥇'],
    [0.4, '對數研究員', '🔬'],
    [0.2, '指數學徒', '📘'],
    [0, '實驗室見習生', '🧪']
  ];
  const REVEAL_AUTO = 5.0;   // 失敗時展示正解幾秒後自動進下一關
  const NEXT_DELAY = 1.0;    // 「下一關」按鈕延遲啟用，避免連點誤觸
  const AGAIN_DELAY = 4.8;   // 「再玩一次」延遲出現（含轉場 2 秒）

  LG.LEVELS = [];
  LG.registerLevel = L => { LG.LEVELS.push(L); LG.LEVELS.sort((a, b) => a.meta.id - b.meta.id); };

  /* ---------- 關卡共用基底 ---------- */
  class LevelBase {
    constructor(zone, q, scr) {
      this.zone = zone; this.q = q; this.scr = scr;
      this.celebrateTime = 2.1;
      this.ro = new ResizeObserver(() => { try { this.layout(); } catch (e) { console.error(e); } });
      this.ro.observe(scr.main);
    }
    get playing() { return this.zone.state === 'playing'; }
    submit(ok) { return this.zone.answer(ok); }
    hintHTML() { return U.rich(this.q.hint); }
    answerHTML() { return U.rich(this.q.explain); }
    setQuestion(html) {
      this.scr.q.innerHTML = html;
      const q = this.scr.q;
      requestAnimationFrame(() => U.fit(q));
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (q.isConnected) { U.fit(q); this.layout(); } });
    }
    setGo(label, fn) {
      const b = this.scr.goBtn;
      b.innerHTML = label;
      LG.input.onTap(b, () => { if (this.playing) fn(); }, { sound: false });
    }
    setGoEnabled(on) { this.scr.goBtn.classList.toggle('disabled', !on); }
    setGoLabel(html) { const b = this.scr.goBtn; b.classList.add('as-label'); b.innerHTML = html; }
    scale() { return LG.settings.canvasScale(); }
    /* 元素中心在本區的座標（給特效用） */
    zpos(el) { return this.zone.fx.rel(el); }
    /* 元素左上角在本區的座標 */
    zoff(el) {
      const r = el.getBoundingClientRect(), z = this.zone.inner.getBoundingClientRect();
      return { x: r.left - z.left, y: r.top - z.top };
    }
    layout() {}
    start() {}
    update() {}
    celebrate() {}
    reveal() {}
    destroy() { this.ro.disconnect(); }
  }
  LG.LevelBase = LevelBase;

  /* ---------- 遊戲區 ---------- */
  class Zone {
    constructor(idx, host) {
      this.idx = idx;
      this.zn = ZN[idx];
      this.time = 0;
      this.tasks = [];
      this.state = 'idle';
      this.score = 0;
      this.displayScore = 0;
      this.results = [];
      this.cfg = null;
      this.level = null;
      this.screen = null;
      this.scr = null;

      this.root = U.el('section', 'zone');
      this.root.dataset.zone = String(idx);
      this.inner = U.el('div', 'zone-inner');
      this.root.appendChild(this.inner);
      host.appendChild(this.root);

      this.buildHud();
      this.stage = U.el('div', 'stage');
      this.inner.appendChild(this.stage);
      this.screenHost = U.el('div', 'screen-host');
      this.stage.appendChild(this.screenHost);
      this.toastEl = U.el('div', 'toast', '<div class="t1"></div><div class="t2"></div>');
      this.stage.appendChild(this.toastEl);
      this.trans = new LG.Transition(this);
      this.fx = new LG.FX(this);

      this.ro = new ResizeObserver(() => { this.fx.resize(); this.trans.resize(); });
      this.ro.observe(this.inner);
      this.showIdle();
    }

    /* ---- 排程（以遊戲時間計，暫停時不會走） ---- */
    after(sec, fn) { this.tasks.push({ t: this.time + sec, fn }); }

    runTasks() {
      const now = this.time, due = [], keep = [];
      for (const k of this.tasks) (k.t <= now ? due : keep).push(k);
      if (!due.length) return;
      this.tasks = keep;
      due.sort((a, b) => a.t - b.t);
      for (const k of due) { try { k.fn(); } catch (e) { console.error(e); } }
    }

    update(dt) {
      this.time += dt;
      if (this.tasks.length) this.runTasks();
      if (this.state === 'playing') {
        this.timeLeft -= dt;
        const s = Math.ceil(this.timeLeft - 1e-6);
        if (s !== this.lastSec) {
          if (this.lastSec != null && s <= 5 && s >= 1) LG.audio.play('tick');
          this.lastSec = s;
        }
        if (this.timeLeft <= 0) { this.timeLeft = 0; this.fail('timeout'); }
        else this.refreshHelpBtn(false);
      }
      if (this.scoreAnim) {
        const a = this.scoreAnim;
        a.t += dt;
        const k = U.clamp(a.t / a.dur, 0, 1);
        this.displayScore = a.from + (a.to - a.from) * U.ease.outCubic(k);
        if (k >= 1) this.scoreAnim = null;
      }
      if (this.resultAnim) {
        const a = this.resultAnim;
        a.t += dt;
        const k = U.clamp(a.t / a.dur, 0, 1);
        a.el.textContent = String(Math.round(a.to * U.ease.outCubic(k)));
        if (k >= 1) this.resultAnim = null;
      }
      if (this.level) { try { this.level.update(dt); } catch (e) { console.error(e); } }
      this.trans.update(dt);
      this.fx.update(dt);
      this.renderHud();
    }

    /* ---- HUD ---- */
    buildHud() {
      const h = this.hud = { cache: {} };
      h.el = U.el('div', 'hud');
      h.el.innerHTML = `
        <div class="hud-l">
          <div class="hud-zone"><span class="mk">${this.zn.mark}</span>${this.zn.name}</div>
          <div class="hud-lv"></div>
          <div class="hud-dots"></div>
        </div>
        <div class="hud-c"><div class="hud-timer"><span class="tn">--</span><span class="tu">秒</span></div></div>
        <div class="hud-r"><div class="hud-sl">分數</div><div class="hud-score">0</div></div>
        <div class="hud-bar"><i></i></div>`;
      h.lv = h.el.querySelector('.hud-lv');
      h.dots = h.el.querySelector('.hud-dots');
      h.timer = h.el.querySelector('.hud-timer');
      h.tn = h.el.querySelector('.tn');
      h.score = h.el.querySelector('.hud-score');
      h.bar = h.el.querySelector('.hud-bar i');
      this.inner.appendChild(h.el);
    }

    renderHud() {
      const h = this.hud, c = h.cache;
      let lv, tn, frac = 1, low = false, dots = '';
      if (this.state === 'idle') {
        lv = '等待挑戰者';
        tn = String(LG.settings.data.time);
      } else if (this.state === 'finishing' || this.state === 'result') {
        lv = '挑戰完成';
        tn = '--'; frac = 0;
      } else {
        const n = this.cfg.levels.length;
        lv = `第 ${Math.min(this.li + 1, n)} 關／${n}`;
        const t = this.timerOverride != null ? this.timerOverride : this.timeLeft;
        tn = String(Math.max(0, Math.ceil(t - 1e-6)));
        frac = U.clamp(t / this.cfg.time, 0, 1);
        low = this.state === 'playing' && this.timeLeft <= 10;
      }
      if (this.cfg && this.state !== 'idle') {
        dots = this.cfg.levels.map((L, i) => {
          const r = this.results[i];
          if (r) return r.status;
          return i === this.li ? 'cur' : '';
        }).join(',');
      }
      if (c.lv !== lv) { h.lv.textContent = lv; c.lv = lv; }
      if (c.dots !== dots) {
        h.dots.innerHTML = dots ? dots.split(',').map(s => `<i class="${s}"></i>`).join('') : '';
        c.dots = dots;
      }
      if (c.tn !== tn) { h.tn.textContent = tn; c.tn = tn; }
      if (c.low !== low) { h.timer.classList.toggle('low', low); c.low = low; }
      const fr = Math.round(frac * 500) / 500;
      if (c.fr !== fr) { h.bar.style.transform = `scaleX(${fr})`; c.fr = fr; }
      const sc = String(Math.round(this.displayScore));
      if (c.sc !== sc) { h.score.textContent = sc; c.sc = sc; }
    }

    /* ---- 待機畫面 ---- */
    showIdle() {
      this.clearScreen();
      const S = LG.settings.data;
      const n = S.levels.filter(Boolean).length;
      const root = U.el('div', 'idle-screen');
      root.innerHTML = `
        <div class="idle-hero">${IDLE_SVG}</div>
        <div class="idle-title">指對數實驗室</div>
        <div class="idle-sub">單元 5～7 總複習挑戰</div>
        <ul class="idle-rules">
          <li><b>${n}</b> 關，每關 <b>${S.time}</b> 秒</li>
          <li>答對得 <b>${S.base}</b> 分＋剩餘秒數</li>
          <li>每關一張求救卡：看提示，扣 <b>${S.penalty}</b> 秒</li>
          <li>答錯會自動用掉求救卡；再錯，本關 0 分</li>
        </ul>
        <div class="btn btn-start">開始挑戰</div>`;
      this.screenHost.appendChild(root);
      this.screen = root;
      LG.input.onTap(root.querySelector('.btn-start'), () => { if (this.state === 'idle') this.startGame(); }, { sound: false });
    }

    /* ---- 遊戲流程 ---- */
    startGame() {
      const S = LG.settings.data;
      const levels = LG.LEVELS.filter((L, i) => S.levels[i]);
      this.cfg = {
        time: S.time, penalty: S.penalty, base: S.base, difficulty: S.difficulty,
        levels: levels.length ? levels : LG.LEVELS.slice()
      };
      this.results = [];
      this.score = 0;
      this.displayScore = 0;
      this.scoreAnim = null;
      this.li = -1;
      LG.audio.play('select');
      this.gotoNext();
    }

    gotoNext() {
      this.revealToken = null;
      this.li++;
      const n = this.cfg.levels.length;
      if (this.li >= n) {
        this.state = 'finishing';
        this.trans.play({ kind: 'finish' }, () => this.showResult(), () => { this.state = 'result'; });
        return;
      }
      const L = this.cfg.levels[this.li];
      this.state = 'trans';
      this.trans.play({ kind: 'level', num: this.li + 1, total: n, meta: L.meta },
        () => this.mountLevel(L), () => this.beginLevel());
    }

    clearScreen() {
      if (this.level) { try { this.level.destroy(); } catch (e) { console.error(e); } this.level = null; }
      if (this.screen) { this.screen.remove(); this.screen = null; }
      this.scr = null;
    }

    buildLevelScreen(meta) {
      const root = U.el('div', 'level lv' + meta.id);
      root.innerHTML = `
        <div class="lv-title"><span class="lv-name">${meta.name}</span><span class="unit-chip">單元 ${meta.unit}｜${meta.topic}</span></div>
        <div class="lv-q"></div>
        <div class="lv-main"></div>
        <div class="lv-hint"></div>
        <div class="lv-actions"><div class="btn btn-help"></div><div class="btn btn-go"></div></div>`;
      const scr = {
        root,
        q: root.querySelector('.lv-q'),
        main: root.querySelector('.lv-main'),
        hint: root.querySelector('.lv-hint'),
        actions: root.querySelector('.lv-actions'),
        helpBtn: root.querySelector('.btn-help'),
        goBtn: root.querySelector('.btn-go')
      };
      LG.input.onTap(scr.helpBtn, () => { if (this.state === 'playing') this.useHelp('manual'); }, { sound: false });
      return scr;
    }

    mountLevel(L) {
      this.clearScreen();
      this.timeLeft = this.cfg.time;
      this.helpUsed = false;
      this.timerOverride = null;
      this.lastSec = null;
      this.meta = L.meta;
      this.inner.style.setProperty('--uc', U.UNIT_HEX[L.meta.unit]);
      const q = L.pick(this.cfg.difficulty);
      const scr = this.buildLevelScreen(L.meta);
      this.screenHost.appendChild(scr.root);
      this.screen = scr.root;
      this.scr = scr;
      try {
        this.level = new L(this, q, scr);
      } catch (e) {
        console.error(e);
        this.level = null;
      }
      this.hintIdle();
      this.refreshHelpBtn(true);
      this.state = 'ready';
    }

    beginLevel() {
      if (this.state !== 'ready') return;
      this.state = 'playing';
      if (!this.level) { this.fail('timeout'); return; }
      try { this.level.start(); } catch (e) { console.error(e); }
    }

    /* 關卡回報作答結果；回傳 'correct' | 'retry' | 'fail' | 'ignored' */
    answer(ok) {
      if (this.state !== 'playing') return 'ignored';
      if (ok) { this.win(); return 'correct'; }
      if (!this.helpUsed && this.timeLeft > this.cfg.penalty) {
        LG.audio.play('wrong');
        this.useHelp('auto');
        this.shake();
        return 'retry';
      }
      this.fail('wrong');
      return 'fail';
    }

    useHelp(mode) {
      if (this.state !== 'playing' || this.helpUsed) return false;
      const p = this.cfg.penalty;
      if (this.timeLeft <= p) return false;
      this.helpUsed = true;
      this.timeLeft -= p;
      this.lastSec = Math.ceil(this.timeLeft - 1e-6);
      this.showHint();
      this.floatText(this.hud.timer, `−${p}`, 'bad');
      if (mode === 'auto') this.toast('答錯了', `已自動使用求救卡　−${p} 秒`, 'bad');
      else { LG.audio.play('select'); this.toast('使用求救卡', `提示已出現　−${p} 秒`, 'warn'); }
      this.refreshHelpBtn(true);
      return true;
    }

    win() {
      this.state = 'resolving';
      const remain = Math.max(0, Math.ceil(this.timeLeft - 1e-6));
      const gain = this.cfg.base + remain;
      this.results.push({ meta: this.meta, status: this.helpUsed ? 'help' : 'ok', score: gain });
      const from = this.score;
      this.score += gain;
      LG.audio.play('correct');
      this.toast('答對了！', `+${this.cfg.base} 分＋剩餘 ${remain} 秒`, 'ok');
      this.refreshHelpBtn(true);
      if (this.scr) this.scr.actions.classList.add('done');
      try { this.level.celebrate(); } catch (e) { console.error(e); }
      this.scoreFly(remain, from);
      const ct = Math.max(2.1, (this.level && this.level.celebrateTime) || 0);
      this.after(ct, () => { if (this.state === 'resolving') this.gotoNext(); });
    }

    scoreFly(remain, from) {
      const base = this.cfg.base;
      this.displayScore = from;
      this.after(0.25, () => {
        this.floatText(this.hud.score, `+${base}`, 'ok');
        this.scoreAnim = { from: this.displayScore, to: from + base, t: 0, dur: 0.35 };
      });
      if (remain > 0) {
        const n = Math.min(remain, LG.settings.data.fx === 'lite' ? 6 : 12);
        this.timerOverride = remain;
        this.after(0.55, () => {
          this.fx.flyBetween(this.hud.timer, this.hud.score, n, {
            onEach: i => {
              this.timerOverride = Math.round(remain * (1 - (i + 1) / n));
              if (i % 2 === 0) LG.audio.play('coin');
            },
            onDone: () => {
              this.floatText(this.hud.score, `+${remain}`, 'ok');
              this.scoreAnim = { from: this.displayScore, to: this.score, t: 0, dur: 0.35 };
            }
          });
        });
      }
      // 保險：確保最後顯示的分數正確
      this.after(1.9, () => { this.scoreAnim = null; this.displayScore = this.score; });
    }

    fail(reason) {
      if (this.state !== 'playing') return;
      this.state = 'resolving';
      this.results.push({ meta: this.meta, status: 'fail', score: 0 });
      LG.audio.play('wrong');
      this.toast(reason === 'timeout' ? '時間到' : '再次答錯', '本關 0 分，看看正解', 'bad');
      this.refreshHelpBtn(true);
      if (this.level) { try { this.level.reveal(reason); } catch (e) { console.error(e); } }
      this.showAnswer();
      const tok = this.revealToken = {};
      this.showNext(tok);
      this.after(REVEAL_AUTO, () => { if (this.revealToken === tok && this.state === 'resolving') this.gotoNext(); });
    }

    showNext(tok) {
      const s = this.scr;
      if (!s) return;
      const last = this.li >= this.cfg.levels.length - 1;
      const nb = U.el('div', 'btn btn-next disabled', `<span>${last ? '看總分' : '下一關'}</span><i class="prog"></i>`);
      nb.style.setProperty('--auto', REVEAL_AUTO + 's');
      s.actions.classList.add('next-mode');
      s.actions.appendChild(nb);
      this.after(NEXT_DELAY, () => nb.classList.remove('disabled'));
      LG.input.onTap(nb, () => {
        if (this.revealToken === tok && this.state === 'resolving') { this.revealToken = null; this.gotoNext(); }
      }, { sound: false });
    }

    refreshHelpBtn(force) {
      if (!this.scr) return;
      const b = this.scr.helpBtn, p = this.cfg.penalty;
      let mode;
      if (this.helpUsed) mode = 'used';
      else if (this.state === 'resolving') mode = 'off';
      else if (this.state === 'playing' && this.timeLeft <= p) mode = 'low';
      else mode = 'ready';
      if (!force && b.dataset.mode === mode) return;
      b.dataset.mode = mode;
      b.classList.toggle('used', mode === 'used');
      b.classList.toggle('disabled', mode !== 'ready');
      b.innerHTML = mode === 'used' ? '<b>求救卡</b><small>已使用</small>'
        : mode === 'low' ? '<b>求救卡</b><small>時間不足</small>'
          : `<b>求救卡</b><small>看提示 −${p} 秒</small>`;
    }

    hintIdle() {
      const h = this.scr.hint;
      h.className = 'lv-hint h-wait';
      h.innerHTML = `<span class="hi">?</span><div class="hb">卡住了？按求救卡看提示（−${this.cfg.penalty} 秒）</div>`;
    }

    showHint() {
      if (!this.scr || !this.level) return;
      const h = this.scr.hint;
      h.className = 'lv-hint on';
      h.innerHTML = `<span class="hi">!</span><div class="hb">${this.level.hintHTML()}</div>`;
      U.fit(h, 0.55);
    }

    showAnswer() {
      if (!this.scr || !this.level) return;
      const h = this.scr.hint;
      h.className = 'lv-hint answer';
      h.innerHTML = `<span class="hi">✓</span><div class="hb"><b>正解</b>　${this.level.answerHTML()}</div>`;
      U.fit(h, 0.5);
    }

    toast(t1, t2, type) {
      const el = this.toastEl;
      el.querySelector('.t1').textContent = t1;
      el.querySelector('.t2').textContent = t2 || '';
      el.className = 'toast';
      void el.offsetWidth;
      el.className = 'toast show ' + (type || '');
    }

    floatText(anchor, text, type) {
      const p = this.fx.rel(anchor);
      const f = U.el('div', 'float ' + (type || ''), U.esc(text));
      f.style.left = p.x + 'px';
      f.style.top = p.y + 'px';
      this.inner.appendChild(f);
      f.addEventListener('animationend', () => f.remove());
      setTimeout(() => f.remove(), 4000);
    }

    shake() {
      this.stage.classList.remove('shake');
      void this.stage.offsetWidth;
      this.stage.classList.add('shake');
    }

    /* ---- 總分畫面 ---- */
    showResult() {
      this.clearScreen();
      this.inner.style.setProperty('--uc', '#f2f6fb');
      const n = this.cfg.levels.length;
      const max = n * (this.cfg.base + this.cfg.time);
      const ratio = this.score / max;
      const tier = TITLES.find(t => ratio >= t[0]);
      const prevBest = LG.game.best || 0;
      LG.game.best = Math.max(prevBest, this.score);
      const isBest = this.score > prevBest && this.score > 0;
      const MARK = { ok: '✓', help: '✓', fail: '✗' };
      const okCount = this.results.filter(r => r.status !== 'fail').length;
      const root = U.el('div', 'result');
      root.innerHTML = `
        <div class="rs-head">挑戰完成　答對 ${okCount}／${n} 關</div>
        <div class="rs-title"><span class="ic">${tier[2]}</span><span>${tier[1]}</span></div>
        <div class="rs-score"><span class="num">0</span><span class="u">分</span></div>
        <div class="rs-list">${this.results.map((r, i) => `
          <div class="rs-item ${r.status}">
            <span class="i">${i + 1}</span><span class="nm">${r.meta.name}</span>
            <span class="mk">${MARK[r.status]}${r.status === 'help' ? '<em>求救</em>' : ''}</span>
            <span class="sc">${r.score}</span>
          </div>`).join('')}
        </div>
        <div class="rs-best">${isBest ? '刷新本節最高分！' : `本節最高分 ${LG.game.best}`}</div>
        <div class="btn btn-again wait"><span>再玩一次</span><i class="prog"></i></div>`;
      this.screenHost.appendChild(root);
      this.screen = root;
      const numEl = root.querySelector('.rs-score .num');
      const btn = root.querySelector('.btn-again');
      btn.style.setProperty('--wait', (AGAIN_DELAY - 0.4) + 's');
      this.displayScore = this.score;
      this.after(1.65, () => {
        LG.audio.play('fanfare');
        this.resultAnim = { el: numEl, to: this.score, t: 0, dur: 1.3 };
        const p = this.fx.rel(numEl);
        this.fx.confetti(p.x, p.y, { n: isBest ? 70 : 40 });
      });
      this.after(AGAIN_DELAY, () => btn.classList.remove('wait'));
      LG.input.onTap(btn, () => { if (this.state === 'result' && !btn.classList.contains('wait')) this.startGame(); }, { sound: false });
    }

    /* ---- 教師用：重置本區 ---- */
    reset() {
      this.tasks = [];
      this.revealToken = null;
      this.trans.stop();
      this.fx.clear();
      this.clearScreen();
      this.state = 'idle';
      this.score = 0;
      this.displayScore = 0;
      this.results = [];
      this.cfg = null;
      this.scoreAnim = null;
      this.resultAnim = null;
      this.timerOverride = null;
      this.inner.style.removeProperty('--uc');
      this.toastEl.className = 'toast';
      this.showIdle();
    }

    onSettingsChanged() {
      if (this.state === 'idle') this.showIdle();
      if (this.level) { try { this.level.layout(); } catch (e) { console.error(e); } }
      this.fx.resize();
      this.trans.resize();
    }
  }

  /* 待機畫面主視覺：y = 2^x 與 y = log₂x 對稱於 y = x */
  const IDLE_SVG = (() => {
    const sx = x => 60 + x * 28, sy = y => 200 - y * 28;
    let e = '', l = '';
    for (let i = 0; i <= 60; i++) {
      const x = -2 + i * (4.4 / 60), y = Math.pow(2, x);
      e += (i ? 'L' : 'M') + sx(x).toFixed(1) + ' ' + sy(y).toFixed(1);
    }
    for (let i = 0; i <= 60; i++) {
      const y = -2 + i * (4.4 / 60), x = Math.pow(2, y);
      l += (i ? 'L' : 'M') + sx(x).toFixed(1) + ' ' + sy(y).toFixed(1);
    }
    let grid = '';
    for (let k = -2; k <= 7; k++) grid += `<path d="M${sx(k)} 0V260M0 ${sy(k)}H300" />`;
    return `<svg viewBox="0 0 300 260" aria-hidden="true">
      <g class="g">${grid}</g>
      <path class="ax" d="M0 ${sy(0)}H300M${sx(0)} 260V0" />
      <path class="yx" d="M${sx(-2.1)} ${sy(-2.1)}L${sx(7.2)} ${sy(7.2)}" />
      <path class="ce" d="${e}" />
      <path class="cl" d="${l}" />
      <text x="${sx(2.45)}" y="${sy(5.25)}" class="te">y = 2ˣ</text>
      <text x="${sx(5.05)}" y="${sy(1.7)}" class="tl">y = log₂x</text>
    </svg>`;
  })();

  LG.Zone = Zone;
})(window.LG);
