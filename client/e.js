/* ---------- UI panels ---------- */
const pn=$('#panel');let panelKind=null,sel=-1,npcCur=null;
function openPanel(k,ref){panelKind=k;if(ref)npcCur=ref;sel=-1;pn.style.display='block';renderPanel()}
function closePanel(){panelKind=null;pn.style.display='none'}
const hdr=t=>`<div style="display:flex;justify-content:space-between;align-items:center"><h3>${t}</h3><div class="btn" style="height:32px;min-width:32px;font-size:16px" data-a="close">✕</div></div>`;
const bt=(a,v,t,dis)=>`<div class="btn" style="padding:0 12px;height:36px;font-size:13px;${dis?'opacity:.4;':''}" data-a="${dis?'none':a}" data-v="${v}">${t}</div>`;
const needTxt=(o)=>Object.entries(o).map(([k,v])=>`${ITEMS[k].e}${count(k)}/${v}`).join(' ');
function spareGear(){const o=[];P.inv.forEach((s,i)=>{if(ITEMS[s.id].slot&&!isEq(s))o.push(i)});return o}
function spareCount(id){return count(id)}
function takeSpare(id){take(id)}
function openBld(b){if(b.npc)return enterShop(b);openPanel('house',b)}
function openNpc(n){if(n.dead)return;if(flagOf(P)==='red')return toast('🚫 "We don\'t serve murderers!"','#f66');if(n.role==='shop')openPanel('shop',n);else if(n.role==='smith')openPanel('forge',n);else if(n.role==='inn')openPanel('inn',n);else if(n.role==='bank'){TR=null;openPanel('bank',n)}else if(n.role==='trade')openPanel('trade',n);else if(n.role==='mage')openPanel('mage',n);else if(n.role==='witch')openPanel('witch',n);else openPanel('elder',n)}
function activeQuest(){return QUESTS.find(q=>P.q[q.id])}
function nextQuest(){return QUESTS.find(q=>!P.done[q.id]&&!P.q[q.id])}
function renderPanel(){let h='';const k=panelKind;pn.className=k==='bag'?'bag':'';
 if(k==='book'){h=bookHtml()}else if(k==='mage'){h=mageHtml(false)}else if(k==='witch'){h=mageHtml(true)}else if(k==='party'){h=partyHtml()}else if(k==='admin'){h=adminHtml()}else if(k==='skills'){const tot=SK.reduce((s,x)=>s+lv(x[0]),0);h=hdr('📜 Skills · total '+tot);
  for(const [id,n,e,tip] of SK){const l=lv(id),a=xpAt(l),b=xpAt(l+1),p=l>=99?1:(P.xp[id]-a)/(b-a);h+=`<div class="row"><span class="nm">${e} ${n}</span><span class="lv">${l}</span><div class="b"><i style="width:${p*100}%"></i></div></div><div class="tip" style="margin:-3px 0 4px 100px;opacity:.55">${tip}</div>`}
  h+=`<div class="tip" style="opacity:1">🏷️ Title: <b style="color:#d8c27a">${titleOf(P.xp)?'the '+titleOf(P.xp):'Novice (reach level 10 in a skill)'}</b><br>🎨 Gear color shifts every 10 levels: ⚔️ sword = Melee · 🪄 staff = Magic · 🛡️ armor = Defense</div>`;
  const q=activeQuest();h+=`<div class="tip">❤️ ${Math.ceil(P.hp)}/${maxHp()} · ⚡ ${Math.ceil(P.st)}/${maxSt()} · 🔮 ${Math.floor(P.mp)}/${maxMp()} · 💰 ${P.gold}<br>Kills ${P.kills} · Status ${flagOf(P)?flagOf(P).toUpperCase():'lawful'} · Played ${Math.floor(P.play/60)}m${q?`<br>📜 ${q.t}: ${P.q[q.id].ok?'Done – return to Elder!':P.q[q.id].n+'/'+q.n+' · '+q.d}`:''}</div>`}
 else if(k==='bag'){const eqs=q=>{const s=eqE(q);return `<div class="eqs" data-a="unq" data-v="${q}"><div class="slot ${s?'eq':''}" style="${s?'':'opacity:.35;'}${s&&s.rar?'box-shadow:inset 0 0 10px '+RARC[s.rar]:''}">${s?ITEMS[s.id].e+(s.ench?'<b>✨</b>':''):({w:'🗡️',a:'👕',h:'⛑️',b:'🥾'}[q])}</div>${s?`<span style="color:${RARC[s.rar|0]}">${nameOf(s)}</span><br>tap to remove`:'empty'}</div>`};
  h=`<div class="bagw"><div class="hdl"></div><div class="flap"><div class="btn x" data-a="close">✕</div><h3>🎒 Backpack ${P.inv.length}/24 · 💰 ${P.gold}</h3><div class="doll">${eqs('w')}<canvas id="doll" width="128" height="128"></canvas>${eqs('a')}</div><div class="doll" style="margin-top:-2px">${eqs('h')}${eqs('b')}</div><div class="tip" style="text-align:center;opacity:1">⚔ ATK +${G().atk} · 🔮 MAG +${G().mag} · 🛡 DEF +${G().def}${G().hp?' · ❤ +'+G().hp:''}${G().mp?' · 🔷 +'+G().mp:''}${G().crit?' · 💥 +'+G().crit+'%':''}${G().spd?' · 👟 +'+G().spd+'%':''}</div></div>@@BAR@@<div class="grid">`;
  for(let i=0;i<24;i++){const s=P.inv[i];h+=s?`<div class="slot ${isEq(s)?'eq':''}" data-a="sel" data-v="${i}" style="${sel===i?'background:#6b4a22;':''}${s.rar&&!isEq(s)?'border-color:'+RARC[s.rar]+';':''}${s.rar?'box-shadow:inset 0 0 10px '+RARC[s.rar]:''}">${ITEMS[s.id].e}${s.ench?'<b style="left:3px;right:auto">✨</b>':''}${s.n>1?`<b>${s.n}</b>`:''}</div>`:'<div class="slot"></div>'}h+='</div>';
  let bar='<div class="ibar">Tap an item to see it. Gold outline = equipped.</div>';const s=P.inv[sel];if(s){const it=ITEMS[s.id],eq=isEq(s);bar=`<div class="ibar"><div style="flex:1"><b style="color:${RARC[s.rar|0]}">${it.e} ${nameOf(s)}${s.ench?' ✨':''}</b> · ${valOf(s)}g${it.slot?'<br>'+statLine(s):''}${it.req?` · <span style="color:${lv(it.req[0])<it.req[1]?'#ff8a8a':'inherit'}">needs ${it.req[0]} ${it.req[1]}</span>`:''}${it.heal?` · heals ${it.heal}`:''}${it.mana?` · +${it.mana} mana`:''}${it.raw?' · cook at a fire':''}</div>${it.slot?bt('equip',sel,eq?'Unequip':'Equip'):''}${(it.heal||it.mana||it.shroom)?bt('use',sel,'Use'):''}${!eq?bt('drop',sel,'Drop'):''}</div>`}
  h=h.replace('@@BAR@@',bar);
  h+='</div>'}
 else if(k==='forge'){h=hdr('🔨 Brakka\'s Forge')+`<div class="tip">Smithing ${lv('crafting')} · Forged gear: 30% ✨enchanted · 10% rare · 1% unique · 0.1% legendary</div>`+(()=>{const sp=spareGear(),val=sp.reduce((s,i)=>s+valOf(P.inv[i]),0);return `<div class="row">${bt('sellgear','',`💰 Sell all spare gear (${sp.length} · ${val}g)`,!sp.length)}</div>`})();
  RECIPES.forEach((r,i)=>{const ok=lv('crafting')>=r.lv&&Object.entries(r.need).every(([k,v])=>count(k)>=v),it=ITEMS[r.out];h+=`<div class="row"><span style="font-size:22px">${it.e}</span><div style="flex:1"><b>${it.n}</b> <span class="tip">Lv ${r.lv} · ${it.mag?'MAG +'+it.mag:it.atk?'ATK +'+it.atk:'DEF +'+it.def}<br>${needTxt(r.need)}</span></div>${bt('craft',i,'Forge',!ok)}${bt('craft',i+':5','×5',!ok)}</div>`})}
 else if(k==='shop'){h=hdr('🛒 '+(npcCur?npcCur.n:'Trader')+'\'s Goods · 💰 '+P.gold);for(const id of ['bread','hpotion','potion','staff','hm0','bt0']){const it=ITEMS[id];h+=`<div class="row"><span style="font-size:22px">${it.e}</span><div style="flex:1"><b>${it.n}</b><div class="tip">${it.heal?'heals '+it.heal:it.mana?'+'+it.mana+' mana':it.def?'DEF +'+it.def:'MAG +'+it.mag+' · needs Magic 5'}</div></div>${bt('buy',id,it.buy+'g',P.gold<it.buy)}</div>`}
  h+='<h3 style="margin-top:12px">Sell</h3>';let any=0;for(const s of P.inv){if(ITEMS[s.id].slot&&!isEq(s)){any=1;const it=ITEMS[s.id];h+=`<div class="row"><span style="font-size:22px">${it.e}</span><div style="flex:1;color:${RARC[s.rar|0]}">${nameOf(s)}${s.ench?' ✨':''}<div class="tip">${statLine(s)}</div></div>${bt('sellg',s.u,valOf(s)+'g')}</div>`}}const seen=new Set();for(const s of P.inv){if(ITEMS[s.id].slot||seen.has(s.id))continue;seen.add(s.id);any=1;const n=count(s.id),it=ITEMS[s.id];h+=`<div class="row"><span style="font-size:22px">${it.e}</span><div style="flex:1">${it.n} ×${n}</div>${bt('sell',s.id,'1 · '+it.v+'g')}${bt('sellall',s.id,'All')}</div>`}if(!any)h+='<div class="tip">Nothing to sell.</div>'}
 else if(k==='house'){const b=npcCur,now=Date.now(),mine=P.rent&&P.rent.id===b.id&&P.rent.exp>now,oc=!mine&&occOf(b),left=Math.ceil(rentLeft()/60000);h=hdr('🏠 Cottage #'+(b.id+1)+' · '+b.town);
  if(mine)h+=`<div class="tip" style="font-size:13px;opacity:1">This cottage is yours for <b>${left} more min</b>. Rest safely inside, or go AFK – monsters and players can't reach you. Leave the game open or come back: the rent runs in real time.</div><div class="row">${bt('henter',b.id,'🚪 Enter & rest')}</div><div class="row"><span style="flex:1">Extend</span>${bt('hrent',10,'+10 min · 20g',P.gold<20||left>50)}</div>`;
  else if(oc)h+=`<div class="tip" style="font-size:13px;opacity:1">🔒 Rented by <b>${oc.n}</b> – free again in about ${Math.ceil((oc.exp-now)/60000)} min.</div>`;
  else if(rentLeft()>0)h+=`<div class="tip" style="font-size:13px;opacity:1">You already rent cottage #${P.rent.id+1}.</div>`;
  else{h+=`<div class="tip" style="font-size:13px;opacity:1">"A warm bed and a lock on the door." Rent by the real-life minute: fully recover, stay safe while AFK, and earn <b>+20% skill xp for 15 min</b> after a good rest. 💰 ${P.gold}</div>`;for(const m of [10,20,30,45,60])h+=`<div class="row"><span style="flex:1">⏱ ${m} minutes</span>${bt('hrent',m,HPRICE[m]+'g',P.gold<HPRICE[m])}</div>`}
  {const ins=NET.ws?[...NET.others.values()].filter(o=>o.bd===bldId(b)):[];if(ins.length)h+=`<h3 style="margin-top:10px">👥 Someone is home</h3><div class="tip" style="font-size:13px;opacity:1">${ins.map(o=>o.n).join(', ')}</div><div class="row">${bt('hvisit',b.id,'🚪 Visit together')}</div>`}}
 else if(k==='inn'){h=hdr('🛏️ '+(npcCur?npcCur.n:'Rosa')+'\'s Inn')+`<div class="tip" style="font-size:13px;opacity:1">"Weary traveler! A warm bed restores body, mind and spirit – 10 gold a night."</div><div class="row">${bt('rest',0,'😴 Rest (10g)',P.gold<10)}</div>`}
 else if(k==='elder'){const a=activeQuest(),nq=nextQuest();h=hdr('📜 Elder Maren');
  if(a){const s=P.q[a.id];h+=`<div class="tip" style="font-size:13px;opacity:1"><b>${a.t}</b><br>${a.d}<br>Progress: ${s.n}/${a.n}<br>Reward: ${a.g}g + ${a.xp[1]} ${a.xp[0]} xp</div><div class="row">${bt('turnin',a.id,'Turn in',!s.ok)}</div>`}
  else if(nq)h+=`<div class="tip" style="font-size:13px;opacity:1">"The realm needs heroes. Will you help?"<br><br><b>${nq.t}</b><br>${nq.d}<br>Reward: ${nq.g}g + ${nq.xp[1]} ${nq.xp[0]} xp</div><div class="row">${bt('accept',nq.id,'Accept quest')}</div>`;
  else h+='<div class="tip" style="font-size:13px;opacity:1">"You have done everything I can ask. Hero of Hearthmoor!"</div>'}
 if(k==='skills')h+=optHtml();if(k==='board')h=boardHtml();if(k==='bank')h=bankHtml();else if(k==='trade')h=tradeHtml();
 if(['shop','forge','inn','elder','house','bank','trade','mage','witch'].includes(k))h=h.replace('data-a="close">✕</div></div>','data-a="close">✕</div></div><canvas id="banner" width="160" height="70" style="position:static;inset:auto;width:100%;height:auto;aspect-ratio:160/70;image-rendering:pixelated;border-radius:8px;margin:6px 0;display:block;border:1px solid #5a3a1a"></canvas>');
 pn.innerHTML=h;if(k==='bag')drawDoll();drawBanner(k)}
