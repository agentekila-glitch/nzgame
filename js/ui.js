"use strict";
/* =====================================================================
   Интерфейс: вступление, меню, настройки, управление, Telegram, раскладка, цикл.
   ===================================================================== */
const SCREENS = ['title','pause','settings','about','end','confirm','chapters','play','chars'];
// куда ведёт «Назад» с каждого экрана меню
const BACK_TO = {about:'title', play:'title', chars:'title', chapters:'play'};
let settingsFrom = 'title', confirmFrom = 'title', confirmYes = null;
function hideScreens(){ for (const id of SCREENS) $(id).hidden = true; $('stage').classList.remove('inmenu'); }
const menuOpen = () => SCREENS.some(id => !$(id).hidden) || journalOpen || tcEditing;
function focusFirst(id){ if (lastInput === 'touch') return; setTimeout(() => { const b = [...$(id).querySelectorAll('button:not([hidden])')].find(b => b.offsetParent !== null); if (b) b.focus(); }, 30); }
function showScreen(id){ for (const s of SCREENS) $(s).hidden = s !== id; $('stage').classList.add('inmenu'); focusFirst(id); }
let toastT = 0;
function toast(msg){ const t = $('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2200); }
const fmtTime = s => { s = Math.floor(s); return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; };

/* ================= Главное меню ================= */
function showMenu(){
  const prog = readProgress(), d = readSave();
  S = newState(clamp(d ? d.ch : prog.unlocked, 0, CHAPTERS.length - 1)); G1.S = S; LAYERS = null; G1.paused = false; $('dlg').classList.remove('on');
  journalOpen = false; $('journal').hidden = true;
  showScreen('title');
  $('mContinue').hidden = !d;
  const info = d ? `${CHAPTERS[d.ch].label}. ${CHAPTERS[d.ch].title}` : '';
  if (d) $('mContInfo').textContent = info + (d.play ? ' · ' + Math.max(1, Math.round(d.play/60)) + ' мин' : '');
  $('mPlayInfo').textContent = d ? 'Продолжить: ' + info : 'Начать историю';
  const open = Math.min(prog.unlocked, CHAPTERS.length - 1) + 1;
  $('mChInfo').textContent = `Открыто ${open} из ${CHAPTERS.length}`;
  setMusic(true, 'menu');
}
// Фразы жителей под названием в меню — сменяются сами (без спойлеров)
const MENU_QUOTES = [
  ['Фонари сами не гаснут.', 'так говорят в городе'],
  ['Будущее бесплатно. Чай — нет.', 'Мико'],
  ['Колено. К дождю.', 'Тимофей'],
  ['Курлы.', 'Генерал'],
  ['Вешка, не лезь в фонарь!', 'Черри'],
  ['Под ноги смотри, не на звёзды.', 'Тимофей'],
  ['Мгла была всегда. Сколько себя помню — была.', 'горожанин'],
  ['Карты не врут. Они преувеличивают.', 'Мико'],
  ['Ли-ла!', 'болтунчик']
];
let quoteI = Math.floor(Math.random()*MENU_QUOTES.length);
function nextQuote(){
  const el = $('mQuote'); if (!el) return; el.style.opacity = 0;
  setTimeout(() => { const [q, who] = MENU_QUOTES[quoteI = (quoteI + 1) % MENU_QUOTES.length]; el.innerHTML = `«${q}» <span>— ${who}</span>`; el.style.opacity = 1; }, 600);
}
nextQuote(); setInterval(() => { if (!$('title').hidden) nextQuote(); }, 7000);
function openPause(){ if (!S || S.mode !== 'play' || menuOpen()) return; G1.paused = true; showScreen('pause'); $('pauseCh').textContent = `${curCh().label}. ${curCh().title}`; for (const k in keys) keys[k] = false; sfx.blip(); }
function closePause(){ hideScreens(); G1.paused = false; jumpQueued = false; advanceQueued = false; }
function askConfirm(text, yesLabel, onYes, from){ confirmFrom = from; confirmYes = onYes; $('cText').textContent = text; $('cYes').textContent = yesLabel; showScreen('confirm'); }
$('cYes').addEventListener('click', () => { const f = confirmYes; confirmYes = null; if (f) f(); });
$('cNo').addEventListener('click', () => showScreen(confirmFrom));
$('mNew').addEventListener('click', () => {
  const go = () => { store.set(SKEY, 'null'); startChapter(0); };
  if (readSave()) askConfirm('Начать заново? Текущее сохранение будет заменено. Открытые главы и персонажи останутся.', 'Начать заново', go, 'play'); else go();
});
$('mContinue').addEventListener('click', () => { const d = readSave(); if (d && d.flags && d.flags.fresh) startChapter(d.ch); else loadGame(); });
$('mChapters').addEventListener('click', () => { renderChapters(); showScreen('chapters'); });
$('mPlay').addEventListener('click', () => showScreen('play'));
$('playBack').addEventListener('click', () => showScreen('title'));
$('mChars').addEventListener('click', () => { renderChars(); showScreen('chars'); });
$('charsBack').addEventListener('click', () => { if (!$('charInfo').hidden) renderChars(); else showScreen('title'); });
$('mSettings').addEventListener('click', () => openSettings('title'));
$('mAbout').addEventListener('click', () => showScreen('about'));
$('aBack').addEventListener('click', () => showScreen('title'));
$('chBack').addEventListener('click', () => showScreen('play'));
$('aWipe').addEventListener('click', () => askConfirm('Стереть весь прогресс, открытые главы и журнал? Это нельзя отменить.', 'Стереть', () => {
  store.set(SKEY, 'null'); store.set(PKEY, JSON.stringify({unlocked:0})); store.set(JKEY, ''); Journal.data = {order:[], scenes:{}}; toast('Прогресс стёрт'); showMenu(); }, 'about'));
function renderChapters(){
  // Глава открывается, когда пройдена предыдущая. Закрытые видно, но выбрать нельзя.
  const el = $('chList'), prog = readProgress(); el.innerHTML = '';
  CHAPTERS.forEach((ch, i) => {
    const open = i <= prog.unlocked, done = chapterDone(ch.id), prev = CHAPTERS[i - 1];
    const b = document.createElement('button'); b.className = 'chcard' + (open ? '' : ' locked') + (done ? ' done' : '');
    const why = i - 1 === prog.unlocked ? `Пройди «${prev.title}», чтобы открыть` : 'Сначала пройди предыдущие главы';
    b.innerHTML = `<small>${ch.label}${done ? ' · пройдена ✓' : ''}</small><b>${open ? ch.title : '🔒 Закрыта'}</b><span>${open ? ch.sub : why}</span>`;
    b.disabled = !open;
    b.addEventListener('click', () => askConfirm(`Начать «${ch.title}» с начала? Текущее сохранение будет заменено.`, 'Играть', () => startChapter(i), 'chapters'));
    el.appendChild(b);
  });
}
// пауза
$('pResume').addEventListener('click', closePause);
$('pJournal').addEventListener('click', () => openJournal());
$('pSettings').addEventListener('click', () => openSettings('pause'));
$('pLamp').addEventListener('click', () => { closePause(); respawn(); toast('Ая вернулась к фонарю'); });
$('pMenu').addEventListener('click', () => { if (S.mode === 'play') saveGame(true); showMenu(); });
$('pbtn').addEventListener('click', e => { e.currentTarget.blur(); openPause(); });
$('mute').addEventListener('click', e => { toggleMute(); e.currentTarget.blur(); });
$('mute').textContent = muted ? '✕' : '♪';

/* ================= Итоги главы ================= */
function showEnd(){
  const ch = curCh(), last = S.ch >= CHAPTERS.length - 1, fk = FIND_KINDS[ch.find];
  $('endKick').textContent = `${ch.label} пройдена`; $('endTitle').textContent = ch.title;
  $('endSub').textContent = ch.endSub || '';
  $('stFind').textContent = fk ? `${S.finds}/${S.W.finds.length}` : '—'; $('stFindL').textContent = fk ? fk.many.toLowerCase() : 'находок';
  $('stDrops').textContent = S.drops; $('stFaint').textContent = S.faints; $('stTime').textContent = fmtTime(S.play);
  $('endNote').innerHTML = ch.endNote || ''; $('endNote').hidden = !ch.endNote;
  $('endNext').textContent = last ? 'В главное меню' : `Дальше: ${CHAPTERS[S.ch + 1].title}`;
  const fin = last ? 'Продолжение следует.' : (ch.partEnd || ''); $('endFinal').textContent = fin; $('endFinal').hidden = !fin;
  showScreen('end');
}
$('endNext').addEventListener('click', () => { if (S.ch >= CHAPTERS.length - 1) showMenu(); else startChapter(S.ch + 1); });
$('endMenu').addEventListener('click', showMenu);

/* ================= Журнал ================= */
function openJournal(){ if (journalOpen) return; journalOpen = true; Journal.render(); $('journal').hidden = false; sfx.blip(); }
function closeJournal(){ journalOpen = false; $('journal').hidden = true; for (const k in keys) keys[k] = false; jumpQueued = false; advanceQueued = false; }
$('jbtn').addEventListener('click', e => { e.stopPropagation(); e.currentTarget.blur(); journalOpen ? closeJournal() : openJournal(); });
$('logBtn').addEventListener('pointerdown', e => e.stopPropagation());
$('logBtn').addEventListener('click', e => { e.stopPropagation(); e.currentTarget.blur(); openJournal(); });
$('skipBtn').addEventListener('pointerdown', e => e.stopPropagation());
$('skipBtn').addEventListener('click', e => { e.stopPropagation(); e.currentTarget.blur(); skipScene(); });
$('jclose').addEventListener('click', e => { e.stopPropagation(); closeJournal(); });
$('journal').addEventListener('pointerdown', e => { e.stopPropagation(); if (e.target.id === 'journal') closeJournal(); });

/* ================= Настройки ================= */
function openSettings(from){ settingsFrom = from; showScreen('settings'); syncSettings(); }
function closeSettings(){ showScreen(settingsFrom); }
function setTab(name){ for (const b of document.querySelectorAll('.tabs button')) b.classList.toggle('on', b.dataset.tab === name);
  for (const p of document.querySelectorAll('.tabpanel')) p.hidden = p.dataset.tab !== name; }
document.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => { setTab(b.dataset.tab); sfx.blip(); }));
function segSync(id, val){ for (const b of $(id).children) b.classList.toggle('on', b.dataset.v === String(val)); }
function syncSettings(){
  $('sMusic').value = Math.round(SET.music*100); $('oMusic').textContent = $('sMusic').value;
  $('sSfx').value = Math.round(SET.sfx*100); $('oSfx').textContent = $('sSfx').value;
  segSync('sText', SET.text); segSync('sTouchUI', SET.touchUI); segSync('sTcLayout', SET.tcLayout);
  $('sAuto').checked = SET.auto; $('sAssist').checked = SET.assist; $('sShake').checked = SET.shake; $('sVibro').checked = SET.vibro; $('sHints').checked = SET.hints;
  $('sTcSize').value = Math.round(SET.tcSize*100); $('oTcSize').textContent = $('sTcSize').value + '%';
  $('sTcAlpha').value = Math.round(SET.tcAlpha*100); $('oTcAlpha').textContent = $('sTcAlpha').value + '%';
  $('devNow').textContent = deviceIsTouch() ? 'телефон — кнопки на экране' : 'компьютер — клавиатура';
  renderKeys(); applyTouchLayout();
}
$('sMusic').addEventListener('input', e => { SET.music = e.target.value/100; $('oMusic').textContent = e.target.value; saveSettings(); });
$('sSfx').addEventListener('input', e => { SET.sfx = e.target.value/100; $('oSfx').textContent = e.target.value; saveSettings(); });
$('sSfx').addEventListener('change', () => sfx.drop());
for (const [id, key] of [['sText','text'],['sTouchUI','touchUI'],['sTcLayout','tcLayout']])
  for (const b of $(id).children) b.addEventListener('click', () => { SET[key] = b.dataset.v; if (key === 'tcLayout') SET.tcPos = null; saveSettings(); syncSettings(); sfx.blip(); });
