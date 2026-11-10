/* ---------- interiors (shops + cottages) ---------- */
let insideOn=false,infT=0,shopSt=null,shopOn=false;
const KINDR={shop:'shop',smith:'smith',inn:'inn',elder:'elder',bank:'bank',trade:'trade'},NPCX={shop:80,smith:74,inn:132,elder:86,bank:80,trade:80};
function playerSpr(px,py,dir,ph,moving){const et=eqTint();drawChar(px,py,dir,ph,et.ta?shade(et.ta,.7):ARMC[armLv(eqId('a'))],'#3a2a1a',{moving,wid:eqId('w'),tw:et.tw,ta:et.ta,arm:armLv(eqId('a')),helm:eqTier('h'),boots:eqTier('b'),sp:-1})}
function enterShop(b){if(chickenForm()&&b.npc.role!=='inn')return toast('🐔 The shopkeeper shoos the chicken out. "Bawk off!"','#fc6');if(flagOf(P)==='red')return toast('🚫 "We don\'t serve murderers!"','#f66');shopSt={b,x:80,y:90,dir:3,ph:0,tx:null,talk:false,mv:false};P.path=null;P.chase=null;stopAct();goal=null;toast('🚪 '+b.n)}
function leaveShop(){shopSt=null;closePanel()}
function nearNpc(){const s=shopSt,nx=NPCX[s.b.npc.role];return Math.hypot(s.x-nx,s.y-60)<34}
function shopTalk(){const s=shopSt;if(!nearNpc()){s.talk=true;s.tx=NPCX[s.b.npc.role];s.ty=78;return toast('Walking over…')}openNpc(s.b.npc)}
function shopTick(dt){const s=shopSt;const rv=P.shroomT>0?-1:1;let vx=input.x*rv,vy=input.y*rv;const mag=Math.hypot(vx,vy);
 if(mag>.15){s.tx=null;s.talk=false;if(mag>1){vx/=mag;vy/=mag}}else{vx=vy=0;if(s.tx!=null){const dx=s.tx-s.x,dy=s.ty-s.y,d=Math.hypot(dx,dy);if(d<2){s.tx=null;if(s.talk){s.talk=false;if(nearNpc())openNpc(s.b.npc)}}else{vx=dx/d;vy=dy/d}}}
 const sp=48*(input.run?1.6:1);s.x=clamp(s.x+vx*sp*dt,10,150);s.y=clamp(s.y+vy*sp*dt,76,95);s.mv=!!(vx||vy);if(s.mv){s.dir=Math.abs(vx)>Math.abs(vy)?(vx>0?2:1):(vy>0?0:3);s.ph+=dt*(input.run?14:9)}
 if(s.y>=94&&s.x>64&&s.x<96&&vy>0)leaveShop()}
function drawShop(){const el=$('#shopin');if(!shopOn){shopOn=true;el.style.display='flex'}const s=shopSt,x=$('#shc').getContext('2d');roomScene(x,KINDR[s.b.npc.role],clock,{col:s.b.npc.col});
 x.fillStyle='#5a3a1a';x.fillRect(64,93,32,3);x.fillStyle='#d9b24a';x.fillRect(64,93,32,1);const old=g;g=x;playerSpr(Math.round(s.x-8),Math.round(s.y-14),s.dir,s.ph,s.mv);g=old;
 const nr=nearNpc();$('#shTalk').style.opacity=nr?1:.5;$('#shTalk').textContent='💬 '+s.b.npc.n;if(s.tx!=null&&Math.hypot(s.tx-s.x,s.ty-s.y)>2){x.strokeStyle='#fff8';x.strokeRect(s.tx-2,s.ty-2,4,4)}}
function hideShop(){shopOn=false;$('#shopin').style.display='none'}
$('#shc').addEventListener('pointerdown',e=>{if(!shopSt)return;const r=e.target.getBoundingClientRect(),px=(e.clientX-r.left)/r.width*160,py=(e.clientY-r.top)/r.height*96,s=shopSt,nx=NPCX[s.b.npc.role];
 if(Math.abs(px-nx)<22&&py>6&&py<64){shopTalk();return}s.talk=false;s.tx=clamp(px,10,150);s.ty=clamp(py,76,95)});
