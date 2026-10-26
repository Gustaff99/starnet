#!/usr/bin/env python3
"""Refined inventory: visible English UI strings.
Filter: 2+ strong English function words, no Spanish accents, no Spanish function words.
"""
import re, json, os, sys
from collections import Counter

EN_STRONG = ['the','you','your','yourself','is','are','was','were','to','of','in','on','at','by','for','with','from','this','that','these','those','it','its','and','or','but','not','no','yes','if','when','while','do','does','done','have','has','had','will','would','can','could','should','let','get','got','set','use','used','using','click','drag','drop','open','close','save','delete','remove','add','new','cancel','confirm','update','select','search','loading','loaded','waiting','wait','ready','start','stop','pause','resume','restart','running','play','send','sent','receive','message','channel','status','name','type','time','date','day','week','month','year','hour','minute','second','file','folder','link','address','port','host','server','client','connect','connected','disconnect','disconnected','connection','online','offline','busy','free','active','inactive','enabled','disabled','hidden','visible','private','public','shared','local','remote','auto','manual','quick','fast','small','large','big','high','low','medium','none','all','any','some','other','same','first','last','next','previous','back','home','login','logout','sign','about','help','info','note','warning','alert','tip','hint','approve','deny','reject','accept','allow','block','error','fail','failed','success','pending','complete','finished','end','begin','create','edit','view','show','hide','toggle','move','copy','paste','cut','clear','fill','enter','input','output','value','option','setting','preference','profile','account','user','team','group','task','job','work','tool','action','result','report','log','record','history','list','item','entry','detail','summary','overview','dashboard','panel','window','screen','page','tab','menu','button','icon','label','field','form','card','badge','tag','chip','dropdown','tooltip','banner','footer','header','sidebar','grid','table','row','column','cell','chart','graph','map','world','station','ship','space','rocket','orbit','launch','land','arrive','depart','travel','mission','goal','plan','step','phase','level','score','point','credit','token','key','secret','password','pin','code','session','mode','theme','color','size','font','style','layout','display','device','computer','phone','tablet','browser','app','service','system','platform','network','internet','web','site','document','image','video','audio','sound','music','voice','speech','text','word','sentence','quote','reference','source','path','directory','archive','backup','restore','import','export','upload','download','sync','share','publish','post','comment','reply','response','answer','question','submit','chat','conversation','thread','room','member','friend','contact','organization','company','product','feature','function','capability','skill','knowledge','learning','training','course','lesson','exercise','practice','test','exam','quiz','grade','mark','rating','review','feedback','opinion','thought','idea','concept','theory','hypothesis','experiment','research','study','analysis','data','information','problem','issue','bug','flaw','defect','fault','crash','broken','patch','upgrade','version','release','deploy','install','uninstall','setup','configure','adjust','tune','calibrate','optimize','performance','speed','delay','latency','timeout','schedule','calendar','clock','timer','alarm','reminder','notification','progress','achievement','success','win','lose','tie','draw','match','game','player','opponent','league','competition','tournament','championship','race','contest','event','activity','movement','motion','velocity','acceleration','force','power','energy','fuel','electricity','magnetic','gravity','weight','mass','volume','density','temperature','heat','cold','hot','warm','cool','wet','dry','moist','humid','weather','climate','season','rain','snow','ice','wind','storm','thunder','lightning','flood','drought','earthquake','volcano','fire','smoke','ash','dust','sand','dirt','soil','clay','mud','stone','rock','crystal','gem','jewel','gold','silver','copper','iron','steel','metal','plastic','rubber','glass','ceramic','paper','fabric','cloth','cotton','wool','silk','leather','skin','hair','fur','feather','scale','horn','bone','tooth','claw','nail','finger','hand','arm','shoulder','chest','back','spine','neck','head','face','eye','ear','nose','mouth','lip','tongue','throat','jaw','chin','cheek','forehead','brow','skull','brain','mind','emotion','feeling','desire','wish','dream','hope','fear','anxiety','stress','tension','pressure','calm','peace','happy','sad','angry','glad','joy','delight','excite','surprise','shock','amaze','astonish','wonder','curious','interest','bore','tired','exhausted','sleepy','sleep','awake','rest','relax','recovery','heal','healthy','sick','ill','disease','injury','hurt','pain','ache','sore','stiff','shiver','tremble','sweat','blush','flush','pale','white','black','red','blue','green','yellow','orange','purple','pink','brown','grey','beige','tan','cream','ivory','bronze','brass','tin','lead','zinc','nickel','chrome','platinum','titanium','tungsten','mercury','uranium','plutonium','neutron','proton','electron','atom','molecule','compound','element','substance','material','matter','wave','frequency','amplitude','spectrum','prism','lens','mirror','camera','photo','picture','drawing','painting','sketch','diagram','blueprint','model','prototype','design','structure','framework','architecture','building','construction','infrastructure','grid','circuit','machine','engine','motor','generator','battery','cell','supply','demand','market','economy','trade','commerce','industry','manufacturing','production','factory','workshop','studio','office','shop','store','mall','counter','shelf','rack','window','door','gate','wall','floor','ceiling','roof','foundation','base','top','bottom','side','edge','corner','angle','curve','line','point','shape','pattern','texture','surface','plane','solid','liquid','gas','plasma','transition','change','transformation','conversion','process','procedure','method','technique','approach','strategy','tactic','scheme','program','project','campaign','initiative','effort','endeavor','undertaking','assignment','duty','responsibility','obligation','commitment','promise','agreement','contract','deal','bargain','transaction','exchange']
ES_WORDS = ['de','la','el','en','para','con','sin','tu','tus','se','los','las','un','una','uno','este','esta','estos','estas','aquel','aquella','más','también','muy','pero','si','no','que','como','cuando','dónde','quién','cual','cada','todo','toda','todos','todas','poco','mucho','hacer','hecho','tiene','tener','ser','estar','ir','poder','deber','querer','puedo','puedes','puede','somos','sois','son','es','eres','somos','está','estás','están','estoy','estás','está','estamos','está','estáis','están','aquí','ahí','allá','adentro','afuera','dentro','fuera','encima','debajo','delante','detrás','cerca','lejos','junto','sobre','bajo','entre','durante','antes','después','siempre','nunca','jamás','ahora','luego','pronto','tarde','temprano','hoy','mañana','ayer','semana','mes','año','día','hora','minuto','segundo','momento','vez','veces','punto','puntos','línea','líneas','forma','formas','modo','manera','tipo','clase','grupo','equipo','número','numeros','cantidad','parte','partes','lugar','lugares','zona','área','región','país','ciudad','mundo','casa','hogar','oficina','tienda','escuela','trabajo','trabajos','jefe','colega','amigo','amiga','familia','padre','madre','hijo','hija','nuevo','nueva','nuevos','nuevas','grande','pequeño','pequeña','largo','corto','alto','bajo','rápido','lento','fácil','difícil','bueno','buena','buenos','buenas','mal','malo','mala','mejor','peor','bien','mal','verdad','falso','cierto','frente','lado','lados','arriba','abajo','izquierda','derecha','centro','medio','final','fin','principio','inicio','comienzo','comenzar','comenzó','terminar','terminó','acabar','acabó','empezar','empezó','continuar','continúe','siguiente','anterior','último','primero','segundo','tercero','cuarto','quinto','séptimo','octavo','noveno','décimo','cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','veinte','treinta','cuarenta','cincuenta','sesenta','setenta','ochenta','noventa','cien','cien','mil','millón','millones','billón','billones','trillion','trillions','quintillion','quintillions','septillion','septillions','octillion','octillions','nonillion','nonillions','decillion','decillions','undecillion','undecillions','duodecillion','duodecillions','tredecillion','tredecillions','quattuordecillion','quattuordecillions','quindecillion','quindecillions','sexdecillion','sexdecillions','septendecillion','septendecillions','octodecillion','octodecillions','novemdecillion','novemdecillions','vigintillion','vigintillions','centillion','centillions','milli','micro','nano','pico','femto','atto','zepto','yocto','kilo','mega','giga','tera','peta','exa','zetta','yotta']
EN_RE = re.compile(r'\b(?:' + '|'.join(re.escape(w) for w in sorted(set(EN_STRONG), key=len, reverse=True)) + r')\b', re.I)
ES_RE = re.compile(r'\b(?:' + '|'.join(re.escape(w) for w in sorted(set(ES_WORDS), key=len, reverse=True)) + r')\b', re.I)
ACC_RE = re.compile(r'[áéíóúüñ¿¡]')

