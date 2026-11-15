from lib import *
from mobs import finish
def dragon2(body,belly,wing,eye='#ffd23f',breath=None,size=1.0,horn='#efe6cf'):
    b=C(body);bl=C(belly);w=C(wing);out={}
    def side(f):
        W,H=44,34;im=new(W,H);g=ImageDraw.Draw(im);ya=-3 if f else 2;by=21
        # far wing (darker, behind)
        poly(g,[(18,by-6),(9,by-17+ya),(14,by-13+ya),(18,by-19+ya),(22,by-12+ya),(26,by-16+ya),(26,by-6)],dk(w,.35))
        # tail with spikes
        poly(g,[(11,by-3),(0,by+4+(1 if f else 0)),(1,by+6+(1 if f else 0)),(8,by+3),(13,by+2)],b);poly(g,[(0,by+4),(-1,by+1),(3,by+3)],dk(b,.3))
        for tx in(3,6,9):pt(g,(tx,by+2-((9-tx)//3)),dk(b,.35))
        # back legs
        for lx,sh in((12,.18),(24,0)):
            rect(g,[lx,by+3,lx+3,by+8-(1 if f and lx==12 else 0)],dk(b,sh) if sh else b);rect(g,[lx-1,by+8-(1 if f and lx==12 else 0),lx+4,by+9-(1 if f and lx==12 else 0)],'#2a1a14');pt(g,(lx+4,by+8),horn);pt(g,(lx-1,by+8),horn)
        # body
        ell(g,[8,by-7,30,by+5],b);ell(g,[10,by-1,28,by+5],bl)
        for yy in(by+1,by+3):line(g,[12,yy,26,yy],dk(bl,.18),1)
        for sx in range(10,28,3):poly(g,[(sx,by-7),(sx+1,by-10),(sx+2,by-7)],dk(b,.3))
        ell(g,[12,by-6,22,by-3],lt(b,.2))
        # neck + head
        line(g,[28,by-4,32,by-10],b,4);ell(g,[30,by-17,40,by-8],b);poly(g,[(38,by-14),(43,by-12),(43,by-10),(39,by-9)],b);poly(g,[(39,by-10),(43,by-10),(42,by-8),(38,by-8)],bl)
        pt(g,(42,by-12),dk(b,.5));pt(g,(36,by-14),C(eye));pt(g,(37,by-14),C(eye));pt(g,(36,by-15),'#ffffff')
        poly(g,[(31,by-16),(27,by-19),(29,by-14)],horn);poly(g,[(34,by-17),(32,by-21),(36,by-16)],horn)
        if breath:ell(g,[43,by-12,45,by-10],breath)
        # near wing (front)
        poly(g,[(17,by-7),(6,by-21+ya),(12,by-16+ya),(16,by-23+ya),(21,by-15+ya),(26,by-20+ya),(25,by-7)],w)
        for (x1,y1) in((6,by-21+ya),(16,by-23+ya),(26,by-20+ya)):line(g,[17 if x1<20 else 24,by-7,x1,y1],dk(w,.4),1)
        poly(g,[(8,by-18+ya),(12,by-16+ya),(11,by-12+ya)],lt(w,.15))
        return finish(im,dk(b,.7))
    def front(f,back=False):
        W,H=44,34;im=new(W,H);g=ImageDraw.Draw(im);ya=-3 if f else 1;cx=22;by=20
        for sx in(-1,1):
            poly(g,[(cx+sx*5,by-6),(cx+sx*20,by-16+ya),(cx+sx*15,by-10+ya),(cx+sx*19,by-6+ya),(cx+sx*13,by-3),(cx+sx*8,by+2),(cx+sx*5,by+4)],w if sx>0 else dk(w,.12))
            line(g,[cx+sx*5,by-5,cx+sx*20,by-16+ya],dk(w,.4),1);line(g,[cx+sx*5,by-3,cx+sx*19,by-6+ya],dk(w,.4),1)
        if back:poly(g,[(cx,by+4),(cx-3,by+12),(cx,by+16),(cx+3,by+12)],b)
        ell(g,[cx-8,by-8,cx+8,by+10],b)
        if not back:
            ell(g,[cx-6,by-2,cx+6,by+10],bl)
            for yy in(by+2,by+5,by+8):line(g,[cx-5,yy,cx+5,yy],dk(bl,.2),1)
        for sy in range(by-8,by+9,4):poly(g,[(cx-1,sy),(cx,sy-2),(cx+1,sy)],dk(b,.35)) if back else None
        if not back:
            for lx in(cx-9,cx+5):rect(g,[lx,by+8,lx+3,by+13],b);rect(g,[lx-1,by+13,lx+4,by+14],'#2a1a14');pt(g,(lx-1,by+14),horn);pt(g,(lx+4,by+14),horn)
            ell(g,[cx-5,by-15,cx+5,by-4],b);ell(g,[cx-3,by-9,cx+3,by-4],bl);pt(g,(cx-1,by-7),dk(b,.5));pt(g,(cx+1,by-7),dk(b,.5))
            for ex in(cx-4,cx+2):pt(g,(ex,by-11),C(eye));pt(g,(ex,by-12),'#ffffff')
            poly(g,[(cx-5,by-13),(cx-8,by-18),(cx-3,by-14)],horn);poly(g,[(cx+5,by-13),(cx+8,by-18),(cx+3,by-14)],horn)
        else:
            ell(g,[cx-4,by-13,cx+4,by-5],dk(b,.1));poly(g,[(cx-4,by-11),(cx-7,by-16),(cx-2,by-12)],horn);poly(g,[(cx+4,by-11),(cx+7,by-16),(cx+2,by-12)],horn)
        return finish(im,dk(b,.7))
    r=[side(0),side(1)]
    out['right']=r;out['left']=[flipx(i) for i in r];out['down']=[front(0),front(1)];out['up']=[front(0,True),front(1,True)]
    return out
def bat2(body,wing,eye='#ff4a4a',size=1.0):
    b=C(body);w=C(wing);out={}
    def fr(f):
        W,H=22,16;im=new(W,H);g=ImageDraw.Draw(im);ya=0 if f==0 else 4;cx=11
        poly(g,[(cx-2,6),(0,1+ya),(3,5+ya//2),(5,3+ya),(7,8),(cx-2,9)],dk(w,.1));poly(g,[(cx+2,6),(W-1,1+ya),(W-4,5+ya//2),(W-6,3+ya),(W-8,8),(cx+2,9)],w)
        ell(g,[cx-3,3,cx+3,11],b);ell(g,[cx-2,4,cx+1,8],lt(b,.18))
        poly(g,[(cx-3,4),(cx-3,0),(cx-1,3)],b);poly(g,[(cx+1,3),(cx+3,0),(cx+3,4)],b)
        pt(g,(cx-2,6),C(eye));pt(g,(cx+1,6),C(eye));pt(g,(cx-1,9),'#f0f0f0');pt(g,(cx+1,9),'#f0f0f0')
        return finish(im,dk(b,.7))
    def back(f):
        W,H=22,16;im=new(W,H);g=ImageDraw.Draw(im);ya=0 if f==0 else 4;cx=11
        poly(g,[(cx-2,6),(0,1+ya),(3,5+ya//2),(5,3+ya),(7,8),(cx-2,9)],dk(w,.1));poly(g,[(cx+2,6),(W-1,1+ya),(W-4,5+ya//2),(W-6,3+ya),(W-8,8),(cx+2,9)],dk(w,.1))
        ell(g,[cx-3,3,cx+3,11],dk(b,.12));poly(g,[(cx-3,4),(cx-3,0),(cx-1,3)],dk(b,.12));poly(g,[(cx+1,3),(cx+3,0),(cx+3,4)],dk(b,.12));pt(g,(cx,11),dk(b,.3));pt(g,(cx,12),dk(b,.3))
        return finish(im,dk(b,.7))
    def side(f):
        W,H=22,16;im=new(W,H);g=ImageDraw.Draw(im);ya=-3 if f==0 else 3;cx=10
        poly(g,[(cx-3,7),(cx-10,6+ya),(cx-5,8+ya//2),(cx-8,10+ya//2),(cx-1,9)],dk(w,.2))
        ell(g,[cx-4,5,cx+4,11],b);ell(g,[cx-3,6,cx+1,9],lt(b,.18));ell(g,[cx+1,3,cx+7,9],b);poly(g,[(cx+6,5),(cx+9,7),(cx+6,8)],dk(b,.15));poly(g,[(cx+2,4),(cx+1,0),(cx+4,3)],b)
        pt(g,(cx+5,5),C(eye));pt(g,(cx-5,9),dk(b,.2));pt(g,(cx-6,10),dk(b,.2))
        poly(g,[(cx-1,7),(cx-4,3+ya),(cx-8,5+ya),(cx-6,8),(cx+1,9)],w)
        return finish(im,dk(b,.7))
    out['down']=[fr(0),fr(1)];out['up']=[back(0),back(1)];r=[side(0),side(1)];out['right']=r;out['left']=[flipx(i) for i in r]
    return out