function drawDoll(){const c=$('#doll');if(!c)return;const x=c.getContext('2d');x.imageSmoothingEnabled=false;const old=g;g=x;x.setTransform(8,0,0,8,0,0);x.clearRect(0,0,16,16);drawChar(0,0,0,0,(eqTint().ta?shade(eqTint().ta,.7):ARMC[armLv(eqId('a'))]),'#3a2a1a',{wid:eqId('w'),tw:eqTint().tw,ta:eqTint().ta,arm:armLv(eqId('a')),helm:eqTier('h'),boots:eqTier('b')});g=old}
pn.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,v=b.dataset.v;
 if(a==='close')return closePanel();if(xAct(a,v)||sAct(a,v)||pAct(a,v)){netSaveSoon();renderPanel();return}if(a==='sel'){sel=+v;return renderPanel()}
 if(a==='unq'){P.eq[v]=null}else if(a==='equip'){const s=P.inv[v],it=ITEMS[s.id];if(P.eq[it.slot]===s.u)P.eq[it.slot]=null;else if(it.req&&lv(it.req[0])<it.req[1])toast(`Need ${it.req[0]} ${it.req[1]}`,'#f66');else{P.eq[it.slot]=s.u;sfx('pick')}}
 else if(a==='use'){const id=P.inv[v].id,it=ITEMS[id];if(it.shroom){take(id);sel=-1;closePanel();return eatShroom()}if(it.heal){if(P.hp>=maxHp())return;P.hp=Math.min(maxHp(),P.hp+it.heal);gainXp('vitality',it.heal*.25)}else{P.mp=Math.min(maxMp(),P.mp+it.mana)}take(id);sfx('heal');sel=-1}
 else if(a==='drop'){P.inv.splice(v,1);sel=-1}
 else if(a==='craft'){const [q0,cnt]=v.split(':'),r=RECIPES[+q0];let made=0,last=null;for(let n=0;n<(+cnt||1);n++){if(!(lv('crafting')>=r.lv&&Object.entries(r.need).every(([k,q])=>count(k)>=q)&&P.inv.length<24))break;const s=addItem(r.out);if(!s)break;rollGear(s,'smith',false);announceGear(s,'Forged');last=s;for(const k in r.need)take(k,r.need[k]);gainXp('crafting',r.xp);made++}if(made){sfx('lvl');burst(P.x,P.y-.5,'#fa3',14);toast(ITEMS[r.out].e+' '+(made>1?ITEMS[r.out].n+' ×'+made:nameOf(last))+' forged!',RARC[made>1?0:last.rar|0])}else if(P.inv.length>=24)toast('Bag full – sell spare gear','#f66')}
 else if(a==='sellgear'){let t=0;for(const i of spareGear().reverse()){t+=valOf(P.inv[i]);P.inv.splice(i,1)}P.gold+=t;sfx('pick');toast('+'+t+'g')}
 else if(a==='sellg'){const i=P.inv.findIndex(s=>s.u==v);if(i>=0&&!isEq(P.inv[i])){P.gold+=valOf(P.inv[i]);P.inv.splice(i,1);sfx('pick')}}

 else if(a==='buy'){const it=ITEMS[v];if(P.gold>=it.buy&&addItem(v)){P.gold-=it.buy;sfx('pick')}}
 else if(a==='sell'){if(count(v)>0&&!ITEMS[v].slot){P.gold+=ITEMS[v].v;take(v);sfx('pick')}}else if(a==='sellall'){if(!ITEMS[v].slot){const n=count(v);P.gold+=ITEMS[v].v*n;take(v,n);sfx('pick')}}
 else if(a==='rest'){if(P.gold<10)return toast('Not enough gold','#f66');P.gold-=10;if(npcCur)P.spawn={x:npcCur.x+.5,y:npcCur.y+1.5};P.hp=maxHp();P.mp=maxMp();P.st=maxSt();sfx('heal');toast('😴 Fully rested');if(P.chicken){P.chicken=0;sys('😴 You sleep like a log and wake up human again!','#9fe3ff')}}
 else if(a==='accept'){P.q[v]={n:0};sys('📜 Quest accepted: '+QUESTS.find(q=>q.id===v).t,'#9cf')}
 else if(a==='turnin'){const q=QUESTS.find(q=>q.id===v);P.gold+=q.g;gainXp(q.xp[0],q.xp[1]);P.done[v]=1;delete P.q[v];sfx('lvl');toast('Quest complete! +'+q.g+'g')}
 else if(a==='hvisit'){closePanel();enterGuest(houses[+v]);return}else if(a==='hrent')rentHouse(npcCur,+v);else if(a==='henter')return enterHouse(npcCur);
 renderPanel()});
