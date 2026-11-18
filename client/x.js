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
function trSync(){TR.my=0;TR.bot=0;netSend({t:'tu',items:TR.mine.map(i=>{const o={...i};delete o.u;delete o.src;return o}),gold:TR.mg})}
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
 h+=`<h3 style="margin-top:6px">Add from backpack</h3>`;P.inv.forEach((s,i)=>{const sl=ITEMS[s.id].slot;if(sl){if(!isEq(s)&&!me.includes(s))h+=xrow(s,'tri',i,'Offer')}else{const e=me.find(x=>x.src===s),k=e?e.n:0;if(k<s.n)h+=`<div class="row"><span style="font-size:22px">${ITEMS[s.id].e}</span><div style="flex:1;color:${RARC[s.rar|0]}">${nameOf(s)} ×${s.n-k}${k?'<div class="tip">offering '+k+'</div>':''}</div>${bt('trs',i+':1','+1')}${bt('trs',i+':a','All')}</div>`}});return h}
function trTake(){for(const e of TR.mine){if(e.src){const s=e.src;s.n-=e.n;const i=P.inv.indexOf(s);if(s.n<=0&&i>=0)P.inv.splice(i,1)}else{const i=P.inv.indexOf(e);if(i>=0)P.inv.splice(i,1)}}}
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
 if(a==='trs'&&TR){const [i,q]=String(v).split(':'),s=P.inv[+i];if(!s||ITEMS[s.id].slot)return true;let e=TR.mine.find(x=>x.src===s);if(!e){e={id:s.id,n:0,u:uid(),src:s};if(s.rar)e.rar=s.rar;TR.mine.push(e)}e.n=q==='a'?s.n:Math.min(s.n,e.n+1);TR.bot=0;if(TR.p2p)trSync();return true}
 if(a==='tri'){const s=P.inv[+v];if(s&&TR&&!TR.mine.includes(s)){TR.mine.push(s);TR.bot=0;if(TR.p2p)trSync()}return true}
 if(a==='trm'){TR.mine=TR.mine.filter(x=>x.u!=v);TR.bot=0;if(TR.p2p)trSync();return true}
 if(a==='trg'){TR.mg=v==='all'?P.gold:clamp(TR.mg+(+v),0,P.gold);TR.bot=0;if(TR.p2p)trSync();return true}
 if(a==='trp'){const m=trVal(TR.mine,TR.mg),t=trVal(TR.theirs,TR.tg),r=m/Math.max(1,t);if(r>=1){TR.bot=1;TR.msg='"Deal! Press Accept."'}else if(r>=.8){TR.bot=0;TR.msg=`"Add about ${Math.ceil(t*.98-m)}g more and we have a deal."`}else{TR.bot=0;TR.msg='"Not even close."'}return true}
 if(a==='tra'&&TR&&TR.p2p){if(TR.my)return true;const sp=P.inv.length+TR.theirs.length-TR.mine.filter(e=>!e.src||e.n>=e.src.n).length;if(sp>24)return toast('Not enough bag space','#f66'),true;if(TR.mg>P.gold)return toast('Not enough gold','#f66'),true;TR.my=1;netSend({t:'tk'});return true}
 if(a==='tra'){if(!TR.bot)return true;const sp=P.inv.length+TR.theirs.length-TR.mine.filter(e=>!e.src||e.n>=e.src.n).length;if(sp>24)return toast('Not enough bag space','#f66'),true;
  trTake();P.gold-=TR.mg;TR.b.gold+=TR.mg;TR.b.gold=Math.max(0,TR.b.gold-TR.tg);P.gold+=TR.tg;for(const s of TR.theirs)giveItem(s);
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
 const v=VIL.find(q=>q.name==='Dragonwatch')||VIL[VIL.length-1]||{x:CX-80,y:CY-80};let best=null;
 for(let r=VIL_R+4;r<VIL_R+12&&!best;r++)for(let a=0;a<6.283;a+=.1){const x=Math.round(v.x+Math.cos(a)*r),y=Math.round(v.y+Math.sin(a)*r),k=idx(x,y);if(inb(x,y+1)&&reach[k]&&!solid[k]&&!objAt.has(k)&&!solid[idx(x,y+1)]&&!objAt.has(idx(x,y+1))&&!safeAt(x,y)&&map[k]>=2&&map[k]<=8){best={x,y};break}}
 if(best){const g2={x:best.x,y:best.y,t:'gate',hp:1,dead:0,exit:false};objs.push(g2);objAt.set(idx(g2.x,g2.y),g2);solid[idx(g2.x,g2.y)]=1;GATE=g2;o.to={x:best.x+.5,y:best.y+1.5}}
 else o.to={x:CX+.5,y:CY+2.5};carveBigAll()}
function useGate(o){if(o.dg)return useBigGate(o);if(!o.exit){if(clock>gateArm){gateArm=clock+6;return toast('☠️ Dungeon of the Dark Wizard – deadly! Bring a party. Tap again to enter.','#c9f')}
  const R=DR()[0];tele(R[0]+7.5,R[1]+6.5);sys('☠️ You step into the Dungeon of the Dark Wizard…','#c9f');return}
 tele(o.to.x,o.to.y);sys('🌅 You escape the dungeon.','#9fe3ff')}
