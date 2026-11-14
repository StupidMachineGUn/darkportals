from lib import *
R=random.Random(7)
P={}
def mk(name,w,h,fn,cat,out=True):
    im=new(w,h);g=ImageDraw.Draw(im);fn(g,im);P[name]=(outline(im) if out else im,cat)
def blob_canopy(g,cx,cy,rx,ry,c,n=40):
    c=C(c);ell(g,[cx-rx,cy-ry,cx+rx,cy+ry],dk(c,.28))
    lumps=[(-rx*.45,ry*.15,rx*.62,ry*.7),(rx*.45,ry*.15,rx*.62,ry*.7),(0,-ry*.25,rx*.75,ry*.75),(-rx*.2,ry*.45,rx*.55,ry*.5),(rx*.25,ry*.45,rx*.55,ry*.5)]
    for dx,dy,w,h in lumps:ell(g,[int(cx+dx-w),int(cy+dy-h),int(cx+dx+w-1),int(cy+dy+h-2)],dk(c,.1))
    for dx,dy,w,h in lumps:ell(g,[int(cx+dx-w+1),int(cy+dy-h),int(cx+dx+w-3),int(cy+dy+h-4)],c)
    for dx,dy,w,h in lumps[:3]:ell(g,[int(cx+dx-w*.6),int(cy+dy-h*.9),int(cx+dx+w*.1),int(cy+dy-h*.2)],lt(c,.22))
    for _ in range(n):
        x=R.randint(cx-rx+2,cx+rx-3);y=R.randint(cy-ry+1,cy+ry-3);pt(g,(x,y),lt(c,.38) if R.random()<.45 else dk(c,.2))
def trunk(g,cx,y0,y1,c='#6a4a2a',w=2):
    rect(g,[cx-w,y0,cx+w-1,y1],c);rect(g,[cx-w,y0,cx-w,y1],lt(C(c),.2));rect(g,[cx+w-1,y0,cx+w-1,y1],dk(C(c),.25))
def tree(name,c,tc='#6a4a2a',rx=9,ry=8):
    mk(name,24,28,lambda g,im:(trunk(g,12,16,26,tc),blob_canopy(g,12,10,rx,ry,c)),'tree')
tree('oak','#3f9a3f');tree('oak_dark','#2a7a3a');tree('autumn','#d8742a');tree('birch','#6ab04a','#e8e0d0');tree('swamp_tree','#4a6a3a','#4a3a2a');tree('cherry','#f0a0c0','#6a4a3a')
def pine(c,snow=False):
    def f(g,im):
        trunk(g,12,20,27,'#5a3a22')
        for i,(y,w) in enumerate([(2,4),(7,6),(12,8),(17,10)]):
            poly(g,[(12,y),(12+w,y+7),(12-w,y+7)],c if i%2==0 else dk(C(c),.12))
            if snow:poly(g,[(12,y),(12+w*.7,y+4),(12-w*.7,y+4)],'#f0f6ff')
    return f
mk('pine',24,28,pine('#2a7a4a'),'tree');mk('snow_pine',24,28,pine('#3a7a5a',True),'tree');mk('dead_pine',24,28,pine('#5a5a4a'),'tree')
def palm(g,im):
    for i in range(14):pt(g,(12+int(i*.12),26-i),'#a07a4a');pt(g,(13+int(i*.12),26-i),'#8a6a3a')
    for a in [(-8,-3),(-6,-7),(0,-9),(6,-7),(8,-3),(-4,2),(5,2)]:
        line(g,[13,12,13+a[0],12+a[1]],'#3aa04a',2);pt(g,(13+a[0],12+a[1]),'#7ad06a')
    ell(g,[12,12,14,14],'#6a4a2a')
mk('palm',24,28,palm,'tree')
def cactus(g,im):
    rect(g,[10,6,13,26],'#4aa05a');rect(g,[10,6,10,26],'#6ac07a');rect(g,[4,12,6,18],'#4aa05a');rect(g,[4,18,10,19],'#4aa05a');rect(g,[17,9,19,15],'#4aa05a');rect(g,[13,15,19,16],'#4aa05a')
    for y in range(8,25,4):pt(g,(11,y),'#d8e8c0')
mk('cactus',24,28,cactus,'plant')
def deadtree(g,im):
    trunk(g,12,10,27,'#4a3a2a',2)
    for a in [(-7,-6,16),(7,-8,13),(-5,-9,10),(6,-4,19)]:line(g,[12,a[2],12+a[0],a[2]+a[1]],'#4a3a2a',1)