$('#bSk').onpointerdown=()=>panelKind==='skills'?closePanel():openPanel('skills');{const bb=document.createElement('div');bb.className='btn';bb.id='bBook';bb.textContent='📖';bb.onpointerdown=()=>panelKind==='book'?closePanel():openPanel('book');$('#top').appendChild(bb)}{const pb=document.createElement('div');pb.className='btn';pb.id='bParty';pb.textContent='👥';pb.onpointerdown=()=>panelKind==='party'?closePanel():openPanel('party');$('#top').appendChild(pb);const ab=document.createElement('div');ab.className='btn';ab.id='bAdm';ab.textContent='🛠';ab.style.display='none';ab.onpointerdown=()=>{if(panelKind==='admin')return closePanel();netSend({t:'adm',c:'list'});openPanel('admin')};$('#top').appendChild(ab);setInterval(()=>{ab.style.display=NET.adm?'':'none'},1000);const ob=document.createElement('div');ob.className='btn';ob.id='bOut';ob.textContent='⏻';ob.title='Log out';ob.onpointerdown=()=>{if(confirm('Save and log out?'))logout()};$('#top').appendChild(ob)}
$('#bBag').onpointerdown=()=>panelKind==='bag'?closePanel():openPanel('bag');
$('#bDev').onpointerdown=ev=>{ev.preventDefault();P.dev=!P.dev;const on=P.dev;
 if(on){P.devBak=JSON.parse(JSON.stringify(P.xp));P.devT=9;for(const s of SK)P.xp[s[0]]=18*98*98+1;P.hp=maxHp();P.mp=maxMp();toast('🛠 DEV ON: all skills 99, all spells (tap 🔮 to switch)','#ffd36b')}
 else{if(P.devBak)P.xp=P.devBak;P.devBak=null;P.hp=Math.min(P.hp,maxHp());P.mp=Math.min(P.mp,maxMp());toast('🛠 DEV OFF: skills restored','#ffd36b')}
 devUi()};
