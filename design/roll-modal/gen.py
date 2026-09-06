# Generates the seven artboards from shared pieces so every frame carries
# the app's exact tokens (apps/app/src/theme/tokens.ts) and component anatomy.
import json, os

PAPER='#FBF3E1'; INK='#16110C'; OCHRE='#C1873A'; BINDING='#A87030'; VERM='#8E2417'; DIM='#3A2A12'; DIS='#E4D6B4'; FRAME='#8E6428'
SANS="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
SERIF="Georgia, serif"; MONO="ui-monospace, Menlo, Consolas, monospace"

PIPS={1:[(26,26)],2:[(16,16),(36,36)],3:[(14,14),(26,26),(38,38)],4:[(16,16),(36,16),(16,36),(36,36)],5:[(16,16),(36,16),(26,26),(16,36),(36,36)],6:[(16,13),(36,13),(16,26),(36,26),(16,39),(36,39)]}

def die_svg(face, size, cls=''):
    pips=''.join(f'<circle cx="{x}" cy="{y}" r="4.6" fill="{INK}"></circle>' for x,y in PIPS.get(face,[]))
    return f'<svg class="{cls}" width="{size}" height="{size}" viewBox="0 0 52 52"><rect x="2.5" y="2.5" width="47" height="47" fill="none" stroke="{INK}" stroke-width="3.5"></rect>{pips}</svg>'

def anim_die(final, size, delay=0):
    """A die that tumbles through six faces then lands. Faces stacked; CSS keyframes cycle them (5s demo loop)."""
    faces=''.join(f'<div class="f f{k}" style="position:absolute;inset:0;animation-delay:{delay}ms">{die_svg(k,size)}</div>' for k in range(1,7))
    return f'<div class="tumble" style="position:relative;width:{size}px;height:{size}px;animation-delay:{delay}ms">{faces}<div class="f land" style="position:absolute;inset:0;animation-delay:{delay}ms">{die_svg(final,size)}</div></div>'

def picker(chosen=(), size=15):
    cells=''
    for k in range(1,7):
        on = k in chosen
        cells+=f'<div style="flex:1;display:flex;align-items:center;justify-content:center;padding:7px 0;border:2px solid {INK};background:{INK if on else PAPER};font-family:{SANS};font-size:{size}px;font-weight:800;color:{PAPER if on else INK}">{k}</div>'
    return f'<div style="display:flex;gap:5px">{cells}</div>'

PLATE_GATE=f'''<svg width="100%" height="100%" viewBox="0 0 320 140" preserveAspectRatio="xMidYMid meet" style="display:block">
<g fill="none" stroke="{INK}" stroke-width="6" stroke-linecap="square">
<path d="M60 130 V40 M260 130 V40 M40 40 H280 M52 28 H268"></path>
<path d="M120 130 V60 M200 130 V60 M120 60 H200"></path>
<path d="M150 95 h20"></path>
</g>
<g fill="none" stroke="{INK}" stroke-width="4" stroke-linecap="round">
<path d="M285 20 q-30 30 -10 70 M300 30 q-40 40 -20 90 M20 26 q30 30 12 66"></path>
</g>
<g fill="{VERM}"><rect x="228" y="70" width="10" height="10"></rect><rect x="228" y="86" width="10" height="10"></rect><rect x="228" y="102" width="10" height="10"></rect></g>
</svg>'''

def plate(h, caption='PLATE · SKILL CHECK / STAMINA', sub='SVG, ours · placeholder', pad=8):
    return f'''<div style="border:3px dashed {INK};background:{PAPER};padding:{pad}px;display:flex;flex-direction:column;gap:4px">
<div style="height:{h}px">{PLATE_GATE}</div>
<div style="display:flex;justify-content:space-between;gap:8px;font-family:{MONO};font-size:9px;letter-spacing:0.8px;color:{DIM}"><span>{caption}</span><span>{sub}</span></div>
</div>'''

def btn(text, primary=False, small=False, flex=None, disabled=False, extra=''):
    st=f"display:flex;align-items:center;justify-content:center;"
    st+= f"background:{INK};color:{PAPER};padding:12px 12px;" if primary else f"background:{PAPER};color:{INK};border:3px solid {INK};padding:9px 12px;"
    if small: st=st.replace('padding:9px 12px','padding:6px 7px')
    st+=f"font-family:{SANS};font-weight:800;font-size:{10 if small else 14}px;letter-spacing:{0.6 if small else 1.1}px;"
    if flex: st+=f"flex:{flex};"
    if disabled: st+="opacity:0.55;"
    return f'<div style="{st}{extra}">{text}</div>'