$('#shTalk').addEventListener('pointerdown',()=>{if(shopSt)shopTalk()});$('#shLeave').addEventListener('pointerdown',()=>{if(shopSt)leaveShop()});
function roomScene(x,kind,t,o={}){const W=160,H=96,old=g;g=x;x.imageSmoothingEnabled=false;
 const r=(c,a,b,w,h)=>{x.fillStyle=c;x.fillRect(a,b,w,h)},kk=Math.cos(((clock+90)/420%1)*6.2832),night=kk<-.1;
 r('#6b4a2a',0,0,W,58);for(let y=0;y<58;y+=6)r('#00000022',0,y,W,1);for(let xx=0;xx<W;xx+=16)r('#00000014',xx,0,1,58);r('#4a2e16',0,0,W,4);r('#3a2412',0,56,W,3);
 r('#8a6238',0,59,W,37);for(let y=59,i=0;y<96;y+=6,i++){r('#00000028',0,y,W,1);for(let xx=0;xx<W;xx+=20)r('#00000018',xx+(i%2)*10,y,1,6)}
 const win=(a,b)=>{r('#2a1608',a-2,b-2,34,32);r(night?'#0a1230':'#8ccaff',a,b,30,28);if(night){for(let i=0;i<7;i++)r('#fff',a+((i*11)%28),b+((i*7)%24),1,1);r('#f4f0c0',a+20,b+5,4,4);r('#0a1230',a+22,b+5,3,3)}else{r('#ffffffaa',a+4,b+4,10,3);r('#ffffffaa',a+16,b+12,8,2);r('#ffe080',a+22,b+3,5,5)}r('#2a1608',a+14,b,2,28);r('#2a1608',a,b+13,30,2)};
 const fire=(a,b,w)=>{r('#5a5a62',a,b,w,38);r('#44444c',a+2,b+2,w-4,2);r('#0a0604',a+5,b+10,w-10,28);for(let i=0;i<4;i++){const hh=10+Math.sin(t*7+i*1.7)*4+i%2*3,fx=a+7+i*((w-16)/3);r(i%2?'#ff9a2a':'#ff5a1a',fx,b+38-hh,5,hh);r('#ffe08a',fx+1,b+38-hh*.5,3,hh*.5)}r('#3a2412',a+4,b+36,w-8,2);r('#3a2412',a-2,b-2,w+4,3)};
 const npc=(px,py,col,wid)=>{x.save();x.translate(px,py);x.scale(2,2);drawChar(0,0,0,t,col,'#552',{wid:wid||null});x.restore()};
 const counter=(y)=>{r('#7a5230',0,y,W,4);r('#5a3a1a',0,y+4,W,22);for(let xx=0;xx<W;xx+=14)r('#00000030',xx,y+4,1,22);r('#00000040',0,y+4,W,2)};
 if(kind==='house'){win(18,14);r('#3a2412',70,12,24,18);r('#8ab04a',72,14,20,14);r('#5a8a3a',72,22,20,6);r('#ffe080',84,16,4,4);fire(112,18,38);
  r('#7a2a2a',64,72,60,18);r('#d9b24a',64,72,60,2);r('#d9b24a',64,88,60,2);r('#9a3a3a',70,76,48,10);
  r('#4a2e16',10,64,62,28);r('#e8dcc8',12,66,58,22);r('#ffffff',14,68,14,10);r(o.bc||'#a33',30,68,38,20);r('#ffffff30',30,68,38,3);r('#00000030',30,84,38,4);
  if(o.player){r('#f2c9a0',18,70,8,7);r('#3a2a1a',17,69,10,3);r('#3a2a1a',17,72,2,4);r('#223',22,73,2,1);x.fillStyle='#ffffffcc';x.font='bold 8px monospace';for(let i=0;i<3;i++){x.globalAlpha=1-((t*.8+i*.33)%1);x.fillText(i?'z':'Z',32+i*7,58-((t*8+i*7)%16)-i*3)}x.globalAlpha=1}
  r('#5a3a1a',128,66,22,5);r('#3a2412',130,71,3,18);r('#3a2412',145,71,3,18);r('#e8e0c0',137,60,3,6);r('#ffcc55',137,57+Math.sin(t*9),3,3);
  r('#6a4a2a',2,76,8,14);r('#2f7a3a',0,66,12,12);r('#3f9a4a',3,62,6,8)}
 else if(kind==='shop'){for(const sy of [14,34]){r('#4a2e16',6,sy+12,148,3);for(let i=0;i<14;i++){const c=['#c33','#3a8','#e90','#39c','#a5a','#ddd'][(i+sy)%6];r(c,10+i*10,sy+3,6,9);r('#ffffff55',11+i*10,sy+4,1,5);r('#5a3a1a',12+i*10,sy+1,2,3)}}
  npc(64,14,o.col||'#34527f');counter(46);for(let i=0;i<5;i++)r('#ffd36b',16+i*5,44,3,2);r('#c8ccd4',120,38,14,8);r('#8a8e98',126,32,2,6);r('#8a8e98',120,38,14,1)}
 else if(kind==='smith'){fire(100,16,50);r('#3a3a42',100,54,50,5);const ws=['sword2','axe1','mace1'];ws.forEach((w,i)=>{r('#4a2e16',8,16+i*14,34,2);x.drawImage(wsprite(w,null),10,8+i*14)});
  npc(58,26,o.col||'#8a3a22','sword0');r('#444a55',54,64,30,6);r('#7d8696',50,61,38,4);r('#444a55',60,70,18,3);r('#ff9a2a',66,59,4,2);
  x.fillStyle='rgba(255,140,40,'+(.08+.04*Math.sin(t*9))+')';x.fillRect(0,0,W,H)}
 else if(kind==='bank'){win(16,12);r('#2a2a30',4,10,40,56);r('#4a4a55',6,12,36,52);r('#b8860b',22,36,6,8);for(let i=0;i<3;i++)r('#d9b24a',96+i*14,56-i*4,10,4+i*4);r('#8a6a1a',100,40,26,12);r('#d9b24a',100,40,26,2);npc(64,14,o.col||'#6b5a2a');counter(46);for(let i=0;i<6;i++)r('#ffd36b',16+i*6,44,4,2)}
 else if(kind==='trade'){win(16,12);for(let i=0;i<3;i++){r('#7a5a2a',10+i*50,36,40,14);r('#5a3a1a',12+i*50,50,3,16);r('#5a3a1a',45+i*50,50,3,16);r(['#c33','#3a8','#e90'][i],8+i*50,30,44,6)}npc(64,12,o.col||'#2a5a5a');r('#e8dcc8',58,64,44,12);r('#3a2a1a',58,64,44,2)}
 else if(kind==='inn'){win(16,12);fire(112,18,38);for(let i=0;i<2;i++){const bx=64+i*30;r('#6a4222',bx,34,22,24);r('#4a2c14',bx,40,22,2);r('#4a2c14',bx,50,22,2);r('#8a6238',bx+2,34,18,2)}
  npc(116,14,o.col||'#8a6a2a');counter(46);for(let i=0;i<4;i++){r('#d9a850',14+i*12,38,6,8);r('#fff',14+i*12,38,6,2)}r('#6a4222',2,30,12,24)}
 else{r('#3a2412',6,6,60,52);for(let sy=0;sy<4;sy++){r('#2a1608',8,10+sy*12+9,56,2);for(let i=0;i<10;i++){const c=['#a33','#36a','#3a6','#a83','#83a','#555'][(i*3+sy)%6];r(c,9+i*5.5,10+sy*12+(i%3),4,9-i%3)}}
  r('#7a2a2a',46,70,66,18);r('#d9b24a',46,70,66,2);r('#d9b24a',46,86,66,2);npc(70,26,o.col||'#4e3d6e','staff');
  r('#5a3a1a',128,50,4,12);r('#2a5a8a',122,34,16,16);r('#4a8a4a',126,38,6,5);r('#d9b24a',122,48,16,2);fire(116,6,0)}
 if(kind!=='house'&&kind!=='elder'||kind==='elder'){}
 const gl=x.createRadialGradient(130,40,4,130,40,70);gl.addColorStop(0,'rgba(255,150,50,.10)');gl.addColorStop(1,'rgba(0,0,0,.22)');x.fillStyle=gl;x.fillRect(0,0,W,H);
 g=old}
