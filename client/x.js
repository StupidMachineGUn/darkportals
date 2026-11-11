/* ---------- bank · trade house · dungeon ---------- */
const AUCPOOL=(()=>{const s=new Set(ENDGAME);for(const k in GEAR_DROPS)for(const id of GEAR_DROPS[k][1])s.add(id);return [...s]})();
let thTab='auc',TR=null,listMul=1,gateArm=0;
const LMUL=[.7,1,1.4,2];
function xInit(){P.bank=P.bank||{gold:0,items:[]};P.sales=P.sales||[];aucGen()}
const xrow=(s,act,v,label,extra='')=>`<div class="row"><span style="font-size:22px">${ITEMS[s.id].e}</span><div style="flex:1;color:${RARC[s.rar|0]}">${nameOf(s)}${s.ench?' ✨':''}${s.n>1?' ×'+s.n:''}<div class="tip">${ITEMS[s.id].slot?statLine(s):''}${extra}</div></div>${label?bt(act,v,label):''}</div>`;
const tleft=ms=>{const m=Math.max(0,Math.ceil(ms/60000));return m+'m'};
function giveItem(s){if(ITEMS[s.id].slot){if(P.inv.length<24){P.inv.push(s);return 'bag'}P.bank.items.push(s);return 'bank'}
 const t=P.inv.find(i=>i.id===s.id);if(t){t.n+=s.n;return 'bag'}if(P.inv.length<24){P.inv.push(s);return 'bag'}const b=P.bank.items.find(i=>i.id===s.id&&!ITEMS[i.id].slot);if(b)b.n+=s.n;else P.bank.items.push(s);return 'bank'}
/* bank */
function bankHtml(){const b=P.bank;let h=hdr('🏦 Hearthmoor Bank')+`<div class="tip" style="font-size:13px;opacity:1">"Safe as a dragon's hoard." 💰 Carrying <b>${P.gold}</b> · Vault <b>${b.gold}</b></div><div class="row"><span style="flex:1">Gold</span>${bt('bg','d100','+100',P.gold<100)}${bt('bg','dall','All in',!P.gold)}</div><div class="row"><span style="flex:1"></span>${bt('bg','w100','−100',b.gold<100)}${bt('bg','wall','All out',!b.gold)}</div>`;
 h+=`<h3 style="margin-top:8px">Vault ${b.items.length}/60</h3>`;if(!b.items.length)h+='<div class="tip">Empty. Store items from your backpack below.</div>';b.items.forEach((s,i)=>h+=xrow(s,'bwd',i,'Take'));
 h+='<h3 style="margin-top:8px">Backpack</h3>';P.inv.forEach((s,i)=>{if(!isEq(s))h+=xrow(s,'bdep',i,'Store')});return h}
/* auction */
function aucNew(){const id=pick(AUCPOOL),it={id,n:1,u:uid()};rollGear(it,'mob',Math.random()<.5);if(Math.random()<.25&&it.rar<1)it.rar=1;const val=valOf(it),st=Math.max(2,Math.round(val*rnd(.7,1.1)));return{it,seller:pick(BN),cur:st,bidder:null,buy:Math.round(val*rnd(1.7,2.5)),exp:Date.now()+ri(4,25)*60000,max:Math.round(val*rnd(.9,1.9)),hold:0}}
function aucGen(){P.auc=P.auc||[];while(P.auc.length<9)P.auc.push(aucNew())}
const nextBid=l=>l.bidder?l.cur+Math.max(1,Math.round(l.cur*.06)):l.cur;
function aucStep(){const now=Date.now();aucGen();
 for(let i=P.auc.length-1;i>=0;i--){const l=P.auc[i];
  if(now>=l.exp){if(l.bidder==='you'){const w=giveItem(l.it);sys(`🔨 You won ${nameOf(l.it)} for ${l.cur}g! (sent to your ${w==='bag'?'backpack':'bank vault'})`,'#9fe3ff')}P.auc.splice(i,1);continue}
  if(Math.random()<.035&&nextBid(l)<=l.max){const was=l.bidder;if(was==='you'){P.gold+=l.hold;sys(`📉 Outbid on ${nameOf(l.it)} – ${l.hold}g refunded.`,'#fc6');l.hold=0}l.cur=nextBid(l);l.bidder=pick(BN)}}
 for(let i=P.sales.length-1;i>=0;i--){const l=P.sales[i];
  if(now>=l.exp){if(l.bidder){const g=Math.round(l.cur*.95);P.gold+=g;sys(`💰 ${nameOf(l.it)} sold to ${l.bidder} for ${l.cur}g (+${g}g after 5% fee)`,'#ffd36b')}else{const w=giveItem(l.it);sys(`📦 ${nameOf(l.it)} didn't sell – returned to your ${w==='bag'?'backpack':'bank vault'}.`,'#fc6')}P.sales.splice(i,1);continue}
  if(Math.random()<.03&&nextBid(l)<=l.max){l.cur=nextBid(l);l.bidder=pick(BN)}}}
