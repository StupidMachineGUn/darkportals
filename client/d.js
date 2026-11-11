/* ---------- rendering ---------- */
let g=$('#c').getContext('2d');const cv=$('#c'),nc=document.createElement('canvas'),ng=nc.getContext('2d');
let userS=0,baseS=3,S=3,DPR=1,OX=0,OY=0,marker=null,mmImg,mm;
function resize(){const w=innerWidth,h=innerHeight;DPR=Math.min(devicePixelRatio||1,2.5,Math.sqrt(3e6/Math.max(1,w*h)));cv.width=Math.round(w*DPR);cv.height=Math.round(h*DPR);nc.width=cv.width;nc.height=cv.height;
 baseS=Math.max(3,Math.round(Math.min(cv.width,cv.height*1.1)/(T*10)));S=userS||baseS}
addEventListener('resize',resize);
function healCanvas(){try{buildTiles();buildSprites();WSC.clear();mmImg=mk(MW,MH,c=>{for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){c.fillStyle=mmCol[map[idx(x,y)]];c.fillRect(x,y,1,1)}})}catch(e){}}
function canvasBlank(){try{const c=tileImg[TL.GRASS][0].getContext('2d');return c.getImageData(8,8,1,1).data[3]===0}catch(e){return false}}
function reportErr(w,e){ERR.n++;ERR.m=w+': '+(e&&e.message||e);if(!ERR.t||Date.now()-ERR.t>3000){ERR.t=Date.now();console.error(w,e);const b=$('#errbox');if(b){b.style.display='block';b.textContent='⚠ '+ERR.m+' ('+ERR.n+')'}}}
const ERR={n:0,m:'',t:0};
document.addEventListener('visibilitychange',()=>{if(!document.hidden){resize();healCanvas()}});addEventListener('pageshow',()=>{resize();healCanvas()});addEventListener('orientationchange',()=>setTimeout(()=>{resize();healCanvas()},300));
const w2s=(x,y)=>[x*T*S+OX,y*T*S+OY];
const PA=[{m:'#3a5a9a',l:'#5a7aba',d:'#243a66',t:'#c9b27a'},{m:'#b5703a',l:'#e09a5a',d:'#6a3f1e',t:'#f0c070'},{m:'#7a8898',l:'#b4c2d2',d:'#4a5462',t:'#dcdcdc'},{m:'#8fa6c4',l:'#d6e6ff',d:'#4f6384',t:'#ffd36b'},
 {m:'#8a2a1e',l:'#c8503a',d:'#4a120c',t:'#e8d8a0'},{m:'#b8903a',l:'#f0d070',d:'#6a4a12',t:'#fff0a0'},{m:'#4fb0c0',l:'#a8f0ff',d:'#256070',t:'#e8ffff'},{m:'#2a2a34',l:'#5a5a70',d:'#101018',t:'#ff5a2a'},{m:'#e8e0ff',l:'#ffffff',d:'#9a8ad0',t:'#ffd34a'}];
const ARMC=PA.map(p=>p.m),ARMI={arm0:0,arm1:1,arm2:2,arm3:3,scalearm:4,arm4:5,arm5:6,arm6:7,arm7:8},armLv=id=>ARMI[id]||0;
const apal=(t,ta)=>{const p=PA[Math.max(0,Math.min(8,t))];return ta?{m:ta,l:shade(ta,1.45),d:shade(ta,.5),t:p.t}:p};
/* --- weapon sprites: drawn once per (weapon,tint) into a tiny canvas, pointing right, grip pivot at (3,5) --- */
const WSC=new Map(),qt=h=>{const n=parseInt(h.slice(1),16),q=v=>(v&240)|8;return '#'+((1<<24)+(q(n>>16&255)<<16)+(q(n>>8&255)<<8)+q(n&255)).toString(16).slice(1)};
const WS={sword0:['sword',8,'#9a8a7a','#c8b8a0','#5a4a3a','#6a5a3a'],sword1:['sword',9,'#d08a4a','#f4c080','#8a4a22','#d9b24a'],sword2:['sword',11,'#c8d0dc','#f4f8ff','#7a8494','#d9b24a'],sword3:['sword',12,'#d8e4f8','#ffffff','#7a92b8','#e0b050'],
 sword4:['sword',13,'#8ff0ff','#e8ffff','#3a9ab0','#d9b24a','rune'],sword5:['sword',14,'#6ad0e0','#d8ffff','#2a7a90','#e8ffff'],sword6:['sword',15,'#3a3a46','#8a8a9a','#16161e','#ff5a2a','serr'],sword7:['sword',16,'#fff4c8','#ffffff','#e0b040','#ffd34a','glow'],
 great1:['great',17,'#b8c0cc','#f0f4ff','#6a7484','#8a6a2a'],dagger1:['dagger',7,'#c0c8d4','#f4f8ff','#6a7484','#6a4a2a'],axe1:['axe',1,'#a8b0bc','#e8eef8','#5a6270'],axe2:['axe',2,'#c8d0dc','#ffffff','#6a7484'],axe3:['axe',3,'#e0b040','#fff0a0','#8a5a12'],
 mace1:['mace',1,'#8a94a4','#c8d2e2','#4a5262'],spear1:['spear',1,'#d8e0ec','#ffffff','#7a8494'],
 staff:['staff',1],staff2:['staff',2],staff3:['staff',3],staff4:['staff',4],staff5:['staff',5],staff6:['staff',6]};
