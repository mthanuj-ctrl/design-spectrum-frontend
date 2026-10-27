"""Run once inside the frontend folder. Adds 8 new styles, extras, the chatbot, and 4 bug fixes to YOUR index.html + style.css. Safe to run twice."""
import re, pathlib
P = pathlib.Path
H, C = P('index.html').read_text(encoding='utf-8'), P('style.css').read_text(encoding='utf-8')
NEW = [('cyber','Cyberpunk'),('pixel','Retro Pixel'),('aurora','Aurora'),('swiss','Swiss'),('y2k','Y2K Chrome'),('term','Terminal'),('memphis','Memphis'),('neubrut','Neubrutalism')]
LIGHT = "['neo','mini','brutal','bento','clay','swiss','y2k','memphis','neubrut']"
if 'id="cyber"' not in H:
    H = H.replace('<!-- Footer -->', P('new_sections.html').read_text(encoding='utf-8') + '\n<!-- Footer -->')
    H = H.replace('<div class="nav-pip" data-target="clay"></div>', '<div class="nav-pip" data-target="clay"></div>' + ''.join('\n    <div class="nav-pip" data-target="%s"></div>' % k for k, _ in NEW))
    H = H.replace('<span class="footer-pill">Claymorphism</span>', '<span class="footer-pill">Claymorphism</span>' + ''.join('\n    <span class="footer-pill">%s</span>' % n for _, n in NEW))
    H = H.replace("clay: 'Claymorphism'", "clay: 'Claymorphism'," + ','.join("\n  %s: '%s'" % (k, n) for k, n in NEW))
    H = H.replace('ten styles, one scroll.', 'eighteen styles, one scroll.')
    C += '\n' + P('new_styles.css').read_text(encoding='utf-8')
if 'Press+Start+2P' not in H:
    H = H.replace('&display=swap" rel="stylesheet">', '&family=Press+Start+2P&display=swap" rel="stylesheet">', 1)
if 'chatbot.css' not in H:
    H = H.replace('<link rel="stylesheet" href="style.css">', '<link rel="stylesheet" href="style.css">\n<link rel="stylesheet" href="chatbot.css">')
tags = ''.join('<script src="%s"></script>\n' % f for f in ('config.js', 'extras.js', 'chatbot.js') if 'src="%s"' % f not in H)
if tags:
    H = H.replace('</body>', tags + '</body>')
if "'on-light'" not in H:
    H = H.replace("activeLabel.textContent = names[id] || '';", "activeLabel.textContent = names[id] || '';\n    document.getElementById('nav-ticker').classList.toggle('on-light', %s.includes(id));" % LIGHT)
H = re.sub(r"\['neo','mini','brutal','bento','clay'\]", LIGHT, H)
C = C.replace('scroll-snap-type: y mandatory', 'scroll-snap-type: y proximity')
C = re.sub(r'@keyframes spatialBob \{.*?\n\}', '@keyframes spatialBob {\n  0%,100% { translate: 0 0 0; }\n  50% { translate: 0 -16px 30px; }\n}', C, flags=re.S)
C = C.replace("font-family: 'DM Serif Display', serif;\n  color: #e8ccaa;", "font-family: 'DM Serif Display', serif;\n  font-weight: 400;\n  color: #e8ccaa;")
if 'on-light' not in C:
    C += "\n#nav-ticker.on-light{background:rgba(255,255,255,.45);border-bottom-color:rgba(0,0,0,.1)}\n#nav-ticker.on-light .wordmark,#nav-ticker.on-light #nav-active-label{color:rgba(0,0,0,.75)}\n#nav-ticker.on-light .nav-pip{background:rgba(0,0,0,.2)}\n#nav-ticker.on-light .nav-pip.active{background:#000}\n"
P('index.html').write_text(H, encoding='utf-8'); P('style.css').write_text(C, encoding='utf-8')
print('Done. 18 styles, extras and chatbot are in place.')
