import random
from lib import *
def shade(im,top=.12,bot=.16):
    w,h=im.size;p=im.load();o=im.copy();q=o.load()
    ys=[y for y in range(h) if any(p[x,y][3] for x in range(w))]
    if not ys:return o
    y0,y1=ys[0],ys[-1];sp=max(1,y1-y0)
    for y in range(h):
        t=(y-y0)/sp
        for x in range(w):
            c=p[x,y]
            if c[3]==0:continue
            if t<.28:q[x,y]=lt(c,top)
            elif t>.72:q[x,y]=dk(c,bot)
    return o
def fin(im,b):return outline(shade(im),dk(C(b),.72))
def _ears(g,kind,cx,top,hs,b,inner,view):
    # cx: head centre x, top: head top y
    if kind=='point':
        for s in(-1,1):poly(g,[(cx+s*(hs//2-1),top+1),(cx+s*(hs//2),top-3),(cx+s*(hs//2-3),top)],b);pt(g,(cx+s*(hs//2-1),top-1),inner)
    elif kind=='round':
        for s in(-1,1):ell(g,[cx+s*(hs//2)-1,top-2,cx+s*(hs//2)+1,top+1],b)
    elif kind=='long':
        for s in(-1,1):rect(g,[cx+s*2-(1 if s<0 else 0),top-7,cx+s*2+(0 if s<0 else 1),top],b);pt(g,(cx+s*2,top-4),inner)
    elif kind=='floppy':
        for s in(-1,1):poly(g,[(cx+s*(hs//2-2),top),(cx+s*(hs//2+1),top+1),(cx+s*(hs//2+1),top+4)],b)
    elif kind=='antler':
        for s in(-1,1):
            line(g,[cx+s*2,top,cx+s*3,top-5],'#d8c8a0');line(g,[cx+s*3,top-3,cx+s*5,top-5],'#d8c8a0');line(g,[cx+s*3,top-5,cx+s*2,top-7],'#d8c8a0')
        for s in(-1,1):poly(g,[(cx+s*(hs//2-1),top+1),(cx+s*(hs//2),top-2),(cx+s*(hs//2-3),top)],b)
def animal(body,belly=None,size=1.0,ears='point',tail='tuft',snout=3,leg=5,head=7,horn=None,mane=None,spots=None,stripes=None,wool=False,face=None,legcol=None,eye='#1a1220',tusk=False,disc=False,fat=1.0,inner='#e8a0a0',bl_=14,hump=False,seed=1):
    b=C(body);bel=C(belly) if belly else lt(b,.22);fc=C(face) if face else b;lg=C(legcol) if legcol else dk(b,.12)
    s=size;bl=round(bl_*s);bh=round(8*s*fat);ll=max(3,round(leg*s));hs=max(5,round(head*s));R=random.Random(seed)
    W=bl+hs+8;H=ll+bh+hs//2+8;out={}
    # ---------- side ----------
    fr=[]
    for f in range(2):
        im=new(W,H);g=ImageDraw.Draw(im);x0=4;yb=H-ll-bh-1;gy=H-1
        legs=[(x0+2,0,1),(x0+5,0,0),(x0+bl-7,0,0),(x0+bl-4,0,1)]  # far,near etc
        for i,(lx,_,near) in enumerate(legs):
            ph=(i+f)%2;lift=1 if ph else 0;dx=1 if ph else -1 if i%2==0 else 0
            col=dk(lg,.18) if not near else lg
            rect(g,[lx+dx,yb+bh-2,lx+dx+1,gy-lift],col);rect(g,[lx+dx,gy-lift,lx+dx+1,gy-lift],dk(lg,.55))
        # tail
        if tail=='bush':ell(g,[x0-4,yb-1,x0+2,yb+5],b);ell(g,[x0-3,yb-1,x0,yb+1],lt(b,.2))
        elif tail=='thin':line(g,[x0,yb+1,x0-3,yb+4],dk(b,.1),1);pt(g,(x0-3,yb+5),dk(b,.3))
        elif tail=='curl':line(g,[x0,yb+1,x0-2,yb],lt(b,.3),1);pt(g,(x0-3,yb+1),lt(b,.3));pt(g,(x0-2,yb+2),lt(b,.3))
        elif tail=='tuft':ell(g,[x0-2,yb+1,x0+1,yb+4],b)
        elif tail=='cotton':ell(g,[x0-2,yb+2,x0+2,yb+6],'#ffffff')
        # body
        if wool:
            for px in range(x0,x0+bl-2,3):
                for py in range(yb,yb+bh-2,3):ell(g,[px,py,px+4,py+4],'#f6f2ea' if (px+py)%2==0 else '#e6e0d4')
            ell(g,[x0+1,yb+bh-4,x0+bl-1,yb+bh],'#d8d2c6')
        else:
            ell(g,[x0,yb,x0+bl,yb+bh],b);ell(g,[x0+2,yb+bh*.55,x0+bl-2,yb+bh],bel)
        if hump:ell(g,[x0+bl//2-3,yb-3,x0+bl//2+3,yb+3],b)
        if stripes:
            for sx in range(x0+3,x0+bl-4,3):line(g,[sx,yb+1,sx+1,yb+bh-2],stripes)
        if spots:
            for _ in range(4):
                px=R.randrange(x0+3,x0+bl-5);py=R.randrange(yb+1,yb+bh-3);rect(g,[px,py,px+1,py+1],spots)
        # neck + head
        hx=x0+bl-3;hy=yb-hs//2+2;nk=b if not wool else fc
        poly(g,[(hx,hy+2),(hx+3,hy+hs-2),(x0+bl-7,yb+bh-1),(x0+bl-7,yb)],nk)
        if mane:ell(g,[x0+bl-9,yb-2,x0+bl-1,yb+bh-3],mane)
        ell(g,[hx,hy,hx+hs,hy+hs-2],fc)
        sn=lt(fc,.22) if not wool else dk(fc,.1)
        if disc:rect(g,[hx+hs-1,hy+hs//2-1,hx+hs+1,hy+hs-2],dk(C('#f0a0a8'),.1));pt(g,(hx+hs,hy+hs//2),'#8a3a4a')
        else:rect(g,[hx+hs-2,hy+hs//2-1,hx+hs-2+snout,hy+hs-3],sn);pt(g,(hx+hs-2+snout,hy+hs//2),'#1a1220')
        if tusk:rect(g,[hx+hs-3,hy+hs-3,hx+hs-3,hy+hs-1],'#ffffff')
        pt(g,(hx+hs-3,hy+hs//2-2),eye)
        # ear (near side), drawn over head back
        ex=hx+2
        if ears=='point':poly(g,[(ex,hy+1),(ex+1,hy-3),(ex+3,hy+1)],fc);pt(g,(ex+1,hy-1),inner)
        elif ears=='round':ell(g,[ex,hy-2,ex+2,hy+1],fc)
        elif ears=='long':poly(g,[(ex,hy+1),(ex-3,hy-6),(ex-1,hy-7),(ex+2,hy+1)],fc);pt(g,(ex-1,hy-4),inner)
        elif ears=='floppy':poly(g,[(ex,hy+1),(ex+3,hy+1),(ex+3,hy+5)],dk(fc,.15))
        elif ears=='antler':
            poly(g,[(ex,hy+1),(ex+1,hy-2),(ex+3,hy+1)],fc)
            line(g,[ex+1,hy,ex,hy-5],'#d8c8a0');line(g,[ex,hy-3,ex-2,hy-5],'#d8c8a0');line(g,[ex,hy-5,ex+1,hy-7],'#d8c8a0')
        if horn=='curl':line(g,[ex+1,hy,ex+1,hy-3,ex+3,hy-4],'#efe6cf')
        elif horn=='tusk':pass
        fr.append(fin(im,body))
    out['right']=fr;out['left']=[flipx(i) for i in fr]
    # ---------- front / back ----------
    fw=max(hs+4,round(bl*.62)+4);fh=H
    for view in('down','up'):
        L=[]
        for f in range(2):
            im=new(fw,fh);g=ImageDraw.Draw(im);gy=fh-1;yb=fh-ll-bh-1;cx=fw//2
            for i,lx in enumerate([cx-bl//4-1,cx+bl//4-1]):
                lift=1 if (i+f)%2 else 0;rect(g,[lx,yb+bh-2,lx+1,gy-lift],lg);rect(g,[lx,gy-lift,lx+1,gy-lift],dk(lg,.55))
            bw=fw-2
            if wool:
                for px in range(1,bw-2,3):
                    for py in range(yb,yb+bh-2,3):ell(g,[px,py,px+4,py+4],'#f6f2ea' if (px+py)%2==0 else '#e6e0d4')
            else:
                ell(g,[1,yb,fw-2,yb+bh],b)
                if view=='down':ell(g,[cx-bl//4,yb+bh//2,cx+bl//4,yb+bh],bel)
            if hump:ell(g,[cx-3,yb-3,cx+3,yb+2],b)
            if spots and not wool:
                for _ in range(3):px=R.randrange(3,fw-5);py=R.randrange(yb+1,yb+bh-2);rect(g,[px,py,px+1,py+1],spots)
            if stripes:
                for sx in range(3,fw-3,3):line(g,[sx,yb+1,sx+1,yb+bh-2],stripes)
            hy=yb-hs+3;hw=hs
            if view=='down':
                ell(g,[cx-hw//2,hy,cx+hw//2,hy+hs-1],fc)
                if mane:ell(g,[cx-hw//2-1,hy+1,cx+hw//2+1,hy+hs],mane);ell(g,[cx-hw//2+1,hy+1,cx+hw//2-1,hy+hs-1],fc)
                _ears(g,ears,cx,hy+1,hs,fc,inner,'f')
                if horn=='curl':
                    for s_ in(-1,1):line(g,[cx+s_*(hs//2),hy+1,cx+s_*(hs//2+1),hy-2],'#efe6cf')
                ey=hy+hs//2-1
                for s_ in(-1,1):pt(g,(cx+s_*(hs//4+1)-(1 if s_<0 else 0),ey),eye)
                if disc:ell(g,[cx-2,hy+hs-4,cx+2,hy+hs-1],'#e8909a');pt(g,(cx-1,hy+hs-3),'#8a3a4a');pt(g,(cx+1,hy+hs-3),'#8a3a4a')
                else:
                    ell(g,[cx-1-snout//3,hy+hs-4,cx+1+snout//3,hy+hs-1],(lt(fc,.25) if not wool else dk(fc,.1)));pt(g,(cx,hy+hs-3),'#1a1220')
                if tusk:pt(g,(cx-2,hy+hs-1),'#fff');pt(g,(cx+2,hy+hs-1),'#fff')
            else:
                ell(g,[cx-hw//2+1,hy+2,cx+hw//2-1,hy+hs-1],dk(fc,.12))
                _ears(g,ears,cx,hy+3,hs-1,dk(fc,.1),inner,'b')
                if tail=='bush':ell(g,[cx-2,yb+1,cx+2,yb+bh-1],lt(b,.15))
                elif tail=='tuft':ell(g,[cx-1,yb+2,cx+1,yb+4],lt(b,.3))
                elif tail=='thin':line(g,[cx,yb+2,cx,yb+bh-1],dk(b,.15))
                elif tail=='curl':pt(g,(cx,yb+2),lt(b,.3));pt(g,(cx+1,yb+3),lt(b,.3));pt(g,(cx,yb+4),lt(b,.3))
                elif tail=='cotton':ell(g,[cx-2,yb+2,cx+2,yb+6],'#ffffff')
            L.append(fin(im,body))
        out[view]=L
    return out
def fowl(body,wing,comb='#e02a2a',tailc=None,size=1.0,kind='hen',eye='#1a1220',beak='#ffb02e',legs='#e8a830'):
    b=C(body);wg=C(wing);tc=C(tailc) if tailc else dk(b,.2);big=kind=='rooster'
    W=int((18 if big else 13)*size);H=int((20 if big else 13)*size);out={}
    cmb=C(comb)
    def side(f):
        im=new(W+2,H+2);g=ImageDraw.Draw(im);bx=3;by=H//2 if big else H//2-1;bw=W-6;bh=H//2-1 if big else H//2-2;gy=H
        for lx,off in[(bx+bw//2-1,f),(bx+bw//2+2,1-f)]:rect(g,[lx,by+bh-1,lx,gy-off-1],C(legs));pt(g,(lx+1,gy-off-1),C(legs));pt(g,(lx-1,gy-off-1),C(legs))
        # tail feathers
        if big:
            for i,(c_,dx,dy) in enumerate([('#2a8a6a',-1,-9),('#2a5aa8',-3,-7),('#c02a2a',-4,-4),('#2a8a6a',-4,-1)]):line(g,[bx+2,by+2,bx+dx,by+dy+4],c_,2)
        else:poly(g,[(bx+1,by+2),(bx-2,by-3),(bx+1,by-3),(bx+3,by)],tc)
        ell(g,[bx,by,bx+bw,by+bh],b);ell(g,[bx+bw//2,by+bh//2,bx+bw,by+bh],lt(b,.25))
        ell(g,[bx+2,by+2,bx+bw-3,by+bh-2],wg)
        hx=bx+bw-2;hy=by-(5 if big else 4)
        poly(g,[(hx-1,hy+3),(hx+3,hy+3),(bx+bw-1,by+2),(bx+bw-4,by+2)],b)
        ell(g,[hx-1,hy,hx+4,hy+5],b)
        for i in range(3 if big else 2):ell(g,[hx-1+i*2,hy-2,hx+1+i*2,hy+1],cmb)
        poly(g,[(hx+4,hy+1),(hx+7,hy+2),(hx+4,hy+3)],C(beak));pt(g,(hx+4,hy+4),cmb);pt(g,(hx+4,hy+5),cmb);pt(g,(hx+2,hy+1),eye)
        return fin(im,body)
    sf=[side(0),side(1)];out['right']=sf;out['left']=[flipx(i) for i in sf]
    for view in('down','up'):
        L=[]
        for f in range(2):
            im=new(W,H+2);g=ImageDraw.Draw(im);cx=W//2;by=H//2-(0 if big else 1);bh=H//2-1 if big else H//2-2;gy=H+1
            for lx in(cx-2,cx+1):rect(g,[lx,by+4,lx,gy-1-((lx+f)%2)],C(legs));pt(g,(lx-1,gy-1-((lx+f)%2)),C(legs));pt(g,(lx+1,gy-1-((lx+f)%2)),C(legs))
            if view=='up':
                if big:
                    for c_,dx in[('#2a8a6a',-4),('#2a5aa8',-2),('#c02a2a',0),('#2a5aa8',2),('#2a8a6a',4)]:line(g,[cx,by+3,cx+dx,by-5],c_,2)
                else:poly(g,[(cx-3,by+3),(cx,by-3),(cx+3,by+3)],tc)
            bw=W//2+2 if not big else W//2+3
            ell(g,[cx-bw//2-1,by,cx+bw//2+1,by+bh+3],b)
            ell(g,[cx-bw//2,by+3,cx-bw//2+2,by+bh+1],wg);ell(g,[cx+bw//2-2,by+3,cx+bw//2,by+bh+1],wg)
            if view=='down':
                ell(g,[cx-3,by-5,cx+3,by+1],b);ell(g,[cx-1,by-8 if big else by-7,cx+1,by-4],cmb)
                if big:ell(g,[cx-2,by-8,cx,by-5],cmb);ell(g,[cx,by-8,cx+2,by-5],cmb)
                pt(g,(cx-2,by-3),eye);pt(g,(cx+2,by-3),eye);poly(g,[(cx-1,by-2),(cx+1,by-2),(cx,by+0)],C(beak));pt(g,(cx,by+1),cmb)
            else:ell(g,[cx-3,by-4,cx+3,by+1],dk(b,.12));ell(g,[cx-1,by-6,cx+1,by-3],cmb)
            L.append(fin(im,body))
        out[view]=L
    return out
if __name__=='__main__':
    from PIL import ImageDraw as D
    specs={'sheep':animal('#f2eee4',wool=True,face='#5a4a44',legcol='#4a3a36',ears='round',tail='tuft',snout=2,leg=4,head=6,bl_=13,fat=1.25),
     'cow':animal('#f2eee4',ears='round',tail='thin',horn='curl',spots='#2a2a2a',leg=6,head=8,bl_=17,fat=1.15,inner='#e8a0a0'),
     'pig':animal('#f0a0a8',ears='floppy',tail='curl',disc=True,leg=3,head=7,bl_=14,fat=1.15,legcol='#e08a96',snout=2),
     'rabbit':animal('#c8b8a0',ears='long',tail='cotton',snout=1,leg=3,head=5,bl_=9,fat=1.0,size=1),
     'fox':animal('#e8742a',ears='point',tail='bush',snout=3,leg=5,head=6,bl_=13,legcol='#3a2a22'),
     'deer':animal('#b0804a',ears='antler',tail='tuft',snout=3,leg=8,head=6,bl_=15,legcol='#8a6030',belly='#e0c898'),
     'wolf':animal('#8a8a92',ears='point',tail='bush',snout=4,leg=6,head=7,bl_=15,legcol='#6a6a72'),
     'bear':animal('#6a4a2a',ears='round',tail='tuft',snout=3,leg=5,head=8,bl_=16,fat=1.35,size=1.15),
     'boar':animal('#6a4a3a',ears='point',tail='curl',tusk=True,snout=3,leg=4,head=7,bl_=15,fat=1.2,mane='#3a2a22'),
     'camel':animal('#d8b070',ears='round',tail='thin',snout=3,leg=9,head=6,bl_=17,hump=True,legcol='#b08a50'),
     'chicken':fowl('#f4f0e8','#e0d8c8',kind='hen'),'rooster':fowl('#c0502a','#8a3a1a',kind='rooster',size=1.0)}
    ims=[];nm=[]
    for n,s in specs.items():
        for d in('down','up','right','left'):
            for f in(0,1):ims.append(s[d][f]);nm.append(n if (d,f)==('down',0) else '')
    S=sheet(ims,8,pad=0,cell=(46,40),bg=(46,52,48,255)).resize((8*46*5,((len(ims)+7)//8)*40*5),Image.NEAREST);d=D.Draw(S)
    for i,n in enumerate(nm):d.text(((i%8)*46*5+3,(i//8)*40*5+2),n,fill=(255,235,150,255))
    S.save('/tmp/ap_animals.png');print(S.size)
