import random
from lib import *
from PIL import ImageFilter
TIERS=[('Plain',dict(blade='#c9d2de',hi='#f0f6ff',acc='#8a8a98',wood='#7a5230',glow=None,r=0,sp=0)),
 ('Enchanted',dict(blade='#b8e8e0',hi='#f0fffb',acc='#5ad0b8',wood='#7a5230',glow='#5ae8c8',r=1,sp=1)),
 ('Rare',dict(blade='#9ad0ff',hi='#f0f8ff',acc='#4a9aff',wood='#6a4a7a',glow='#4aa8ff',r=2,sp=3)),
 ('Epic',dict(blade='#d0a8ff',hi='#fff0ff',acc='#b04aff',wood='#4a2a6a',glow='#b86aff',r=3,sp=5)),
 ('Legendary',dict(blade='#ffe08a',hi='#ffffff',acc='#ff7a1a',wood='#8a4a1a',glow='#ffb02e',r=4,sp=8))]
S=24
def th(g,a,b,c,w=1):
    line(g,[a[0],a[1],b[0],b[1]],c,w)
def sword(g,p):
    for i in range(11):
        x,y=7+i,16-i;pt(g,(x,y),p['blade']);pt(g,(x+1,y),dk(C(p['blade']),.2));pt(g,(x,y-1),p['hi'])
    pt(g,(19,4),p['hi']);pt(g,(18,5),p['blade'])
    th(g,(4,13),(9,18),p['acc'],2);th(g,(3,19),(6,16),p['wood'],2);pt(g,(2,20),p['acc']);pt(g,(2,21),p['acc'])
def dagger(g,p):
    for i in range(7):
        x,y=9+i,14-i;pt(g,(x,y),p['blade']);pt(g,(x+1,y),dk(C(p['blade']),.2));pt(g,(x,y-1),p['hi'])
    th(g,(6,12),(10,16),p['acc'],2);th(g,(4,19),(7,16),p['wood'],2)
def axe(g,p):
    th(g,(5,20),(17,5),p['wood'],2)
    poly(g,[(12,3),(19,1),(21,9),(15,9),(14,6)],p['blade']);poly(g,[(12,3),(19,1),(18,3),(14,5)],p['hi']);poly(g,[(21,9),(15,9),(16,7),(20,7)],dk(C(p['blade']),.25));pt(g,(20,3),p['acc']);pt(g,(19,5),p['acc'])
def staff(g,p):
    th(g,(4,21),(14,9),p['wood'],2);th(g,(15,8),(16,7),p['acc'],1)
    ell(g,[13,2,20,9],p['acc']);ell(g,[14,3,19,8],p['blade']);pt(g,(15,4),p['hi']);pt(g,(16,4),p['hi']);poly(g,[(12,10),(13,8),(15,10)],p['acc']);poly(g,[(19,10),(21,8),(22,10)],p['acc'])
def scepter(g,p):
    th(g,(5,20),(14,11),'#d9a640',2);th(g,(4,21),(6,19),p['wood'],2);rect(g,[12,11,16,13],'#d9a640')
    ell(g,[12,2,20,10],'#d9a640');ell(g,[14,4,18,8],p['acc']);pt(g,(15,5),p['hi']);pt(g,(16,5),p['hi']);pt(g,(16,1),'#ffe08a');pt(g,(11,5),'#ffe08a');pt(g,(21,5),'#ffe08a');pt(g,(16,10),'#ffe08a')
def spear(g,p):
    th(g,(2,22),(17,7),p['wood'],2);poly(g,[(16,8),(18,2),(23,0),(21,6),(18,9)],p['blade']);poly(g,[(18,2),(23,0),(20,4)],p['hi']);poly(g,[(18,9),(21,6),(19,8)],dk(C(p['blade']),.25));th(g,(15,9),(18,6),p['acc'],1);th(g,(3,18),(6,21),p['acc'],1)
