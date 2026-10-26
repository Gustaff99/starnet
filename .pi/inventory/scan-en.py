#!/usr/bin/env python3
"""Inventory of likely-visible English UI strings in frontend + website.
Heuristic: quoted string literals assigned to DOM-ish sinks (textContent,
innerHTML, aria-*, title, placeholder, toast, append text nodes, data-tip,
<button>, <label>, etc.). Reports file, line, sink, string.
"""
import re, json, os, sys

EN_WORDS = r'\b(the|a|an|you|your|yourself|we|our|us|me|my|is|are|was|were|be|been|to|of|in|on|at|by|for|with|from|this|that|these|those|it|its|and|or|but|not|no|yes|if|when|while|do|does|done|have|has|had|will|would|can|could|should|will|let|lets|get|got|set|use|used|using|click|clicked|drag|drop|open|opened|close|closed|save|saved|delete|deleted|remove|removed|add|added|new|cancel|canceled|confirm|confirmed|update|updated|select|selected|search|loading|loaded|waiting|wait|ready|start|started|stop|stopped|pause|paused|resume|resumed|restart|running|run|ran|play|playing|send|sent|sending|receive|received|message|messages|channel|channels|status|state|name|type|time|date|day|week|month|year|hour|minute|second|file|folder|link|address|port|host|server|client|connect|connected|disconnect|disconnected|connection|online|offline|busy|free|active|inactive|enabled|disabled|hidden|visible|private|public|shared|local|remote|auto|manual|quick|fast|small|large|big|tiny|high|low|medium|none|all|any|some|other|same|first|last|next|previous|back|home|login|logout|sign|up|down|about|help|info|note|warning|alert|tip|hint|approve|approved|deny|denied|reject|rejected|accept|accepted|allow|allowed|block|blocked|error|errors|fail|failed|failure|success|succeeded|warning|info|notice|pending|complete|completed|finish|finished|end|ended|begin|begun|create|created|created|edit|edited|view|viewed|show|shown|hide|hidden|toggle|switch|move|moved|copy|copied|paste|cut|clear|cleared|fill|filled|enter|entered|input|output|value|values|option|options|setting|settings|preference|preferences|profile|account|user|users|team|group|task|tasks|job|jobs|work|working|tool|tools|action|actions|result|results|report|reports|log|logs|record|records|history|list|lists|item|items|entry|entries|detail|details|summary|overview|dashboard|panel|window|screen|page|tab|tabs|menu|menus|button|buttons|icon|icons|label|labels|field|fields|form|forms|card|cards|badge|badges|tag|tags|chip|chips|dropdown|tooltip|tooltips|banner|banner|footer|header|sidebar|rail|list|grid|table|row|rows|column|columns|cell|cells|chart|charts|graph|graphs|map|maps|world|station|ship|ships|space|rocket|orbit|orbiting|launch|launched|land|landed|arrive|arrived|depart|departed|travel|travelling|mission|missions|goal|goals|plan|plans|step|steps|phase|phases|level|levels|score|points|point|credit|credits|token|tokens|key|keys|secret|secrets|password|pin|code|codes|session|sessions|login|logon|logout|logoff|account|accounts|profile|profiles|settings|config|configuration|option|options|choice|choices|mode|modes|theme|themes|color|colors|colour|colours|size|sizes|font|fonts|style|styles|layout|layouts|view|views|display|displays|screen|screens|monitor|monitors|device|devices|computer|computers|phone|phones|tablet|tablets|browser|browsers|app|apps|application|applications|service|services|system|systems|platform|platforms|network|networks|internet|web|site|sites|page|pages|document|documents|image|images|video|videos|audio|audios|sound|sounds|music|voice|voices|speech|text|texts|word|words|sentence|sentences|paragraph|paragraphs|quote|quotes|citation|citations|reference|references|source|sources|citation|link|links|url|urls|path|paths|directory|directories|folder|folders|file|files|archive|archives|backup|backups|restore|restored|import|imported|export|exported|upload|uploaded|download|downloaded|sync|synced|synchronize|synchronized|share|shared|publish|published|post|posted|comment|comments|reply|replies|response|responses|answer|answers|question|questions|form|forms|submit|submitted|send|sent|message|messages|chat|chats|conversation|conversations|thread|threads|channel|channels|room|rooms|group|groups|member|members|friend|friends|contact|contacts|team|teams|organization|organisations|company|companies|business|businesses|product|products|feature|features|function|functions|capability|capabilities|ability|abilities|skill|skills|knowledge|understanding|learning|teaching|education|training|course|courses|class|classes|lesson|lessons|exercise|exercises|practice|practicing|test|tests|exam|exams|quiz|quizzes|grade|grades|mark|marks|score|scores|rating|ratings|review|reviews|feedback|opinion|opinions|thought|thoughts|idea|ideas|concept|concepts|theory|theories|hypothesis|hypotheses|experiment|experiments|research|study|studies|analysis|analyses|data|information|knowledge|wisdom|intelligence|smart|clever|genius|brilliant|excellent|great|good|bad|worse|worst|better|best|improve|improved|improvement|improvements|fix|fixed|fixed|repair|repaired|debug|debugging|problem|problems|issue|issues|bug|bugs|flaw|flaws|defect|defects|fault|faults|failure|failures|crash|crashed|broken|breaking|fix|fixes|patch|patches|update|updates|upgrade|upgraded|version|versions|release|released|launch|launched|deploy|deployed|install|installed|uninstall|uninstalled|setup|setups|configure|configured|configuration|configurations|adjust|adjusted|tune|tuned|calibrate|calibrated|optimize|optimized|optimization|optimizations|performance|speed|speeds|fast|slow|quick|rapid|instant|immediate|delay|delayed|delay|latency|timeout|timed|timing|schedule|scheduled|scheduling|calendar|calendars|date|dates|time|times|clock|clocks|timer|timers|alarm|alarms|reminder|reminders|notification|notifications|alert|alerts|warning|warnings|error|errors|message|messages|status|statuses|state|states|condition|conditions|progress|progression|advancement|achievement|accomplishment|success|failure|win|won|lose|lost|tie|tied|draw|drew|match|matches|game|games|play|playing|player|players|opponent|opponents|team|teams|league|leagues|competition|competitions|tournament|tournaments|championship|championships|race|races|contest|contests|event|events|activity|activities|action|actions|movement|movements|motion|motions|speed|velocity|acceleration|force|forces|power|energy|energy|fuel|fuels|electricity|electric|electrical|magnetic|magnetism|gravity|weight|mass|volume|density|temperature|heat|cold|hot|warm|cool|cold|wet|dry|moist|humid|weather|climate|season|seasons|spring|summer|autumn|winter|rain|snow|ice|wind|storm|thunder|lightning|flood|drought|earthquake|volcano|hurricane|typhoon|tornado|cyclone|monsoon|tsunami|avalanche|landslide|fire|fire|smoke|ash|dust|sand|dirt|soil|clay|mud|stone|rock|gravel|pebble|crystal|gem|jewel|jewelry|gold|silver|copper|iron|steel|metal|aluminum|alloy|plastic|rubber|glass|ceramic|porcelain|paper|cardboard|fabric|cloth|textile|cotton|wool|silk|leather|skin|hair|fur|feather|scale|horn|antler|bone|tooth|claw|nail|finger|hand|arm|shoulder|chest|back|spine|neck|head|face|eye|eyes|ear|ears|nose|mouth|lip|lips|tongue|throat|jaw|chin|cheek|forehead|brow|brow|hair|scalp|skull|brain|mind|thought|thoughts|emotion|emotions|feeling|feelings|desire|wants|wish|wishes|dream|dreams|hope|hopes|fear|fears|anxiety|stress|tension|pressure|stress|calm|peace|peaceful|happy|sad|angry|mad|furious|glad|joy|joyful|delight|delighted|excite|excited|excitement|surprise|surprised|shock|shocked|amaze|amazed|amazing|astonish|astonished|wonder|wondered|wondering|curious|interest|interested|interesting|bore|bored|boring|tired|exhausted|weary|sleepy|sleep|sleeping|awake|awaken|wake|woken|rest|resting|relax|relaxed|relaxation|recovery|recover|recovered|heal|healed|healthy|sick|ill|disease|diseases|illness|injury|injured|hurt|pain|painful|ache|achy|sore|stiff|cramp|cramps|spasm|spasms|shiver|shivering|tremble|trembling|shudder|shuddering|sweat|sweating|perspire|perspiring|blush|blushing|flush|flushing|pale|pallid|whitewash|white|white|black|black|red|red|blue|blue|green|green|yellow|yellow|orange|orange|purple|purple|pink|pink|brown|brown|grey|gray|beige|beige|tan|tan|cream|ivory|marble|marble|porcelain|porcelain|silver|silver|gold|golden|bronze|bronze|copper|copper|brass|brass|tin|tin|lead|lead|zinc|zinc|nickel|nickel|chrome|chrome|platinum|platinum|titanium|titanium|tungsten|tungsten|mercury|mercury|uranium|uranium|plutonium|plutonium|neutron|proton|electron|atom|molecule|compound|element|elements|substance|substances|material|materials|matter|mass|volume|density|weight|gravity|force|forces|energy|power|electricity|magnetism|optics|light|light|dark|darkness|shadow|shadows|reflection|reflections|refraction|refractions|absorption|absorptions|emission|emissions|radiation|radiations|wave|waves|frequency|frequencies|amplitude|amplitudes|wavelength|wavelengths|spectrum|spectra|prism|prism|lens|lenses|mirror|mirrors|camera|cameras|photo|photos|picture|pictures|image|images|drawing|drawings|painting|paintings|sketch|sketches|diagram|diagrams|chart|charts|graph|graphs|map|maps|plan|plans|blueprint|blueprints|model|models|prototype|prototypes|design|designs|layout|layouts|structure|structures|framework|frameworks|scaffold|scaffolds|architecture|architectures|building|buildings|construction|constructions|infrastructure|infrastructures|system|systems|network|networks|grid|grids|circuit|circuits|device|devices|machine|machines|engine|engines|motor|motors|generator|generators|battery|batteries|cell|cells|fuel|fuels|energy|energies|source|sources|supply|supplies|demand|demands|market|markets|economy|economies|trade|trades|commerce|business|businesses|industry|industries|manufacturing|production|production|factory|factories|workshop|workshops|studio|studios|office|offices|shop|shops|store|stores|mall|malls|marketplace|marketplaces|storefront|storefronts|counter|counters|shelf|shelves|rack|racks|display|displays|window|windows|door|doors|gate|gates|wall|walls|floor|floors|ceiling|ceilings|roof|roofs|foundation|foundations|base|bases|top|tops|bottom|bottoms|side|sides|edge|edges|corner|corners|angle|angles|curve|curves|line|lines|point|points|shape|shapes|form|forms|pattern|patterns|texture|textures|surface|surfaces|face|faces|plane|planes|solid|solids|liquid|liquids|gas|gases|plasma|plasmas|state|states|phase|phases|transition|transitions|change|changes|transformation|transformations|conversion|conversions|process|processes|procedure|procedures|method|methods|technique|techniques|approach|approaches|strategy|strategies|tactic|tactics|plan|plans|scheme|schemes|program|programs|project|projects|campaign|campaigns|initiative|initiatives|effort|efforts|endeavor|endeavors|undertaking|undertakings|task|tasks|assignment|assignments|duty|duties|responsibility|responsibilities|obligation|obligations|commitment|commitments|promise|promises|agreement|agreements|contract|contracts|deal|deals|bargain|bargains|transaction|transactions|exchange|exchanges|trade|trades|commerce|commerce|commerce|commerce)\b'