for (const [id, key] of [['sAuto','auto'],['sAssist','assist'],['sShake','shake'],['sVibro','vibro'],['sHints','hints']])
  $(id).addEventListener('change', e => { SET[key] = e.target.checked; saveSettings(); sfx.blip(); });
$('sTcSize').addEventListener('input', e => { SET.tcSize = e.target.value/100; $('oTcSize').textContent = e.target.value + '%'; saveSettings(); applyTouchLayout(); });
$('sTcAlpha').addEventListener('input', e => { SET.tcAlpha = e.target.value/100; $('oTcAlpha').textContent = e.target.value + '%'; saveSettings(); applyTouchLayout(); });
$('sTcMove').addEventListener('click', () => startTcEdit());
$('sTcReset').addEventListener('click', () => { SET.tcPos = null; SET.tcSize = 1; SET.tcAlpha = SET_DEF.tcAlpha; saveSettings(); syncSettings(); toast('Кнопки на прежних местах'); });
$('sReset').addEventListener('click', () => { const keep = {keys:SET.keys, tcPos:SET.tcPos}; Object.assign(SET, SET_DEF, keep); saveSettings(); syncSettings(); toast('Настройки сброшены'); });
$('sDone').addEventListener('click', closeSettings);

// ---- Переназначение клавиш
let rebinding = null; // {action, slot, el}
function renderKeys(){
  const el = $('keyList'); el.innerHTML = '';
  for (const [a, label] of ACTIONS){
    const row = document.createElement('div'); row.className = 'krow';
    row.innerHTML = `<span>${label}</span>`;
    for (let slot=0; slot<2; slot++){ const b = document.createElement('button'); b.className = 'kbtn'; b.textContent = keyName(KEYS[a][slot]);
      b.addEventListener('click', () => { if (rebinding) rebinding.el.classList.remove('wait'); rebinding = {action:a, slot, el:b}; b.textContent = 'Нажмите клавишу…'; b.classList.add('wait'); });
      row.appendChild(b); }
    el.appendChild(row);
  }
}
addEventListener('keydown', e => {
  if (!rebinding) return;
  e.preventDefault(); e.stopImmediatePropagation();
  const {action, slot} = rebinding; rebinding = null;
  if (e.code === 'Escape' && !(action === 'pause' && slot === 0)){ renderKeys(); return; }
  const k = keyMap(); const code = e.code === 'Backspace' ? '' : e.code;
  if (code) for (const a in k) k[a] = k[a].map(c => c === code ? '' : c);
  k[action][slot] = code; SET.keys = k; saveSettings(); renderKeys(); sfx.click();
}, true);
$('kReset').addEventListener('click', () => { SET.keys = null; saveSettings(); renderKeys(); toast('Клавиши по умолчанию'); });