function tele(x,y){NET.tpT=1;stopAct();P.x=x;P.y=y;P.path=null;P.chase=null;cam.x=x;cam.y=y;burst(x,y-.4,'#b46aff',26,5);fxs.push({k:'ring',x,y,r:2,life:.6,max:.6,c:'#b46aff'});sfx('lvl')}
function dunMob(t,x,y,dep){const e=mkEnemy(t,x,y);e.el='elite';e.dun=1;e.mhp=e.hp=Math.round(ESPEC[t].hp*(3.2+dep*.5));e.dm=1.4+dep*.12;e.xm=4;e.sc=1.2;return e}
function spawnDungeon(){const R=DR(),T4=[['skeleton','ogre'],['wraith','golem'],['troll','golem','ogre'],['demon','troll']];
 for(let i=1;i<=4;i++){const [rx,ry,rw,rh]=R[i];let n=0,tr=0;while(n<3&&tr++<200){const cx=rx+ri(2,rw-3),cy=ry+ri(2,rh-3);if(solid[idx(cx,cy)])continue;const t=pick(T4[i-1]);for(let m=0;m<3;m++){const x=cx+(m-1)*.9,y=cy+(m%2)*.7;if(solid[idx(Math.floor(x),Math.floor(y))])continue;E.push(dunMob(t,x+.5,y+.5,i))}n++}}
 const [bx,by,bw,bh]=R[5],w=mkEnemy('wizard',bx+bw-4+.5,by+bh/2+.5);w.el='lord';w.dun=1;w.sc=1.6;w.hx=w.x;w.hy=w.y;E.push(w);
 for(const [dx,dy] of [[-4,-5],[-4,5]]){const e=dunMob('demon',w.x+dx,w.y+dy,5);E.push(e)}
 spawnBigDungeons()}
