"use strict";
/* =====================================================================
   ПРОЛОГ. «Первый обход» — знакомство с миром, управлением и героями.
   ===================================================================== */
(() => {
// ---------- иллюстрации заставки (кадр 960×540) ----------
function bg(top, bot){ const g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, top); g.addColorStop(1, bot); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH); }
function starsAt(n, a=1){ for (let i=0;i<n;i++){ const x = hash(i,7,1)%VW, y = hash(i,8,2)%(VH*.6), tw = .4 + .6*Math.abs(Math.sin(S.time*(.5 + i%4*.3) + i)); ctx.fillStyle = `rgba(245,240,255,${.6*tw*a})`; ctx.fillRect(x, y, 1.8, 1.8); } }
function fogBands(y0, t, col, n=4){ for (let i=0;i<n;i++){ ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, VH);
  for (let x=0;x<=VW;x+=30) ctx.lineTo(x, y0 + i*26 + Math.sin(x*.012 + t*(.4 + i*.15) + i)*12); ctx.lineTo(VW, VH); ctx.closePath(); ctx.fill(); } }
function houses(baseY, s, R, col, lit=.35){ for (let x=-20; x<VW+40;){ const w = (40 + R()*60)*s, h = (60 + R()*120)*s;
  ctx.fillStyle = col; ctx.fillRect(x, baseY - h, w, h + 400); ctx.beginPath(); ctx.moveTo(x - 6*s, baseY - h); ctx.lineTo(x + w/2, baseY - h - 30*s); ctx.lineTo(x + w + 6*s, baseY - h); ctx.fill();
  for (let y = baseY - h + 14*s; y < baseY - 8; y += 22*s) for (let xx = x + 8*s; xx < x + w - 10*s; xx += 16*s) if (R() < lit){ ctx.fillStyle = 'rgba(255,200,120,.85)'; ctx.fillRect(xx, y, 7*s, 9*s); }
  x += w + 4 + R()*10; } }
