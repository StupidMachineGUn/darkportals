/* ---------- v0.5.1: welcome screen ---------- */
const WEL={state:'check',msg:'',t:0,stars:[],emb:[],fog:[]};
function kickLeft(){return Math.max(0,Math.ceil(((+localStorage.getItem('dp.kick')||0)-Date.now())/1000))}
function wShow(v){for(const k of ['main','login','off'])$('#w'+k).style.display=k===v?'flex':'none';$('#authmsg').textContent=''}
function wRefresh(){const s=WEL.state,e=$('#wst'),b=$('#wbOn'),k=kickLeft();
 const T={check:['Checking server…','#a9b8d8'],on:['Server online','#9be58f'],off:['Server offline','#ff9a92'],maint:['Server unavailable'+(WEL.msg?' · '+WEL.msg:''),'#f0b040']}[s];
 e.textContent=k?'You got kicked · reconnect in '+k+'s':T[0];e.style.color=k?'#ff9a92':T[1];
 b.textContent=k?'Reconnect in '+k+'s':s==='off'?'Server unreachable · tap to retry':s==='check'?'Checking…':s==='maint'?'Admin login':'Play online';
 b.style.background=k||s==='off'?'#4a1c1c':s==='maint'?'#5a4410':'#2f7d3b';b.style.borderColor=k||s==='off'?'#b04a45':s==='maint'?'#f0b040':'#5bd06a'}