function wsprite(wid,tint){const key=wid+(tint||'');let c=WSC.get(key);if(c)return c;if(WSC.size>300)WSC.clear();const sp=WS[wid]||WS.sword0;
 c=mk(26,11,x=>{const r=(col,a,b,w=1,h=1)=>{x.fillStyle=col;x.fillRect(a,b,w,h)},k=sp[0];
  let M=sp[2],H=sp[3],Lo=sp[4];if(tint&&k!=='staff'){M=tint;H=shade(tint,1.5);Lo=shade(tint,.55)}
  const wood='#7a4a22',woodL='#a06a38',woodD='#4a2a10';
  if(k==='sword'||k==='great'||k==='dagger'){const L=sp[1],th=k==='great'?5:3,y0=5-((th-1)>>1),gd=sp[5];
   r(woodD,0,4,1,3);r(wood,1,5,3,1);r(woodD,1,6,3,1);r(gd,4,k==='dagger'?4:(k==='great'?2:3),1,k==='dagger'?3:(k==='great'?7:5));
   if(sp[6]==='glow'||(tint&&k==='sword'&&0)){r('rgba(255,240,170,.35)',5,y0-1,L+1,th+2)}
   for(let i=0;i<L;i++){const tip=i>=L-2,x0=5+i;for(let j=0;j<th;j++){if(tip&&(j===0||j===th-1))continue;if(i===L-1&&j!==(th>>1))continue;r(j===0?H:j===th-1?Lo:M,x0,y0+j)}}
   if(th===5){for(let i=2;i<L-3;i++)r(Lo,5+i,5)}else if(k!=='dagger'){for(let i=2;i<L-3;i+=1)if(i%2===0)r(tint?H:Lo,5+i,5)}
   if(sp[6]==='rune')for(let i=3;i<L-2;i+=3)r('#ffffff',5+i,5);
   if(sp[6]==='serr')for(let i=2;i<L-2;i+=2)r('#ff4a2a',5+i,y0+th);
   r(H,4,k==='dagger'?4:(k==='great'?2:3),1,1)}
  else if(k==='axe'){const n=sp[1];r(woodD,0,5,15,2);r(wood,0,5,15,1);r(woodL,1,5,1,1);r('#5a3a1a',15,5,1,2);
   const hw=[2,3,4,5,5,5,4,3,2];for(let rw=0;rw<9;rw++){const w=hw[rw]+(n>1?1:0);for(let i=0;i<w;i++)r(i===w-1?H:rw<3?M:rw>5?Lo:M,13+i,1+rw)}
   for(let rw=0;rw<9;rw++)r(Lo,13,1+rw);r(woodD,13,5,3,2);if(n===3){for(let rw=1;rw<8;rw++)r(rw<4?M:Lo,9,1+rw,4,1);r(H,9,2,1,5)}if(n>=2)r(H,14,3,2,1)}
  else if(k==='mace'){r(woodD,0,5,14,2);r(wood,0,5,14,1);r(woodL,2,5,1,1);r('#5a3a1a',12,4,2,4);
   for(let yy=3;yy<8;yy++)for(let xx=14;xx<19;xx++){if((yy===3||yy===7)&&(xx===14||xx===18))continue;r(yy<=4&&xx<=16?H:yy>=6||xx>=18?Lo:M,xx,yy)}
   r(H,19,5);r(H,16,2);r(H,16,8);r(H,13,5);r(Lo,14,3)}
  else if(k==='spear'){r(woodD,0,5,20,2);r(wood,0,5,20,1);r(woodL,4,5,1,1);r('#b02a2a',17,4,2,4);r('#e04a4a',17,4,2,1);
   const hs=[[20,4,3],[21,3,5],[22,3,5],[23,4,3],[24,4,3],[25,5,1]];for(const [xx,y1,h] of hs){for(let j=0;j<h;j++)r(j===0?H:j===h-1?Lo:M,xx,y1+j)}}
  else if(k==='staff'){const n=sp[1],G=tint||['#8cf','#ff9a2a','#b46aff','#8ae8ff','#9a5aff','#fff0a0'][n-1],GL=shade(G,1.5),GD=shade(G,.55);
   r(woodD,0,5,16,2);r(wood,0,5,16,1);r(woodL,3,5,1,1);r(woodL,9,5,1,1);
   if(n===1){r(wood,15,3,2,1);r(wood,15,8,2,1);r(wood,16,4,1,1);r(wood,16,7,1,1);r(GD,17,4,4,4);r(G,17,4,3,3);r(GL,17,4,1,1);r('#fff',18,5)}
   else if(n===2){for(let i=0;i<4;i++){r(G,17+i,5-i);r(G,17+i,6+i)}for(let i=0;i<5;i++){r(i<2?GL:G,17+(i>>1),4,1,1)}r(GL,18,3);r(G,19,2);r(GD,17,5,3,2);r('#ffe08a',18,5,2,2);r(wood,15,4,2,3)}
   else if(n===3){r(wood,15,2,1,7);r(wood,16,2,1,1);r(wood,16,8,1,1);r(wood,17,1,1,2);r(wood,17,8,1,2);r(GD,17,4,4,4);r(G,17,4,3,3);r(GL,17,4,1,1);r('#fff',18,5);r(GL,21,5,1,1)}
   else if(n===4){r(GD,16,3,1,5);r(G,17,2,2,7);r(GL,18,1,2,9);r(G,20,3,1,5);r(GL,19,2,1,2);r('#fff',18,3,1,1);r(GD,17,5,3,1);r(wood,15,4,1,3)}
   else if(n===5){r('#b46aff',17,2,5,1);r('#b46aff',17,9,5,1);r('#b46aff',16,3,1,6);r('#b46aff',22,3,1,6);r(GD,17,3,5,6);r('#2a1a4a',18,4,3,4);r('#fff',19,5,1,1);r('#d9a6ff',17,3,1,1);r(wood,14,4,2,3)}
   else{r('#ffd34a',15,2,2,1);r('#ffd34a',15,8,2,1);r('#ffd34a',16,3,1,1);r('#ffd34a',16,7,1,1);r('rgba(255,240,160,.4)',16,1,7,9);r(G,18,3,3,5);r('#fff',19,4,1,3);r('#ffd34a',21,2,1,1);r('#ffd34a',21,8,1,1);r('#ffd34a',22,5,1,1);r('#ffd34a',17,4,1,3);r(wood,14,4,2,3)}}
 });WSC.set(key,c);return c}
function drawWeapon(px,py,dir,sp,wid,tint){if(!wid)return;const fa=[Math.PI/2,Math.PI,0,-Math.PI/2][dir],sg=dir===1?-1:1,hx=[px+12,px+3,px+10,px+4][dir],hy=py+10;
 const a=sp>=0?fa-sg*1.3+sg*sp*2.6:[.5,-2.05,-1.1,-2.4][dir];g.save();g.translate(hx,hy);g.rotate(a);
 g.drawImage(wsprite(wid,tint?qt(tint):null),-3,-5);g.restore();
 if(sp>=0){g.strokeStyle=`rgba(255,255,255,${.75*(1-sp)+.15})`;g.lineWidth=2;g.beginPath();g.arc(px+8,py+8,12,fa-sg*1.3,a,sg<0);g.stroke()}}
/* --- armour pieces --- */
function armFront(px,py,dir,t,p){if(t<1)return;const f=g.fillStyle;
 g.fillStyle=p.m;g.fillRect(px+4,py+7,8,4);g.fillStyle=p.l;g.fillRect(px+5,py+7,3,1);g.fillRect(px+4,py+8,1,2);g.fillStyle=p.d;g.fillRect(px+11,py+8,1,2);g.fillRect(px+4,py+10,8,1);g.fillStyle=p.t;g.fillRect(px+7,py+10,2,1);
 if(t>=2){g.fillStyle=p.m;g.fillRect(px+2,py+6,3,3);g.fillRect(px+11,py+6,3,3);g.fillStyle=p.l;g.fillRect(px+2,py+6,3,1);g.fillRect(px+11,py+6,3,1);g.fillStyle=p.d;g.fillRect(px+2,py+8,3,1);g.fillRect(px+11,py+8,3,1);g.fillRect(px+2,py+10,2,1);g.fillRect(px+12,py+10,2,1)}
 if(t>=3&&dir===0){g.fillStyle=p.t;g.fillRect(px+7,py+8,2,2);g.fillStyle=p.d;g.fillRect(px+8,py+9,1,1)}
 if(t>=4){g.fillStyle=p.d;g.fillRect(px+5,py+6,6,1)}
 if(t>=5){g.fillStyle=p.t;g.fillRect(px+2,py+5,1,2);g.fillRect(px+13,py+5,1,2)}
 if(t>=6&&dir===0){g.fillStyle=p.t;g.fillRect(px+4,py+7,1,3);g.fillRect(px+11,py+7,1,3)}
 if(t>=7&&dir===0){g.globalAlpha=.55+.35*Math.sin(clock*4);g.fillStyle=p.t;g.fillRect(px+7,py+8,2,2);g.globalAlpha=1}
 if(t>=8){g.fillStyle=p.t;g.fillRect(px+4,py+7,8,1);g.fillRect(px+4,py+10,8,1)}
 if(dir===3&&t>=4){g.fillStyle=p.d;g.fillRect(px+4,py+7,8,6);g.fillStyle=p.m;g.fillRect(px+5,py+7,6,5);g.fillStyle=p.l;g.fillRect(px+5,py+7,2,5);g.fillStyle=p.t;g.fillRect(px+5,py+12,6,1)}
 g.fillStyle=f}
