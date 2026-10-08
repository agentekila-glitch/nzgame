"use strict";
/* =====================================================================
   Персонажи: спрайты в мире (drawChar) и портреты для диалогов (VN_DRAW).
   ===================================================================== */
/* ================= Персонажи в мире (вектор, чернильный контур) ================= */
const CH = {
  aya:{ name:'Ая', skin:'#F6D9C4', blush:'#F0A090', hair:'#9C4A2A', hairHi:'#D8834F', eye:'#3E6E9C',
    top:'#2F3E66', topHi:'#46598A', trim:'#E8823A', obi:'#6B4A30', legs:'#2A2638', boots:'#5A3A26', hand:'#F6D9C4' },
  timofey:{ name:'Тимофей', skin:'#EFCDB5', blush:'#E59A88', hair:'#C9C4BC', hairHi:'#F0EDE6', eye:'#4A3A2E',
    top:'#6B4E36', topHi:'#8A6A4E', trim:'#C9A15A', obi:'#3E2E22', legs:'#3A3430', boots:'#2E2420', hand:'#EFCDB5', scale:.97 },
  miko:{ name:'Мико', skin:'#F8DCC8', blush:'#F49AAE', hair:'#A57AD0', hairHi:'#E2CBF5', eye:'#7A3E8E',
    top:'#5A3E7A', topHi:'#7A5AA0', trim:'#F2C14E', obi:'#E06A8A', legs:'#3A2E48', boots:'#4A3040', hand:'#F8DCC8' },
  gisa:{ name:'Гиса', skin:'#F3D2BC', blush:'#F0957E', hair:'#3A2A24', hairHi:'#6A5040', eye:'#C77A1E',
    top:'#E8A93A', topHi:'#F5C962', trim:'#4A6E8A', obi:'#6B4A30', legs:'#C98A2A', boots:'#3A2E28', hand:'#F3D2BC' },
  axel:{ name:'Странник', skin:'#EBCFBB', blush:'#DDB09C', hair:'#171B2B', hairHi:'#5C6C9E', eye:'#E8A23A',
    top:'#25304F', topHi:'#34436C', trim:'#1E7A84', obi:'#3A2A22', legs:'#191C27', boots:'#110E14', hand:'#16161E', scale:1.08 },
  vran:{ name:'Вран', skin:'#F0DCCB', blush:'#E2A49A', hair:'#1E1A24', hairHi:'#4A4258', eye:'#8C2E3A',
    top:'#5E1E2A', topHi:'#7E2E3C', trim:'#E9E0CE', obi:'#2A1A20', legs:'#1E1A22', boots:'#141016', hand:'#EDE6DA', scale:1.08 },
  cherry:{ name:'Черри', skin:'#F7DDC9', blush:'#F2A69A', hair:'#2E2433', hairHi:'#54425E', eye:'#B9682E',
    top:'#8E2C2E', topHi:'#B4463C', trim:'#EE8A3E', obi:'#9690B2', legs:'#3A2F44', boots:'#6E4A34', hand:'#2E2433' },
  julia:{ name:'Жуля', skin:'#F4D3B9', blush:'#F39C8E', hair:'#3DB5A4', hairHi:'#86E0CF', eye:'#3F8F44',
    top:'#4F7D5A', topHi:'#6E9F76', trim:'#F2C14E', obi:'#F2C14E', legs:'#3B3550', boots:'#2E2A3E', hand:'#F4D3B9' },
  marta:{ name:'Марта', skin:'#F7E1CD', blush:'#EFA593', hair:'#F0CF78', hairHi:'#FFF0BE', eye:'#3E8E5A',
    top:'#7C9C69', topHi:'#9DBB87', trim:'#D8C79A', obi:'#6B5A44', legs:'#5A4A3A', boots:'#4A3628', hand:'#F7E1CD' },
  // статисты главы 5: стража гильдии и старейшина Совета
  guard:{ name:'Стражник', skin:'#EBCDB6', blush:'#DDA08C', hair:'#3A2E28', hairHi:'#5A4A40', eye:'#3A3A4A',
    top:'#2E3E5E', topHi:'#40547A', trim:'#C9A15A', obi:'#1E2638', legs:'#22283A', boots:'#141018', hand:'#EBCDB6', scale:1.04 },
  elder:{ name:'Старейшина', skin:'#EDD0BA', blush:'#DFA290', hair:'#E8E4DC', hairHi:'#FFFFFF', eye:'#4A3A2E',
    top:'#4A2E3E', topHi:'#6A4458', trim:'#D9B24A', obi:'#2A1A24', legs:'#3A2A34', boots:'#1E161C', hand:'#EDD0BA' },
  // глава 6: Эрмина (Эра) — архивистка в кожаной куртке, с планшетом чертежей; наёмники Врана
  era:{ name:'Эра', skin:'#F3D8C4', blush:'#EBA08E', hair:'#3A3048', hairHi:'#6A5A82', eye:'#4E7A6A',
    top:'#7A5238', topHi:'#9A6E4E', trim:'#C9A15A', obi:'#3A2A22', legs:'#34343F', boots:'#2A2024', hand:'#F3D8C4' },
  merc:{ name:'Наёмник', skin:'#E6C8B0', blush:'#D89C88', hair:'#2A2224', hairHi:'#4A3E40', eye:'#3A2A2A',
    top:'#4E2228', topHi:'#6A3038', trim:'#8A8A94', obi:'#1E1618', legs:'#24202A', boots:'#141016', hand:'#2A2226', scale:1.06 }
};
function pathRR(c, x, y, w, h, r){ c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
function fillInk(c, fill, lw=2){ c.fillStyle = fill; c.fill(); c.lineWidth = lw; c.strokeStyle = INK; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); }
function mapleLeaf(c, x, y, s, rot, col){
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.beginPath();
  const pts = [[0,-6],[1.6,-2.6],[4.6,-3.6],[3.4,-.6],[6,.6],[2.4,1.6],[2.6,4],[0,2.6],[-2.6,4],[-2.4,1.6],[-6,.6],[-3.4,-.6],[-4.6,-3.6],[-1.6,-2.6]];
  pts.forEach(([a,b],i) => i ? c.lineTo(a,b) : c.moveTo(a,b)); c.closePath(); fillInk(c, col, 1.4/s); c.restore();
}
// Шарф/лента, развевающаяся за спиной (на уровне шеи)
function scarfTail(c, col, swx, swy, t, len=1){
  c.beginPath(); c.moveTo(-3, -28); c.quadraticCurveTo(-14*len - swx, -27 + swy, -22*len - swx*1.6, -22 + Math.sin(t*9)*2 + swy*.6);
  c.lineTo(-20*len - swx*1.4, -18 + Math.sin(t*9)*2 + swy*.6); c.quadraticCurveTo(-12*len - swx*.6, -23, -2, -24); c.closePath(); fillInk(c, col);
}
/* Части персонажей. back — за телом (волосы, хвост, шарф); torso — детали одежды поверх туловища;
   coat — полы пальто поверх ног; front — в системе головы (центр 0,0, радиус 13): чёлка, шапки, борода. */