def header(place='AREA 2 OF 8 · CAVE ENTRANCE'):
    nav=''.join(btn(t,small=True) for t in ['RULES','RECORD','VILLAGE','MAP'])
    return f'''<div style="padding:34px 14px 10px;display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
<div style="background:{PAPER};border:3px solid {INK};padding:5px 9px;flex-shrink:1">
<div style="font-family:{SANS};font-size:12px;font-weight:800;letter-spacing:1.7px;color:{INK}">THE 5 TREASURES</div>
<div style="font-family:{MONO};font-size:10px;margin-top:2px;color:{INK}">{place}</div></div>
<div style="display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px;flex-shrink:1;max-width:190px">{nav}</div></div>'''

def strip():
    cells=[('SKL','8',False,1),('END','20',True,1.3),('LCK','9',False,1),('GP','3',False,1)]
    out=''
    for i,(n,v,inv,fl) in enumerate(cells):
        bg=INK if inv else PAPER; fg=PAPER if inv else INK
        div=f"border-right:2px solid {INK};" if i<3 else ''
        out+=f'<div style="flex:{fl};padding:5px 0;display:flex;flex-direction:column;align-items:center;background:{bg};{div}"><div style="font-family:{SANS};font-size:9px;font-weight:800;color:{fg}">{n}</div><div style="font-family:{SANS};font-size:17px;font-weight:800;color:{fg}">{v}</div></div>'
    return f'<div style="margin:0 14px;display:flex;background:{PAPER};border:3px solid {INK}">{out}</div>'

LINE="A gate shut under a willow, and three red characters nobody painted for you. The stream goes in and stops talking."
def line_slip():
    return f'<div style="margin:10px 14px 0;padding:11px;background:{PAPER};border:3px solid {INK};font-family:{SERIF};font-size:17px;line-height:25px;color:{INK}">{LINE}</div>'

def menu_row(title, note, line, disabled=False):
    bg=DIS if disabled else PAPER; op='opacity:0.55;' if disabled else ''
    return f'''<div style="background:{bg};{op}border:3px solid {INK};padding:7px 9px">
<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px"><div style="font-family:{SANS};font-size:14px;font-weight:800;letter-spacing:0.3px;color:{INK}">{title}</div><div style="font-family:{MONO};font-size:10px;color:{INK};text-align:right">{note}</div></div>
<div style="font-family:{SERIF};font-size:13px;line-height:18px;margin-top:3px;color:{INK}">{line}</div></div>'''

def menu():
    rows=menu_row('FORCE THE SHUT GATE','SKILL CHECK · STAMINA','Wood, iron, and a willow that has grown around both.')+menu_row('REST BY THE STREAM','+4 END','A night here costs you the morning.')+menu_row('GO IN, TO THE ATTENDANTS ROOM','AREA 3','Shrill voices, and then none.')
    return f'<div style="padding:6px 14px;display:flex;flex-direction:column;gap:7px">{rows}</div>'

def result_slip():
    return f'''<div style="margin:4px 14px 2px;background:{PAPER};border:3px solid {INK}">
<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 9px;background:{INK}"><div style="font-family:{SANS};font-size:11px;font-weight:800;letter-spacing:0.9px;color:{PAPER}">SKILL CHECK · PASSED</div><div style="padding:2px 6px;border:2px solid {INK};background:{INK};font-family:{SANS};font-size:9px;font-weight:800;letter-spacing:0.6px;color:{PAPER}">R MH p.22 (R20)</div></div>
<div style="display:flex;align-items:center;gap:9px;padding:10px 9px">{die_svg(4,40)}{die_svg(6,40)}<div style="margin-left:auto;display:flex;flex-direction:column;align-items:flex-end"><div style="font-family:{SANS};font-size:34px;font-weight:800;line-height:36px;color:{INK}">10</div><div style="font-family:{MONO};font-size:10px;color:{INK}">against SKILL 8 +2 (STAMINA)</div></div></div>
<div style="border-top:2px solid {INK};padding:6px 9px;font-family:{MONO};font-size:10px;line-height:15px;color:{INK}">MH p.22 (R20) · equal or under passes · 10 &lt;= 10</div></div>'''

