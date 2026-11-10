/* ---------- state ---------- */
let P,E=[],bots=[],proj=[],floats=[],parts=[],boss=null,clock=0,bossTimer=75,cam={x:CX,y:CY+2};
const input={x:0,y:0,run:false,atk:false};
const DIR=[[0,1],[-1,0],[1,0],[0,-1]];
const Net={h:{},on(t,f){(this.h[t]=this.h[t]||[]).push(f)},emit(t,d){(this.h[t]||[]).forEach(f=>f(d))},
  send(t,d){/* SERVER PHASE: ws.send(JSON.stringify({t,d})) – local build just echoes */Net.emit('sent:'+t,d)}};
Net.on('chat',m=>chat(`<b style="color:${m.col||'#9cf'}">${m.from}:</b> ${m.text}`));
function chat(html){const c=$('#chat'),d=document.createElement('div');d.innerHTML=html;c.appendChild(d);while(c.children.length>7)c.firstChild.remove();setTimeout(()=>d.remove(),14000)}
const sys=(t,c='#ffd36b')=>chat(`<span style="color:${c}">${t}</span>`);
function toast(t,c){const e=$('#toast');e.textContent=t;e.style.color=c||'';e.style.transition='none';e.style.opacity=1;e.style.transform='translate(-50%,0)';requestAnimationFrame(()=>{e.style.transition='opacity 1.6s .6s,transform 2.2s';e.style.opacity=0;e.style.transform='translate(-50%,-30px)'})}
/* audio */
let AC,muted=false;
function tone(f,d,ty='square',v=.06,delay=0,f2){if(muted)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const t=AC.currentTime+delay,o=AC.createOscillator(),g=AC.createGain();o.type=ty;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+d)}catch(e){}}
const SFX={hit:()=>tone(180,.1,'square',.08,0,60),miss:()=>tone(500,.07,'triangle',.04,0,300),crit:()=>{tone(300,.12,'sawtooth',.08,0,80);tone(900,.1,'square',.04,.03)},
 lvl:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.25,'triangle',.08,i*.1)),pick:()=>tone(880,.08,'triangle',.05,0,1320),chop:()=>tone(120,.06,'square',.06,0,80),
 splash:()=>tone(700,.15,'sine',.04,0,200),bolt:()=>tone(900,.18,'sawtooth',.04,0,200),hurt:()=>tone(150,.2,'sawtooth',.08,0,50),heal:()=>{tone(660,.15,'sine',.05);tone(880,.2,'sine',.05,.1)},bawk:()=>{tone(520,.07,'square',.04,0,780);tone(430,.1,'square',.04,.08,300)},boss:()=>[110,98,82].forEach((f,i)=>tone(f,.5,'sawtooth',.09,i*.35))};
const sfx=k=>SFX[k]&&SFX[k]();
/* ---------- player ---------- */
let UID=1000;const uid=()=>++UID;
const newPlayer=name=>{const s0={id:'sword0',n:1,u:uid()},a0={id:'arm0',n:1,u:uid()};return{name,x:CX+.5,y:CY+1.5,hp:30,mp:15,st:30,xp:Object.fromEntries(SK.map(s=>[s[0],0])),inv:[{id:'bread',n:3},s0,a0],gold:25,eq:{w:s0.u,a:a0.u,h:null,b:null},q:{},done:{},kills:0,play:0,dir:0}};
const lv=k=>lvOf(P.xp[k]);
const TITLES={melee:['Fighter','Swordsman','Warlord','Blademaster'],defense:['Defender','Sentinel','Bulwark','Iron Titan'],magic:['Apprentice','Mage','Sorcerer','Archmage'],agility:['Runner','Scout','Pathfinder','Windwalker'],vitality:['Hardy One','Survivor','Unyielding','Immortal'],woodcut:['Woodcutter','Lumberjack','Forester','Treewarden'],mining:['Digger','Miner','Delver','Stonebreaker'],fishing:['Angler','Fisherman','Seafarer','Sea Lord'],cooking:['Cook','Chef','Gourmet','Master Chef'],crafting:['Smith','Blacksmith','Armorer','Grandsmith']};
const PAIRS={'defense+melee':'Knight','magic+melee':'Spellblade','agility+melee':'Duelist','agility+magic':'Trickster','defense+vitality':'Juggernaut','crafting+mining':'Artisan','cooking+fishing':'Seaside Chef','defense+magic':'Warmage','crafting+woodcut':'Carpenter'};
function titleOf(xp){const a=SK.map(s=>[s[0],lvOf(xp[s[0]]||0)]).sort((p,q)=>q[1]-p[1]);const [k1,l1]=a[0],[k2,l2]=a[1];if(l1<10)return null;
 if(l2>=10&&l2>=l1*.7){const pk=[k1,k2].sort().join('+');if(PAIRS[pk])return PAIRS[pk]}return TITLES[k1][l1>=75?3:l1>=50?2:l1>=25?1:0]}
const TINTS=[null,'#5ac85a','#5a9aff','#b46aff','#ff9a1a','#ff4a4a','#4af0ff','#ffd34a','#ff7ad9'];
function hsl2hex(h,s,l){const f=n=>{const k=(n+h/30)%12,a=s*Math.min(l,1-l);return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1))))};return '#'+((1<<24)+(f(0)<<16)+(f(8)<<8)+f(4)).toString(16).slice(1)}
function shade(hex,f){const n=parseInt(hex.slice(1),16),r=Math.min(255,Math.round((n>>16&255)*f)),g2=Math.min(255,Math.round((n>>8&255)*f)),b2=Math.min(255,Math.round((n&255)*f));return '#'+((1<<24)+(r<<16)+(g2<<8)+b2).toString(16).slice(1)}
function tintFor(l){const t=Math.min(9,Math.floor(l/10));return !t?null:t===9?hsl2hex((clock*60)%360,.8,.6):TINTS[t]}
const eqTint=()=>{const w=eqE('w'),a=eqE('a');return{tw:w?tintFor(ITEMS[w.id].mag?lv('magic'):lv('melee')):null,ta:a?tintFor(lv('defense')):null}};

const maxHp=()=>20+lv('vitality')*5+lv('defense')*2+G().hp,maxSt=()=>20+lv('agility')*4,maxMp=()=>10+lv('magic')*4+G().mp;
const RM=[1,1.25,1.5,2],RF=[0,1,2,4],RARC=['#e8e0d0','#5aa8ff','#b46aff','#ff9a1a'],RARN=['','Rare ','Unique ','Legendary '],RVAL=[1,2.5,6,20];
const ENCH={atk:['Might','ATK'],def:['Warding','DEF'],mag:['Sorcery','MAG'],hp:['Vitality','HP'],mp:['the Mind','MP'],crit:['Precision','CRIT%'],spd:['Swiftness','SPD%']};
const isEq=s=>!!s&&(P.eq.w===s.u||P.eq.a===s.u||P.eq.h===s.u||P.eq.b===s.u),eqE=k=>P.inv.find(i=>i.u===P.eq[k])||null,eqId=k=>{const e=eqE(k);return e?e.id:null};
const eqTier=k=>{const id=eqId(k);if(!id)return -1;const it=ITEMS[id];return it.tier!=null?it.tier:(ARMI[id]||0)};
function statOf(s){const b=ITEMS[s.id],r=s.rar|0,o={atk:0,def:0,mag:0,hp:0,mp:0,crit:0,spd:0};
 if(b.slot==='w'){if(b.mag){o.mag=Math.round(b.mag*RM[r])+RF[r];o.atk=Math.round((b.atk||0)*RM[r])}else o.atk=Math.round((b.atk||0)*RM[r])+RF[r]}
 else o.def=Math.round((b.def||0)*RM[r])+RF[r];
 if(s.ench)o[s.ench.t]+=s.ench.v;return o}
const nameOf=s=>{const b=ITEMS[s.id];return b.slot?RARN[s.rar|0]+b.n+(s.ench?' of '+ENCH[s.ench.t][0]:''):b.n};
const valOf=s=>{const b=ITEMS[s.id];return b.slot?Math.round(b.v*RVAL[s.rar|0]+(s.ench?b.v*.5:0)):b.v};
function statLine(s){const o=statOf(s);return Object.keys(o).filter(k=>o[k]).map(k=>(ENCH[k]?ENCH[k][1]:k.toUpperCase())+' +'+o[k]).join(' · ')}
function G(){const g={atk:0,def:0,mag:0,hp:0,mp:0,crit:0,spd:0};for(const k of['w','a','h','b']){const e=eqE(k);if(e){const o=statOf(e);for(const x in g)g[x]+=o[x]}}return g}
const W_=()=>({atk:G().atk,mag:G().mag}),A_=()=>({def:G().def});
function gainXp(k,a){if(P.rested>Date.now())a*=1.2;const o=lv(k);P.xp[k]+=a;const n=lv(k);if(n>o){const s=SK.find(s=>s[0]===k);toast(`${s[2]} ${s[1]} level ${n}!`);sys(`${s[2]} ${s[1]} is now level ${n}!`,'#7dff9b');sfx('lvl');burst(P.x,P.y-.5,'#ffd36b',24);
  if(k==='magic'&&n===5)sys('🔮 You learned Mend! (hotbar 2)','#9cf');if(k==='magic'&&Math.floor(n/10)>Math.floor(o/10)){const sp=SPELLS[Math.min(9,Math.floor(n/10))];sys(`✨ Your spell evolved: ${sp.e} ${sp.n}!`,'#d9a6ff');toast(sp.e+' '+sp.n+'!')}if(k==='vitality'||k==='defense')P.hp=Math.min(maxHp(),P.hp+5)}}
