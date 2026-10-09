"use strict";
/* =====================================================================
   ГЛАВА 8. «Первый Огонь» — участок 3 из 3: «Цепь». Финал первой части.
   Вран отпускает рычаг → мост из Сердца рушится, Эра и Джей впереди → Странник держит цепь: «Я держу» →
   игрок сам доводит Аю до выхода → обрыв → катсцена (свет в двух городах, «Соседки», «Все вернулись», «Утро») →
   «Глава пройдена» (Ая у фонаря) → финальные слова игрокам → скрытая сцена → меню.
   Тексты — drafts/ch8-texts.md (черновик с правками автора). Разметка уровня и кадры — Claude.
   ===================================================================== */
(() => {
const MIST = 28;
const mist = () => startRise({y:MIST*T, top:MIST*T, speed:30});
// ---------- кадры катсцены (960×540) ----------
const sk = () => (S.scene && S.scene.slideT) || 0; // сколько секунд показан текущий кадр
function bg(top, bot){ const g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, top); g.addColorStop(1, bot); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH); }
function fog(y0, t, col, n=4){ for (let i=0;i<n;i++){ ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, VH);
  for (let x=0;x<=VW;x+=30) ctx.lineTo(x, y0 + i*24 + Math.sin(x*.012 + t*(.4 + i*.15) + i)*10); ctx.lineTo(VW, VH); ctx.closePath(); ctx.fill(); } }
function hero(who, x, y, s, face=1, o={}){ ctx.save(); ctx.translate(x, y); ctx.scale(s*face, s); drawChar(ctx, who, Object.assign({t:S.time, blink:(S.time % 3.6) < .12}, o)); ctx.restore(); }
function warm(x, y, r, a, col='rgba(255,190,110,A)'){ ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y, r, col, a); ctx.restore(); }
function townRow(base, s, seed, col, litK, warmCol='rgba(255,180,100,.9)'){ const R = seeded(seed); let i = 0;
  for (let x = -20; x < VW + 40; i++){ const w = (50 + R()*70)*s, h = (70 + R()*130)*s; ctx.fillStyle = col; ctx.fillRect(x, base - h, w, h + 400);
    ctx.beginPath(); ctx.arc(x + w/2, base - h, w/2, Math.PI, 0); ctx.fill();
    for (let y = base - h + 16*s; y < base - 10; y += 26*s) for (let xx = x + 9*s; xx < x + w - 12*s; xx += 18*s){ const on = (hash(xx|0, y|0, seed) % 100)/100 < litK;
      if (on){ ctx.fillStyle = warmCol; ctx.fillRect(xx, y, 8*s, 11*s); warm(xx + 4*s, y + 5*s, 16*s, .25); } else { ctx.fillStyle = 'rgba(6,10,14,.85)'; ctx.fillRect(xx, y, 8*s, 11*s); } }
    x += w + 6 + R()*14; } }
function lampPost(x, y, s, lit){ ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#141826'; ctx.fillRect(-4, -150, 8, 150);
  if (lit){ warm(0, -168, 150, .4*lit); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(150,220,245,${.6*lit})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -168, 30, 0, Math.PI*2); ctx.stroke(); ctx.restore(); } // золото с голубой каймой
  ctx.beginPath(); ctx.moveTo(-16, -150); ctx.lineTo(-12, -186); ctx.lineTo(12, -186); ctx.lineTo(16, -150); ctx.closePath();
  ctx.fillStyle = lit ? '#FFD996' : '#2E3248'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#0A0810'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-19, -186); ctx.lineTo(0, -200); ctx.lineTo(19, -186); ctx.closePath(); ctx.fillStyle = '#141826'; ctx.fill(); ctx.restore(); }
