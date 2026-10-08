"use strict";
/* =====================================================================
   Механики главы 5: колокол-ориентир, оседающие плиты, хрупкие полки, рычаги и стеллажи,
   стража гильдии (зоны видимости), спокойно поднимающаяся Мгла, именные находки.
   Подключается после engine.js; движок вызывает extendBuilder / parseMech / updateMech / drawMech.
   ===================================================================== */

// ---------- Помощники для build(h) ----------
function extendBuilder(h, out, F){
  out.levers = []; out.guards = []; out.bells = []; out.findInfo = {}; out.slow = []; out.brittle = [];
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
    bell(c, r){ out.bells.push({x:c*T + 16, y:r*T, reached:false, t:0}); }
  });
}
function parseMech(W, out){
  W.levers = out.levers || []; W.guards = out.guards || []; W.bells = out.bells || [];
  for (const k of out.slow || []) if (W.fades[k]) W.fades[k].slow = true;
  for (const k of out.brittle || []) if (W.fades[k]) W.fades[k].brittle = true;
  for (const f of W.finds){ const info = (out.findInfo || {})[Math.floor((f.x - 16)/T) + ',' + Math.round(f.y/T - 1)]; if (info){ f.name = info.name; f.icon = info.icon; } }
  W.bellT = 2;
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
  shelf(){ noise(.6, .03, 400, .6, 0, 'lowpass'); }
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
  const W = S.W; if (!W.levers) return;
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
    if (g.chase){ drawCharAt('guard', g.x, g.y, g.dir, {t:S.time + g.t, phase:S.time*14, run:1, blink:false}, 1, 1, 1); if (g.sayT > 0) bubble(g.x, g.y - 96, g.say, '#3A4A6A'); continue; }
    const len = g.see*T, a = .1 + g.alert*.35; // конус взгляда
    const gr = ctx.createLinearGradient(g.x, 0, g.x + g.dir*len, 0); gr.addColorStop(0, `rgba(255,230,150,${a})`); gr.addColorStop(1, 'rgba(255,230,150,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(g.x + g.dir*8, g.y - 46); ctx.lineTo(g.x + g.dir*len, g.y - 80); ctx.lineTo(g.x + g.dir*len, g.y + 4); ctx.lineTo(g.x + g.dir*8, g.y - 30); ctx.closePath(); ctx.fill();
    drawCharAt('guard', g.x, g.y, g.dir, {t:S.time + g.t, phase:g.t*6, run:g.wait > 0 ? 0 : .45, blink:(g.t % 3.4) < .12}, 1, 1, 1);
    // фонарь в руке стражника
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(g.x + g.dir*16, g.y - 30, 50, 'rgba(255,210,140,A)', .3); ctx.restore();
    if (g.alert > .05){ ctx.font = `900 ${18 + g.alert*8}px ${SANS}`; ctx.textAlign = 'center'; ctx.fillStyle = `rgba(255,${200 - g.alert*140|0},90,${g.alert})`; ctx.fillText(g.alert > .6 ? '!' : '?', g.x, g.y - 82); }
    if (g.sayT > 0) bubble(g.x, g.y - 96, g.say, '#3A4A6A');
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
    default: pathRR(ctx, -11, -13, 22, 26, 2); fillInk(ctx, '#F0E6D0', 2); ctx.strokeStyle = 'rgba(60,40,30,.6)'; ctx.lineWidth = 1; for (let i=0;i<4;i++){ ctx.beginPath(); ctx.moveTo(-7, -7 + i*5); ctx.lineTo(7, -7 + i*5); ctx.stroke(); }
      if (f.icon === 'drawing'){ ctx.strokeStyle = '#C24A4A'; ctx.beginPath(); ctx.moveTo(-6, 9); ctx.lineTo(-6, -3); ctx.moveTo(-2, 9); ctx.lineTo(-2, -3); ctx.stroke(); }
  }
  ctx.restore();
}

// ---------- Декорации главы 5 ----------
const DECO_EXTRA = {
  arch(dc){ const x = dc.x, y = dc.y; // замурованная арка с медным замком
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
  rail(dc){ const x = dc.x, y = dc.y, w = (dc.w || 6)*T; ctx.fillStyle = '#5A4434'; ctx.fillRect(x, y - 34, w, 6); for (let xx = x; xx <= x + w; xx += 22) ctx.fillRect(xx, y - 34, 5, 34); }
};
