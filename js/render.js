"use strict";
/* =====================================================================
   Отрисовка: темы оформления, тайлы, объекты, персонажи в мире, HUD.
   ===================================================================== */
const cv = $('c'), ctx = cv.getContext('2d');
let DPR = 1;
function resize(){ DPR = Math.min(2, window.devicePixelRatio || 1); cv.width = Math.round(VW*DPR); cv.height = Math.round(VH*DPR); }
addEventListener('resize', resize); resize();
const CHS = 1.16;
function seeded(seed){ return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function layerSize(par, W){ return [VW + (W - VW)*par, VH + (LH - VH)*par]; }
function glow(x, y, r, col, a){ const g = ctx.createRadialGradient(x, y, 1, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r*2, r*2); }
function glowOn(c, x, y, r, col, a){ const g = c.createRadialGradient(x, y, 1, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); c.fillStyle = g; c.fillRect(x - r, y - r, r*2, r*2); }
function beatPulse(){ return Math.pow(1 - S.beat, 3); }
function hexA(hex){ const n = parseInt(hex.slice(1), 16); return `rgba(${n>>16},${(n>>8)&255},${n&255},A)`; }
function leafShape(c, len, wid, curve){ c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(wid, -len*.35 + curve, curve*.6, -len); c.quadraticCurveTo(-wid, -len*.4 + curve, 0, 0); c.closePath(); }
function gearPath(c, r, teeth, depth=.18){
  c.beginPath();
  for (let i=0;i<teeth*2;i++){ const a0 = i/(teeth*2)*Math.PI*2, a1 = (i+1)/(teeth*2)*Math.PI*2, rr = i % 2 ? r : r*(1 + depth);
    c.arc(0, 0, rr, a0, a1); }
  c.closePath();
}
function gearImg(r, teeth, col, hole){
  const s = Math.ceil(r*2.5), c = mk(s, s), x = c.getContext('2d'); x.translate(s/2, s/2);
  gearPath(x, r, teeth); x.fillStyle = col; x.fill(); x.lineWidth = 3; x.strokeStyle = 'rgba(0,0,0,.35)'; x.stroke();
  x.globalCompositeOperation = 'destination-out';
  x.beginPath(); x.arc(0, 0, r*.22, 0, Math.PI*2); x.fill();
  if (hole) for (let i=0;i<6;i++){ const a = i/6*Math.PI*2; x.beginPath(); x.arc(Math.cos(a)*r*.56, Math.sin(a)*r*.56, r*.16, 0, Math.PI*2); x.fill(); }
  x.globalCompositeOperation = 'source-over';
  return c;
}

/* ================= Темы ================= */
const THEMES = {
  // Ночной город на скалах: дальние дома, крыши, бельё на верёвках, туман снизу
  street:{
    floats:'ember', vignette:'rgba(8,8,24,.55)', stone:['#4A4E66','#40445C','#383B52','#303349','#292B40'], edge:'curb', spike:'metal',
    sky(){
      const g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#0B1024'); g.addColorStop(.6, '#1C2246'); g.addColorStop(1, '#33305A');
      ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
      for (let i=0;i<110;i++){ const x = (hash(i,1,2) % 1000)/1000*VW*1.3 - S.cam.x*.03, y = (hash(i,3,4) % 1000)/1000*VH*.6, tw = .4 + .6*Math.abs(Math.sin(S.time*(.6 + i%5*.3) + i));
        ctx.fillStyle = `rgba(240,236,255,${.5*tw})`; ctx.fillRect(((x % VW) + VW) % VW, y, 1.6, 1.6); }
      const mx = VW*.78 - S.cam.x*.02, my = 96 - S.cam.y*.04;
      glow(mx, my, 230, 'rgba(255,236,200,A)', .32);
      ctx.fillStyle = '#F6EED8'; ctx.beginPath(); ctx.arc(mx, my, 38, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(214,200,172,.55)'; ctx.beginPath(); ctx.arc(mx - 10, my - 7, 8, 0, Math.PI*2); ctx.arc(mx + 12, my + 10, 6, 0, Math.PI*2); ctx.fill();
    },
    layers(W, R){
      const [w1, h1] = layerSize(.18, W), L1 = mk(w1, h1), a = L1.getContext('2d');
      a.fillStyle = '#141A34'; a.beginPath(); a.moveTo(0, h1); for (let x=0;x<=w1;x+=60) a.lineTo(x, h1*.72 + Math.sin(x*.01)*20 + R()*16); a.lineTo(w1, h1); a.fill();
      for (let x=0;x<w1;){ const w = 26 + R()*50, hh = 60 + R()*180, base = h1*.74 + Math.sin(x*.01)*18; a.fillStyle = '#171E3C'; a.fillRect(x, base - hh, w, hh + 40);
        if (R() < .5){ a.beginPath(); a.moveTo(x - 4, base - hh); a.lineTo(x + w/2, base - hh - 18 - R()*14); a.lineTo(x + w + 4, base - hh); a.fill(); }
        for (let y=base - hh + 10; y < base - 6; y += 14) for (let xx=x+5; xx < x + w - 6; xx += 10) if (R() < .22){ a.fillStyle = `rgba(255,${190 + R()*40|0},110,${.35 + R()*.4})`; a.fillRect(xx, y, 4, 6); }
        x += w + 4 + R()*14; }
      const [w2, h2] = layerSize(.42, W), L2 = mk(w2, h2), b = L2.getContext('2d');
      for (let x=-20;x<w2;){ const w = 90 + R()*110, hh = 110 + R()*170, base = h2*.82; b.fillStyle = R() < .5 ? '#1E2547' : '#222A4E'; b.fillRect(x, base - hh, w, hh + 200);
        b.fillStyle = '#2C3460'; b.beginPath(); b.moveTo(x - 10, base - hh); b.lineTo(x + w*.5, base - hh - 46 - R()*30); b.lineTo(x + w + 10, base - hh); b.closePath(); b.fill();
        if (R() < .7){ b.fillStyle = '#1A1F3A'; b.fillRect(x + w*.7, base - hh - 50, 14, 40); }
        for (let y=base - hh + 20; y < base; y += 34) for (let xx=x+14; xx < x + w - 20; xx += 30) if (R() < .35){
          b.fillStyle = 'rgba(255,200,120,.75)'; b.fillRect(xx, y, 12, 16); b.fillStyle = 'rgba(30,30,60,.8)'; b.fillRect(xx + 5, y, 2, 16); b.fillRect(xx, y + 7, 12, 2);
          glowOn(b, xx + 6, y + 8, 26, 'rgba(255,190,110,A)', .18); }
        x += w + 6 + R()*30; }
      for (let x=60;x<w2;x+=260 + R()*200){ const y = h2*.4 + R()*h2*.2, len = 160 + R()*120;
        b.strokeStyle = 'rgba(10,10,24,.7)'; b.lineWidth = 2; b.beginPath(); b.moveTo(x, y); b.quadraticCurveTo(x + len/2, y + 30, x + len, y); b.stroke();
        for (let i=1;i<6;i++){ const t = i/6, lx = x + len*t, ly = y + Math.sin(t*Math.PI)*30*.9 + 4; glowOn(b, lx, ly, 14, 'rgba(255,200,120,A)', .45); b.fillStyle = '#FFD996'; b.beginPath(); b.arc(lx, ly, 2.6, 0, Math.PI*2); b.fill(); } }
      const [w3, h3] = layerSize(.7, W), L3 = mk(w3, h3), d = L3.getContext('2d');
      for (let x=100;x<w3;x+=340 + R()*260){ const y = h3*.38 + R()*h3*.2, len = 120 + R()*90;
        d.strokeStyle = '#0E1226'; d.lineWidth = 2; d.beginPath(); d.moveTo(x, y); d.quadraticCurveTo(x + len/2, y + 18, x + len, y); d.stroke();
        for (let i=0;i<4;i++){ const lx = x + 14 + i*(len/4.2), ly = y + Math.sin((lx - x)/len*Math.PI)*16; d.fillStyle = pick(['#283055','#30284A','#24304A']); d.fillRect(lx, ly, 16 + R()*10, 20 + R()*18); }
        d.fillStyle = '#0E1226'; d.fillRect(x - 4, y - 10, 6, h3); d.fillRect(x + len - 2, y - 10, 6, h3); }
      return [{img:L1, par:.18}, {img:L2, par:.42}, {img:L3, par:.7}];
    },
    over(){ // туман снизу
      const base = VH - (S.cam.y - (LH - VH))*.25;
      const g = ctx.createLinearGradient(0, base - 160, 0, base + 20); g.addColorStop(0, 'rgba(120,110,170,0)'); g.addColorStop(1, 'rgba(120,110,170,.28)');
      ctx.fillStyle = g; ctx.fillRect(0, base - 160, VW, 200);
    }
  },
  // Внутри часовой башни: огромные шестерни, кирпич, трубы, тёплый свет
  clock:{
    floats:'dust', vignette:'rgba(20,10,4,.6)', stone:['#7A3E2E','#6E3828','#603024','#542A20','#48241C'], edge:'brass', spike:'saw',
    sky(){
      const g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#1A100C'); g.addColorStop(.6, '#2E1C14'); g.addColorStop(1, '#3E2618');
      ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
      const cx = VW*.62 - S.cam.x*.04, cy = VH*.42 - S.cam.y*.03, r = 210;
      glow(cx, cy, r*1.5, 'rgba(160,190,255,A)', .16);
      ctx.save(); ctx.globalAlpha = .55; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fillStyle = '#25304A'; ctx.fill(); ctx.lineWidth = 14; ctx.strokeStyle = '#120C08'; ctx.stroke();
      ctx.strokeStyle = 'rgba(200,215,255,.35)'; ctx.lineWidth = 4;
      for (let i=0;i<12;i++){ const a = i/12*Math.PI*2; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a)*r*.82, cy + Math.sin(a)*r*.82); ctx.lineTo(cx + Math.cos(a)*r*.93, cy + Math.sin(a)*r*.93); ctx.stroke(); }
      ctx.strokeStyle = '#120C08'; ctx.lineWidth = 12; const ha = S.time*.01 - 1.2, ma = S.time*.12;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ha)*r*.5, cy + Math.sin(ha)*r*.5); ctx.stroke();
      ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ma)*r*.78, cy + Math.sin(ma)*r*.78); ctx.stroke();
      ctx.restore();
    },
    layers(W, R){
      const [w2, h2] = layerSize(.42, W), L2 = mk(w2, h2), b = L2.getContext('2d');
      for (let y=0;y<h2;y+=18) for (let x=-(y/18%2)*20;x<w2;x+=40){ b.fillStyle = R() < .5 ? 'rgba(60,32,22,.5)' : 'rgba(70,38,26,.5)'; b.fillRect(x, y, 38, 16); }
      for (let x=120;x<w2;x+=360 + R()*160){ const y = h2*.18 + R()*h2*.3, w = 90, hh = 170;
        b.fillStyle = '#16100C'; b.beginPath(); b.moveTo(x - 8, y + hh); b.lineTo(x - 8, y + 40); b.arc(x + w/2, y + 40, w/2 + 8, Math.PI, 0); b.lineTo(x + w + 8, y + hh); b.fill();
        const gg = b.createLinearGradient(0, y, 0, y + hh); gg.addColorStop(0, 'rgba(150,180,240,.55)'); gg.addColorStop(1, 'rgba(60,80,140,.4)');
        b.fillStyle = gg; b.beginPath(); b.moveTo(x, y + hh); b.lineTo(x, y + 40); b.arc(x + w/2, y + 40, w/2, Math.PI, 0); b.lineTo(x + w, y + hh); b.fill();
        b.fillStyle = '#16100C'; b.fillRect(x + w/2 - 3, y, 6, hh); b.fillRect(x, y + 90, w, 6); }
      const [w3, h3] = layerSize(.7, W), L3 = mk(w3, h3), d = L3.getContext('2d');
      for (let x=60;x<w3;x+=180 + R()*200){ const tw = 14 + R()*10; d.fillStyle = '#5A3A1E'; d.fillRect(x, 0, tw, h3); d.fillStyle = 'rgba(255,220,150,.18)'; d.fillRect(x + 3, 0, 3, h3);
        for (let y=60 + R()*80; y<h3; y+=140 + R()*80){ d.fillStyle = '#7A5226'; d.fillRect(x - 6, y, tw + 12, 10); d.fillStyle = '#3A2414'; d.fillRect(x - 6, y + 10, tw + 12, 3); }
        if (R() < .4){ const yy = h3*.3 + R()*h3*.4; d.fillStyle = '#4E3218'; d.fillRect(x, yy, 140 + R()*120, tw*.8); } }
      for (let x=200;x<w3;x+=420 + R()*260){ d.strokeStyle = '#2A1C10'; d.lineWidth = 5; d.setLineDash([10, 6]); d.beginPath(); d.moveTo(x, 0); d.lineTo(x + R()*20 - 10, h3*.4 + R()*h3*.3); d.stroke(); d.setLineDash([]); }
      const gears = [];
      for (let x=100;x<W*.2 + VW;x+=300 + R()*240) gears.push({x, y:VH*.2 + R()*VH*.6, r:70 + R()*90, sp:(R() < .5 ? -1 : 1)*(.08 + R()*.12), img:gearImg(70 + R()*90, 12 + Math.floor(R()*8), '#2A1A10', true)});
      THEMES.clock.gears = gears;
      return [{img:L2, par:.42}, {img:L3, par:.7}];
    },
    mid(){
      for (const gq of THEMES.clock.gears || []){ const x = gq.x - S.cam.x*.2, y = gq.y - S.cam.y*.1; if (x < -gq.img.width || x > VW + gq.img.width) continue;
        ctx.save(); ctx.translate(x, y); ctx.rotate(S.time*gq.sp); ctx.globalAlpha = .9; ctx.drawImage(gq.img, -gq.img.width/2, -gq.img.height/2); ctx.restore(); }
    }
  },
  // Закат над облаками: террасы с оранжереей, облака, маяк вдали
  sky:{
    floats:'petal', vignette:'rgba(30,14,30,.45)', stone:['#C9B8A2','#B8A690','#A4927E','#8E7E6C','#7A6A5A'], edge:'moss', spike:'bramble',
    sky(){
      const g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#2A2456'); g.addColorStop(.45, '#8E4E7A'); g.addColorStop(.8, '#E6876A'); g.addColorStop(1, '#F6C27E');
      ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
      for (let i=0;i<50;i++){ const x = (hash(i,9,2) % 1000)/1000*VW, y = (hash(i,5,4) % 1000)/1000*VH*.3; ctx.fillStyle = `rgba(255,240,255,${.25 + .25*Math.sin(S.time + i)})`; ctx.fillRect(x, y, 1.6, 1.6); }
      const sx = VW*.3 - S.cam.x*.015, sy = VH*.78 - S.cam.y*.02;
      glow(sx, sy, 300, 'rgba(255,214,150,A)', .45);
      ctx.fillStyle = '#FFE2A8'; ctx.beginPath(); ctx.arc(sx, sy, 52, 0, Math.PI*2); ctx.fill();
    },
    layers(W, R){
      const [w1, h1] = layerSize(.15, W), L1 = mk(w1, h1), a = L1.getContext('2d');
      const cloud = (c, x, y, s, col) => { c.fillStyle = col; c.beginPath(); for (let i=0;i<6;i++){ c.ellipse(x + i*30*s, y - Math.sin(i/5*Math.PI)*24*s, 46*s, 24*s, 0, 0, Math.PI*2); } c.fill(); };
      for (let x=-40;x<w1;x+=150 + R()*120) cloud(a, x, h1*.62 + R()*h1*.2, .8 + R()*.6, 'rgba(255,190,170,.35)');
      // маяк в конце пути
      const lx = w1 - VW*.35, ly = h1*.66;
      a.fillStyle = '#3A2A48'; a.beginPath(); a.moveTo(lx - 40, ly); a.lineTo(lx - 22, ly - 260); a.lineTo(lx + 22, ly - 260); a.lineTo(lx + 40, ly); a.fill();
      a.fillStyle = '#2A1E36'; a.fillRect(lx - 30, ly - 290, 60, 30); a.beginPath(); a.moveTo(lx - 34, ly - 290); a.lineTo(lx, ly - 320); a.lineTo(lx + 34, ly - 290); a.fill();
      glowOn(a, lx, ly - 275, 60, 'rgba(255,220,150,A)', .25);
      a.fillStyle = 'rgba(80,60,100,.7)'; a.beginPath(); a.ellipse(lx, ly + 10, 120, 26, 0, 0, Math.PI*2); a.fill();
      const [w2, h2] = layerSize(.4, W), L2 = mk(w2, h2), b = L2.getContext('2d');
      for (let x=-60;x<w2;x+=200 + R()*160) cloud(b, x, h2*.8 + R()*h2*.12, 1 + R()*.8, 'rgba(255,214,200,.45)');
      for (let x=160;x<w2;x+=520 + R()*300){ const y = h2*.5 + R()*h2*.2;
        b.fillStyle = '#5A3E5E'; b.beginPath(); b.moveTo(x - 90, y); b.quadraticCurveTo(x, y + 90, x + 90, y); b.fill();
        b.fillStyle = '#6E5070'; b.fillRect(x - 90, y - 6, 180, 8);
        b.fillStyle = 'rgba(200,240,220,.35)'; b.beginPath(); b.arc(x, y - 6, 52, Math.PI, 0); b.fill(); b.strokeStyle = 'rgba(60,40,70,.8)'; b.lineWidth = 3; b.stroke();
        for (let i=-2;i<=2;i++){ b.beginPath(); b.moveTo(x + i*20, y - 6); b.lineTo(x + i*14, y - 54 + Math.abs(i)*8); b.stroke(); }
        glowOn(b, x, y - 24, 70, 'rgba(160,255,200,A)', .22); }
      const [w3, h3] = layerSize(.7, W), L3 = mk(w3, h3), d = L3.getContext('2d');
      for (let x=80;x<w3;x+=300 + R()*240){ const y = h3*.3 + R()*h3*.15, len = 180 + R()*100;
        d.strokeStyle = '#3A2440'; d.lineWidth = 2; d.beginPath(); d.moveTo(x, y); d.quadraticCurveTo(x + len/2, y + 26, x + len, y); d.stroke();
        for (let i=0;i<7;i++){ const t = (i + .5)/7, fx = x + len*t, fy = y + Math.sin(t*Math.PI)*24; d.fillStyle = pick(['#E8823A','#F2C14E','#8FB8F0','#E68AC8']); d.beginPath(); d.moveTo(fx - 7, fy); d.lineTo(fx + 7, fy); d.lineTo(fx, fy + 14); d.fill(); } }
      return [{img:L1, par:.15}, {img:L2, par:.4}, {img:L3, par:.7}];
    }
  }
};
const FIND_KINDS = {
  letter:{one:'Письмо', many:'Письма Черри'},
  boltik:{one:'Болтунчик', many:'Болтунчики'},
  seed:{one:'Семечко', many:'Семена Марты'}
};

