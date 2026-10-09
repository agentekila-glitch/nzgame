"use strict";
/* =====================================================================
   Движок: главы, мир, физика, персонажи в мире, сцены-диалоги, журнал, сохранения.
   Отрисовка — в render.js, меню и экраны — в ui.js, сами главы — в chapters/*.js.
   ===================================================================== */
let ROWS = 22, FLOOR = 19, LH = ROWS*T;
const CHAPTERS = [];
// Главы регистрируются из chapters/*.js. Порядок = порядок подключения скриптов.
function chapter(def){ def.index = CHAPTERS.length; CHAPTERS.push(def); }
const curCh = () => CHAPTERS[S.ch];

/* ================= Построение уровня =================
   # камень, = доска (сквозная снизу), o ящик (твёрдый), f ломкая доска, ^ шипы
   P старт, k тень (ходит), m пепельник (летает), s искорка, I находка главы, L фонарь-чекпоинт, E выход */
function makeBuilder(cols, rows){
  const g = Array.from({length:rows}, () => Array(cols).fill(' '));
  const F = rows - 3;
  const out = {g, cols, rows, props:[], npcs:[], trigs:[], movers:[], winds:[], hints:[], deco:[]};
  const h = {
    FLOOR:F, ROWS:rows, COLS:cols, out,
    put(c, r, ch){ if (r>=0 && r<rows && c>=0 && c<cols) g[r][c] = ch; },
    ground(a, b, top=F){ for (let c=a;c<=b;c++) for (let r=top;r<rows;r++) h.put(c, r, '#'); },
    block(a, b, r0, r1){ for (let c=a;c<=b;c++) for (let r=r0;r<=r1;r++) h.put(c, r, '#'); },
    clear(a, b, r0=0, r1=rows-1){ for (let c=a;c<=b;c++) for (let r=r0;r<=r1;r++) h.put(c, r, ' '); },
    plank(a, len, r){ for (let i=0;i<len;i++) h.put(a+i, r, '='); },
    fade(a, len, r){ for (let i=0;i<len;i++) h.put(a+i, r, 'f'); },
    thorns(a, b, r=F-1){ for (let c=a;c<=b;c++) h.put(c, r, '^'); },
    sparks(a, n, r){ for (let i=0;i<n;i++) h.put(a+i, r, 's'); },
    crate(c, rTop, w=2, hgt=2, kind='crate'){ for (let x=0;x<w;x++) for (let y=0;y<hgt;y++) h.put(c+x, rTop+y, 'o'); out.props.push({c, r:rTop, w, h:hgt, kind}); },
    lamp(c, r=F-1){ h.put(c, r, 'L'); },
    find(c, r){ h.put(c, r, 'I'); },
    shade(c, r=F-1){ h.put(c, r, 'k'); },
    moth(c, r){ h.put(c, r, 'm'); },
    start(c, r=F-1){ h.put(c, r, 'P'); },
    exit(c, r=F-1){ h.put(c, r, 'E'); },
    walls(){ h.block(0, 1, 0, rows-1); h.block(cols-2, cols-1, 0, rows-1); },
    // NPC: id — имя для сцен, who — кто рисуется (aya/timofey/…/boltik), r — ряд опоры (низ ног)
    npc(id, who, c, r=F, o={}){ out.npcs.push(Object.assign({id, who, x:c*T + 16, y:r*T, face:-1, hidden:false, barks:null}, o)); },
    // Сцена запускается, когда игрок проходит колонку c (по умолчанию — стоя на земле)
    trig(c, scene, o={}){ out.trigs.push(Object.assign({x:c*T, scene, ground:true, done:false}, o)); },
    // Движущаяся платформа длиной len клеток: из (c,r) на (dc,dr) клеток туда-обратно за period секунд
    mover(c, r, len, dc, dr, period=4, phase=0){ out.movers.push({x0:c*T, y0:r*T, x1:(c+dc)*T, y1:(r+dr)*T, w:len*T, h:14, period, t:phase*period, x:c*T, y:r*T, dx:0, dy:0}); },
    // Восходящий поток ветра в прямоугольнике колонок/рядов
    wind(c0, c1, r0, r1){ out.winds.push({x:c0*T, y:r0*T, w:(c1-c0+1)*T, h:(r1-r0+1)*T}); },
    // Табличка-подсказка. Метки {lr} {jump} {down} {sprint} заменяются на клавиши или экранные кнопки.
    hint(c, r, text, o={}){ out.hints.push(Object.assign({c, r, t:text, a:0}, o)); },
    // Декорации (не мешают движению): вывески, лавки, мастерская и т.п. — рисуются темой
    deco(kind, c, r=F, o={}){ out.deco.push(Object.assign({kind, x:c*T, y:r*T}, o)); }
  };
  extendBuilder(h, out, F); // механики главы 5 (mech.js)
  return h;
}

/* ================= Мир ================= */
const SOLID = new Set(['#','o','g']); // g — решётка или каменная створка (глава 6)
let S = null;
function parseWorld(ch){
  const h = makeBuilder(ch.cols, ch.rows || 22);
  ch.build(h);
  const {g, cols, rows} = h.out;
  ROWS = rows; FLOOR = rows - 3; LH = ROWS*T;
  const W = {grid:g, cols, rows, w:cols*T, h:rows*T, props:h.out.props, kl:[], moths:[], drops:[], finds:[], lamps:[], fades:{}, door:null, start:null,
    npcs:h.out.npcs, trigs:h.out.trigs, movers:h.out.movers, winds:h.out.winds, deco:h.out.deco, hints:h.out.hints};
  for (let r=0;r<rows;r++) for (let c=0;c<cols;c++){
    const chr = g[r][c], x = c*T, y = r*T;
    if ('PkmsILE'.includes(chr)) g[r][c] = ' ';
    if (chr === 'P') W.start = {x:x+4, y:y+T-44};
    if (chr === 'k') W.kl.push({x:x+3, y:y+8, w:26, h:24, vx:0, vy:0, dir:-1, speed:rnd(48,66), t:Math.random()*5, dead:0, onGround:false});
    if (chr === 'm') W.moths.push({x0:x, y0:y, x, y, w:26, h:20, t:rnd(0,6), dead:0});
    if (chr === 's') W.drops.push({x:x+16, y:y+16, t:Math.random()*6, got:false});
    if (chr === 'I') W.finds.push({x:x+16, y:y+T, t:Math.random()*6, got:false, id:W.finds.length});
    if (chr === 'L') W.lamps.push({x:x+16, y:y+T, lit:false, glow:0, out:0});
    if (chr === 'E') W.door = {x:x-8, y:y+T-96, w:64, h:96};
    if (chr === 'f') W.fades[c+','+r] = {c, r, t:0, state:'ok', back:0};
  }
  parseMech(W, h.out);
  W.lamps.sort((a,b) => a.x - b.x);
  if (W.lamps.length && !ch.lampsStartOut) W.lamps[0].lit = true;
  if (ch.litBefore) for (const lp of W.lamps) if (lp.x < ch.litBefore*T) lp.lit = true;
  for (const n of W.npcs){ n.t = Math.random()*5; n.sayT = 0; n.say = ''; n.state = 'idle'; n.vx = 0; n.alpha = n.hidden ? 0 : 1; n.phase = 0; }
  return W;
}
const tileAt = (c,r) => (r<0 || r>=ROWS || c<0 || c>=S.W.cols) ? ' ' : S.W.grid[r][c];
const solid = (c,r) => (c<0 || c>=S.W.cols) ? true : (r>=0 && r<ROWS && SOLID.has(S.W.grid[r][c]));
const fadeOk = (c,r) => { const f = S.W.fades[c+','+r]; return f && f.state !== 'gone'; };
const oneWay = (c,r) => { const t = tileAt(c,r); return t === '=' || (t === 'f' && fadeOk(c,r)); };
const overlap = (a,b) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
function colsHit(x, w, r){ const a = Math.floor(x/T), b = Math.floor((x+w-1)/T), o = []; for (let c=a;c<=b;c++) if (solid(c,r)) o.push(c); return o; }
function moveEntity(e, dt, allowOneWay, isPlayer){
  e.hitWall = 0; e.x += e.vx*dt;
  const r0 = Math.floor(e.y/T), r1 = Math.floor((e.y+e.h-1)/T);
  if (e.vx > 0){ const c = Math.floor((e.x+e.w)/T); for (let r=r0;r<=r1;r++) if (solid(c,r)){ e.x = c*T - e.w - .001; e.vx = 0; e.hitWall = 1; break; } }
  else if (e.vx < 0){ const c = Math.floor(e.x/T); for (let r=r0;r<=r1;r++) if (solid(c,r)){ e.x = (c+1)*T + .001; e.vx = 0; e.hitWall = -1; break; } }
  const prevBottom = e.y + e.h; e.y += e.vy*dt; e.onGround = false; e.groundTile = null;
  if (e.vy > 0){
    const r = Math.floor((e.y+e.h)/T), a = Math.floor(e.x/T), b = Math.floor((e.x+e.w-1)/T);
    for (let c=a;c<=b;c++){ if (solid(c,r) || (allowOneWay && oneWay(c,r) && prevBottom <= r*T + 2)){ e.y = r*T - e.h; e.vy = 0; e.onGround = true; e.groundTile = [c,r]; break; } }
  } else if (e.vy < 0){
    const r = Math.floor(e.y/T), hits = colsHit(e.x, e.w, r);
    if (hits.length){
      let fixed = false;
      if (isPlayer) for (let d=1; d<=CORNER && !fixed; d++) for (const sg of [-1,1]){ const nx = e.x + sg*d;
        if (!colsHit(nx, e.w, r).length){ let body = false; for (let rr=r+1; rr<=Math.floor((e.y+e.h-1)/T); rr++) if (colsHit(nx, e.w, rr).length) body = true;
          if (!body){ e.x = nx; fixed = true; break; } } }
      if (!fixed){ e.y = (r+1)*T; e.vy = 0; if (isPlayer) S.P.headBonk = .1; }
    }
  }
  return prevBottom;
}
function newState(chIndex){
  const ch = CHAPTERS[chIndex], W = parseWorld(ch);
  const S0 = {ch:chIndex, W, mode:'title', time:0, play:0, cam:{x:0, y:W.h-VH, kx:0, ky:0, kvy:0}, particles:[], shake:0, hitstop:0, flash:0, white:0,
    hp:3, drops:0, finds:0, faints:0, scene:null, flags:{}, wave:null, canDouble:!!ch.canDouble, beat:0, chase:null, fadeIn:0};
  const st = W.start || {x:4*T, y:(FLOOR-1)*T};
  S0.P = {x:st.x, y:st.y, w:24, h:44, vx:0, vy:0, face:1, onGround:true, coyote:0, jumpBuf:0, jumping:false, doubled:false, mover:null,
    inv:0, knock:0, drop:0, phase:0, sx:1, sy:1, svx:0, svy:0, sway:{x:0,y:0}, lastFoot:0, checkpoint:{x:st.x, y:st.y}, headBonk:0, inWind:false};
  S0.V = {x:st.x+30, y:st.y-10, vx:0, vy:0, t:0, scared:0, hidden:false};
  return S0;
}
const npc = id => S.W.npcs.find(n => n.id === id);

