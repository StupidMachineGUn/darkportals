/* ---------- online layer (accounts, cloud save, other players, chat) ---------- */
const NET={gnd:new Map(),gpend:new Map(),on:false,tok:null,user:null,save:null,ws:null,others:new Map(),online:1,ver:'__VERSION__',board:[],lastSave:0,reg:false,tpT:0};
function authUi(){$('#pw').style.display='block';$('#regt').style.display='block';$('#nm').placeholder='Username';$('#nm').maxLength=16;$('#nm').value=localStorage.getItem('emberfall.user')||'';$('#go').textContent='Log in';}
function authMsg(t){$('#authmsg').textContent=t||''}
async function netAuth(){const username=$('#nm').value.trim(),password=$('#pw').value;if(!username||!password){authMsg('Enter username and password');return false}
 try{const r=await fetch('/api/'+(NET.reg?'register':'login'),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username,password})});const j=await r.json();if(!r.ok){authMsg(j.err||'Error');return false}
  NET.tok=j.token;NET.user=j.username;NET.save=j.character?j.character.data:null;NET.ver=j.character?j.character.ver|0:0;NET.stale=0;NET.leaving=0;localStorage.setItem('emberfall.user',j.username);$('#nm').value=j.username.slice(0,12);return true}catch(e){authMsg('Cannot reach server');return false}}
function goBtn(){if(!NET.on)return start();netAuth().then(ok=>{if(ok)start()})}
function toggleReg(){NET.reg=!NET.reg;$('#go').textContent=NET.reg?'Create account':'Log in';$('#regt').textContent=NET.reg?'Have an account? Log in':'New here? Create account';authMsg('')}
function netSave(force){if(!NET.on||!NET.tok||!P||NET.stale||NET.leaving)return;const n=Date.now();if(!force&&n-NET.lastSave<5000){if(!NET.svT)NET.svT=setTimeout(()=>{NET.svT=0;netSave(true)},Math.max(300,5000-(n-NET.lastSave)));return}
 if(NET.sinf){NET.sdirty=1;return}NET.lastSave=n;NET.sinf=1;NET.sdirty=0;let body;try{body=NET.body=JSON.stringify(P,(k,v)=>k==='path'||k==='chase'?undefined:v)}catch(e){NET.sinf=0;return}
 try{localStorage.setItem('emberfall.bak.'+NET.user,body)}catch(e){}
 return fetch('/api/save',{method:'PUT',keepalive:body.length<60000,headers:{'content-type':'application/json',authorization:'Bearer '+NET.tok,'x-base':String(NET.ver|0)},body}).then(async r=>{NET.sinf=0;
  if(r.status===401){NET.tok=null;NET.stale=1;sys('⚠ Session expired – reload to log in again','#f66');return false}
  if(r.status===409){NET.stale=1;sys('⚠ This character was saved from another device or tab. Reload to continue – saving is paused so nothing gets overwritten.','#f66');toast('⚠ Saved elsewhere – reload','#f66');return false}
  if(!r.ok)throw new Error('http '+r.status);const j=await r.json();NET.ver=j.ver|0;NET.sok=Date.now();NET.sbad=0;if(NET.sdirty)setTimeout(()=>netSave(true),50);return true}).catch(()=>{NET.sinf=0;NET.sbad=(NET.sbad||0)+1;if(!NET.leaving)setTimeout(()=>netSave(true),Math.min(15000,1500*NET.sbad));return false})}