def free_text():
    return f'''<div style="border:2px dashed {INK};background:{PAPER};padding:7px 9px">
<div style="display:flex;justify-content:space-between;gap:8px;font-family:{MONO};font-size:10px;letter-spacing:0.8px;color:{INK}"><span>YOUR PASSAGE · 0 WRITTEN</span><span>OPTIONAL</span></div>
<div style="margin-top:5px;min-height:40px;font-family:{SERIF};font-size:14px;line-height:20px;color:{DIM}">Write it down, or don't.</div></div>'''

def roll_bar(single=False, primary_text='ROLL 2d6', right='DEEDS 0'):
    buttons = btn(primary_text,primary=True,flex='1') if single else btn(primary_text,primary=True,flex='1.3')+btn('MY DICE',flex='1')
    return f'''<div style="padding:4px 14px 14px"><div style="margin-top:10px">{free_text()}</div>
<div style="display:flex;gap:8px;margin-top:8px">{buttons}</div>
<div style="display:flex;justify-content:space-between;margin-top:7px;font-family:{MONO};font-size:10px;color:{DIM}"><span>OVERRIDES 0</span><span>{right}</span></div></div>'''

def sheet(with_result=False, single=False):
    return f'<div style="flex-shrink:0;border-top:3px solid {INK};background:{PAPER};padding-top:4px">{result_slip() if with_result else ""}{menu()}{roll_bar(single=single)}</div>'

BINDING_SVG=f'''<svg width="26" height="844" viewBox="0 0 26 844" preserveAspectRatio="none" style="display:block"><path d="M13 40 V804" stroke="{PAPER}" stroke-width="2"></path><g fill="{INK}"><circle cx="13" cy="150" r="5"></circle><circle cx="13" cy="320" r="5"></circle><circle cx="13" cy="490" r="5"></circle><circle cx="13" cy="660" r="5"></circle></g><g fill="none" stroke="{PAPER}" stroke-width="2"><path d="M13 150 q10 -18 0 -36"></path><path d="M13 320 q10 -18 0 -36"></path><path d="M13 490 q10 -18 0 -36"></path><path d="M13 660 q10 -18 0 -36"></path></g></svg>'''

CSS=f'''
body {{ margin:0; background:{FRAME}; }}
a {{ color:{VERM}; }} a:hover {{ color:{INK}; }}
.frame {{ width:390px; height:844px; display:flex; background:{OCHRE}; border-left:1px solid {INK}; border-right:1px solid {INK}; box-sizing:border-box; position:relative; overflow:hidden; }}
.binding {{ width:26px; background:{BINDING}; flex-shrink:0; }}
.page {{ flex:1; display:flex; flex-direction:column; min-width:0; }}
.f {{ opacity:0; animation:none 5s infinite; }}
.f1 {{ animation-name:s1 }} .f2 {{ animation-name:s2 }} .f3 {{ animation-name:s3 }} .f4 {{ animation-name:s4 }} .f5 {{ animation-name:s5 }} .f6 {{ animation-name:s6 }}
.land {{ animation-name:land }}
.tumble {{ animation:tumble 5s infinite; transform-origin:50% 50%; }}
.after {{ opacity:0; animation:after 5s infinite; }}
.during {{ opacity:1; animation:during 5s infinite; }}
@keyframes s1 {{ 0%,2.9%{{opacity:1}} 3%,100%{{opacity:0}} }}
@keyframes s2 {{ 0%,2.9%{{opacity:0}} 3%,5.9%{{opacity:1}} 6%,100%{{opacity:0}} }}
@keyframes s3 {{ 0%,5.9%{{opacity:0}} 6%,8.9%{{opacity:1}} 9%,100%{{opacity:0}} }}
@keyframes s4 {{ 0%,8.9%{{opacity:0}} 9%,11.9%{{opacity:1}} 12%,100%{{opacity:0}} }}
@keyframes s5 {{ 0%,11.9%{{opacity:0}} 12%,14.9%{{opacity:1}} 15%,100%{{opacity:0}} }}
@keyframes s6 {{ 0%,14.9%{{opacity:0}} 15%,17.9%{{opacity:1}} 18%,100%{{opacity:0}} }}
@keyframes land {{ 0%,17.9%{{opacity:0}} 18%,100%{{opacity:1}} }}
@keyframes tumble {{ 0%{{transform:rotate(0) translateY(-6px)}} 6%{{transform:rotate(-14deg) translateY(2px)}} 12%{{transform:rotate(11deg) translateY(-3px)}} 18%{{transform:rotate(0) translateY(0)}} 100%{{transform:rotate(0)}} }}
@keyframes after {{ 0%,19%{{opacity:0}} 24%,100%{{opacity:1}} }}
@keyframes during {{ 0%,18%{{opacity:1}} 19%,100%{{opacity:0}} }}
'''

