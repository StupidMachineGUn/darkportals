/* ---------- v0.5.3: Art Pack (original pixel art; offline/single-player preview) ---------- */
const ART={ready:false,pref:true,sh:{},tiles:{},fc:new Map(),wc:new Map(),icons:{},nm:{}};
const ART_ONLINE=false; /* set true to also use the Art Pack in online play */
try{ART.pref=localStorage.getItem('dp.art')!=='0'}catch(e){}
const artOn=()=>ART.ready&&ART.pref&&(typeof NET==='undefined'||!NET.on||ART_ONLINE);
function artLoad(){if(typeof ARTD==='undefined')return;let n=0;const keys=Object.keys(ARTD);
 for(const k of keys){const im=new Image();im.onload=()=>{ART.sh[k]=im;ARTD[k].names.forEach((nm,i)=>ART.nm[k+'|'+nm]=i);if(++n===keys.length)artInit()};im.src=ARTD[k].src}}
function artInit(){
 try{const T0=ARTD.tiles,im=ART.sh.tiles;for(let i=0;i<T0.names.length;i++){const [b,v]=T0.names[i].split(':');(ART.tiles[b]=ART.tiles[b]||[])[+v]=mk(16,16,c=>c.drawImage(im,(i%T0.cols)*16,((i/T0.cols)|0)*16,16,16,0,0,16,16))}
  const I0=ARTD.items,ii=ART.sh.items;for(let i=0;i<I0.names.length;i++)ART.icons[I0.names[i]]=mk(18,18,c=>c.drawImage(ii,(i%I0.cols)*18,((i/I0.cols)|0)*18,18,18,0,0,18,18));
  ART.ready=true;artItems();artBiomeInit();try{resize()}catch(e){}}catch(e){console.warn('art init',e)}}
/* ---- biomes (cosmetic ground / props / mob variants by region) ---- */
let ARTB=null;
function artBiomeInit(){ARTB=new Int8Array(MW*MH).fill(-1)}
const BIO=['core','snow','tundra','ash','desert','canyon','jungle','swamp'];
function biomeAt(x,y){const k=y*MW+x;if(!ARTB)return 0;let b=ARTB[k];if(b>=0)return b;
 const dx=x-CX,dy=y-CY,d=Math.hypot(dx,dy);b=0;
 if(d>58){const a=Math.atan2(dy,dx)+(vn(x*.045,y*.045)-.5)*1.1,s=(((a/Math.PI+1)*4)%8+8)%8; /* 0=W,2=N,4=E,6=S */
  b=[2,1,1,3,5,4,6,7][Math.floor(s)%8];if(d<68&&vn(x*.2,y*.2)<.5)b=0}
 return ARTB[k]=b}
const TLN={0:'deep_water',1:'shallow_water'};
function artTile(t,x,y,fr){const b=biomeAt(x,y),B=BIO[b];let n;
 if(t<=1){n=B==='snow'||B==='tundra'?'ice_water':B==='swamp'?'swamp_water':B==='ash'?(t===0?'lava':'tar'):TLN[t];return ART.tiles[n][(fr+((x+y)>>1))&3]}
 const h=hash(x,y,3),v=h<.72?0:1+((h*37)|0)%3;
 if(t===TL.GRASS)n={core:'meadow',snow:'snow',tundra:'tundra',ash:'ashland',desert:'desert',canyon:'canyon',jungle:'jungle',swamp:'swamp'}[B];
 else if(t===TL.FOREST)n={core:'forest',snow:'snow',tundra:'tundra',ash:'obsidian',desert:'desert',canyon:'canyon',jungle:'jungle',swamp:'swamp'}[B];
 else if(t===TL.SAND)n={snow:'snow',tundra:'tundra',ash:'ashland',desert:'desert',canyon:'canyon'}[B]||'beach';
 else if(t===TL.STONE)n={snow:'icecave',tundra:'icecave',ash:'obsidian',desert:'canyon',canyon:'canyon'}[B]||'mountain';
 else n={5:'dirt',6:'plaza',8:'dungeon',9:'castle'}[t]||'meadow';
 return ART.tiles[n][v]}
