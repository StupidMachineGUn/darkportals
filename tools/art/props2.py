import random
from lib import *
import props as PR
P=PR.P
def shadow(im,w,cy):
    S=new(im.width,im.height);d=ImageDraw.Draw(S);cx=im.width//2
    d.ellipse([cx-w,cy-2,cx+w,cy+2],fill=(0,0,0,60));S.alpha_composite(im);return S
def finish(name,im,cat,sh=None):
    sh=None
    im=outline(im)
    if sh:im=shadow(im,sh[0],sh[1])
    P[name]=(im,cat)
def clump(g,R,cx,cy,r,c):
    # one leafy clump: dark rim, mid, highlight crescent, leaf ticks
    c=C(c);ell(g,[cx-r,cy-r+1,cx+r,cy+r],dk(c,.32));ell(g,[cx-r+1,cy-r,cx+r-1,cy+r-2],dk(c,.12));ell(g,[cx-r+1,cy-r,cx+r-2,cy+r-3],c)
    ell(g,[cx-r+2,cy-r+1,cx+r*.2,cy-r*.1],lt(c,.2))
    for _ in range(int(r*1.6)):
        x=R.randint(cx-r+2,cx+r-3);y=R.randint(cy-r+1,cy+r-3);col=lt(c,.42) if (x<cx and y<cy+1) else dk(c,.22)
        pt(g,(x,y),col);pt(g,(x+1,y+1),col) if R.random()<.5 else None
def canopy(g,R,cx,cy,rx,ry,c,n=7):
    c=C(c);pts=[(0,ry*.35),(-rx*.55,ry*.2),(rx*.55,ry*.2),(-rx*.3,-ry*.25),(rx*.3,-ry*.25),(0,-ry*.5),(-rx*.65,-ry*.05),(rx*.65,-ry*.05)][:n]
    pts.sort(key=lambda p:-p[1])
    for dx,dy in pts:clump(g,R,int(cx+dx),int(cy+dy),max(4,int(rx*.46)),c)
def trunk(g,R,cx,y0,y1,c='#6a4a2a'):
    c=C(c);rect(g,[cx-2,y0,cx+1,y1],c);rect(g,[cx-2,y0,cx-2,y1],lt(c,.22));rect(g,[cx+1,y0,cx+1,y1],dk(c,.3))
    for y in range(y0+1,y1,3):pt(g,(cx-1+(y%2),y),dk(c,.25))
    rect(g,[cx-3,y1-1,cx+2,y1],c);pt(g,(cx-4,y1),dk(c,.1));pt(g,(cx+3,y1),dk(c,.3))
    for x in (cx-4,cx+3,cx-1):pt(g,(x,y1+0),'#4a8a30');pt(g,(x,y1-1),'#6ab040')
def broadleaf(name,c,tc='#6a4a2a',rx=10,ry=9,n=7,seed=1):
    R=random.Random(seed);im=new(24,28);g=ImageDraw.Draw(im);trunk(g,R,12,17,26,tc);canopy(g,R,12,10,rx,ry,c,n);finish(name,im,'tree',(8,26))
broadleaf('oak','#4aa044',seed=1);broadleaf('oak_dark','#2f7f3e',seed=2);broadleaf('autumn','#e0802c',seed=3);broadleaf('birch','#74b850','#ece4d4',seed=4);broadleaf('swamp_tree','#58763f','#4a3a2a',seed=5);broadleaf('cherry','#f4a8c8','#6a4a3a',seed=6)
def conifer(name,c,snow=False,dead=False):
    R=random.Random(9);im=new(24,28);g=ImageDraw.Draw(im);trunk(g,R,12,21,26,'#5a3a22');c=C(c)
    tiers=[(1,5,8),(6,7,8),(11,9,8),(16,11,8)]
    for i,(y,w,h) in enumerate(tiers):
        base=c if i%2==0 else dk(c,.1)
        poly(g,[(12,y),(12+w+1,y+h),(12-w-1,y+h)],dk(base,.3));poly(g,[(12,y),(12+w,y+h-1),(12-w,y+h-1)],base)
        poly(g,[(12,y+1),(12-w*.1,y+h*.5),(12-w,y+h-1)],lt(base,.18))
        for k in range(3+i):
            x=R.randint(12-w+2,12+w-2);yy=R.randint(y+2,y+h-2);pt(g,(x,yy),dk(base,.28))
        if snow:poly(g,[(12,y),(12+w*.6,y+h*.55),(12+w*.2,y+h*.4),(12,y+h*.6),(12-w*.3,y+h*.4),(12-w*.6,y+h*.55)],'#f4f8ff')
    finish(name,im,'tree',(8,26))