let xT=0;function xTick(dt){if(!P)return;portalTick(dt);wizTick(dt);gibStep(dt);xT+=dt;if(xT>=1){xT=0;aucStep()}}
function aucHtml(){let h=`<div class="tip" style="font-size:13px;opacity:1">💰 ${P.gold} · Auctions resolve in real time. Bid, or buy now.</div>`;
 for(const l of P.auc){const nb=nextBid(l),mine=l.bidder==='you';h+=`<div class="row"><span style="font-size:22px">${ITEMS[l.it.id].e}</span><div style="flex:1;color:${RARC[l.it.rar|0]}">${nameOf(l.it)}${l.it.ench?' ✨':''}<div class="tip">${statLine(l.it)}<br>by ${l.seller} · ⏱ ${tleft(l.exp-Date.now())} · bid <b>${l.cur}g</b>${l.bidder?' ('+(mine?'YOU':l.bidder)+')':''}</div></div><div style="display:flex;flex-direction:column;gap:4px">${bt('abid',l.it.u,mine?'Leading':'Bid '+nb+'g',mine||P.gold<nb)}${bt('abuy',l.it.u,'Buy '+l.buy+'g',P.gold<l.buy)}</div></div>`}
 h+=`<h3 style="margin-top:10px">Your listings</h3>`;if(!P.sales.length)h+='<div class="tip">Nothing listed. 5% fee on sales.</div>';
 for(const l of P.sales)h+=xrow(l.it,'acan',l.it.u,l.bidder?'':'Cancel',`<br>⏱ ${tleft(l.exp-Date.now())} · ${l.bidder?'bid <b>'+l.cur+'g</b> by '+l.bidder:'start '+l.cur+'g · no bids'}`);
 h+=`<h3 style="margin-top:10px">List an item (10 min)</h3><div class="row"><span style="flex:1">Price: ${Math.round(listMul*100)}% of value</span>${bt('alm',0,'Change')}</div>`;
 P.inv.forEach((s,i)=>{if(!isEq(s)&&P.sales.length<5){const p=Math.max(1,Math.round(valOf(s)*s.n*listMul));h+=xrow(s,'alist',s.u,'List '+p+'g')}});return h}
/* trade table */
function trSync(){TR.my=0;TR.bot=0;netSend({t:'tu',items:TR.mine.map(i=>{const o={...i};delete o.u;return o}),gold:TR.mg})}
function trVal(items,g){return g+items.reduce((a,s)=>a+valOf(s)*s.n,0)}
function trStart(b){const th=[];for(let i=0;i<ri(1,2);i++){const s={id:pick(AUCPOOL),n:1,u:uid()};rollGear(s,'mob',false);th.push(s)}
 TR={b,mine:[],mg:0,theirs:th,tg:ri(20,200),bot:0,msg:`${b.name} lays out an offer.`}}
function tradeHtml(){let h=hdr('🤝 Trade House')+`<div class="row">${bt('tab','auc','🔨 Auction',thTab==='auc')}${bt('tab','tbl','🤝 Trade table',thTab==='tbl')}</div>`;
 if(thTab==='auc')return h+aucHtml();
 if(!TR){const q=NET.treq&&NET.treq.t>clock?NET.treq:null,bid=netBid(),room=[...NET.others.values()].filter(o=>o.bd&&o.bd===bid);
  if(q)h+=`<div class="tip" style="font-size:13px;opacity:1">📨 <b>${q.n}</b> wants to trade with you.</div><div class="row">${bt('trA',q.from,'✅ Accept')}${bt('trD',0,'Decline')}</div>`;
  h+=`<div class="tip" style="font-size:13px;opacity:1">Trade safely with other players standing in this room. Both sides must confirm, and any change resets the confirmations.</div>`;
  if(!NET.ws)h+='<div class="tip">You must be online to trade with players.</div>';else if(!room.length)h+='<div class="tip">Nobody else is in the Trade House right now. Ask a friend to come in.</div>';
  for(const o of room)h+=`<div class="row"><span style="flex:1;color:#8dffb0">● ${o.n}</span>${bt('trq',o.id,'Offer trade')}</div>`;return h}
 const me=TR.mine,mv=trVal(me,TR.mg),tv=trVal(TR.theirs,TR.tg);
 h+=`<div class="tip" style="font-size:13px;opacity:1">Trading with <b style="color:${TR.p2p?'#8dffb0':TR.b.col}">${TR.p2p?TR.name:TR.b.name}</b> · ${TR.msg}</div>`;
 h+=`<h3>They offer ${TR.bot?'✅':'⬜'}</h3>`+TR.theirs.map(s=>xrow(s,'',0,'')).join('')+`<div class="row"><span style="flex:1">💰 ${TR.tg}g</span></div>`;
 h+=`<h3 style="margin-top:6px">You offer</h3>`+me.map(s=>xrow(s,'trm',s.u,'Remove')).join('')+`<div class="row"><span style="flex:1">💰 ${TR.mg}g <span class="tip">(have ${P.gold})</span></span>${bt('trg','-100','−100',TR.mg<100)}${bt('trg','100','+100',P.gold-TR.mg<100)}${bt('trg','all','All',P.gold<=TR.mg)}</div>`;
 h+=TR.p2p?`<div class="row">${bt('tra',0,TR.my?'✅ Confirmed – waiting for them…':'✅ Confirm trade',!!TR.my)}${bt('trx',0,'Cancel trade')}</div>`:`<div class="row">${bt('trp',0,'📨 Propose',!me.length&&!TR.mg)}${bt('tra',0,'✅ Accept trade',!TR.bot)}${bt('trx',0,'Leave table')}</div>`;
 h+=`<h3 style="margin-top:6px">Add from backpack</h3>`;P.inv.forEach(s=>{if(!isEq(s)&&!me.includes(s))h+=xrow(s,'tri',s.u,'Offer')});return h}
