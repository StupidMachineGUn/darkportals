/* ---------- spell book, Mage shop, Witch hut ---------- */
const SUP=[{id:'mend',n:'Mend',e:'💚',c:'#6f6',lv:5,mp:8,cd:2,d:'Heals you'},{id:'shield',n:'Ward Shield',e:'🛡️',c:'#6af',lv:15,mp:14,cd:12,d:'Absorbs damage for 15s'},{id:'haste',n:'Haste',e:'💨',c:'#ff6',lv:25,mp:16,cd:20,d:'+40% speed for 12s'},
 {id:'regen',n:'Regrowth',e:'🌿',c:'#5f5',lv:40,mp:22,cd:15,d:'Heals over 10s'},{id:'gmend',n:'Greater Mend',e:'💖',c:'#f6a',lv:60,mp:30,cd:4,d:'Big heal + regrowth'},{id:'aegis',n:'Aegis',e:'🔰',c:'#fd6',lv:80,mp:40,cd:25,d:'Huge shield for 20s'}];
/* [gold, {ingredient:amount}, shop] */
const ATK_BUY={1:[80,{gel:5,bone:2},'mage'],2:[200,{pelt:4,feather:4},'mage'],3:[400,{tusk:3,iron:4},'mage'],4:[800,{essence:2,tusk:4,iron:3},'mage'],5:[1500,{essence:4,shroom:1,bone:6},'witch'],6:[2500,{essence:6,pelt:8,gem:1},'witch'],7:[4000,{essence:8,rfeather:1,gem:1},'witch'],8:[6000,{essence:10,shroom:2,gem:2},'witch'],9:[10000,{essence:15,scale:1,gem:3},'witch']};
const SUP_BUY={shield:[120,{wool:3,gel:3},'mage'],haste:[300,{feather:5,pelt:2},'mage'],regen:[700,{berry:6,essence:1},'mage'],gmend:[2800,{essence:5,shroom:1},'witch'],aegis:[7000,{scale:1,essence:8,gem:1},'witch']};
const WSTOCK=[['shroom',120],['essence',70],['gel',6],['bone',9],['pelt',13],['feather',4],['tusk',30],['iron',18],['wool',12],['berry',5],['potion',25]];
const WBUY=new Set(['shroom','essence','gel','bone','pelt','feather','rfeather','tusk','iron','wool','berry','gem','scale','copper']);
function bookInit(){if(P.book)return;const t=Math.min(9,Math.floor(lv('magic')/10));P.book={a:Array.from({length:t+1},(_,i)=>i),s:['mend'],ea:t,es:'mend'}}
const supOf=id=>SUP.find(s=>s.id===id);
function fizzleChance(req){return Math.max(.03,.42-(lv('magic')-req)*.03)}
function fizzle(req){if(P.dev)return false;if(Math.random()<fizzleChance(req)){fl(P.x,P.y-.8,'💨 fizzle','#aaa');burst(P.x,P.y-.5,'#888',6);sfx('miss');gainXp('magic',1);return true}return false}
function castMend(){if(chickenForm())return toast('🐔 Bawk! (chickens cannot cast)','#fc6');if(CD.mend>0||P.dead)return;bookInit();const sp=supOf(P.book.es)||SUP[0];
 if(lv('magic')<sp.lv)return toast(sp.n+' unlocks at Magic '+sp.lv,'#6af');if(P.mp<sp.mp)return toast('Not enough mana','#6af');
 if(sp.id==='mend'&&P.hp>=maxHp())return;
 if(fizzle(sp.lv)){P.mp-=Math.ceil(sp.mp/2);CD.mend=1;CDM.mend=1;return}
 P.mp-=sp.mp;CD.mend=sp.cd;CDM.mend=sp.cd;const m=lv('magic');let h=0;
 if(sp.id==='mend'){h=Math.round(10+m*1.5)}else if(sp.id==='gmend'){h=Math.round(25+m*3);P.hot={left:6,per:3+m*.1}}else if(sp.id==='regen'){P.hot={left:10,per:2+m*.12}}
 else if(sp.id==='shield'){P.shield={v:20+m*2,t:15};fl(P.x,P.y-.8,'🛡️ '+Math.round(P.shield.v),'#6af')}else if(sp.id==='aegis'){P.shield={v:60+m*4,t:20};fl(P.x,P.y-.8,'🔰 '+Math.round(P.shield.v),'#fd6')}else if(sp.id==='haste'){P.hasteT=12;fl(P.x,P.y-.8,'💨 Haste','#ff6')}
 if(h){P.hp=Math.min(maxHp(),P.hp+h);fl(P.x,P.y-.8,'+'+h,'#6f6')}
 gainXp('magic',8+sp.lv*.1);gainXp('vitality',3);burst(P.x,P.y-.5,sp.c,12);sfx('heal');NET.acK=sp.id==='shield'||sp.id==='aegis'?'shield':sp.id==='haste'?'haste':'heal';NET.acT=clock+2}