conifer('pine','#2d7d4b');conifer('snow_pine','#3d7d5d',True);conifer('dead_pine','#6a6a58')
def bush(name,c,berry=None,flow=None,seed=3):
    R=random.Random(seed);im=new(24,28);g=ImageDraw.Draw(im);c=C(c)
    clump(g,R,7,20,6,c);clump(g,R,17,20,6,c);clump(g,R,12,17,7,c)
    if berry:
        for p_ in [(6,19),(11,14),(16,18),(9,22),(14,22),(19,20)]:rect(g,[p_[0],p_[1],p_[0]+1,p_[1]+1],berry);pt(g,p_,lt(C(berry),.55))
    finish(name,im,'plant',(9,26))
bush('bush','#48a044',seed=11);bush('berry_bush','#48a044','#e83a4a',seed=12);bush('snow_bush','#dfe9f4',seed=13);bush('thorn_bush','#664466','#c03a8a',seed=14)
def bloom(g,x,y,col,kind):
    col=C(col)
    if kind==0:  # daisy
        for dx,dy in((-1,0),(1,0),(0,-1),(0,1)):pt(g,(x+dx,y+dy),col)
        pt(g,(x,y),'#ffd23f')
    elif kind==1:  # tulip
        rect(g,[x-1,y-1,x+1,y],col);pt(g,(x,y-2),col);pt(g,(x,y),dk(col,.25))
    else:  # bell
        pt(g,(x,y-1),col);rect(g,[x-1,y,x+1,y],col);pt(g,(x,y+1),lt(col,.4))
def patch(name,cols,seed):
    R=random.Random(seed);im=new(24,28);g=ImageDraw.Draw(im)
    for _ in range(11):
        x=R.randint(3,20);y=R.randint(13,24);k=R.randint(0,2)
        line(g,[x,y+4,x,y+1],'#2f8a34',1);pt(g,(x-1,y+3),'#4aaa4a');pt(g,(x+1,y+2),'#4aaa4a');bloom(g,x,y,R.choice(cols),k)
    P[name]=(im,'plant')
patch('flowers',['#ff6a8a','#ffd23f','#ffffff','#a06aff','#ff9a3a'],1)
patch('flowers_red',['#e8383c','#ff6a5a','#ffb0a0'],2);patch('flowers_blue',['#4a78e8','#7aa8ff','#c8d8ff'],3);patch('flowers_purple',['#9a4ae0','#c88aff','#ffd0ff'],4);patch('flowers_orange',['#ff9a2a','#ffc84a','#ffe8a0'],5)
def reeds(g,im):
    R=random.Random(8)
    for x in range(4,21,3):
        h=R.randint(10,18);line(g,[x,26,x+R.randint(-1,1),h],'#5f8a3a',1);line(g,[x+1,26,x+1,h+3],'#7aa84a',1);rect(g,[x-1,h-2,x,h+1],'#8a5a2b');pt(g,(x-1,h-2),'#b08040')
im=new(24,28);reeds(ImageDraw.Draw(im),im);P['reeds']=(im,'plant')
def lily(name,flower):
    im=new(14,10);g=ImageDraw.Draw(im);ell(g,[1,2,12,8],'#2f7a34');ell(g,[2,2,11,6],'#4aa044');pt(g,(6,4),'#2f7a34');pt(g,(7,3),'#2f7a34');pt(g,(3,3),'#7ad06a');pt(g,(4,3),'#7ad06a')
    if flower:
        for p_ in((8,2),(9,3),(7,3),(8,4)):pt(g,p_,'#ffe8f0')
        pt(g,(8,3),'#ffd23f');pt(g,(8,1),'#ffe8f0')
    P[name]=(outline(im,(20,50,40,255)) if False else im,'decor')
