/* 指對數實驗室 — 畫面最上方的教師列：全螢幕、設定（長按） */
'use strict';
(function (LG) {
  const U = LG.util, I = LG.input;
  const TB = {};
  const DIFF = { easy: '簡單', normal: '標準', hard: '挑戰' };

  function isFs() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }

  async function enterFs() {
    const el = document.documentElement;
    try {
      if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' });
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      // Chrome／Edge：鎖住 Esc，必須長按 Esc 才會離開全螢幕
      if (navigator.keyboard && navigator.keyboard.lock) { try { await navigator.keyboard.lock(['Escape']); } catch (_) { /* ignore */ } }
    } catch (e) {
      console.warn('無法進入全螢幕', e);
    }
  }

  function exitFs() {
    try {
      if (navigator.keyboard && navigator.keyboard.unlock) navigator.keyboard.unlock();
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    } catch (e) { /* ignore */ }
  }

  TB.init = () => {
    const bar = document.getElementById('teacher-bar');
    bar.innerHTML = `
      <div class="tb-brand">
        <svg class="tb-logo" viewBox="0 0 40 40" aria-hidden="true"><path d="M4 36 L36 4" class="l1"/><path d="M4 30 C14 30 20 26 26 4" class="l2"/><path d="M10 36 C10 26 14 20 36 14" class="l3"/></svg>
        <span class="nm">指對數實驗室</span><span class="sub">單元 5～7 總複習</span>
      </div>
      <div class="tb-info"></div>
      <div class="tb-btn" id="btn-fs"><span class="ic">⛶</span><span class="lb">全螢幕</span><i class="hold"></i></div>
      <div class="tb-btn" id="btn-set"><span class="ic">⚙</span><span class="lb">設定</span><small>長按 2 秒</small><i class="hold"></i></div>`;
    TB.info = bar.querySelector('.tb-info');
    const fs = bar.querySelector('#btn-fs'), set = bar.querySelector('#btn-set');
    // 一般狀態：點一下進入全螢幕；全螢幕時：長按 1.5 秒才離開（避免學生誤觸）
    let heldAt = 0;
    I.onTap(fs, () => { if (!isFs() && performance.now() - heldAt > 1200) enterFs(); });
    I.onHold(fs, 1500, () => { if (isFs()) { heldAt = performance.now(); exitFs(); } }, { enabled: isFs });
    I.onHold(set, 2000, () => LG.settingsUI.request());
    const sync = () => {
      const on = isFs();
      fs.classList.toggle('fs-on', on);
      fs.querySelector('.lb').textContent = on ? '離開全螢幕' : '全螢幕';
      let sm = fs.querySelector('small');
      if (on && !sm) { sm = U.el('small', '', '長按'); fs.insertBefore(sm, fs.querySelector('.hold')); }
      if (!on && sm) sm.remove();
    };
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('webkitfullscreenchange', sync);
    sync();
    TB.refresh();
  };

  TB.refresh = () => {
    const d = LG.settings.data;
    const n = d.levels.filter(Boolean).length;
    const used = d.diffs.filter((x, i) => d.levels[i]);
    const diff = used.every(x => x === used[0]) ? DIFF[used[0]] : '各關自訂';
    TB.info.textContent = `難度 ${diff}　每關 ${d.time} 秒　共 ${n} 關`;
  };

  LG.teacherBar = TB;
})(window.LG);