$('#bSp').onpointerdown=ev=>{ev.preventDefault();if(!P.dev)return;P.devT=((P.devT|0)+1)%SPELLS.length;toast(SPELLS[P.devT].e+' '+SPELLS[P.devT].n,'#8cf');devUi()};
function devUi(){const on=!!(typeof P!=='undefined'&&P&&P.dev);$('#bSp').style.display=on?'':'none';if(on)$('#bSp').textContent=SPELLS[P.devT|0].e;$('#bDev').style.outline=on?'2px solid #ffd36b':'none'}
$('#bMute').onpointerdown=e=>{muted=!muted;e.target.textContent=muted?'🔇':'🔊'};
/* ---------- input ---------- */
const stick=$('#stick'),knob=$('#knob');let sid=null;const keys={};
function mv(e){const r=stick.getBoundingClientRect();let dx=(e.clientX-r.left-r.width/2)/48,dy=(e.clientY-r.top-r.height/2)/48;const m=Math.hypot(dx,dy);if(m>1){dx/=m;dy/=m}input.x=dx;input.y=dy;knob.style.transform=`translate(${dx*35}px,${dy*35}px)`}
stick.addEventListener('pointerdown',e=>{sid=e.pointerId;stick.setPointerCapture(sid);mv(e);if(panelKind)closePanel()});
stick.addEventListener('pointermove',e=>{if(e.pointerId===sid)mv(e)});
for(const ev of['pointerup','pointercancel'])stick.addEventListener(ev,e=>{if(e.pointerId===sid){sid=null;input.x=input.y=0;knob.style.transform=''}});
const useBtn=()=>{const t=findTarget();if(t)startInteract(t);else toast('Nothing nearby')};
const hold=(el,on,off)=>{el.addEventListener('pointerdown',e=>{e.preventDefault();on()});for(const ev of['pointerup','pointercancel','pointerleave'])el.addEventListener(ev,off)};
hold($('#bAtk'),()=>{input.atk=true;playerAttack()},()=>input.atk=false);
$('#bUse').addEventListener('pointerdown',useBtn);
$('#bPvp').addEventListener('pointerdown',e=>{stance=!stance;e.currentTarget.textContent=stance?'🏴':'🏳️';e.currentTarget.classList.toggle('on',stance);toast(stance?'⚔ PvP stance ON – hitting innocents makes you a criminal':'PvP stance off',stance?'#fa4':'')});
let runBtn=false;$('#bRun').addEventListener('pointerdown',e=>{runBtn=!runBtn;e.currentTarget.classList.toggle('on',runBtn)});
const HOT=[['🔮',castBolt],['💚',castMend],['🍖',eatBest],['🔥',lightFire],['🍷',drinkHp],['🧪',drinkMp],['🦘',doJump],['🌀',castPortal]];
HOT.forEach(([e,f],i)=>{const d=document.createElement('div');d.className='btn';d.innerHTML=e+'<small></small><div class="cd"></div>';d.addEventListener('pointerdown',ev=>{ev.preventDefault();f()});$('#hot').appendChild(d)});
addEventListener('keydown',e=>{if(e.repeat)return;keys[e.code]=1;if(e.code==='Space'){input.atk=true;playerAttack();e.preventDefault()}
 else if(e.code==='KeyE')useBtn();else if(e.code==='Digit1')castBolt();else if(e.code==='Digit2')castMend();else if(e.code==='Digit3')eatBest();else if(e.code==='Digit4')lightFire();else if(e.code==='Digit5')drinkHp();else if(e.code==='Digit6')drinkMp();else if(e.code==='Digit7'||e.code==='KeyJ')doJump();else if(e.code==='Digit8'||e.code==='KeyP')castPortal();
 else if(e.code==='KeyI')panelKind==='bag'?closePanel():openPanel('bag');else if(e.code==='KeyB')panelKind==='book'?closePanel():openPanel('book');else if(e.code==='KeyK')panelKind==='skills'?closePanel():openPanel('skills');else if(e.code==='Escape')closePanel()});
