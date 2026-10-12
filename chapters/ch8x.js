"use strict";
/* =====================================================================
   ГЛАВА 8. Скрытая сцена «Странник жив» — только для игрока, после финальных слов.
   Три плана, 26 секунд, без слов.
   1. Дно. Сыплется песок, висит оборванная цепь. Из-под плиты видна рука в перчатке, рядом звено со стопором.
      Падает камешек, пальцы вздрагивают и сжимают звено.
   2. Лицо в темноте. Глаза закрыты, потом приоткрываются, потом открываются. Изо рта идёт пар — он дышит.
   3. Общий план. Он пробует подняться на локте и падает. С края тянет холодом, шарф относит ветром.
      Рядом загорается маленький огонёк, взлетает и подлетает к руке. Он отпускает звено и подтягивается к огоньку,
      огонёк улетает к свету в проходе. Затемнение.
      В темноте дважды вспыхивает знак на перчатке, как удар сердца.
   Три плана — три кадра сцены hidden в chapters/ch8.js: STRANGER_SHOTS[0..2](время кадра в секундах).
   Черновик для просмотра отдельно от игры — _stranger.html (не выкладывать).
   ===================================================================== */
const STRANGER_SHOTS = (() => {
const A1 = 8.5, B1 = 15; // начало второго и третьего плана
const COLD = 'rgba(120,196,214,A)', AMB = 'rgba(232,162,58,A)', TQ = 'rgba(79,216,224,A)';
const ease = k => k <= 0 ? 0 : k >= 1 ? 1 : k*k*(3 - 2*k);
const seg = (x, a, b) => ease((x - a)/(b - a));
function hash(a, b, c){ let h = (a*374761393 + b*668265263 + c*1274126177)|0; h = Math.imul(h ^ (h >>> 13), 1274126177); return (h ^ (h >>> 16)) >>> 0; }
const rnd = (i, j) => (hash(i, j, 7) % 10000)/10000;
function glow(x, y, r, col, a){ if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 1, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r*2, r*2); }
function light(x, y, r, col, a){ ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y, r, col, a); ctx.restore(); }
function bg(top, bot){ const g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, top); g.addColorStop(1, bot); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH); }
function vignette(a = .85){ const g = ctx.createRadialGradient(VW/2, VH*.55, VH*.25, VW/2, VH*.55, VW*.62); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH); }
function black(a){ if (a > 0){ ctx.fillStyle = `rgba(0,0,0,${Math.min(1, a)})`; ctx.fillRect(0, 0, VW, VH); } }
// туман: полосы, которые ползут вбок; wind — сила сквозняка (0..1)
function mist(y0, t, n, a, wind = 0){ for (let i = 0; i < n; i++){ const sp = .35 + i*.12 + wind*2.2;
  ctx.fillStyle = `rgba(110,170,190,${a*(1 - i/(n + 1))})`; ctx.beginPath(); ctx.moveTo(0, VH);
  for (let x = 0; x <= VW; x += 24) ctx.lineTo(x, y0 + i*20 + Math.sin(x*.011 - t*sp + i*1.7)*9 + Math.sin(x*.027 + t*.5 + i)*4);
  ctx.lineTo(VW, VH); ctx.closePath(); ctx.fill(); } }
// пылинки в воздухе; drift — снос вбок
function motes(t, n, a, drift = 0, seed = 1){ for (let i = 0; i < n; i++){ const x = ((rnd(i, seed)*VW + t*(6 + rnd(i, seed + 1)*8) + drift) % (VW + 40) + VW + 40) % (VW + 40) - 20;
  const y = rnd(i, seed + 2)*VH + Math.sin(t*.6 + i)*12, s = 1 + rnd(i, seed + 3)*1.8; ctx.fillStyle = `rgba(190,215,225,${a*(.4 + .6*rnd(i, seed + 4))})`; ctx.fillRect(x, y, s, s); } }
// струйка песка сверху; bend — насколько её сносит сквозняком
function sand(x, yTop, yBot, t, n, a, bend = 0){ for (let i = 0; i < n; i++){ const k = ((t*.55 + i/n) % 1), y = yTop + (yBot - yTop)*k;
  const xx = x + (rnd(i, 11) - .5)*7 + bend*k*k*60; ctx.fillStyle = `rgba(200,205,200,${a*(.5 + .5*rnd(i, 12))})`; ctx.fillRect(xx, y, 1.6, 2.6); }
  light(x, yBot, 50, COLD, .06*a/.5); }