const CHAR_PARTS = {
  // стража гильдии: форменная фуражка с медной бляхой, портупея
  guard:{
    torso(c, k){ c.beginPath(); c.moveTo(-8, -29); c.lineTo(8, -14); c.lineWidth = 2.4; c.strokeStyle = '#1A1E2A'; c.stroke();
      pathRR(c, -10, -17, 20, 3.4, 1.6); fillInk(c, '#1A1E2A', 1.4); c.beginPath(); c.arc(-4, -24, 2, 0, Math.PI*2); fillInk(c, k.trim, 1); },
    front(c, k){ c.beginPath(); c.moveTo(-13.6, -2); c.quadraticCurveTo(-14, -14, 0, -15.5); c.quadraticCurveTo(14, -14, 13.6, -2); c.closePath(); fillInk(c, k.top);
      c.beginPath(); c.moveTo(-14, -2); c.lineTo(16, -2); c.lineTo(17, 1); c.lineTo(-13, 1); c.closePath(); fillInk(c, '#141824', 1.4);
      c.beginPath(); c.arc(1, -8, 3, 0, Math.PI*2); fillInk(c, k.trim, 1.2); }
  },
  // Эра: волосы до плеч с прямой чёлкой, коса через плечо, ремень планшета с чертежами
  era:{
    back(c, k, P){ const {swx, swy} = P;
      c.save(); c.translate(-9, -24); c.rotate(-.25); pathRR(c, -4, -9, 8, 18, 1.5); fillInk(c, '#E8DCC0', 1.4); c.restore();
      c.beginPath(); c.moveTo(-7, -55); c.bezierCurveTo(-18, -52, -18, -40, -15 - swx*.3, -32 + swy*.2); c.lineTo(8, -32); c.quadraticCurveTo(13, -46, 8, -54); c.closePath(); fillInk(c, k.hair); },
    torso(c, k){
      c.beginPath(); c.moveTo(-8, -29); c.lineTo(9, -13); c.lineWidth = 2.4; c.strokeStyle = '#3E2C22'; c.stroke();
      pathRR(c, 4, -18, 9, 7, 1.5); fillInk(c, '#E8DCC0', 1.2);
      c.beginPath(); c.moveTo(0.5, -29); c.lineTo(0.5, -12); c.lineWidth = 1.2; c.strokeStyle = '#3A2618'; c.stroke(); },
    front(c, k, P){ const {swx, swy} = P;
      c.beginPath(); c.moveTo(-13.4, 0); c.quadraticCurveTo(-14, -12, 0, -13.6); c.quadraticCurveTo(13, -13, 13.4, -1); c.lineTo(12, -4); c.lineTo(-12, -4); c.closePath(); fillInk(c, k.hair);
      c.beginPath(); c.moveTo(11, -2); c.quadraticCurveTo(15 - swx*.2, 8, 12 - swx*.3, 20 + swy*.2); c.lineWidth = 4.4; c.strokeStyle = INK; c.stroke(); c.lineWidth = 2.8; c.strokeStyle = k.hair; c.stroke();
      c.beginPath(); c.arc(12 - swx*.3, 21 + swy*.2, 1.8, 0, Math.PI*2); fillInk(c, '#C9A15A', 1); }
  },
  merc:{
    torso(c, k){ c.beginPath(); c.moveTo(-8, -29); c.lineTo(8, -14); c.lineWidth = 2.4; c.strokeStyle = '#1A1214'; c.stroke(); pathRR(c, -10, -17, 20, 3.4, 1.6); fillInk(c, '#1A1214', 1.4); },
    front(c, k){ c.beginPath(); c.moveTo(-13.6, 2); c.quadraticCurveTo(-14, -13, 0, -14.6); c.quadraticCurveTo(13, -13, 13.6, 2); c.quadraticCurveTo(4, -6, -13.6, 2); fillInk(c, '#2A2224');
      c.beginPath(); c.moveTo(-6, 6); c.lineTo(14, 6); c.lineTo(13, 11); c.lineTo(-5, 11); c.closePath(); fillInk(c, '#3A2A2E', 1.2); }
  },
  // старейшина Совета: длинные седые волосы и борода
  elder:{
    back(c, k){ c.beginPath(); c.moveTo(-7, -54); c.bezierCurveTo(-19, -50, -18, -36, -14, -28); c.lineTo(6, -34); c.quadraticCurveTo(12, -46, 8, -54); c.closePath(); fillInk(c, k.hair); },
    front(c, k){ c.beginPath(); c.moveTo(-13.4, 2); c.quadraticCurveTo(-14, -12, 0, -13.8); c.quadraticCurveTo(12, -13, 13.4, -2); c.quadraticCurveTo(6, -9, -2, -8.6); c.quadraticCurveTo(-9, -7, -13.4, 2); fillInk(c, k.hair);
      c.beginPath(); c.moveTo(-1, 4); c.quadraticCurveTo(-1, 16, 5, 19); c.quadraticCurveTo(12, 15, 12, 4); c.quadraticCurveTo(6, 8, -1, 4); fillInk(c, k.hair);
      c.beginPath(); c.arc(4.5, -3, 3.4, 0, Math.PI*2); c.moveTo(11.5, -3); c.arc(8.5, -3, 3, 0, Math.PI*2); c.lineWidth = 1.2; c.strokeStyle = '#C9A050'; c.stroke(); }
  },
  aya:{
    back(c, k, P){ const {swx, swy, t} = P;
      scarfTail(c, k.trim, swx, swy, t, 1.15);
      c.beginPath(); c.moveTo(-8, -50); c.quadraticCurveTo(-16 - swx*.4, -46, -15 - swx*.6, -38 + swy*.3);
      c.quadraticCurveTo(-20 - swx, -28 + swy*.6, -14 - swx*.9, -20 + swy*.6); c.quadraticCurveTo(-11 - swx*.5, -30, -6, -40); c.closePath(); fillInk(c, k.hair);
      c.beginPath(); c.moveTo(-6, -54); c.bezierCurveTo(-17, -50, -15, -40, -12, -34); c.lineTo(8, -34); c.quadraticCurveTo(12, -46, 8, -53); c.closePath(); fillInk(c, k.hair); },
    torso(c, k){
      c.beginPath(); c.moveTo(1, -29); c.lineTo(1, -12); c.lineWidth = 1.4; c.strokeStyle = shade(k.top, -.3); c.stroke();
      c.beginPath(); c.moveTo(-8, -28); c.lineTo(9, -14); c.lineWidth = 2.2; c.strokeStyle = '#7A5236'; c.stroke();
      pathRR(c, -10, -17, 20, 3.4, 1.6); fillInk(c, k.obi, 1.4);
      c.beginPath(); c.moveTo(-8.5, -29.5); c.quadraticCurveTo(0, -24.5, 8.5, -29.5); c.quadraticCurveTo(0, -32.5, -8.5, -29.5); fillInk(c, k.trim, 1.6);
      pathRR(c, 5, -16, 6, 5, 1.5); fillInk(c, '#8A5A3C', 1.2); },
    front(c, k, P){ const {swx} = P;
      c.beginPath(); c.moveTo(-13.4, 3); c.quadraticCurveTo(-15, -11, -3, -13.6); c.quadraticCurveTo(9, -15, 13.6, -3);
      c.quadraticCurveTo(10, -7, 6, -4.5); c.quadraticCurveTo(4.5, -8, 1, -5); c.quadraticCurveTo(-2, -9, -6, -3.6); c.quadraticCurveTo(-9, -6, -11, 1); c.closePath(); fillInk(c, k.hair);
      c.save(); c.globalAlpha = .7; c.beginPath(); c.moveTo(-5, -11); c.quadraticCurveTo(1, -12.8, 6, -10); c.lineWidth = 1.6; c.strokeStyle = k.hairHi; c.stroke(); c.restore();
      c.beginPath(); c.moveTo(12.6, -3); c.quadraticCurveTo(14.6 + swx*.2, 4, 12.4 + swx*.3, 9); c.lineWidth = 3; c.strokeStyle = INK; c.stroke(); c.lineWidth = 1.5; c.strokeStyle = k.hair; c.stroke();
      c.beginPath(); c.moveTo(-9, -12); c.quadraticCurveTo(-7, -17, -4.5, -12.5); c.quadraticCurveTo(-6.5, -10.5, -9, -12); fillInk(c, '#F2A04A', 1.2); }
  },
  timofey:{
    back(c, k){ c.beginPath(); c.arc(-6, -44, 9, Math.PI*.6, Math.PI*1.5); c.lineTo(-2, -48); c.closePath(); fillInk(c, k.hair); },
    torso(c, k){
      c.beginPath(); c.moveTo(-1, -29); c.lineTo(-1, -11); c.lineWidth = 1.4; c.strokeStyle = shade(k.top, -.3); c.stroke();
      for (const y of [-25, -20, -15]){ c.beginPath(); c.arc(1.6, y, 1.1, 0, Math.PI*2); c.fillStyle = k.trim; c.fill(); }
      c.beginPath(); c.moveTo(3, -19); c.quadraticCurveTo(7, -15, 9, -18); c.lineWidth = 1; c.strokeStyle = '#E8C66A'; c.stroke(); },
    coat(c, k){ c.beginPath(); c.moveTo(-10.5, -12); c.lineTo(-12, -2); c.lineTo(-1, -3); c.lineTo(0, -10); c.moveTo(10.5, -12); c.lineTo(11.5, -3); c.lineTo(2, -3); c.lineTo(1, -10); fillInk(c, shade(k.top, -.08), 1.8); },
    front(c, k, P){ const talk = P.talk ? Math.abs(Math.sin(P.t*20))*1.2 : 0;
      c.beginPath(); c.moveTo(-1, 3.5); c.quadraticCurveTo(-2, 12 + talk, 5, 15 + talk); c.quadraticCurveTo(12, 13 + talk, 12.5, 4); c.quadraticCurveTo(9, 7.5, 5.5, 6); c.quadraticCurveTo(2, 7.5, -1, 3.5); fillInk(c, k.hair, 1.6);
      c.beginPath(); c.moveTo(1.2, 6.4); c.quadraticCurveTo(5.4, 4.2, 10.4, 6.2); c.lineWidth = 2.6; c.strokeStyle = INK; c.stroke(); c.lineWidth = 1.4; c.strokeStyle = k.hairHi; c.stroke();
      c.beginPath(); c.moveTo(-1.5, -2.6); c.lineTo(3.6, -3.2); c.moveTo(6.2, -3.2); c.lineTo(11, -2.4); c.lineWidth = 2.4; c.strokeStyle = k.hairHi; c.stroke();
      c.beginPath(); c.ellipse(-1, -10, 15.5, 4.6, -.08, Math.PI, 0); c.lineTo(17, -9); c.quadraticCurveTo(4, -6.5, -15, -8.5); c.closePath(); fillInk(c, '#5C4A3A', 1.8);
      c.beginPath(); c.moveTo(-14, -9); c.quadraticCurveTo(-12, -19, 0, -18.5); c.quadraticCurveTo(12, -18, 13, -9.5); c.closePath(); fillInk(c, '#6E5A46', 1.8);
      c.beginPath(); c.arc(1.2, 1.2, 3.4, 0, Math.PI*2); c.moveTo(11.6, 1.2); c.arc(8.2, 1.2, 3.4, 0, Math.PI*2); c.lineWidth = .9; c.strokeStyle = '#C9A15A'; c.stroke(); }
  },
  miko:{
    back(c, k, P){ const {swx, swy} = P;
      c.beginPath(); c.moveTo(-6, -55); c.bezierCurveTo(-20, -52, -19 - swx*.3, -36, -18 - swx*.8, -18 + swy*.4);
      c.quadraticCurveTo(-21 - swx, -9 + swy*.4, -13 - swx*.7, -8); c.quadraticCurveTo(-9, -16, -5, -28); c.lineTo(8, -32); c.quadraticCurveTo(13, -44, 9, -53); c.closePath(); fillInk(c, k.hair);
      c.save(); c.globalAlpha = .5; c.beginPath(); c.moveTo(-12, -44); c.quadraticCurveTo(-16 - swx*.4, -30, -15 - swx*.7, -14); c.lineWidth = 1.3; c.strokeStyle = k.hairHi; c.stroke(); c.restore(); },
    torso(c, k){
      c.beginPath(); c.moveTo(-9, -29); c.quadraticCurveTo(0, -18, 9, -29); c.lineTo(10, -22); c.quadraticCurveTo(0, -12, -10, -22); c.closePath(); fillInk(c, '#3E2A58', 1.6);
      for (let i=0;i<5;i++){ c.beginPath(); c.arc(-7 + i*3.5, -17.6 - Math.abs(i - 2)*1.4, 1.1, 0, Math.PI*2); c.fillStyle = k.trim; c.fill(); }
      pathRR(c, -10, -15, 20, 3.4, 1.6); fillInk(c, k.obi, 1.4); },
    front(c, k, P){ const {t} = P;
      c.beginPath(); c.moveTo(-13.4, 2.5); c.quadraticCurveTo(-14, -11, -1, -13); c.quadraticCurveTo(11, -14, 13.6, 0); c.lineTo(10, -4); c.lineTo(6, -2); c.lineTo(2, -4.5); c.lineTo(-2, -2); c.lineTo(-6, -4.5); c.lineTo(-9.6, -1); c.closePath(); fillInk(c, k.hair);
      c.beginPath(); c.moveTo(-13.5, -4); c.quadraticCurveTo(0, -11.5, 13.6, -4.6); c.lineTo(13, -8.2); c.quadraticCurveTo(0, -15, -13.2, -7.6); c.closePath(); fillInk(c, '#7A3E8E', 1.4);
      for (let i=0;i<5;i++){ c.beginPath(); c.arc(-8 + i*4, -5.4 + Math.abs(i-2)*.5, 1.2, 0, Math.PI*2); c.fillStyle = k.trim; c.fill(); }
      drawPigeon(c, 2, -14 + Math.sin(t*3)*.4, t, .5, 1); }
  },
  gisa:{
    back(c, k, P){ const {swx, swy} = P;
      c.beginPath(); c.moveTo(-6, -53); c.quadraticCurveTo(-16, -50, -15, -40); c.lineTo(-17 - swx*.6, -36 + swy*.3); c.lineTo(-12, -35); c.lineTo(8, -33); c.quadraticCurveTo(12, -46, 8, -53); c.closePath(); fillInk(c, k.hair);
      c.beginPath(); c.moveTo(-12, -48); c.lineTo(-19 - swx*.6, -50 + swy*.3); c.lineTo(-13, -44); c.closePath(); fillInk(c, k.hair, 1.6); },
    torso(c, k){
      c.beginPath(); c.moveTo(-8, -29); c.quadraticCurveTo(0, -31, 8, -29); c.lineTo(7, -23); c.lineTo(-7, -23); c.closePath(); fillInk(c, k.trim, 1.6);
      c.beginPath(); c.moveTo(-6, -23); c.lineTo(-6.5, -29); c.moveTo(6, -23); c.lineTo(6.5, -29); c.lineWidth = 2; c.strokeStyle = shade(k.top, -.2); c.stroke();
      pathRR(c, -4, -21, 8, 5, 1.4); fillInk(c, k.topHi, 1.2);
      c.beginPath(); c.arc(0, -19.6, 1.6, 0, Math.PI*2); c.fillStyle = '#F7D23E'; c.fill();
      pathRR(c, -10.4, -14, 20.8, 3.4, 1.6); fillInk(c, k.obi, 1.4);
      c.beginPath(); c.moveTo(-7, -12); c.lineTo(-8, -6); c.lineWidth = 2; c.strokeStyle = '#9AA0A8'; c.stroke(); },
    front(c, k){
      c.beginPath(); c.moveTo(-13.4, 2); c.lineTo(-15, -6); c.lineTo(-11.5, -8); c.lineTo(-13.4, -13); c.lineTo(-5, -13.8); c.lineTo(-3, -17); c.lineTo(2, -14);
      c.lineTo(8, -16); c.lineTo(9, -12); c.lineTo(14, -9); c.lineTo(13, -3); c.quadraticCurveTo(9, -6, 6, -3); c.lineTo(3, -6); c.lineTo(-1, -3); c.lineTo(-4, -6.4); c.lineTo(-8, -2); c.closePath(); fillInk(c, k.hair);
      c.beginPath(); c.moveTo(-13.6, -7.5); c.quadraticCurveTo(0, -13, 13.8, -7); c.lineWidth = 3.4; c.strokeStyle = INK; c.stroke(); c.lineWidth = 2; c.strokeStyle = '#5A4434'; c.stroke();
      for (const x of [-1, 7.5]){ c.beginPath(); c.arc(x, -9.6, 3.6, 0, Math.PI*2); fillInk(c, '#C9A15A', 1.4); c.beginPath(); c.arc(x, -9.6, 2.2, 0, Math.PI*2); c.fillStyle = '#9FD8E8'; c.fill(); }
      c.globalAlpha = .55; c.fillStyle = '#4A3A30'; c.beginPath(); c.ellipse(10.5, 5, 1.8, 1, .3, 0, Math.PI*2); c.fill(); c.globalAlpha = 1; }
  },
  axel:{
    back(c, k, P){ const {swx, swy, t} = P;
      c.beginPath(); c.moveTo(-3, -29); c.quadraticCurveTo(-16 - swx, -28 + swy, -26 - swx*1.8, -20 + Math.sin(t*7)*2.4 + swy*.6);
      c.lineTo(-24 - swx*1.6, -15 + Math.sin(t*7)*2.4 + swy*.6); c.quadraticCurveTo(-14 - swx*.6, -22, -2, -24); c.closePath(); fillInk(c, k.trim);
      c.beginPath(); c.moveTo(-7, -54); c.bezierCurveTo(-17, -52, -17, -45, -13, -41); c.lineTo(5, -41); c.quadraticCurveTo(11, -48, 8, -54); c.closePath(); fillInk(c, k.hair); },
    torso(c, k){
      // высокий ворот с бирюзовой подкладкой, ремень через грудь и значок со сломанным знаком
      c.beginPath(); c.moveTo(-10, -31); c.lineTo(-12, -38); c.lineTo(-4, -32); c.closePath(); c.moveTo(10, -31); c.lineTo(12, -38); c.lineTo(4, -32); c.closePath(); fillInk(c, k.trim, 1.4);
      c.beginPath(); c.moveTo(-9, -30); c.lineTo(9, -14); c.lineWidth = 3; c.strokeStyle = INK; c.stroke(); c.lineWidth = 1.8; c.strokeStyle = k.obi; c.stroke();
      c.beginPath(); c.arc(-4.5, -26, 2.3, 0, Math.PI*2); fillInk(c, '#C9CED8', 1.2);
      c.beginPath(); c.moveTo(-5.1, -28); c.lineTo(-3.7, -24); c.lineWidth = .9; c.strokeStyle = '#2A9CA6'; c.stroke();
      pathRR(c, -10.4, -16, 20.8, 3, 1.4); fillInk(c, '#1A1C26', 1.4);
      c.beginPath(); c.rect(-1.6, -16, 3.2, 3); c.fillStyle = '#D9A441'; c.fill(); },
    coat(c, k){ c.beginPath(); c.moveTo(-10.5, -12); c.lineTo(-13, 0); c.lineTo(-3, -1); c.lineTo(-1, -11); c.moveTo(10.5, -12); c.lineTo(12, -1); c.lineTo(3, -1); c.lineTo(1, -11); fillInk(c, shade(k.top, -.06), 1.8);
      c.beginPath(); c.moveTo(-12.2, -1.6); c.lineTo(-3.4, -2.2); c.moveTo(11.4, -2); c.lineTo(3.4, -2.2); c.lineWidth = 1.2; c.strokeStyle = k.trim; c.stroke(); },
    hand(c){ c.beginPath(); c.arc(0, 12, 1.5, 0, Math.PI*2); c.fillStyle = '#C9CED8'; c.fill(); },
    smirk:true,
    front(c, k, P){ const {swx} = P;
      // шарф обмотан вокруг шеи, под подбородком
      c.beginPath(); c.moveTo(-11, 10.5); c.quadraticCurveTo(0, 13.5, 11.5, 10); c.lineTo(12, 16); c.quadraticCurveTo(0, 19, -11.5, 16); c.closePath(); fillInk(c, k.trim, 1.6);
      c.beginPath(); c.moveTo(-9, 14); c.quadraticCurveTo(0, 16, 10, 13.4); c.lineWidth = 1; c.strokeStyle = '#E8A23A'; c.stroke();
      // короткие растрёпанные волосы
      c.beginPath(); c.moveTo(-13.6, 1); c.lineTo(-15 - swx*.2, -5); c.lineTo(-12, -8); c.lineTo(-14, -13.5); c.lineTo(-6, -14.5); c.lineTo(-2, -18); c.lineTo(3, -14.5); c.lineTo(9, -16.5);
      c.lineTo(10, -11); c.lineTo(15, -8); c.lineTo(12.6, -5); c.lineTo(13.4, -1); c.quadraticCurveTo(10.6, -4, 9, -3.4); c.lineTo(6.6, -6.4); c.lineTo(3.4, -3); c.lineTo(.4, -6.6); c.lineTo(-3.6, -3.4); c.lineTo(-7.6, -6.6); c.lineTo(-11, -2); c.closePath(); fillInk(c, k.hair);
      // седая прядь
      c.beginPath(); c.moveTo(3.4, -14.5); c.lineTo(6.6, -6.4); c.lineTo(4.6, -5); c.lineTo(1.6, -12.6); c.closePath(); c.fillStyle = '#D8DCE6'; c.fill();
      c.save(); c.globalAlpha = .6; c.beginPath(); c.moveTo(-8, -10.5); c.lineTo(-3, -12.5); c.lineWidth = 1.5; c.strokeStyle = k.hairHi; c.stroke(); c.restore();
      // брови — прямые и тёмные
      c.beginPath(); c.moveTo(-1.6, -3.2); c.lineTo(3.4, -2.4); c.moveTo(6.2, -2.4); c.lineTo(10.6, -3.4); c.lineWidth = 1.6; c.strokeStyle = INK; c.stroke(); }
  },
  vran:{
    back(c, k){ c.beginPath(); c.moveTo(-6, -54); c.bezierCurveTo(-18, -52, -17, -42, -13, -36); c.lineTo(4, -36); c.quadraticCurveTo(12, -46, 8, -54); c.closePath(); fillInk(c, k.hair); },
    torso(c, k){
      c.beginPath(); c.moveTo(-9.5, -36); c.lineTo(-8, -26); c.lineTo(-2, -29); c.closePath(); c.moveTo(9.5, -36); c.lineTo(8, -26); c.lineTo(2, -29); c.closePath(); fillInk(c, k.top, 1.6);
      c.beginPath(); c.moveTo(-3, -30); c.lineTo(0, -22); c.lineTo(3, -30); c.closePath(); fillInk(c, k.trim, 1.4);
      c.beginPath(); c.arc(0, -24, 1.2, 0, Math.PI*2); c.fillStyle = '#E8C66A'; c.fill();
      c.beginPath(); c.moveTo(0, -22); c.lineTo(0, -11); c.lineWidth = 1.4; c.strokeStyle = shade(k.top, -.35); c.stroke(); },
    coat(c, k){ c.beginPath(); c.moveTo(-10.5, -12); c.lineTo(-12.5, 1); c.lineTo(-2, 0); c.lineTo(-.5, -11); c.moveTo(10.5, -12); c.lineTo(12, 1); c.lineTo(2, 0); c.lineTo(.5, -11); fillInk(c, shade(k.top, -.06), 1.8); },
    front(c, k){
      c.beginPath(); c.moveTo(-13.4, 0); c.quadraticCurveTo(-14, -12, -1, -13.6); c.quadraticCurveTo(11, -14.5, 13.6, -4); c.quadraticCurveTo(6, -10, -2, -9); c.quadraticCurveTo(-9, -8, -13.4, 0); fillInk(c, k.hair);
      c.beginPath(); c.moveTo(4, -9.5); c.quadraticCurveTo(7, -5, 5, -1); c.lineWidth = 2.4; c.strokeStyle = INK; c.stroke(); c.lineWidth = 1.1; c.strokeStyle = k.hair; c.stroke();
      c.beginPath(); c.arc(8.2, 1.2, 3.6, 0, Math.PI*2); c.lineWidth = 1.2; c.strokeStyle = '#E8C66A'; c.stroke();
      c.beginPath(); c.moveTo(11.5, 2.5); c.quadraticCurveTo(13, 8, 9, 12); c.lineWidth = .7; c.stroke(); }
  },
  cherry:{
    sleeve(c, k){ c.beginPath(); c.moveTo(-3.4, 8.5); c.lineTo(3.4, 8.5); c.lineWidth = 2; c.strokeStyle = k.trim; c.stroke(); },
    back(c, k, P){ const {swx, swy} = P;
      c.beginPath(); c.moveTo(-4, -54); c.bezierCurveTo(-18, -50, -17 - swx*.3, -34, -15 - swx*.8, -16 + swy*.3);
      c.quadraticCurveTo(-13 - swx, -6 + swy*.3, -7 - swx*.6, -9); c.quadraticCurveTo(-4, -18, -3, -26); c.lineTo(8, -30); c.quadraticCurveTo(13, -42, 10, -52); c.closePath(); fillInk(c, k.hair);
      c.save(); c.globalAlpha = .45; c.beginPath(); c.moveTo(-10, -44); c.quadraticCurveTo(-13 - swx*.4, -30, -12 - swx*.7, -16); c.lineWidth = 1.4; c.strokeStyle = k.hairHi; c.stroke(); c.restore(); },
    torso(c, k){
      c.beginPath(); c.moveTo(-3.5, -29.5); c.lineTo(1.5, -21); c.lineTo(5, -29.5); c.lineWidth = 2.2; c.strokeStyle = k.trim; c.stroke();
      pathRR(c, -9.6, -19, 19.2, 4.6, 2); fillInk(c, k.obi, 1.6);
      mapleLeaf(c, -7, -10.5, .8, -.4, k.trim); mapleLeaf(c, 1, -9.5, .85, .2, '#D9582E'); mapleLeaf(c, 8, -10.8, .7, .6, k.trim);
      pathRR(c, -12, -22, 7, 8, 2); fillInk(c, '#7A5236', 1.4); },
    front(c, k, P){ const {swx, swy, t} = P;
      c.beginPath(); c.arc(-6.5 - swx*.15, -12.5, 6.4, 0, Math.PI*2); fillInk(c, k.hair);
      c.beginPath(); c.moveTo(-13.4, 2); c.quadraticCurveTo(-15, -12, -4, -13.6); c.quadraticCurveTo(8, -15, 13.6, -2);
      c.quadraticCurveTo(10, -6, 8.5, -3); c.quadraticCurveTo(6.5, -7, 3.6, -3.6); c.quadraticCurveTo(1.5, -7.5, -1.5, -3.6); c.quadraticCurveTo(-5.5, -6, -8.5, -.5); c.closePath(); fillInk(c, k.hair);
      c.save(); c.globalAlpha = .7; c.beginPath(); c.moveTo(-4, -11); c.quadraticCurveTo(2, -12.6, 7, -9.5); c.lineWidth = 1.6; c.strokeStyle = k.hairHi; c.stroke(); c.restore();
      c.beginPath(); c.moveTo(12.6, -2); c.quadraticCurveTo(14.8 + swx*.2, 6, 12 + swx*.4, 12 + swy*.2); c.lineWidth = 3.2; c.strokeStyle = INK; c.stroke(); c.lineWidth = 1.6; c.strokeStyle = k.hair; c.stroke();
      mapleLeaf(c, -11, -14, 1.05, -.6 + Math.sin(t*2)*.05, '#E2703A'); mapleLeaf(c, -14.5, -9, .8, -1.3, '#C9552E');
      c.beginPath(); c.moveTo(-2, -18.5); c.lineTo(2.2, -23 + Math.sin(t*3)*.4); c.lineWidth = 1.6; c.strokeStyle = '#C9A15A'; c.stroke(); }
  },
  julia:{
    smirk:true,
    back(c, k, P){ const {swx, swy, t} = P;
      scarfTail(c, k.trim, swx, swy, t);
      c.beginPath(); c.moveTo(-6, -58); c.bezierCurveTo(-24 - swx*.6, -64, -30 - swx*1.4, -48 + swy, -27 - swx*1.6, -30 + swy*1.2);
      c.quadraticCurveTo(-26 - swx*1.7, -20 + swy*1.3, -20 - swx*1.3, -16 + swy); c.quadraticCurveTo(-20 - swx, -34, -6, -48); c.closePath(); fillInk(c, k.hair);
      c.save(); c.globalAlpha = .5; c.beginPath(); c.moveTo(-12, -56); c.quadraticCurveTo(-24 - swx, -50, -24 - swx*1.4, -32 + swy); c.lineWidth = 1.4; c.strokeStyle = k.hairHi; c.stroke(); c.restore(); },
    torso(c, k){
      pathRR(c, -9.4, -17.5, 18.8, 3.6, 1.8); fillInk(c, '#3B3550', 1.4);
      c.beginPath(); c.moveTo(-8, -29); c.quadraticCurveTo(0, -24, 8, -29); c.quadraticCurveTo(0, -31.5, -8, -29); fillInk(c, k.trim, 1.6);
      c.beginPath(); c.arc(5.5, -14, 2.6, 0, Math.PI*2); fillInk(c, '#E2703A', 1.2); },
    front(c, k, P){ const {swx} = P;
      c.beginPath(); c.moveTo(-13.6, 3); c.lineTo(-16 - swx*.2, -4); c.lineTo(-12.5, -7); c.lineTo(-15.5 - swx*.3, -13); c.lineTo(-7, -12.5); c.lineTo(-5, -17.5); c.lineTo(0, -13.4);
      c.lineTo(5, -17); c.lineTo(7, -12); c.lineTo(13.6, -11); c.lineTo(11.5, -6); c.quadraticCurveTo(8, -6, 6.6, -2.6); c.lineTo(4.4, -5.8); c.lineTo(1.6, -2.4); c.lineTo(-1.4, -6.4);
      c.lineTo(-5, -1.6); c.lineTo(-8.6, -5); c.closePath(); fillInk(c, k.hair);
      c.save(); c.globalAlpha = .7; c.beginPath(); c.moveTo(-7, -9); c.lineTo(-2, -11); c.lineTo(3, -9.6); c.lineWidth = 1.6; c.strokeStyle = k.hairHi; c.stroke(); c.restore();
      c.beginPath(); c.moveTo(9.5, -10); c.lineTo(15, -9.5); c.lineTo(12.5, -6.5); c.closePath(); fillInk(c, '#F2C14E', 1.4); }
  },
  marta:{
    back(c, k, P){ const {swx, swy} = P;
      c.beginPath(); c.moveTo(-8, -54); c.bezierCurveTo(-22, -50, -18, -40, -17 - swx*.4, -32); c.quadraticCurveTo(-22 - swx*.6, -24, -16 - swx*.8, -16 + swy*.2);
      c.quadraticCurveTo(-20 - swx, -8, -12 - swx*.8, -4 + swy*.2); c.quadraticCurveTo(-6, -10, -3, -22); c.lineTo(9, -26); c.quadraticCurveTo(14, -40, 9, -52); c.closePath(); fillInk(c, k.hair); },
    torso(c, k){
      c.beginPath(); c.moveTo(-1, -30); c.lineTo(-1, -12); c.lineWidth = 1.4; c.strokeStyle = shade(k.top, -.25); c.stroke();
      pathRR(c, -10, -18.5, 20, 3.4, 1.6); fillInk(c, k.obi, 1.4);
      c.beginPath(); c.arc(4, -21, 1.6, 0, Math.PI*2); c.fillStyle = '#C38BE8'; c.fill(); },
    front(c, k, P){ const {t} = P;
      c.beginPath(); c.moveTo(-13.4, 3); c.quadraticCurveTo(-14, -10, -2, -12); c.quadraticCurveTo(10, -13, 13.6, -1); c.quadraticCurveTo(8, -7, 4, -4); c.quadraticCurveTo(-2, -7.5, -8, -1); c.closePath(); fillInk(c, k.hair);
      c.beginPath(); c.moveTo(12.5, -1); c.quadraticCurveTo(15, 8, 11, 16); c.lineWidth = 3.4; c.strokeStyle = INK; c.stroke(); c.lineWidth = 1.8; c.strokeStyle = k.hair; c.stroke();
      c.save(); c.rotate(-.08 + Math.sin(t*1.6)*.02);
      c.beginPath(); c.ellipse(0, -9, 24, 6.4, -.05, 0, Math.PI*2); fillInk(c, '#7A6450', 2.2);
      c.beginPath(); c.moveTo(-11, -11); c.quadraticCurveTo(-8, -28, -1, -36); c.quadraticCurveTo(4, -40, 10 + Math.sin(t*1.6)*1.5, -37); c.quadraticCurveTo(5, -33, 4, -28); c.quadraticCurveTo(7, -18, 11, -11); c.closePath(); fillInk(c, '#8C7560', 2.2);
      c.beginPath(); c.moveTo(-10.5, -14); c.quadraticCurveTo(0, -17, 10.5, -14); c.lineTo(10.8, -11.5); c.quadraticCurveTo(0, -14, -10.8, -11.5); c.closePath(); fillInk(c, '#5E7A4C', 1.4);
      [[-6,-14,'#C38BE8'],[-2.5,-15,'#8FB8F0'],[1.5,-15.2,'#C38BE8'],[5.5,-14.6,'#F2E07A']].forEach(([x,y,col]) => { c.beginPath(); c.arc(x, y, 1.9, 0, Math.PI*2); fillInk(c, col, 1); });
      c.beginPath(); c.ellipse(8, -16, 3.4, 1.6, -.6, 0, Math.PI*2); fillInk(c, '#86B35A', 1);
      c.restore(); }
  }
};
// pose: {phase, air, vy, t, blink, sway:{x,y}, emo, hold, run, talk, wave}
function drawChar(c, who, p){
  const k = CH[who], parts = CHAR_PARTS[who] || {}, t = p.t || 0, run = p.run || 0, air = p.air;
  const ph = p.phase || 0, bob = air ? 0 : (run > .1 ? Math.abs(Math.sin(ph))*-2.2*run : Math.sin(t*2.2)*.7);
  const swx = clamp((p.sway && p.sway.x) || 0, -9, 9), swy = clamp((p.sway && p.sway.y) || 0, -8, 8);
  const P = {t, swx, swy, talk:p.talk};
  let legA, legB, armA, armB;
  if (air){ const up = (p.vy || 0) < 0; legA = up ? -.55 : -.25; legB = up ? .7 : .35; armA = up ? -2.4 : -1.6; armB = up ? -.9 : 1.3; }
  else if (run > .1){ legA = Math.sin(ph)*.85*run; legB = -legA; armA = -Math.sin(ph)*.95*run; armB = -armA; }
  else { legA = .06; legB = -.06; armA = .15 + Math.sin(t*2.2)*.04; armB = -.1; }
  if (p.hold) armA = -1.9;
  if (p.wave) armA = -2.6 + Math.sin(t*9)*.35;
  c.save(); if (k.scale) c.scale(k.scale, k.scale); c.translate(0, bob);
  if (who === 'timofey' && !air) c.rotate(.05);
  if (run > .1 && !air) c.rotate(.08*run);
  const leg = (x, a, front) => { c.save(); c.translate(x, -13); c.rotate(a);
    pathRR(c, -3.2, -1, 6.4, 13, 3); fillInk(c, front ? k.legs : shade(k.legs, -.12));
    c.beginPath(); c.ellipse(1.2, 12.2, 4.6, 2.8, 0, 0, Math.PI*2); fillInk(c, front ? k.boots : shade(k.boots, -.12)); c.restore(); };
  const arm = (x, a, front) => { c.save(); c.translate(x, -25.5); c.rotate(a);
    pathRR(c, -3.4, -1.5, 6.8, 12, 3.2); fillInk(c, front ? k.top : shade(k.top, -.14));
    if (parts.sleeve) parts.sleeve(c, k);
    c.beginPath(); c.arc(0, 12, 2.9, 0, Math.PI*2); fillInk(c, k.hand, 1.6);
    if (front && parts.hand) parts.hand(c, k);
    c.restore(); };
  if (parts.back) parts.back(c, k, P);
  arm(-5.5, armB, false);
  leg(-3, legB, false);
  c.beginPath(); c.moveTo(-8, -29); c.quadraticCurveTo(0, -31, 8, -29); c.lineTo(10.5, -11); c.quadraticCurveTo(0, -8.5, -10.5, -11); c.closePath(); fillInk(c, k.top);
  c.save(); c.clip(); c.fillStyle = k.topHi; c.globalAlpha = .55; c.beginPath(); c.ellipse(4, -24, 4, 9, -.3, 0, Math.PI*2); c.fill(); c.restore();
  if (parts.torso) parts.torso(c, k, P);
  leg(3.4, legA, true);
  if (parts.coat) parts.coat(c, k, P);
  // голова
  c.save(); c.translate(0, -41.5);
  c.beginPath(); c.arc(0, 0, 13, 0, Math.PI*2); fillInk(c, k.skin, 2.2);
  const blink = p.blink, emo = p.emo || '';
  const eye = (x) => {
    if (blink){ c.beginPath(); c.moveTo(x-2.6, 1.6); c.quadraticCurveTo(x, 3.4, x+2.6, 1.6); c.lineWidth = 1.8; c.strokeStyle = INK; c.stroke(); return; }
    const h = emo === 'surprised' ? 5.4 : emo === 'smug' ? 3 : (who === 'timofey' || who === 'vran' || who === 'axel') ? 3.6 : 4.6;
    c.beginPath(); c.ellipse(x, 1.2, 2.5, h, 0, 0, Math.PI*2); c.fillStyle = INK; c.fill();
    c.beginPath(); c.ellipse(x, 2.6, 1.7, h*.45, 0, 0, Math.PI*2); c.fillStyle = k.eye; c.fill();
    c.beginPath(); c.arc(x+.9, -.6, 1.05, 0, Math.PI*2); c.fillStyle = '#FFF'; c.fill();
    c.beginPath(); c.arc(x-.8, 3.4, .55, 0, Math.PI*2); c.fill();
    if (emo === 'smug' || emo === 'angry'){ c.beginPath(); c.moveTo(x-3, emo === 'angry' ? -3.4 : -2.4); c.lineTo(x+3, emo === 'angry' ? -1.6 : -1.4); c.lineWidth = 1.6; c.strokeStyle = INK; c.stroke(); }
  };
  eye(1.2); eye(8.2);
  c.globalAlpha = .55; c.fillStyle = k.blush; c.beginPath(); c.ellipse(-.5, 6.5, 2.4, 1.3, 0, 0, Math.PI*2); c.ellipse(10, 6.5, 2, 1.2, 0, 0, Math.PI*2); c.fill(); c.globalAlpha = 1;
  if (!k.noMouth){
    c.beginPath();
    const talkOpen = p.talk && Math.sin(t*22) > 0;
    if (emo === 'surprised' || talkOpen){ c.ellipse(5.4, 8.2, 1.4, talkOpen ? 1.3 : 1.8, 0, 0, Math.PI*2); c.fillStyle = INK; c.fill(); }
    else if (emo === 'smug' || parts.smirk){ c.moveTo(3, 7.4); c.quadraticCurveTo(5.6, 9.6, 8.4, 6.8); c.lineWidth = 1.6; c.strokeStyle = INK; c.stroke(); }
    else if (emo === 'worried' || emo === 'sad'){ c.moveTo(3.6, 8.6); c.quadraticCurveTo(5.4, 7.4, 7.2, 8.6); c.lineWidth = 1.5; c.strokeStyle = INK; c.stroke(); }
    else if (emo === 'happy'){ c.moveTo(3, 7); c.quadraticCurveTo(5.4, 10, 7.8, 7); c.lineWidth = 1.6; c.strokeStyle = INK; c.stroke(); }
    else { c.moveTo(4, 7.6); c.quadraticCurveTo(5.4, 8.8, 6.8, 7.6); c.lineWidth = 1.5; c.strokeStyle = INK; c.stroke(); }
  }
  if (parts.front) parts.front(c, k, P);
  c.restore();
  arm(5.5, armA, true);
  c.restore();
}
// ---------- маленькие существа: Генерал (голубь Мико), болтунчик (Гисы), Искра (огонёк Аи)
function drawPigeon(c, x, y, t, s=1, face=1){
  c.save(); c.translate(x, y); c.scale(s*face, s);
  const peck = Math.max(0, Math.sin(t*2.3)) > .97 ? 3 : 0;
  c.beginPath(); c.ellipse(0, 0, 11, 7.5, -.15, 0, Math.PI*2); fillInk(c, '#9AA0AE', 1.8);
  c.beginPath(); c.moveTo(-9, -2); c.quadraticCurveTo(-18, 0, -17, 5); c.quadraticCurveTo(-11, 4, -7, 3); fillInk(c, '#7E8494', 1.6);
  c.beginPath(); c.ellipse(-1, 0, 6.5, 4, -.2, 0, Math.PI*2); c.fillStyle = '#B4B9C6'; c.fill();
  c.beginPath(); c.arc(7 + peck*.4, -7 + peck, 5.2, 0, Math.PI*2); fillInk(c, '#8C93A2', 1.6);
  c.save(); c.globalAlpha = .7; c.beginPath(); c.ellipse(6, -2.5, 4.5, 2.2, .3, 0, Math.PI*2); c.fillStyle = '#7FCAB2'; c.fill(); c.beginPath(); c.ellipse(5, -1, 3.6, 1.6, .3, 0, Math.PI*2); c.fillStyle = '#C08AD8'; c.fill(); c.restore();
  c.beginPath(); c.moveTo(11.5 + peck*.4, -7 + peck); c.lineTo(15.5 + peck*.4, -5.6 + peck); c.lineTo(11.5 + peck*.4, -5 + peck); c.closePath(); fillInk(c, '#E8A94A', 1);
  c.beginPath(); c.arc(8.4 + peck*.4, -8 + peck, 1.5, 0, Math.PI*2); c.fillStyle = '#F07A2A'; c.fill(); c.beginPath(); c.arc(8.6 + peck*.4, -8 + peck, .7, 0, Math.PI*2); c.fillStyle = INK; c.fill();
  c.strokeStyle = '#D9806A'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-1, 7); c.lineTo(-2, 10); c.moveTo(2, 7); c.lineTo(2.5, 10); c.stroke();
  c.restore();
}
// Болтунчик: маленький жёлтый заводной человечек с одним круглым «глазом»-линзой и ключиком на спине
function drawBoltik(c, x, y, t, s=1, face=1, mood=0){
  c.save(); c.translate(x, y); c.scale(s*face, s);
  const hop = Math.abs(Math.sin(t*6))*2.2, wob = Math.sin(t*6)*.08;
  c.translate(0, -hop); c.rotate(wob);
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(-4, -2); c.lineTo(-5, 3 + hop); c.moveTo(4, -2); c.lineTo(5, 3 + hop); c.stroke();
  c.save(); c.translate(-11, -12); c.rotate(t*4); c.beginPath(); c.ellipse(0, -3, 2, 3.4, 0, 0, Math.PI*2); c.ellipse(0, 3, 2, 3.4, 0, 0, Math.PI*2); fillInk(c, '#C9A15A', 1.2); c.restore();
  pathRR(c, -9, -24, 18, 23, 9); fillInk(c, '#F7D23E', 2);
  c.save(); c.clip(); c.fillStyle = '#4A6E8A'; c.fillRect(-10, -9, 20, 9); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-6, -22, 3, 10); c.restore();
  pathRR(c, -9, -24, 18, 23, 9); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
  c.beginPath(); c.arc(1, -16, 5.4, 0, Math.PI*2); fillInk(c, '#C9CED6', 1.6);
  c.beginPath(); c.arc(1, -16, 3.4, 0, Math.PI*2); c.fillStyle = '#FFFDF6'; c.fill();
  c.beginPath(); c.arc(1.8 + Math.sin(t*1.3), -15.6, 1.7, 0, Math.PI*2); c.fillStyle = '#6A4A2A'; c.fill();
  c.beginPath(); c.arc(2.2 + Math.sin(t*1.3), -16.4, .6, 0, Math.PI*2); c.fillStyle = '#FFF'; c.fill();
  c.beginPath(); c.moveTo(-4, -26); c.lineTo(-5, -30); c.moveTo(3, -26); c.lineTo(4, -31); c.lineWidth = 1.4; c.strokeStyle = INK; c.stroke();
  c.beginPath(); if (mood > 0){ c.arc(1, -10, 2.6, .2, Math.PI - .2); } else { c.moveTo(-1.5, -9); c.lineTo(3.5, -9); } c.lineWidth = 1.4; c.stroke();
  c.restore();
}
// Искра — огонёк-компаньон Аи. scared: прижимается и тускнеет.
function drawIskra(c, x, y, t, s=1, scared=0, alpha=1){
  c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha *= alpha;
  const fl = Math.sin(t*12)*1.2, sq = 1 - scared*.25;
  const g = c.createRadialGradient(0, 0, 1, 0, 0, 30); g.addColorStop(0, `rgba(255,190,90,${.6 - scared*.3})`); g.addColorStop(1, 'rgba(255,170,80,0)'); c.fillStyle = g; c.fillRect(-30, -30, 60, 60);
  c.scale(sq, sq);
  c.beginPath(); c.moveTo(0, -15 - fl); c.bezierCurveTo(7, -9, 9, -1, 8, 3); c.arc(0, 3, 8, 0, Math.PI); c.bezierCurveTo(-9, -1, -6, -8, -2, -10); c.quadraticCurveTo(-1, -6, 0, -15 - fl); c.closePath();
  const fg = c.createLinearGradient(0, -15, 0, 11); fg.addColorStop(0, '#FFF2C4'); fg.addColorStop(.5, '#FFB04A'); fg.addColorStop(1, '#F07A2A'); c.fillStyle = fg; c.fill(); c.lineWidth = 1.6; c.strokeStyle = INK; c.stroke();
  const blink = (t % 3.3) < .12;
  c.fillStyle = INK;
  if (blink || scared > .5){ c.fillRect(-4.2, 2.2, 3, 1.2); c.fillRect(1.4, 2.2, 3, 1.2); }
  else { c.beginPath(); c.arc(-2.6, 2.4, 1.6, 0, Math.PI*2); c.arc(2.8, 2.4, 1.6, 0, Math.PI*2); c.fill(); c.fillStyle = '#FFF'; c.beginPath(); c.arc(-2.2, 1.8, .55, 0, Math.PI*2); c.arc(3.2, 1.8, .55, 0, Math.PI*2); c.fill(); }
  c.restore();
}
function shade(hex, amt){
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = v => clamp(Math.round(amt < 0 ? v*(1+amt) : v + (255-v)*amt), 0, 255);
  return '#' + ((1<<24) + (f(r)<<16) + (f(g)<<8) + f(b)).toString(16).slice(1);
}
function drawButterfly(c, x, y, t, s=1, col='#FF9A3C', glow=true, alpha=1){
  c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha *= alpha;
  if (glow){ const g = c.createRadialGradient(0, 0, 1, 0, 0, 26); g.addColorStop(0, col + '88'); g.addColorStop(1, col + '00'); c.fillStyle = g; c.fillRect(-26, -26, 52, 52); }
  const f = .25 + .75*Math.abs(Math.sin(t*14));
  for (const sd of [-1, 1]){
    c.save(); c.scale(sd*f, 1);
    c.beginPath(); c.ellipse(5, -4, 6, 4.4, -.6, 0, Math.PI*2); fillInk(c, col, 1.3);
    c.beginPath(); c.ellipse(4, 3, 3.8, 3, .5, 0, Math.PI*2); fillInk(c, shade(col, -.15), 1.3);
    c.beginPath(); c.arc(6.5, -5, 1.5, 0, Math.PI*2); c.fillStyle = '#FFF4D8'; c.fill();
    c.restore();
  }
  c.beginPath(); c.moveTo(0, -5); c.lineTo(0, 5); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
  c.beginPath(); c.moveTo(0, -5); c.quadraticCurveTo(-2, -9, -3.5, -10); c.moveTo(0, -5); c.quadraticCurveTo(2, -9, 3.5, -10); c.lineWidth = 1; c.stroke();
  c.restore();
}

