import math
from lib import *
import numpy as np
SS=8
def rotx(p,a):x,y,z=p;c,s=math.cos(a),math.sin(a);return(x,y*c-z*s,y*s+z*c)
def roty(p,a):x,y,z=p;c,s=math.cos(a),math.sin(a);return(x*c+z*s,y,-x*s+z*c)
FACES=[((0,0,1),[(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]),((0,0,-1),[(1,-1,-1),(-1,-1,-1),(-1,1,-1),(1,1,-1)]),((1,0,0),[(1,-1,1),(1,-1,-1),(1,1,-1),(1,1,1)]),((-1,0,0),[(-1,-1,-1),(-1,-1,1),(-1,1,1),(-1,1,-1)]),((0,1,0),[(-1,1,1),(1,1,1),(1,1,-1),(-1,1,-1)]),((0,-1,0),[(-1,-1,-1),(1,-1,-1),(1,-1,1),(-1,-1,1)])]
def box(c,s,col,piv=None,ang=0,bevel=0):return dict(c=c,s=s,col=C(col),piv=piv,ang=ang)
WCOL=dict(sword=('#dfe6f0','#d9a640'),steel=('#eef4ff','#d9a640'),mithril=('#7ad0ff','#3aa0e0'),dagger=('#dfe6f0','#8a5a2b'))
def wbox(k,pv,a):
    R=[];g=lambda c,sz,col,ang=-.55:R.append(box(c,sz,col,pv,a+ang))
    if k in('sword','steel','mithril','dagger'):
        bl,gd=WCOL[k];n=6 if k=='dagger' else 9.6
        g((5.5,10.1,.9+n/2+.4),(.9,.8,n),bl);g((5.5,10.1,.9),(4 if k!='dagger' else 2.6,.8,.9),gd);g((5.5,10.1,-.9),(.9,.9,1.6),'#6a4a2a')
    elif k=='axe':
        g((5.5,10.1,3.2),(.8,.8,10),'#7a4a22');g((5.5,10.1,7.6),(.9,4.6,3.2),'#c0c8d6');g((5.5,10.1,8.6),(1.0,1.4,1.4),'#e6eefa')
    elif k=='bow':
        g((5.5,10.1,3),(.8,.8,9),'#8a5a2b',-.1);g((5.5,10.1,7.2),(.8,.8,3.2),'#8a5a2b',-.1);g((5.5,10.1,-1.2),(.8,.8,3.2),'#8a5a2b',-.1)
        R[-3]['s']=(.8,10.5,.8);R[-2]['c']=(5.5,10.1+4.6,3);R[-2]['s']=(.8,3.2,.8);R[-1]['c']=(5.5,10.1-4.6,3);R[-1]['s']=(.8,3.2,.8)
        g((5.5,10.1,3.4),(.3,10,.3),'#e8e0c8',-.1)
    elif k in('staff','fire','frost','venom'):
        oc=dict(staff='#c9b27a',fire='#ff7a2a',frost='#8ad8ff',venom='#7ae04a')[k]
        g((5.5,16.5,2.2),(.9,17,.9),'#7a4a22',-.15);g((5.5,25.8,2.2),(2.2,2.2,2.2),oc,-.15);g((5.5,25.8,2.2),(1.1,3.2,1.1),'#fff6d8',-.15)
    return R
def model(look,f=0,walk=0.0,swing=0.0,weapon=None,layer=None):
    sk=look.get('skin','#e8b48a');hr=look.get('hair','#6a3a1a');tn=look.get('tunic','#3a5fb0');pn=look.get('pants','#4a3a2a');bt='#3a2414';mt=look.get('metal');cape=look.get('cape')
    B=[];WB=[];sa=math.sin(walk)*0.7
    body=look.get('armor',tn)
    for sx,ph in((-1,1),(1,-1)):
        a=sa*ph
        B.append(box((sx*2.1,5.5,0),(3.6,11,3.8),pn,(sx*2.1,11,0),a));B.append(box((sx*2.1,1.1,.4),(3.8,2.2,4.8),bt,(sx*2.1,11,0),a))
    B.append(box((0,18.2,0),(8.8,5.6,4.8),body));B.append(box((0,13.6,0),(7.4,4.6,4.4),body));B.append(box((0,11.6,0),(8.8,1.2,4.9),look.get('trim','#6a4a2a')));B.append(box((0,11.7,2.45),(1.6,1,.3),'#e8c14a'))
    if mt:
        B.append(box((-4.6,20.4,0),(3.2,2.4,5.2),mt));B.append(box((4.6,20.4,0),(3.2,2.4,5.2),mt));B.append(box((0,17,2.4),(4,3,.4),mt))
    for sx,ph in((-1,-1),(1,1)):
        a=sa*ph*0.9;pv=(sx*5.5,20.2,0)
        B.append(box((sx*5.5,16,0),(2.6,8,2.8),body,pv,a));B.append(box((sx*5.5,11.6,0),(2.8,1,3),look.get('trim','#6a4a2a'),pv,a));B.append(box((sx*5.5,10.1,0),(2.4,2.4,2.4),sk,pv,a))
        if weapon and sx==1:WB+=wbox(weapon,pv,a)
    B.append(box((0,21.8,0),(2.2,1.6,2.2),sk))
    B.append(box((0,25.2,0),(7.2,5.6,6.6),sk));B.append(box((0,25.0,0),(6,6.4,5.6),sk));B.append(box((0,25.2,0),(6.2,6.2,6.9),sk))
    B.append(box((0,27.4,-.3),(7.6,2.6,7.4),hr));B.append(box((0,28.9,-.3),(6.6,1.2,6.6),hr));B.append(box((0,25.2,-2.7),(7.6,6,2.0),hr));B.append(box((-3.5,25.8,.2),(1.0,3.8,6.4),hr));B.append(box((3.5,25.8,.2),(1.0,3.8,6.4),hr));B.append(box((0,27.0,3.2),(5.2,1.0,.8),hr))
    if look.get('hairstyle')=='long':B.append(box((0,21.5,-3),(7.6,5,1.8),hr))
    for ex in(-1.9,1.9):B.append(box((ex,25.1,3.42),(1.9,2.3,.3),'#fbf6ee'));B.append(box((ex,24.9,3.55),(1.3,1.8,.3),'#1a1220'));B.append(box((ex,26.5,3.5),(2.2,.55,.3),dk(C(hr),.3)))
    B.append(box((0,23.3,3.45),(1.8,.5,.2),dk(C(sk),.45)));B.append(box((0,24.5,3.6),(.8,1.1,.5),dk(C(sk),.15)))
    for sx in(-1,1):B.append(box((sx*3.7,25,0),(.6,1.8,1.4),sk))
    if look.get('helm'):B.append(box((0,27.6,0),(8.2,3.4,7.8),mt or '#8a8a98'));B.append(box((0,26,3.6),(.9,3.4,.4),dk(C(mt or '#8a8a98'),.3)))
    if cape:B.append(box((0,15.5,-3.0),(8.2,11,.8),cape))
    if look.get('hat'):B.append(box((0,27.8,0),(11,.9,11),look['hat']));B.append(box((0,31,0),(6,5,6),look['hat']));B.append(box((0,34,0),(3,3,3),look['hat']))
    K=1.2
    for b in B:
        if b['c'][1]>=23 and not b['piv']:
            x,y,z=b['c'];b['c']=(x*K,25+(y-25)*K+1.4,z*K);b['s']=tuple(v*K for v in b['s'])
    return WB if layer=='weapon' else B+(WB if layer!='body' else [])
def render(look,yaw,f=0,walk=0.0,pitch=math.radians(26),weapon=None,W=44,H=48,light=(-.4,.7,.95),sc=1.0,layer=None):
    B=model(look,f,walk,weapon=weapon,layer=layer);faces=[]
    n=math.sqrt(sum(v*v for v in light));L=tuple(v/n for v in light)
    for b in B:
        cx,cy,cz=b['c'];sx,sy,sz=b['s']
        for nrm,corners in FACES:
            pts=[]
            for c in corners:
                p=(cx+c[0]*sx/2,cy+c[1]*sy/2,cz+c[2]*sz/2)
                if b['piv']:
                    px,py,pz=b['piv'];q=rotx((p[0]-px,p[1]-py,p[2]-pz),b['ang']);p=(q[0]+px,q[1]+py,q[2]+pz)
                p=roty(p,yaw);p=rotx(p,pitch);pts.append(p)
            nn=nrm
            if b['piv']:nn=rotx(nn,b['ang'])
            nn=roty(nn,yaw);nn=rotx(nn,pitch)
            if nn[2]<=0.001:continue
            dep=sum(p[2] for p in pts)/4
            lam=max(0,nn[0]*L[0]+nn[1]*L[1]+nn[2]*L[2]);sh=.55+.55*lam
            col=tuple(max(0,min(255,int(v*sh))) for v in b['col'][:3])+(255,)
            faces.append((dep,pts,col))
    faces.sort(key=lambda t:t[0])
    im=Image.new('RGBA',(W*SS,H*SS),(0,0,0,0));d=ImageDraw.Draw(im)
    for dep,pts,col in faces:
        d.polygon([((W/2+p[0]*sc)*SS,(H-4*sc-p[1]*sc)*SS) for p in pts],fill=col)
    small=im.resize((W,H),Image.BOX);px=small.load()
    for y in range(H):
        for x in range(W):
            r,g,b,a=px[x,y]
            if a>110:px[x,y]=((r*255//max(1,a))//8*8,(g*255//max(1,a))//8*8,(b*255//max(1,a))//8*8,255)
            else:px[x,y]=(0,0,0,0)
    return outline(small,'#1a1220')
LOOKS=dict(
 hero=dict(skin='#e8b48a',hair='#6a3a1a',tunic='#3a5fb0'),
 knight=dict(skin='#d9a67a',hair='#2a1a14',tunic='#9aa0ae',armor='#9aa0ae',metal='#c8d0dc',helm=1,cape='#a02a2a',trim='#4a4a58'),
 mage=dict(skin='#f0c9a0',hair='#d0d0d8',tunic='#5a3a9a',hat='#5a3a9a',trim='#e8c14a'),
 elf=dict(skin='#f0c9a0',hair='#e8c14a',tunic='#2a7a5a',hairstyle='long'))
if __name__=='__main__':
    from chars_v1 import human
    cw,ch=50,54
    S=Image.new('RGBA',(cw*8,ch*4),(104,150,76,255))
    for k in range(8):S.alpha_composite(render(LOOKS['hero'],math.radians(k*45),weapon='sword'),(k*cw+3,0))
    for k in range(8):S.alpha_composite(render(LOOKS['knight'],math.radians(k*45),weapon='sword'),(k*cw+3,ch))
    for k in range(8):S.alpha_composite(render(LOOKS[('mage','elf')[k%2]],math.radians(40),walk=k*math.pi/4),(k*cw+3,ch*2))
    for k,nm in enumerate(('hero','knight','mage','elf')):S.alpha_composite(render(LOOKS[nm],math.radians(30),weapon='sword' if nm!='mage' else None),(k*cw+3,ch*3))
    for k,o in enumerate([human('d',0,weapon='sword'),human('r',0,weapon='sword'),human('u',0,weapon='sword'),human('l',0,weapon='sword')]):S.alpha_composite(o,((4+k)*cw+10,ch*3+10))
    S.resize((S.width*4,S.height*4),Image.NEAREST).save('/tmp/vox.png')
    big=Image.new('RGBA',(100*8,110*2),(104,150,76,255))
    for k in range(8):big.alpha_composite(render(LOOKS['knight'],math.radians(k*45),weapon='sword',W=100,H=110,sc=2.2),(k*100,0))
    for k in range(8):big.alpha_composite(render(LOOKS['hero'],math.radians(k*45+22.5),weapon='sword',W=100,H=110,sc=2.2),(k*100,110))
    big.resize((big.width*2,big.height*2),Image.NEAREST).save('/tmp/vox_big.png')