SINKS = [
    (re.compile(r'textContent\s*=\s*["\']', re.I), 'textContent'),
    (re.compile(r'innerText\s*=\s*["\']', re.I), 'innerText'),
    (re.compile(r'innerHTML\s*=\s*[`"\'"]', re.I), 'innerHTML'),
    (re.compile(r'aria-[a-z-]+\s*=\s*["\']', re.I), 'aria-*'),
    (re.compile(r'\btitle\s*=\s*["\']', re.I), 'title='),
    (re.compile(r'placeholder\s*=\s*["\']', re.I), 'placeholder='),
    (re.compile(r'data-tip\s*=\s*["\']', re.I), 'data-tip'),
    (re.compile(r'<button[^>]*>\s*([A-Za-zÁÉÍÓÚÑáéíóúñ]{3,})'), '<button>'),
    (re.compile(r'<label[^>]*>\s*([A-Za-zÁÉÍÓÚÑáéíóúñ]{3,})'), '<label>'),
    (re.compile(r'\btoast\w*\s*\(\s*[`"\']', re.I), 'toast()'),
    (re.compile(r'appendChild\(document\.createTextNode\([`"\']'), 'textNode'),
    (re.compile(r'\.append\(\s*[`"\']'), 'append(str)'),
    (re.compile(r'\balt\s*=\s*["\']', re.I), 'alt='),
    (re.compile(r'\b(prompt|confirm|alert)\s*\(\s*["\']', re.I), 'prompt/confirm'),
]
STR_RE = re.compile(r'["\']([^"\']{3,200})["\']')