/* ================= Спрайты визуальной новеллы ================= */
// Система координат: (0,0) — низ по центру, персонаж смотрит вправо, y вверх отрицательный.
const VN = {
  cherry:{ skin:'#FBE3D3', skinSh:'#EDBFAA', blush:'#F49A93', lip:'#C4545A',
    hair:'#2A2132', hairMid:'#3A2D46', hairHi:'#6E5A86', iris:['#5A2A14','#C26A2C','#F2B45A'], name:'#9A2F31' },
  marta:{ skin:'#FCE6D6', skinSh:'#EFC6B0', blush:'#F2A08F', lip:'#C9645E',
    hair:'#EBC56A', hairMid:'#F5D88A', hairHi:'#FFF3C8', iris:['#1E4A30','#3E8E5A','#9FD8A0'], name:'#4E6E40' },
  julia:{ skin:'#F8DCC6', skinSh:'#E9B9A0', blush:'#F38C80', lip:'#C2525A',
    hair:'#2E9C8E', hairMid:'#3DB5A4', hairHi:'#9BE8DA', iris:['#1E4A22','#3F8F44','#A6E07A'], name:'#2F7F66' }
};
const HEAD_S = .8;
function headOn(c){ c.save(); c.translate(4, -200); c.scale(HEAD_S, HEAD_S); c.translate(-4, 200); }
function torso(c){
  c.beginPath(); c.moveTo(-24, -196); c.bezierCurveTo(-50, -188, -96, -176, -120, -158); c.bezierCurveTo(-142, -142, -148, -112, -148, -84);
  c.lineTo(-150, 12); c.lineTo(158, 12); c.lineTo(156, -84); c.bezierCurveTo(156, -112, 150, -142, 128, -158); c.bezierCurveTo(104, -176, 58, -188, 32, -196); c.closePath();
}
function armSeams(c){ c.save(); c.globalAlpha = .45; c.beginPath(); c.moveTo(-112, -150); c.quadraticCurveTo(-118, -70, -114, 12); c.moveTo(120, -150); c.quadraticCurveTo(126, -70, 122, 12); ink(c, 2.2); c.restore(); }
function ink(c, w){ c.lineWidth = w; c.strokeStyle = INK; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); }
function gradV(c, y0, y1, a, b){ const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; }
// ---------- лицо
function vnFace(c, k){
  c.beginPath();
  c.moveTo(-58, -384); c.bezierCurveTo(-64, -338, -60, -296, -42, -268);
  c.bezierCurveTo(-26, -244, -6, -234, 10, -234); c.bezierCurveTo(26, -234, 46, -244, 62, -268);
  c.bezierCurveTo(80, -296, 82, -338, 76, -384); c.closePath();
  c.fillStyle = k.skin; c.fill(); ink(c, 3);
  c.save(); c.clip(); c.fillStyle = k.skinSh; c.globalAlpha = .55;
  c.beginPath(); c.moveTo(78, -400); c.bezierCurveTo(64, -330, 62, -282, 36, -236); c.lineTo(90, -230); c.lineTo(90, -400); c.fill();
  c.globalAlpha = .45; c.beginPath(); c.ellipse(4, -372, 80, 26, 0, 0, Math.PI*2); c.fill();
  c.restore();
}
function vnNeck(c, k){
  c.beginPath(); c.moveTo(-20, -260); c.lineTo(26, -260); c.lineTo(32, -176); c.quadraticCurveTo(4, -168, -26, -176); c.closePath(); c.fillStyle = k.skin; c.fill(); ink(c, 3);
  c.save(); c.clip(); c.fillStyle = k.skinSh; c.beginPath(); c.ellipse(4, -244, 40, 20, 0, 0, Math.PI*2); c.fill(); c.restore();
}
function vnEye(c, k, cx, cy, w, h, st, far){
  const emo = st.emo || '';
  if (st.blink || emo === 'happy'){
    c.beginPath();
    if (emo === 'happy' && !st.blink){ c.moveTo(cx - w/2, cy + 4); c.quadraticCurveTo(cx, cy - h*.55, cx + w/2, cy + 2); }
    else { c.moveTo(cx - w/2, cy); c.quadraticCurveTo(cx, cy + h*.3, cx + w/2, cy - 2); }
    ink(c, 4.5); c.beginPath(); c.moveTo(cx + w/2, cy - 2); c.lineTo(cx + w/2 + 7, cy - 8); ink(c, 3.4); return;
  }
  const lid = emo === 'smug' ? .32 : emo === 'sad' ? .2 : 0, big = emo === 'surprised' ? 1.12 : 1;
  w *= big; h *= big;
  const top = cy - h*.58 + h*lid*1.1;
  c.save();
  c.beginPath(); c.moveTo(cx - w/2, cy); c.bezierCurveTo(cx - w*.4, top, cx + w*.45, top - 2, cx + w/2, cy - 5);
  c.bezierCurveTo(cx + w*.36, cy + h*.48, cx - w*.32, cy + h*.5, cx - w/2, cy); c.closePath();
  c.fillStyle = '#FFFDF8'; c.fill(); c.clip();
  const ix = cx + (far ? 3 : 1), iy = cy + 3, rx = w*.36, ry = h*.46;
  const ig = c.createLinearGradient(0, iy - ry, 0, iy + ry); ig.addColorStop(0, k.iris[0]); ig.addColorStop(.55, k.iris[1]); ig.addColorStop(1, k.iris[2]);
  c.beginPath(); c.ellipse(ix, iy, rx, ry, 0, 0, Math.PI*2); c.fillStyle = ig; c.fill(); c.lineWidth = 1.6; c.strokeStyle = k.iris[0]; c.stroke();
  c.beginPath(); c.ellipse(ix, iy - 1, rx*(emo === 'surprised' ? .3 : .42), ry*(emo === 'surprised' ? .34 : .48), 0, 0, Math.PI*2); c.fillStyle = 'rgba(20,10,20,.82)'; c.fill();
  c.fillStyle = 'rgba(255,255,255,.95)'; c.beginPath(); c.ellipse(ix - rx*.32, iy - ry*.42, rx*.34, ry*.24, -.3, 0, Math.PI*2); c.fill();
  c.beginPath(); c.arc(ix + rx*.4, iy + ry*.38, rx*.16, 0, Math.PI*2); c.fill();
  c.fillStyle = 'rgba(255,240,210,.35)'; c.beginPath(); c.ellipse(ix, iy + ry*.55, rx*.7, ry*.25, 0, 0, Math.PI*2); c.fill();
  c.fillStyle = 'rgba(40,20,40,.18)'; c.fillRect(cx - w, top - 4, w*2, h*.22);
  c.restore();
  c.beginPath(); c.moveTo(cx - w/2 - 2, cy + 1); c.bezierCurveTo(cx - w*.4, top - 1, cx + w*.45, top - 3, cx + w/2 + 1, cy - 5); ink(c, 5.2);
  c.beginPath(); c.moveTo(cx + w/2 - 1, cy - 5); c.quadraticCurveTo(cx + w/2 + 6, cy - 8, cx + w/2 + 10, cy - 14); ink(c, 3.4);
  if (!far){ c.beginPath(); c.moveTo(cx - w/2 + 2, cy - 2); c.lineTo(cx - w/2 - 5, cy - 7); ink(c, 2.4); }
  c.beginPath(); c.moveTo(cx - w*.3, cy + h*.44); c.quadraticCurveTo(cx, cy + h*.52, cx + w*.34, cy + h*.4); c.lineWidth = 1.6; c.strokeStyle = 'rgba(43,34,51,.55)'; c.stroke();
}
function vnBrows(c, st, k){
  const bw = (k && k.browW) || 3.2;
  const e = st.emo || ''; let a = 0, b = 0, lift = 0;
  if (e === 'surprised') lift = -9; if (e === 'worried' || e === 'sad'){ a = -5; b = 4; } if (e === 'angry'){ a = 5; b = -5; } if (e === 'smug'){ a = -3; b = 3; }
  c.beginPath(); c.moveTo(-36, -348 + lift + b); c.quadraticCurveTo(-20, -357 + lift, -2, -352 + lift + a); ink(c, bw);
  c.beginPath(); c.moveTo(24, -352 + lift + a*.8); c.quadraticCurveTo(40, -358 + lift + (e === 'smug' ? -6 : 0), 56, -349 + lift + b*.8); ink(c, bw);
}
function vnMouth(c, k, st){
  const e = st.emo || '', open = st.talk && Math.sin(st.t*22) > -.1;
  c.beginPath(); c.moveTo(13, -292); c.lineTo(15, -284); c.lineWidth = 2; c.strokeStyle = 'rgba(160,100,90,.7)'; c.stroke();
  const x = 10, y = -262;
  if (e === 'surprised' || (open && e !== 'smug')){
    const h = e === 'surprised' ? 9 : 4 + Math.abs(Math.sin(st.t*22))*4;
    c.beginPath(); c.ellipse(x, y + 1, e === 'surprised' ? 6 : 8, h, 0, 0, Math.PI*2); c.fillStyle = '#7A2E3A'; c.fill(); ink(c, 2.4);
    c.save(); c.clip(); c.fillStyle = '#E9848E'; c.beginPath(); c.ellipse(x, y + h, 7, 4, 0, 0, Math.PI*2); c.fill(); c.restore(); return;
  }
  c.beginPath();
  if (e === 'happy'){ c.moveTo(x - 11, y - 3); c.quadraticCurveTo(x, y + 9, x + 11, y - 4); }
  else if (e === 'smug'){ c.moveTo(x - 8, y); c.quadraticCurveTo(x + 2, y + 5, x + 13, y - 6); }
  else if (e === 'worried' || e === 'sad'){ c.moveTo(x - 7, y + 3); c.quadraticCurveTo(x, y - 2, x + 7, y + 3); }
  else if (e === 'angry'){ c.moveTo(x - 8, y + 2); c.lineTo(x + 8, y); }
  else { c.moveTo(x - 7, y - 1); c.quadraticCurveTo(x, y + 4, x + 7, y - 1); }
  ink(c, 2.6);
}
function vnBlush(c, k, st){
  const a = st.emo === 'happy' || st.emo === 'surprised' ? .55 : .35;
  for (const [x, y, rx] of [[-30, -282, 16], [50, -281, 15]]){ const g = c.createRadialGradient(x, y, 1, x, y, rx); g.addColorStop(0, k.blush); g.addColorStop(1, k.blush + '00');
    c.globalAlpha = a; c.fillStyle = g; c.beginPath(); c.ellipse(x, y, rx, rx*.6, 0, 0, Math.PI*2); c.fill(); }
  c.globalAlpha = 1;
  c.strokeStyle = 'rgba(200,90,90,.45)'; c.lineWidth = 1.4; for (let i=0;i<3;i++){ c.beginPath(); c.moveTo(-38 + i*7, -278); c.lineTo(-42 + i*7, -272); c.stroke(); }
}
// k.male — без штриховки румянца; k.eyeH — высота глаз (уже у мужчин/стариков); k.noMouth — рот закрыт шарфом
function vnFaceAll(c, k, st){
  vnFace(c, k);
  if (k.male){ c.save(); c.globalAlpha = .45; vnBlushSoft(c, k); c.restore(); } else vnBlush(c, k, st);
  const eh = k.eyeH || 1;
  vnEye(c, k, -18, -306, 31, 40*eh, st, false); vnEye(c, k, 38, -305, 28, 39*eh, st, true);
  if (!k.noMouth) vnMouth(c, k, st);
}
function vnBlushSoft(c, k){ for (const [x, y, rx] of [[-30, -282, 16], [50, -281, 15]]){ const g = c.createRadialGradient(x, y, 1, x, y, rx); g.addColorStop(0, k.blush); g.addColorStop(1, k.blush + '00');
  c.fillStyle = g; c.beginPath(); c.ellipse(x, y, rx, rx*.6, 0, 0, Math.PI*2); c.fill(); } }
