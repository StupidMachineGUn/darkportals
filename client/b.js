<script>
'use strict';
/* ===== EMBERFALL client prototype =====
   Architecture: World (static gen) + Sim (entities, rules) + Net (transport stub) + UI.
   Net is the seam for the server phase: replace LocalNet with a WebSocket and keep the same messages. */
const T=16,MW=300,MH=300,CX=150,CY=150;
const $=s=>document.querySelector(s);
const rnd=(a,b)=>a+Math.random()*(b-a),ri=(a,b)=>Math.floor(rnd(a,b+1)),pick=a=>a[ri(0,a.length-1)];
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const SEED=20261107;
function hash(x,y,s=0){let h=(x*374761393+y*668265263+(SEED+s)*69069)|0;h=(h^h>>>13)*1274126177|0;return((h^h>>>16)>>>0)/4294967296}
function vn(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,s=t=>t*t*(3-2*t),a=hash(xi,yi),b=hash(xi+1,yi),c=hash(xi,yi+1),d=hash(xi+1,yi+1),u=s(xf),v=s(yf);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
const fbm=(x,y)=>vn(x,y)*.55+vn(x*2,y*2)*.3+vn(x*4,y*4)*.15;

/* ---------- data ---------- */
const SK=[
 ['melee','Melee','⚔️','Hit monsters in melee'],['defense','Defense','🛡️','Get hit (and survive!)'],
 ['magic','Magic','🔮','Cast Ember Bolt / Mend'],['agility','Agility','👟','Run around (sprint)'],
 ['vitality','Vitality','❤️','Take damage, heal up'],['woodcut','Woodcutting','🪓','Chop trees'],
 ['mining','Mining','⛏️','Mine rocks'],['fishing','Fishing','🎣','Fish at the shore'],
 ['cooking','Cooking','🍳','Cook at a fire'],['crafting','Smithing','🔨','Forge at the anvil']];
const ITEMS={
 log:{n:'Log',e:'🪵',v:2},copper:{n:'Copper Ore',e:'🟤',v:3},iron:{n:'Iron Ore',e:'🔩',v:9},gem:{n:'Ember Gem',e:'💎',v:150},
 shrimp:{n:'Raw Shrimp',e:'🦐',v:2,raw:'cshrimp',lv:1},trout:{n:'Raw Trout',e:'🐟',v:6,raw:'ctrout',lv:8},salmon:{n:'Raw Salmon',e:'🐠',v:14,raw:'csalmon',lv:20},
 cshrimp:{n:'Fried Shrimp',e:'🍤',v:4,heal:8},ctrout:{n:'Grilled Trout',e:'🍖',v:12,heal:20},csalmon:{n:'Salmon Feast',e:'🍱',v:28,heal:40},
 berry:{n:'Wild Berries',e:'🍇',v:2,heal:4},bread:{n:'Bread',e:'🍞',v:6,heal:12,buy:8},potion:{n:'Mana Potion',e:'🧪',v:10,mana:25,buy:18},
 tusk:{n:'Orc Tusk',e:'🦷',v:14},essence:{n:'Spirit Essence',e:'💠',v:30},hpotion:{n:'Health Potion',e:'🍷',v:12,heal:45,pot:1,buy:25},gel:{n:'Slime Gel',e:'🟢',v:2},pelt:{n:'Wolf Pelt',e:'🐺',v:6},bone:{n:'Bone',e:'🦴',v:4},scale:{n:'Wyrm Scale',e:'🐉',v:80},
 sword0:{n:'Rusty Sword',e:'🗡️',v:1,slot:'w',atk:1},sword1:{n:'Copper Blade',e:'🔪',v:20,slot:'w',atk:3,req:['melee',3]},
 sword2:{n:'Iron Sword',e:'⚔️',v:60,slot:'w',atk:6,req:['melee',10]},staff:{n:'Oak Staff',e:'🪄',v:60,slot:'w',atk:1,mag:4,buy:120,req:['magic',5]},
 arm0:{n:'Cloth Tunic',e:'👕',v:1,slot:'a',def:0},arm1:{n:'Copper Mail',e:'🥋',v:40,slot:'a',def:3,req:['defense',3]},arm2:{n:'Iron Armor',e:'🛡️',v:120,slot:'a',def:7,req:['defense',10]},
 sword3:{n:'Steel Sword',e:'🗡️',v:140,slot:'w',atk:9,req:['melee',18]},sword4:{n:'Runeblade',e:'⚔️',v:600,slot:'w',atk:15,req:['melee',30]},
 staff2:{n:'Ember Staff',e:'🪄',v:200,slot:'w',atk:1,mag:8,req:['magic',12]},staff3:{n:'Archmage Staff',e:'🔱',v:700,slot:'w',atk:2,mag:14,req:['magic',25]},
 arm3:{n:'Steel Plate',e:'🛡️',v:250,slot:'a',def:10,req:['defense',15]},arm4:{n:'Titan Plate',e:'🏆',v:800,slot:'a',def:16,req:['defense',30]},
 scalearm:{n:'Wyrm Mail',e:'👑',v:400,slot:'a',def:12,req:['defense',20]}};
const RECIPES=[
 {out:'sword1',need:{copper:4},lv:1,xp:30},{out:'arm1',need:{copper:8},lv:4,xp:60},
 {out:'sword2',need:{iron:5,copper:2},lv:10,xp:120},{out:'arm2',need:{iron:9},lv:14,xp:200},
 {out:'scalearm',need:{scale:3,iron:6},lv:25,xp:600},
 {out:'staff',need:{log:6,copper:2},lv:3,xp:50},{out:'staff2',need:{essence:5,log:4},lv:12,xp:180},{out:'sword3',need:{iron:8,copper:4},lv:18,xp:300},{out:'arm3',need:{iron:14,tusk:3},lv:22,xp:450}];
Object.assign(ITEMS,{wool:{n:'Wool',e:'🧶',v:6},mutton:{n:'Raw Mutton',e:'🥩',v:9,heal:4,raw:'cmutton',lv:5},cmutton:{n:'Roast Mutton',e:'🍖',v:24,heal:55},egg:{n:'Raw Egg',e:'🥚',v:3,heal:2,raw:'fegg',lv:1},fegg:{n:'Fried Egg',e:'🍳',v:8,heal:14},drum:{n:'Raw Chicken Leg',e:'🍗',v:7,heal:3,raw:'cdrum',lv:3},cdrum:{n:'Roast Chicken Leg',e:'🍖',v:18,heal:40},feather:{n:'Feather',e:'🪶',v:2},rfeather:{n:'Rooster Feather',e:'🪶',v:140},gegg:{n:'Golden Egg',e:'🥚',v:450},shroom:{n:'Magic Shroom ⚠️',e:'🍄',v:60,shroom:1}});
/* ---- extended gear ---- */
for(const [id,n,e,v,atk,mag,rk,rl] of [
 ['dagger1','Hunter Dagger','🔪',40,4,0,'melee',5],['axe1','Woodsman Axe','🪓',90,7,0,'melee',12],['mace1','Iron Mace','🔨',130,10,0,'melee',16],
 ['spear1','Soldier Spear','🔱',200,12,0,'melee',22],['axe2','Battle Axe','🪓',420,17,0,'melee',28],['great1','Greatsword','⚔️',1400,26,0,'melee',38],
 ['sword5','Mithril Blade','🗡️',900,22,0,'melee',45],['sword6','Dragonfang','🗡️',2200,34,0,'melee',60],['axe3','Titan Axe','🪓',3200,40,0,'melee',70],['sword7','Celestial Blade','✨',5000,50,0,'melee',85],
 ['staff4','Frost Staff','🪄',500,2,20,'magic',35],['staff5','Void Staff','🔮',1600,3,30,'magic',55],['staff6','Celestial Scepter','🌟',4500,4,45,'magic',75]])
 ITEMS[id]={n,e,v,slot:'w',atk,...(mag?{mag}:{}),req:[rk,rl]};
for(const [id,n,v,d,rl] of [['arm5','Mithril Mail',1800,22,45],['arm6','Dragon Plate',4000,30,60],['arm7','Celestial Armor',7000,42,80]])ITEMS[id]={n,e:'🛡️',v,slot:'a',def:d,req:['defense',rl]};
for(const [t,hn,bn,hd,bd,rq,v] of [[0,'Leather Cap','Leather Boots',1,1,0,30],[1,'Copper Helm','Copper Greaves',2,2,3,60],[2,'Iron Helm','Iron Greaves',4,3,10,130],[3,'Steel Helm','Steel Greaves',6,4,18,260],[4,'Wyrm Horned Helm','Wyrm Boots',8,6,22,420],
 [5,'Titan Helm','Titan Greaves',10,8,32,800],[6,'Mithril Helm','Mithril Greaves',13,10,45,1300],[7,'Dragon Helm','Dragon Greaves',17,13,60,2600],[8,'Celestial Crown','Celestial Sabatons',22,17,80,4800]]){
 ITEMS['hm'+t]={n:hn,e:t===8?'👑':t<2?'🧢':'⛑️',v,slot:'h',def:hd,tier:t,...(rq?{req:['defense',rq]}:{}),...(t===0?{buy:35}:{})};
 ITEMS['bt'+t]={n:bn,e:'🥾',v:Math.round(v*.8),slot:'b',def:bd,tier:t,...(rq?{req:['defense',rq]}:{}),...(t===0?{buy:35}:{})}}
RECIPES.push(
 {out:'hm0',need:{pelt:3},lv:1,xp:20},{out:'bt0',need:{pelt:3},lv:1,xp:20},{out:'hm1',need:{copper:5},lv:5,xp:50},{out:'bt1',need:{copper:5},lv:5,xp:50},
 {out:'dagger1',need:{iron:3,log:1},lv:6,xp:80},{out:'axe1',need:{iron:4,log:4},lv:8,xp:110},{out:'hm2',need:{iron:6},lv:12,xp:150},{out:'bt2',need:{iron:6},lv:12,xp:150},
 {out:'mace1',need:{iron:7,copper:3},lv:12,xp:170},{out:'spear1',need:{iron:6,log:5,tusk:2},lv:16,xp:250},{out:'hm3',need:{iron:10,tusk:2},lv:20,xp:320},{out:'bt3',need:{iron:10,tusk:2},lv:20,xp:320},
 {out:'axe2',need:{iron:12,tusk:4},lv:24,xp:420},{out:'hm4',need:{scale:2,iron:6},lv:26,xp:500},{out:'bt4',need:{scale:2,iron:6},lv:26,xp:500},{out:'staff4',need:{essence:8,gem:3,log:6},lv:30,xp:600},
 {out:'hm5',need:{iron:14,gem:2},lv:34,xp:700},{out:'bt5',need:{iron:14,gem:2},lv:34,xp:700},{out:'great1',need:{iron:20,tusk:8,gem:4},lv:38,xp:900},
 {out:'sword5',need:{iron:14,essence:6,gem:3},lv:45,xp:1300},{out:'arm5',need:{iron:20,essence:8,gem:4},lv:45,xp:1400},{out:'hm6',need:{essence:6,gem:3,iron:12},lv:45,xp:1300},{out:'bt6',need:{essence:6,gem:3,iron:12},lv:45,xp:1300},
 {out:'staff5',need:{essence:14,gem:6,scale:3},lv:50,xp:1800},{out:'sword6',need:{scale:6,essence:10,gem:5},lv:60,xp:2400},{out:'arm6',need:{scale:8,iron:20,gem:8},lv:60,xp:2600},
 {out:'hm7',need:{scale:6,gem:5,essence:8},lv:60,xp:2400},{out:'bt7',need:{scale:6,gem:5,essence:8},lv:60,xp:2400},{out:'axe3',need:{iron:24,scale:4,gem:6},lv:65,xp:2800},
 {out:'staff6',need:{essence:24,gem:12,scale:6},lv:75,xp:4000},{out:'hm8',need:{essence:20,gem:10,scale:8},lv:75,xp:4200},{out:'bt8',need:{essence:20,gem:10,scale:8},lv:75,xp:4200},
 {out:'sword7',need:{essence:25,gem:12,scale:8},lv:80,xp:5000},{out:'arm7',need:{essence:30,gem:14,scale:10},lv:80,xp:6000});

const QUESTS=[
 {id:'q1',t:'Slime Trouble',d:'Defeat 6 slimes',k:'slime',n:6,g:40,xp:['melee',60]},
 {id:'q2',t:'Firewood',d:'Chop 12 logs',k:'log',n:12,g:50,xp:['woodcut',90]},
 {id:'q3',t:'Fresh Catch',d:'Catch 8 fish',k:'fish',n:8,g:60,xp:['fishing',100]},
 {id:'q4',t:'Ore Hunter',d:'Mine 10 ore',k:'ore',n:10,g:80,xp:['mining',140]},
 {id:'q5',t:'Wolf Pack',d:'Defeat 8 wolves',k:'wolf',n:8,g:120,xp:['defense',200]},
 {id:'q6',t:'Grave Duty',d:'Defeat 8 skeletons',k:'skeleton',n:8,g:200,xp:['melee',350]},
 {id:'q8',t:'Orc Hunter',d:'Defeat 8 orcs',k:'orc',n:8,g:300,xp:['melee',500]},
 {id:'q9',t:'Ogre Slayer',d:'Defeat 6 ogres',k:'ogre',n:6,g:600,xp:['defense',800]},
 {id:'q10',t:'Troll Bane',d:'Defeat 6 trolls',k:'troll',n:6,g:1500,xp:['melee',2500]},
 {id:'q11',t:'Demon Purge',d:'Defeat 4 demons',k:'demon',n:4,g:3000,xp:['magic',4000]},
 {id:'q7',t:'Slay the Wyrm',d:'Defeat the Ember Wyrm',k:'wyrm',n:1,g:500,xp:['magic',600]}];
const lvOf=xp=>Math.min(99,1+Math.floor(Math.sqrt(xp/18)));
const xpAt=l=>18*(l-1)*(l-1);

/* ---------- world gen ---------- */
const TL={DEEP:0,SHAL:1,SAND:2,GRASS:3,FOREST:4,PATH:5,PLAZA:6,STONE:7,DARK:8,WALL:9};
const map=new Uint8Array(MW*MH),solid=new Uint8Array(MW*MH),reach=new Uint8Array(MW*MH);
const idx=(x,y)=>y*MW+x,inb=(x,y)=>x>=0&&y>=0&&x<MW&&y<MH;
const isWater=(x,y)=>inb(x,y)&&map[idx(x,y)]<=1;
const objs=[],objAt=new Map(),buildings=[],npcs=[],inNpcs=[],houses=[];
const GYS=[{x:CX+45,y:CY-42},{x:CX-93,y:CY+69},{x:CX+87,y:CY+93},{x:CX-51,y:CY-108}];
const VIL=[],guards=[];const TOWN_R=20,VIL_R=12,safeAt=(x,y)=>Math.hypot(x-CX,y-CY)<TOWN_R||VIL.some(v=>Math.hypot(x-v.x,y-v.y)<VIL_R);
function genWorld(){
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){
  const dx=(x-CX)/(MW/2),dy=(y-CY)/(MH/2),d=Math.sqrt(dx*dx+dy*dy);
  let e=fbm(x/20,y/20)*1.25-Math.pow(d,2.4)*.95+.18;
  const m=fbm(x/14+50,y/14+50),dc=Math.hypot(x-CX,y-CY);
  if(dc<30)e=Math.max(e,.55);
  let t;
  if(e<.3)t=TL.DEEP;else if(e<.38)t=TL.SHAL;else if(e<.42)t=TL.SAND;
  else if(e>.78)t=TL.STONE;else if(m>.56)t=TL.FOREST;else t=TL.GRASS;
  if(GYS.some(g=>Math.hypot(x-g.x,y-g.y)<9)&&t>=2&&t!==TL.SAND)t=TL.DARK;
  if(dc<9)t=TL.PLAZA;
  map[idx(x,y)]=t;
 }
 for(let i=0;i<MW;i++){for(const [x,y] of [[i,CY],[CX,i],[i,CY+1],[CX+1,i]]){const k=idx(x,y);if(map[k]>=2&&map[k]!==TL.PLAZA&&map[k]!==TL.STONE)map[k]=TL.PATH}}
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(map[idx(x,y)]<=1)solid[idx(x,y)]=1;
 // buildings (x,y = top-left in tiles relative to center)
 const B=[['Shop',-6,-6,5,4,'#34527f'],['Forge',3,-6,5,4,'#8a3a22'],['Inn',3,2,5,4,'#8a6a2a'],['Elder Hall',-6,2,5,4,'#4e3d6e'],['Bank',-6,-12,5,4,'#6b5a2a'],['Trade House',3,-12,5,4,'#2a5a5a']];
 for(const [n,dx,dy,w,h,c] of B){const b={n,x:CX+dx,y:CY+dy,w,h,c,dx:CX+dx+(w>>1),dy:CY+dy+h};buildings.push(b);
  for(let j=0;j<h;j++)for(let i=0;i<w;i++)solid[idx(b.x+i,b.y+j)]=1;
  // door tile stays blocked; NPC stands below the door
 }
 const npc=(b,n,role,col)=>{b.npc={n,name:n,role,col,npc:true,dead:0,x:b.dx,y:b.dy-1};inNpcs.push(b.npc)};
 const guard=(x,y)=>guards.push({guard:true,act:true,name:'Guard',x:x+.5,y:y+.5,hx:x+.5,hy:y+.5,hp:600,mhp:600,dead:0,flag:null,fT:0,vic:0,cd:0,sw:0,flash:0,dir:0});
 npc(buildings[0],'Pip','shop','#34527f');npc(buildings[1],'Brakka','smith','#8a3a22');npc(buildings[2],'Rosa','inn','#8a6a2a');npc(buildings[3],'Elder Maren','elder','#4e3d6e');npc(buildings[4],'Gorm','bank','#6b5a2a');npc(buildings[5],'Vessa','trade','#2a5a5a');
 guard(CX-1,CY-12);guard(CX+2,CY+13);guard(CX-13,CY);guard(CX+14,CY+1);guard(CX-9,CY-9);guard(CX+10,CY+10);
 const pre=new Uint8Array(MW*MH);{const q=[idx(CX,CY)];pre[q[0]]=1;for(let h=0;h<q.length;h++){const k=q[h],x=k%MW,y=(k/MW)|0;for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+a,ny=y+b;if(inb(nx,ny)&&!pre[idx(nx,ny)]&&map[idx(nx,ny)]>1){pre[idx(nx,ny)]=1;q.push(idx(nx,ny))}}}}
 const VT=[[70,10,'Oakhollow',1,[['orc',12],['wolf',6]],['Hobb','Mara']],[-12,-76,'Stonereach',2,[['ogre',8],['orc',8]],['Dren','Sela']],[-76,44,'Gravewatch',3,[['wraith',10],['skeleton',10],['ogre',4]],['Orin','Vesk']],[14,88,'Emberkeep',4,[['troll',8],['ogre',8]],['Tamsin','Rook']],[100,-52,'Frostmere',5,[['troll',10],['wraith',8]],['Bjorn','Ilsa']],[-92,-84,'Dragonwatch',6,[['demon',8],['troll',8]],['Kael','Nyra']]];
 const cands=[];for(let vy=10;vy<MH-10;vy+=2)for(let vx=11;vx<MW-10;vx+=2){if(Math.hypot(vx-CX,vy-CY)<50)continue;let ok=true;for(let y=vy-8;y<=vy+8&&ok;y++)for(let x=vx-9;x<=vx+9;x++){const k=idx(x,y);if(!pre[k]){ok=false;break}}if(ok)cands.push([vx,vy])}
 for(const [dx,dy,name,tier,mobs,nn] of VT){let found=null,bd=1e9;
  for(const [vx,vy] of cands){if(VIL.some(v=>Math.hypot(v.x-vx,v.y-vy)<34))continue;const d=Math.hypot(vx-CX-dx,vy-CY-dy);if(d<bd){bd=d;found=[vx,vy]}}
  if(!found)continue;const [vx,vy]=found;VIL.push({name,tier,mobs,x:vx,y:vy});
  for(let y=vy-8;y<=vy+8;y++)for(let x=vx-8;x<=vx+8;x++)if(Math.hypot(x-vx,y-vy)<6.2)map[idx(x,y)]=TL.PATH;
  const bds=[];for(const [n,bx,c] of [['Smithy',vx-7,'#6a4a2a'],['Inn',vx+3,'#553a20']]){const bd={n,x:bx,y:vy-5,w:4,h:3,c,dx:bx+2,dy:vy-2};buildings.push(bd);bds.push(bd);for(let j=0;j<3;j++)for(let i=0;i<4;i++)solid[idx(bd.x+i,bd.y+j)]=1;map[idx(bd.dx,bd.dy)]=TL.PATH}
  npc(bds[0],nn[0],'shop','#6a4a2a');npc(bds[1],nn[1],'inn','#7a5a30');guard(vx-3,vy+2);guard(vx+3,vy+2);guard(vx-9,vy);guard(vx+9,vy)}
 /* ---- rentable cottages ---- */
 const canPlace=(x,y,w,h,okPath,town)=>{for(let j=y-1;j<=y+h+1;j++)for(let i=x-1;i<x+w+1;i++){if(!inb(i,j))return false;const k=idx(i,j);if(map[k]<2||solid[k])return false;if(!okPath&&map[k]===TL.PATH)return false;if(town&&(i>=CX-1&&i<=CX+2||j>=CY-1&&j<=CY+2))return false}return true};
 const HC=['#6a5a3a','#7a4a3a','#4a6a5a','#5a4a6a','#8a6a4a','#4a5a7a','#7a6a3a','#6a3a3a'];
 const addHouse=(x,y,town)=>{const b={n:'Cottage',x,y,w:3,h:3,c:HC[houses.length%HC.length],dx:x+1,dy:y+3,house:true,id:houses.length,town};houses.push(b);buildings.push(b);for(let j=0;j<3;j++)for(let i=0;i<3;i++)solid[idx(x+i,y+j)]=1;map[idx(b.dx,b.dy)]=TL.PATH};
 {let cnt=0;for(const r of [11.5,14.5,17.5]){const n=Math.floor(6.283*r/5);for(let i=0;i<n&&cnt<34;i++){const a=i/n*6.283+r;const x=Math.round(CX+Math.cos(a)*r)-1,y=Math.round(CY+Math.sin(a)*r)-1;if(canPlace(x,y,3,3,false,true)){addHouse(x,y,'Hearthmoor Town');cnt++}}}}
 for(const v of VIL){let cnt=0;const n=14;for(let i=0;i<n&&cnt<5;i++){const a=i/n*6.283;const x=Math.round(v.x+Math.cos(a)*8.3)-1,y=Math.round(v.y+Math.sin(a)*8.3)-1;if(canPlace(x,y,3,3,true,false)){addHouse(x,y,v.name);cnt++}}}
 // flood fill reachability
 const q=[[CX,CY+1]];reach[idx(CX,CY+1)]=1;
 for(let h=0;h<q.length;h++){const [x,y]=q[h];for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+a,ny=y+b;if(inb(nx,ny)&&!solid[idx(nx,ny)]&&!reach[idx(nx,ny)]){reach[idx(nx,ny)]=1;q.push([nx,ny])}}}
 // resources
 const add=(x,y,t,extra={})=>{const o={x,y,t,hp:1,dead:0,...extra};objs.push(o);objAt.set(idx(x,y),o);if(t==='tree'||t==='rock'||t==='anvil')solid[idx(x,y)]=1;return o};
 for(const v of VIL)add(v.x,v.y-1,'fire');
 add(CX+4,CY-2,'anvil');add(CX+1,CY-3,'fire');add(CX-2,CY+3,'fire');
 for(let y=2;y<MH-2;y++)for(let x=2;x<MW-2;x++){
  const k=idx(x,y);if(!reach[k]||solid[k]||objAt.has(k))continue;
  const t=map[k],r=hash(x,y,7),dc=Math.hypot(x-CX,y-CY);if(dc<22||VIL.some(v=>Math.hypot(x-v.x,y-v.y)<13))continue;
  if(t===TL.FOREST&&r<.2)add(x,y,'tree');
  else if(t===TL.GRASS&&r<.025)add(x,y,'tree');
  else if(t===TL.STONE&&r<.07)add(x,y,'rock',{ore:hash(x,y,9)<.35?'iron':'copper'});
  else if(t===TL.GRASS&&r>.985)add(x,y,'rock',{ore:'copper'});
  else if((t===TL.GRASS||t===TL.FOREST)&&r>.968&&r<=.985)add(x,y,'bush');
 }
}
const walkable=(x,y)=>inb(x,y)&&!solid[idx(x,y)];
function bfs(sx,sy,tx,ty,max=1400,adj=false){
 const key=(x,y)=>y*MW+x,prev=new Map([[key(sx,sy),-1]]),q=[[sx,sy]];
 for(let h=0;h<q.length&&h<max;h++){const [x,y]=q[h];
  if(adj?(Math.abs(x-tx)+Math.abs(y-ty)===1||(x===tx&&y===ty)):(x===tx&&y===ty)){const p=[];let c=key(x,y);while(c!==-1){p.push([c%MW,(c/MW)|0]);c=prev.get(c)}return p.reverse().slice(1)}
  for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+a,ny=y+b,k=key(nx,ny);if(walkable(nx,ny)&&!prev.has(k)){prev.set(k,key(x,y));q.push([nx,ny])}}}
 return null}