/* ================= Предрисованные слои ================= */
let LAYERS = null, FG = null, GRAIN = null, FLOATS = null;
const theme = () => THEMES[curCh().theme] || THEMES.street;
function buildLayers(){
  const W = S.W.w, R = seeded(7 + S.ch*13), th = theme();
  LAYERS = th.layers(W, R);
  FG = []; const kind = curCh().theme;
  for (let i=0;i<4;i++){
    const c = mk(320, 300), x = c.getContext('2d'), RR = seeded(100 + i + S.ch*7);
    x.fillStyle = 'rgba(4,4,10,.9)';
    if (kind === 'street'){ // фонарные столбы, перила, вывески
      x.fillRect(150, 30, 12, 270); x.fillRect(110, 40, 90, 8); x.beginPath(); x.arc(118, 64, 14, 0, Math.PI*2); x.fill();
      x.fillRect(0, 230, 320, 10); for (let k=0;k<8;k++) x.fillRect(10 + k*40, 230, 6, 70);
    } else if (kind === 'clock'){ x.save(); x.translate(160, 220); gearPath(x, 90 + RR()*30, 10 + Math.floor(RR()*6)); x.fill(); x.restore(); }
    else { x.shadowColor = 'rgba(20,6,20,.9)'; x.shadowBlur = 10 + i*2; x.shadowOffsetX = 3000; x.translate(-3000, 0);
      const n = 5 + Math.floor(RR()*3);
      for (let k=0;k<n;k++){ x.save(); x.translate(160 + (RR()-.5)*60, 302); x.rotate(-1.1 + k*(2.2/(n-1)) + (RR()-.5)*.2);
        leafShape(x, 150 + RR()*90, 26 + RR()*14, (RR()-.5)*30); x.fillStyle = '#000'; x.fill(); x.restore(); } }
    FG.push(c);
  }
  FG.items = []; const R2 = seeded(31 + S.ch);
  for (let x = 400; x < W*1.3; x += 620 + R2()*480) FG.items.push({x, img:Math.floor(R2()*4), s:.6 + R2()*.35, flip:R2() < .5});
  GRAIN = mk(160, 160); const gx = GRAIN.getContext('2d'), id = gx.createImageData(160, 160);
  for (let i=0;i<id.data.length;i+=4){ const v = 128 + (Math.random()-.5)*90; id.data[i] = id.data[i+1] = id.data[i+2] = v; id.data[i+3] = 255; }
  gx.putImageData(id, 0, 0);
  FLOATS = Array.from({length:120}, () => ({x:rnd(0, W), y:rnd(40, LH - 60), p:rnd(0, 6), s:rnd(.6, 1.2)}));
}
function drawLayer(img, par){ const sx = S.cam.x*par, sy = S.cam.y*par; ctx.drawImage(img, sx, sy, VW, VH, 0, 0, VW, VH); }
function drawFloats(){
  const kind = theme().floats;
  ctx.save(); if (kind !== 'petal') ctx.globalCompositeOperation = 'lighter';
  for (const f of FLOATS){
    const x = f.x + Math.sin(S.time*.4 + f.p)*30, y = f.y + Math.sin(S.time*.7 + f.p*1.3)*20 - (kind === 'ember' ? (S.time*12*f.s) % 200 : 0);
    if (x < S.cam.x - 30 || x > S.cam.x + VW + 30 || y < S.cam.y - 30 || y > S.cam.y + VH + 30) continue;
    const a = .4 + .6*Math.max(0, Math.sin(S.time*1.6 + f.p*3));
    if (kind === 'ember'){ glow(x, y, 10*f.s, 'rgba(255,170,90,A)', .3*a); ctx.fillStyle = `rgba(255,220,160,${.8*a})`; ctx.fillRect(x - 1, y - 1, 2, 2); }
    else if (kind === 'dust'){ ctx.fillStyle = `rgba(255,220,150,${.35*a})`; ctx.fillRect(x, y, 2, 2); }
    else { ctx.save(); ctx.translate(x, y); ctx.rotate(S.time + f.p); ctx.fillStyle = `rgba(255,${190 + (f.p*10|0)},${200},${.55*a})`; ctx.beginPath(); ctx.ellipse(0, 0, 3.5*f.s, 1.8*f.s, 0, 0, Math.PI*2); ctx.fill(); ctx.restore(); }
  }
  ctx.restore();
}
function drawForeground(){
  for (const it of FG.items){
    const img = FG[it.img], x = it.x - S.cam.x*1.28, w = img.width*it.s;
    if (x + w < -40 || x > VW + 40) continue;
    ctx.save(); ctx.globalAlpha = .8;
    ctx.translate(x + w/2, VH + 40 - (S.cam.y - (LH - VH))*.3); ctx.scale(it.flip ? -it.s : it.s, it.s); ctx.drawImage(img, -img.width/2, -img.height);
    ctx.restore();
  }
}

