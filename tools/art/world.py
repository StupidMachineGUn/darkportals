import random,math
from lib import *
from terrain import BIOMES,LIQ
from props import P
from catalog import M
from chars import sprites as hs
R=random.Random(11)
W,H=160,96;T=16
seeds={'snow':(14,12),'tundra':(40,10),'mountain':(66,12),'ashland':(100,14),'obsidian':(130,12),'icecave':(24,34),
 'forest':(46,38),'meadow':(80,46),'dirt':(104,36),'canyon':(136,38),'desert':(140,64),'jungle':(20,60),'swamp':(48,66),
 'corrupt':(80,74),'graveyard':(108,72),'crystal':(62,52),'beach':(30,88),'cobble':(80,46)}
# noise warp
def vn(sx,sy,sc,seed):
    r=random.Random(seed);g=[[r.random() for _ in range(sx//sc+3)] for _ in range(sy//sc+3)];o=[[0]*sx for _ in range(sy)]
    for y in range(sy):
        for x in range(sx):
            gx,gy=x/sc,y/sc;x0,y0=int(gx),int(gy);fx,fy=gx-x0,gy-y0;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy)
            a=g[y0][x0]*(1-fx)+g[y0][x0+1]*fx;b=g[y0+1][x0]*(1-fx)+g[y0+1][x0+1]*fx;o[y][x]=a*(1-fy)+b*fy
    return o
wx=vn(W,H,8,1);wy=vn(W,H,8,2);lake=vn(W,H,6,3)
names=[k for k in seeds if k!='cobble']
biome=[[None]*W for _ in range(H)]
for y in range(H):
    for x in range(W):
        px=x+(wx[y][x]-.5)*14;py=y+(wy[y][x]-.5)*14
        best=min(names,key=lambda k:(seeds[k][0]-px)**2+(seeds[k][1]-py)**2)
        biome[y][x]=best
# town area plaza
tx0,ty0,tx1,ty1=70,38,92,54
liq=[[None]*W for _ in range(H)]
for y in range(H):
    for x in range(W):
        b=biome[y][x];l=lake[y][x]
        if y>=H-8:liq[y][x]='deep_water' if y>=H-5 else 'shallow_water';biome[y][x]='beach' if y<H-5 else biome[y][x]
        elif b=='ashland' and l>.66:liq[y][x]='lava'
        elif b=='obsidian' and l>.62:liq[y][x]='lava'
        elif b in('snow','tundra') and l>.7:liq[y][x]='ice_water'
        elif b=='swamp' and l>.58:liq[y][x]='swamp_water'
        elif b in('meadow','forest','jungle') and l>.72:liq[y][x]='shallow_water' if l<.78 else 'deep_water'
        elif b=='corrupt' and l>.75:liq[y][x]='poison'
        elif b=='dirt' and l>.8:liq[y][x]='tar'
        elif b=='beach' and l>.78:liq[y][x]='shallow_water'
for y in range(ty0,ty1):
    for x in range(tx0,tx1):biome[y][x]='plaza' if (tx0+4<x<tx1-4 and ty0+4<y<ty1-4) else 'cobble';liq[y][x]=None
def render(frame=0):
    im=Image.new('RGBA',(W*T,H*T))
    for y in range(H):
        for x in range(W):
            b=biome[y][x]
            if x>0 and R.random()<.0:pass
            tl=BIOMES[b][ (x*7+y*13)%4 ] if random.Random(x*997+y).random()<.3 else BIOMES[b][0]
            if liq[y][x]:tl=LIQ[liq[y][x]][frame%4]
            im.paste(tl,(x*T,y*T))
    # boundary dither
    for y in range(1,H-1):
        for x in range(1,W-1):
            if liq[y][x]:continue
            for dx,dy in((1,0),(0,1)):
                n=biome[y+dy][x+dx]
                if n!=biome[y][x] and not liq[y+dy][x+dx] and random.Random(x*31+y*17).random()<.5:im.paste(BIOMES[n][0],(x*T,y*T))
    return im
TREES={'snow':['snow_pine']*5+['rock_snow','snow_bush'],'tundra':['snow_pine','dead_pine','rock_snow','snow_bush'],'mountain':['rock','rock','pine','dead_pine'],
 'ashland':['lava_rock','lava_rock','dead_tree','lava_vent'],'obsidian':['obsidian','obsidian','lava_rock','lava_vent'],'icecave':['ice_spike','ice_spike','rock_snow'],
 'forest':['oak','oak_dark','oak','pine','birch','bush','berry_bush','stump','flowers'],'meadow':['oak','birch','bush','flowers','flowers','cherry','berry_bush'],'dirt':['rock','dead_tree','bush','stump'],
 'canyon':['rock_sand','rock_sand','cactus','dead_tree'],'desert':['cactus','cactus','palm','rock_sand','skull_bones'],'jungle':['palm','oak_dark','giant_mushroom','berry_bush','bush','palm'],
 'swamp':['swamp_tree','swamp_tree','giant_mushroom','reeds','reeds','dead_tree','bush'],'corrupt':['dead_tree','thorn_bush','crystal_purple','obsidian','skull_bones'],
 'graveyard':['tombstone','tombstone_mossy','tombstone','dead_tree','skull_bones','statue'],'crystal':['crystal_pink','crystal_blue','crystal_purple','crystal_blue'],'beach':['palm','rock_sand','flowers']}
def populate(im):
    items=[]
    for y in range(2,H-2):
        for x in range(2,W-2):
            b=biome[y][x]
            if liq[y][x] or b in('plaza','cobble') or b not in TREES:continue
            r=random.Random(x*131+y*7)
            dens=.13 if b in('forest','jungle','snow','swamp') else .06
            if r.random()<dens:items.append((y,P[r.choice(TREES[b])][0],x*T+r.randint(-4,4),y*T+T))
    # town
    town=[('castle',72,44),('cottage_red',75,40),('cottage_blue',87,40),('shop',74,50),('inn',86,50),('smithy',90,44),('bank',70,40),('well',80,48),('fountain',81,45),('stall_red',77,52),('stall_blue',84,52),('windmill',92,50),('lamp',78,47),('lamp',84,47),('barrel',79,52),('crate',83,52),('anvil',88,47),('statue',80,42),('house_big',92,41),('cottage_green',72,52)]
    for n,x,y in town:items.append((y,P[n][0],x*T,y*T+T))
    for n,x,y in [('igloo',12,12),('igloo',16,15),('ice_tower',44,12),('wizard_tower',30,36),('obsidian_tower',132,14),('stilt_hut',46,68),('stilt_hut',50,70),('adobe',140,62),('adobe',144,66),('tent_camp',138,40),('campfire',140,42),('ruins',100,36),('portal_red',100,18),('portal_purple',82,76),('portal_blue',62,54),('cottage_thatch',46,36),('cottage_thatch',42,40),('stall_red',30,86)]:items.append((y,P[n][0],x*T,y*T+T))
    for y,spr,x,yy in sorted(items,key=lambda t:t[3]):
        # ground shadow
        sh=Image.new('RGBA',(spr.width,6),(0,0,0,0));ImageDraw.Draw(sh).ellipse([2,0,spr.width-3,5],fill=(0,0,0,60));im.alpha_composite(sh,(max(0,x-spr.width//2),yy-5))
        im.alpha_composite(spr,(max(0,min(im.width-spr.width,x-spr.width//2)),max(0,yy-spr.height)))
def mobs_players(im):
    by={}
    for n,(s,tags) in M.items():
        for t in tags:by.setdefault(t,[]).append(n)
    for b in set(sum([list(v[1]) for v in M.values()],[])):
        if b not in seeds:continue
        sx,sy=seeds[b]
        for i in range(5):
            if not by.get(b):continue
            n=R.choice(by[b]);fr=M[n][0][R.choice(['down','right','left','up'])][R.randint(0,1)]
            x=(sx+R.randint(-8,8))*T;y=(sy+R.randint(-6,6))*T
            if liq[y//T][x//T]:continue
            im.alpha_composite(fr,(x-fr.width//2,y-fr.height))
    # players around town
    cfg=[dict(armor='iron',weapon='steel'),dict(armor='mithril',weapon='mithril'),dict(armor='dragon',weapon='fire',cape='#c03030'),dict(armor='leather',weapon='bow'),dict(armor='cloth',weapon='frost',hair='#e8c14a'),dict(armor='bronze',weapon='axe',skin='#8a5a3a')]
    for i,c in enumerate(cfg):
        sp=hs(**c);d=['d','r','l','u'][i%4];fr=sp[d][i%4];im.alpha_composite(fr,(76*T+i*20,46*T))
if __name__=='__main__':
    im=render();populate(im);mobs_players(im);im.save('/tmp/ap_world.png');print(im.size)
    im.resize((im.width//2,im.height//2),Image.NEAREST).save('/tmp/ap_world_small.png')
