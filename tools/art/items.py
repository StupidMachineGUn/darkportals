from lib import *
I={}
def ic(name,fn,cat):
    im=new(16,16);g=ImageDraw.Draw(im);fn(g);I[name]=(outline(bevel(im,.18,.22)),cat)
def blade(col,hilt='#d9a640',grip='#6a4a2a',L=10,w=1):
    def f(g):
        for i in range(L):pt(g,(12-i,3+i),col);
        for i in range(L-1):pt(g,(11-i,3+i),lt(C(col),.5)) if w>1 else None
        line(g,[3,10,6,13],hilt,2);line(g,[2,13,4,15],grip,2)
    return f
WP={'dagger':('#c9d6e6',6),'sword':('#c9d6e6',9),'steel_sword':('#e6eefa',10),'mithril_sword':('#7ad0ff',10),'dragon_sword':('#ff7a5a',10),'gold_sword':('#ffd23f',9)}
for n,(c,L) in WP.items():ic(n,blade(c,L=L),'weapon')
def axe(col):
    def f(g):
        line(g,[4,13,11,3],'#6a4a2a',2);poly(g,[(9,2),(14,3),(14,8),(10,7)],col);pt(g,(12,4),lt(C(col),.6))
    return f
for n,c in [('axe','#aab4c4'),('steel_axe','#e6eefa'),('mithril_axe','#7ad0ff'),('battle_axe','#c0c8d8')]:ic(n,axe(c),'weapon')
def bow(col):
    def f(g):
        for i in range(12):pt(g,(4+int(3*math.sin(i/11*math.pi)),2+i),col)
        line(g,[4,2,4,13],'#e8e0c8',1);line(g,[4,8,12,8],'#c9d6e6',1);poly(g,[(12,7),(14,8),(12,9)],'#c9d6e6')
    return f
ic('bow',bow('#8a5a2b'),'weapon');ic('long_bow',bow('#5a3a1a'),'weapon');ic('mithril_bow',bow('#7ad0ff'),'weapon')
def staff(orb):
    def f(g):
        line(g,[4,14,10,5],'#6a4a2a',2);ell(g,[9,1,14,6],orb);pt(g,(11,2),'#ffffff')
    return f
for n,c in [('staff','#c8a0ff'),('fire_staff','#ff7a2a'),('frost_staff','#8ad8ff'),('venom_staff','#7ae04a'),('lightning_staff','#ffe84a')]:ic(n,staff(c),'weapon')
def mace(g):
    line(g,[4,14,10,6],'#6a4a2a',2);ell(g,[8,1,14,7],'#9aa6b8')
ic('mace',mace,'weapon')
def spear(g):
    line(g,[3,14,11,5],'#8a5a2b',1);poly(g,[(10,6),(14,1),(14,5)],'#d8e4f4')
ic('spear',spear,'weapon')
def shield(main,rim):
    def f(g):
        poly(g,[(3,2),(13,2),(13,9),(8,14),(3,9)],rim);poly(g,[(4,3),(12,3),(12,8),(8,12),(4,8)],main);line(g,[8,3,8,12],lt(C(main),.4),1)
    return f
for n,(m,r) in {'wood_shield':('#8a5a2b','#5a3a1a'),'iron_shield':('#9aa6b8','#5a6475'),'steel_shield':('#d8e4f4','#8a96a8'),'mithril_shield':('#7ad0ff','#3aa0e0'),'dragon_shield':('#c03030','#e8b070')}.items():ic(n,shield(m,r),'armor')
def helm(c):
    def f(g):
        ell(g,[3,2,13,12],c);rect(g,[3,7,13,13],c);rect(g,[6,8,10,10],'#1a1a24');line(g,[8,1,8,5],lt(C(c),.5),1)
    return f
def chest(c,t):
    def f(g):
        poly(g,[(2,3),(6,2),(10,2),(14,3),(13,8),(12,14),(4,14),(3,8)],c);rect(g,[6,2,10,5],t);line(g,[8,5,8,14],dk(C(c),.25),1)
    return f
def legs(c):
    def f(g):
        rect(g,[4,2,12,5],c);rect(g,[4,5,7,14],c);rect(g,[9,5,12,14],c);line(g,[4,5,12,5],dk(C(c),.3),1)
    return f
def boots(c):
    def f(g):
        rect(g,[3,3,7,11],c);rect(g,[2,10,8,13],dk(C(c),.2));rect(g,[9,3,13,11],c);rect(g,[8,10,14,13],dk(C(c),.2))
    return f
