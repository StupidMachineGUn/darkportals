/* ---------- online layer (accounts, cloud save, other players, chat) ---------- */
const NET={on:false,tok:null,user:null,save:null,ws:null,others:new Map(),online:1,ver:'__VERSION__',board:[],lastSave:0,reg:false,tpT:0};
async function netProbe(){try{const r=await fetch('/api/ping',{cache:'no-store'});const j=await r.json();if(j&&j.ok){NET.on=true;NET.ver=j.version;authUi();}}catch(e){}}
function authUi(){$('#pw').style.display='block';$('#regt').style.display='block';$('#nm').placeholder='Username';$('#nm').maxLength=16;$('#nm').value=localStorage.getItem('emberfall.user')||'';$('#go').textContent='Log in';}
function authMsg(t){$('#authmsg').textContent=t||''}
async function netAuth(){const username=$('#nm').value.trim(),password=$('#pw').value;if(!username||!password){authMsg('Enter username and password');return false}
 try{const r=await fetch('/api/'+(NET.reg?'register':'login'),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username,password})});const j=await r.json();if(!r.ok){authMsg(j.err||'Error');return false}
  NET.tok=j.token;NET.user=j.username;NET.save=j.character?j.character.data:null;localStorage.setItem('emberfall.user',j.username);$('#nm').value=j.username.slice(0,12);return true}catch(e){authMsg('Cannot reach server');return false}}
function goBtn(){if(!NET.on)return start();netAuth().then(ok=>{if(ok)start()})}
function toggleReg(){NET.reg=!NET.reg;$('#go').textContent=NET.reg?'Create account':'Log in';$('#regt').textContent=NET.reg?'Have an account? Log in':'New here? Create account';authMsg('')}
function netSave(force){if(!NET.on||!NET.tok||!P)return;const n=Date.now();if(!force&&n-NET.lastSave<15000)return;NET.lastSave=n;
 try{fetch('/api/save',{method:'PUT',keepalive:true,headers:{'content-type':'application/json',authorization:'Bearer '+NET.tok},body:JSON.stringify(P,(k,v)=>k==='path'||k==='chase'?undefined:v)}).then(r=>{if(r.status===401){NET.tok=null;sys('⚠ Session expired – reload to log in again','#f66')}}).catch(()=>{})}catch(e){}}
function netConnect(){if(!NET.on||!NET.tok)return;const w=new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host+'/ws?token='+encodeURIComponent(NET.tok));NET.ws=w;
 $('#chatin').style.display='block';w.onmessage=ev=>{let m;try{m=JSON.parse(ev.data)}catch{return}
  if(m.t==='players'){NET.online=m.online;const seen=new Set();for(const p of m.l){seen.add(p.id);let o=NET.others.get(p.id);if(!o){o={id:p.id,x:p.x,y:p.y,remote:true,act:true,xp:{},gold:0};NET.others.set(p.id,o)}Object.assign(o,{name:p.n,w:p.w||'sword0',mhp:p.mh||20,flag:p.f||null,fT:p.f?clock+3:0,n:p.n,tx:p.x,ty:p.y,dir:p.d,eq:p.e,hp:p.h,ch:p.c,col:p.k||'#8fd',seen:clock})}
   for(const id of [...NET.others.keys()])if(!seen.has(id))NET.others.delete(id)}
  else if(m.t==='m')netSnap(m);
  else if(m.t==='pong'){NET.ping=Math.round(performance.now()-m.c);netPingUi()}
  else if(m.t==='hurt'){if(P&&!P.dead)playerHit(m.d,null)}
  else if(m.t==='kill')netKill(m.l);
  else if(m.t==='ev'){if(m.k==='proj'&&Math.hypot(m.x-P.x,m.y-P.y)<30)proj.push({x:m.x,y:m.y,vx:m.vx,vy:m.vy,dmg:0,life:m.life,own:'e'})}
  else if(m.t==='shake'){shakeT=3.2;shakeA=3;sfx('boss')}
  else if(m.t==='big')bigMsg(m.m,m.c);
  else if(m.t==='act'){const o=NET.others.get(m.id);if(o){o.swing=.25;o.dir=m.dir;if(m.k==='bolt'&&SPELLS[+m.sp]){const a=DIR[m.dir];proj.push({x:o.x,y:o.y-.3,vx:a[0]*9,vy:a[1]*9,dmg:0,life:1.1,own:'o',sp:+m.sp,sz:3})}}}
  else if(m.t==='phit'){const o=NET.others.get(m.from)||{remote:1,name:m.fn,x:P.x,y:P.y,hp:1,mhp:1};o.act=true;o.remote=true;if(P&&!P.dead&&!safeAt(P.x,P.y))playerHit(m.d,o)}
  else if(m.t==='pk')netGotKill(m);
  else if(m.t==='chat')sys('💬 '+m.n+': '+m.m,'#cfe8ff');else if(m.t==='sys')sys('· '+m.m,'#8aa');
  else if(m.t==='snap'){P.x=m.x;P.y=m.y;P.path=null;sys('⚠ Movement corrected by server','#fc6')}
  else if(m.t==='hello'){sys('🌐 Connected · '+m.online+' online','#9fe3ff');NET.id=m.id;if(m.world){NET.sim=true;NET.em=new Map();E.length=0;boss=null;bots.length=0;roosterT=bossTimer=1e9;m.world.pts.forEach((q,i)=>{if(PTS[i]){PTS[i].x=q[0];PTS[i].y=q[1]}});sys('⚔ Shared world active','#9fe3ff')}}};
 w.onclose=ev=>{NET.ws=null;NET.sim=false;NET.ping=null;netPingUi();if(ev.code===4000)sys('⚠ Logged in from another place','#f66');else setTimeout(netConnect,3000)}}