/* ---------- sprites (procedural pixel art, cached) ---------- */
const mk=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');fn(g);return c};
const PAL={[TL.DEEP]:['#12303d','#18394a'],[TL.SHAL]:['#23505a','#2b5d6a'],[TL.SAND]:['#9a8a5e','#8b7c52'],[TL.GRASS]:['#2e5a2b','#366533'],[TL.FOREST]:['#1c3b21','#244629'],
 [TL.PATH]:['#6a5636','#5c4a2e'],[TL.PLAZA]:['#65655f','#585853'],[TL.STONE]:['#52565f','#474b54'],[TL.DARK]:['#30263a','#281f30'],[TL.WALL]:['#15111c','#0e0b14']};
const tileImg={};
function buildTiles(){
 for(const t in PAL)tileImg[t]=[0,1,2,3].map(v=>mk(T,T,g=>{
  g.fillStyle=PAL[t][0];g.fillRect(0,0,T,T);
  for(let i=0;i<14;i++){const x=ri(0,15),y=ri(0,15);g.fillStyle=PAL[t][1];g.fillRect(x,y,ri(1,2),1)}
  if(t==TL.GRASS||t==TL.FOREST){g.fillStyle=t==TL.GRASS?'#3e7837':'#2e6835';for(let i=0;i<3;i++){const x=ri(1,14),y=ri(2,14);g.fillRect(x,y,1,2)}}
  if(t==TL.PLAZA){g.fillStyle='#454540';g.fillRect(0,7,T,1);g.fillRect(7,0,1,T);g.fillRect(0,15,T,1);g.fillRect(15,0,1,T)}
  if(t==TL.STONE){g.fillStyle='#686d79';g.fillRect(ri(2,12),ri(2,12),3,2);g.fillStyle='#3b3f49';g.fillRect(ri(2,12),ri(2,12),2,1)}
  if(t==TL.WALL){g.fillStyle='#07050b';g.fillRect(0,7,T,1);g.fillRect(0,15,T,1);g.fillRect(3+(v%2)*8,0,1,7);g.fillRect(8-(v%2)*6,8,1,7);g.fillStyle='#241d30';g.fillRect(1,1,5,1);g.fillRect(9,9,5,1)}
  if(t==TL.DARK){g.fillStyle='#2f2840';g.fillRect(ri(2,12),ri(2,12),2,2)}
  if(t<=1){g.fillStyle='#ffffff1c';const o=v*4;g.fillRect(2+o%12,3+o%7,3,1);g.fillRect(9-o%5,11,3,1)}
 }));
}
let SPR={};
function buildSprites(){
 SPR.tree=mk(32,40,g=>{g.fillStyle='#00000030';g.fillRect(8,36,16,3);g.fillStyle='#4a2f18';g.fillRect(13,24,6,14);g.fillStyle='#2e1c0d';g.fillRect(13,24,2,14);
  for(const [x,y,r,c] of [[16,12,12,'#1c4821'],[9,17,8,'#193f1d'],[23,17,8,'#235225'],[16,7,8,'#2b682d']]){g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,7);g.fill()}
  g.fillStyle='#48863a';g.fillRect(12,5,4,2);g.fillRect(8,13,3,2);g.fillRect(21,10,4,2)});
 SPR.stump=mk(16,16,g=>{g.fillStyle='#6b4423';g.fillRect(4,8,8,6);g.fillStyle='#a07840';g.fillRect(4,7,8,3);g.fillStyle='#c9a15a';g.fillRect(6,8,4,1)});
 const rock=(c1,c2,fl)=>mk(16,16,g=>{g.fillStyle='#0003';g.fillRect(2,13,12,2);g.fillStyle=c1;g.beginPath();g.moveTo(2,13);g.lineTo(4,5);g.lineTo(9,2);g.lineTo(14,6);g.lineTo(14,13);g.fill();g.fillStyle=c2;g.fillRect(5,6,3,2);g.fillStyle=fl;g.fillRect(9,8,2,2);g.fillRect(5,10,2,2);g.fillRect(11,5,1,1)});
 SPR.copper=rock('#8a8f99','#a9aeb8','#d98a4a');SPR.iron=rock('#6b7080','#8b90a0','#9fe0ff');SPR.rockdead=rock('#555','#666','#555');
 SPR.shroom=mk(16,16,g=>{g.fillStyle='#0003';g.fillRect(3,13,10,2);g.fillStyle='#e8e0f0';g.fillRect(6,8,4,6);g.fillStyle='#c8c0d8';g.fillRect(9,8,1,6);g.fillStyle='#b43ad8';g.fillRect(3,5,10,4);g.fillRect(4,3,8,2);g.fillRect(6,2,4,1);g.fillStyle='#e07aff';g.fillRect(4,3,3,1);g.fillStyle='#7bfff0';g.fillRect(4,6,2,2);g.fillRect(9,4,2,2);g.fillRect(11,7,1,1);g.fillStyle='#fff';g.fillRect(7,5,1,1)});
 SPR.bush=mk(16,16,g=>{g.fillStyle='#0003';g.fillRect(2,13,12,2);g.fillStyle='#26602b';g.beginPath();g.arc(8,9,6,0,7);g.fill();g.fillStyle='#357a38';g.fillRect(4,5,4,2);g.fillStyle='#a02840';for(const [x,y] of [[5,8],[9,6],[10,10],[6,11]])g.fillRect(x,y,2,2)});
 SPR.bushdead=mk(16,16,g=>{g.fillStyle='#26602b';g.beginPath();g.arc(8,9,6,0,7);g.fill()});
 SPR.anvil=mk(16,16,g=>{g.fillStyle='#0003';g.fillRect(2,13,12,2);g.fillStyle='#444a55';g.fillRect(3,6,10,3);g.fillRect(6,9,4,4);g.fillRect(4,13,8,1);g.fillStyle='#7d8696';g.fillRect(3,6,10,1);g.fillRect(1,7,3,1)});
 for(const b of buildings)b.img=mk(b.w*T,b.h*T+16,g=>{
  const W=b.w*T,H=b.h*T;
  if(b.house){const W2=W>>1;g.fillStyle='#0003';g.fillRect(2,H+12,W-4,4);g.fillStyle='#b4a27a';g.fillRect(4,26,W-8,H-8);g.fillStyle='#00000020';for(let y=30;y<H+16;y+=6)g.fillRect(4,y,W-8,1);
   for(let r=0;r<13;r++){const w=10+r*3;g.fillStyle=r%4===3?shade(b.c,.7):b.c;g.fillRect(W2-(w>>1),2+r*2,w,2)}g.fillStyle='#ffffff25';g.fillRect(W2-6,3,12,1);g.fillStyle='#5a5a5e';g.fillRect(W-14,0,5,12);g.fillStyle='#3a3a3e';g.fillRect(W-14,0,5,2);
   g.fillStyle='#34200f';g.fillRect(W2-5,H-4,10,20);g.fillStyle='#4a2e18';g.fillRect(W2-4,H-3,8,18);g.fillStyle='#ffd36b';g.fillRect(W2+2,H+6,2,2);
   for(const x of [8,W-18]){g.fillStyle='#e0b860';g.fillRect(x,H-6,10,9);g.fillStyle='#2a1a0a';g.fillRect(x+4,H-6,2,9);g.fillRect(x,H-2,10,1);g.fillStyle='#6a4a2a';g.fillRect(x-1,H+3,12,2)}return}g.fillStyle='#8f7f60';g.fillRect(0,28,W,H-12);
  g.fillStyle='#00000018';for(let y=34;y<H+16;y+=8)g.fillRect(0,y,W,1);
  g.fillStyle=b.c;g.fillRect(-2,6,W+4,26);g.fillStyle='#00000030';g.fillRect(-2,28,W+4,4);g.fillStyle='#ffffff30';for(let x=0;x<W;x+=8)g.fillRect(x,8,4,2);
  g.fillStyle=b.c;g.fillRect(4,0,W-8,8);
  g.fillStyle='#34200f';const dx=(W>>1)-7;g.fillRect(dx,H-8,14,24);g.fillStyle='#ffd36b';g.fillRect(dx+10,H+4,2,2);
  g.fillStyle='#e0a850';for(const x of [10,W-24]){g.fillRect(x,38,14,12);g.fillStyle='#2a1a0a';g.fillRect(x+6,38,2,12);g.fillRect(x,43,14,1);g.fillStyle='#e0a850'}
  g.fillStyle='#fff';g.font='bold 9px monospace';g.textAlign='center';g.fillText(b.n,W/2,22)});
}