def doc(title, body, extra_css=''):
    return f'''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <style>{CSS}{extra_css}</style>
</helmet>
{body}
</x-dc>
</body>
</html>'''

def frame(inner, overlay=''):
    return f'<div class="frame"><div class="binding">{BINDING_SVG}</div><div class="page">{inner}</div>{overlay}</div>'

# ---------- the reason block, shared wording (content package keys; copy is the app's)
def reason(size_title=14):
    return f'''<div style="font-family:{SANS};font-size:{size_title}px;font-weight:800;letter-spacing:0.3px;color:{INK}">FORCE THE SHUT GATE</div>
<div style="font-family:{MONO};font-size:10px;color:{INK};margin-top:2px">SKILL CHECK · STAMINA · against SKILL 8 +2 · 10 or under passes</div>'''

def head_bar(during='ROLLING', after='SKILL CHECK · PASSED', pill='R MH p.22 (R20)'):
    return f'''<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 9px;background:{INK}">
<div style="position:relative;font-family:{SANS};font-size:11px;font-weight:800;letter-spacing:0.9px;color:{PAPER}"><span class="during" style="position:absolute;left:0;top:0;white-space:nowrap">{during}</span><span class="after">{after}</span></div>
<div class="after" style="padding:2px 6px;border:2px solid {INK};background:{INK};font-family:{SANS};font-size:9px;font-weight:800;letter-spacing:0.6px;color:{PAPER}">{pill}</div></div>'''

def total(size=34, lh=36):
    return f'<div class="after" style="margin-left:auto;display:flex;flex-direction:column;align-items:flex-end"><div style="font-family:{SANS};font-size:{size}px;font-weight:800;line-height:{lh}px;color:{INK}">10</div><div style="font-family:{MONO};font-size:10px;color:{INK}">4 + 6 · passes</div></div>'

cite=f'<div style="border-top:2px solid {INK};padding:6px 9px;font-family:{MONO};font-size:10px;line-height:15px;color:{INK}">MH p.22 (R20) · equal or under passes · 10 &lt;= 10</div>'
cite_manual=f'<div style="border-top:2px solid {INK};padding:6px 9px;font-family:{MONO};font-size:10px;line-height:15px;color:{DIM}">MH p.22 (R20) · the check resolves when you use them · OVERRIDES +1</div>'

# ---------- A · THE CARD: centred overlay over a dimmed beat
def card_a(manual=False):
    dice = picker((4,6)) if manual else f'<div style="display:flex;align-items:center;gap:12px">{anim_die(4,72)}{anim_die(6,72,120)}{total(44,46)}</div>'
    status = f'<div style="font-family:{MONO};font-size:11px;color:{INK};margin-top:7px">YOUR DICE: 4 AND 6 · COUNTS AS AN OVERRIDE</div>' if manual else ''
    foot = (btn('ROLL INSTEAD',flex='1')+btn('USE MY DICE',primary=True,flex='1.3')) if manual else (btn('MY DICE',flex='1')+btn('KEEP IT',primary=True,flex='1.3'))
    card=f'''<div style="position:absolute;left:14px;right:14px;top:170px;background:{PAPER};border:3px solid {INK};box-shadow:6px 6px 0 {INK}">
{head_bar('ROLLING' if not manual else 'THE DICE ON YOUR TABLE','SKILL CHECK · PASSED') if not manual else head_bar('THE DICE ON YOUR TABLE','THE DICE ON YOUR TABLE','+ override')}
<div style="padding:9px 9px 0">{reason()}</div>
<div style="padding:12px 9px 10px">{dice}{status}</div>
<div style="padding:0 9px 9px">{plate(120)}</div>
{cite_manual if manual else cite}
<div style="display:flex;gap:8px;padding:9px">{foot}</div></div>'''
    overlay=f'<div style="position:absolute;inset:0;background:rgba(22,17,12,0.55)"></div>{card}'
    inner=header()+strip()+f'<div style="flex:1">{line_slip()}</div>'+sheet(single=True)
    return doc('Card', frame(inner, overlay))

