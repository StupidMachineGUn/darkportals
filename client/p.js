/* ---------- v0.5: parties, admin tools, jail ---------- */
NET.party=null;NET.pinv=null;NET.adm=0;NET.jail=null;NET.ph=new Map();NET.adl=[];NET.kicked=0;
function pNet(m){const t=m.t;
 if(t==='hello'){NET.adm=m.adm|0;return false}
 if(t==='warp'){tele(m.x,m.y);cam.x=m.x;cam.y=m.y;if(shopSt)shopSt=null;return true}
 if(t==='jl'){const first=!NET.jail;NET.jail={left:m.left,total:m.total,reason:m.reason};if(first)sys('🔒 You are in jail ('+m.reason+'). Dig '+m.left+' potatoes 🥔 to get out!','#fc6');return true}
 if(t==='jr'){NET.jail=null;sys('🔓 You are free! '+(m.why==='admin'?'(released by an admin)':'Sentence served.'),'#9fe3ff');return true}
 if(t==='kick'){NET.leaving=1;try{localStorage.setItem('dp.kick',String(Date.now()+10000))}catch(e){}const o=document.createElement('div');o.style.cssText='position:fixed;inset:0;z-index:99;background:#000d;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;color:#ff8a80;font:bold 28px system-ui;text-align:center';o.innerHTML='⛔ You got kicked<div style="font-size:14px;color:#ccc;font-weight:400">Returning to the welcome screen…</div>';document.body.appendChild(o);setTimeout(()=>location.reload(),2200);return true}
 if(t==='bc'){bcShow(m.m);sys('📢 '+m.m,'#ffd36b');return true}
 if(t==='al'){NET.auc=m.l;if(panelKind==='trade'&&thTab==='auc')renderPanel();return true}
 if(t==='ao'){const q=NET.apq;NET.apq=null;NET.apT=0;if(!q)return true;
  if(!m.ok){if(q.gold)P.gold+=q.gold;if(q.it)giveItem(q.it);toast('⚠ '+(m.why||'Failed'),'#f66')}
  else{if(q.op==='ac')toast('📦 Listed on the Trade House');else if(q.op==='acan')toast('Listing cancelled – item sent to your mail');else toast(q.op==='abuy'?'🛒 Bought! Item is in your mail':'Bid placed: '+(m.amt||q.gold)+'g','#9fe3ff');sfx('pick')}
  netSaveSoon();netSend({t:'aq'});if(panelKind==='trade')renderPanel();return true}
 if(t==='mn'){if(m.n>0)netSend({t:'mc'});return true}
 if(t==='mb'){let g=0,n=0;for(const x of m.l){n++;if(x.gold){P.gold+=x.gold;g+=x.gold}if(x.item&&ITEMS[x.item.id]){const w=ITEMS[x.item.id].slot?giveItem(x.item):addItem(x.item.id,x.item.n||1);sys(x.msg+(w==='bank'?' (bag full – in your bank)':''),'#9fe3ff')}else sys(x.msg,'#9fe3ff')}
  if(n){toast(`📬 ${n} Trade House message${n>1?'s':''}${g?' · +'+g+'🪙':''}`,'#9fe3ff');netSaveSoon();if(panelKind==='trade'||panelKind==='bag')renderPanel()}return true}
 if(t==='hs'){const n=Date.now();for(const h of houses)h.occ=null;for(const r of m.l)if(houses[r[0]]&&r[3]!==NET.id)houses[r[0]].occ={n:r[1],exp:r[2]};
  if(!NET.hcl){NET.hcl=1;if(P&&P.rent&&P.rent.exp>n)netSend({t:'hclaim',id:P.rent.id,exp:P.rent.exp})}if(panelKind==='house')renderPanel();return true}
 if(t==='hrr'){const q=NET.hq;NET.hq=null;if(!m.ok){toast(m.why==='taken'?'🔒 Someone else rents it':m.why==='max'?'Max 60 minutes at a time':'You already rent another cottage','#f66');return true}
  if(q&&q.id===m.id){P.gold-=HPRICE[q.m]||0;P.rent={id:m.id,exp:m.exp};sfx('pick');toast(`🏠 Cottage rented for ${q.m} min`);netSaveSoon()}if(panelKind==='house')renderPanel();return true}
 if(t==='stl'){thiefVictim(m);return true}
 if(t==='str'){thiefResult(m);return true}
 if(t==='adm_ok'){NET.mt=m.mt;NET.mm=m.mm;if(panelKind==='admin')renderPanel();return true}
 if(t==='pys'){NET.party=m.id?{id:m.id,lead:m.lead,m:m.m}:null;if(!m.id)NET.ph.clear();if(panelKind==='party')renderPanel();return true}
 if(t==='pyi'){NET.pinv={from:m.from,n:m.n,exp:Date.now()+30000};sys('👥 '+m.n+' invites you to a party — open 👥 to accept','#b9f');toast('👥 Party invite from '+m.n,'#b9f');if(panelKind==='party')renderPanel();return true}
 if(t==='pyc'){sys('👥 '+m.n+': '+m.m,'#b9f');return true}
 if(t==='pyh'){NET.ph=new Map(m.h.map(h=>[h[0],h]));if(panelKind==='party')renderPanel();return true}
 if(t==='adl'){NET.adl=m.l;NET.mt=m.mt;NET.mm=m.mm;if(panelKind==='admin')renderPanel();return true}
 return false}