const count=id=>P.inv.reduce((s,i)=>s+(i.id===id?i.n:0),0);
function addItem(id,n=1,extra){const it=ITEMS[id];if(it.slot){if(P.inv.length>=24){toast('Bag full!','#f66');return false}const s={id,n:1,u:uid(),...(extra||{})};P.inv.push(s);return s}if(!it.slot){const s=P.inv.find(i=>i.id===id);if(s){s.n+=n;return true}}if(P.inv.length>=24){toast('Bag full!','#f66');return false}P.inv.push({id,n});return true}
function take(id,n=1){for(let i=0;i<P.inv.length&&n>0;i++){const s=P.inv[i];if(s.id!==id)continue;const t=Math.min(n,s.n);s.n-=t;n-=t;if(!s.n){P.inv.splice(i,1);i--}}}
const canStand=(x,y,r=.28)=>walkable(Math.floor(x-r),Math.floor(y-r))&&walkable(Math.floor(x+r),Math.floor(y-r))&&walkable(Math.floor(x-r),Math.floor(y+r))&&walkable(Math.floor(x+r),Math.floor(y+r));
function moveEnt(e,dx,dy){if(canStand(e.x+dx,e.y))e.x+=dx;if(canStand(e.x,e.y+dy))e.y+=dy}
function fl(x,y,s,c='#fff'){floats.push({x,y,s,c,life:1})}
function burst(x,y,c,n=8,sp=3){for(let i=0;i<n;i++){const a=rnd(0,6.28),v=rnd(.3,1)*sp;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1,life:rnd(.3,.7),c,sz:rnd(1,2.5)})}}
function onEvent(k){for(const q of QUESTS){const s=P.q[q.id];if(s&&!s.ok&&q.k===k){s.n++;if(s.n>=q.n){s.ok=1;sys(`📜 Quest "${q.t}" complete! Return to Elder Maren.`,'#9cf');toast('Quest complete!')}}}}
/* ---------- gear rolls & drops ---------- */
const TOUGH=new Set(['rooster','golem','ogre','wraith','troll','demon','wyrm','guard']);
const GEAR_DROPS={slime:[.01,['sword1','hm0','bt0']],goblin:[.04,['sword1','hm0','bt0','dagger1']],bat:[.01,['hm0','bt0']],wolf:[.03,['sword1','arm1','hm0','bt0','hm1']],spider:[.05,['hm1','bt1','dagger1','bt0']],skeleton:[.05,['sword1','arm1','sword2','hm1','bt1','dagger1']],
 orc:[.07,['sword2','arm1','arm2','staff','hm2','bt2','axe1','mace1','dagger1']],bandit:[.10,['dagger1','axe1','mace1','hm2','bt2','spear1','arm2','sword2']],ogre:[.10,['sword2','arm2','sword3','arm3','hm3','bt3','axe2','spear1','mace1']],
 wraith:[.10,['staff','staff2','sword3','staff4']],golem:[.12,['mace1','axe2','hm3','bt3','arm3','great1','hm4','bt4']],troll:[.12,['sword3','arm3','staff2','sword4','hm4','bt4','hm5','bt5','axe2','great1','staff4']],
 demon:[.15,['sword4','arm4','staff3','arm3','hm5','bt5','sword5','arm5','hm6','bt6','staff4','staff5','great1']],rooster:[.5,['sword3','arm3','hm3','bt3','axe2','hm4','bt4','mace1','spear1']],wyrm:[1,['arm3','sword4','staff3','scalearm','arm4','hm4','bt4','hm5','bt5','sword5','arm5']],guard:[.12,['sword2','arm2','sword3','hm2','bt2']],npc:[.04,['sword1','arm1']]};
const ENDGAME=['sword6','arm6','hm7','bt7','axe3','staff5','sword7','arm7','hm8','bt8','staff6','hm6','bt6'];
function rollGear(s,src,tough){const smith=src==='smith',k=smith?1:.1,q=Math.random(),b=ITEMS[s.id];
 s.rar=q<.001*k?3:q<.011*k?2:q<.111*k?1:0;
 if(Math.random()<(smith?.30:tough?.10:.03)){const t=b.slot!=='w'?pick(['def','hp','spd','mp']):b.mag?pick(['mag','mp','crit']):pick(['atk','crit','hp']);
  s.ench={t,v:t==='hp'?ri(5,12):t==='mp'?ri(4,8):(t==='crit'||t==='spd')?ri(3,6):ri(1,3)}}
 return s}
function announceGear(s,verb){const r=s.rar|0;if(!r&&!s.ench)return;const nmx=nameOf(s)+(s.ench?' ✨':'');sys(`${r>=2?'🌟 ':'🎁 '}${verb} ${nmx} (${statLine(s)})`,RARC[r]);if(r===3){toast('🌟 LEGENDARY '+ITEMS[s.id].n+'!',RARC[3]);sfx('lvl')}else if(r===2){toast('💜 UNIQUE '+ITEMS[s.id].n+'!',RARC[2])}else if(r===1||s.ench)sfx('pick')}
function dropGear(src,tough){const d=GEAR_DROPS[src];if(!d||Math.random()>=d[0])return;const s=addItem((src==='demon'&&Math.random()<.14)||(src==='golem'&&Math.random()<.03)||(src==='wyrm'&&Math.random()<.5)?pick(ENDGAME):pick(d[1]));if(!s)return;rollGear(s,'mob',tough);fl(P.x,P.y-1,'🎁','#fff');sys('🎁 Loot: '+nameOf(s)+(s.ench?' ✨':''),RARC[s.rar|0]);announceGear(s,'You found')}
/* ---------- actions (gathering) ---------- */
let act=null;
function stopAct(){act=null}
function startAct(kind,ref,dur){act={kind,ref,t:0,dur};P.path=null}
function updAct(dt){if(!act)return;act.t+=dt;if(act.kind!=='cook'&&Math.random()<dt*5)burst(act.ref.x+.5,act.ref.y+.5,act.kind==='fish'?'#bfe6ff':'#ddd',1,1.2);
 if(act.t<act.dur)return;act.t=0;const a=act;
 if(a.kind==='chop'){sfx('chop');const l=lv('woodcut');if(Math.random()<clamp(.35+l*.02,.35,.92)){if(!addItem('log'))return stopAct();gainXp('woodcut',12);fl(a.ref.x+.5,a.ref.y,'+🪵','#ffd9a0');onEvent('log');sfx('pick');if(--a.ref.hp<=0){a.ref.dead=clock+28;solid[idx(a.ref.x,a.ref.y)]=0;stopAct()}}}
 else if(a.kind==='mine'){sfx('chop');const l=lv('mining'),iron=a.ref.ore==='iron';if(Math.random()<clamp(.3+l*.02-(iron?.1:0),.2,.9)){if(!addItem(a.ref.ore))return stopAct();gainXp('mining',iron?42:15);fl(a.ref.x+.5,a.ref.y,'+'+ITEMS[a.ref.ore].e,'#fff');onEvent('ore');sfx('pick');
   if(Math.random()<.004+l*.0003){addItem('gem');sys('💎 You found an Ember Gem!','#ff9bff');sfx('lvl')}
   if(--a.ref.hp<=0){a.ref.dead=clock+32;solid[idx(a.ref.x,a.ref.y)]=0;stopAct()}}}
 else if(a.kind==='fish'){sfx('splash');const l=lv('fishing');if(Math.random()<clamp(.4+l*.02,.4,.9)){let f='shrimp';if(l>=20&&Math.random()<.3)f='salmon';else if(l>=8&&Math.random()<.45)f='trout';
   if(!addItem(f))return stopAct();gainXp('fishing',{shrimp:12,trout:35,salmon:80}[f]);fl(a.ref.x+.5,a.ref.y,'+'+ITEMS[f].e,'#bfe6ff');onEvent('fish');sfx('pick')}}
 else if(a.kind==='bush'){gainXp('vitality',3);addItem('berry',ri(1,2));fl(a.ref.x+.5,a.ref.y,'+🍇','#f9a');sfx('pick');a.ref.dead=clock+20;stopAct()}
 else if(a.kind==='cook'){const raw=P.inv.find(i=>ITEMS[i.id].raw);if(!raw)return stopAct();const it=ITEMS[raw.id];take(raw.id);
   if(Math.random()<Math.max(.06,.55-lv('cooking')*.025-(P.inv.length?0:0))){fl(P.x,P.y-.5,'Burnt!','#999')}else{addItem(it.raw);gainXp('cooking',8+it.v*3);fl(P.x,P.y-.7,'+'+ITEMS[it.raw].e,'#ffd36b');sfx('pick')}
   if(!P.inv.some(i=>ITEMS[i.id].raw))stopAct()}}
function startInteract(t){const d=Math.atan2(t.y+.5-P.y,t.x+.5-P.x);P.dir=Math.abs(Math.cos(d))>Math.abs(Math.sin(d))?(Math.cos(d)>0?2:1):(Math.sin(d)>0?0:3);
 if(t.kind==='npc')return openNpc(t.ref);
 if(t.kind==='bld')return openBld(t.ref);
 const o=t.ref;
 if(t.kind==='fish'){return startAct('fish',{x:t.x,y:t.y},Math.max(1.2,2.6-lv('fishing')*.03))}
 if(o.t==='tree'){if(o.dead)return;return startAct('chop',o,Math.max(.9,2.2-lv('woodcut')*.03))}
 if(o.t==='rock'){if(o.dead)return;if(o.ore==='iron'&&lv('mining')<8)return toast('Need Mining 8 for iron','#f66');return startAct('mine',o,Math.max(.9,2.4-lv('mining')*.03))}
 if(o.t==='shroom'){if(o.dead)return;o.dead=1e9;objAt.delete(idx(o.x,o.y));if(addItem('shroom')){fl(o.x+.5,o.y,'+🍄','#e9a8ff');toast('🍄 Magic Shroom! Eat it from your bag… if you dare.','#e9a8ff');sfx('pick')}else{o.dead=0;objAt.set(idx(o.x,o.y),o);toast('Bag full','#f66')}return}
 if(o.t==='bush'){if(o.dead)return;return startAct('bush',o,.9)}
 if(o.t==='fire'){if(!P.inv.some(i=>ITEMS[i.id].raw))return toast('Nothing to cook','#fc6');return startAct('cook',o,1.3)}
 if(o.t==='gate')return useGate(o);
 if(o.t==='anvil')return openPanel('forge')}
function findTarget(){let best=null,bd=9;
 for(const n of npcs){const d=Math.hypot(n.x+.5-P.x,n.y+.5-P.y);if(d<2.1&&d<bd){bd=d;best={kind:'npc',ref:n,x:n.x,y:n.y}}}
 for(const o of objs){if(o.dead)continue;const d=Math.hypot(o.x+.5-P.x,o.y+.5-P.y);if(d<1.8&&d<bd){bd=d;best={kind:'obj',ref:o,x:o.x,y:o.y}}}
 if(!best){const px=Math.floor(P.x),py=Math.floor(P.y),f=DIR[P.dir];const c=[[px+f[0],py+f[1]],[px+1,py],[px-1,py],[px,py+1],[px,py-1]];for(const [x,y] of c)if(isWater(x,y))return{kind:'fish',x,y}}
 return best}
