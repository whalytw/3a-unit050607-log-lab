/* 指對數實驗室 — 設定（存在瀏覽器 localStorage） */
'use strict';
(function (LG) {
  const KEY = 'logLab.settings.v1';

  const DEFAULTS = {
    time: 45,             // 每關秒數 30～60
    difficulty: 'normal', // easy / normal / hard
    penalty: 10,          // 求救卡扣秒
    base: 15,             // 答對基本分
    levels: [true, true, true, true, true, true],
    dragDist: 'mid',      // 拖曳啟動距離
    tapTol: 'mid',        // 點擊容錯範圍
    palm: 'normal',       // 手掌誤觸過濾
    renderScale: 1,       // 畫面解析度比例
    fx: 'full',           // 特效
    volume: 0.7,          // 音量
    classSize: 27,        // 班級人數（只用來估算時間）
    pin: ''               // 設定頁密碼（空字串 = 不需要）
  };

  const VALID = {
    time: v => [30, 35, 40, 45, 50, 55, 60].includes(v),
    difficulty: v => ['easy', 'normal', 'hard'].includes(v),
    penalty: v => [5, 10, 15].includes(v),
    base: v => [10, 15, 20].includes(v),
    levels: v => Array.isArray(v) && v.length === 6 && v.every(b => typeof b === 'boolean') && v.some(Boolean),
    dragDist: v => ['small', 'mid', 'large'].includes(v),
    tapTol: v => ['small', 'mid', 'large'].includes(v),
    palm: v => ['off', 'normal', 'strict'].includes(v),
    renderScale: v => [1, 0.75, 0.5].includes(v),
    fx: v => ['full', 'lite'].includes(v),
    volume: v => [0, 0.35, 0.7, 1].includes(v),
    classSize: v => Number.isInteger(v) && v >= 3 && v <= 60,
    pin: v => v === '' || /^\d{4}$/.test(v)
  };

  const S = { data: null, listeners: [] };

  S.load = () => {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { saved = {}; }
    const d = JSON.parse(JSON.stringify(DEFAULTS));
    Object.keys(DEFAULTS).forEach(k => { if (k in saved && VALID[k](saved[k])) d[k] = saved[k]; });
    S.data = d;
  };

  S.save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(S.data)); } catch (e) { /* 無法儲存時仍可遊玩 */ }
  };

  S.set = (k, v) => {
    if (!VALID[k] || !VALID[k](v)) return false;
    S.data[k] = v;
    S.save();
    S.listeners.forEach(f => { try { f(k, v); } catch (e) { console.error(e); } });
    return true;
  };

  S.resetDefaults = () => {
    const pin = S.data.pin;
    S.data = JSON.parse(JSON.stringify(DEFAULTS));
    S.data.pin = pin;
    S.save();
    S.listeners.forEach(f => { try { f('*'); } catch (e) { console.error(e); } });
  };

  S.onChange = f => S.listeners.push(f);

  /* 依區域寬度換算的觸控參數（CSS px） */
  S.dragPx = zoneW => zoneW * ({ small: 0.01, mid: 0.02, large: 0.035 })[S.data.dragDist];
  S.tapPx = zoneW => zoneW * ({ small: 0.02, mid: 0.045, large: 0.08 })[S.data.tapTol];
  S.hitScale = () => ({ small: 1, mid: 1.18, large: 1.4 })[S.data.tapTol];
  S.palmPx = zoneW => (S.data.palm === 'off' ? Infinity : zoneW * (S.data.palm === 'strict' ? 0.08 : 0.13));
  S.canvasScale = () => Math.min(window.devicePixelRatio || 1, 2) * S.data.renderScale;

  S.DEFAULTS = DEFAULTS;
  LG.settings = S;
})(window.LG);
