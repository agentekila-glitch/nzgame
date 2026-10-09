"use strict";
/* =====================================================================
   Механики глав 5–6: колокол-ориентир, оседающие плиты, хрупкие полки, рычаги и стеллажи,
   стража гильдии (зоны видимости), спокойно поднимающаяся Мгла, именные находки;
   с главы 6 — архивные противовесы, эфирные потоки, замки Хранителей под Медный ключ, решётки, вода;
   с главы 7 — очаги Долины и парящие плиты, эхо Мглы, резонансные колокола, сгустки Мглы, плита Джей;
   с главы 8 — цепь древнего моста (закреплена / нагружена / оборвана), лебёдка, мостовые плиты.
   Подключается после engine.js; движок вызывает extendBuilder / parseMech / updateMech / drawMech.
   ===================================================================== */

// ---------- Помощники для build(h) ----------
function extendBuilder(h, out, F){
  out.levers = []; out.guards = []; out.bells = []; out.findInfo = {}; out.slow = []; out.brittle = [];
  out.gates = []; out.keylocks = []; out.waters = []; out.switches = []; out.chains = []; out.pairs = [];
  Object.assign(h, {
    // плиты, которые оседают через полторы секунды после того, как на них встали
    slowFade(a, len, r){ for (let i=0;i<len;i++){ h.put(a+i, r, 'f'); out.slow.push((a+i)+','+r); } },
    // хрупкие полки: держат, пока по ним идёшь, но ломаются от тяжёлого приземления (после двойного прыжка)
    brittle(a, len, r){ for (let i=0;i<len;i++){ h.put(a+i, r, 'f'); out.brittle.push((a+i)+','+r); } },
    // находка со своим именем и подписью
    findx(c, r, name, icon){ h.put(c, r, 'I'); out.findInfo[c+','+r] = {name, icon}; },
    // напольный рычаг: задел — и стеллажи с тем же id поехали
    lever(c, r, id){ out.levers.push({x:c*T + 16, y:r*T, id, on:false, t:0}); },
    // стеллаж-платформа: стоит, пока не дёрнут рычаг, потом едет из (c,r) на (dc,dr) клеток
    shelf(c, r, len, dc, dr, id, dur=1.6){ out.movers.push({x0:c*T, y0:r*T, x1:(c+dc)*T, y1:(r+dr)*T, w:len*T, h:14, period:4, t:0, x:c*T, y:r*T, dx:0, dy:0, lever:id, k:0, target:0, dur, shelf:true}); },
    // стражник ходит между колонками c0 и c1 по ряду r (низ ног) и смотрит вперёд на see клеток
    guard(c0, c1, r, o={}){ out.guards.push(Object.assign({x:c0*T + 16, y:r*T, x0:c0*T + 16, x1:c1*T + 16, dir:1, speed:60, see:6, wait:0, t:0, alert:0}, o)); },
    // колокол в тумане: звучит слева или справа, подсказывая, куда идти. Звонят по очереди.
    bell(c, r){ out.bells.push({x:c*T + 16, y:r*T, reached:false, t:0}); },
    // ----- глава 6 -----
    // решётка (look:'grate') или каменная створка (look:'stone') в колонках c…c+w-1, ряды r0…r1.
    // Открывается сигналом id (замок, сцена). invert — наоборот: открыта, пока сигнала нет (её роняют сверху)
    gate(c, r0, r1, id, o={}){ const w = o.w || 1; for (let i=0;i<w;i++) for (let r=r0;r<=r1;r++) h.put(c + i, r, o.invert ? ' ' : 'g');
      out.gates.push(Object.assign({c, w, r0, r1, id, look:'grate', open:!!o.invert, k:o.invert ? 1 : 0}, o)); },
    // архивный противовес: платформа len клеток в (c, r). Пока на ней стоят, ровно опускается на drop клеток за 1,5 с,
    // без Аи так же ровно поднимается за 3 с — без рывков, как бы на неё ни прыгнули.
    // pair:[c, r, len] — связанная платформа, которая в это время едет вверх.
    cw(c, r, len, o={}){ const A = {x0:c*T, y0:r*T, x:c*T, y:r*T, w:len*T, h:14, dx:0, dy:0, t:0, period:1, cw:true, k:0, dist:(o.drop || 6)*T};
      out.movers.push(A);
      if (o.pair){ const [pc, pr, pl] = o.pair; const B = {x0:pc*T, y0:pr*T, x:pc*T, y:pr*T, w:(pl || len)*T, h:14, dx:0, dy:0, t:0, period:1, cwB:A}; A.partner = B; out.movers.push(B); } },
    // замок Хранителей: медная розетка на стене у пола ряда r. Встать рядом и держать «вниз» 2 секунды
    keylock(c, r, id, o={}){ out.keylocks.push(Object.assign({x:c*T + 16, y:r*T, id, t:0, done:false, need:2}, o)); },
    // эфирный поток Первого Огня: несёт вверх (8 клеток/с, с прыжком быстрее), возвращает двойной прыжок;
    // «вниз» — выскочить. dx — наклонный поток (±1), он ещё и несёт вбок
    draft(c0, c1, r0, r1, dx=0){ out.winds.push({x:c0*T, y:r0*T, w:(c1-c0+1)*T, h:(r1-r0+1)*T, ether:true, dx}); },
    // наклонный поток под 45°: лесенка из квадратов 3×3, n шагов от (c, r) вверх в сторону dir
    draftDiag(c, r, n, dir){ for (let i=0;i<n;i++) out.winds.push({x:(c + dir*i*2)*T, y:(r - i*2 - 2)*T, w:3*T, h:3*T, ether:true, dx:dir, diag:true}); },
    // вода в провале: коснулась — назад к фонарю
    water(c0, c1, r){ out.waters.push({x:c0*T, w:(c1-c0+1)*T, y:r*T + 8, t:0}); },
    // ----- глава 7 -----
    // очаг Долины: каменная чаша в полу ряда r. Коснулась — вспыхивает на dur секунд и даёт сигнал id
    // (поднимает парящие плиты, сжигает сгустки Мглы). Коснулась ещё раз — время снова полное.
    hearth(c, r, id, o={}){ out.switches.push(Object.assign({kind:'hearth', x:c*T + 16, y:r*T, id, dur:6, left:0, t:0, lit:false}, o)); },
    // резонансный колокол без языка: низ колокола в ряду r. Прыгни в него — гул на dur секунд:
    // тени и пепельники вокруг замирают, сгустки Мглы с тем же id расходятся
    resonator(c, r, id='', o={}){ out.switches.push(Object.assign({kind:'bell', x:c*T + 16, y:r*T, id, dur:8, left:0, t:0, cd:0, swing:0, reach:14*T}, o)); },
    // плита у механизма Джей: встала на неё — Джей зажимает педаль; сошла — держит ещё dur секунд
    pedal(c, r, id, o={}){ out.switches.push(Object.assign({kind:'pedal', x:c*T + 16, y:r*T, id, dur:5, left:0, t:0, w:2, jay:'jay'}, o)); },
    // парящая плита: стоит в (c, r), пока есть сигнал id; без него уходит на drop клеток вниз, в Мглу
    heat(c, r, len, id, o={}){ const d = (o.drop || 7)*T; out.movers.push({x0:c*T, y0:r*T, x:c*T, y:r*T + d, w:len*T, h:14, dx:0, dy:0, t:0, period:1, heat:id, k:0, dist:d}); },
    // эхо Мглы: призрачная плита. Твёрдая on секунд, потом тает и пропадает на off секунд. phase — сдвиг (сек)
    echo(c, r, len, o={}){ out.movers.push({x0:c*T, y0:r*T, x:c*T, y:r*T, w:len*T, h:14, dx:0, dy:0, t:o.phase || 0, period:1, echo:true, on:o.on || 3, off:o.off || 2, a:1}); },
    // сгусток Мглы: стена тумана в колонках c…c+1. Расходится, пока есть сигнал id (очаг, колокол)
    clot(c, r0, r1, id, o={}){ h.gate(c, r0, r1, id, Object.assign({look:'mist', w:2}, o)); },
    // ----- глава 8 -----
    // цепь древнего моста: от анкера в стене (c0, r0) до плиты (c1, r1). Состояния: 'fixed' → 'strain' → 'broken'
    chain(c0, r0, c1, r1, id, o={}){ out.chains.push(Object.assign({x0:c0*T + 16, y0:r0*T, x1:c1*T + 16, y1:r1*T, id, state:'fixed', t:0, held:false, sag:24}, o)); },
    // лебёдка цепи: встать рядом и держать «вниз» need секунд — стопор щёлкает, сигнал id остаётся навсегда
    winch(c, r, id, o={}){ h.keylock(c, r, id, Object.assign({look:'winch', need:1.6}, o)); },
    // плита моста на цепи: держится, пока цепь id не оборвана; потом падает
    // два канала: когда очаги a и b горят одновременно, сигнал id включается навсегда
    pair(a, b, id){ out.pairs.push({a, b, id}); },
    span(c, r, len, id){ out.movers.push({x0:c*T, y0:r*T, x:c*T, y:r*T, w:len*T, h:14, dx:0, dy:0, t:0, period:1, span:id, k:1, vy:0}); }
  });
}
function parseMech(W, out){
  W.levers = out.levers || []; W.guards = out.guards || []; W.bells = out.bells || [];
  for (const k of out.slow || []) if (W.fades[k]) W.fades[k].slow = true;
  for (const k of out.brittle || []) if (W.fades[k]) W.fades[k].brittle = true;
  for (const f of W.finds){ const info = (out.findInfo || {})[Math.floor((f.x - 16)/T) + ',' + Math.round(f.y/T - 1)]; if (info){ f.name = info.name; f.icon = info.icon; } }
  W.bellT = 2;
  W.gates = out.gates || []; W.keylocks = out.keylocks || []; W.waters = out.waters || []; W.forced = {};
  W.switches = out.switches || []; W.timed = {}; W.chains = out.chains || []; W.pairs = out.pairs || [];
  W.slowFades = Object.values(W.fades).filter(f => f.slow);
}