function armSide(px,py,t,p,as){if(t<1)return;
 if(t>=4){g.fillStyle=p.d;g.fillRect(px+3,py+7,3,6);g.fillStyle=p.m;g.fillRect(px+3,py+7,2,5);g.fillStyle=p.t;g.fillRect(px+3,py+12,3,1)}
 g.fillStyle=p.m;g.fillRect(px+5,py+7,6,4);g.fillStyle=p.l;g.fillRect(px+5,py+7,5,1);g.fillStyle=p.d;g.fillRect(px+5,py+10,6,1);g.fillStyle=p.t;g.fillRect(px+9,py+10,1,1);
 if(t>=2){g.fillStyle=p.m;g.fillRect(px+6+as,py+6,4,3);g.fillStyle=p.l;g.fillRect(px+6+as,py+6,4,1);g.fillStyle=p.d;g.fillRect(px+6+as,py+8,4,1)}
 if(t>=3){g.fillStyle=p.t;g.fillRect(px+9,py+8,1,1)}if(t>=5){g.fillStyle=p.t;g.fillRect(px+7+as,py+5,1,2)}
 if(t>=8){g.fillStyle=p.t;g.fillRect(px+5,py+7,6,1)}}
function helmet(px,py,dir,t,p,side){if(t<0)return;
 if(dir===3){g.fillStyle=p.m;g.fillRect(px+4,py,8,5);g.fillStyle=p.l;g.fillRect(px+5,py,3,1);g.fillStyle=p.d;g.fillRect(px+4,py+4,8,1);if(t>=4){g.fillStyle='#e8dcb8';g.fillRect(px+2,py-2,2,3);g.fillRect(px+12,py-2,2,3)}if(t>=5){g.fillStyle=p.t;g.fillRect(px+7,py-2,2,3)}if(t>=8){g.fillStyle=p.t;g.fillRect(px+4,py-1,1,2);g.fillRect(px+7,py-2,2,3);g.fillRect(px+11,py-1,1,2)}return}
 g.fillStyle=p.m;if(side){g.fillRect(px+4,py,7,3);g.fillRect(px+4,py+3,2,3)}else{g.fillRect(px+4,py,8,3);if(t>=2){g.fillRect(px+3,py+1,1,5);g.fillRect(px+12,py+1,1,5)}else{g.fillRect(px+4,py+3,1,2);g.fillRect(px+11,py+3,1,2)}}
 g.fillStyle=p.l;g.fillRect(px+5,py,3,1);g.fillStyle=p.d;g.fillRect(px+4,py+2,side?7:8,1);
 if(t>=2&&!side){g.fillStyle=p.l;g.fillRect(px+7,py+3,2,3)}if(t>=2&&side){g.fillStyle=p.l;g.fillRect(px+10,py+3,1,3)}
 if(t>=3){g.fillStyle=p.t;g.fillRect(px+(side?5:4),py+2,side?6:8,1)}
 if(t>=4){g.fillStyle='#e8dcb8';g.fillRect(px+2,py-2,2,3);g.fillRect(px+12,py-2,2,3);g.fillRect(px+1,py-3,1,2);g.fillRect(px+14,py-3,1,2)}
 if(t>=5){g.fillStyle=p.t;g.fillRect(px+7,py-2,2,3)}
 if(t>=6){g.fillStyle=p.t;g.fillRect(px+7,py+1,2,1)}
 if(t>=7){g.fillStyle=p.l;g.fillRect(px+1,py,2,2);g.fillRect(px+13,py,2,2);g.fillRect(px,py-1,1,1);g.fillRect(px+15,py-1,1,1)}
 if(t>=8){g.fillStyle=p.t;g.fillRect(px+4,py-1,1,2);g.fillRect(px+7,py-2,2,3);g.fillRect(px+11,py-1,1,2);g.fillRect(px+4,py+1,8,1)}}
function bootsDraw(x,y0,t,p,side){if(t<0)return;g.fillStyle=p.m;g.fillRect(x,y0+1,3,3);g.fillStyle=t>=3?p.t:p.l;g.fillRect(x,y0+1,3,1);g.fillStyle=p.d;g.fillRect(x,y0+3,3,1);g.fillStyle=p.l;g.fillRect(x,y0+2,1,1);if(side){g.fillStyle=p.m;g.fillRect(x+3,y0+3,1,1)}}
function drawSide(px,py,ph,shirt,hair,o){
 const sn=o.moving?Math.sin(ph):0,skin=o.skin||'#f2c9a0',sh=o.flash?'#fff':shirt,as=Math.round(sn*2),ar=o.arm|0;
 g.fillStyle='#0004';g.fillRect(px+3,py+13,10,3);
 g.fillStyle=sh;g.fillRect(px+6-as,py+7,2,5);g.fillStyle='#0005';g.fillRect(px+6-as,py+7,2,5);
 g.fillStyle='#22223a';g.fillRect(px+6-as,py+11+(sn>0?1:0),3,4);
 g.fillStyle=o.leg||'#3a3a58';g.fillRect(px+7+as,py+11+(sn>0?0:1),3,4);
 g.fillStyle=sh;g.fillRect(px+5,py+6,6,6);g.fillStyle='#0003';g.fillRect(px+5,py+10,6,2);
 g.fillStyle=sh;g.fillRect(px+7+as,py+7,3,5);g.fillStyle=skin;g.fillRect(px+7+as,py+11,3,2);
 g.fillStyle=skin;g.fillRect(px+5,py+1,6,6);g.fillRect(px+11,py+4,1,2);
 g.fillStyle=hair;g.fillRect(px+4,py,7,2);g.fillRect(px+4,py+1,3,5);g.fillStyle='#223';g.fillRect(px+9,py+3,1,2);
 const pal=apal(ar,o.ta),ht=o.helm!==undefined?o.helm:(ar>=2?ar:-1),bt=o.boots!==undefined?o.boots:-1;
 armSide(px,py,ar,pal,as);bootsDraw(px+6-as,py+11+(sn>0?1:0),bt,apal(bt,o.ta),1);bootsDraw(px+7+as,py+11+(sn>0?0:1),bt,apal(bt,o.ta),1);helmet(px,py,1,ht,apal(ht,o.ta),true);}
function drawChar(px,py,dir,ph,shirt,hair,o={}){if(o.chick){drawChicken(px,py,dir,ph,o.flash,1,o.moving);return}
 const sp=o.sp==null?-1:o.sp;if(sp>=0){const l=Math.sin(sp*Math.PI)*2.5;px+=DIR[dir][0]*l;py+=DIR[dir][1]*l*.7}
 if(dir===1||dir===2){const fl=dir===1;if(fl){g.save();g.translate(px*2+16,0);g.scale(-1,1)}drawSide(px,py,ph,shirt,hair,o);if(o.wid)drawWeapon(px,py,2,sp,o.wid,o.tw);if(fl)g.restore();return}
 const sn=o.moving?Math.sin(ph):0,skin=o.skin||'#f2c9a0',ar=o.arm|0;
 g.fillStyle='#0004';g.fillRect(px+3,py+13,10,3);
 if(o.wid&&dir===3)drawWeapon(px,py,dir,sp,o.wid,o.tw);
 g.fillStyle=o.leg||'#3a3a58';g.fillRect(px+4,py+11+(sn>0?0:1),3,4);g.fillRect(px+9,py+11+(sn>0?1:0),3,4);
 g.fillStyle=o.flash?'#fff':shirt;g.fillRect(px+4,py+6,8,6);g.fillStyle='#0003';g.fillRect(px+4,py+10,8,2);
 g.fillStyle=o.flash?'#fff':shirt;g.fillRect(px+2,py+7,2,5);g.fillRect(px+12,py+7,2,5);g.fillStyle=skin;g.fillRect(px+2,py+11,2,2);g.fillRect(px+12,py+11,2,2);
 g.fillStyle=skin;g.fillRect(px+4,py+1,8,6);g.fillStyle=hair;
 if(dir===3){g.fillRect(px+4,py,8,6)}else{g.fillRect(px+4,py,8,2);g.fillRect(px+4,py,1,4);g.fillRect(px+11,py,1,4);g.fillStyle='#223';
  if(dir===0){g.fillRect(px+6,py+4,1,2);g.fillRect(px+9,py+4,1,2)}else if(dir===1)g.fillRect(px+5,py+4,1,2);else g.fillRect(px+10,py+4,1,2)}
 {const pal=apal(ar,o.ta),ht=o.helm!==undefined?o.helm:(ar>=2?ar:-1),bt=o.boots!==undefined?o.boots:-1,bp=apal(bt,o.ta);armFront(px,py,dir,ar,pal);bootsDraw(px+4,py+11+(sn>0?0:1),bt,bp);bootsDraw(px+9,py+11+(sn>0?1:0),bt,bp);helmet(px,py,dir,ht,apal(ht,o.ta),false)}
 if(o.wid&&dir!==3)drawWeapon(px,py,dir,sp,o.wid,o.tw)}