/* ---- frames cache ---- */
function artFrame(k,col,row,w,h){const key=k+col+'_'+row,c=ART.fc.get(key);if(c)return c;const f=mk(w,h,g=>g.drawImage(ART.sh[k],col*w,row*h,w,h,0,0,w,h));ART.fc.set(key,f);return f}
function artWhite(f){let w=ART.wc.get(f);if(!w){w=mk(f.width,f.height,g=>{g.drawImage(f,0,0);g.globalCompositeOperation='source-in';g.fillStyle='#fff';g.fillRect(0,0,f.width,f.height)});ART.wc.set(f,w)}return w}
const ADIR=[0,3,2,1]; /* game dir 0 down,1 left,2 right,3 up -> art dir order d,u,r,l */
/* ---- characters ---- */
const A_TIER=['cloth','bronze','iron','steel','dragon','mithril','mithril','dragon','dragon'];
function artWeap(w){if(!w)return'none';w=String(w);if(w.startsWith('dagger'))return'dagger';if(w.startsWith('axe'))return'axe';if(w.startsWith('bow'))return'bow';
 const n=+w.replace(/\D/g,'')||0;if(w.startsWith('staff'))return['staff','staff','fire','frost','frost','venom','venom'][Math.min(n,6)];
 return['dagger','sword','sword','steel','mithril'][Math.min(n,4)]||'sword'}