function partyHtml(){let h=hdr('👥 Party');const py=NET.party;
 if(NET.pinv&&NET.pinv.exp<Date.now())NET.pinv=null;
 if(NET.pinv)h+=`<div class="tip" style="font-size:13px;opacity:1">📨 <b>${NET.pinv.n}</b> invites you to a party.</div><div class="row">${bt('pya',0,'✅ Accept')}${bt('pyd',0,'Decline')}</div>`;
 if(!NET.ws)return h+'<div class="tip">Go online to use parties.</div>';
 if(py){h+=`<div class="tip" style="font-size:13px;opacity:1">Up to 5 members · no PvP between members · type <b>/p text</b> to chat · warp to a member every 60s (not in combat, dungeon, jail or buildings).</div>`;
  for(const m of py.m){const i=NET.ph.get(m.id),hp=i?i[1]:0,mh=i?i[2]:0,me=m.id===NET.id;h+=`<div class="row"><div style="flex:1;color:${me?'#ffe9a0':'#8dffb0'}">${m.id===py.lead?'★ ':''}${m.n}${me?' (you)':''}<div style="height:5px;background:#300;border-radius:3px;margin-top:3px"><div style="height:5px;width:${mh?Math.max(0,Math.min(100,hp/mh*100)):0}%;background:#e44;border-radius:3px"></div></div></div>${me?'':bt('pyw',m.id,'✨ Warp')}${py.lead===NET.id&&!me?bt('pyk',m.id,'Kick'):''}</div>`}
  h+=`<div class="row">${bt('pyl',0,'Leave party')}</div>`}
 else h+=`<div class="tip" style="font-size:13px;opacity:1">You are not in a party. Invite a nearby player:</div>`;
 if(!py||py.lead===NET.id&&py.m.length<5){const ids=new Set(py?py.m.map(m=>m.id):[]);const near=[...NET.others.values()].filter(o=>!ids.has(o.id));if(!near.length)h+='<div class="tip">Nobody nearby to invite.</div>';for(const o of near)h+=`<div class="row"><span style="flex:1;color:#8dffb0">● ${o.n}</span>${bt('pyi',o.id,'Invite')}</div>`}
 return h}
function bcShow(t){let b=$('#bcbar');if(!b){b=document.createElement('div');b.id='bcbar';b.style.cssText='position:fixed;left:50%;top:calc(10px + env(safe-area-inset-top));transform:translateX(-50%);z-index:30;max-width:86vw;background:#2a1450ee;border:2px solid #ffd36b;border-radius:12px;padding:8px 14px;color:#fff;font:bold 15px system-ui;text-align:center;box-shadow:0 0 18px #8a5cff;pointer-events:none';document.body.appendChild(b)}b.textContent='📢 '+t;b.style.display='block';clearTimeout(b._t);b._t=setTimeout(()=>b.style.display='none',10000)}
function adminHtml(){let h=hdr('🛠 Admin · '+NET.adl.length+' online');h+=`<div class="row">${bt('adr',0,'↻ Refresh')}${bt('adbc',0,'📢 Broadcast')}${bt('admt',0,NET.mt?'🟢 End maintenance':'🚧 Maintenance')}</div>${NET.mt?'<div class="tip" style="opacity:1;color:#f0b040">Server is UNAVAILABLE for new logins (admins and current players stay in).'+(NET.mm?' Message: '+NET.mm:'')+'</div>':''}`;
 for(const p of NET.adl){const me=p.id===NET.id;h+=`<div class="row" style="flex-wrap:wrap"><div style="flex:1;min-width:120px;color:${p.j?'#fc6':'#8dffb0'}">${p.n}${me?' (you)':''}${p.j?' 🔒'+p.j:''}<div class="tip">${p.ip||'?'} · ${p.x},${p.y}</div></div>${me?'':bt('adtp',p.id,'→ TP')+bt('adbring',p.id,'Bring')+bt('adjail',p.id,'Jail 25')+bt('adj50',p.id,'Jail 50')+(p.j?bt('adun',p.id,'Unjail'):'')+bt('adkick',p.id,'Kick')}</div>`}
 return h}
