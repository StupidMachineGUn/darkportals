from lib import *
from chars import human
def stretch(im,xs=(),ys=()):
    w,h=im.size;cols=[];
    for x in range(w):
        cols.append(x)
        if x in xs:cols.append(x)
    t=new(len(cols),h)
    for i,x in enumerate(cols):t.paste(im.crop((x,0,x+1,h)),(i,0))
    rows=[]
    for y in range(h):
        rows.append(y)
        if y in ys:rows.append(y)
    o=new(t.width,len(rows))
    for i,y in enumerate(rows):o.paste(t.crop((0,y,t.width,y+1)),(0,i))
    return o
def finish(im,col=None):return outline(im,col or '#1a1220')
def squash(im,f):
    return im
# ---------- blobs ----------
def blob(c,eye='#102010',crown=False,gold=False,size=1.0,spikes=False,hi=.5):
    out={}
    for f in range(2):
        w=int(16*size);h=int((13-f)*size);im=new(w+f*2,h+2);g=ImageDraw.Draw(im);cc=C(c);ox=f
        ell(g,[ox,2,ox+w-1,h+1],cc);rect(g,[ox+1,h-2,ox+w-2,h+1],cc);poly(g,[(ox+w//4,3),(ox+w*3//4,3),(ox+w*2//3,1),(ox+w//3,1)],cc)
        ell(g,[ox+2,3,ox+w//3,5],lt(cc,hi));rect(g,[ox+1,h-1,ox+w-2,h+1],dk(cc,.2))
        if spikes:
            for sx in range(2,w-2,3):poly(g,[(ox+sx,2),(ox+sx+1,-0),(ox+sx+2,2)],lt(cc,.3))
        e={'f':[(w//3,h-6),(w*2//3-1,h-6)]}
        eyes=[(ox+w//3,h//2+1),(ox+w*2//3-1,h//2+1)]
        d=dict(down=im.copy(),up=im.copy(),right=im.copy())
        for k in('down','right'):
            gg=ImageDraw.Draw(d[k])
            for (ex,ey) in (eyes if k=='down' else [(ox+w*2//3,h//2+1)]):
                rect(gg,[ex,ey,ex+1,ey+2],eye);pt(gg,(ex,ey),'#ffffff')
        if crown:
            for k in d:poly(ImageDraw.Draw(d[k]),[(ox+w//4,3),(ox+w//4+1,-1),(ox+w//2,2),(ox+w*3//4-1,-1),(ox+w*3//4,3)],'#ffd23f')
        for k in d:out.setdefault(k,[]).append(d[k])
    for k in out:out[k]=[finish(i,dk(C(c),.65)) for i in out[k]]
    out['left']=[flipx(i) for i in out['right']]
    return out
# ---------- quadrupeds ----------
def quad(body,belly=None,ears='point',tail='bush',eye='#ffd23f',snout=3,horn=None,spots=None,mane=None,size=1.0,stripes=None,tusk=False,wool=False,beak=False):
    b=C(body);bl=C(belly) if belly else lt(b,.25)
    W=int(22*size);H=int(16*size)
    out={}
    sideF=[]
    for f in range(2):
        im=new(W,H);g=ImageDraw.Draw(im);by=H//2-1
        # legs
        for i,lx in enumerate([4,7,W-10,W-7]):
            off=(1 if (i+f)%2 else 0);y1=max(by+4,H-2-off);y1=max(y1,by+4);rect(g,[int(lx*size),by+4,int(lx*size)+1,y1],dk(b,.15) if i%2==0 else b);rect(g,[int(lx*size),y1,int(lx*size)+1,y1],dk(b,.5))
        # tail
        if tail=='bush':ell(g,[0,by-3,6,by+2],b);ell(g,[1,by-3,4,by-1],lt(b,.2))
        elif tail=='thin':line(g,[1,by-1,4,by+1],dk(b,.1),1);pt(g,(1,by-2),dk(b,.1))
        elif tail=='curl':ell(g,[1,by-2,4,by+2],lt(b,.3))
        elif tail=='tuft':rect(g,[2,by,4,by+2],b);pt(g,(1,by+1),'#ffffff')
        ell(g,[3,by-2,W-6,by+6],b);ell(g,[4,by+1,W-7,by+6],bl)
        if mane:ell(g,[W-12,by-4,W-5,by+4],mane)
        if stripes:
            for sx in range(7,W-8,3):line(g,[sx,by-1,sx+1,by+3],stripes)
        if spots:
            for _ in range(5):pt(g,(random.Random(f+_).randrange(6,W-8),by+random.Random(_).randrange(-1,4)),spots)
        if wool:
            for sx in range(5,W-6,3):ell(g,[sx,by-3,sx+4,by+1],'#f4f0e8');ell(g,[sx,by+1,sx+4,by+5],'#e4dfd2')
        hx_=W-8;ell(g,[hx_,by-5,hx_+7,by+2],b)
        rect(g,[hx_+5,by-2,hx_+5+snout,by+1],lt(b,.2));pt(g,(hx_+5+snout,by-1),'#1a1220')
        if ears=='point':poly(g,[(hx_+1,by-5),(hx_+2,by-8),(hx_+4,by-5)],b);pt(g,(hx_+2,by-6),'#e8a0a0')
        elif ears=='round':ell(g,[hx_+1,by-7,hx_+4,by-4],b)
        elif ears=='long':rect(g,[hx_+1,by-10,hx_+2,by-5],b);rect(g,[hx_+3,by-10,hx_+4,by-5],lt(b,.1))
        elif ears=='antler':line(g,[hx_+2,by-5,hx_+1,by-10],'#d8c8a0');line(g,[hx_+4,by-5,hx_+5,by-10],'#d8c8a0');line(g,[hx_+1,by-8,hx_-1,by-9],'#d8c8a0');line(g,[hx_+5,by-8,hx_+7,by-9],'#d8c8a0')
        if horn=='curl':line(g,[hx_+2,by-5,hx_+3,by-8,hx_+5,by-8],'#efe6cf',1)
        if tusk:rect(g,[hx_+5,by+1,hx_+5,by+3],'#ffffff')
        if beak:poly(g,[(hx_+6,by-2),(hx_+9,by),(hx_+6,by+1)],'#ffb02e')
        pt(g,(hx_+4,by-3),eye);pt(g,(hx_+3,by-3),'#ffffff') if eye!='#ffd23f' else None
        sideF.append(im)
    out['right']=[finish(i,dk(b,.7)) for i in sideF];out['left']=[flipx(i) for i in out['right']]
    # front/back (compact)
    fw=int(14*size);fh=int(16*size)
    for k in('down','up'):
        fr=[]
        for f in range(2):
            im=new(fw,fh);g=ImageDraw.Draw(im)
            rect(g,[2,fh-4-f,3,fh-2-f],dk(b,.15));rect(g,[fw-4,fh-4-(1-f),fw-3,fh-2-(1-f)],dk(b,.15))
            ell(g,[1,6,fw-2,fh-3],b);ell(g,[3,9,fw-4,fh-3],bl) if k=='down' else None
            if k=='down':
                ell(g,[3,1,fw-4,9],b);rect(g,[fw//2-1,6,fw//2,8],lt(b,.25));pt(g,(fw//2-1,7),'#1a1220')
                if ears=='point':poly(g,[(3,3),(3,-0),(6,2)],b);poly(g,[(fw-4,3),(fw-4,0),(fw-7,2)],b)
                elif ears=='round':ell(g,[2,0,5,3],b);ell(g,[fw-6,0,fw-3,3],b)
                elif ears=='long':rect(g,[4,-0,5,3],b);rect(g,[fw-6,0,fw-5,3],b)
                elif ears=='antler':line(g,[4,2,3,-0],'#d8c8a0');line(g,[fw-5,2,fw-4,0],'#d8c8a0')
                pt(g,(4,4),eye);pt(g,(fw-5,4),eye)
                if tusk:pt(g,(5,8),'#ffffff');pt(g,(fw-6,8),'#ffffff')
                if beak:poly(g,[(fw//2-1,5),(fw//2,5),(fw//2,8)],'#ffb02e')
            else:
                ell(g,[3,1,fw-4,9],dk(b,.1))
                if tail=='bush':ell(g,[fw//2-2,8,fw//2+2,13],lt(b,.1))
                elif tail=='tuft':rect(g,[fw//2-1,9,fw//2,11],'#ffffff')
            fr.append(finish(im,dk(b,.7)))
        out[k]=fr
    return out
# ---------- biped monsters (built from human) ----------
def bipedm(skin,tunic,pants,hair=None,weapon='none',ears=None,horns=None,tusks=False,hood=None,skull=False,size='m',xs=(),ys=(),eye=None,wings=None,tail=None,armor=None,helm=None,extra=None):
    out={}
    for d,key in(('d','down'),('u','up'),('r','right')):
        fr=[]
        for f in range(2):
            im=human(d,[0,1][f],raw=True,skin=skin,hair=hair or skin,tunic=tunic,pants=pants,armor=armor,weapon=weapon)
            g=ImageDraw.Draw(im)
            if skull and d!='u':
                for ex in((8,11) if d=='d' else (12,)):rect(g,[ex,6,ex+1,8],'#1a1220')
                rect(g,[9,10,10,10],'#1a1220') if d=='d' else None
                for ry in(13,15):line(g,[7,ry,12,ry],dk(C(tunic),.4)) if d!='r' else line(g,[8,ry,11,ry],dk(C(tunic),.4))
            if hair is None and not skull:
                pass
            if ears:
                if d=='r':poly(g,[(7,5),(3,2),(7,8)],skin)
                else:poly(g,[(6,6),(2,3),(6,9)],skin);poly(g,[(13,6),(17,3),(13,9)],skin)
            if horns:
                hc=horns
                if d=='r':poly(g,[(8,3),(7,-1),(11,3)],hc)
                else:poly(g,[(6,3),(4,-1),(8,3)],hc);poly(g,[(13,3),(15,-1),(11,3)],hc)
            if tusks and d!='u':
                (rect(g,[8,10,8,12],'#ffffff'),rect(g,[11,10,11,12],'#ffffff')) if d=='d' else rect(g,[13,9,13,11],'#ffffff')
            if hood:
                rect(g,[5,2,12,4],hood);rect(g,[5,2,6,9],hood);rect(g,[11,2,12,9],hood)
                if d=='d':rect(g,[7,8,10,9],hood)
            if eye and d!='u':
                for ex in((8,11) if d=='d' else (12,)):pt(g,(ex,6),eye)
            if wings:
                if d!='r':poly(g,[(5,11),(-0,6+f*2),(1,16),(5,15)],wings);poly(g,[(14,11),(19,6+f*2),(18,16),(14,15)],wings)
                else:poly(g,[(6,11),(1,7+f*2),(2,16),(6,15)],wings)
            if tail and d=='r':line(g,[5,18,2,21,3,23],tail)
            if extra:extra(g,d,f)
            im=stretch(im,xs,ys)
            fr.append(finish(im))
        out[key]=fr
    out['left']=[flipx(i) for i in out['right']]
    return out
# ---------- flyers ----------
def flyer(body,wing,eye='#ff4a4a',size=1.0,kind='bat',glow=False,tail=None):
    out={}
    for f in range(2):
        W=int(20*size);H=int(14*size);im=new(W,H+4);g=ImageDraw.Draw(im);b=C(body);w=C(wing);cx=W//2
        ya=0 if f==0 else 3
        if kind=='bat':
            poly(g,[(cx,5),(W-1,1+ya),(W-4,7),(cx+3,6),(cx,9),(cx-3,6),(3,7),(0,1+ya)],w);ell(g,[cx-3,2,cx+3,9],b);poly(g,[(cx-3,3),(cx-2,0),(cx-1,3)],b);poly(g,[(cx+1,3),(cx+2,0),(cx+3,3)],b)
            pt(g,(cx-2,5),eye);pt(g,(cx+1,5),eye)
        elif kind=='ghost':
            ell(g,[cx-5,1,cx+5,9],b);rect(g,[cx-5,5,cx+5,11+f],b)
            for i,xx in enumerate(range(cx-5,cx+6,3)):poly(g,[(xx,11+f),(xx+1,13+f+(i%2)),(xx+2,11+f)],b)
            rect(g,[cx-3,4,cx-2,6],eye);rect(g,[cx+2,4,cx+3,6],eye);rect(g,[cx-1,7,cx+1,8],eye)
        elif kind=='wisp':
            ell(g,[cx-4,3+f,cx+4,11+f],b);ell(g,[cx-2,5+f,cx+2,9+f],lt(b,.6));poly(g,[(cx-3,4+f),(cx,-1+f),(cx+3,4+f)],b);pt(g,(cx-1,7+f),eye);pt(g,(cx+1,7+f),eye)
        elif kind=='harpy':
            poly(g,[(cx,6),(W-1,2+ya),(W-3,8),(cx+3,8)],w);poly(g,[(cx,6),(0,2+ya),(2,8),(cx-3,8)],w);ell(g,[cx-3,3,cx+3,12],b);ell(g,[cx-2,0,cx+2,4],'#f0c9a0');pt(g,(cx-1,2),eye);pt(g,(cx+1,2),eye);rect(g,[cx-2,12,cx-1,14],'#ffb02e');rect(g,[cx+1,12,cx+2,14],'#ffb02e')
        elif kind=='bird':
            poly(g,[(cx,6),(W-1,1+ya),(W-3,9),(cx+3,8)],w);poly(g,[(cx,6),(0,1+ya),(2,9),(cx-3,8)],w);ell(g,[cx-3,3,cx+3,11],b);ell(g,[cx-2,0,cx+2,4],b);poly(g,[(cx-1,3),(cx+1,3),(cx,5)],'#ffb02e');pt(g,(cx-1,2),'#101010');pt(g,(cx+1,2),'#101010');poly(g,[(cx-2,11),(cx+2,11),(cx,16)],w)
        if glow:
            ov=Image.new('RGBA',im.size,(0,0,0,0));
        res=finish(im,dk(b,.7))
        out.setdefault('down',[]).append(res)
    out['up']=out['down'];out['right']=out['down'];out['left']=out['down']
    return out
# ---------- crawlers ----------
def crawler(body,leg,eye='#ff4a4a',kind='spider',size=1.0,mark=None):
    out={}
    for f in range(2):
        W=int(20*size);H=int(14*size);im=new(W,H);g=ImageDraw.Draw(im);b=C(body);l=C(leg);cx=W//2;cy=H//2+1
        if kind=='spider':
            for i,(dx,dy) in enumerate([(-8,-4),(-9,-1),(-9,3),(-7,6)]):
                o=1 if (i+f)%2 else 0;line(g,[cx-3,cy,cx+dx,cy+dy-o],l,1);line(g,[cx+3,cy,cx-dx,cy+dy-o],l,1)
            ell(g,[cx-3,cy-1,cx+3,cy+6],b);ell(g,[cx-4,cy-4,cx+4,cy+1],lt(b,.1))
            if mark:rect(g,[cx-1,cy+1,cx,cy+4],mark)
            pt(g,(cx-2,cy-2),eye);pt(g,(cx+2,cy-2),eye)
        elif kind=='scorpion':
            for i,dx in enumerate([-6,-3,3,6]):line(g,[cx+dx//2,cy+1,cx+dx,cy+4-(f if i%2 else 0)],l,1)
            ell(g,[cx-4,cy-1,cx+4,cy+5],b);line(g,[cx,cy-1,cx,cy-5,cx+1,cy-8],b,2);poly(g,[(cx,cy-9),(cx+3,cy-8),(cx+1,cy-6)],mark or '#ff6a3a')
            poly(g,[(cx-4,cy),(cx-8,cy-4),(cx-5,cy-5)],b);poly(g,[(cx+4,cy),(cx+8,cy-4),(cx+5,cy-5)],b);pt(g,(cx-1,cy),eye);pt(g,(cx+1,cy),eye)
        elif kind=='beetle':
            for i,dy in enumerate([-3,1,5]):line(g,[cx-4,cy+dy,cx-8,cy+dy+1-(f if i%2 else 0)],l,1);line(g,[cx+4,cy+dy,cx+8,cy+dy+1-(f if i%2 else 1)],l,1)
            ell(g,[cx-5,cy-5,cx+5,cy+6],b);line(g,[cx,cy-4,cx,cy+5],dk(b,.3));ell(g,[cx-4,cy-4,cx-1,cy],lt(b,.35));poly(g,[(cx-2,cy-6),(cx-1,cy-8),(cx,cy-6)],l);poly(g,[(cx+2,cy-6),(cx+1,cy-8),(cx,cy-6)],l);pt(g,(cx-2,cy-5),eye);pt(g,(cx+2,cy-5),eye)
        elif kind=='centipede':
            for i in range(5):
                x=cx-8+i*4;y=cy+(1 if (i+f)%2 else 0);ell(g,[x-2,y-2,x+2,y+3],b if i else lt(b,.1));line(g,[x,y-3,x,y-4],l,1);line(g,[x,y+3,x,y+4],l,1)
            pt(g,(cx-9,cy-1),eye);pt(g,(cx-9,cy+1),eye)
        elif kind=='ant':
            for i,dx in enumerate([-3,0,3]):line(g,[cx+dx,cy+1,cx+dx-2,cy+5-(f if i%2 else 0)],l,1);line(g,[cx+dx,cy+1,cx+dx+2,cy+5-(1-f if i%2 else 0)],l,1)
            ell(g,[cx-7,cy-1,cx-2,cy+4],b);ell(g,[cx-3,cy-1,cx+1,cy+3],lt(b,.1));ell(g,[cx+1,cy-3,cx+6,cy+3],b);line(g,[cx+4,cy-3,cx+6,cy-6],l,1);line(g,[cx+2,cy-3,cx+3,cy-6],l,1);pt(g,(cx+5,cy),eye)
        out.setdefault('down',[]).append(finish(im,dk(b,.7)))
    out['up']=out['down'];out['right']=out['down'];out['left']=out['down'];return out
# ---------- golems / elementals ----------
def golem(stone,crack,eye,kind='rock',spikes=False):
    out={}
    for f in range(2):
        im=new(26,30);g=ImageDraw.Draw(im);s=C(stone);c=C(crack)
        y=-f
        rect(g,[6,20,10,29],dk(s,.1));rect(g,[15,20,19,29-0],s);rect(g,[5,27,10,29],dk(s,.3));rect(g,[14,27,20,29],dk(s,.3))
        ell(g,[4,8+y,21,23+y],s);rect(g,[6,10+y,19,21+y],s)
        rect(g,[0,10+y,5,22+y],dk(s,.1));rect(g,[20,10+y,25,22+y+f],s);rect(g,[0,20+y,5,24+y],lt(s,.1));rect(g,[20,21+y,25,25+y],dk(s,.1))
        ell(g,[7,0+y,18,10+y],lt(s,.08))
        rect(g,[8,4+y,11,6+y],eye);rect(g,[14,4+y,17,6+y],eye)
        for _ in range(8):
            rr=random.Random(_+f*0);x=rr.randrange(6,20);yy=rr.randrange(10,24);line(g,[x,yy+y,x+1,yy+2+y],c)
        for _ in range(6):pt(g,(random.Random(_).randrange(2,24),random.Random(_+9).randrange(11,23)+y),lt(s,.25))
        if kind=='ice':
            for sx in(3,9,16,22):poly(g,[(sx,8+y),(sx+1,3+y),(sx+2,8+y)],'#d8f4ff')
        if kind=='lava':
            for _ in range(6):pt(g,(random.Random(_*3).randrange(5,21),random.Random(_*5).randrange(9,24)+y),'#ffd24a')
        if kind=='crystal':
            for sx,sy in((2,9),(21,8),(12,-1)):poly(g,[(sx,sy+y),(sx+1,sy-5+y),(sx+3,sy+y)],'#ff7ae0');pt(g,(sx+1,sy-3+y),'#ffffff')
        if kind=='iron':
            rect(g,[8,8+y,17,9+y],'#c0c8d6');rect(g,[2,12+y,3,20+y],'#c0c8d6');rect(g,[22,12+y,23,20+y],'#c0c8d6')
        out.setdefault('down',[]).append(finish(im,dk(s,.7)))
    out['up']=out['down'];out['right']=out['down'];out['left']=out['down'];return out
# ---------- dragons ----------
def dragon(body,belly,wing,eye='#ffd23f',breath=None,size=1.0,horn='#efe6cf'):
    out={}
    b=C(body);bl=C(belly);w=C(wing)
    fr=[]
    for f in range(2):
        W=int(34*size);H=int(26*size);im=new(W,H);g=ImageDraw.Draw(im);by=H//2+3
        ya=-3 if f else 2
        poly(g,[(12,by-3),(8,by-12+ya),(16,by-9+ya),(22,by-13+ya),(24,by-3)],w);line(g,[12,by-3,8,by-12+ya],dk(w,.35));line(g,[24,by-3,22,by-13+ya],dk(w,.35))
        for i,(lx) in enumerate([9,12,22,25]):rect(g,[lx,by+3,lx+2,by+8-(1 if (i+f)%2 else 0)],dk(b,.15) if i%2==0 else b);rect(g,[lx,by+7,lx+3,by+8],'#2a1a14')
        poly(g,[(6,by-1),(0,by+4),(1,by+5),(8,by+3)],b);poly(g,[(0,by+4),(-0,by+2),(3,by+3)],bl)
        ell(g,[6,by-5,26,by+5],b);ell(g,[8,by+0,24,by+5],bl)
        for sx in range(9,24,3):poly(g,[(sx,by-5),(sx+1,by-8),(sx+2,by-5)],dk(b,.25))
        line(g,[25,by-4,28,by-9],b,3);ell(g,[26,by-14,34,by-6],b);poly(g,[(33,by-10),(35,by-9),(33,by-8)],bl)
        poly(g,[(27,by-14),(25,by-17),(29,by-14)],horn);poly(g,[(30,by-14),(29,by-17),(32,by-14)],horn);pt(g,(31,by-11),eye)
        if breath:ell(g,[34,by-11,36,by-9],breath)
        fr.append(finish(im,dk(b,.7)))
    out['right']=fr;out['left']=[flipx(i) for i in fr];out['down']=fr;out['up']=fr;return out
# ---------- plants ----------
def plant(kind):
    out={}
    for f in range(2):
        im=new(24,28);g=ImageDraw.Draw(im)
        if kind=='treant':
            rect(g,[8,14,15,27],'#6b4423');rect(g,[6,25,9,27],'#5a3a1e');rect(g,[14,25,18,27],'#5a3a1e');line(g,[7,16,2,20-f],'#6b4423',2);line(g,[16,16,21,20+f],'#6b4423',2)
            for cx,cy,r in((12,8,8),(5,10,5),(19,10,5),(12,3,5)):ell(g,[cx-r,cy-r,cx+r,cy+r],'#2f7a2c')
            for cx,cy,r in((10,6,5),(16,5,3)):ell(g,[cx-r,cy-r,cx+r,cy+r],'#4aa042')
            rect(g,[9,15,10,17],'#ffd23f');rect(g,[13,15,14,17],'#ffd23f');line(g,[10,20,13,20],'#2a1a0e')
        elif kind=='shroom':
            rect(g,[9,13,14,26],'#efe6cf');line(g,[9,13,9,26],'#fff8e8');ell(g,[2,2,21,16],'#a03aa0');ell(g,[3,3,12,9],'#c85ac8')
            for sx,sy in((6,6),(12,4),(16,9),(9,10)):ell(g,[sx,sy,sx+2,sy+2],'#f4e8f4')
            rect(g,[10,18,11,19],'#1a1220');rect(g,[13,18,14,19],'#1a1220');rect(g,[8,26,15,27],'#c8b890') if f==0 else rect(g,[7,26,16,27],'#c8b890')
        elif kind=='venus':
            line(g,[12,27,12,14],'#2f7a2c',3);poly(g,[(12,24),(3,22+f),(7,26)],'#3a8a34');poly(g,[(12,24),(21,22+f),(17,26)],'#3a8a34')
            ell(g,[4,1,19,15],'#c03a5a');ell(g,[4,5+f*2,19,13],'#7a1a30');
            for sx in range(6,18,3):poly(g,[(sx,6+f*2),(sx+1,9+f*2),(sx+2,6+f*2)],'#ffffff')
            ell(g,[6,2,10,5],'#e85a7a')
        elif kind=='thorn':
            for cx,cy in((12,16),(6,19),(18,19),(12,10)):
                for a in range(0,360,40):
                    import math as m;x=cx+m.cos(m.radians(a+f*8))*6;y=cy+m.sin(m.radians(a+f*8))*5;line(g,[cx,cy,x,y],'#4a2a3a',2);pt(g,(x,y),'#e8e0c8')
            ell(g,[6,10,18,24],'#5a2a4a');rect(g,[9,15,10,17],'#ff4a4a');rect(g,[13,15,14,17],'#ff4a4a');line(g,[10,20,13,20],'#e8e0c8')
        out.setdefault('down',[]).append(finish(im,'#1a1220'))
    out['up']=out['down'];out['right']=out['down'];out['left']=out['down'];return out