addEventListener('keyup',e=>{keys[e.code]=0;if(e.code==='Space')input.atk=false});
function go(t,tx,ty){P.chase=null;stopAct();const p=setPath(tx,ty,true);if(!p)return toast("Can't reach that",'#f99');P.path=p;goal=t}
function tap(e){if(panelKind){closePanel();return}if(P.dead)return;
 const wx=cam.x+(e.clientX*DPR-cv.width/2)/(T*S),wy=cam.y+(e.clientY*DPR-cv.height/2)/(T*S),tx=Math.floor(wx),ty=Math.floor(wy);
 for(const a of [...bots,...guards,...npcs]){if(a.dead)continue;if(Math.hypot(AX(a)-wx,AY(a)-.4-wy)<.8){
  if(stance||isCrim(a)){P.chase=a;goal=null;stopAct();P.path=null;if(!isCrim(a))toast('⚔ Attacking '+nm(a)+' makes you a criminal','#fa4');return}
  if(a.npc)break;return toast(nm(a)+(a.xp&&titleOf(a.xp)?' the '+titleOf(a.xp):'')+(flagOf(a)?' · '+flagOf(a).toUpperCase():' · innocent')+(a.guard?' · protects the realm':''),FCOL[flagOf(a)]||'#9fe3ff')}}
 for(const en of E)if(!en.dead&&Math.hypot(en.x-wx,en.y-(en.t==='wyrm'?1:.4)-wy)<(en.t==='wyrm'?1.6:.85)){P.chase=en;goal=null;stopAct();P.path=null;return}
 for(const b of buildings)if(wx>=b.x-.3&&wx<b.x+b.w+.3&&wy>=b.y-1&&wy<b.y+b.h+.5)return go({kind:'bld',ref:b,x:b.dx,y:b.dy},b.dx,b.dy);
 for(const n of npcs)if(!n.dead&&Math.abs(n.x+.5-wx)<.7&&Math.abs(n.y+.2-wy)<1)return go({kind:'npc',ref:n,x:n.x,y:n.y},n.x,n.y);
 let o=objAt.get(idx(tx,ty));if(!o||(o.dead&&o.t!=='fire'))o=objAt.get(idx(tx,ty+1));if(o&&o.t==='tree'&&!o.dead&&o.y===ty+1||o&&o===objAt.get(idx(tx,ty))&&!o.dead)return go({kind:'obj',ref:o,x:o.x,y:o.y},o.x,o.y);
 if(isWater(tx,ty))return go({kind:'fish',x:tx,y:ty},tx,ty);
 if(walkable(tx,ty)){P.chase=null;stopAct();const p=setPath(tx,ty,false);if(p){P.path=p;goal=null;marker={x:tx,y:ty,t:clock}}}}
