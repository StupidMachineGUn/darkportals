from lib import *
SKINS=['#f0c9a0','#d9a67a','#c98f68','#8a5a3a','#5a3a28','#e8d0b8']
HAIRS=['#8a4a22','#2a1a14','#e8c14a','#d0d0d8','#ee6a2a','#5a3a28','#1a1a2a']
ARMOR={ # name: (cloth/main, trim, metal highlight, helm?)
 'cloth':dict(body='#6a5acd',trim='#4a3aa0',metal=None,helm=None),
 'leather':dict(body='#8a5a2b',trim='#5a3a1e',metal=None,helm='cap'),
 'bronze':dict(body='#c98f4a',trim='#8a5a2b',metal='#e8b46a',helm='helm'),
 'iron':dict(body='#8a94a6',trim='#5a6475',metal='#c0c8d6',helm='helm'),
 'steel':dict(body='#b4c0d4',trim='#6a7a92',metal='#e6eefa',helm='great'),
 'mithril':dict(body='#5ab0e0',trim='#2f6a9a',metal='#b8e8ff',helm='great'),
 'dragon':dict(body='#b03030',trim='#6a1a1a',metal='#ff8a5a',helm='horn'),
}
WEAP={'none':None,'dagger':('#c9d6e6',8,'#8a5a2b'),'sword':('#c9d6e6',12,'#d9a640'),'steel':('#e6eefa',13,'#d9a640'),'mithril':('#7ad0ff',13,'#3aa0e0'),'axe':'axe','bow':'bow','staff':'staff','fire':'staff:#ff7a2a','frost':'staff:#8ad8ff','venom':'staff:#7ae04a'}
def human(d,f,raw=False,skin='#f0c9a0',hair='#8a4a22',tunic='#3a5fb0',pants='#4a3a2a',armor=None,weapon='none',style=0,cape=None,hat=None):
    """d: 'd' down,'u' up,'r' right ; f: 0 idle,1 walkA,2 walkB (3 = idle2)"""
    im=new(20,26);g=ImageDraw.Draw(im);ox,oy=2,1
    sk=C(skin);hr=C(hair);tn=C(tunic);pn=C(pants);bob=-1 if f in(1,2) else 0
    A=ARMOR.get(armor) if armor else None
    body=C(A['body']) if A else tn;trim=C(A['trim']) if A else dk(tn,.3)
    def R_(b,c):rect(g,[b[0]+ox,b[1]+oy+(b[4] if len(b)>4 else 0),b[2]+ox,b[3]+oy+(b[4] if len(b)>4 else 0)],c)
    sw=[0,1,-1,0][f]  # stride
    if d in('d','u'):
        if cape and d=='u':rect(g,[3+ox,10+oy+bob,12+ox,21+oy],cape)
        # legs
        lyoff=[0,-1,1,0][f];ryoff=[0,1,-1,0][f]
        rect(g,[5+ox,18+oy+bob,6+ox,22+oy+lyoff],pn);rect(g,[9+ox,18+oy+bob,10+ox,22+oy+ryoff],pn)
        rect(g,[4+ox,22+oy+lyoff,6+ox,23+oy+lyoff],'#3a2412');rect(g,[9+ox,22+oy+ryoff,11+ox,23+oy+ryoff],'#3a2412')
        # torso
        rect(g,[4+ox,10+oy+bob,11+ox,17+oy+bob],body);rect(g,[4+ox,10+oy+bob,5+ox,17+oy+bob],lt(body,.15));rect(g,[10+ox,10+oy+bob,11+ox,17+oy+bob],dk(body,.2))
        rect(g,[4+ox,16+oy+bob,11+ox,16+oy+bob],trim)
        if A and A['metal']:
            rect(g,[5+ox,10+oy+bob,10+ox,13+oy+bob],A['metal']);line(g,[5+ox,10+oy+bob,10+ox,10+oy+bob],lt(C(A['metal']),.4))
            rect(g,[3+ox,10+oy+bob,4+ox,11+oy+bob],A['metal']);rect(g,[11+ox,10+oy+bob,12+ox,11+oy+bob],A['metal'])
        # arms
        la=[0,1,-1,0][f];ra=[0,-1,1,0][f]
        rect(g,[2+ox,11+oy+bob+la,3+ox,16+oy+bob+la],body);rect(g,[12+ox,11+oy+bob+ra,13+ox,16+oy+bob+ra],dk(body,.15))
        pt(g,(2+ox,17+oy+bob+la),sk);pt(g,(3+ox,17+oy+bob+la),sk);pt(g,(12+ox,17+oy+bob+ra),sk);pt(g,(13+ox,17+oy+bob+ra),sk)
        # head
        rect(g,[4+ox,2+oy+bob,11+ox,9+oy+bob],sk);rect(g,[4+ox,8+oy+bob,11+ox,9+oy+bob],dk(sk,.12))
        if d=='d':
            rect(g,[4+ox,1+oy+bob,11+ox,4+oy+bob],hr);rect(g,[3+ox,3+oy+bob,4+ox,6+oy+bob+(4 if style==1 else 0)],hr);rect(g,[11+ox,3+oy+bob,12+ox,6+oy+bob+(4 if style==1 else 0)],hr)
            line(g,[5+ox,2+oy+bob,9+ox,2+oy+bob],lt(hr,.25))
            if style==2:rect(g,[5+ox,3+oy+bob,10+ox,4+oy+bob],hr)
            for ex in(6,9):pt(g,(ex+ox,6+oy+bob),'#241624');pt(g,(ex+ox,5+oy+bob),'#ffffff')
            pt(g,(7+ox,8+oy+bob),dk(sk,.35));pt(g,(8+ox,8+oy+bob),dk(sk,.35))
        else:
            rect(g,[3+ox,1+oy+bob,12+ox,8+oy+bob+(3 if style==1 else 0)],hr);rect(g,[4+ox,8+oy+bob,11+ox,8+oy+bob],dk(hr,.15));line(g,[5+ox,2+oy+bob,10+ox,2+oy+bob],lt(hr,.25))
    else: # right-facing
        ly=[0,-1,1,0][f]
        # back leg then front leg
        rect(g,[6+ox+(1 if f==1 else -1 if f==2 else 0),18+oy+bob,7+ox+(1 if f==1 else -1 if f==2 else 0),22+oy],dk(pn,.15));rect(g,[7+ox+(1 if f==1 else -1 if f==2 else 0),22+oy,9+ox+(1 if f==1 else -1 if f==2 else 0),23+oy],'#2a1a0e')
        fl=-1 if f==1 else 1 if f==2 else 0
        rect(g,[7+ox+fl,18+oy+bob,8+ox+fl,22+oy],pn);rect(g,[7+ox+fl,22+oy,10+ox+fl,23+oy],'#3a2412')
        if cape:rect(g,[3+ox,10+oy+bob,5+ox,20+oy],cape)
        rect(g,[5+ox,10+oy+bob,10+ox,17+oy+bob],body);rect(g,[5+ox,10+oy+bob,6+ox,17+oy+bob],dk(body,.1));rect(g,[9+ox,10+oy+bob,10+ox,17+oy+bob],lt(body,.1));rect(g,[5+ox,16+oy+bob,10+ox,16+oy+bob],trim)
        if A and A['metal']:rect(g,[6+ox,10+oy+bob,10+ox,12+oy+bob],A['metal'])
        am=[0,1,-1,0][f]
        rect(g,[6+ox,11+oy+bob+am,8+ox,16+oy+bob+am],dk(body,.1));pt(g,(7+ox,17+oy+bob+am),sk);pt(g,(8+ox,17+oy+bob+am),sk)
        rect(g,[5+ox,2+oy+bob,11+ox,9+oy+bob],sk);pt(g,(12+ox,6+oy+bob),sk)
        rect(g,[4+ox,1+oy+bob,10+ox,4+oy+bob],hr);rect(g,[4+ox,3+oy+bob,6+ox,7+oy+bob+(4 if style==1 else 0)],hr);rect(g,[10+ox,1+oy+bob,11+ox,3+oy+bob],hr);line(g,[6+ox,2+oy+bob,10+ox,2+oy+bob],lt(hr,.25))
        pt(g,(9+ox,6+oy+bob),'#241624');pt(g,(9+ox,5+oy+bob),'#ffffff');pt(g,(10+ox,8+oy+bob),dk(sk,.35))
    # helmets / hats
    hy=oy+bob
    if A and A['helm'] and d in('d','u','r'):
        h=A['helm'];mc=C(A['metal']) if A['metal'] else C(A['trim']);bc=C(A['body'])
        if h=='cap':rect(g,[4+ox,1+hy,11+ox,3+hy],bc)
        else:
            rect(g,[3+ox,0+hy,12+ox,4+hy],bc);rect(g,[3+ox,0+hy,12+ox,1+hy],mc)
            if d=='d':rect(g,[7+ox,2+hy,8+ox,6+hy],dk(bc,.2))
            if h in('great',):rect(g,[3+ox,4+hy,4+ox,8+hy],bc);rect(g,[11+ox,4+hy,12+ox,8+hy],bc)
            if h=='horn':poly(g,[(3+ox,0+hy),(1+ox,-1+hy),(3+ox,2+hy)],'#f0e6c8');poly(g,[(12+ox,0+hy),(14+ox,-1+hy),(12+ox,2+hy)],'#f0e6c8')
    if hat=='wiz':poly(g,[(8+ox,-5+hy),(14+ox,2+hy),(2+ox,2+hy)],'#4a3a9a');rect(g,[1+ox,2+hy,14+ox,3+hy],'#3a2c7a')
    # weapon
    wp=WEAP.get(weapon)
    if wp:
        if isinstance(wp,tuple):
            bl,ln,gd=wp
            if d=='d':hx_,hy_=14+ox,17+oy+bob
            elif d=='u':hx_,hy_=1+ox,15+oy+bob
            else:hx_,hy_=11+ox,15+oy+bob
            if d=='r':
                rect(g,[hx_,hy_-ln+2,hx_+1,hy_+3],bl) if False else None
                line(g,[hx_,hy_,hx_+ln//2+1,hy-ln//2],bl,1);line(g,[hx_,hy_-1,hx_+ln//2+1,hy-ln//2-1],lt(C(bl),.4));rect(g,[hx_-1,hy_,hx_+1,hy_+1],gd)
            elif d=='u':
                rect(g,[hx_,hy_-ln//2,hx_+1,hy_],dk(C(bl),.35));rect(g,[hx_-1,hy_,hx_+2,hy_+1],dk(C(gd),.3))
            else:
                rect(g,[hx_,hy_-ln,hx_+1,hy_],bl);line(g,[hx_,hy_-ln,hx_,hy_],lt(C(bl),.45));rect(g,[hx_-1,hy_,hx_+2,hy_+1],gd);rect(g,[hx_,hy_+2,hx_+1,hy_+3],'#5a3a1e')
        elif wp=='axe':
            hx_=14+ox if d!='u' else 1+ox;rect(g,[hx_,9+oy+bob,hx_,19+oy+bob],'#6b4423');poly(g,[(hx_,9+oy+bob),(hx_+4,8+oy+bob),(hx_+4,13+oy+bob),(hx_,12+oy+bob)],'#c0c8d6');line(g,[hx_+4,8+oy+bob,hx_+4,13+oy+bob],'#f2f7ff')
        elif wp=='bow':
            hx_=14+ox if d!='u' else 1+ox;line(g,[hx_,8+oy+bob,hx_+2,13+oy+bob,hx_,19+oy+bob],'#8a5a2b',1);line(g,[hx_,8+oy+bob,hx_,19+oy+bob],'#e8e0c8')
        elif wp.startswith('staff'):
            gem=wp.split(':')[1] if ':' in wp else '#b06aff'
            hx_=14+ox if d!='u' else 1+ox;rect(g,[hx_,6+oy+bob,hx_,22+oy],'#6b4423');ell(g,[hx_-2,3+oy+bob,hx_+2,7+oy+bob],gem);pt(g,(hx_-1,4+oy+bob),'#ffffff')
    return im if raw else outline(im,'#1f1626')
def sprites(**kw):
    out={}
    for d in('d','u','r'):
        out[d]=[human(d,f,**kw) for f in range(4)]
    out['l']=[flipx(i) for i in out['r']]
    return out
if __name__=='__main__':
    rows=[]
    base=sprites()
    # direction x frame sheet
    S=sheet([base[d][f] for d in('d','l','u','r') for f in range(4)],4,pad=2)
    label(S,'4 directions x 4 frames (down, left, up, right)',4).save('/tmp/ap_dirs.png')
    sets=[]
    for i,a in enumerate(ARMOR):
        sets.append(human('d',0,armor=a,weapon=['dagger','sword','sword','steel','steel','mithril','axe'][i],skin=SKINS[i%6],hair=HAIRS[i%7]))
    for i,a in enumerate(ARMOR):
        sets.append(human('r',1,armor=a,weapon=['dagger','sword','sword','steel','steel','mithril','axe'][i],skin=SKINS[(i+2)%6],hair=HAIRS[(i+3)%7],cape='#a02a2a' if i>3 else None))
    ex=[human('d',0,tunic='#5a3a9a',hat='wiz',weapon='fire',hair='#d0d0d8'),human('d',0,tunic='#2a7a5a',weapon='bow',hair='#e8c14a',style=1),human('d',0,tunic='#7a4a1a',weapon='staff',style=2),human('d',0,tunic='#2a4a8a',weapon='frost',hat='wiz'),human('d',0,tunic='#3a6a2a',weapon='venom',hat='wiz')]
    sets+=ex
    label(sheet(sets,7,pad=2),'armor tiers (cloth to dragon) + classes',4).save('/tmp/ap_armor.png')
