import random, math
from PIL import Image, ImageDraw, ImageFont
def hx(h):
    h=h.lstrip('#')
    if len(h)==3:h=''.join(c*2 for c in h)
    h=h[:6];return tuple(int(h[i:i+2],16) for i in (0,2,4))+(255,)
def lt(c,k):return tuple(min(255,int(c[i]+(255-c[i])*k)) for i in range(3))+(255,)
def dk(c,k):return tuple(int(c[i]*(1-k)) for i in range(3))+(255,)
def mix(a,b,t):return tuple(int(a[i]*(1-t)+b[i]*t) for i in range(3))+(255,)
def new(w,h):return Image.new('RGBA',(w,h),(0,0,0,0))
def C(x):return x if isinstance(x,tuple) else hx(x)
def outline(im,col=None,k=.62):
    w,h=im.size;big=Image.new('RGBA',(w+2,h+2),(0,0,0,0));big.paste(im,(1,1));p=big.load();o=big.copy();q=o.load()
    for y in range(h+2):
        for x in range(w+2):
            if p[x,y][3]:continue
            best=None
            for dx,dy in((1,0),(-1,0),(0,1),(0,-1)):
                nx,ny=x+dx,y+dy
                if 0<=nx<w+2 and 0<=ny<h+2 and p[nx,ny][3]:
                    if best is None or dy>=0:best=p[nx,ny]
            if best:q[x,y]=C(col) if col else dk(best,k)
    return o
def bevel(im,hi=.2,lo=.25):
    w,h=im.size;p=im.load();o=im.copy();q=o.load()
    for y in range(h):
        for x in range(w):
            c=p[x,y]
            if c[3]==0:continue
            up=y==0 or p[x,y-1][3]==0;lf=x==0 or p[x-1,y][3]==0;dn=y==h-1 or p[x,y+1][3]==0;rt=x==w-1 or p[x+1,y][3]==0
            if up or lf:q[x,y]=lt(c,hi)
            elif dn or rt:q[x,y]=dk(c,lo)
    return o
def flipx(im):return im.transpose(Image.FLIP_LEFT_RIGHT)
def _n(b):
    x0,y0,x1,y1=b;return [min(x0,x1),min(y0,y1),max(x0,x1),max(y0,y1)]
def ell(d,b,c):d.ellipse(_n(b),fill=C(c))
def rect(d,b,c):d.rectangle(_n(b),fill=C(c))
def pt(d,xy,c):d.point(xy,fill=C(c))
def line(d,b,c,w=1):d.line(b,fill=C(c),width=w)
def poly(d,p,c):d.polygon(p,fill=C(c))
def recolor(im,mp):
    o=im.copy();p=o.load()
    for y in range(o.height):
        for x in range(o.width):
            c=p[x,y]
            if c[3] and c[:3] in mp:p[x,y]=mp[c[:3]]+(c[3],) if len(mp[c[:3]])==3 else mp[c[:3]]
    return o
def sheet(items,cols,pad=2,bg=(52,50,64,255),cell=None,labels=None):
    ims=[i for i in items]
    cw=cell[0] if cell else max(i.width for i in ims)+pad*2
    ch=cell[1] if cell else max(i.height for i in ims)+pad*2
    rows=(len(ims)+cols-1)//cols
    S=Image.new('RGBA',(cw*cols,ch*rows),bg)
    for n,i in enumerate(ims):
        S.alpha_composite(i,((n%cols)*cw+(cw-i.width)//2,(n//cols)*ch+(ch-i.height)//2))
    return S
def label(im,text,scale=3,pad=14,fg=(235,232,220,255),bg=(34,32,44,255)):
    W=im.width*scale;H=im.height*scale
    out=Image.new('RGBA',(W,H+pad*2),bg);out.alpha_composite(im.resize((W,H),Image.NEAREST),(0,pad*2-4))
    d=ImageDraw.Draw(out);d.text((8,6),text,fill=fg);return out