function megaLoot(rar){const s=addItem(pick(ENDGAME));if(!s)return;rollGear(s,'smith',true);s.rar=Math.max(s.rar|0,rar);if(rar>=2&&!s.ench)rollGear(Object.assign(s,{}),'smith',true),s.rar=Math.max(s.rar|0,rar);announceGear(s,'Looted');sys('🎁 Dungeon loot: '+nameOf(s),RARC[s.rar|0])}
function dunKill(e){if(e.mb)return mbLoot(e);if(e.t==='wizard')closePortals();if(e.el==='elite'){if(Math.random()<.45)megaLoot(Math.random()<.04?3:Math.random()<.2?2:1);if(Math.random()<.3){addItem('gem');fl(e.x,e.y-1,'💎','#fff')}if(Math.random()<.3)addItem(pick(['hpotion','potion']),2)}
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
/* per-town tunes + extra combat tracks (original, synthesized) */
{const V=[[72,0,76,0,79,0,76,0,74,0,77,0,81,0,0,0,79,0,76,0,72,0,74,0,76,0,0,0,0,0,0,0],[67,0,71,0,74,0,71,0,69,0,72,0,76,0,0,0,74,0,71,0,67,0,69,0,71,0,0,0,0,0,0,0],[64,0,67,0,71,0,74,0,72,0,71,0,69,0,0,0,67,0,69,0,71,0,69,0,67,0,0,0,0,0,0,0],[69,0,72,0,76,0,74,0,72,0,69,0,71,0,0,0,72,0,74,0,76,0,81,0,79,0,0,0,0,0,0,0],[74,0,77,0,81,0,77,0,76,0,74,0,72,0,0,0,69,0,72,0,74,0,72,0,74,0,0,0,0,0,0,0]];
 const R=[[48,53,55,48],[43,48,50,43],[40,45,47,40],[45,41,43,45],[50,55,57,50]],B=[84,100,76,112,88],W=['triangle','sine','triangle','square','triangle'];
 for(let i=0;i<6;i++){const j=i%5;MUS['v'+i]={bpm:B[j],lead:V[j],roots:R[j],arp:[0,4,7,12],lw:W[j],lv:.05,bv:.05}}
 MUS.f0=MUS.fight;
 MUS.f1={bpm:172,lead:[69,69,0,72,69,0,76,74,72,0,72,69,67,0,69,0,65,65,0,69,65,0,72,71,69,0,67,65,64,0,0,0],roots:[45,43,41,40],arp:[0,3,7,0],lw:'sawtooth',lv:.03,bv:.07,hat:1};
 MUS.f2={bpm:148,lead:[76,0,76,0,79,76,0,74,72,0,72,0,74,72,0,71,69,0,72,0,76,0,79,0,77,76,74,0,72,0,0,0],roots:[40,45,43,38],arp:[0,7,12,7],lw:'square',lv:.034,bv:.06,hat:1};
 MUS.f3={bpm:184,lead:[57,57,69,57,57,67,57,65,57,57,64,57,62,0,60,0,56,56,68,56,56,66,56,64,56,56,62,56,60,0,59,0],roots:[33,33,32,31],arp:[0,0,6,0],lw:'sawtooth',lv:.04,bv:.08,hat:1}}
let musFi=0,musPrev=null;
let musMode=null,musStep=0,musNext=0,musFightT=0,noiseBuf=null,musCheck=0;
let MG=null;const mout=()=>{if(!MG||MG.context!==AC){MG=AC.createGain();MG.gain.value=VOL.mus;MG.connect(AC.destination)}return MG};
function mfade(){if(!AC)return;const g=mout().gain,t=AC.currentTime;g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);g.linearRampToValueAtTime(.05,t+.2);g.linearRampToValueAtTime(VOL.mus,t+.9)}
function mtone(f,t,d,ty,v){const o=AC.createOscillator(),gn=AC.createGain();o.type=ty;o.frequency.value=f;gn.gain.setValueAtTime(v,t);gn.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(gn);gn.connect(mout());o.start(t);o.stop(t+d+.02)}
function mhat(t,v){if(!noiseBuf){noiseBuf=AC.createBuffer(1,AC.sampleRate*.05,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}const s=AC.createBufferSource(),gn=AC.createGain();s.buffer=noiseBuf;gn.gain.setValueAtTime(v,t);gn.gain.exponentialRampToValueAtTime(.0001,t+.04);s.connect(gn);gn.connect(mout());s.start(t)}

/* medieval tracks (original compositions, synthesized) */
function ptone(f,t,d,ty,v,at,cut){const o=AC.createOscillator(),gn=AC.createGain(),fl=AC.createBiquadFilter();o.type=ty;o.frequency.value=f;fl.type='lowpass';fl.frequency.value=cut||2400;gn.gain.setValueAtTime(.0001,t);gn.gain.linearRampToValueAtTime(v,t+(at||.01));gn.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(fl);fl.connect(gn);gn.connect(mout());o.start(t);o.stop(t+d+.05);return o}
function mdrum(t,k){if(k==='k'){const o=AC.createOscillator(),gn=AC.createGain();o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(45,t+.14);gn.gain.setValueAtTime(.16,t);gn.gain.exponentialRampToValueAtTime(.0001,t+.18);o.connect(gn);gn.connect(mout());o.start(t);o.stop(t+.2)}else mhat(t,.07)}
const MED={
 tavern:{n:'Tavern Dance',bpm:156,lead:[74,0,72,74,76,0,74,72,71,0,69,71,72,0,71,69,67,69,71,72,74,0,76,0,74,72,71,69,69,0,0,0],roots:[50,50,55,45],lw:'triangle',lv:.07,cut:2600,pl:1},
 cloister:{n:'Cloister Hymn',bpm:54,lead:[69,0,0,0,72,0,0,0,74,0,0,0,72,0,0,0,69,0,0,0,67,0,0,0,69,0,0,0,0,0,0,0],roots:[45,41,43,45],lw:'sine',lv:.06,cut:1800,pad:1,vib:1},
 march:{n:"Knight's March",bpm:104,lead:[64,0,64,67,71,0,69,67,64,0,64,67,72,0,71,69,67,0,67,71,74,0,72,71,69,67,66,64,64,0,0,0],roots:[40,40,43,38],lw:'sawtooth',lv:.035,cut:1500,drum:1}};
const MEDK=['tavern','cloister','march'];let medMode=null,medStep=0,medNext=0;
function medTick(k){const M=MED[k];if(medMode!==k){medMode=k;medStep=0;medNext=AC.currentTime+.08}const sd=60/M.bpm/2;
 while(medNext<AC.currentTime+.3){const s=medStep%32,bar=(s>>3)%4,n=M.lead[s],t=medNext;
  if(n){const o=ptone(NOTE(n),t,sd*(M.pad?7:1.7),M.lw,M.lv,M.pad?.18:.012,M.cut);if(M.vib){const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=5;lg.gain.value=5;l.connect(lg);lg.connect(o.frequency);l.start(t);l.stop(t+sd*7)}}
  if(s%8===0)ptone(NOTE(M.roots[bar]-12),t,sd*(M.pad?7.5:3.6),'sawtooth',.05,.05,380);
  if(M.pad&&s%8===0){ptone(NOTE(M.roots[bar]+7),t,sd*7.5,'sine',.035,.4,1200);ptone(NOTE(M.roots[bar]+12),t,sd*7.5,'sine',.03,.4,1200)}
  if(M.pl&&s%2===0){const a=[0,7,12,7][(s>>1)%4];ptone(NOTE(M.roots[bar]+12+a),t,sd*1.2,'triangle',.05,.004,3200)}
  if(M.drum){if(s%4===0)mdrum(t,'k');if(s%8===4)mdrum(t,'s');if(s%2===1&&s%4!==3)mhat(t,.02)}
  medNext+=sd;medStep++}}
function musArea(){let b=Math.hypot(P.x-CX,P.y-CY),k=0;VIL.forEach((v,i)=>{const d=Math.hypot(P.x-v.x,P.y-v.y);if(d<b){b=d;k=i+1}});return Math.min(k,5)}
function musPick(){if(!P||P.dead)return null;const R=DR();
 const any=E.some(e=>!e.dead&&e.st===1&&!ESPEC[e.t].pass&&Math.hypot(e.x-P.x,e.y-P.y)<12);if(any)musFightT=clock+6;
 const inD=P.x<DUN.x0+DUN.w+6&&P.y<DUN.y0+DUN.h+6&&P.x>DUN.x0-5&&P.y>DUN.y0-5,hard=inWiz||inD||E.some(e=>!e.dead&&e.st===1&&(e.t==='wyrm'||e.t==='wizard'||e.t==='demon'));
 if(inWiz||clock<musFightT){if(musPrev!=='f'){musFi=hard?(Math.random()<.6?3:ri(0,3)):ri(0,2)}musPrev='f';return'f'+musFi}musPrev=null;
 return null}
function medPick(){if(!P||P.dead||P.inside)return null;if(shopSt)return'tavern';return'cloister'}
function musTick(){if(!P||muted||P.music===false||!AC||AC.state!=='running')return;if(P.mtrack&&MED[P.mtrack]&&!P.dead){musMode=null;medTick(P.mtrack);return}const m=musPick();if(!m){const k=medPick();if(musMode){mfade();musMode=null}if(k)medTick(k);else medMode=null;return}medMode=null;if(m!==musMode){if(musMode)mfade();musMode=m;musStep=0;musNext=AC.currentTime+.08}if(!m)return;const M=MUS[m],sd=60/M.bpm/2;
 while(musNext<AC.currentTime+.3){const s=musStep%32,bar=(s>>3)%4,n=M.lead[s],t=musNext;
  if(n)mtone(NOTE(n),t,sd*1.8,M.lw,M.lv);
  if(s%8===0||s%8===4)mtone(NOTE(M.roots[bar]+(s%8===4?7:0)),t,sd*3,'triangle',M.bv);
  if(m[0]==='f'&&s%2===0)mtone(NOTE(M.roots[bar]),t,sd*.8,'square',.03);
  if(s%2===1){const a=M.arp[(s>>1)%4];mtone(NOTE(M.roots[bar]+24+a),t,sd*.9,'square',.012)}
  if(M.hat&&s%2===1)mhat(t,.03);
  musNext+=sd;musStep++}}
setInterval(()=>{try{musTick()}catch(e){}},90);
addEventListener('pointerdown',()=>{try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume()}catch(e){}});
function optHtml(){return `<div class="row"><span style="flex:1">🩸 Gore</span>${bt('opt','gore',goreOn()?'ON':'OFF')}</div><div class="row"><span style="flex:1">🎵 Music</span>${bt('opt','music',P.music===false?'OFF':'ON')}</div><div class="row"><span style="flex:1">🔊 SFX</span><input type=range min=0 max=100 value=${Math.round(VOL.sfx*100)} style="width:110px" oninput="setVol('sfx',this.value)" onchange="SFX.hit()"></div><div class="row"><span style="flex:1">🎵 Music vol</span><input type=range min=0 max=100 value=${Math.round(VOL.mus*100)} style="width:110px" oninput="setVol('mus',this.value)"></div><div class="row"><span style="flex:1">🎼 Track</span>${bt('opt','track',P.mtrack&&MED[P.mtrack]?MED[P.mtrack].n:'Auto (chiptune)')}</div><div class="row"><span style="flex:1">🎨 Art Pack (offline)</span>${bt('opt','art',ART.pref?'ON':'OFF')}</div><div class="row"><span style="flex:1">📱 Low-detail (weak phones)</span>${bt('opt','low',lowOn()?'ON':'OFF')}</div><div class="row"><span style="flex:1">❓ Tutorial</span>${bt('opt','tut','Show')}</div><div class="row"><span style="flex:1">🏆 Hall of Heroes</span>${bt('board',0,'Open')}</div><div class="tip">Tap 🔊 (top bar) to mute everything. DEV button = test mode.</div>`}
function realXp(){return P.dev&&P.devBak?P.devBak:P.xp}
function calcScore(){const xp=realXp(),tl=SK.reduce((s,x)=>s+lvOf(xp[x[0]]),0),pk=P.pvpK|0,mk=Math.max(0,(P.kills|0)-pk);return{tl,mk,pk,pd:P.pvpD|0,d:P.deaths|0,gold:P.gold+(P.bank?P.bank.gold:0),wiz:P.wiz|0,score:Math.max(0,Math.round(tl*100+mk*3+pk*75-(P.pvpD|0)*30-(P.deaths|0)*5+(P.gold+(P.bank?P.bank.gold:0))/20+(P.wiz|0)*5000))}}
function dollURL(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.imageSmoothingEnabled=false;const old=g;g=x;try{x.setTransform(4,0,0,4,0,0);drawChar(0,0,0,0,(eqTint().ta?shade(eqTint().ta,.7):ARMC[armLv(eqId('a'))]),'#3a2a1a',{wid:eqId('w'),tw:eqTint().tw,ta:eqTint().ta,arm:armLv(eqId('a')),helm:eqTier('h'),boots:eqTier('b')})}finally{g=old}return c.toDataURL()}
const BKEY='emberfall.board';
function loadBoard(){if(NET.on)return NET.board;try{return JSON.parse(localStorage.getItem(BKEY)||'[]')}catch(e){return[]}}
function addBoard(){const s=calcScore(),b=loadBoard(),ent={name:P.name,img:dollURL(),when:Date.now(),...s},i=b.findIndex(x=>x.name===P.name);if(i>=0){ent.wiz=Math.max(ent.wiz,b[i].wiz|0);if(b[i].score>ent.score)ent.score=b[i].score;b[i]=ent}else b.push(ent);b.sort((a,c)=>c.score-a.score);if(NET.on)netPostBoard(ent);else try{localStorage.setItem(BKEY,JSON.stringify(b.slice(0,50)))}catch(e){}sys(`🏆 ${P.name} is inscribed in the Hall of Heroes with ${ent.score} points!`,'#ffd34a');bigMsg('🏆 '+P.name+' slew the Dark Wizard!\n'+ent.score+' points','#ffd34a')}
function boardHtml(){const b=loadBoard(),me=calcScore();let h=hdr('🏆 Hall of Heroes')+`<div class="tip" style="font-size:13px;opacity:1">🌀 Dark Portals: ${PT.open?'<b style="color:#c6f">OPEN</b> – slay the Dark Wizard to close them':'closed for '+Math.ceil((PT.reopen-clock)/60)+' more min'}</div><div class="tip" style="font-size:13px;opacity:1">Slayers of Malachar, the Dark Wizard. Score = levels, kills, PvP, gold. Your score now: <b>${me.score}</b></div>`;
 if(!b.length)h+='<div class="tip">No one has slain the Dark Wizard yet…</div>';
 b.forEach((e,i)=>{h+=`<div class="row"><b style="width:22px">${i+1}</b><img src="${e.img}" width="48" height="48" style="image-rendering:pixelated;background:#0003;border-radius:6px"><div style="flex:1"><b>${e.name}</b> · <span style="color:#ffd34a">${e.score}</span><div class="tip">Lv ${e.tl} · ⚔${e.mk} kills · 🩸${e.pk} PvP (☠${e.pd}) · 💀${e.d} · 💰${e.gold} · 🐉×${e.wiz}<br>${new Date(e.when).toLocaleDateString()}</div></div></div>`});return h}
