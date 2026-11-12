/* 指對數實驗室 — 防誤觸：擋掉瀏覽器的右鍵／長按選單、選取、拖曳圖片、縮放手勢
   （畫面滑動與縮放另由 CSS touch-action:none、overscroll-behavior:none 關閉） */
'use strict';
(function () {
  const stop = e => { e.preventDefault(); };
  const opt = { capture: true };
  window.addEventListener('contextmenu', stop, opt);   // 長按觸控 = 右鍵選單
  window.addEventListener('selectstart', stop, opt);   // 文字選取
  window.addEventListener('dragstart', stop, opt);     // 拖曳圖片／文字
  window.addEventListener('gesturestart', stop, opt);
  window.addEventListener('dblclick', stop, opt);
  // 觸控板捏合縮放、Ctrl＋滾輪
  window.addEventListener('wheel', e => { if (e.ctrlKey) e.preventDefault(); }, { passive: false, capture: true });
  // Ctrl＋加號／減號／0 縮放、Ctrl＋P 列印、Ctrl＋S 存檔
  window.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && ['+', '-', '=', '0', 'p', 's'].includes((e.key || '').toLowerCase())) e.preventDefault();
  }, opt);
  // 多指觸控時阻止瀏覽器預設的捏合縮放（遊戲本身只用 Pointer Events）
  document.addEventListener('touchmove', e => { if (e.touches && e.touches.length > 1) e.preventDefault(); }, { passive: false });
})();