const ptrs=new Map();let pinch=null,moved=false;
const pdist=()=>{const [a,b]=[...ptrs.values()];return Math.hypot(a.x-b.x,a.y-b.y)||1};
cv.addEventListener('pointerdown',e=>{try{cv.setPointerCapture(e.pointerId)}catch(_){}ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY});
 if(ptrs.size===2){pinch={d:pdist(),s:S};moved=true}else if(ptrs.size===1)moved=false});
cv.addEventListener('pointermove',e=>{const p=ptrs.get(e.pointerId);if(!p)return;p.x=e.clientX;p.y=e.clientY;if(Math.hypot(p.x-p.sx,p.y-p.sy)>12)moved=true;
 if(pinch&&ptrs.size===2){userS=clamp(Math.round(pinch.s*pdist()/pinch.d),2,9);S=userS}});
const pend=e=>{if(!ptrs.has(e.pointerId))return;const was=ptrs.size===1&&!moved&&e.type==='pointerup';ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;if(was)tap(e);if(!ptrs.size)moved=false};
cv.addEventListener('pointerup',pend);cv.addEventListener('pointercancel',pend);
cv.addEventListener('wheel',e=>{e.preventDefault();userS=clamp((userS||S)+(e.deltaY<0?1:-1),2,9);S=userS},{passive:false});
/* ---------- hud + loop ---------- */
function bar(id,v,m,txt){const e=$('#'+id);e.firstChild.style.width=clamp(v/m*100,0,100)+'%';e.lastChild.textContent=txt}
function updateHud(){bar('hp',P.hp,maxHp(),`❤ ${Math.ceil(P.hp)}/${maxHp()}`);bar('st',P.st,maxSt(),`⚡ ${Math.ceil(P.st)}/${maxSt()}`);bar('mp',P.mp,maxMp(),`🔮 ${Math.floor(P.mp)}/${maxMp()}`);
 const tot=SK.reduce((s,x)=>s+lv(x[0]),0);bar('xp',1,1,`Total level ${tot} · 💰${P.gold}`);
 const k=Math.cos(((clock+90)/420%1)*6.2832);document.body.classList.toggle('trip',P.shroomT>0);$('#where').textContent=zoneName()+(k<-.2?' 🌙':' ☀️')+(boss?' 🐉':'')+(P.shroomT>0?' 🍄'+Math.ceil(P.shroomT)+'s':'')+(P.chicken?' 🐔':'')+(flagOf(P)?` ${{orange:'🟠',red:'🔴',blue:'🔵'}[flagOf(P)]}${P.fT===Infinity?'':Math.ceil(P.fT-clock)+'s'}`:'');
 const bb=$('#boss'),bo=boss&&!boss.dead;bb.style.display=bo?'block':'none';if(bo)bar('boss',boss.hp,boss.mhp,'🐉 Ember Wyrm');
 const hb=$('#hot').children,food=P.inv.reduce((s,i)=>s+((ITEMS[i.id].heal&&!ITEMS[i.id].pot)?i.n:0),0);
 {const ss=supOf(P.book.es)||SUP[0];if(hb[1].dataset.t!==ss.e){hb[1].dataset.t=ss.e;hb[1].firstChild.nodeValue=ss.e}hb[1].style.opacity=lv('magic')>=ss.lv?1:.4;hb[1].querySelector('small').textContent=Math.floor(P.mp/ss.mp)}hb[2].querySelector('small').textContent=food;hb[3].querySelector('small').textContent=count('log');hb[0].querySelector('small').textContent=Math.floor(P.mp/(4+spellTier()*2));{const sp=SPELLS[spellTier()];if(hb[0].dataset.t!=sp.e){hb[0].dataset.t=sp.e;hb[0].firstChild.nodeValue=sp.e;hb[0].style.boxShadow='0 0 8px '+(sp.c||'#fff')}}hb[4].querySelector('small').textContent=count('hpotion');hb[5].querySelector('small').textContent=count('potion');{const pr=(P.portAt||0)-Date.now();hb[7].querySelector('small').textContent=portCh?Math.ceil(portCh.left)+'s':pr>0?Math.ceil(pr/60000)+'m':''}document.body.classList.toggle('low',P.hp<maxHp()*.25&&!P.dead);
 [CD.bolt/CDM.bolt,CD.mend/(CDM.mend||2),CD.eat/1.1,CD.fire,CD.hpot/1.5,CD.mpot/1.5,CD.jump,Math.max(0,((P.portAt||0)-Date.now())/PORT_CD)].forEach((c,i)=>hb[i].querySelector('.cd').style.height=clamp(c,0,1)*100+'%')}