function pAct(a,v){
 if(a==='pyi'){netSend({t:'pyi',to:+v});return true}
 if(a==='pya'){netSend({t:'pya'});NET.pinv=null;return true}
 if(a==='pyd'){netSend({t:'pyd'});NET.pinv=null;return true}
 if(a==='pyl'){netSend({t:'pyl'});return true}
 if(a==='pyk'){netSend({t:'pyk',to:+v});return true}
 if(a==='pyw'){netSend({t:'pyw',to:+v});closePanel();return true}
 if(a==='adr'){netSend({t:'adm',c:'list'});return true}
 if(a==='adbc'){const m=prompt('Broadcast message (bold banner to all players, max 120 chars):');if(m&&m.trim())netSend({t:'adm',c:'bc',m:m.trim()});return true}
 if(a==='admt'){if(NET.mt)netSend({t:'adm',c:'maint',on:false});else{const m=prompt('Optional maintenance message (shown on the welcome screen, e.g. Back in 10 minutes):','');if(m===null)return true;netSend({t:'adm',c:'maint',on:true,msg:m})}return true}
 const A={adtp:['tp'],adbring:['bring'],adjail:['jail',25],adj50:['jail',50],adun:['unjail'],adkick:['kick']}[a];
 if(A){netSend({t:'adm',c:A[0],to:+v,n:A[1],r:'admin order'});setTimeout(()=>netSend({t:'adm',c:'list'}),500);if(a==='adtp')closePanel();return true}
 return false}
/* jail: dig potatoes while standing next to a ready plant */
function jailTick(dt){const j=NET.jail;if(!j||!P||P.dead)return;
 if(input.x||input.y||P.path){JAIL.dig=0;return}
 let best=null,bd=1.5;for(const p of JAIL.pl){if(clock<p.t)continue;const d=Math.hypot(p.x+.5-P.x,p.y+.5-P.y);if(d<bd){bd=d;best=p}}
 if(!best){JAIL.dig=0;return}
 JAIL.dig=(JAIL.dig||0)+dt;NET.acK='pot';NET.acT=clock+.3;
 if(JAIL.dig>=1.1){JAIL.dig=0;best.t=clock+8;j.left=Math.max(0,j.left-1);fl(best.x+.5,best.y,'+🥔 '+j.left+' left','#fc6');sfx('pick');netSend({t:'jd'})}}
function jailUi(){const j=NET.jail;return j?'  🔒 '+j.left+'🥔 left':''}

/* logout: one tap, one attempt, no popups */
function enemiesNear(){try{return E.some(e=>!e.dead&&e.st===1&&!ESPEC[e.t].pass&&Math.hypot(e.x-P.x,e.y-P.y)<12)}catch(e){return false}}
async function logout(){
 if(NET.leaving||NET.outBusy)return;
 if(P&&(P.hurt>0||enemiesNear()))return toast('⚔ Enemies nearby – move away, then tap ⏻ again','#f99');
 NET.outBusy=1;toast('💾 Saving…');
 try{if(!NET.on){save()}else{let ok=false;if(!NET.stale){for(let w=0;w<40&&NET.sinf;w++)await new Promise(r=>setTimeout(r,100));ok=!!(await netSave(true))}
  if(!ok&&!(NET.forceOut>Date.now())){NET.forceOut=Date.now()+8000;NET.outBusy=0;toast(NET.stale?'⚠ Saved elsewhere – tap ⏻ again to leave anyway':'⚠ Could not save – tap ⏻ again to leave anyway','#f99');return}}}catch(e){}
 NET.leaving=1;try{if(NET.ws)NET.ws.close(1000)}catch(e){}location.reload()}