function netSaveSoon(){if(!NET.on||NET.soonT)return;NET.soonT=setTimeout(()=>{NET.soonT=0;netSave(true)},900)}
function netFlush(){try{if(NET.on&&NET.tok&&P){netSave(true)}}catch(e){}}
addEventListener('pagehide',netFlush);addEventListener('beforeunload',netFlush);document.addEventListener('visibilitychange',()=>{if(document.hidden)netFlush()});
function netConnect(){if(!NET.on||!NET.tok)return;const w=new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host+'/ws?token='+encodeURIComponent(NET.tok));NET.ws=w;w.binaryType='arraybuffer';NET.rx=0;
 $('#chatin').style.display='block';w.onmessage=ev=>{if(typeof ev.data!=='string'){NET.rx+=ev.data.byteLength;return netBin(ev.data)}NET.rx+=ev.data.length;let m;try{m=JSON.parse(ev.data)}catch{return}if(pNet(m))return;
  if(m.t==='players'){NET.online=m.online;const seen=new Set();for(const p of m.l){seen.add(p.id);let o=NET.others.get(p.id);if(!o){o={id:p.id,x:p.x,y:p.y,remote:true,act:true,xp:{},gold:0};NET.others.set(p.id,o)}Object.assign(o,{ti:p.ti||'',bd:p.bd||0,rx:p.rx||0,ry:p.ry||0,rdir:p.rd|0,rm:p.rm|0,rs:p.rs|0,ac:p.a||'',name:p.n,lk:p.l||{},s:p.s|0,mhp:p.mh||20,flag:p.f||null,fT:p.f?clock+3:0,n:p.n,tx:p.x,ty:p.y,dir:p.d,eq:p.e,hp:p.h,ch:p.c,col:p.k||'#8fd',seen:clock})}
   for(const id of [...NET.others.keys()])if(!seen.has(id))NET.others.delete(id)}
  else if(m.t==='m')netSnap(m);
  else if(m.t==='pong'){NET.ping=Math.round(performance.now()-m.c);NET.ld=m.ld;NET.q=m.q;netPingUi()}
  else if(m.t==='hurt'){if(P&&!P.dead)playerHit(m.d,null)}
  else if(m.t==='kill')netKill(m.l);
  else if(m.t==='ev'){if(m.k==='proj'&&Math.hypot(m.x-P.x,m.y-P.y)<30)proj.push({x:m.x,y:m.y,vx:m.vx,vy:m.vy,dmg:0,life:m.life,own:'e'})}
  else if(m.t==='shake'){shakeT=3.2;shakeA=3;sfx('boss')}
  else if(m.t==='big')bigMsg(m.m,m.c);
  else if(m.t==='act'){const o=NET.others.get(m.id);if(o){o.swing=.25;o.dir=m.dir;if(m.k==='bolt'&&SPELLS[+m.sp]){const a=DIR[m.dir];proj.push({x:o.x,y:o.y-.3,vx:a[0]*9,vy:a[1]*9,dmg:0,life:1.1,own:'o',sp:+m.sp,sz:3})}}}
  else if(m.t==='phit'){const o=NET.others.get(m.from)||{remote:1,name:m.fn,x:P.x,y:P.y,hp:1,mhp:1};o.act=true;o.remote=true;if(P&&!P.dead&&!safeAt(P.x,P.y))playerHit(m.d,o)}
  else if(m.t==='pk')netGotKill(m);
  else if(m.t==='gd'){NET.gnd.set(m.g.id,m.g)}
  else if(m.t==='gx'){NET.gnd.delete(m.id);NET.gpend.delete(m.id)}
  else if(m.t==='gt'){NET.gpend.clear();const it=m.it;if(it&&ITEMS[it.id]){giveItem({...it,u:uid(),n:it.n||1});sfx('pick');fl(P.x,P.y-.8,'+'+ITEMS[it.id].e,'#fff');toast('Picked up '+ITEMS[it.id].n)}}
  else if(m.t==='tq'){NET.treq={from:m.from,n:m.n,t:clock+45};toast('🤝 '+m.n+' wants to trade – open the Trade House','#9fe3ff');if(panelKind==='trade')renderPanel()}
  else if(m.t==='ts'){TR={p2p:1,who:m.who,name:m.n,mine:[],mg:0,theirs:[],tg:0,bot:0,my:0,msg:'Offer items and gold, then confirm.'};thTab='tbl';NET.treq=null;sys('🤝 Trading with '+m.n,'#9fe3ff');if(panelKind==='trade')renderPanel()}
  else if(m.t==='tu'&&TR&&TR.p2p){TR.theirs=m.items.map(i=>({...i,u:uid()}));TR.tg=m.gold|0;TR.bot=0;TR.my=0;if(panelKind==='trade')renderPanel()}
  else if(m.t==='tk'&&TR&&TR.p2p){TR.bot=1;if(panelKind==='trade')renderPanel()}
  else if(m.t==='td'&&TR&&TR.p2p){trTake();P.gold-=TR.mg;P.gold+=m.gold|0;for(const i of m.items)giveItem({...i,u:uid(),n:i.n||1});sys('🤝 Trade complete with '+TR.name+'!','#9fe3ff');sfx('lvl');TR=null;netSave(true);if(panelKind==='trade')renderPanel()}
  else if(m.t==='tx'){if(TR&&TR.p2p){TR=null;sys('🤝 Trade '+(m.why==='left'?'cancelled – they left':'cancelled'),'#fc6');if(panelKind==='trade')renderPanel()}}
  else if(m.t==='chat'){sys('💬 '+m.n+': '+m.m,'#cfe8ff');if(m.id===NET.id){NET.mySay=m.m;NET.mySayT=7}else{const o=NET.others.get(m.id);if(o){o.say=m.m;o.sayT=7}}}else if(m.t==='sys')sys('· '+m.m,m.c||'#8aa');
  else if(m.t==='snap'){P.x=m.x;P.y=m.y;P.path=null;sys('⚠ Movement corrected by server','#fc6')}
  else if(m.t==='hello'){sys('🌐 Connected · '+m.online+' online','#9fe3ff');NET.id=m.id;NET.gnd=new Map((m.gnd||[]).map(d=>[d.id,d]));if(m.world){NET.sim=true;NET.em=new Map();E.length=0;boss=null;bots.length=0;roosterT=bossTimer=1e9;m.world.pts.forEach((q,i)=>{if(PTS[i]){PTS[i].x=q[0];PTS[i].y=q[1]}});sys('⚔ Shared world active','#9fe3ff')}}};
 w.onclose=ev=>{NET.ws=null;NET.sim=false;NET.ping=null;netPingUi();if(ev.code===4000)sys('⚠ Logged in from another place','#f66');else if(!NET.leaving)setTimeout(netConnect,3000)}}