const _xAct=xAct;xAct=function(a,v){if(a==='board'){openPanel('board');if(NET.on)netBoard();return true}if(a==='opt'){if(v==='art'){artToggle(!ART.pref);resize();toast(ART.pref?'🎨 Art Pack ON (offline play)':'Art Pack OFF')}else if(v==='low'){try{localStorage.setItem('dp.low',lowOn()?'0':'1')}catch(e){}resize();toast(lowOn()?'📱 Low-detail ON':'Low-detail OFF')}else if(v==='tut'){tutShow()}else if(v==='gore')P.gore=!goreOn();else if(v==='track'){const i=MEDK.indexOf(P.mtrack);P.mtrack=i<0?MEDK[0]:(i+1<MEDK.length?MEDK[i+1]:null);medMode=null;P.music=true}else{P.music=P.music===false;musMode=null}return true}return _xAct(a,v)};

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

/* ---------- v0.6.6: big dungeons (generator, traps, secret walls, mini-bosses) ---------- */
const DUNX=[
 {id:'crypt',name:'Sunken Crypts',x0:130,y0:8,w:125,h:56,seed:11,tier:1,gate:'Gloomspire',mobs:['zombie','ghoul','mummy','skeleton_knight','ghost','cultist','wisp'],mini:[['mummy','Pharaoh Anhotep'],['ghoul','Gravewarden Mol'],['lich','Vorgath the Undying']],seal:'seal1'},
 {id:'frost',name:'Frostbound Vault',x0:8,y0:362,w:115,h:50,seed:23,tier:2,gate:'Mistfall',mobs:['yeti','ice_golem','frost_spider','snow_wolf','ice_bat','polar_bear','frost_giant'],mini:[['yeti','Old Rimefang'],['frost_giant','Jarl Skaldir'],['ice_wyrm','Glaciax the Frozen']],seal:'seal2'},
 {id:'forge',name:'Ashen Forge',x0:300,y0:362,w:112,h:50,seed:37,tier:3,gate:'Cinderhold',mobs:['fire_giant','lava_golem','lava_hound','imp','fire_bat','phoenix','crystal_golem'],mini:[['lava_golem','Slagheart'],['fire_giant','Surtha the Burning'],['lava_drake','Pyroclast the Drake']],seal:'seal3'},
 {id:'citadel',name:"The Wyrm's Citadel",x0:262,y0:8,w:150,h:56,seed:53,tier:4,gate:'Frostmere',citadel:1,mobs:['demon','lich','shadow_drake','lava_golem','ghost','fire_giant','iron_golem','ice_wyrm'],mini:[['lich','Archlich Morwen'],['demon','Doomlord Azhar'],['dragon','The Ashen Wyrm']]}
];
const DG=[],HAZ=[],SECR=[];
function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function dunXAt(x,y){for(const d of DG)if(x>=d.x0-2&&x<=d.x0+d.w+2&&y>=d.y0-2&&y<=d.y0+d.h+2)return d;return null}
function carveBig(def){
 const R=rng(def.seed*7919+SEED),ri2=(a,b)=>a+Math.floor(R()*(b-a+1)),X0=def.x0,Y0=def.y0,X1=X0+def.w,Y1=Y0+def.h;
 for(let y=Y0-5;y<=Y1+5;y++)for(let x=X0-5;x<=X1+5;x++){if(!inb(x,y))continue;const k=idx(x,y);map[k]=TL.WALL;solid[k]=1;reach[k]=0;objAt.delete(k)}
 for(let i=objs.length-1;i>=0;i--){const o=objs[i];if(o.x>=X0-5&&o.x<=X1+5&&o.y>=Y0-5&&o.y<=Y1+5)objs.splice(i,1)}
 const fl=(x,y,w,h)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++){if(x+i<X0||x+i>X1||y+j<Y0||y+j>Y1)continue;const k=idx(x+i,y+j);map[k]=TL.DARK;solid[k]=0}};
 const CW=18,CH=16,cols=Math.floor(def.w/CW),rows=Math.floor(def.h/CH),rooms=[],grid=[];
 for(let r=0;r<rows;r++){grid.push([]);for(let c=0;c<cols;c++){const w=ri2(9,CW-4),h=ri2(7,CH-4),x=X0+c*CW+2+ri2(0,CW-w-4),y=Y0+r*CH+2+ri2(0,CH-h-4);const rm={x,y,w,h,cx:x+(w>>1),cy:y+(h>>1),c,r,d:-1,nb:[]};fl(x,y,w,h);rooms.push(rm);grid[r].push(rm)}}
 const link=(a,b)=>{if(a.nb.includes(b))return;a.nb.push(b);b.nb.push(a);const wd=def.citadel?3:2;
  const hx0=Math.min(a.cx,b.cx),hx1=Math.max(a.cx,b.cx);fl(hx0,a.cy,hx1-hx0+wd,wd);fl(b.cx,Math.min(a.cy,b.cy),wd,Math.abs(a.cy-b.cy)+wd)};
 {const start=grid[rows>>1][0],seen=new Set([start]),st=[start];while(st.length){const a=st[st.length-1],ops=[[0,1],[1,0],[0,-1],[-1,0]].map(([dc,dr])=>grid[a.r+dr]&&grid[a.r+dr][a.c+dc]).filter(b=>b&&!seen.has(b));if(!ops.length){st.pop();continue}const b=ops[Math.floor(R()*ops.length)];seen.add(b);link(a,b);st.push(b)}
  for(const a of rooms)for(const [dc,dr] of [[1,0],[0,1]]){const b=grid[a.r+dr]&&grid[a.r+dr][a.c+dc];if(b&&R()<.3)link(a,b)}
  start.d=0;const q=[start];for(let i=0;i<q.length;i++){const a=q[i];for(const b of a.nb)if(b.d<0){b.d=a.d+1;q.push(b)}}
  def.start=start}
 def.rooms=rooms;const byD=[...rooms].sort((a,b)=>b.d-a.d);def.boss=byD[0];def.minis=[byD[2],byD[Math.min(5,byD.length-1)]];
 // pillars
 for(const rm of rooms)if(rm.w>=11&&rm.h>=9)for(const [px,py] of [[3,3],[rm.w-4,3],[3,rm.h-4],[rm.w-4,rm.h-4]]){const k=idx(rm.x+px,rm.y+py);map[k]=TL.WALL;solid[k]=1}
 // secret closets behind cracked (illusory) walls
 let ns=0,tr=0;const nWant=3+def.tier*2;
 while(ns<nWant&&tr++<400){const rm=rooms[ri2(0,rooms.length-1)];if(rm===def.start)continue;const side=ri2(0,3);let cx,cy,px,py;
  if(side===0){px=rm.x+ri2(2,rm.w-3);py=rm.y-1;cx=px-1;cy=py-5}else if(side===1){px=rm.x+ri2(2,rm.w-3);py=rm.y+rm.h;cx=px-1;cy=py+1}else if(side===2){px=rm.x-1;py=rm.y+ri2(2,rm.h-3);cx=px-5;cy=py-1}else{px=rm.x+rm.w;py=rm.y+ri2(2,rm.h-3);cx=px+1;cy=py-1}
  let ok=true;for(let j=-1;j<=4&&ok;j++)for(let i=-1;i<=4;i++){const xx=cx+i,yy=cy+j;if(xx<X0+1||xx>X1-1||yy<Y0+1||yy>Y1-1||map[idx(xx,yy)]!==TL.WALL){ok=false;break}}
  if(!ok||map[idx(px,py)]!==TL.WALL)continue;
  fl(cx,cy,4,4);const sx=side===0||side===1?px:px,sy=py;
  // illusory passage: tiles look like wall but can be walked through
  const pas=[];if(side<2){for(let yy=Math.min(py,side===0?cy+3:cy);yy<=Math.max(py,side===0?cy+3:cy);yy++)pas.push([px,yy])}else{for(let xx=Math.min(px,side===2?cx+3:cx);xx<=Math.max(px,side===2?cx+3:cx);xx++)pas.push([xx,py])}
  for(const [a,b] of pas){if(map[idx(a,b)]===TL.WALL){solid[idx(a,b)]=0;SECR.push({x:a,y:b,dg:def.id})}}
  // make sure the closet inner tile that touches passage is floor
  const chx=cx+1+(R()<.5?1:0),chy=cy+1+(R()<.5?1:0),o={x:chx,y:chy,t:'chest',hp:1,dead:0,tier:def.tier};objs.push(o);objAt.set(idx(o.x,o.y),o);solid[idx(o.x,o.y)]=1;ns++}
 // traps
 for(const rm of rooms){if(rm===def.start)continue;const n=ri2(1,2+def.tier>>1);for(let i=0;i<n;i++){const kinds=['spike','spike','fire','gas','dart','tele'];const k=kinds[ri2(0,kinds.length-1)],x=rm.x+ri2(2,rm.w-3)+.5,y=rm.y+ri2(2,rm.h-3)+.5;if(solid[idx(Math.floor(x),Math.floor(y))])continue;
   const h={k,x,y,dg:def.id,o:R()*10,rm,dm:40+def.tier*45,seen:new Map()};
   if(k==='spike'){h.r=1.3;h.cy=3.4;h.warn=1;h.act=.5}else if(k==='fire'){h.r=1.2;h.cy=5;h.warn=1.3;h.act=1.1;h.dm*=1.4}else if(k==='gas'){h.r=2.4}else if(k==='tele'){h.r=.7}else if(k==='dart'){h.r=0;h.t=R()*3;h.dir=ri2(0,3);h.x=rm.x+.5;h.y=rm.y+ri2(2,rm.h-3)+.5;if(h.dir===0){h.x=rm.x+ri2(2,rm.w-3)+.5;h.y=rm.y+.5}else if(h.dir===1){h.x=rm.x+ri2(2,rm.w-3)+.5;h.y=rm.y+rm.h-.5}else if(h.dir===2){h.x=rm.x+.5;h.y=rm.y+ri2(2,rm.h-3)+.5}else{h.x=rm.x+rm.w-.5;h.y=rm.y+ri2(2,rm.h-3)+.5}}
   HAZ.push(h)}}
 DG.push(def);
 // exit gate inside the entrance room
 const s=def.start,eg={x:s.x+1,y:s.y+(s.h>>1),t:'gate',hp:1,dead:0,exit:true,dg:def.id};objs.push(eg);objAt.set(idx(eg.x,eg.y),eg);solid[idx(eg.x,eg.y)]=1;def.exitGate=eg;
 // outside gate near the named town
 const v=VIL.find(v=>v.name===def.gate)||VIL[0];let best=null;
 for(let r=VIL_R+3;r<VIL_R+14&&!best;r++)for(let a=0;a<6.283;a+=.1){const px=Math.round(v.x+Math.cos(a)*r),py=Math.round(v.y+Math.sin(a)*r),k=idx(px,py);if(inb(px,py+1)&&reach[k]&&!solid[k]&&!objAt.has(k)&&!solid[idx(px,py+1)]&&!objAt.has(idx(px,py+1))&&!safeAt(px,py)&&map[k]>=2&&map[k]<=8){best={x:px,y:py};break}}
 if(!best)best={x:v.x+VIL_R+2,y:v.y};
 const g2={x:best.x,y:best.y,t:'gate',hp:1,dead:0,exit:false,dg:def.id};objs.push(g2);objAt.set(idx(g2.x,g2.y),g2);solid[idx(g2.x,g2.y)]=1;eg.to={x:best.x+.5,y:best.y+1.5};def.gateObj=g2}