def bow(g,p):
    for i in range(18):
        a=i/17*math.pi;x=int(6+10*math.sin(a)*0.55+ (0)) ;y=3+i;pt(g,(5+int(7*math.sin(a)),y),p['wood']);pt(g,(6+int(7*math.sin(a)),y),dk(C(p['wood']),.2))
    line(g,[5,3,5,20],'#f4f0e0',1);pt(g,(5,3),p['acc']);pt(g,(5,20),p['acc']);th(g,(5,11),(18,11),p['blade']);poly(g,[(18,10),(21,11),(18,12)],p['hi'])
def mace(g,p):
    th(g,(4,21),(14,11),p['wood'],2);ell(g,[11,2,19,10],p['blade']);ell(g,[12,3,16,7],p['hi'])
    for sx,sy in((15,1),(20,6),(10,6),(15,11),(19,3),(11,3)):pt(g,(sx,sy),p['acc']);pt(g,(sx+(1 if sx>15 else -1 if sx<15 else 0),sy+(1 if sy>6 else -1)),p['acc'])
def wand(g,p):
    th(g,(5,20),(15,10),p['wood'],1);th(g,(6,21),(16,11),dk(C(p['wood']),.3),1)
    poly(g,[(16,9),(18,5),(20,9),(23,10),(19,12),(17,15),(16,11),(12,10)],p['acc']);pt(g,(18,8),p['hi']);pt(g,(17,9),p['hi'])
WEAPONS=[('Sword',sword),('Dagger',dagger),('Axe',axe),('Staff',staff),('Scepter',scepter),('Spear',spear),('Bow',bow),('Mace',mace),('Wand',wand)]
def make(fn,tier,frame=0):
    name,p=TIERS[tier];p=dict(p);pad=6;im=new(S+pad*2,S+pad*2);g=ImageDraw.Draw(im)
    sub=new(S,S);sg=ImageDraw.Draw(sub);fn(sg,p);base=outline(sub,'#241a2c')
    im.alpha_composite(base,(pad,pad))
    if p['glow']:
        m=im.split()[3];gc=C(p['glow']);R=random.Random(tier*7+frame)
        halo=new(im.width,im.height);hp=halo.load()
        cur=m
        for k in range(1,p['r']+1):
            cur=cur.filter(ImageFilter.MaxFilter(3));cp=cur.load();al=int(150*(1-k/(p['r']+1)))+18
            for y in range(im.height):
                for x in range(im.width):
                    if cp[x,y]>0 and hp[x,y][3]==0:hp[x,y]=gc[:3]+(al,)
        # pulse: brighter halo on odd frames
        out=halo
        if frame%2:
            out=new(im.width,im.height);op=out.load()
            for y in range(im.height):
                for x in range(im.width):
                    c=hp[x,y]
                    if c[3]:op[x,y]=c[:3]+(min(255,int(c[3]*1.35)),)
        out.alpha_composite(im);im=out
        # sparkles
        rr=random.Random(tier*131+frame*17)
        pts=[(x,y) for y in range(im.height) for x in range(im.width) if m.getpixel((x,y))==0]
        for _ in range(p['sp']):
            x,y=rr.choice(pts)
            if 2<x<im.width-3 and 2<y<im.height-3:
                col=(255,255,255,255) if rr.random()<.6 else gc[:3]+(255,)
                for dx,dy in((0,0),(1,0),(-1,0),(0,1),(0,-1)):
                    if im.getpixel((x+dx,y+dy))[3]<200:im.putpixel((x+dx,y+dy),col if (dx,dy)==(0,0) else gc[:3]+(200,))
    return im
if __name__=='__main__':
    cw=S+12+4;rows=len(WEAPONS);Sh=Image.new('RGBA',(cw*5,cw*rows),(52,40,60,255))
    for r,(n,fn) in enumerate(WEAPONS):
        for t in range(5):Sh.alpha_composite(make(fn,t),(t*cw+2,r*cw+2))
    Sh=Sh.resize((Sh.width*3,Sh.height*3),Image.NEAREST);Sh.save('/tmp/magic.png');print(Sh.size)