/* ================= Частицы ================= */
function burst(x, y, n, colors, o={}){
  for (let i=0;i<n;i++){ const a = o.angle !== undefined ? o.angle + rnd(-(o.spread||.6), o.spread||.6) : rnd(0, Math.PI*2), sp = rnd(o.min||60, o.max||240);
    S.particles.push({x, y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp, life:rnd(o.lmin||.35, o.lmax||.8), t:0, c:pick(colors), s:rnd(o.smin||2, o.smax||4.5), g:o.g ?? 700, kind:o.kind||'dot', rot:rnd(0,6), vr:rnd(-8,8), drag:o.drag||0}); }
}
function floatText(x, y, txt, color){ S.particles.push({x, y, vx:0, vy:-55, life:1.1, t:0, c:color, txt, g:0, kind:'text'}); }
function dust(x, y, n, dir=0){ burst(x, y, n, ['rgba(232,222,206,.8)','rgba(200,190,176,.7)'], {angle: dir ? (dir > 0 ? -.3 : Math.PI+.3) : -Math.PI/2, spread: dir ? .6 : 1.4, min:30, max:130, g:-40, lmin:.25, lmax:.5, smin:2.5, smax:5, drag:3}); }
function embers(x, y, n){ burst(x, y, n, ['#FFD08A','#F2B45A','#FF8A3C','#FFF2C4'], {angle:-Math.PI/2, spread:1.2, min:40, max:180, g:-80, lmin:.5, lmax:1.1, smin:1.6, smax:3.2, drag:1.5}); }
function smokePuff(x, y, n=18){ burst(x, y, n, ['rgba(70,64,90,.75)','rgba(110,104,130,.6)','rgba(40,36,56,.8)'], {min:20, max:120, g:-30, lmin:.5, lmax:1, smin:5, smax:11, drag:2.5}); }

/* ================= Отклик ================= */
function hitstop(t){ S.hitstop = Math.max(S.hitstop, t); }
function camKick(y, x=0){ if (REDUCED || !SET.shake) return; S.cam.kvy += y*60; S.cam.kx += x; }
function squash(sx, sy){ S.P.sx = sx; S.P.sy = sy; S.P.svx = 0; S.P.svy = 0; }

/* ================= Урон, обморок, возврат к фонарю ================= */
function hurt(fromX){
  const p = S.P; if (p.inv > 0 || p.safe > 0 || S.mode !== 'play') return;
  S.hp--; p.inv = 1.4; p.vy = -440; p.knock = .16; p.vx = (p.x + p.w/2 < fromX ? -1 : 1) * 300; p.jumping = false; p.mover = null;
  hitstop(HITSTOP_HURT); S.shake = .25; S.flash = .18; sfx.hurt(); buzz(40); squash(1.25, .78);
  embers(p.x+p.w/2, p.y+20, 12);
  if (S.hp <= 0) faint();
}
function faint(){ S.faints++; S.mode = 'faint'; S.fT = 0; sfx.faint(); }
function respawn(){
  const p = S.P; p.x = p.checkpoint.x; p.y = p.checkpoint.y; p.vx = 0; p.vy = 0; p.inv = 1.2; p.mover = null; S.hp = 3; S.mode = 'play';
  if (S.wave) S.wave.x = Math.min(S.wave.x, p.x - 460);
  if (S.chase && S.chase.reset) S.chase.reset();
  S.cam.x = clamp(p.x - VW*.4, 0, S.W.w - VW); S.cam.y = clamp(p.y - VH*.6, 0, S.W.h - VH); S.cam.vx = S.cam.vy = S.cam.look = 0;
}
function fallOut(){ const p = S.P; S.hp--; sfx.hurt(); buzz(40); S.flash = .2;
  if (S.hp <= 0){ faint(); return; }
  p.x = p.checkpoint.x; p.y = p.checkpoint.y; p.vx = 0; p.vy = 0; p.inv = 1.3; p.mover = null; if (S.wave) S.wave.x = Math.min(S.wave.x, p.x - 460); }

