"use strict";
/* =====================================================================
   Город гаснущих фонарей — ядро: утилиты, настройки, ввод, звук.
   Все файлы игры — обычные <script>, общие переменные видны между ними.
   ===================================================================== */
const VERSION = 'Бета 0.2';
const $ = id => document.getElementById(id);
const T = 32; let VW = 960, VH = 540;     // VW/VH подстраиваются под экран телефона в fitStage()
let HUD = {t:0, r:0, b:0, l:0};          // отступы HUD от кнопок Telegram/выреза, в единицах кадра

// ---- Физика. Подкручивай здесь. ----
const STEP = 1/120;
const G = 2450, FALL_MULT = 1.3, MAX_FALL = 1150;
const JUMP = 905, JUMP_CUT = 390, DJUMP = 810;
const WALK = 245, SPRINT = 330;
const ACC_GROUND = 4400, ACC_AIR = 3700, DECEL = 6400, SKID = 2.2;
const COYOTE = .12, BUFFER = .16, CORNER = 14;
const ASSIST = {coyote:.19, buffer:.22, cut:470};
const HITSTOP_STOMP = .065, HITSTOP_HURT = .11, HITSTOP_PICK = .04;

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
let storeHook = null;
const store = { get(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }, set(k,v){ try { localStorage.setItem(k,v); } catch(e){} if (storeHook) storeHook(k, v); } };
const rnd = (a,b) => a + Math.random()*(b-a);
const pick = a => a[Math.floor(Math.random()*a.length)];
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const lerp = (a,b,t) => a + (b-a)*t;
const approach = (v,t,d) => v < t ? Math.min(t, v+d) : Math.max(t, v-d);
const hash = (a,b,c) => (((a*73856093) ^ (b*19349663) ^ (c*83492791)) >>> 0);
const mk = (w,h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
const SANS = 'Nunito, system-ui, sans-serif', SERIF = 'Lora, Georgia, serif';
const INK = '#231C2B';
const TEXT_CPS = {slow:26, normal:46, fast:95, instant:100000};

/* ================= Настройки ================= */
const KEY_DEF = {
  left:['ArrowLeft','KeyA'], right:['ArrowRight','KeyD'], jump:['Space','ArrowUp'], down:['ArrowDown','KeyS'],
  sprint:['ShiftLeft','ShiftRight'], pause:['Escape','KeyP'], journal:['KeyJ','']
};
const ACTIONS = [['left','Влево'],['right','Вправо'],['jump','Прыжок'],['down','Вниз / спрыгнуть'],['sprint','Бег'],['pause','Пауза'],['journal','Журнал']];
const SET_DEF = {music:.7, sfx:.8, text:'normal', auto:false, shake:true, vibro:true, assist:true, hints:true,
  touchUI:'auto', tcSize:1, tcAlpha:.55, tcLayout:'std', tcPos:null, keys:null};
const SET = Object.assign({}, SET_DEF, (() => { try { return JSON.parse(store.get('nz.settings') || '{}'); } catch(e){ return {}; } })());
function keyMap(){ const k = {}; for (const a in KEY_DEF) k[a] = (SET.keys && SET.keys[a]) ? SET.keys[a].slice(0, 2) : KEY_DEF[a].slice(); return k; }
let KEYS = keyMap();
function saveSettings(){ store.set('nz.settings', JSON.stringify(SET)); KEYS = keyMap(); applyVolumes(); }
const KEY_NAMES = {Space:'Пробел', ArrowLeft:'←', ArrowRight:'→', ArrowUp:'↑', ArrowDown:'↓', ShiftLeft:'Shift', ShiftRight:'Shift (пр.)',
  ControlLeft:'Ctrl', ControlRight:'Ctrl (пр.)', AltLeft:'Alt', AltRight:'Alt (пр.)', Enter:'Enter', Escape:'Esc', Tab:'Tab', Backspace:'⌫',
  Semicolon:';', Quote:"'", Comma:',', Period:'.', Slash:'/', BracketLeft:'[', BracketRight:']', Backslash:'\\', Minus:'-', Equal:'=', Backquote:'`'};
function keyName(code){
  if (!code) return '—';
  if (KEY_NAMES[code]) return KEY_NAMES[code];
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Numpad')) return 'Num ' + code.slice(6);
  return code;
}
const keyLabel = a => keyName(KEYS[a][0] || KEYS[a][1]);

/* ================= Ввод ================= */
// Клавиатура: keys[code]; экранные кнопки: touch[action]. Действия читаются через isLeft()/isJump()/…
const keys = {}, touch = {left:false, right:false, jump:false, down:false};
let jumpQueued = false, advanceQueued = false;
// Каким вводом человек пользуется сейчас: 'touch' или 'kb'. От этого зависят экранные кнопки и подсказки.
let lastInput = null;
const down = a => KEYS[a].some(c => c && keys[c]);
const isLeft = () => down('left') || touch.left;
const isRight = () => down('right') || touch.right;
const isJump = () => down('jump') || touch.jump;
const isDown = () => down('down') || touch.down;
const isSprint = () => down('sprint');
const isKey = (a, code) => KEYS[a].includes(code);
// Телефон или компьютер: в Telegram — по платформе, в браузере — по типу указателя.
function deviceIsTouch(){
  if (TG.on){ const p = TG.app.platform || ''; if (['android','android_x','ios'].includes(p)) return true; if (p) return false; }
  return matchMedia('(pointer: coarse)').matches && !matchMedia('(pointer: fine)').matches;
}
function touchUI(){
  if (SET.touchUI === 'on') return true;
  if (SET.touchUI === 'off') return false;
  return lastInput ? lastInput === 'touch' : deviceIsTouch();
}
// Касание экрана включает экранные кнопки, нажатие клавиши — выключает (в режиме «Авто»)
addEventListener('pointerdown', e => { if (e.pointerType === 'touch' || e.pointerType === 'pen') lastInput = 'touch'; }, true);

let hapticHook = null;
function buzz(ms){ if (!SET.vibro) return; if (hapticHook){ hapticHook(ms); return; } try { if (navigator.vibrate && lastInput === 'touch') navigator.vibrate(ms); } catch(e){} }

/* ================= Звук ================= */
let AC = null, master = null, musicGain = null, sfxGain = null, muted = store.get('nz.mute') === '1', noiseBuf = null;
function audio(){
  if (muted) return null;
  try {
    if (!AC){ AC = new (window.AudioContext || window.webkitAudioContext)(); master = AC.createGain(); master.gain.value = .9; master.connect(AC.destination);
      musicGain = AC.createGain(); musicGain.gain.value = .0; musicGain.connect(master);
      sfxGain = AC.createGain(); sfxGain.gain.value = SET.sfx; sfxGain.connect(master);
      noiseBuf = AC.createBuffer(1, AC.sampleRate*.5, AC.sampleRate); const d = noiseBuf.getChannelData(0); for (let i=0;i<d.length;i++) d[i] = Math.random()*2-1; }
    if (AC.state === 'suspended') AC.resume();
    return AC;
  } catch(e){ return null; }
}
function tone(f, d, type='sine', vol=.05, to=null, delay=0, dest){
  const ac = audio(); if (!ac) return;
  const t0 = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t0); if (to) o.frequency.exponentialRampToValueAtTime(to, t0+d);
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + Math.min(.012, d*.2)); g.gain.exponentialRampToValueAtTime(.0001, t0+d);
  o.connect(g).connect(dest || sfxGain); o.start(t0); o.stop(t0+d+.03);
}
function noise(d, vol=.06, freq=1800, q=.8, delay=0, type='bandpass'){
  const ac = audio(); if (!ac) return;
  const t0 = ac.currentTime + delay, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = noiseBuf; f.type = type; f.frequency.value = freq; f.Q.value = q;
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.0001, t0+d);
  s.connect(f).connect(g).connect(sfxGain); s.start(t0, Math.random()*.3); s.stop(t0+d+.02);
}
let stepAlt = 0;
const sfx = {
  step(soft){ stepAlt ^= 1; noise(.06, soft ? .05 : .09, stepAlt ? 1500 : 1150, 1.2); tone(stepAlt ? 150 : 132, .05, 'sine', .035); },
  jump(){ noise(.12, .05, 2600, .7); tone(420, .14, 'sine', .035, 640); },
  djump(){ noise(.16, .05, 3800, 1.4); tone(660, .16, 'triangle', .04, 990); tone(990, .2, 'sine', .025, 1320, .05); },
  land(h){ noise(.09, .06 + .07*h, 700, .9); tone(95, .1, 'sine', .05 + .05*h, 60); },
  skid(){ noise(.12, .04, 2400, 2); },
  stomp(){ tone(520, .08, 'triangle', .06, 260); tone(784, .12, 'sine', .05, null, .05); tone(1175, .2, 'sine', .04, null, .1); noise(.06, .06, 900, 1); },
  drop(){ const b = 1046 * Math.pow(2, Math.floor(Math.random()*4)/12); tone(b, .22, 'sine', .045); tone(b*1.5, .3, 'sine', .022, null, .03); },
  find(){ [659,784,988,1319].forEach((f,i) => tone(f, .35, 'sine', .045, null, i*.07)); },
  hurt(){ tone(330, .28, 'triangle', .07, 150); noise(.15, .06, 600, .6); },
  lamp(){ tone(523, .4, 'sine', .05); tone(784, .5, 'sine', .035, null, .08); noise(.25, .03, 3000, .5); },
  lampOut(){ tone(392, .5, 'sine', .04, 196); noise(.4, .03, 500, .5, 0, 'lowpass'); },
  crumble(){ noise(.3, .05, 2200, .5); },
  blip(){ tone(880 + Math.random()*120, .03, 'sine', .018); },
  click(){ tone(1200, .04, 'triangle', .025); },
  giggle(){ [988,1175,988,1319].forEach((f,i) => tone(f, .07, 'triangle', .03, null, i*.06)); },
  babble(){ [1319,1568,1175,1480,1760].forEach((f,i) => tone(f*(.95 + Math.random()*.1), .05, 'square', .012, null, i*.05)); },
  coo(){ tone(330, .18, 'sine', .04, 300); tone(300, .22, 'sine', .035, 330, .2); },
  rumble(){ tone(55, 1.2, 'sawtooth', .05, 38); noise(1.2, .05, 200, .6, 0, 'lowpass'); },
  unlock(){ [523,659,784,1046,1319].forEach((f,i) => tone(f, .5, 'sine', .05, null, i*.09)); },
  vanish(){ noise(.35, .05, 1200, .4); tone(700, .3, 'sine', .03, 200); },
  wind(){ noise(.5, .025, 900, .3); },
  gear(){ noise(.04, .03, 3200, 4); },
  faint(){ [440,392,349,294].forEach((f,i) => tone(f, .35, 'sine', .05, null, i*.14)); }
};
/* ================= Музыка =================
   Генеративная: у каждого трека своя гармония, инструменты и ритм, а мелодия
   собирается на ходу из коротких фраз — поэтому одно и то же место не звучит дважды одинаково.
   Форма трека: секции по 8 тактов. A — основная, B — другая гармония, C — затишье (без мелодии и ударных). */