setInterval(()=>{const w=NET.ws;if(!w||w.readyState!==1||!P||P.dead&&0)return;const tp=NET.lx!=null&&Math.hypot(P.x-NET.lx,P.y-NET.ly)>5;NET.lx=P.x;NET.ly=P.y;w.send(JSON.stringify({t:'pos',x:+P.x.toFixed(2),y:+P.y.toFixed(2),dir:P.dir|0,eq:armLv(eqId('a')),hp:Math.ceil(P.hp),ch:!!P.chicken,col:ARMC[armLv(eqId('a'))],tp,lk:netLook(),bz:shopSt?1:0,ac:NET.ac||'',bd:netBid(),rx:shopSt?shopSt.x:0,ry:shopSt?shopSt.y:0,rd:shopSt?shopSt.dir:0,rm:shopSt&&shopSt.mv?1:0,rs:P.inside?1:0,ti:titleOf(P.xp)||'',mhp:maxHp(),dead:P.dead>0,inside:!!P.inside,f:flagOf(P),xp:P.xp}))},200);
$('#chatin').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){netSay(e.target.value);e.target.value='';e.target.blur()}});['keyup','keypress'].forEach(t=>$('#chatin').addEventListener(t,e=>e.stopPropagation()));
function bldId(b){return b?b.x*1000+b.y:0}
function netBid(){return shopSt?shopSt.bid:P.inside?bldId(houses[P.inside]):0}
function netLook(){const t=eqTint();return{w:eqId('w')||null,tw:t.tw||null,ta:t.ta||null,a:armLv(eqId('a')),h:eqTier('h'),b:eqTier('b')}}
function netPingUi(){const e=$('#ping');if(!e)return;if(NET.ping==null){e.style.display='none';return}e.style.display='block';const n=performance.now(),kb=NET.rt?((NET.rx-NET.rb)/1024/((n-NET.rt)/1000)):0;NET.rt=n;NET.rb=NET.rx;e.textContent='ping '+NET.ping+' ms'+(NET.ping>250?' ⚠ LAG':'')+'  srv '+(NET.ld??'?')+'ms  ↓'+kb.toFixed(1)+'KB/s'+(NET.q>16384?'  q'+Math.round(NET.q/1024)+'K':'')+(typeof jailUi==='function'?jailUi():'')+(NET.stale?'  ⚠ SAVE PAUSED – reload':NET.sbad>1?'  ⚠ NOT SAVED (retrying)':NET.sok?'  💾 saved':'')+(NET.sim?'  🌀 '+(PT.open?'open':'closed '+Math.max(0,Math.ceil((PT.reopen-clock)/60))+'m'):'')}
setInterval(()=>{const w=NET.ws;if(w&&w.readyState===1)w.send(JSON.stringify({t:'ping',c:performance.now()}))},2000);
const netSend=o=>{const w=NET.ws;if(w&&w.readyState===1)w.send(JSON.stringify(o))};
function netHit(e,d){if(e.id)netSend({t:'hit',id:e.id,d:Math.round(d)})}
const _ax=applyFx;applyFx=function(e,sp,d){_ax(e,sp,d);if(NET.sim&&e.id)netSend({t:'fx',id:e.id,sp:SPELLS.indexOf(sp),d:Math.round(d)})};
function netAct(k,sp){NET.acK=k==='bolt'?'cast':'fight';NET.acT=clock+2;netSend({t:'act',k,sp:sp|0,dir:P.dir|0,x:P.x,y:P.y})}
const netRem=()=>NET.others?[...NET.others.values()].filter(o=>o.hp>0&&(o.hp<=0?0:1)):[];
function netPvp(V,d){netSend({t:'pvp',to:V.id,d:Math.round(d)})}
function netDeathItem(){const c=P.inv.filter(s=>!isEq(s));if(!c.length)return null;const s=pick(c);let it;if(s.n>1&&!ITEMS[s.id].slot){s.n--;it={id:s.id,n:1}}else{P.inv.splice(P.inv.indexOf(s),1);it={...s}}delete it.u;return it}
function netDeathDrop(){const it=netDeathItem();if(!it)return null;sys('🎒 You dropped '+ITEMS[it.id].n+' when you fell.','#fc6');if(NET.sim)netSend({t:'gd',it,x:P.x,y:P.y});return it}
function netDied(by,it){const g=Math.floor(P.gold*.1);P.gold-=g;const sx={};for(const s of SK){const k=s[0],t=Math.floor((P.xp[k]||0)*.01);if(t>0){P.xp[k]-=t;sx[k]=t}}
 const vf=flagOf(P),b=vf==='red'?100*Math.max(1,P.vic||1):0;netSend({t:'pkill',by:by.id,g,sx,b,it,fl:vf?1:0});P.flag=null;P.fT=0;P.vic=0;sys('💀 '+by.name+' killed you and took '+g+'g + 1% of your skills','#f66')}