function xAct(a,v){
 if(a==='bg'){const b=P.bank;let n=0;if(v==='d100')n=Math.min(100,P.gold);else if(v==='dall')n=P.gold;else if(v==='w100')n=-Math.min(100,b.gold);else n=-b.gold;P.gold-=n;b.gold+=n;sfx('pick');return true}
 if(a==='bdep'){const s=P.inv[v],b=P.bank;if(!s||isEq(s))return true;if(ITEMS[s.id].slot){if(b.items.length>=60)return toast('Vault full','#f66'),true;b.items.push(s)}else{const t=b.items.find(i=>i.id===s.id&&!ITEMS[i.id].slot);if(t)t.n+=s.n;else{if(b.items.length>=60)return toast('Vault full','#f66'),true;b.items.push(s)}}P.inv.splice(v,1);sfx('pick');return true}
 if(a==='bwd'){const s=P.bank.items[v];if(!s)return true;if(ITEMS[s.id].slot||!P.inv.find(i=>i.id===s.id)){if(P.inv.length>=24)return toast('Bag full','#f66'),true;P.inv.push(s)}else P.inv.find(i=>i.id===s.id).n+=s.n;P.bank.items.splice(v,1);sfx('pick');return true}
 if(a==='tab'){thTab=v;return true}
 if(a==='alm'){listMul=LMUL[(LMUL.indexOf(listMul)+1)%LMUL.length];return true}
 if(a==='abid'){const l=P.auc.find(x=>x.it.u==v);if(!l||l.bidder==='you')return true;const nb=nextBid(l);if(P.gold<nb)return toast('Not enough gold','#f66'),true;P.gold-=nb;if(l.bidder&&l.bidder!=='you'){}l.cur=nb;l.bidder='you';l.hold=nb;l.max=Math.max(l.max,Math.round(nb*1.05));sfx('pick');toast('Bid placed: '+nb+'g');return true}
 if(a==='abuy'){const i=P.auc.findIndex(x=>x.it.u==v),l=P.auc[i];if(!l||P.gold<l.buy)return true;if(l.bidder==='you')P.gold+=l.hold;P.gold-=l.buy;const w=giveItem(l.it);P.auc.splice(i,1);sys(`🛒 Bought ${nameOf(l.it)} for ${l.buy}g (in your ${w==='bag'?'backpack':'bank vault'})`,'#9fe3ff');sfx('pick');return true}
 if(a==='alist'){const i=P.inv.findIndex(s=>s.u==v);if(i<0||isEq(P.inv[i])||P.sales.length>=5)return true;const s=P.inv.splice(i,1)[0],val=Math.max(1,valOf(s)*s.n);P.sales.push({it:s,cur:Math.max(1,Math.round(val*listMul)),bidder:null,exp:Date.now()+600000,max:Math.round(val*rnd(.7,1.8))});sfx('pick');toast('Listed for 10 minutes');return true}
 if(a==='acan'){const i=P.sales.findIndex(x=>x.it.u==v);if(i<0||P.sales[i].bidder)return true;giveItem(P.sales[i].it);P.sales.splice(i,1);return true}
 if(a==='tr0'){const b=bots.find(x=>x.name===v);if(b)trStart(b);return true}
 if(a==='trx'){if(TR&&TR.p2p)netSend({t:'tx'});TR=null;return true}
 if(a==='trq'){netSend({t:'tq',to:+v});toast('📨 Trade offer sent');return true}
 if(a==='trA'){netSend({t:'ta',to:+v});NET.treq=null;return true}
 if(a==='trD'){NET.treq=null;return true}
 if(a==='tri'){const s=P.inv.find(x=>x.u==v);if(s&&TR&&!TR.mine.includes(s)){TR.mine.push(s);TR.bot=0;if(TR.p2p)trSync()}return true}
 if(a==='trm'){TR.mine=TR.mine.filter(x=>x.u!=v);TR.bot=0;if(TR.p2p)trSync();return true}
 if(a==='trg'){TR.mg=v==='all'?P.gold:clamp(TR.mg+(+v),0,P.gold);TR.bot=0;if(TR.p2p)trSync();return true}
 if(a==='trp'){const m=trVal(TR.mine,TR.mg),t=trVal(TR.theirs,TR.tg),r=m/Math.max(1,t);if(r>=1){TR.bot=1;TR.msg='"Deal! Press Accept."'}else if(r>=.8){TR.bot=0;TR.msg=`"Add about ${Math.ceil(t*.98-m)}g more and we have a deal."`}else{TR.bot=0;TR.msg='"Not even close."'}return true}
 if(a==='tra'&&TR&&TR.p2p){if(TR.my)return true;const sp=P.inv.length-TR.mine.length+TR.theirs.length;if(sp>24)return toast('Not enough bag space','#f66'),true;if(TR.mg>P.gold)return toast('Not enough gold','#f66'),true;TR.my=1;netSend({t:'tk'});return true}
 if(a==='tra'){if(!TR.bot)return true;const sp=P.inv.length-TR.mine.length+TR.theirs.length;if(sp>24)return toast('Not enough bag space','#f66'),true;
  for(const s of TR.mine){const i=P.inv.indexOf(s);if(i>=0)P.inv.splice(i,1)}P.gold-=TR.mg;TR.b.gold+=TR.mg;TR.b.gold=Math.max(0,TR.b.gold-TR.tg);P.gold+=TR.tg;for(const s of TR.theirs)giveItem(s);
  sys('🤝 Trade complete with '+TR.b.name+'!','#9fe3ff');sfx('lvl');TR=null;return true}
 return false}
