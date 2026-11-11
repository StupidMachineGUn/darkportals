/* ---------- v0.5: parties, admin tools, jail ---------- */
NET.party=null;NET.pinv=null;NET.adm=0;NET.jail=null;NET.ph=new Map();NET.adl=[];NET.kicked=0;
function pNet(m){const t=m.t;
 if(t==='hello'){NET.adm=m.adm|0;return false}
 if(t==='warp'){tele(m.x,m.y);cam.x=m.x;cam.y=m.y;if(shopSt)shopSt=null;return true}
 if(t==='jl'){const first=!NET.jail;NET.jail={left:m.left,total:m.total,reason:m.reason};if(first)sys('🔒 You are in jail ('+m.reason+'). Dig '+m.left+' potatoes 🥔 to get out!','#fc6');return true}
 if(t==='jr'){NET.jail=null;sys('🔓 You are free! '+(m.why==='admin'?'(released by an admin)':'Sentence served.'),'#9fe3ff');return true}
 if(t==='kick'){NET.kicked=Date.now()+300000;sys('⛔ You were kicked by an admin','#f66');return true}
 if(t==='pys'){NET.party=m.id?{id:m.id,lead:m.lead,m:m.m}:null;if(!m.id)NET.ph.clear();if(panelKind==='party')renderPanel();return true}
 if(t==='pyi'){NET.pinv={from:m.from,n:m.n,exp:Date.now()+30000};sys('👥 '+m.n+' invites you to a party — open 👥 to accept','#b9f');toast('👥 Party invite from '+m.n,'#b9f');if(panelKind==='party')renderPanel();return true}
 if(t==='pyc'){sys('👥 '+m.n+': '+m.m,'#b9f');return true}
 if(t==='pyh'){NET.ph=new Map(m.h.map(h=>[h[0],h]));if(panelKind==='party')renderPanel();return true}
 if(t==='adl'){NET.adl=m.l;if(panelKind==='admin')renderPanel();return true}
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
function adminHtml(){let h=hdr('🛠 Admin · '+NET.adl.length+' online');h+=`<div class="row">${bt('adr',0,'↻ Refresh')}</div>`;
 for(const p of NET.adl){const me=p.id===NET.id;h+=`<div class="row" style="flex-wrap:wrap"><div style="flex:1;min-width:120px;color:${p.j?'#fc6':'#8dffb0'}">${p.n}${me?' (you)':''}${p.j?' 🔒'+p.j:''}<div class="tip">${p.x},${p.y}</div></div>${me?'':bt('adtp',p.id,'→ TP')+bt('adbring',p.id,'Bring')+bt('adjail',p.id,'Jail 25')+bt('adj50',p.id,'Jail 50')+(p.j?bt('adun',p.id,'Unjail'):'')+bt('adkick',p.id,'Kick')}</div>`}
 return h}
function pAct(a,v){
 if(a==='pyi'){netSend({t:'pyi',to:+v});return true}
 if(a==='pya'){netSend({t:'pya'});NET.pinv=null;return true}
 if(a==='pyd'){netSend({t:'pyd'});NET.pinv=null;return true}
 if(a==='pyl'){netSend({t:'pyl'});return true}
 if(a==='pyk'){netSend({t:'pyk',to:+v});return true}
 if(a==='pyw'){netSend({t:'pyw',to:+v});closePanel();return true}
 if(a==='adr'){netSend({t:'adm',c:'list'});return true}
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