const SLIDES = [
  function edge(t){ // 0. Ая у края. Ветер, оседает камень
    bg('#10161A', '#2A2016'); warm(VW*.4, VH*1.05, VW*.6, .3);
    fog(VH*.7, t, 'rgba(120,170,190,.18)', 4);
    ctx.fillStyle = '#0A0C10'; ctx.beginPath(); ctx.moveTo(VW*.62, VH); ctx.lineTo(VW*.6, VH*.66); ctx.lineTo(VW*.64, VH*.64); ctx.lineTo(VW, VH*.62); ctx.lineTo(VW, VH); ctx.fill();
    hero('aya', VW*.68, VH*.645, 2.2, -1, {sway:{x:Math.sin(t*1.2)*2, y:0}, emo:'sad'});
    for (let i=0;i<22;i++){ const x = VW*.3 + (hash(i,3,1) % 300), y = (t*40 + i*37) % VH; ctx.fillStyle = 'rgba(200,190,170,.45)'; ctx.fillRect(x, y, 2, 2); } }, // пыль
  function spark(t){ // 1. Искра гаснет почти до точки и чуть разгорается
    bg('#0C0A10', '#1A1418'); const k = sk(), a = k < 2 ? 1 - k*.42 : Math.min(.75, .16 + (k - 2)*.3);
    warm(VW/2, VH/2, 260, .25*a); drawIskra(ctx, VW/2, VH/2 + Math.sin(t*1.4)*6, t, 2 + 4*a, 0, Math.max(.15, a)); },
  function streams(t){ // 2. свет расходится двумя потоками: вверх и по Долине
    bg('#141A20', '#20160E'); const k = Math.min(1, sk()/3), cx = VW/2, cy = VH*.66;
    fog(VH*.75, t, 'rgba(110,170,190,.15)', 3);
    warm(cx, cy, 220, .5); ctx.fillStyle = '#FFF4DA'; ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI*2); ctx.fill();
    for (const [ex, ey, qx, qy] of [[VW*.2, -20, VW*.25, VH*.4], [VW + 20, VH*.8, VW*.75, VH*.6]]){ ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'rgba(255,214,150,.75)'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx, cy);
      for (let i=1;i<=30*k;i++){ const u = i/30; ctx.lineTo((1-u)*(1-u)*cx + 2*u*(1-u)*qx + u*u*ex, (1-u)*(1-u)*cy + 2*u*(1-u)*qy + u*u*ey); } ctx.stroke(); ctx.restore(); } },
  function valley(t){ // 3. в Долине загораются очаги, люди выходят из домов
    bg('#0E2028', '#0A1418'); const k = Math.min(1, sk()/3.5);
    townRow(VH*.86, 1.1, 21, '#122830', .05 + k*.6);
    for (let i=0;i<5;i++){ const x = 120 + i*180, on = k > i*.18; if (on){ warm(x, VH*.9, 90, .45); ctx.fillStyle = '#FF9A4A'; ctx.beginPath(); ctx.ellipse(x, VH*.9, 22, 6, 0, 0, Math.PI*2); ctx.fill(); } }
    for (let i=0;i<7;i++){ if (k < .3 + i*.08) continue; const x = 90 + i*130 + Math.sin(t + i)*4; ctx.fillStyle = '#071014'; ctx.beginPath(); ctx.arc(x, VH*.86 - 34, 7, 0, Math.PI*2); ctx.fill(); ctx.fillRect(x - 6, VH*.86 - 27, 12, 27); } // люди
    fog(VH*.92, t, 'rgba(120,180,190,.12)', 2); },
  function city(t){ // 4. наверху фонари вспыхивают сами — золотом с голубой каймой
    bg('#0B1024', '#2A2A50'); const k = sk();
    for (let i=0;i<70;i++){ ctx.fillStyle = 'rgba(240,236,255,.5)'; ctx.fillRect(hash(i,1,7) % VW, hash(i,2,7) % (VH*.5), 1.6, 1.6); }
    ctx.fillStyle = '#121830'; ctx.beginPath(); ctx.moveTo(0, VH); ctx.lineTo(VW*.1, VH*.62); ctx.lineTo(VW*.5, VH*.55); ctx.lineTo(VW*.9, VH*.6); ctx.lineTo(VW, VH); ctx.fill();
    townRow(VH*.6, .7, 33, '#1A2244', .35);
    for (let i=0;i<5;i++) lampPost(VW*(.14 + i*.18), VH*.66, .6, Math.max(0, Math.min(1, (k - i*.5)*2)));
    fog(VH*.8, t, 'rgba(130,170,220,.16)', 3); },
  function retreat(t){ // 5. Мгла отступает: проступают ступени, мостки, крыши
    bg('#16242C', '#0E1418'); const k = Math.min(1, sk()/4.5);
    ctx.fillStyle = '#26343C'; for (let i=0;i<9;i++) ctx.fillRect(VW*.08 + i*60, VH*.82 - i*34, 70, 14); // ступени
    ctx.fillRect(VW*.62, VH*.5, 260, 10); for (let x = VW*.62; x < VW*.62 + 260; x += 40) ctx.fillRect(x, VH*.5, 5, 60); // мостки
    townRow(VH*.98, .9, 45, '#1C2C34', .12);
    const my = VH*(.4 + .45*k); ctx.fillStyle = 'rgba(150,200,215,.75)'; ctx.fillRect(0, my + 30, VW, VH); fog(my, t, 'rgba(160,210,225,.35)', 3); },
  function plaza(t){ // 6. площадь у Сердца: тёплый очаг, Джей и Эра
    bg('#1E2420', '#120E0A'); warm(VW*.52, VH*.86, 260, .4);
    townRow(VH*.78, .9, 57, '#1A2420', .45);
    ctx.fillStyle = '#4A4440'; ctx.beginPath(); ctx.ellipse(VW*.52, VH*.88, 60, 14, 0, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = '#FF9A4A'; ctx.beginPath(); ctx.ellipse(VW*.52, VH*.86, 40, 7, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#16120E'; ctx.fillRect(0, VH*.9, VW, VH*.1);
    hero('aya', VW*.32, VH*.92, 2.6, 1); hero('jay', VW*.66, VH*.92, 2.5, -1); hero('era', VW*.78, VH*.92, 2.6, -1); },
  function stairs(t){ // 7. Ая поднимается наверх, Искра светит под ноги
    bg('#0E1424', '#1E1E30'); const k = Math.min(1, sk()/4.5);
    ctx.fillStyle = '#2A2E40'; for (let i=0;i<14;i++) ctx.fillRect(VW*.05 + i*62, VH*.92 - i*30, 66, 12);
    const i = 2 + k*8, x = VW*.05 + i*62 + 30, y = VH*.92 - i*30;
    drawIskra(ctx, x + 50, y - 50 + Math.sin(t*2)*6, t, 2.2, 0); warm(x + 50, y - 30, 120, .3);
    hero('aya', x, y, 2.2, 1, {run:.6, phase:t*8, emo:'tired'}); },
  function door(t){ // 8. дом Тимофея: вечер, в окне фонарь
    bg('#141A30', '#0C0E18');
    ctx.fillStyle = '#2A2238'; ctx.fillRect(VW*.18, VH*.12, VW*.64, VH*.8); ctx.strokeStyle = '#0A0810'; ctx.lineWidth = 4; ctx.strokeRect(VW*.18, VH*.12, VW*.64, VH*.8);
    ctx.fillStyle = '#F2B460'; ctx.fillRect(VW*.38, VH*.38, VW*.2, VH*.54); warm(VW*.48, VH*.6, 260, .35); // открытая дверь
    ctx.fillStyle = '#1A1424'; ctx.fillRect(VW*.66, VH*.28, 90, 90); ctx.fillStyle = '#FFD996'; ctx.fillRect(VW*.66 + 8, VH*.28 + 8, 74, 74); warm(VW*.66 + 45, VH*.28 + 45, 120, .35); // окно с фонарём
    ctx.fillStyle = '#0A0810'; ctx.fillRect(VW*.66 + 43, VH*.28 + 8, 4, 74); ctx.fillRect(VW*.66 + 8, VH*.28 + 43, 74, 4);
    ctx.fillStyle = '#100C16'; ctx.fillRect(0, VH*.92, VW, VH*.08);
    hero('timofey', VW*.5, VH*.92, 3, -1, {emo:'tired'}); hero('aya', VW*.46, VH*.92, 3, 1, {emo:'sad'}); },
  function roof(t){ // 9. утро на крыше мастерской
    bg('#F0B890', '#7A90B8'); warm(VW*.8, VH*.3, 300, .35, 'rgba(255,230,180,A)');
    fog(VH*.62, t, 'rgba(220,226,240,.45)', 3);
    ctx.fillStyle = '#4A3A40'; ctx.beginPath(); ctx.moveTo(0, VH); ctx.lineTo(0, VH*.82); ctx.lineTo(VW, VH*.78); ctx.lineTo(VW, VH); ctx.fill();
    ctx.fillStyle = '#5A3A34'; ctx.fillRect(VW*.7, VH*.6, 50, VH*.2); // труба
    hero('timofey', VW*.42, VH*.81, 2.8, 1); hero('aya', VW*.56, VH*.8, 2.8, -1);
    for (const x of [VW*.47, VW*.51]){ ctx.fillStyle = '#E8DCC8'; ctx.fillRect(x, VH*.8 - 14, 12, 14); ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(x + 3, VH*.8 - 24 - Math.sin(t*2 + x)*3, 2, 8); } }, // две кружки, пар
  function windowLamp(t){ // 10. фонарь у окна горит ровно. Затемнение
    bg('#120E18', '#0A0810'); const k = sk();
    ctx.fillStyle = '#1C1626'; ctx.fillRect(VW*.32, VH*.18, VW*.36, VH*.6); ctx.fillStyle = '#26324E'; ctx.fillRect(VW*.34, VH*.21, VW*.32, VH*.54);
    lampPost(VW*.5, VH*.74, 1.3, 1);
    ctx.fillStyle = '#1C1626'; ctx.fillRect(VW*.495, VH*.21, 10, VH*.54); ctx.fillRect(VW*.34, VH*.47, VW*.32, 10);
    if (k > 3){ ctx.fillStyle = `rgba(0,0,0,${Math.min(1, (k - 3)/2)})`; ctx.fillRect(0, 0, VW, VH); } },
  // ---------- скрытая сцена: только для игрока ----------
  function hand(t){ // 11. темнота, осыпается песок; на камне рука в тёмной перчатке, пальцы едва сгибаются
    ctx.fillStyle = '#030408'; ctx.fillRect(0, 0, VW, VH); const k = sk(), a = Math.min(1, k/2);
    ctx.save(); ctx.globalAlpha = a;
    for (let i=0;i<26;i++){ const x = (hash(i,9,4) % VW), y = (t*30 + i*41) % VH; ctx.fillStyle = 'rgba(150,170,180,.25)'; ctx.fillRect(x, y, 1.4, 3); } // песок
    ctx.fillStyle = '#1A1E24'; ctx.beginPath(); ctx.ellipse(VW*.5, VH*.84, VW*.42, 60, 0, 0, Math.PI*2); ctx.fill(); // камень
    warm(VW*.5, VH*.7, 220, .06, 'rgba(120,200,220,A)');
    const bend = k > 2.4 ? Math.min(1, (k - 2.4)/1.2) : 0;
    ctx.translate(VW*.5, VH*.72); ctx.fillStyle = '#16161E'; ctx.strokeStyle = '#05050A'; ctx.lineWidth = 3;
    ctx.fillRect(-170, -16, 120, 34); // рукав
    ctx.fillStyle = '#25304F'; ctx.fillRect(-176, -18, 14, 38); // край пальто
    ctx.fillStyle = '#1E7A84'; ctx.fillRect(-170, 14, 120, 4); // бирюзовая подкладка
    ctx.fillStyle = '#16161E'; pathRR(ctx, -54, -22, 70, 44, 14); ctx.fill(); ctx.stroke(); // ладонь
    for (let i=0;i<4;i++){ const y = -18 + i*12; ctx.save(); ctx.translate(14, y); ctx.rotate(bend*(.5 + i*.08)); pathRR(ctx, 0, -5, 46 - i*4, 11, 5); ctx.fill(); ctx.stroke(); ctx.restore(); }
    ctx.save(); ctx.translate(-22, 0); ctx.scale(.9, .9); ctx.globalAlpha = a*.55; lampSign(ctx, 0, 0, true); ctx.restore(); // сломанный знак на перчатке
    ctx.restore(); },
  function eyes(t){ // 12. он открывает глаза и долго смотрит вверх
    ctx.fillStyle = '#030408'; ctx.fillRect(0, 0, VW, VH); const k = sk(), open = Math.min(1, Math.max(0, (k - 1.2)/1.4));
    warm(VW*.5, VH*.5, 260, .05, 'rgba(120,200,220,A)');
    ctx.save(); ctx.translate(VW*.5, VH*.5); ctx.fillStyle = '#0C0E14'; ctx.beginPath(); ctx.ellipse(0, 0, 260, 150, 0, 0, Math.PI*2); ctx.fill(); // лицо в темноте
    ctx.fillStyle = '#05060A'; ctx.beginPath(); ctx.moveTo(-280, -40); ctx.quadraticCurveTo(0, -150, 280, -40); ctx.lineTo(280, -160); ctx.lineTo(-280, -160); ctx.fill(); // волосы
    for (const ex of [-80, 80]){ const h = 3 + 15*open;
      if (open > 0){ warm(ex, 4, 60, .3*open, 'rgba(232,162,58,A)'); ctx.fillStyle = `rgba(232,162,58,${.85*open})`; ctx.beginPath(); ctx.ellipse(ex, 4, 26, h, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#05060A'; ctx.beginPath(); ctx.arc(ex, 4 - 3*open, 7*open, 0, Math.PI*2); ctx.fill(); }
      ctx.strokeStyle = '#1A1C24'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ex - 30, 4); ctx.quadraticCurveTo(ex, 4 - 16*open - 2, ex + 30, 4); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(80,80,90,.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-110, -40); ctx.lineTo(-60, -10); ctx.stroke(); // шрам через бровь
    ctx.restore(); },
  function rise(t){ // 13. пробует подняться — сил не хватает; сбоку тянет холодным воздухом, он поворачивает голову. Затемнение
    ctx.fillStyle = '#04060A'; ctx.fillRect(0, 0, VW, VH); const k = sk();
    for (let i=0;i<6;i++){ const y = VH*.35 + i*26, x = ((t*60 + i*170) % (VW + 300)) - 300; ctx.fillStyle = 'rgba(120,170,190,.08)'; ctx.beginPath(); ctx.ellipse(x, y, 160, 10, 0, 0, Math.PI*2); ctx.fill(); } // холодный воздух сбоку
    const lift = k > 1 && k < 3 ? Math.sin((k - 1)/2*Math.PI)*.25 : 0;
    ctx.save(); ctx.translate(VW*.56, VH*.8); ctx.rotate(-Math.PI/2 + lift); ctx.scale(2.6, 2.6);
    drawChar(ctx, 'axel', {t:0, blink:false, emo:'tired'}); ctx.restore();
    ctx.fillStyle = 'rgba(3,5,9,.8)'; ctx.fillRect(0, 0, VW, VH);
    if (k > 3.4){ const a = Math.min(1, (k - 3.4)); ctx.fillStyle = `rgba(232,162,58,${.8*a})`; ctx.fillRect(VW*.56 - 133, VH*.8 - 8, 3, 3); ctx.fillRect(VW*.56 - 133, VH*.8 + 2, 3, 3); } // глаза смотрят в сторону сквозняка
    if (k > 6){ ctx.fillStyle = `rgba(0,0,0,${Math.min(1, (k - 6)/1.5)})`; ctx.fillRect(0, 0, VW, VH); } },
  // ---------- экран «Глава пройдена»: Ая у фонаря, фитиль дрожит и загорается, Искра отвечает вспышкой ----------
  function endFrame(t){
    const k = S.endT || 0; bg('#121634', '#2A2440');
    for (let i=0;i<60;i++){ ctx.fillStyle = 'rgba(240,236,255,.45)'; ctx.fillRect(hash(i,4,2) % VW, hash(i,5,2) % (VH*.5), 1.6, 1.6); }
    warm(VW*.5, VH*1.05, VW*.5, .18); // слабый золотой свет над Долиной
    ctx.fillStyle = '#1A1E3A'; ctx.beginPath(); ctx.moveTo(0, VH); ctx.lineTo(0, VH*.66);
    for (let x = 0; x <= VW; x += 60) ctx.lineTo(x, VH*.66 - (hash(x, 3, 1) % 50)); ctx.lineTo(VW, VH); ctx.fill(); // крыши верхнего города
    ctx.fillStyle = '#100E1C'; ctx.fillRect(0, VH*.9, VW, VH*.1);
    const lit = k < 1.2 ? 0 : k < 2.2 ? (Math.sin(k*40) > 0 ? .5 : .15) : 1; // сначала дрожит фитиль, потом ровное пламя
    if (k > 1.15 && !S.endFx1){ S.endFx1 = true; sfx.latch(); } // щелчок огнива
    if (k > 2.2 && !S.endFx2){ S.endFx2 = true; sfx.lamp(); }
    lampPost(VW*.62, VH*.9, 1.4, lit);
    hero('aya', VW*.48, VH*.9, 2.8, 1, {emo:''});
    const flash = k > 2.4 && k < 3.2 ? Math.sin((k - 2.4)/.8*Math.PI) : 0; // Искра отвечает вспышкой
    drawIskra(ctx, VW*.44, VH*.9 - 186 + Math.sin(t*2)*4, t, 1.6 + flash*.8, 0);
    if (flash) warm(VW*.44, VH*.9 - 186, 120, .45*flash);
    S.endT = k + 1/60; }
];
chapter({
  id:'ch8', group:'ch8', partNo:3, groupTitle:'Первый Огонь', groupSub:'Финал первой части',
  label:'Глава 8', kicker:'ГЛАВА 8 · ЦЕПЬ', title:'Цепь', sub:'Мост из Сердца',
  theme:'heart', music:'tense', cols:150, rows:30, find:'past', canDouble:true,
  startScene:'vran_end', slides:SLIDES,
  endKick:'Глава 8 · Первый Огонь', endTitle:'Глава пройдена', endSlide:14, endDelay:4.5, endNextLabel:'Дальше',
  endSub:'Свет теперь горит в обоих городах.',
  endNote:'<b>Звено древней цепи</b><br>Холодное, тяжёлое. На металле осталась глубокая вмятина от стопора. Ая долго держит звено в ладони, прежде чем убрать его в карман.',
  // после итогов — финальные слова автора, потом скрытая сцена, потом меню
  afterEnd(){ showWords({onDone:() => { hideScreens(); G1.paused = false; S.endSlide = undefined; startScene('hidden'); }}); },
  build(h){
    h.walls();
    // A. Кольцо Сердца: Вран у рычага
    h.ground(2, 30, 16); h.start(10, 15); h.lamp(6, 15); h.lamp(24, 15);
    h.npc('era', 'era', 12, 16, {face:1, lookAt:false}); h.npc('jay', 'jay', 14, 16, {face:1, lookAt:false}); h.npc('axel', 'axel', 17, 16, {face:1, lookAt:false});
    h.npc('vran', 'vran', 21, 16, {face:-1, lookAt:false}); h.deco('glove', 21, 16);
    h.deco('firstfire', 12, 8, {r:3});
    h.findx(18, 13, 'Звено древней цепи', 'token');                     // находка 6
    h.block(27, 30, 2, 9);                                               // стена с анкерами цепей
    // B. Мост из Сердца: дальняя часть рушится первой (её держит цепь «back»), ближняя к выходу — цепь «br»
    h.span(31, 16, 6, 'back'); h.slowFade(37, 4, 16); h.span(41, 16, 6, 'back'); h.slowFade(47, 3, 16); h.span(50, 16, 6, 'back');
    h.chain(30, 9, 44, 16, 'back');
    h.findx(43, 13, 'Пустой коробок спичек', 'page');                   // находка 7
    h.span(56, 16, 8, 'br'); h.span(64, 16, 6, 'br'); h.slowFade(70, 3, 16); h.span(73, 16, 6, 'br'); h.span(79, 16, 6, 'br');
    h.chain(29, 6, 60, 16, 'br');
    h.sparks(57, 4, 14); h.sparks(74, 4, 14);
    h.trig(59, 'chain');
    // C. Выход из Сердца
    h.ground(85, 148, 16); h.lamp(100, 15);
    h.npc('jay2', 'jay', 94, 16, {hidden:true, face:-1, lookAt:false, barks:['Если мост снова заскрипит, я туда не пойду. Ну… не сразу.']});
    h.npc('era2', 'era', 97, 16, {hidden:true, face:-1, lookAt:false, barks:['Я пересчитала ступени. Их меньше, чем в чертежах. Опять.']});
    h.trig(88, 'collapse');
  },
  onPlay(){ mist(); },
  restore(){
    mist();
    if (S.flags.t_vran_end){ api.hide('vran'); api.flag('glove'); api.hide('era'); api.hide('jay'); api.show('era2'); api.show('jay2'); api.show('axel', 27, 16); }
    if (S.flags.t_chain){ api.chainBreak('back'); api.chainStrain('br'); api.chainHold('br'); }
    setMusic(true, S.flags.t_chain ? 'sad' : 'tense');
    if (S.flags.t_collapse) setTimeout(() => startScene('cut'), 300);
  },
  // после «Я держу» путь назад рушится по мере того, как Ая бежит к выходу
  tick(){ if (!S.flags.t_chain || S.flags.t_collapse) return; const p = S.P;
    for (const m of S.W.movers) if (m.span === 'br' && !m.collapse && p.x > m.x + m.w + 2*T){ m.collapse = true; sfx.crumble(); camKick(3); } },
  onRespawn(){ for (const m of S.W.movers) if (m.span === 'br' && m.collapse){ m.collapse = false; m.y = m.y0; m.vy = 0; m.off = false; } }, // погибла — плиты на месте
  scenes:{
    // [0.7] — тексты автора, слово в слово
    vran_end:{ title:'Я знаю', lines:[
      {n:'', t:'Рычаг ходит ходуном под рукой Врана. Под ногами осыпается камень. Внизу шевелится Мгла.', act(){ api.focus(19, 12); api.shake(.4); }},
      {n:'Ая', e:'angry', t:'Вран! Отпусти рычаг!'},
      {n:'Вран', t:'И куда мне?'},
      {n:'', t:'Он пытается переставить ногу. Камень под каблуком крошится.', sfx:'crumble'},
      {n:'Ая', t:'На мост. Живо!'},
      {n:'Вран', t:'Мост уже не держит.'},
      {n:'', t:'За его спиной мечутся последние Тени. Одна цепляется за край его сюртука. Вран отмахивается, не глядя.'},
      {n:'Вран', t:'Я ведь всё рассчитал.'},
      {n:'Ая', t:'Вижу.'},
      {n:'Вран', t:'Не надо.'},
      {n:'', t:'Ая замолкает. Рычаг скрипит. Золотой свет рвётся на две неравные полосы.', sfx:'strain'},
      {n:'Вран', t:'Я хотел, чтобы хоть раз… не они решали.'},
      {n:'Ая', t:'Тогда отпусти.'},
      {n:'', t:'Вран смотрит на её протянутую руку. Потом — на свет за решёткой.', wait:1.4},
      {n:'Вран', t:'Я знаю.', wait:.6},
      {n:'', t:'Он разжимает пальцы.', wait:.6},
      {n:'', t:'Рычаг с грохотом возвращается на место. Два канала выравниваются. Первый Огонь вспыхивает ровно, золотой свет уходит в обе стороны.', act(){ api.flag('fireSplit'); api.shake(.6); sfx.stone(); S.flash = .4; }},
      {n:'', t:'Плита под Враном обрывается. Он исчезает в Мгле. Ни крика, ни долгого падения.', act(){ api.hide('vran'); api.flag('glove'); sfx.crumble(); }},
      {n:'Ая', e:'sad', t:'Вран!'},
      {n:'', t:'Ответа нет. На краю лежит белая перчатка. Одна из Теней тянется к ней, рассыпается и гаснет.', music:'sad', vol:.6},
      {n:'', t:'Ая делает шаг вперёд. Странник придерживает её за плечо.', act(){ api.walk('axel', S.P.x/T + .8, 120); }},
      {n:'Странник', t:'Не надо.'},
      {n:'', t:'Ая смотрит на него, но не спорит.'},
      {n:'Эра', t:'Каналы выровнялись. Оба.'},
      {n:'Джей', t:'А пол — нет. Ноги переставили, живо!'},
      {n:'', t:'Под ногами проходит трещина. С потолка сыплется каменная крошка.', act(){ api.shake(1); sfx.rumble(); }},
      {n:'Странник', t:'На мост.'}
    ], end(){ api.focus(null); api.flag('t_vran_end'); setMusic(true, 'chase');
      for (const id of ['era','jay']) api.walk(id, 30, 220, () => { api.hide(id); api.show(id + '2'); });
      api.walk('axel', 27, 160); } },
    chain:{ music:'sad', cut:true, title:'Я держу', lines:[
      {n:'', t:'Герои выбегают на древний мост. Каменные секции ходят ходуном. Вдоль стены натянута толстая цепь, которую Ая уже видела раньше.', act(){ api.focus(44, 12); }},
      {n:'', t:'Из крепления вылетает стопор. Цепь срывается на одно звено.', act(){ api.chainStrain('br'); api.shake(.5); sfx.snap(); }},
      {n:'', t:'Странник разворачивается, вбивает стопор обратно и наваливается на цепь всем телом.', act(){ api.show('axel', 27, 16); api.face('axel', 1); api.chainHold('br'); }},
      {n:'Ая', e:'worried', t:'Что ты делаешь?!'},
      {n:'Странник', t:'Держу.'},
      {n:'Ая', e:'angry', t:'Я вижу! Отпусти, я помогу!'},
      {n:'', t:'Он даже не поворачивает головы. Цепь натягивается. Под его сапогом трескается камень.', sfx:'strain'},
      {n:'Странник', t:'Нет.'},
      {n:'Ая', e:'angry', t:'Да послушай ты хоть раз!'},
      {n:'', t:'Странник наконец смотрит на неё. На секунду его лицо становится совсем усталым.', act(){ api.face('axel', 1); }},
      {n:'Странник', e:'tired', t:'Беги.'},
      {n:'', t:'Ая не двигается.', wait:1.2},
      {n:'Странник', t:'Ая.'},
      {n:'', t:'Она смотрит на его руки. Перчатка на правой руке опять сползла, открывая край старого знака.'},
      {n:'', t:'Ая хочет что-то сказать. Слова не выходят.', wait:.8},
      {n:'Ая', r:'тихо', t:'Ты обещал…'},
      {n:'Странник', t:'Знаю.'},
      {n:'', t:'Цепь рвётся ещё на одно звено. Мост проседает.', act(){ api.chainBreak('back'); }},
      {n:'Странник', t:'Я держу.', wait:.6},
      {n:'', t:'Ая отступает на шаг. Искра мечется между ними.', act(){ api.iskraTo(42, 12); }},
      {n:'Ая', t:'Я не забуду.', act(){ api.iskraBack(); }},
      {n:'', t:'Странник едва заметно кивает.', wait:.6},
      {n:'Странник', t:'Иди.'}
    ], end(){ api.focus(null); api.checkpoint(59, 16); saveGame(true); } }, // управление — игроку: Ая уходит сама, путь назад рушится за ней
    collapse:{ title:'Мост', lines:[
      {n:'', t:'Ая добирается до последней каменной площадки. Позади раздаётся удар металла.', act(){ api.focus(80, 12); }},
      {n:'', t:'Цепь вырывает из стены. Мост уходит вниз. Пыль закрывает дальний край.',
        act(){ api.chainBreak('br'); const a = api.npc('axel'); smokePuff(a.x, a.y - 30, 40); api.hide('axel'); api.focus(50, 12); }},
      {n:'', t:'Ая оборачивается.', cut:true},
      {n:'Ая', e:'sad', t:'Нет…'},
      {n:'', t:'Она делает шаг назад, но под ногами уже трещит камень. Искра тускнеет и прижимается к её плечу.'},
      {n:'', t:'Несколько секунд слышно только осыпающийся камень.', wait:1.6, sfx:'crumble'},
      {n:'Джей', t:'Ая. Нам наверх.', act(){ api.focus(92, 13); }},
      {n:'', t:'Ая не отвечает.'},
      {n:'Джей', t:'Слышишь? Тут больше нечего держать.'},
      {n:'', t:'Ая закрывает глаза. Потом медленно кивает.', wait:.8},
      {n:'Ая', e:'tired', t:'Дед ждёт.'},
      {n:'Джей', t:'Тогда пойдём. У нас хлеб остался. Правда, жёсткий.', music:'emotional_warm', vol:.5},
      {n:'Ая', t:'Разберёмся.'},
      {n:'Джей', t:'Вот и хорошо. Зато свой.'},
      {n:'', t:'Эра проверяет планшет. Бумага отсырела, линии расплылись. Она стучит по нему пальцем.'},
      {n:'Эра', t:'Придётся всё перемерить.'},
      {n:'Джей', e:'smug', t:'Ты только спустилась, а уже нашла себе работу.'},
      {n:'Эра', t:'Кто-то же должен.'},
      {n:'Джей', t:'Значит, будешь моей соседкой.'},
      {n:'Эра', t:'Я ещё не соглашалась.'},
      {n:'Джей', e:'smug', t:'Поздно. Я уже решила, где поставлю твою кровать.'},
      {n:'', t:'Эра смотрит на неё. Потом убирает планшет.'},
      {n:'Эра', t:'У стены. Там меньше сквозит.'},
      {n:'Джей', e:'happy', t:'Вот. Уже обжилась.'},
      {n:'', t:'Ая коротко усмехается. Улыбка быстро исчезает, но она больше не стоит на месте.'}
    ], end(){ api.focus(null); startScene('cut'); } },
    // катсцена: кадры почти без слов, эпилог — поверх рисунков
    cut:{ slides:true, slideLabel:'ГЛАВА 8', title:'После', lines:[
      {n:'', t:'', slide:0, dur:5, music:'heroic_melancholy', vol:.5},
      {n:'', t:'', slide:1, dur:5},
      {n:'', t:'', slide:2, dur:4.5, music:'heroic_melancholy', vol:.8},
      {n:'', t:'', slide:3, dur:4.5},
      {n:'', t:'', slide:4, dur:4.5},
      {n:'', t:'', slide:5, dur:5},
      {n:'', t:'', slide:7, dur:5},
      // «Все вернулись»
      {n:'', t:'Вечер. Дом Тимофея. В окне горит фонарь. Дед открывает дверь почти сразу, словно давно стоит за ней.', slide:8, music:'sad', vol:.5},
      {n:'Тимофей', t:'Ая.', slide:8},
      {n:'', t:'Ая пытается что-то сказать, но вместо этого обнимает его.', slide:8},
      {n:'', t:'Тимофей осторожно обнимает её в ответ. Не спрашивает ни о чём.', slide:8},
      {n:'', t:'Они стоят так несколько секунд. Искра тихо потрескивает у Аиного плеча.', slide:8, wait:1.2},
      {n:'Тимофей', r:'тихо', t:'Остальные?', slide:8},
      {n:'Ая', t:'Вернулись.', slide:8},
      {n:'', t:'Тимофей кивает. Ждёт.', slide:8, wait:.8},
      {n:'Ая', t:'Все вернулись, кроме…', slide:8},
      {n:'', t:'Она замолкает. Снимает перчатку, снова надевает её. Пальцы не слушаются.', slide:8, wait:.8},
      {n:'Тимофей', t:'Ая.', slide:8},
      {n:'Ая', t:'Странника.', slide:8},
      {n:'', t:'Дед опускает глаза.', slide:8, wait:1},
      {n:'Ая', t:'Он остался там.', slide:8},
      {n:'', t:'Она старается договорить спокойно, но голос срывается на последнем слове.', slide:8},
      {n:'', t:'Тимофей притягивает её к себе.', slide:8},
      {n:'Тимофей', t:'Иди сюда.', slide:8},
      {n:'', t:'Ая утыкается ему в плечо и плачет. Искра прижимается к воротнику. Тимофей закрывает глаза и держит её, пока она не перестаёт дрожать.', slide:8},
      {n:'', t:'За окном ровно горит фонарь.', slide:8, vol:.25, music:'sad'},
      // «Утро»
      {n:'', t:'Утро. Крыша мастерской. Тимофей сидит с кружкой. Ая устраивается рядом. Над крышами лежит низкий туман, но он больше не поднимается к домам.', slide:9, music:'warm', vol:.5},
      {n:'Тимофей', t:'Сегодня ни одного не гасил.', slide:9},
      {n:'Ая', e:'surprised', t:'Правда?', slide:9},
      {n:'Тимофей', t:'Первый раз за двадцать лет.', slide:9},
      {n:'', t:'Он смотрит на свои руки, будто не знает, куда их деть.', slide:9},
      {n:'Ая', t:'И что теперь будешь делать?', slide:9},
      {n:'Тимофей', t:'Пока не придумал.', slide:9},
      {n:'Ая', t:'Можешь начать с того, чтобы не прятаться от Совета.', slide:9},
      {n:'Тимофей', t:'От людей, которых я обманул, тоже.', slide:9},
      {n:'Ая', t:'Это надолго.', slide:9},
      {n:'Тимофей', t:'Знаю.', slide:9},
      {n:'', t:'Ая придвигает к нему кружку, чтобы освободить место на скамье.', slide:9},
      {n:'Ая', e:'smug', t:'Ну вот. Дел уже хватает.', slide:9},
      {n:'', t:'Тимофей тихо усмехается.', slide:9},
      {n:'Тимофей', t:'Пей. Остынет.', slide:9},
      {n:'', t:'Ая берёт кружку. Внизу зажигаются первые утренние окна. Один фонарь продолжает гореть, хотя рассвет уже близко.', slide:9},
      {n:'', t:'', slide:10, dur:5.5, vol:.3, music:'warm'}
    ], end(){ S.endSlide = 14; S.endT = 0; S.endFx1 = S.endFx2 = false; api.complete(); } }, // дальше — «Глава пройдена», финальные слова, скрытая сцена
    // скрытая сцена — только для игрока, после финальных слов
    hidden:{ slides:true, slideLabel:'', noJournal:true, title:'…', lines:[
      {n:'', t:'', slide:11, dur:6, music:'mist_calling', vol:.35},
      {n:'', t:'', slide:12, dur:5},
      {n:'', t:'', slide:13, dur:8}
    ], end(){ showMenu(); } }
  }
});
})();