const NPCC=['#c0392b','#3a5fb0','#3f8a3f','#7a3ab0','#d9822b','#d8c040','#7a5a3a','#7a7a86','#2a9a9a','#d870a8','#e8e4dc','#2a2a32','#6a1a2a','#1a2a5a','#6a6a2a','#c8a878'],NPCRGB=NPCC.map(h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16))),_nc={};
function artNpcCol(col){if(_nc[col])return _nc[col];let c=col||'#888888';if(c.length===4)c='#'+c[1]+c[1]+c[2]+c[2]+c[3]+c[3];if(!/^#[0-9a-f]{6}$/i.test(c))c='#888888';const r=[1,3,5].map(i=>parseInt(c.substr(i,2),16));let b=0,bd=1e9;NPCRGB.forEach((p,i)=>{const d=(p[0]-r[0])**2+(p[1]-r[1])**2+(p[2]-r[2])**2;if(d<bd){bd=d;b=i}});return _nc[col]=NPCC[b]}
const WICON={dagger:'dagger',sword:'sword',steel:'steel_sword',mithril:'mithril_sword',axe:'axe',staff:'staff',fire:'fire_staff',frost:'frost_staff',venom:'venom_staff',bow:'bow'};
function artChar(px,py,dir,ph,shirt,o){
 const sp=o.sp==null?-1:o.sp;let ox=0,oy=0;if(sp>=0){const l=Math.sin(sp*Math.PI)*2.5;ox=DIR[dir][0]*l;oy=DIR[dir][1]*l*.7}
 let name,wn='none';if(o.arm!==undefined){wn=artWeap(o.wid);name='A:'+A_TIER[Math.min(8,o.arm|0)]+':'+(sp>=0?'none':wn)}
 else{const w=o.wid?(String(o.wid).startsWith('axe')?'axe':'dagger'):'none';wn=w;name='N:'+artNpcCol(shirt)+':'+(sp>=0?'none':w)}
 const row=ART.nm['chars|'+name];if(row===undefined)return false;
 const moving=o.moving,fi=moving?[1,0,2,0][((ph*.9)|0)&3]:0,col=ADIR[dir]*4+fi,[cw,ch]=ARTD.chars.cell;
 let f=artFrame('chars',col,row,cw,ch);if(o.flash||shirt==='#fff')f=artWhite(f);
 g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(px+8+ox,py+15,6,2.2,0,0,6.283);g.fill();
 const swing=sp>=0&&wn!=='none'&&ART.icons[WICON[wn]];
 const fa=[Math.PI/2,Math.PI,0,-Math.PI/2][dir],sg=dir===1?-1:1,a=fa-sg*1.3+sg*sp*2.6;
 const blade=()=>{const ic=ART.icons[WICON[wn]],hx=[px+12,px+3,px+10,px+4][dir]+ox,hy=py+9+oy,k=wn==='bow'?1:1.2;
  g.save();g.translate(hx,hy);
  /* slash smear: fading arcs trailing behind the blade */
  const tr=sp<.08?0:Math.min(1,sp*1.4);g.lineCap='round';
  for(let i=0;i<4;i++){const r=7+i*2.4,back=a-sg*(.9+i*.12)*tr;g.strokeStyle=`rgba(255,255,255,${(.5-i*.1)*(1-sp*.5)*tr})`;g.lineWidth=2.4-i*.45;g.beginPath();g.arc(0,0,r,sg>0?back:a,sg>0?a:back);g.stroke()}
  g.rotate(a+Math.PI/4);g.scale(k,k);g.drawImage(ic,-4,-12);g.restore()};
 if(swing&&dir===3)blade();
 g.drawImage(f,Math.round(px+8-cw/2+ox),Math.round(py+16-ch+oy));
 if(swing&&dir!==3)blade();
 else if(sp>=0&&!swing){g.strokeStyle=`rgba(255,255,255,${.75*(1-sp)+.15})`;g.lineWidth=2;g.beginPath();g.arc(px+8,py+8,12,fa-sg*1.3,a,sg<0);g.stroke()}
 return true}
/* ---- enemies ---- */
const MOBV={slime:{snow:'ice_slime',ash:'fire_slime',swamp:'toxic_slime',desert:'gold_slime'},wolf:{snow:'snow_wolf',tundra:'snow_wolf',ash:'lava_hound',canyon:'hyena',desert:'hyena'},skeleton:{ash:'skeleton_knight',swamp:'zombie'},
 orc:{snow:'yeti',ash:'orc_warlord',canyon:'orc_warlord'},ogre:{snow:'frost_giant',ash:'fire_giant',desert:'lizardman',swamp:'lizardman',jungle:'lizardman'},bat:{snow:'ice_bat',tundra:'ice_bat',ash:'fire_bat',desert:'vulture'},
 spider:{snow:'frost_spider',desert:'scorpion',ash:'fire_ant',jungle:'beetle',swamp:'centipede'},golem:{snow:'ice_golem',ash:'lava_golem',desert:'sand_golem',canyon:'sand_golem'},goblin:{swamp:'goblin_shaman',jungle:'goblin_shaman'},
 bandit:{desert:'assassin',canyon:'assassin',ash:'cultist'},wraith:{snow:'ghost',swamp:'wisp'},demon:{ash:'imp'},troll:{swamp:'treant',jungle:'treant'}};
const MOBFLY={bat:1,wraith:1,ice_bat:1,fire_bat:1,ghost:1,wisp:1,vulture:1};
function artEnemy(e,px,py,f,t){
 let n=e.t==='wyrm'?'dragon':e.t;const row0=ART.nm['mobs|'+n];if(row0===undefined&&n!=='dragon')return false;
 const bx=Math.floor(e.x),by=Math.floor(e.y);if(MOBV[n]){const v=MOBV[n][BIO[biomeAt(bx,by)]];if(v)n=v}
 const row=ART.nm['mobs|'+n];if(row===undefined)return false;
 const big=e.t==='wyrm'||e.big,k=e.t==='wyrm'?1.5:1,moving=e.mv||e.st===1||MOBFLY[n]||e.t==='wizard',fi=moving?((t*.7)|0)&1:0,[cw,ch]=ARTD.mobs.cell;
 let fr=artFrame('mobs',ADIR[e.dir|0]*2+fi,row,cw,ch);if(f)fr=artWhite(fr);
 let cx=Math.round(e.x*T),cy=Math.round(e.y*T+2),fl=MOBFLY[n]?-Math.round(2+Math.sin(t)*2):0;
 const sw=e.sw>0?1-e.sw/.25:-1,dv=DIR[e.dir|0]||[0,1],sz=Math.max(1,ch/28);let sx=1,sy=1;
 if(sw>=0){const lg=sw<.3?-(sw/.3)*1.5:Math.sin(((sw-.3)/.7)*Math.PI)*5*Math.min(2,sz);cx+=Math.round(dv[0]*lg);cy+=Math.round(dv[1]*lg*.7);
  if(/slime|jelly/.test(n)){sy=sw<.3?1.12:.82;sx=sw<.3?.9:1.14}else if(MOBFLY[n])fl-=Math.round(Math.sin(sw*Math.PI)*3)}
 g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(cx,cy,6*k+(n==='golem'?4:0),2.4*k,0,0,6.283);g.fill();
 const dw=Math.round(cw*k*sx),dh=Math.round(ch*k*sy);g.drawImage(fr,Math.round(cx-dw/2),cy-dh+fl,dw,dh);
 if(sw>=0&&sw>.25&&sw<.95){const fa=[Math.PI/2,Math.PI,0,-Math.PI/2][e.dir|0],sg=(e.dir|0)===1?-1:1,r=5+sz*4,a=fa-sg*1.1+sg*((sw-.25)/.7)*2.2,hx=cx+dv[0]*3*sz,hy=cy-ch*.4*k+dv[1]*4;
  g.save();g.lineCap='round';for(let i=0;i<3;i++){g.strokeStyle=`rgba(255,255,255,${(.95-i*.25)*(1-sw*.5)})`;g.lineWidth=2.2-i*.5;g.beginPath();g.arc(hx,hy,r-i*2,a-sg*.8,a);g.stroke()}g.restore()}
 return true}
/* ---- props / buildings ---- */
function artProp(name){const i=ART.nm['props|'+name];if(i===undefined)return null;return artFrame('props',i%8,(i/8)|0,68,56)}
function artObj(o,px,py){const B=BIO[biomeAt(o.x,o.y)];let n;
 if(o.t==='tree'){if(o.dead)n='stump';else n={core:'oak',snow:'snow_pine',tundra:'snow_pine',ash:'dead_tree',desert:'palm',canyon:'dead_tree',jungle:'palm',swamp:'swamp_tree'}[B];if(B==='core'&&hash(o.x,o.y,11)<.3)n=hash(o.x,o.y,12)<.5?'pine':'oak_dark'}
 else if(o.t==='rock'){n=o.dead?'rock':B==='snow'||B==='tundra'?'rock_snow':B==='ash'?'lava_rock':B==='desert'||B==='canyon'?'rock_sand':'rock'}
 else if(o.t==='bush')n=o.dead?'bush':{snow:'snow_bush',tundra:'snow_bush',swamp:'thorn_bush',desert:'bush',ash:'thorn_bush'}[B]||'berry_bush';
 else if(o.t==='shroom')n='giant_mushroom';else if(o.t==='anvil')n='anvil';else return false;
 const f=artProp(n);if(!f)return false;
 if(o.t==='rock'&&!o.dead){const ore=o.ore==='iron'?'#a8d8ff':'#e8a060';g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(px+8,py+14,9,3,0,0,6.283);g.fill();g.drawImage(f,px+8-34,py+16-56+1);g.fillStyle=ore;for(const [a,b] of [[2,-8],[6,-5],[-3,-4],[-6,-9]])g.fillRect(px+8+a,py+b+8,2,2);return true}
 if(o.t==='shroom'){g.drawImage(f,px+8-34,py+16-56+2);return true}
 g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(px+8,py+14,8,2.6,0,0,6.283);g.fill();g.drawImage(f,px+8-34,py+16-56+1);return true}
const BLBL={Shop:'Shop',Forge:'Blacksmith',Inn:'Inn','Elder Hall':'Elder Hall',Bank:'Bank','Trade House':'Trade House','Mage Tower':'Mage Tower',"Witch's Hut":"Witch's Hut"},BH={shop:28,smithy:28,inn:40,house_big:40,bank:28,wizard_tower:50,stilt_hut:38};
const ABLD={Shop:['shop',2],Forge:['smithy',2],Inn:['inn',2],'Elder Hall':['house_big',2],Bank:['bank',2],'Trade House':['shop',2],'Mage Tower':['wizard_tower',1],Smithy:['smithy',1],"Witch's Hut":['stilt_hut',1]};
function artBuilding(b){let [n,k]=ABLD[b.n]||['cottage_'+['red','blue','green','thatch'][(b.id|0)%4],1];const f=artProp(n);if(!f)return false;
 const B=BIO[biomeAt(b.x,b.y)];let ff=f;if(b.n==='Cottage'&&B==='snow')ff=artProp('igloo')||f;if(b.n==='Cottage'&&B==='desert')ff=artProp('adobe')||f;
 const bw=b.w*T,bot=(b.y+b.h)*T+2;g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(b.x*T+bw/2,bot-3,bw*.42,5,0,0,6.283);g.fill();
 const w=68*k,h=56*k;g.drawImage(ff,Math.round(b.x*T+bw/2-w/2),Math.round(bot-h),w,h);
 const lb=BLBL[b.n];if(lb){const top=bot-(BH[n]||44)*k-1;g.save();g.font='bold 7px sans-serif';g.textAlign='center';g.textBaseline='middle';const tw=Math.ceil(g.measureText(lb).width)+8,cx=Math.round(b.x*T+bw/2),ly=Math.round(top-5);
  g.fillStyle='rgba(24,14,34,.9)';g.fillRect(cx-tw/2,ly-5,tw,10);g.strokeStyle='#ffd36b';g.lineWidth=1;g.strokeRect(cx-tw/2+.5,ly-4.5,tw-1,9);g.fillStyle='#ffd36b';g.fillText(lb,cx,ly+.5);g.restore()}
 return true}
/* ---- item icons ---- */
const AICON={log:'oak_log',copper:'copper_ore',iron:'iron_ore',gem:'ruby',shrimp:'raw_fish',trout:'raw_fish',salmon:'raw_fish',cshrimp:'cooked_fish',ctrout:'cooked_fish',csalmon:'cooked_fish',berry:'berries',bread:'bread',potion:'mana_potion',tusk:'fang',essence:'gem_shard',hpotion:'hp_potion',pelt:'leather',bone:'bone',scale:'scale',
 sword0:'dagger',sword1:'sword',sword2:'steel_sword',sword3:'mithril_sword',sword4:'dragon_sword',staff:'staff',staff2:'fire_staff',staff3:'lightning_staff',arm0:'cloth_chest',arm1:'bronze_chest',arm2:'iron_chest',arm3:'steel_chest',arm4:'mithril_chest',scalearm:'dragon_chest',
 wool:'wool',mutton:'raw_meat',cmutton:'cooked_meat',egg:'egg',fegg:'egg',drum:'raw_meat',cdrum:'cooked_meat',feather:'feather',rfeather:'feather',gegg:'coin',shroom:'mushroom'};
const _ic={};
function icoURL(id){const n=AICON[id],c=n&&ART.icons[n];if(!c)return null;return _ic[id]||(_ic[id]=c.toDataURL())}
function artItems(){for(const k in ITEMS){const it=ITEMS[k];if('e0' in it)continue;it.e0=it.e;Object.defineProperty(it,'e',{get(){if(!artOn())return this.e0;const u=icoURL(k);return u?`<img class="ico" src="${u}">`:this.e0},configurable:true})}
 const st=document.createElement('style');st.textContent='.ico{width:22px;height:22px;image-rendering:pixelated;vertical-align:middle}.slot .ico,.slo .ico{width:26px;height:26px}';document.head.appendChild(st)}
function artToggle(v){ART.pref=v;try{localStorage.setItem('dp.art',v?'1':'0')}catch(e){}}
if(typeof ARTD!=='undefined')artLoad();