setInterval(()=>{const w=NET.ws;if(!w||w.readyState!==1||!P||P.dead&&0)return;const tp=NET.lx!=null&&Math.hypot(P.x-NET.lx,P.y-NET.ly)>5;NET.lx=P.x;NET.ly=P.y;w.send(JSON.stringify({t:'pos',x:+P.x.toFixed(2),y:+P.y.toFixed(2),dir:P.dir|0,eq:armLv(eqId('a')),hp:Math.ceil(P.hp),ch:!!P.chicken,col:ARMC[armLv(eqId('a'))],tp,w:eqId('w')||'sword0',mhp:maxHp(),dead:P.dead>0,inside:!!P.inside,f:flagOf(P),xp:P.xp}))},200);
$('#chatin').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){netSay(e.target.value);e.target.value='';e.target.blur()}});['keyup','keypress'].forEach(t=>$('#chatin').addEventListener(t,e=>e.stopPropagation()));
function netPingUi(){const e=$('#ping');if(!e)return;if(NET.ping==null){e.style.display='none';return}e.style.display='block';e.textContent='ping '+NET.ping+' ms'+(NET.ping>250?' ⚠ LAG':'')}
setInterval(()=>{const w=NET.ws;if(w&&w.readyState===1)w.send(JSON.stringify({t:'ping',c:performance.now()}))},2000);
const netSend=o=>{const w=NET.ws;if(w&&w.readyState===1)w.send(JSON.stringify(o))};
function netHit(e,d){if(e.id)netSend({t:'hit',id:e.id,d:Math.round(d)})}
const _ax=applyFx;applyFx=function(e,sp,d){_ax(e,sp,d);if(NET.sim&&e.id)netSend({t:'fx',id:e.id,sp:SPELLS.indexOf(sp),d:Math.round(d)})};
function netAct(k,sp){netSend({t:'act',k,sp:sp|0,dir:P.dir|0,x:P.x,y:P.y})}
const netRem=()=>NET.others?[...NET.others.values()].filter(o=>o.hp>0&&(o.hp<=0?0:1)):[];
function netPvp(V,d){netSend({t:'pvp',to:V.id,d:Math.round(d)})}
function netDied(by){const g=Math.floor(P.gold*.1);P.gold-=g;const sx={};for(const s of SK){const k=s[0],t=Math.floor((P.xp[k]||0)*.01);if(t>0){P.xp[k]-=t;sx[k]=t}}
 const vf=flagOf(P),b=vf==='red'?100*Math.max(1,P.vic||1):0;netSend({t:'pkill',by:by.id,g,sx,b,fl:vf?1:0});P.flag=null;P.fT=0;P.vic=0;sys('💀 '+by.name+' killed you and took '+g+'g + 1% of your skills','#f66')}