function drawSheep(px,py,dir,t,f,mv){const r=dir===1?-1:1,b=mv?Math.round(Math.sin(t*2)):0,W=f?'#fff':null,hx=r>0?px+11:px+1;g.fillStyle='#0004';g.fillRect(px+2,py+14,12,2);
 g.fillStyle=W||'#4a3a2a';g.fillRect(px+4,py+11,2,4);g.fillRect(px+10,py+11,2,4);g.fillStyle=W||'#f2eee4';g.fillRect(px+2,py+5+b,12,8);g.fillRect(px+3,py+4+b,10,1);g.fillRect(px+3,py+13+b,10,1);g.fillStyle=W||'#d9d3c4';g.fillRect(px+3,py+10+b,10,2);g.fillRect(px+5,py+6+b,2,1);g.fillRect(px+9,py+8+b,2,1);
 g.fillStyle=W||'#4a3a2a';g.fillRect(hx,py+5+b,4,5);g.fillStyle='#fff';g.fillRect(hx+(r>0?2:1),py+6+b,1,1);g.fillStyle='#111';g.fillRect(hx+(r>0?3:0),py+6+b,1,1)}
function drawChicken(px,py,dir,t,f,v,mv){const r=dir===1?-1:1,C=[['#f4f1e8','#cfc8b8'],['#b8763a','#8a5224'],['#3a3a44','#222230']][v%3],bob=!mv&&Math.sin(t*1.2)>.55?2:0,w=mv&&Math.sin(t*3)>0?1:0,X=(a,wd=1)=>r>0?px+a:px+16-a-wd,Q=(c,a,b,wd,h)=>{g.fillStyle=c;g.fillRect(X(a,wd),py+b,wd,h)};
 g.fillStyle='#0004';g.fillRect(px+3,py+13,10,3);Q(f?'#fff':C[1],2,5,3,4);Q(f?'#fff':C[0],4,7,7,5);Q(f?'#fff':C[0],10,4+bob,4,5);Q(C[1],5,8,4,2);Q('#e33',11,3+bob,2,1);Q('#fb3',14,6+bob,2,1);Q('#111',12,5+bob,1,1);Q('#e33',13,9+bob,1,1);Q('#fb3',6+w,12,1,2);Q('#fb3',9-w,12,1,2)}
function drawRooster(px,py,dir,t,f,mv){const r=dir===1?-1:1,bob=!mv&&Math.sin(t*1.2)>.55?1:0,w=mv&&Math.sin(t*3)>0?1:0,s=2.2;g.save();g.translate(px+8,py+16);g.scale(s,s);g.translate(-8,-16);
 const X=(a,wd=1)=>r>0?a:16-a-wd,Q=(c,a,b,wd,h)=>{g.fillStyle=c;g.fillRect(X(a,wd),b,wd,h)};
 g.fillStyle='#0004';g.fillRect(3,13,10,3);const fc=['#2a8a4a','#2a5ac8','#c82a2a','#e8b030','#2a8a4a'];for(let i=0;i<5;i++)Q(f?'#fff':fc[i],i<3?0:1,2+i*1.4,2+(i%2),3);
 Q(f?'#fff':'#c0622a',3,6,8,6);Q('#e8a050',8,7,3,4);Q('#8a3a14',5,8,4,2);Q(f?'#fff':'#c0622a',10,3+bob,4,5);Q('#e33',10,1+bob,1,2);Q('#e33',11,0+bob,1,3);Q('#e33',12,1+bob,1,2);Q('#ffd34a',14,5+bob,2,1);Q('#a00',12,4+bob,1,1);Q('#e33',13,8+bob,1,2);
 Q('#ffd34a',6+w,12,1,2);Q('#ffd34a',9-w,12,1,2);Q('#ffd34a',4,10,1,1);g.restore();g.fillStyle='#ffd34a';g.fillRect(px+(r>0?10:4),py-14+bob*2,5,2);g.fillRect(px+(r>0?10:4),py-16+bob*2,1,2);g.fillRect(px+(r>0?12:6),py-17+bob*2,1,3);g.fillRect(px+(r>0?14:8),py-16+bob*2,1,2)}