async function wProbe(){try{const r=await fetch('/api/ping',{cache:'no-store'});const j=await r.json();if(j&&j.ok){NET.up=true;NET.ver=j.version;WEL.state=j.maint?'maint':'on';WEL.msg=j.mmsg||''}else WEL.state='off'}catch(e){NET.up=false;WEL.state='off'}wRefresh()}
function welcomeInit(){
 wProbe();setInterval(()=>{if($('#title').style.display!=='none'){wRefresh();if(!(WEL.tick=(WEL.tick||0)+1)%5)wProbe()}},1000);
 const un=localStorage.getItem('emberfall.user');if(un)$('#nm').value=un;const on=localStorage.getItem('dp.offname');if(on)$('#nm2').value=on;
 $('#wbOn').addEventListener('pointerdown',()=>{if(kickLeft())return;if(WEL.state==='off'||WEL.state==='check'){WEL.state='check';wRefresh();wProbe();return}wShow('login')});
 $('#wbOff').addEventListener('pointerdown',()=>wShow('off'));
 document.querySelectorAll('.wback').forEach(b=>b.addEventListener('pointerdown',()=>wShow(b.dataset.v)));
 $('#go').addEventListener('pointerdown',()=>{netAuth().then(ok=>{if(ok){NET.on=true;start()}})});
 $('#regt').addEventListener('pointerdown',toggleReg);
 $('#woffgo').addEventListener('pointerdown',()=>{NET.on=false;try{localStorage.setItem('dp.offname',$('#nm2').value)}catch(e){}start()});
 const cv=$('#wcv'),c=cv.getContext('2d');let W=0,H=0;const D=Math.min(2,devicePixelRatio||1);
 const rs=()=>{W=innerWidth;H=innerHeight;cv.width=W*D;cv.height=H*D;c.setTransform(D,0,0,D,0,0)};rs();addEventListener('resize',rs);
 for(let i=0;i<70;i++)WEL.stars.push({x:Math.random(),y:Math.random()*.55,p:Math.random()*6,s:Math.random()*1.4+.4});
 for(let i=0;i<40;i++)WEL.emb.push({x:Math.random(),y:Math.random(),v:.02+Math.random()*.05,s:Math.random()*2+1,p:Math.random()*6});
 for(let i=0;i<4;i++)WEL.fog.push({y:.55+i*.1,o:Math.random()*6,a:.1+i*.03});
 const portal=(t,cx,cy,r)=>{for(let k=0;k<3;k++){c.save();c.translate(cx,cy);c.rotate(t*(k%2?-.5:.4)+k);c.strokeStyle=['#8a5cff','#b46aff','#5a3cc8'][k];c.globalAlpha=.55-k*.1;c.lineWidth=3-k*.6;c.beginPath();c.ellipse(0,0,r*(1-k*.12),r*(.42-k*.04)*2.2,0,0,Math.PI*1.55);c.stroke();c.restore()}
  const g=c.createRadialGradient(cx,cy,2,cx,cy,r*.9);g.addColorStop(0,'rgba(180,110,255,.35)');g.addColorStop(1,'rgba(180,110,255,0)');c.fillStyle=g;c.beginPath();c.arc(cx,cy,r*.9,0,7);c.fill()};
 const slime=(t,cx,cy,k)=>{const st=WEL.state,col={on:'110,232,106',off:'224,82,74',maint:'240,176,64',check:'130,150,190'}[st],dark={on:'#2d8a35',off:'#8a2a26',maint:'#8a6416',check:'#3c4a6a'}[st],lite={on:'#b7ffb0',off:'#ffb3ad',maint:'#ffe3a0',check:'#c8d4f0'}[st];
  const sq=Math.sin(t*3)*.06,bounce=Math.abs(Math.sin(t*1.6))*(st==='on'?14:st==='off'?3:st==='maint'?2:6)*k,w=46*k*(1+sq),h=38*k*(1-sq),y=cy-bounce;
  const gl=c.createRadialGradient(cx,y,4,cx,y,95*k);gl.addColorStop(0,'rgba('+col+',.45)');gl.addColorStop(1,'rgba('+col+',0)');c.fillStyle=gl;c.beginPath();c.arc(cx,y,95*k,0,7);c.fill();
  c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(cx,cy+h*.95,w*.8,6*k,0,0,7);c.fill();
  c.fillStyle='rgb('+col+')';c.strokeStyle=dark;c.lineWidth=2;c.beginPath();c.moveTo(cx-w,y+h*.9);c.bezierCurveTo(cx-w*1.05,y-h*.2,cx-w*.55,y-h*1.15,cx,y-h*1.15);c.bezierCurveTo(cx+w*.55,y-h*1.15,cx+w*1.05,y-h*.2,cx+w,y+h*.9);c.quadraticCurveTo(cx,y+h*1.1,cx-w,y+h*.9);c.fill();c.stroke();
  c.fillStyle=lite;c.globalAlpha=.55;c.beginPath();c.ellipse(cx-w*.45,y-h*.65,9*k,5*k,-.6,0,7);c.fill();c.globalAlpha=1;
  const ex=w*.38,ey=y-h*.2,bl=st==='maint'?.35:(Math.sin(t*.9)>.96?.15:1),lk=st==='check'?Math.sin(t*1.5)*3:(st==='on'?1:0);
  c.fillStyle='#fff';c.beginPath();c.ellipse(cx-ex,ey,7*k,8*k*bl,0,0,7);c.ellipse(cx+ex,ey,7*k,8*k*bl,0,0,7);c.fill();
  c.fillStyle='#16210f';c.beginPath();c.arc(cx-ex+lk,ey+(st==='off'?2*k:0),3.4*k*Math.max(bl,.5),0,7);c.arc(cx+ex+lk,ey+(st==='off'?2*k:0),3.4*k*Math.max(bl,.5),0,7);c.fill();
  c.strokeStyle='#16210f';c.lineWidth=2.4;c.lineCap='round';c.beginPath();
  if(st==='on')c.arc(cx,y+h*.12,w*.3,.15*Math.PI,.85*Math.PI);
  else if(st==='off'){c.arc(cx,y+h*.55,w*.26,1.15*Math.PI,1.85*Math.PI);c.stroke();c.beginPath();c.moveTo(cx-ex-7*k,ey-13*k);c.lineTo(cx-ex+6*k,ey-9*k);c.moveTo(cx+ex+7*k,ey-13*k);c.lineTo(cx+ex-6*k,ey-9*k);c.stroke();c.fillStyle='rgba(120,190,255,.85)';c.beginPath();c.ellipse(cx+ex+8*k,ey+10*k+((t*30)%22),2.2*k,3.4*k,0,0,7);c.fill();c.beginPath()}
  else{c.moveTo(cx-w*.2,y+h*.4);c.lineTo(cx+w*.2,y+h*.4)}
  c.stroke();if(st==='maint'){c.fillStyle='#ffe3a0';c.font=Math.round(13*k)+'px system-ui';c.fillText('z',cx+w*.9,y-h*1.1-((t*10)%12));c.fillText('Z',cx+w*1.1,y-h*1.3-((t*10)%12))}};
 const frame=()=>{if($('#title').style.display==='none')return;requestAnimationFrame(frame);if(document.hidden)return;const t=(WEL.t+=.016),st=WEL.state;c.clearRect(0,0,W,H);
  const bg=['#0d0a1f','#150f33','#241447','#3a1d5c'],bh=H/4;for(let i=0;i<4;i++){c.fillStyle=bg[i];c.fillRect(0,i*bh,W,bh+1)}
  for(const s of WEL.stars){c.globalAlpha=.4+.6*Math.abs(Math.sin(t*1.2+s.p));c.fillStyle='#e9dcff';c.fillRect(s.x*W,s.y*H,s.s,s.s)}c.globalAlpha=1;
  const k=Math.max(.55,Math.min(1,H/720)),pr=Math.min(W*.46,170)*(1+Math.sin(t*1.4)*.03);portal(t,W/2,H*.36,pr);
  c.fillStyle='#0a0718';c.beginPath();c.moveTo(0,H*.72);for(let x=0;x<=W;x+=20)c.lineTo(x,H*.7-Math.abs(Math.sin(x*.021+1))*40-Math.abs(Math.sin(x*.0083))*30);c.lineTo(W,H);c.lineTo(0,H);c.fill();
  c.fillStyle='#07040f';c.beginPath();c.moveTo(0,H);for(let x=0;x<=W;x+=14){const tr=Math.sin(x*.12)>.3?30:8;c.lineTo(x,H*.83-tr-Math.abs(Math.sin(x*.05))*10)}c.lineTo(W,H);c.fill();
  for(const f of WEL.fog){const g=c.createLinearGradient(0,f.y*H-20,0,f.y*H+30);g.addColorStop(0,'rgba(150,120,220,0)');g.addColorStop(.5,'rgba(150,120,220,'+f.a+')');g.addColorStop(1,'rgba(150,120,220,0)');c.fillStyle=g;c.fillRect(Math.sin(t*.25+f.o)*40-40,f.y*H-20,W+80,50)}
  for(const e of WEL.emb){e.y-=e.v*.048;e.x+=Math.sin(t+e.p)*.0006;if(e.y<-.05){e.y=1.05;e.x=Math.random()}c.globalAlpha=.35+.5*Math.abs(Math.sin(t*2+e.p));c.fillStyle=st==='off'?'#ff9d8c':st==='maint'?'#ffd48c':'#c9a0ff';c.beginPath();c.arc(e.x*W,e.y*H,e.s,0,7);c.fill()}c.globalAlpha=1;
  slime(t,W/2,H*.4+30*k,k)};
 frame()}