function carveBigAll(){for(const d of DUNX)carveBig(d)}
function useBigGate(o){const d=DG.find(q=>q.id===o.dg);if(!d)return;
 if(o.exit){tele(o.to.x,o.to.y);sys('🌅 You escape '+d.name+'.','#9fe3ff');return}
 if(d.citadel&&!(count('seal1')&&count('seal2')&&count('seal3'))){return toast('🔒 The Citadel gate is sealed. Bring the Crypt, Frost and Forge Seals (from the three big dungeons).','#f96')}
 if(clock>gateArm){gateArm=clock+6;return toast('☠️ '+d.name+' – deadly! Traps, secrets and bosses. Bring a party. Tap again to enter.','#c9f')}
 tele(d.start.cx+.5,d.start.cy+.5);sys('☠️ You enter '+d.name+'…','#c9f')}
function bigMob(t,x,y,dep,boss){const e=mkEnemy(t,x,y);e.dun=1;if(boss){e.el='boss';e.mb=1;e.mhp=e.hp=Math.round(ESPEC[t].hp*boss);e.dm=2+dep*.1;e.xm=15;e.sc=1.6}else{e.el='elite';e.mhp=e.hp=Math.round(ESPEC[t].hp*(2.2+dep*.45));e.dm=1.2+dep*.1;e.xm=4;e.sc=1.15}return e}
function spawnBigDungeons(){for(const d of DG){const dep0=d.tier*1.4;let rn=0;
  for(const rm of d.rooms){if(rm===d.start)continue;rn++;if(rm===d.boss||d.minis.includes(rm))continue;const grp=ri(2,3+(d.tier>>1)),t=pick(d.mobs);for(let m=0;m<grp;m++){const x=rm.x+ri(2,rm.w-3)+.5,y=rm.y+ri(2,rm.h-3)+.5;if(solid[idx(Math.floor(x),Math.floor(y))])continue;E.push(bigMob(t,x,y,dep0+rm.d*.12))}}
  d.minis.forEach((rm,i)=>{const [t,nm]=d.mini[i],e=bigMob(t,rm.cx+.5,rm.cy+.5,dep0+rm.d*.12,5+d.tier*2);e.nm=nm;e.hx=e.x;e.hy=e.y;e.mbI=i;e.dgid=d.id;E.push(e)});
  {const [t,nm]=d.mini[2],rm=d.boss,e=bigMob(t,rm.cx+.5,rm.cy+.5,dep0+rm.d*.12,12+d.tier*4);e.nm=nm;e.hx=e.x;e.hy=e.y;e.mbI=2;e.dgid=d.id;e.sc=2;E.push(e);
   for(const [dx,dy] of [[-3,-3],[3,-3],[-3,3],[3,3]]){const m=bigMob(pick(d.mobs),rm.cx+dx+.5,rm.cy+dy+.5,dep0+rm.d*.12);E.push(m)}}}}