function drawWizard(px,py,dir,t,f){py+=Math.round(Math.sin(t*.6))-1;const W=f?'#fff':null;g.fillStyle='#0005';g.fillRect(px+2,py+15,12,2);g.fillStyle=W||'#3a1a5a';g.fillRect(px+3,py+6,10,9);g.fillRect(px+2,py+12,12,3);g.fillStyle=W||'#2a0f44';g.fillRect(px+3,py+13,10,1);g.fillStyle=W||'#1b0a30';g.fillRect(px+4,py+2,8,5);g.fillRect(px+3,py+5,10,1);g.fillRect(px+6,py,4,2);g.fillStyle='#ffd34a';g.fillRect(px+7,py+4,2,2);g.fillStyle='#e9c7a0';g.fillRect(px+5,py+6,6,3);g.fillStyle='#ff3030';g.fillRect(px+6,py+7,1,1);g.fillRect(px+9,py+7,1,1);g.fillStyle='#ddd';g.fillRect(px+5,py+9,6,3);const sx=dir===1?px:px+14;g.fillStyle='#5a3a1a';g.fillRect(sx,py+3,1,12);g.fillStyle='rgba(180,106,255,'+(.4+.2*Math.sin(t))+')';g.fillRect(sx-2,py-1,5,5);g.fillStyle=W||'#d9a8ff';g.fillRect(sx-1,py,3,3)}
function drawEnemy(e){if(e.el&&!e._in){const cx=Math.round(e.x*T),cy=Math.round(e.y*T),k=e.sc;g.save();g.translate(cx,cy);g.scale(k,k);g.translate(-cx,-cy);g.fillStyle=e.el==='shaman'?'#6af4':'#f84a';g.fillRect(cx-9,cy-1,18,3);e._in=1;try{drawEnemy(e)}finally{e._in=0}g.restore();return}
 const px=Math.round(e.x*T-8),py=Math.round(e.y*T-13),f=e.flash>0,t=clock*5+e.ph;
 if(e.t==='sheep')drawSheep(px,py,e.dir,t,f,e.mv);else if(e.t==='chicken')drawChicken(px,py,e.dir,t,f,Math.floor((e.ph*7)%3),e.mv);else if(e.t==='rooster')drawRooster(px,py,e.dir,t,f,e.st===1);
 else if(e.t==='wizard')drawWizard(px,py,e.dir,t,f);
 else if(e.t==='slime'){const q=Math.round(Math.sin(t));g.fillStyle='#0004';g.fillRect(px+2,py+13,12,3);g.fillStyle=f?'#fff':'#4fd24f';g.fillRect(px+2,py+8+q,12,6-q);g.fillRect(px+3,py+6+q,10,2);g.fillRect(px+5,py+5+q,6,1);g.fillStyle='#9bff9b';g.fillRect(px+4,py+7+q,2,2);g.fillStyle='#143';g.fillRect(px+5,py+9+q,2,2);g.fillRect(px+9,py+9+q,2,2)}
 else if(e.t==='wolf'){const r=e.dir===1?-1:1,sn=Math.sin(t*1.6)>0?1:0,c=f?'#fff':'#8a8f99';g.fillStyle='#0004';g.fillRect(px+1,py+13,14,3);g.fillStyle=c;g.fillRect(px+2,py+6,11,6);g.fillRect(r>0?px+10:px,py+3,6,6);g.fillRect(r>0?px+10:px+2,py+1,2,3);g.fillRect(r>0?px+14:px,py+1,2,3);
  g.fillStyle='#5c616b';g.fillRect(r>0?px:px+12,py+5,3,3);g.fillRect(px+3,py+12,2,3-sn);g.fillRect(px+10,py+12,2,2+sn);g.fillStyle='#f33';g.fillRect(r>0?px+13:px+2,py+5,1,1)}
 else if(e.t==='skeleton')drawChar(px,py,e.dir,t,'#e6e6e6','#cfcfcf',{moving:e.st===1,skin:'#f4f4f4',leg:'#bbb',flash:f,wid:'sword0',sp:e.sw>0?1-e.sw/.25:-1});
 else if(e.t==='goblin'||e.t==='bandit'){const gb=e.t==='goblin',k=gb?.85:1.1;g.save();g.translate(px+8,py+16);g.scale(k,k);
  drawChar(-8,-16,e.dir,t,gb?'#6a5a2a':'#3a3a48',gb?'#2a3a1a':'#222',{moving:e.st===1,flash:f,skin:gb?'#7fbf4a':'#d9a87a',leg:gb?'#4a3a1a':'#222',wid:'dagger1',sp:e.sw>0?1-e.sw/.25:-1,arm:gb?0:1});
  if(gb){g.fillStyle=f?'#fff':'#7fbf4a';g.fillRect(-6,-14,2,2);g.fillRect(4,-14,2,2);g.fillStyle='#f33';g.fillRect(-2,-11,1,1);g.fillRect(1,-11,1,1)}else{g.fillStyle=f?'#fff':'#b02a2a';g.fillRect(-4,-15,8,2);g.fillRect(3,-14,2,3)}g.restore()}
 else if(e.t==='bat'){const fl=Math.sin(t*3)>0?1:0,by=py+3+Math.round(Math.sin(t)*2);g.fillStyle='#0003';g.fillRect(px+4,py+13,8,2);g.fillStyle=f?'#fff':'#3a2a4a';g.fillRect(px+6,by+3,4,4);g.fillRect(px+5,by+2,1,2);g.fillRect(px+10,by+2,1,2);
  g.fillStyle=f?'#fff':'#5a4a70';g.fillRect(px,by+(fl?1:4),6,2);g.fillRect(px+10,by+(fl?1:4),6,2);g.fillRect(px+1,by+(fl?3:5),4,1);g.fillRect(px+11,by+(fl?3:5),4,1);g.fillStyle='#f55';g.fillRect(px+6,by+4,1,1);g.fillRect(px+9,by+4,1,1)}
 else if(e.t==='spider'){const w=Math.sin(t*2)>0?1:0;g.fillStyle='#0004';g.fillRect(px+1,py+13,14,3);g.fillStyle=f?'#fff':'#4a3a55';for(let i=0;i<4;i++){g.fillRect(px+(i%2)*w,py+6+i*2,4,1);g.fillRect(px+12-(i%2)*w,py+6+i*2,4,1)}
  g.fillStyle=f?'#fff':'#2a2230';g.fillRect(px+4,py+6,8,6);g.fillRect(px+5,py+5,6,1);g.fillStyle='#b22';g.fillRect(px+7,py+8,2,2);g.fillStyle='#f44';g.fillRect(px+5,py+6,1,1);g.fillRect(px+10,py+6,1,1)}
 else if(e.t==='golem'){const wx=Math.round(e.x*T-12),wy=Math.round(e.y*T-24),b=Math.round(Math.sin(t*.6));g.fillStyle='#0005';g.fillRect(wx+2,wy+25,20,4);g.fillStyle=f?'#fff':'#6a6e78';g.fillRect(wx+5,wy+8,14,13);g.fillRect(wx+8,wy+1+b,8,8);g.fillRect(wx,wy+9+b,5,11);g.fillRect(wx+19,wy+9+b,5,11);g.fillRect(wx+6,wy+21,5,5);g.fillRect(wx+13,wy+21,5,5);
  g.fillStyle='#8a8e98';g.fillRect(wx+5,wy+8,14,2);g.fillRect(wx+8,wy+1+b,8,1);g.fillRect(wx,wy+9+b,5,1);g.fillRect(wx+19,wy+9+b,5,1);g.fillStyle='#4a4e58';g.fillRect(wx+5,wy+19,14,2);g.fillRect(wx+6,wy+24,5,2);g.fillRect(wx+13,wy+24,5,2);g.fillStyle='#3a6a3a';g.fillRect(wx+6,wy+8,4,2);g.fillRect(wx+1,wy+9+b,3,1);
  g.fillStyle='#ff9a2a';g.fillRect(wx+9,wy+4+b,2,2);g.fillRect(wx+13,wy+4+b,2,2);g.fillRect(wx+10,wy+13,4,3);g.fillStyle='#ffe08a';g.fillRect(wx+11,wy+14,2,1)}
 else if(e.t==='orc'||e.t==='ogre'||e.t==='wraith'||e.t==='troll'||e.t==='demon'){const tr=e.t==='troll',dm=e.t==='demon',og=e.t==='ogre'||tr,wr=e.t==='wraith',k=dm?1.7:tr?1.75:og?1.5:e.t==='orc'?1.15:1.05;g.save();if(wr)g.globalAlpha=.7;g.translate(px+8,py+16-(wr?3+Math.sin(t*.8)*2:0));g.scale(k,k);
  drawChar(-8,-16,e.dir,t,dm?'#5a1010':tr?'#3a4a3a':og?'#4a3a2a':wr?'#4a3a8a':'#5a2a1a',dm?'#200':tr?'#222':og?'#111':wr?'#2a2a5a':'#221',{moving:e.st===1,flash:f,skin:dm?'#c03a2a':tr?'#6a8a6a':og?'#8a6a4a':wr?'#a8b4ff':'#5f8f3a',leg:dm?'#3a0a0a':wr?'#4a3a8a':'#3a2a1a',wid:wr?null:(dm?'sword4':tr?'sword2':og?'sword0':'sword1'),sp:e.sw>0?1-e.sw/.25:-1,arm:og?1:0});if(dm){g.fillStyle='#ffd34a';g.fillRect(-4,-17,1,2);g.fillRect(3,-17,1,2);g.fillStyle='#400';g.fillRect(-5,-19,2,3);g.fillRect(3,-19,2,3)}g.restore()}
 else{const wx=Math.round(e.x*T-16),wy=Math.round(e.y*T-30),fb=Math.sin(t*.5)*2;g.fillStyle='#0005';g.fillRect(wx+2,wy+44,28,4);
  g.fillStyle=f?'#fff':'#a61e1e';g.beginPath();g.moveTo(wx-6,wy+10+fb);g.lineTo(wx+8,wy+22);g.lineTo(wx+8,wy+30);g.fill();g.beginPath();g.moveTo(wx+38,wy+10+fb);g.lineTo(wx+24,wy+22);g.lineTo(wx+24,wy+30);g.fill();
  g.fillRect(wx+6,wy+20,20,22);g.fillRect(wx+8,wy+8,16,14);g.fillStyle='#e0572a';g.fillRect(wx+10,wy+28,12,12);g.fillStyle='#ffd36b';g.fillRect(wx+11,wy+12,3,3);g.fillRect(wx+18,wy+12,3,3);g.fillStyle='#600';g.fillRect(wx+8,wy+4,3,5);g.fillRect(wx+21,wy+4,3,5);g.fillStyle='#fa3';g.fillRect(wx+12,wy+18+fb,8,3)}}