/* ================= Игрок ================= */
function updatePlayer(dt){
  const p = S.P;
  const dir = (isRight()?1:0) - (isLeft()?1:0), top = isSprint() || lastInput === 'touch' || (lastInput === null && touchUI()) ? SPRINT : WALK;
  if (p.knock > 0) p.knock -= dt;
  else {
    let acc = dir === 0 ? (p.onGround ? DECEL : ACC_AIR*.5) : (p.onGround ? ACC_GROUND : ACC_AIR);
    const turning = dir && Math.sign(p.vx) === -dir && Math.abs(p.vx) > 120;
    if (turning) acc *= SKID;
    if (turning && p.onGround && !p.skidding){ p.skidding = true; sfx.skid(); dust(p.x + p.w/2, p.y + p.h, 5, -dir); }
    if (!turning) p.skidding = false;
    p.vx = approach(p.vx, dir*top, acc*dt);
  }
  if (dir) p.face = dir;
  if (jumpQueued){ p.jumpBuf = SET.assist ? ASSIST.buffer : BUFFER; jumpQueued = false; }
  p.jumpBuf -= dt;
  p.coyote = p.onGround ? (SET.assist ? ASSIST.coyote : COYOTE) : p.coyote - dt;
  if (p.jumpBuf > 0 && p.coyote > 0){
    p.vy = -JUMP; p.jumpBuf = 0; p.coyote = 0; p.jumping = true; p.doubled = false; p.mover = null;
    sfx.jump(); squash(.74, 1.3); dust(p.x + p.w/2, p.y + p.h, 6);
  } else if (p.jumpBuf > 0 && !p.onGround && p.coyote <= 0 && S.canDouble && !p.doubled){
    p.vy = -DJUMP; p.jumpBuf = 0; p.doubled = true; p.jumping = true;
    sfx.djump(); squash(.8, 1.22);
    burst(p.x + p.w/2, p.y + p.h - 4, 14, ['#FFB04A','#FFD08A','#FFF'], {angle:Math.PI/2, spread:1.2, min:60, max:200, g:200, lmax:.5});
  }
  const cut = SET.assist ? ASSIST.cut : JUMP_CUT; if (p.jumping && !isJump() && p.vy < -cut) p.vy = -cut;
  if (p.vy >= 0) p.jumping = false;
  // ветер: поток снизу поднимает вверх
  p.inWind = false;
  p.etherOut = Math.max(0, (p.etherOut || 0) - dt);
  for (const w of S.W.winds) if (overlap(p, w)){
    if (w.ether){ // эфирный поток Первого Огня (глава 6)
      if (isDown() && !p.onGround) p.etherOut = .45; if (p.etherOut > 0) continue;
      p.inWind = true; p.doubled = false; p.mover = null; p.jumping = false;
      p.vy = approach(p.vy, -(isJump() ? 360 : 256), (p.vy > 0 ? 6500 : 2400)*dt); // падающую — подхватывает сразу
      if (w.dx) p.vx = approach(p.vx, w.dx*300 + dir*60, 1600*dt);
      if (Math.random() < .35) S.particles.push({x:p.x + rnd(-8, 32), y:p.y + p.h, vx:w.dx*120 + rnd(-10,10), vy:-rnd(160,260), life:.6, t:0, c:pick(['rgba(150,220,240,.85)','rgba(255,214,140,.85)']), s:2.2, g:0, kind:'dot'});
      break; }
    p.inWind = true; p.vy = Math.max(-600, p.vy - 4200*dt); p.doubled = false; p.mover = null;
    if (Math.random() < .3) S.particles.push({x:p.x + rnd(-10, 34), y:p.y + p.h + 6, vx:rnd(-10,10), vy:-rnd(220,360), life:.5, t:0, c:'rgba(236,244,255,.75)', s:2, g:0, kind:'streak'}); }
  if (!p.inWind){ p.vy += G * dt * (p.vy > 0 ? FALL_MULT : 1); p.vy = Math.min(p.vy, MAX_FALL); }
  if (isDown() && p.onGround) p.drop = .2; else p.drop = Math.max(0, p.drop - dt);
  // едем на движущейся платформе
  if (p.mover && p.mover.off) p.mover = null; // эхо Мглы растаяло под ногами
  if (p.mover){ p.x += p.mover.dx; p.y = p.mover.y - p.h; if (p.vy > 0) p.vy = 0; }
  const was = p.onGround, fallV = p.vy;
  const prevBottom = moveEntity(p, dt, p.drop <= 0, true);
  // приземление на движущуюся платформу (сквозная снизу)
  if (p.mover && (p.drop > 0 || p.x + p.w < p.mover.x || p.x > p.mover.x + p.mover.w)) p.mover = null;
  if (!p.onGround && p.vy >= 0 && p.drop <= 0){
    for (const m of S.W.movers){ if (m.off) continue;
      if (p.x + p.w > m.x + 2 && p.x < m.x + m.w - 2 && prevBottom <= m.y + 8 + Math.max(0, m.dy) && p.y + p.h >= m.y - 1){
        p.y = m.y - p.h; p.vy = 0; p.onGround = true; p.mover = m; break; }
    }
  } else if (p.onGround && !p.mover) p.mover = null;
  if (p.mover) p.onGround = true;
  if (!was && p.onGround){
    const h = clamp((fallV - 300) / 800, 0, 1);
    p.doubled = false;
    // хрупкая полка не выдерживает тяжёлого приземления
    if (fallV > 640 && p.groundTile){ const [gc, gr] = p.groundTile; let broke = false;
      for (let dc=-1; dc<=1; dc++){ const f = S.W.fades[(gc+dc)+','+gr]; if (f && f.brittle && f.state === 'ok'){ f.state = 'gone'; f.perm = true; broke = true;
        burst(f.c*T + 16, f.r*T + 6, 12, ['#C9B79A','#9A8466','#6E5A44'], {angle:Math.PI/2, spread:1, min:20, max:140, g:600, kind:'paper'}); } }
      if (broke){ sfx.crumble(); camKick(4); p.onGround = false; p.groundTile = null; } }
    if (fallV > 260){ squash(1 + .32*h + .08, 1 - .28*h - .06); sfx.land(h); dust(p.x + p.w/2, p.y + p.h, 4 + Math.round(h*8)); camKick(2 + h*5); if (h > .6) buzz(18); }
    p.lastFoot = p.phase;
  }
  if (p.headBonk > 0){ p.headBonk = 0; squash(1.18, .86); camKick(-2); sfx.land(.1); }
  const sp = Math.abs(p.vx);
  if (p.onGround && sp > 30){
    const prev = p.phase; p.phase += sp * dt * .052;
    if (Math.floor(prev / Math.PI) !== Math.floor(p.phase / Math.PI)){ sfx.step(sp < 200); if (Math.random() < .6) dust(p.x + p.w/2 - p.face*6, p.y + p.h, 2, -p.face); }
  } else if (p.onGround) p.phase = Math.round(p.phase / Math.PI) * Math.PI;
  const k = 380, dmp = 22;
  p.svx += (-(p.sx - 1)*k - p.svx*dmp) * dt; p.svy += (-(p.sy - 1)*k - p.svy*dmp) * dt; p.sx += p.svx*dt; p.sy += p.svy*dt;
  if (!p.onGround && !REDUCED){ const st = clamp(-p.vy/2600, -.12, .14); p.sy = lerp(p.sy, 1 + st, .15); p.sx = lerp(p.sx, 1 - st*.7, .15); }
  p.sway.x = lerp(p.sway.x, -p.vx*.028, .12); p.sway.y = lerp(p.sway.y, -p.vy*.008, .12);
  p.inv = Math.max(0, p.inv - dt); p.safe = Math.max(0, (p.safe || 0) - dt);
  if (p.y > S.W.h + 40){ fallOut(); return; }
  // шипы
  const c0 = Math.floor(p.x/T), c1 = Math.floor((p.x+p.w)/T), r0 = Math.floor(p.y/T), r1 = Math.floor((p.y+p.h)/T);
  for (let r=r0;r<=r1;r++) for (let c=c0;c<=c1;c++) if (tileAt(c,r) === '^' && overlap(p, {x:c*T+3, y:r*T+12, w:T-6, h:T-12})) hurt(c*T + T/2);
  // ломкие доски под ногами
  if (p.onGround && p.groundTile && tileAt(p.groundTile[0], p.groundTile[1]) === 'f'){
    const [gc, gr] = p.groundTile; for (let dc=-2; dc<=2; dc++){ const f = S.W.fades[(gc+dc)+','+gr]; if (f && f.state === 'ok' && !f.brittle && (dc === 0 || tileAt(gc+dc, gr) === 'f' && Math.abs(dc) <= 1)){ f.state = 'shake'; f.t = 0; } }
  }
  // фонари
  for (const lp of S.W.lamps){
    if (lp.lit && !lp.cp && Math.abs(p.x + p.w/2 - lp.x) < 36 && Math.abs(p.y + p.h - lp.y) < 60){ lp.cp = true; p.checkpoint = {x:lp.x - 12, y:lp.y - p.h}; }
    if (!lp.lit && !lp.locked && Math.abs(p.x + p.w/2 - lp.x) < 36 && Math.abs(p.y + p.h - lp.y) < 60){
      lp.lit = true; lp.cp = true; lp.glow = 1; p.checkpoint = {x:lp.x - 12, y:lp.y - p.h}; sfx.lamp();
      embers(lp.x, lp.y - 70, 16);
      floatText(lp.x, lp.y - 104, 'Фонарь зажжён!', '#FFE3A8'); saveGame();
      const ch = curCh(); if (ch.onLamp) ch.onLamp(S.W.lamps.indexOf(lp));
    }
  }
  // искорки и находки
  for (const d of S.W.drops) if (!d.got && Math.abs(p.x + p.w/2 - d.x) < 22 && Math.abs(p.y + p.h/2 - d.y) < 30){
    d.got = true; S.drops++; sfx.drop(); embers(d.x, d.y, 6); }
  for (const f of S.W.finds) if (!f.got && Math.abs(p.x + p.w/2 - f.x) < 26 && Math.abs(p.y + p.h - f.y) < 42){
    f.got = true; S.finds++; sfx.find(); if (curCh().find === 'boltik') sfx.babble(); saveGame(true); hitstop(HITSTOP_PICK); embers(f.x, f.y - 20, 12);
    const fk = FIND_KINDS[curCh().find] || FIND_KINDS.letter;
    floatText(f.x, f.y - 64, `${f.name || fk.one} · ${S.finds}/${S.W.finds.length}`, '#FFF4D8'); }
}

