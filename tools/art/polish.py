import random
from lib import *
from terrain import BIOMES
def _p(im,x,y,c):
    if 0<=x<16 and 0<=y<16:im.putpixel((x,y),C(c))
def polish():
    for b,vs in BIOMES.items():
        for i,im in enumerate(vs):
            R=random.Random(hash(b)%1000+i*17);g=ImageDraw.Draw(im);base=im.getpixel((8,8))[:3]
            if b in('meadow','forest','jungle','graveyard','swamp'):
                n={'meadow':5,'forest':6,'jungle':8,'graveyard':3,'swamp':4}[b]
                for _ in range(n):
                    x=R.randint(1,14);y=R.randint(3,14);c1=lt(base,.28);c2=dk(base,.25)
                    _p(im,x,y,c2);_p(im,x,y-1,c1);_p(im,x-1,y-1,c1) if R.random()<.5 else _p(im,x+1,y-2,c1);_p(im,x,y-2,c1)
                if b=='meadow' and i%2==1:
                    x,y=R.randint(2,13),R.randint(2,13);col=R.choice(['#ffffff','#ffd23f','#ff8aa8']);_p(im,x,y,col);_p(im,x+1,y,col);_p(im,x,y+1,'#ffd23f' if col=='#ffffff' else '#ffffff')
                if b in('swamp','jungle') and i==2:
                    x,y=R.randint(2,12),R.randint(2,12);g.rectangle([x,y,x+2,y+1],fill=C(dk(base,.35)))
            elif b in('snow','tundra','icecave'):
                for _ in range(6):_p(im,R.randint(0,15),R.randint(0,15),'#ffffff' if b!='icecave' else '#e8f8ff')
                for _ in range(3):x,y=R.randint(1,13),R.randint(1,13);_p(im,x,y,dk(base,.12));_p(im,x+1,y,dk(base,.12))
            elif b in('desert','beach','canyon'):
                for _ in range(3):
                    y=R.randint(2,13);x=R.randint(0,9);L=R.randint(4,6)
                    for k in range(L):_p(im,x+k,y+(k%3==1),dk(base,.14))
                    for k in range(L-1):_p(im,x+k+1,y-1+(k%3==1),lt(base,.16))
            elif b in('dirt','mud','ashland','mountain','cave','obsidian','corrupt'):
                for _ in range(2):
                    x,y=R.randint(2,12),R.randint(2,12);g.rectangle([x,y,x+2,y+1],fill=C(lt(base,.2)));g.rectangle([x,y+2,x+2,y+2],fill=C(dk(base,.3)))
                if b=='ashland' and i==1:
                    for _ in range(3):_p(im,R.randint(1,14),R.randint(1,14),'#ff7a2a')
                if b=='corrupt':
                    for _ in range(2):_p(im,R.randint(1,14),R.randint(1,14),'#b06aff')