function vnBrowsOver(c, st, k){ c.save(); c.globalAlpha = .7; vnBrows(c, st, k); c.restore(); }
// ---------- волосы: общий помощник для прядей
function lock(c, x0, y0, cx1, cy1, cx2, cy2, x1, y1, wdt, col){
  c.beginPath(); c.moveTo(x0 - wdt, y0); c.bezierCurveTo(cx1 - wdt*.6, cy1, cx2 - wdt*.2, cy2, x1, y1); c.bezierCurveTo(cx2 + wdt*.4, cy2, cx1 + wdt*.8, cy1, x0 + wdt, y0); c.closePath();
  c.fillStyle = col; c.fill(); ink(c, 2.6);
}
// Чёлка из изогнутых прядей: valleys — точки у линии роста волос, tips — кончики прядей
function bangs(c, k, top, valleys, tips, sweep=6){
  c.beginPath(); c.moveTo(top[0][0], top[0][1]);
  for (let i=1;i<top.length;i+=3) c.bezierCurveTo(top[i][0], top[i][1], top[i+1][0], top[i+1][1], top[i+2][0], top[i+2][1]);
  c.lineTo(valleys[0][0], valleys[0][1]);
  for (let i=0;i<tips.length;i++){
    const v = valleys[i], tp = tips[i], n = valleys[i+1];
    c.bezierCurveTo(v[0] + (tp[0]-v[0])*.05, v[1] + (tp[1]-v[1])*.6, tp[0] - sweep - (tp[0]-v[0])*.25, tp[1] - 14, tp[0], tp[1]);
    c.bezierCurveTo(tp[0] - sweep*.3 + (n[0]-tp[0])*.35, tp[1] - 22, n[0] + (tp[0]-n[0])*.1, n[1] + (tp[1]-n[1])*.4, n[0], n[1]);
  }
  c.closePath();
  c.fillStyle = hairShade(c, k, top[0][1] - 120, tips[0][1]); c.fill(); ink(c, 3);
  c.save(); c.clip(); c.strokeStyle = k.hairHi; c.globalAlpha = .28; c.lineWidth = 2;
  for (let i=1;i<tips.length;i+=2){ const v = valleys[i]; c.beginPath(); c.moveTo(v[0] - 4, v[1] + 4); c.quadraticCurveTo(v[0] - 8, (v[1] + tips[i][1])/2, tips[i][0] + 2, tips[i][1] - 18); c.stroke(); }
  c.restore();
}
function hairShade(c, k, y0, y1){ return gradV(c, y0, y1, k.hairMid, k.hair); }
function angelRing(c, k, cx, cy, r){ c.save(); c.globalAlpha = .55; c.beginPath(); c.ellipse(cx, cy, r, r*.22, -.08, Math.PI*1.05, Math.PI*1.95); c.lineWidth = 7; c.strokeStyle = k.hairHi; c.stroke(); c.restore(); }
// ---------- ЧЕРРИ
function vnCherry(c, st){
  const k = VN.cherry, t = st.t, sw = Math.sin(t*1.3)*4, sw2 = Math.sin(t*1.1 + 1)*5;
  headOn(c);
  // задние волосы: длинные, ниже плеч
  c.beginPath(); c.moveTo(-70, -400);
  c.bezierCurveTo(-120, -330, -126, -230, -118 + sw, -120); c.bezierCurveTo(-112 + sw, -70, -124 + sw2, -30, -108 + sw2, 10);
  c.lineTo(-40, 10); c.bezierCurveTo(-60, -60, -56, -140, -44, -200);
  c.lineTo(60, -200); c.bezierCurveTo(78, -150, 96, -80, 104 + sw2, 10); c.lineTo(132 + sw2, 10);
  c.bezierCurveTo(128 + sw, -80, 122, -200, 100, -280); c.bezierCurveTo(92, -360, 84, -420, 0, -440); c.closePath();
  c.fillStyle = hairShade(c, k, -440, 10); c.fill(); ink(c, 3);
  c.save(); c.clip(); c.strokeStyle = 'rgba(110,90,134,.35)'; c.lineWidth = 2;
  for (let i=0;i<7;i++){ c.beginPath(); c.moveTo(-100 + i*6, -300); c.bezierCurveTo(-110 + i*5, -200, -104 + i*4 + sw, -100, -112 + i*5 + sw2, 0); c.stroke();
    c.beginPath(); c.moveTo(96 - i*5, -300); c.bezierCurveTo(108 - i*4, -200, 110 - i*4 + sw, -90, 118 - i*5 + sw2, 0); c.stroke(); }
  c.restore();
  // пучок и украшения
  c.beginPath(); c.arc(-38, -438, 36, 0, Math.PI*2); c.fillStyle = hairShade(c, k, -474, -402); c.fill(); ink(c, 3);
  c.beginPath(); c.arc(-38, -438, 20, .4, 4.4); c.strokeStyle = 'rgba(110,90,134,.6)'; c.lineWidth = 2.4; c.stroke();
  c.beginPath(); c.moveTo(-66, -470); c.lineTo(-4, -416); c.lineWidth = 5; c.strokeStyle = '#C9A15A'; c.stroke(); c.lineWidth = 1.6; c.strokeStyle = INK; c.stroke();
  c.beginPath(); c.arc(-68, -472, 5, 0, Math.PI*2); c.fillStyle = '#F2C14E'; c.fill(); ink(c, 1.6);
  c.restore();
  // тело: кимоно
  torso(c); c.fillStyle = gradV(c, -200, 10, '#A63634', '#7C2427'); c.fill(); ink(c, 3);
  vnNeck(c, k);
  c.save(); torso(c); c.clip();
  // ворот кимоно: левая пола поверх правой
  c.beginPath(); c.moveTo(-22, -190); c.lineTo(8, -120); c.lineTo(34, -190); c.closePath(); c.fillStyle = '#F4EDE2'; c.fill(); ink(c, 2.2);
  c.beginPath(); c.moveTo(-36, -194); c.lineTo(6, -112); c.lineTo(20, -126); c.lineTo(-18, -196); c.closePath(); c.fillStyle = '#F4EDE2'; c.fill(); ink(c, 2.2);
  c.beginPath(); c.moveTo(46, -194); c.bezierCurveTo(30, -150, 0, -90, -52, -30); c.lineTo(-30, -30); c.bezierCurveTo(14, -86, 40, -140, 60, -190); c.closePath();
  c.fillStyle = '#E8823A'; c.fill(); ink(c, 2.4);
  c.beginPath(); c.moveTo(-48, -194); c.bezierCurveTo(-30, -160, -12, -130, 4, -110); c.lineWidth = 8; c.strokeStyle = '#E8823A'; c.stroke(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
  // пояс
  c.beginPath(); c.rect(-160, -34, 330, 30); c.fillStyle = '#8E88AA'; c.fill(); ink(c, 2.6);
  c.beginPath(); c.moveTo(-160, -20); c.lineTo(170, -18); c.lineWidth = 3; c.strokeStyle = '#C9A15A'; c.stroke();
  // кленовый узор
  [[-110,-80,1.6,-.4],[-84,-118,1.2,.3],[104,-90,1.5,.5],[120,-140,1.1,-.2],[-120,-150,1,.8]].forEach(([x,y,s,r]) => mapleLeaf(c, x, y, s*2.2, r, '#E8823A'));
  c.restore();
  // брошь-кленовый лист
  mapleLeaf(c, 28, -104, 2.4, .2, '#F2C14E'); c.beginPath(); c.arc(28, -104, 3, 0, Math.PI*2); c.fillStyle = '#C24A4A'; c.fill();
  armSeams(c);
  // лицо
  headOn(c);
  vnFaceAll(c, k, st);
  c.save(); c.translate(-33, -284); c.rotate(.6); c.fillStyle = '#C24A4A'; c.fillRect(-2.6, -2.6, 5.2, 5.2); c.restore();
  // макушка и чёлка
  bangs(c, k, [[-66,-344],[-80,-430],[-20,-470],[18,-464],[70,-458],[94,-410],[82,-344]],
    [[82,-350],[52,-360],[20,-358],[-12,-358],[-42,-360],[-66,-350]],
    [[72,-334],[38,-330],[4,-326],[-30,-328],[-60,-334]], -8);
  angelRing(c, k, 6, -424, 62); vnBrowsOver(c, st);
  // боковые пряди
  lock(c, -60, -350, -78, -300, -70 + sw*.5, -240, -76 + sw, -168, 10, k.hairMid);
  lock(c, 74, -350, 86, -300, 84 + sw*.4, -250, 92 + sw*.6, -196, 7, k.hair);
  // кленовые листья в волосах
  mapleLeaf(c, -70, -398, 3.2, -.5 + Math.sin(t*1.5)*.04, '#E8823A'); mapleLeaf(c, -84, -372, 2.4, -1.2, '#C9552E'); mapleLeaf(c, -54, -420, 2, .3, '#F2A04A');
  c.restore();
}
// ---------- МАРТА
function vnMarta(c, st){
  const k = VN.marta, t = st.t, sw = Math.sin(t*1.2)*4, sw2 = Math.sin(t*1.0 + 2)*5;
  headOn(c);
  // волнистые длинные волосы сзади
  c.beginPath(); c.moveTo(-78, -380);
  for (let i=0;i<=6;i++){ const y = -380 + i*64; c.quadraticCurveTo(-132 + (i%2)*18 + sw*i*.2, y + 32, -116 + (i%2 ? 0 : 14) + sw*i*.25, y + 64); }
  c.lineTo(-30, 10); c.bezierCurveTo(-50, -80, -50, -150, -40, -200); c.lineTo(60, -200); c.bezierCurveTo(80, -140, 96, -60, 100, 10);
  for (let i=6;i>=0;i--){ const y = -380 + i*64; c.quadraticCurveTo(140 - (i%2)*18 + sw2*i*.2, y + 32, 124 - (i%2 ? 0 : 14) + sw2*i*.25, y); }
  c.closePath(); c.fillStyle = hairShade(c, k, -400, 20); c.fill(); ink(c, 3);
  c.save(); c.clip(); c.strokeStyle = 'rgba(190,140,60,.35)'; c.lineWidth = 2;
  for (let i=0;i<6;i++){ c.beginPath(); c.moveTo(-96 + i*5, -320); for (let j=0;j<5;j++) c.quadraticCurveTo(-118 + i*5 + (j%2)*16, -260 + j*64, -104 + i*5 + sw*.5, -228 + j*64); c.stroke(); }
  c.restore();
  c.restore();
  // тело: зелёная мантия с кремовым воротником
  torso(c); c.fillStyle = gradV(c, -200, 10, '#8CAE78', '#5E7C50'); c.fill(); ink(c, 3);
  vnNeck(c, k);
  c.beginPath(); c.moveTo(-62, -186); c.quadraticCurveTo(-74, -140, -40, -120); c.quadraticCurveTo(4, -138, 6, -176); c.quadraticCurveTo(10, -138, 52, -122); c.quadraticCurveTo(84, -142, 70, -186);
  c.quadraticCurveTo(4, -170, -62, -186); c.fillStyle = '#F2E8D2'; c.fill(); ink(c, 2.6);
  c.beginPath(); c.moveTo(6, -168); c.lineTo(6, -96); c.lineWidth = 2.4; c.strokeStyle = '#6B5A44'; c.stroke();
  c.beginPath(); c.moveTo(6, -96); c.lineTo(-4, -76); c.lineTo(6, -56); c.lineTo(16, -76); c.closePath(); c.fillStyle = gradV(c, -96, -56, '#D8F2FF', '#7FC8E8'); c.fill(); ink(c, 2);
  c.save(); c.globalAlpha = .7; c.fillStyle = '#fff'; c.beginPath(); c.ellipse(2, -82, 2.4, 5, -.4, 0, Math.PI*2); c.fill(); c.restore();
  armSeams(c);
  headOn(c);
  vnFaceAll(c, k, st);
  // чёлка: мягкие пряди набок
  bangs(c, k, [[-70,-336],[-82,-420],[-10,-456],[30,-448],[80,-438],[92,-388],[80,-340]],
    [[80,-346],[46,-360],[12,-360],[-22,-356],[-50,-350],[-70,-340]],
    [[70,-336],[34,-332],[-2,-328],[-34,-322],[-62,-316]], -14);
  vnBrowsOver(c, st);
  lock(c, -62, -340, -86, -280, -76 + sw*.5, -220, -92 + sw, -150, 11, k.hairMid);
  lock(c, 76, -344, 92, -290, 86 + sw2*.4, -240, 98 + sw2*.5, -170, 8, k.hair);
  // шляпа
  c.save(); c.translate(6, -404); c.rotate(-.09 + Math.sin(t*.9)*.015);
  c.beginPath(); c.ellipse(0, 0, 176, 40, 0, 0, Math.PI*2); c.fillStyle = gradV(c, -40, 40, '#8C7560', '#5E4A3A'); c.fill(); ink(c, 3.4);
  c.beginPath(); c.moveTo(-86, -10); c.bezierCurveTo(-70, -110, -30, -170, 30, -214); c.bezierCurveTo(60, -236, 100 + Math.sin(t*1.3)*4, -230, 136 + Math.sin(t*1.3)*6, -196);
  c.bezierCurveTo(96, -192, 70, -170, 62, -140); c.bezierCurveTo(70, -90, 82, -40, 88, -10); c.closePath(); c.fillStyle = gradV(c, -230, -10, '#9E8670', '#7A6450'); c.fill(); ink(c, 3.4);
  c.beginPath(); c.moveTo(-84, -26); c.quadraticCurveTo(0, -56, 86, -26); c.lineTo(88, -6); c.quadraticCurveTo(0, -36, -86, -6); c.closePath(); c.fillStyle = '#5E7A4C'; c.fill(); ink(c, 2.4);
  const fl = [[-60,-24,'#C38BE8'],[-36,-34,'#8FB8F0'],[-12,-38,'#C38BE8'],[14,-38,'#F2E07A'],[40,-34,'#E68AC8'],[62,-26,'#8FB8F0']];
  for (const [x,y,col] of fl){ for (let p=0;p<5;p++){ const a = p/5*Math.PI*2; c.beginPath(); c.ellipse(x + Math.cos(a)*5, y + Math.sin(a)*5, 4.4, 3.2, a, 0, Math.PI*2); c.fillStyle = col; c.fill(); }
    c.beginPath(); c.arc(x, y, 2.6, 0, Math.PI*2); c.fillStyle = '#FFF1B8'; c.fill(); }
  for (const [x,y,r] of [[-74,-18,-.6],[76,-20,.7],[24,-46,-.2]]){ c.save(); c.translate(x, y); c.rotate(r); c.beginPath(); c.ellipse(0, 0, 14, 5.5, 0, 0, Math.PI*2); c.fillStyle = '#7FB060'; c.fill(); ink(c, 1.8); c.restore(); }
  c.restore();
  c.restore();
}
// ---------- ЖУЛЯ
function vnJulia(c, st){
  const k = VN.julia, t = st.t, sw = Math.sin(t*2.2)*7, sw2 = Math.sin(t*1.7 + 1)*5;
  headOn(c);
  // длинный высокий хвост
  c.beginPath(); c.moveTo(-50, -448); c.bezierCurveTo(-150, -470, -190 + sw, -360, -172 + sw, -250);
  c.bezierCurveTo(-162 + sw, -170, -186 + sw2, -110, -170 + sw2, -40); c.quadraticCurveTo(-150 + sw2, -80, -140 + sw, -150);
  c.bezierCurveTo(-120 + sw, -240, -128, -340, -60, -400); c.closePath(); c.fillStyle = hairShade(c, k, -470, -40); c.fill(); ink(c, 3);
  c.save(); c.clip(); c.strokeStyle = 'rgba(155,232,218,.45)'; c.lineWidth = 2.4; for (let i=0;i<5;i++){ c.beginPath(); c.moveTo(-90 - i*10, -440); c.bezierCurveTo(-150 - i*6 + sw, -380, -150 - i*4 + sw, -240, -160 - i*3 + sw2, -80); c.stroke(); } c.restore();
  // задние волосы до плеч
  c.beginPath(); c.moveTo(-66, -390); c.bezierCurveTo(-100, -330, -92, -250, -80 + sw2*.3, -196); c.lineTo(70, -206); c.bezierCurveTo(98, -260, 96, -340, 70, -400); c.closePath();
  c.fillStyle = k.hair; c.fill(); ink(c, 3);
  c.restore();
  // тело: куртка, шарф
  torso(c); c.fillStyle = gradV(c, -200, 10, '#5E9168', '#3E6A4A'); c.fill(); ink(c, 3);
  c.beginPath(); c.moveTo(-110, -160); c.quadraticCurveTo(-60, -200, -10, -196); c.lineTo(-30, -150); c.quadraticCurveTo(-80, -150, -110, -160); c.fillStyle = '#4E7D58'; c.fill(); ink(c, 2.4);
  vnNeck(c, k);
  c.beginPath(); c.moveTo(-50, -196); c.quadraticCurveTo(6, -168, 66, -198); c.quadraticCurveTo(78, -160, 50, -140); c.quadraticCurveTo(4, -124, -40, -144); c.quadraticCurveTo(-66, -162, -50, -196);
  c.fillStyle = gradV(c, -200, -124, '#FFD66E', '#E6A93A'); c.fill(); ink(c, 2.8);
  c.beginPath(); c.moveTo(30, -146); c.bezierCurveTo(40, -100, 26 + sw2, -60, 44 + sw2, -10); c.lineTo(72 + sw2, -16); c.bezierCurveTo(56 + sw2, -60, 64, -110, 56, -150); c.closePath();
  c.fillStyle = gradV(c, -150, -10, '#FFD66E', '#E6A93A'); c.fill(); ink(c, 2.6);
  for (const y of [-120, -80, -40]){ c.beginPath(); c.moveTo(-90, y); c.lineTo(-70, y + 4); c.lineWidth = 3; c.strokeStyle = 'rgba(30,50,36,.45)'; c.stroke(); }
  c.beginPath(); c.arc(-60, -60, 9, 0, Math.PI*2); c.fillStyle = '#E2703A'; c.fill(); ink(c, 2); c.beginPath(); c.arc(-60, -60, 3.4, 0, Math.PI*2); c.fillStyle = '#FFE0B0'; c.fill();
  armSeams(c);
  headOn(c);
  vnFaceAll(c, k, st);
  c.fillStyle = 'rgba(190,110,80,.55)'; for (const [x,y] of [[-40,-290],[-32,-286],[-46,-284],[50,-288],[58,-284]]){ c.beginPath(); c.arc(x, y, 1.8, 0, Math.PI*2); c.fill(); }
  // макушка и озорная чёлка
  bangs(c, k, [[-72,-342],[-84,-430],[-20,-472],[22,-466],[76,-458],[98,-402],[84,-342]],
    [[84,-348],[58,-356],[28,-354],[-2,-354],[-30,-356],[-54,-354],[-72,-346]],
    [[74,-328],[44,-324],[12,-318],[-18,-322],[-46,-326],[-68,-330]], -4);
  angelRing(c, k, 8, -428, 60); vnBrowsOver(c, st);
  lock(c, -64, -350, -80, -300, -76 + sw*.3, -250, -84 + sw*.5, -200, 9, k.hairMid);
  lock(c, 76, -346, 90, -300, 88, -260, 96 + sw2*.4, -226, 7, k.hair);
  // лента в хвосте
  c.save(); c.translate(-62, -444); c.rotate(-.3 + Math.sin(t*3)*.08);
  c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-30, -26, -44, -6); c.quadraticCurveTo(-30, 12, 0, 0); c.fillStyle = '#F2C14E'; c.fill(); ink(c, 2.4);
  c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(26, -30, 40, -10); c.quadraticCurveTo(26, 8, 0, 0); c.fillStyle = '#F2C14E'; c.fill(); ink(c, 2.4);
  c.beginPath(); c.moveTo(-4, 2); c.quadraticCurveTo(-20 + sw*.4, 40, -12 + sw*.6, 66); c.moveTo(4, 2); c.quadraticCurveTo(14 + sw*.4, 36, 24 + sw*.6, 58); c.lineWidth = 6; c.strokeStyle = INK; c.stroke(); c.lineWidth = 3.4; c.strokeStyle = '#F2C14E'; c.stroke();
  c.beginPath(); c.arc(0, 0, 7, 0, Math.PI*2); c.fillStyle = '#E6A93A'; c.fill(); ink(c, 2.2);
  c.restore();
  c.restore();
}
// ---------- новые палитры портретов
Object.assign(VN, {
  aya:{ skin:'#FBE2D2', skinSh:'#EDBFA8', blush:'#F29A8C', lip:'#C4545A',
    hair:'#7E3A20', hairMid:'#A9532F', hairHi:'#EBA06E', iris:['#16304E','#3E6E9C','#A8D0F0'], name:'#C2662E' },
  timofey:{ skin:'#F1D2BC', skinSh:'#DDB096', blush:'#E8A08C', lip:'#B86A5E',
    hair:'#A9A39A', hairMid:'#CFCAC2', hairHi:'#F6F3EE', iris:['#2E241C','#6E5A44','#B89A74'], name:'#7A5A3A', male:true, eyeH:.6, browW:5 },
  miko:{ skin:'#FBE4D6', skinSh:'#EEC2AE', blush:'#F59AAE', lip:'#C4547A',
    hair:'#8A5CB6', hairMid:'#B48AD8', hairHi:'#EEDCFB', iris:['#3A1E50','#8E4EB0','#E8C0F8'], name:'#7A3E9A' },
  gisa:{ skin:'#F6D8C2', skinSh:'#E4B69E', blush:'#F0957E', lip:'#C05A50',
    hair:'#2E211B', hairMid:'#4E382C', hairHi:'#9A7A62', iris:['#5A3008','#C77A1E','#F8CC6A'], name:'#B9801A' },
  axel:{ skin:'#EFD2BE', skinSh:'#D6AE96', blush:'#DDA48E', lip:'#A8645C',
    hair:'#141828', hairMid:'#283252', hairHi:'#7C8EC4', iris:['#4A2406','#E39A2A','#FFE19A'], name:'#1E7A84', male:true },
  vran:{ skin:'#F4E2D4', skinSh:'#DEC2AE', blush:'#E8A79A', lip:'#A85460',
    hair:'#17131D', hairMid:'#2E283A', hairHi:'#6E6486', iris:['#3A0E16','#8C2E3A','#E8949A'], name:'#7E2E3C', male:true, eyeH:.68, browW:4 },
  era:{ skin:'#FAE2D2', skinSh:'#E8BEA8', blush:'#EE9E92', lip:'#B95C5E',
    hair:'#2E2638', hairMid:'#463A56', hairHi:'#8A7AA8', iris:['#1E3A30','#4E7A6A','#A8D8C0'], name:'#5A6A9A' }
});
// ---------- АЯ: медные волосы до плеч с низким хвостом, тёмно-синее пальто, оранжевый шарф, ремень сумки
function vnAya(c, st){
  const k = VN.aya, t = st.t, sw = Math.sin(t*1.3)*4, sw2 = Math.sin(t*1.1 + 1)*5;
  headOn(c);
  c.beginPath(); c.moveTo(-72, -396);
  c.bezierCurveTo(-112, -330, -112, -260, -96 + sw*.5, -214); c.lineTo(-40, -206); c.lineTo(66, -206);
  c.bezierCurveTo(96, -240, 106, -300, 92, -360); c.bezierCurveTo(84, -420, 60, -446, 0, -448); c.closePath();
  c.fillStyle = hairShade(c, k, -448, -206); c.fill(); ink(c, 3);
  c.beginPath(); c.moveTo(-70, -250); c.bezierCurveTo(-120 + sw, -200, -132 + sw2, -120, -112 + sw2, -40); c.quadraticCurveTo(-96 + sw2, -70, -92 + sw, -130); c.bezierCurveTo(-88, -190, -70, -220, -48, -240); c.closePath();
  c.fillStyle = hairShade(c, k, -250, -40); c.fill(); ink(c, 3);
  c.beginPath(); c.ellipse(-62, -246, 14, 10, -.6, 0, Math.PI*2); c.fillStyle = '#E8823A'; c.fill(); ink(c, 2.4);
  c.restore();
  torso(c); c.fillStyle = gradV(c, -200, 10, '#36497A', '#1F2A48'); c.fill(); ink(c, 3);
  vnNeck(c, k);
  c.save(); torso(c); c.clip();
  c.beginPath(); c.moveTo(-40, -192); c.lineTo(-10, -60); c.lineTo(-60, 20); c.lineTo(-150, 20); c.lineTo(-150, -150); c.closePath(); c.fillStyle = 'rgba(70,89,138,.55)'; c.fill(); ink(c, 2.4);
  c.beginPath(); c.moveTo(52, -192); c.lineTo(18, -60); c.lineTo(66, 20); c.lineTo(160, 20); c.lineTo(160, -150); c.closePath(); c.fillStyle = 'rgba(70,89,138,.55)'; c.fill(); ink(c, 2.4);
  c.beginPath(); c.moveTo(110, -160); c.lineTo(-120, 20); c.lineTo(-96, 20); c.lineTo(128, -150); c.closePath(); c.fillStyle = '#7A5236'; c.fill(); ink(c, 2.2);
  for (const y of [-40, -90]){ c.beginPath(); c.arc(4, y, 6, 0, Math.PI*2); c.fillStyle = '#C9A15A'; c.fill(); ink(c, 1.8); }
  c.restore();
  // шарф
  c.beginPath(); c.moveTo(-62, -200); c.quadraticCurveTo(4, -160, 72, -200); c.quadraticCurveTo(84, -168, 66, -140); c.quadraticCurveTo(4, -112, -54, -140); c.quadraticCurveTo(-74, -166, -62, -200);
  c.fillStyle = gradV(c, -200, -112, '#F49A4E', '#D96A2A'); c.fill(); ink(c, 2.8);
  c.beginPath(); c.moveTo(36, -136); c.bezierCurveTo(46, -96, 30 + sw2, -60, 50 + sw2, -10); c.lineTo(80 + sw2, -18); c.bezierCurveTo(62 + sw2, -60, 70, -100, 62, -140); c.closePath();
  c.fillStyle = gradV(c, -140, -10, '#F49A4E', '#D96A2A'); c.fill(); ink(c, 2.6);
  for (const y of [-34, -26]){ c.beginPath(); c.moveTo(52 + sw2, y); c.lineTo(78 + sw2, y - 6); c.lineWidth = 2; c.strokeStyle = 'rgba(120,50,20,.5)'; c.stroke(); }
  // значок-фонарик
  c.save(); c.translate(-70, -96); pathRR(c, -10, -14, 20, 26, 5); fillInk(c, '#C9A15A', 2); c.beginPath(); c.ellipse(0, 0, 5, 8, 0, 0, Math.PI*2); c.fillStyle = '#FFE0A0'; c.fill(); c.restore();
  armSeams(c);
  headOn(c);
  vnFaceAll(c, k, st);
  bangs(c, k, [[-68,-338],[-82,-426],[-16,-466],[20,-460],[74,-454],[96,-404],[84,-342]],
    [[84,-346],[56,-356],[26,-360],[-6,-358],[-36,-356],[-60,-348]],
    [[78,-320],[46,-330],[12,-322],[-22,-330],[-50,-324]], -10);
  angelRing(c, k, 8, -426, 60); vnBrowsOver(c, st, k);
  lock(c, -60, -348, -78, -298, -72 + sw*.5, -246, -78 + sw, -200, 10, k.hairMid);
  lock(c, 76, -346, 90, -300, 88 + sw*.4, -256, 94 + sw*.6, -214, 7, k.hair);
  c.save(); c.translate(-62, -392); c.rotate(-.4); c.beginPath(); c.moveTo(0, -16); c.quadraticCurveTo(12, -2, 8, 10); c.quadraticCurveTo(0, 16, -8, 10); c.quadraticCurveTo(-12, -2, 0, -16); fillInk(c, '#F2A04A', 2.2); c.restore();
  c.restore();
}
// ---------- ТИМОФЕЙ: седые волосы, кепка, борода с усами, круглые очки, старое пальто, цепочка часов
function vnTimofey(c, st){
  const k = VN.timofey, t = st.t, talk = st.talk ? Math.abs(Math.sin(t*20))*5 : 0;
  headOn(c);
  c.beginPath(); c.moveTo(-70, -380); c.quadraticCurveTo(-92, -320, -72, -276); c.lineTo(-50, -300); c.lineTo(-40, -380); c.closePath(); c.fillStyle = k.hairMid; c.fill(); ink(c, 2.6);
  c.beginPath(); c.moveTo(84, -380); c.quadraticCurveTo(100, -320, 86, -280); c.lineTo(70, -300); c.lineTo(66, -380); c.closePath(); c.fillStyle = k.hairMid; c.fill(); ink(c, 2.6);
  c.restore();
  torso(c); c.fillStyle = gradV(c, -200, 10, '#7A5A40', '#4E3A2A'); c.fill(); ink(c, 3);
  vnNeck(c, k);
  c.save(); torso(c); c.clip();
  c.beginPath(); c.moveTo(-50, -194); c.lineTo(-24, -120); c.lineTo(-18, 20); c.lineTo(30, 20); c.lineTo(34, -120); c.lineTo(60, -194); c.closePath(); c.fillStyle = '#3E2E22'; c.fill(); ink(c, 2.4);
  c.beginPath(); c.moveTo(-34, -196); c.lineTo(4, -150); c.lineTo(44, -196); c.closePath(); c.fillStyle = '#E8DCC2'; c.fill(); ink(c, 2.2);
  for (let i=0;i<4;i++){ c.beginPath(); c.arc(6, -120 + i*36, 5, 0, Math.PI*2); c.fillStyle = '#C9A15A'; c.fill(); ink(c, 1.6); }
  c.beginPath(); c.moveTo(10, -96); c.quadraticCurveTo(50, -70, 28, -50); c.lineWidth = 3; c.strokeStyle = '#E8C66A'; c.stroke();
  c.beginPath(); c.moveTo(-60, -194); c.bezierCurveTo(-80, -140, -110, -60, -130, 20); c.moveTo(70, -194); c.bezierCurveTo(90, -140, 120, -60, 140, 20); c.lineWidth = 2.4; c.strokeStyle = 'rgba(40,26,18,.5)'; c.stroke();
  c.restore();
  armSeams(c);
  headOn(c);
  vnFaceAll(c, k, st);
  c.save(); c.globalAlpha = .45; c.strokeStyle = INK; c.lineWidth = 1.8;
  for (const [x, y, w] of [[-20,-392,40],[-14,-378,30],[34,-390,30]]){ c.beginPath(); c.moveTo(x - w/2, y); c.quadraticCurveTo(x, y - 4, x + w/2, y); c.stroke(); }
  c.beginPath(); c.moveTo(-44, -300); c.lineTo(-54, -296); c.moveTo(-44, -308); c.lineTo(-54, -310); c.moveTo(62, -300); c.lineTo(70, -296); c.stroke(); c.restore();
  c.beginPath(); c.moveTo(-40, -286); c.quadraticCurveTo(-42, -230 + talk, 10, -214 + talk); c.quadraticCurveTo(62, -230 + talk, 62, -286);
  c.quadraticCurveTo(40, -262, 10, -268); c.quadraticCurveTo(-20, -262, -40, -286); c.fillStyle = gradV(c, -290, -214, k.hairHi, k.hairMid); c.fill(); ink(c, 2.6);
  c.beginPath(); c.moveTo(-26, -270); c.quadraticCurveTo(-4, -290, 10, -276); c.quadraticCurveTo(26, -290, 48, -268); c.quadraticCurveTo(30, -262, 10, -266); c.quadraticCurveTo(-10, -262, -26, -270);
  c.fillStyle = k.hairHi; c.fill(); ink(c, 2.4);
  const e = st.emo || '', lift = e === 'surprised' ? -8 : 0, a = e === 'angry' ? 6 : e === 'worried' || e === 'sad' ? -5 : 0;
  for (const [x0, x1, dy] of [[-40, 0, a], [22, 60, -a]]){ c.beginPath(); c.moveTo(x0, -350 + lift + (x0 < 0 ? -dy : 0)); c.quadraticCurveTo((x0 + x1)/2, -366 + lift, x1, -352 + lift + (x0 < 0 ? dy : dy)); c.lineTo(x1, -344 + lift); c.quadraticCurveTo((x0 + x1)/2, -356 + lift, x0, -342 + lift); c.closePath(); c.fillStyle = k.hairHi; c.fill(); ink(c, 2.2); }
  c.beginPath(); c.arc(-18, -306, 26, 0, Math.PI*2); c.moveTo(64, -305); c.arc(38, -305, 26, 0, Math.PI*2); c.moveTo(8, -308); c.lineTo(12, -308); c.lineWidth = 3; c.strokeStyle = '#B8923E'; c.stroke();
  c.save(); c.globalAlpha = .18; c.fillStyle = '#FFF'; c.beginPath(); c.arc(-24, -314, 10, 0, Math.PI*2); c.arc(32, -313, 10, 0, Math.PI*2); c.fill(); c.restore();
  c.beginPath(); c.moveTo(-74, -372); c.bezierCurveTo(-80, -440, -40, -478, 14, -476); c.bezierCurveTo(70, -474, 98, -440, 92, -376); c.quadraticCurveTo(10, -394, -74, -372);
  c.fillStyle = gradV(c, -476, -372, '#7A6450', '#5C4A3A'); c.fill(); ink(c, 3);
  c.beginPath(); c.moveTo(20, -384); c.quadraticCurveTo(90, -392, 128, -370); c.quadraticCurveTo(96, -356, 20, -366); c.closePath(); c.fillStyle = '#4E3E30'; c.fill(); ink(c, 2.8);
  c.save(); c.globalAlpha = .25; c.strokeStyle = '#2E2016'; c.lineWidth = 2; for (let i=0;i<6;i++){ c.beginPath(); c.moveTo(-60 + i*26, -460 + i*2); c.lineTo(-70 + i*28, -380); c.stroke(); } c.restore();
  c.beginPath(); c.arc(12, -470, 8, 0, Math.PI*2); c.fillStyle = '#5C4A3A'; c.fill(); ink(c, 2);
  c.restore();
}
// ---------- МИКО: длинные сиреневые волосы, повязка с монетками, шаль, ожерелье, Генерал на голове
function vnMiko(c, st){
  const k = VN.miko, t = st.t, sw = Math.sin(t*1.2)*4, sw2 = Math.sin(t*1.0 + 2)*5;
  headOn(c);
  c.beginPath(); c.moveTo(-78, -380);
  for (let i=0;i<=6;i++){ const y = -380 + i*64; c.quadraticCurveTo(-136 + (i%2)*18 + sw*i*.2, y + 32, -120 + (i%2 ? 0 : 14) + sw*i*.25, y + 64); }
  c.lineTo(-30, 10); c.bezierCurveTo(-50, -80, -50, -150, -40, -200); c.lineTo(60, -200); c.bezierCurveTo(80, -140, 96, -60, 100, 10);
  for (let i=6;i>=0;i--){ const y = -380 + i*64; c.quadraticCurveTo(144 - (i%2)*18 + sw2*i*.2, y + 32, 128 - (i%2 ? 0 : 14) + sw2*i*.25, y); }
  c.closePath(); c.fillStyle = hairShade(c, k, -400, 20); c.fill(); ink(c, 3);
  c.save(); c.clip(); c.strokeStyle = 'rgba(238,220,251,.35)'; c.lineWidth = 2;
  for (let i=0;i<6;i++){ c.beginPath(); c.moveTo(-98 + i*5, -320); for (let j=0;j<5;j++) c.quadraticCurveTo(-120 + i*5 + (j%2)*16, -260 + j*64, -106 + i*5 + sw*.5, -228 + j*64); c.stroke(); }
  c.restore();
  c.restore();
  torso(c); c.fillStyle = gradV(c, -200, 10, '#6A4A8E', '#45305E'); c.fill(); ink(c, 3);
  vnNeck(c, k);
  c.beginPath(); c.moveTo(-150, -110); c.quadraticCurveTo(-60, -180, -36, -196); c.quadraticCurveTo(4, -120, 44, -196); c.quadraticCurveTo(80, -180, 160, -110); c.lineTo(160, -60); c.quadraticCurveTo(4, -30, -150, -60); c.closePath();
  c.fillStyle = gradV(c, -196, -40, '#3E2A58', '#2E1E44'); c.fill(); ink(c, 2.8);
  for (let i=0;i<14;i++){ const x = -146 + i*22.6, y = -60 + Math.sin(i/13*Math.PI)*28; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 2, y + 16); c.lineWidth = 3; c.strokeStyle = '#F2C14E'; c.stroke(); }
  for (let i=0;i<7;i++){ const a = -.5 + i/6, x = 4 + Math.sin(a*2.4)*44, y = -178 + Math.cos(a*2.4)*-30 + 60; c.beginPath(); c.arc(x, y, 7, 0, Math.PI*2); c.fillStyle = '#F2C14E'; c.fill(); ink(c, 1.8); c.beginPath(); c.arc(x, y, 2.4, 0, Math.PI*2); c.fillStyle = '#C9902E'; c.fill(); }
  armSeams(c);
  headOn(c);
  vnFaceAll(c, k, st);
  bangs(c, k, [[-70,-340],[-84,-424],[-14,-464],[22,-460],[78,-452],[98,-400],[84,-344]],
    [[84,-350],[58,-352],[30,-350],[2,-350],[-26,-350],[-52,-350],[-70,-344]],
    [[76,-322],[46,-316],[16,-316],[-12,-316],[-40,-318],[-64,-322]], 0);
  vnBrowsOver(c, st, k);
  lock(c, -64, -340, -86, -280, -80 + sw*.5, -220, -94 + sw, -150, 11, k.hairMid);
  lock(c, 78, -344, 94, -290, 88 + sw2*.4, -240, 100 + sw2*.5, -170, 8, k.hair);
  c.beginPath(); c.moveTo(-78, -380); c.quadraticCurveTo(6, -432, 96, -384); c.lineTo(94, -404); c.quadraticCurveTo(6, -456, -76, -404); c.closePath(); c.fillStyle = gradV(c, -456, -380, '#8E4EB0', '#6A3488'); c.fill(); ink(c, 2.6);
  for (let i=0;i<9;i++){ const x = -64 + i*19, y = -388 - Math.sin(i/8*Math.PI)*26; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 10); c.lineWidth = 1.6; c.strokeStyle = INK; c.stroke();
    c.beginPath(); c.arc(x, y + 15, 6, 0, Math.PI*2); c.fillStyle = '#F2C14E'; c.fill(); ink(c, 1.6); }
  c.save(); c.translate(-80, -394); c.rotate(-.5 + Math.sin(t*1.6)*.06); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-24, 30, -16 + sw, 70); c.lineTo(-2 + sw, 66); c.quadraticCurveTo(-8, 30, 12, 4); c.closePath(); c.fillStyle = '#7A3E9A'; c.fill(); ink(c, 2.4); c.restore();
  drawPigeon(c, 34, -470 + Math.sin(t*2)*2, t, 3.2, 1);
  c.restore();
}
// ---------- ГИСА: короткие тёмные волосы торчком, очки-гогглы на лбу, рубашка + жёлтый комбинезон, болтунчик в кармане
function vnGisa(c, st){
  const k = VN.gisa, t = st.t, sw = Math.sin(t*1.6)*4;
  headOn(c);
  c.beginPath(); c.moveTo(-70, -392); c.bezierCurveTo(-106, -330, -100, -272, -84 + sw*.4, -238); c.lineTo(-60, -262); c.lineTo(-54, -236); c.lineTo(72, -240);
  c.bezierCurveTo(96, -280, 104, -330, 90, -380); c.bezierCurveTo(78, -430, 50, -450, 0, -452); c.closePath(); c.fillStyle = hairShade(c, k, -452, -236); c.fill(); ink(c, 3);
  c.beginPath(); c.moveTo(-64, -430); c.quadraticCurveTo(-118, -446, -130 + sw, -410); c.quadraticCurveTo(-106, -412, -76, -400); c.closePath(); c.fillStyle = k.hairMid; c.fill(); ink(c, 2.6);
  c.restore();
  torso(c); c.fillStyle = gradV(c, -200, 10, '#5A82A2', '#3E6080'); c.fill(); ink(c, 3);
  vnNeck(c, k);
  c.beginPath(); c.moveTo(-30, -196); c.lineTo(4, -150); c.lineTo(40, -196); c.lineTo(28, -200); c.lineTo(4, -168); c.lineTo(-18, -200); c.closePath(); c.fillStyle = '#6E94B4'; c.fill(); ink(c, 2.2);
  c.save(); torso(c); c.clip();
  c.beginPath(); c.moveTo(-96, -120); c.lineTo(104, -120); c.lineTo(120, 20); c.lineTo(-112, 20); c.closePath(); c.fillStyle = gradV(c, -120, 20, '#F5C962', '#E0962A'); c.fill(); ink(c, 2.8);
  for (const sx of [-1, 1]){ c.beginPath(); c.moveTo(4 + sx*76, -122); c.lineTo(4 + sx*96, -196); c.lineTo(4 + sx*124, -190); c.lineTo(4 + sx*104, -120); c.closePath(); c.fillStyle = '#E8A93A'; c.fill(); ink(c, 2.4);
    c.beginPath(); c.arc(4 + sx*90, -118, 9, 0, Math.PI*2); c.fillStyle = '#C9A15A'; c.fill(); ink(c, 2); }
  pathRR(c, -40, -96, 88, 64, 12); c.fillStyle = '#F2B84C'; c.fill(); ink(c, 2.4);
  c.restore();
  c.save(); c.translate(4, -86); c.scale(2.6, 2.6); drawBoltik(c, 0, 0, t, 1, 1, 1); c.restore();
  pathRR(c, -42, -60, 92, 30, 10); c.fillStyle = '#F2B84C'; c.fill(); ink(c, 2.4);
  c.beginPath(); c.moveTo(-100, -40); c.lineTo(-70, -10); c.lineWidth = 7; c.strokeStyle = '#8A9098'; c.stroke(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
  armSeams(c);
  headOn(c);
  vnFaceAll(c, k, st);
  c.save(); c.globalAlpha = .4; c.fillStyle = '#3A2E26'; c.beginPath(); c.ellipse(56, -272, 12, 5, -.3, 0, Math.PI*2); c.fill(); c.restore();
  bangs(c, k, [[-70,-336],[-86,-428],[-18,-468],[18,-462],[76,-456],[100,-404],[86,-338]],
    [[86,-344],[64,-362],[40,-350],[14,-366],[-12,-352],[-40,-364],[-66,-346]],
    [[80,-312],[52,-330],[26,-318],[-2,-334],[-28,-320],[-58,-326]], -6);
  vnBrowsOver(c, st, k);
  lock(c, -62, -346, -80, -300, -74 + sw*.3, -262, -82 + sw*.5, -232, 9, k.hairMid);
  c.beginPath(); c.moveTo(-84, -396); c.quadraticCurveTo(6, -440, 100, -396); c.lineWidth = 14; c.strokeStyle = INK; c.stroke(); c.lineWidth = 10; c.strokeStyle = '#5A4434'; c.stroke();
  for (const [x, y] of [[-18, -420], [44, -418]]){ c.beginPath(); c.arc(x, y, 26, 0, Math.PI*2); c.fillStyle = gradV(c, y - 26, y + 26, '#E8C66A', '#B8923E'); c.fill(); ink(c, 2.8);
    c.beginPath(); c.arc(x, y, 18, 0, Math.PI*2); c.fillStyle = gradV(c, y - 18, y + 18, '#C8F0FA', '#7FC8E0'); c.fill(); ink(c, 2.2);
    c.save(); c.globalAlpha = .8; c.fillStyle = '#FFF'; c.beginPath(); c.ellipse(x - 6, y - 7, 6, 3.6, -.5, 0, Math.PI*2); c.fill(); c.restore(); }
  c.restore();
}
// ---------- СТРАННИК (Аксель — имя в игре не называется): короткие тёмные волосы с седой прядью, янтарные глаза,
//            шрам через бровь, тёмно-синее пальто с высоким воротом и бирюзовой подкладкой, бирюзовый шарф на шее,
//            кожаный ремень через грудь и значок со сломанным знаком фонарщиков
function vnAxelFace(c, k){ // мужское лицо: шире скулы, угол челюсти, прямой подбородок
  c.beginPath();
  c.moveTo(-60, -388); c.bezierCurveTo(-66, -340, -64, -302, -57, -276);
  c.lineTo(-32, -246); c.quadraticCurveTo(-12, -229, 10, -228); c.quadraticCurveTo(32, -229, 52, -246);
  c.lineTo(72, -276); c.bezierCurveTo(80, -302, 84, -340, 78, -388); c.closePath();
  c.fillStyle = k.skin; c.fill(); ink(c, 3);
  c.save(); c.clip(); c.fillStyle = k.skinSh; c.globalAlpha = .55;
  c.beginPath(); c.moveTo(80, -400); c.bezierCurveTo(68, -330, 66, -284, 42, -236); c.lineTo(94, -230); c.lineTo(94, -400); c.fill();
  c.globalAlpha = .45; c.beginPath(); c.ellipse(4, -376, 84, 26, 0, 0, Math.PI*2); c.fill();
  c.globalAlpha = .2; c.beginPath(); c.ellipse(-46, -284, 9, 22, .25, 0, Math.PI*2); c.ellipse(62, -284, 8, 20, -.25, 0, Math.PI*2); c.fill();
  c.restore();
}
function vnAxelBrows(c, k, st){
  const e = st.emo || '', lift = e === 'surprised' ? -9 : 0;
  const inner = e === 'angry' ? 7 : (e === 'worried' || e === 'sad') ? -7 : 0, smug = e === 'smug' ? -7 : 0;
  c.save(); c.globalAlpha = .92;
  for (const [xo, xi, yo, s] of [[-42, -4, -337, 1], [62, 22, -339, -1]]){
    const yi = -333 + lift + inner, yo2 = yo + lift + (s < 0 ? smug : 0);
    c.beginPath(); c.moveTo(xo, yo2 + 1); c.quadraticCurveTo((xo + xi)/2, yo2 - 5 + (yi - yo2)*.5, xi, yi);
    c.lineTo(xi, yi + 7); c.quadraticCurveTo((xo + xi)/2, yo2 + 4 + (yi - yo2)*.5, xo + s*4, yo2 + 6); c.closePath();
    c.fillStyle = k.hair; c.fill(); ink(c, 1.8);
  }
  c.restore();
}
function vnAxelMouth(c, k, st){
  const e = st.emo || '', open = st.talk && Math.sin(st.t*22) > -.1, x = 10, y = -254;
  c.beginPath(); c.moveTo(13, -298); c.quadraticCurveTo(18, -286, 15, -279); c.quadraticCurveTo(11, -276, 7, -278); c.lineWidth = 2; c.strokeStyle = 'rgba(140,86,74,.75)'; c.stroke();
  if (e === 'surprised' || open){
    const h = e === 'surprised' ? 7 : 3 + Math.abs(Math.sin(st.t*22))*3.4;
    c.beginPath(); c.ellipse(x, y + 1, e === 'surprised' ? 6 : 9, h, 0, 0, Math.PI*2); c.fillStyle = '#5E242C'; c.fill(); ink(c, 2.4); return;
  }
  c.beginPath();
  if (e === 'smug' || e === 'happy'){ c.moveTo(x - 11, y + 1); c.quadraticCurveTo(x + 2, y + 4, x + 13, y - 5); }
  else if (e === 'worried' || e === 'sad'){ c.moveTo(x - 10, y + 2); c.quadraticCurveTo(x, y - 2, x + 10, y + 2); }
  else { c.moveTo(x - 11, y); c.quadraticCurveTo(x, y + 2, x + 11, y - 1); }
  ink(c, 2.6);
  c.save(); c.globalAlpha = .3; c.beginPath(); c.moveTo(x - 5, y + 9); c.quadraticCurveTo(x, y + 11, x + 6, y + 9); c.lineWidth = 2; c.strokeStyle = k.skinSh; c.stroke(); c.restore();
}
function vnAxel(c, st){
  const k = VN.axel, t = st.t, sw = Math.sin(t*1.4)*3, sw2 = Math.sin(t*1.1 + 1)*5;
  // волосы сзади: коротко, до мочек ушей
  headOn(c);
  const spikes = [[-64,-292],[-82,-326],[-78,-350],[-102,-388],[-82,-404],[-100,-450],[-58,-448],[-56,-488],[-18,-466],[12,-498],[34,-466],[74,-480],[80,-440],[104,-412],[92,-384],[98,-342],[96,-302],[82,-280]];
  c.beginPath(); c.moveTo(spikes[0][0], spikes[0][1]);
  for (let i=1;i<spikes.length;i++){ const a = spikes[i-1], b = spikes[i]; c.quadraticCurveTo((a[0] + b[0])/2 + (i%2 ? -4 : 4), (a[1] + b[1])/2, b[0] + (i%2 ? 0 : sw*.3), b[1]); }
  c.lineTo(-60, -276); c.closePath(); c.fillStyle = hairShade(c, k, -500, -276); c.fill(); ink(c, 3);
  c.restore();
  // пальто
  torso(c); c.fillStyle = gradV(c, -200, 10, '#2E3A60', '#141A2C'); c.fill(); ink(c, 3);
  c.save(); torso(c); c.clip();
  c.beginPath(); c.moveTo(-36, -200); c.lineTo(4, -110); c.lineTo(46, -200); c.closePath(); c.fillStyle = '#1C1F2C'; c.fill(); ink(c, 2.2);
  c.beginPath(); c.moveTo(40, -150); c.lineTo(52, 20); c.lineWidth = 2.4; c.strokeStyle = 'rgba(8,10,20,.6)'; c.stroke();
  for (let i=0;i<4;i++){ c.beginPath(); c.arc(64, -120 + i*34, 5, 0, Math.PI*2); c.fillStyle = '#D9A441'; c.fill(); ink(c, 1.6); }
  // ремень через грудь с латунной пряжкой
  c.beginPath(); c.moveTo(-150, -150); c.lineTo(-124, -170); c.lineTo(170, 10); c.lineTo(140, 24); c.closePath(); c.fillStyle = gradV(c, -170, 24, '#4A3428', '#2E1E16'); c.fill(); ink(c, 2.4);
  c.save(); c.translate(-10, -76); c.rotate(.55); pathRR(c, -14, -11, 28, 22, 4); c.fillStyle = '#D9A441'; c.fill(); ink(c, 2); pathRR(c, -7, -5, 14, 10, 2); c.fillStyle = '#4A3428'; c.fill(); c.restore();
  c.restore();
  c.save(); c.beginPath(); // шея — шире, чем у девушек c.moveTo(-26, -250); c.lineTo(34, -250); c.lineTo(40, -176); c.quadraticCurveTo(6, -166, -32, -176); c.closePath(); c.fillStyle = k.skin; c.fill(); ink(c, 3);
  c.clip(); c.fillStyle = k.skinSh; c.globalAlpha = .6; c.beginPath(); c.ellipse(6, -240, 46, 20, 0, 0, Math.PI*2); c.fill(); c.restore();
  // высокий ворот: тёмно-синий снаружи, бирюзовый внутри
  for (const s of [-1, 1]){ const o = s < 0 ? 0 : 8;
    c.beginPath(); c.moveTo(4 + s*108 + o, -192); c.lineTo(4 + s*86 + o, -266); c.lineTo(4 + s*42 + o*.5, -226); c.lineTo(4 + s*38, -152); c.closePath(); c.fillStyle = '#222C4A'; c.fill(); ink(c, 2.6);
    c.beginPath(); c.moveTo(4 + s*86 + o, -266); c.lineTo(4 + s*42 + o*.5, -226); c.lineTo(4 + s*48 + o*.5, -212); c.lineTo(4 + s*80 + o, -246); c.closePath(); c.fillStyle = gradV(c, -266, -212, '#38B4BC', '#1E7A84'); c.fill(); ink(c, 2); }
  // шарф вокруг шеи и конец, переброшенный через плечо
  c.beginPath(); c.moveTo(-48, -238); c.quadraticCurveTo(6, -214, 60, -240); c.lineTo(66, -198); c.quadraticCurveTo(6, -172, -54, -196); c.closePath();
  c.fillStyle = gradV(c, -240, -172, '#2EA6B0', '#145A64'); c.fill(); ink(c, 3);
  c.beginPath(); c.moveTo(-50, -216); c.quadraticCurveTo(6, -194, 62, -218); c.lineWidth = 2.4; c.strokeStyle = '#E8A23A'; c.stroke();
  c.beginPath(); c.moveTo(34, -196); c.bezierCurveTo(52, -150, 46 + sw2*.4, -100, 58 + sw2, -40); c.lineTo(90 + sw2, -46); c.bezierCurveTo(80 + sw2*.4, -100, 82, -150, 64, -200); c.closePath();
  c.fillStyle = gradV(c, -200, -40, '#2EA6B0', '#145A64'); c.fill(); ink(c, 2.6);
  c.beginPath(); c.moveTo(56 + sw2*.9, -64); c.lineTo(86 + sw2*.9, -70); c.lineWidth = 2.4; c.strokeStyle = '#E8A23A'; c.stroke();
  for (let i=0;i<5;i++){ c.beginPath(); c.moveTo(60 + sw2 + i*7, -42 - i*1.2); c.lineTo(60 + sw2 + i*7, -30 - i*1.2); c.lineWidth = 2; c.strokeStyle = '#145A64'; c.stroke(); }
  // значок со сломанным знаком фонарщиков на ремне
  c.save(); c.translate(-82, -130);
  c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(0, 0, 4, 0, 0, 34); g.addColorStop(0, `rgba(80,220,230,${.35 + .15*Math.sin(t*2)})`); g.addColorStop(1, 'rgba(80,220,230,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 34, 0, Math.PI*2); c.fill(); c.restore();
  c.beginPath(); c.arc(0, 0, 17, 0, Math.PI*2); c.fillStyle = gradV(c, -17, 17, '#E6E9F0', '#9AA2B2'); c.fill(); ink(c, 2.2);
  c.beginPath(); c.arc(0, 0, 12, 0, Math.PI*2); c.lineWidth = 1.6; c.strokeStyle = '#5A6274'; c.stroke();
  c.beginPath(); c.moveTo(-4, -7); c.lineTo(4, -7); c.lineTo(5, 4); c.lineTo(-5, 4); c.closePath(); c.moveTo(-6, 4); c.lineTo(6, 4); c.lineWidth = 1.8; c.strokeStyle = '#3A4252'; c.stroke();
  c.beginPath(); c.moveTo(-3, -16); c.lineTo(2, -6); c.lineTo(-2, 0); c.lineTo(4, 9); c.lineTo(1, 16); c.lineWidth = 2.2; c.strokeStyle = '#4FD8E0'; c.stroke();
  c.restore();
  armSeams(c);
  // голова
  headOn(c);
  vnAxelFace(c, k);
  c.save(); c.globalAlpha = .3; vnBlushSoft(c, k); c.restore();
  vnEye(c, k, -18, -306, 31, 26, st, false); vnEye(c, k, 38, -305, 29, 25, st, true);
  c.save(); c.globalAlpha = .45; c.strokeStyle = INK; c.lineWidth = 1.6;
  c.beginPath(); c.moveTo(-34, -322); c.quadraticCurveTo(-18, -328, -2, -321); c.moveTo(24, -321); c.quadraticCurveTo(38, -327, 52, -320); c.stroke(); c.restore();
  vnAxelMouth(c, k, st);
  // чёлка: короткая, растрёпанная, с одной длинной прядью
  bangs(c, k, [[-70,-334],[-94,-444],[-30,-490],[14,-484],[82,-478],[110,-410],[90,-336]],
    [[90,-346],[66,-374],[42,-362],[16,-380],[-10,-364],[-38,-380],[-66,-352]],
    [[84,-320],[58,-348],[30,-322],[4,-352],[-24,-338],[-56,-336]], 8);
  lock(c, -60, -352, -74, -326, -70 + sw*.2, -304, -74 + sw*.3, -284, 9, k.hairMid);
  lock(c, 80, -350, 92, -326, 88 + sw*.2, -306, 92 + sw*.3, -288, 8, k.hair);
  // седая прядь
  lock(c, 30, -452, 50, -410, 44, -370, 40, -330, 7, '#D6DAE6');
  c.save(); c.globalAlpha = .45; c.beginPath(); c.moveTo(34, -440); c.quadraticCurveTo(46, -400, 42, -350); c.lineWidth = 2; c.strokeStyle = '#FFFFFF'; c.stroke(); c.restore();
  c.save(); c.globalAlpha = .35; c.strokeStyle = k.hairHi; c.lineWidth = 3;
  for (const [x0, y0, x1, y1] of [[-50,-440,-30,-400],[-14,-458,-4,-414],[64,-448,72,-404]]){ c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x0 + 14, (y0 + y1)/2, x1, y1); c.stroke(); } c.restore();
  vnAxelBrows(c, k, st);
  // шрам через левую бровь
  c.beginPath(); c.moveTo(-42, -356); c.lineTo(-30, -318); c.lineWidth = 3.4; c.strokeStyle = 'rgba(150,64,64,.85)'; c.stroke();
  c.beginPath(); c.moveTo(-41, -346); c.lineTo(-35, -345); c.moveTo(-37, -332); c.lineTo(-31, -331); c.lineWidth = 1.6; c.stroke();
  c.restore();
}
// ---------- ВРАН: гладко зачёсанные чёрные волосы, монокль, бордовый сюртук со стоячим воротником, белый шейный платок
function vnVran(c, st){
  const k = VN.vran, t = st.t;
  headOn(c);
  c.beginPath(); c.moveTo(-70, -392); c.bezierCurveTo(-100, -340, -94, -290, -78, -262); c.lineTo(80, -262); c.bezierCurveTo(100, -300, 104, -350, 90, -390); c.bezierCurveTo(76, -436, 44, -452, 0, -452); c.closePath();
  c.fillStyle = hairShade(c, k, -452, -262); c.fill(); ink(c, 3);
  c.restore();
  torso(c); c.fillStyle = gradV(c, -200, 10, '#6E2232', '#3E101A'); c.fill(); ink(c, 3);
  vnNeck(c, k);
  c.beginPath(); c.moveTo(-70, -176); c.lineTo(-60, -268); c.lineTo(-24, -230); c.lineTo(-20, -170); c.closePath(); c.fillStyle = '#5E1A28'; c.fill(); ink(c, 2.6);
  c.beginPath(); c.moveTo(82, -176); c.lineTo(76, -268); c.lineTo(36, -230); c.lineTo(30, -170); c.closePath(); c.fillStyle = '#5E1A28'; c.fill(); ink(c, 2.6);
  c.beginPath(); c.moveTo(-22, -200); c.quadraticCurveTo(4, -186, 32, -200); c.lineTo(22, -130); c.quadraticCurveTo(4, -110, -12, -130); c.closePath(); c.fillStyle = '#F2EBDD'; c.fill(); ink(c, 2.4);
  c.beginPath(); c.moveTo(-6, -170); c.quadraticCurveTo(4, -160, 16, -170); c.lineWidth = 1.6; c.strokeStyle = 'rgba(43,34,51,.4)'; c.stroke();
  c.beginPath(); c.arc(4, -150, 8, 0, Math.PI*2); c.fillStyle = '#E8C66A'; c.fill(); ink(c, 2); c.beginPath(); c.arc(4, -150, 3.4, 0, Math.PI*2); c.fillStyle = '#8C2E3A'; c.fill();
  c.save(); torso(c); c.clip(); for (let i=0;i<3;i++){ c.beginPath(); c.arc(-40, -90 + i*40, 6, 0, Math.PI*2); c.arc(50, -90 + i*40, 6, 0, Math.PI*2); c.fillStyle = '#C9A15A'; c.fill(); ink(c, 1.6); } c.restore();
  armSeams(c);
  headOn(c);
  vnFaceAll(c, k, st);
  c.beginPath(); c.moveTo(-68, -340); c.bezierCurveTo(-82, -430, -20, -470, 16, -466); c.bezierCurveTo(70, -462, 100, -420, 88, -340);
  c.bezierCurveTo(80, -380, 50, -404, 10, -404); c.bezierCurveTo(-30, -404, -60, -384, -68, -340); c.closePath();
  c.fillStyle = hairShade(c, k, -470, -340); c.fill(); ink(c, 3);
  c.save(); c.globalAlpha = .35; c.strokeStyle = k.hairHi; c.lineWidth = 2.4; for (let i=0;i<5;i++){ c.beginPath(); c.moveTo(-50 + i*24, -400 + Math.abs(i-2)*6); c.quadraticCurveTo(-30 + i*24, -450, 10 + i*16, -462); c.stroke(); } c.restore();
  lock(c, 52, -400, 66, -372, 58, -350, 64, -326, 6, k.hairMid);
  vnBrowsOver(c, st, k);
  c.beginPath(); c.arc(38, -305, 24, 0, Math.PI*2); c.lineWidth = 4; c.strokeStyle = '#D9B24A'; c.stroke(); c.lineWidth = 1.4; c.strokeStyle = INK; c.stroke();
  c.save(); c.globalAlpha = .2 + .1*Math.sin(t*2); c.fillStyle = '#FFF'; c.beginPath(); c.arc(30, -314, 9, 0, Math.PI*2); c.fill(); c.restore();
  c.beginPath(); c.moveTo(62, -300); c.bezierCurveTo(90, -270, 70, -220, 96, -180); c.lineWidth = 1.6; c.strokeStyle = '#D9B24A'; c.stroke();
  c.restore();
}

// ---------- ЭРА (Эрмина): прямая чёлка, коса через плечо, кожаная куртка со стойкой, ремень планшета, тубус с чертежами
function vnEra(c, st){
  const k = VN.era, t = st.t, sw = Math.sin(t*1.3)*3;
  c.save(); c.translate(-108, -236); c.rotate(-.42 + Math.sin(t*.9)*.01); // тубус с чертежами за спиной
  pathRR(c, -16, -96, 32, 150, 12); c.fillStyle = gradV(c, -96, 54, '#7A5A40', '#4E3626'); c.fill(); ink(c, 2.6);
  c.beginPath(); c.ellipse(0, -96, 16, 6, 0, 0, Math.PI*2); c.fillStyle = '#F0E6D0'; c.fill(); ink(c, 2);
  c.strokeStyle = '#C9A15A'; c.lineWidth = 4; for (const yy of [-60, 20]){ c.beginPath(); c.moveTo(-16, yy); c.lineTo(16, yy); c.stroke(); }
  c.restore();
  headOn(c);
  c.beginPath(); c.moveTo(-72, -392); c.bezierCurveTo(-106, -326, -100, -262, -88 + sw*.3, -214); c.lineTo(80, -218);
  c.bezierCurveTo(102, -266, 106, -330, 90, -390); c.bezierCurveTo(76, -440, 42, -458, 4, -458); c.bezierCurveTo(-36, -458, -62, -434, -72, -392); c.closePath();
  c.fillStyle = hairShade(c, k, -458, -214); c.fill(); ink(c, 3);
  c.restore();
  torso(c); c.fillStyle = gradV(c, -200, 10, '#8E6244', '#5A3A28'); c.fill(); ink(c, 3);
  c.save(); torso(c); c.clip(); c.fillStyle = 'rgba(255,230,200,.12)'; c.beginPath(); c.ellipse(-60, -120, 40, 90, -.2, 0, Math.PI*2); c.fill(); c.restore();
  vnNeck(c, k);
  c.beginPath(); c.moveTo(-36, -198); c.lineTo(-30, -166); c.quadraticCurveTo(4, -148, 40, -166); c.lineTo(46, -198); c.quadraticCurveTo(4, -184, -36, -198); c.closePath();
  c.fillStyle = '#6E4630'; c.fill(); ink(c, 2.4);
  c.beginPath(); c.moveTo(4, -156); c.lineTo(4, 12); c.lineWidth = 3; c.strokeStyle = '#3A2618'; c.stroke();
  for (let yy = -146; yy < 10; yy += 14){ c.beginPath(); c.moveTo(0, yy); c.lineTo(8, yy); c.lineWidth = 1.6; c.strokeStyle = '#C9A15A'; c.stroke(); }
  c.beginPath(); c.moveTo(-74, -182); c.lineTo(118, 2); c.lineTo(140, -12); c.lineTo(-50, -196); c.closePath(); c.fillStyle = '#3E2C22'; c.fill(); ink(c, 2.2); // ремень планшета
  pathRR(c, 22, -112, 22, 16, 3); c.fillStyle = '#C9A15A'; c.fill(); ink(c, 1.8);
  // увеличительное стекло на шнурке
  c.beginPath(); c.moveTo(-20, -176); c.quadraticCurveTo(-36, -120, -44, -90); c.lineWidth = 1.6; c.strokeStyle = '#2A1A10'; c.stroke();
  c.beginPath(); c.arc(-46, -76, 13, 0, Math.PI*2); c.fillStyle = 'rgba(190,230,240,.55)'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#B8863A'; c.stroke(); c.lineWidth = 1.6; c.strokeStyle = INK; c.stroke();
  armSeams(c);
  headOn(c);
  vnFaceAll(c, k, st);
  bangs(c, k, [[-70,-336],[-86,-428],[-18,-468],[18,-462],[76,-456],[100,-404],[86,-338]],
    [[86,-344],[60,-350],[34,-348],[8,-350],[-18,-348],[-44,-350],[-66,-344]],
    [[76,-320],[50,-322],[24,-320],[-2,-322],[-28,-320],[-54,-322]], -2);
  vnBrowsOver(c, st, k);
  // коса через правое плечо
  lock(c, 70, -346, 98, -300, 92 + sw*.4, -250, 100 + sw*.5, -196, 13, k.hairMid);
  for (let i=0;i<6;i++){ const y = -300 + i*24, x = 96 + sw*.45*(i/6) + (i%2 ? 3 : -3); c.beginPath(); c.ellipse(x, y, 12, 13, (i%2 ? .5 : -.5), 0, Math.PI*2); c.fillStyle = i%2 ? k.hairMid : k.hair; c.fill(); ink(c, 2.2); }
  pathRR(c, 88 + sw*.5, -164, 18, 10, 3); c.fillStyle = '#C9A15A'; c.fill(); ink(c, 1.8);
  c.beginPath(); c.moveTo(102 + sw*.5, -154); c.quadraticCurveTo(108 + sw*.6, -138, 100 + sw*.6, -126); c.lineTo(110 + sw*.6, -132); c.closePath(); c.fillStyle = k.hair; c.fill(); ink(c, 2);
  // карандаш за ухом
  c.save(); c.translate(-74, -350); c.rotate(-.9); pathRR(c, -4, -30, 8, 46, 2); c.fillStyle = '#E8B84A'; c.fill(); ink(c, 2); c.beginPath(); c.moveTo(-4, 16); c.lineTo(0, 26); c.lineTo(4, 16); c.closePath(); c.fillStyle = '#F0D8B0'; c.fill(); ink(c, 1.6); c.restore();
  c.restore();
}
const VN_DRAW = {aya:vnAya, timofey:vnTimofey, miko:vnMiko, gisa:vnGisa, axel:vnAxel, vran:vnVran, cherry:vnCherry, marta:vnMarta, julia:vnJulia, era:vnEra};
const VN_H = {aya:480, timofey:500, miko:540, gisa:480, axel:480, vran:480, cherry:480, marta:660, julia:480, era:480};
// ---------- сцена новеллы: слоты, затемнение, вход
const vnBuf = {}; function vnCanvas(id){ if (!vnBuf[id]) vnBuf[id] = mk(520, 720); return vnBuf[id]; }
function renderVN(){
  const sc = S.scene; if (!sc) return;
  sc.fade = Math.min(1, (sc.fade || 0) + 1/30);
  const a = sc.fade;
  const g = ctx.createLinearGradient(0, VH*.25, 0, VH); g.addColorStop(0, `rgba(14,10,26,${.15*a})`); g.addColorStop(1, `rgba(14,10,26,${.72*a})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  for (const slot of ['L','R']){
    const s = sc.slots[slot]; if (!s || !s.who) continue;
    if (s.leave){ s.enter = Math.max(0, (s.enter || 0) - 1/14); if (s.enter <= 0){ sc.slots[slot] = null; continue; } }
    else s.enter = Math.min(1, (s.enter || 0) + 1/18);
    const speaking = sc.who === s.who, target = speaking ? 1 : 0; s.lit = s.lit === undefined ? target : approach(s.lit, target, 1/10);
    const buf = vnCanvas(slot), bx = buf.getContext('2d');
    bx.setTransform(1,0,0,1,0,0); bx.clearRect(0, 0, buf.width, buf.height);
    const sc2 = Math.min(1, 640 / VN_H[s.who]);
    bx.translate(260, 720); bx.scale(sc2, sc2);
    const L = sc.lines[sc.i] || {};
    VN_DRAW[s.who](bx, {t:S.time + (slot === 'L' ? 0 : 1.7), blink:((S.time + (slot === 'L' ? 0 : 1.3)) % 4.2) < .13,
      emo: speaking ? (L.e || '') : (s.emo || ''), talk: speaking && sc.shown < (L.t || '').length});
    if (speaking) s.emo = L.e || s.emo;
    bx.setTransform(1,0,0,1,0,0); bx.globalCompositeOperation = 'source-atop'; bx.fillStyle = `rgba(22,16,40,${.5*(1 - s.lit)})`; bx.fillRect(0, 0, buf.width, buf.height); bx.globalCompositeOperation = 'source-over';
    const e = 1 - Math.pow(1 - s.enter, 3), side = slot === 'L' ? -1 : 1;
    const vk = VH/540, x = VW/2 + ((slot === 'L' ? -240 : 240) + side*(1 - e)*120)*vk, scale = (.94 + .06*s.lit) * .86 * vk, y = VH - (20 - (1 - s.lit)*10)*vk - HUD.b;
    ctx.save(); ctx.globalAlpha = e*a; ctx.translate(x, y); ctx.scale(slot === 'L' ? scale : -scale, scale);
    ctx.drawImage(buf, -260, -720); ctx.restore();
  }
}