function netGotKill(m){if(m.it&&ITEMS[m.it.id]){giveItem({...m.it,u:uid(),n:m.it.n||1});sys('🎒 You took '+ITEMS[m.it.id].n+' from '+m.n,'#ffd36b')}
const o=NET.others.get(m.who),vf=o?flagOf(o):null;P.gold+=m.g|0;let tot=0;for(const k in m.sx||{}){const t=+m.sx[k]||0;if(t>0&&P.xp[k]!==undefined){gainXp(k,t);tot+=t}}
 sys('🏴‍☠️ Spoils from '+m.n+': +'+(m.g|0)+'g and +'+tot+' skill xp','#ffd36b');P.kills++;P.pvpK=(P.pvpK|0)+1;
 if(m.b>0){P.gold+=m.b;sys('💰 Bounty collected: '+m.b+'g for '+m.n+'!','#ffd36b');toast('💰 +'+m.b+'g bounty')}
 else if(vf!=='orange'&&vf!=='red'){setFlag(P,'red',Infinity);P.vic=(P.vic||0)+1}}
function netBin(ab){const dv=new DataView(ab);if(dv.getUint8(0)!==1||!NET.em)return;const n=dv.getUint16(1,true);let o=3;for(let i=0;i<n;i++,o+=13){const e=NET.em.get(dv.getUint32(o,true));if(!e)continue;e.tx=dv.getUint16(o+4,true)/16;e.ty=dv.getUint16(o+6,true)/16;e.vx=dv.getInt8(o+8)/8;e.vy=dv.getInt8(o+9)/8;e.hp=dv.getUint16(o+10,true);const f=dv.getUint8(o+12);e.dir=(f>>4)&3;e.st=(f>>6)&1;if(f&1)e.sw=.2}}
function netSnap(m){const em=NET.em;if(!em)return;
 for(const a of m.a){let e=em.get(a[0]);if(e)continue;if(!ESPEC[a[1]])continue;e=mkEnemy(a[1],a[2],a[3]);Object.assign(e,{id:a[0],hp:a[4],mhp:a[5],dir:a[6],st:a[7],tx:a[2],ty:a[3],vx:0,vy:0,hx:a[12],hy:a[13]});if(a[8])e.el=a[8];if(a[9]!==1)e.sc=a[9];else if(e.el)e.sc=1;if(a[10])e.dun=1;if(a[11]>=0){e.pt=a[11];e.temp=1}em.set(e.id,e);E.push(e);if(e.t==='wyrm')boss=e}
  if(m.r.length){const rs=new Set(m.r);for(const id of rs){const e=em.get(id);if(e){e.dead=clock+1e9;if(e===boss)boss=null;em.delete(id)}}E=E.filter(e=>!(e.id&&rs.has(e.id)))}
 PT.open=!!m.pt[0];PT.reopen=clock+m.pt[1]}
