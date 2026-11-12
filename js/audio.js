/* 指對數實驗室 — 音效（Web Audio 即時合成，不需要音檔） */
'use strict';
(function (LG) {
  let ctx = null, master = null, noiseBuf = null;
  const A = {};

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try {
        ctx = new AC();
        master = ctx.createGain();
        master.connect(ctx.destination);
        A.setVolume(LG.settings.data.volume);
        const len = Math.floor(ctx.sampleRate * 1.0);
        noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = noiseBuf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      } catch (e) { ctx = null; return null; }
    }
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) { /* ignore */ } }
    return ctx;
  }

  A.unlock = () => { ensure(); };
  A.setVolume = v => { if (master) master.gain.value = v * 0.55; };

  function tone(freq, dur, o) {
    o = o || {};
    const t0 = ctx.currentTime + (o.delay || 0);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t0 + dur);
    const peak = o.gain || 0.2;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + (o.attack || 0.006));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(master);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  }

  function noise(dur, o) {
    o = o || {};
    const t0 = ctx.currentTime + (o.delay || 0);
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = o.filter || 'bandpass';
    f.frequency.setValueAtTime(o.freq || 1000, t0);
    if (o.sweep) f.frequency.exponentialRampToValueAtTime(o.sweep, t0 + dur);
    f.Q.value = o.q || 1;
    const g = ctx.createGain();
    g.gain.setValueAtTime(o.gain || 0.2, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t0, Math.random() * 0.5); src.stop(t0 + dur + 0.02);
  }

  const lastPlay = {};
  A.play = name => {
    if (!LG.settings || LG.settings.data.volume <= 0) return;
    if (!ensure()) return;
    const now = performance.now();
    if (lastPlay[name] && now - lastPlay[name] < 35) return; // 避免同一音效疊太密
    lastPlay[name] = now;
    try {
      switch (name) {
        case 'tap': tone(700, 0.06, { type: 'triangle', gain: 0.1 }); break;
        case 'select':
          tone(880, 0.07, { type: 'triangle', gain: 0.12 });
          tone(1320, 0.08, { type: 'triangle', gain: 0.07, delay: 0.04 });
          break;
        case 'correct':
          [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.24, { type: 'triangle', gain: 0.2, delay: i * 0.07 }));
          break;
        case 'wrong': tone(190, 0.34, { type: 'sawtooth', gain: 0.13, slide: 105 }); break;
        case 'tick': tone(1150, 0.035, { type: 'square', gain: 0.05 }); break;
        case 'whoosh': noise(0.55, { gain: 0.16, filter: 'bandpass', freq: 380, sweep: 3200, q: 0.9 }); break;
        case 'stamp': tone(130, 0.2, { gain: 0.3, slide: 60 }); noise(0.07, { gain: 0.14, filter: 'lowpass', freq: 900 }); break;
        case 'coin': tone(1320, 0.07, { type: 'square', gain: 0.045 }); tone(1760, 0.09, { type: 'square', gain: 0.035, delay: 0.04 }); break;
        case 'cut': noise(0.12, { gain: 0.32, filter: 'highpass', freq: 2600 }); tone(2300, 0.05, { type: 'square', gain: 0.04 }); break;
        case 'boom': noise(0.9, { gain: 0.45, filter: 'lowpass', freq: 700, sweep: 70 }); tone(70, 0.6, { gain: 0.3, slide: 35 }); break;
        case 'clack': noise(0.045, { gain: 0.22, filter: 'bandpass', freq: 2100, q: 4 }); break;
        case 'firework': for (let i = 0; i < 5; i++) noise(0.22, { gain: 0.1, filter: 'highpass', freq: 3200, delay: i * 0.08 }); break;
        case 'fanfare': [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.32, { type: 'triangle', gain: 0.18, delay: i * 0.1 })); break;
        case 'grow': tone(240, 0.9, { gain: 0.07, slide: 900 }); break;
        case 'plug': tone(560, 0.05, { type: 'square', gain: 0.07 }); tone(840, 0.06, { type: 'square', gain: 0.05, delay: 0.04 }); break;
        case 'zap': tone(260, 0.3, { type: 'sawtooth', gain: 0.08, slide: 1400 }); break;
        case 'dial': tone(1500, 0.025, { type: 'square', gain: 0.035 }); break;
        default: break;
      }
    } catch (e) { /* 音效失敗不影響遊戲 */ }
  };

  LG.audio = A;
})(window.LG);