lily('lily',False);lily('lily_flower',True)
# ---- rocks with facets & mossy bits ----
def rock(name,c,lava=False,moss=False):
    R=random.Random(sum(map(ord,name)));im=new(24,28);g=ImageDraw.Draw(im);c=C(c)
    poly(g,[(2,26),(4,16),(9,10),(16,9),(21,15),(22,26)],c);poly(g,[(16,9),(21,15),(22,26),(13,26),(15,17)],dk(c,.25));poly(g,[(4,16),(9,10),(16,9),(13,14),(8,17)],lt(c,.28))
    line(g,[9,17,11,23],dk(c,.3),1);line(g,[15,17,17,21],dk(c,.38),1);pt(g,(7,13),lt(c,.5));pt(g,(10,11),lt(c,.5))
    for _ in range(10):pt(g,(R.randint(4,20),R.randint(15,25)),dk(c,.2))
    if moss:
        for p_ in((5,16),(6,15),(8,12),(9,11),(7,14),(12,10),(13,10)):pt(g,p_,'#5aa040')
        for p_ in((6,16),(8,13)):pt(g,p_,'#8ad060')
    if lava:
        for p_ in [(8,20),(13,17),(16,22),(10,24)]:pt(g,p_,'#ff7a2a');pt(g,(p_[0]+1,p_[1]),'#ffd23f')
    finish(name,im,'rock',(9,26))
rock('rock','#8e8e98',moss=True);rock('rock_snow','#cdd6e2');rock('rock_sand','#cfae7e');rock('lava_rock','#3d2c2c',lava=True);rock('obsidian','#2e2842')
# ---- crystals & ore shine ----
def crystal(name,c,h=22):
    im=new(24,28);g=ImageDraw.Draw(im);c=C(c)
    for dx,hh in [(-6,h-9),(0,h),(6,h-6)]:
        x=12+dx;poly(g,[(x-3,26),(x-3,26-hh+3),(x,28-hh-3),(x+3,26-hh+3),(x+3,26)],c);poly(g,[(x,26),(x,28-hh-3),(x+3,26-hh+3),(x+3,26)],dk(c,.28));poly(g,[(x-3,26),(x-3,26-hh+3),(x-1,26-hh+1),(x-1,26)],lt(c,.35));pt(g,(x-2,26-hh+5),'#ffffff');pt(g,(x-2,26-hh+6),'#ffffff')
    finish(name,im,'rock',(9,26))