const BPM = 84, BEAT = 60/BPM;
let musicOn = false, musicMood = 'calm';
const MODES = { major:[0,2,4,5,7,9,11], minor:[0,2,3,5,7,8,10], dorian:[0,2,3,5,7,9,10], lydian:[0,2,4,6,7,9,11],
  penta:[0,2,4,7,9], hminor:[0,2,3,5,7,8,11], phryg:[0,1,3,5,7,8,10] };
// Узоры: один символ — одна шестнадцатая. Цифра — тон аккорда (0 основной, 1 терция, 2 квинта, 3 септима, 4+ — то же октавой выше).
// Ударные: k бочка, s малый, h хэт, b щётка, t тиканье.  Мелодия: x — нота, - — тянуть, . — пауза.
const TRACKS = {
  // Главное меню: музыкальная шкатулка в три четверти
  title:{ bpm:70, meter:12, root:55, mode:'major', prog:[0,5,3,4], progB:[5,3,0,4], form:'AABC',
    pad:{w:'sine', v:.011, lp:900},
    bass:{pat:'0.....2.....', w:'sine', v:.045, len:5},
    arp:{pat:'0.1.2.4.2.1.', w:'triangle', v:.011, len:2.5},
    lead:{w:'sine', v:.022, lo:7, hi:14, rh:['x-----x---x-', 'x---x---x---', 'x-x-x-----..', '......x-x-x-']} },
  // Пролог: тёплый вечер, гармошка где-то во дворе
  calm:{ bpm:80, root:55, mode:'major', prog:[0,4,5,3], progB:[3,4,2,5], form:'AABAC', swing:.12,
    pad:{w:'triangle', v:.009, lp:1100},
    bass:{pat:'0.......2...4...', w:'triangle', v:.05, lp:500, len:3},
    arp:{pat:'..1...2...1...4.', w:'sine', v:.012, len:2},
    lead:{w:'sawtooth', v:.009, lp:1400, det:9, lo:7, hi:14, rh:['x--.x-x-x---x...', 'x---..x-x-x-x---', 'x.x.x---x--.....', 'x-x-x-x-x-------']},
    perc:'....b.......b...' },
  // Глава 1: Нижний квартал — ночной джаз подворотен
  quarter:{ bpm:92, root:50, mode:'dorian', prog:[0,3,0,3,6,3,4,0], progB:[2,3,6,0], form:'AABA', swing:.16,
    pad:{w:'square', v:.005, lp:700},
    bass:{pat:'0...1...2...3...', w:'triangle', v:.055, lp:700, len:3.5},
    lead:{w:'square', v:.011, lp:1800, det:6, lo:7, hi:15, rh:['x.x...x-x...x-..', '..x-x.x...x-x---', 'x---x-..x.x.x---', 'x-x.....x-x-x...']},
    perc:'k...b.h.k.k.b.h.' },
  // Погоня за Жулей
  chase:{ bpm:132, root:52, mode:'minor', prog:[0,5,6,0,0,5,3,4], progB:[3,5,6,4], form:'AABA',
    bass:{pat:'0.0.0.00.0.0.40.', w:'sawtooth', v:.034, lp:500, len:1},
    arp:{pat:'0124012401240124', w:'square', v:.007, lp:2400, len:.8},
    lead:{w:'sawtooth', v:.011, lp:2000, lo:7, hi:14, rh:['x-x-x-x-x---x-x-', 'x---x---x-x-x---', 'x.x.x.x.x-x-x-..']},
    perc:'k.h.s.h.k.k.s.hh' },
  // Поднимается Мгла — тревожный пульс
  escape:{ bpm:120, root:57, mode:'phryg', prog:[0,1,0,6], progB:[5,1,0,0], form:'AAB',
    pad:{w:'sawtooth', v:.007, lp:600},
    bass:{pat:'0..0..0.0..0..0.', w:'sawtooth', v:.045, lp:320, len:1.5},
    arp:{pat:'0.1.2.1.0.1.4.1.', w:'square', v:.006, lp:1600, len:1},
    lead:{w:'sine', v:.017, lo:7, hi:12, rh:['x-------x-------', 'x---x---x-------', '........x---x---']},
    perc:'k..k..k.k..k..s.' },
  // Глава 2: Часовая башня — пиццикато и тиканье
  clock:{ bpm:100, root:53, mode:'dorian', prog:[0,3,0,6], progB:[2,6,3,4], form:'AABAC',
    pad:{w:'triangle', v:.006, lp:900},
    bass:{pat:'0...2...0...2...', w:'triangle', v:.05, lp:600, len:1.5},
    arp:{pat:'0.2.1.2.0.2.1.4.', w:'triangle', v:.016, lp:3000, len:.5},
    lead:{w:'triangle', v:.014, lo:7, hi:14, rh:['x-..x-..x-x-x---', 'x.x.x-..x.x.x---', 'x---x---x-x-x-x-']},
    perc:'t...b...t...b...' },
  // Глава 3: над облаками — воздух и колокольчики
  sky:{ bpm:70, root:55, mode:'penta', prog:[0,3,1,2], progB:[2,3,0,0], form:'AABC',
    pad:{w:'sine', v:.012, lp:1500},
    bass:{pat:'0...............', w:'sine', v:.045, len:14},
    arp:{pat:'0..1..2..4..2...', w:'sine', v:.012, len:4},
    lead:{w:'sine', v:.02, lo:5, hi:12, rh:['x-----x---x-----', 'x---x---x-------', '........x---x---']} },
  // Грустные сцены: фортепиано под дождём
  sad:{ bpm:62, root:57, mode:'hminor', prog:[0,5,3,4], progB:[3,0,5,4], form:'AB',
    pad:{w:'sine', v:.008, lp:800},
    bass:{pat:'0.......4.......', w:'sine', v:.04, len:7},
    arp:{pat:'0...1...2...1...', w:'triangle', v:.016, lp:1800, len:3},
    lead:{w:'sine', v:.02, lo:7, hi:14, rh:['x-----x-x-------', 'x---x---x-----..', '....x---x---x---']} },
  // Большой фонарь зажжён и финал
  hope:{ bpm:84, root:53, mode:'lydian', prog:[0,1,5,4], progB:[5,4,1,0], form:'AABA',
    pad:{w:'triangle', v:.01, lp:1400},
    bass:{pat:'0.......0...2...', w:'triangle', v:.05, lp:600, len:3},
    arp:{pat:'0.1.2.4.2.4.6.4.', w:'triangle', v:.011, len:1.5},
    lead:{w:'triangle', v:.02, lo:7, hi:15, rh:['x---x-x-x-------', 'x-x-x---x---x---', 'x-----x-x-x-x---']},
    perc:'....b.......b...' }
};
const M = {name:'', step:0, next:0, phrase:null};
let mBus = null;
function musicBus(){
  if (mBus) return mBus;
  // Эхо на музыкальной шине — даёт «воздух» и глубину
  const dry = AC.createGain(), del = AC.createDelay(1), fb = AC.createGain(), wet = AC.createGain(), lp = AC.createBiquadFilter();
  del.delayTime.value = .36; fb.gain.value = .3; wet.gain.value = .26; lp.type = 'lowpass'; lp.frequency.value = 2400;
  dry.connect(musicGain); dry.connect(del); del.connect(lp); lp.connect(fb); fb.connect(del); lp.connect(wet); wet.connect(musicGain);
  return mBus = {dry, del};
}
function mrng(a){ return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function mfreq(tr, d){ const m = MODES[tr.mode], L = m.length, o = Math.floor(d / L), i = ((d % L) + L) % L; return 440 * Math.pow(2, (tr.root + m[i] + 12*o - 69)/12); }
function mSection(tr, bar){ return tr.form[Math.floor(bar/8) % tr.form.length]; }
function mChord(tr, bar){ const p = mSection(tr, bar) === 'B' && tr.progB ? tr.progB : tr.prog; return p[bar % p.length]; }
function mTone(tr, ch, k){ return ch + [0,2,4,6][k % 4] + Math.floor(k/4)*MODES[tr.mode].length; }
function mVoice(f, t0, d, o){
  const osc = AC.createOscillator(), g = AC.createGain(), a = Math.min(o.a || .008, d*.5), v = (o.v || .03) * (.88 + Math.random()*.24);
  osc.type = o.w || 'sine'; osc.frequency.setValueAtTime(f, t0); if (o.det) osc.detune.value = o.det; if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + d);
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(v, t0 + a);
  if (o.sus){ g.gain.setValueAtTime(v, t0 + Math.max(a, d*.6)); g.gain.linearRampToValueAtTime(.0001, t0 + d); }
  else g.gain.exponentialRampToValueAtTime(.0001, t0 + d);
  let node = osc; if (o.lp){ const fl = AC.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.lp; osc.connect(fl); node = fl; }
  node.connect(g); g.connect(musicBus().dry); osc.start(t0); osc.stop(t0 + d + .05);
}
function mPerc(kind, t0){
  if (kind === 'k'){ mVoice(110, t0, .26, {w:'sine', v:.08, a:.003, to:42}); return; }
  const P = {h:['highpass',7000,.05,.016], s:['bandpass',1800,.16,.035], t:['bandpass',3800,.03,.03], b:['bandpass',2500,.1,.015]}[kind]; if (!P) return;
  const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
  s.buffer = noiseBuf; f.type = P[0]; f.frequency.value = P[1]; g.gain.setValueAtTime(P[3]*(.8 + Math.random()*.4), t0); g.gain.exponentialRampToValueAtTime(.0001, t0 + P[2]);
  s.connect(f); f.connect(g); g.connect(musicBus().dry); s.start(t0, Math.random()*.3); s.stop(t0 + P[2] + .02);
}
// Фраза мелодии на 2 такта. 4 разные фразы чередуются, через 32 такта набор фраз меняется.
function mPhrase(tr, bar){
  const p0 = bar - bar % 2, key = M.name + ':' + p0;
  if (M.phrase && M.phrase.key === key) return M.phrase.notes;
  const L = tr.meter || 16, Lm = MODES[tr.mode].length, ld = tr.lead, notes = {};
  const R = mrng((Math.floor(p0/2) % 4) * 7919 + Math.floor(p0/32) * 104729 + tr.bpm * 31 + 1);
  let p = Math.round((ld.lo + ld.hi)/2);
  for (let b = 0; b < 2; b++){
    const rh = ld.rh[Math.floor(R()*ld.rh.length)], ch = mChord(tr, p0 + b);
    for (let i = 0; i < L; i++){
      if (rh[i] !== 'x') continue;
      if (i % 4 === 0){ let best = p, bd = 99; // на сильной доле — тон аккорда, ближайший к прошлой ноте
        for (let o = -2; o <= 3; o++) for (const k of [0,2,4]){ const q = ch + k + o*Lm; if (q >= ld.lo && q <= ld.hi && Math.abs(q - p) < bd){ bd = Math.abs(q - p); best = q; } }
        p = best; }
      else p = clamp(p + [-2,-1,-1,1,1,2][Math.floor(R()*6)], ld.lo, ld.hi);
      let len = 1; while (i + len < L && rh[i + len] === '-') len++;
      notes[b*L + i] = [p, len];
    }
  }
  M.phrase = {key, notes}; return notes;
}
function mStep(tr, n, t, sd){
  const L = tr.meter || 16, bar = Math.floor(n / L), i = n % L, sec = mSection(tr, bar), ch = mChord(tr, bar), Lm = MODES[tr.mode].length;
  if (i === 0 && tr.pad) for (let k = 0; k < 3; k++)
    mVoice(mfreq(tr, ch + k*2), t, L*sd*1.08, {w:tr.pad.w, v:tr.pad.v, a:L*sd*.35, sus:1, lp:tr.pad.lp, det:(k - 1)*7});
  const bz = tr.bass, bc = bz && bz.pat[i];
  if (bc && bc !== '.') mVoice(mfreq(tr, mTone(tr, ch, +bc) - Lm), t, sd*(bz.len || 2), {w:bz.w, v:bz.v, lp:bz.lp});
  const ar = tr.arp, ac = ar && ar.pat[i];
  if (ac && ac !== '.') mVoice(mfreq(tr, mTone(tr, ch, +ac) + Lm), t, sd*(ar.len || 1.5), {w:ar.w, v:ar.v, lp:ar.lp});
  if (sec === 'C' || bar < 2) return; // затишье и вступление трека — без мелодии и ударных
  if (tr.perc){ const pc = tr.perc[i]; if (pc !== '.') mPerc(pc, t); }
  if (tr.lead){ const nt = mPhrase(tr, bar)[(bar % 2)*L + i];
    if (nt){ const f = mfreq(tr, nt[0]), d = sd*nt[1]*1.1 + .08, o = {w:tr.lead.w, v:tr.lead.v, lp:tr.lead.lp, a:.02};
      if (tr.lead.det){ mVoice(f, t, d, {...o, det:-tr.lead.det}); mVoice(f, t, d, {...o, det:tr.lead.det}); } else mVoice(f, t, d, o); } }
}
function musicTick(){
  if (!musicOn || !AC || muted) return;
  const tr = TRACKS[musicMood] || TRACKS.calm, now = AC.currentTime, sd = 60/tr.bpm/4;
  if (M.name !== musicMood){ M.name = musicMood; M.step = 0; M.phrase = null; M.next = Math.max(M.next, now + .05);
    musicBus().del.delayTime.setValueAtTime(sd*3, now); }
  if (M.next < now) M.next = now + .05;
  while (M.next < now + .25){
    mStep(tr, M.step, M.next, sd);
    M.next += tr.swing ? sd*(M.step % 2 ? 1 - tr.swing : 1 + tr.swing) : sd; M.step++;
  }
}
function setMusic(on, mood){ musicOn = on; if (mood) musicMood = mood; const ac = audio(); if (!ac) return;
  musicGain.gain.cancelScheduledValues(ac.currentTime); musicGain.gain.setValueAtTime(musicGain.gain.value, ac.currentTime);
  musicGain.gain.linearRampToValueAtTime(on ? 1.25*SET.music : 0, ac.currentTime + 1.2); }
function applyVolumes(){ if (!AC) return; sfxGain.gain.value = SET.sfx; if (musicOn) musicGain.gain.setValueAtTime(1.25*SET.music, AC.currentTime); }
function toggleMute(){ muted = !muted; store.set('nz.mute', muted ? '1' : '0'); $('mute').textContent = muted ? '✕' : '♪';
  if (AC){ master.gain.value = muted ? 0 : .9; } if (!muted){ audio(); if (master) master.gain.value = .9; } }

/* ================= Telegram (состояние; инициализация — в ui.js) ================= */
const TG = { app:null, on:false, fs:false };