/* ---------- dungeon ---------- */
const DUN={x0:10,y0:8,w:106,h:40},DR=()=>{const X=DUN.x0,Y=DUN.y0;return[[X+3,Y+14,10,12],[X+17,Y+12,16,16],[X+37,Y+12,16,16],[X+57,Y+12,16,16],[X+77,Y+12,12,16],[X+93,Y+5,13,30]]};
let GATE=null,GATE_X=null;
function carveDungeon(){const X0=DUN.x0,Y0=DUN.y0,X1=X0+DUN.w,Y1=Y0+DUN.h;
 for(let y=Y0-5;y<=Y1+5;y++)for(let x=X0-5;x<=X1+5;x++){if(!inb(x,y))continue;const k=idx(x,y);map[k]=TL.WALL;solid[k]=1;reach[k]=0;objAt.delete(k)}
 for(let i=objs.length-1;i>=0;i--){const o=objs[i];if(o.x>=X0-5&&o.x<=X1+5&&o.y>=Y0-5&&o.y<=Y1+5)objs.splice(i,1)}
 const fl=(x,y,w,h)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++){const k=idx(x+i,y+j);map[k]=TL.DARK;solid[k]=0}},pil=(x,y)=>{const k=idx(x,y);map[k]=TL.WALL;solid[k]=1},R=DR();
 R.forEach(r=>fl(...r));for(let i=0;i<R.length-1;i++){const a=R[i],b=R[i+1];fl(a[0]+a[2],Y0+19,b[0]-a[0]-a[2],3)}
 for(let i=1;i<=4;i++){const [x,y]=R[i];for(const [px,py] of [[4,4],[11,4],[4,11],[11,11]])if(px<R[i][2]-1&&py<R[i][3]-1)pil(x+px,y+py)}
 {const [x,y]=R[5];for(const [px,py] of [[3,6],[9,6],[3,23],[9,23],[6,14],[6,15]])pil(x+px,y+py)}
 const e=R[0];GATE_X={x:e[0]+1,y:e[1]+5};const o={x:GATE_X.x,y:GATE_X.y,t:'gate',hp:1,dead:0,exit:true};objs.push(o);objAt.set(idx(o.x,o.y),o);solid[idx(o.x,o.y)]=1;
 // outside gate near the last village
 const v=VIL[VIL.length-1]||{x:CX-80,y:CY-80};let best=null;
 for(let r=VIL_R+4;r<VIL_R+12&&!best;r++)for(let a=0;a<6.283;a+=.1){const x=Math.round(v.x+Math.cos(a)*r),y=Math.round(v.y+Math.sin(a)*r),k=idx(x,y);if(inb(x,y+1)&&reach[k]&&!solid[k]&&!objAt.has(k)&&!solid[idx(x,y+1)]&&!objAt.has(idx(x,y+1))&&!safeAt(x,y)&&map[k]>=2&&map[k]<=8){best={x,y};break}}
 if(best){const g2={x:best.x,y:best.y,t:'gate',hp:1,dead:0,exit:false};objs.push(g2);objAt.set(idx(g2.x,g2.y),g2);solid[idx(g2.x,g2.y)]=1;GATE=g2;o.to={x:best.x+.5,y:best.y+1.5}}
 else o.to={x:CX+.5,y:CY+2.5}}
function useGate(o){if(!o.exit){if(clock>gateArm){gateArm=clock+6;return toast('☠️ Dungeon of the Dark Wizard – deadly! Bring a party. Tap again to enter.','#c9f')}
  const R=DR()[0];tele(R[0]+7.5,R[1]+6.5);sys('☠️ You step into the Dungeon of the Dark Wizard…','#c9f');return}
 tele(o.to.x,o.to.y);sys('🌅 You escape the dungeon.','#9fe3ff')}
function tele(x,y){NET.tpT=1;stopAct();P.x=x;P.y=y;P.path=null;P.chase=null;cam.x=x;cam.y=y;burst(x,y-.4,'#b46aff',26,5);fxs.push({k:'ring',x,y,r:2,life:.6,max:.6,c:'#b46aff'});sfx('lvl')}
function dunMob(t,x,y,dep){const e=mkEnemy(t,x,y);e.el='elite';e.dun=1;e.mhp=e.hp=Math.round(ESPEC[t].hp*(3.2+dep*.5));e.dm=1.4+dep*.12;e.xm=4;e.sc=1.2;return e}
function spawnDungeon(){const R=DR(),T4=[['skeleton','ogre'],['wraith','golem'],['troll','golem','ogre'],['demon','troll']];
 for(let i=1;i<=4;i++){const [rx,ry,rw,rh]=R[i];let n=0,tr=0;while(n<3&&tr++<200){const cx=rx+ri(2,rw-3),cy=ry+ri(2,rh-3);if(solid[idx(cx,cy)])continue;const t=pick(T4[i-1]);for(let m=0;m<3;m++){const x=cx+(m-1)*.9,y=cy+(m%2)*.7;if(solid[idx(Math.floor(x),Math.floor(y))])continue;E.push(dunMob(t,x+.5,y+.5,i))}n++}}
 const [bx,by,bw,bh]=R[5],w=mkEnemy('wizard',bx+bw-4+.5,by+bh/2+.5);w.el='lord';w.dun=1;w.sc=1.6;w.hx=w.x;w.hy=w.y;E.push(w);
 for(const [dx,dy] of [[-4,-5],[-4,5]]){const e=dunMob('demon',w.x+dx,w.y+dy,5);E.push(e)}}