# Sinks: DOM-ish contexts where a string literal is user-visible
SINKS = [
    (re.compile(r'textContent\s*=\s*["\']', re.I), 'textContent'),
    (re.compile(r'innerText\s*=\s*["\']', re.I), 'innerText'),
    (re.compile(r'innerHTML\s*=\s*[`"\'"]', re.I), 'innerHTML'),
    (re.compile(r'aria-[a-z-]+\s*=\s*["\']', re.I), 'aria-*'),
    (re.compile(r'\btitle\s*=\s*["\']', re.I), 'title='),
    (re.compile(r'placeholder\s*=\s*["\']', re.I), 'placeholder='),
    (re.compile(r'data-tip\s*=\s*["\']', re.I), 'data-tip'),
    (re.compile(r'<button[^>]*>([^<]{3,})'), '<button>'),
    (re.compile(r'<label[^>]*>([^<]{3,})'), '<label>'),
    (re.compile(r'\btoast\s*\(\s*["\']', re.I), 'toast()'),
    (re.compile(r'\bstatus\w*\s*\(\s*["\']', re.I), 'status()'),
    (re.compile(r'appendChild\(document\.createTextNode\(["\']'), 'textNode'),
    (re.compile(r'\.append\(\s*["\']'), 'append(str)'),
    (re.compile(r'alt\s*=\s*["\']', re.I), 'alt='),
    (re.compile(r'prompt\s*\(\s*["\']', re.I), 'prompt()'),
    (re.compile(r'confirm\s*\(\s*["\']', re.I), 'confirm()'),
    (re.compile(r'alert\s*\(\s*["\']', re.I), 'alert()'),
]
STR_RE = re.compile(r'["\']([^"\']{3,160})["\']')
EN_RE = re.compile(EN_WORDS, re.I)