/* ================= Тайлы ================= */
function drawTiles(){
  const W = S.W, th = theme(), c0 = Math.max(0, Math.floor(S.cam.x/T) - 1), c1 = Math.min(W.cols - 1, c0 + Math.ceil(VW/T) + 2);
  const r0 = Math.max(0, Math.floor(S.cam.y/T) - 1), r1 = Math.min(ROWS - 1, r0 + Math.ceil(VH/T) + 2);
  for (let r=r0;r<=r1;r++) for (let c=c0;c<=c1;c++){
    const t = W.grid[r][c], x = c*T, y = r*T;
    if (t === '#'){
      const top = !SOLID.has(tileAt(c, r-1)), depth = Math.min(4, (() => { let d = 0; while (d < 4 && SOLID.has(tileAt(c, r - d - 1))) d++; return d; })());
      ctx.fillStyle = th.stone[depth]; ctx.fillRect(x, y, T, T);
      ctx.fillStyle = 'rgba(14,12,26,.32)'; const off = (r % 2) * 16; ctx.fillRect(x, y + 15, T, 2); ctx.fillRect(x + ((off + 31) % 32), y, 2, 15); ctx.fillRect(x + ((off + 15) % 32), y + 17, 2, 15);
      if (hash(c, r, 3) % 5 === 0){ ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.beginPath(); ctx.ellipse(x + 10 + hash(c,r,4)%12, y + 8 + hash(c,r,5)%14, 4, 2.5, 0, 0, Math.PI*2); ctx.fill(); }
      if (!SOLID.has(tileAt(c-1, r))){ ctx.fillStyle = INK; ctx.fillRect(x, y, 2, T); }
      if (!SOLID.has(tileAt(c+1, r))){ ctx.fillStyle = INK; ctx.fillRect(x + T - 2, y, 2, T); }
      if (top){
        if (th.edge === 'moss'){
          ctx.beginPath(); ctx.moveTo(x - (SOLID.has(tileAt(c-1,r)) ? 0 : 1), y + 2);
          for (let i=0;i<=8;i++){ const xx = x + i*4, h = 8 + Math.sin((c*8 + i)*1.3)*2.6 + (hash(c, i, 7) % 3); ctx.lineTo(xx, y + h); }
          ctx.lineTo(x + T + 1, y + 2); ctx.lineTo(x + T + 1, y - 2); ctx.lineTo(x - 1, y - 2); ctx.closePath();
          ctx.fillStyle = '#6E9A52'; ctx.fill(); ctx.fillStyle = '#9AC86E'; ctx.fillRect(x, y - 2, T, 3); ctx.fillStyle = INK; ctx.fillRect(x, y - 3, T, 2);
          if (hash(c, r, 12) % 7 === 0){ ctx.fillStyle = ['#E68AC8','#F2C14E','#8FB8F0'][hash(c,r,13)%3]; ctx.beginPath(); ctx.arc(x + 20, y - 6, 2.6, 0, Math.PI*2); ctx.fill(); }
        } else if (th.edge === 'brass'){
          ctx.fillStyle = '#B8863A'; ctx.fillRect(x, y - 2, T, 7); ctx.fillStyle = '#E8C66A'; ctx.fillRect(x, y - 2, T, 2);
          ctx.fillStyle = INK; ctx.fillRect(x, y - 4, T, 2); ctx.fillRect(x, y + 5, T, 1.5);
          if (c % 2 === 0){ ctx.fillStyle = '#6E4A1E'; ctx.beginPath(); ctx.arc(x + 8, y + 1.5, 1.6, 0, Math.PI*2); ctx.arc(x + 24, y + 1.5, 1.6, 0, Math.PI*2); ctx.fill(); }
        } else {
          ctx.fillStyle = '#6A6E86'; ctx.fillRect(x, y - 2, T, 6); ctx.fillStyle = '#8A8EA6'; ctx.fillRect(x, y - 2, T, 2);
          ctx.fillStyle = INK; ctx.fillRect(x, y - 4, T, 2); ctx.fillRect(x + (c % 2 ? 0 : 15), y - 2, 1.5, 6);
          if (hash(c, r, 9) % 6 === 0){ ctx.strokeStyle = 'rgba(120,150,110,.8)'; ctx.lineWidth = 1.6; ctx.beginPath(); const gx = x + 6 + hash(c,r,10)%20; ctx.moveTo(gx, y - 2); ctx.lineTo(gx - 2, y - 8); ctx.moveTo(gx + 2, y - 2); ctx.lineTo(gx + 4, y - 7); ctx.stroke(); }
        }
      }
    } else if (t === '='){
      const l = tileAt(c-1, r) === '=', rr = tileAt(c+1, r) === '=', iron = th.edge === 'brass';
      ctx.fillStyle = iron ? '#5A5A66' : '#8A5A3C'; ctx.fillRect(x, y, T, 11); ctx.fillStyle = iron ? '#8A8A98' : '#B47E52'; ctx.fillRect(x, y, T, 3);
      if (iron){ ctx.fillStyle = '#3A3A46'; ctx.beginPath(); ctx.arc(x + 6, y + 6.5, 1.6, 0, Math.PI*2); ctx.arc(x + 26, y + 6.5, 1.6, 0, Math.PI*2); ctx.fill(); }
      else { ctx.fillStyle = 'rgba(40,20,10,.35)'; ctx.fillRect(x + 15, y + 3, 1.5, 8); }
      ctx.fillStyle = INK; ctx.fillRect(x, y - 2, T, 2); ctx.fillRect(x, y + 11, T, 2);
      const brace = iron ? '#3A3A46' : '#5E3C28';
      if (!l){ ctx.fillRect(x - 2, y - 2, 2, 15); ctx.beginPath(); ctx.moveTo(x + 4, y + 13); ctx.lineTo(x + 14, y + 13); ctx.lineTo(x + 4, y + 24); ctx.closePath(); ctx.fillStyle = brace; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke(); }
      if (!rr){ ctx.fillStyle = INK; ctx.fillRect(x + T, y - 2, 2, 15); ctx.beginPath(); ctx.moveTo(x + T - 4, y + 13); ctx.lineTo(x + T - 14, y + 13); ctx.lineTo(x + T - 4, y + 24); ctx.closePath(); ctx.fillStyle = brace; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke(); }
    } else if (t === 'f'){
      const f = W.fades[c+','+r]; if (!f) continue;
      if (f.state === 'gone'){ ctx.setLineDash([3,5]); ctx.strokeStyle = 'rgba(220,200,170,.22)'; ctx.lineWidth = 1.2; ctx.strokeRect(x + 2, y, T - 4, 10); ctx.setLineDash([]); continue; }
      const sh = f.state === 'shake' ? (Math.random() - .5) * 3 * (1 + f.t*4) : 0, al = 1 - f.back;
      ctx.save(); ctx.globalAlpha = .95 * al; ctx.translate(sh, f.state === 'shake' ? f.t*4 : 0);
      ctx.fillStyle = '#7A6248'; ctx.fillRect(x, y, T, 10); ctx.fillStyle = '#9A8060'; ctx.fillRect(x, y, T, 2.5);
      ctx.strokeStyle = 'rgba(30,20,12,.7)'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(x + 6 + (c%3)*4, y); ctx.lineTo(x + 11 + (c%3)*4, y + 5); ctx.lineTo(x + 8 + (c%3)*4, y + 10);
      ctx.moveTo(x + 22, y + 2); ctx.lineTo(x + 26, y + 8); ctx.stroke();
      ctx.fillStyle = INK; ctx.fillRect(x, y - 1.5, T, 1.5); ctx.fillRect(x, y + 10, T, 1.5);
      ctx.restore();
    } else if (t === '^'){
      if (th.spike === 'bramble'){
        ctx.strokeStyle = '#4A3A2E'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y + 26);
        ctx.bezierCurveTo(x + 10, y + 14 + Math.sin(c)*3, x + 20, y + 30, x + T, y + 22 + Math.cos(c)*3); ctx.stroke(); ctx.lineWidth = 1.6; ctx.strokeStyle = INK; ctx.stroke();
        for (let i=0;i<3;i++){ const tx = x + 6 + i*10, ty = y + 21 + Math.sin(c + i)*3; ctx.beginPath(); ctx.moveTo(tx - 3, ty); ctx.lineTo(tx, ty - 9 - (i%2)*3); ctx.lineTo(tx + 3, ty); ctx.closePath(); ctx.fillStyle = '#C24A5A'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.stroke(); }
      } else {
        ctx.fillStyle = '#3A3A46'; ctx.fillRect(x, y + 26, T, 6);
        for (let i=0;i<4;i++){ const tx = x + 4 + i*8; ctx.beginPath(); ctx.moveTo(tx - 4, y + 27); ctx.lineTo(tx, y + 12 - (i%2)*3); ctx.lineTo(tx + 4, y + 27); ctx.closePath();
          ctx.fillStyle = th.spike === 'saw' ? '#C9A15A' : '#A9AEBC'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.stroke(); }
      }
    }
  }
  for (const pt of W.props){ const x = pt.c*T, y = pt.r*T, w = pt.w*T, h = pt.h*T; if (x + w < S.cam.x || x > S.cam.x + VW) continue;
    if (theme() === THEMES.clock){ pathRR(ctx, x + 1, y + 1, w - 2, h - 2, 4); fillInk(ctx, '#6E5A46', 2.2); ctx.fillStyle = '#8A7258'; ctx.fillRect(x + 6, y + 6, w - 12, 5);
      ctx.fillStyle = '#C9A15A'; for (const [ax, ay] of [[8,8],[w-8,8],[8,h-8],[w-8,h-8]]){ ctx.beginPath(); ctx.arc(x + ax, y + ay, 2.4, 0, Math.PI*2); ctx.fill(); } }
    else { pathRR(ctx, x + 1, y + 1, w - 2, h - 2, 3); fillInk(ctx, '#8A5E3C', 2.2); ctx.strokeStyle = 'rgba(40,22,10,.6)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x + 4, y + 4); ctx.lineTo(x + w - 4, y + h - 4); ctx.moveTo(x + w - 4, y + 4); ctx.lineTo(x + 4, y + h - 4); ctx.stroke();
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(x + 4, y + 4, w - 8, h - 8); }
  }
}