mk('dead_tree',24,28,deadtree,'tree')
def shroom(g,im):
    rect(g,[10,16,14,27],'#f0e6c8');ell(g,[2,4,22,20],'#8a3ac8');ell(g,[3,5,20,13],'#a85ae0')
    for p in [(7,9),(14,7),(17,13),(10,14)]:ell(g,[p[0],p[1],p[0]+2,p[1]+2],'#f0e6ff')
mk('giant_mushroom',24,28,shroom,'plant')
def crystal(c,h=22):
    def f(g,im):
        for dx,hh in [(-5,h-8),(0,h),(5,h-6)]:
            x=12+dx;poly(g,[(x-3,26),(x-2,26-hh),(x,28-hh-3),(x+2,26-hh),(x+3,26)],c);poly(g,[(x,26),(x,28-hh-3),(x+3,26)],dk(C(c),.25));pt(g,(x-1,26-hh+2),'#ffffff')
    return f
mk('crystal_pink',24,28,crystal('#ff7ae0'),'rock');mk('crystal_blue',24,28,crystal('#6ac8ff'),'rock');mk('crystal_purple',24,28,crystal('#b06aff'),'rock')
def spike(g,im):
    for dx,hh in [(-6,12),(0,22),(6,15)]:
        x=12+dx;poly(g,[(x-3,26),(x,26-hh),(x+3,26)],'#b8e4ff');poly(g,[(x,26),(x,26-hh),(x+3,26)],'#7ab8e0')
mk('ice_spike',24,28,spike,'rock')
def rock(c,lava=False):
    def f(g,im):
        poly(g,[(3,26),(5,15),(11,10),(18,13),(21,26)],c);poly(g,[(11,10),(18,13),(21,26),(14,26)],dk(C(c),.22));poly(g,[(5,15),(11,10),(10,15)],lt(C(c),.25))
        if lava:
            for p in [(8,20),(13,17),(16,22),(10,24)]:pt(g,p,'#ff7a2a');pt(g,(p[0]+1,p[1]),'#ffd23f')
    return f
mk('rock','24 28'.split()[0] and 24,28,rock('#8a8a94'),'rock');mk('rock_snow',24,28,rock('#c8d0dc'),'rock');mk('rock_sand',24,28,rock('#c8a878'),'rock');mk('lava_rock',24,28,rock('#3a2a2a',True),'rock');mk('obsidian',24,28,rock('#2a2438'),'rock')
def bush(c,berry=None):
    def f(g,im):
        c2=C(c);ell(g,[2,13,22,26],dk(c2,.3))
        for x0,y0,x1,y1 in[(2,14,12,25),(11,14,21,25),(6,10,17,22)]:ell(g,[x0,y0,x1,y1],dk(c2,.08));ell(g,[x0+1,y0,x1-2,y1-3],c2)
        ell(g,[6,11,12,16],lt(c2,.22))
        for _ in range(14):pt(g,(R.randint(4,19),R.randint(13,23)),lt(c2,.35) if R.random()<.5 else dk(c2,.2))
        if berry:
            for p_ in [(6,17),(11,13),(16,18),(9,21),(14,22)]:rect(g,[p_[0],p_[1],p_[0]+1,p_[1]+1],berry);pt(g,p_,lt(C(berry),.5))
    return f
mk('bush',24,28,bush('#3f9a3f'),'plant');mk('berry_bush',24,28,bush('#3f9a3f','#e83a4a'),'plant');mk('snow_bush',24,28,bush('#d8e4f0'),'plant');mk('thorn_bush',24,28,bush('#5a3a5a','#c03a8a'),'plant')
def bones(g,im):
    ell(g,[4,16,14,24],'#f0e6c8');rect(g,[6,20,8,23],'#1a1a24');rect(g,[10,20,12,23],'#1a1a24');line(g,[14,22,22,16],'#f0e6c8',2);line(g,[14,25,22,25],'#f0e6c8',2);line(g,[16,18,20,24],'#d8cfb0',1)
mk('skull_bones',24,28,bones,'decor')
def tomb(c):
    def f(g,im):
        rect(g,[6,10,17,26],c);ell(g,[6,6,17,14],c);rect(g,[11,12,12,20],dk(C(c),.3));rect(g,[8,15,15,16],dk(C(c),.3));rect(g,[5,25,18,27],dk(C(c),.2))
    return f
