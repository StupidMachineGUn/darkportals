/* ---------- v0.5: parties, admin tools, jail ---------- */
NET.party=null;NET.pinv=null;NET.adm=0;NET.jail=null;NET.ph=new Map();NET.adl=[];NET.kicked=0;
function pNet(m){const t=m.t;
 if(t==='hello'){NET.adm=m.adm|0;return false}
 if(t==='warp'){tele(m.x,m.y);cam.x=m.x;cam.y=m.y;if(shopSt)shopSt=null;return true}
 if(t==='jl'){const first=!NET.jail;NET.jail={left:m.left,total:m.total,reason:m.reason};if(first)sys('🔒 You are in jail ('+m.reason+'). Dig '+m.left+' potatoes 🥔 to get out!','#fc6');return true}
 if(t==='jr'){NET.jail=null;sys('🔓 You are free! '+(m.why==='admin'?'(released by an admin)':'Sentence served.'),'#9fe3ff');return true}
 if(t==='kick'){NET.leaving=1;try{localStorage.setItem('dp.kick',String(Date.now()+10000))}catch(e){}const o=document.createElement('div');o.style.cssText='position:fixed;inset:0;z-index:99;background:#000d;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;color:#ff8a80;font:bold 28px system-ui;text-align:center';o.innerHTML='⛔ You got kicked<div style="font-size:14px;color:#ccc;font-weight:400">Returning to the welcome screen…</div>';document.body.appendChild(o);setTimeout(()=>location.reload(),2200);return true}
 if(t==='bc'){bcShow(m.m);sys('📢 '+m.m,'#ffd36b');return true}
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

/* logout: save, confirm, back to the welcome screen */
async function logout(){
 if(NET.leaving||NET.outBusy)return;if(NET.on&&P&&(P.hurt>0||(typeof musFightT!=='undefined'&&clock<musFightT)))return toast("⚔ Can't log out during combat – wait a few seconds",'#f99');
 NET.outBusy=1;toast('💾 Saving…');
 try{if(!NET.on){save()}else{let ok=false;if(NET.stale){ok=false}else{for(let i=0;i<3&&!ok;i++){for(let w=0;w<50&&NET.sinf;w++)await new Promise(r=>setTimeout(r,100));ok=!!(await netSave(true));if(!ok&&NET.stale)break;if(!ok)await new Promise(r=>setTimeout(r,800))}}
  if(!ok&&!confirm(NET.stale?'This character was saved elsewhere, so this session cannot save. Log out anyway?':'Could not save. Log out anyway? Recent progress may be lost.')){NET.outBusy=0;return}}}catch(e){}
 NET.leaving=1;try{if(NET.ws)NET.ws.close(1000)}catch(e){}location.reload()}