// ---------- Звук: колокол с панорамой, сердцебиение, капли, рычаг, тревога ----------
function bellSound(pan, vol){
  const ac = audio(); if (!ac) return; const t0 = ac.currentTime;
  const p = ac.createStereoPanner ? ac.createStereoPanner() : null, out = ac.createGain(); out.gain.value = vol;
  if (p){ p.pan.value = clamp(pan, -1, 1); out.connect(p).connect(sfxGain); } else out.connect(sfxGain);
  for (const [m, v, d] of [[1, .09, 4], [2.76, .035, 2.4], [5.4, .018, 1.2], [.5, .05, 5]]){
    const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = 196*m;
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(v, t0 + .01); g.gain.exponentialRampToValueAtTime(.0001, t0 + d);
    o.connect(g).connect(out); o.start(t0); o.stop(t0 + d + .05); }
}
Object.assign(sfx, {
  bell(pan=0, vol=1){ bellSound(pan, vol); },
  heart(){ tone(62, .22, 'sine', .14, 40); tone(58, .2, 'sine', .11, 38, .32); },
  drip(){ tone(1400 + Math.random()*500, .09, 'sine', .018, 700); },
  lever(){ tone(180, .12, 'square', .03, 120); noise(.1, .05, 1600, 1.2); tone(520, .2, 'triangle', .03, null, .12); },
  alarm(){ [880, 660, 880].forEach((f, i) => tone(f, .16, 'square', .025, null, i*.18)); },
  shelf(){ noise(.6, .03, 400, .6, 0, 'lowpass'); },
  gate(){ noise(.8, .04, 700, .6, 0, 'lowpass'); tone(110, .35, 'square', .02, 70); },
  grate(){ noise(.25, .09, 2400, .8); tone(220, .5, 'square', .03, 90); tone(160, .6, 'sawtooth', .02, 70, .08); },
  chain(){ for (let i=0;i<5;i++) tone(1300 + Math.random()*500, .04, 'square', .008, null, i*.07); },
  latch(){ tone(520, .08, 'square', .03, 300); tone(260, .12, 'triangle', .03, null, .06); },
  splash(){ noise(.5, .06, 900, .5); tone(300, .2, 'sine', .02, 120); },
  turn(){ tone(70 + Math.random()*20, .12, 'sawtooth', .012, 60); },
  stone(){ noise(1.8, .07, 240, .4, 0, 'lowpass'); tone(46, 1.4, 'sawtooth', .05, 34); tone(68, 1, 'square', .015, 40, .3); },
  creak(){ tone(92 + Math.random()*20, .5, 'sawtooth', .025, 70); noise(.35, .03, 600, .4, 0, 'lowpass'); }, // камень трескается, плита сейчас уйдёт
  strain(){ tone(140 + Math.random()*40, .25, 'square', .018, 110); for (let i=0;i<3;i++) tone(900 + Math.random()*400, .04, 'square', .006, null, i*.06); },
  snap(){ tone(1600, .08, 'square', .05, 400); noise(.6, .09, 2200, .7); tone(60, 1.2, 'sawtooth', .06, 36, .05); },
  ignite(){ noise(.5, .06, 1200, .5); tone(180, .4, 'triangle', .03, 360); tone(540, .3, 'sine', .02, 900, .05); },
  ember(){ tone(900 + Math.random()*300, .05, 'triangle', .012, 600); },
  resonate(){ bellSound(0, 1); tone(98, 2.6, 'sine', .06, 92); tone(147, 2.2, 'sine', .025, 140, .05); },
  echo(){ tone(1200, .5, 'sine', .01, 1600); tone(800, .6, 'sine', .008, 1100, .1); }
});

// ---------- Обновление ----------
function updateMech(dt, frozen){
  const W = S.W, p = S.P; if (!W.levers) return;
  // колокол: звонит ближайший ещё не пройденный, звук приходит с его стороны
  const bell = W.bells.find(b => !b.reached);
  for (const b of W.bells) b.t += dt;
  if (bell){
    if (Math.abs(bell.x - (p.x + p.w/2)) < 140 && Math.abs(bell.y - (p.y + p.h)) < 200) bell.reached = true;
    W.bellT -= dt;
    if (W.bellT <= 0 && !frozen){ W.bellT = 4.2; const dx = bell.x - (p.x + p.w/2), d = Math.hypot(dx, bell.y - p.y);
      sfx.bell(dx/520, clamp(1.15 - d/1700, .3, 1)); bell.t = 0; bell.ring = true; }
  }
  updateCh6(dt, frozen);
  if (frozen) return;
  // рычаги
  for (const lv of W.levers){ lv.t += dt;
    if (!lv.on && Math.abs(lv.x - (p.x + p.w/2)) < 26 && Math.abs(lv.y - (p.y + p.h)) < 40){ lv.on = true; sfx.lever(); sfx.shelf(); floatText(lv.x, lv.y - 50, 'Щёлк!', '#FFE3A8'); buzz(20);
      for (const m of W.movers) if (m.lever === lv.id) m.target = 1; } }
  // стража
  for (const g of W.guards){ g.t += dt;
    if (g.chase){ if (!g.on) continue; chaseStep(g, dt); const px0 = p.x + p.w/2; // погоня: бегут за Аей по-настоящему
      if (Math.abs(px0 - g.x) < 30 && Math.abs((p.y + p.h) - g.y) < 50 && S.mode === 'play'){ g.say = 'Стой!'; g.sayT = 1.4; sfx.alarm(); S.mode = 'caught'; S.fT = 0; }
      if (g.sayT > 0) g.sayT -= dt; continue; }
    if (g.wait > 0) g.wait -= dt;
    else { g.x += g.dir*g.speed*dt; if ((g.dir > 0 && g.x >= g.x1) || (g.dir < 0 && g.x <= g.x0)){ g.x = clamp(g.x, g.x0, g.x1); g.dir *= -1; g.wait = 1.4; } }
    const px = p.x + p.w/2, dx = (px - g.x)*g.dir, dy = (p.y + p.h) - g.y;
    const seen = dx > -10 && dx < g.see*T && Math.abs(dy) < 50 && S.mode === 'play' && !lineBlocked(g.x, g.y - 40, px, p.y + 10);
    g.alert = approach(g.alert, seen ? 1 : 0, dt*(seen ? 3.2 : 1.5));
    if (g.alert >= 1 && S.mode === 'play'){ g.say = 'Эй! Кто там?!'; g.sayT = 1.6; sfx.alarm(); S.mode = 'caught'; S.fT = 0; for (const q of W.guards) q.alert = 0; }
    if (g.sayT > 0) g.sayT -= dt;
  }
  // спокойная Мгла снизу: не бьёт, но если догнала — назад к фонарю
  const R = S.rise;
  if (R){ R.t += dt; R.y = Math.max(R.top, R.y - R.speed*dt);
    if (p.y + p.h > R.y + 18 && p.inv <= 0){ fallOut(); R.y = Math.max(R.y, p.checkpoint.y + p.h + R.gap); } }
}
// ---------- Глава 6: противовесы, замки, решётки, вода ----------
const vis = (x, m=120) => x > S.cam.x - m && x < S.cam.x + VW + m;
function updateCh6(dt, frozen){
  const W = S.W, p = S.P; if (!W.gates) return;
  updateCh7(dt, frozen); updateCh8(dt, frozen);
  const sig = W.forced;
  for (const kl of W.keylocks){ // Медный ключ: держать «вниз» у розетки
    kl.near = !kl.done && p.onGround && Math.abs(p.x + p.w/2 - kl.x) < 44 && Math.abs(p.y + p.h - kl.y) < 12 && (!kl.when || kl.when());
    if (frozen || kl.done) continue;
    if (p.inv > 1) kl.t = 0; // ударили — начинай заново
    if (kl.near && isDown()){ const before = kl.t; kl.t += dt; if (Math.floor(before*6) !== Math.floor(kl.t*6)) sfx.turn();
      if (kl.t >= kl.need){ kl.done = true; sig[kl.id] = true; S.flags['k_' + kl.id] = true; sfx.stone(); S.shake = .7; buzz(60); embers(kl.x, kl.y - 40, 20); saveGame(true);
        if (kl.scene) startScene(kl.scene); } }
    else kl.t = Math.max(0, kl.t - dt*1.5);
  }
  for (const g of W.gates){
    const on = !!sig[g.id] || W.timed[g.id] > 0, want = g.invert ? !on : on;
    const box = {x:g.c*T, y:g.r0*T, w:g.w*T, h:(g.r1 - g.r0 + 1)*T};
    if (want && !g.open){ g.open = true; for (let i=0;i<g.w;i++) for (let r=g.r0;r<=g.r1;r++) W.grid[r][g.c + i] = ' '; g.look === 'stone' ? sfx.stone() : sfx.gate(); }
    else if (!want && g.open && !overlap(p, box)){ g.open = false; for (let i=0;i<g.w;i++) for (let r=g.r0;r<=g.r1;r++) W.grid[r][g.c + i] = 'g'; if (g.look === 'mist'){ if (vis(g.c*T)) sfx.echo(); } else { sfx.grate(); S.shake = .35; camKick(5); } }
    g.k = approach(g.k, g.open ? 1 : 0, dt*(g.open ? (g.look === 'stone' ? .6 : g.look === 'mist' ? 2.5 : 1.6) : g.look === 'mist' ? 3 : 7));
  }
  if (frozen) return;
  for (const w of W.waters){ w.t += dt; // упала в воду — назад к фонарю
    if (p.x + p.w > w.x && p.x < w.x + w.w && p.y + p.h > w.y + 6 && S.mode === 'play'){ sfx.splash();
      burst(p.x + p.w/2, w.y, 16, ['rgba(160,210,230,.9)','rgba(220,240,250,.8)'], {angle:-Math.PI/2, spread:.9, min:120, max:320, g:900}); fallOut(); } }
}
// противовес едет (вызывается из цикла платформ движка)
function moveCw(m, dt){
  if (m.cwB) return; // связанную платформу двигает основная
  const p = S.P, on = p.mover === m, was = m.k;
  m.k = approach(m.k, on ? 1 : 0, dt/(on ? 1.5 : 3)); // всегда с одной скоростью
  const ny = m.y0 + m.k*m.dist; m.dy = ny - m.y; m.dx = 0; m.y = ny;
  if (m.partner){ const B = m.partner, by = B.y0 - m.k*m.dist; B.dy = by - B.y; B.dx = 0; B.y = by; }
  if ((was === 0 && m.k > 0) || (was === 1 && m.k < 1)) sfx.chain();
  if (was < 1 && m.k >= 1) sfx.land(.35);
}
// стена между стражником и Аей закрывает обзор
function lineBlocked(x0, y0, x1, y1){
  const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0)/16);
  for (let i=1;i<n;i++){ const x = x0 + (x1 - x0)*i/n, y = y0 + (y1 - y0)*i/n; if (solid(Math.floor(x/T), Math.floor(y/T))) return true; }
  return false;
}
// стеллажи, которые едут по рычагу (вызывается из цикла платформ)
function moveShelf(m, dt){
  const before = m.k; m.k = approach(m.k, m.target, dt/m.dur);
  const e = m.k < .5 ? 2*m.k*m.k : 1 - Math.pow(-2*m.k + 2, 2)/2, nx = lerp(m.x0, m.x1, e), ny = lerp(m.y0, m.y1, e);
  m.dx = nx - m.x; m.dy = ny - m.y; m.x = nx; m.y = ny;
  if (before < 1 && m.k >= 1) sfx.land(.3);
}
function alarmGuards(){ for (const g of S.W.guards) if (g.chase){ g.on = true; g.home = g.home ?? g.x; g.homeY = g.homeY ?? g.y; } }
function resetGuards(){ for (const g of S.W.guards){ g.alert = 0; if (g.chase && g.home !== undefined){ g.x = Math.min(g.home, S.P.x - 420); g.y = g.homeY; g.body = null; } } }
// Стражник в погоне — настоящее тело: стены не проходит, ящики и шипы перепрыгивает, в яму может упасть.
// Темп привязан к скорости Аи: издалека догоняют, а вблизи бегут чуть медленнее — поймают, только если Ая
// пару раз запнётся (упадёт, застрянет на ящиках, промахнётся мимо доски).
function chaseStep(g, dt){
  const p = S.P;
  if (!g.body) g.body = {x:g.x - 12, y:g.y - 44, w:24, h:44, vx:0, vy:0, onGround:false};
  const b = g.body, cx = b.x + 12, dist = (p.x + p.w/2) - cx;
  const top = (isSprint() || lastInput === 'touch' || (lastInput === null && touchUI())) ? SPRINT : WALK;
  const far = Math.abs(dist) > 14*T;
  g.dir = Math.sign(dist) || g.dir;
  b.vx = g.dir*top*(far ? 1.12 : .9);
  b.vy = Math.min(b.vy + G*dt*(b.vy > 0 ? FALL_MULT : 1), MAX_FALL);
  if (b.onGround){ // впереди стена, шипы или яма — прыгаем
    const fc = Math.floor((cx + g.dir*26)/T), fr = Math.floor((b.y + b.h - 2)/T);
    const wall = solid(fc, fr) || solid(fc, fr - 1), thorn = tileAt(fc, fr) === '^' || tileAt(fc + g.dir, fr) === '^';
    const hole = !solid(fc, fr + 1) && !oneWay(fc, fr + 1);
    const climb = (p.y + p.h) < b.y + b.h - T*1.5 && Math.abs(dist) < 5*T; // Ая на ящике — тянутся за ней
    if (wall || thorn || hole || climb) b.vy = -JUMP*.98;
  }
  moveEntity(b, dt, true, false);
  if (b.y > S.W.h){ b.x = p.x - 420; b.y = g.homeY - 44; b.vy = 0; } // упал в провал — выбегает снова сзади
  g.x = b.x + 12; g.y = b.y + b.h;
}
function startRise(o={}){ const p = S.P; S.rise = {y:o.y ?? p.y + p.h + (o.gap || 260), top:o.top ?? 0, speed:o.speed || 22, gap:o.gap || 260, t:0}; }