/* ================= Мир: враги, доски, платформы, NPC, Искра ================= */
function stompBounce(p){ p.vy = isJump() ? -820 : -500; p.jumping = isJump(); p.doubled = false; p.mover = null;
  hitstop(HITSTOP_STOMP); sfx.stomp(); squash(1.3, .74); camKick(3); buzz(15); }
function updateWorld(dt, interact){
  const W = S.W, p = S.P;
  if (S.mode !== 'dialog') for (const f of Object.values(W.fades)){
    if (f.state === 'shake'){ f.t += dt; if (f.t > (f.slow ? 1.5 : .55)){ f.state = 'gone'; f.t = 0; sfx.crumble();
      burst(f.c*T + 16, f.r*T + 6, 10, ['#C9B79A','#9A8466','#6E5A44'], {angle:Math.PI/2, spread:1, min:20, max:120, g:600, kind:'paper'}); } }
    else if (f.state === 'gone' && !f.perm){ f.t += dt; if (f.t > 2.8 && !(overlap(p, {x:f.c*T, y:f.r*T - 4, w:T, h:T}))){ f.state = 'ok'; f.back = 1; } }
    f.back = Math.max(0, f.back - dt*2);
  }
  for (const m of W.movers){
    if (m.lever !== undefined){ moveShelf(m, dt); continue; }
    if (m.cw || m.cwB){ moveCw(m, dt); continue; }
    if (m.heat !== undefined || m.echo){ moveCh7(m, dt); continue; }
    m.t += dt; const k = (1 - Math.cos(m.t/m.period*Math.PI*2))/2, nx = lerp(m.x0, m.x1, k), ny = lerp(m.y0, m.y1, k);
    m.dx = nx - m.x; m.dy = ny - m.y; m.x = nx; m.y = ny;
  }
  for (const k of W.kl){
    k.t += dt;
    if (k.dead){ k.dead += dt; continue; }
    if (k.stun > 0) k.stun -= dt; const stunned = k.stun > 0; // колокол оглушил — стоит и не кусается
    if (S.mode === 'dialog' || stunned){ k.vx = 0; k.vy += G*dt; moveEntity(k, dt, true, false); if (S.mode === 'dialog') continue; } // во время разговора тени и жуки стоят на месте
    else { k.vx = k.dir*k.speed; k.vy += G*dt; moveEntity(k, dt, true, false); }
    if (k.hitWall) k.dir *= -1;
    if (k.onGround && !stunned){ const ax = k.dir > 0 ? k.x + k.w + 2 : k.x - 2, ac = Math.floor(ax/T), b = tileAt(ac, Math.floor((k.y+k.h+4)/T)), fr = tileAt(ac, Math.floor((k.y+k.h-4)/T));
      if ((!SOLID.has(b) && b !== '=') || fr === '^') k.dir *= -1; }
    if (interact && overlap(p, k)){
      if (p.vy > 40 && (p.y + p.h) - k.y < 18){ k.dead = .001; stompBounce(p); embers(k.x + 13, k.y + 10, 10);
        burst(k.x + 13, k.y + 14, 12, ['#3A3050','#5A4E78','#8A7EA8'], {g:300, min:80, max:220}); floatText(k.x + 13, k.y - 10, curCh().theme === 'clock' ? 'Механизм поломан!' : 'Тень рассеялась!', '#FFE3A8'); }
      else if (!stunned) hurt(k.x + k.w/2);
    }
  }
  W.kl = W.kl.filter(k => !k.dead || k.dead < .5);
  for (const m of W.moths){
    if (m.dead){ m.dead += dt; continue; } if (m.stun > 0) m.stun -= dt; if (S.mode !== 'dialog' && !(m.stun > 0)) m.t += dt;
    m.x = m.x0 + Math.sin(m.t*1.1)*90; m.y = m.y0 + Math.sin(m.t*2.2)*44;
    if (interact && overlap(p, m)){
      if (p.vy > 40 && (p.y + p.h) - m.y < 16){ m.dead = .001; stompBounce(p); embers(m.x + 13, m.y + 10, 8); }
      else if (!(m.stun > 0)) hurt(m.x + m.w/2);
    }
  }
  W.moths = W.moths.filter(m => !m.dead || m.dead < .3);
  for (const d of W.drops) d.t += dt;
  for (const f of W.finds) f.t += dt;
  for (const lp of W.lamps){ lp.glow = Math.max(0, lp.glow - dt*.7); lp.out = Math.max(0, lp.out - dt*.5); }
  updateNpcs(dt);
  // Искра: летит за Аей по пружине. Если рядом Странник — прячется за спину.
  const v = S.V; v.t += dt;
  const ax = npc('axel'), near = ax && !ax.hidden && ax.alpha > .5 && Math.abs(ax.x - (p.x + p.w/2)) < 260;
  v.scared = approach(v.scared, near ? 1 : 0, dt*2);
  const behind = 26 + v.scared*6, aw = v.away;
  const tx = aw ? aw.x + Math.sin(v.t*3)*4 : p.x + p.w/2 - p.face*behind + Math.sin(v.t*1.7)*8*(1 - v.scared);
  const ty = aw ? aw.y + Math.sin(v.t*2)*6 : p.y - 18 + v.scared*22 + Math.sin(v.t*2.6)*6*(1 - v.scared*.7);
  v.vx += ((tx - v.x)*26 - v.vx*7) * dt; v.vy += ((ty - v.y)*26 - v.vy*7) * dt; v.x += v.vx*dt; v.y += v.vy*dt;
  if (Math.random() < .25 && !v.hidden) S.particles.push({x:v.x, y:v.y + 6, vx:rnd(-10,10), vy:rnd(-30,-10), life:.6, t:0, c:'rgba(255,190,110,.8)', s:2, g:-20, kind:'dot'});
}
// Земля под NPC: верх ближайшей опоры в колонке x рядом с уровнем ног (или null — там яма)
function npcGround(x, y){
  const c = Math.floor(x/T), r0 = Math.floor(y/T);
  for (let r = Math.max(1, r0 - 3); r < Math.min(ROWS, r0 + 8); r++) if ((solid(c, r) || oneWay(c, r)) && !solid(c, r - 1)) return r*T;
  return null;
}
// Тело NPC (ноги в точке x,y) задевает стену или потолок?
const NPC_W = 9, NPC_H = 58;
function npcHits(x, y){
  const c0 = Math.floor((x - NPC_W)/T), c1 = Math.floor((x + NPC_W)/T), r0 = Math.max(0, Math.floor((y - NPC_H)/T)), r1 = Math.floor((y - 2)/T);
  for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++) if (solid(c, r)) return true;
  return false;
}
// Подбирает высоту прыжка, при которой дуга не проходит сквозь стены (null — так не перепрыгнуть)
// Точка дуги прыжка: вверх — сначала подъём, потом шаг вперёд; вниз — сначала шаг с края, потом падение
function hopPos(x0, y0, x1, y1, h, k){
  const kx = y1 < y0 - T*1.5 ? k*k : y1 > y0 + T*1.5 ? 1 - (1 - k)*(1 - k) : k;
  return [x0 + (x1 - x0)*kx, y0 + (y1 - y0)*k - h*4*k*(1 - k)];
}
function npcArc(x0, y0, x1, y1, base){
  for (const h of [base, base + 30, base + 60, base + 100, base + 150, base + 210]){
    let ok = true; for (let k = .04; k < 1 && ok; k += .04){ const q = hopPos(x0, y0, x1, y1, h, k); if (npcHits(q[0], q[1])) ok = false; }
    if (ok) return h;
  }
  return null;
}
// Шаг NPC по земле: на ровном идёт, на уступах и над ямами прыгает, сквозь стены не проходит
function npcMove(n, dx){
  if (!dx || n.hop) return;
  const nx = n.x + dx, gy = npcGround(nx, n.y);
  if (gy !== null && Math.abs(gy - n.y) <= T*.5 && !npcHits(nx, gy)){ n.x = nx; n.y = gy; return; }
  const dir = Math.sign(dx), up = n.who === 'julia' ? 9 : 3.5; // Жуля — акробатка, запрыгивает высоко
  for (let i = 1; i <= 8; i++){ // ищем, куда можно приземлиться впереди
    const lx = Math.floor(nx/T)*T + T/2 + dir*i*T, ly = npcGround(lx, n.y) ?? (up > 4 ? npcGround(lx, n.y - T*6) : null);
    if (ly === null || ly - n.y < -T*up || npcHits(lx, ly)) continue;
    const h = npcArc(n.x, n.y, lx, ly, 30 + Math.max(0, n.y - ly)); if (h === null) continue;
    n.hop = {x0:n.x, y0:n.y, x1:lx, y1:ly, t:0, d:clamp(Math.abs(lx - n.x)/Math.max(n.speed, 160), .3, .75), h};
    n.air = true; return;
  }
  // Дальше дороги нет: уходящий персонаж тихо растворяется, а идущий к цели — появляется уже на месте
  if (n.state === 'leave') n.hidden = true;
  else if (n.state === 'walk'){ const gy = npcGround(n.tx, n.y); if (gy !== null){ n.x = n.tx; n.y = gy; n.alpha = 0; } n.state = 'idle'; // под целью пусто — остаёмся, где стоим
    if (n.onArrive){ const f = n.onArrive; n.onArrive = null; f(); } }
}
function npcHop(n, dt){
  const h = n.hop; h.t += dt; const k = Math.min(1, h.t/h.d);
  const q = hopPos(h.x0, h.y0, h.x1, h.y1, h.h, k); n.x = q[0]; n.y = q[1]; n.phase += dt*10;
  if (k >= 1){ n.hop = null; n.air = false; n.y = h.y1;
    if (n.state === 'walk' && Math.abs(n.tx - n.x) < 1){ n.state = 'idle'; if (n.onArrive){ const f = n.onArrive; n.onArrive = null; f(); } } }
}
function updateNpcs(dt){
  const p = S.P;
  for (const n of S.W.npcs){
    n.t += dt; n.sayT -= dt;
    n.alpha = approach(n.alpha, n.hidden ? 0 : 1, dt*3);
    if (n.hidden) continue;
    if (n.hop){ npcHop(n, dt); continue; }
    if (n.state === 'walk'){ const dx = n.tx - n.x; n.face = Math.sign(dx) || n.face; const st = Math.min(Math.abs(dx), n.speed*dt); npcMove(n, Math.sign(dx)*st); n.phase += dt*n.speed*.05;
      if (Math.abs(n.tx - n.x) < 1 && !n.hop){ n.state = 'idle'; if (n.onArrive){ const f = n.onArrive; n.onArrive = null; f(); } } }
    else if (n.state === 'leave'){ npcMove(n, n.face*n.speed*dt); n.phase += dt*16; if (Math.abs(n.x - (p.x + p.w/2)) > VW) n.hidden = true; }
    else if (n.state === 'idle' && n.lookAt !== false && n.who !== 'boltik') n.face = (p.x + p.w/2) < n.x ? -1 : 1;
    // реплики в мире, когда игрок рядом
    if (n.barks && S.mode === 'play' && n.sayT < -3 && Math.abs(n.x - (p.x + p.w/2)) < 170 && Math.abs(n.y - (p.y + p.h)) < 120){
      n.say = n.barks[(n.barkI = ((n.barkI ?? -1) + 1) % n.barks.length)]; n.sayT = 2.6;
      if (n.who === 'boltik') sfx.babble(); else if (n.who === 'miko') sfx.coo();
    }
  }
}