function suppTick(dt){if(!P)return;if(P.shield){P.shield.t-=dt;if(P.shield.t<=0||P.shield.v<=0)P.shield=null}if(P.hasteT>0)P.hasteT-=dt}
function lvOk(req){return lv('magic')>=req}
function needHtml(need){return Object.entries(need).map(([k,v])=>`<span style="color:${count(k)>=v?'#9fe3a0':'#ff8a8a'}">${ITEMS[k].e}${count(k)}/${v}</span>`).join(' ')}
function spellRow(kind,key,e,n,req,d,cost,need,known){const ok=!known&&lvOk(req)&&P.gold>=cost&&Object.entries(need).every(([k,v])=>count(k)>=v);
 return `<div class="row"><span style="font-size:22px">${e}</span><div style="flex:1"><b>${n}</b> <span class="tip">Magic ${req} · ${d}<br>💰 ${cost}g ${needHtml(need)}</span></div>${known?'<span class="tip">✔ known</span>':bt('learn',kind+':'+key,'Learn',!ok)}</div>`}
function mageHtml(witch){const shop=witch?'witch':'mage';bookInit();let h=hdr((witch?'🧙‍♀️ Morgaine the Witch':'🔮 '+(npcCur?npcCur.n:'Mage Tower'))+' · 💰 '+P.gold);
 h+=`<div class="tip" style="font-size:13px;opacity:1">${witch?'"Heh heh… the deep magic is not for the faint of heart. Gold <i>and</i> ingredients, dearie."':'"Spells for every apprentice – coin and reagents, and I\'ll teach you."'}<br>New spells can fizzle until your Magic level passes their level.</div>`;
 h+='<h3 style="margin-top:8px">⚔ Attack spells</h3>';for(const [i,[g,need,sh]] of Object.entries(ATK_BUY)){if(sh!==shop)continue;const sp=SPELLS[+i];h+=spellRow('a',i,sp.e,sp.n,i*10,'Tier '+i+' bolt'+(sp.aoe?' · area':'')+(sp.chain?' · chain':''),g,need,P.book.a.includes(+i))}
 h+='<h3 style="margin-top:8px">✨ Support spells</h3>';for(const [id,[g,need,sh]] of Object.entries(SUP_BUY)){if(sh!==shop)continue;const sp=supOf(id);h+=spellRow('s',id,sp.e,sp.n,sp.lv,sp.d,g,need,P.book.s.includes(id))}
 if(witch){h+='<h3 style="margin-top:10px">🍄 Ingredients & mushrooms</h3><div class="tip">She buys ingredients and magic mushrooms at +40%.</div>';
  for(const [id,pr] of WSTOCK){const it=ITEMS[id];h+=`<div class="row"><span style="font-size:22px">${it.e}</span><div style="flex:1"><b>${it.n}</b><div class="tip">have ${count(id)}</div></div>${bt('wbuy',id,pr+'g',P.gold<pr)}</div>`}
  h+='<h3 style="margin-top:8px">Sell to the witch</h3>';let any=0;const seen=new Set();for(const s of P.inv){if(!WBUY.has(s.id)||seen.has(s.id))continue;seen.add(s.id);any=1;const it=ITEMS[s.id],n=count(s.id),pr=Math.round(it.v*1.4);h+=`<div class="row"><span style="font-size:22px">${it.e}</span><div style="flex:1"><b>${it.n}</b> ×${n}<div class="tip">${pr}g each</div></div>${bt('wsell',s.id,'Sell 1')}${n>1?bt('wsellall',s.id,'All · '+pr*n+'g'):''}</div>`}if(!any)h+='<div class="tip">Nothing she wants.</div>'}
 return h}