// ---------- Отрисовка ----------
function drawMech(){
  const W = S.W; if (!W.levers) return; drawCh6(); drawCh7(); drawCh8();
  for (const lv of W.levers){ if (lv.x < S.cam.x - 60 || lv.x > S.cam.x + VW + 60) continue;
    ctx.save(); ctx.translate(lv.x, lv.y);
    pathRR(ctx, -14, -10, 28, 10, 3); fillInk(ctx, '#4A3E36', 1.6);
    ctx.save(); ctx.rotate(lv.on ? .7 : -.7); ctx.fillStyle = '#7A6A5A'; ctx.fillRect(-2.5, -34, 5, 28); ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.strokeRect(-2.5, -34, 5, 28);
    ctx.beginPath(); ctx.arc(0, -36, 6, 0, Math.PI*2); fillInk(ctx, lv.on ? '#F2B45A' : '#C24A4A', 1.6); ctx.restore();
    if (!lv.on){ ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(0, -30, 30, 'rgba(255,200,120,A)', .15 + .1*Math.sin(lv.t*4)); ctx.restore(); }
    ctx.restore(); }
  for (const b of W.bells){ if (!b.ring || b.t > 3) continue; // круги звука от колокола
    for (let i=0;i<3;i++){ const k = b.t/3 - i*.12; if (k <= 0) continue; ctx.strokeStyle = `rgba(180,210,255,${.45*(1 - k)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(b.x, b.y - 40, 30 + k*420, 0, Math.PI*2); ctx.stroke(); } }
  for (const g of W.guards){ if ((g.chase && !g.on) || g.x < S.cam.x - 300 || g.x > S.cam.x + VW + 300) continue;
    if (g.chase){ drawCharAt(g.who || 'guard', g.x, g.y, g.dir, {t:S.time + g.t, phase:S.time*14, run:1, blink:false}, 1, 1, 1); if (g.sayT > 0) bubble(g.x, g.y - 96, g.say, '#3A4A6A'); continue; }
    const len = g.see*T, a = .1 + g.alert*.35; // конус взгляда
    const gr = ctx.createLinearGradient(g.x, 0, g.x + g.dir*len, 0); gr.addColorStop(0, `rgba(255,230,150,${a})`); gr.addColorStop(1, 'rgba(255,230,150,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(g.x + g.dir*8, g.y - 46); ctx.lineTo(g.x + g.dir*len, g.y - 80); ctx.lineTo(g.x + g.dir*len, g.y + 4); ctx.lineTo(g.x + g.dir*8, g.y - 30); ctx.closePath(); ctx.fill();
    drawCharAt(g.who || 'guard', g.x, g.y, g.dir, {t:S.time + g.t, phase:g.t*6, run:g.wait > 0 ? 0 : .45, blink:(g.t % 3.4) < .12}, 1, 1, 1);
    // фонарь в руке стражника
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(g.x + g.dir*16, g.y - 30, 50, 'rgba(255,210,140,A)', .3); ctx.restore();
    if (g.alert > .05){ ctx.font = `900 ${18 + g.alert*8}px ${SANS}`; ctx.textAlign = 'center'; ctx.fillStyle = `rgba(255,${200 - g.alert*140|0},90,${g.alert})`; ctx.fillText(g.alert > .6 ? '!' : '?', g.x, g.y - 82); }
    if (g.sayT > 0) bubble(g.x, g.y - 96, g.say, '#3A4A6A');
  }
}
function drawCh6(){
  const W = S.W; if (!W.gates) return;
  for (const w of W.waters){ const x0 = Math.max(w.x, S.cam.x - 20), x1 = Math.min(w.x + w.w, S.cam.x + VW + 20); if (x1 <= x0) continue; // вода — только видимая часть
    ctx.fillStyle = 'rgba(28,52,70,.94)'; ctx.fillRect(x0, w.y, x1 - x0, 120); ctx.fillStyle = 'rgba(70,120,140,.6)'; ctx.fillRect(x0, w.y, x1 - x0, 14);
    ctx.strokeStyle = 'rgba(190,230,240,.55)'; ctx.lineWidth = 2; ctx.beginPath();
    for (let x = x0; x <= x1; x += 16) ctx.lineTo(x, w.y + Math.sin(x*.05 + w.t*2)*2.2); ctx.stroke(); }
  for (const g of W.gates){ const x = g.c*T, y0 = g.r0*T, wd = g.w*T, hgt = (g.r1 - g.r0 + 1)*T; if (!vis(x)) continue;
    ctx.save(); ctx.beginPath(); ctx.rect(x - 8, y0 - 6, wd + 16, hgt + 10); ctx.clip();
    if (g.look === 'mist'){ ctx.restore(); drawClot(g, x, y0, wd, hgt); continue; }
    if (g.look === 'stone'){ const sx = g.k*(wd/2 + 8); // створки разъезжаются в стороны
      for (const [side, ox] of [[-1, x], [1, x + wd/2]]){ const bx = ox + side*sx; ctx.fillStyle = '#3A3F4E'; ctx.fillRect(bx, y0, wd/2, hgt); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(bx, y0, wd/2, hgt);
        ctx.fillStyle = 'rgba(0,0,0,.18)'; for (let yy = y0 + 20; yy < y0 + hgt; yy += 26) ctx.fillRect(bx, yy, wd/2, 3); }
      if (g.k < 1){ ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x + wd/2, y0 + hgt/2, 60 + 80*g.k, 'rgba(120,220,235,A)', .25 + .25*g.k); ctx.restore(); } }
    else { const lift = g.k*(hgt - 6);
      ctx.fillStyle = '#2A2630'; ctx.fillRect(x - 6, y0 - 6, wd + 12, 6);
      for (let i=0; i<wd/8; i++){ const bx = x + 2 + i*8; ctx.fillStyle = '#4A4654'; ctx.fillRect(bx, y0 - lift, 5, hgt); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.strokeRect(bx, y0 - lift, 5, hgt);
        ctx.fillStyle = '#6A6676'; ctx.beginPath(); ctx.moveTo(bx, y0 + hgt - lift); ctx.lineTo(bx + 2.5, y0 + hgt + 7 - lift); ctx.lineTo(bx + 5, y0 + hgt - lift); ctx.fill(); }
      for (let yy = y0 + 22; yy < y0 + hgt; yy += 34){ ctx.fillStyle = '#3A3644'; ctx.fillRect(x, yy - lift, wd, 5); } }
    ctx.restore(); }
  for (const kl of W.keylocks){ if (!vis(kl.x)) continue; const x = kl.x, y = kl.y - 44; if (kl.look === 'winch'){ drawWinch(kl); continue; } // медная розетка
    ctx.beginPath(); ctx.arc(x, y, 26, 0, Math.PI*2); fillInk(ctx, kl.done ? '#D9A85A' : '#9A6A34', 2.4);
    ctx.beginPath(); ctx.arc(x, y, 19, 0, Math.PI*2); ctx.strokeStyle = 'rgba(40,24,10,.6)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.save(); ctx.translate(x, y + 4); ctx.scale(.62, .62); lampSign(ctx, 0, 0); ctx.restore();
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.min(1, kl.t/kl.need)*Math.PI*1.5); ctx.fillStyle = '#2A1A10'; ctx.fillRect(-2.5, -9, 5, 12); ctx.restore();
    if (kl.near || kl.t > 0){ ctx.strokeStyle = 'rgba(255,227,168,.35)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y, 34, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = '#FFE3A8'; ctx.beginPath(); ctx.arc(x, y, 34, -Math.PI/2, -Math.PI/2 + Math.PI*2*Math.min(1, kl.t/kl.need)); ctx.stroke(); }
    if (kl.near && kl.t === 0){ ctx.font = `800 14px ${SANS}`; ctx.textAlign = 'center'; ctx.fillStyle = '#FFE3A8'; ctx.fillText(fmtHint('Держи {down} — повернуть ключ'), x, y - 46); }
    if (!kl.done){ ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y, 50, 'rgba(255,200,120,A)', .12 + .08*Math.sin(S.time*3)); ctx.restore(); } }
}
// противовес: цепи, шестерни, медный фиксатор
function drawCw(m){
  // рисуем просто: на телефоне пунктир, шестерни-контуры и светящиеся градиенты на каждой платформе заметно тормозят
  const x = m.x, y = m.y, w = m.w, A = m.cwB || m, top = Math.min(m.y0, y) - 6*T;
  ctx.fillStyle = '#3A3036'; for (const cx of [x + 7, x + w - 10]) ctx.fillRect(cx, top, 3, y - top); // цепи
  ctx.fillStyle = INK; ctx.fillRect(x - 1, y - 1, w + 2, 16); ctx.fillStyle = '#6A5040'; ctx.fillRect(x + 1, y + 1, w - 2, 12);
  ctx.fillStyle = '#8A6A50'; ctx.fillRect(x + 2, y + 1, w - 4, 3); ctx.fillStyle = '#B8863A'; ctx.fillRect(x + 4, y + 6, w - 8, 3);
  const a = A.k*6; ctx.strokeStyle = INK; ctx.lineWidth = 2;
  for (const gx of [x + 12, x + w - 12]){ ctx.fillStyle = '#C9A15A'; ctx.beginPath(); ctx.arc(gx, y + 7, 5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(gx - Math.cos(a)*5, y + 7 - Math.sin(a)*5); ctx.lineTo(gx + Math.cos(a)*5, y + 7 + Math.sin(a)*5); ctx.stroke(); }
  if (m.cw){ const lx = x + w/2; ctx.fillStyle = '#4A3A30'; ctx.fillRect(lx - 3, y - 16, 6, 16);
    ctx.fillStyle = 'rgba(255,210,140,.22)'; ctx.beginPath(); ctx.arc(lx, y - 20, 14, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#F2C46A'; ctx.beginPath(); ctx.arc(lx, y - 20, 5, 0, Math.PI*2); ctx.fill();
  }
}
// Мгла снизу — рисуется поверх мира
function drawRise(){
  const R = S.rise; if (!R) return; const y = R.y; if (y > S.cam.y + VH + 40) return;
  ctx.save();
  const g = ctx.createLinearGradient(0, y - 60, 0, y + 260); g.addColorStop(0, 'rgba(120,170,230,0)'); g.addColorStop(.25, 'rgba(110,160,220,.55)'); g.addColorStop(1, 'rgba(40,60,110,.95)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(S.cam.x - 20, S.cam.y + VH + 40);
  for (let x = S.cam.x - 20; x <= S.cam.x + VW + 20; x += 20) ctx.lineTo(x, y + Math.sin(x*.012 + R.t*1.2)*8 + Math.sin(x*.03 - R.t*.8)*4);
  ctx.lineTo(S.cam.x + VW + 20, S.cam.y + VH + 40); ctx.closePath(); ctx.fill();
  for (let i=0;i<18;i++){ const xx = S.cam.x + (hash(i,3,9) % 1000)/1000*VW, yy = y + 20 + (i*37 % 160) - (R.t*14 + i*20) % 40; ctx.fillStyle = `rgba(200,230,255,${.35 + .25*Math.sin(R.t*2 + i)})`; ctx.fillRect(xx, yy, 2, 2); }
  ctx.restore();
}
// Колокол за краем экрана: стрелка-подсказка (на телефоне без стерео тоже понятно, куда идти)
function drawBellHint(){
  const W = S.W; if (!W.bells || !W.bells.length || S.mode !== 'play') return; const b = W.bells.find(q => !q.reached); if (!b || !b.ring || b.t > 2.4) return;
  const sx = b.x - S.cam.x, sy = b.y - 40 - S.cam.y; if (sx > 30 && sx < VW - 30 && sy > 30 && sy < VH - 30) return;
  const x = clamp(sx, 40, VW - 40), y = clamp(sy, 70, VH - 90), a = Math.sin(Math.min(1, b.t/2.4)*Math.PI), ang = Math.atan2(sy - y, sx - x);
  ctx.save(); ctx.globalAlpha = a*.9; ctx.translate(x, y); ctx.fillStyle = 'rgba(20,26,46,.6)'; ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI*2); ctx.fill();
  ctx.font = `900 18px ${SANS}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#CFE2FF'; ctx.fillText('♪', 0, 1);
  ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(22, -6); ctx.lineTo(22, 6); ctx.closePath(); ctx.fill(); ctx.restore();
}
// Иконки именных находок главы 5
function drawFindIcon(f){
  const x = f.x, y = f.y, b = Math.sin(f.t*3)*3;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 20, 44, 'rgba(200,225,255,A)', .3); ctx.restore();
  ctx.save(); ctx.translate(x, y - 22 + b); ctx.rotate(Math.sin(f.t*2)*.1);
  switch (f.icon){
    case 'coin': ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI*2); fillInk(ctx, '#5A4A3A', 2); ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI*2); ctx.strokeStyle = '#9A8060'; ctx.lineWidth = 1.5; ctx.stroke(); break;
    case 'oilcan': ctx.beginPath(); ctx.moveTo(-9, 8); ctx.lineTo(-9, -4); ctx.lineTo(9, -4); ctx.lineTo(9, 8); ctx.closePath(); fillInk(ctx, '#8A7A6A', 2); ctx.beginPath(); ctx.moveTo(6, -4); ctx.lineTo(14, -14); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); break;
    case 'monocle': ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI*2); fillInk(ctx, '#D9DCE6', 2); ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI*2); ctx.fillStyle = 'rgba(180,220,255,.6)'; ctx.fill(); ctx.beginPath(); ctx.moveTo(8, 4); ctx.quadraticCurveTo(16, 14, 6, 18); ctx.strokeStyle = '#C9A050'; ctx.lineWidth = 1.4; ctx.stroke(); break;
    case 'scroll': pathRR(ctx, -12, -6, 24, 12, 5); fillInk(ctx, '#E8D8B0', 2); ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI*2); ctx.fillStyle = '#B03A3A'; ctx.fill(); break;
    case 'sprout': ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(0, -4); ctx.lineWidth = 2.4; ctx.strokeStyle = '#4E8A4A'; ctx.stroke(); ctx.beginPath(); ctx.ellipse(-5, -6, 5, 3, -.6, 0, Math.PI*2); ctx.ellipse(5, -8, 5, 3, .6, 0, Math.PI*2); fillInk(ctx, '#9AF0B0', 1.6);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(0, -6, 16, 'rgba(255,220,150,A)', .6); ctx.restore(); break;
    case 'gauge': ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI*2); fillInk(ctx, '#8A6A3A', 2); ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI*2); ctx.fillStyle = '#E8E0CC'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(5, -4); ctx.lineWidth = 1.6; ctx.strokeStyle = '#B03A3A'; ctx.stroke(); ctx.fillStyle = '#6A4A2A'; ctx.fillRect(-2, 9, 4, 6); break;
    case 'token': ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI*2); fillInk(ctx, '#D9A85A', 2); ctx.save(); ctx.scale(.4, .4); lampSign(ctx, 0, 4); ctx.restore(); break;
    case 'oath': pathRR(ctx, -12, -11, 24, 22, 2); fillInk(ctx, '#E0CDA0', 2); ctx.fillStyle = 'rgba(40,20,10,.75)'; ctx.beginPath(); ctx.moveTo(4, -11); ctx.lineTo(12, -11); ctx.lineTo(12, 2); ctx.quadraticCurveTo(6, -2, 4, -11); ctx.fill();
      ctx.strokeStyle = 'rgba(60,40,30,.6)'; ctx.lineWidth = 1; for (let i=0;i<3;i++){ ctx.beginPath(); ctx.moveTo(-8, -5 + i*5); ctx.lineTo(4, -5 + i*5); ctx.stroke(); } break;
    case 'glass': ctx.beginPath(); ctx.moveTo(-10, 6); ctx.lineTo(-4, -10); ctx.lineTo(9, -6); ctx.lineTo(6, 9); ctx.closePath(); ctx.fillStyle = 'rgba(140,210,235,.75)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke();
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(0, 0, 16, 'rgba(140,220,240,A)', .5); ctx.restore(); break;
    case 'chalk': ctx.save(); ctx.rotate(-.5); pathRR(ctx, -11, -4, 22, 8, 3); fillInk(ctx, '#F6F2EA', 1.8); ctx.restore(); break;
    default: pathRR(ctx, -11, -13, 22, 26, 2); fillInk(ctx, '#F0E6D0', 2); ctx.strokeStyle = 'rgba(60,40,30,.6)'; ctx.lineWidth = 1; for (let i=0;i<4;i++){ ctx.beginPath(); ctx.moveTo(-7, -7 + i*5); ctx.lineTo(7, -7 + i*5); ctx.stroke(); }
      if (f.icon === 'drawing'){ ctx.strokeStyle = '#C24A4A'; ctx.beginPath(); ctx.moveTo(-6, 9); ctx.lineTo(-6, -3); ctx.moveTo(-2, 9); ctx.lineTo(-2, -3); ctx.stroke(); }
  }
  ctx.restore();
}