/* ================= Погоня (NPC убегает по точкам маршрута) ================= */
function startChase(cfg){
  const n = npc(cfg.npc); n.hidden = false; n.state = 'chase';
  const C = S.chase = Object.assign({i:0, hop:null, t:0}, cfg);
  const pt = C.path[0]; n.x = pt[0]*T + 16; n.y = pt[1]*T;
  C.reset = () => { const p = S.P; let i = C.path.findIndex(q => q[0]*T > p.x + 80); if (i < 0) i = C.path.length - 1; C.i = i; C.hop = null; n.x = C.path[i][0]*T + 16; n.y = C.path[i][1]*T; };
}
function updateChase(dt){
  const C = S.chase; if (!C) return; const n = npc(C.npc), p = S.P;
  if (C.hop){ const h = C.hop; h.t += dt; const k = clamp(h.t / h.dur, 0, 1);
    const q = hopPos(h.from.x, h.from.y, h.to.x, h.to.y, h.arc, k); n.x = q[0]; n.y = q[1]; n.phase += dt*14; n.air = k < 1;
    if (k >= 1){ C.hop = null; n.air = false; dust(n.x, n.y, 5); } return; }
  if (S.mode !== 'play') return;
  const last = C.i >= C.path.length - 1, dx = n.x - (p.x + p.w/2), dy = n.y - (p.y + p.h);
  n.face = dx > 0 ? -1 : 1;
  if (last){ if (Math.abs(dx) < 72 && Math.abs(dy) < 70 && p.onGround){ S.chase = null; n.state = 'idle'; startScene(C.scene); } return; }
  if (Math.abs(dx) < 240 && Math.abs(dy) < 300 || dx < 0){
    const nx = C.path[C.i+1], from = {x:n.x, y:n.y}, to = {x:nx[0]*T + 16, y:nx[1]*T};
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const base = 40 + Math.max(0, from.y - to.y) * .9;
    C.hop = {from, to, t:0, dur:clamp(dist/430, .38, 1.1), arc:npcArc(from.x, from.y, to.x, to.y, base) ?? base}; C.i++;
    n.face = to.x >= from.x ? 1 : -1;
    if (C.taunts && (Math.random() < .55 || C.i < 3)){ n.say = C.taunts[(C.i + Math.floor(Math.random()*3)) % C.taunts.length]; n.sayT = 1.8; if (Math.random() < .5) sfx.giggle(); }
    sfx.jump();
  }
}

/* ================= Мгла (поднимается слева и гонит вперёд) ================= */
function startMist(o={}){ S.wave = {x:S.P.x - (o.back || 640), speed:o.speed || 120, max:o.max || 205, t:0}; }
function updateWave(dt){
  const w = S.wave, p = S.P; if (!w) return;
  w.speed = Math.min(w.max, w.speed + dt*4); const dist = p.x - w.x;
  w.x += (w.speed + (dist > 760 ? 240 : 0)) * dt; w.t += dt;
  if (p.x < w.x + 10){ p.x = w.x + 14; p.vx = 300; if (p.inv <= 0) hurt(w.x - 100); }
  for (const k of S.W.kl) if (!k.dead && k.x < w.x) k.dead = .001;
}