const ring=(a,px,py)=>{const f=flagOf(a);if(f){g.fillStyle=FCOL[f]+'99';g.fillRect(px+1,py+13,14,3)}};
function drawAura(cx,cy,r){if(Math.hypot(cam.x-cx,cam.y-cy)>r+24)return;const px=cx*T,py=cy*T,Rr=r*T,t=clock;g.save();g.beginPath();g.arc(px,py,Rr,0,6.283);
 const gr=g.createRadialGradient(px,py,Rr*.86,px,py,Rr);gr.addColorStop(0,'rgba(120,200,255,0)');gr.addColorStop(1,'rgba(150,225,255,'+(.2+.06*Math.sin(t*2))+')');g.fillStyle=gr;g.fill();
 g.strokeStyle='rgba(180,235,255,'+(.45+.2*Math.sin(t*2))+')';g.lineWidth=1.5;g.setLineDash([7,5]);g.lineDashOffset=-t*12;g.stroke();g.setLineDash([]);
 for(let i=0;i<24;i++){const a=i/24*6.283+t*.12,rx=px+Math.cos(a)*Rr,ry=py+Math.sin(a)*Rr;g.globalAlpha=.4+.6*Math.abs(Math.sin(t*2.5+i));g.fillStyle=i%3?'#bfeaff':'#fff';g.fillRect(Math.round(rx)-1,Math.round(ry)-1,2,2);if(i%6===0){g.fillStyle='#9fdcff';g.fillRect(Math.round(rx)-2,Math.round(ry)-5,1,3)}}g.globalAlpha=1;g.restore()}
function drawFire(o){const px=o.x*T,py=o.y*T,t=clock*10+o.x;g.fillStyle='#0004';g.fillRect(px+2,py+12,12,3);g.fillStyle='#6b4423';g.fillRect(px+3,py+11,10,2);g.fillRect(px+5,py+9,6,2);
 g.fillStyle='#e8431e';g.fillRect(px+5,py+5-Math.sin(t)*1,6,6);g.fillStyle='#ffa530';g.fillRect(px+6,py+3-Math.sin(t*1.3)*1.5,4,6);g.fillStyle='#ffe38a';g.fillRect(px+7,py+6,2,3)}
const mmCol={0:'#12303d',1:'#23505a',2:'#9a8a5e',3:'#2e5a2b',4:'#1c3b21',5:'#6a5636',6:'#65655f',7:'#52565f',8:'#30263a',9:'#0c0a10'};
function buildMini(){mmImg=mk(MW,MH,c=>{for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){c.fillStyle=mmCol[map[idx(x,y)]];c.fillRect(x,y,1,1)}});
 mm=document.createElement('canvas');mm.width=mm.height=84;mm.style.cssText='position:fixed;inset:auto;right:8px;top:calc(60px + env(safe-area-inset-top));width:84px;height:84px;border:2px solid var(--bd);border-radius:10px;opacity:.9;pointer-events:none;image-rendering:pixelated';document.body.appendChild(mm)}
function drawMini(){const m=mm.getContext('2d');m.imageSmoothingEnabled=false;const r=30,sx=P.x-r,sy=P.y-r;m.fillStyle='#000';m.fillRect(0,0,84,84);m.drawImage(mmImg,sx,sy,r*2,r*2,0,0,84,84);
 const k=84/(r*2),dot=(x,y,c,s=3)=>{m.fillStyle=c;m.fillRect((x-sx)*k-s/2,(y-sy)*k-s/2,s,s)};for(const b of bots)if(!b.dead)dot(b.x,b.y,flagOf(b)==='red'?'#f44':'#7df');for(const g2 of guards)if(!g2.dead)dot(g2.x,g2.y,'#fc4',2);for(const n of npcs)dot(n.x+.5,n.y+.5,'#fd6');for(const p of PTS)dot(p.x+.5,p.y+.5,PT.open?'#c6f':'#666',4);
 if(boss&&!boss.dead){const bx=clamp(boss.x,sx+1,sx+r*2-1),by=clamp(boss.y,sy+1,sy+r*2-1);if(((clock*2)|0)%2)dot(bx,by,'#f33',6)}dot(P.x,P.y,'#fff',4)}