// оборванная цепь: звенья вдоль кривой сверху вниз, последнее разорвано
function chain(x0, y0, x1, y1, t, s = 1, sway = 0){ const n = Math.round(Math.hypot(x1 - x0, y1 - y0)/(17*s));
  for (let i = 0; i <= n; i++){ const u = i/n, sw = Math.sin(t*.8)*sway*u*u, x = x0 + (x1 - x0)*u + sw + Math.sin(u*Math.PI)*14*s, y = y0 + (y1 - y0)*u;
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(y1 - y0, x1 - x0 + sw) - Math.PI/2);
    ctx.lineWidth = 4.2*s; ctx.strokeStyle = '#0B0E12'; ctx.beginPath();
    if (i % 2){ ctx.ellipse(0, 0, 2.4*s, 10*s, 0, 0, Math.PI*2); } else { ctx.ellipse(0, 0, 6.5*s, 10*s, 0, 0, i === n ? Math.PI*1.25 : Math.PI*2); }
    ctx.stroke(); ctx.lineWidth = 1.2*s; ctx.strokeStyle = 'rgba(120,180,200,.32)'; ctx.stroke(); ctx.restore(); } }
// звено со стопором, лежит на камне
function link(x, y, s, glint = 0, rot = 0){ ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.lineWidth = 6; ctx.strokeStyle = '#151A20'; ctx.beginPath(); ctx.ellipse(0, 0, 18, 9, 0, 0, Math.PI*2); ctx.stroke();
  ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(140,190,205,.45)'; ctx.beginPath(); ctx.ellipse(0, -1, 18, 9, 0, Math.PI*1.1, Math.PI*1.9); ctx.stroke();
  ctx.fillStyle = '#5A4630'; ctx.beginPath(); ctx.moveTo(-4, -16); ctx.lineTo(5, -16); ctx.lineTo(2, 12); ctx.lineTo(-1, 12); ctx.closePath(); ctx.fill(); // медный стопор поперёк звена
  ctx.fillStyle = 'rgba(232,180,110,.5)'; ctx.fillRect(-2, -15, 2, 22);
  ctx.restore(); if (glint > 0) light(x - 8*s, y - 6*s, 26*s, AMB, .5*glint); }
// сломанный знак фонарщиков на перчатке
function sign(x, y, s, a){ ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.lineWidth = 2; ctx.strokeStyle = `rgba(150,160,175,${.35 + .4*a})`; ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI*2); ctx.stroke();
  ctx.lineWidth = 2.2; ctx.strokeStyle = `rgba(79,216,224,${.25 + .75*a})`; ctx.beginPath(); ctx.moveTo(-2, -9); ctx.lineTo(1.5, -3); ctx.lineTo(-1.5, 1); ctx.lineTo(2.5, 6); ctx.lineTo(.5, 9); ctx.stroke();
  ctx.restore(); if (a > 0) light(x, y, 40*s, TQ, .35*a); }
