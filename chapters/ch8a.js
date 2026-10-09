"use strict";
/* =====================================================================
   ГЛАВА 8. «Первый Огонь» — участок 1 из 3: «Сердце Долины».
   Ворота Сердца: Вран просит ключ, Ая открывает сама → кольцевые галереи, большая цепь моста →
   лебёдка: цепь поднимает плиты (обучение и посложнее) → малый резонатор: Искра соединяет два канала.
   Тексты — drafts/ch8-texts.md (черновик с правками автора). Разметка уровня — Claude.
   ===================================================================== */
(() => {
const MIST = 28;
const mist = () => startRise({y:MIST*T, top:MIST*T, speed:30});
chapter({
  id:'ch8a', group:'ch8', partNo:1, groupTitle:'Первый Огонь', groupSub:'Финал первой части',
  label:'Глава 8', kicker:'ГЛАВА 8 · ВОРОТА', title:'Сердце Долины', sub:'Ключ, цепь и два канала',
  theme:'heart', music:'ancient_streets', cols:260, rows:30, find:'past', canDouble:true, noStats:true,
  startScene:'heart_door',
  build(h){
    h.walls();
    // A. Ворота Сердца
    h.ground(2, 44, 20); h.start(30, 19); h.lamp(20, 19);
    h.npc('merc2', 'merc', 8, 20, {face:1, lookAt:false}); h.npc('merc1', 'merc', 11, 20, {face:1, lookAt:false}); h.npc('vran', 'vran', 14, 20, {face:1, lookAt:false});
    h.npc('jay', 'jay', 24, 20, {face:-1, lookAt:false}); h.npc('era', 'era', 26, 20, {face:-1, lookAt:false}); h.npc('axel', 'axel', 35, 20, {face:-1, lookAt:false});
    h.deco('arch', 42, 20, {big:true, open:'heartOpen'});
    h.block(38, 46, 2, 7); h.gate(40, 8, 19, 'heart', {look:'stone', w:4});
    // B. Кольцевые галереи: большая цепь моста — пока просто смотрим
    h.ground(44, 70, 20); h.lamp(48, 19); h.sparks(52, 6, 18);
    h.npc('era2', 'era', 63, 20, {hidden:true, face:1, lookAt:false, barks:['На этой цепи весь мост висит. Не трогай.', 'Звенья старше гильдии. Лет на сто.']});
    h.npc('jay2', 'jay', 67, 20, {hidden:true, face:1, lookAt:false, barks:['Звенит. Плохая примета. Или хорошая — забыла.', 'Под ногами смотри, верхняя.']});
    h.span(71, 20, 8, 'dec');
    h.block(80, 81, 2, 13); h.chain(80, 12, 75, 20, 'dec');
    h.findx(75, 17, 'Медная бирка смотрителя цепей', 'token');          // находка 1 — над плитой моста
    // C. Ворот: обучение — цепь поднимает две плиты над провалом
    h.ground(79, 100, 20); h.lamp(84, 19);
    h.hint(90, 14, 'Встань у лебёдки и держи {down}, пока стопор не щёлкнет.');
    h.trig(94, 'chain_lesson');
    h.winch(98, 20, 'w1');
    h.block(99, 101, 2, 11); h.chain(100, 11, 104, 20, 'w1c');
    h.heat(101, 20, 6, 'w1', {drop:9}); h.heat(107, 20, 6, 'w1', {drop:9}); // поднятый мост — сплошной
    h.ground(113, 140, 20); h.lamp(116, 19); h.sparks(118, 5, 18);
    // лебёдка посложнее: три плиты лесенкой на верхнюю галерею, низом не пройти
    h.winch(128, 20, 'w2');
    h.heat(131, 17, 3, 'w2', {drop:3}); h.heat(135, 14, 3, 'w2', {drop:6}); h.heat(131, 11, 3, 'w2', {drop:9});
    h.block(137, 160, 8, 8); h.block(141, 144, 9, 19);
    h.plank(152, 4, 4); h.findx(153, 3, 'Список пекарей у Сердца', 'page'); // находка 2 — на полке над галереей
    h.sparks(140, 6, 6);
    // D. Малый резонатор: два канала должны гореть одновременно
    h.ground(161, 186, 14); h.lamp(164, 13);
    h.trig(170, 'two_channels');
    h.deco('gutters', 172, 14, {w:32, a:'ca', b:'cb', out:'both'});
    h.hearth(178, 14, 'ca', {dur:8});
    h.ground(191, 258, 14); h.block(193, 199, 10, 13); h.hearth(196, 10, 'cb', {dur:8});
    h.pair('ca', 'cb', 'both');
    h.hint(181, 8, 'Зажги оба очага, чтобы они горели одновременно, — огонь пойдёт по двум каналам.');
    h.block(204, 209, 2, 3); h.gate(206, 4, 13, 'both', {look:'stone', w:2});
    h.lamp(214, 13); h.sparks(218, 6, 12); h.deco('shard', 230, 14);
    h.exit(250, 13);
    // напарники в сценах-уроках (появляются только на время разговора)
    h.npc('era3', 'era', 92, 20, {hidden:true, face:1, lookAt:false, barks:['Кофе считается?']}); h.npc('jay3', 'jay', 95, 20, {hidden:true, face:-1, lookAt:false, barks:['Книжная, ты ела сегодня?']});
    h.npc('era4', 'era', 166, 14, {hidden:true, face:1, lookAt:false, barks:['Он всегда такой твёрдый?']}); h.npc('jay4', 'jay', 168, 14, {hidden:true, face:-1, lookAt:false, barks:['Нет. Садись. Есть хлеб.']}); h.npc('axel4', 'axel', 163, 14, {hidden:true, face:1, lookAt:false});
  },
  onPlay(){ mist(); },
  restore(){
    mist();
    if (S.flags.t_heart_door){ api.signal('heart'); for (const id of ['vran','merc1','merc2','jay','era','axel']) api.hide(id); api.show('era2'); api.show('jay2'); }
    if (S.flags.t_chain_lesson){ api.hide('era2'); api.hide('jay2'); api.show('era3'); api.show('jay3'); }
    if (S.flags.t_two_channels){ api.hide('era3'); api.hide('jay3'); api.show('era4'); api.show('jay4'); }
    for (const kl of S.W.keylocks) if (S.flags['k_' + kl.id]){ kl.done = true; api.signal(kl.id); }
    if (S.flags.pair_both){ api.signal('both'); api.openExit(); }
    setMusic(true, 'ancient_streets');
  },
  tick(){ if (S.W.forced.both && !S.flags.exitOpen) api.openExit(); },
  scenes:{
    // [0.7 · черновик] — тексты из drafts/ch8-texts.md
    heart_door:{ music:'tense', title:'Ворота Сердца', lines:[
      {n:'', t:'Площадка перед воротами Сердца. Наёмники Врана стоят полукругом. Свет за решёткой бьётся ровно, как пульс.', sfx:'heart', act(){ api.focus(26, 16); }},
      {n:'Вран', t:'Отдай мне ключ, Ая. Я не отнимаю — я прошу.'},
      {n:'Ая', e:'smug', t:'Ты — просишь? Эра, запиши.'},
      {n:'Эра', t:'Записала.'},
      {n:'Вран', t:'Ты видела Долину, видела, как люди спят у труб. Это сделала гильдия, а не я.'},
      {n:'Ая', t:'Знаю.'},
      {n:'Вран', t:'Тогда отдай огонь тому, кто не станет прятать его за дверью. Я открою его всем.'},
      {n:'Ая', t:'За деньги.'},
      {n:'Вран', t:'За честные деньги. Это лучше, чем ничего.'},
      {n:'Ая', e:'worried', t:'А когда огня опять станет мало? Кто будет решать, кому достанется? Ты?'},
      {n:'', t:'Вран молчит. Монокль поблёскивает в свете из-за решётки.', wait:.8},
      {n:'Вран', t:'Кто-то же должен решать, Ая.'},
      {n:'Ая', t:'Вот и дед так думал.'},
      {n:'Джей', r:'тихо', t:'Хорошо сказала, верхняя.'},
      {n:'Вран', e:'tired', t:'Открывай. Посмотрим, что ты выберешь, когда увидишь его сама.'},
      {n:'', t:'Ая вставляет Медный ключ в замок. Решётка вздрагивает и медленно уходит вверх.', act(){ api.signal('heart'); api.flag('heartOpen'); api.focus(41, 15); }},
      {n:'Странник', t:'Держись рядом.', wait:1.4}
    ], end(){ api.focus(null); api.flag('t_heart_door');
      for (const id of ['vran','merc1','merc2']) api.leave(id, -1, 120);
      for (const id of ['jay','era','axel']) api.walk(id, 46, 150, () => api.hide(id));
      api.show('era2'); api.show('jay2'); } },
    chain_lesson:{ title:'Лебёдка', lines:[
      {n:'', t:'Над провалом на толстой цепи висит каменная плита. У стены — лебёдка с медной ручкой.', act(){ api.hide('era2'); api.hide('jay2'); api.show('era3', 92, 20); api.show('jay3', 95, 20); api.focus(102, 16); }},
      {n:'Эра', t:'Цепной механизм. Плиту поднимает лебёдка, а держит стопор.'},
      {n:'Джей', t:'По-простому: встань у лебёдки и держи, пока не щёлкнет.'},
      {n:'Ая', t:'А если не щёлкнет?'},
      {n:'Джей', t:'Тогда плита поедет вниз. С тобой или без.'},
      {n:'Ая', e:'tired', t:'Мне нравится, как вы объясняете. Обе.'}
    ], end(){ api.focus(null); } }, // Эра и Джей остаются у лебёдки
    two_channels:{ music:'mystery', title:'Малый резонатор', lines:[
      {n:'', t:'Малый зал. В полу два каменных желоба. Один засыпан щебнем. Над ними висит медная чаша.', act(){ api.hide('era3'); api.hide('jay3'); api.show('era4', 166, 14); api.show('jay4', 168, 14); api.show('axel4', 163, 14); api.focus(180, 10); }},
      {n:'Эра', e:'surprised', t:'Здесь два канала. А второй заложили. Специально.'},
      {n:'Ая', t:'Кем?'},
      {n:'Эра', t:'Теми, кто уносил огонь. Чтобы свет шёл только наверх.'},
      {n:'Джей', e:'angry', t:'Ну конечно. Нам — щебень.'},
      {n:'', t:'Искра слетает с плеча и кружит над чашей. Медь отзывается тонким звоном. По второму желобу пробегает золотая нить.', sfx:'resonate', act(){ api.iskraTo(186, 11); setTimeout(() => api.iskraBack(), 1800); }},
      {n:'Ая', e:'surprised', t:'Она его открыла?'},
      {n:'Эра', t:'Не открыла. Соединила. Теперь огонь идёт по двум каналам сразу.'},
      {n:'Джей', t:'Данного света хватит на всех?'},
      {n:'Эра', t:'Если Искра удержит связь. С Первым Огнём я такого не проверяла.'},
      {n:'Странник', t:'Если.'}
    ], end(){ api.focus(null); api.hide('axel4'); } } // Эра и Джей остаются у малого резонатора
  }
});
})();