function mbLoot(e){const d=DG.find(q=>q.id===e.dgid)||{tier:2},tr=d.tier,fin=e.mbI===2;
 const g=ri(300,700)*(tr+(fin?2:0));P.gold+=g;fl(e.x,e.y-1.2,'+'+g+'g','#ffd36b');
 for(let i=0;i<(fin?3:1)+tr;i++){if(Math.random()<.6)addItem('gem');else addItem('essence',ri(2,4))}if(tr>=2)addItem('scale',ri(1,2+(fin?3:0)));
 for(let i=0;i<(fin?3:1);i++)megaLoot(Math.random()<(fin?.35:.15)?2:1);
 if(fin&&d.seal){addItem(d.seal);sys('🗝️ You found the '+ITEMS[d.seal].n+'!','#ffd36b')}
 toast('☠️ '+(e.nm||'Boss')+' slain!','#ffd36b')}
function chestOpen(o){if(o.dead)return;o.dead=clock+900;const tr=o.tier||1;sfx('pick');burst(o.x+.5,o.y,'#ffd36b',16,4);
 const g=ri(150,450)*tr;P.gold+=g;fl(o.x+.5,o.y-.6,'+'+g+'g','#ffd36b');
 if(Math.random()<.7)addItem('gem');addItem('essence',ri(1,3));addItem('hpotion',ri(1,3));if(tr>=2&&Math.random()<.5)addItem('scale');if(Math.random()<.5)megaLoot(Math.random()<.15?2:1);
 toast('🎁 Treasure chest!','#ffd36b')}