// Большая арка главы 6: каменные створки (решётка-gate look:'stone') двигает сам замок, здесь — портал и свет
function archBig(dc){ const x = dc.x, y = dc.y, open = S.flags[dc.open];
  ctx.fillStyle = '#20242E'; ctx.beginPath(); ctx.moveTo(x - 120, y); ctx.lineTo(x - 120, y - 200); ctx.arc(x, y - 200, 120, Math.PI, 0); ctx.lineTo(x + 120, y); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 120, open ? 220 : 120, 'rgba(120,220,235,A)', open ? .45 : .15 + .05*Math.sin(S.time*2)); ctx.restore();
  ctx.fillStyle = '#3A3F4E'; for (let i=0;i<9;i++){ const a = Math.PI + i/8*Math.PI; ctx.save(); ctx.translate(x + Math.cos(a)*120, y - 200 + Math.sin(a)*120); ctx.rotate(a + Math.PI/2); ctx.fillRect(-14, -8, 28, 16); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(-14, -8, 28, 16); ctx.restore(); }
  ctx.save(); ctx.translate(x, y - 330); ctx.scale(1.2, 1.2); lampSign(ctx, 0, 0); ctx.restore();
}
// ---------- Декорации главы 5 ----------
const DECO_EXTRA = {
  arch(dc){ const x = dc.x, y = dc.y; // замурованная арка с медным замком
    if (dc.big){ archBig(dc); return; }
    ctx.fillStyle = '#2A2E3A'; ctx.beginPath(); ctx.moveTo(x - 70, y); ctx.lineTo(x - 70, y - 120); ctx.arc(x, y - 120, 70, Math.PI, 0); ctx.lineTo(x + 70, y); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#3A3F4E'; for (let r=0;r<6;r++) for (let c=0;c<4;c++) ctx.fillRect(x - 60 + c*30 + (r%2)*12, y - 26 - r*26, 26, 22);
    ctx.save(); ctx.translate(x, y - 70); pathRR(ctx, -12, -8, 24, 22, 4); fillInk(ctx, '#B87A3A', 2); ctx.beginPath(); ctx.arc(0, -8, 8, Math.PI, 0); ctx.lineWidth = 4; ctx.strokeStyle = '#8A5A2A'; ctx.stroke(); ctx.restore(); },
  hall(dc){ const x = dc.x, y = dc.y, w = (dc.w || 14)*T; // зал Совета: скамьи, помост, знамёна
    for (let i=0;i<5;i++){ const bx = x + 20 + i*(w - 160)/5; ctx.fillStyle = '#4A3424'; ctx.fillRect(bx, y - 30, 90, 10); ctx.fillRect(bx + 4, y - 20, 8, 20); ctx.fillRect(bx + 78, y - 20, 8, 20); ctx.fillRect(bx, y - 56, 90, 8); }
    ctx.fillStyle = '#5A2A30'; for (let i=0;i<3;i++){ const bx = x + 60 + i*(w/3); ctx.fillRect(bx, y - 300, 50, 120); ctx.beginPath(); ctx.moveTo(bx, y - 180); ctx.lineTo(bx + 25, y - 160); ctx.lineTo(bx + 50, y - 180); ctx.fill();
      ctx.save(); ctx.translate(bx + 25, y - 245); ctx.scale(.9, .9); lampSign(ctx, 0, 0); ctx.restore(); } },
  podium(dc){ const x = dc.x, y = dc.y; pathRR(ctx, x - 60, y - 70, 120, 70, 4); fillInk(ctx, '#5A3A28', 2.5); ctx.fillStyle = '#7A1E2A'; ctx.fillRect(x - 50, y - 64, 100, 16); },
  glass(dc){ const x = dc.x, y = dc.y; // витраж
    ctx.save(); ctx.fillStyle = '#1A1626'; ctx.beginPath(); ctx.moveTo(x - 40, y); ctx.lineTo(x - 40, y - 120); ctx.arc(x, y - 120, 40, Math.PI, 0); ctx.lineTo(x + 40, y); ctx.closePath(); ctx.fill(); ctx.clip();
    const cols = ['rgba(240,160,80,.55)','rgba(120,170,240,.5)','rgba(200,90,110,.5)','rgba(150,220,160,.45)'];
    for (let i=0;i<8;i++) for (let j=0;j<4;j++){ ctx.fillStyle = cols[(i + j) % 4]; ctx.fillRect(x - 40 + j*20, y - 160 + i*20, 19, 19); }
    ctx.restore(); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 90, 120, 'rgba(255,220,170,A)', .12); ctx.restore(); },
  books(dc){ const x = dc.x, y = dc.y, w = (dc.w || 4)*T, h = (dc.h || 5)*T; // стеллаж с книгами (фон)
    ctx.fillStyle = '#3A2A1E'; ctx.fillRect(x, y - h, w, h); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(x, y - h, w, h);
    for (let yy = y - h + 6; yy < y - 10; yy += 36){ ctx.fillStyle = '#24180F'; ctx.fillRect(x + 4, yy + 28, w - 8, 5);
      for (let xx = x + 8; xx < x + w - 10; xx += 9){ const hh = 18 + (hash(xx, yy, 3) % 9); ctx.fillStyle = ['#7A3A2A','#3A5A6A','#8A7A3A','#4A3A5A','#5A6A3A'][hash(xx, yy, 1) % 5]; ctx.fillRect(xx, yy + 28 - hh, 7, hh); } } },
  // ----- глава 6 -----
  storeroom(dc){ const x = dc.x, y = dc.y, w = (dc.w || 8)*T; // кладовая мастерской: мешки, полки, бочка, огарок
    ctx.fillStyle = 'rgba(40,28,22,.9)'; ctx.fillRect(x, y - 150, w, 150); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(x, y - 150, w, 150);
    ctx.fillStyle = '#4A3424'; for (const yy of [y - 110, y - 70]) ctx.fillRect(x + 10, yy, w*.45, 6);
    for (let i=0;i<6;i++){ ctx.fillStyle = ['#8A7A5A','#6A5A44','#9A8A6A'][i%3]; ctx.fillRect(x + 16 + i*16, y - 110 - 14 - (i%2)*6, 10, 14 + (i%2)*6); }
    for (const [mx, r] of [[w*.62, 26], [w*.78, 22], [w*.7, 18]]){ ctx.beginPath(); ctx.ellipse(x + mx, y - r*.8, r*1.3, r, 0, 0, Math.PI*2); fillInk(ctx, '#8A7A60', 2); }
    ctx.beginPath(); ctx.ellipse(x + w - 40, y - 30, 20, 30, 0, 0, Math.PI*2); fillInk(ctx, '#6A4A30', 2);
    ctx.fillStyle = '#F2E2B0'; ctx.fillRect(x + w*.5, y - 76, 5, 10); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x + w*.5 + 2, y - 80, 70, 'rgba(255,200,120,A)', .3 + .05*Math.sin(S.time*7)); ctx.restore(); },
  pipe(dc){ const x = dc.x, y = dc.y, w = (dc.w || 10)*T; // трубы коллектора
    for (const [yy, th] of [[y - 120, 18], [y - 80, 12]]){ ctx.fillStyle = '#3A3E44'; ctx.fillRect(x, yy, w, th); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(x, yy + 2, w, 3);
      for (let xx = x + 40; xx < x + w; xx += 120){ ctx.fillStyle = '#2A2C30'; ctx.fillRect(xx, yy - 3, 10, th + 6); } }
    if (Math.random() < .02) sfx.drip(); },
  chimney(dc){ const x = dc.x, y = dc.y; ctx.fillStyle = '#5A3A34'; ctx.fillRect(x - 18, y - 70, 36, 70); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(x - 18, y - 70, 36, 70); ctx.fillStyle = '#3A2624'; ctx.fillRect(x - 22, y - 76, 44, 8);
    ctx.fillStyle = 'rgba(180,170,190,.18)'; for (let i=0;i<3;i++){ const k = (S.time*.3 + i/3) % 1; ctx.beginPath(); ctx.arc(x + Math.sin(k*6)*8, y - 84 - k*80, 8 + k*14, 0, Math.PI*2); ctx.fill(); } },
  pillar(dc){ const x = dc.x, y = dc.y, h = (dc.h || 6)*T; ctx.fillStyle = '#4A5260'; ctx.fillRect(x - 22, y - h, 44, h); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(x - 22, y - h, 44, h);
    ctx.fillStyle = 'rgba(0,0,0,.2)'; for (let xx = x - 14; xx < x + 20; xx += 10) ctx.fillRect(xx, y - h, 3, h);
    ctx.fillStyle = '#3A4250'; ctx.beginPath(); ctx.moveTo(x - 28, y - h); ctx.lineTo(x - 10, y - h - 18); ctx.lineTo(x + 6, y - h - 6); ctx.lineTo(x + 28, y - h - 14); ctx.lineTo(x + 28, y - h); ctx.closePath(); ctx.fill(); },
  hearth(dc){ const x = dc.x, y = dc.y; // древний затухший очаг на краю
    ctx.beginPath(); ctx.moveTo(x - 60, y); ctx.lineTo(x - 50, y - 50); ctx.lineTo(x + 50, y - 50); ctx.lineTo(x + 60, y); ctx.closePath(); fillInk(ctx, '#4A5260', 2.4);
    ctx.beginPath(); ctx.ellipse(x, y - 50, 50, 10, 0, 0, Math.PI*2); fillInk(ctx, '#2A3038', 2);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 54, 70, 'rgba(120,210,230,A)', .18 + .06*Math.sin(S.time*1.3)); ctx.restore(); },
  rail(dc){ const x = dc.x, y = dc.y, w = (dc.w || 6)*T; ctx.fillStyle = '#5A4434'; ctx.fillRect(x, y - 34, w, 6); for (let xx = x; xx <= x + w; xx += 22) ctx.fillRect(xx, y - 34, 5, 34); }
};