const dang=d=>d<40?'🟢 Safe lands':d<70?'🟡 Danger ★':d<100?'🟠 Danger ★★':d<125?'🔴 Danger ★★★':'💀 Danger ★★★★';
function zoneName(){if(P.x<DUN.x0+DUN.w+6&&P.y<DUN.y0+DUN.h+6&&P.x>DUN.x0-5&&P.y>DUN.y0-5)return'☠️ Dark Wizard\'s Dungeon';const d=Math.hypot(P.x-CX,P.y-CY);if(d<TOWN_R)return'🏰 Hearthmoor Town 🛡️';const vl=VIL.find(v=>Math.hypot(P.x-v.x,P.y-v.y)<VIL_R);if(vl)return'🏘️ '+vl.name+' 🛡️';const tr=VIL.map(v=>[Math.hypot(P.x-v.x,P.y-v.y),v]).filter(a=>a[0]<30).sort((a,b)=>a[0]-b[0])[0];if(tr&&map[idx(Math.floor(P.x),Math.floor(P.y))]>1)return dang(d)+' '+tr[1].name+' wilds';const t=map[idx(Math.floor(P.x),Math.floor(P.y))];return{2:'🏖️ Shore',3:'🌾 Meadowlands',4:'🌲 Whisperwood',5:'🛤️ Old Road',7:'⛰️ Ironcrest Peaks',8:'🪦 Gravemoor'}[t]?dang(d)+' · '+{2:'Shore',3:'Meadowlands',4:'Whisperwood',5:'Old Road',7:'Ironcrest Peaks',8:'Gravemoor'}[t]:'🌾 Meadowlands'}
function render(){if(P.inside){drawInside();return}if(insideOn)hideInside();if(shopSt){drawShop();return}if(shopOn)hideShop();

 const cw=cv.width,ch=cv.height;OX=Math.round(cw/2-cam.x*T*S);OY=Math.round(ch/2-cam.y*T*S);if(shakeT>0){const k=Math.min(1,shakeT)*shakeA*DPR*S;OX+=Math.round(rnd(-k,k));OY+=Math.round(rnd(-k,k))}
 g.setTransform(1,0,0,1,0,0);g.fillStyle='#0b1a3a';g.fillRect(0,0,cw,ch);g.imageSmoothingEnabled=false;g.setTransform(S,0,0,S,OX,OY);
 const x0=Math.max(0,Math.floor(cam.x-cw/2/(T*S))-1),x1=Math.min(MW-1,Math.ceil(cam.x+cw/2/(T*S))+1),y0=Math.max(0,Math.floor(cam.y-ch/2/(T*S))-2),y1=Math.min(MH-1,Math.ceil(cam.y+ch/2/(T*S))+3),fr=Math.floor(clock*2.2)&3;
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const t=map[idx(x,y)],v=t<=1?(fr+x+y)&3:((x*7+y*13)&3);g.drawImage(tileImg[t][v],x*T,y*T);
  if(t<=1){g.fillStyle='#cfe0e83a';if(inb(x,y-1)&&map[idx(x,y-1)]>1)g.fillRect(x*T,y*T,T,2);if(inb(x,y+1)&&map[idx(x,y+1)]>1)g.fillRect(x*T,y*T+T-1,T,1);if(inb(x-1,y)&&map[idx(x-1,y)]>1)g.fillRect(x*T,y*T,2,T);if(inb(x+1,y)&&map[idx(x+1,y)]>1)g.fillRect(x*T+T-2,y*T,2,T)}
  else if(t===TL.GRASS&&hash(x,y,3)>.95){g.fillStyle=['#b8a040','#a04060','#b8b8a8'][(x+y)%3];g.fillRect(x*T+4+(x%5),y*T+5+(y%6),2,2)}
  else if(t===TL.DARK&&hash(x,y,5)>.93){const px=x*T,py=y*T;g.fillStyle='#0004';g.fillRect(px+3,py+12,10,2);g.fillStyle='#6b6b73';g.fillRect(px+5,py+5,6,8);g.fillRect(px+6,py+4,4,1);g.fillStyle='#4a4a52';g.fillRect(px+9,py+5,2,8);g.fillStyle='#8a8a92';g.fillRect(px+7,py+6,2,1);g.fillRect(px+7,py+8,2,1)}}
 if(marker&&clock-marker.t<.5){g.strokeStyle='#fff';g.lineWidth=1;g.strokeRect(marker.x*T+2,marker.y*T+2,12,12)}
 drawAura(CX,CY,TOWN_R);for(const v of VIL)drawAura(v.x,v.y,VIL_R);for(const w of WITCH)drawAura(w.x,w.y,w.r);
 drawDecals();drawShadows(x0,x1,y0,y1);
 const R=[],vis=(x,y)=>x>=x0-2&&x<=x1+2&&y>=y0-3&&y<=y1+3;
 for(const o of objs)if(vis(o.x,o.y))R.push([o.y*T+16,()=>{const px=o.x*T,py=o.y*T;
  if(o.t==='tree')o.dead?g.drawImage(SPR.stump,px,py):g.drawImage(SPR.tree,px-8,py-24);else if(o.t==='rock')g.drawImage(o.dead?SPR.rockdead:SPR[o.ore],px,py);
  else if(o.t==='gate'){g.fillStyle='#0004';g.fillRect(px-2,py+13,20,3);const gl=.5+.3*Math.sin(clock*3);g.fillStyle='rgba(150,60,255,'+gl*.35+')';g.beginPath();g.arc(px+8,py-2,16,0,6.3);g.fill();g.fillStyle='#4a4650';g.fillRect(px,py-14,4,30);g.fillRect(px+12,py-14,4,30);g.fillRect(px-1,py-18,18,6);g.fillStyle='#2f2c36';g.fillRect(px+1,py-14,1,28);g.fillRect(px+13,py-14,1,28);g.fillStyle='#12081e';g.fillRect(px+4,py-12,8,28);g.fillStyle='hsl(280,85%,'+(45+20*Math.sin(clock*4))+'%)';g.fillRect(px+5,py-10+((clock*14)|0)%20,6,2);g.fillRect(px+6,py-6+((clock*9)|0)%18,4,2);g.fillStyle='#e8e0d0';g.fillRect(px+6,py-17,4,3);g.fillRect(px+7,py-14,2,1)}
  else if(o.t==='shroom'){g.fillStyle='rgba(120,255,240,'+(.22+.14*Math.sin(clock*3+o.x))+')';g.beginPath();g.arc(px+8,py+9,9+Math.sin(clock*2+o.y),0,6.3);g.fill();g.drawImage(SPR.shroom,px,py);if(Math.random()<.04)parts.push({x:o.x+.5+rnd(-.3,.3),y:o.y+.4,vx:0,vy:-1,life:.8,c:'#9ffff0',sz:2})}else if(o.t==='bush')g.drawImage(o.dead?SPR.bushdead:SPR.bush,px,py);else if(o.t==='anvil')g.drawImage(SPR.anvil,px,py);else if(o.t==='fire')drawFire(o)}]);
 for(const b of buildings)R.push([(b.y+b.h)*T,()=>g.drawImage(b.img,b.x*T,b.y*T-16)]);
 for(const n of npcs)if(!n.dead)R.push([n.y*T+16,()=>drawChar(n.x*T,n.y*T,0,0,n.col,'#552',{sp:n.sw>0?1-n.sw/.25:-1,wid:n.sw>0?'sword0':null,flash:n.flash>0})]);
 for(const gd of guards)if(!gd.dead&&vis(gd.x,gd.y))R.push([gd.y*T,()=>drawChar(Math.round(gd.x*T-8),Math.round(gd.y*T-14),gd.dir,clock*10,gd.gob?'#4a3a1a':'#7a2a22',gd.gob?'#2a3a1a':'#222',{moving:gd.mv,wid:gd.gob?'axe1':'sword2',skin:gd.gob?'#7fbf4a':undefined,arm:2,sp:gd.sw>0?1-gd.sw/.25:-1,flash:gd.flash>0})]);
 for(const e of E)if(!e.dead&&vis(e.x,e.y))R.push([e.y*T,()=>drawEnemy(e)]);
 for(const m of ills)R.push([m.y*T,()=>{g.globalAlpha=.5+.25*Math.sin(clock*7+m.ph);drawEnemy({t:m.t,x:m.x,y:m.y,ph:m.ph,dir:m.dir,flash:0,st:0,sw:0,mv:true});g.globalAlpha=1}]);
 netDraw(R,vis);for(const p of PTS)if(vis(p.x,p.y))R.push([p.y*T+14,()=>drawPortal(p)]);
 for(const b of bots)if(!b.dead&&vis(b.x,b.y))R.push([b.y*T,()=>{ring(b,Math.round(b.x*T-8),Math.round(b.y*T-14));drawChar(Math.round(b.x*T-8),Math.round(b.y*T-14),b.dir,clock*8+b.ph,b.col,'#432',{moving:b.tx!=null||!!b.target,wid:'sword0',tw:tintFor(lvOf(b.xp.melee)),sp:b.sw>0?1-b.sw/.25:-1,flash:b.flash>0})}]);
 R.push([P.y*T,()=>{if(P.shroomT>0){g.fillStyle=hsl2hex((clock*200)%360,.9,.6)+'66';g.beginPath();g.arc(P.x*T,P.y*T-4,11+Math.sin(clock*6)*2,0,6.3);g.fill()}if(P.dead){g.fillStyle='#0004';g.fillRect(Math.round(P.x*T-6),Math.round(P.y*T),12,3);g.fillStyle='#8cf';g.fillRect(Math.round(P.x*T-5),Math.round(P.y*T-3),10,4);return}
  const et=eqTint();ring(P,Math.round(P.x*T-8),Math.round(P.y*T-14));drawChar(Math.round(P.x*T-8),Math.round(P.y*T-14),P.dir,P.walk||0,P.hurt>4.7?'#fff':(et.ta?shade(et.ta,.7):ARMC[armLv(eqId('a'))]),'#3a2a1a',{moving:(input.x||input.y||(P.path&&P.path.length)),wid:eqId('w'),tw:et.tw,ta:et.ta,arm:armLv(eqId('a')),helm:eqTier('h'),boots:eqTier('b'),chick:chickenForm(),sp:P.swing>0?1-P.swing/.25:-1})}]);
 R.sort((a,b)=>a[0]-b[0]);for(const r of R)r[1]();
 for(const f of fxs){const a=f.life/f.max;if(f.k==='ring'){const r=f.r*T*(1-a*.6);g.globalAlpha=a*.8;g.strokeStyle=f.c;g.lineWidth=2;g.beginPath();g.arc(f.x*T,f.y*T,r,0,6.283);g.stroke();g.globalAlpha=a*.18;g.fillStyle=f.c;g.fill();g.globalAlpha=1}
  else if(f.k==='line'){g.globalAlpha=a;g.strokeStyle=f.c;g.lineWidth=2;g.beginPath();let x=f.x*T,y=f.y*T;g.moveTo(x,y);const n=5,dx=(f.x2-f.x)*T/n,dy=(f.y2-f.y)*T/n;for(let i=1;i<n;i++)g.lineTo(f.x*T+dx*i+rnd(-3,3),f.y*T+dy*i+rnd(-3,3));g.lineTo(f.x2*T,f.y2*T);g.stroke();g.globalAlpha=1}}
 for(const p of proj){if(p.own!=='p'){g.fillStyle='#fa3';g.fillRect(p.x*T-2,p.y*T-2,4,4);g.fillStyle='#fff';g.fillRect(p.x*T-1,p.y*T-1,2,2);continue}
  const sp=SPELLS[p.sp],c=spCol(sp),s=p.sz||3;g.globalAlpha=.3;g.fillStyle=c;g.fillRect(p.x*T-s-2,p.y*T-s-2,s*2+4,s*2+4);g.globalAlpha=1;g.fillStyle=c;g.fillRect(p.x*T-s/2,p.y*T-s/2,s,s);g.fillStyle='#fff';g.fillRect(p.x*T-1,p.y*T-1,2,2)
  if(sp.dot&&sp.dot[0]==='burn'&&Math.random()<.5)parts.push({x:p.x,y:p.y,vx:rnd(-.5,.5),vy:-.8,life:.3,c:'#ff8a2a',sz:2});if(p.sp>=9)for(let i=0;i<3;i++){g.fillStyle=spCol(sp);g.fillRect(p.x*T-p.vx*.012*(i+1)*T*.5-1,p.y*T-p.vy*.012*(i+1)*T*.5-1,2,2)}}
 drawGibs();for(const p of parts){g.globalAlpha=clamp(p.life*3,0,1);g.fillStyle=p.c;g.fillRect(p.x*T,p.y*T,p.sz,p.sz)}g.globalAlpha=1;
 const ph=((clock+90)/420)%1,k=Math.cos(ph*6.2832),dark=clamp(-k*1.3,0,1)*.62;
 g.setTransform(1,0,0,1,0,0);
 if(dark>.02){ng.globalCompositeOperation='source-over';ng.clearRect(0,0,cw,ch);ng.fillStyle=`rgba(6,10,45,${dark})`;ng.fillRect(0,0,cw,ch);ng.globalCompositeOperation='destination-out';
  const hole=(x,y,r)=>{const [sx,sy]=w2s(x,y),rr=r*T*S,gr=ng.createRadialGradient(sx,sy,0,sx,sy,rr);gr.addColorStop(0,'rgba(0,0,0,.95)');gr.addColorStop(1,'rgba(0,0,0,0)');ng.fillStyle=gr;ng.fillRect(sx-rr,sy-rr,rr*2,rr*2)};
  hole(P.x,P.y-.3,5);for(const o of objs)if(o.t==='fire'&&vis(o.x,o.y))hole(o.x+.5,o.y+.5,4);
  for(const b of buildings)hole(b.x+b.w/2,b.y+b.h,3.5);g.drawImage(nc,0,0);
  for(let i=0;i<16;i++){const a=clock*.4+i*2.3,x=cam.x+Math.sin(a*1.3+i)*7,y=cam.y+Math.cos(a+i*3)*4.5,[sx,sy]=w2s(x,y);g.fillStyle=`rgba(255,240,120,${.4+.4*Math.sin(clock*5+i)})`;g.fillRect(sx,sy,2*DPR,2*DPR)}}
 g.fillStyle='rgba(8,16,10,.16)';g.fillRect(0,0,cw,ch);
 for(let i=0;i<6;i++){const fx=((clock*.012+i*.19)%1.3-.15)*cw,fy=ch*(.1+.15*i),fr=cw*.35,fg=g.createRadialGradient(fx,fy,0,fx,fy,fr);fg.addColorStop(0,'rgba(150,175,160,.07)');fg.addColorStop(1,'rgba(150,175,160,0)');g.fillStyle=fg;g.fillRect(fx-fr,fy-fr,fr*2,fr*2)}
 const vg=g.createRadialGradient(cw/2,ch/2,Math.min(cw,ch)*.22,cw/2,ch/2,Math.max(cw,ch)*.72);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.6)');g.fillStyle=vg;g.fillRect(0,0,cw,ch);
 const FS=Math.round(10*DPR);g.font=`bold ${FS}px system-ui,sans-serif`;g.textAlign='center';g.lineWidth=3*DPR;g.strokeStyle='#000';
 const label=(t,x,y,c)=>{const [sx,sy]=w2s(x,y);g.strokeText(t,sx,sy);g.fillStyle=c;g.fillText(t,sx,sy)};
 for(const n of npcs)if(!n.dead&&vis(n.x,n.y))label(n.n+(n.role==='elder'&&Object.values(P.q).some(q=>q.ok)?' ❗':''),n.x+.5,n.y-.15,FCOL[flagOf(n)]||'#ffd36b');
 for(const gd of guards)if(!gd.dead&&vis(gd.x,gd.y))label(gd.name||'Guard',gd.x,gd.y-1,gd.gob?'#9be36b':'#e8c060');
 const sub=(t,x,y)=>{const [sx,sy]=w2s(x,y);g.font=`italic ${Math.round(8.5*DPR)}px Georgia,serif`;g.lineWidth=2.5*DPR;g.strokeText(t,sx,sy);g.fillStyle='#d8c27a';g.fillText(t,sx,sy);g.font=`bold ${FS}px system-ui,sans-serif`;g.lineWidth=3*DPR};
 netLabels(vis,label);
 for(const b of bots)if(!b.dead&&vis(b.x,b.y)){label(b.name,b.x,b.y-1,FCOL[flagOf(b)]||'#9fe3ff');const tt=titleOf(b.xp);if(tt)sub('the '+tt,b.x,b.y-1.32)}
 label(P.name,P.x,P.y-1.05,FCOL[flagOf(P)]||'#fff');{const tt=titleOf(P.xp);if(tt)sub('the '+tt,P.x,P.y-1.37)}
 for(const e of E)if(!e.dead&&e.el&&vis(e.x,e.y))label(ELL(e),e.x,e.y-1.2*e.sc,e.el==='shaman'?'#8cf':e.el==='lord'?'#f6f':e.el==='elite'?'#f96':'#fb4');
 for(const e of E)if(!e.dead&&vis(e.x,e.y)&&(e.hp<e.mhp||e.st===1)){const [sx,sy]=w2s(e.x,e.y-(e.t==='wyrm'?2.2:.95)),w=(e.t==='wyrm'||e.t==='wizard'?40:14)*S;g.fillStyle='#000a';g.fillRect(sx-w/2-1,sy-3*DPR,w+2,5*DPR);g.fillStyle=e.t==='wyrm'?'#f63':'#e33';g.fillRect(sx-w/2,sy-2*DPR,w*e.hp/e.mhp,3*DPR)}
 for(const a of actorsList())if(!a.dead&&a.hp<a.mhp&&vis(AX(a),AY(a))){const [sx,sy]=w2s(AX(a),AY(a)-.95),w=14*S;g.fillStyle='#000a';g.fillRect(sx-w/2-1,sy-3*DPR,w+2,5*DPR);g.fillStyle='#e8a030';g.fillRect(sx-w/2,sy-2*DPR,w*a.hp/a.mhp,3*DPR)}
 if(act){const [sx,sy]=w2s(P.x,P.y-1.4),w=22*S/2;g.fillStyle='#000a';g.fillRect(sx-w/2-1,sy-1,w+2,6*DPR);g.fillStyle='#ffd36b';g.fillRect(sx-w/2,sy,w*act.t/act.dur,4*DPR)}
 g.font=`bold ${Math.round(12*DPR)}px system-ui,sans-serif`;for(const f of floats){g.globalAlpha=clamp(f.life*2,0,1);label(String(f.s),f.x,f.y-.5,f.c)}g.globalAlpha=1;
 if(P.dead){g.fillStyle='#300a';g.fillRect(0,0,cw,ch);g.fillStyle='#fff';g.font=`bold ${28*DPR}px system-ui`;g.fillText('💀 Knocked out…',cw/2,ch/2)}
 else if(P.hurt>4.4){g.fillStyle='#f003';g.fillRect(0,0,cw,ch)}
}