/* ================= Объекты мира ================= */
function drawLamp(lp){
  const x = lp.x, y = lp.y;
  ctx.fillStyle = INK; ctx.fillRect(x - 9, y - 6, 18, 6); ctx.fillStyle = '#2E3046'; ctx.fillRect(x - 7, y - 5, 14, 4);
  ctx.fillStyle = '#2E3046'; ctx.fillRect(x - 3, y - 74, 6, 70); ctx.fillStyle = INK; ctx.fillRect(x - 3.8, y - 74, 1.6, 70); ctx.fillRect(x + 2.2, y - 74, 1.6, 70);
  ctx.beginPath(); ctx.moveTo(x - 9, y - 74); ctx.lineTo(x + 9, y - 74); ctx.lineTo(x + 7, y - 70); ctx.lineTo(x - 7, y - 70); ctx.closePath(); fillInk(ctx, '#3A3C56', 1.4);
  ctx.beginPath(); ctx.moveTo(x - 10, y - 74); ctx.lineTo(x - 8, y - 96); ctx.lineTo(x + 8, y - 96); ctx.lineTo(x + 10, y - 74); ctx.closePath();
  if (lp.lit){
    const fl = Math.sin(S.time*13 + x)*1.2 + Math.sin(S.time*7.3)*0.8, pulse = 1 + .08*beatPulse() + lp.glow*.6;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 85, 110*pulse, 'rgba(255,186,100,A)', .34); glow(x, y - 85, 30, 'rgba(255,230,170,A)', .55); ctx.restore();
    const lg = ctx.createLinearGradient(x, y - 96, x, y - 74); lg.addColorStop(0, '#FFF2C4'); lg.addColorStop(1, '#F7A64A'); ctx.fillStyle = lg; ctx.fill();
    ctx.beginPath(); ctx.moveTo(x, y - 92 - fl); ctx.quadraticCurveTo(x + 4, y - 84, x, y - 78); ctx.quadraticCurveTo(x - 4, y - 84, x, y - 92 - fl); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  } else { ctx.fillStyle = 'rgba(70,74,100,.85)'; ctx.fill();
    if (lp.out > 0){ ctx.strokeStyle = `rgba(200,200,220,${.35*lp.out})`; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x, y - 96); ctx.bezierCurveTo(x + 6, y - 110, x - 6, y - 118, x + Math.sin(S.time*2)*4, y - 130); ctx.stroke(); } }
  ctx.beginPath(); ctx.moveTo(x - 10, y - 74); ctx.lineTo(x - 8, y - 96); ctx.lineTo(x + 8, y - 96); ctx.lineTo(x + 10, y - 74); ctx.closePath(); ctx.lineWidth = 1.8; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y - 96); ctx.lineTo(x, y - 74); ctx.lineWidth = 1.2; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 11, y - 96); ctx.lineTo(x, y - 106); ctx.lineTo(x + 11, y - 96); ctx.closePath(); fillInk(ctx, '#3A3C56', 1.6);
  ctx.beginPath(); ctx.arc(x, y - 108, 2.4, 0, Math.PI*2); ctx.fillStyle = INK; ctx.fill();
}
function drawDrop(d){
  if (d.got) return; const y = d.y + Math.sin(d.t*3)*3, fl = Math.sin(d.t*10)*1;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(d.x, y, 20, 'rgba(255,180,90,A)', .4); ctx.restore();
  ctx.beginPath(); ctx.moveTo(d.x, y - 9 - fl); ctx.quadraticCurveTo(d.x + 6, y - 1, d.x + 5, y + 2); ctx.arc(d.x, y + 2, 5, 0, Math.PI); ctx.quadraticCurveTo(d.x - 6, y - 1, d.x, y - 9 - fl);
  const fg = ctx.createLinearGradient(d.x, y - 9, d.x, y + 7); fg.addColorStop(0, '#FFF2C4'); fg.addColorStop(1, '#F7963C'); ctx.fillStyle = fg; ctx.fill(); ctx.lineWidth = 1.4; ctx.strokeStyle = INK; ctx.stroke();
}
function drawFind(f){
  if (f.got) return; const x = f.x, y = f.y, b = Math.sin(f.t*3)*3, kind = curCh().find;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 20, 44, 'rgba(255,240,200,A)', .3); ctx.restore();
  if (kind === 'boltik'){ drawBoltik(ctx, x, y, f.t, 1.15, Math.sin(f.t*.7) > 0 ? 1 : -1, 0); return; }
  ctx.save(); ctx.translate(x, y - 22 + b);
  if (kind === 'seed'){ ctx.beginPath(); ctx.moveTo(0, -12); ctx.bezierCurveTo(10, -6, 9, 8, 0, 11); ctx.bezierCurveTo(-9, 8, -10, -6, 0, -12); fillInk(ctx, '#8ED8A0', 2);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(0, 0, 14, 'rgba(160,255,190,A)', .6); ctx.restore();
    ctx.beginPath(); ctx.moveTo(0, -12); ctx.quadraticCurveTo(6, -20, 12, -18); ctx.lineWidth = 2; ctx.strokeStyle = '#4E8A4A'; ctx.stroke(); }
  else { ctx.rotate(Math.sin(f.t*2)*.12); pathRR(ctx, -14, -9, 28, 18, 2); fillInk(ctx, '#F4EAD2', 2);
    ctx.beginPath(); ctx.moveTo(-14, -9); ctx.lineTo(0, 3); ctx.lineTo(14, -9); ctx.lineWidth = 1.6; ctx.strokeStyle = INK; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 2, 3.2, 0, Math.PI*2); ctx.fillStyle = '#C24A4A'; ctx.fill(); }
  ctx.restore();
}
function drawShade(k){
  const cx = k.x + 13, by = k.y + k.h, t = k.t, beetle = theme() === THEMES.clock;
  if (k.dead){ ctx.save(); ctx.globalAlpha = 1 - k.dead*2; ctx.beginPath(); ctx.arc(cx, by - 10, 14 + k.dead*40, 0, Math.PI*2); ctx.strokeStyle = '#FFE3A8'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); return; }
  if (beetle){
    ctx.save(); ctx.translate(cx, by - 10);
    ctx.strokeStyle = INK; ctx.lineWidth = 1.6; for (let i=-1;i<=1;i++){ const st = Math.sin(t*14 + i)*3; ctx.beginPath(); ctx.moveTo(i*6, 4); ctx.lineTo(i*8 + st, 11); ctx.stroke(); }
    ctx.beginPath(); ctx.ellipse(0, 0, 14, 10, 0, Math.PI, 0); ctx.lineTo(14, 4); ctx.lineTo(-14, 4); ctx.closePath(); fillInk(ctx, '#8A6A3A', 2);
    ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, 4); ctx.lineWidth = 1.4; ctx.strokeStyle = INK; ctx.stroke();
    ctx.beginPath(); ctx.arc(k.dir*13, -2, 5.5, 0, Math.PI*2); fillInk(ctx, '#6E5230', 1.6);
    ctx.fillStyle = '#FF5A3A'; ctx.beginPath(); ctx.arc(k.dir*15, -3, 1.8, 0, Math.PI*2); ctx.fill();
    ctx.save(); ctx.translate(-k.dir*4, -12); ctx.rotate(t*6); ctx.fillStyle = '#C9A15A'; ctx.fillRect(-1, -6, 2, 6); ctx.fillRect(-4, -7, 8, 2); ctx.restore();
    ctx.restore(); return;
  }
  ctx.beginPath();
  for (let i=0;i<=16;i++){ const a = Math.PI + i/16*Math.PI, r = 14 + Math.sin(t*6 + i*1.7)*1.8; const x = cx + Math.cos(a)*r*1.05, y = by - 2 + Math.sin(a)*r*1.2; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.quadraticCurveTo(cx, by + 2, cx - 14.7, by - 2); ctx.closePath(); fillInk(ctx, '#2E2644', 2);
  ctx.fillStyle = 'rgba(140,120,200,.18)'; ctx.beginPath(); ctx.ellipse(cx - 4, by - 16, 5, 3, -.4, 0, Math.PI*2); ctx.fill();
  const ex = k.dir*3;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(cx + ex, by - 12, 14, 'rgba(190,150,255,A)', .5); ctx.restore();
  ctx.fillStyle = '#E9DCFF'; ctx.beginPath(); ctx.ellipse(cx - 4 + ex, by - 12, 2.6, 3.4, 0, 0, Math.PI*2); ctx.ellipse(cx + 4 + ex, by - 12, 2.6, 3.4, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#2E2644'; ctx.lineWidth = 2; for (let i=0;i<3;i++){ const wx = cx - 8 + i*8; ctx.beginPath(); ctx.moveTo(wx, by - 26 + Math.sin(t*5 + i)*2); ctx.quadraticCurveTo(wx + 3, by - 32, wx + Math.sin(t*4 + i)*3, by - 36); ctx.stroke(); }
}
function drawMoth(m){
  const x = m.x + 13, y = m.y + 10, f = .3 + .7*Math.abs(Math.sin(m.t*12));
  ctx.save(); if (m.dead) ctx.globalAlpha = 1 - m.dead*3; ctx.translate(x, y);
  for (const sd of [-1,1]){ ctx.save(); ctx.scale(sd*f, 1);
    ctx.beginPath(); ctx.ellipse(8, -4, 9, 6, -.5, 0, Math.PI*2); fillInk(ctx, '#6E6880', 1.6);
    ctx.beginPath(); ctx.ellipse(6, 4, 5.5, 4, .5, 0, Math.PI*2); fillInk(ctx, '#58526A', 1.6);
    ctx.fillStyle = 'rgba(255,140,80,.55)'; ctx.beginPath(); ctx.arc(9, -4, 2.4, 0, Math.PI*2); ctx.fill(); ctx.restore(); }
  pathRR(ctx, -2.5, -7, 5, 15, 2.5); fillInk(ctx, '#3E3850', 1.4);
  ctx.fillStyle = '#FFB070'; ctx.beginPath(); ctx.arc(-1.2, -5, 1, 0, Math.PI*2); ctx.arc(1.2, -5, 1, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}
function drawDoor(d){
  const x = d.x, y = d.y, open = S.flags.exitOpen;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x + 32, y + 56, 130, 'rgba(255,200,120,A)', open ? .3 : .08); ctx.restore();
  ctx.beginPath(); ctx.moveTo(x, y + d.h); ctx.lineTo(x, y + 30); ctx.quadraticCurveTo(x + 32, y - 14, x + 64, y + 30); ctx.lineTo(x + 64, y + d.h); ctx.closePath(); fillInk(ctx, '#4A3A30', 3);
  ctx.beginPath(); ctx.moveTo(x + 8, y + d.h); ctx.lineTo(x + 8, y + 34); ctx.quadraticCurveTo(x + 32, y + 2, x + 56, y + 34); ctx.lineTo(x + 56, y + d.h); ctx.closePath();
  if (open){ const lg = ctx.createLinearGradient(x, y, x, y + d.h); lg.addColorStop(0, '#FFE7B0'); lg.addColorStop(1, '#F2A85A'); ctx.fillStyle = lg; } else ctx.fillStyle = '#2A2230';
  ctx.fill();
  ctx.strokeStyle = '#4A3A30'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 32, y + 14); ctx.lineTo(x + 32, y + d.h); ctx.moveTo(x + 8, y + 52); ctx.lineTo(x + 56, y + 52); ctx.stroke();
}
function drawMover(m){
  const x = m.x, y = m.y, w = m.w, clock = theme() === THEMES.clock;
  ctx.fillStyle = clock ? '#8A6A3A' : '#8A5A3C'; ctx.fillRect(x, y, w, 12); ctx.fillStyle = clock ? '#E8C66A' : '#B47E52'; ctx.fillRect(x, y, w, 3);
  ctx.fillStyle = INK; ctx.fillRect(x, y - 2, w, 2); ctx.fillRect(x, y + 12, w, 2); ctx.fillRect(x - 2, y - 2, 2, 16); ctx.fillRect(x + w, y - 2, 2, 16);
  for (const gx of [x + 14, x + w - 14]){ ctx.save(); ctx.translate(gx, y + 18); ctx.rotate((m.x + m.y)*.04); gearPath(ctx, 8, 8, .3); fillInk(ctx, clock ? '#C9A15A' : '#7A7E96', 1.4); ctx.beginPath(); ctx.arc(0, 0, 2.4, 0, Math.PI*2); ctx.fillStyle = INK; ctx.fill(); ctx.restore(); }
  ctx.save(); ctx.globalAlpha = .25; ctx.strokeStyle = '#E8C66A'; ctx.setLineDash([4, 8]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.x0 + w/2, m.y0 + 6); ctx.lineTo(m.x1 + w/2, m.y1 + 6); ctx.stroke(); ctx.restore();
}
function drawWinds(){
  for (const w of S.W.winds){ if (w.x + w.w < S.cam.x || w.x > S.cam.x + VW) continue;
    const g = ctx.createLinearGradient(0, w.y + w.h, 0, w.y); g.addColorStop(0, 'rgba(230,240,255,.22)'); g.addColorStop(1, 'rgba(230,240,255,0)');
    ctx.fillStyle = g; ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.strokeStyle = 'rgba(240,248,255,.45)'; ctx.lineWidth = 2;
    for (let i=0;i<6;i++){ const xx = w.x + 8 + ((i*37) % (w.w - 16)), yy = w.y + w.h - ((S.time*300 + i*90) % w.h); ctx.beginPath(); ctx.moveTo(xx, yy); ctx.quadraticCurveTo(xx + 6, yy - 14, xx, yy - 28); ctx.stroke(); }
    ctx.fillStyle = '#5A4E5E'; ctx.fillRect(w.x - 4, w.y + w.h - 6, w.w + 8, 8); ctx.fillStyle = INK; for (let xx = w.x; xx < w.x + w.w; xx += 10) ctx.fillRect(xx, w.y + w.h - 6, 3, 8);
  }
}
function drawDeco(dc){
  const x = dc.x, y = dc.y;
  if (dc.kind === 'stall'){ // чайная лавка Мико
    ctx.fillStyle = '#3A2A3E'; ctx.fillRect(x - 4, y - 120, 8, 120); ctx.fillRect(x + 132, y - 120, 8, 120);
    for (let i=0;i<6;i++){ ctx.beginPath(); ctx.moveTo(x - 10 + i*26, y - 126); ctx.lineTo(x + 16 + i*26, y - 126); ctx.lineTo(x + 16 + i*26, y - 104); ctx.quadraticCurveTo(x + 3 + i*26, y - 96, x - 10 + i*26, y - 104); ctx.closePath(); fillInk(ctx, i % 2 ? '#E8DCC8' : '#7A3E9A', 1.6); }
    pathRR(ctx, x + 6, y - 48, 124, 12, 3); fillInk(ctx, '#6E4A34', 2); ctx.fillStyle = '#4E3424'; ctx.fillRect(x + 14, y - 36, 8, 36); ctx.fillRect(x + 114, y - 36, 8, 36);
    ctx.beginPath(); ctx.ellipse(x + 40, y - 58, 11, 9, 0, 0, Math.PI*2); fillInk(ctx, '#C9A15A', 1.6); ctx.beginPath(); ctx.moveTo(x + 50, y - 60); ctx.lineTo(x + 60, y - 66); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
    for (let i=0;i<3;i++){ pathRR(ctx, x + 70 + i*16, y - 58, 10, 10, 2); fillInk(ctx, '#F4EAD2', 1.4); }
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x + 64, y - 80, 60, 'rgba(255,190,120,A)', .25); ctx.restore();
    signBoard(x + 68, y - 146, 'ЧАЙ · ГАДАНИЕ', '#7A3E9A');
  } else if (dc.kind === 'workshop'){ // мастерская фонарщиков
    pathRR(ctx, x, y - 150, 150, 150, 4); fillInk(ctx, '#3A3044', 2.4);
    ctx.beginPath(); ctx.moveTo(x - 12, y - 150); ctx.lineTo(x + 75, y - 200); ctx.lineTo(x + 162, y - 150); ctx.closePath(); fillInk(ctx, '#4A3A52', 2.4);
    ctx.beginPath(); ctx.moveTo(x + 50, y); ctx.lineTo(x + 50, y - 70); ctx.quadraticCurveTo(x + 75, y - 96, x + 100, y - 70); ctx.lineTo(x + 100, y); ctx.closePath(); fillInk(ctx, '#6E4A34', 2.2);
    pathRR(ctx, x + 112, y - 110, 26, 30, 3); ctx.fillStyle = 'rgba(255,200,120,.85)'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x + 125, y - 95, 50, 'rgba(255,190,110,A)', .3); ctx.restore();
    signBoard(x + 75, y - 128, 'ФОНАРЩИКИ', '#B9572A'); lampSign(ctx, x + 22, y - 112);
  } else if (dc.kind === 'poster'){ // объявление Врана
    ctx.save(); ctx.translate(x, y - 90); ctx.rotate(-.04); pathRR(ctx, -34, -40, 68, 74, 2); fillInk(ctx, '#E9DFC8', 1.8);
    ctx.fillStyle = '#7E2E3C'; ctx.font = `900 11px ${SANS}`; ctx.textAlign = 'center'; ctx.fillText('ПОКУПАЮ', 0, -20); ctx.fillText('ОГОНЬ', 0, -6);
    ctx.fillStyle = INK; ctx.font = `700 9px ${SANS}`; ctx.fillText('дорого, тихо', 0, 10); ctx.font = `italic 700 13px ${SERIF}`; ctx.fillText('— В.', 10, 26); ctx.restore();
  } else if (dc.kind === 'sign'){ signBoard(x, y - (dc.h || 60), dc.text, dc.col || '#4A3A30'); ctx.fillStyle = '#3A2A20'; ctx.fillRect(x - 3, y - (dc.h || 60) + 10, 6, (dc.h || 60) - 10); }
  else if (dc.kind === 'greenhouse'){ // оранжерея Марты
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x + 110, y - 100, 160, 'rgba(160,255,200,A)', .2); ctx.restore();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 110); ctx.quadraticCurveTo(x + 110, y - 230, x + 220, y - 110); ctx.lineTo(x + 220, y); ctx.closePath();
    ctx.fillStyle = 'rgba(190,240,220,.22)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#3A2A40'; ctx.stroke();
    ctx.lineWidth = 2.4; for (let i=1;i<6;i++){ const xx = x + i*36.6; ctx.beginPath(); ctx.moveTo(xx, y); ctx.lineTo(xx, y - 110 - Math.sin(i/6*Math.PI)*110); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(x, y - 60); ctx.lineTo(x + 220, y - 60); ctx.stroke();
    for (let i=0;i<7;i++){ const px = x + 18 + i*30; ctx.save(); ctx.translate(px, y); for (let l=0;l<3;l++){ ctx.save(); ctx.rotate((l-1)*.5); leafShape(ctx, 24 + (i%3)*6, 8, 2); ctx.fillStyle = l === 1 ? '#7AC08A' : '#5A9A6A'; ctx.fill(); ctx.restore(); }
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(0, -24, 16, 'rgba(180,255,200,A)', .5 + .2*Math.sin(S.time*2 + i)); ctx.restore(); ctx.restore(); }
  } else if (dc.kind === 'beacon'){ // Большой фонарь на маяке
    const lit = S.flags.beaconLit, pulse = 1 + .1*Math.sin(S.time*2);
    pathRR(ctx, x - 70, y - 30, 140, 30, 4); fillInk(ctx, '#4A3A52', 2.4);
    ctx.beginPath(); ctx.moveTo(x - 50, y - 30); ctx.lineTo(x - 40, y - 150); ctx.lineTo(x + 40, y - 150); ctx.lineTo(x + 50, y - 30); ctx.closePath();
    if (lit){ ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 90, 340*pulse, 'rgba(255,200,120,A)', .45); glow(x, y - 90, 90, 'rgba(255,245,210,A)', .7); ctx.restore();
      const lg = ctx.createLinearGradient(x, y - 150, x, y - 30); lg.addColorStop(0, '#FFF6D8'); lg.addColorStop(1, '#F7A64A'); ctx.fillStyle = lg; } else ctx.fillStyle = 'rgba(60,60,90,.85)';
    ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
    for (let i=-1;i<=1;i++){ ctx.beginPath(); ctx.moveTo(x + i*22, y - 150); ctx.lineTo(x + i*26, y - 30); ctx.lineWidth = 2; ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(x - 56, y - 150); ctx.lineTo(x, y - 196); ctx.lineTo(x + 56, y - 150); ctx.closePath(); fillInk(ctx, '#5A4A62', 2.4);
  } else if (dc.kind === 'bench'){ // верстак Гисы
    ctx.save(); ctx.translate(x - 30, y - 230); ctx.rotate(S.time*.4); gearPath(ctx, 46, 12); fillInk(ctx, '#8A6A3A', 2.4); ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI*2); ctx.fillStyle = INK; ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(x + 60, y - 200); ctx.rotate(-S.time*.7); gearPath(ctx, 26, 9); fillInk(ctx, '#C9A15A', 2); ctx.restore();
    pathRR(ctx, x - 40, y - 52, 190, 14, 3); fillInk(ctx, '#7A5236', 2.2);
    ctx.fillStyle = '#4E3420'; ctx.fillRect(x - 32, y - 38, 10, 38); ctx.fillRect(x + 132, y - 38, 10, 38);
    ctx.save(); ctx.translate(x - 10, y - 52); ctx.rotate(-.3); ctx.fillStyle = '#9AA0A8'; ctx.fillRect(0, -4, 34, 6); ctx.restore();
    pathRR(ctx, x + 40, y - 74, 30, 22, 4); fillInk(ctx, '#C9A15A', 1.8);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x + 100, y - 90, 70, 'rgba(255,210,140,A)', .3); ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 100, y - 52); ctx.lineTo(x + 108, y - 92); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 110, y - 96, 8, 0, Math.PI*2); ctx.fillStyle = '#FFE0A0'; ctx.fill(); ctx.stroke();
    drawBoltik(ctx, x + 20, y - 52, S.time + 3, .8, 1, 1);
    signBoard(x + 55, y - 140, 'МАСТЕРСКАЯ ГИСЫ', '#B9801A');
  } else if (dc.kind === 'mailbox'){
    ctx.fillStyle = '#3A2A20'; ctx.fillRect(x - 3, y - 50, 6, 50); pathRR(ctx, x - 16, y - 76, 32, 28, 6); fillInk(ctx, '#B4463C', 2);
    ctx.fillStyle = INK; ctx.fillRect(x - 10, y - 66, 20, 3);
  }
}
function signBoard(x, y, text, col){
  ctx.font = `900 13px ${SANS}`; const w = ctx.measureText(text).width + 22;
  pathRR(ctx, x - w/2, y - 13, w, 26, 4); fillInk(ctx, '#E9DFC8', 2);
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y + 1);
}
// знак фонарщиков: фонарь в круге (у Акселя — сломанный)
function lampSign(c, x, y, broken=false){
  c.save(); c.translate(x, y); c.beginPath(); c.arc(0, 0, 13, 0, Math.PI*2); fillInk(c, '#C9A15A', 2);
  c.beginPath(); c.moveTo(-5, 6); c.lineTo(-4, -4); c.lineTo(4, -4); c.lineTo(5, 6); c.closePath(); fillInk(c, '#FFE0A0', 1.4);
  c.beginPath(); c.moveTo(-6, -4); c.lineTo(0, -9); c.lineTo(6, -4); c.lineWidth = 1.6; c.strokeStyle = INK; c.stroke();
  if (broken){ c.beginPath(); c.moveTo(-12, -6); c.lineTo(-2, 1); c.lineTo(3, -3); c.lineTo(12, 7); c.lineWidth = 2.4; c.strokeStyle = INK; c.stroke(); }
  c.restore();
}
function fmtHint(t){
  const tu = touchUI();
  return t.replace('{lr}', tu ? '◀ ▶' : `${keyLabel('left')} ${keyLabel('right')}`).replace('{jump}', tu ? '▲' : keyLabel('jump'))
    .replace('{down}', tu ? '▼' : keyLabel('down')).replace('{sprint}', tu ? '' : ` · ${keyLabel('sprint')} — быстрее`);
}
function drawHint(h){
  if (h.a <= .01) return; const x = h.c*T, y = h.r*T, text = fmtHint(h.t);
  ctx.save(); ctx.globalAlpha = h.a; ctx.font = `800 14px ${SANS}`; const w = ctx.measureText(text).width + 26;
  ctx.translate(x, y + Math.sin(S.time*2)*2); ctx.rotate(-.015);
  pathRR(ctx, -w/2, -16, w, 32, 8); ctx.fillStyle = 'rgba(244,237,223,.94)'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#E8823A'; ctx.beginPath(); ctx.arc(0, -16, 3.5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 1);
  ctx.restore();
}
function bubble(x, y, text, col='#2B2233'){
  ctx.font = `800 15px ${SANS}`; const w = ctx.measureText(text).width + 24, bx = clamp(x - w/2, S.cam.x + 8, S.cam.x + VW - w - 8), by = y - 34;
  pathRR(ctx, bx, by, w, 30, 12); ctx.fillStyle = '#FFFBF2'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 6, by + 29); ctx.lineTo(x, by + 40); ctx.lineTo(x + 6, by + 29); ctx.fillStyle = '#FFFBF2'; ctx.fill();
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, bx + w/2, by + 15.5);
}
function drawCharAt(who, x, y, face, pose, sx=1, sy=1, alpha=1){
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.scale(sx*face*CHS, sy*CHS); drawChar(ctx, who, pose); ctx.restore();
  ctx.save(); ctx.globalAlpha = .25*alpha; ctx.fillStyle = '#05040A'; ctx.beginPath(); ctx.ellipse(x, y + 1, 14, 3.5, 0, 0, Math.PI*2); ctx.fill(); ctx.restore();
}
function drawNpcs(){
  const sc = S.scene, speaking = sc && sc.who, typing = sc && sc.lines[sc.i] && sc.shown < sc.lines[sc.i].t.length;
  for (const n of S.W.npcs){
    if (n.alpha <= .01) continue;
    if (n.who === 'boltik'){ ctx.save(); ctx.globalAlpha = n.alpha; drawBoltik(ctx, n.x, n.y, n.t, 1.2, n.face, 1); ctx.restore(); }
    else if (n.who === 'pigeon'){ ctx.save(); ctx.globalAlpha = n.alpha; drawPigeon(ctx, n.x, n.y - 10, n.t, 1.5, n.face); ctx.restore(); }
    else {
      const moving = n.state === 'walk' || n.state === 'leave';
      drawCharAt(n.who, n.x, n.y, n.face, {t:S.time + n.t, phase:n.phase, run:moving ? 1 : 0, air:!!n.air, vy:n.air ? 1 : 0, blink:((S.time + n.t) % 3.6) < .12,
        emo:n.emo || '', talk:speaking === n.who && typing, wave:n.wave, sway:{x:moving ? -n.face*5 : 0, y:0}}, 1, 1, n.alpha);
      if (n.who === 'cherry') drawButterfly(ctx, n.x + Math.sin(S.time*1.3)*22, n.y - 66 + Math.sin(S.time*2.1)*8, S.time, .9, '#FF9A3C', true, n.alpha);
    }
    if (n.sayT > 0 && n.say && S.mode === 'play') bubble(n.x, n.y - (n.who === 'boltik' ? 44 : 70), n.say, NAMECOL[n.who] || INK);
  }
}
function drawPlayer(){
  const p = S.P; if (S.mode === 'faint' && Math.floor(S.time*20) % 2) return;
  if (p.inv > 0 && Math.floor(p.inv*14) % 2 && S.mode === 'play') return;
  const sc = S.scene, typing = sc && sc.who === 'aya' && sc.lines[sc.i] && sc.shown < sc.lines[sc.i].t.length;
  const pose = {phase:p.phase, run:p.onGround ? clamp(Math.abs(p.vx)/260, 0, 1) : 0, air:!p.onGround, vy:p.vy, t:S.time, blink:(S.time % 3.7) < .12, sway:p.sway,
    emo: p.inv > .9 ? 'surprised' : (sc && sc.who === 'aya' ? (sc.lines[sc.i].e || '') : ''), talk:typing};
  drawCharAt('aya', p.x + p.w/2, p.y + p.h, p.face, pose, p.sx, p.sy);
}
function drawWave(){
  const w = S.wave; if (!w) return; const x = w.x; if (x < S.cam.x - 80) return;
  ctx.save();
  ctx.beginPath(); ctx.moveTo(S.cam.x - 20, S.cam.y - 20);
  for (let y = S.cam.y - 20; y <= S.cam.y + VH + 20; y += 18){ ctx.lineTo(x + Math.sin(y*.05 + w.t*3)*16 + Math.sin(y*.13 - w.t*5)*7, y); }
  ctx.lineTo(S.cam.x - 20, S.cam.y + VH + 20); ctx.closePath();
  const g = ctx.createLinearGradient(x - 300, 0, x + 20, 0); g.addColorStop(0, '#120E1E'); g.addColorStop(.8, '#2A2244'); g.addColorStop(1, 'rgba(70,60,110,.9)');
  ctx.fillStyle = g; ctx.fill();
  ctx.clip();
  for (let i=0;i<26;i++){ const yy = S.cam.y + (i*41 + w.t*16) % VH, xx = x - 40 - (hash(i,2,3) % 420); ctx.fillStyle = 'rgba(150,130,220,.12)'; ctx.beginPath(); ctx.ellipse(xx, yy, 60, 18, 0, 0, Math.PI*2); ctx.fill(); }
  for (let i=0;i<6;i++){ const yy = S.cam.y + 60 + i*80 + Math.sin(w.t + i)*10, xx = x - 60 - (hash(i,7,1) % 300); ctx.fillStyle = 'rgba(210,190,255,.75)'; ctx.beginPath(); ctx.arc(xx, yy, 2.4, 0, Math.PI*2); ctx.arc(xx + 9, yy, 2.4, 0, Math.PI*2); ctx.fill(); }
  ctx.restore();
  ctx.strokeStyle = 'rgba(160,140,230,.6)'; ctx.lineWidth = 2; ctx.beginPath();
  for (let y = S.cam.y - 20; y <= S.cam.y + VH + 20; y += 18){ const xx = x + Math.sin(y*.05 + w.t*3)*16 + Math.sin(y*.13 - w.t*5)*7; y === S.cam.y - 20 ? ctx.moveTo(xx, y) : ctx.lineTo(xx, y); }
  ctx.stroke();
  if (Math.random() < .5) S.particles.push({x:x + 4, y:S.cam.y + rnd(0, VH), vx:rnd(20,80), vy:rnd(-30,30), life:.9, t:0, c:'rgba(120,100,180,.6)', s:rnd(4,8), g:-10, kind:'dot', drag:1});
}
function drawParticles(front){
  for (const q of S.particles){
    const a = 1 - q.t/q.life; if ((q.kind === 'text') !== front) continue;
    ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, a*1.5));
    if (q.kind === 'text'){ ctx.font = `900 16px ${SANS}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeText(q.txt, q.x, q.y); ctx.fillStyle = q.c; ctx.fillText(q.txt, q.x, q.y); }
    else if (q.kind === 'paper'){ ctx.translate(q.x, q.y); ctx.rotate(q.rot); ctx.fillStyle = q.c; ctx.fillRect(-q.s, -q.s*.6, q.s*2, q.s*1.2); }
    else if (q.kind === 'streak'){ ctx.strokeStyle = q.c; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(q.x, q.y + 14); ctx.stroke(); }
    else { ctx.fillStyle = q.c; ctx.beginPath(); ctx.arc(q.x, q.y, q.s*(.4 + a*.6), 0, Math.PI*2); ctx.fill(); }
    ctx.restore();
  }
}

/* ================= HUD ================= */
function drawHUD(){
  for (let i=0;i<3;i++){ const on = i < S.hp, x = 34 + i*34, y = 36; ctx.save(); ctx.globalAlpha = on ? 1 : .35;
    if (on){ ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y, 20, 'rgba(255,170,80,A)', .35); ctx.restore(); }
    ctx.translate(x, y); const fl = on ? Math.sin(S.time*9 + i)*1.2 : 0;
    ctx.beginPath(); ctx.moveTo(0, -13 - fl); ctx.bezierCurveTo(8, -6, 10, 2, 9, 5); ctx.arc(0, 5, 9, 0, Math.PI); ctx.bezierCurveTo(-10, 2, -7, -6, -2, -9); ctx.quadraticCurveTo(-1, -5, 0, -13 - fl); ctx.closePath();
    fillInk(ctx, on ? '#FFA84A' : '#5E5878', 2); if (on){ ctx.beginPath(); ctx.ellipse(0, 6, 4, 5, 0, 0, Math.PI*2); ctx.fillStyle = '#FFF0C0'; ctx.fill(); } ctx.restore(); }
  const dx = 34, dy = 76; ctx.beginPath(); ctx.moveTo(dx, dy - 10); ctx.quadraticCurveTo(dx + 6, dy - 1, dx + 5, dy + 2); ctx.arc(dx, dy + 2, 5, 0, Math.PI); ctx.quadraticCurveTo(dx - 6, dy - 1, dx, dy - 10);
  fillInk(ctx, '#FFC46A', 1.8);
  ctx.font = `900 22px ${SANS}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeText(String(S.drops), 50, 78); ctx.fillStyle = '#FFF4D8'; ctx.fillText(String(S.drops), 50, 78);
  const kind = curCh().find, total = S.W.finds.length;
  if (kind && total){
    for (let i=0;i<total;i++){ const x = 34 + i*32, y = 116, got = i < S.finds; ctx.save(); ctx.globalAlpha = got ? 1 : .32;
      if (kind === 'boltik') drawBoltik(ctx, x, y + 12, S.time + i, .75, 1, got ? 1 : 0);
      else if (kind === 'seed'){ ctx.translate(x, y); ctx.beginPath(); ctx.moveTo(0, -11); ctx.bezierCurveTo(9, -5, 8, 7, 0, 10); ctx.bezierCurveTo(-8, 7, -9, -5, 0, -11); fillInk(ctx, got ? '#8ED8A0' : '#6E6880', 2); }
      else { ctx.translate(x, y); pathRR(ctx, -12, -8, 24, 16, 2); fillInk(ctx, got ? '#F4EAD2' : '#8A8494', 2); ctx.beginPath(); ctx.moveTo(-12, -8); ctx.lineTo(0, 2); ctx.lineTo(12, -8); ctx.lineWidth = 1.5; ctx.strokeStyle = INK; ctx.stroke(); }
      ctx.restore(); }
    ctx.font = `800 12px ${SANS}`; ctx.textAlign = 'left'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(20,16,30,.8)'; ctx.strokeText(FIND_KINDS[kind].many, 22, 146); ctx.fillStyle = 'rgba(244,237,223,.85)'; ctx.fillText(FIND_KINDS[kind].many, 22, 146);
  }
}
// Рисует fn в исходном кадре 960×540, отмасштабированном так, чтобы закрыть весь экран
function inBaseFrame(fn){
  const vw = VW, vh = VH, k = Math.max(vw/960, vh/540);
  ctx.save(); ctx.translate((vw - 960*k)/2, (vh - 540*k)/2); ctx.scale(k, k); VW = 960; VH = 540;
  try { fn(); } finally { VW = vw; VH = vh; ctx.restore(); }
}
function withHud(fn){
  const vw = VW; ctx.save(); ctx.translate(HUD.l, HUD.t); VW = vw - HUD.l - HUD.r;
  try { fn(); } finally { VW = vw; ctx.restore(); }
}
function drawCard(){
  const ch = curCh(), t = S.cardT, a = t < .6 ? t/.6 : t > 2.8 ? Math.max(0, 1 - (t - 2.8)/.8) : 1, bg = t < 2.6 ? 1 : Math.max(0, 1 - (t - 2.6)/1);
  ctx.fillStyle = `rgba(8,8,18,${.92*bg})`; ctx.fillRect(0, 0, VW, VH);
  ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `800 15px ${SANS}`; ctx.fillStyle = '#F2B45A'; ctx.fillText(ch.kicker.split('').join(' '), VW/2, VH/2 - 64);
  ctx.font = `700 60px ${SERIF}`; ctx.fillStyle = '#F7EEDC'; ctx.fillText(ch.title, VW/2, VH/2 - 8);
  ctx.font = `italic 500 20px ${SERIF}`; ctx.fillStyle = '#D9CBB0'; ctx.fillText(ch.sub, VW/2, VH/2 + 44);
  ctx.strokeStyle = 'rgba(242,180,90,.5)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(VW/2 - 120*a, VH/2 + 76); ctx.lineTo(VW/2 + 120*a, VH/2 + 76); ctx.stroke();
  ctx.restore();
}
function drawSlides(){
  const sc = S.scene, slides = curCh().slides; if (!sc || !slides) return;
  const t = sc.slideT || 0, cur = sc.slide || 0;
  ctx.save(); slides[cur](S.time); ctx.restore();
  if (sc.prevSlide !== undefined && sc.prevSlide !== cur && t < .8){ ctx.save(); ctx.globalAlpha = 1 - t/.8; slides[sc.prevSlide](S.time); ctx.restore(); }
  const vg = ctx.createRadialGradient(VW/2, VH/2, VH*.4, VW/2, VH/2, VH); vg.addColorStop(0, 'rgba(10,8,20,0)'); vg.addColorStop(1, 'rgba(10,8,20,.55)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, VW, VH);
  ctx.font = `800 12px ${SANS}`; ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(244,237,223,.6)'; ctx.fillText('ПРОЛОГ', 24, 30);
}
function render(){
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (!S) return;
  if (!LAYERS) buildLayers();
  if (S.prologue && S.scene){ inBaseFrame(() => { drawSlides(); ctx.save(); ctx.translate(-S.cam.x, -S.cam.y); drawParticles(false); ctx.restore(); }); return; }
  const th = theme(), sh = (S.shake > 0 && !REDUCED && SET.shake) ? 7*Math.min(1, S.shake/.3) : 0;
  ctx.save(); ctx.translate(sh ? rnd(-sh, sh) : 0, (sh ? rnd(-sh, sh) : 0));
  th.sky(); if (th.mid) th.mid();
  for (const L of LAYERS) drawLayer(L.img, L.par);
  ctx.save(); ctx.translate(-Math.round(S.cam.x + S.cam.kx), -Math.round(S.cam.y + S.cam.ky));
  drawFloats();
  for (const dc of S.W.deco) if (dc.x > S.cam.x - 300 && dc.x < S.cam.x + VW + 300) drawDeco(dc);
  drawWinds();
  drawTiles();
  for (const m of S.W.movers) drawMover(m);
  for (const lp of S.W.lamps) if (lp.x > S.cam.x - 120 && lp.x < S.cam.x + VW + 120) drawLamp(lp);
  if (S.W.door) drawDoor(S.W.door);
  if (!S.scene && SET.hints && S.mode !== 'title') for (const h of S.W.hints) drawHint(h);
  for (const d of S.W.drops) drawDrop(d);
  for (const f of S.W.finds) drawFind(f);
  for (const k of S.W.kl) drawShade(k);
  for (const m of S.W.moths) drawMoth(m);
  drawNpcs();
  if (S.mode !== 'title') drawPlayer();
  if (!S.V.hidden && S.mode !== 'title') drawIskra(ctx, S.V.x, S.V.y, S.V.t, 1, S.V.scared);
  drawParticles(false);
  drawWave();
  drawParticles(true);
  ctx.restore();
  drawForeground();
  if (th.over) th.over();
  ctx.restore();
  const vg = ctx.createRadialGradient(VW/2, VH*.45, VH*.35, VW/2, VH/2, VH); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, th.vignette);
  ctx.fillStyle = vg; ctx.fillRect(0, 0, VW, VH);
  ctx.save(); ctx.globalAlpha = .05; ctx.fillStyle = ctx.createPattern(GRAIN, 'repeat'); ctx.fillRect(0, 0, VW, VH); ctx.restore();
  if (S.flash > 0){ ctx.fillStyle = `rgba(226,112,58,${S.flash})`; ctx.fillRect(0, 0, VW, VH); }
  if (S.white > 0){ ctx.fillStyle = `rgba(16,12,28,${S.white})`; ctx.fillRect(0, 0, VW, VH);
    if (S.mode === 'faint'){ ctx.font = `italic 500 24px ${SERIF}`; ctx.textAlign = 'center'; ctx.fillStyle = `rgba(244,230,200,${S.white})`; ctx.fillText('Ая переводит дух у фонаря…', VW/2, VH/2); } }
  if (S.mode !== 'title' && S.mode !== 'card' && !S.scene) withHud(drawHUD);
  if (S.scene) renderVN();
  if (S.mode === 'card') drawCard();
  if (G1.paused){ ctx.fillStyle = 'rgba(12,10,22,.45)'; ctx.fillRect(0, 0, VW, VH); }
  if (S.fadeIn > 0){ ctx.fillStyle = `rgba(8,8,16,${Math.min(1, S.fadeIn/.8)})`; ctx.fillRect(0, 0, VW, VH); }
}
