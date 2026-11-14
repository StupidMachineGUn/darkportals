import json,os,zipfile,shutil
from lib import *
from terrain import BIOMES,LIQ,EDGES
from chars import sprites as hs,ARMOR,WEAP,SKINS
from catalog import M
from items import I
from props import P
import world
O='/home/claude/artbundle';shutil.rmtree(O,ignore_errors=True)
for d in('terrain','characters','mobs','items','props','previews'):os.makedirs(f'{O}/{d}')
atlas={'name':'Art Bundle Pack','version':'1.0','tile':16,'directions':['down','up','right','left'],'frames':{}}
def save(im,path):im.save(f'{O}/{path}')
# terrain
tiles=[];names=[]
for b,v in BIOMES.items():
    for i,t in enumerate(v):tiles.append(t);names.append(f'{b}_{i}')
save(sheet(tiles,8,pad=0,cell=(16,16),bg=(0,0,0,0)),'terrain/biomes.png');atlas['terrain']={'sheet':'terrain/biomes.png','cols':8,'tiles':names}
lq=[];ln=[]
for k,v in LIQ.items():
    for i,t in enumerate(v):lq.append(t);ln.append(f'{k}_{i}')
save(sheet(lq,4,pad=0,cell=(16,16),bg=(0,0,0,0)),'terrain/liquids.png')
atlas['liquids']={'sheet':'terrain/liquids.png','cols':4,'frames_per_liquid':4,'names':list(LIQ)}
ed=[];en=[]
for k,v in EDGES.items():
    items=v.items() if isinstance(v,dict) else enumerate(v)
    for n,t in items:ed.append(t);en.append(f'{k}_{n}')
save(sheet(ed,8,pad=0,cell=(16,16),bg=(0,0,0,0)),'terrain/edges.png');atlas['edges']={'sheet':'terrain/edges.png','cols':8,'names':en}
# characters: each combo -> strip 4 dirs x 4 frames (20x26)
chars=[];cn=[]
combos=[('cloth','none'),('leather','dagger'),('bronze','sword'),('iron','axe'),('steel','steel'),('mithril','mithril'),('dragon','fire'),('leather','bow'),('cloth','staff'),('cloth','frost'),('cloth','venom')]
for a,w in combos:
    sp=hs(armor=a,weapon=w)
    for d in('d','u','r','l'):
        for f in range(4):chars.append(sp[d][f])
    cn.append(f'{a}_{w}')
save(sheet(chars,16,pad=0,cell=(24,28),bg=(0,0,0,0)),'characters/players.png');atlas['characters']={'sheet':'characters/players.png','cell':[24,28],'cols':16,'row_per':'armor_weapon','order':'down,up,right,left x 4 frames','sets':cn,'skins':SKINS,'armor_tiers':list(ARMOR),'weapons':list(WEAP)}
# mobs
mn=list(M);rows=[]
for n in mn:
    s=M[n][0]
    for d in('down','up','right','left'):rows+= s[d][:2]
save(sheet(rows,8,pad=0,cell=(56,56),bg=(0,0,0,0)),'mobs/mobs.png');atlas['mobs']={'sheet':'mobs/mobs.png','cell':[56,56],'cols':8,'order':'down,up,right,left x 2 frames (4 mobs per row-pair)','names':mn,'biomes':{n:list(M[n][1]) for n in mn}}
# items
iN=list(I);save(sheet([I[n][0] for n in iN],14,pad=0,cell=(18,18),bg=(0,0,0,0)),'items/items.png');atlas['items']={'sheet':'items/items.png','cell':[18,18],'cols':14,'names':iN,'category':{n:I[n][1] for n in iN}}
# props
pN=list(P);save(sheet([P[n][0] for n in pN],9,pad=0,cell=(68,56),bg=(0,0,0,0)),'props/props.png');atlas['props']={'sheet':'props/props.png','cell':[68,56],'cols':9,'names':pN,'category':{n:P[n][1] for n in pN}}
json.dump(atlas,open(f'{O}/atlas.json','w'),indent=1)
# world + previews
im=world.render();world.populate(im);world.mobs_players(im);save(im,'previews/world_160x96.png')
def crop(name,x,y,w,h,s=3):im.crop((x*16,y*16,(x+w)*16,(y+h)*16)).resize((w*16*s,h*16*s),Image.NEAREST).save(f'{O}/previews/{name}.png')
crop('town',66,36,32,22);crop('lava',96,0,40,22,2);crop('snow',0,0,40,26,2);crop('swamp_jungle',10,52,48,26,2);crop('graveyard_desert',100,56,56,30,2)
# frames: liquid animation gif
fr=[]
for f in range(4):
    a=world.render(f);a=a.crop((96*16,0,136*16,22*16));fr.append(a.convert('P'))
fr[0].save(f'{O}/previews/lava_anim.gif',save_all=True,append_images=fr[1:],duration=220,loop=0)
# lineup sheets
def lab(path,items,cols,cell,s,names):
    S=sheet(items,cols,pad=0,cell=cell).resize((cols*cell[0]*s,((len(items)+cols-1)//cols)*cell[1]*s),Image.NEAREST);from PIL import ImageDraw as D;d=D.Draw(S)
    for i,n in enumerate(names):d.text(((i%cols)*cell[0]*s+2,(i//cols)*cell[1]*s+cell[1]*s-10),n[:12],fill=(235,232,220,255))
    S.save(path)
lab(f'{O}/previews/mobs.png',[M[n][0]['down'][0] for n in mn],10,(44,44),3,mn)
lab(f'{O}/previews/items.png',[I[n][0] for n in iN],14,(22,22),4,[])
open(f'{O}/README.txt','w').write("""ART BUNDLE PACK v1.0
Original pixel art generated procedurally (no third-party assets copied). 16px tiles, 4 directions (left = flipped right).
terrain/  24 biomes x4 variants, 7 animated liquids (4f), autotile edge overlays
characters/ 11 armor/weapon sets x 4 dirs x 4 frames (20x26) - recolorable skins/hair
mobs/     %d mobs x 4 dirs x 2 frames
items/    %d icons (weapons, armor x7 tiers, potions, food, ores, gems, bars, logs, tools, materials)
props/    %d trees, rocks, plants, buildings, decor
atlas.json describes every sheet. previews/ has examples.
"""%(len(mn),len(iN),len(pN)))
z=zipfile.ZipFile('/home/claude/art_bundle_pack.zip','w',zipfile.ZIP_DEFLATED)
for r,_,fs in os.walk(O):
    for f in fs:p=os.path.join(r,f);z.write(p,os.path.relpath(p,O))
z.close();print(len(mn),len(iN),len(pN),os.path.getsize('/home/claude/art_bundle_pack.zip'))
