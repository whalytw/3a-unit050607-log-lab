/* 指對數實驗室 — 啟動與主迴圈 */
'use strict';
(function (LG) {
  LG.settings.load();

  // 預先載入 KaTeX 與數字字型（避免第一關量字寬時字型還沒到）
  const warm = document.createElement('div');
  warm.setAttribute('aria-hidden', 'true');
  warm.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;pointer-events:none;font-family:"Barlow Condensed"';
  warm.innerHTML = LG.util.tex('\\log_{\\frac{1}{2}}\\sqrt{2}+\\dfrac{3}{2}x^{2}\\le10^{-12}\\Rightarrow\\left(\\frac12\\right)') + '<b>0123456789</b>';
  document.body.appendChild(warm);

  const game = LG.game = { zones: [], paused: false, best: 0 };

  game.pause = () => {
    if (game.paused) return;
    game.paused = true;
    try {
      game._anims = document.getAnimations().filter(a => a.playState === 'running');
      game._anims.forEach(a => { try { a.pause(); } catch (_) { /* ignore */ } });
    } catch (e) { game._anims = []; }
  };

  game.resume = () => {
    if (!game.paused) return;
    game.paused = false;
    (game._anims || []).forEach(a => { try { if (a.playState === 'paused') a.play(); } catch (_) { /* ignore */ } });
    game._anims = null;
  };

  const host = document.getElementById('zones');
  for (let i = 0; i < 3; i++) game.zones.push(new LG.Zone(i, host));
  LG.teacherBar.init();
  LG.settingsUI.init();

  LG.settings.onChange(k => {
    if (k === 'volume' || k === '*') LG.audio.setVolume(LG.settings.data.volume);
    LG.teacherBar.refresh();
  });

  // 第一次觸控時啟用音效（瀏覽器規定要有使用者操作）
  const unlock = () => LG.audio.unlock();
  window.addEventListener('pointerdown', unlock, { capture: true });
  window.addEventListener('pointerup', unlock, { capture: true });

  let last = performance.now();
  function frame(t) {
    const dt = Math.min(0.1, Math.max(0, (t - last) / 1000));
    last = t;
    if (!game.paused) {
      for (const z of game.zones) {
        try { z.update(dt); } catch (e) { console.error(e); }
      }
      try { LG.Shared3D.render(); } catch (e) { console.error(e); }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // 測試用：網址加上 ?debug=1 才會開啟
  if (/[?&]debug=1\b/.test(location.search)) {
    LG.debug = {
      start(i) { game.zones[i].startGame(); },
      jump(i, k) {
        const z = game.zones[i];
        if (z.state === 'idle' || !z.cfg) z.startGame();
        z.tasks = []; z.trans.stop();
        z.li = k - 1; z.results = z.results.slice(0, k);
        while (z.results.length < k) z.results.push({ meta: z.cfg.levels[z.results.length].meta, status: 'ok', score: 30 });
        z.gotoNext();
      },
      answer(i, ok) { return game.zones[i].answer(ok); },
      zone(i) { return game.zones[i]; }
    };
  }
})(window.LG);