/* ================= Экранные кнопки ================= */
// Позиции — в долях «безопасной» области кадра (без выреза и кнопок Telegram)
const TC_STD = {left:[.09,.8], right:[.22,.8], down:[.78,.84], jump:[.91,.72]};
function tcPos(k){ const p = SET.tcPos && SET.tcPos[k]; if (p) return p; const d = TC_STD[k]; return SET.tcLayout === 'left' ? [1 - d[0], d[1]] : d; }
let HUDPX = {t:0, r:0, b:0, l:0};
function applyTouchLayout(){
  const st = $('stage'), W = st.clientWidth || 960, H = st.clientHeight || 540;
  const sw = W - HUDPX.l - HUDPX.r, sh = H - HUDPX.t - HUDPX.b;
  const base = clamp(Math.min(W, H*1.8) * .1, 64, 104) * SET.tcSize;
  st.style.setProperty('--tcs', base + 'px'); st.style.setProperty('--tca', SET.tcAlpha);
  for (const b of document.querySelectorAll('#touch .tb')){ const [x, y] = tcPos(b.dataset.k);
    b.style.left = (HUDPX.l + sw*x) + 'px'; b.style.top = (HUDPX.t + sh*y) + 'px'; }
}
const tcPointers = new Map();
function tcButtonAt(cx, cy){
  let best = null, bd = 1e9;
  for (const b of document.querySelectorAll('#touch .tb')){ const r = b.getBoundingClientRect(), x = r.left + r.width/2, y = r.top + r.height/2, d = Math.hypot(cx - x, cy - y), R = Math.max(r.width, r.height)/2*1.5;
    if (d < R && d < bd){ bd = d; best = b; } }
  return best;
}
function tcRefresh(){
  const was = {...touch}; for (const k in touch) touch[k] = false;
  for (const k of tcPointers.values()) if (k) touch[k] = true;
  for (const b of document.querySelectorAll('#touch .tb')) b.classList.toggle('on', touch[b.dataset.k]);
  if (touch.jump && !was.jump){ jumpQueued = true; }
  for (const k in touch) if (touch[k] && !was[k]) buzz(8);
}
let tcEditing = false, tcDrag = null;
const tl = $('touch');
tl.addEventListener('pointerdown', e => {
  e.preventDefault(); lastInput = 'touch';
  if (tcEditing){ const b = tcButtonAt(e.clientX, e.clientY); if (b){ tcDrag = {b, id:e.pointerId}; try { tl.setPointerCapture(e.pointerId); } catch(_){} b.classList.add('on'); } return; }
  try { tl.setPointerCapture(e.pointerId); } catch(_){}
  const b = tcButtonAt(e.clientX, e.clientY); tcPointers.set(e.pointerId, b ? b.dataset.k : null); tcRefresh();
});
tl.addEventListener('pointermove', e => {
  if (tcEditing){ if (!tcDrag || tcDrag.id !== e.pointerId) return; dragTc(e); return; }
  if (!tcPointers.has(e.pointerId)) return;
  const b = tcButtonAt(e.clientX, e.clientY), k = b ? b.dataset.k : null;
  if (tcPointers.get(e.pointerId) !== k){ tcPointers.set(e.pointerId, k); tcRefresh(); }
});
const tcUp = e => {
  if (tcEditing){ if (tcDrag && tcDrag.id === e.pointerId){ tcDrag.b.classList.remove('on'); tcDrag = null; saveSettings(); } return; }
  tcPointers.delete(e.pointerId); tcRefresh();
};
tl.addEventListener('pointerup', tcUp); tl.addEventListener('pointercancel', tcUp); tl.addEventListener('lostpointercapture', tcUp);
function dragTc(e){
  // координаты пальца → в систему кадра (кадр может быть повёрнут на 90°)
  const st = $('stage'), r = st.getBoundingClientRect(), rot = document.body.classList.contains('rot');
  let fx, fy;
  if (rot){ fx = (e.clientY - r.top)/r.height; fy = 1 - (e.clientX - r.left)/r.width; } else { fx = (e.clientX - r.left)/r.width; fy = (e.clientY - r.top)/r.height; }
  const W = st.clientWidth, H = st.clientHeight, sw = W - HUDPX.l - HUDPX.r, sh = H - HUDPX.t - HUDPX.b;
  const x = clamp((fx*W - HUDPX.l)/sw, .05, .95), y = clamp((fy*H - HUDPX.t)/sh, .12, .95);
  SET.tcPos = SET.tcPos || {}; for (const k of ['left','right','down','jump']) if (!SET.tcPos[k]) SET.tcPos[k] = tcPos(k).slice();
  SET.tcPos[tcDrag.b.dataset.k] = [x, y]; applyTouchLayout();
}
function startTcEdit(){ tcEditing = true; hideScreens(); $('stage').classList.add('tcedit'); applyTouchLayout(); }
function endTcEdit(){ tcEditing = false; $('stage').classList.remove('tcedit'); saveSettings(); openSettings(settingsFrom); setTab('ctrl'); }
$('tcDone').addEventListener('click', endTcEdit);
$('tcReset').addEventListener('click', () => { SET.tcPos = null; applyTouchLayout(); });