// ---------- Глава 7: очаги, колокола, плита Джей, парящие плиты, эхо Мглы ----------
function updateCh7(dt, frozen){
  const W = S.W, p = S.P; if (!W.switches) return;
  const tm = W.timed; for (const id in tm) tm[id] = 0;
  const px = p.x + p.w/2, feet = p.y + p.h;
  for (const s of W.switches){ s.t += dt;
    if (!frozen && s.left > 0){ const was = s.left; s.left = Math.max(0, s.left - dt);
      if (s.kind === 'hearth' && Math.floor(was) !== Math.floor(s.left) && s.left < 3 && s.left > 0 && vis(s.x)) sfx.ember(); // догорает — потрескивает
      if (s.left === 0 && s.kind === 'pedal'){ const j = npc(s.jay); if (j && !j.hidden){ j.say = 'Всё, не держу!'; j.sayT = 1.6; } sfx.lever(); } }
    if (s.kind === 'bell'){ s.cd = Math.max(0, s.cd - dt); s.swing *= Math.exp(-dt*1.6); }
    if (!frozen && S.mode === 'play'){
      if (s.kind === 'hearth' && Math.abs(px - s.x) < 34 && feet > s.y - 40 && feet < s.y + 6 && s.left < s.dur - .4){ // коснулась — очаг вспыхивает (стоишь рядом — горит дальше)
        const first = !s.lit, loud = s.left < 3; s.lit = true; s.left = s.dur; if (loud){ sfx.ignite(); embers(s.x, s.y - 20, 14); buzz(20); }
        if (loud) for (let i=0;i<8;i++) S.particles.push({x:S.V.x, y:S.V.y, vx:(s.x - S.V.x)*2.4 + rnd(-30,30), vy:(s.y - 20 - S.V.y)*2.4 + rnd(-30,30), life:.4, t:0, c:'rgba(255,200,120,.9)', s:2.4, g:0, kind:'dot'}); // Искра подкидывает огонька
        if (first) floatText(s.x, s.y - 70, 'Очаг вспыхнул!', '#FFE3A8'); }
      if (s.kind === 'bell' && s.cd <= 0 && overlap(p, {x:s.x - 20, y:s.y - 52, w:40, h:52})){ // прыгнула в колокол — гул
        s.cd = 1; s.left = s.dur; s.swing = 1; sfx.resonate(); S.shake = Math.max(S.shake, .2); buzz(30); if (p.vy < 0) p.vy = 60;
        for (const k of W.kl) if (Math.hypot(k.x - s.x, k.y - s.y) < s.reach) k.stun = s.dur;
        for (const m of W.moths) if (Math.hypot(m.x - s.x, m.y - s.y) < s.reach) m.stun = s.dur;
        floatText(s.x, s.y - 80, 'Гул!', '#CFE2FF'); }
      if (s.kind === 'pedal' && p.onGround && Math.abs(px - s.x - (s.w - 1)*T/2) < s.w*T/2 + 4 && Math.abs(feet - s.y) < 6){ // Ая на плите — Джей держит
        if (s.left === 0){ sfx.lever(); const j = npc(s.jay); if (j && !j.hidden){ j.say = pick(['Держу! Беги, верхняя!', 'Давай-давай-давай!', 'Пошла!']); j.sayT = 1.6; } }
        s.left = s.dur; }
    }
    if (s.left > 0 && s.id) tm[s.id] = Math.max(tm[s.id] || 0, s.left);
  }
  for (const pr of W.pairs) if (!W.forced[pr.id] && tm[pr.a] > 0 && tm[pr.b] > 0){ // оба канала сошлись
    W.forced[pr.id] = true; S.flags['pair_' + pr.id] = true; sfx.resonate(); S.shake = Math.max(S.shake, .3); buzz(40);
    floatText(S.P.x + 12, S.P.y - 40, 'Два канала!', '#FFE3A8'); saveGame(true); }
}
// парящие плиты и эхо (вызывается из цикла платформ движка)
function moveCh7(m, dt){
  if (m.echo){ m.t += dt; const cyc = m.on + m.off, ph = ((m.t % cyc) + cyc) % cyc, was = m.off;
    m.off = ph >= m.on; m.dx = 0; m.dy = 0;
    m.a = m.off ? 0 : ph < .25 ? ph/.25 : ph > m.on - .7 ? (Math.floor(ph*12) % 2 ? .35 : .8) : 1; // перед исчезновением мигает
    if (was && !m.off && vis(m.x, 0)) sfx.echo();
    return; }
  const W = S.W, on = (W.timed[m.heat] || 0) > 0 || !!W.forced[m.heat], was = m.k;
  m.k = approach(m.k, on ? 1 : 0, dt/(on ? .7 : 1.4));
  const e = m.k < .5 ? 2*m.k*m.k : 1 - Math.pow(-2*m.k + 2, 2)/2, ny = m.y0 + (1 - e)*m.dist;
  m.dy = ny - m.y; m.dx = 0; m.y = ny; m.off = m.k < .2; // опущенная плита не держит
  m.warn = on && (W.timed[m.heat] || 0) < 1.6 && !W.forced[m.heat]; // скоро опустится — мигает
  if (was < 1 && m.k >= 1 && vis(m.x, 0)) sfx.land(.25);
}
function drawCh7Mover(m){
  const x = m.x, y = m.y, w = m.w;
  if (m.echo){ // призрак старого мостика: голубая кладка, мерцание
    ctx.save();
    if (m.off){ ctx.globalAlpha = .18; ctx.setLineDash([5, 7]); ctx.strokeStyle = '#BFE6F2'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, w - 2, 12); ctx.restore(); return; }
    ctx.globalAlpha = .25 + .6*m.a; ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(120,200,230,.55)'; ctx.fillRect(x, y, w, 12); ctx.fillStyle = 'rgba(210,245,255,.8)'; ctx.fillRect(x, y, w, 3);
    ctx.fillStyle = 'rgba(90,160,200,.5)'; for (let xx = x + 10; xx < x + w - 4; xx += 22) ctx.fillRect(xx, y + 4, 2, 8);
    ctx.globalAlpha = .12*m.a; for (let i=0;i<3;i++) ctx.fillRect(x + 6 + i*(w/3), y + 12, 4, 30 + i*8); // «опоры», уходящие в туман
    ctx.restore(); return; }
  // парящая плита: старый камень с тёплыми трещинами
  if (y > S.cam.y + VH + 40) return;
  ctx.fillStyle = INK; ctx.fillRect(x - 1, y - 1, w + 2, 18); ctx.fillStyle = '#4E5866'; ctx.fillRect(x + 1, y + 1, w - 2, 14); ctx.fillStyle = '#66717F'; ctx.fillRect(x + 2, y + 1, w - 4, 3);
  const hot = m.k*(m.warn ? (Math.floor(S.time*8) % 2 ? .3 : 1) : 1);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,170,90,${.15 + .7*hot})`; ctx.lineWidth = 2; ctx.beginPath();
  for (let xx = x + 10, i = 0; xx < x + w - 10; xx += 30, i++){ const s = i % 2 ? 1 : -1; ctx.moveTo(xx, y + 3); ctx.lineTo(xx + 4*s, y + 8); ctx.lineTo(xx + 1, y + 14); ctx.moveTo(xx + 4*s, y + 8); ctx.lineTo(xx + 10*s, y + 10); } ctx.stroke();
  if (hot > .1) glow(x + w/2, y + 8, w*.6, 'rgba(255,160,80,A)', .18*hot); ctx.restore();
}
function drawClot(g, x, y0, wd, hgt){ // сгусток Мглы: клубится, пока не разошёлся
  const a = 1 - g.k; if (a <= .02) return;
  ctx.save(); ctx.globalAlpha = a;
  for (let i=0;i<9;i++){ const yy = y0 + (i + .5)*hgt/9, xx = x + wd/2 + Math.sin(S.time*1.3 + i*1.7)*10;
    ctx.fillStyle = i % 2 ? 'rgba(70,90,130,.85)' : 'rgba(110,130,170,.8)'; ctx.beginPath(); ctx.ellipse(xx, yy, wd*.75 + Math.sin(S.time + i)*6, hgt/9 + 10, 0, 0, Math.PI*2); ctx.fill(); }
  ctx.fillStyle = 'rgba(210,230,255,.7)'; for (let i=0;i<4;i++){ const yy = y0 + ((S.time*20 + i*37) % hgt); ctx.fillRect(x + wd/2 + Math.sin(i*3 + S.time)*12, yy, 2, 2); }
  ctx.restore();
}
function drawCh7(){
  const W = S.W; if (!W.switches) return;
  for (const s of W.switches){ if (!vis(s.x)) continue; const x = s.x, y = s.y, k = s.left/s.dur;
    if (s.kind === 'hearth'){ // каменная чаша, мох, угли; горит — пламя и кольцо-таймер
      ctx.beginPath(); ctx.moveTo(x - 30, y); ctx.lineTo(x - 26, y - 18); ctx.lineTo(x + 26, y - 18); ctx.lineTo(x + 30, y); ctx.closePath(); fillInk(ctx, '#55606A', 2.2);
      ctx.beginPath(); ctx.ellipse(x, y - 18, 26, 6, 0, 0, Math.PI*2); fillInk(ctx, '#2A2E34', 2); ctx.fillStyle = '#4E8A84'; for (const dx of [-22, -12, 14, 22]) ctx.fillRect(x + dx - 3, y - 6, 6, 3); // синий мох
      ctx.fillStyle = s.left > 0 ? '#FF9A4A' : '#5A4440'; for (const dx of [-12, -4, 5, 13]){ ctx.beginPath(); ctx.arc(x + dx, y - 19, 3.4, 0, Math.PI*2); ctx.fill(); }
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      if (s.left > 0){ glow(x, y - 30, 90, 'rgba(255,170,90,A)', .3 + .25*k);
        for (let i=0;i<3;i++){ const fh = (18 + 10*Math.sin(S.time*9 + i*2))*(.5 + .5*k); ctx.fillStyle = i === 1 ? 'rgba(255,230,160,.85)' : 'rgba(255,140,70,.7)';
          ctx.beginPath(); ctx.moveTo(x - 18 + i*12, y - 19); ctx.quadraticCurveTo(x - 12 + i*12, y - 19 - fh*1.4, x - 6 + i*12, y - 19); ctx.fill(); } }
      else glow(x, y - 20, 40, 'rgba(120,210,230,A)', .1 + .06*Math.sin(S.time*2)); // спит: еле теплится синим
      ctx.restore();
      if (s.left > 0){ ctx.strokeStyle = 'rgba(255,227,168,.25)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y - 56, 14, 0, Math.PI*2); ctx.stroke();
        ctx.strokeStyle = k < .3 ? '#FF8A5A' : '#FFE3A8'; ctx.beginPath(); ctx.arc(x, y - 56, 14, -Math.PI/2, -Math.PI/2 + Math.PI*2*k); ctx.stroke(); } }
    else if (s.kind === 'bell'){ // бронзовый колокол без языка, бирюзовый налёт; качается от удара
      ctx.strokeStyle = '#2A2A30'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y - 52); ctx.lineTo(x, y - 52 - 5*T); ctx.stroke();
      ctx.save(); ctx.translate(x, y - 52); ctx.rotate(Math.sin(s.t*7)*.35*s.swing);
      ctx.beginPath(); ctx.moveTo(-8, 0); ctx.quadraticCurveTo(-12, 4, -14, 26); ctx.quadraticCurveTo(-22, 46, -26, 50); ctx.lineTo(26, 50); ctx.quadraticCurveTo(22, 46, 14, 26); ctx.quadraticCurveTo(12, 4, 8, 0); ctx.closePath(); fillInk(ctx, '#8A6A3A', 2.4);
      ctx.fillStyle = 'rgba(80,190,170,.55)'; ctx.fillRect(-16, 30, 10, 6); ctx.fillRect(6, 18, 7, 9); ctx.fillRect(-4, 40, 14, 5); // патина
      ctx.fillStyle = '#5A4424'; ctx.fillRect(-24, 46, 48, 4);
      ctx.restore();
      if (s.left > 0){ const tt = s.dur - s.left; for (let i=0;i<3;i++){ const q = ((tt*.7 + i/3) % 1); ctx.strokeStyle = `rgba(180,215,255,${.5*(1 - q)*Math.min(1, s.left)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y - 30, 20 + q*s.reach*.5, 0, Math.PI*2); ctx.stroke(); } }
      else if (s.cd <= 0){ ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 26, 40, 'rgba(160,220,255,A)', .1 + .07*Math.sin(S.time*3)); ctx.restore(); } }
    else if (s.kind === 'pedal'){ const w = s.w*T, bx = x - 16; // каменная плита с медным ободом
      ctx.fillStyle = INK; ctx.fillRect(bx - 1, y - 7, w + 2, 8); ctx.fillStyle = s.left > 0 ? '#C9A15A' : '#8A6A3A'; ctx.fillRect(bx + 1, y - 6, w - 2, 6);
      if (s.left > 0){ ctx.fillStyle = '#FFE3A8'; ctx.fillRect(bx + 1, y - 10, (w - 2)*k, 3); }
      else { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(bx + w/2, y - 6, 34, 'rgba(255,210,140,A)', .15 + .1*Math.sin(S.time*4)); ctx.restore(); } }
  }
}
// ---------- Декорации главы 7 ----------
Object.assign(DECO_EXTRA, {
  vhouse(dc){ const x = dc.x, y = dc.y, w = (dc.w || 6)*T, h = (dc.h || 5)*T; // затонувший дом Долины: тёмные арочные окна, кое-где тёплый огонёк
    if (x > S.cam.x + VW + 40 || x + w < S.cam.x - 40) return;
    ctx.fillStyle = '#2A3440'; ctx.fillRect(x, y - h, w, h); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(x, y - h, w, h);
    for (let yy = y - h + 18; yy < y - 30; yy += 46) for (let xx = x + 14; xx < x + w - 24; xx += 40){ const lit = hash(xx|0, yy|0, 5) % 7 === 0;
      ctx.fillStyle = lit ? '#E89A4A' : '#141A22'; ctx.beginPath(); ctx.moveTo(xx, yy + 24); ctx.lineTo(xx, yy + 8); ctx.arc(xx + 9, yy + 8, 9, Math.PI, 0); ctx.lineTo(xx + 18, yy + 24); ctx.closePath(); ctx.fill();
      if (lit){ ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(xx + 9, yy + 14, 30, 'rgba(255,170,90,A)', .25); ctx.restore(); } }
    ctx.fillStyle = 'rgba(80,140,130,.35)'; for (let i=0;i<4;i++) ctx.fillRect(x + (hash(i, x|0, 2) % (w - 10)), y - h, 6, 20 + i*10); },
  statue(dc){ const x = dc.x, y = dc.y, h = (dc.h || 6)*T; // основатель Долины с чашей огня в руках
    ctx.fillStyle = '#3A4450'; ctx.fillRect(x - 30, y - 24, 60, 24); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(x - 30, y - 24, 60, 24);
    ctx.beginPath(); ctx.moveTo(x - 18, y - 24); ctx.lineTo(x - 22, y - h + 50); ctx.quadraticCurveTo(x, y - h + 30, x + 22, y - h + 50); ctx.lineTo(x + 18, y - 24); ctx.closePath(); fillInk(ctx, '#4E5866', 2);
    ctx.beginPath(); ctx.arc(x, y - h + 30, 14, 0, Math.PI*2); fillInk(ctx, '#4E5866', 2);
    ctx.beginPath(); ctx.ellipse(x, y - h + 64, 18, 6, 0, 0, Math.PI*2); fillInk(ctx, '#3A4450', 2);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - h + 58, 40, 'rgba(120,210,230,A)', .15 + .05*Math.sin(S.time*1.5 + x)); ctx.restore(); },
  kiln(dc){ const x = dc.x, y = dc.y; // печь стеклодувов
    ctx.beginPath(); ctx.moveTo(x - 50, y); ctx.lineTo(x - 44, y - 90); ctx.quadraticCurveTo(x, y - 130, x + 44, y - 90); ctx.lineTo(x + 50, y); ctx.closePath(); fillInk(ctx, '#5A4840', 2.4);
    ctx.beginPath(); ctx.arc(x, y - 40, 18, Math.PI, 0); ctx.lineTo(x + 18, y - 10); ctx.lineTo(x - 18, y - 10); ctx.closePath(); ctx.fillStyle = '#2A1A14'; ctx.fill();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 30, 40, 'rgba(255,150,80,A)', .2 + .06*Math.sin(S.time*2 + x)); ctx.restore();
    ctx.fillStyle = 'rgba(160,220,240,.5)'; for (let i=0;i<3;i++){ ctx.beginPath(); ctx.arc(x - 30 + i*30, y - 100 - (i%2)*6, 5, 0, Math.PI*2); ctx.fill(); } }, // стеклянные шары на полке
  winch(dc){ const x = dc.x, y = dc.y; // торговая лебёдка: барабан и канат, уходящий вверх в туман
    ctx.strokeStyle = '#B8A07A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - 40); ctx.lineTo(x, y - 40 - 14*T); ctx.stroke();
    ctx.fillStyle = '#3A2E26'; ctx.fillRect(x - 26, y - 50, 8, 50); ctx.fillRect(x + 18, y - 50, 8, 50);
    ctx.beginPath(); ctx.arc(x, y - 40, 16, 0, Math.PI*2); fillInk(ctx, '#6A5040', 2); ctx.beginPath(); ctx.arc(x, y - 40, 5, 0, Math.PI*2); fillInk(ctx, '#C9A15A', 1.4); },
  heartgate(dc){ const x = dc.x, y = dc.y; // ворота Сердца Долины: решётка, за ней бьётся чистый свет
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 160, 260 + 20*Math.sin(S.time*2.4), 'rgba(255,220,150,A)', .3); glow(x, y - 160, 120, 'rgba(160,230,255,A)', .35 + .1*Math.sin(S.time*3)); ctx.restore();
    ctx.fillStyle = '#232830'; ctx.beginPath(); ctx.moveTo(x - 150, y); ctx.lineTo(x - 150, y - 230); ctx.arc(x, y - 230, 150, Math.PI, 0); ctx.lineTo(x + 150, y); ctx.lineTo(x + 110, y); ctx.lineTo(x + 110, y - 230); ctx.arc(x, y - 230, 110, 0, Math.PI, true); ctx.lineTo(x - 110, y); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = '#3E4652'; for (let i=-4;i<=4;i++) ctx.fillRect(x + i*24 - 3, y - 330 + Math.abs(i)*12, 6, 330 - Math.abs(i)*12);
    for (const yy of [y - 90, y - 190]) ctx.fillRect(x - 108, yy, 216, 7);
    ctx.save(); ctx.translate(x, y - 405); ctx.scale(1.3, 1.3); lampSign(ctx, 0, 0); ctx.restore(); },
  shard(dc){ const x = dc.x, y = dc.y; // светящиеся кристаллы у дороги
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 14, 34, 'rgba(140,220,240,A)', .25 + .1*Math.sin(S.time*2 + x)); ctx.restore();
    for (const [dx, hh, a] of [[-8, 22, -.3], [0, 32, 0], [9, 18, .35]]){ ctx.save(); ctx.translate(x + dx, y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(0, -hh); ctx.lineTo(5, 0); ctx.closePath(); fillInk(ctx, 'rgba(150,220,240,.85)', 1.6); ctx.restore(); } }
});