function netGotKill(m){const o=NET.others.get(m.who),vf=o?flagOf(o):null;P.gold+=m.g|0;let tot=0;for(const k in m.sx||{}){const t=+m.sx[k]||0;if(t>0&&P.xp[k]!==undefined){gainXp(k,t);tot+=t}}
 sys('🏴‍☠️ Spoils from '+m.n+': +'+(m.g|0)+'g and +'+tot+' skill xp','#ffd36b');P.kills++;P.pvpK=(P.pvpK|0)+1;
 if(m.b>0){P.gold+=m.b;sys('💰 Bounty collected: '+m.b+'g for '+m.n+'!','#ffd36b');toast('💰 +'+m.b+'g bounty')}
 else if(vf!=='orange'&&vf!=='red'){setFlag(P,'red',Infinity);P.vic=(P.vic||0)+1}}
function netSnap(m){const em=NET.em;if(!em)return;
 for(const a of m.a){let e=em.get(a[0]);if(e)continue;if(!ESPEC[a[1]])continue;e=mkEnemy(a[1],a[2],a[3]);Object.assign(e,{id:a[0],hp:a[4],mhp:a[5],dir:a[6],st:a[7],tx:a[2],ty:a[3],hx:a[12],hy:a[13]});if(a[8])e.el=a[8];if(a[9]!==1)e.sc=a[9];else if(e.el)e.sc=1;if(a[10])e.dun=1;if(a[11]>=0){e.pt=a[11];e.temp=1}em.set(e.id,e);E.push(e);if(e.t==='wyrm')boss=e}
 for(const u of m.u){const e=em.get(u[0]);if(!e)continue;e.tx=u[1];e.ty=u[2];e.hp=u[3];e.dir=u[4];e.st=u[5];if(u[6]&1)e.sw=.2}
 if(m.r.length){const rs=new Set(m.r);for(const id of rs){const e=em.get(id);if(e){e.dead=clock+1e9;if(e===boss)boss=null;em.delete(id)}}E=E.filter(e=>!(e.id&&rs.has(e.id)))}
 PT.open=!!m.pt[0];PT.reopen=clock+m.pt[1]}
function netKill(l){for(const k of l){const e=NET.em&&NET.em.get(k.id);if(!e)continue;if(k.by===NET.id||(e.t==='wyrm'&&(P.bossDmg||0)>=40)){e.dead=0;try{meleeT=clock;killEnemy(e)}catch(x){}}if(e.t==='wyrm')P.bossDmg=0;e.dead=clock+1e9}}
function netMobs(dt){const k=Math.min(1,dt*10);for(const e of E){if(e.dead)continue;const dx=e.tx-e.x,dy=e.ty-e.y;e.mv=Math.abs(dx)+Math.abs(dy)>.03;e.x+=dx*k;e.y+=dy*k;if(e.flash>0)e.flash-=dt;if(e.sw>0)e.sw-=dt}}
function netSay(t){t=t.trim();if(t&&NET.ws&&NET.ws.readyState===1)NET.ws.send(JSON.stringify({t:'chat',m:t}))}
function netStep(dt){for(const o of NET.others.values()){const k=Math.min(1,dt*10),dx=o.tx-o.x,dy=o.ty-o.y;o.mv=Math.abs(dx)+Math.abs(dy)>.05;o.swing=(o.swing||0)-dt;o.x+=dx*k;o.y+=dy*k;o.ph=(o.ph||0)+dt*8}}
function netDraw(R,vis){for(const o of NET.others.values())if(vis(o.x,o.y))R.push([o.y*T,()=>{drawChar(Math.round(o.x*T-8),Math.round(o.y*T-14),o.dir,o.ph||0,o.col,'#432',{moving:o.mv,wid:o.w,chick:o.ch,sp:o.swing>0?1-o.swing/.25:-1})}])}
function netLabels(vis,label){for(const o of NET.others.values())if(vis(o.x,o.y))label(o.n,o.x,o.y-1,'#8dffb0')}
async function netBoard(){try{const r=await fetch('/api/board');NET.board=await r.json();if(panelKind==='board')renderPanel()}catch(e){}}
function netPostBoard(ent){if(!NET.on||!NET.tok)return;fetch('/api/board',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+NET.tok},body:JSON.stringify(ent)}).then(()=>netBoard()).catch(()=>{})}
