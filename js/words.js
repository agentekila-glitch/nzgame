"use strict";
/* =====================================================================
   Послесловие: финальные слова автора игрокам. Экраны листаются касанием (или Enter / пробел / →).
   Показываются после финала главы 8 и потом — по кнопке «Послесловие» в главном меню.
   Пустая строка в lines — пауза-абзац внутри экрана.
   [0.7 · черновик] — тексты из drafts/ch8-texts.md с правками автора.
   ===================================================================== */
const WORDS = [
  {part:'Предисловие', lines:['Вот и всё. Фонари горят.', 'Ая дома. Искра у неё на плече.', 'Дед ворчит, что чай остыл.']},
  {part:'Предисловие', lines:['Прежде чем закроешь игру — пара слов.', 'Уже не про них.', 'Про тебя.']},
  {part:'Благодарность', lines:['Спасибо, что ты здесь, в самом конце.', 'Сколько было падений в Мглу', 'и возвращений к фонарю — знаешь только ты.']},
  {part:'Благодарность', lines:['Ты провёл с этим городом столько времени.', 'Для меня это очень много.', '', '— Ночной Кот']},
  {part:'Огонь', lines:['Фонари в этой игре — это мы.', 'Каждый из нас что-то светит.']},
  {part:'Огонь', lines:['Огонь — это то, что мы отдаём:', 'силы, старания, заботу, любовь,', 'время, которое находим друг для друга.']},
  {part:'Огонь', lines:['Дед двадцать лет зажигал фонари.', 'По одному. Тихо.', 'Чтобы другим было светло.', '', 'Он не во всём был прав.', 'Но свет от этого не переставал быть светом.']},
  {part:'Огонь', lines:['Вран хотел распоряжаться чужим огнём.', 'Наверное, он и сам когда-то верил, что так будет лучше.', 'Но даже ради хорошей цели', 'нельзя забывать о тех, кто останется в темноте.']},
  {part:'Люди рядом', lines:['Твой огонь — тоже твой.', 'Ты можешь делиться им.', 'Но не обязан сгорать дотла.']},
  {part:'Люди рядом', lines:['Искра сама выбрала, к кому прийти.', 'А однажды кто-то сказал:', '«Я держу».', '', 'Береги тех, рядом с кем не страшно.']},
  {part:'Напутствие', lines:['Если сейчас тебе темно —', 'это не значит, что так будет всегда.']},
  {part:'Напутствие', lines:['Фонари сами не зажигаются.', 'Кто-то приходит с маслёнкой и спичками.', 'Иногда этим кем-то можешь оказаться ты.']},
  {part:'Напутствие', lines:['А если однажды погаснет твой фонарь —', 'позволь кому-нибудь помочь.', '', 'Береги свой свет.']}
];
let wordsState = null;
// o.onDone — что дальше (по умолчанию главное меню)
function showWords(o = {}){
  wordsState = {i:0, t:0, onDone:o.onDone || showMenu};
  G1.paused = true; showScreen('words'); setMusic(true, 'hope', .55);
  const dots = $('wDots'); dots.innerHTML = ''; for (let i = 0; i < WORDS.length; i++) dots.appendChild(document.createElement('i'));
  renderWords();
}
function renderWords(){
  const w = wordsState, pg = WORDS[w.i], box = $('wText');
  $('wPart').textContent = pg.part; box.innerHTML = '';
  for (const ln of pg.lines){ const p = document.createElement('p'); if (ln) p.textContent = ln; else p.className = 'gap'; box.appendChild(p); }
  const card = $('wCard'); card.classList.remove('in'); void card.offsetWidth; card.classList.add('in'); // плавное появление каждого экрана
  [...$('wDots').children].forEach((d, i) => d.classList.toggle('on', i === w.i));
  $('wSkip').textContent = w.i === WORDS.length - 1 ? 'Дальше' : 'Пропустить';
  w.t = performance.now();
}
function wordsNext(){
  const w = wordsState; if (!w || performance.now() - w.t < 450) return; // быстрое двойное касание не перелистывает два экрана
  sfx.blip();
  if (w.i < WORDS.length - 1){ w.i++; renderWords(); } else wordsEnd();
}
function wordsEnd(){ const w = wordsState; if (!w) return; wordsState = null; $('words').hidden = true; w.onDone(); }
$('words').addEventListener('pointerdown', e => { if (e.target.closest('button')) return; e.stopPropagation(); wordsNext(); });
$('wSkip').addEventListener('click', e => { e.stopPropagation(); wordsEnd(); });
if ($('mWords')) $('mWords').addEventListener('click', () => showWords({onDone:showMenu}));