// ---------- Глава 8: цепь древнего моста ----------
function updateCh8(dt, frozen){
  const W = S.W; if (!W.chains) return;
  for (const f of W.slowFades){ // оседающая плита: сначала трещина и скрип, потом уходит вниз
    if (f.state === 'shake' && !f.warned){ f.warned = true; if (vis(f.c*T)) sfx.creak(); }
    else if (f.state === 'ok') f.warned = false; }
  for (const ch of W.chains){ ch.t += dt;
    if (ch.state === 'strain' && !frozen){ ch.next = (ch.next ?? 0) - dt;
      if (ch.next <= 0){ ch.next = .6 + Math.random()*.8; if (vis(ch.x0, 300)) sfx.strain(); S.shake = Math.max(S.shake, .12);
        burst(ch.x0, ch.y0 + 8, 6, ['#8A8070','#6A6050','#4A4238'], {angle:Math.PI/2, spread:.8, min:20, max:90, g:700, lmax:.9}); } } // осыпь у анкера
  }
}
// цепь натягивает или отпускает плиты моста (вызывается из цикла платформ)
function moveSpan(m, dt){
  const ch = S.W.chains.find(c => c.id === m.span), broken = ch && ch.state === 'broken';
  if (!broken){ m.dx = 0; m.dy = 0; m.off = false; if (ch && ch.state === 'strain'){ const j = Math.sin(S.time*31 + m.x0)*1.2; m.dy = (m.y0 + j) - m.y; m.y = m.y0 + j; } return; }
  if (m.y > S.W.h + 200){ m.dy = 0; m.off = true; return; } // упала за край мира — дальше не считаем
  m.vy = Math.min(m.vy + 2200*dt, 1400); const ny = m.y + m.vy*dt; m.dy = ny - m.y; m.y = ny; m.off = true; // оборвалась — плита уходит вниз, на ней не устоять
}
function chainSet(id, state){ const ch = S.W.chains.find(c => c.id === id); if (!ch || ch.state === state || ch.state === 'broken') return ch; // обрыв — один раз и навсегда
  ch.state = state; ch.t = 0;
  if (state === 'broken'){ sfx.snap(); S.shake = 1; camKick(8); buzz(80); S.flags['chain_' + id] = 'broken';
    smokePuff(ch.x0, ch.y0, 30); burst(ch.x0, ch.y0, 24, ['#8A8070','#6A6050','#4A4238'], {min:80, max:320, g:900}); }
  return ch; }