/* ================= Журнал диалогов ================= */
const JKEY = 'nz.journal.v2';
const Journal = {
  data: (() => { try { return JSON.parse(store.get(JKEY) || '') || null; } catch(e){ return null; } })() || {order:[], scenes:{}},
  // имя Странника в игре не называется — чистим записи старых версий
  clean(){ for (const k in this.data.scenes) for (const L of this.data.scenes[k].lines){ if (L.n === 'Аксель') L.n = 'Странник'; if (L.t) L.t = L.t.replace(/Аксел(ь|я|ю|ем|е)/g, (m, e) => 'Странник' + ({'ь':'', 'я':'а', 'ю':'у', 'ем':'ом', 'е':'е'}[e])); } },
  save(){ store.set(JKEY, JSON.stringify(this.data)); },
  add(chIndex, name, i){
    const ch = CHAPTERS[chIndex], def = ch.scenes[name], key = ch.id + ':' + name, d = this.data;
    if (!d.scenes[key]){ d.scenes[key] = {ch:ch.label, title:def.title || name, lines:[]}; d.order.push(key); }
    const rec = d.scenes[key]; if (rec.lines.length > i) return;
    while (rec.lines.length <= i){ const L = def.lines[rec.lines.length]; rec.lines.push({n:L.n, t:L.t}); }
    this.save();
  },
  render(){
    this.clean(); const el = $('jlist'); el.innerHTML = '';
    if (!this.data.order.length){ el.innerHTML = '<p class="empty">Похоже, здесь пока пусто. Все услышанные и пропущенные диалоги будут аккуратно записаны сюда.</p>'; return; }
    for (const id of this.data.order){ const rec = this.data.scenes[id];
      const h = document.createElement('p'); h.className = 'sc'; h.textContent = `${rec.ch} · ${rec.title}`; el.appendChild(h);
      for (const L of rec.lines){ const p = document.createElement('p'); p.className = 'ln' + (L.n ? '' : ' n');
        if (L.n){ const b = document.createElement('b'); b.textContent = L.n + ':'; b.style.color = NAMECOL[WHO[L.n]] || ''; p.appendChild(b); }
        p.appendChild(document.createTextNode(L.t)); el.appendChild(p); } }
    el.scrollTop = el.scrollHeight;
  }
};
let journalOpen = false;

/* ================= Сцены (визуальная новелла) =================
   Сцена: {title, lines:[{n:'Ая', t:'…', e:'happy', act(){…}}], left:'aya', right:'timofey', slides:true, end(){…}} */
const WHO = {'Ая':'aya','Тимофей':'timofey','Дед':'timofey','Мико':'miko','Гиса':'gisa','Странник':'axel','Незнакомец':'axel','Вран':'vran','Черри':'cherry','Жуля':'julia','Марта':'marta','Эра':'era','Эрмина':'era','Джей':'jay'};
const NAMECOL = {aya:'#B9572A', timofey:'#7A5A3A', miko:'#7A3E9A', gisa:'#B9801A', axel:'#3E6E70', vran:'#7E2E3C', cherry:'#9A2F31', julia:'#2F7F66', marta:'#4E6E40', era:'#5A6A9A', jay:'#2E8A86'};
function startScene(name, def0){
  const ch = curCh(), def = def0 || ch.scenes[name]; if (!def){ console.warn('нет сцены', name); return; }
  const lines = def.lines, hero = def.left === undefined ? 'aya' : def.left;
  const first = def.right === false ? null : def.right || lines.map(l => WHO[l.n]).filter(w => w && w !== hero)[0];
  S.scene = {name, def, lines, i:-1, shown:0, t:0, fade:0, slots:{L: hero ? {who:hero} : null, R: first ? {who:first} : null}};
  if (def.slides){ S.scene.slots = {L:null, R:null}; S.prologue = true; }
  S.scene.musicPrev = curMood(); if (def.cut) musicCut(); if (def.music) setMusic(true, def.music, def.vol); // у разговора своё настроение
  S.mode = 'dialog'; S.P.vx *= .3;
  for (const kk in keys) if (!isKey('sprint', kk)) keys[kk] = false; jumpQueued = false; advanceQueued = false;
  nextLine();
}
function nextLine(){
  const sc = S.scene; sc.i++;
  if (sc.i >= sc.lines.length){ endScene(); return; }
  const L = sc.lines[sc.i]; sc.shown = 0; sc.t = 0;
  if (L.cut) musicCut();
  if (L.music) setMusic(true, L.music, L.vol);
  if (L.sfx) sfx[L.sfx]();
  if (L.act) L.act();
  if (!S.scene) return;
  if (!sc.def.noJournal) Journal.add(S.ch, sc.name, sc.i);
  sc.slideT = L.slide !== undefined && L.slide !== sc.slide ? 0 : sc.slideT; if (L.slide !== undefined){ if (sc.slide !== L.slide) S.particles = []; sc.prevSlide = sc.slide; sc.slide = L.slide; }
  const who = WHO[L.n] || null; sc.who = who;
  if (L.m !== undefined || L.off){} // воспоминание или голос из-за кадра — портреты не трогаем
  else if (who && sc.slots.L && sc.slots.L.who === who && !sc.slots.L.leave){}
  else if (who && (!sc.slots.R || sc.slots.R.who !== who || sc.slots.R.leave)) sc.slots.R = {who};
  $('dlg').classList.add('on'); $('dlg').classList.toggle('narr', !who);
  $('dName').textContent = L.n || ''; $('dlg').style.setProperty('--nc', NAMECOL[who] || '#6E6478');
  $('dText').textContent = '';
}
function endScene(){
  const sc = S.scene, def = sc.def; S.scene = null; S.prologue = false; $('dlg').classList.remove('on'); S.mode = 'play'; jumpQueued = false; advanceQueued = false;
  for (const kk in keys) if (!isKey('sprint', kk)) keys[kk] = false;
  for (const f of Object.values(S.W.fades)) if (f.state === 'shake') f.t = 0;
  // Пара секунд форы: враг, оказавшийся рядом за время разговора, разворачивается и не бьёт сразу
  const p = S.P; p.safe = 1.5;
  for (const k of S.W.kl) if (!k.dead && Math.abs(k.x - p.x) < 120 && Math.abs(k.y - p.y) < 100) k.dir = Math.sign(k.x - p.x) || 1;
  const calls = musicCalls;
  if (def.end) def.end();
  // разговор кончился — возвращаем музыку, что играла до него (если сцена сама не поставила новую)
  if (!S.scene && S.mode === 'play' && musicCalls === calls && (curMood() !== sc.musicPrev || musicVol !== 1 || !musicOn)) setMusic(true, sc.musicPrev);
}
// Персонаж ушёл или растворился в тумане — его портрет тоже уходит из окна диалога
function sceneDrop(who){ const sc = S && S.scene; if (!sc || !who) return;
  for (const k of ['L','R']){ const s = sc.slots[k]; if (s && s.who === who) s.leave = true; } }
function skipScene(){ if (!S || !S.scene) return; const sc = S.scene;
  while (sc.i < sc.lines.length - 1){ sc.i++; const L = sc.lines[sc.i]; if (L.act) L.act(); if (!S.scene) return; if (!sc.def.noJournal) Journal.add(S.ch, sc.name, sc.i); }
  toast('Сцена пропущена — запись сохранена в Журнале ✎'); endScene(); }
