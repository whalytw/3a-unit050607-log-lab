/* 指對數實驗室 — 觸控輸入
   全部使用 Pointer Events，不依賴 click：
   多指同時觸控時，瀏覽器常不會替第二、三根手指產生 click，
   所以按鈕一律在「手指放開時仍在按鈕範圍內」才觸發。
   觸控點會被綁在按下時的元素上（pointer capture），
   手指滑進隔壁區也不會干擾別人。 */
'use strict';
(function (LG) {
  const I = {};
  const S = () => LG.settings;

  function zoneWidthOf(el) {
    const z = el && el.closest ? el.closest('.zone') : null;
    return z ? z.clientWidth : window.innerWidth / 3;
  }
  I.zoneWidthOf = zoneWidthOf;

  /* 接觸面積過大（手掌、手臂）時忽略 */
  I.isPalm = (e, el) => {
    if (e.pointerType !== 'touch') return false;
    const size = Math.max(e.width || 0, e.height || 0);
    return size > S().palmPx(zoneWidthOf(el));
  };

  I.okButton = e => e.pointerType === 'touch' || e.button === 0;

  function capture(el, id) { try { el.setPointerCapture(id); } catch (_) { /* ignore */ } }

  /* 保險：若放開事件沒有送到按鈕本身（例如滑鼠沒被 capture），由 window 收尾 */
  const pendingTaps = new Map();
  const sweep = e => { const r = pendingTaps.get(e.pointerId); if (r) r(); };
  window.addEventListener('pointerup', sweep);
  window.addEventListener('pointercancel', sweep);

  /* 點擊：放開時仍在元素（含容錯範圍）內才算 */
  I.onTap = (el, fn, opts) => {
    opts = opts || {};
    let pid = null;
    const reset = () => {
      if (pid !== null && pendingTaps.get(pid) === reset) pendingTaps.delete(pid);
      pid = null;
      el.classList.remove('pressed');
    };
    const enabled = () => !el.classList.contains('disabled') && (!opts.enabled || opts.enabled());
    el.addEventListener('pointerdown', e => {
      if (pid !== null || !I.okButton(e) || I.isPalm(e, el) || !enabled()) return;
      pid = e.pointerId;
      pendingTaps.set(pid, reset);
      el.classList.add('pressed');
      capture(el, pid);
      e.stopPropagation();
      if (opts.sound !== false) LG.audio.play('tap');
    });
    el.addEventListener('pointerup', e => {
      if (e.pointerId !== pid) return;
      const r = el.getBoundingClientRect();
      const t = S().tapPx(zoneWidthOf(el));
      const inside = e.clientX >= r.left - t && e.clientX <= r.right + t && e.clientY >= r.top - t && e.clientY <= r.bottom + t;
      reset();
      if (inside && enabled()) fn(e);
    });
    el.addEventListener('pointercancel', e => { if (e.pointerId === pid) reset(); });
    el.addEventListener('lostpointercapture', e => { if (e.pointerId === pid) reset(); });
  };

  /* 拖曳：h = { down(e,p) → false 表示不接手, start(e,p), move(e,p), up(e,p,started), cancel() }
     p 為相對於元素左上角的 CSS px 座標 */
  I.onDrag = (el, h, opts) => {
    opts = opts || {};
    let pid = null, rect = null, sx = 0, sy = 0, started = false;
    const rel = e => ({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    const api = {
      get active() { return pid !== null; },
      cancel() {
        if (pid === null) return;
        const id = pid; pid = null;
        try { el.releasePointerCapture(id); } catch (_) { /* ignore */ }
        if (h.cancel) h.cancel();
      }
    };
    el.addEventListener('pointerdown', e => {
      if (pid !== null || !I.okButton(e) || I.isPalm(e, el)) return;
      rect = el.getBoundingClientRect();
      const p = rel(e);
      if (h.down && h.down(e, p) === false) return;
      pid = e.pointerId; sx = e.clientX; sy = e.clientY;
      started = !opts.threshold;
      capture(el, pid);
      e.stopPropagation();
      if (started && h.start) h.start(e, p);
    });
    el.addEventListener('pointermove', e => {
      if (e.pointerId !== pid) return;
      const p = rel(e);
      if (!started) {
        if (Math.hypot(e.clientX - sx, e.clientY - sy) < S().dragPx(zoneWidthOf(el))) return;
        started = true;
        if (h.start) h.start(e, p);
      }
      if (h.move) h.move(e, p);
    });
    const end = (e, cancelled) => {
      if (e.pointerId !== pid) return;
      const p = rel(e);
      pid = null;
      if (cancelled) { if (h.cancel) h.cancel(e, p); }
      else if (h.up) h.up(e, p, started);
    };
    el.addEventListener('pointerup', e => end(e, false));
    el.addEventListener('pointercancel', e => end(e, true));
    el.addEventListener('lostpointercapture', e => { if (e.pointerId === pid) end(e, true); });
    return api;
  };

  /* 長按：按住 ms 毫秒才觸發（教師列用） */
  I.onHold = (el, ms, fn, opts) => {
    opts = opts || {};
    let pid = null, timer = null;
    const bar = el.querySelector('.hold');
    const stop = () => {
      if (timer) clearTimeout(timer);
      timer = null; pid = null;
      el.classList.remove('holding');
      if (bar) { bar.style.transition = 'none'; bar.style.transform = 'scaleX(0)'; }
    };
    el.addEventListener('pointerdown', e => {
      if (pid !== null || !I.okButton(e)) return;
      if (opts.enabled && !opts.enabled()) return;
      pid = e.pointerId;
      capture(el, pid);
      el.classList.add('holding');
      if (bar) {
        bar.style.transition = 'none';
        bar.style.transform = 'scaleX(0)';
        void bar.offsetWidth;
        bar.style.transition = `transform ${ms}ms linear`;
        bar.style.transform = 'scaleX(1)';
      }
      timer = setTimeout(() => { const ok = pid !== null; stop(); if (ok) fn(); }, ms);
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t =>
      el.addEventListener(t, e => { if (e.pointerId === pid) stop(); }));
  };

  LG.input = I;
})(window.LG);
