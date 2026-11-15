import math,json,base64,io,sys,random
from vox3d import *
from chars import ARMOR
SC=.8;W,H=36,42;NF=3
TIERS=['cloth','bronze','iron','steel','dragon','mithril']
SK='#e8b48a'
def look_arm(t):
    a=ARMOR[t];L=dict(skin=SK,hair='#6a3a1a',tunic=a['body'],trim=a['trim'])
    if a['metal']:L.update(armor=a['body'],metal=a['metal'])
    if a['helm']:L['helm']=1
    if t=='dragon':L['cape']='#6a1a1a'
    return L
NPCC=['#c0392b','#3a5fb0','#3f8a3f','#7a3ab0','#d9822b','#d8c040','#7a5a3a','#7a7a86','#2a9a9a','#d870a8','#e8e4dc','#2a2a32','#6a1a2a','#1a2a5a','#6a6a2a','#c8a878']
HAIR=['#6a3a1a','#2a1a14','#d8b04a','#9a4a22']
def walkp(f):return[0,.9,-.9][f]
def cell(look,k,f,weapon=None,layer=None):
    return render(look,math.radians(k*45),walk=walkp(f),weapon=weapon,W=W,H=H,sc=SC,layer=layer)
GL=[None,(120,240,210),(110,180,255),(200,130,255),(255,190,70)]
def glow(im,t,seed):
    if t==0:return im
    c=GL[t];a=im.split()[3];px=a.load();w,h=im.size;out=Image.new('RGBA',(w,h),(0,0,0,0));o=out.load();ip=im.load()
    R=1 if t<3 else 2
    for y in range(h):
        for x in range(w):
            if px[x,y]>0:continue
            d=99
            for dy in range(-R,R+1):
                for dx in range(-R,R+1):
                    xx,yy=x+dx,y+dy
                    if 0<=xx<w and 0<=yy<h and px[xx,yy]>0:d=min(d,max(abs(dx),abs(dy)))
            if d<=R:o[x,y]=c+(int(150-40*(d-1)) if t<4 else int(190-50*(d-1)),)
    rnd=random.Random(seed);pts=[(x,y) for y in range(h) for x in range(w) if px[x,y]>0]
    if pts:
        for _ in range(t):
            x,y=rnd.choice(pts);x+=rnd.randint(-3,3);y+=rnd.randint(-3,3)
            if 0<=x<w and 0<=y<h and px[x,y]==0:o[x,y]=(255,255,255,230)
    out.alpha_composite(im);return out
def bake():
    rows=[];names=[]
    for t in TIERS:
        names.append('A:'+t);rows.append([cell(look_arm(t),k,f) for k in range(8) for f in range(NF)])
    for i,c in enumerate(NPCC):
        names.append('N:'+c);rows.append([cell(dict(skin='#d9a87a',hair=HAIR[i%4],tunic=c,trim='#4a3a2a'),k,f) for k in range(8) for f in range(NF)])
    S=Image.new('RGBA',(W*8*NF,H*len(rows)),(0,0,0,0))
    for r,row in enumerate(rows):
        for i,im in enumerate(row):S.alpha_composite(im,(i*W,r*H))
    out={'chars8':{'img':S,'names':names,'cell':[W,H]}}
    KS=['sword','steel','mithril','dagger','axe','bow','staff','fire','frost','venom'];wn=[];wr=[]
    for ki,kd in enumerate(KS):
        for t in range(5):
            wn.append(f'W:{kd}:{t}');wr.append([glow(cell(look_arm('iron'),k,f,weapon=kd,layer='weapon'),t,ki*100+t*10+k*3+f) for k in range(8) for f in range(NF)])
    S2=Image.new('RGBA',(W*8*NF,H*len(wr)),(0,0,0,0))
    for r,row in enumerate(wr):
        for i,im in enumerate(row):S2.alpha_composite(im,(i*W,r*H))
    out['w8']={'img':S2,'names':wn,'cell':[W,H]}
    return out
def b64(im):
    b=io.BytesIO();im=im.quantize(colors=200,method=Image.FASTOCTREE,dither=Image.NONE).convert('RGBA') if False else im;im.save(b,'PNG',optimize=True);return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode(),len(b.getvalue())
if __name__=='__main__':
    o=bake();src=open(sys.argv[1]).read();js=json.loads(src[len('const ARTD='):src.rindex(';')])
    for k,v in o.items():
        u,sz=b64(v['img']);print(k,sz,v['img'].size);js[k]={'names':v['names'],'cell':v['cell'],'src':u}
    open(sys.argv[1],'w').write('const ARTD='+json.dumps(js,separators=(',',':'))+';\n')
    o['chars8']['img'].crop((0,0,W*24,H*8)).resize((W*24*3,H*8*3),Image.NEAREST).save('/tmp/c8.png')
    o['w8']['img'].crop((0,0,W*24,H*10)).resize((W*24*3,H*10*3),Image.NEAREST).save('/tmp/w8.png')