/* ---------- criminal flags / PvP ---------- */
let stance=false;
const FL={blue:1,orange:2,red:3},FCOL={orange:'#ff9a2a',red:'#ff4a4a',blue:'#5ab0ff'};
const flagOf=a=>(a.fT>clock&&a.flag)?a.flag:null,isCrim=a=>{const f=flagOf(a);return f==='orange'||f==='red'};
const AX=a=>a.npc?a.x+.5:a.x,AY=a=>a.npc?a.y+.5:a.y,dA=(a,b)=>Math.hypot(AX(a)-AX(b),AY(a)-AY(b)),nm=a=>a===P?P.name:a.name;
function spoils(A,V){const vg=V===P?P.gold:(V.gold||0),g=Math.floor(vg*.1);if(V===P)P.gold-=g;else V.gold=vg-g;if(A===P)P.gold+=g;else A.gold=(A.gold||0)+g;
 const sx=V===P?P.xp:V.xp,ax=A===P?P.xp:A.xp;let tot=0,top=null,tb=0;for(const s of SK){const k=s[0],t=Math.floor((sx[k]||0)*.01);if(t<=0)continue;sx[k]-=t;tot+=t;if(t>tb){tb=t;top=s}if(A===P)gainXp(k,t);else ax[k]=(ax[k]||0)+t}
 if(A===P)sys(`🏴‍☠️ Spoils from ${V.name}: +${g}g and 1% of their skills (+${tot} xp${top?', mostly '+top[1]:''}).`,'#ffd36b');
 else if(V===P)sys(`💀 ${A.name} took ${g}g and 10% of your skills!`,'#f66')}
function setFlag(a,f,dur){const cur=flagOf(a);if(cur&&FL[cur]>FL[f])return;if(cur===f){a.fT=Math.max(a.fT,clock+dur);return}a.flag=f;a.fT=clock+dur;
 if(a===P){sys({orange:'🟠 You are now a CRIMINAL (orange) for 60s.',red:'🔴 You are now a MURDERER (red) until you die or are killed! Guards will hunt you.',blue:'🔵 You are flagged lawful (blue) for attacking a murderer.'}[f],FCOL[f])}}
function actorHit(A,V,dmg){if(V.dead||V===A||(V===P&&(P.dead||P.inside||shopSt)))return;const vf=flagOf(V);
 if(!A.guard){if(vf==='red')setFlag(A,'blue',90);else if(vf!=='orange')setFlag(A,'orange',60)}
 if((V.isBot||V.npc)&&A!==V){V.target=A;V.tT=clock+15}if(V.guard){V.fightWho=A;V.fightT=clock+20}
 if(V===P)return playerHit(dmg,A);
 V.hp-=dmg;V.flash=.15;if(A!==P)fl(AX(V),AY(V)-.8,'-'+dmg,'#f88');if(V.hp<=0)killActor(A,V)}
function killActor(A,V){const vf=flagOf(V);const pa=x=>x===P||x.isBot;if(pa(A)&&pa(V))spoils(A,V);
 if(vf==='red'){if(A===P){const b=100*Math.max(1,V.vic||1);P.gold+=b;sys(`💰 Bounty collected: ${b}g for ${nm(V)}!`,'#ffd36b');toast('💰 +'+b+'g bounty')}else if(A.guard)sys(`⚖️ A guard struck down the murderer ${nm(V)}.`,'#9cf');V.vic=0;V.flag=null;V.fT=0}
 else if(vf==='orange'){V.flag=null;V.fT=0}
 else if(!A.guard){setFlag(A,'red',Infinity);A.vic=(A.vic||0)+1;if(A!==P)sys(`🔴 ${nm(A)} murdered ${nm(V)} and is now wanted!`,'#ff6a6a')}
 if(A===P&&V!==P){if(V.guard)dropGear('guard',true);else if(V.npc)dropGear('npc',false)}
 if(V!==P){V.flag=null;V.fT=0;V.vic=0;V.dead=clock+(V.npc?60:25);burst(AX(V),AY(V)-.4,'#f55',14);if(A===P){P.kills++;P.pvpK=(P.pvpK|0)+1}}}
function steer(e,tx,ty,sp,dt){const dx=tx-e.x,dy=ty-e.y,m=Math.hypot(dx,dy)||1,vx=dx/m*sp*dt,vy=dy/m*sp*dt,ox=e.x,oy=e.y;moveEnt(e,vx,vy);
 if(Math.abs(e.x-ox)+Math.abs(e.y-oy)<sp*dt*.3){e.sd=e.sd||(Math.random()<.5?1:-1);moveEnt(e,-vy*e.sd*1.3,vx*e.sd*1.3)}else if(Math.random()<.02)e.sd=0;
 e.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?2:1):(dy>0?0:3)}
function updNpcs(dt){for(const n of npcs){if(n.dead){if(clock>n.dead){n.dead=0;n.hp=n.mhp;n.flag=null;n.target=null}continue}
 n.cd-=dt;n.sw-=dt;n.flash-=dt;if(n.hp<n.mhp)n.hp=Math.min(n.mhp,n.hp+dt*2);
 if(n.target&&!n.target.dead&&clock<n.tT){if(dA(n,n.target)<1.5&&n.cd<=0){n.cd=1.4;n.sw=.25;actorHit(n,n.target,4)}}else n.target=null}}
function updGuards(dt){for(const g of guards){if(g.dead){if(clock>g.dead){g.dead=0;g.hp=g.mhp;g.x=g.hx;g.y=g.hy;g.flag=null}continue}
 g.cd-=dt;g.sw-=dt;g.flash-=dt;g.tt=(g.tt||0)-dt;
 if(g.tt<=0){g.tt=.4;let best=null,bd=18;if(!(clock<g.giveT))for(const c of [...bots,P]){if(c.dead||flagOf(c)!=='red')continue;if(Math.hypot(AX(c)-g.hx,AY(c)-g.hy)>26)continue;const d=dA(g,c);if(d<bd){bd=d;best=c}}g.tgt=best}
 let t=g.tgt;if(g.fightWho&&clock<g.fightT&&!g.fightWho.dead)t=g.fightWho;
 if(t&&(t.dead||(t===g.tgt&&flagOf(t)!=='red'&&t!==g.fightWho)))t=null;
 if(t&&(dA(g,t)>24||Math.hypot(g.x-g.hx,g.y-g.hy)>26)){g.tgt=null;g.fightWho=null;g.giveT=clock+8;t=null}
 g.mv=false;
 if(t){const d=dA(g,t);if(d>1.1){steer(g,AX(t),AY(t),6,dt);g.mv=true}else if(g.cd<=0){g.cd=.9;g.sw=.25;g.dir=Math.abs(AX(t)-g.x)>Math.abs(AY(t)-g.y)?(AX(t)>g.x?2:1):(AY(t)>g.y?0:3);actorHit(g,t,t===P?30:60)}}
 else if(Math.hypot(g.hx-g.x,g.hy-g.y)>.6){steer(g,g.hx,g.hy,3,dt);g.mv=true}
 if(!t&&g.hp<g.mhp)g.hp=Math.min(g.mhp,g.hp+dt*20)}}
/* ---------- combat ---------- */
const ESPEC={slime:{hp:10,dmg:2,spd:1.5,ag:4,xp:10,tiles:[TL.GRASS],n:50,gold:[1,3]},wolf:{hp:26,dmg:5,spd:3.1,ag:6,xp:32,tiles:[TL.FOREST],n:34,gold:[2,6]},
 skeleton:{hp:46,dmg:9,spd:2.1,ag:6,xp:60,tiles:[TL.DARK,TL.STONE],n:30,gold:[4,12]},orc:{hp:90,dmg:14,spd:2.6,ag:6,xp:140,tiles:[],n:0,gold:[10,25]},ogre:{hp:220,dmg:26,spd:2.2,ag:6,xp:380,tiles:[],n:0,gold:[25,60]},wraith:{hp:140,dmg:20,spd:3,ag:7,xp:260,tiles:[],n:0,gold:[15,40]},
 troll:{hp:450,dmg:40,spd:2.2,ag:7,xp:900,tiles:[],n:0,gold:[60,140]},demon:{hp:700,dmg:58,spd:2.8,ag:8,xp:1600,tiles:[],n:0,gold:[120,300]},
 goblin:{hp:28,dmg:5,spd:2.6,ag:6,xp:30,tiles:[],n:0,gold:[2,8]},bat:{hp:14,dmg:4,spd:3.6,ag:7,xp:22,tiles:[],n:0,gold:[1,4]},spider:{hp:80,dmg:15,spd:3,ag:6,xp:120,tiles:[],n:0,gold:[8,20]},bandit:{hp:170,dmg:22,spd:2.6,ag:7,xp:300,tiles:[],n:0,gold:[30,80]},golem:{hp:1000,dmg:48,spd:1.7,ag:5,xp:1400,tiles:[],n:0,gold:[100,250]},
 sheep:{hp:16,dmg:0,spd:1.1,ag:0,xp:4,tiles:[],n:0,gold:[0,2],pass:1,rad:3},chicken:{hp:6,dmg:0,spd:1.4,ag:0,xp:2,tiles:[],n:0,gold:[0,1],pass:1,rad:3},rooster:{hp:700,dmg:34,spd:3.1,ag:9,xp:1500,tiles:[],n:0,gold:[250,600]},
 wyrm:{hp:350,dmg:18,spd:2.6,ag:14,xp:800,tiles:[],n:0,gold:[100,200]}};