function netKill(l){for(const k of l){const e=NET.em&&NET.em.get(k.id);if(!e)continue;if(k.by===NET.id||(e.t==='wyrm'&&(P.bossDmg||0)>=40)){e.dead=0;try{meleeT=clock;killEnemy(e)}catch(x){}}if(e.t==='wyrm')P.bossDmg=0;e.dead=clock+1e9}}
function netMobs(dt){const k=Math.min(1,dt*12);for(const e of E){if(e.dead)continue;e.tx+=(e.vx||0)*dt;e.ty+=(e.vy||0)*dt;const dx=e.tx-e.x,dy=e.ty-e.y;e.mv=Math.abs(dx)+Math.abs(dy)>.03;e.x+=dx*k;e.y+=dy*k;if(e.flash>0)e.flash-=dt;if(e.sw>0)e.sw-=dt}}
function netSay(t){t=t.trim();if(/^\/p\s/i.test(t)){if(NET.ws&&NET.ws.readyState===1)NET.ws.send(JSON.stringify({t:'pyc',m:t.slice(3)}));return}if(t&&NET.ws&&NET.ws.readyState===1)NET.ws.send(JSON.stringify({t:'chat',m:t}))}
function netStep(dt){if(typeof jailTick==='function')jailTick(dt);if(P&&NET.sim&&!P.dead&&!shopSt&&!P.inside&&NET.gnd.size){NET.gT=(NET.gT||0)-dt;if(NET.gT<=0){NET.gT=.4;for(const d of NET.gnd.values()){if((NET.gpend.get(d.id)||0)>clock||Math.hypot(d.x-P.x,d.y-P.y)>1.2)continue;const it=ITEMS[d.it.id];if(!it)continue;if(P.inv.length>=24&&(it.slot||!P.inv.some(x=>x.id===d.it.id)))continue;NET.gpend.set(d.id,clock+2);netSend({t:'gt',id:d.id});break}}}
if(P){const mv=NET.sx==null||Math.hypot(P.x-NET.sx,P.y-NET.sy)>.05||P.swing>0||CD.bolt>CDM.bolt-.2;NET.sx=P.x;NET.sy=P.y;if(mv)NET.idle=0;else NET.idle=(NET.idle||0)+dt;NET.mySayT=(NET.mySayT||0)-dt;NET.self=shopSt?2:NET.idle>30?1:0;NET.ac=(typeof act!=='undefined'&&act)?act.kind:(NET.acT>clock?NET.acK:'');if(NET.ac)NET.idle=0}for(const o of NET.others.values()){const k=Math.min(1,dt*10),dx=o.tx-o.x,dy=o.ty-o.y;o.mv=Math.abs(dx)+Math.abs(dy)>.05;o.swing=(o.swing||0)-dt;o.sayT=(o.sayT||0)-dt;if(o.bd){const k2=Math.min(1,dt*12);o.drx=(o.drx==null?o.rx:o.drx+(o.rx-o.drx)*k2);o.dry=(o.dry==null?o.ry:o.dry+(o.ry-o.dry)*k2);o.rph=(o.rph||0)+(o.rm?dt*9:0)}else{o.drx=null}o.x+=dx*k;o.y+=dy*k;o.ph=(o.ph||0)+dt*8}}
function netDraw(R,vis){for(const d of NET.gnd.values())if(vis(d.x,d.y))R.push([d.y*T+6,()=>{const it=ITEMS[d.it.id];if(!it)return;g.fillStyle='#0005';g.fillRect(d.x*T-5,d.y*T+1,10,3);g.save();g.font='11px sans-serif';g.textAlign='center';g.fillText(it.e,d.x*T,d.y*T-1+Math.sin(clock*3+d.id)*1.5);g.restore()}]);
for(const o of NET.others.values())if(!o.bd&&vis(o.x,o.y))R.push([o.y*T,()=>{drawChar(Math.round(o.x*T-8),Math.round(o.y*T-14),o.dir,o.ph||0,(o.lk&&o.lk.ta)?shade(o.lk.ta,.7):o.col,'#432',{moving:o.mv,wid:(o.lk||{}).w,tw:(o.lk||{}).tw,ta:(o.lk||{}).ta,arm:(o.lk||{}).a,helm:(o.lk||{}).h,boots:(o.lk||{}).b,chick:o.ch,sp:o.swing>0?1-o.swing/.25:-1})}])}
const ACI={chop:'🪓',mine:'⛏️',fish:'🎣',cook:'🍳',bush:'🌿',fight:'⚔️',cast:'🔮',heal:'💚',shield:'🛡️',haste:'💨',pot:'🥔'};
function bubbleLines(t){t=String(t||'').slice(0,44);return t.length>22?[t.slice(0,22),t.slice(22)]:[t]}
function netLabels(vis,label,sub){for(const o of NET.others.values())if(!o.bd&&vis(o.x,o.y)){const fc=flagOf(o);label(o.n,o.x,o.y-1,fc?FCOL[fc]:'#8dffb0');if(o.ti&&sub)sub('the '+o.ti,o.x,o.y-1.32);const ic=o.s===1?'zZ':o.s===2?'oO':ACI[o.ac];if(ic)label(ic,o.x,o.y-(o.ti?1.7:1.4),o.s===1?'#9cf':'#fff');
  if(o.sayT>0&&o.say){const L=bubbleLines(o.say);L.forEach((t,i)=>label(t,o.x,o.y-1.8-(L.length-1-i)*.32,'#fff'))}}
 if(P&&!P.dead){const s=NET.self|0,ic=s===1?'zZ':s===2?'oO':ACI[NET.ac];if(ic)label(ic,P.x,P.y-1.4,s===1?'#9cf':'#fff');if(NET.mySayT>0&&NET.mySay){const L=bubbleLines(NET.mySay);L.forEach((t,i)=>label(t,P.x,P.y-1.8-(L.length-1-i)*.32,'#fff'))}}}
async function netBoard(){try{const r=await fetch('/api/board');NET.board=await r.json();if(panelKind==='board')renderPanel()}catch(e){}}
function netPostBoard(ent){if(!NET.on||!NET.tok)return;fetch('/api/board',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+NET.tok},body:JSON.stringify(ent)}).then(()=>netBoard()).catch(()=>{})}
