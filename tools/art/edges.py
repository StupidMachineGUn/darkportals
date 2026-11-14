import random
from lib import *
from terrain import BIOMES,LIQ
GROUND=['meadow','forest','snow','tundra','ashland','corrupt','jungle','swamp','desert','canyon','beach','dirt','mud','mountain','icecave','obsidian']
WATER=['shallow_water','ice_water','swamp_water']
KEYS=['N0','N1','E0','E1','S0','S1','W0','W1','NE','SE','SW','NW']
def _depth(rr,L=16):
    v=[];d=rr.uniform(3.2,5.2)
    for i in range(L):
        d+=rr.uniform(-1.1,1.1);d=max(2.2,min(6.2,d));v.append(int(round(d)))
    return v
def _make(src,rim,key,rr,blades):
    S=16;im=new(S,S);sp=src.load();op=im.load()
    inside=lambda x,y:False
    if key[0] in 'NESW' and len(key)==2:
        dp=_depth(rr)
        def dist(x,y):
            return {'N':y,'S':S-1-y,'W':x,'E':S-1-x}[key[0]],{'N':x,'S':x,'W':y,'E':y}[key[0]]
        for y in range(S):
            for x in range(S):
                d,i=dist(x,y)
                if d<dp[i]:op[x,y]=sp[x,y]
                elif d==dp[i]:
                    if rim=='w':op[x,y]=(236,248,255,170)
                    else:op[x,y]=(0,0,0,72)
                    if blades and rr.random()<.3:op[x,y]=lt(sp[x,y][:3]+(255,),.3)
                elif d==dp[i]+1 and rim=='g' and rr.random()<.5:op[x,y]=(0,0,0,34)
        # lighter top highlight line only for ground
        if rim=='g':
            for y in range(S):
                for x in range(S):
                    d,i=dist(x,y)
                    if d==dp[i]-1 and op[x,y][3]==255 and rr.random()<.5:op[x,y]=lt(op[x,y][:3]+(255,),.18)
    else:
        r=rr.uniform(4.2,5.6);cx={'N':0,'S':0}.get(key[0],0)
        ox=0 if key[1]=='W' else S-1;oy=0 if key[0]=='N' else S-1
        for y in range(S):
            for x in range(S):
                dd=math.hypot(x-ox,y-oy)+rr.uniform(-.5,.5)
                if dd<r:op[x,y]=sp[x,y]
                elif dd<r+1.1:op[x,y]=(236,248,255,170) if rim=='w' else (0,0,0,72)
    return im
def build():
    out={}
    mats={m:BIOMES[m][0] for m in GROUND};mats.update({m:LIQ[m][0] for m in WATER})
    for m,src in mats.items():
        rr=random.Random(hash(m)%9973)
        for rim in ('g','w'):
            if m in WATER and rim=='g':continue
            for k in KEYS:out[f'{m}:{rim}:{k}']=_make(src,rim,k,rr,m in GROUND and m not in('dirt','mud','mountain','icecave','obsidian','desert','canyon','beach'))
    return out
if __name__=='__main__':
    o=build();names=list(o)
    # demo: dirt ground with meadow N edge etc.
    S=Image.new('RGBA',(16*12,16*4),(0,0,0,255))
    bg=BIOMES['dirt'][0]
    for r,(m,rim,base) in enumerate([('meadow','g',BIOMES['dirt'][0]),('meadow','w',LIQ['deep_water'][0]),('beach','w',LIQ['shallow_water'][0]),('shallow_water','w',LIQ['deep_water'][0])]):
        for c,k in enumerate(KEYS):
            t=base.copy();t.alpha_composite(o[f'{m}:{rim}:{k}']);S.paste(t,(c*16,r*16))
    S.resize((S.width*4,S.height*4),Image.NEAREST).save('/tmp/edges.png');print(len(o))
