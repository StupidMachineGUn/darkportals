from lib import *
import items as IT
I=IT.I
GEMY=('potion','gem','crystal','orb','diamond')
def pol(name,im,cat):
    o=im.copy();p=o.load();w,h=o.size
    ys=[y for y in range(h) for x in range(w) if p[x,y][3]];
    if not ys:return im
    y0,y1=min(ys),max(ys)
    for y in range(h):
        for x in range(w):
            c=p[x,y]
            if not c[3]:continue
            t=(y-y0)/max(1,y1-y0)
            c2=lt(c[:3]+(255,),.17*(1-t)) if t<.4 else dk(c[:3]+(255,),.17*(t-.4)) if t>.6 else c
            p[x,y]=c2[:3]+(c[3],)
    # specular: find a bright-ish interior pixel upper-left and add a white fleck
    xs=[x for y in range(h) for x in range(w) if p[x,y][3]];x0=min(xs);x1=max(xs)
    inner=[(x,y) for y in range(y0+2,y0+(y1-y0)//2+1) for x in range(x0+2,x0+(x1-x0)//2+2) if p[x,y][3] and sum(p[x,y][:3])>150]
    if inner and (cat in('potion','gem','misc','material','magic') or any(k in name for k in('potion','gem','crystal','ingot','bar','ore','orb','diamond','ruby','sapphire','emerald','amulet','ring','coin','gold'))):
        x,y=inner[0];p[x,y]=(255,255,255,255)
        if any(k in name for k in('potion','gem','crystal','diamond','orb')) and (x,y+1) in inner:p[x,y+1]=(255,255,255,200)
    return o
for n,(im,cat) in list(I.items()):I[n]=(pol(n,im,cat),cat)