function megaLoot(rar){const s=addItem(pick(ENDGAME));if(!s)return;rollGear(s,'smith',true);s.rar=Math.max(s.rar|0,rar);if(rar>=2&&!s.ench)rollGear(Object.assign(s,{}),'smith',true),s.rar=Math.max(s.rar|0,rar);announceGear(s,'Looted');sys('🎁 Dungeon loot: '+nameOf(s),RARC[s.rar|0])}
function dunKill(e){if(e.t==='wizard')closePortals();if(e.el==='elite'){if(Math.random()<.45)megaLoot(Math.random()<.04?3:Math.random()<.2?2:1);if(Math.random()<.3){addItem('gem');fl(e.x,e.y-1,'💎','#fff')}if(Math.random()<.3)addItem(pick(['hpotion','potion']),2)}
 else if(e.t==='wizard'){for(let i=0;i<3;i++)megaLoot(3);addItem('essence',6);addItem('gem',4);addItem('hpotion',5);P.wiz=(P.wiz|0)+1;addBoard();sys('💀 MALACHAR, THE DARK WIZARD, HAS FALLEN! The portals fall silent… for now.','#ffd34a');toast('🏆 The Dark Wizard is defeated!','#ffd34a');for(let i=0;i<5;i++)fxs.push({k:'ring',x:e.x,y:e.y,r:2+i*1.6,life:.8+i*.15,max:.8+i*.15,c:'#ffd34a'})}}
const ELL=e=>e.el==='lord'?'💀 Malachar, the Dark Wizard':e.el==='elite'?'⚔ Elite '+e.t:(e.el==='shaman'?'🔮 Shaman ':'👑 Chief ')+e.t;
/* ---------- gore · shadows · shake · music ---------- */
let shakeT=0,shakeA=0,meleeT=-1,inWiz=false,gibs=[],decals=[];
const GIBC={slime:['#4fd24f','#9bff9b'],skeleton:['#e8e0d0','#bdb59f'],golem:['#7d8696','#52565f'],wraith:['#8a6ad0','#5a3a9a'],bat:['#6b4a8a','#c33'],spider:['#2a2a2a','#7be24a'],chicken:['#f5f0e0','#c33'],rooster:['#f5f0e0','#c33'],wizard:['#7a1a2a','#b46aff']};
const goreOn=()=>P&&P.gore!==false;
function bloodHit(e){if(!goreOn())return;const c=(GIBC[e.t]||['#a01818','#d03030'])[0];for(let i=0;i<7;i++){const a=rnd(0,6.28),v=rnd(.6,2);parts.push({x:e.x,y:e.y-.5,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1,life:rnd(.3,.6),c,sz:rnd(1,2)})}addDecal(e.x+rnd(-.4,.4),e.y+rnd(-.1,.4),rnd(1.5,3),c)}
function addDecal(x,y,r,c){decals.push({x,y,r,c,life:30});if(decals.length>220)decals.shift()}
function goreKill(e){if(!goreOn())return;const [c1,c2]=GIBC[e.t]||['#a01818','#d03030'],n=ri(9,15);
 for(let i=0;i<n;i++){const a=rnd(0,6.28),v=rnd(1.5,4.5);gibs.push({x:e.x,y:e.y,z:.4,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.6,vz:rnd(2,5),c:i%3?c1:c2,sz:rnd(2,4),life:rnd(18,26)})}
 for(let i=0;i<4;i++)addDecal(e.x+rnd(-.8,.8),e.y+rnd(-.4,.6),rnd(3,6),c1);burst(e.x,e.y-.4,c1,16,4)}
function gibStep(dt){for(let i=gibs.length-1;i>=0;i--){const q=gibs[i];if(q.z>0||q.vz>0){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vz-=14*dt;q.z+=q.vz*dt;if(q.z<=0){q.z=0;q.vz=0;q.vx=q.vy=0;addDecal(q.x,q.y,1.2,q.c)}}q.life-=dt;if(q.life<=0)gibs.splice(i,1)}
 for(let i=decals.length-1;i>=0;i--){decals[i].life-=dt;if(decals[i].life<=0)decals.splice(i,1)}}