/* ================= Клавиатура ================= */
addEventListener('keydown', e => {
  keys[e.code] = true;
  if (!e.repeat) lastInput = 'kb';
  if (e.repeat) return;
  if (isKey('jump', e.code)) jumpQueued = true;
  if (['Enter','NumpadEnter'].includes(e.code) || isKey('jump', e.code)) advanceQueued = true;
  if (splashOn){ endSplash(); return; }
  if (tcEditing){ if (e.code === 'Escape') endTcEdit(); return; }
  if (isKey('journal', e.code) && !menuOpenNoJournal()){ journalOpen ? closeJournal() : openJournal(); return; }
  if (journalOpen && e.code === 'Escape'){ closeJournal(); return; }
  const open = SCREENS.find(id => !$(id).hidden);
  if (open){
    if (e.code === 'ArrowDown' || e.code === 'ArrowUp'){
      const list = [...$(open).querySelectorAll('button:not([hidden]):not(:disabled)')].filter(b => b.offsetParent !== null);
      const i = list.indexOf(document.activeElement), n = e.code === 'ArrowDown' ? 1 : -1;
      const next = list[(i + n + list.length) % list.length]; if (next){ next.focus(); sfx.blip(); } e.preventDefault();
    }
    if (e.code === 'Escape'){ if (open === 'pause') closePause(); else if (open === 'settings') closeSettings(); else if (open === 'chars' && !$('charInfo').hidden) renderChars(); else if (BACK_TO[open]) showScreen(BACK_TO[open]); else if (open === 'confirm') showScreen(confirmFrom); }
    return;
  }
  if (isKey('pause', e.code) && S){ if (S.scene && e.code === 'Escape') skipScene(); else if (S.mode === 'play') openPause(); }
  const bound = Object.values(KEYS).some(k => k.includes(e.code));
  if (e.code === 'KeyM' && !bound) toggleMute();
  if (e.code === 'KeyF' && !bound) toggleFS();
  if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
});
const menuOpenNoJournal = () => SCREENS.some(id => !$(id).hidden) || tcEditing;
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; tcPointers.clear(); tcRefresh(); if (S && S.mode === 'play' && !menuOpen()) openPause(); });
$('dlg').addEventListener('pointerdown', e => { e.stopPropagation(); advanceQueued = true; });
$('stage').addEventListener('pointerdown', e => {
  if (e.target.closest('button, .screen, .journal, .touch')) return;
  if (S && ['dialog','card'].includes(S.mode)) advanceQueued = true;
});
document.addEventListener('mouseover', e => { if (e.target.closest && e.target.closest('.mnav button, .chcard')) sfx.blip(); });
function toggleFS(){ const st = document.documentElement; try { if (document.fullscreenElement) document.exitFullscreen(); else if (st.requestFullscreen) st.requestFullscreen(); } catch(e){} }
$('fsbtn').addEventListener('click', e => { e.currentTarget.blur(); toggleFS(); });
if (!document.fullscreenEnabled) $('fsbtn').style.display = 'none';