# ---------- B · THE SHEET: the roll takes the bottom sheet's place; the line stays lit
def sheet_b(manual=False):
    dice_row = f'<div style="display:flex;align-items:center;gap:10px;padding:10px 9px">{anim_die(4,56)}{anim_die(6,56,120)}{total(40,42)}</div>'
    if manual:
        dice_row = f'<div style="padding:10px 9px"><div style="display:flex;align-items:center;gap:10px">{die_svg(4,56)}{die_svg(6,56)}<div style="margin-left:auto;font-family:{MONO};font-size:11px;color:{INK};text-align:right">FIRST DIE 4<br>SECOND DIE 6</div></div><div style="margin-top:9px">{picker((4,6))}</div></div>'
    panel=f'''<div style="flex-shrink:0;border-top:3px solid {INK};background:{PAPER};padding:4px 14px 14px">
<div style="margin-top:4px;background:{PAPER};border:3px solid {VERM if manual else INK}">
{head_bar('ROLLING','SKILL CHECK · PASSED') if not manual else head_bar('THE DICE ON YOUR TABLE','THE DICE ON YOUR TABLE','+ override')}
<div style="padding:9px 9px 0">{reason()}</div>
{dice_row}
{cite_manual if manual else cite}</div>
<div style="margin-top:8px">{plate(84, pad=6)}</div>
<div style="display:flex;gap:8px;margin-top:8px">{(btn('ROLL INSTEAD',flex='1')+btn('USE MY DICE',primary=True,flex='1.3')) if manual else (btn('MY DICE',flex='1')+btn('SEAL IT',primary=True,flex='1.3'))}</div>
<div style="display:flex;justify-content:space-between;margin-top:7px;font-family:{MONO};font-size:10px;color:{DIM}"><span>OVERRIDES 0</span><span>THE MENU RETURNS WHEN SEALED</span></div></div>'''
    inner=header()+strip()+f'<div style="flex:1">{line_slip()}</div>'+panel
    return doc('Sheet', frame(inner))

# ---------- C · THE LEAF: a full page under the header; the plate leads
def leaf_c(manual=False):
    dice = (f'<div style="display:flex;justify-content:center;gap:16px">{anim_die(4,88)}{anim_die(6,88,120)}</div>') if not manual else f'<div style="display:flex;justify-content:center;gap:16px">{die_svg(4,88)}{die_svg(6,88)}</div><div style="margin-top:10px">{picker((4,6),17)}</div>'
    tot = f'<div class="after" style="text-align:center;margin-top:8px"><div style="font-family:{SANS};font-size:56px;font-weight:800;line-height:58px;color:{INK}">10</div><div style="font-family:{MONO};font-size:11px;color:{INK}">against SKILL 8 +2 (STAMINA) · PASSED</div></div>' if not manual else f'<div style="text-align:center;margin-top:8px;font-family:{MONO};font-size:11px;color:{INK}">YOUR DICE: 4 AND 6 · COUNTS AS AN OVERRIDE</div>'
    page=f'''<div style="flex:1;display:flex;flex-direction:column;margin:10px 14px 14px;min-height:0">
<div style="flex:1;display:flex;flex-direction:column;background:{PAPER};border:3px solid {INK};min-height:0">
{head_bar('ROLLING','SKILL CHECK · PASSED') if not manual else head_bar('THE DICE ON YOUR TABLE','THE DICE ON YOUR TABLE','+ override')}
<div style="padding:9px 9px 0">{reason(16)}</div>
<div style="padding:9px">{plate(150, pad=10)}</div>
<div style="padding:4px 9px 0">{dice}{tot}</div>
<div style="margin-top:auto">{cite_manual if manual else cite}</div></div>
<div style="display:flex;gap:8px;margin-top:8px">{(btn('ROLL INSTEAD',flex='1')+btn('USE MY DICE',primary=True,flex='1.3')) if manual else (btn('MY DICE',flex='1')+btn('TURN THE LEAF',primary=True,flex='1.3'))}</div>
<div style="display:flex;justify-content:space-between;margin-top:7px;font-family:{MONO};font-size:10px;color:{DIM}"><span>OVERRIDES 0</span><span>THE BEAT WAITS BEHIND THIS</span></div></div>'''
    inner=header()+strip()+page
    return doc('Leaf', frame(inner))

# ---------- the beat after: what all three leave behind (result kept, manual dice gone, one button)
def beat_after():
    inner=header()+strip()+f'<div style="flex:1">{line_slip()}</div>'+sheet(with_result=True, single=True)
    return doc('Beat after', frame(inner))