let last=0,hudT=0,saveT=0,HB=0;
function loop(t){requestAnimationFrame(loop);const dt=Math.min(.05,(t-last)/1000||0);last=t;
 if(sid===null){input.x=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);input.y=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0)}
 input.run=runBtn||!!keys.ShiftLeft;try{if(!paused)update(dt)}catch(x){reportErr('update',x)}try{render();drawMini()}catch(x){reportErr('render',x);if(ERR.n%30===1)healCanvas()}HB=(HB||0)+dt;if(HB>6){HB=0;if(canvasBlank())healCanvas()}hudT+=dt;if(hudT>.1){hudT=0;updateHud()}saveT+=dt;if(saveT>8){saveT=0;save()}}
function migrate(p){for(const s of p.inv)if(ITEMS[s.id]&&ITEMS[s.id].slot&&!s.u)s.u=uid();p.eq.h=p.eq.h||null;p.eq.b=p.eq.b||null;for(const k of['w','a']){if(typeof p.eq[k]==='string'){const s=p.inv.find(i=>i.id===p.eq[k]);p.eq[k]=s?s.u:null}}UID=Math.max(UID,...p.inv.map(i=>i.u||0))}
function start(){const name=((NET.on?$('#nm'):$('#nm2')).value.trim()||'Hero').slice(0,12);genWorld();carveDungeon();buildTiles();buildSprites();spawnEnemies();spawnVillageMobs();makeElites();spawnBots();spawnChickens();spawnSheep();spawnDungeon();spawnPortals();for(let i=0;i<18;i++)spawnShroom();buildMini();
 const s=load();P=Object.assign(newPlayer(name),s&&s.name===name?s:{});migrate(P);bookInit();P.flag=P.wanted?'red':null;P.fT=P.wanted?Infinity:0;P.vic=P.wanted||0;P.path=null;P.chase=null;P.dead=0;P.hurt=0;P.cd=0;P.swing=0;P.hp=Math.min(P.hp,maxHp());if(!walkable(Math.floor(P.x),Math.floor(P.y))){P.x=CX+.5;P.y=CY+3.5;P.inside=null}if(P.inside!=null&&!(P.rent&&P.rent.id===P.inside&&rentLeft()>0)){leaveHouse()}else if(P.inside!=null){P.hp=maxHp();P.mp=maxMp();P.st=maxSt()}cam.x=P.x;cam.y=P.y;resize();$('#title').style.display='none';
 {const returning=s&&s.name===name;houses.forEach(h=>{if(Math.random()<.35)h.occ={n:pick(BN),exp:Date.now()+ri(3,55)*60000}});if(!returning)showStory()}
 sys('Welcome to Dark Portals, '+name+'! Every skill grows by using it.','#fff');sys('Tip: tap trees, rocks, water or monsters. Villages are safe zones with guards. Talk to Elder Maren for quests.','#9cf');
 try{AC=AC||new(window.AudioContext||window.webkitAudioContext)()}catch(e){}xInit();devUi();netConnect();requestAnimationFrame(loop)}
welcomeInit();
document.addEventListener('visibilitychange',()=>{if(P)save()});
addEventListener('beforeunload',()=>{if(P)save()});
</script></body></html>
