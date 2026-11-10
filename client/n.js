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
  if(m.t==='players'){NET.online=m.online;const seen=new Set();for(const p of m.l){seen.add(p.id);let o=NET.others.get(p.id);if(!o){o={id:p.id,x:p.x,y:p.y};NET.others.set(p.id,o)}Object.assign(o,{n:p.n,tx:p.x,ty:p.y,dir:p.d,eq:p.e,hp:p.h,ch:p.c,col:p.k||'#8fd',seen:clock})}
   for(const id of [...NET.others.keys()])if(!seen.has(id))NET.others.delete(id)}
  else if(m.t==='chat')sys('💬 '+m.n+': '+m.m,'#cfe8ff');else if(m.t==='sys')sys('· '+m.m,'#8aa');
  else if(m.t==='snap'){P.x=m.x;P.y=m.y;P.path=null;sys('⚠ Movement corrected by server','#fc6')}
  else if(m.t==='hello')sys('🌐 Connected · '+m.online+' online','#9fe3ff')};
 w.onclose=ev=>{NET.ws=null;if(ev.code===4000)sys('⚠ Logged in from another place','#f66');else setTimeout(netConnect,3000)}}
setInterval(()=>{const w=NET.ws;if(!w||w.readyState!==1||!P||P.dead&&0)return;const tp=NET.lx!=null&&Math.hypot(P.x-NET.lx,P.y-NET.ly)>5;NET.lx=P.x;NET.ly=P.y;w.send(JSON.stringify({t:'pos',x:+P.x.toFixed(2),y:+P.y.toFixed(2),dir:P.dir|0,eq:armLv(eqId('a')),hp:Math.ceil(P.hp),ch:!!P.chicken,col:ARMC[armLv(eqId('a'))],tp}))},200);
$('#chatin').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){netSay(e.target.value);e.target.value='';e.target.blur()}});['keyup','keypress'].forEach(t=>$('#chatin').addEventListener(t,e=>e.stopPropagation()));
function netSay(t){t=t.trim();if(t&&NET.ws&&NET.ws.readyState===1)NET.ws.send(JSON.stringify({t:'chat',m:t}))}
function netStep(dt){for(const o of NET.others.values()){const k=Math.min(1,dt*10),dx=o.tx-o.x,dy=o.ty-o.y;o.mv=Math.abs(dx)+Math.abs(dy)>.05;o.x+=dx*k;o.y+=dy*k;o.ph=(o.ph||0)+dt*8}}
function netDraw(R,vis){for(const o of NET.others.values())if(vis(o.x,o.y))R.push([o.y*T,()=>{drawChar(Math.round(o.x*T-8),Math.round(o.y*T-14),o.dir,o.ph||0,o.col,'#432',{moving:o.mv,wid:'sword0',chick:o.ch})}])}
function netLabels(vis,label){for(const o of NET.others.values())if(vis(o.x,o.y))label(o.n,o.x,o.y-1,'#8dffb0')}
async function netBoard(){try{const r=await fetch('/api/board');NET.board=await r.json();if(panelKind==='board')renderPanel()}catch(e){}}
function netPostBoard(ent){if(!NET.on||!NET.tok)return;fetch('/api/board',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+NET.tok},body:JSON.stringify(ent)}).then(()=>netBoard()).catch(()=>{})}