function updateScene(dt){
  const sc = S.scene; if (!sc) return; sc.t += dt;
  const L = sc.lines[sc.i]; if (!L) return;
  if (L.wait && sc.t < L.wait && !advanceQueued) return; // тишина перед репликой
  const full = L.t.length;
  if (sc.shown < full){ const before = Math.floor(sc.shown); sc.shown = Math.min(full, sc.shown + dt*TEXT_CPS[SET.text]); if (sc.shown >= full) $('dText').textContent = L.t; sc.idle = 0;
    if (Math.floor(sc.shown) !== before){ $('dText').textContent = L.t.slice(0, Math.floor(sc.shown)); if (Math.floor(sc.shown) % 3 === 0 && sc.who) sfx.blip(); } }
  else { sc.idle = (sc.idle || 0) + dt; if (SET.auto && sc.idle > 1.4 + full*.025){ nextLine(); return; } }
  if (advanceQueued){ advanceQueued = false; if (sc.shown < full){ sc.shown = full; $('dText').textContent = L.t; } else nextLine(); }
}

/* ================= Главный апдейт ================= */
// Плавное догоняющее движение (как SmoothDamp в Unity): без рывков при старте и остановке.
function smoothDamp(cur, target, vel, time, dt){
  const o = 2/time, x = o*dt, k = 1/(1 + x + .48*x*x + .235*x*x*x), ch = cur - target;
  const tmp = (vel + o*ch)*dt, v = (vel - o*tmp)*k;
  return [target + (ch + tmp)*k, v];
}
function updateCamera(dt){
  const p = S.P, c = S.cam, f = S.camFocus;
  if (c.look === undefined){ c.look = 0; c.vx = 0; c.vy = 0; }
  let tx, ty;
  if (f){ tx = f.x - VW/2; ty = f.y - VH*.6; }
  else {
    // Взгляд вперёд растёт только при устойчивом беге и меняется медленно — короткие нажатия A/D камеру не дёргают.
    const run = Math.abs(p.vx) > 120 ? Math.sign(p.vx) : 0;
    if (run) c.look = approach(c.look, run*VW*.08, dt*VW*.2);
    // Мёртвая зона по X: пока героиня внутри рамки, камера стоит.
    const px = p.x + p.w/2, center = c.x + VW*.45 + c.look, dz = VW*.02;
    tx = px > center + dz ? c.x + (px - center - dz) : px < center - dz ? c.x + (px - center + dz) : c.x;
    // По Y: мёртвая зона, а если героиня стоит на земле — подтягиваем к её уровню.
    const py = p.y + p.h, cy = c.y + VH*.62, dzy = p.onGround ? 6 : 50;
    ty = py > cy + dzy ? c.y + (py - cy - dzy) : py < cy - dzy ? c.y + (py - cy + dzy) : c.y;
  }
  let r = smoothDamp(c.x, tx, c.vx, f ? .45 : .09, dt); c.x = r[0]; c.vx = r[1];
  r = smoothDamp(c.y, ty, c.vy, f ? .45 : (p.vy > 600 ? .06 : .14), dt); c.y = r[0]; c.vy = r[1];
  const mx = Math.max(0, S.W.w - VW), my = Math.max(0, S.W.h - VH);
  if (c.x < 0 || c.x > mx){ c.x = clamp(c.x, 0, mx); c.vx = 0; }
  if (c.y < 0 || c.y > my){ c.y = clamp(c.y, 0, my); c.vy = 0; }
  c.kvy += (-c.ky*240 - c.kvy*18) * dt; c.ky += c.kvy*dt; c.kx *= Math.pow(.001, dt);
}
function checkTriggers(){
  const p = S.P;
  for (const tg of S.W.trigs){
    if (tg.done || p.x + p.w/2 < tg.x || (tg.ground && !p.onGround)) continue;
    if (tg.when && !tg.when()) continue;
    tg.done = true; S.flags['t_' + tg.scene] = true;
    if (tg.run) tg.run(); else startScene(tg.scene);
    return;
  }
  const d = S.W.door, ch = curCh();
  if (d && S.flags.exitOpen && p.x + p.w > d.x + 20 && p.onGround && !S.flags.exited){ S.flags.exited = true; S.wave = null; p.vx = 0;
    if (ch.exitScene) startScene(ch.exitScene); else chapterComplete(); }
}
function update(dt){
  if (journalOpen) return;
  S.time += dt; S.beat = (AC && musicOn) ? ((AC.currentTime % BEAT) / BEAT) : (S.time / BEAT) % 1;
  for (const q of S.particles){ q.t += dt; q.vy += q.g*dt; if (q.drag){ q.vx *= Math.exp(-q.drag*dt); q.vy *= Math.exp(-q.drag*dt); } q.x += q.vx*dt; q.y += q.vy*dt; q.rot += (q.vr||0)*dt; }
  S.particles = S.particles.filter(q => q.t < q.life); if (S.particles.length > 600) S.particles.splice(0, S.particles.length - 600);
  S.shake = Math.max(0, S.shake - dt); S.flash = Math.max(0, S.flash - dt); S.fadeIn = Math.max(0, S.fadeIn - dt);
  for (const h of S.W.hints){ const near = Math.abs(S.P.x - h.c*T) < 280 && Math.abs(S.P.y - h.r*T) < 320 && (!h.when || h.when()); h.a = approach(h.a, near ? 1 : 0, dt*2); }
  if (S.hitstop > 0){ S.hitstop -= dt; return; }
  if (S.bioPlay){ S.fadeIn = Math.max(0, S.fadeIn - dt); updateScene(dt); return; } // сцена знакомства из «Персонажей»
  if (S.mode === 'title'){ S.cam.x = 60 + Math.sin(S.time*.05)*60; S.cam.y = clamp((FLOOR + 3)*T - VH, 0, S.W.h - VH); updateWorld(dt, false); return; }
  if (S.mode === 'card'){ S.cardT += dt; updateWorld(dt, false); updateCamera(dt); if (S.cardT > 3.6 || (advanceQueued && S.cardT > .6)){ advanceQueued = false; afterCard(); } return; }
  if (S.mode === 'dialog' && S.prologue){ if (S.scene) S.scene.slideT = (S.scene.slideT || 0) + dt; updateScene(dt); return; }
  if (S.mode === 'dialog'){ updateScene(dt); if (!S || S.mode === 'title') return; updateWorld(dt, false); updateChase(dt); updateMech(dt, true); updateCamera(dt);
    const p = S.P; p.vx = approach(p.vx, 0, 3000*dt);
    if (p.mover){ p.x += p.mover.dx; p.y = p.mover.y - p.h; }
    else if (!p.onGround){ p.vy += G*dt; moveEntity(p, dt, true, true); if (p.y > S.W.h - p.h){ p.y = S.W.h - p.h; p.vy = 0; } }
    return; }
  if (S.mode === 'faint'){ S.fT += dt; S.white = Math.min(1, S.fT*2); if (S.fT > .9){ respawn(); } return; }
  if (S.mode === 'caught'){ S.fT += dt; updateMech(dt, true); S.white = Math.min(1, Math.max(0, S.fT - .5)*2.5); if (S.fT > 1.4){ respawn(); resetGuards(); } return; } // стража заметила — назад к фонарю
  S.white = Math.max(0, S.white - dt*1.5);
  if (S.mode === 'play'){
    S.play += dt;
    updatePlayer(dt); if (S.mode !== 'play') return;
    updateWorld(dt, true); updateChase(dt); updateWave(dt); updateMech(dt); updateCamera(dt);
    checkTriggers();
    const ch = curCh(); if (ch.tick) ch.tick(dt);
    return;
  }
  if (S.mode === 'end'){ updateWorld(dt, false); }
}

/* ================= Сохранения =================
   nz.save.v2: {v, ch, lamp, finds, drops, flags, play, faints, t}
   nz.progress: {unlocked} — до какой главы открыт доступ (не стирается «Новой игрой») */
