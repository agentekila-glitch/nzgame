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
  },
  // Праздник Большого фонаря: ночной город во флажках, маяк светит вдали, а внизу, в опустившемся тумане, — крыши старых улиц
  festival:{
    floats:'ember', vignette:'rgba(6,10,26,.5)', stone:['#465468','#3D4A5E','#354154','#2E384A','#263040'], edge:'curb', spike:'metal',
    sky(){
      const g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#0A1430'); g.addColorStop(.55, '#1A2A52'); g.addColorStop(1, '#30406E');
      ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
      for (let i=0;i<90;i++){ const x = (hash(i,2,7) % 1000)/1000*VW*1.3 - S.cam.x*.03, y = (hash(i,6,1) % 1000)/1000*VH*.55, tw = .4 + .6*Math.abs(Math.sin(S.time*(.5 + i%4*.3) + i));
        ctx.fillStyle = `rgba(236,240,255,${.45*tw})`; ctx.fillRect(((x % VW) + VW) % VW, y, 1.6, 1.6); }
      // маяк на дальней скале: тёплый свет с голубой каймой и медленные лучи
      const bx = VW*.82 - S.cam.x*.02, by = 150 - S.cam.y*.03;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i=0;i<2;i++){ ctx.save(); ctx.translate(bx, by); ctx.rotate(S.time*.22 + i*Math.PI);
        const lg = ctx.createLinearGradient(0, 0, 520, 0); lg.addColorStop(0, 'rgba(255,226,160,.22)'); lg.addColorStop(1, 'rgba(140,210,255,0)');
        ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(520, -46); ctx.lineTo(520, 46); ctx.closePath(); ctx.fill(); ctx.restore(); }
      glow(bx, by, 120, 'rgba(255,220,150,A)', .45); glow(bx, by, 190, 'rgba(120,200,255,A)', .12);
      ctx.restore();
      ctx.fillStyle = '#121A34'; ctx.beginPath(); ctx.moveTo(bx - 70, VH); ctx.lineTo(bx - 34, by + 90); ctx.lineTo(bx - 10, by + 8); ctx.lineTo(bx + 10, by + 8); ctx.lineTo(bx + 34, by + 90); ctx.lineTo(bx + 80, VH); ctx.fill();
      ctx.fillStyle = '#FFF2C8'; ctx.beginPath(); ctx.arc(bx, by, 7, 0, Math.PI*2); ctx.fill();
      // праздничный салют
      for (let k=0;k<3;k++){ const ph = (S.time*.28 + k*.37) % 1; if (ph > .55) continue;
        const n = Math.floor(S.time*.28 + k*.37), fx = VW*(.15 + (hash(n,k,3) % 600)/1000), fy = 70 + (hash(n,k,9) % 120), r = 20 + ph*150, a = 1 - ph/.55;
        const col = ['255,214,120','140,210,255','255,150,170'][(n + k) % 3];
        for (let i=0;i<16;i++){ const an = i/16*Math.PI*2; ctx.fillStyle = `rgba(${col},${.7*a})`; ctx.beginPath(); ctx.arc(fx + Math.cos(an)*r, fy + Math.sin(an)*r + ph*30, 2.2, 0, Math.PI*2); ctx.fill(); } }
    },
    layers(W, R){
      const win = (c, x, y, w, h) => { const blue = R() < .3; c.fillStyle = blue ? 'rgba(150,215,255,.7)' : 'rgba(255,205,120,.8)'; c.fillRect(x, y, w, h);
        glowOn(c, x + w/2, y + h/2, 24, blue ? 'rgba(130,200,255,A)' : 'rgba(255,190,110,A)', .16); };
      const [w1, h1] = layerSize(.18, W), L1 = mk(w1, h1), a = L1.getContext('2d');
      a.fillStyle = '#131C38'; a.beginPath(); a.moveTo(0, h1); for (let x=0;x<=w1;x+=60) a.lineTo(x, h1*.7 + Math.sin(x*.012)*22 + R()*14); a.lineTo(w1, h1); a.fill();
      for (let x=0;x<w1;){ const w = 26 + R()*46, hh = 70 + R()*170, base = h1*.72 + Math.sin(x*.012)*20; a.fillStyle = '#18214A'; a.fillRect(x, base - hh, w, hh + 40);
        a.beginPath(); a.moveTo(x - 4, base - hh); a.lineTo(x + w/2, base - hh - 16 - R()*14); a.lineTo(x + w + 4, base - hh); a.fill();
        for (let y=base - hh + 10; y < base - 6; y += 14) for (let xx=x+5; xx < x + w - 6; xx += 10) if (R() < .3) win(a, xx, y, 4, 6);
        x += w + 4 + R()*12; }
      const [w2, h2] = layerSize(.42, W), L2 = mk(w2, h2), b = L2.getContext('2d');
      const roofs = [];
      for (let x=-20;x<w2;){ const w = 90 + R()*110, hh = 110 + R()*170, base = h2*.82; b.fillStyle = R() < .5 ? '#1F2A50' : '#232E56'; b.fillRect(x, base - hh, w, hh + 200);
        b.fillStyle = '#2E3A66'; b.beginPath(); b.moveTo(x - 10, base - hh); b.lineTo(x + w*.5, base - hh - 44 - R()*30); b.lineTo(x + w + 10, base - hh); b.closePath(); b.fill();
        for (let y=base - hh + 20; y < base; y += 34) for (let xx=x+14; xx < x + w - 20; xx += 30) if (R() < .45){ win(b, xx, y, 12, 16); b.fillStyle = 'rgba(30,30,60,.8)'; b.fillRect(xx + 5, y, 2, 16); }
        roofs.push([x + w*.5, base - hh - 40]); x += w + 6 + R()*30; }
      // гирлянды флажков между крышами
      for (let i=0;i<roofs.length - 1;i++){ const [x0, y0] = roofs[i], [x1, y1] = roofs[i+1], sag = 40 + R()*30;
        b.strokeStyle = 'rgba(10,10,24,.75)'; b.lineWidth = 2; b.beginPath(); b.moveTo(x0, y0); b.quadraticCurveTo((x0 + x1)/2, (y0 + y1)/2 + sag, x1, y1); b.stroke();
        const n = Math.max(3, Math.floor((x1 - x0)/26));
        for (let k=1;k<n;k++){ const t = k/n, fx = x0 + (x1 - x0)*t, fy = y0 + (y1 - y0)*t + Math.sin(t*Math.PI)*sag*.5*2*.95;
          b.fillStyle = ['#E8823A','#F2C14E','#7FC8E8','#E66A8A','#9FD8A0'][k % 5]; b.beginPath(); b.moveTo(fx - 7, fy); b.lineTo(fx + 7, fy); b.lineTo(fx, fy + 14); b.closePath(); b.fill(); } }
      const [w3, h3] = layerSize(.7, W), L3 = mk(w3, h3), d = L3.getContext('2d');
      // бумажные фонарики на верёвках
      for (let x=90;x<w3;x+=300 + R()*240){ const y = h3*.3 + R()*h3*.15, len = 150 + R()*110;
        d.strokeStyle = '#0E1226'; d.lineWidth = 2; d.beginPath(); d.moveTo(x, y); d.quadraticCurveTo(x + len/2, y + 22, x + len, y); d.stroke();
        for (let i=0;i<5;i++){ const t = (i + .5)/5, lx = x + len*t, ly = y + Math.sin(t*Math.PI)*20 + 10, blue = i % 2;
          glowOn(d, lx, ly + 8, 30, blue ? 'rgba(140,210,255,A)' : 'rgba(255,190,110,A)', .3);
          d.fillStyle = blue ? '#7FC8E8' : '#F2A24E'; d.beginPath(); d.ellipse(lx, ly + 8, 9, 11, 0, 0, Math.PI*2); d.fill();
          d.fillStyle = '#0E1226'; d.fillRect(lx - 5, ly - 4, 10, 3); d.fillRect(lx - 5, ly + 18, 10, 3); }
        d.fillStyle = '#0E1226'; d.fillRect(x - 4, y - 10, 6, h3); d.fillRect(x + len - 2, y - 10, 6, h3); }
      return [{img:L1, par:.18}, {img:L2, par:.42}, {img:L3, par:.7}];
    },
    back(){ // на нижних улицах праздник остаётся где-то наверху: фон темнеет и тонет в сыром тумане
      const ch = curCh(), byCol = ch.deepFromCol ? clamp((S.P.x - ch.deepFromCol*T)/(12*T), 0, 1) : 0;
      const byRow = ch.deepRow ? clamp((S.P.y + S.P.h - ch.deepRow*T)/(3*T), 0, 1) : 0; // спустился под мостовую
      const k = Math.max(byCol, byRow); if (k <= 0) return;
      ctx.fillStyle = `rgba(6,14,26,${.72*k})`; ctx.fillRect(0, 0, VW, VH);
      const g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, `rgba(60,90,120,${.05*k})`); g.addColorStop(1, `rgba(120,150,180,${.3*k})`); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
      ctx.save(); ctx.globalAlpha = .22*k; ctx.fillStyle = '#0C1622';
      for (let i=0;i<7;i++){ const x = ((i*210 - S.cam.x*.35) % (VW + 300) + VW + 300) % (VW + 300) - 150, w = 120 + (i*53 % 80), hh = 180 + (i*71 % 160);
        ctx.fillRect(x, VH - hh, w, hh); ctx.beginPath(); ctx.moveTo(x - 8, VH - hh); ctx.lineTo(x + w/2, VH - hh - 40); ctx.lineTo(x + w + 8, VH - hh); ctx.fill(); }
      ctx.restore();
      for (let i=0;i<14;i++){ const x = (hash(i,4,4) % 1000)/1000*VW, y = ((S.time*40 + i*67) % VH); ctx.fillStyle = `rgba(170,200,230,${.25*k})`; ctx.fillRect(x, y, 1.2, 7); }
    },
    over(){ // опустившийся туман, а в нём — силуэты крыш старых улиц
      const base = VH - (S.cam.y - (LH - VH))*.25;
      const g = ctx.createLinearGradient(0, base - 200, 0, base + 20); g.addColorStop(0, 'rgba(110,130,180,0)'); g.addColorStop(1, 'rgba(110,130,180,.3)');
      ctx.fillStyle = g; ctx.fillRect(0, base - 200, VW, 220);
      ctx.save(); ctx.globalAlpha = .13 + .05*Math.sin(S.time*.4); ctx.fillStyle = '#9FC0E0';
      for (let i=0;i<9;i++){ const x = ((i*170 - S.cam.x*.5) % (VW + 200) + VW + 200) % (VW + 200) - 100, y = base - 40 - (i % 3)*14, w = 70 + (i*37 % 50);
        ctx.beginPath(); ctx.moveTo(x, y + 30); ctx.lineTo(x, y); ctx.lineTo(x + w/2, y - 26 - (i % 2)*10); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + 30); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    }
  },
  // Глава 5, утро: нижние улицы старше города — мокрый камень, лучи света сквозь щели мостовой, капли
  lower:{
    floats:'dust', vignette:'rgba(4,10,18,.62)', stone:['#4E5A5E','#445054','#3B464A','#323C40','#2A3337'], edge:'curb', spike:'metal',
    sky(){
      const g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#0C141C'); g.addColorStop(.6, '#15222C'); g.addColorStop(1, '#22343E');
      ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; // утренние лучи сквозь щели мостовой наверху
      for (let i=0;i<6;i++){ const x = ((i*260 - S.cam.x*.25) % (VW + 400) + VW + 400) % (VW + 400) - 200, a = .05 + .03*Math.sin(S.time*.4 + i);
        const lg = ctx.createLinearGradient(x, 0, x + 120, VH); lg.addColorStop(0, `rgba(255,236,190,${a*2})`); lg.addColorStop(1, 'rgba(255,236,190,0)');
        ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 26, 0); ctx.lineTo(x + 170, VH); ctx.lineTo(x + 90, VH); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    },
    layers(W, R){
      const [w1, h1] = layerSize(.18, W), L1 = mk(w1, h1), a = L1.getContext('2d');
      for (let x=-40;x<w1;x+=180 + R()*60){ const w = 120 + R()*40, top = h1*.35 + R()*h1*.1; a.fillStyle = '#132028'; a.fillRect(x, top, w, h1);
        a.fillStyle = '#0C161C'; a.beginPath(); a.arc(x + w/2, h1*.78, w*.32, Math.PI, 0); a.lineTo(x + w/2 + w*.32, h1); a.lineTo(x + w/2 - w*.32, h1); a.fill(); }
      const [w2, h2] = layerSize(.42, W), L2 = mk(w2, h2), b = L2.getContext('2d');
      for (let x=-20;x<w2;){ const w = 80 + R()*110, hh = 140 + R()*200, base = h2*.85; b.fillStyle = R() < .5 ? '#1A2A32' : '#1E2E36'; b.fillRect(x, base - hh, w, hh + 200);
        b.fillStyle = '#243840'; b.beginPath(); b.moveTo(x - 8, base - hh); b.lineTo(x + w/2, base - hh - 30 - R()*20); b.lineTo(x + w + 8, base - hh); b.fill();
        for (let y=base - hh + 24; y < base - 20; y += 40) for (let xx=x+14; xx < x + w - 20; xx += 30){ b.fillStyle = 'rgba(8,14,18,.85)'; b.fillRect(xx, y, 12, 18); }
        b.fillStyle = 'rgba(140,180,200,.12)'; for (let i=0;i<3;i++) b.fillRect(x + R()*w, base - hh, 2, hh); // подтёки
        x += w + 8 + R()*20; }
      const [w3, h3] = layerSize(.7, W), L3 = mk(w3, h3), d = L3.getContext('2d');
      for (let x=60;x<w3;x+=260 + R()*240){ d.strokeStyle = '#0A1216'; d.lineWidth = 4; d.beginPath(); d.moveTo(x, 0); d.lineTo(x + R()*16 - 8, h3*.3 + R()*h3*.25); d.stroke(); // цепи и трубы
        d.fillStyle = '#0A1216'; d.fillRect(x - 10, 0, 20 + R()*60, 10); }
      return [{img:L1, par:.18}, {img:L2, par:.42}, {img:L3, par:.7}];
    },
    back(){ for (let i=0;i<16;i++){ const x = (hash(i,4,4) % 1000)/1000*VW, y = ((S.time*60 + i*67) % VH); ctx.fillStyle = 'rgba(170,210,230,.22)'; ctx.fillRect(x, y, 1.2, 8); }
      if (Math.random() < .012) sfx.drip(); },
    over(){ const base = VH - (S.cam.y - (LH - VH))*.25;
      const g = ctx.createLinearGradient(0, base - 220, 0, base + 20); g.addColorStop(0, 'rgba(100,140,170,0)'); g.addColorStop(1, 'rgba(100,140,170,.35)');
      ctx.fillStyle = g; ctx.fillRect(0, base - 220, VW, 240); }
  },
  // Глава 5, полдень: Дом гильдии — мраморные залы, витражи, а дальше пыльный архив со стеллажами
  guild:{
    floats:'dust', vignette:'rgba(18,10,14,.55)', stone:['#C2B8AC','#B0A69A','#9C9288','#867E76','#706A64'], edge:'brass', spike:'metal',
    sky(){
      const g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#2A1E26'); g.addColorStop(.6, '#3A2A30'); g.addColorStop(1, '#4A3638');
      ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
      ctx.fillStyle = 'rgba(0,0,0,.18)'; for (let i=0;i<12;i++){ const x = ((i*120 - S.cam.x*.06) % (VW + 120) + VW + 120) % (VW + 120) - 60; ctx.fillRect(x, 0, 3, VH); }
    },
    layers(W, R){
      const [w2, h2] = layerSize(.42, W), L2 = mk(w2, h2), b = L2.getContext('2d');
      for (let x=60;x<w2;x+=300 + R()*80){ const y = h2*.12, w = 110, hh = h2*.55; // витражные окна
        b.fillStyle = '#1A1218'; b.beginPath(); b.moveTo(x - 8, y + hh); b.lineTo(x - 8, y + 55); b.arc(x + w/2, y + 55, w/2 + 8, Math.PI, 0); b.lineTo(x + w + 8, y + hh); b.fill();
        b.save(); b.beginPath(); b.moveTo(x, y + hh); b.lineTo(x, y + 55); b.arc(x + w/2, y + 55, w/2, Math.PI, 0); b.lineTo(x + w, y + hh); b.closePath(); b.clip();
        const cols = ['rgba(240,160,80,.5)','rgba(110,160,230,.45)','rgba(200,90,110,.45)','rgba(150,210,150,.4)'];
        for (let yy = y; yy < y + hh; yy += 22) for (let xx = x; xx < x + w; xx += 22){ b.fillStyle = cols[hash(xx|0, yy|0, 2) % 4]; b.fillRect(xx, yy, 21, 21); }
        b.restore(); glowOn(b, x + w/2, y + hh*.5, 160, 'rgba(255,220,170,A)', .12); }
      const [w3, h3] = layerSize(.7, W), L3 = mk(w3, h3), d = L3.getContext('2d');
      for (let x=0;x<w3;x+=220 + R()*60){ d.fillStyle = '#5A4E4A'; d.fillRect(x, 0, 34, h3); d.fillStyle = 'rgba(255,240,220,.12)'; d.fillRect(x + 4, 0, 5, h3); // колонны
        d.fillStyle = '#4A3E3A'; d.fillRect(x - 8, h3*.06, 50, 16); }
      for (let x=140;x<w3;x+=520 + R()*200){ const y = h3*.12; d.fillStyle = '#6A2A34'; d.fillRect(x, y, 60, 150); d.beginPath(); d.moveTo(x, y + 150); d.lineTo(x + 30, y + 176); d.lineTo(x + 60, y + 150); d.fill(); // знамёна
        d.fillStyle = '#D9B24A'; d.beginPath(); d.arc(x + 30, y + 60, 14, 0, Math.PI*2); d.fill(); }
      return [{img:L2, par:.42}, {img:L3, par:.7}];
    },
    over(){ const g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, 'rgba(255,220,170,.05)'); g.addColorStop(1, 'rgba(0,0,0,.12)'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH); }
  }
};
// Глава 5, вечер: закат над террасами, который постепенно остывает в голубой свет Мглы
THEMES.dusk = Object.assign({}, THEMES.sky, {
  over(){ const k = S.flags.calling ? 1 : clamp((S.P.x/T - 200)/180, 0, .55);
    ctx.fillStyle = `rgba(40,70,140,${.38*k})`; ctx.fillRect(0, 0, VW, VH);
    const g = ctx.createLinearGradient(0, VH*.5, 0, VH); g.addColorStop(0, 'rgba(130,180,240,0)'); g.addColorStop(1, `rgba(130,180,240,${.3*k})`); ctx.fillStyle = g; ctx.fillRect(0, VH*.5, VW, VH*.5); }
});
// Глава 6, участок 1: глухая ночь над ратушей — та же улица, но холоднее и темнее, лучи фонарей патрулей
THEMES.night = Object.assign({}, THEMES.street, {
  over(){ ctx.fillStyle = 'rgba(8,14,40,.32)'; ctx.fillRect(0, 0, VW, VH);
    const g = ctx.createLinearGradient(0, VH*.6, 0, VH); g.addColorStop(0, 'rgba(60,80,140,0)'); g.addColorStop(1, 'rgba(60,80,140,.22)'); ctx.fillStyle = g; ctx.fillRect(0, VH*.6, VW, VH*.4); }
});
// Глава 6, участок 3: древняя спиральная лестница над Мглой — гигантские пролёты, мягкий свет снизу
THEMES.stair = {
  floats:'dust', vignette:'rgba(4,10,24,.6)', stone:['#64707E','#58646F','#4C5763','#414B56','#36404A'], edge:'curb', spike:'metal',
  sky(){
    const g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#060A18'); g.addColorStop(.55, '#0E2236'); g.addColorStop(1, '#2A5A70');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glow(VW*.5, VH*1.1 - S.cam.y*.05, VW*.7, 'rgba(110,200,220,A)', .22 + .04*Math.sin(S.time*.5));
    for (let i=0;i<40;i++){ const x = ((hash(i,2,7) % 1000)/1000*VW*1.4 - S.cam.x*.05) % VW, y = VH - ((S.time*(8 + i%5*3) + i*53) % VH);
      ctx.fillStyle = `rgba(${i%3 ? '170,225,240' : '255,214,150'},${.25 + .25*Math.sin(S.time + i)})`; ctx.fillRect((x + VW) % VW, y, 1.8, 1.8); }
    ctx.restore();
  },
  layers(W, R){
    const [w1, h1] = layerSize(.15, W), L1 = mk(w1, h1), a = L1.getContext('2d');
    for (let x = 80; x < w1; x += 420 + R()*160){ // дальние витки лестницы — дуги ступеней вокруг колонн
      const cx = x, top = h1*(.1 + R()*.15), bh = h1*.75; a.fillStyle = '#0C1A2A'; a.fillRect(cx - 26, top, 52, bh);
      for (let i=0;i<14;i++){ const k = i/13, sx = cx + Math.sin(k*Math.PI*2.2)*120, sy = top + k*bh; a.fillStyle = `rgba(20,40,58,${.9 - k*.3})`; a.fillRect(sx - 34, sy, 68, 10); } }
    const [w2, h2] = layerSize(.4, W), L2 = mk(w2, h2), b = L2.getContext('2d');
    for (let x = -40; x < w2; x += 260 + R()*200){ const top = h2*(.05 + R()*.2), hh = h2*(.6 + R()*.3);
      b.fillStyle = '#132638'; b.fillRect(x, top, 46 + R()*30, hh); b.fillStyle = 'rgba(160,220,240,.08)'; b.fillRect(x + 6, top, 4, hh);
      if (R() < .6){ const y = top + hh*(.3 + R()*.4); b.fillStyle = '#16293C'; b.beginPath(); b.moveTo(x, y); b.lineTo(x + 180 + R()*80, y + 30); b.lineTo(x + 170 + R()*80, y + 48); b.lineTo(x, y + 20); b.fill(); } }
    for (let x = 0; x < w2; x += 120 + R()*90){ const y = h2*.92; b.fillStyle = 'rgba(30,60,80,.7)'; b.beginPath(); b.moveTo(x, h2); b.lineTo(x + 10, y - R()*40); b.lineTo(x + 40, y - 20 - R()*30); b.lineTo(x + 60, h2); b.fill(); } // крыши Долинного города в тумане
    return [{img:L1, par:.15}, {img:L2, par:.4}];
  },
  back(){ if (Math.random() < .01) noise(1.2, .008, 500, .3, 0, 'lowpass'); }, // песчаный шорох Мглы
  over(){ const base = VH - (S.cam.y - (LH - VH))*.3;
    const g = ctx.createLinearGradient(0, base - 260, 0, base + 40); g.addColorStop(0, 'rgba(120,200,225,0)'); g.addColorStop(1, 'rgba(120,200,225,.34)');
    ctx.fillStyle = g; ctx.fillRect(0, base - 260, VW, 300);
    ctx.save(); ctx.globalAlpha = .12 + .04*Math.sin(S.time*.6); ctx.fillStyle = '#BFEAF2';
    for (let i=0;i<7;i++){ const x = ((i*220 - S.cam.x*.6 + S.time*12) % (VW + 300) + VW + 300) % (VW + 300) - 150; ctx.beginPath(); ctx.ellipse(x, base - 30 - (i%3)*18, 140, 18, 0, 0, Math.PI*2); ctx.fill(); }
    ctx.restore(); }
};
// Глава 7: Долинный город под Мглой — сверху светящийся «потолок» тумана, внизу руины, тёплые огни очагов
THEMES.valley = {
  floats:'dust', vignette:'rgba(2,10,16,.6)', stone:['#56636A','#4C585F','#424D54','#384249','#2F383E'], edge:'curb', spike:'metal',
  sky(){
    const g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#3E7E8A'); g.addColorStop(.35, '#163A48'); g.addColorStop(1, '#0A1820');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; // Мгла сверху: медленные светлые волны
    for (let i=0;i<5;i++){ const x = ((i*300 - S.cam.x*.05 + S.time*6) % (VW + 400) + VW + 400) % (VW + 400) - 200;
      glow(x, 10 + (i%2)*30 - S.cam.y*.03, 260, 'rgba(150,220,230,A)', .12 + .04*Math.sin(S.time*.4 + i)); }
    for (let i=0;i<30;i++){ const x = ((hash(i,5,9) % 1000)/1000*VW*1.4 - S.cam.x*.04) % VW, y = ((S.time*(5 + i%4*2) + i*61) % VH);
      ctx.fillStyle = `rgba(${i%3 ? '170,225,240' : '255,200,140'},${.2 + .2*Math.sin(S.time + i)})`; ctx.fillRect((x + VW) % VW, y, 1.8, 1.8); } // искорки сыплются сверху вниз
    ctx.restore();
  },
  layers(W, R){
    const [w1, h1] = layerSize(.16, W), L1 = mk(w1, h1), a = L1.getContext('2d');
    for (let x = -40; x < w1;){ const w = 60 + R()*90, hh = h1*(.25 + R()*.35), base = h1*.92; // дальние башни и купола в тумане
      a.fillStyle = '#123040'; a.fillRect(x, base - hh, w, hh + 100);
      if (R() < .5){ a.beginPath(); a.arc(x + w/2, base - hh, w/2, Math.PI, 0); a.fill(); } else { a.beginPath(); a.moveTo(x - 4, base - hh); a.lineTo(x + w/2, base - hh - 30 - R()*40); a.lineTo(x + w + 4, base - hh); a.fill(); }
      for (let i=0;i<4;i++) if (R() < .35){ const wx = x + 8 + R()*(w - 16), wy = base - hh + 20 + R()*hh*.6; glowOn(a, wx, wy, 18, 'rgba(255,160,90,A)', .35); a.fillStyle = 'rgba(255,190,120,.8)'; a.fillRect(wx - 2, wy - 3, 4, 6); }
      x += w + 10 + R()*40; }
    a.fillStyle = 'rgba(120,200,215,.07)'; a.fillRect(0, h1*.55, w1, h1*.45);
    const [w2, h2] = layerSize(.4, W), L2 = mk(w2, h2), b = L2.getContext('2d');
    for (let x = 0; x < w2; x += 520 + R()*260){ const y = h2*(.35 + R()*.15), n = 3 + Math.floor(R()*3); // разрушенный акведук: арки
      for (let i=0;i<n;i++){ const ax = x + i*90; b.fillStyle = '#1A3440'; b.fillRect(ax, y, 90, 22); b.fillRect(ax, y, 16, h2 - y); b.fillStyle = '#0F242E'; b.beginPath(); b.arc(ax + 53, y + 60, 37, Math.PI, 0); b.lineTo(ax + 90, y + 22); b.lineTo(ax + 16, y + 22); b.fill(); } }
    for (let x = -20; x < w2;){ const w = 90 + R()*120, hh = 120 + R()*200, base = h2*.9; b.fillStyle = R() < .5 ? '#18303A' : '#1C3640'; b.fillRect(x, base - hh, w, hh + 200);
      b.fillStyle = '#21404A'; b.beginPath(); b.moveTo(x - 8, base - hh); b.lineTo(x + w*.3, base - hh - 20 - R()*30); b.lineTo(x + w*.55, base - hh - 6); b.lineTo(x + w + 8, base - hh); b.fill(); // обломанная крыша
      for (let y = base - hh + 22; y < base - 20; y += 40) for (let xx = x + 12; xx < x + w - 20; xx += 30){ const lit = R() < .07; b.fillStyle = lit ? 'rgba(255,170,90,.8)' : 'rgba(6,14,18,.85)'; b.fillRect(xx, y, 12, 18); if (lit) glowOn(b, xx + 6, y + 9, 24, 'rgba(255,160,80,A)', .25); }
      b.fillStyle = 'rgba(90,170,150,.18)'; for (let i=0;i<3;i++) b.fillRect(x + R()*w, base - hh, 3, 20 + R()*60); // мох
      x += w + 14 + R()*40; }
    return [{img:L1, par:.16}, {img:L2, par:.4}];
  },
  back(){ if (Math.random() < .008) sfx.drip(); },
  over(){ const base = VH - (S.cam.y - (LH - VH))*.3;
    const g = ctx.createLinearGradient(0, base - 240, 0, base + 40); g.addColorStop(0, 'rgba(110,190,210,0)'); g.addColorStop(1, 'rgba(110,190,210,.32)');
    ctx.fillStyle = g; ctx.fillRect(0, base - 240, VW, 280);
    ctx.save(); ctx.globalAlpha = .1 + .03*Math.sin(S.time*.5); ctx.fillStyle = '#BFE6EE';
    for (let i=0;i<6;i++){ const x = ((i*260 - S.cam.x*.7 + S.time*10) % (VW + 300) + VW + 300) % (VW + 300) - 150; ctx.beginPath(); ctx.ellipse(x, base - 40 - (i%3)*22, 150, 18, 0, 0, Math.PI*2); ctx.fill(); }
    ctx.restore(); }
};
// Глава 8: Сердце Долины — круглые залы из старого камня, тёплый свет Первого Огня сквозь Мглу
THEMES.heart = Object.assign({}, THEMES.valley, {
  vignette:'rgba(10,6,4,.55)', stone:['#5E5A56','#54504C','#4A4642','#403C39','#36332F'],
  sky(){
    const g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#2A3A44'); g.addColorStop(.5, '#1A2228'); g.addColorStop(1, '#0E1214');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glow(VW*.6 - S.cam.x*.03, VH*.45 - S.cam.y*.03, VW*.75, 'rgba(255,190,120,A)', .14 + .03*Math.sin(S.time*1.6)); // свет Сердца сквозь туман
    for (let i=0;i<34;i++){ const x = ((hash(i,6,3) % 1000)/1000*VW*1.4 - S.cam.x*.05) % VW, y = VH - ((S.time*(10 + i%5*3) + i*47) % VH);
      ctx.fillStyle = `rgba(${i%3 ? '255,214,150' : '170,225,240'},${.25 + .2*Math.sin(S.time + i)})`; ctx.fillRect((x + VW) % VW, y, 1.8, 1.8); } // искры летят вверх
    ctx.restore();
  }
});
const FIND_KINDS = {
  letter:{one:'Письмо', many:'Письма Черри'},
  boltik:{one:'Болтунчик', many:'Болтунчики Гисы'},
  seed:{one:'Семечко', many:'Светящиеся семена'},
  plaque:{one:'Табличка', many:'Памятные засечки'},
  past:{one:'Находка', many:'Следы прошлого'}
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
    if (kind === 'street' || kind === 'night'){ // фонарные столбы, перила, вывески
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
  if (kind !== 'stair' && kind !== 'valley' && kind !== 'heart') // над Мглой и под ней листьев на переднем плане нет
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
    const old = curCh().lampTint === 'old';
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 85, 110*pulse, old ? 'rgba(255,212,140,A)' : 'rgba(255,186,100,A)', .34); glow(x, y - 85, 30, 'rgba(255,230,170,A)', .55);
    if (old) glow(x, y - 85, 70*pulse, 'rgba(110,200,255,A)', .22); ctx.restore();
    const lg = ctx.createLinearGradient(x, y - 96, x, y - 74); lg.addColorStop(0, '#FFF6DA'); lg.addColorStop(1, old ? '#8ED4F0' : '#F7A64A'); ctx.fillStyle = lg; ctx.fill();
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
  if (f.got) return; if (f.icon){ drawFindIcon(f); return; } const x = f.x, y = f.y, b = Math.sin(f.t*3)*3, kind = curCh().find;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 20, 44, 'rgba(255,240,200,A)', .3); ctx.restore();
  if (kind === 'boltik'){ drawBoltik(ctx, x, y, f.t, 1.15, Math.sin(f.t*.7) > 0 ? 1 : -1, 0); return; }
  ctx.save(); ctx.translate(x, y - 22 + b);
  if (kind === 'plaque'){ // медная табличка мастерской с засечками
    ctx.rotate(Math.sin(f.t*2)*.08); pathRR(ctx, -15, -11, 30, 22, 3); fillInk(ctx, '#C98A4A', 2);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(0, 0, 18, 'rgba(255,200,130,A)', .35); ctx.restore();
    ctx.save(); ctx.translate(-6, 0); ctx.scale(.55, .55); lampSign(ctx, 0, 0); ctx.restore();
    ctx.strokeStyle = '#5A3418'; ctx.lineWidth = 1.2; for (let i=0;i<5;i++){ ctx.beginPath(); ctx.moveTo(3 + i*2.4, -6); ctx.lineTo(4 + i*2.4, 6); ctx.stroke(); }
  }
  else if (kind === 'seed'){ ctx.beginPath(); ctx.moveTo(0, -12); ctx.bezierCurveTo(10, -6, 9, 8, 0, 11); ctx.bezierCurveTo(-9, 8, -10, -6, 0, -12); fillInk(ctx, '#8ED8A0', 2);
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
  if (m.x + m.w < S.cam.x - 40 || m.x > S.cam.x + VW + 40) return; // за экраном не рисуем
  if (m.cw || m.cwB){ drawCw(m); return; }
  if (m.heat !== undefined || m.echo){ drawCh7Mover(m); return; }
  if (m.span !== undefined){ drawSpan(m); return; }
  const x = m.x, y = m.y, w = m.w, clock = theme() === THEMES.clock;
  if (m.shelf){ ctx.fillStyle = '#5A3A24'; ctx.fillRect(x, y, w, 12); ctx.fillStyle = '#7A5634'; ctx.fillRect(x, y, w, 3); ctx.fillStyle = INK; ctx.fillRect(x, y - 2, w, 2); ctx.fillRect(x, y + 12, w, 2);
    for (let xx = x + 4; xx < x + w - 8; xx += 9){ const hh = 12 + (hash(xx|0, 1, 7) % 8); ctx.fillStyle = ['#7A3A2A','#3A5A6A','#8A7A3A','#4A3A5A'][hash(xx|0, 2, 5) % 4]; ctx.fillRect(xx, y - hh, 7, hh); }
    if (m.k < 1 && m.target === 0){ ctx.save(); ctx.globalAlpha = .22; ctx.strokeStyle = '#E8C66A'; ctx.setLineDash([4, 8]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.x0 + w/2, m.y0 + 6); ctx.lineTo(m.x1 + w/2, m.y1 + 6); ctx.stroke(); ctx.restore(); }
    return; }
  ctx.fillStyle = clock ? '#8A6A3A' : '#8A5A3C'; ctx.fillRect(x, y, w, 12); ctx.fillStyle = clock ? '#E8C66A' : '#B47E52'; ctx.fillRect(x, y, w, 3);
  ctx.fillStyle = INK; ctx.fillRect(x, y - 2, w, 2); ctx.fillRect(x, y + 12, w, 2); ctx.fillRect(x - 2, y - 2, 2, 16); ctx.fillRect(x + w, y - 2, 2, 16);
  for (const gx of [x + 14, x + w - 14]){ ctx.save(); ctx.translate(gx, y + 18); ctx.rotate((m.x + m.y)*.04); gearPath(ctx, 8, 8, .3); fillInk(ctx, clock ? '#C9A15A' : '#7A7E96', 1.4); ctx.beginPath(); ctx.arc(0, 0, 2.4, 0, Math.PI*2); ctx.fillStyle = INK; ctx.fill(); ctx.restore(); }
  ctx.save(); ctx.globalAlpha = .25; ctx.strokeStyle = '#E8C66A'; ctx.setLineDash([4, 8]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.x0 + w/2, m.y0 + 6); ctx.lineTo(m.x1 + w/2, m.y1 + 6); ctx.stroke(); ctx.restore();
}
function drawWinds(){
  for (const w of S.W.winds){ if (w.x + w.w < S.cam.x || w.x > S.cam.x + VW) continue;
    if (w.ether){ drawEther(w); continue; }
    const g = ctx.createLinearGradient(0, w.y + w.h, 0, w.y); g.addColorStop(0, 'rgba(230,240,255,.22)'); g.addColorStop(1, 'rgba(230,240,255,0)');
    ctx.fillStyle = g; ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.strokeStyle = 'rgba(240,248,255,.45)'; ctx.lineWidth = 2;
    for (let i=0;i<6;i++){ const xx = w.x + 8 + ((i*37) % (w.w - 16)), yy = w.y + w.h - ((S.time*300 + i*90) % w.h); ctx.beginPath(); ctx.moveTo(xx, yy); ctx.quadraticCurveTo(xx + 6, yy - 14, xx, yy - 28); ctx.stroke(); }
    ctx.fillStyle = '#5A4E5E'; ctx.fillRect(w.x - 4, w.y + w.h - 6, w.w + 8, 8); ctx.fillStyle = INK; for (let xx = w.x; xx < w.x + w.w; xx += 10) ctx.fillRect(xx, w.y + w.h - 6, 3, 8);
  }
}
// эфирный поток Первого Огня: сине-золотой туман и искорки по направлению потока
function drawEther(w){
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(w.x, 0, w.x + w.w, 0); g.addColorStop(0, 'rgba(110,190,230,0)'); g.addColorStop(.5, `rgba(130,200,235,${w.diag ? .2 : .16})`); g.addColorStop(1, 'rgba(110,190,230,0)');
  ctx.fillStyle = g; ctx.fillRect(w.x, w.y, w.w, w.h);
  for (let i=0;i<7;i++){ const k = ((S.time*.7 + i/7) % 1), xx = w.x + w.w*(.2 + .6*((i*37 % 10)/10)) + (w.dx || 0)*k*w.w*.6, yy = w.y + w.h*(1 - k);
    ctx.fillStyle = i % 2 ? `rgba(255,214,140,${.8*(1 - k)})` : `rgba(160,225,245,${.8*(1 - k)})`; ctx.fillRect(xx, yy, 2.4, 2.4); }
  ctx.restore();
}
function drawDeco(dc){
  if (DECO_EXTRA[dc.kind]){ DECO_EXTRA[dc.kind](dc); return; }
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
  } else if (dc.kind === 'stage'){ // праздничный помост на площади
    const w = (dc.w || 8)*T, hgt = dc.h || 22;
    for (const px of [x + 10, x + w - 16]){ ctx.fillStyle = '#3A2A20'; ctx.fillRect(px, y - 150, 6, 150 - hgt); }
    ctx.strokeStyle = 'rgba(10,10,24,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 13, y - 146); ctx.quadraticCurveTo(x + w/2, y - 110, x + w - 13, y - 146); ctx.stroke();
    for (let k=1;k<12;k++){ const t = k/12, fx = x + 13 + (w - 26)*t, fy = y - 146 + Math.sin(t*Math.PI)*36*.95;
      ctx.fillStyle = ['#E8823A','#F2C14E','#7FC8E8','#E66A8A'][k % 4]; ctx.beginPath(); ctx.moveTo(fx - 7, fy); ctx.lineTo(fx + 7, fy); ctx.lineTo(fx, fy + 14); ctx.closePath(); ctx.fill(); }
    pathRR(ctx, x, y - hgt, w, hgt, 3); fillInk(ctx, '#7A5236', 2.4);
    ctx.strokeStyle = 'rgba(40,24,14,.55)'; ctx.lineWidth = 1.6; for (let i=1;i<w/24;i++){ ctx.beginPath(); ctx.moveTo(x + i*24, y - hgt + 3); ctx.lineTo(x + i*24, y - 2); ctx.stroke(); }
    signBoard(x + w/2, y - 178, dc.text || 'ПРАЗДНИК БОЛЬШОГО ФОНАРЯ', '#1E6E8A');
  } else if (dc.kind === 'scratch'){ // дощатая стена с надписью, нацарапанной гвоздём
    pathRR(ctx, x - 50, y - 120, 108, 120, 3); fillInk(ctx, '#3A3036', 2.2);
    ctx.strokeStyle = 'rgba(10,8,14,.6)'; ctx.lineWidth = 1.4; for (let i=1;i<6;i++){ ctx.beginPath(); ctx.moveTo(x - 50 + i*18, y - 118); ctx.lineTo(x - 50 + i*18, y - 2); ctx.stroke(); }
    ctx.save(); ctx.translate(x + 4, y - 80); ctx.rotate(-.06); ctx.fillStyle = 'rgba(232,226,214,.85)'; ctx.font = `italic 700 12px ${SERIF}`; ctx.textAlign = 'center';
    (dc.text || '').split('|').forEach((ln, i) => ctx.fillText(ln, 0, i*16)); ctx.restore();
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
// знак фонарщиков: фонарь в круге (у Странника — сломанный)
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
// Подсказка на уровне: одна, крупная, сверху по центру экрана — не теряется на фоне и не налезает на другие.
// Клавиши рисуются как настоящие кнопки.
function hintSegments(t){
  const tu = touchUI(), out = [], re = /\{(lr|jump|down|sprint)\}/g; let last = 0, m;
  while ((m = re.exec(t))){
    if (m.index > last) out.push({s:t.slice(last, m.index)});
    const k = m[1];
    if (k === 'lr') out.push({k:tu ? '◀' : keyLabel('left')}, {s:' '}, {k:tu ? '▶' : keyLabel('right')});
    else if (k === 'jump') out.push({k:tu ? '▲' : keyLabel('jump')});
    else if (k === 'down') out.push({k:tu ? '▼' : keyLabel('down')});
    else if (!tu) out.push({s:' · '}, {k:keyLabel('sprint')}, {s:' — быстрее'});
    last = re.lastIndex;
  }
  if (last < t.length) out.push({s:t.slice(last)});
  return out;
}
function drawHintBanner(){
  if (!SET.hints || S.scene || S.mode !== 'play') return;
  let best = null; for (const h of S.W.hints) if (h.a > .01 && (!best || h.a > best.a)) best = h;
  if (!best) return;
  const segs = hintSegments(best.t); let fs = 18;
  const measure = () => { let w = 0;
    for (const g of segs){ if (g.k){ ctx.font = `900 ${fs - 2}px ${SANS}`; g.w = Math.max(fs + 12, ctx.measureText(g.k).width + 16); w += g.w + 4; }
      else { ctx.font = `800 ${fs}px ${SANS}`; g.w = ctx.measureText(g.s).width; w += g.w; } }
    return w; };
  let tw = measure(); while (tw + 74 > VW - 40 && fs > 12){ fs--; tw = measure(); }
  const bw = tw + 74, bh = fs + 28, x = VW/2 - bw/2, y = 62 + Math.sin(S.time*2)*1.5, iy = y + bh/2;
  ctx.save(); ctx.globalAlpha = best.a;
  ctx.shadowColor = 'rgba(242,180,90,.5)'; ctx.shadowBlur = 22;
  pathRR(ctx, x, y, bw, bh, bh/2); ctx.fillStyle = 'rgba(16,13,30,.92)'; ctx.fill(); ctx.shadowBlur = 0;
  ctx.lineWidth = 2.2; ctx.strokeStyle = 'rgba(242,180,90,.9)'; ctx.stroke();
  const ix = x + 26; // огонёк-значок
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ix, iy, 18, 'rgba(255,190,110,A)', .6 + .2*Math.sin(S.time*4)); ctx.restore();
  ctx.fillStyle = '#FFD48A'; ctx.beginPath(); ctx.moveTo(ix, iy - 9); ctx.quadraticCurveTo(ix + 8, iy, ix, iy + 8); ctx.quadraticCurveTo(ix - 8, iy, ix, iy - 9); ctx.fill();
  let cx = x + 48; ctx.textBaseline = 'middle';
  for (const g of segs){
    if (g.k){ const kh = fs + 10, ky = iy - kh/2;
      pathRR(ctx, cx, ky + 3, g.w, kh, 7); ctx.fillStyle = '#8E7A5E'; ctx.fill();
      pathRR(ctx, cx, ky, g.w, kh, 7); ctx.fillStyle = '#F4EDDF'; ctx.fill();
      ctx.fillStyle = '#2B2233'; ctx.font = `900 ${fs - 2}px ${SANS}`; ctx.textAlign = 'center'; ctx.fillText(g.k, cx + g.w/2, iy + 1); cx += g.w + 4; }
    else { ctx.fillStyle = '#F7EEDC'; ctx.font = `800 ${fs}px ${SANS}`; ctx.textAlign = 'left'; ctx.fillText(g.s, cx, iy + 1); cx += g.w; }
  }
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
  ctx.font = `800 12px ${SANS}`; ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(244,237,223,.6)'; ctx.fillText(sc.def.slideLabel ?? 'ПРОЛОГ', 24, 30);
}
/* ================= Фон главного меню =================
   Своя сцена, не зависящая от глав: тихий вечер на крыше. Ая у фонаря, рядом Искра, на трубе дремлет Генерал,
   в окне соседнего дома читает дед. Внизу город и туман, вдали маяк. Слои чуть смещаются за курсором/пальцем. */