function drawDecals(){g.save();for(const d of decals){g.globalAlpha=clamp(d.life/8,0,.55);g.fillStyle=d.c;g.beginPath();g.ellipse(d.x*T,d.y*T+2,d.r,d.r*.55,0,0,6.283);g.fill()}g.restore()}
function drawGibs(){for(const q of gibs){g.fillStyle='#0003';g.fillRect(q.x*T-1,q.y*T+1,q.sz,1);g.fillStyle=q.c;g.fillRect(Math.round(q.x*T),Math.round(q.y*T-q.z*T*.5-1),q.sz,q.sz-1)}}
function drawShadows(x0,x1,y0,y1){for(const o of NET.others.values())if(o.x>=x0-3&&o.x<=x1+3&&o.y>=y0-3&&o.y<=y1+4){g.fillStyle='rgba(0,0,0,.26)';g.beginPath();g.ellipse(o.x*T,o.y*T+2,6,2.4,0,0,6.283);g.fill()}g.save();g.fillStyle='rgba(0,0,0,.26)';const el=(x,y,rx,ry)=>{g.beginPath();g.ellipse(x,y,rx,ry,0,0,6.283);g.fill()},vis=(x,y)=>x>=x0-3&&x<=x1+3&&y>=y0-3&&y<=y1+4;
 for(const o of objs){if(o.dead||!vis(o.x,o.y))continue;const bx=o.x*T+8,by=o.y*T+14;if(o.t==='tree'){g.beginPath();g.moveTo(bx-5,by);g.lineTo(bx+5,by);g.lineTo(bx+30,by+7);g.lineTo(bx+18,by+8);g.closePath();g.fill()}else if(o.t==='rock')el(bx+3,by,9,3);else if(o.t==='gate')el(bx+6,by,12,3)}
 for(const b of buildings){if(!vis(b.x,b.y))continue;const x=b.x*T,yb=(b.y+b.h)*T,w=b.w*T,yt=b.y*T-12;g.beginPath();g.moveTo(x,yb);g.lineTo(x+w,yb);g.lineTo(x+w+12,yb+6);g.lineTo(x+12,yb+6);g.closePath();g.fill();g.beginPath();g.moveTo(x+w,yb);g.lineTo(x+w,yt);g.lineTo(x+w+12,yt+6);g.lineTo(x+w+12,yb+6);g.closePath();g.fill()}
 for(const e of E)if(!e.dead&&vis(e.x,e.y)){const s=e.sc||1;el(e.x*T+1,e.y*T+2,7*s,2.6*s)}
 for(const a of bots)if(!a.dead&&vis(a.x,a.y))el(a.x*T,a.y*T+2,6,2.4);for(const a of guards)if(!a.dead&&vis(a.x,a.y))el(a.x*T,a.y*T+2,6,2.4);for(const n of npcs)if(!n.dead&&vis(n.x,n.y))el(n.x*T+8,n.y*T+14,6,2.4);
 if(!P.dead)el(P.x*T,P.y*T+2,6,2.4);g.restore()}
function bigMsg(t,c='#f6f'){let d=document.getElementById('bigmsg');if(!d){d=document.createElement('div');d.id='bigmsg';d.style.cssText='position:fixed;left:50%;top:12%;white-space:pre-line;transform:translateX(-50%);z-index:4;pointer-events:none;text-align:center;font:bold 18px Georgia,serif;max-width:86vw;text-shadow:0 0 12px #000,0 2px 0 #000;transition:opacity 1.5s;opacity:0';document.body.appendChild(d)}d.style.color=c;d.textContent=t;d.style.opacity=1;clearTimeout(d._t);d._t=setTimeout(()=>d.style.opacity=0,5000)}
function wizTick(dt){const R=DR()[5],w=P.x>=R[0]&&P.x<R[0]+R[2]&&P.y>=R[1]&&P.y<R[1]+R[3];if(w&&!inWiz){shakeT=3.2;shakeA=3;sys('🌋 The earth trembles across the land… someone has entered the Dark Wizard\'s chamber!','#f6f');bigMsg('⚠ THE WORLD TREMBLES ⚠\nThe Dark Wizard\'s chamber has been entered!');sfx('boss')}inWiz=w;if(shakeT>0)shakeT-=dt}
/* music: tiny procedural chiptune */
const NOTE=n=>440*Math.pow(2,(n-69)/12);
const MUS={
 village:{bpm:92,lead:[76,0,79,0,81,0,79,0,77,0,76,0,74,0,0,0,72,0,76,0,79,0,76,0,74,0,71,0,72,0,0,0],roots:[48,53,55,48],arp:[0,4,7,12],lw:'triangle',lv:.05,bv:.05},
 fight:{bpm:158,lead:[81,0,81,84,81,0,79,77,76,0,76,79,76,0,74,72,77,0,77,81,77,0,76,74,76,74,72,71,69,0,0,0],roots:[45,41,43,45],arp:[0,0,7,0],lw:'square',lv:.032,bv:.06,hat:1},
 dun:{bpm:64,lead:[62,0,0,65,0,0,69,0,67,0,0,64,0,0,62,0,60,0,0,63,0,0,67,0,65,0,0,62,0,0,0,0],roots:[38,34,36,38],arp:[0,7,0,12],lw:'sawtooth',lv:.018,bv:.05}};
