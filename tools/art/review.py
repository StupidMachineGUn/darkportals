from lib import *
from PIL import ImageDraw
import polish;polish.polish()
from terrain import BIOMES
from catalog import M
from props import P
O='/home/claude/artreview2/'
import os;os.makedirs(O,exist_ok=True)
def lab(path,items,names,cols,cell,s):
    S=sheet(items,cols,pad=0,cell=cell,bg=(46,52,48,255)).resize((cols*cell[0]*s,((len(items)+cols-1)//cols)*cell[1]*s),Image.NEAREST);d=ImageDraw.Draw(S)
    for i,n in enumerate(names):d.text(((i%cols)*cell[0]*s+3,(i//cols)*cell[1]*s+2),n[:14],fill=(255,235,150,255))
    S.save(path)
names=list(M)
it=[];nn=[]
for n in['sheep','chicken','rooster','cow','pig','rabbit','deer','fox','wolf','bear','boar','camel']:
    for d in('down','up','right','left'):
        for f in(0,1):it.append(M[n][0][d][f]);nn.append(n if (d,f)==('down',0) else '')
lab(O+'A_animals_new.png',it,nn,8,(46,40),4)
for part,(a,b) in enumerate([(0,28),(28,56),(56,len(names))]):
    it=[];nn=[]
    for n in names[a:b]:
        for d in('down','up','right','left'):it.append(M[n][0][d][0]);nn.append(n if d=='down' else '')
    lab(O+f'B_mobs_{part+1}.png',it,nn,12,(46,40),3)
t=[];tn=[]
for b,v in BIOMES.items():
    for i,x in enumerate(v):t.append(x.resize((32,32),Image.NEAREST));tn.append(b if i==0 else '')
lab(O+'C_terrain.png',t,tn,8,(32,32),3)
pn=list(P);lab(O+'D_props.png',[P[n][0] for n in pn],pn,6,(70,60),3)
