from lib import *
def lum(c):return c[0]*.3+c[1]*.59+c[2]*.11
def polish_sprite(im,rim=.2,side=.1):
    im=im.copy();p=im.load();w,h=im.size;src=im.copy();s=src.load()
    def a(x,y):return 0<=x<w and 0<=y<h and s[x,y][3]>20
    ys=[y for y in range(h) for x in range(w) if a(x,y)]
    if not ys:return im
    y0,y1=min(ys),max(ys)
    edge={}
    for y in range(h):
        for x in range(w):
            if a(x,y):edge[(x,y)]=not(a(x-1,y) and a(x+1,y) and a(x,y-1) and a(x,y+1))
    outl=set(k for k,e in edge.items() if e and lum(s[k])<70)
    for (x,y) in outl:
        # tint outline by neighbouring body colour
        cols=[s[x+dx,y+dy] for dx,dy in((1,0),(-1,0),(0,1),(0,-1)) if a(x+dx,y+dy) and (x+dx,y+dy) not in outl]
        if cols:
            r=sum(c[0] for c in cols)//len(cols);g=sum(c[1] for c in cols)//len(cols);b=sum(c[2] for c in cols)//len(cols)
            p[x,y]=(int(r*.32+14)//6*6,int(g*.30+10)//6*6,int(b*.34+18)//6*6,s[x,y][3])
    for (x,y),e in edge.items():
        if (x,y) in outl:continue
        c=s[x,y];t=(y-y0)/max(1,y1-y0)
        f=1+(.07*(.5-t))*2  # top lighter, bottom darker
        r,g,b=[c[i]*f for i in range(3)]
        inner_top=(x,y-1) in outl or not a(x,y-1);inner_left=(x-1,y) in outl or not a(x-1,y)
        inner_bot=(x,y+1) in outl or not a(x,y+1);inner_right=(x+1,y) in outl or not a(x+1,y)
        if inner_top or inner_left:r,g,b=[v+(255-v)*rim for v in(r,g,b)]
        elif inner_bot or inner_right:r,g,b=[v*(1-side*1.6) for v in(r,g,b)]
        q=lambda v:min(255,(int(v)+3)//6*6)
        p[x,y]=(q(r),q(g),q(b),c[3])
    return im
def shadow_under(im,w=None,pad=3):
    W,H=im.size;o=new(W,H+pad);d=ImageDraw.Draw(o);cx=W//2;ww=w or max(5,W//2-1)
    d.ellipse([cx-ww,H-2,cx+ww,H+pad-1],fill=(0,0,0,70));o.alpha_composite(im,(0,0));return o
