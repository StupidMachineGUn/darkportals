from lib import *
R=random.Random(21)
def noise_tile(base,alts,weights=(.18,.1,.05),size=16,speck=None):
    im=Image.new('RGBA',(size,size),C(base));p=im.load()
    for y in range(size):
        for x in range(size):
            n=R.random();t=0
            for c,w in zip(alts,weights):
                t+=w
                if n<t:p[x,y]=C(c);break
    return im
def tufts(im,c1,c2,n):
    p=im.load();w,h=im.size
    for _ in range(n):
        x,y=R.randrange(1,w-2),R.randrange(2,h-1);p[x,y]=C(c1);p[x,y-1]=C(c2);p[x+1,y-1]=C(c2)
def flowers(im,cols):
    p=im.load();x,y=R.randrange(3,12),R.randrange(3,12);c=R.choice(cols)
    for dx,dy in((0,0),(1,0),(-1,0),(0,1),(0,-1)):p[x+dx,y+dy]=C(c)
    p[x,y]=C('#ffd23f')
BIOMES={}
def grassy(name,pal,tuft,extra=None):
    out=[]
    for v in range(4):
        im=noise_tile(pal[0],pal[1:4]);tufts(im,pal[2],pal[3],2+v)
        if extra=='flowers' and v==2:flowers(im,['#fff','#ff7aa8','#9ad0ff'])
        if extra=='snowdrift' and v==3:
            p=im.load()
            for _ in range(10):x,y=R.randrange(2,14),R.randrange(2,14);p[x,y]=C('#ffffff');p[x+1,y]=C('#e8f1ff')
        out.append(im)
    return out
BIOMES['meadow']=grassy('meadow',['#6fae3e','#5f9c36','#4f8a30','#82c04a'],None,'flowers')
BIOMES['forest']=grassy('forest',['#3f7a34','#356b2c','#2c5c26','#4f8c3e'],None)
BIOMES['jungle']=grassy('jungle',['#2f7a3a','#236a2f','#1a5a26','#45a050'],None)
BIOMES['swamp']=grassy('swamp',['#4a5a30','#40502a','#344422','#5c6e38'],None)
BIOMES['snow']=grassy('snow',['#eef4fb','#dde8f4','#c9d9ea','#ffffff'],None,'snowdrift')
BIOMES['tundra']=grassy('tundra',['#9fb0a0','#8ea090','#7c8e80','#b4c4b4'],None)
BIOMES['ashland']=grassy('ashland',['#3a3436','#322c2e','#2a2426','#4a4244'],None)
BIOMES['corrupt']=grassy('corrupt',['#4a3a5a','#3f3050','#352846','#5a4870'],None)
def plain(name,pal,det=None):
    out=[]
    for v in range(4):
        im=noise_tile(pal[0],pal[1:4],(.2,.12,.05))
        if det=='dune':
            p=im.load();y=R.randrange(3,13)
            for x in range(16):
                if R.random()<.8:p[x,(y+int(2*math.sin(x/2.5+v)))%16]=C(pal[3])
        if det=='cracks':
            p=im.load();x,y=R.randrange(2,13),R.randrange(2,13)
            for _ in range(7):p[x,y]=C(pal[2]);x+=R.choice([-1,0,1,1]);y+=R.choice([0,1]);x%=16;y%=16
        out.append(im)
    return out
BIOMES['desert']=plain('desert',['#e2c47e','#d6b46c','#c9a55e','#f0d898'],'dune')
BIOMES['canyon']=plain('canyon',['#b5603a','#a65432','#8f4528','#c8724a'],'cracks')
BIOMES['dirt']=plain('dirt',['#b98c55','#a97c48','#8f673a','#c99d63'])
BIOMES['mud']=plain('mud',['#6a4c32','#5c4029','#4c3422','#7a5a3e'])
BIOMES['beach']=plain('beach',['#efd9a0','#e2cb8e','#d4bc80','#f8e9c0'],'dune')
BIOMES['obsidian']=plain('obsidian',['#2a2433','#231d2c','#1a1522','#3b3348'],'cracks')
def bricks(name,c0,c1,c2,hi,mortar,offsetrows=True,tile=8):
    out=[]
    for v in range(4):
        im=Image.new('RGBA',(16,16),C(mortar));d=ImageDraw.Draw(im)
        for r,y in enumerate(range(0,16,tile)):
            off=tile//2 if (r+v)%2 else 0
            for x in range(-off,16,tile):
                rect(d,[x+1,y+1,x+tile-1,y+tile-1],R.choice([c0,c1,c2]));line(d,[x+1,y+1,x+tile-2,y+1],hi)
        out.append(im)
    return out
BIOMES['cobble']=bricks('cobble','#a6a6b2','#9a9aa6','#8e8e9c','#bdbdc9','#6b6b7a')
BIOMES['dungeon']=bricks('dungeon','#4a4658','#423e50','#3a3648','#5c5870','#24202e')
BIOMES['castle']=bricks('castle','#7a7a86','#70707c','#666672','#9a9aa8','#4a4a54',tile=8)
BIOMES['plaza']=bricks('plaza','#c8b88a','#bcac7e','#b0a074','#ddd0a8','#8e8058')
BIOMES['planks']=[]
for v in range(4):
    im=Image.new('RGBA',(16,16),hx('#8a5a2b'));d=ImageDraw.Draw(im)
    for y in range(0,16,4):rect(d,[0,y,15,y+2],R.choice(['#9a6a33','#8a5a2b','#a0703a']));line(d,[0,y+3,15,y+3],'#5a3a1e')
    for _ in range(3):pt(d,(R.randrange(16),R.randrange(16)),'#6b4220')
    BIOMES['planks'].append(im)
