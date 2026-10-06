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
// Генеративная музыкальная шкатулка
const BPM = 84, BEAT = 60/BPM;
const SCALE = [220, 246.94, 261.63, 293.66, 329.63, 392, 440, 493.88, 523.25, 587.33, 659.25];
let musicOn = false, nextBeat = 0, beatIdx = 0, musicMood = 'calm';
const PATTERNS = {
  calm:  [0,4,7,4, 2,5,8,5, 0,4,9,7, 3,5,8,6],
  chase: [0,4,7,4, 2,5,8,5, 0,4,9,7, 3,5,8,6],
  escape:[0,3,5,3, 1,4,6,4, 0,3,7,5, 2,4,6,5],
  clock: [0,7,4,7, 2,7,5,7, 0,7,4,9, 3,7,5,8],
  sky:   [4,7,9,7, 5,8,10,8, 4,7,9,6, 3,6,8,7],
  sad:   [0,2,4,2, 1,3,5,3, 0,2,6,4, 1,3,4,2]
};
function musicTick(){
  if (!musicOn || !AC || muted) return;
  const now = AC.currentTime, pat = PATTERNS[musicMood] || PATTERNS.calm;
  if (nextBeat < now) nextBeat = now + .05;
  while (nextBeat < now + .2){
    const i = beatIdx % 16, tense = musicMood === 'chase' || musicMood === 'escape';
    const n = SCALE[pat[i] + (tense && i % 4 === 3 ? 1 : 0)];
    const d = nextBeat - now;
    tone(n*2, .9, 'sine', .028, null, d, musicGain); tone(n*4, .4, 'triangle', .008, null, d, musicGain);
    if (i % 4 === 0) tone(SCALE[pat[i]]/2, 2.4, 'sine', .03, null, d, musicGain);
    if ((tense && i % 2 === 1) || (musicMood === 'clock' && i % 2 === 0)){ const t0 = AC.currentTime + d; const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
      s.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = musicMood === 'clock' ? 4200 : 6000; g.gain.setValueAtTime(.022, t0); g.gain.exponentialRampToValueAtTime(.0001, t0+.05);
      s.connect(f).connect(g).connect(musicGain); s.start(t0); s.stop(t0+.06); }
    nextBeat += BEAT * (tense ? .5 : musicMood === 'sad' ? 1.4 : 1); beatIdx++;
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