function drawBanner(k){const bn=$('#banner');if(!bn)return;const x=bn.getContext('2d'),KIND={shop:'shop',forge:'smith',inn:'inn',elder:'elder',house:'house',bank:'bank',trade:'trade'}[k];x.clearRect(0,0,160,70);x.save();x.translate(0,-16);roomScene(x,KIND,clock,{col:npcCur&&npcCur.col,bc:npcCur&&npcCur.c});x.restore()}
function drawInside(){const el=$('#inside');if(!insideOn){insideOn=true;el.style.display='flex'}
 const h=houses[P.inside]||houses[0],x=$('#room').getContext('2d');roomScene(x,'house',clock,{player:true,bc:h.c});
 infT-=1/60;if(infT<=0){infT=.4;const m=Math.floor(rentLeft()/60000),s=Math.floor(rentLeft()/1000)%60;$('#inf').innerHTML=`<b>🏠 ${h.town} · Cottage #${h.id+1}</b><br>💤 Resting… ❤ ${Math.ceil(P.hp)}/${maxHp()} · ⚡ ${Math.ceil(P.st)}/${maxSt()} · 🔮 ${Math.floor(P.mp)}/${maxMp()}<br>⏱ Rent left: ${m}:${String(s).padStart(2,'0')}<br><span style="opacity:.7;font-size:12px">Safe from monsters and players. Rest 3+ min for a +20% xp boost.</span>`}}