ESPEC.wizard={hp:9000,dmg:70,spd:2.4,ag:13,xp:25000,tiles:[],n:0,gold:[3000,5000]};
const FASTM=new Set(['wolf','bat','spider','chicken','sheep']);
function mkEnemy(t,x,y){const s=ESPEC[t];return{t,x,y,hx:x,hy:y,hp:s.hp,mhp:s.hp,cd:0,st:0,dir:0,flash:0,dead:0,ph:Math.random()*9,fire:3}}
const RACES=['slime','goblin','wolf','bat','skeleton','spider','orc','bandit','ogre','wraith','golem','troll','demon'];
function makeElites(){for(const t of RACES){const L=E.filter(e=>e.t===t&&!e.el);if(L.length<2)continue;const n=Math.max(2,Math.round(L.length/40));for(let i=0;i<n;i++){const e=L.splice(ri(0,L.length-1),1)[0];if(!e)break;const sh=i%2===1;e.el=sh?'shaman':'boss';const s=ESPEC[t];e.mhp=e.hp=Math.round(s.hp*(sh?3.5:6));e.dm=sh?1.2:1.7;e.xm=sh?4:6;e.sc=sh?1.15:1.4;e.fire=2}}}
function spawnVillageMobs(){const ok=(x,y)=>inb(x,y)&&reach[idx(x,y)]&&!solid[idx(x,y)]&&!objAt.has(idx(x,y))&&!safeAt(x+.5,y+.5)&&!VIL.some(w=>Math.hypot(x-w.x,y-w.y)<VIL_R+13)&&Math.hypot(x-CX,y-CY)>=TOWN_R+14;
 for(const v of VIL)for(const [t,n] of v.mobs){let k=0,tries=0;const N=Math.round(n*1.6);while(k<N&&tries++<8000){const a=rnd(0,6.283),r=rnd(VIL_R+14,VIL_R+34),x=Math.floor(v.x+Math.cos(a)*r),y=Math.floor(v.y+Math.sin(a)*r);if(!ok(x,y))continue;E.push(mkEnemy(t,x+.5,y+.5));k++}}
 let k=0,tries=0;while(k<220&&tries++<20000){const a=rnd(0,6.283),r=rnd(TOWN_R+14,TOWN_R+34),x=Math.floor(CX+Math.cos(a)*r),y=Math.floor(CY+Math.sin(a)*r);if(!ok(x,y))continue;const t=pickMob(30,map[idx(x,y)]);if(!t)continue;E.push(mkEnemy(t,x+.5,y+.5));k++}}
function pickMob(d,t){const g=t===TL.GRASS||t===TL.SAND,f=t===TL.FOREST,st=t===TL.STONE;let L;
 if(d<40)L=g?[['slime',3],['goblin',1]]:f?(d>=30?[['wolf',1],['bat',2]]:[['bat',1]]):[];
 else if(d<70)L=g?[['slime',2],['goblin',2],['orc',1]]:f?[['wolf',2],['orc',1],['spider',2],['bat',1]]:[['skeleton',3],['bat',1]];
 else if(d<100)L=g?[['orc',2],['ogre',1],['bandit',2]]:f?[['orc',1],['ogre',2],['wolf',1],['spider',2]]:st?[['golem',1],['wraith',1],['skeleton',1]]:[['skeleton',1],['wraith',2]];
 else if(d<125)L=(g||f)?[['ogre',2],['troll',1],['bandit',1]]:st?[['golem',2],['troll',1]]:[['wraith',2],['troll',1]];
 else L=[['troll',2],['demon',1],['golem',1]];
 let tot=0;for(const x of L)tot+=x[1];if(!tot)return null;let r=Math.random()*tot;for(const x of L){if((r-=x[1])<0)return x[0]}return L[0][0]}
function spawnSheep(){const ok=(x,y)=>inb(x,y)&&reach[idx(x,y)]&&!solid[idx(x,y)]&&!objAt.has(idx(x,y))&&[TL.GRASS,TL.FOREST,TL.PLAZA].includes(map[idx(x,y)]),add=(x,y)=>E.push(mkEnemy('sheep',x+.5,y+.5));
 let n=0,tr=0;while(n<180&&tr++<150000){const x=ri(3,MW-4),y=ri(3,MH-4);if(ok(x,y)){const gx=x+rnd(-1.5,1.5);add(x,y);n++;if(Math.random()<.5&&ok(x+1,y)){add(x+1,y);n++}}}
 n=0;tr=0;while(n<14&&tr++<9000){const a=rnd(0,6.283),r=rnd(5,TOWN_R-3),x=Math.floor(CX+Math.cos(a)*r),y=Math.floor(CY+Math.sin(a)*r);if(ok(x,y)){add(x,y);n++}}
 for(const v of VIL){n=0;tr=0;while(n<4&&tr++<3000){const a=rnd(0,6.283),r=rnd(3,VIL_R-2),x=Math.floor(v.x+Math.cos(a)*r),y=Math.floor(v.y+Math.sin(a)*r);if(ok(x,y)){add(x,y);n++}}}}
function spawnChickens(){const ok=(x,y)=>inb(x,y)&&reach[idx(x,y)]&&!solid[idx(x,y)]&&!objAt.has(idx(x,y))&&[TL.GRASS,TL.FOREST,TL.SAND,TL.PLAZA,TL.PATH].includes(map[idx(x,y)]),add=(x,y)=>E.push(mkEnemy('chicken',x+.5,y+.5));
 let n=0,tr=0;while(n<120&&tr++<150000){const x=ri(3,MW-4),y=ri(3,MH-4);if(ok(x,y)){add(x,y);n++}}
 n=0;tr=0;while(n<12&&tr++<9000){const a=rnd(0,6.283),r=rnd(4,TOWN_R-3),x=Math.floor(CX+Math.cos(a)*r),y=Math.floor(CY+Math.sin(a)*r);if(ok(x,y)){add(x,y);n++}}
 for(const v of VIL){n=0;tr=0;while(n<3&&tr++<3000){const a=rnd(0,6.283),r=rnd(3,VIL_R-2),x=Math.floor(v.x+Math.cos(a)*r),y=Math.floor(v.y+Math.sin(a)*r);if(ok(x,y)){add(x,y);n++}}}}
let roosterT=45,shroomSpawnT=60,illT=0;const ills=[],ILLT=['slime','wolf','skeleton','orc','ogre','troll','demon','chicken','goblin','bat','spider','golem'];
function spawnRooster(){if(E.some(e=>e.t==='rooster'&&!e.dead))return;E=E.filter(e=>e.t!=='rooster');let x,y,t=0;do{x=ri(5,MW-5);y=ri(5,MH-5);t++}while(t<9000&&(!reach[idx(x,y)]||solid[idx(x,y)]||objAt.has(idx(x,y))||Math.hypot(x-CX,y-CY)<60||safeAt(x,y)));if(t>=9000)return;
 E.push(mkEnemy('rooster',x+.5,y+.5));let n=0,tr=0;while(n<8&&tr++<400){const a=rnd(0,6.283),d=rnd(2,5),cx=Math.floor(x+Math.cos(a)*d),cy=Math.floor(y+Math.sin(a)*d);if(inb(cx,cy)&&reach[idx(cx,cy)]&&!solid[idx(cx,cy)]&&!objAt.has(idx(cx,cy))){E.push(mkEnemy('chicken',cx+.5,cy+.5));n++}}
 const dx=x-P.x,dy=y-P.y,dist=Math.round(Math.hypot(dx,dy)),dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'east':'west'):(dy>0?'south':'north');
 sys(`🐓 Sir Cluckington, the Rooster Lord, struts about guarding his flock ${dist} tiles ${dir} of you!`,'#ffb347');toast('🐓 A Rooster Lord has appeared!','#ffb347');sfx('boss')}
function spawnShroom(){if(objs.filter(o=>o.t==='shroom'&&!o.dead).length>=22)return;let x,y,t=0;do{x=ri(4,MW-5);y=ri(4,MH-5);t++}while(t<4000&&(!reach[idx(x,y)]||solid[idx(x,y)]||objAt.has(idx(x,y))||safeAt(x,y)||(map[idx(x,y)]!==TL.FOREST&&map[idx(x,y)]!==TL.GRASS)));if(t>=4000)return;const o={x,y,t:'shroom',hp:1,dead:0};objs.push(o);objAt.set(idx(x,y),o)}
const chickenForm=()=>!!P.chicken;
function eatShroom(){if(P.shroomT>0)return toast('You are already tripping!');if(P.chicken)return toast('🐔 Bawk! (you are already a chicken)','#fc6');P.shroomT=45;ills.length=0;P.hp=maxHp();toast('🍄 The world begins to melt…','#e9a8ff');sys('🍄 You ate a Magic Shroom. Colors sing. Your legs disagree with you. You feel INVINCIBLE (x3 damage, fast, endless mana)… but the controls feel backwards. (Afterwards… something feathery awaits.)','#e9a8ff');sfx('lvl')}
function shroomTick(dt){if(!(P.shroomT>0))return;const b0=P.shroomT;P.shroomT-=dt;P.mp=maxMp();P.st=maxSt();P.hp=Math.min(maxHp(),P.hp+maxHp()*.04*dt);
 if(P.shroomT<=0){P.shroomT=0;ills.length=0;P.chicken=1;sys('🐔 The trip ends… and you have FEATHERS. You are a CHICKEN until you sleep at an inn or rent a cottage (or die). No spells, portals or shops.','#ffb347');toast('🐔 BAWK! You are a chicken!','#ffb347');sfx('bawk');burst(P.x,P.y-.4,'#fff',24);return}
 illT-=dt;if(illT<=0&&ills.length<7){illT=rnd(.7,1.6);const a=rnd(0,6.283),d=rnd(3,8);ills.push({x:P.x+Math.cos(a)*d,y:P.y+Math.sin(a)*d,t:pick(ILLT),ph:Math.random()*9,life:rnd(5,10),dir:ri(0,3),vx:rnd(-.5,.5),vy:rnd(-.5,.5)})}
 for(let i=ills.length-1;i>=0;i--){const m=ills[i];m.life-=dt;m.x+=m.vx*dt;m.y+=m.vy*dt;if(Math.hypot(m.x-P.x,m.y-P.y)<1.1){burst(m.x,m.y-.4,hsl2hex((clock*200)%360,.9,.6),16);fl(m.x,m.y-.8,pick(['?!','boo','bawk','wow','🌈']),'#e9a8ff');sfx('pick');ills.splice(i,1)}else if(m.life<=0)ills.splice(i,1)}
 if(Math.random()<dt*.15)fl(P.x,P.y-1.1,pick(['whoa…','so colorful','the walls are breathing','bawk?','🌈','is that a slime?']),'#e9a8ff')}