/* connection watchdog: 10s without server contact -> save, disconnect, back to welcome */
function connLost(){if(NET.leaving)return;NET.leaving=1;const o=document.createElement('div');o.style.cssText='position:fixed;inset:0;z-index:99;background:#000d;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;color:#ffb74d;font:bold 24px system-ui;text-align:center;padding:20px';o.innerHTML='📡 Connection lost<div id="clm" style="font-size:14px;color:#ccc;font-weight:400">Saving…</div>';document.body.appendChild(o);
 Promise.race([netSave(true),new Promise(r=>setTimeout(()=>r(false),3000))]).then(ok=>{$('#clm').textContent=(ok?'Your progress was saved.':'Could not reach the server – progress since the last save may be lost.')+' Returning to the welcome screen…';try{NET.ws&&NET.ws.close()}catch(e){}setTimeout(()=>location.reload(),2200)})}
NET.lastRx=Date.now();document.addEventListener('visibilitychange',()=>{NET.lastRx=Date.now();NET.downSince=0});
setInterval(()=>{if(!NET.on||!NET.ws||NET.leaving||document.hidden||$('#title').style.display!=='none')return;const w=NET.ws,n=Date.now();
 if(w.readyState===1){NET.downSince=0;if(n-NET.lastRx>10000)connLost()}else{if(!NET.downSince)NET.downSince=n;if(n-NET.downSince>10000)connLost()}},1000);

/* ---------- Thievery (v0.5.2) ---------- */
const thLv=()=>lv('thief');
function thTarget(){let b=null,bd=2.6;
 for(const o of netRem()){if(o.dead||o.hp<=0)continue;const d=Math.hypot(o.x-P.x,o.y-P.y);if(d<bd){bd=d;b={p:1,ref:o}}}
 for(const e of E){if(e.dead||e.pk||!ESPEC[e.t]||!ESPEC[e.t].gold)continue;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<bd){bd=d;b={p:0,ref:e}}}
 return b}
function thiefMenu(){if(P.dead)return false;const t=thTarget();if(!t)return false;
 let m=$('#thv');if(!m){m=document.createElement('div');m.id='thv';m.style.cssText='position:fixed;left:50%;bottom:150px;transform:translateX(-50%);z-index:60;background:#1a1626ee;border:1px solid #7b6;border-radius:12px;padding:8px;display:flex;gap:8px;font:14px system-ui;color:#fff';document.body.appendChild(m)}
 const nmv=t.p?(t.ref.name||'player'):t.ref.t;
 m.innerHTML=`<div style="align-self:center;opacity:.8">🗝️ ${nmv}</div><div class="btn" data-k="snoop" style="padding:0 10px;height:36px">🔍 Snoop</div><div class="btn" data-k="pick" style="padding:0 10px;height:36px">✋ Pickpocket</div><div class="btn" data-k="x" style="padding:0 10px;height:36px">✕</div>`;
 m.style.display='flex';m.onpointerdown=ev=>{const k=ev.target.dataset&&ev.target.dataset.k;if(!k)return;m.style.display='none';if(k!=='x')thiefDo(k,t)};
 clearTimeout(m._t);m._t=setTimeout(()=>{m.style.display='none'},6000);return true}
function thiefDo(k,t){
 if(P.thT>clock)return toast('Wait a moment…','#fc6');
 if(t.p){if(!NET.ws)return;if(!stance)return toast('⚔ Switch to PvP stance to steal from players','#fa4');if(safeAt(P.x,P.y))sys('🛡 Guards watch the town… risky!','#fc6');
  P.thT=clock+2;setFlag(P,'orange',60);netSend({t:'steal',to:t.ref.id,k,lv:thLv()});toast('🗝️ Trying…','#ccc');return}
 if(k==='snoop'){const e=t.ref,g=ESPEC[e.t].gold;gainXp('thief',2);return toast(`🔍 ${e.t}: carries ~${g[0]}-${g[1]}🪙`,'#cde')}
 const e=t.ref,s=ESPEC[e.t];P.thT=clock+2;e.pk=1;const ok=Math.random()<Math.min(.85,.35+thLv()*.01);
 if(ok){const g=ri(...s.gold);P.gold+=g;gainXp('thief',4);toast(`🤏 Stole ${g}🪙`,'#ffd36b');sfx('coin')}
 else{gainXp('thief',1);toast('😬 Caught! It noticed you','#f99');if(!safeAt(P.x,P.y))e.st=1}}