def rocky(name,pal):
    out=[]
    for v in range(4):
        im=noise_tile(pal[0],pal[1:4],(.2,.12,.05));d=ImageDraw.Draw(im)
        for _ in range(2):
            x,y=R.randrange(2,12),R.randrange(2,12);ell(d,[x,y,x+R.randrange(3,6),y+R.randrange(2,4)],pal[2]);line(d,[x+1,y,x+2,y],pal[3])
        out.append(im)
    return out
BIOMES['mountain']=rocky('mountain',['#8a8a8e','#7e7e84','#6e6e76','#a2a2a8'])
BIOMES['cave']=rocky('cave',['#5a4a44','#4e403a','#42352f','#6e5c54'])
BIOMES['icecave']=rocky('icecave',['#8ab8d8','#7aa8c8','#6a98b8','#b0d8f0'])
def crystal():
    out=[]
    for v in range(4):
        im=noise_tile('#3a2c5a',['#322650','#2a1f45','#4a3a72'],(.2,.1,.06))
        d=ImageDraw.Draw(im)
        for _ in range(2):
            x,y=R.randrange(2,13),R.randrange(5,14);poly(d,[(x,y),(x+1,y-4),(x+2,y)],R.choice(['#b06aff','#6ad0ff','#ff6ad0']));pt(d,(x+1,y-3),'#ffffff')
        out.append(im)
    return out
BIOMES['crystal']=crystal()
def graveyard():
    out=[]
    for v in range(4):
        im=noise_tile('#4a5a40',['#3e4e36','#34442e','#586a4c'],(.18,.1,.05));tufts(im,'#34442e','#586a4c',2);out.append(im)
    return out
BIOMES['graveyard']=graveyard()
# ---- animated liquids ----
def liquid(base,mid,hi,deep,n=4,shore=None):
    frames=[]
    for f in range(n):
        im=Image.new('RGBA',(16,16),C(base));d=ImageDraw.Draw(im);p=im.load()
        for y in range(16):
            for x in range(16):
                w=math.sin((x+f*4)/2.4+y/3.1)+math.cos((y+f*2)/2.2-x/4)
                if w>1.25:p[x,y]=C(hi)
                elif w>.7:p[x,y]=C(mid)
                elif w<-1.4:p[x,y]=C(deep)
        frames.append(im)
    return frames
LIQ={'deep_water':liquid('#2c62a8','#3a74bc','#7cb6ee','#224d8c'),'shallow_water':liquid('#4a92d0','#5aa4de','#a8d8f6','#3a82c0'),
 'swamp_water':liquid('#3a5a3a','#456a44','#7a9a58','#2f4a30'),'lava':liquid('#e8541c','#ff7a22','#ffd24a','#b8341a'),'ice_water':liquid('#9fd0e8','#b4e0f4','#eefaff','#7ab8d8'),
 'poison':liquid('#5aaa2a','#72c438','#c4f070','#468a22'),'tar':liquid('#2a2430','#352e3c','#5a4e68','#1c1822')}
# ---- autotile edge overlays (outer corners + sides) so biome A blends into B ----
def edge_overlay(tile,size=16):
    # returns dict of 8 overlays: N,E,S,W,NE,SE,SW,NW painted on transparent, showing tile with ragged border
    ov={}
    def mask(fn):
        m=Image.new('L',(size,size),0);p=m.load()
        for y in range(size):
            for x in range(size):
                if fn(x,y):p[x,y]=255
        return m
    jag=lambda x,y:R.random()
    rr=random.Random(5);j=[[rr.random() for _ in range(size)] for _ in range(size)]
    def depth(x,y,d):return d+int(j[y][x]*3)-1
    fn={'N':lambda x,y:y<depth(x,y,5),'S':lambda x,y:y>=size-depth(x,y,5),'W':lambda x,y:x<depth(x,y,5),'E':lambda x,y:x>=size-depth(x,y,5)}
    ov={}
    for k,f in fn.items():
        im=new(size,size);im.paste(tile,(0,0),mask(f));ov[k]=im
    for k,(a,b) in {'NW':('N','W'),'NE':('N','E'),'SW':('S','W'),'SE':('S','E')}.items():
        im=new(size,size);m=mask(lambda x,y:(fn[a](x,y) and fn[b](x,y)) or (x**2+y**2<64 if k=='NW' else (size-1-x)**2+y**2<64 if k=='NE' else x**2+(size-1-y)**2<64 if k=='SW' else (size-1-x)**2+(size-1-y)**2<64))
        im.paste(tile,(0,0),m);ov[k]=im
    return ov
EDGES={k:edge_overlay(BIOMES[k][0]) for k in ['meadow','forest','snow','desert','dirt','mud','mountain','ashland','beach','swamp','corrupt','tundra','canyon','jungle']}
if __name__=='__main__':
    names=list(BIOMES)
    rows=[sheet(BIOMES[n],4,pad=0) for n in names]
    S=Image.new('RGBA',(64*4+8*3,16*len(names)//2*1+10),(30,28,40,255))
    big=Image.new('RGBA',(64*4+30,(16+3)*((len(names)+3)//4)*1+8),(30,28,40,255))
    for i,n in enumerate(names):
        big.alpha_composite(sheet(BIOMES[n],4,pad=0),((i%4)*(64+6)+2,(i//4)*19+2))
    big.resize((big.width*3,big.height*3),Image.NEAREST).save('/tmp/ap_terrain.png')
    lq=Image.new('RGBA',(7*(16*4+6),20),(30,28,40,255))
    for i,(n,fr) in enumerate(LIQ.items()):lq.alpha_composite(sheet(fr,4,pad=0),(i*70,2))
    lq.resize((lq.width*2,lq.height*2),Image.NEAREST).save('/tmp/ap_liquid.png')
    print(len(names))
