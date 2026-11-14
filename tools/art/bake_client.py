import json,base64,io,sys
from lib import *
from terrain import BIOMES,LIQ
from chars import sprites,ARMOR
from catalog import M
from items import I
import props2
from props2 import P
import polish;polish.polish()
import edges
def b64(im):
    b=io.BytesIO();im.save(b,'PNG',optimize=True);return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode(),len(b.getvalue())
def place(S,im,cx,cy,cw,ch):S.alpha_composite(im,(cx*cw+(cw-im.width)//2,cy*ch+ch-im.height))
out={};sizes={}
# tiles
tn=[];ti=[]
for b,v in BIOMES.items():
    for i,t in enumerate(v):tn.append(f'{b}:{i}');ti.append(t)
for k,v in LIQ.items():
    for i,t in enumerate(v):tn.append(f'{k}:{i}');ti.append(t)
S=sheet(ti,16,pad=0,cell=(16,16),bg=(0,0,0,0));out['tiles']={'img':S,'names':tn,'cols':16}
# characters
WE=['none','dagger','sword','steel','mithril','axe','bow','staff','fire','frost','venom']
rows=[];rn=[]
for a in ARMOR:
    for w in WE:rows.append(dict(armor=a,weapon=w));rn.append(f'A:{a}:{w}')
NPC={'red':'#c0392b','blue':'#3a5fb0','green':'#3f8a3f','purple':'#7a3ab0','orange':'#d9822b','yellow':'#d8c040','brown':'#7a5a3a','gray':'#7a7a86','teal':'#2a9a9a','pink':'#d870a8','white':'#e8e4dc','black':'#2a2a32','maroon':'#6a1a2a','navy':'#1a2a5a','olive':'#6a6a2a','tan':'#c8a878'}
for nm,c in NPC.items():
    for w in('none','dagger','axe'):rows.append(dict(tunic=c,weapon=w));rn.append(f'N:{c}:{w}')
CW,CH=22,28;S=Image.new('RGBA',(CW*16,CH*len(rows)),(0,0,0,0))
for r,kw in enumerate(rows):
    sp=sprites(**kw);c=0
    for d in('d','u','r','l'):
        for f in range(4):place(S,sp[d][f],c,r,CW,CH);c+=1
out['chars']={'img':S,'names':rn,'cell':[CW,CH]}
# mobs
mn=list(M);MW_,MH_=44,36;S=Image.new('RGBA',(MW_*8,MH_*len(mn)),(0,0,0,0))
for r,n in enumerate(mn):
    c=0
    for d in('down','up','right','left'):
        for f in range(2):place(S,M[n][0][d][f],c,r,MW_,MH_);c+=1
out['mobs']={'img':S,'names':mn,'cell':[MW_,MH_]}
iN=list(I);S=sheet([I[n][0] for n in iN],16,pad=0,cell=(18,18),bg=(0,0,0,0));out['items']={'img':S,'names':iN,'cell':18,'cols':16}
pN=list(P);S=Image.new('RGBA',(68*8,56*((len(pN)+7)//8)),(0,0,0,0))
for i,n in enumerate(pN):place(S,P[n][0],i%8,i//8,68,56)
out['props']={'img':S,'names':pN,'cell':[68,56],'cols':8}
eo=edges.build();en=list(eo);ES=Image.new('RGBA',(16*12,16*(len(en)//12)),(0,0,0,0))
for i,n in enumerate(en):ES.alpha_composite(eo[n],((i%12)*16,(i//12)*16))
out['edges']={'img':ES,'names':en,'cols':12}
js={};tot=0
for k,v in out.items():
    u,sz=b64(v['img']);tot+=sz;sizes[k]=sz;d={kk:vv for kk,vv in v.items() if kk!='img'};d['src']=u;js[k]=d
open(sys.argv[1],'w').write('const ARTD='+json.dumps(js,separators=(',',':'))+';\n');print(sizes,tot)