/* ================= Вступление «Х представляет» ================= */
let splashOn = true;
function endSplash(){ if (!splashOn) return; splashOn = false; $('splash').classList.add('out'); setTimeout(() => $('splash').hidden = true, 600); audio(); }
$('splash').addEventListener('pointerdown', endSplash);
setTimeout(endSplash, 4200);

/* ================= Telegram Mini App ================= */
const SYNC = [SKEY, JKEY, 'nz.settings', PKEY];
const cloudName = k => k.replace(/[^A-Za-z0-9_-]/g, '_');
const cloudTimers = {};
function cloudSet(k, v){
  if (!TG.on || !TG.app.CloudStorage) return;
  clearTimeout(cloudTimers[k]);
  cloudTimers[k] = setTimeout(() => {
    const cs = TG.app.CloudStorage, name = cloudName(k), str = v || '', parts = Math.max(1, Math.ceil(str.length / 4000));
    try { for (let i=0;i<parts;i++) cs.setItem(`${name}_${i}`, str.slice(i*4000, (i+1)*4000)); cs.setItem(`${name}_n`, String(parts)); } catch(e){}
  }, 600);
}
function cloudGet(k){
  return new Promise(res => {
    const cs = TG.app && TG.app.CloudStorage; if (!cs) return res(null); const name = cloudName(k);
    try { cs.getItem(`${name}_n`, (err, n) => { n = parseInt(n, 10); if (err || !n) return res(null);
      const ks = Array.from({length:n}, (_, i) => `${name}_${i}`);
      cs.getItems(ks, (e2, vals) => res(e2 || !vals ? null : ks.map(x => vals[x] || '').join(''))); }); } catch(e){ res(null); }
  });
}
async function cloudMerge(){
  const [save, jour, sets, prog] = await Promise.all(SYNC.map(cloudGet));
  const parse = s => { try { return JSON.parse(s); } catch(e){ return null; } };
  const ls = k => { try { return localStorage.getItem(k); } catch(e){ return null; } }, lw = (k, v) => { try { localStorage.setItem(k, v); } catch(e){} };
  const cs = parse(save), lsv = parse(ls(SKEY));
  if (cs && (!lsv || (cs.t || 0) > (lsv.t || 0))) lw(SKEY, save); else if (lsv) cloudSet(SKEY, ls(SKEY));
  const cj = parse(jour), lj = parse(ls(JKEY)), count = j => j && j.scenes ? Object.values(j.scenes).reduce((a, s) => a + s.lines.length, 0) : 0;
  if (cj && count(cj) > count(lj)){ lw(JKEY, jour); Journal.data = cj; } else if (lj) cloudSet(JKEY, ls(JKEY));
  const cset = parse(sets); if (cset && !ls('nz.settings')){ Object.assign(SET, cset); lw('nz.settings', sets); KEYS = keyMap(); applyVolumes(); }
  const cp = parse(prog), lp = parse(ls(PKEY)); if (cp && (!lp || cp.unlocked > lp.unlocked)) lw(PKEY, prog); else if (lp) cloudSet(PKEY, ls(PKEY));
  if (!$('title').hidden) showMenu();
}
function tgFullscreen(){
  const tg = TG.app; if (!TG.on || TG.fs) return;
  try { if (['android','ios'].includes(tg.platform) && tg.isVersionAtLeast('8.0')){ tg.requestFullscreen(); TG.fs = true; } } catch(e){}
}
function tgBack(){
  if (tcEditing){ endTcEdit(); return; }
  if (journalOpen){ closeJournal(); return; }
  if (!$('settings').hidden){ closeSettings(); return; }
  if (!$('confirm').hidden){ showScreen(confirmFrom); return; }
  if (!$('chars').hidden && !$('charInfo').hidden){ renderChars(); return; }
  for (const id in BACK_TO) if (!$(id).hidden){ showScreen(BACK_TO[id]); return; }
  if (!$('pause').hidden){ closePause(); return; }
  if (S && S.scene){ skipScene(); return; }
  if (S && S.mode === 'play'){ openPause(); return; }
  if (!$('end').hidden){ showMenu(); return; }
}
function tgSync(){
  if (!TG.on) return; const bb = TG.app.BackButton, need = $('title').hidden || journalOpen || tcEditing;
  try { need ? bb.show() : bb.hide(); } catch(e){}
}
function tgInit(){
  const tg = window.Telegram && window.Telegram.WebApp; if (!tg || !tg.initData || TG.on) return !!TG.on;
  TG.app = tg; TG.on = true; document.body.classList.add('tg');
  try { tg.ready(); tg.expand(); } catch(e){}
  try { if (tg.isVersionAtLeast('7.7')) tg.disableVerticalSwipes(); } catch(e){}
  try { tg.setHeaderColor('#0E0C18'); tg.setBackgroundColor('#0B0912'); if (tg.isVersionAtLeast('7.10')) tg.setBottomBarColor('#0B0912'); } catch(e){}
  try { tg.BackButton.onClick(tgBack); } catch(e){}
  try { tg.onEvent('deactivated', () => { if (S && S.mode === 'play') openPause(); }); } catch(e){}
  hapticHook = ms => { try { tg.HapticFeedback.impactOccurred(ms > 50 ? 'heavy' : ms > 22 ? 'medium' : ms > 10 ? 'light' : 'soft'); } catch(e){} };
  storeHook = (k, v) => { if (SYNC.includes(k)) cloudSet(k, v); };
  const u = tg.initDataUnsafe && tg.initDataUnsafe.user;
  if (u && u.first_name){ $('hello').textContent = `Привет, ${u.first_name}! Прогресс сохраняется в Telegram.`; $('hello').hidden = false; }
  if (deviceIsTouch()) $('fsbtn').style.display = 'none';
  try { ['viewportChanged','fullscreenChanged','safeAreaChanged','contentSafeAreaChanged'].forEach(ev => tg.onEvent(ev, fitStage)); } catch(e){}
  tgFullscreen(); fitStage(); cloudMerge(); setInterval(tgSync, 250);
  return true;
}

