/* ==========================================================================
   Sound, all of it synthesised on the spot: no audio files. The machines
   make the noises old machines made (a disk clunking in, a drive seeking, a
   key clicking, a startup chord, a modem shaking hands) quietly, and only
   after the visitor's first press, which is when browsers allow it. The
   speaker in each menu bar mutes it for good.
   ========================================================================== */
window.SFX = (function () {
  let ctx = null, master = null;
  /* Silent until the visitor asks for sound, every visit, unless they
     turned it on before. */
  let muted = !window.RETRO.store.get('sound-on', false);

  const ready = () => {
    if (muted) return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.32;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };

  const noise = (dur) => {
    const b = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = ctx.createBufferSource();
    s.buffer = b;
    return s;
  };

  /* A short filtered noise burst: the basis of every mechanical sound. */
  const tick = (t, { dur = 0.03, freq = 2400, q = 1.2, gain = 0.5, type = 'bandpass' } = {}) => {
    const s = noise(dur);
    const f = ctx.createBiquadFilter();
    f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t); s.stop(t + dur + 0.01);
  };

  const tone = (t, freq, dur, { type = 'sine', gain = 0.2, attack = 0.005 } = {}) => {
    const o = ctx.createOscillator();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.02);
    return o;
  };

  const api = {
    get muted() { return muted; },
    setMuted(v) {
      muted = !!v;
      window.RETRO.store.set('sound-on', !muted);
      if (muted && ctx) ctx.suspend();
      document.dispatchEvent(new CustomEvent('sfx-mute', { detail: muted }));
    },
    toggle() { api.setMuted(!muted); if (!muted) api.click(); return muted; },

    click() {
      if (!ready()) return;
      tick(ctx.currentTime, { dur: 0.012, freq: 3800, q: 0.8, gain: 0.35 });
    },
    key() {
      if (!ready()) return;
      tick(ctx.currentTime, { dur: 0.018, freq: 1800 + Math.random() * 900, q: 2, gain: 0.22 });
    },
    /* The disk is pushed in, the shutter clunks, the drive seeks a few times. */
    insert() {
      if (!ready()) return;
      const t = ctx.currentTime;
      tick(t, { dur: 0.08, freq: 600, q: 0.7, gain: 0.7, type: 'lowpass' });
      tick(t + 0.09, { dur: 0.05, freq: 1400, q: 3, gain: 0.5 });
      api.seek(t + 0.35, 9);
    },
    seek(at, n = 6) {
      if (!ready()) return;
      const t0 = at || ctx.currentTime;
      for (let i = 0; i < n; i++) {
        const t = t0 + i * (0.07 + Math.random() * 0.09);
        tick(t, { dur: 0.025, freq: 900 + Math.random() * 500, q: 6, gain: 0.32 });
      }
      /* A low motor hum underneath. */
      const o = tone(t0, 62, n * 0.13, { type: 'sawtooth', gain: 0.03, attack: 0.05 });
      o && o.frequency.linearRampToValueAtTime(70, t0 + n * 0.13);
    },
    /* An original startup chord: a soft major ninth that swells and rings. */
    chime() {
      if (!ready()) return;
      const t = ctx.currentTime + 0.02;
      [130.81, 196.0, 261.63, 329.63, 392.0, 587.33].forEach((f, i) => {
        tone(t + i * 0.012, f, 2.4, { type: i % 2 ? 'triangle' : 'sine', gain: 0.07, attack: 0.03 });
      });
    },
    beep() {
      if (!ready()) return;
      tone(ctx.currentTime, 880, 0.12, { type: 'square', gain: 0.05 });
    },
    error() {
      if (!ready()) return;
      const t = ctx.currentTime;
      tone(t, 220, 0.18, { type: 'square', gain: 0.07 });
      tone(t + 0.12, 164.8, 0.3, { type: 'square', gain: 0.07 });
    },
    whoosh() {
      if (!ready()) return;
      const t = ctx.currentTime;
      const s = noise(0.7);
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass'; f.Q.value = 0.9;
      f.frequency.setValueAtTime(300, t);
      f.frequency.exponentialRampToValueAtTime(2600, t + 0.6);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.25);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
      s.connect(f); f.connect(g); g.connect(master);
      s.start(t); s.stop(t + 0.72);
    },
    /* A modem handshake, compressed to a couple of seconds. */
    modem() {
      if (!ready()) return;
      const t = ctx.currentTime;
      /* Dial tone, then touch tones. */
      tone(t, 350, 0.35, { gain: 0.05 }); tone(t, 440, 0.35, { gain: 0.05 });
      const dtmf = [[697, 1209], [770, 1336], [852, 1477], [697, 1336], [941, 1336], [770, 1209], [852, 1336]];
      dtmf.forEach(([a, b], i) => {
        const tt = t + 0.42 + i * 0.09;
        tone(tt, a, 0.07, { gain: 0.05 }); tone(tt, b, 0.07, { gain: 0.05 });
      });
      const h = t + 1.2;
      tone(h, 2100, 0.35, { gain: 0.04 });
      tone(h + 0.38, 1300, 0.12, { type: 'square', gain: 0.02 });
      tone(h + 0.5, 2250, 0.2, { gain: 0.03 });
      tick(h + 0.7, { dur: 0.9, freq: 1800, q: 0.4, gain: 0.08 });
      tone(h + 0.7, 1650, 0.9, { type: 'sawtooth', gain: 0.012 });
    },
    /* Wheel detent on the pocket device. */
    detent() {
      if (!ready()) return;
      tick(ctx.currentTime, { dur: 0.008, freq: 5200, q: 1.5, gain: 0.25 });
    },
    /* A tiny tune for the pocket device's play button. */
    tune() {
      if (!ready()) return;
      const t = ctx.currentTime;
      const notes = [659, 784, 988, 784, 880, 1047, 988, 784, 659, 587, 659];
      notes.forEach((f, i) => tone(t + i * 0.13, f, 0.12, { type: 'square', gain: 0.03 }));
    }
  };
  return api;
})();