function spawnEnemies(){let c=0,tries=0;while(c<2200&&tries++<300000){const x=ri(3,MW-4),y=ri(3,MH-4),k=idx(x,y);if(!reach[k]||solid[k]||objAt.has(k)||safeAt(x,y))continue;const d=Math.hypot(x-CX,y-CY);if(d<TOWN_R+14||VIL.some(v=>Math.hypot(x-v.x,y-v.y)<VIL_R+13))continue;const t=pickMob(d,map[k]);if(!t)continue;E.push(mkEnemy(t,x+.5,y+.5));c++}}
function hurtEnemy(e,d,src='p'){if(e.dead)return;if(meleeT===clock)bloodHit(e);if(src==='p'&&P.shroomT>0)d*=3;if(e.t==='chicken'||e.t==='sheep'){e.flee=5;if(Math.random()<.4)sfx('bawk')}e.hp-=d;e.flash=.18;e.st=1;if(e.t==='wyrm'&&src==='p')P.bossDmg=(P.bossDmg||0)+d;if(e.hp<=0)killEnemy(e)}
const ELN=e=>(e.el==='shaman'?'Shaman ':e.el==='elite'?'Elite ':'Chief ')+e.t[0].toUpperCase()+e.t.slice(1);
function killEnemy(e){if(meleeT===clock)goreKill(e);if(e.dun)dunKill(e);e.dead=clock+(e.temp?1e9:e.t==='wizard'?1e9:e.dun?ri(240,360):e.t==='wyrm'||e.t==='rooster'?1e9:ri(45,70)*(e.el?4:1));P.kills++;const s=ESPEC[e.t],xm=e.xm||1;gainXp('melee',s.xp*.4*xm);if(e.el&&e.el!=='lord'&&!e.dun){const g2=ri(...s.gold)*4;P.gold+=g2;fl(e.x,e.y-1.2,'+'+g2+'g','#ffd36b');toast('☠️ '+ELN(e)+' slain!','#ffd36b');dropGear(e.t,true);dropGear(e.t,true)}onEvent(e.t);burst(e.x,e.y-.4,'#fff',14);
 const g=ri(...s.gold);P.gold+=g;fl(e.x,e.y-.6,'+'+g+'g','#ffd36b');const dr=(id,p,n=1)=>{if(Math.random()<p&&addItem(id,n)){fl(e.x+.3,e.y-1,'+'+ITEMS[id].e,'#fff')}};
 if(e.t!=='wyrm')dropGear(e.t,TOUGH.has(e.t));
 if(e.t==='troll'){dr('tusk',.8,3);dr('iron',.7,3);dr('gem',.08);dr('hpotion',.3)}if(e.t==='demon'){dr('essence',.8,3);dr('gem',.12);dr('scale',.1);dr('hpotion',.4);dr('potion',.3)}
 dr('hpotion',e.t==='slime'?0:.04);
 if(e.t==='sheep'){dr('wool',.9,2);dr('mutton',.7);sfx('bawk')}if(e.t==='chicken'){dr('drum',.5);dr('egg',.6);dr('feather',.7,2);sfx('bawk')}if(e.t==='rooster'){dr('rfeather',1,3);dr('gegg',.6);dr('drum',1,3);dr('egg',1,3);sys('🐓 The Rooster Lord falls! The flock is free.','#ffb347')}
 if(e.t==='goblin'){dr('bread',.2);dr('copper',.15)}if(e.t==='bat')dr('pelt',.3);if(e.t==='spider'){dr('pelt',.5);dr('gem',.02);dr('essence',.05)}if(e.t==='bandit'){dr('iron',.4);dr('bread',.3);dr('hpotion',.15);dr('gem',.03)}if(e.t==='golem'){dr('iron',.9,3);dr('gem',.2);dr('copper',.6,3)}
 if(e.t==='orc'){dr('tusk',.6);dr('iron',.25)}if(e.t==='ogre'){dr('tusk',.8,2);dr('iron',.6,2);dr('gem',.05)}if(e.t==='wraith'){dr('essence',.6);dr('gem',.04);dr('potion',.1)}
 if(e.t==='slime'){dr('gel',.6);dr('potion',.03)}if(e.t==='wolf'){dr('pelt',.55);dr('bread',.1)}if(e.t==='skeleton'){dr('bone',.7);dr('gem',.012)}
 if(e.t==='wyrm'){boss=null;if((P.bossDmg||0)>=40){dropGear('wyrm',true);dropGear('wyrm',true);addItem('scale',ri(1,3));if(Math.random()<.5)addItem('gem');P.gold+=ri(...s.gold);gainXp('magic',200);gainXp('melee',200);sys('🐉 You helped slay the Ember Wyrm! Rewards granted.','#ff9bff');toast('🐉 WYRM SLAIN!')}else sys('The Ember Wyrm was slain by others… you did too little to earn loot.','#f99');}}
function playerHit(d,by){if(P.dead||P.inside||shopSt)return;const df=A_().def||0;let dmg=Math.max(1,Math.round(d*(1-df*.035)-lv('defense')*.12+rnd(-1,1)));
 P.hp-=dmg;P.hurt=5;fl(P.x,P.y-.8,'-'+dmg,'#f55');sfx('hurt');gainXp('defense',2+dmg);gainXp('vitality',1+dmg*.6);burst(P.x,P.y-.4,'#d33',5);
 if(P.hp<=0){if(by&&by.act)killActor(by,P);P.flag=null;P.fT=0;P.vic=0;P.dead=2.2;P.deaths=(P.deaths|0)+1;if(by&&by.act)P.pvpD=(P.pvpD|0)+1;if(!(by&&by.isBot)){P.gold=Math.floor(P.gold*.9);sys('💀 You were knocked out and lost 10% gold.','#f66')}P.path=null;stopAct();P.chase=null}}
function nearestEnemy(r,fr=P){let b=null,bd=r;for(const e of E){if(e.dead)continue;const d=Math.hypot(e.x-fr.x,e.y-fr.y);if(d<bd){bd=d;b=e}}return b}
const actorsList=()=>[...bots,...guards,...npcs];
let wardT=0;
function wardMsg(){if(clock>wardT){wardT=clock+1.5;toast('🛡️ The town ward forbids fighting monsters here','#9cf')}}
function playerAttack(){if(P.dead||P.cd>0)return;let t=null;
 if(P.chase&&!P.chase.dead&&Math.hypot(AX(P.chase)-P.x,AY(P.chase)-P.y)<1.9)t=P.chase;
 if(!t)t=nearestEnemy(1.7);
 if(t&&ESPEC[t.t]&&!ESPEC[t.t].pass&&safeAt(P.x,P.y)){P.chase=null;wardMsg();return}
 if(!t){let bd=1.7;for(const a of actorsList()){if(a.dead||(!stance&&!isCrim(a)))continue;const d=Math.hypot(AX(a)-P.x,AY(a)-P.y);if(d<bd){bd=d;t=a}}}
 stopAct();
 if(!t){P.cd=.55;P.swing=.25;sfx('miss');return}
 const tx=AX(t),ty=AY(t),dx=tx-P.x,dy=ty-P.y;P.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?2:1):(dy>0?0:3);P.cd=.55;P.swing=.25;
 const hit=Math.random()<clamp(.78+lv('melee')*.01,.78,.97);
 if(!hit){fl(tx,ty-.7,'Miss','#aaa');sfx('miss');if(!t.act)gainXp('melee',1);return}
 const crit=Math.random()<.08+lv('agility')*.002+G().crit/100;let d=(1+lv('melee')*.55+(W_().atk||0))*rnd(.8,1.2);if(crit)d*=2;d=Math.max(1,Math.round(d));
 if(t.act){actorHit(P,t,d);fl(tx,ty-.7,(crit?'💥':'')+d,crit?'#ffb62e':'#fff');sfx(crit?'crit':'hit');burst(tx,ty-.4,'#fff',4);if(isCrim(t))gainXp('melee',1);return}
 meleeT=clock;hurtEnemy(t,d);fl(tx,ty-.7,(crit?'💥':'')+d,crit?'#ffb62e':'#fff');sfx(crit?'crit':'hit');gainXp('melee',2+d*.5);burst(tx,ty-.4,'#fff',4);
 for(const o of E){if(o===t||o.dead||ESPEC[o.t].pass)continue;if(Math.hypot(o.x-P.x,o.y-P.y)<1.8||Math.hypot(o.x-tx,o.y-ty)<1.4){const d2=Math.max(1,Math.round(d*.75));hurtEnemy(o,d2);fl(o.x,o.y-.7,d2,'#fff');burst(o.x,o.y-.4,'#fff',3);gainXp('melee',1)}}}
const CD={bolt:0,mend:0,eat:0,fire:0,hpot:0,mpot:0,jump:0},CDM={bolt:.9};
const DOTC={burn:'#ff8a2a',poison:'#7be24a',slow:'#8fe8ff'},fxs=[];
const SPELLS=[{n:'Arcane Bolt',e:'🔮',c:'#8cf'},{n:'Venom Bolt',e:'☠️',c:'#5ac85a',dot:['poison',.14,6]},{n:'Frost Bolt',e:'❄️',c:'#5a9aff',slow:[.5,4]},{n:'Chain Bolt',e:'⚡',c:'#b46aff',chain:6},
 {n:'Fireball',e:'🔥',c:'#ff9a1a',aoe:2,dot:['burn',.16,4]},{n:'Inferno',e:'🌋',c:'#ff4a4a',aoe:2.6,dot:['burn',.22,5]},{n:'Blizzard Shard',e:'🌨️',c:'#4af0ff',aoe:3,slow:[.55,5]},
 {n:'Storm Call',e:'🌩️',c:'#ffd34a',aoe:3,chain:9},{n:'Plague Nova',e:'☣️',c:'#ff7ad9',aoe:3.5,dot:['poison',.25,7]},{n:'Meteor',e:'☄️',c:null,aoe:4,dot:['burn',.3,5],slow:[.5,3]}];
const spellTier=()=>P.dev?(P.devT|0):Math.min(9,Math.floor(lv('magic')/10)),spCol=sp=>sp.c||hsl2hex((clock*80)%360,.85,.6);
const healAmt=it=>it.pot?Math.max(it.heal,Math.round(maxHp()*.35)):it.heal,manaAmt=it=>Math.max(it.mana,Math.round(maxMp()*.35));
function applyFx(e,sp,dmg){if(e.dead)return;if(sp.dot){e.dots=e.dots||[];const d=e.dots.find(x=>x.k===sp.dot[0]),dps=Math.max(1,dmg*sp.dot[1]);if(d){d.left=sp.dot[2];d.dps=Math.max(d.dps,dps)}else e.dots.push({k:sp.dot[0],dps,left:sp.dot[2]})}if(sp.slow)e.slow={m:sp.slow[0],left:sp.slow[1]}}
function spellAoe(p,hit){const sp=SPELLS[p.sp],col=spCol(sp);fxs.push({k:'ring',x:p.x,y:p.y,r:sp.aoe,life:.45,max:.45,c:col});burst(p.x,p.y,col,24,5);let n=0;
 for(const e of E){if(e.dead||hit.has(e))continue;if(Math.hypot(e.x-p.x,e.y-p.y)<=sp.aoe){const d2=Math.round(p.dmg*.6);hurtEnemy(e,d2);fl(e.x,e.y-.7,d2,col);applyFx(e,sp,d2);hit.add(e);n++}}if(n)gainXp('magic',2*n);sfx('hit')}