const SKEY = 'nz.save.v2', PKEY = 'nz.progress';
function readSave(){ try { const d = JSON.parse(store.get(SKEY) || 'null'); return d && d.v === 2 ? d : null; } catch(e){ return null; } }
function readProgress(){
  let p; try { p = JSON.parse(store.get(PKEY) || 'null') || {unlocked:0}; } catch(e){ p = {unlocked:0}; }
  // Глава, пройденная, когда она была последней, не могла открыть следующую — её тогда ещё не было.
  // Поэтому каждая пройденная глава (или участок) открывает следующую.
  for (const id of p.done || []){ const i = CHAPTERS.findIndex(c => c.id === id); if (i >= 0) p.unlocked = Math.max(p.unlocked || 0, Math.min(i + 1, CHAPTERS.length - 1)); }
  return p;
}
function unlock(i){ const p = readProgress(); if (i > p.unlocked){ p.unlocked = Math.min(i, CHAPTERS.length - 1); store.set(PKEY, JSON.stringify(p)); } }
function saveGame(silent){
  if (!S || S.mode === 'title' || S.noSave) return;
  const W = S.W, p = S.P;
  let li = 0; W.lamps.forEach((l, i) => { if (l.lit && Math.abs(p.checkpoint.x - (l.x - 12)) < 4) li = i; });
  const data = {v:2, ch:S.ch, lamp:li, lit:W.lamps.map(l => l.lit ? 1 : 0), finds:W.finds.filter(f => f.got).map(f => f.id),
    drops:W.drops.map((d,i) => d.got ? i : -1).filter(i => i >= 0), flags:S.flags, play:S.play, faints:S.faints, cp:S.checkpointOverride || null, t:Date.now()};
  store.set(SKEY, JSON.stringify(data));
  if (!silent) toast('Прогресс сохранён у фонаря');
}
function loadGame(){
  const d = readSave(); if (!d || !CHAPTERS[d.ch]) return false;
  beginChapterState(d.ch);
  const W = S.W, p = S.P;
  (d.lit || []).forEach((v, i) => { if (W.lamps[i]) W.lamps[i].lit = !!v; });
  const lp = W.lamps[clamp(d.lamp || 0, 0, W.lamps.length - 1)];
  if (d.cp){ p.x = d.cp.x; p.y = d.cp.y; } else if (lp){ p.x = lp.x - 12; p.y = lp.y - p.h; }
  p.checkpoint = {x:p.x, y:p.y}; S.checkpointOverride = d.cp || null;
  for (const id of d.finds || []){ const f = W.finds.find(q => q.id === id); if (f){ f.got = true; S.finds++; } }
  for (const i of d.drops || []){ if (W.drops[i]){ W.drops[i].got = true; S.drops++; } }
  S.play = d.play || 0; S.faints = d.faints || 0; S.flags = d.flags || {};
  for (const tg of W.trigs) if (S.flags['t_' + tg.scene]) tg.done = true;
  const ch = curCh(); if (ch.restore) ch.restore(); else setMusic(true, ch.music || 'calm');
  S.cam.x = clamp(p.x - VW*.4, 0, W.w - VW); S.cam.y = clamp(p.y - VH*.6, 0, W.h - VH); S.cam.vx = S.cam.vy = S.cam.look = 0;
  S.mode = 'play'; S.fadeIn = .8; toast('Возвращение к фонарю...');
  return true;
}

/* ================= Ход главы: старт → (пролог) → заставка → сцена → игра → финал ================= */
function beginChapterState(i){
  audio(); if (typeof tgFullscreen === 'function') tgFullscreen();
  S = newState(i); G1.S = S; LAYERS = null; G1.paused = false; hideScreens();
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
}
function startChapter(i){
  beginChapterState(i); const ch = curCh();
  unlock(i); S.fadeIn = .8;
  setMusic(true, ch.music || 'calm');
  if (ch.openScene) startScene(ch.openScene); else startCard();
  saveGame(true);
}
function startCard(){ S.mode = 'card'; S.cardT = 0; $('dlg').classList.remove('on'); }
function afterCard(){ const ch = curCh(); S.mode = 'play'; if (ch.startScene) startScene(ch.startScene); if (ch.onPlay) ch.onPlay(); }
function chapterComplete(){
  const ch = curCh(); S.mode = 'end'; S.noSave = true;
  { const p = readProgress(); p.done = [...new Set([...(p.done || []), ch.id])]; p.best = p.best || {}; p.best[ch.id] = Math.max(p.best[ch.id] || 0, S.drops); store.set(PKEY, JSON.stringify(p)); } // + лучший сбор искорок — копилка для историй // пройденные главы открывают биографии
  const next = S.ch + 1;
  if (next < CHAPTERS.length){ unlock(next); store.set(SKEY, JSON.stringify({v:2, ch:next, lamp:0, lit:[], finds:[], drops:[], flags:{fresh:1}, play:0, faints:0, t:Date.now()})); }
  else store.set(SKEY, 'null');
  if (ch.group){ const p = readProgress(); p.run = p.run || {}; p.run[ch.id] = {finds:S.finds, total:S.W.finds.length, drops:S.drops, faints:S.faints, play:S.play}; store.set(PKEY, JSON.stringify(p)); }
  if (ch.noStats){ setTimeout(() => startChapter(next), 400); return; }
  setMusic(true, S.ch >= CHAPTERS.length - 1 ? 'hope' : 'title');
  setTimeout(showEnd, 700);
}
// Короткий доступ для сцен в главах
const G1 = { S:null, paused:false };
const api = {
  get S(){ return S; }, get P(){ return S.P; }, npc,
  show(id, c, r){ const n = npc(id); n.hidden = false; n.alpha = 0; if (c !== undefined){ n.x = c*T + 16; if (r !== undefined) n.y = r*T; } n.state = 'idle'; },
  hide(id){ const n = npc(id); n.hidden = true; sceneDrop(n.who); },
  drop(who){ sceneDrop(who); },
  vanish(id){ const n = npc(id); if (!n || n.hidden) return; smokePuff(n.x, n.y - 30, 22); sfx.vanish(); n.hidden = true; n.alpha = 0; sceneDrop(n.who); },
  walk(id, c, speed=120, then){ const n = npc(id); n.hidden = false; n.state = 'walk'; n.tx = c*T + 16; n.speed = speed; n.onArrive = then || null; },
  leave(id, dir=1, speed=260){ const n = npc(id); n.state = 'leave'; n.face = dir; n.speed = speed; sceneDrop(n.who); },
  face(id, dir){ const n = npc(id); n.face = dir; n.lookAt = false; },
  say(id, text, t=2.4){ const n = npc(id); n.say = text; n.sayT = t; },
  lampOut(i){ const l = S.W.lamps[i]; if (l && l.lit){ l.lit = false; l.out = 1; sfx.lampOut(); smokePuff(l.x, l.y - 74, 10); } },
  lampLock(i, v=true){ const l = S.W.lamps[i]; if (l) l.locked = v; },
  focus(c, r){ S.camFocus = c === null ? null : {x:c*T, y:r*T}; },
  shake(t=.6){ S.shake = t; sfx.rumble(); buzz(60); },
  unlockDouble(){ S.canDouble = true; sfx.unlock(); embers(S.P.x + 12, S.P.y + 10, 30); },
  chase(cfg){ startChase(cfg); }, alarm(){ alarmGuards(); }, mist(o){ startMist(o); setMusic(true, 'mist'); },
  openExit(){ S.flags.exitOpen = true; }, complete(){ chapterComplete(); },
  music(m, vol){ setMusic(true, m, vol); }, cut(){ musicCut(); }, swell(vol, sec){ musicSwell(vol, sec); }, rise(o){ startRise(o); }, flag(k, v=true){ S.flags[k] = v; }, signal(id, v=true){ S.W.forced[id] = v; },
  iskraTo(c, r){ S.V.away = {x:c*T + 16, y:r*T}; }, iskraBack(){ S.V.away = null; },
  checkpoint(c, r){ S.P.checkpoint = {x:c*T, y:r*T - S.P.h}; S.checkpointOverride = {x:c*T, y:r*T - S.P.h}; },
  card(){ startCard(); },
  // тень вылезает из тумана: c — колонка, s — ряд поверхности, на которой она встанет
  shade(c, s){ S.W.kl.push({x:c*T + 3, y:s*T - 24, w:26, h:24, vx:0, vy:0, dir:-1, speed:rnd(48,66), t:0, dead:0, onGround:false}); smokePuff(c*T + 16, s*T - 12, 10); }
};