let musMode=null,musStep=0,musNext=0,musFightT=0,noiseBuf=null,musCheck=0;
function mtone(f,t,d,ty,v){const o=AC.createOscillator(),gn=AC.createGain();o.type=ty;o.frequency.value=f;gn.gain.setValueAtTime(v,t);gn.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(gn);gn.connect(AC.destination);o.start(t);o.stop(t+d+.02)}
function mhat(t,v){if(!noiseBuf){noiseBuf=AC.createBuffer(1,AC.sampleRate*.05,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}const s=AC.createBufferSource(),gn=AC.createGain();s.buffer=noiseBuf;gn.gain.setValueAtTime(v,t);gn.gain.exponentialRampToValueAtTime(.0001,t+.04);s.connect(gn);gn.connect(AC.destination);s.start(t)}
function musPick(){if(!P||P.dead)return null;const R=DR();if(inWiz)return'fight';
 const any=E.some(e=>!e.dead&&e.st===1&&!ESPEC[e.t].pass&&Math.hypot(e.x-P.x,e.y-P.y)<12);if(any)musFightT=clock+6;if(clock<musFightT)return'fight';
 if(P.x<DUN.x0+DUN.w+6&&P.y<DUN.y0+DUN.h+6&&P.x>DUN.x0-5&&P.y>DUN.y0-5)return'dun';
 if(P.inside||shopSt||safeAt(P.x,P.y))return'village';return null}
function musTick(){if(!P||muted||P.music===false||!AC||AC.state!=='running')return;const m=musPick();if(m!==musMode){musMode=m;musStep=0;musNext=AC.currentTime+.08}if(!m)return;const M=MUS[m],sd=60/M.bpm/2;
 while(musNext<AC.currentTime+.3){const s=musStep%32,bar=(s>>3)%4,n=M.lead[s],t=musNext;
  if(n)mtone(NOTE(n),t,sd*1.8,M.lw,M.lv);
  if(s%8===0||s%8===4)mtone(NOTE(M.roots[bar]+(s%8===4?7:0)),t,sd*3,'triangle',M.bv);
  if(m==='fight'&&s%2===0)mtone(NOTE(M.roots[bar]),t,sd*.8,'square',.03);
  if(s%2===1){const a=M.arp[(s>>1)%4];mtone(NOTE(M.roots[bar]+24+a),t,sd*.9,'square',.012)}
  if(M.hat&&s%2===1)mhat(t,.03);
  musNext+=sd;musStep++}}
setInterval(()=>{try{musTick()}catch(e){}},90);
addEventListener('pointerdown',()=>{try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume()}catch(e){}});
function optHtml(){return `<div class="row"><span style="flex:1">🩸 Gore</span>${bt('opt','gore',goreOn()?'ON':'OFF')}</div><div class="row"><span style="flex:1">🎵 Music</span>${bt('opt','music',P.music===false?'OFF':'ON')}</div><div class="row"><span style="flex:1">🏆 Hall of Heroes</span>${bt('board',0,'Open')}</div><div class="tip">Tap 🔊 (top bar) to mute everything. DEV button = test mode.</div>`}
function realXp(){return P.dev&&P.devBak?P.devBak:P.xp}
function calcScore(){const xp=realXp(),tl=SK.reduce((s,x)=>s+lvOf(xp[x[0]]),0),pk=P.pvpK|0,mk=Math.max(0,(P.kills|0)-pk);return{tl,mk,pk,pd:P.pvpD|0,d:P.deaths|0,gold:P.gold+(P.bank?P.bank.gold:0),wiz:P.wiz|0,score:Math.max(0,Math.round(tl*100+mk*3+pk*75-(P.pvpD|0)*30-(P.deaths|0)*5+(P.gold+(P.bank?P.bank.gold:0))/20+(P.wiz|0)*5000))}}
function dollURL(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.imageSmoothingEnabled=false;const old=g;g=x;try{x.setTransform(4,0,0,4,0,0);drawChar(0,0,0,0,(eqTint().ta?shade(eqTint().ta,.7):ARMC[armLv(eqId('a'))]),'#3a2a1a',{wid:eqId('w'),tw:eqTint().tw,ta:eqTint().ta,arm:armLv(eqId('a')),helm:eqTier('h'),boots:eqTier('b')})}finally{g=old}return c.toDataURL()}
const BKEY='emberfall.board';
function loadBoard(){if(NET.on)return NET.board;try{return JSON.parse(localStorage.getItem(BKEY)||'[]')}catch(e){return[]}}
function addBoard(){const s=calcScore(),b=loadBoard(),ent={name:P.name,img:dollURL(),when:Date.now(),...s},i=b.findIndex(x=>x.name===P.name);if(i>=0){ent.wiz=Math.max(ent.wiz,b[i].wiz|0);if(b[i].score>ent.score)ent.score=b[i].score;b[i]=ent}else b.push(ent);b.sort((a,c)=>c.score-a.score);if(NET.on)netPostBoard(ent);else try{localStorage.setItem(BKEY,JSON.stringify(b.slice(0,50)))}catch(e){}sys(`🏆 ${P.name} is inscribed in the Hall of Heroes with ${ent.score} points!`,'#ffd34a');bigMsg('🏆 '+P.name+' slew the Dark Wizard!\n'+ent.score+' points','#ffd34a')}
function boardHtml(){const b=loadBoard(),me=calcScore();let h=hdr('🏆 Hall of Heroes')+`<div class="tip" style="font-size:13px;opacity:1">🌀 Dark Portals: ${PT.open?'<b style="color:#c6f">OPEN</b> – slay the Dark Wizard to close them':'closed for '+Math.ceil((PT.reopen-clock)/60)+' more min'}</div><div class="tip" style="font-size:13px;opacity:1">Slayers of Malachar, the Dark Wizard. Score = levels, kills, PvP, gold. Your score now: <b>${me.score}</b></div>`;
 if(!b.length)h+='<div class="tip">No one has slain the Dark Wizard yet…</div>';
 b.forEach((e,i)=>{h+=`<div class="row"><b style="width:22px">${i+1}</b><img src="${e.img}" width="48" height="48" style="image-rendering:pixelated;background:#0003;border-radius:6px"><div style="flex:1"><b>${e.name}</b> · <span style="color:#ffd34a">${e.score}</span><div class="tip">Lv ${e.tl} · ⚔${e.mk} kills · 🩸${e.pk} PvP (☠${e.pd}) · 💀${e.d} · 💰${e.gold} · 🐉×${e.wiz}<br>${new Date(e.when).toLocaleDateString()}</div></div></div>`});return h}