function bookHtml(){bookInit();const b=P.book;let h=hdr('📖 Spell book · Magic '+lv('magic'));h+=`<div class="tip" style="font-size:13px;opacity:1">Pick one attack and one support spell for your hotbar. Buy new spells from the <b>Mage</b> (towns &amp; cities) or the <b>Witch</b> (forest hut).</div><h3 style="margin-top:8px">⚔ Attack</h3>`;
 for(let i=0;i<10;i++){if(!b.a.includes(i))continue;const sp=SPELLS[i],f=Math.round(fizzleChance(i*10)*100),on=b.ea===i;h+=`<div class="row"><span style="font-size:22px">${sp.e}</span><div style="flex:1"><b>${sp.n}</b> <span class="tip">${4+i*2} mana · fizzle ${lv('magic')>=i*10?f+'%':'needs Magic '+i*10}</span></div>${bt('eqa',i,on?'✔ Equipped':'Equip',on)}</div>`}
 h+='<h3 style="margin-top:8px">✨ Support</h3>';for(const sp of SUP){if(!b.s.includes(sp.id))continue;const on=b.es===sp.id,f=Math.round(fizzleChance(sp.lv)*100);h+=`<div class="row"><span style="font-size:22px">${sp.e}</span><div style="flex:1"><b>${sp.n}</b> <span class="tip">${sp.mp} mana · ${sp.d} · fizzle ${lv('magic')>=sp.lv?f+'%':'needs Magic '+sp.lv}</span></div>${bt('eqs',sp.id,on?'✔ Equipped':'Equip',on)}</div>`}
 return h}
function sAct(a,v){bookInit();const b=P.book;
 if(a==='eqa'){b.ea=+v;sfx('pick');toast(SPELLS[+v].e+' '+SPELLS[+v].n+' equipped');return true}
 if(a==='eqs'){b.es=v;sfx('pick');toast(supOf(v).e+' '+supOf(v).n+' equipped');return true}
 if(a==='learn'){const [k,key]=v.split(':'),row=k==='a'?ATK_BUY[+key]:SUP_BUY[key],req=k==='a'?+key*10:supOf(key).lv;if(!row||!lvOk(req)||P.gold<row[0]||!Object.entries(row[1]).every(([i,n])=>count(i)>=n))return true;
  P.gold-=row[0];for(const i in row[1])take(i,row[1][i]);if(k==='a'){b.a.push(+key);b.ea=+key;toast('📖 Learned '+SPELLS[+key].n+'!')}else{b.s.push(key);b.es=key;toast('📖 Learned '+supOf(key).n+'!')}sfx('lvl');save();return true}
 if(a==='wbuy'){const r=WSTOCK.find(x=>x[0]===v);if(r&&P.gold>=r[1]&&addItem(v)){P.gold-=r[1];sfx('pick')}return true}
 if(a==='wsell'){if(WBUY.has(v)&&count(v)>0){P.gold+=Math.round(ITEMS[v].v*1.4);take(v);sfx('pick')}return true}
 if(a==='wsellall'){if(WBUY.has(v)){const n=count(v);P.gold+=Math.round(ITEMS[v].v*1.4)*n;take(v,n);sfx('pick')}return true}
 return false}