for t,(m,tr) in {'cloth':('#8a5ac8','#c8a0ff'),'leather':('#a0703a','#d09a5a'),'bronze':('#c0804a','#e8a870'),'iron':('#9aa6b8','#d0d8e4'),'steel':('#d0dcec','#ffffff'),'mithril':('#5ac0f0','#c0f0ff'),'dragon':('#c03030','#ffb02e')}.items():
    ic(t+'_helm',helm(m),'armor');ic(t+'_chest',chest(m,tr),'armor');ic(t+'_legs',legs(m),'armor');ic(t+'_boots',boots(m),'armor')
def potion(c,fill=True):
    def f(g):
        rect(g,[7,1,9,3],'#8a5a2b');rect(g,[6,3,10,5],'#d8e4f4');ell(g,[3,5,13,15],'#d8e4f4');ell(g,[4,7,12,14],c);pt(g,(6,9),'#ffffff')
    return f
for n,c in [('hp_potion','#e83a4a'),('mana_potion','#3a7aff'),('stamina_potion','#4ad060'),('antidote','#9ae02a'),('strength_potion','#ff8a2a'),('speed_potion','#ffe84a'),('invis_potion','#c8c8e8'),('big_hp_potion','#ff1a3a')]:ic(n,potion(c),'potion')
def food(kind):
    def f(g):
        if kind=='bread':ell(g,[2,5,14,13],'#c88a3a');line(g,[5,7,6,9],'#e8b868',1);line(g,[9,7,10,9],'#e8b868',1)
        elif kind=='meat':ell(g,[2,4,12,13],'#c04a3a');ell(g,[3,5,9,9],'#e87a6a');rect(g,[11,11,15,13],'#f0e6c8')
        elif kind=='fish':ell(g,[2,5,12,12],'#6ab0d8');poly(g,[(11,8),(15,4),(15,12)],'#4a90b8');pt(g,(4,7),'#101020')
        elif kind=='apple':ell(g,[3,4,13,14],'#d83a3a');rect(g,[7,2,8,4],'#6a4a2a');poly(g,[(9,2),(12,3),(9,4)],'#4aa04a')
        elif kind=='cheese':poly(g,[(2,12),(14,12),(14,6),(2,3)],'#ffd23f');pt(g,(6,9),'#c8a020');pt(g,(10,8),'#c8a020')
        elif kind=='cooked':ell(g,[2,4,12,13],'#8a4a22');ell(g,[3,5,9,9],'#b87a3a');rect(g,[11,11,15,13],'#f0e6c8')
        elif kind=='egg':ell(g,[4,3,12,14],'#f4f0e8')
        elif kind=='mush':ell(g,[2,3,14,9],'#c03a3a');rect(g,[6,8,10,14],'#f0e6c8');pt(g,(5,5),'#fff');pt(g,(10,6),'#fff')
        elif kind=='berry':ell(g,[2,6,8,12],'#7a3ac8');ell(g,[7,4,13,10],'#7a3ac8');ell(g,[6,9,12,14],'#7a3ac8')
    return f
for k in ['bread','meat','fish','apple','cheese','cooked','egg','mush','berry']:ic({'meat':'raw_meat','cooked':'cooked_meat','mush':'mushroom','berry':'berries','fish':'raw_fish'}.get(k,k),food(k),'food')
ic('cooked_fish',lambda g:(ell(g,[2,5,12,12],'#c8884a'),poly(g,[(11,8),(15,4),(15,12)],'#a86a3a'),pt(g,(4,7),'#101020')),'food')
def ore(c,hi):
    def f(g):
        poly(g,[(2,12),(3,6),(8,3),(13,6),(14,12),(8,14)],'#7a7a86');
        for p in [(5,7),(9,6),(7,10),(11,9)]:rect(g,[p[0],p[1],p[0]+1,p[1]+1],c)
        pt(g,(5,6),hi)
    return f