// рука в перчатке; пальцы смотрят в +x, curl — насколько согнуты (0..1)
function glove(curl, col, rim, detail = true){
  // ладонь чуть шире у костяшек, пальцы по длине как у настоящей руки: средний самый длинный, мизинец короче
  const fing = [[-11.5, 30, .85], [-3.8, 34, .92], [3.8, 32, 1], [11, 25, 1.1]];
  const draw = (fill) => {
    ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(-2, -12); ctx.quadraticCurveTo(14, -17, 34, -16); ctx.quadraticCurveTo(40, -15, 40, -8);
    ctx.lineTo(40, 9); ctx.quadraticCurveTo(40, 16, 33, 16); ctx.quadraticCurveTo(14, 16, -2, 12); ctx.closePath(); ctx.fill();
    for (const [y, L, ck] of fing){ ctx.save(); ctx.translate(36, y); ctx.rotate(curl*.95*ck); pathRR(ctx, -3, -4.2, L*.56, 8.4, 4.2); ctx.fill();
      ctx.translate(L*.5, 0); ctx.rotate(curl*1.2*ck); pathRR(ctx, -3, -3.8, L*.52, 7.6, 3.8); ctx.fill(); ctx.restore(); }
    ctx.save(); ctx.translate(14, 11); ctx.rotate(.55 + curl*.5); pathRR(ctx, -3, -4.5, 22, 9, 4.5); ctx.fill(); ctx.restore(); }; // большой палец
  ctx.save(); ctx.translate(-1.2, -1.8); draw(rim); ctx.restore(); draw(col);
  if (!detail) return;
  ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 1.1; for (const [y] of fing.slice(1)){ ctx.beginPath(); ctx.moveTo(33, y - 3.9); ctx.lineTo(40, y - 3.9); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(130,205,222,.18)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(4, -11); ctx.quadraticCurveTo(18, -14, 32, -13); ctx.stroke(); } // блик по тыльной стороне

// ================= План 1. Дно =================
function shotA(t){
  const FY = VH*.8;
  bg('#020407', '#08151A');
  ctx.save(); const z = 1 + .07*seg(t, 0, A1); ctx.translate(VW*.55, VH*.68); ctx.scale(z, z); ctx.translate(-VW*.55, -VH*.68);
  // луч сверху, где сыплется песок
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(0, 0, 0, FY); g.addColorStop(0, 'rgba(120,196,214,.0)'); g.addColorStop(1, 'rgba(120,196,214,.07)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(VW*.53, 0); ctx.lineTo(VW*.59, 0); ctx.lineTo(VW*.68, FY); ctx.lineTo(VW*.38, FY); ctx.closePath(); ctx.fill(); ctx.restore();
  // дальние обломки
  ctx.fillStyle = '#060B0F'; ctx.beginPath(); ctx.moveTo(0, FY); for (let x = 0; x <= VW; x += 40) ctx.lineTo(x, FY - 40 - (hash(x, 1, 3) % 70)); ctx.lineTo(VW, FY); ctx.fill();
  chain(VW*.78, -20, VW*.71, VH*.5, t, 1, 8);
  sand(VW*.56, -10, FY - 6, t, 34, .55*(1 - .5*seg(t, 0, A1)));
  // камень
  ctx.fillStyle = '#0D1418'; ctx.beginPath(); ctx.moveTo(0, FY + 8); for (let x = 0; x <= VW; x += 30) ctx.lineTo(x, FY + (hash(x, 2, 5) % 9) - 4); ctx.lineTo(VW, VH); ctx.lineTo(0, VH); ctx.fill();
  ctx.fillStyle = 'rgba(120,190,210,.08)'; ctx.fillRect(0, FY - 3, VW, 2);
  for (let i = 0; i < 9; i++){ const x = VW*(.08 + i*.1) + (hash(i, 4, 1) % 30), r = 6 + hash(i, 5, 1) % 12; ctx.fillStyle = '#0A1014'; ctx.beginPath(); ctx.ellipse(x, FY - r*.3, r*1.4, r*.7, 0, Math.PI, 0); ctx.fill(); }
  // кучка песка под струйкой
  ctx.fillStyle = '#1C2226'; ctx.beginPath(); ctx.ellipse(VW*.56, FY - 2, 34 + 10*seg(t, 0, A1), 7, 0, Math.PI, 0); ctx.fill();
  // звено и рука
  const twitch = t > 5.2 && t < 5.9 ? Math.sin((t - 5.2)/.7*Math.PI)*.28 : 0, grip = seg(t, 6.6, 7.8);
  // светлое пятно на камне, чтобы рука читалась силуэтом
  light(VW*.5, FY - 4, 260, COLD, .13); ctx.fillStyle = 'rgba(120,180,195,.07)'; ctx.beginPath(); ctx.ellipse(VW*.5, FY + 4, 230, 16, 0, 0, Math.PI*2); ctx.fill();
  link(VW*.5, FY - 5, 1.25, grip*(.6 + .4*Math.sin(t*6)), -.08);
  const W = [VW*.6, FY - 20], K = 1.5;
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, VW, FY + 1); ctx.clip(); ctx.translate(W[0], W[1]); ctx.scale(K, K); // пальцы не уходят под камень
  ctx.fillStyle = 'rgba(120,196,214,.4)'; ctx.fillRect(2, -15, 150, 27); // кромка света на рукаве
  ctx.fillStyle = '#0E1118'; ctx.fillRect(2, -13, 150, 26); // рукав
  ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(30, -8); ctx.quadraticCurveTo(44, -1, 38, 10); ctx.moveTo(70, -11); ctx.quadraticCurveTo(82, 0, 76, 11); ctx.stroke(); // складки
  ctx.fillStyle = '#1E7A84'; ctx.fillRect(4, 10.5, 148, 2.5); // бирюзовая подкладка
  ctx.fillStyle = 'rgba(120,196,214,.45)'; pathRR(ctx, -5, -18, 15, 35, 5); ctx.fill(); ctx.fillStyle = '#151B2C'; pathRR(ctx, -3.5, -16.5, 13, 33, 5); ctx.fill(); // обшлаг
  ctx.translate(-1, 2); ctx.scale(-1, 1); glove(.08 + twitch + grip*.5, '#10121A', 'rgba(130,205,222,.6)');
  ctx.restore();
  sign(W[0] - K*20, W[1] - K*1, 1.2, grip*.6 + (t > 7.4 ? .25*Math.sin(t*3)**2 : 0));
  // плита сверху на руке
  ctx.fillStyle = '#0A0F12'; ctx.beginPath(); ctx.moveTo(VW*.76, FY + 10); ctx.lineTo(VW*.75, FY - 66); ctx.lineTo(VW*1.06, FY - 118); ctx.lineTo(VW*1.06, FY + 10); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(120,190,210,.22)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(VW*.75, FY - 66); ctx.lineTo(VW*1.06, FY - 118); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(VW*.86, FY - 84); ctx.lineTo(VW*.88, FY - 44); ctx.lineTo(VW*.87, FY - 10); ctx.stroke();
  // камешек падает у руки
  const pt = t - 4.2; if (pt > 0 && pt < 2.2){ const fy = Math.min(FY - 8, VH*.1 + 900*pt*pt), hit = pt > Math.sqrt((FY - 8 - VH*.1)/900);
    const bx = VW*.4 + (hit ? (pt - .75)*40 : 0), by = hit ? FY - 8 - Math.max(0, Math.sin((pt - .75)*9))*10*Math.max(0, 1 - (pt - .75)*1.5) : fy;
    ctx.fillStyle = '#2A3036'; ctx.beginPath(); ctx.arc(bx, by, 4, 0, Math.PI*2); ctx.fill();
    if (hit){ const d = pt - .75; for (let i = 0; i < 10; i++){ const a = Math.PI + rnd(i, 30)*Math.PI; ctx.fillStyle = `rgba(190,200,200,${.5*Math.max(0, 1 - d*1.4)})`; ctx.fillRect(VW*.4 + Math.cos(a)*d*60, FY - 8 + Math.sin(a)*d*30 + d*d*60, 2, 2); } } }
  mist(FY - 10, t, 3, .09);
  motes(t, 40, .4);
  ctx.restore();
  vignette(.92);
  black(1 - seg(t, 0, 2.2)); black(seg(t, A1 - .5, A1));
}

// ================= План 2. Глаза =================
function shotB(t){
  ctx.fillStyle = '#020306'; ctx.fillRect(0, 0, VW, VH);
  const s = 2.15 + .12*seg(t, 0, B1 - A1), open = t > 2.3 && t < 2.45 || t > 3.5;
  const base = ctx.getTransform();
  ctx.save(); ctx.translate(VW*.5, VH*.47); ctx.rotate(-.1); ctx.scale(s, s); ctx.translate(-9, 285);
  const M = base.inverse().multiply(ctx.getTransform()); // относительно кадра: в игре сцена уже сдвинута и отмасштабирована
  vnAxel(ctx, {t:1.2, emo:'sad', blink:!open, talk:false});
  ctx.restore();
  const P = (x, y) => { const p = M.transformPoint(new DOMPoint(x, y)); return [p.x, p.y]; };
  // холодный свет Мглы скользит по лицу, остальное в темноте
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#5F93AA'; ctx.fillRect(0, 0, VW, VH); ctx.restore();
  const [cx0, cy0] = P(9, -285), lx = cx0 - 120 + 200*seg(t, 0, 6.5);
  ctx.save(); ctx.translate(lx, cy0); ctx.scale(1, .28); const g = ctx.createRadialGradient(0, 0, 20, 0, 0, 420);
  g.addColorStop(0, 'rgba(2,4,8,.25)'); g.addColorStop(.4, 'rgba(2,4,8,.7)'); g.addColorStop(1, 'rgba(2,4,8,.985)'); ctx.fillStyle = g; ctx.fillRect(-VW*2, -VH*4, VW*4, VH*8); ctx.restore(); // свет полосой по глазам
  const lid = clamp((t - 3.5)/1.2, 0, 1);
  if (open) for (const [x, y] of [P(-13.6, -284.8), P(31.6, -284)]) light(x, y, 46, AMB, (t < 3.5 ? .2 : .35*lid)); // отблеск глаз
  // пар изо рта: он дышит
  const [mx, my] = P(9.2, -241);
  for (const b0 of [4.4, 5.8]){ const d = t - b0; if (d > 0 && d < 1.6){ ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) glow(mx + d*30 + i*10, my - d*40 - i*8, 26 + d*30, 'rgba(200,225,235,A)', .08*(1 - d/1.6)); ctx.restore(); } }
  // песчинки перед лицом
  for (let i = 0; i < 26; i++){ const k = (t*.22 + rnd(i, 40)) % 1; ctx.fillStyle = `rgba(200,210,210,${.35*rnd(i, 41)})`; ctx.fillRect(rnd(i, 42)*VW + k*30, k*VH, 2, 3.4); }
  vignette(.9);
  black(1 - seg(t, 0, .9)); black(seg(t, B1 - A1 - .5, B1 - A1));
}