mk('tombstone',24,28,tomb('#9a9aa6'),'decor');mk('tombstone_mossy',24,28,tomb('#7a9a7a'),'decor')
def stump(g,im):ell(g,[5,18,19,27],'#6a4a2a');ell(g,[5,16,19,24],'#d0a060');ell(g,[8,18,16,22],'#a07a3a')
mk('stump',24,28,stump,'decor')
def flowerpatch(cols):
    def f(g,im):
        for _ in range(9):
            x=R.randint(3,20);y=R.randint(14,25);line(g,[x,y+3,x,y+1],'#3a9a3a',1);pt(g,(x-1,y+2),'#4aaa4a');col=R.choice(cols);rect(g,[x-1,y,x+1,y],col);pt(g,(x,y-1),col);pt(g,(x,y),'#ffd23f')
    return f
mk('flowers',24,28,flowerpatch(['#ff6a8a','#ffd23f','#ffffff','#a06aff']),'plant',False)
mk('reeds',24,28,lambda g,im:[(line(g,[x,26,x+R.randint(-1,1),R.randint(10,18)],'#6a8a3a',1),pt(g,(x,12),'#8a5a2b')) for x in range(5,20,3)],'plant',False)
# ---- buildings ----
def roof(g,x0,x1,y0,y1,c,tile=3):
    for y in range(y0,y1):
        t=(y-y0)/(y1-y0);xa=int(x0+(x1-x0)*0*t);rect(g,[x0-(y-y0)//2*0,y,x1,y],c if ((y-y0)//tile)%2==0 else dk(C(c),.14))
def house(wall,roofc,w=40,h=40,door='#6a4a2a',chim=True,sign=None,stories=1,window='#8ad8ff'):
    def f(g,im):
        top=h-12-12*stories;rect(g,[3,h-12*stories-2,w-4,h-2],wall)
        for y in range(h-12*stories-2,h-2,4):rect(g,[3,y,w-4,y],dk(C(wall),.1))
        rect(g,[3,h-3,w-4,h-2],dk(C(wall),.3))
        poly(g,[(0,h-12*stories),(w//2,top-2),(w-1,h-12*stories)],roofc)
        poly(g,[(w//2,top-2),(w-1,h-12*stories),(w//2,h-12*stories)],dk(C(roofc),.18))
        rect(g,[0,h-12*stories-1,w-1,h-12*stories+1],dk(C(roofc),.3))
        rect(g,[w//2-3,h-10,w//2+2,h-2],door);pt(g,(w//2+1,h-6),'#ffd23f')
        for xx in ([7,w-12] if w>30 else [w-10]):
            rect(g,[xx,h-9,xx+4,h-5],'#4a3a2a');rect(g,[xx+1,h-8,xx+3,h-6],window)
        if stories>1:
            for xx in [7,w//2-2,w-12]:rect(g,[xx,h-21,xx+4,h-17],'#4a3a2a');rect(g,[xx+1,h-20,xx+3,h-18],window)
        if chim:rect(g,[w-12,top+1,w-9,top+7],'#8a8a94');rect(g,[w-12,top,w-9,top],'#5a5a64')
        if sign:rect(g,[w//2-4,h-14,w//2+4,h-11],sign);rect(g,[w//2,h-12-3,w//2,h-12],'#6a4a2a')
    return f
mk('cottage_red',40,40,house('#d8c8a8','#b83a3a'),'building');mk('cottage_blue',40,40,house('#c8d0d8','#3a5ab8'),'building');mk('cottage_green',40,40,house('#d8c8a8','#3a8a4a'),'building')
mk('cottage_thatch',40,40,house('#c8b088','#c8a050'),'building');mk('house_big',48,52,house('#d8c8a8','#8a3a3a',48,52,stories=2),'building')
mk('shop',40,40,house('#d8c8a8','#3a8a8a',sign='#ffd23f'),'building');mk('inn',48,52,house('#c8a878','#7a4a2a',48,52,stories=2,sign='#e8e0c8'),'building')
mk('bank',48,44,house('#c8c8d0','#5a5a6a',48,44,door='#3a3a4a',chim=False,sign='#ffd23f'),'building');mk('smithy',40,40,house('#9a8a7a','#4a4a56',sign='#aab4c4'),'building')
mk('igloo',40,32,lambda g,im:(ell(g,[2,4,37,36],'#e0ecf8'),ell(g,[4,5,33,30],'#f4faff'),rect(g,[16,22,25,31],'#2a3a5a'),line(g,[6,18,34,18],'#b8cce0',1),line(g,[10,11,30,11],'#b8cce0',1)),'building')
mk('adobe',40,36,house('#d8b078','#b88a4a',40,36,chim=False,door='#5a3a22'),'building')
def hut(g,im):
    for x in [6,12,26,32]:rect(g,[x,26,x+1,38],'#6a4a2a')
    rect(g,[4,18,36,27],'#a08050');poly(g,[(2,19),(20,4),(38,19)],'#6a8a3a');poly(g,[(20,4),(38,19),(20,19)],'#4a6a2a');rect(g,[17,21,23,27],'#3a2a1a')
mk('stilt_hut',40,40,hut,'building')
def tower(wall,cap):
    def f(g,im):
        rect(g,[8,14,27,46],wall);
        for y in range(14,46,5):rect(g,[8,y,27,y],dk(C(wall),.15))
        rect(g,[8,14,10,46],lt(C(wall),.15));rect(g,[25,14,27,46],dk(C(wall),.2))
        poly(g,[(5,16),(18,0),(31,16)],cap);poly(g,[(18,0),(31,16),(18,16)],dk(C(cap),.2))
        rect(g,[15,38,20,46],'#4a3a2a');rect(g,[15,22,20,28],'#2a2a3a');rect(g,[16,23,19,27],'#ffd23f')
    return f
mk('wizard_tower',36,48,tower('#8a8aa0','#5a3a9a'),'building');mk('obsidian_tower',36,48,tower('#3a3248','#c03030'),'building');mk('ice_tower',36,48,tower('#b8d8f0','#6ab0e0'),'building')
def wallseg(g,im):
    rect(g,[0,10,15,24],'#8a8a96')
    for y in range(10,24,4):rect(g,[0,y,15,y],'#5a5a66')
    for x in [0,5,10]:rect(g,[x,6,x+3,10],'#8a8a96')
mk('castle_wall',16,24,wallseg,'building',False)
def gate(g,im):
    rect(g,[0,4,7,30],'#8a8a96');rect(g,[25,4,32,30],'#8a8a96');rect(g,[0,4,32,12],'#9a9aa6');ell(g,[7,6,25,30],'#2a2a36');rect(g,[7,18,25,30],'#2a2a36')
    for x in range(9,24,3):rect(g,[x,10,x,30],'#5a5a66')
    for x in [0,10,20]:rect(g,[x,0,x+3,4],'#8a8a96')
mk('castle_gate',32,32,gate,'building')
def castle(g,im):
    rect(g,[0,20,63,50],'#8a8a96');rect(g,[0,20,63,22],'#a0a0ac')
    for x in range(0,64,8):rect(g,[x,16,x+4,20],'#8a8a96')
    for tx in [0,50]:
        rect(g,[tx,6,tx+13,50],'#9a9aa6');rect(g,[tx,6,tx+13,8],'#b0b0bc')
        poly(g,[(tx-2,8),(tx+6,-2),(tx+15,8)],'#b83a3a')
    ell(g,[24,26,40,56],'#2a2a36');rect(g,[24,40,40,50],'#2a2a36');rect(g,[30,0,31,14],'#6a4a2a');poly(g,[(31,0),(40,3),(31,6)],'#e83a3a')
mk('castle',64,52,castle,'building')
def well(g,im):
    ell(g,[4,14,20,26],'#8a8a96');ell(g,[6,16,18,22],'#2a62a8');rect(g,[4,6,5,18],'#6a4a2a');rect(g,[18,6,19,18],'#6a4a2a');poly(g,[(2,8),(12,1),(22,8)],'#a0703a')
mk('well',24,28,well,'decor')
def fountain(g,im):
    ell(g,[2,16,29,30],'#9a9aa6');ell(g,[4,17,27,27],'#4a92d0');rect(g,[14,6,17,20],'#b0b0bc');ell(g,[10,4,21,10],'#9a9aa6')
    for p in [(12,2),(15,0),(18,2),(10,5),(21,5)]:pt(g,p,'#c8e8ff')
mk('fountain',32,32,fountain,'decor')
def windmill(g,im):
    poly(g,[(8,40),(12,12),(20,12),(24,40)],'#d8c8a8');poly(g,[(10,12),(16,4),(22,12)],'#8a3a3a');rect(g,[13,30,19,40],'#4a3a2a')
    for a in [(-12,-12),(12,-12),(-12,12),(12,12)]:line(g,[16,10,16+a[0],10+a[1]],'#e8e0d0',2)
mk('windmill',32,42,windmill,'building')
mk('fence_h',16,12,lambda g,im:(rect(g,[0,5,15,6],'#8a5a2b'),rect(g,[0,8,15,9],'#8a5a2b'),[rect(g,[x,3,x+1,11],'#6a4a2a') for x in (1,7,14)]),'decor')
mk('sign',12,16,lambda g,im:(rect(g,[5,6,6,15],'#6a4a2a'),rect(g,[1,1,10,7],'#c8a060'),line(g,[3,3,8,3],'#6a4a2a',1),line(g,[3,5,7,5],'#6a4a2a',1)),'decor')
mk('lamp',8,20,lambda g,im:(rect(g,[3,6,4,18],'#4a4a56'),rect(g,[1,1,6,6],'#ffd23f'),rect(g,[0,0,7,1],'#4a4a56')),'decor')
mk('barrel',12,14,lambda g,im:(rect(g,[1,1,10,12],'#8a5a2b'),rect(g,[1,3,10,3],'#4a4a56'),rect(g,[1,9,10,9],'#4a4a56'),rect(g,[2,1,3,12],'#a0703a')),'decor')
mk('crate',14,14,lambda g,im:(rect(g,[0,0,13,13],'#a0703a'),rect(g,[0,0,13,1],'#c89050'),line(g,[1,1,12,12],'#6a4a2a',1),line(g,[12,1,1,12],'#6a4a2a',1)),'decor')
def stall(c):
    def f(g,im):
        rect(g,[2,10,3,26],'#6a4a2a');rect(g,[28,10,29,26],'#6a4a2a');rect(g,[0,4,31,12],c)
        for x in range(0,32,8):rect(g,[x,4,x+3,12],'#f0f0f0')
        rect(g,[3,20,28,26],'#a0703a');rect(g,[5,17,9,20],'#e83a3a');rect(g,[12,17,16,20],'#ffd23f');rect(g,[19,17,23,20],'#7ad04a')
    return f
mk('stall_red',32,28,stall('#c83a3a'),'decor');mk('stall_blue',32,28,stall('#3a5ac8'),'decor')
def tent(c):
    def f(g,im):poly(g,[(2,24),(16,4),(30,24)],c);poly(g,[(16,4),(30,24),(16,24)],dk(C(c),.2));poly(g,[(12,24),(16,12),(20,24)],'#2a1a14')
    return f
mk('tent_camp',32,28,tent('#c8a868'),'decor');mk('tent_red',32,28,tent('#c83a3a'),'decor')
def campfire(g,im):
    line(g,[3,14,13,10],'#6a4a2a',2);line(g,[3,10,13,14],'#6a4a2a',2);poly(g,[(5,10),(8,1),(11,10)],'#ff7a2a');poly(g,[(6,10),(8,4),(10,10)],'#ffd23f')
mk('campfire',16,16,campfire,'decor')
def ruins(g,im):
    for x,h in [(2,18),(10,10),(20,22),(28,8)]:rect(g,[x,28-h,x+4,28],'#8a8a96');rect(g,[x,28-h,x+4,28-h],'#b0b0bc')
    rect(g,[0,26,34,29],'#6a6a76')
mk('ruins',36,32,ruins,'building')
def portal(c):
    def f(g,im):
        rect(g,[2,10,6,30],'#4a4a56');rect(g,[22,10,26,30],'#4a4a56');rect(g,[0,6,28,11],'#5a5a66');ell(g,[6,12,22,30],c);ell(g,[9,15,19,29],lt(C(c),.5))
    return f
mk('portal_blue',28,32,portal('#6a90ff'),'decor');mk('portal_red',28,32,portal('#ff4a3a'),'decor');mk('portal_purple',28,32,portal('#b06aff'),'decor')
mk('statue',20,32,lambda g,im:(rect(g,[3,26,16,31],'#8a8a96'),rect(g,[7,12,12,26],'#aab0bc'),ell(g,[6,5,13,13],'#aab0bc'),rect(g,[4,14,6,20],'#aab0bc'),rect(g,[13,14,15,20],'#aab0bc')),'decor')
def anvil(g,im):poly(g,[(1,6),(15,6),(12,10),(10,10),(10,13),(13,15),(3,15),(6,13),(6,10),(4,10)],'#6a6a76');rect(g,[1,5,15,6],'#9a9aa6')
mk('anvil',16,18,anvil,'decor')
mk('bed',20,14,lambda g,im:(rect(g,[0,4,19,12],'#6a4a2a'),rect(g,[1,2,19,9],'#e8e0d0'),rect(g,[1,2,5,6],'#f4f0ea'),rect(g,[7,5,19,9],'#c83a3a')),'decor')
mk('lava_vent',16,16,lambda g,im:(ell(g,[1,6,14,15],'#3a2a2a'),ell(g,[3,8,12,13],'#ff7a2a'),ell(g,[5,9,10,12],'#ffd23f'),pt(g,(7,4),'#ffd23f'),pt(g,(5,2),'#ff7a2a')),'decor')
if __name__=='__main__':
    names=list(P);print(len(names))
    S=sheet([P[n][0] for n in names],10,cell=(72,64));S.resize((S.width*2,S.height*2),Image.NEAREST).save('/tmp/ap_props.png');print(S.size)