for n,(c,h) in {'copper_ore':('#d88a4a','#ffc090'),'iron_ore':('#c8b0a0','#ffffff'),'coal':('#2a2a30','#6a6a76'),'gold_ore':('#ffd23f','#fff0a0'),'mithril_ore':('#5ac0f0','#c0f0ff'),'silver_ore':('#d8e4f4','#ffffff'),'ruby':('#e83a4a','#ffb0b8'),'emerald':('#3ae870','#b0ffc8'),'sapphire':('#3a7aff','#b0c8ff'),'diamond':('#e8f8ff','#ffffff')}.items():ic(n,ore(c,h),'ore' if 'ore' in n or n=='coal' else 'gem')
def bar(c):
    def f(g):
        poly(g,[(2,10),(5,5),(14,5),(11,10)],lt(C(c),.3));rect(g,[2,10,11,13],c);poly(g,[(11,10),(14,5),(14,8),(11,13)],dk(C(c),.25))
    return f
for n,c in [('copper_bar','#d88a4a'),('bronze_bar','#c0804a'),('iron_bar','#9aa6b8'),('steel_bar','#d0dcec'),('gold_bar','#ffd23f'),('mithril_bar','#5ac0f0'),('silver_bar','#d8e4f4')]:ic(n,bar(c),'bar')
def log(c,ring):
    def f(g):
        rect(g,[2,5,13,12],c);ell(g,[11,4,15,13],ring);ell(g,[12,6,14,11],c);line(g,[3,7,9,7],dk(C(c),.2),1);line(g,[3,10,9,10],dk(C(c),.2),1)
    return f
for n,(c,r) in {'oak_log':('#8a5a2b','#d0a060'),'pine_log':('#6a4a2a','#c09050'),'palm_log':('#a07a4a','#e0c080'),'ebony_log':('#3a2a30','#7a5a60'),'ice_log':('#8ac8e8','#e0f4ff')}.items():ic(n,log(c,r),'wood')
def pick(c):
    def f(g):
        line(g,[4,14,11,5],'#6a4a2a',2);poly(g,[(5,3),(9,2),(14,6),(12,6),(9,4),(6,4)],c)
    return f