/* traps */
const hazActors=()=>typeof SRV!=='undefined'&&SRV.players?[...SRV.players.values()].filter(p=>p.ready&&!p.dead&&!p.inside):(P&&!P.dead&&!P.inside&&!shopSt?[P]:[]);
function hzHit(p,d,fx,x,y){if(typeof SRV!=='undefined'&&SRV.hits){SRV.hits.push({to:p.id,d:fx==='tp'?0:Math.max(1,Math.round(d)),fx,x,y});return}if(NET.sim)return;if(fx==='tp'){tele(x,y);return}playerHit(d);if(fx)playerFx(fx)}
const hzPh=h=>{const t=Date.now()/1000+h.o,ci=Math.floor(t/h.cy),ph=t%h.cy;return{ci,st:ph<h.warn?1:ph<h.warn+h.act?2:0,ph}};
function hazTick(dt){if(!HAZ.length)return;const A=hazActors();if(!A.length)return;
 for(const h of HAZ){let near=null;for(const p of A)if(Math.abs(p.x-h.x)<16&&Math.abs(p.y-h.y)<16){near=1;break}if(!near)continue;
  if(h.k==='dart'){h.t-=dt;if(h.t<=0){h.t=2.4;if(!NET.sim){const v=[[0,1],[0,-1],[1,0],[-1,0]][h.dir];proj.push({x:h.x,y:h.y,vx:v[0]*6,vy:v[1]*6,dmg:Math.round(h.dm*.7),life:3.4,own:'e'})}}continue}
  for(const p of A){const d=Math.hypot(p.x-h.x,p.y-h.y);if(d>h.r+.3)continue;
   if(h.k==='spike'||h.k==='fire'){const s=hzPh(h);if(s.st===2&&h.seen.get(p.id||'p')!==s.ci){h.seen.set(p.id||'p',s.ci);hzHit(p,h.dm,h.k==='fire'?'psn':null)}}
   else if(h.k==='gas'){const k=(p.id||'p')+'g',n=Date.now();if(n-(h.seen.get(k)||0)>1000){h.seen.set(k,n);hzHit(p,1,'psn')}}
   else if(h.k==='tele'){const k=(p.id||'p')+'t',n=Date.now();if(n-(h.seen.get(k)||0)>4000){h.seen.set(k,n);const d2=DG.find(q=>q.id===h.dg),o=pick(d2.rooms.filter(r=>r!==h.rm&&r!==d2.boss));if(o)hzHit(p,0,'tp',o.cx+.5,o.cy+.5)}}}}}
