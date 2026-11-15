import random
from lib import *
from PIL import ImageFilter
import chars
from magicwep import TIERS
from sprpolish import polish_sprite
CW,CH=32,36;OX,OY=6,8   # canvas and char offset
def vline(g,x,y0,y1,c,tilt=0.0,w=1):
    n=abs(y1-y0)
    for i in range(n+1):
        y=y0+(i if y1>y0 else -i);xx=x+int(round(tilt*(y-y0)))
        for k in range(w):pt(g,(xx+k,y),c)
def draw_held(kind,p,view,hx,hy,g):
    t=-0.22 if view=='r' else 0.0;ink=p['blade'];hi=p['hi'];ac=p['acc'];wd=p['wood']
    def X(dy):return hx+int(round(t*dy))
    if kind in('sword','dagger'):
        L=12 if kind=='sword' else 7
        for i in range(L):pt(g,(X(-i),hy-2-i),ink);pt(g,(X(-i)+1,hy-2-i),dk(C(ink),.22));pt(g,(X(-i)-0,hy-2-i),hi) if i%2==0 else None
        pt(g,(X(-L),hy-2-L),hi)
        for dx in(-2,-1,0,1,2,3):pt(g,(hx+dx,hy-1),ac)
        pt(g,(hx,hy),wd);pt(g,(hx,hy+1),wd);pt(g,(hx,hy+2),ac)
    elif kind=='axe':
        vline(g,hx,hy+4,hy-12,wd,t,2)
        hx2=X(-11);poly(g,[(hx2-1,hy-14),(hx2+6,hy-16),(hx2+7,hy-8),(hx2+1,hy-8)],ink);poly(g,[(hx2-1,hy-14),(hx2+6,hy-16),(hx2+5,hy-14),(hx2+1,hy-12)],hi);pt(g,(hx2+6,hy-12),ac);pt(g,(hx2+5,hy-10),ac)
    elif kind=='staff':
        vline(g,hx,hy+5,hy-14,wd,t,2);ox=X(-14)
        ell(g,[ox-3,hy-21,ox+4,hy-13],ac);ell(g,[ox-2,hy-20,ox+3,hy-14],ink);pt(g,(ox-1,hy-19),hi);pt(g,(ox,hy-19),hi);poly(g,[(ox-4,hy-12),(ox-3,hy-15),(ox-1,hy-12)],ac);poly(g,[(ox+3,hy-12),(ox+5,hy-15),(ox+5,hy-12)],ac)
    elif kind=='scepter':
        vline(g,hx,hy+4,hy-7,'#d9a640',t,2);ox=X(-7)
        rect(g,[ox-2,hy-9,ox+3,hy-8],'#d9a640');ell(g,[ox-3,hy-16,ox+4,hy-8],'#d9a640');ell(g,[ox-2,hy-15,ox+3,hy-9],ac);pt(g,(ox-1,hy-14),hi);pt(g,(ox,hy-14),hi)
        for qx,qy in((ox,hy-17),(ox-4,hy-12),(ox+5,hy-12)):pt(g,(qx,qy),'#ffe08a')
    elif kind=='spear':
        vline(g,hx,hy+8,hy-15,wd,t,2);ox=X(-15)
        poly(g,[(ox-2,hy-14),(ox,hy-22),(ox+3,hy-14),(ox,hy-12)],ink);poly(g,[(ox,hy-22),(ox+1,hy-17),(ox,hy-14)],hi);pt(g,(ox-1,hy-13),ac);pt(g,(ox+2,hy-13),ac)
    elif kind=='mace':
        vline(g,hx,hy+4,hy-9,wd,t,2);ox=X(-9)
        ell(g,[ox-3,hy-16,ox+4,hy-9],ink);pt(g,(ox-1,hy-14),hi);pt(g,(ox,hy-14),hi)
        for sx,sy in((ox,hy-17),(ox-4,hy-13),(ox+5,hy-13),(ox,hy-8)):pt(g,(sx,sy),ac)
    elif kind=='wand':
        vline(g,hx,hy+2,hy-7,wd,t,1);ox=X(-7)
        poly(g,[(ox,hy-13),(ox+1,hy-9),(ox+4,hy-8),(ox+1,hy-7),(ox,hy-3 if False else hy-4),(ox-1,hy-7),(ox-4,hy-8),(ox-1,hy-9)],ac);pt(g,(ox,hy-9),hi)
    elif kind=='bow':
        for i in range(-10,11):
            x=hx+2-int(round(5*math.cos(i/10*math.pi/2)));pt(g,(x+2 if False else hx+3-int(round(4*math.cos(i/10*math.pi/2)))+3,hy-5+i),wd)
        vline(g,hx+3,hy-15,hy+5,'#f4f0e0',0,1);pt(g,(hx+3,hy-15),ac);pt(g,(hx+3,hy+5),ac)
def render(kind,tier,view,frame=0,armor='iron',body=True):
    name,p=TIERS[tier];p=dict(p);base=chars.human(view,0,armor=armor,weapon='none',skin='#d9a67a',hair='#5a3a28')
    im=new(CW,CH);im.alpha_composite(base,(OX,OY))
    # hands: down/up view right hand at (14,18) in char coords; right view (9,18)
    hx,hy=(OX+14,OY+18) if view in('d','u') else (OX+9,OY+18)
    wl=new(CW,CH);g=ImageDraw.Draw(wl);draw_held(kind,p,view,hx,hy,g);wl=outline(wl,'#241a2c')
    out=new(CW,CH)
    m=wl.split()[3]
    if p['glow']:
        gc=C(p['glow']);halo=new(CW,CH);hp=halo.load();cur=m
        for k in range(1,p['r']+1):
            cur=cur.filter(ImageFilter.MaxFilter(3));cp=cur.load();al=int(150*(1-k/(p['r']+1)))+18+(30 if frame%2 else 0)
            for y in range(CH):
                for x in range(CW):
                    if cp[x,y]>0 and hp[x,y][3]==0:hp[x,y]=gc[:3]+(al,)
        out.alpha_composite(halo)
    out.alpha_composite(im) if body else None;out.alpha_composite(wl)
    if p['glow']:
        rr=random.Random(tier*131+frame*17+hash(kind)%97);gc=C(p['glow'])
        pts=[(x,y) for y in range(2,CH-2) for x in range(2,CW-2) if m.getpixel((x,y))==0 and any(m.getpixel((x+dx,y+dy))>0 for dx in range(-5,6) for dy in range(-5,6) if 0<=x+dx<CW and 0<=y+dy<CH)]
        for _ in range(p['sp']):
            x,y=rr.choice(pts)
            if out.getpixel((x,y))[3]<60:
                out.putpixel((x,y),(255,255,255,255))
                for dx,dy in((1,0),(-1,0),(0,1),(0,-1)):
                    if out.getpixel((x+dx,y+dy))[3]<60:out.putpixel((x+dx,y+dy),gc[:3]+(190,))
    return out
if __name__=='__main__':
    kinds=['sword','dagger','axe','staff','scepter','spear','mace','bow','wand']
    cw,ch=CW+2,CH+2;cols=10;Sh=Image.new('RGBA',(cw*cols,ch*len(kinds)),(104,150,76,255))
    for r,k in enumerate(kinds):
        for t in range(5):
            Sh.alpha_composite(render(k,t,'d'),(t*cw+1,r*ch+1));Sh.alpha_composite(render(k,t,'r'),((5+t)*cw+1,r*ch+1))
    Sh=Sh.resize((Sh.width*3,Sh.height*3),Image.NEAREST);Sh.save('/tmp/held.png');print(Sh.size)
