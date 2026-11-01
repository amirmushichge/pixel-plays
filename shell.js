'use strict';
// Shared chrome for every game: game menu (top centre) and rules popup (top right).
window.PixelPlays = (() => {
  // add a game here and give it a folder; `soon` entries show in the menu but do not link
  const GAMES = [
    { id: 'balote', title: 'Balote' },
    { id: 'stari-most', title: 'Stari Most' },
    { id: 'laundry', title: 'Rooftop Laundry' },
    { id: 'tie-break', title: 'Tie-Break' },
    { id: 'mini-ramp', title: 'Mini Ramp' },
  ];
  const MUSIC_VOLUME = .4;
  const CREDITS = [
    ['Concept by', 'abhi', 'https://x.com/awwbhi2'],
    ['Game by', 'AmirMushich', 'https://x.com/AmirMushich'],
  ];
  const css = `
    .pp-link { font: inherit; color: #8b877f; background: none; border: 0; padding: 10px; margin: 0; cursor: pointer; }
    .pp-link:hover, .pp-link:focus-visible, .pp-link[aria-expanded="true"] { color: #1c1b19; }
    #pp-menu { position: fixed; top: max(4px, env(safe-area-inset-top)); left: 50%; transform: translateX(-50%); z-index: 5; text-align: center; }
    #pp-list { list-style: none; margin: 0; padding: 4px 0; background: #fff; border: 1px solid #1c1b19; min-width: 150px; text-align: left; }
    #pp-list[hidden] { display: none; }
    #pp-list a, #pp-list span { display: flex; justify-content: space-between; gap: 16px; padding: 8px 12px; color: #1c1b19; text-decoration: none; }
    #pp-list a:hover, #pp-list a:focus-visible { background: #1c1b19; color: #fff; outline: none; }
    #pp-list a[aria-current="page"]::after { content: "•"; }
    #pp-list span { color: #b3afa7; }
    #pp-rules-open { position: fixed; top: max(4px, env(safe-area-inset-top)); right: max(6px, env(safe-area-inset-right)); z-index: 5; }
    #pp-rules { width: min(340px, calc(100vw - 32px)); padding: 16px; border: 1px solid #1c1b19; color: #1c1b19; background: #fff; font: inherit; }
    #pp-rules::backdrop { background: rgba(255, 255, 255, .72); }
    #pp-rules h2 { margin: 0 0 10px; font: inherit; font-weight: 600; }
    #pp-rules ol { margin: 0 0 8px; padding-left: 18px; }
    #pp-rules li { margin-bottom: 8px; }
    #pp-rules form { text-align: right; }
    #pp-rules .pp-link { margin: 0 -10px -10px; color: #1c1b19; }
    #pp-credits { position: fixed; bottom: max(14px, env(safe-area-inset-bottom)); left: 50%; transform: translateX(-50%); z-index: 4; display: flex; gap: 16px; color: #8b877f; white-space: nowrap; pointer-events: none; }
    #pp-credits a { color: inherit; text-decoration: underline; text-underline-offset: 2px; pointer-events: auto; }
    #pp-credits a:hover, #pp-credits a:focus-visible { color: #1c1b19; }
    /* long end-of-game status lines run towards the centre, so the credits step above them */
    @media (max-width: 1200px) { #pp-credits { bottom: max(38px, calc(env(safe-area-inset-bottom) + 24px)); } }
    @media (max-width: 600px) { #pp-credits { bottom: max(72px, calc(env(safe-area-inset-bottom) + 58px)); } }
  `;
  function mount({ id, rules, song }) {
    const game = GAMES.find(g => g.id === id);
    const style = document.createElement('style');
    style.textContent = css;
    document.head.append(style);

    const menu = document.createElement('nav');
    menu.id = 'pp-menu';
    menu.setAttribute('aria-label', 'Games');
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'pp-link';
    toggle.textContent = game.title + ' ▾';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'pp-list');
    const list = document.createElement('ul');
    list.id = 'pp-list';
    list.hidden = true;
    for (const g of GAMES) {
      const item = document.createElement('li');
      if (g.soon) {
        const label = document.createElement('span');
        label.innerHTML = '<span style="padding:0">' + g.title + '</span><span style="padding:0">soon</span>';
        item.append(label);
      } else {
        const link = document.createElement('a');
        link.href = '../' + g.id + '/';
        link.textContent = g.title;
        if (g.id === id) link.setAttribute('aria-current', 'page');
        item.append(link);
      }
      list.append(item);
    }
    menu.append(toggle, list);
    const setOpen = open => {
      list.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', () => setOpen(list.hidden));
    document.addEventListener('pointerdown', e => { if (!menu.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !list.hidden) { setOpen(false); toggle.focus(); }
    });

    const open = document.createElement('button');
    open.type = 'button';
    open.id = 'pp-rules-open';
    open.className = 'pp-link';
    open.textContent = 'Rules';
    const dialog = document.createElement('dialog');
    dialog.id = 'pp-rules';
    dialog.setAttribute('aria-labelledby', 'pp-rules-title');
    const title = document.createElement('h2');
    title.id = 'pp-rules-title';
    title.textContent = game.title;
    const steps = document.createElement('ol');
    for (const rule of rules) {
      const li = document.createElement('li');
      li.textContent = rule;
      steps.append(li);
    }
    const form = document.createElement('form');
    form.method = 'dialog';
    form.innerHTML = '<button class="pp-link">Close</button>';
    dialog.append(title, steps, form);
    open.addEventListener('click', () => dialog.showModal());
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });

    const credits = document.createElement('div');
    credits.id = 'pp-credits';
    for (const [label, name, url] of CREDITS) {
      const line = document.createElement('span');
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = name;
      line.append(label + ' ', link);
      credits.append(line);
    }

    document.body.append(menu, open, dialog, credits);
    if (song) startSong(song);
    else startMusic(id);
  }
  // each game loops <id>/<id>.mp3 from the first gesture, because browsers block sound before one.
  // The game's own sound button mutes it too.
  function startMusic(id) {
    const music = new Audio(id + '.mp3');
    music.loop = true;
    music.volume = MUSIC_VOLUME;
    music.preload = 'none';
    let started = false;
    const start = () => {
      started = true;
      music.play().catch(() => { started = false; });
    };
    for (const kind of ['pointerdown', 'keydown']) document.addEventListener(kind, () => { if (!started) start(); });
    document.getElementById('mute').addEventListener('click', () => { music.muted = !music.muted; });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) music.pause();
      else if (started) start();
    });
    PixelPlays.music = music;
  }

  // a game can pass `song` to mount() instead of shipping an mp3: a looping synth score written as code.
  // song: { bpm, meter, bars, volume?, echo?, parts: [{ instrument, gain, notes: [[beat, beats, midi, velocity?]] }] }
  // Beats count from the start of the song. melody() turns bar strings into notes.
  const NOTE_STEPS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  // 'C#5' or 'Bb3' to a MIDI number
  function noteNumber(name) {
    const m = /^([A-G])([#b]?)(\d)$/.exec(name);
    if (!m) throw new Error('Unknown note ' + name);
    return 12 * (Number(m[3]) + 1) + NOTE_STEPS[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  }
  // one string per bar, such as 'r:2 A4 D5:.5 E5:.5': a note or r for a rest, then :beats (1 if left out)
  function melody(bars, meter = 4) {
    const notes = [];
    bars.forEach((bar, b) => {
      let at = b * meter;
      for (const token of bar.trim().split(/\s+/)) {
        const [name, beats = '1'] = token.split(':'), length = Number(beats);
        if (name !== 'r') notes.push([at, length, noteNumber(name)]);
        at += length;
      }
      if (Math.abs(at - (b + 1) * meter) > 1e-6) throw new Error(`Bar ${b + 1} has ${at - b * meter} beats, not ${meter}`);
    });
    return notes;
  }
  // each instrument schedules one note: dry into `out`, and a share into the echo
  const INSTRUMENTS = {
    // a whistle: a sine that glides up into the note, with vibrato that grows on held notes
    whistle(ctx, out, echo, t, hz, length, gain) {
      const osc = ctx.createOscillator(), amp = ctx.createGain(), lfo = ctx.createOscillator(), depth = ctx.createGain();
      osc.frequency.setValueAtTime(hz * .96, t);
      osc.frequency.exponentialRampToValueAtTime(hz, t + .07);
      lfo.frequency.value = 5.3;
      depth.gain.setValueAtTime(0, t);
      depth.gain.linearRampToValueAtTime(hz * .014, t + Math.min(length, .6));
      lfo.connect(depth).connect(osc.frequency);
      amp.gain.setValueAtTime(0, t);
      amp.gain.linearRampToValueAtTime(gain, t + .05);
      amp.gain.setValueAtTime(gain, t + Math.max(.06, length - .08));
      amp.gain.linearRampToValueAtTime(0, t + length);
      osc.connect(amp);
      amp.connect(out); amp.connect(echo);
      osc.start(t); lfo.start(t);
      osc.stop(t + length + .02); lfo.stop(t + length + .02);
    },
    // a twangy plucked string: a bright sawtooth under a closing resonant low-pass, bent down into tune
    twang(ctx, out, echo, t, hz, length, gain) {
      const osc = ctx.createOscillator(), filter = ctx.createBiquadFilter(), amp = ctx.createGain(), ring = Math.max(.45, length);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(hz * 1.015, t);
      osc.frequency.exponentialRampToValueAtTime(hz, t + .09);
      filter.type = 'lowpass';
      filter.Q.value = 7;
      filter.frequency.setValueAtTime(3400, t);
      filter.frequency.exponentialRampToValueAtTime(380, t + .4);
      amp.gain.setValueAtTime(gain, t);
      amp.gain.exponentialRampToValueAtTime(.0005, t + ring);
      osc.connect(filter).connect(amp);
      amp.connect(out); amp.connect(echo);
      osc.start(t); osc.stop(t + ring + .02);
    },
    // a round plucked bass
    bass(ctx, out, echo, t, hz, length, gain) {
      const osc = ctx.createOscillator(), amp = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = hz;
      amp.gain.setValueAtTime(gain, t);
      amp.gain.exponentialRampToValueAtTime(.0005, t + length * .95);
      osc.connect(amp).connect(out);
      osc.start(t); osc.stop(t + length);
    },
    // a dry woodblock knock
    block(ctx, out, echo, t, hz, length, gain) {
      const osc = ctx.createOscillator(), amp = ctx.createGain();
      osc.frequency.setValueAtTime(hz, t);
      osc.frequency.exponentialRampToValueAtTime(hz * .7, t + .05);
      amp.gain.setValueAtTime(gain, t);
      amp.gain.exponentialRampToValueAtTime(.0005, t + .06);
      osc.connect(amp).connect(out);
      osc.start(t); osc.stop(t + .07);
    },
  };
  // like the mp3: starts on the first gesture, follows the sound button and pauses with the tab
  let synth = null;
  function startSong(song) {
    song.byBar = Array.from({ length: song.bars }, () => []);
    for (const part of song.parts) for (const note of part.notes) song.byBar[Math.floor(note[0] / song.meter) % song.bars].push([part, note]);
    synth = { song, ctx: null, level: 1, fade: .5, muted: false, target: null };
    const start = () => {
      if (synth.ctx) { if (synth.ctx.state === 'suspended') synth.ctx.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = synth.ctx = new AC();
      synth.out = ctx.createGain();
      synth.out.gain.value = 0;
      synth.out.connect(ctx.destination);
      // a feedback echo, like a wide canyon
      synth.echo = ctx.createGain();
      const delay = ctx.createDelay(1), feedback = ctx.createGain(), damp = ctx.createBiquadFilter();
      delay.delayTime.value = song.echo || .3;
      feedback.gain.value = .35;
      damp.type = 'lowpass';
      damp.frequency.value = 2200;
      synth.echo.connect(delay).connect(damp).connect(feedback).connect(delay);
      damp.connect(synth.out);
      synth.at = ctx.currentTime + .15;
      synth.bar = 0;
      setInterval(tickSong, 100);
      tickSong();
    };
    for (const kind of ['pointerdown', 'keydown']) document.addEventListener(kind, start);
    document.getElementById('mute').addEventListener('click', () => { synth.muted = !synth.muted; tickSong(); });
    document.addEventListener('visibilitychange', () => {
      if (!synth.ctx) return;
      if (document.hidden) synth.ctx.suspend();
      else synth.ctx.resume();
    });
  }
  // fades a synth song, for example to silence it under a sound cue the player must hear
  function setMusicLevel(level, seconds = .5) {
    if (!synth) return;
    synth.level = level;
    synth.fade = seconds;
    tickSong();
  }
  // schedules whole bars about a second ahead, and follows the level and the sound button
  function tickSong() {
    const { song, ctx, out } = synth;
    if (!ctx) return;
    const level = synth.muted ? 0 : synth.level * MUSIC_VOLUME * (song.volume == null ? 1 : song.volume);
    if (level !== synth.target) {
      synth.target = level;
      out.gain.setTargetAtTime(level, ctx.currentTime, Math.max(.01, synth.fade / 3));
    }
    const beat = 60 / song.bpm;
    while (synth.at < ctx.currentTime + 1) {
      for (const [part, [at, length, midi, velocity = 1]] of song.byBar[synth.bar]) {
        const hz = 440 * Math.pow(2, (midi - 69) / 12);
        INSTRUMENTS[part.instrument](ctx, out, synth.echo, synth.at + (at % song.meter) * beat, hz, length * beat, part.gain * velocity);
      }
      synth.at += song.meter * beat;
      synth.bar = (synth.bar + 1) % song.bars;
    }
  }
  return { mount, GAMES, melody, setMusicLevel };
})();