function hazDraw(R,vis){for(const h of HAZ){if(!vis(h.x,h.y))continue;R.push([h.y*T-6,()=>{const px=h.x*T,py=h.y*T,t=Date.now()/1000;
  if(h.k==='spike'||h.k==='fire'){const s=hzPh(h),fire=h.k==='fire',r=h.r*T;g.fillStyle='#0006';g.beginPath();g.ellipse(px,py,r*.8,r*.5,0,0,6.3);g.fill();g.strokeStyle=fire?'#6a3a1a':'#555';g.lineWidth=1;g.beginPath();g.ellipse(px,py,r*.8,r*.5,0,0,6.3);g.stroke();
   if(s.st===1){g.fillStyle=`rgba(255,${fire?120:60},40,${.25+.25*Math.sin(t*14)})`;g.beginPath();g.ellipse(px,py,r*.85,r*.55,0,0,6.3);g.fill()}
   else if(s.st===2){if(fire){for(let i=0;i<7;i++){const a=i*.9+t*6;g.fillStyle=i%2?'#ffb02a':'#ff4a1a';g.fillRect(px+Math.cos(a)*r*.5-2,py-6-Math.abs(Math.sin(a*2+t*9))*12,4,10)}}else{for(let i=0;i<5;i++){const a=i*1.26;g.fillStyle='#cfd2d8';const sx=px+Math.cos(a)*r*.45,sy=py+Math.sin(a)*r*.3;g.beginPath();g.moveTo(sx-2,sy);g.lineTo(sx,sy-10);g.lineTo(sx+2,sy);g.fill()}}}}
  else if(h.k==='gas'){for(let i=0;i<5;i++){const a=t*.6+i*1.3,rr=h.r*T*(.35+.25*Math.sin(t+i));g.fillStyle='rgba(110,220,80,.16)';g.beginPath();g.arc(px+Math.cos(a)*h.r*T*.4,py+Math.sin(a*1.2)*h.r*T*.3,rr,0,6.3);g.fill()}}
  else if(h.k==='tele'){g.strokeStyle=`rgba(190,110,255,${.5+.4*Math.sin(t*4)})`;g.lineWidth=2;for(let i=0;i<3;i++){g.beginPath();g.ellipse(px,py,5+i*3+Math.sin(t*3+i)*1.5,3+i*2,t+i,0,6.3);g.stroke()}}
  else if(h.k==='dart'){g.fillStyle='#222';const v=[[0,-1],[0,1],[-1,0],[1,0]][h.dir];g.fillRect(px-3+v[0]*5,py-2+v[1]*5,6,4);g.fillStyle='#a33';g.fillRect(px-1+v[0]*5,py+v[1]*5,2,2)}}])}
  for(const s of SECR){if(!vis(s.x,s.y)||Math.hypot(s.x+.5-P.x,s.y+.5-P.y)>3.2)continue;R.push([s.y*T+17,()=>{g.strokeStyle='rgba(255,255,255,'+(.15+.1*Math.sin(Date.now()/300))+')';g.lineWidth=1;const px=s.x*T,py=s.y*T;g.beginPath();g.moveTo(px+3,py+2);g.lineTo(px+7,py+7);g.lineTo(px+5,py+12);g.moveTo(px+10,py+3);g.lineTo(px+12,py+9);g.stroke()}])}}