function spellHit(p,e0){const sp=SPELLS[p.sp],col=spCol(sp),hit=new Set([e0]);hurtEnemy(e0,p.dmg);fl(e0.x,e0.y-.7,p.dmg,col);applyFx(e0,sp,p.dmg);gainXp('magic',4);burst(p.x,p.y,col,10);sfx('hit');
 if(sp.aoe)spellAoe(p,hit);
 if(sp.chain){let from=e0;for(let k=0;k<sp.chain;k++){let best=null,bd=5.5;for(const e of E){if(e.dead||hit.has(e))continue;const d=Math.hypot(e.x-from.x,e.y-from.y);if(d<bd){bd=d;best=e}}if(!best)break;
  fxs.push({k:'line',x:from.x,y:from.y-.4,x2:best.x,y2:best.y-.4,life:.3,max:.3,c:col});const d2=Math.round(p.dmg*.7);hurtEnemy(best,d2);fl(best.x,best.y-.7,d2,col);applyFx(best,sp,d2);hit.add(best);gainXp('magic',2);from=best}}}
function castBolt(){if(chickenForm())return toast('🐔 Bawk! (chickens cannot cast)','#fc6');if(safeAt(P.x,P.y))return wardMsg();const tier=spellTier(),sp=SPELLS[tier],cost=4+tier*2;if(P.dead||CD.bolt>0)return;if(P.mp<cost)return toast('Not enough mana','#6af');const t=nearestEnemy(8+tier*.3);let a=DIR[P.dir],vx=a[0],vy=a[1];
 if(t){const d=Math.hypot(t.x-P.x,t.y-P.y);vx=(t.x-P.x)/d;vy=(t.y-P.y)/d;P.dir=Math.abs(vx)>Math.abs(vy)?(vx>0?2:1):(vy>0?0:3)}
 P.mp-=cost;CDM.bolt=.9+tier*.04;CD.bolt=CDM.bolt;P.swing=.25;proj.push({x:P.x,y:P.y-.3,vx:vx*9,vy:vy*9,dmg:Math.round((3+lv('magic')*.9+(W_().mag||0))*rnd(.9,1.15)),life:1.1,own:'p',sp:tier,sz:3+tier*.5});if(t)gainXp('magic',2+tier);sfx('bolt')}
function castMend(){if(chickenForm())return toast('🐔 Bawk! (chickens cannot cast)','#fc6');if(CD.mend>0||P.dead)return;if(lv('magic')<5)return toast('Mend unlocks at Magic 5','#6af');const tier=spellTier(),cost=8+tier;if(P.mp<cost)return toast('Not enough mana','#6af');if(P.hp>=maxHp())return;
 P.mp-=cost;CD.mend=2;const h=Math.round(10+lv('magic')*1.5),col=spCol(SPELLS[tier]);P.hp=Math.min(maxHp(),P.hp+h);if(tier>=2)P.hot={left:5,per:2+tier*.9};gainXp('magic',8);gainXp('vitality',3);fl(P.x,P.y-.8,'+'+h,'#6f6');burst(P.x,P.y-.4,col,12+tier*3);fxs.push({k:'ring',x:P.x,y:P.y,r:1.2+tier*.15,life:.5,max:.5,c:col});sfx('heal')}
function eatBest(){if(CD.eat>0||P.dead)return;let b=null;for(const i of P.inv){const it=ITEMS[i.id];if(it.heal&&!it.pot&&(!b||it.heal>ITEMS[b.id].heal))b=i}
 if(!b)return toast('No food!','#f66');if(P.hp>=maxHp())return;const h=ITEMS[b.id].heal;take(b.id);P.hp=Math.min(maxHp(),P.hp+h);fl(P.x,P.y-.8,'+'+h,'#6f6');gainXp('vitality',h*.25);sfx('heal');CD.eat=1.1}
function doJump(){if(P.dead||CD.jump>0)return;const a=DIR[P.dir]||[0,1];let L=null;
 for(const n of [1,2]){const x=Math.floor(P.x+a[0]*n),y=Math.floor(P.y+a[1]*n);if(walkable(x,y)){L=[x+.5,y+.5];break}}
 if(!L){let bd=9;for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const x=Math.floor(P.x)+dx,y=Math.floor(P.y)+dy;if(walkable(x,y)){const d=Math.hypot(dx,dy)+(dx*a[0]+dy*a[1]>0?-.5:0);if(d<bd){bd=d;L=[x+.5,y+.5]}}}}
 if(!L)return toast('Nowhere to jump','#f66');
 burst(P.x,P.y,'#cde',8);P.x=L[0];P.y=L[1];P.path=null;P.chase=null;CD.jump=1;burst(P.x,P.y,'#cde',10);sfx('bolt')}
function drinkHp(){if(CD.hpot>0||P.dead)return;if(!count('hpotion'))return toast('No health potions','#f66');if(P.hp>=maxHp())return toast('Health is full');const h=healAmt(ITEMS.hpotion);take('hpotion');P.hp=Math.min(maxHp(),P.hp+h);fl(P.x,P.y-.8,'+'+h,'#ff7a7a');burst(P.x,P.y-.4,'#ff6a6a',12);gainXp('vitality',h*.15);sfx('heal');CD.hpot=1.5}
function drinkMp(){if(CD.mpot>0||P.dead)return;if(!count('potion'))return toast('No mana potions','#f66');if(P.mp>=maxMp())return toast('Mana is full');const m=manaAmt(ITEMS.potion);take('potion');P.mp=Math.min(maxMp(),P.mp+m);fl(P.x,P.y-.8,'+'+m+' MP','#6af');burst(P.x,P.y-.4,'#6ab0ff',12);sfx('heal');CD.mpot=1.5}
function lightFire(){if(CD.fire>0||P.dead)return;if(!count('log'))return toast('Need a log','#f66');const f=DIR[P.dir],x=Math.floor(P.x)+f[0],y=Math.floor(P.y)+f[1];if(!walkable(x,y)||objAt.has(idx(x,y)))return toast('Can\'t light here');
 take('log');const o={x,y,t:'fire',hp:1,dead:0,exp:clock+90};objs.push(o);objAt.set(idx(x,y),o);gainXp('cooking',3);CD.fire=1;burst(x+.5,y+.5,'#fa3',10);sfx('pick');toast('🔥 Campfire lit (90s)')}
/* ---------- enemies / bots / boss ---------- */
function updPassive(e,s,dt){e.flash-=dt;let tx=null,ty=null,sp=s.spd;e.mv=false;
 if(e.flee>0){e.flee-=dt;const dx=e.x-P.x,dy=e.y-P.y,m=Math.hypot(dx,dy)||1;tx=e.x+dx/m*3;ty=e.y+dy/m*3;sp*=2.3}
 else{if(Math.random()<dt*.5){e.wx=e.hx+rnd(-s.rad,s.rad);e.wy=e.hy+rnd(-s.rad,s.rad)}if(e.wx!=null){tx=e.wx;ty=e.wy;sp*=.6;if(Math.hypot(tx-e.x,ty-e.y)<.2)e.wx=null}}
 if(tx!=null){const dx=tx-e.x,dy=ty-e.y,m=Math.hypot(dx,dy)||1,vx=dx/m*sp*dt,vy=dy/m*sp*dt,ox=e.x,oy=e.y;moveEnt(e,vx,vy);if(e.x===ox&&e.y===oy&&m>.3){moveEnt(e,vx*1.5,0);moveEnt(e,0,vy*1.5)}e.mv=e.x!==ox||e.y!==oy;if(Math.abs(dx)>.05)e.dir=dx>0?2:1}
 if(Math.random()<dt*.02&&Math.hypot(e.x-P.x,e.y-P.y)<9){fl(e.x,e.y-.6,'bawk','#fff');if(Math.random()<.3)sfx('bawk')}}