// смерть до финальной сцены: нагруженная цепь возвращается в исходное, плиты — на место
function resetCh8(){ const W = S.W; if (!W.chains) return;
  for (const ch of W.chains) if (ch.state === 'strain' && !ch.held){ ch.state = 'fixed'; ch.t = 0; } // держат цепь — после смерти так и держат
  for (const m of W.movers) if (m.span !== undefined && S.flags['chain_' + m.span] !== 'broken'){ m.y = m.y0; m.vy = 0; m.off = false; } }
function drawChain(ch){
  const {x0, y0, x1, y1} = ch; if (Math.max(x0, x1) < S.cam.x - 60 || Math.min(x0, x1) > S.cam.x + VW + 60) return;
  const len = Math.hypot(x1 - x0, y1 - y0), n = Math.max(6, Math.round(len/14));
  const tight = ch.state === 'strain' ? 1 : 0, jit = tight ? 1.6 : 0, sag = ch.sag*(1 - tight*.85);
  const pt = k => { const s = Math.sin(k*Math.PI); return [x0 + (x1 - x0)*k + (jit ? Math.sin(S.time*40 + k*9)*jit : 0), y0 + (y1 - y0)*k + sag*s + (jit ? Math.cos(S.time*37 + k*7)*jit : 0)]; };
  ctx.save(); ctx.lineCap = 'round';
  if (ch.state === 'broken'){ // два обрывка: от анкера свисает, второй конец улетел вниз
    const drop = Math.min(1, ch.t/1.2);
    ctx.strokeStyle = '#2A2A30'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, y0);
    for (let i=1;i<=6;i++){ const k = i/6; ctx.lineTo(x0 + Math.sin(ch.t*3 + k*2)*6*(1 - drop*.6)*k, y0 + k*90*drop + k*12); } ctx.stroke();
    ctx.restore(); return; }
  for (let i=0;i<n;i++){ const [ax, ay] = pt(i/n), [bx, by] = pt((i + 1)/n), cx = (ax + bx)/2, cy = (ay + by)/2, a = Math.atan2(by - ay, bx - ax);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(a); ctx.strokeStyle = INK; ctx.lineWidth = 4.4;
    if (i % 2){ ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.stroke(); ctx.strokeStyle = '#7A7468'; ctx.lineWidth = 2.4; ctx.stroke(); }
    else { ctx.beginPath(); ctx.ellipse(0, 0, 7.5, 4, 0, 0, Math.PI*2); ctx.stroke(); ctx.strokeStyle = '#8A8478'; ctx.lineWidth = 2.2; ctx.stroke(); }
    ctx.restore(); }
  ctx.fillStyle = '#3A3F4E'; ctx.fillRect(x0 - 14, y0 - 12, 28, 24); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(x0 - 14, y0 - 12, 28, 24); // анкер в стене
  ctx.fillStyle = '#6A6458'; ctx.beginPath(); ctx.arc(x0, y0, 6, 0, Math.PI*2); ctx.fill();
  if (ch.state === 'strain'){ ctx.strokeStyle = 'rgba(20,16,14,.8)'; ctx.lineWidth = 1.6; ctx.beginPath(); // трещины вокруг анкера растут
    const g = Math.min(1, ch.t/6); ctx.moveTo(x0 + 14, y0 - 6); ctx.lineTo(x0 + 14 + 16*g, y0 - 14*g); ctx.moveTo(x0 - 14, y0 + 8); ctx.lineTo(x0 - 14 - 12*g, y0 + 18*g); ctx.stroke(); }
  if (ch.held){ const [sx, sy] = pt(.12); ctx.save(); ctx.translate(sx, sy); ctx.rotate(.5 + Math.sin(S.time*20)*.05); ctx.fillStyle = '#B8863A'; ctx.fillRect(-3, -14, 6, 28); ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.strokeRect(-3, -14, 6, 28); ctx.restore(); } // стопор в звене
  ctx.restore();
}
function drawSpan(m){ // плита моста: тёсаный камень, кольцо под цепь
  const x = m.x, y = m.y, w = m.w; if (x + w < S.cam.x - 40 || x > S.cam.x + VW + 40) return;
  ctx.fillStyle = INK; ctx.fillRect(x - 1, y - 1, w + 2, 22); ctx.fillStyle = '#5A6270'; ctx.fillRect(x + 1, y + 1, w - 2, 18); ctx.fillStyle = '#727B88'; ctx.fillRect(x + 2, y + 1, w - 4, 3);
  ctx.fillStyle = 'rgba(0,0,0,.2)'; for (let xx = x + 30; xx < x + w - 4; xx += 32) ctx.fillRect(xx, y + 4, 2, 15);
  ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + w/2, y - 2, 5, Math.PI, 0); ctx.stroke();
}
function drawWinch(kl){ const x = kl.x, y = kl.y; // лебёдка: стойки, барабан с цепью, медная ручка
  ctx.fillStyle = '#3A2E26'; ctx.fillRect(x - 22, y - 46, 7, 46); ctx.fillRect(x + 15, y - 46, 7, 46);
  ctx.beginPath(); ctx.arc(x, y - 34, 15, 0, Math.PI*2); fillInk(ctx, '#5A5A62', 2);
  const a = kl.done ? 0 : kl.t*4; ctx.save(); ctx.translate(x, y - 34); ctx.rotate(a); ctx.strokeStyle = '#B8863A'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -24); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -26, 4, 0, Math.PI*2); fillInk(ctx, '#D9A85A', 1.4); ctx.restore();
  if (kl.near || kl.t > 0){ ctx.strokeStyle = 'rgba(255,227,168,.35)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y - 34, 30, 0, Math.PI*2); ctx.stroke();
    ctx.strokeStyle = '#FFE3A8'; ctx.beginPath(); ctx.arc(x, y - 34, 30, -Math.PI/2, -Math.PI/2 + Math.PI*2*Math.min(1, kl.t/kl.need)); ctx.stroke(); }
  if (kl.near && kl.t === 0){ ctx.font = `800 14px ${SANS}`; ctx.textAlign = 'center'; ctx.fillStyle = '#FFE3A8'; ctx.fillText(fmtHint('Держи {down} — крутить лебёдку'), x, y - 76); }
  if (kl.done){ ctx.fillStyle = '#B8863A'; ctx.fillRect(x + 10, y - 26, 10, 4); } // стопор щёлкнул
}
function drawCh8(){
  const W = S.W; if (!W.chains) return;
  for (const f of W.slowFades) if (f.state === 'shake'){ const x = f.c*T, y = f.r*T, k = Math.min(1, f.t/1.5); // трещина по оседающей плите
    ctx.strokeStyle = `rgba(20,14,10,${.5 + .4*k})`; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x + 6, y + 2); ctx.lineTo(x + 6 + 10*k, y + 6); ctx.lineTo(x + 12 + 12*k, y + 3 + 6*k); ctx.stroke(); }
  for (const ch of W.chains) drawChain(ch);
}