def beat_today():
    inner=header()+strip()+f'<div style="flex:1">{line_slip()}</div>'+sheet(with_result=True, single=False)
    return doc('Beat today', frame(inner))

files={
 'Main.dc.html': card_a(),
 'CardMyDice.dc.html': card_a(manual=True),
 'Sheet.dc.html': sheet_b(),
 'SheetMyDice.dc.html': sheet_b(manual=True),
 'Leaf.dc.html': leaf_c(),
 'LeafMyDice.dc.html': leaf_c(manual=True),
 'BeatAfter.dc.html': beat_after(),
 'BeatToday.dc.html': beat_today(),
}
for k,v in files.items(): open(k,'w').write(v)

W=390;H=844;GX=110;GY=170
canvas={
 "artboards":[
  {"file":"BeatToday.dc.html","x":0,"y":0,"w":W,"h":H,"title":"Today · the beat as shipped"},
  {"file":"Main.dc.html","x":(W+GX)*1,"y":0,"w":W,"h":H,"title":"A · The Card"},
  {"file":"Sheet.dc.html","x":(W+GX)*2,"y":0,"w":W,"h":H,"title":"B · The Sheet"},
  {"file":"Leaf.dc.html","x":(W+GX)*3,"y":0,"w":W,"h":H,"title":"C · The Leaf"},
  {"file":"BeatAfter.dc.html","x":0,"y":H+GY,"w":W,"h":H,"title":"After · the beat all three leave behind"},
  {"file":"CardMyDice.dc.html","x":(W+GX)*1,"y":H+GY,"w":W,"h":H,"title":"A · my dice"},
  {"file":"SheetMyDice.dc.html","x":(W+GX)*2,"y":H+GY,"w":W,"h":H,"title":"B · my dice"},
  {"file":"LeafMyDice.dc.html","x":(W+GX)*3,"y":H+GY,"w":W,"h":H,"title":"C · my dice"},
 ],
 "annotations":[
  {"id":"read-me","x":0,"y":-230,"w":390,"text":"THE ROLL MODAL · three readings of one idea\n\nTop row: the roll landing (the dice tumble on a 5s loop). Bottom row: the same modal when the player taps MY DICE and enters the faces from the table.\n\nEvery reading keeps the two dice, the label pill and the citation on screen after it closes (design/INDEX.md constraint) and takes the manual-dice slip and the MY DICE button off the beat.\n\nThe plate is a dashed SVG placeholder: spec.md refuses credited art, so the image slot is drawn geometry of ours, keyed by the roll's reason."},
  {"id":"note-a","x":(W+GX)*1,"y":-230,"w":390,"text":"A · THE CARD\nA centred card over a dimmed beat. Reason on top, dice and total in the middle, the plate under them, the citation as the card's foot. KEEP IT closes it; the result slip stays on the sheet.\n\nBet: the roll is an interruption worth a spotlight; the modal is the familiar shape.\nCost: the primary button leaves the thumb zone (card foot is mid-screen); the plate is small; the dimmed line behind is unreadable while it is up."},
  {"id":"note-b","x":(W+GX)*2,"y":-230,"w":390,"text":"B · THE SHEET\nThe roll takes the bottom sheet's place: the menu folds away, the roll panel rises where it was, the authored line stays lit above. SEAL IT collapses the panel into the result slip and the menu returns.\n\nBet: keeps layout B's reason for being (everything pressable in the bottom third, nothing scrolls away). One-handed.\nCost: the plate gets a short band, not a picture; the sheet grows taller than the menu it replaces, so the line loses a few lines."},
  {"id":"note-c","x":(W+GX)*3,"y":-230,"w":390,"text":"C · THE LEAF\nA full page under the header, like turning a leaf of the book. The plate leads, the dice fall over it, the total is the biggest thing on screen. TURN THE LEAF goes back to the beat with the result slip in place.\n\nBet: a roll is a moment; give it the whole page and let the plate carry the mood.\nCost: hides the line and the menu entirely (most taps per beat); the most work per plate; on a long sitting the ceremony may wear."},
  {"id":"note-after","x":0,"y":H+GY-120,"w":390,"text":"What the beat gains: the manual-dice slip and the MY DICE button leave the sheet. One full-width ROLL 2d6. The menu keeps its rows in the bottom half (the e2e that guards layout B still holds)."},
 ],
 "launch":{"view":"canvas"}
}
json.dump(canvas, open('canvas.json','w'), indent=1)
print('wrote', list(files))