def looks_visible(s):
    # heuristic filters for UI text
    if s.startswith(('http://','https://','data:','#','--','//')): return False
    if re.fullmatch(r'[a-z0-9_\-./]+', s): return False  # identifier-ish
    if s.isupper() and len(s) < 4: return False
    if any(ch in s for ch in '<>{}()') and '<' in s and 'div' in s: return True
    return True

results = []
roots = sys.argv[1:]
for root in roots:
    for dirpath, dirnames, filenames in os.walk(root):
        if 'node_modules' in dirpath: continue
        for fn in filenames:
            if not fn.endswith(('.js', '.html')): continue
            p = os.path.join(dirpath, fn)
            try:
                lines = open(p, encoding='utf-8', errors='replace').read().split('\n')
            except Exception:
                continue
            for i, line in enumerate(lines, 1):
                for rx, sink in SINKS:
                    m = rx.search(line)
                    if not m: continue
                    tail = line[m.end()-1:]
                    for sm in STR_RE.finditer(line):
                        s = sm.group(1)
                        if not looks_visible(s): continue
                        if EN_RE.search(s):
                            results.append({'file': p, 'line': i, 'sink': sink, 'text': s})
                        break  # first string after sink marker

json.dump(results, open('.pi/inventory/en-strings.json','w'), ensure_ascii=False, indent=0)
# summary by file
from collections import Counter
c = Counter(r['file'] for r in results)
print(f"TOTAL: {len(results)} candidate English strings in {len(c)} files")
for f, n in c.most_common(40):
    print(f"{n:5d}  {f}")