// ---------- Декорации главы 8 ----------
Object.assign(DECO_EXTRA, {
  firstfire(dc){ const x = dc.x, y = dc.y, r = (dc.r || 4)*T, t = S.time, hurt = S.flags.fireTorn && !S.flags.fireSplit; // Первый Огонь: живой тёплый свет
    const pulse = 1 + .06*Math.sin(t*1.6) + (hurt ? .12*Math.sin(t*23) : 0);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glow(x, y, r*3.2*pulse, 'rgba(255,200,130,A)', .22); glow(x, y, r*1.8*pulse, 'rgba(255,230,170,A)', .35); glow(x, y, r*.9*pulse, 'rgba(190,240,255,A)', .5);
    ctx.fillStyle = 'rgba(255,248,225,.9)'; ctx.beginPath(); ctx.arc(x, y, r*.42*pulse, 0, Math.PI*2); ctx.fill();
    for (let i=0;i<14;i++){ const a = t*.4 + i/14*Math.PI*2, d = r*(.7 + .25*Math.sin(t*1.3 + i)); ctx.fillStyle = i % 2 ? 'rgba(255,214,140,.8)' : 'rgba(170,225,245,.8)'; ctx.fillRect(x + Math.cos(a)*d, y + Math.sin(a)*d*.6, 3, 3); }
    if (S.flags.fireSplit){ for (const dir of [-1, 1]){ const g = ctx.createLinearGradient(x, y, x + dir*r*4, y - (dir < 0 ? r*3 : 0)); g.addColorStop(0, 'rgba(255,220,150,.5)'); g.addColorStop(1, 'rgba(255,220,150,0)'); // два потока
      ctx.strokeStyle = g; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + dir*r*2, y - r*(dir < 0 ? 2.4 : .4), x + dir*r*4, y - (dir < 0 ? r*3 : 0)); ctx.stroke(); } }
    ctx.restore();
    ctx.strokeStyle = 'rgba(200,160,90,.55)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(x, y, r*1.3, r*.5, 0, 0, Math.PI*2); ctx.stroke(); // медное кольцо резонатора
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke(); },
  gutters(dc){ const x = dc.x, y = dc.y, w = (dc.w || 10)*T, W = S.W; // два каменных желоба: светятся, когда по ним идёт огонь
    if (x > S.cam.x + VW + 40 || x + w < S.cam.x - 40) return;
    const on = id => (W.timed[id] || 0) > 0 || !!W.forced[dc.out];
    for (const [id, dy] of [[dc.a, -6], [dc.b, -16]]){ ctx.fillStyle = '#2A2E36'; ctx.fillRect(x, y + dy - 3, w, 6);
      if (on(id)){ ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,200,120,${.55 + .2*Math.sin(S.time*6 + dy)})`; ctx.fillRect(x, y + dy - 1.5, w, 3); ctx.restore(); } }
    if (W.forced[dc.out]){ ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x + w/2, y - 12, w*.4, 'rgba(255,210,140,A)', .14); ctx.restore(); } },
  glove(dc){ if (!S.flags[dc.flag || 'glove']) return; const x = dc.x, y = dc.y; // белая перчатка на краю
    ctx.save(); ctx.translate(x, y - 4); ctx.rotate(-.2); pathRR(ctx, -9, -5, 18, 9, 4); fillInk(ctx, '#EDE6DA', 1.6);
    for (let i=0;i<4;i++){ pathRR(ctx, 6 + i*0, -6 + i*3, 8, 3, 1.5); fillInk(ctx, '#EDE6DA', 1); } ctx.restore(); }
});