/* victim side: decide result */
function thiefVictim(m){const lvT=Math.max(1,Math.min(99,m.lv|0)),k=m.k;
 const ok=Math.random()<(k==='snoop'?Math.min(.9,.5+lvT*.005):Math.min(.8,.3+lvT*.006));
 const r={t:'stlr',to:m.from,k,ok:ok?1:0,fn:P.name};
 if(ok){if(k==='snoop'){r.g=P.gold;r.inv=P.inv.filter(i=>!isEq(i)).slice(0,3).map(i=>ITEMS[i.id].e+ITEMS[i.id].n)}
  else{const g=Math.min(P.gold,Math.max(1,Math.floor(P.gold*.08)),30+lvT*8);P.gold-=g;r.g=g;
   if(Math.random()<.08){const c=P.inv.filter(i=>!isEq(i)&&(ITEMS[i.id].v||0)<=40&&!ITEMS[i.id].slot);if(c.length){const it=c[ri(0,c.length-1)];const j=P.inv.indexOf(it);if(it.n>1)it.n--;else P.inv.splice(j,1);r.it={...it,n:1}}}
   sys(`🗝️ You feel lighter… ${g}🪙 gone${r.it?' and an item':''}!`,'#f99');netSaveSoon()}}
 else sys(`🗝️ You caught ${m.fn||'someone'} ${k==='snoop'?'snooping':'pickpocketing'} you!`,'#fa4');
 netSend(r)}
function thiefResult(m){const k=m.k;
 if(!m.ok){toast('😬 Caught!','#f99');gainXp('thief',1);return}
 if(k==='snoop'){gainXp('thief',3);sys(`🔍 ${m.fn} carries ${m.g}🪙${m.inv&&m.inv.length?' · '+m.inv.join(', '):''}`,'#cde');toast(`🔍 ${m.g}🪙`,'#cde');return}
 P.gold+=m.g|0;gainXp('thief',5);let x='';if(m.it&&ITEMS[m.it.id]){addItem(m.it.id,1);x=' + '+ITEMS[m.it.id].e}
 toast(`🤏 Stole ${m.g}🪙${x}`,'#ffd36b');sfx('coin');netSaveSoon()}

/* ---------- first-time tutorial (v0.5.2) ---------- */
const TUT=[['🕹️ Move','Drag the left side of the screen (or WASD). Tap the ground to walk there.'],['⚔️ Fight','Tap a monster, or press ⚔️. Level-ups save automatically. Eat and drink from your 🎒.'],['✋ Use / Steal','✋ talks to shops, trees, rocks. Near a mob or player it offers 🔍 Snoop / 🤏 Pickpocket (Thievery).'],['🏘️ Towns are safe','Guards protect towns. Shops, bank, Trade House and inn are there. Rent a cottage 🏠 to rest safely.'],['🎼 Tips','Options: music, low-detail mode for weak phones, and this tutorial again.']];
let tutI=0;
function tutShow(){tutI=0;let o=$('#tut');if(!o){o=document.createElement('div');o.id='tut';o.style.cssText='position:fixed;inset:0;z-index:90;background:#000a;display:flex;align-items:center;justify-content:center;font:15px system-ui;color:#fff';document.body.appendChild(o);o.onpointerdown=ev=>{const a=ev.target.dataset&&ev.target.dataset.t;if(!a)return;if(a==='s'||tutI>=TUT.length-1){o.style.display='none';try{localStorage.setItem('dp.tut','1')}catch(e){}return}tutI++;tutDraw()}}
 o.style.display='flex';tutDraw()}
function tutDraw(){const o=$('#tut'),s=TUT[tutI];o.innerHTML=`<div style="background:#1a1626;border:1px solid #7b6;border-radius:14px;padding:18px;max-width:300px;text-align:center"><div style="font-size:20px;margin-bottom:8px">${s[0]}</div><div style="opacity:.9;line-height:1.4">${s[1]}</div><div style="margin-top:14px;display:flex;gap:10px;justify-content:center"><div class="btn" data-t="s" style="padding:0 12px;height:36px">Skip</div><div class="btn" data-t="n" style="padding:0 14px;height:36px">${tutI>=TUT.length-1?'Got it':'Next ▶'} (${tutI+1}/${TUT.length})</div></div></div>`}
{const _es=endStory;endStory=function(){_es();try{if(!localStorage.getItem('dp.tut'))tutShow()}catch(e){}}}