def is_english_ui(s):
    if not s or len(s) < 4: return False
    if s.startswith(('http://','https://','data:','#','--','//','{','}')): return False
    if ACC_RE.search(s): return False            # accents => Spanish
    if ES_RE.search(s): return False             # Spanish function words
    m = EN_RE.findall(s, re.I)
    if len(set(w.lower() for w in m)) < 2: return False
    # identifier-ish: single token with no spaces and no strong EN word as whole
    if ' ' not in s: return False
    return True

results = []
for root in sys.argv[1:]:
    for dirpath, dirnames, filenames in os.walk(root):
        if 'node_modules' in dirpath: continue
        for fn in filenames:
            if not fn.endswith(('.js', '.html')): continue
            p = os.path.join(dirpath, fn)
            try: lines = open(p, encoding='utf-8', errors='replace').read().split('\n')
            except Exception: continue
            for i, line in enumerate(lines, 1):
                for rx, sink in SINKS:
                    m = rx.search(line)
                    if not m: continue
                    for sm in STR_RE.finditer(line[m.start():]):
                        s = sm.group(1)
                        if is_english_ui(s):
                            results.append({'file': p, 'line': i, 'sink': sink, 'text': s.strip()})
                        break

json.dump(results, open('.pi/inventory/en-strings2.json','w'), ensure_ascii=False, indent=0)
c = Counter(r['file'] for r in results)
# collapse frontend/website mirror: count website/app/app/X as frontend/app/X
def canon(f):
    f = f.replace('website/app/', '')
    return f
c2 = Counter(canon(r['file']) for r in results)
print(f"TOTAL: {len(results)} (mirrors collapsed: {sum(c2.values())//2 if all(k.startswith(('frontend','website')) for k in c2) else '?'})")
print(f"TOTAL canonical files: {len(c2)}, strings: {sum(c2.values())}")
for f, n in c2.most_common(60):
    print(f"{n:5d}  {f}")