function hideInside(){insideOn=false;$('#inside').style.display='none'}
$('#bLeave').addEventListener('pointerdown',()=>{if(P&&P.inside)leaveHouse()});

/* ---------- opening story ---------- */
let storyOn=false,stI=0,stT=0,stChars=0,paused=false;
const STORY=[
 'In the valley of Hearthmoor, life was quiet. Farmers sang at dawn, smiths hammered in the sun, and nobody had ever needed to lock a door.',
 'Then came Malgrim the Ashen — a wizard cast out for forbidden magic. From his black tower he raised his staff against the sky…',
 '…and the sky tore open. Portals bled into the world, and from them poured every nightmare the old stories had warned about.',
 'The elders wove a ward of living light over each town. Inside the shimmering aura people are safe — but beyond it, the wilds now belong to the monsters.',
 'You arrive with a rusty sword and nothing else. Grow stronger by doing: fight, mine, forge, cast. Push back the portals, and end the Ashen Wizard.'];
function stSky(x,cols){const h=Math.ceil(108/cols.length);cols.forEach((c,i)=>{x.fillStyle=c;x.fillRect(0,i*h,192,h+1)})}
function stHouse(x,hx,hy,wall,roof,lit){x.fillStyle=wall;x.fillRect(hx,hy,22,16);for(let r=0;r<8;r++){x.fillStyle=roof;x.fillRect(hx-3+r,hy-8+r,28-r*2,1+(r%2?0:1))}x.fillStyle=roof;x.fillRect(hx-3,hy-1,28,2);x.fillStyle='#2a1608';x.fillRect(hx+9,hy+6,5,10);x.fillStyle=lit?'#ffcf5a':'#e0b860';x.fillRect(hx+2,hy+4,5,5);x.fillRect(hx+16,hy+4,4,5);x.fillStyle='#00000040';x.fillRect(hx,hy+14,22,2)}
function stTree(x,tx,ty,c){x.fillStyle='#3a2412';x.fillRect(tx,ty,2,6);x.fillStyle=c;x.fillRect(tx-4,ty-8,10,9);x.fillRect(tx-2,ty-12,6,5)}
function stGround(x,y,c1,c2){x.fillStyle=c1;for(let xx=0;xx<192;xx++){const h=y+Math.sin(xx*.06)*3+Math.sin(xx*.17)*1.5;x.fillRect(xx,h,1,108-h)}x.fillStyle=c2;x.fillRect(0,y+14,192,94)}
function stChar(x,cx,cy,col,hair,o){const old=g;g=x;drawChar(Math.round(cx),Math.round(cy),o.dir||0,o.t||0,col,hair,o);g=old}
function stMob(x,type,cx,cy,t,flash){const old=g;g=x;drawEnemy({t:type,x:(cx+8)/T,y:(cy+13)/T,ph:t*2,dir:o2(cx),flash:flash?.1:0,st:1,sw:0});g=old}
const o2=cx=>cx>96?1:2;
function stPortal(x,cx,cy,t,s=1){for(let i=0;i<6;i++){const a=t*(1.5+i*.3)*(i%2?-1:1);x.strokeStyle=['#e8c8ff','#b46aff','#8a3ad0','#6a2aa0','#b46aff','#e8c8ff'][i];x.lineWidth=1;x.beginPath();x.ellipse(cx,cy,(15-i*2)*s,(6-i*.8)*s,0,a,a+4.2);x.stroke()}x.fillStyle='#14041f';x.beginPath();x.ellipse(cx,cy,5*s,2*s,0,0,6.3);x.fill()}
function drawStory(x,sc,t){const old=g;x.imageSmoothingEnabled=false;x.clearRect(0,0,192,108);
 if(sc===0){stSky(x,['#78a8e0','#8fb8e4','#b8c8e0','#f0c8a0','#f8d890','#fbe8a8']);x.fillStyle='#fff3c0';x.beginPath();x.arc(150,56,12,0,6.3);x.fill();x.fillStyle='rgba(255,243,192,.25)';x.beginPath();x.arc(150,56,19,0,6.3);x.fill();
  stGround(x,66,'#4a7a5a','#3a6a30');for(const [hx,hy,w,r] of [[18,66,'#c8b080','#9a4a3a'],[58,70,'#d0b890','#4a6a8a'],[108,67,'#c8a878','#8a5a3a'],[150,71,'#d8c090','#6a4a7a']]){stHouse(x,hx,hy,w,r,true);for(let k=0;k<4;k++){x.fillStyle='rgba(230,230,230,'+(.5-((t*.4+k*.25)%1)*.5)+')';x.fillRect(hx+17+Math.sin(t+k)*2,hy-12-((t*8+k*6)%20),3,3)}}
  for(const tx of [8,44,92,136,178])stTree(x,tx,84,'#2f6a34');for(let i=0;i<3;i++){const bx=(t*14+i*70)%210-10,by=24+i*8+Math.sin(t*3+i)*2;x.fillStyle='#222';x.fillRect(bx,by,3,1);x.fillRect(bx+3,by-1,3,1)}
  g=x;for(let i=0;i<4;i++)stChar(x,((t*7+i*52)%220)-14,88+(i%2)*4,['#c33','#3a8','#a5a','#e90'][i],'#432',{moving:true,dir:2,t:t*8+i});g=old}
 else if(sc===1){stSky(x,['#08040f','#12081f','#1e0c30','#2a1040','#3a1444','#4a1a40']);for(let i=0;i<40;i++){x.fillStyle='#fff';x.globalAlpha=.4+.5*Math.sin(t*2+i);x.fillRect((i*47)%192,(i*29)%56,1,1)}x.globalAlpha=1;
  x.fillStyle='#c43030';x.beginPath();x.arc(150,24,14,0,6.3);x.fill();x.fillStyle='#8a1a1a';x.beginPath();x.arc(154,20,10,0,6.3);x.fill();
  for(let k=0;k<5;k++){x.fillStyle='rgba(30,10,50,.8)';x.beginPath();x.ellipse(60+k*26+Math.sin(t*.5+k)*6,26+k%2*12,28,8,0,0,6.3);x.fill()}
  const rx=120,ry=40;for(let i=0;i<5;i++){x.strokeStyle=['#fff','#e8c8ff','#b46aff','#8a3ad0','#4a1a80'][i];x.beginPath();x.ellipse(rx,ry,(4+i*4)+Math.sin(t*3)*2,(10+i*3)+Math.cos(t*2),Math.sin(t)*.3,0,6.3);x.stroke()}
  x.fillStyle='#0a0810';x.beginPath();x.moveTo(0,108);x.lineTo(0,62);x.lineTo(30,58);x.lineTo(60,64);x.lineTo(80,108);x.fill();x.fillRect(22,20,16,40);x.fillRect(19,16,22,5);x.fillRect(24,10,12,7);x.fillRect(27,4,6,7);x.fillStyle='#b46aff';x.fillRect(28,26,4,6);x.fillRect(28,40,4,6);
  stGround(x,92,'#120a1a','#0c0610');
  const fl=Math.sin(t*3.2)>.75;if(fl){x.fillStyle='rgba(190,120,255,.28)';x.fillRect(0,0,192,108);x.strokeStyle='#fff';x.lineWidth=1.5;x.beginPath();let lx=rx,ly=0;x.moveTo(lx,ly);for(let i=1;i<=6;i++){lx+= (Math.random()-.5)*14+(48-rx)/12;ly=i*9;x.lineTo(lx,ly)}x.stroke()}
  x.save();x.translate(30,46);x.scale(1.5,1.5);g=x;drawChar(-8,-16,0,0,'#2a1248','#ddd',{skin:'#c9b090',wid:'staff5',arm:0,sp:-1});g=old;x.restore();x.strokeStyle='rgba(180,100,255,.7)';x.beginPath();x.moveTo(36,18);x.lineTo(rx,ry);x.stroke()}
 else if(sc===2){stSky(x,['#0a0618','#180a2a','#2a1038','#44143a','#5a1a30','#6a2020']);stGround(x,70,'#1a1220','#120c18');
  for(const [hx,hy] of [[10,66],[56,70],[116,67],[158,70]]){stHouse(x,hx,hy,'#3a3040','#2a1a30',false);x.fillStyle='rgba(255,120,30,'+(.7+.3*Math.sin(t*9+hx))+')';x.fillRect(hx+3,hy-2,7,5);x.fillRect(hx+12,hy-6-Math.sin(t*11+hx)*2,5,8)}
  for(let i=0;i<30;i++){x.fillStyle='rgba(255,'+(100+i*3)+',40,'+(.6-((t*.7+i*.1)%1)*.6)+')';x.fillRect((i*37)%192,60-((t*14+i*9)%40),2,2)}
  const ps=[[34,92,'slime'],[96,98,'orc'],[160,92,'troll']];ps.forEach(([px,py,mt],i)=>{stPortal(x,px,py,t+i);const ph=((t*.35+i*.33)%1),up=Math.min(1,ph*2.5),wx=px+(ph>.4?(ph-.4)*(i===1?-30:i?30:-30):0);
   x.save();x.beginPath();x.rect(px-40,0,80,py+(ph>.4?60:2));x.clip();stMob(x,mt,wx-8,py-26+(1-up)*24+(ph>.4?(ph-.4)*20:0),t);x.restore()});
  for(let i=0;i<3;i++)stChar(x,((200-(t*12+i*34)%230)),86+(i%2)*6,['#c33','#3a8','#e90'][i],'#432',{moving:true,dir:1,t:t*10+i})}
 else if(sc===3){stSky(x,['#050818','#0a1030','#101a44','#182458','#1c2c60','#20306a']);for(let i=0;i<40;i++){x.fillStyle='#fff';x.globalAlpha=.4+.5*Math.sin(t*2+i);x.fillRect((i*43)%192,(i*31)%50,1,1)}x.globalAlpha=1;stGround(x,76,'#1a3028','#14261e');
  for(const [hx,hy,w,r] of [[44,72,'#c8b080','#9a4a3a'],[82,70,'#d0b890','#4a6a8a'],[120,72,'#c8a878','#8a5a3a']])stHouse(x,hx,hy,w,r,true);
  const gx=96,gy=88,rw=82,rh=70;const gr=x.createRadialGradient(gx,gy,rh*.5,gx,gy,rh);gr.addColorStop(0,'rgba(120,210,255,.05)');gr.addColorStop(1,'rgba(150,225,255,'+(.35+.1*Math.sin(t*2))+')');x.fillStyle=gr;x.beginPath();x.ellipse(gx,gy,rw,rh,0,Math.PI,0);x.fill();x.strokeStyle='rgba(200,240,255,.85)';x.lineWidth=2;x.beginPath();x.ellipse(gx,gy,rw,rh,0,Math.PI,0);x.stroke();
  for(let i=0;i<26;i++){const a=Math.PI+i/26*Math.PI+t*.0,px=gx+Math.cos(a)*rw,py=gy+Math.sin(a)*rh;x.globalAlpha=.3+.7*Math.abs(Math.sin(t*3+i));x.fillStyle='#fff';x.fillRect(px-1,py-1,2,2)}x.globalAlpha=1;
  stChar(x,70,84,'#7a2a22','#222',{wid:'sword2',arm:2,dir:0});stChar(x,112,84,'#7a2a22','#222',{wid:'sword2',arm:2,dir:0});
  const ms=[['slime',8,86],['orc',22,82],['wolf',160,88],['ogre',170,78]];ms.forEach(([mt,mx,my],i)=>{const hit=Math.sin(t*5+i*2)>.8;stMob(x,mt,mx+(hit?(mx<96?3:-3):0),my,t,hit);if(hit){x.fillStyle='#fff';const sx=mx<96?gx-Math.sqrt(1-Math.pow((my-gy)/rh,2))*rw*0+14:166;x.globalAlpha=.9;x.fillRect(mx<96?18+i*3:154,my+4,3,3);x.globalAlpha=1}})}
 else{stSky(x,['#3a4a8a','#6a5a9a','#b87a9a','#e89a7a','#f8c07a','#fbd890']);x.fillStyle='#fff3c0';x.beginPath();x.arc(96,70,14,0,6.3);x.fill();
  for(const px of [20,160]){for(let k=0;k<4;k++){x.fillStyle='rgba(180,100,255,'+(.25-k*.05)+')';x.fillRect(px-2-k,10,4+k*2,70)}x.fillStyle='#b46aff';x.beginPath();x.ellipse(px,78,10,3,0,0,6.3);x.fill()}
  x.fillStyle='#2a3a4a';x.beginPath();x.moveTo(0,80);for(let xx=0;xx<=192;xx+=8)x.lineTo(xx,74-Math.abs(Math.sin(xx*.05))*8);x.lineTo(192,108);x.lineTo(0,108);x.fill();x.fillStyle='#1a2a1c';x.beginPath();x.moveTo(0,108);x.lineTo(0,92);x.quadraticCurveTo(96,70,192,92);x.lineTo(192,108);x.fill();
  stHouse(x,120,72,'#8a7a60','#5a3a30',true);x.fillStyle='rgba(150,225,255,.25)';x.beginPath();x.ellipse(131,82,26,18,0,Math.PI,0);x.fill();
  x.save();x.translate(76,86);x.scale(3,3);g=x;drawChar(-8,-16,3,t*3,'#3a5a9a','#3a2a1a',{wid:'sword0',moving:false,sp:-1});g=old;x.restore()}
 g=old}
function showStory(){storyOn=true;paused=true;stI=0;stT=0;stChars=0;$('#story').style.display='flex';$('#stNext').textContent='Next ▶'}
function endStory(){storyOn=false;paused=false;$('#story').style.display='none'}
function storyLoop(ts){if(!storyOn)return;requestAnimationFrame(storyLoop);const dt=1/60;stT+=dt;stChars=Math.min(STORY[stI].length,stChars+dt*38);
 const x=$('#stc').getContext('2d');drawStory(x,stI,stT);const f=Math.max(0,1-stT*1.6);if(f>0){x.fillStyle='rgba(0,0,0,'+f+')';x.fillRect(0,0,192,108)}
 $('#stt').textContent=STORY[stI].slice(0,Math.floor(stChars))}
function storyNext(){if(stChars<STORY[stI].length-1){stChars=STORY[stI].length;return}if(stI>=STORY.length-1)return endStory();stI++;stT=0;stChars=0;if(stI===STORY.length-1)$('#stNext').textContent='Begin ⚔'}
$('#stNext').addEventListener('pointerdown',storyNext);$('#stSkip').addEventListener('pointerdown',endStory);
const _showStory=showStory;showStory=function(){_showStory();requestAnimationFrame(storyLoop)};