function updEnemies(dt){for(const e of E){if(e.dead){if(clock>e.dead&&e.t!=='wyrm'&&e.t!=='rooster'&&Math.hypot(e.hx-P.x,e.hy-P.y)>6){e.dead=0;e.hp=e.mhp;e.x=e.hx;e.y=e.hy;e.st=0}continue}
  if(Math.abs(e.x-P.x)>40||Math.abs(e.y-P.y)>40)continue;
  if(e.dots&&e.dots.length){let col='#ccc';for(let i=e.dots.length-1;i>=0;i--){const d=e.dots[i];d.left-=dt;e.dotA=(e.dotA||0)+d.dps*dt;col=DOTC[d.k];if(d.left<=0)e.dots.splice(i,1)}
   if(e.dotA>=1){const dm=Math.floor(e.dotA);e.dotA-=dm;hurtEnemy(e,dm,'p');if(e.dead)continue;e.dotS=(e.dotS||0)+dm;if(clock>(e.dotT||0)){fl(e.x,e.y-.7,e.dotS,col);e.dotS=0;e.dotT=clock+.8;gainXp('magic',.5)}}
   if(Math.random()<dt*10)parts.push({x:e.x+rnd(-.3,.3),y:e.y-.4,vx:rnd(-.3,.3),vy:-1.2,life:.5,c:col,sz:2})}
  if(e.slow){e.slow.left-=dt;if(Math.random()<dt*6)parts.push({x:e.x+rnd(-.3,.3),y:e.y,vx:0,vy:-.5,life:.4,c:DOTC.slow,sz:2});if(e.slow.left<=0)e.slow=null}
  const s=ESPEC[e.t];if(s.pass){updPassive(e,s,dt);continue}e.cd-=dt;e.flash-=dt;e.sw=(e.sw||0)-dt;const d=Math.hypot(P.x-e.x,P.y-e.y),hd=Math.hypot(e.hx-e.x,e.hy-e.y);
  if(!P.dead&&e.st===0&&d<s.ag&&!safeAt(P.x,P.y))e.st=1;
  if(e.st===1&&(P.dead||d>s.ag*(e.t==='wyrm'||e.t==='wizard'?2.2:1.5)||hd>(e.t==='wyrm'?60:e.t==='wizard'?24:13)||safeAt(P.x,P.y)))e.st=2;
  if(e.t==='wyrm'&&e.st===2){e.st=0;e.hx=e.x;e.hy=e.y}
  let tx=null,ty=null,sp=s.spd*(e.slow?e.slow.m:1)*(FASTM.has(e.t)||e.el||e.t==='wyrm'||e.t==='rooster'?1:.65);
  if(e.st===1){tx=P.x;ty=P.y;if(d<1.05){if(e.cd<=0){e.cd=e.t==='wyrm'?1.6:1.2;e.sw=.25;if(Math.random()<clamp(.82-lv('agility')*.007-lv('defense')*.004,.4,.85))playerHit(s.dmg*(e.dm||1)*rnd(.8,1.2));else{fl(P.x,P.y-.8,'Dodge!','#9cf');gainXp('agility',3);sfx('miss')}}tx=null}
   if(e.el==='shaman'){e.fire-=dt;if(e.fire<=0&&d<8&&d>1.5){e.fire=2.4;const a=Math.atan2(P.y-e.y,P.x-e.x);proj.push({x:e.x,y:e.y-.5,vx:Math.cos(a)*5,vy:Math.sin(a)*5,dmg:Math.round(s.dmg*.9),life:2,own:'e'});sfx('bolt');for(const o of E){if(!o.dead&&o!==e&&o.t===e.t&&Math.hypot(o.x-e.x,o.y-e.y)<6&&o.hp<o.mhp)o.hp=Math.min(o.mhp,o.hp+o.mhp*.08)}}}
   if(e.t==='wizard'){e.fire-=dt;e.nova=(e.nova||6)-dt;
    if(e.fire<=0&&d<14&&d>1.5){e.fire=1.8;const a0=Math.atan2(P.y-e.y,P.x-e.x);for(const o of [-.35,0,.35])proj.push({x:e.x,y:e.y-.5,vx:Math.cos(a0+o)*6,vy:Math.sin(a0+o)*6,dmg:Math.round(s.dmg*.7),life:2.5,own:'e'});sfx('bolt')}
    if(e.nova<=0){e.nova=9;e.novaT=.9;fxs.push({k:'ring',x:e.x,y:e.y,r:4.2,life:.9,max:.9,c:'#b46aff'});fl(e.x,e.y-1.5,'⚠ NOVA','#c9f')}
    if(e.novaT>0){e.novaT-=dt;if(e.novaT<=0&&d<4.4)playerHit(s.dmg*1.3)}
    for(const [k,f] of [['p1',.66],['p2',.33]])if(!e[k]&&e.hp<e.mhp*f){e[k]=1;sys('💀 "Rise, my servants!"','#c9f');for(let i=0;i<4;i++){const a=i*1.57,m=dunMob('wraith',e.x+Math.cos(a)*3,e.y+Math.sin(a)*3,4);m.temp=1;m.st=1;if(!solid[idx(Math.floor(m.x),Math.floor(m.y))])E.push(m)}}}
   if(e.t==='wyrm'){e.fire-=dt;if(e.fire<=0&&d<9&&d>2){e.fire=3;const a=Math.atan2(P.y-e.y,P.x-e.x);proj.push({x:e.x,y:e.y-.5,vx:Math.cos(a)*5,vy:Math.sin(a)*5,dmg:10,life:2,own:'e'});sfx('bolt')}}}
  else if(e.st===2){tx=e.hx;ty=e.hy;sp*=1.3;e.hp=Math.min(e.mhp,e.hp+dt*e.mhp*.05);if(hd<.4)e.st=0}
  else if(Math.random()<dt*.4){e.wx=e.hx+rnd(-2.5,2.5);e.wy=e.hy+rnd(-2.5,2.5)}
  if(e.st===0&&e.wx!=null){tx=e.wx;ty=e.wy;sp*=.5;if(Math.hypot(tx-e.x,ty-e.y)<.2)e.wx=null}
  if(tx!=null){const dx=tx-e.x,dy=ty-e.y,m=Math.hypot(dx,dy)||1,vx=dx/m*sp*dt,vy=dy/m*sp*dt;
   if(!safeAt(e.x+vx,e.y+vy)||e.t==='wyrm'){const ox=e.x,oy=e.y;moveEnt(e,vx,vy);if(e.x===ox&&e.y===oy&&m>.3){moveEnt(e,vx*1.5,0);moveEnt(e,0,vy*1.5)}}
   e.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?2:1):(dy>0?0:3)}}}
const BN=['Aldric','Mira','Thorn','Lyra','Gus','Zed','Nyx','Pebble'],BC=['#c33','#3a8','#a5a','#e90','#39c','#8a5','#c66','#69f'];
const BSPEC=[['melee',35,'defense',28],['magic',30,'agility',22],['mining',24,'crafting',20],['fishing',26,'cooking',18],['woodcut',22,'crafting',14],['melee',32,'magic',27],['agility',34,'melee',28],['defense',31,'vitality',29]];
function botXp(sp){const o={};for(const s of SK)o[s[0]]=xpAt(ri(2,8));o[sp[0]]=xpAt(sp[1]);o[sp[2]]=xpAt(sp[3]);return o}
function spawnBots(){for(let i=0;i<8;i++)bots.push({xp:botXp(BSPEC[i]),gold:ri(150,400),top:[BSPEC[i][0],BSPEC[i][2]],isBot:true,act:true,name:BN[i],col:BC[i],x:CX+rnd(-5,5),y:CY+rnd(2,6),dir:0,tx:null,ty:null,wait:rnd(0,3),ph:Math.random()*9,hp:60,mhp:60,dead:0,flag:null,fT:0,vic:0,cd:0,sw:0,flash:0,target:null,tT:0,pk:i===5||i===6,pt:rnd(50,110)})}
function updBots(dt){for(const b of bots){
 if(b.dead){if(clock>b.dead){b.dead=0;b.hp=b.mhp;b.x=CX+rnd(-4,4);b.y=CY+rnd(2,6);b.flag=null;b.fT=0;b.vic=0;b.target=null;b.tx=null}continue}
 b.cd-=dt;b.sw-=dt;b.flash-=dt;b.gt=(b.gt||0)-dt;if(b.gt<=0){b.gt=rnd(15,30);b.xp[pick(b.top)]+=ri(40,120);b.gold+=ri(3,15)}
 if(b.hp<b.mhp&&!b.target)b.hp=Math.min(b.mhp,b.hp+dt*1.5);
 if(b.pk&&!b.target){b.pt-=dt;if(b.pt<=0){b.pt=rnd(80,170);const c=bots.filter(o=>o!==b&&!o.dead&&!o.pk&&dA(b,o)<18);if(!P.dead&&!isCrim(P)&&dA(b,P)<16&&Math.random()<.5)c.push(P);if(c.length){b.target=pick(c);b.tT=clock+30}}}
 if(b.target&&(b.target.dead||clock>b.tT))b.target=null;
 if(b.target){const t=b.target,d=dA(b,t);if(d>1.1)steer(b,AX(t),AY(t),3.2,dt);else if(b.cd<=0){b.cd=1.3;b.sw=.25;if(Math.random()<.8)actorHit(b,t,ri(4,8))}continue}
 if(boss&&!boss.dead){const d=Math.hypot(boss.x-b.x,boss.y-b.y);if(d>2.2){b.tx=boss.x+rnd(-1.5,1.5);b.ty=boss.y+rnd(-1.5,1.5)}else{if(boss.hp>boss.mhp*.12)boss.hp=Math.max(boss.mhp*.12,boss.hp-1.4*dt)}}
 else if(b.wait>0){b.wait-=dt}else if(b.tx==null){let tries=0,x,y;do{x=b.x+rnd(-9,9);y=b.y+rnd(-9,9);tries++}while(tries<10&&(!canStand(x,y)||Math.hypot(x-CX,y-CY)>18));b.tx=x;b.ty=y}
 if(b.tx!=null){const dx=b.tx-b.x,dy=b.ty-b.y,m=Math.hypot(dx,dy);if(m<.3){b.tx=null;b.wait=rnd(2,7)}else{moveEnt(b,dx/m*2.6*dt,dy/m*2.6*dt);b.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?2:1):(dy>0?0:3)}}}}
function spawnBoss(){let x,y,t=0;do{x=ri(5,MW-5);y=ri(5,MH-5);t++}while(t<9000&&(!reach[idx(x,y)]||solid[idx(x,y)]||Math.hypot(x-CX,y-CY)<70||safeAt(x,y)));if(t>=9000)return;
 const e=mkEnemy('wyrm',x+.5,y+.5);e.born=clock;E.push(e);boss=e;P.bossDmg=0;sfx('boss');sys('🐉 The EMBER WYRM has awoken! Heroes are rushing to fight it.','#ff7a3a');toast('🐉 EMBER WYRM AWAKENS');}