function lampPost(x, y, s, lit, t){
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#1A1C30'; ctx.fillRect(-4, -150, 8, 150); ctx.fillRect(-14, -6, 28, 6);
  ctx.beginPath(); ctx.moveTo(-16, -150); ctx.lineTo(-12, -186); ctx.lineTo(12, -186); ctx.lineTo(16, -150); ctx.closePath();
  if (lit){ ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(0, -168, 140, 'rgba(255,190,110,A)', .4); ctx.restore(); ctx.fillStyle = '#FFD996'; } else ctx.fillStyle = '#3A3E5A';
  ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#120E1A'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-18, -186); ctx.lineTo(0, -202); ctx.lineTo(18, -186); ctx.closePath(); ctx.fillStyle = '#1A1C30'; ctx.fill();
  ctx.restore();
}
const SLIDES = [
  function city(t){ // город на скалах над туманом
    bg('#0B1024', '#2E2A56'); starsAt(90);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(VW*.78, 92, 200, 'rgba(255,236,200,A)', .3); ctx.restore();
    ctx.fillStyle = '#F6EED8'; ctx.beginPath(); ctx.arc(VW*.78, 92, 36, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#141A34'; ctx.beginPath(); ctx.moveTo(VW*.18, VH); ctx.lineTo(VW*.24, VH*.56); ctx.lineTo(VW*.36, VH*.46); ctx.lineTo(VW*.5, VH*.4); ctx.lineTo(VW*.64, VH*.48); ctx.lineTo(VW*.76, VH*.58); ctx.lineTo(VW*.84, VH); ctx.fill();
    const R = seeded(3); ctx.save(); ctx.beginPath(); ctx.rect(VW*.24, 0, VW*.52, VH); ctx.clip(); houses(VH*.5, .8, R, '#1C2448', .3); ctx.restore();
    ctx.save(); ctx.translate(VW*.5, VH*.24 + 30); lampPost(0, 0, .5, true, t); ctx.restore();
    fogBands(VH*.66, t, 'rgba(150,140,200,.22)', 5);
  },
  function mist(t){ // Мгла поднимается
    bg('#0E0E22', '#24204A'); starsAt(40, .5);
    houses(VH*.72, 1, seeded(9), '#1E2547', .25);
    const rise = Math.min(1, t*.07);
    fogBands(VH*(.9 - rise*.35), t, 'rgba(40,32,70,.55)', 5);
    for (let i=0;i<5;i++){ const x = 120 + i*170 + Math.sin(t + i)*20, y = VH*(.88 - rise*.3) + Math.sin(t*1.3 + i)*8; ctx.fillStyle = 'rgba(210,190,255,.8)'; ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI*2); ctx.arc(x + 12, y, 3, 0, Math.PI*2); ctx.fill(); }
  },
  function lamplighter(t){ // фонарщик зажигает фонарь
    bg('#101430', '#2E2850'); starsAt(60, .6);
    houses(VH*.78, 1.1, seeded(5), '#1A2142', .2);
    const lit = t % 6 > 1.6;
    lampPost(VW*.56, VH*.92, 1.5, lit, t);
    ctx.save(); ctx.translate(VW*.44, VH*.92); ctx.fillStyle = '#0E0C18';
    ctx.fillRect(40, -260, 8, 260); ctx.fillRect(84, -260, 8, 260); for (let y=-240; y<0; y+=34) ctx.fillRect(40, y, 52, 6);
    ctx.beginPath(); ctx.arc(66, -276, 16, 0, Math.PI*2); ctx.fill(); ctx.fillRect(56, -262, 22, 56);
    ctx.save(); ctx.translate(74, -250); ctx.rotate(-1 + Math.sin(t*2)*.1); ctx.fillRect(0, -4, 60, 7); ctx.restore();
    ctx.restore();
    fogBands(VH*.94, t, 'rgba(120,110,170,.2)', 2);
  },
  function rule(t){ // правило: фонари сами не гаснут
    bg('#0C0C1C', '#1C1A34');
    const cx = VW/2, cy = VH*.46, k = t % 7, lit = k < 4.2;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(2.6, 2.6);
    ctx.fillStyle = '#1A1C30'; ctx.fillRect(-5, 20, 10, 120);
    ctx.beginPath(); ctx.moveTo(-26, 20); ctx.lineTo(-20, -40); ctx.lineTo(20, -40); ctx.lineTo(26, 20); ctx.closePath();
    if (lit){ ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(0, -10, 120, 'rgba(255,190,110,A)', .35 * (k > 3.4 ? (4.2 - k)/.8 : 1)); ctx.restore(); ctx.fillStyle = '#FFD996'; } else ctx.fillStyle = '#2E3048';
    ctx.fill(); ctx.lineWidth = 2.4; ctx.strokeStyle = '#06050C'; ctx.stroke();
    if (lit){ const fl = Math.sin(t*14)*1.6; ctx.beginPath(); ctx.moveTo(0, -24 - fl); ctx.quadraticCurveTo(7, -8, 0, 4); ctx.quadraticCurveTo(-7, -8, 0, -24 - fl); ctx.fillStyle = '#FFF6E0'; ctx.fill(); }
    else { ctx.strokeStyle = 'rgba(200,200,220,.4)'; ctx.lineWidth = 1.4; for (let i=0;i<3;i++){ ctx.beginPath(); const yy = -40 - ((k - 4.2)*20 + i*12); ctx.moveTo(0, -6); ctx.bezierCurveTo(6 + i*2, yy + 20, -6, yy + 10, Math.sin(t*2 + i)*5, yy); ctx.stroke(); } }
    ctx.beginPath(); ctx.moveTo(-30, -40); ctx.lineTo(0, -62); ctx.lineTo(30, -40); ctx.closePath(); ctx.fillStyle = '#1A1C30'; ctx.fill();
    ctx.restore();
  },
  function aya(t){ // Ая на мосту
    bg('#0F1430', '#3A2F5A'); starsAt(100);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(VW*.76, VH*.22, 220, 'rgba(255,236,200,A)', .3); ctx.restore();
    ctx.fillStyle = '#F6EED8'; ctx.beginPath(); ctx.arc(VW*.76, VH*.22, 44, 0, Math.PI*2); ctx.fill();
    houses(VH*.7, .9, seeded(11), '#1E2547', .3);
    ctx.fillStyle = '#4A3424'; ctx.fillRect(0, VH*.78, VW, 16); ctx.fillStyle = '#2A1E16'; for (let x=20;x<VW;x+=90) ctx.fillRect(x, VH*.78 - 50, 8, 50); ctx.fillRect(0, VH*.78 - 50, VW, 6);
    lampPost(VW*.16, VH*.78, 1.1, true, t); lampPost(VW*.86, VH*.78, 1.1, true, t);
    ctx.save(); ctx.translate(VW*.46, VH*.78); ctx.scale(3.6, 3.6); drawChar(ctx, 'aya', {t, blink:(t % 3.5) < .12, sway:{x:-4 + Math.sin(t*1.4)*2, y:0}}); ctx.restore();
    drawIskra(ctx, VW*.54 + Math.sin(t*1.4)*20, VH*.4 + Math.sin(t*2.2)*12, t, 2.4, 0);
    fogBands(VH*.86, t, 'rgba(150,140,200,.2)', 2);
  },
  function iskra(t){ // Искра
    bg('#120E1E', '#241A30');
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(VW/2, VH/2, 300, 'rgba(255,170,80,A)', .25 + .05*Math.sin(t*2)); ctx.restore();
    drawIskra(ctx, VW/2, VH/2 + Math.sin(t*1.6)*10, t, 7, 0);
    for (let i=0;i<24;i++){ const k = (t*.25 + i/24) % 1, a = i*2.4; ctx.fillStyle = `rgba(255,210,140,${(1-k)*.8})`; ctx.fillRect(VW/2 + Math.cos(a)*k*320, VH/2 + Math.sin(a)*k*220 - k*60, 2.4, 2.4); }
  }
];