// ================= План 3. Подняться =================
// лежащая фигура силуэтом. a — насколько поднят на локте, ht — поворот головы к огоньку, curl — пальцы, reach и lift — тянется рукой вперёд и вверх, slide — подтягивается, wind — сквозняк
function figure(o, t){
  const {a, ht, curl, reach, lift, slide, wind, shake} = o, ca = Math.cos(a), sa = Math.sin(a);
  const R = (x, y) => [x*ca - y*sa, x*sa + y*ca]; // поворот корпуса вокруг бедра: голова уходит влево и вверх
  const S = R(-50, 0), H = R(-68, -2), N = R(-57, -4);
  const E = [S[0] + 8, 10], El = [S[0] - 20, 5 - lift*4], hand = [S[0] - 40 - reach, 9 - lift*9];
  const draw = (fill, coat, lining) => {
    ctx.fillStyle = fill; ctx.strokeStyle = fill; ctx.lineCap = 'round';
    ctx.lineWidth = 17; ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(36, 6); ctx.lineTo(74, 8); ctx.stroke(); // ноги уходят под плиту
    ctx.beginPath(); ctx.moveTo(-20, -7); ctx.lineTo(22, -5); ctx.lineTo(36, 12); ctx.lineTo(-24, 12); ctx.closePath(); ctx.fillStyle = coat; ctx.fill(); // полы пальто
    ctx.strokeStyle = lining; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-22, 11); ctx.lineTo(34, 11); ctx.stroke();
    ctx.strokeStyle = fill; ctx.lineWidth = 7.5; ctx.beginPath(); ctx.moveTo(S[0], S[1]); ctx.lineTo(E[0], E[1]); ctx.lineTo(E[0] - 18, 11); ctx.stroke(); // рука, на которую он опирается
    ctx.save(); ctx.rotate(a); ctx.fillStyle = coat; pathRR(ctx, -55, -12, 60, 24, 11); ctx.fill(); ctx.restore(); // корпус
    ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(S[0], S[1]); ctx.lineTo(El[0], El[1]); ctx.stroke(); ctx.lineWidth = 6.5; ctx.beginPath(); ctx.moveTo(El[0], El[1]); ctx.lineTo(hand[0], hand[1]); ctx.stroke(); // рука к звену: плечо и предплечье
    const hx = H[0] - ht*3, hy = H[1] - 2;
    ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(hx, hy, 13, 0, Math.PI*2); ctx.fill(); // голова
    // волосы: короткая растрёпанная копна на макушке и затылке, мягкие вихры по краю
    ctx.beginPath(); ctx.moveTo(hx, hy); const n = 9, a0 = Math.PI*.38 + a, a1 = Math.PI*1.62 + a;
    for (let i = 0; i <= n; i++){ const u = a0 + (a1 - a0)*i/n, r = i % 2 ? 15 : 18.5 + (i === 5 ? 2 : 0);
      const um = a0 + (a1 - a0)*(i - .5)/n; if (i) ctx.quadraticCurveTo(hx + Math.cos(um)*16.5, hy + Math.sin(um)*16.5, hx + Math.cos(u)*r, hy + Math.sin(u)*r); else ctx.lineTo(hx + Math.cos(u)*r, hy + Math.sin(u)*r); }
    ctx.closePath(); ctx.fill();
  };
  ctx.save(); ctx.translate(shake - slide*10, 0);
  ctx.save(); ctx.translate(-1.5, -2.5); draw('rgba(120,196,214,.42)', 'rgba(120,196,214,.42)', 'rgba(0,0,0,0)'); ctx.restore();
  draw('#06080C', '#0B0F18', 'rgba(30,122,132,.8)');
  { const hx = H[0] - ht*3 - 2, hy = H[1] - 3, u = Math.PI*1.2 + a; ctx.strokeStyle = 'rgba(205,210,222,.4)'; ctx.lineWidth = 2.2; ctx.beginPath();
    ctx.moveTo(hx + Math.cos(u)*9, hy + Math.sin(u)*9); ctx.quadraticCurveTo(hx + Math.cos(u)*17, hy + Math.sin(u)*17, hx + Math.cos(u + .3)*20, hy + Math.sin(u + .3)*20); ctx.stroke(); } // седая прядь
  // шарф: сначала лежит, на сквозняке относит вправо
  ctx.strokeStyle = '#15606A'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(N[0], N[1]);
  for (let i = 1; i <= 8; i++){ const u = i/8, x = N[0] + u*(14 + wind*70), y = N[1] + u*(14 - wind*22) + Math.sin(t*9 - i*.9)*wind*5*u; ctx.lineTo(x, Math.min(11, y)); } ctx.stroke();
  // кисть у звена
  ctx.save(); ctx.translate(hand[0] + 1, hand[1] - 1); ctx.scale(-.2, .2); glove(curl, '#06080C', 'rgba(120,196,214,.6)', false); ctx.restore();
  ctx.restore();
  return [hand[0] - 4, hand[1]];
}
// маленький огонёк: появляется, когда он падает, взлетает и подлетает к руке
function sparkAt(t){
  const HX = VW*.6, FY = VH*.8, P = [[3.9, HX - 144, FY - 12], [5.6, HX - 160, FY - 118], [7.0, HX - 206, FY - 52], [8.6, HX - 246, FY - 50], [9.8, HX - 330, FY - 74]];
  if (t < P[0][0]) return null; let i = 0; while (i < P.length - 2 && t > P[i + 1][0]) i++;
  const [t0, x0, y0] = P[i], [t1, x1, y1] = P[i + 1], k = ease((t - t0)/(t1 - t0));
  return [x0 + (x1 - x0)*k + Math.sin(t*2.1)*3, y0 + (y1 - y0)*k + Math.sin(t*3.3)*2.5];
}
function spark(x, y, t, a){ if (a <= 0) return; const f = .85 + .15*Math.sin(t*13)*Math.sin(t*7.3);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y, 13, 'rgba(255,196,120,A)', .14*f*a); glow(x, y + 30, 26, 'rgba(255,180,110,A)', .025*a); ctx.restore(); // слабый ореол
  ctx.fillStyle = `rgba(255,214,150,${.9*a})`; ctx.beginPath(); ctx.arc(x, y, 2.6*f, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = `rgba(255,248,225,${a})`; ctx.beginPath(); ctx.arc(x, y - .4, 1.2, 0, Math.PI*2); ctx.fill(); }