const _xAct=xAct;xAct=function(a,v){if(a==='board'){openPanel('board');if(NET.on)netBoard();return true}if(a==='opt'){if(v==='gore')P.gore=!goreOn();else{P.music=P.music===false;musMode=null}return true}return _xAct(a,v)};

/* ---------- dark portals: mob spawners shut down by slaying the Dark Wizard ---------- */
const PT={open:true,reopen:0},PTS=[];let ptClean=0;
function spawnPortals(){const X0=DUN.x0-8,X1=DUN.x0+DUN.w+8,Y0=DUN.y0-8,Y1=DUN.y0+DUN.h+8;let tr=0;
 while(PTS.length<12&&tr++<40000){const x=ri(8,MW-9),y=ri(8,MH-9),k=idx(x,y);if(!reach[k]||solid[k]||objAt.has(k)||(x>X0&&x<X1&&y>Y0&&y<Y1))continue;
  if(Math.hypot(x-CX,y-CY)<TOWN_R+38||VIL.some(v=>Math.hypot(x-v.x,y-v.y)<VIL_R+30)||PTS.some(p=>Math.hypot(x-p.x,y-p.y)<34))continue;
  if(!reach[idx(x,y+1)]||solid[idx(x,y+1)])continue;solid[k]=1;PTS.push({id:PTS.length,x,y,t:rnd(2,8)})}}
function portalTick(dt){if(NET.sim)return;if(!PT.open){if(clock>=PT.reopen)reopenPortals();return}
 for(const p of PTS){p.t-=dt;if(p.t>0)continue;p.t=rnd(7,11);if(Math.hypot(P.x-p.x,P.y-p.y)>70)continue;
  let live=0;for(const e of E)if(e.pt===p.id&&!e.dead)live++;if(live>=6)continue;
  const d=Math.hypot(p.x-CX,p.y-CY),t=pickMob(d,map[idx(p.x,p.y+1)]);if(!t||!ESPEC[t]||ESPEC[t].pass)continue;
  const x=p.x+.5+rnd(-1.5,1.5),y=p.y+1.6+rnd(0,1.5);if(solid[idx(Math.floor(x),Math.floor(y))])continue;
  const m=mkEnemy(t,x,y);m.pt=p.id;m.temp=1;E.push(m);burst(x,y-.4,'#b46aff',10,3);fxs.push({k:'ring',x,y,r:1.4,life:.5,max:.5,c:'#b46aff'})}
 ptClean+=dt;if(ptClean>30){ptClean=0;E=E.filter(e=>!(e.pt!=null&&e.dead>clock+1e8))}}
function closePortals(){if(NET.sim){PT.open=false;return}PT.open=false;PT.reopen=clock+600;let n=0;for(const e of E)if(e.pt!=null&&!e.dead){e.dead=clock+1e9;burst(e.x,e.y-.4,'#b46aff',8,3);n++}
 sys('🌀 The Dark Portals collapse! The monsters they spawned crumble to dust. The portals will tear open again in 10 minutes…','#c9f');bigMsg('🌀 THE DARK PORTALS HAVE CLOSED\nPeace… for 10 minutes','#c9f')}
function reopenPortals(){PT.open=true;const w=E.find(e=>e.t==='wizard');if(w){w.dead=0;w.hp=w.mhp;w.x=w.hx;w.y=w.hy;w.p1=w.p2=0;w.st=0;w.nova=6}
 sys('🌀 The Dark Portals tear open again! The Dark Wizard has returned to his throne.','#f6f');bigMsg('🌀 THE DARK PORTALS REOPEN\nThe Dark Wizard has returned','#f6f');shakeT=2.5;shakeA=2;sfx('boss')}
function drawPortal(p){const px=p.x*T,py=p.y*T,o=PT.open,tt=clock;g.fillStyle='#0005';g.beginPath();g.ellipse(px+8,py+15,13,3.5,0,0,6.283);g.fill();
 if(o){g.fillStyle='rgba(150,60,255,'+(.22+.1*Math.sin(tt*3))+')';g.beginPath();g.ellipse(px+8,py-8,19,26,0,0,6.283);g.fill()}
 g.fillStyle='#3d3a46';g.fillRect(px-3,py-24,5,38);g.fillRect(px+14,py-24,5,38);g.fillRect(px-3,py-28,22,6);g.fillStyle='#262430';g.fillRect(px-2,py-24,1,38);g.fillRect(px+15,py-24,1,38);g.fillRect(px,py-27,16,1);
 g.fillStyle=o?'#12081e':'#1b1a20';g.fillRect(px+2,py-22,12,36);
 if(o){for(let i=0;i<7;i++){const y=py-20+((tt*18+i*13)%32),w=3+Math.sin(tt*4+i)*2.5;g.fillStyle='hsl('+(270+i*8)+',85%,'+(50+15*Math.sin(tt*3+i))+'%)';g.fillRect(px+8-w/2+Math.sin(tt*5+i*2)*3,y,w,2)}
  g.fillStyle='#d9a8ff';g.fillRect(px+7,py-30,2,2);if(Math.random()<.15)parts.push({x:p.x+.5,y:p.y-1.4,vx:rnd(-.4,.4),vy:rnd(-1.2,-.4),life:rnd(.5,1),c:'#c9f',sz:1})}
 else{g.fillStyle='#55525c';g.fillRect(px+3,py-20,2,6);g.fillRect(px+9,py-12,3,2)}}