/* ================= Раскладка под экран телефона ================= */
function fitInsets(){
  const z = {top:0, bottom:0, left:0, right:0}; if (!TG.on) return z;
  const a = TG.app.safeAreaInset || z, b = TG.app.contentSafeAreaInset || z;
  return {top:(a.top||0) + (b.top||0), bottom:(a.bottom||0) + (b.bottom||0), left:(a.left||0) + (b.left||0), right:(a.right||0) + (b.right||0)};
}
let fitKey = '';
function fitStage(){
  // На весь экран — в Telegram и на телефонах/планшетах; на обычном компьютере в браузере — аккуратная рамка
  const b = document.body, full = TG.on || deviceIsTouch();
  const key = [full, innerWidth, innerHeight, JSON.stringify(fitInsets())].join('|');
  if (key === fitKey) return; fitKey = key;
  b.classList.toggle('fit', full);
  const app = document.querySelector('.app'), st = $('stage');
  let vw = 960, vh = 540;
  if (!full){ b.classList.remove('rot'); app.removeAttribute('style'); st.removeAttribute('style'); HUD = {t:0, r:0, b:0, l:0}; HUDPX = {t:0, r:0, b:0, l:0}; }
  else {
    const W = innerWidth, H = innerHeight, ins = fitInsets(), rot = W < H && deviceIsTouch();
    b.classList.toggle('rot', rot);
    Object.assign(app.style, {left:'0px', top:'0px', width:W + 'px', height:H + 'px'});
    let w = rot ? H : W, h = rot ? W : H;
    w = Math.min(w, Math.floor(h*2.4)); h = Math.min(h, Math.floor(w*.75));
    st.style.width = w + 'px'; st.style.height = h + 'px';
    const px = rot ? {t:ins.right, r:ins.bottom, b:ins.left, l:ins.top} : {t:ins.top, r:ins.right, b:ins.bottom, l:ins.left};
    for (const k of ['t','r','b','l']) st.style.setProperty('--hud-' + k, px[k] + 'px');
    HUDPX = px;
    vh = clamp(Math.round(h*1.15), 400, 540); vw = Math.round(vh*w/h);
    const k = vh/h; HUD = {t:px.t*k, r:px.r*k, b:px.b*k, l:px.l*k};
  }
  st.classList.toggle('short', (full ? parseFloat(st.style.height) : st.clientHeight) < 520);
  if (vw !== VW || vh !== VH){ VW = vw; VH = vh; resize(); LAYERS = null; }
  applyTouchLayout();
}
addEventListener('resize', fitStage); addEventListener('orientationchange', fitStage);
try { matchMedia('(orientation: portrait)').addEventListener('change', fitStage); } catch(e){}
try { screen.orientation.addEventListener('change', fitStage); } catch(e){}
try { visualViewport.addEventListener('resize', fitStage); } catch(e){}
let wasPlaying = false, wasTouchOn = null;
function uiTick(){
  fitStage();
  const tOn = touchUI();
  if (tOn !== wasTouchOn){ wasTouchOn = tOn; $('stage').classList.toggle('touchon', tOn); document.body.classList.toggle('touchui', tOn); }
  const playing = !!(S && S.mode === 'play' && !G1.paused && !journalOpen && !tcEditing && SCREENS.every(id => $(id).hidden));
  if (playing === wasPlaying) return; wasPlaying = playing;
  $('stage').classList.toggle('playing', playing);
  if (!playing){ for (const k in keys) keys[k] = false; tcPointers.clear(); tcRefresh(); }
}

/* ================= Запуск ================= */
$('ver').textContent = VERSION; $('aboutVer').textContent = VERSION;
$('sVer').textContent = VERSION;
if (Journal.data.scenes['ch3:beacon'] && CHAPTERS.length > 4) unlock(4);
showMenu();
if (!tgInit()){ const s = document.getElementById('tgsdk'); if (s) s.addEventListener('load', tgInit); }
fitStage();
let lastTs = 0, acc = 0;
function frame(ts){
  let dt = (ts - lastTs)/1000 || 0; lastTs = ts; dt = Math.min(dt, .1);
  if (!G1.paused && !splashOn){ acc += dt; let n = 0; while (acc >= STEP && n < 20){ update(STEP); acc -= STEP; n++; } if (n >= 20) acc = 0; }
  musicTick(); render(); uiTick();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
if (document.fonts && document.fonts.load){ document.fonts.load(`800 16px Nunito`).catch(() => {}); document.fonts.load(`500 16px Lora`).catch(() => {}); }
// для отладки и тестов
window.__g = { get S(){ return S; }, startChapter, showMenu, loadGame, openPause, api, CHAPTERS, keys, touch };