chapter({
  id:'prologue', label:'Пролог', kicker:'ПРОЛОГ', title:'Первый обход', sub:'Вечер, когда фонарь погас сам',
  theme:'street', music:'calm', cols:150, rows:22, lampsStartOut:true, noStats:true, find:null,
  slides:SLIDES, openScene:'world', startScene:'home',
  build(h){
    const F = h.FLOOR; h.walls();
    h.deco('workshop', 1, F);
    h.ground(2, 40); h.start(8);
    h.npc('timofey', 'timofey', 6, F, {face:1, barks:['Масло проверяй, а не ворон считай.','Ногами шевели, темнота наступает.','Под ноги смотри, доски сгниют скоро.','Огниво не потеряй!']});
    h.hint(9, F - 6, '{lr} — идти · {jump} — прыжок, держи дольше — выше{sprint}');
    h.lamp(13); h.hint(16, F - 5, 'Подойди к фонарю — Ая его зажжёт');
    h.crate(20, F - 2); h.sparks(20, 2, F - 4); h.sparks(24, 2, F - 1);
    h.deco('stall', 26, F);
    h.npc('miko', 'miko', 32, F, {barks:['Заходи на чай, у меня сушки вчерашние есть!','Генерал, перестань клевать сахар!','Бесплатно гадаю только по праздникам, сегодня скидка!']});
    h.trig(29, 'miko');
    h.lamp(37);
    h.deco('sign', 42, F - 1, {text:'КРИВОЙ ПЕР.', h:64});
    h.ground(41, 46, F - 1); h.ground(47, 53, F - 2);
    h.sparks(43, 3, F - 3); h.lamp(50, F - 3);
    h.plank(54, 7, F - 2); h.plank(63, 7, F - 2);
    h.sparks(60, 3, F - 5);
    h.hint(57, F - 7, 'Под мостом — Мгла. Не оступись!');
    h.ground(70, 96);
    h.lamp(78);
    h.crate(84, F - 2); h.crate(86, F - 2); h.crate(86, F - 4); h.sparks(86, 2, F - 6);
    h.plank(89, 6, F - 5);
    h.npc('cherry', 'cherry', 92, F - 5, {hidden:true});
    h.trig(88, 'cherry');
    h.deco('sign', 99, F - 1, {text:'СУШИЛЬНАЯ УЛ.', h:64});
    h.ground(97, 104, F - 1); h.ground(105, 111, F - 2); h.ground(112, 119, F - 3);
    h.plank(101, 3, F - 5); h.sparks(101, 3, F - 6);
    h.lamp(108, F - 3); h.lamp(117, F - 4);
    h.ground(120, 147, F - 3);
    h.sparks(122, 4, F - 5);
    h.lamp(130, F - 4);
    h.trig(137, 'out');
  },
  scenes:{
    world:{ title:'Город над туманом', slides:true, lines:[
      {n:'', slide:0, t:'Этот город стоит на скалах. Внизу, сколько видно глазу, лежит туман. Здесь его называют Мглой.'},
      {n:'', slide:1, t:'Днём Мгла спит. А по ночам поднимается и забирает всё, до чего дотянется: ступени, мостки, целые дома.'},
      {n:'', slide:2, t:'Мглу держит только свет. Поэтому каждый вечер по улицам ходят фонарщики и зажигают фонари. Так было всегда.'},
      {n:'', slide:3, t:'И есть правило, которое тут знает любой ребёнок: фонари сами не гаснут. Если фонарь погас, значит, его кто-то погасил.'},
      {n:'', slide:4, t:'Ае двадцать один. Половину жизни она ходила за дедом Тимофеем с лестницей и маслёнкой. Сегодня ей впервые дали собственный участок.'},
      {n:'', slide:5, t:'С ней Искра — огонёк, который однажды сел Ае на плечо и с тех пор никуда не улетел. Дед говорит, так бывает. Объяснять, как именно, он не любит.'}
    ], end(){ api.card(); } },
    home:{ title:'Перед обходом', lines:[
      {n:'Тимофей', t:'Спички в карман сунула?'},
      {n:'Ая', t:'Дед, у меня огниво на поясе. Зачем мне эти сырые деревяшки?'},
      {n:'Тимофей', t:'Затем, что огниво в сырости осечку даст, а спичка — нет. Возьми, кому говорю.'},
      {n:'Ая', t:'Ладно-ладно, взяла. Всё, я пошла?'},
      {n:'Тимофей', t:'Запоминай маршрут. Кривой переулок, потом через мост. На Сушильной третьим по счёту будет старый фонарь — опять заартачится, так ты его по кожуху стукни, как я учил.'},
      {n:'Ая', t:'Да помню я, ты мне это с утра по три раза повторяешь.'},
      {n:'Тимофей', t:'Повторяю, потому что с первого раза у тебя в одно ухо влетает, из другого свистит.'},
      {n:'Ая', t:'Слушай... А ты сам чего сидишь? Опять колено?'},
      {n:'Тимофей', t:'А что колено? Оно у меня не железное, к непогоде крутит так, что хоть зубами за косяк держись.'},
      {n:'Ая', t:'Понятно. Разберусь, не маленькая.'},
      {n:'Тимофей', t:'Не задерживайся. И... Ая. Если на улице привидится или показалось что странное — не лезь. Разворачивайся и домой.'},
      {n:'Ая', t:'Это что ещё за мудрости? Что именно мне должно показаться?'},
      {n:'Тимофей', t:'Вот когда упрёшься взглядом — сразу поймёшь. Иди давай, маслёнку не пролей.'},
      {n:'', t:'Искра с тихим треском вспыхивает у Аи над плечом и тянет вперёд, в темноту переулка.'}
    ]},
    miko:{ title:'Чай и гадание', lines:[
      {n:'Мико', t:'Ая! Замри! Даже не думай шагнуть на мост!'},
      {n:'Ая', t:'Мико, прекрати. Я по этому мосту каждый божий вечер хожу, у меня обход.'},
      {n:'Мико', t:'Вот именно! А сегодня развернись и пойдём чаю попьём. Карты с утра раскладывала — легли так, будто у них депрессия.'},
      {n:'Ая', t:'У тебя карты каждый день лежат так, словно город завтра сквозь землю провалится. Вчера ты мне вообще любовь всей жизни нагадала.'},
      {n:'Мико', t:'И чем тебя не устраивает любовь?'},
      {n:'Ая', t:'Тем, что из «любови» я встретила только твоего общипанного голубя, который пытался спрессовать мою булку.'},
      {n:'Мико', t:'Генерал — благородная птица с тонкой душевной организацией! На, дай руку на секунду.'},
      {n:'Ая', t:'Мне идти надо, Мгла ждать не будет.'},
      {n:'Мико', t:'Дай ладонь, пока я тебе бесплатно гадаю! Так... Линия судьбы петляет... О, сегодня тебе на макушку что-то тяжёлое прилетит.'},
      {n:'Ая', t:'Отличный прогноз. О надевании ведра заранее надо подумать?'},
      {n:'Мико', t:'Смейся-смейся. Когда свалится — не приходи плакать, что я не предупреждала. Генерал, подтверди!'},
      {n:'', t:'Генерал выдаёт громкое сопливое курлыканье и демонстративно отворачивается.', act(){ sfx.coo(); }},
      {n:'Ая', t:'Ну всё, авторитетное мнение получено, я пошла.'}
    ]},
    cherry:{ title:'Письмо без подписи', lines:[
      {n:'', t:'Сверху на Аю с глухим звуком падает плотный конверт, задевая макушку.', act(){ api.show('cherry'); sfx.land(.4); S.shake = .15; }},
      {n:'Ая', t:'Оу! Черри! Ты совсем на своих крышах из ума выжила?!'},
      {n:'Черри', t:'Ой-ой-ой, Ая, прости-прости! Я не специально в голову, я целилась куда-то в район плеча!'},
      {n:'Ая', t:'Очень утешает! Ты зачем письмо кидаешь как булыжник?'},
      {n:'Черри', t:'Так быстрее! У меня тридцать адресов на Верхнем рынке, а Вешка опять за мотыльками увязалась! Короче, это тебе лично!'},
      {n:'Ая', t:'Мне? От кого?'},
      {n:'Черри', t:'Да почём я знаю, там подписи нет! Только «Ае, фонарщице, лично в руки». Ну, технически в руки и получилось, просто транзитом через голову.'},
      {n:'Ая', t:'Ты неуправляемая... Ладно, давай сюда.'},
      {n:'', t:'Ая надрывает плотную бумагу. Внутри короткая строчка: «Проверь фонари на Сушильной. Не говори деду».'},
      {n:'Черри', t:'Ну что там? Проклятие? Любовное признание? Страшная тайна?'},
      {n:'Ая', t:'На, сама почитай, если так интересно.'},
      {n:'Черри', t:'Не-не-не, вдруг там заговорённая бумага! Меня потом из почтовой гильдии выпрут. Пойдёшь проверять?'},
      {n:'Ая', t:'А у меня есть выбор? Пойду, конечно. А деду... пока говорить не буду.'},
      {n:'Черри', t:'О-о-о, секретики! Всё, я полетела, а то меня на рынке изжарят за задержку. Если будут резать — кричи громче, я с крыши услышу!'},
      {n:'', t:'Черри ловко цепляется за водосток и уносится наверх.', act(){ api.leave('cherry', 1, 320); }},
      {n:'Ая', t:'М-да... «На голову свалится то, чего не ждёшь». Мико теперь неделю гордиться собой будет.'}
    ]},
    out:{ title:'Фонарь погас сам', lines:[
      {n:'', t:'Фонарь, который Ая зажгла ровно минуту назад, начинает судорожно подрагивать.', act(){ api.lampOut(6); setMusic(true, 'escape'); }},
      {n:'Ая', t:'Да ну нет... Только не сейчас.'},
      {n:'', t:'Она подбегает и заглядывает внутрь стеклянного колпака.'},
      {n:'Ая', t:'Масло полно, фитиль сухой... Ветра вообще нет! Из-за чего ты потух?'},
      {n:'', t:'Искра жалобно испускает тонкий треск и вжимается в шею Аи.', act(){ S.V.scared = 1; }},
      {n:'Ая', t:'Тише, маленькая, не паникуй...'},
      {n:'', t:'В глубине улицы с тихим хлопком гаснет второй фонарь, за ним — третий.', act(){ api.lampOut(5); api.lampOut(4); }},
      {n:'Ая', t:'Чёрт. Они не должны гаснуть сами... Это невозможно!'},
      {n:'', t:'Искра почти полностью тускнеет, превращаясь в сизоватый уголёк.'},
      {n:'Ая', t:'Если Нижний квартал останется без света, дед с меня шкуру спустит...'}
    ], end(){ api.complete(); } }
  }
});
})();