function shotC(t){
  const FY = VH*.8, wind = seg(t, 5.4, 6.6);
  bg('#020406', '#071216');
  ctx.save(); const z = 1 + .05*seg(t, 0, 9); ctx.translate(VW*.45, VH*.7); ctx.scale(z, z); ctx.translate(-VW*.45, -VH*.7);
  // свет из прохода слева
  const pl = seg(t, 5.6, 7.8);
  if (pl > 0){ light(VW*.03, FY - 70, 260, COLD, .14*pl); ctx.fillStyle = `rgba(170,220,232,${.55*pl})`; ctx.fillRect(VW*.02, FY - 150, 6, 150); light(VW*.025, FY - 80, 70, COLD, .4*pl); }
  ctx.fillStyle = '#050A0D'; ctx.beginPath(); ctx.moveTo(VW*.05, FY); for (let x = VW*.05; x <= VW; x += 46) ctx.lineTo(x, FY - 60 - (hash(x|0, 7, 2) % 90)); ctx.lineTo(VW, FY); ctx.fill();
  chain(VW*.86, -20, VW*.8, VH*.42, t, .8, 6);
  sand(VW*.66, -10, FY - 40, t, 26, .45, wind);
  ctx.fillStyle = '#0C1317'; ctx.beginPath(); ctx.moveTo(0, FY + 6); for (let x = 0; x <= VW; x += 30) ctx.lineTo(x, FY + (hash(x, 9, 5) % 8) - 4); ctx.lineTo(VW, VH); ctx.lineTo(0, VH); ctx.fill();
  ctx.fillStyle = 'rgba(120,190,210,.07)'; ctx.fillRect(0, FY - 3, VW, 2);
  // попытка подняться: на локоть — дрожь — падает
  let a = .05 + .37*seg(t, 1.2, 3.0); if (t > 3.5) a = .05 + .37*(1 - Math.min(1, ((t - 3.5)/.4)**2));
  const shake = t > 2.2 && t < 3.6 ? Math.sin(t*41)*1.6*seg(t, 2.2, 3.2) : t > 7.2 && t < 8.7 ? Math.sin(t*37)*.9 : 0; // дрожь: на локте и когда подтягивается
  const ht = seg(t, 4.6, 5.8), curl = 1 - seg(t, 6.3, 6.8), reach = 12*seg(t, 7.0, 8.6), lift = seg(t, 6.8, 7.6), slide = seg(t, 7.0, 8.6);
  const HX = VW*.6, K = 2, lx = HX + K*(-50 - 40 - 2), lroll = 26*seg(t, 6.5, 7.2);
  light(HX - 120, FY - 6, 300, COLD, .12); ctx.fillStyle = 'rgba(120,180,195,.06)'; ctx.beginPath(); ctx.ellipse(HX - 120, FY + 4, 300, 14, 0, 0, Math.PI*2); ctx.fill(); // светлое пятно, чтобы фигура читалась
  link(lx - lroll, FY - 5, .55, 0, -lroll*.08);
  ctx.save(); ctx.translate(HX, FY - 24); ctx.scale(K, K); figure({a, ht, curl, reach, lift, slide, wind, shake}, t); ctx.restore();
  // пыль от падения
  const d = t - 3.9; if (d > 0 && d < 1.8) for (let i = 0; i < 18; i++){ const an = Math.PI + rnd(i, 50)*Math.PI; ctx.fillStyle = `rgba(170,190,195,${.35*(1 - d/1.8)})`;
    ctx.fillRect(HX - 100 + Math.cos(an)*d*90, FY - 6 + Math.sin(an)*d*22, 2.4, 2.4); }
  // пар изо рта
  for (const b0 of [4.5, 6.0, 7.6]){ const q = t - b0; if (q > 0 && q < 1.5){ ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(HX - K*78 - q*20 + wind*q*50, FY - 60 - q*30, 16 + q*18, 'rgba(200,225,235,A)', .1*(1 - q/1.5)); ctx.restore(); } }
  // плита на ногах
  ctx.fillStyle = '#090E11'; ctx.beginPath(); ctx.moveTo(VW*.7, FY + 8); ctx.lineTo(VW*.71, FY - 60); ctx.lineTo(VW*1.05, FY - 104); ctx.lineTo(VW*1.05, FY + 8); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(120,190,210,.2)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(VW*.71, FY - 60); ctx.lineTo(VW*1.05, FY - 104); ctx.stroke();
  mist(FY - 14, t, 3, .1, wind);
  motes(t, 46, .38, wind*(t - 5.4)*120, 3);
  ctx.restore();
  vignette(.9);
  black(1 - seg(t, 0, .8));
  const out = seg(t, 9.2, 10.4); black(out);
  const sp = sparkAt(t); if (sp){ ctx.save(); ctx.translate(VW*.45, VH*.7); ctx.scale(z, z); ctx.translate(-VW*.45, -VH*.7); spark(sp[0], sp[1], t, seg(t, 3.9, 4.5)*(1 - seg(t, 9.8, 10.4))); ctx.restore(); } // огонёк гаснет последним
  // в темноте дважды вспыхивает знак на перчатке — как удар сердца
  if (t > 10.4){ const p = t - 10.6, beat = Math.max(0, Math.exp(-((p/.12)**2)), .7*Math.exp(-(((p - .38)/.12)**2)));
    sign(HX + K*(-50 - 40 - 12 - 4)*z, FY - 20, 2, beat); }
}
return [shotA, shotB, shotC];
})();