for n,c in [('pickaxe','#aab4c4'),('iron_pickaxe','#c9d6e6'),('steel_pickaxe','#e6eefa'),('mithril_pickaxe','#7ad0ff')]:ic(n,pick(c),'tool')
ic('hammer',lambda g:(line(g,[4,14,10,6],'#6a4a2a',2),rect(g,[7,2,14,6],'#9aa6b8')),'tool')
ic('fishing_rod',lambda g:(line(g,[3,14,13,2],'#8a5a2b',1),line(g,[13,2,14,9],'#e8e0c8',1),pt(g,(14,10),'#d83a3a')),'tool')
ic('net',lambda g:(ell(g,[3,3,13,11],'#c8b890'),line(g,[8,11,8,15],'#8a5a2b',2),line(g,[3,7,13,7],'#8a7a58',1),line(g,[8,3,8,11],'#8a7a58',1)),'tool')
ic('knife',blade('#e6eefa',L=5),'tool')
ic('torch',lambda g:(line(g,[8,15,8,7],'#6a4a2a',2),ell(g,[5,1,11,8],'#ff7a2a'),ell(g,[6,3,10,7],'#ffd23f')),'tool')
ic('lockpick',lambda g:(line(g,[3,13,11,5],'#c9d6e6',1),rect(g,[11,3,14,6],'#c9d6e6')),'tool')
ic('rope',lambda g:[ell(g,[2+i,3+i,12-i,13-i],'#c8a868') if i%2==0 else ell(g,[2+i,3+i,12-i,13-i],'#a88848') for i in range(0,4)],'tool')
ic('key',lambda g:(ell(g,[2,2,7,7],'#ffd23f'),ell(g,[4,4,5,5],'#000'),rect(g,[6,6,13,7],'#ffd23f'),rect(g,[11,7,12,10],'#ffd23f')),'misc')
ic('scroll',lambda g:(rect(g,[3,3,13,13],'#f0e6c8'),rect(g,[2,2,14,4],'#c8a868'),rect(g,[2,12,14,14],'#c8a868'),line(g,[5,7,11,7],'#8a6a3a',1),line(g,[5,9,10,9],'#8a6a3a',1)),'misc')
ic('book',lambda g:(rect(g,[3,2,13,14],'#6a2a8a'),rect(g,[4,3,12,13],'#8a4aaa'),rect(g,[7,5,10,8],'#ffd23f')),'misc')
ic('coin',lambda g:(ell(g,[3,3,13,13],'#d9a640'),ell(g,[4,4,12,12],'#ffd23f'),rect(g,[7,6,8,10],'#c8901a')),'misc')
ic('coins',lambda g:(ell(g,[1,7,8,13],'#ffd23f'),ell(g,[6,5,13,11],'#ffd23f'),ell(g,[4,8,11,14],'#e8b82a')),'misc')
ic('gold_pile',lambda g:(poly(g,[(1,14),(5,6),(8,3),(11,6),(15,14)],'#ffd23f'),pt(g,(7,6),'#fff0a0'),pt(g,(5,10),'#c8901a'),pt(g,(10,10),'#c8901a')),'misc')
ic('chest',lambda g:(rect(g,[2,6,14,14],'#8a5a2b'),rect(g,[2,3,14,7],'#a0703a'),rect(g,[2,7,14,8],'#ffd23f'),rect(g,[7,7,9,10],'#ffd23f')),'misc')
ic('bag',lambda g:(ell(g,[3,5,13,15],'#a0703a'),rect(g,[6,3,10,6],'#8a5a2b'),line(g,[5,5,11,5],'#e8d0a0',1)),'misc')
ic('gem_ring',lambda g:(ell(g,[3,5,13,15],'#ffd23f'),ell(g,[5,7,11,13],(0,0,0,0)) if False else None,ell(g,[6,1,10,6],'#e83a4a')),'jewel')
ic('amulet',lambda g:(line(g,[3,2,8,9],'#ffd23f',1),line(g,[13,2,8,9],'#ffd23f',1),ell(g,[5,8,11,14],'#3a7aff')),'jewel')
ic('wool',lambda g:(ell(g,[2,4,14,13],'#f0ece0'),pt(g,(5,7),'#d8d4c8'),pt(g,(10,9),'#d8d4c8')),'material')
ic('leather',lambda g:poly(g,[(2,4),(7,3),(14,5),(13,12),(6,14),(3,11)],'#a0703a'),'material')
ic('bone',lambda g:(line(g,[3,13,13,3],'#f0e6c8',2),ell(g,[1,11,5,15],'#f0e6c8'),ell(g,[11,1,15,5],'#f0e6c8')),'material')
ic('feather',lambda g:(poly(g,[(3,14),(5,6),(12,2),(10,10)],'#e8e0c8'),line(g,[3,14,11,3],'#a09878',1)),'material')
ic('herb',lambda g:(line(g,[8,15,8,6],'#3a7a3a',1),poly(g,[(8,8),(3,5),(7,10)],'#4aa04a'),poly(g,[(8,6),(13,3),(9,9)],'#4aa04a')),'material')
ic('gem_shard',lambda g:poly(g,[(8,1),(13,6),(8,15),(3,6)],'#c06aff'),'material')
ic('fang',lambda g:poly(g,[(5,2),(11,2),(8,14)],'#f0e6c8'),'material')
ic('scale',lambda g:poly(g,[(8,2),(14,6),(12,13),(4,13),(2,6)],'#4aa04a'),'material')
ic('ember',lambda g:(ell(g,[3,5,13,14],'#ff7a2a'),ell(g,[5,7,11,13],'#ffd23f')),'material')
ic('frost_core',lambda g:(poly(g,[(8,1),(14,8),(8,15),(2,8)],'#8ad8ff'),poly(g,[(8,4),(11,8),(8,12),(5,8)],'#ffffff')),'material')
ic('arrow',lambda g:(line(g,[3,13,12,4],'#8a5a2b',1),poly(g,[(12,2),(14,2),(14,6)],'#c9d6e6'),poly(g,[(2,12),(2,15),(5,13)],'#d83a3a')),'ammo')
ic('bolt',lambda g:(line(g,[3,13,12,4],'#6a4a2a',1),poly(g,[(11,3),(14,2),(13,6)],'#9aa6b8')),'ammo')
ic('seed',lambda g:(ell(g,[5,5,11,13],'#a07a3a'),pt(g,(7,7),'#d8b060')),'material')
ic('wheat',lambda g:[line(g,[8,15,8+(i-1)*3,2],'#e8c14a',1) for i in range(3)],'material')
ic('flour',lambda g:(rect(g,[3,5,13,14],'#e8dcc0'),rect(g,[3,3,13,6],'#f4ecd8')),'material')
if __name__=='__main__':
    names=list(I);print(len(names))
    S=sheet([I[n][0] for n in names],14,cell=(22,22));S.resize((S.width*4,S.height*4),Image.NEAREST).save('/tmp/ap_items.png');print(S.size)
