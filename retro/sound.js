/* ==========================================================================
   Sound, nearly all of it synthesised on the spot. The machines
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

  /* Background music: an original, gentle marimba loop in the spirit of
     2007's handsets, made here rather than recorded. It only plays while
     sound is on and a device asked for it. */
  let song = null, songT = 0, nextAt = 0, step = 0;
  const mallet = (t, f, gain) => {
    tone(t, f, 0.9, { gain, attack: 0.004 });
    tone(t, f * 4, 0.18, { gain: gain * 0.18, attack: 0.002 });
  };
  const SONGS = {
    2007: { bpm: 92, chords: [[261.6, 329.6, 392], [220, 261.6, 329.6], [174.6, 220, 261.6], [196, 246.9, 293.7]], line: [0, 2, 1, 2, 0, 2, 1, 3, 2, 1, 0, 1, 2, -1, 1, -1] }
  };
  const schedule = () => {
    if (!song || muted || !ctx) return;
    const s = SONGS[song], e = 60 / s.bpm / 2;
    while (nextAt < ctx.currentTime + 0.25) {
      const ch = s.chords[Math.floor(step / 16) % s.chords.length], n = s.line[step % 16];
      if (n >= 0) mallet(nextAt, n === 3 ? ch[0] * 2 : ch[n] * 2, 0.045);
      if (step % 8 === 0) mallet(nextAt, ch[0] / 2, 0.05);
      nextAt += e; step++;
    }
  };
  const playSong = () => {
    clearInterval(songT);
    if (!song || muted || !ready()) return;
    nextAt = ctx.currentTime + 0.1; step = 0;
    songT = setInterval(schedule, 100);
  };

  /* The handful of real recordings: the first iPhone's own system sounds.
     Fetched and decoded once, the first time each is wanted. */
  const samples = {};
  const sampleBuf = (name) => { if (!samples[name]) samples[name] = fetch(`assets/audio/ios/${name}.m4a`).then((r) => r.arrayBuffer()).then((a) => ctx.decodeAudioData(a)); return samples[name]; };

  const api = {
    get muted() { return muted; },
    sample(name, gain = 2) {
      if (!ready()) return;
      sampleBuf(name).then((b) => {
        const s = ctx.createBufferSource(), g = ctx.createGain();
        s.buffer = b; g.gain.value = gain;
        s.connect(g); g.connect(master);
        s.start();
      }).catch(() => {});
    },
    /* The phone ringing at the other end: loops until stopped. */
    ringback() {
      let src = null, g = null, stopped = false;
      if (ready()) sampleBuf('ringback').then((b) => {
        if (stopped) return;
        src = ctx.createBufferSource(); g = ctx.createGain();
        src.buffer = b; src.loop = true; g.gain.value = 1;
        src.connect(g); g.connect(master);
        src.start();
      }).catch(() => {});
      return { gain(v) { if (g) g.gain.value = v; }, stop() { stopped = true; if (src) src.stop(); } };
    },
    /* A keypad's two real touch tones. */
    dtmf(k) {
      if (!ready()) return;
      const R = { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1, 6: 1, 7: 2, 8: 2, 9: 2, '*': 3, 0: 3, '#': 3 }, C = { 1: 0, 4: 0, 7: 0, '*': 0, 2: 1, 5: 1, 8: 1, 0: 1, 3: 2, 6: 2, 9: 2, '#': 2 };
      if (R[k] == null) return;
      const t = ctx.currentTime;
      tone(t, [697, 770, 852, 941][R[k]], 0.16, { gain: 0.09 });
      tone(t, [1209, 1336, 1477][C[k]], 0.16, { gain: 0.09 });
    },
    /* Slide to unlock's clack: a latch let go, then its catch. */
    unlock() {
      if (!ready()) return;
      const t = ctx.currentTime;
      tick(t, { dur: 0.018, freq: 3400, q: 2.5, gain: 0.8 });
      tick(t + 0.012, { dur: 0.05, freq: 1100, q: 1.2, gain: 0.6 });
      tick(t + 0.085, { dur: 0.03, freq: 2300, q: 3, gain: 0.55 });
    },
    setMuted(v) {
      muted = !!v;
      window.RETRO.store.set('sound-on', !muted);
      if (muted && ctx) ctx.suspend();
      if (muted) clearInterval(songT); else playSong();
      document.dispatchEvent(new CustomEvent('sfx-mute', { detail: muted }));
    },
    music(name) { if (name === song) return; song = name || null; if (song) playSong(); else clearInterval(songT); },
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