/* ---------- real auction (online) ---------- */
{const _ag=aucGen,_as=aucStep,_ah=aucHtml,_xa=xAct;
 aucGen=function(){if(NET.on)return;_ag()};
 aucStep=function(){if(NET.on)return;_as()};
 aucHtml=function(){return NET.on?aucOnHtml():_ah()};
 xAct=function(a,v){
  if(NET.on&&(a==='abid'||a==='abuy'||a==='alistOn'||a==='acanOn')){
   if(NET.apq&&NET.apT>Date.now())return true;if(!NET.ws){toast('Offline','#f66');return true}
   const l=(NET.auc||[]).find(x=>x.id==v);
   if(a==='abid'){if(!l)return true;if(P.gold<l.nb){toast('Not enough gold','#f66');return true}P.gold-=l.nb;NET.apq={op:'ab',gold:l.nb};NET.apT=Date.now()+4000;netSend({t:'ab',id:l.id,amt:l.nb});return true}
   if(a==='abuy'){if(!l||!l.buy)return true;if(P.gold<l.buy){toast('Not enough gold','#f66');return true}P.gold-=l.buy;NET.apq={op:'abuy',gold:l.buy};NET.apT=Date.now()+4000;netSend({t:'abuy',id:l.id});return true}
   if(a==='acanOn'){NET.apq={op:'acan'};NET.apT=Date.now()+4000;netSend({t:'acan',id:l&&l.id});return true}
   if(a==='alistOn'){const s=P.inv[+v];if(!s||isEq(s))return true;const st=Math.max(1,Math.round(valOf(s)*s.n*listMul));P.inv.splice(+v,1);NET.apq={op:'ac',it:s};NET.apT=Date.now()+4000;netSend({t:'ac',it:s,price:st,buy:st*2,mins:30});return true}
  }
  return _xa(a,v)};
 setInterval(()=>{if(NET.on&&NET.ws&&panelKind==='trade'&&thTab==='auc')netSend({t:'aq'})},5000)}
function aucOnHtml(){if(!NET.auc&&NET.ws&&!NET.aqs){NET.aqs=1;netSend({t:'aq'})}
 const L=NET.auc||[],me=NET.id;let h=`<div class="tip" style="font-size:13px;opacity:1">💰 ${P.gold} · 🌐 Real player auction. Winners & payouts arrive by 📬 mail automatically. 5% fee.</div>`;
 const others=L.filter(l=>l.s!==me),mine=L.filter(l=>l.s===me);
 if(!others.length)h+='<div class="tip">No listings from other players yet. List something below!</div>';
 for(const l of others){const lead=l.b===me;h+=`<div class="row"><span style="font-size:22px">${ITEMS[l.it.id]?ITEMS[l.it.id].e:'?'}</span><div style="flex:1;color:${RARC[l.it.rar|0]}">${nameOf(l.it)}${l.it.ench?' ✨':''}${l.it.n>1?' ×'+l.it.n:''}<div class="tip">${ITEMS[l.it.id].slot?statLine(l.it):''}<br>by ${l.sn} · ⏱ ${tleft(l.exp-Date.now())} · bid <b>${l.cur}g</b>${l.bn?' ('+(lead?'YOU':l.bn)+')':''}</div></div><div style="display:flex;flex-direction:column;gap:4px">${bt('abid',l.id,lead?'Leading':'Bid '+l.nb+'g',lead||P.gold<l.nb)}${l.buy?bt('abuy',l.id,'Buy '+l.buy+'g',P.gold<l.buy):''}</div></div>`}
 h+=`<h3 style="margin-top:10px">Your listings</h3>`;if(!mine.length)h+='<div class="tip">Nothing listed.</div>';
 for(const l of mine)h+=xrow(l.it,'acanOn',l.id,l.b?'':'Cancel',`<br>⏱ ${tleft(l.exp-Date.now())} · ${l.b?'bid <b>'+l.cur+'g</b> by '+l.bn:'start '+l.cur+'g · buy '+l.buy+'g · no bids'}`);
 h+=`<h3 style="margin-top:10px">List an item (30 min)</h3><div class="row"><span style="flex:1">Start: ${Math.round(listMul*100)}% of value (buy-now ×2)</span>${bt('alm',0,'Change')}</div>`;
 P.inv.forEach((s,i)=>{if(!isEq(s)&&mine.length<5){const p=Math.max(1,Math.round(valOf(s)*s.n*listMul));h+=xrow(s,'alistOn',i,'List '+p+'g')}});return h}