function updProj(dt){for(let i=proj.length-1;i>=0;i--){const p=proj[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;let rm=p.life<=0||!inb(Math.floor(p.x),Math.floor(p.y))||(solid[idx(Math.floor(p.x),Math.floor(p.y))]&&isWater(Math.floor(p.x),Math.floor(p.y))===false&&!objAt.has(idx(Math.floor(p.x),Math.floor(p.y))));
  if(p.own==='p'){let hit=null;for(const e of E){if(!e.dead&&Math.hypot(e.x-p.x,e.y-.3-p.y)<.7){hit=e;break}}if(hit){spellHit(p,hit);rm=true}else if(rm&&SPELLS[p.sp].aoe)spellAoe(p,new Set())}
  else if(!P.dead&&Math.hypot(P.x-p.x,P.y-.3-p.y)<.6){playerHit(p.dmg);burst(p.x,p.y,'#f93',10);rm=true}
  if(rm)proj.splice(i,1);else if(Math.random()<.5)parts.push({x:p.x,y:p.y,vx:0,vy:0,life:.25,c:p.own==='p'?spCol(SPELLS[p.sp]):'#f93',sz:2})}}
/* ---------- main update ---------- */
let goal=null,chaseT=0;
function setPath(tx,ty,adj){const p=bfs(Math.floor(P.x),Math.floor(P.y),tx,ty,40000,adj);return p}
function updPlayer(dt){
 if(P.dead){P.dead-=dt;if(P.dead<=0){P.dead=0;{const sp=P.spawn||{x:CX+.5,y:CY+1.5};P.x=sp.x;P.y=sp.y}P.hp=Math.ceil(maxHp()*.5);P.path=null;P.chicken=0;P.shroomT=0;ills.length=0}return}
 P.cd-=dt;P.swing-=dt;P.hurt-=dt;for(const k in CD)CD[k]-=dt;
 const rv=P.shroomT>0?-1:1;let vx=input.x*rv,vy=input.y*rv;const mag=Math.hypot(vx,vy);
 if(mag>.15){P.path=null;goal=null;P.chase=null;if(act)stopAct();if(mag>1){vx/=mag;vy/=mag}}else{vx=vy=0}
 if(P.chase&&P.chase.act&&!stance&&!isCrim(P.chase))P.chase=null;
 if(P.chase){if(P.chase.dead)P.chase=null;else{const d=Math.hypot(AX(P.chase)-P.x,AY(P.chase)-P.y);if(d<1.5){P.path=null;playerAttack()}else{chaseT-=dt;if(chaseT<=0||!P.path){chaseT=.35;P.path=setPath(Math.floor(AX(P.chase)),Math.floor(AY(P.chase)),true)}}}}
 if(!mag&&P.path){if(P.path.length){const [tx,ty]=P.path[0],dx=tx+.5-P.x,dy=ty+.5-P.y,d=Math.hypot(dx,dy);if(d<.14)P.path.shift();else{vx=dx/d;vy=dy/d}}
  if(!P.path.length){P.path=null;if(goal){const g=goal;goal=null;startInteract(g)}}}
 const moving=vx||vy;if(input.atk&&!P.chase)playerAttack();
 const sprint=input.run&&moving&&P.st>0&&!P.tired;
 if(P.tired&&P.st>maxSt()*.25)P.tired=false;if(P.st<=0)P.tired=true;
 let sp=(P.shroomT>0?1.6:(chickenForm()?1.15:1))*3.3*(1+lv('agility')*.004+G().spd/100)*(sprint?1.7:1)*(act?0:1);
 if(moving){moveEnt(P,vx*sp*dt,vy*sp*dt);P.dir=Math.abs(vx)>Math.abs(vy)?(vx>0?2:1):(vy>0?0:3);P.walk=(P.walk||0)+dt*(sprint?12:8);P.play+=0}
 if(sprint){P.st-=7*dt;P.agT=(P.agT||0)+dt;if(P.agT>1.4){P.agT=0;gainXp('agility',3)}}else{P.st=Math.min(maxSt(),P.st+(moving?2.5:5.5)*dt)}
 if(moving&&!sprint){P.wT=(P.wT||0)+dt;if(P.wT>6){P.wT=0;gainXp('agility',1)}}
 if(P.hurt<=0){const r=(.35+lv('vitality')*.04)*dt;if(P.hp<maxHp()){P.hp=Math.min(maxHp(),P.hp+r);P.rg=(P.rg||0)+r;if(P.rg>8){P.rg=0;gainXp('vitality',2)}}}
 P.mp=Math.min(maxMp(),P.mp+(.35+lv('magic')*.05)*dt);P.hp=Math.min(P.hp,maxHp());
 if(P.hot&&P.hot.left>0){P.hot.left-=dt;P.hp=Math.min(maxHp(),P.hp+P.hot.per*dt)}
 updAct(dt);P.play+=dt}
/* ---- cottage rentals (real-time minutes) ---- */
const HPRICE={10:20,20:35,30:50,45:70,60:90};
function occOf(b){if(b.occ&&b.occ.exp>Date.now())return b.occ;b.occ=null;return null}
function rentLeft(){return P.rent?Math.max(0,P.rent.exp-Date.now()):0}
function rentHouse(b,m){const now=Date.now();if(occOf(b))return toast('Occupied','#f66');if(rentLeft()>0&&P.rent.id!==b.id)return toast('You already rent another cottage','#f66');
 const left=rentLeft(),add=m*60000;if(left+add>61*60000)return toast('Max 60 minutes at a time','#f66');const cost=HPRICE[m];if(P.gold<cost)return toast('Not enough gold','#f66');
 P.gold-=cost;P.rent={id:b.id,exp:now+left+add};sfx('pick');toast(`🏠 Cottage rented for ${m} min`)}
function enterHouse(b){if(!(P.rent&&P.rent.id===b.id&&rentLeft()>0))return;P.inside=b.id;P.insideT=0;P.insideSince=Date.now();P.path=null;P.chase=null;stopAct();closePanel();portCh=null;save()}
function leaveHouse(msg){const b=houses[P.inside]||houses[0],mins=(Date.now()-(P.insideSince||Date.now()))/60000;P.inside=null;P.x=b.dx+.5;P.y=b.dy+.5;P.path=null;cam.x=P.x;cam.y=P.y;
 if(mins>=3){P.rested=Date.now()+15*60000;sys('😌 Well rested! +20% skill xp for 15 minutes.','#9fe3ff')}if(msg)sys(msg,'#fc9')}
function insideTick(dt){P.insideT+=dt;if(P.chicken&&P.insideT>8){P.chicken=0;sys('😴 After a good rest you wake up human again!','#9fe3ff');toast('🧍 You are human again!')}const f=dt*.025;P.hp=Math.min(maxHp(),P.hp+maxHp()*f);P.mp=Math.min(maxMp(),P.mp+maxMp()*f);P.st=Math.min(maxSt(),P.st+maxSt()*f*2);
 if(rentLeft()<=0)leaveHouse('⏰ Your rent ran out – the landlady shows you out.')}
let portCh=null;const PORT_CD=30*60*1000;
function trackVillage(){if(Math.hypot(P.x-CX,P.y-CY)<TOWN_R)P.lastV={x:CX+.5,y:CY+2.5,n:'Hearthmoor Town'};else{const v=VIL.find(v=>Math.hypot(P.x-v.x,P.y-v.y)<VIL_R);if(v)P.lastV={x:v.x+.5,y:v.y+1.5,n:v.name}}}
function castPortal(){if(P.dead)return;if(chickenForm())return toast('🐔 Bawk! (a chicken cannot open portals)','#fc6');if(portCh){portCh=null;return toast('Portal cancelled')}const rem=(P.portAt||0)-Date.now();if(rem>0)return toast(`🌀 Portal recharging: ${Math.ceil(rem/60000)} min`,'#c9f');
 if(!P.lastV)return toast('Visit a village first','#f66');portCh={left:4,x:P.x,y:P.y,hp:P.hp};toast('🌀 Opening portal to '+P.lastV.n+'… stand still','#c9f')}
function updPortal(dt){trackVillage();if(!portCh)return;if(P.dead||P.hp<portCh.hp-.01||Math.hypot(P.x-portCh.x,P.y-portCh.y)>.6){portCh=null;return toast('Portal interrupted','#f66')}
 portCh.hp=P.hp;portCh.left-=dt;if(Math.random()<dt*30)parts.push({x:P.x+rnd(-.5,.5),y:P.y,vx:0,vy:-2,life:.6,c:'#b46aff',sz:2});
 if(portCh.left<=0){const v=P.lastV;burst(P.x,P.y-.4,'#b46aff',30,5);fxs.push({k:'ring',x:P.x,y:P.y,r:2,life:.6,max:.6,c:'#b46aff'});P.x=v.x;P.y=v.y;P.path=null;P.chase=null;cam.x=P.x;cam.y=P.y;burst(P.x,P.y-.4,'#b46aff',30,5);fxs.push({k:'ring',x:P.x,y:P.y,r:2,life:.6,max:.6,c:'#b46aff'});P.portAt=Date.now()+PORT_CD;portCh=null;sys('🌀 Portal to '+v.n+'. Recharges in 30 min.','#c9f');sfx('lvl')}}
function update(dt){clock+=dt;xTick(dt);netStep(dt);updPortal(dt);roosterT-=dt;if(roosterT<=0){spawnRooster();roosterT=rnd(300,540)}shroomSpawnT-=dt;if(shroomSpawnT<=0){spawnShroom();shroomSpawnT=rnd(60,150)}shroomTick(dt);if(P.inside)insideTick(dt);else if(shopSt)shopTick(dt);else updPlayer(dt);updEnemies(dt);updBots(dt);updNpcs(dt);updGuards(dt);updProj(dt);
 for(let i=objs.length-1;i>=0;i--){const o=objs[i];if(o.exp&&clock>o.exp){objs.splice(i,1);objAt.delete(idx(o.x,o.y));continue}
  if(o.dead&&clock>o.dead){o.dead=0;if(o.t==='tree'){o.hp=ri(2,4);solid[idx(o.x,o.y)]=1}else if(o.t==='rock'){o.hp=ri(2,3);solid[idx(o.x,o.y)]=1}else o.hp=1}}
 for(const o of objs)if(o.hp===1&&(o.t==='tree'||o.t==='rock')&&!o.init){o.init=1;o.hp=o.t==='tree'?ri(2,4):ri(2,3)}
 bossTimer-=dt;if(!boss&&bossTimer<=0){bossTimer=300;spawnBoss()}
 if(boss&&clock-boss.born>360){E.splice(E.indexOf(boss),1);boss=null;sys('The Ember Wyrm retreated into the mountains.','#f99')}
 for(let i=fxs.length-1;i>=0;i--){fxs[i].life-=dt;if(fxs[i].life<=0)fxs.splice(i,1)}
 for(let i=floats.length-1;i>=0;i--){const f=floats[i];f.life-=dt;f.y-=dt*.8;if(f.life<=0)floats.splice(i,1)}
 for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=5*dt;if(p.life<=0)parts.splice(i,1)}
 cam.x+=(P.x-cam.x)*Math.min(1,dt*8);cam.y+=(P.y-cam.y)*Math.min(1,dt*8)}
/* ---------- save ---------- */
function save(){netSave();try{P.wanted=flagOf(P)==='red'?Math.max(1,P.vic|0):0;localStorage.setItem('emberfall.v1',JSON.stringify(P,(k,v)=>k==='path'||k==='chase'?undefined:v))}catch(e){}}
function load(){if(NET.on)return NET.save;try{const s=JSON.parse(localStorage.getItem('emberfall.v1'));if(s&&s.xp)return s}catch(e){}return null}