crystal('crystal_pink','#ff7ae0');crystal('crystal_blue','#6ac8ff');crystal('crystal_purple','#b06aff')
# ---- richer buildings ----
def shingles(g,x0,x1,ytop,ybot,c,R,apex=None):
    c=C(c);n=ybot-ytop
    for y in range(ytop,ybot+1):
        row=(y-ytop)//3;t=(y-ytop)/max(1,n)
        for x in range(x0,x1+1):
            col=c if ((x+(row%2)*2)//4)%2==0 else dk(c,.07)
            if (y-ytop)%3==2:col=dk(c,.22)
            if (y-ytop)%3==0 and x%4==0:col=lt(c,.1)
            g.point((x,y),fill=col)
def house2(wall,roofc,w=40,h=40,door='#6a4a2a',chim=True,sign=None,stories=1,window='#9ee0ff',timber=True,box=True,seed=0):
    R=random.Random(seed+w+h)
    def f(g,im):
        wallh=12*stories;wy=h-wallh-2;top=wy-14 if w<=40 else wy-16
        wc=C(wall)
        rect(g,[3,wy,w-4,h-2],wc)
        for y in range(wy,h-2):
            for x in range(3,w-3):
                if (x*7+y*13+seed)%11==0:g.point((x,y),fill=dk(wc,.09))
        rect(g,[3,wy,w-4,wy+1],dk(wc,.14))
        if timber:
            dkc=dk(wc,.5);rect(g,[3,wy,4,h-2],dkc);rect(g,[w-5,wy,w-4,h-2],dkc);rect(g,[3,wy,w-4,wy],dkc)
            for k in range(1,stories):rect(g,[3,h-2-12*k,w-4,h-2-12*k],dkc)
        rect(g,[3,h-3,w-4,h-2],dk(wc,.4))
        # roof
        mid=w//2
        for y in range(top,wy+3):
            t=(y-top)/max(1,wy+2-top);half=int(2+t*(mid))
            shingles(g,max(0,mid-half),min(w-1,mid+half),y,y,roofc,R)
        # redo as proper pattern
        roof=new(w,h);rg=ImageDraw.Draw(roof)
        for y in range(top,wy+3):
            t=(y-top)/max(1,wy+2-top);half=int(2+t*mid+0.5)
            xa,xb=max(0,mid-half),min(w-1,mid+half)
            for x in range(xa,xb+1):
                row=(y-top)//3;rc=C(roofc);col=rc if ((x+(row%2)*2)//4)%2==0 else dk(rc,.08)
                if (y-top)%3==2:col=dk(rc,.25)
                elif (y-top)%3==0 and (x+row)%4==0:col=lt(rc,.14)
                if x>mid+1:col=dk(col,.14)
                rg.point((x,y),fill=col)
        rg.line([(mid-2,top),(mid+2,top)],fill=lt(C(roofc),.25))
        im.alpha_composite(roof)
        rect(g,[0,wy+2,w-1,wy+3],dk(C(roofc),.4));rect(g,[1,wy+4,w-2,wy+4],(0,0,0,70))
        # door with arch + handle + step
        dx=mid-3;rect(g,[dx-1,h-11,dx+6,h-2],dk(C(door),.4));rect(g,[dx,h-10,dx+5,h-2],door);rect(g,[dx,h-10,dx,h-2],lt(C(door),.2));rect(g,[dx+3,h-10,dx+3,h-2],dk(C(door),.2));pt(g,(dx+4,h-6),'#ffd23f');rect(g,[dx-2,h-2,dx+7,h-2],'#8a8a94')
        wins=[7,w-12] if w>30 else [w-11]
        for xx in wins:
            rect(g,[xx-1,h-10,xx+5,h-4],dk(wc,.55));rect(g,[xx,h-9,xx+4,h-5],C(window));rect(g,[xx+2,h-9,xx+2,h-5],dk(wc,.5));rect(g,[xx,h-7,xx+4,h-7],dk(wc,.5));pt(g,(xx,h-9),'#ffffff')
            rect(g,[xx-2,h-9,xx-2,h-5],dk(C(roofc),.1));rect(g,[xx+6,h-9,xx+6,h-5],dk(C(roofc),.1))
            if box:
                rect(g,[xx-1,h-4,xx+5,h-3],'#6a4a2a')
                for k,cc in enumerate(('#ff6a8a','#ffd23f','#ff6a8a','#ffffff')):pt(g,(xx+k+1 if k<3 else xx+4,h-5),cc)
        if stories>1:
            for xx in [7,mid-2,w-12]:
                rect(g,[xx-1,h-22,xx+5,h-16],dk(wc,.55));rect(g,[xx,h-21,xx+4,h-17],C(window));rect(g,[xx+2,h-21,xx+2,h-17],dk(wc,.5));pt(g,(xx,h-21),'#ffffff')
        if chim:
            cx0=w-12;rect(g,[cx0,top+2,cx0+3,top+9],'#9a7a6a');rect(g,[cx0,top+2,cx0,top+9],'#b8968a');rect(g,[cx0-1,top+1,cx0+4,top+1],'#5a4a44')
            for yy in range(top+3,top+9,2):rect(g,[cx0,yy,cx0+3,yy],'#6a544c')
        if sign:rect(g,[mid-5,h-16,mid+4,h-12],'#6a4a2a');rect(g,[mid-4,h-15,mid+3,h-13],sign);pt(g,(mid-3,h-14),dk(C(sign),.3));pt(g,(mid,h-14),dk(C(sign),.3))
    return f
def hm(name,wall,roofc,w=40,h=40,**kw):
    im=new(w,h);g=ImageDraw.Draw(im);house2(wall,roofc,w,h,**kw)(g,im);P[name]=(outline(im),'building')
hm('cottage_red','#e0d0b0','#c24040',seed=1);hm('cottage_blue','#d0d8e0','#3f62c4',seed=2);hm('cottage_green','#e0d0b0','#3f9650',seed=3)
hm('cottage_thatch','#cfb78e','#d4aa58',seed=4);hm('house_big','#e0d0b0','#93403f',48,52,stories=2,seed=5)
hm('shop','#e0d0b0','#3a9696',sign='#ffd23f',seed=6);hm('inn','#cdb084','#84502f',48,52,stories=2,sign='#ece4cc',seed=7)
hm('bank','#cfcfd8','#60606f',48,44,door='#3a3a4a',chim=False,sign='#ffd23f',timber=False,seed=8);hm('smithy','#a09080','#50505e',sign='#b0bacb',seed=9)
hm('adobe','#dcb67e','#c1904f',40,36,chim=False,door='#5a3a22',timber=False,box=False,seed=10)
# herbalist-style hut: mossy flowered roof over a log cabin (original drawing)
def herb(g,im):
    R=random.Random(33);w,h=40,40
    # log walls
    for y in range(22,h-2):
        rect(g,[3,y,w-4,y],'#8a5a30' if (y//3)%2==0 else '#7a4a26')
        for x in range(4,w-4,6):pt(g,(x+(y//3)%2*3,y),'#a87040')
    rect(g,[3,22,4,h-2],'#5a3a1e');rect(g,[w-5,22,w-4,h-2],'#5a3a1e')
    for y in range(22,h-2,3):ell(g,[1,y,5,y+2],'#a87040');ell(g,[w-6,y,w-2,y+2],'#8a5a30')
    # round mossy roof
    ell(g,[0,3,w-1,28],'#2f7a34')
    for cx,cy,r in[(8,12,8),(32,12,8),(20,8,10),(12,20,7),(28,20,7),(20,17,9)]:clump(g,R,cx,cy,r,'#4aa044')
    for _ in range(26):
        x=R.randint(4,w-5);y=R.randint(5,24);col=R.choice(['#ffd24a','#ffe08a','#ff9ac0','#ffffff'])
        pt(g,(x,y),col);pt(g,(x-1,y),lt(C(col),.1)) if R.random()<.4 else None
    rect(g,[3,25,w-4,26],(0,0,0,90))
    # door and windows
    rect(g,[17,25,22,h-2],'#4a2a14');rect(g,[18,26,21,h-2],'#6a4020');pt(g,(21,33),'#ffd23f');rect(g,[16,h-2,23,h-2],'#8a8a94')
    for xx in (7,29):rect(g,[xx,28,xx+4,33],'#3a2a4a');rect(g,[xx+1,29,xx+3,32],'#b8a0ff');rect(g,[xx+2,29,xx+2,32],'#3a2a4a');pt(g,(xx+1,29),'#ffffff')
    # flowers at the base
    for x,c in[(3,'#ff6a8a'),(8,'#ffd23f'),(31,'#a06aff'),(36,'#ff9a3a'),(13,'#ffffff'),(26,'#ff6a8a')]:
        pt(g,(x,h-3),'#2f8a34');pt(g,(x,h-4),c);pt(g,(x-1,h-4),lt(C(c),.2)) if x%2 else None
im=new(40,40);herb(ImageDraw.Draw(im),im);P['stilt_hut']=(outline(im),'building')
def tower2(wall,cap):
    def f(g,im):
        R=random.Random(5);wc=C(wall)
        rect(g,[8,14,27,46],wc)
        for y in range(14,46,5):
            rect(g,[8,y,27,y],dk(wc,.18))
            for x in range(9+(y//5%2)*3,27,6):rect(g,[x,y+1,x,y+4],dk(wc,.12))
        rect(g,[8,14,10,46],lt(wc,.18));rect(g,[25,14,27,46],dk(wc,.24))
        poly(g,[(4,17),(18,-1),(32,17)],cap);poly(g,[(18,-1),(32,17),(18,17)],dk(C(cap),.22));poly(g,[(18,-1),(11,9),(8,17),(4,17)],lt(C(cap),.14))
        rect(g,[4,16,31,18],dk(C(cap),.35));pt(g,(18,3),'#ffd23f');pt(g,(17,5),'#ffd23f');pt(g,(19,6),'#ffd23f')
        rect(g,[15,36,21,46],'#2a1a10');rect(g,[16,37,20,46],'#5a3a22');pt(g,(19,41),'#ffd23f');rect(g,[14,46,22,46],'#8a8a94')
        rect(g,[14,21,21,29],dk(wc,.5));rect(g,[15,22,20,28],'#1a1a2e');rect(g,[16,23,19,27],'#ffd24a');rect(g,[17,23,17,27],'#c89a20');pt(g,(16,23),'#fff2b0')
        for xx in (11,23):pt(g,(xx,33),'#8ad8ff');pt(g,(xx,34),'#4a98c8')
    return f
for n,w,c in [('wizard_tower','#8f8fa8','#6040a8'),('obsidian_tower','#3f3650','#c43434'),('ice_tower','#bddcf4','#6ab4e8')]:
    im=new(36,48);tower2(w,c)(ImageDraw.Draw(im),im);P[n]=(outline(im),'building')