let MENU_BG = null;
const MENU_PTR = {x:0, y:0, tx:0, ty:0};
addEventListener('pointermove', e => { if (!S || S.mode !== 'title') return; const r = cv.getBoundingClientRect();
  if (!r.width) return; MENU_PTR.tx = clamp((e.clientX - r.left)/r.width*2 - 1, -1, 1); MENU_PTR.ty = clamp((e.clientY - r.top)/r.height*2 - 1, -1, 1); }, {passive:true});
function menuStatic(){
  const key = VW + 'x' + VH; if (MENU_BG && MENU_BG.key === key) return MENU_BG;
  const u = VH/540, R = seeded(2024), pad = 40*u, W2 = VW + pad*2;
  // небо
  const sky = mk(VW, VH), a = sky.getContext('2d');
  const g = a.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#0B1230'); g.addColorStop(.45, '#26285A'); g.addColorStop(.72, '#5A3E72'); g.addColorStop(.9, '#B4687A'); g.addColorStop(1, '#E9A07A');
  a.fillStyle = g; a.fillRect(0, 0, VW, VH);
  // дальний план: берег, маяк, дальний город
  const far = mk(W2, VH), f = far.getContext('2d'); f.translate(pad, 0);
  const lx = VW*.84, ly = VH*.5;
  f.fillStyle = '#2A2350'; f.beginPath(); f.moveTo(VW*.62, VH*.66); f.quadraticCurveTo(VW*.75, VH*.5, lx - 30*u, ly + 6*u); f.lineTo(lx + 34*u, ly + 6*u); f.quadraticCurveTo(VW*.95, VH*.56, VW + pad, VH*.62); f.lineTo(VW + pad, VH); f.lineTo(VW*.62, VH); f.fill();
  f.fillStyle = '#1E1A40'; f.beginPath(); f.moveTo(lx - 14*u, ly + 8*u); f.lineTo(lx - 8*u, ly - 70*u); f.lineTo(lx + 8*u, ly - 70*u); f.lineTo(lx + 14*u, ly + 8*u); f.fill();
  f.fillRect(lx - 11*u, ly - 84*u, 22*u, 14*u); f.beginPath(); f.moveTo(lx - 13*u, ly - 84*u); f.lineTo(lx, ly - 98*u); f.lineTo(lx + 13*u, ly - 84*u); f.fill();
  const city = (c, y0, col, hmin, hmax, win, sc) => { c.fillStyle = col; c.fillRect(-pad, y0 - hmin*u*.6, W2, VH); // сплошное основание, чтобы между домами не просвечивало небо
    for (let x = -pad; x < VW + pad;){ const w = (24 + R()*46)*sc*u, h = (hmin + R()*(hmax - hmin))*u, base = y0;
      c.fillStyle = col; c.fillRect(x, base - h, w, VH); c.beginPath(); c.moveTo(x - 3*u, base - h); c.lineTo(x + w/2, base - h - (10 + R()*14)*u*sc); c.lineTo(x + w + 3*u, base - h); c.fill();
      if (R() < .35){ c.fillRect(x + w*.68, base - h - 22*u*sc, 6*u*sc, 16*u*sc); } // трубы
      for (let y = base - h + 8*u; y < base - 4*u; y += 11*u*sc) for (let xx = x + 4*u; xx < x + w - 5*u; xx += 8*u*sc) if (R() < win){ c.fillStyle = `rgba(255,${190 + R()*40|0},120,${.45 + R()*.4})`; c.fillRect(xx, y, 3*u*sc, 4.5*u*sc); }
      x += w + (2 + R()*8)*u; } };
  city(f, VH*.7, '#241E48', 30, 110, .18, .8);
  const near = mk(W2, VH), n = near.getContext('2d'); n.translate(pad, 0);
  city(n, VH*.8, '#1B1638', 50, 150, .28, 1.1);
  // передний план: крыша, труба Генерала, соседний дом с окном деда, лестница у фонаря
  const roof = mk(W2, VH), b = roof.getContext('2d'); b.translate(pad, 0); const ry = VH*.86;
  const hx = VW*.88; // соседний дом справа
  b.fillStyle = '#18122C'; b.fillRect(hx, ry - 210*u, VW*.2, 220*u);
  b.beginPath(); b.moveTo(hx - 14*u, ry - 210*u); b.lineTo(hx + VW*.1, ry - 268*u); b.lineTo(hx + VW*.2 + 14*u, ry - 210*u); b.fillStyle = '#221A3A'; b.fill();
  b.fillStyle = '#120E24'; b.beginPath(); b.moveTo(VW*.3, VH + 4); b.lineTo(VW*.34, ry); b.lineTo(VW + pad, ry - 8*u); b.lineTo(VW + pad, VH + 4); b.fill();
  b.fillStyle = '#2A2244'; b.fillRect(VW*.34, ry - 3*u, VW*.7, 4*u);
  for (let x = VW*.36; x < VW + pad; x += 22*u){ b.fillStyle = 'rgba(70,58,100,.6)'; b.fillRect(x, ry + 4*u, 18*u, 3*u); }
  const cx = VW*.8; b.fillStyle = '#1C1630'; b.fillRect(cx, ry - 54*u, 26*u, 54*u); b.fillStyle = '#2E2648'; b.fillRect(cx - 4*u, ry - 58*u, 34*u, 8*u);
  // лестница фонарщицы прислонена к фонарю
  const fx = VW*.52; b.strokeStyle = '#3A2C22'; b.lineWidth = 3*u; b.lineCap = 'round';
  b.beginPath(); b.moveTo(fx - 34*u, ry - 2*u); b.lineTo(fx - 6*u, ry - 92*u); b.moveTo(fx - 20*u, ry - 2*u); b.lineTo(fx + 6*u, ry - 88*u); b.stroke();
  b.lineWidth = 2.2*u; for (let i = 1; i < 7; i++){ const k = i/7; b.beginPath(); b.moveTo(fx - 34*u + 28*u*k, ry - 2*u - 90*u*k); b.lineTo(fx - 20*u + 26*u*k, ry - 2*u - 86*u*k); b.stroke(); }
  // сумка с маслёнкой у ног
  b.fillStyle = '#5A3A26'; b.beginPath(); b.roundRect ? b.roundRect(fx + 52*u, ry - 16*u, 20*u, 14*u, 3*u) : b.rect(fx + 52*u, ry - 16*u, 20*u, 14*u); b.fill();
  b.fillStyle = '#C9A15A'; b.fillRect(fx + 76*u, ry - 12*u, 8*u, 10*u); b.fillRect(fx + 82*u, ry - 16*u, 2*u, 6*u);
  return MENU_BG = {key, sky, far, near, roof, lx, ly, ry, cx, fx, hx, u, pad};
}
// Мысли в облачках над городом — медленно проплывают по небу меню
const MENU_THOUGHTS = [
  'Мгла не ненавидит свет. Она просто очень голодна.',
  'Если фонарь погас сам — кто-то очень не хотел, чтобы его увидели.',
  'История города записана на медяшках и старых засечках.',
  'Хороший фонарщик смотрит под ноги. Мудрый — смотрит на туман.',
  'Даже самый яркий маяк когда-то начался с одной спички.',
  'Внизу звонят колокола. Но там давно никто не живёт...',
  'Дед говорит: «Не лезь». Но когда это меня останавливало?',
  'Один фонарь — это не просто свет. Это чей-то дом.',
  'Страшно — значит, ты идёшь в правильную сторону.',
  'Чай остынет. Хорошие вопросы — никогда.'
];
// Места в небе справа от меню, где появляются пузыри (доли ширины и высоты экрана)
const THOUGHT_SPOTS = [[.74, .12], [.8, .27], [.71, .32], [.78, .08], [.86, .19], [.72, .21]];
// длинную мысль делим на две строки примерно поровну (по словам)
function thoughtLines(text){
  if (text.length <= 36) return [text];
  const words = text.split(' '); let best = [text], diff = 1e9;
  for (let i = 1; i < words.length; i++){ const a = words.slice(0, i).join(' '), b = words.slice(i).join(' '), d = Math.abs(a.length - b.length); if (d < diff){ diff = d; best = [a, b]; } }
  return best;
}
function drawThoughts(u, t){
  const CYCLE = 8, k = t/CYCLE, n = Math.floor(k), p = k - n; // каждые 8 секунд — новый пузырь
  const text = MENU_THOUGHTS[(n*7) % MENU_THOUGHTS.length], spot = THOUGHT_SPOTS[(n*5) % THOUGHT_SPOTS.length];
  const appear = clamp(p/.16, 0, 1), vanish = clamp((1 - p)/.2, 0, 1), a = Math.min(appear, vanish);
  if (a <= 0) return;
  const pop = appear < 1 ? 1 - Math.pow(1 - appear, 3)*1.0 + Math.sin(appear*Math.PI)*.08 : 1; // мягкое «надувание» с лёгким перелётом
  ctx.save(); ctx.font = `italic 600 ${Math.max(12, Math.round(15*u))}px ${SERIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const lines = thoughtLines(text), lh = 19*u;
  const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 48*u, h = 40*u + (lines.length - 1)*lh;
  const x = clamp(VW*spot[0], w/2 + 10*u, VW - w/2 - 10*u), y = Math.max(VH*spot[1], h*.95 + 6*u) + Math.sin(t*.8)*4*u - (1 - vanish)*16*u;
  ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(.7 + .3*pop, .7 + .3*pop);
  ctx.shadowColor = 'rgba(255,220,170,.35)'; ctx.shadowBlur = 16*u;
  ctx.fillStyle = 'rgba(244,237,223,.24)'; ctx.strokeStyle = 'rgba(255,246,226,.5)'; ctx.lineWidth = 1.4*u;
  ctx.beginPath(); ctx.ellipse(0, 0, w/2, h/2, 0, 0, Math.PI*2); ctx.ellipse(-w*.2, -h*.36, w*.2, h*.42, 0, 0, Math.PI*2); ctx.ellipse(w*.14, -h*.42, w*.24, h*.46, 0, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.beginPath(); ctx.arc(-w*.32, h*.72, 4*u, 0, Math.PI*2); ctx.arc(-w*.38, h*1.05, 2.4*u, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#FFF8E8'; ctx.shadowColor = 'rgba(20,12,30,.6)'; ctx.shadowBlur = 6*u; lines.forEach((l, i) => ctx.fillText(l, 0, 1 + (i - (lines.length - 1)/2)*lh));
  ctx.restore();
}
function drawMenuScene(story){
  const M = menuStatic(), u = M.u, t = S.time, P = MENU_PTR;
  P.x += (P.tx - P.x)*.04; P.y += (P.ty - P.y)*.04;
  const drift = Math.sin(t*.07)*.35, px = (k) => -M.pad - (P.x + drift)*k*u, py = (k) => -P.y*k*.5*u;
  ctx.drawImage(M.sky, 0, 0, VW, VH);
  // звёзды и редкая падающая звезда
  for (let i = 0; i < 120; i++){ const x = (hash(i, 3, 5) % 1000)/1000*VW, y = (hash(i, 7, 1) % 1000)/1000*VH*.55, tw = .35 + .65*Math.abs(Math.sin(t*(.3 + i%5*.12) + i));
    ctx.fillStyle = `rgba(240,236,255,${.55*tw})`; ctx.fillRect(x, y, 1.5*u, 1.5*u); }
  const sp = (t*.07) % 1; if (sp < .1){ const k = sp/.1, n = Math.floor(t*.07), sx = VW*(.3 + (hash(n, 1, 1) % 500)/1000) + k*170*u, sy = VH*(.06 + (hash(n, 2, 2) % 120)/1000) + k*70*u;
    ctx.strokeStyle = `rgba(255,250,235,${.8*(1 - k)})`; ctx.lineWidth = 1.6*u; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx - 46*u*(1 - k*.5), sy - 19*u*(1 - k*.5)); ctx.stroke(); }
  // месяц
  const mx = VW*.18 - P.x*2*u, my = VH*.16; glow(mx, my, 120*u, 'rgba(255,236,200,A)', .18);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, VW, VH); ctx.arc(mx + 11*u, my - 6*u, 23*u, 0, Math.PI*2, true); ctx.clip('evenodd');
  ctx.fillStyle = '#F6EED8'; ctx.beginPath(); ctx.arc(mx, my, 26*u, 0, Math.PI*2); ctx.fill(); ctx.restore();
  // облака медленно плывут
  for (let i = 0; i < 4; i++){ const w = (180 + i*60)*u, x = ((t*(4 + i*2)*u + i*VW*.37) % (VW + w*2)) - w, y = VH*(.12 + i*.07);
    ctx.fillStyle = `rgba(${180 - i*10},${160 - i*8},${210 - i*6},${.1 + i*.02})`; ctx.beginPath();
    for (let k = 0; k < 5; k++) ctx.ellipse(x + k*w/5, y - Math.sin(k/4*Math.PI)*14*u, w/4, 14*u, 0, 0, Math.PI*2); ctx.fill(); }
  if (!story) drawThoughts(u, t);
  ctx.drawImage(M.far, px(4), py(4));
  // медленный тёплый луч маяка
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const bx = M.lx + M.pad + px(4), by = M.ly - 77*u + py(4);
  for (let i = 0; i < 2; i++){ ctx.save(); ctx.translate(bx, by); ctx.rotate(Math.sin(t*.18 + i*Math.PI)*1.1 + Math.PI*(i ? 0 : 1));
    const lg = ctx.createLinearGradient(0, 0, 420*u, 0); lg.addColorStop(0, 'rgba(255,220,160,.2)'); lg.addColorStop(1, 'rgba(255,220,160,0)');
    ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(420*u, -34*u); ctx.lineTo(420*u, 34*u); ctx.closePath(); ctx.fill(); ctx.restore(); }
  glow(bx, by, 40*u, 'rgba(255,224,160,A)', .7); ctx.restore();
  // бумажные фонарики поднимаются над городом
  for (let i = 0; i < 6; i++){ const p = ((t*.018 + i/6) % 1), x = VW*(.25 + (hash(i, 6, 3) % 700)/1000) + Math.sin(t*.4 + i*2)*14*u, y = VH*(.78 - p*.75), a = Math.sin(p*Math.PI);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y, 18*u, 'rgba(255,180,100,A)', .45*a); ctx.restore();
    ctx.fillStyle = `rgba(255,200,130,${.85*a})`; ctx.beginPath(); ctx.moveTo(x - 4*u, y - 5*u); ctx.lineTo(x + 4*u, y - 5*u); ctx.lineTo(x + 3*u, y + 5*u); ctx.lineTo(x - 3*u, y + 5*u); ctx.closePath(); ctx.fill(); }
  ctx.drawImage(M.near, px(9), py(9));
  // туман (Мгла) мягко колышется под городом
  for (let i = 0; i < 4; i++){ const y0 = VH*(.76 + i*.045);
    ctx.fillStyle = `rgba(${150 + i*12},${130 + i*10},${190 - i*6},${.16 + i*.04})`; ctx.beginPath(); ctx.moveTo(0, VH);
    for (let x = 0; x <= VW + 30; x += 30*u) ctx.lineTo(x, y0 + Math.sin(x*.008/u + t*(.25 + i*.07) + i*1.7)*9*u);
    ctx.lineTo(VW, VH); ctx.closePath(); ctx.fill(); }
  const ox = px(16), oy = py(16), X = (x) => x + M.pad + ox;
  ctx.drawImage(M.roof, ox, oy);
  // окно соседнего дома: тёплый свет, занавеска и силуэт деда с газетой
  const wx = X(M.hx + VW*.04), wy = M.ry - 170*u + oy, ww = 46*u, wh = 58*u, flick = .9 + .1*Math.sin(t*2.3) + .05*Math.sin(t*7.1);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(wx + ww/2, wy + wh/2, 90*u, 'rgba(255,190,110,A)', .25*flick); ctx.restore();
  ctx.fillStyle = `rgba(255,${200 + 20*flick|0},130,${.92*flick})`; ctx.fillRect(wx, wy, ww, wh);
  ctx.fillStyle = '#2A1E2C'; const hb = Math.sin(t*.6)*1.5*u; // силуэт: кепка, голова, плечи и газета
  ctx.beginPath(); ctx.arc(wx + ww*.45, wy + wh*.5 + hb, 8*u, 0, Math.PI*2); ctx.fill();
  ctx.fillRect(wx + ww*.45 - 11*u, wy + wh*.5 - 9*u + hb, 22*u, 4*u); ctx.fillRect(wx + ww*.45 - 8*u, wy + wh*.5 - 14*u + hb, 16*u, 6*u);
  ctx.fillRect(wx + ww*.2, wy + wh*.68, ww*.6, wh*.32);
  ctx.fillStyle = 'rgba(240,230,210,.9)'; ctx.save(); ctx.translate(wx + ww*.62, wy + wh*.62); ctx.rotate(-.15 + Math.sin(t*.3)*.03); ctx.fillRect(-9*u, -7*u, 18*u, 13*u); ctx.restore();
  const cur = Math.sin(t*.8)*3*u; ctx.fillStyle = 'rgba(160,60,60,.75)';
  ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx + 12*u + cur, wy); ctx.quadraticCurveTo(wx + 6*u, wy + wh*.5, wx + 9*u + cur, wy + wh); ctx.lineTo(wx, wy + wh); ctx.fill();
  ctx.strokeStyle = '#120E1A'; ctx.lineWidth = 3*u; ctx.strokeRect(wx, wy, ww, wh); ctx.beginPath(); ctx.moveTo(wx + ww/2, wy); ctx.lineTo(wx + ww/2, wy + wh); ctx.moveTo(wx, wy + wh/2); ctx.lineTo(wx + ww, wy + wh/2); ctx.lineWidth = 2*u; ctx.stroke();
  // дымок из трубы
  for (let i = 0; i < 7; i++){ const p = ((t*.12 + i/7) % 1), sx = X(M.cx + 13*u) + p*40*u + Math.sin(p*6 + t)*6*u, sy = M.ry - 60*u + oy - p*120*u;
    ctx.fillStyle = `rgba(200,190,220,${.18*(1 - p)})`; ctx.beginPath(); ctx.arc(sx, sy, (6 + p*16)*u, 0, Math.PI*2); ctx.fill(); }
  // гирлянда огоньков над крышей
  const gx0 = X(VW*.42), gx1 = X(VW*.97), gy = M.ry - 120*u + oy;
  ctx.strokeStyle = 'rgba(10,8,20,.8)'; ctx.lineWidth = 1.5*u; ctx.beginPath(); ctx.moveTo(gx0, gy); ctx.quadraticCurveTo((gx0 + gx1)/2, gy + 40*u, gx1, gy - 10*u); ctx.stroke();
  for (let i = 1; i < 12; i++){ const k = i/12, x = gx0 + (gx1 - gx0)*k, y = gy + (-10*u)*k + Math.sin(k*Math.PI)*20*u*.98, fl = .6 + .4*Math.sin(t*1.3 + i*1.7);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y + 3*u, 14*u, i % 3 ? 'rgba(255,200,120,A)' : 'rgba(140,210,255,A)', .5*fl); ctx.restore();
    ctx.fillStyle = i % 3 ? '#FFD996' : '#A8DCF4'; ctx.beginPath(); ctx.arc(x, y + 3*u, 2.4*u, 0, Math.PI*2); ctx.fill(); }
  // фонарь на крыше
  const lpx = X(M.fx), lpy = M.ry - 2*u + oy; ctx.save(); ctx.translate(lpx, lpy); ctx.scale(u, u);
  ctx.fillStyle = '#1A1630'; ctx.fillRect(-3, -96, 6, 96); ctx.fillRect(-10, -6, 20, 6);
  const fl = 1 + .05*Math.sin(t*3) + .03*Math.sin(t*7.3);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(0, -108, 150*fl, 'rgba(255,190,110,A)', .38); glow(0, -108, 34, 'rgba(255,236,190,A)', .7); ctx.restore();
  ctx.beginPath(); ctx.moveTo(-11, -96); ctx.lineTo(-9, -120); ctx.lineTo(9, -120); ctx.lineTo(11, -96); ctx.closePath(); ctx.fillStyle = '#FFE2A0'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#120E1A'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-13, -120); ctx.lineTo(0, -132); ctx.lineTo(13, -120); ctx.closePath(); ctx.fillStyle = '#1A1630'; ctx.fill();
  ctx.restore();
  // Генерал дремлет на трубе
  drawPigeon(ctx, X(M.cx + 13*u), M.ry - 62*u + oy + Math.sin(t*.8)*.8*u, t*.2, 1.6*u, -1);
  // Ая смотрит на город, рядом кружит Искра и тянется к курсору/пальцу
  const ax = X(VW*.6), ay = M.ry - 4*u + oy;
  ctx.save(); ctx.translate(ax, ay); ctx.scale(u, u);
  drawCharAt('aya', 0, 0, 1, {t, phase:0, run:0, air:false, vy:0, blink:(t % 4.2) < .12, emo:'', talk:false, sway:{x:Math.sin(t*.9)*2, y:0}}, 1.25, 1.25, 1);
  ctx.restore();
  const ix = ax - 34*u + Math.sin(t*.9)*16*u + P.x*26*u, iy = ay - 86*u + Math.sin(t*1.7)*8*u + P.y*14*u;
  drawIskra(ctx, ix, iy, t, 1.2*u, 0, 1);
  // осенние листья кружат в воздухе
  for (let i = 0; i < 9; i++){ const p = ((t*.05 + (hash(i, 2, 9) % 1000)/1000) % 1), x = ((hash(i, 8, 4) % 1000)/1000*VW*1.2 - p*VW*.4 + Math.sin(t*1.2 + i)*20*u), y = -20*u + p*(VH + 40*u);
    ctx.save(); ctx.translate(x, y); ctx.rotate(t*(1 + i%3*.4) + i); ctx.scale(u*1.1, u*.7*Math.abs(Math.sin(t*2 + i)) + u*.2);
    ctx.fillStyle = ['#E8823A','#D9A441','#B9572A'][i % 3]; ctx.beginPath(); ctx.ellipse(0, 0, 6, 3.4, 0, 0, Math.PI*2); ctx.fill(); ctx.restore(); }
  // светлячки поднимаются от тумана
  for (let i = 0; i < 22; i++){ const p = ((t*.05 + (hash(i, 9, 2) % 1000)/1000) % 1), x = (hash(i, 4, 8) % 1000)/1000*VW + Math.sin(t*.6 + i)*18*u, y = VH*(1 - p*.75);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y, 9*u, 'rgba(255,214,140,A)', .55*Math.sin(p*Math.PI)); ctx.restore(); }
  // мягкая виньетка
  const vg = ctx.createRadialGradient(VW*.55, VH*.55, VH*.3, VW*.55, VH*.55, VW*.8); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(6,6,18,.55)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, VW, VH);
}

function render(){
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (!S) return;
  if (S.bioPlay){ drawStory(); if (S.fadeIn > 0){ ctx.fillStyle = `rgba(8,8,16,${Math.min(1, S.fadeIn/.8)})`; ctx.fillRect(0, 0, VW, VH); } return; }
  if (S.mode === 'title'){ drawMenuScene(); return; } // у меню свой фон, не зависящий от глав
  if (!LAYERS) buildLayers();
  if (S.mode === 'end' && S.endSlide !== undefined && curCh().slides){ inBaseFrame(() => curCh().slides[S.endSlide](S.time)); return; } // свой кадр под экраном итогов
  if (S.prologue && S.scene){ inBaseFrame(() => { drawSlides(); ctx.save(); ctx.translate(-S.cam.x, -S.cam.y); drawParticles(false); ctx.restore(); }); return; }
  const th = theme(), sh = (S.shake > 0 && !REDUCED && SET.shake) ? 7*Math.min(1, S.shake/.3) : 0;
  ctx.save(); ctx.translate(sh ? rnd(-sh, sh) : 0, (sh ? rnd(-sh, sh) : 0));
  th.sky(); if (th.mid) th.mid();
  for (const L of LAYERS) drawLayer(L.img, L.par);
  if (th.back) th.back(); // поверх фоновых слоёв, но под миром
  ctx.save(); ctx.translate(-Math.round(S.cam.x + S.cam.kx), -Math.round(S.cam.y + S.cam.ky));
  drawFloats();
  for (const dc of S.W.deco) if (dc.x > S.cam.x - 300 && dc.x < S.cam.x + VW + 300) drawDeco(dc);
  drawWinds();
  drawTiles();
  for (const m of S.W.movers) drawMover(m);
  for (const lp of S.W.lamps) if (lp.x > S.cam.x - 120 && lp.x < S.cam.x + VW + 120) drawLamp(lp);
  if (S.W.door) drawDoor(S.W.door);
  for (const d of S.W.drops) drawDrop(d);
  for (const f of S.W.finds) drawFind(f);
  for (const k of S.W.kl) drawShade(k);
  for (const m of S.W.moths) drawMoth(m);
  drawNpcs();
  if (S.mode !== 'title') drawPlayer();
  if (!S.V.hidden && S.mode !== 'title') drawIskra(ctx, S.V.x, S.V.y, S.V.t, 1, S.V.scared);
  drawParticles(false);
  drawWave();
  drawMech();
  drawRise();
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
    if (S.mode === 'faint' || S.mode === 'caught'){ ctx.font = `italic 500 24px ${SERIF}`; ctx.textAlign = 'center'; ctx.fillStyle = `rgba(244,230,200,${S.white})`; ctx.fillText(S.mode === 'caught' ? 'Стража заметила Аю — назад к фонарю…' : 'Ая переводит дух у последнего фонаря…', VW/2, VH/2); } }
  if (S.mode !== 'title' && S.mode !== 'card' && !S.scene) withHud(drawHUD);
  if (S.mode === 'play'){ withHud(drawHintBanner); drawBellHint(); }
  const FL = S.scene && S.scene.lines[S.scene.i] && S.scene.lines[S.scene.i].flash;
  if (FL){ const [who, i] = FL.split(':'); inBaseFrame(() => drawMemory(BIO_STORY[who].mem[+i])); } // вспышка воспоминания посреди сцены
  else if (S.scene) renderVN();
  if (S.mode === 'card') drawCard();
  if (G1.paused){ ctx.fillStyle = 'rgba(12,10,22,.45)'; ctx.fillRect(0, 0, VW, VH); }
  if (S.fadeIn > 0){ ctx.fillStyle = `rgba(8,8,16,${Math.min(1, S.fadeIn/.8)})`; ctx.fillRect(0, 0, VW, VH); }
}
