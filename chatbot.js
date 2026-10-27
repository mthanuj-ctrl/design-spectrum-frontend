/* Design Spectrum Assistant: instant local commands + a separate backend (config.js sets its URL) */
(() => {
const MODEL = 'gemini-2.5-flash'; // if Google renames it, change this one line
const INFO = {
 skeuo:['Skeuomorphism','Imitates real objects. Tricks: layered gradients for metal/leather, a hard bottom box-shadow (0 6px 0) that shrinks on :active so the button looks pressed, and inset shadows for the sunken toggle.'],
 neo:['Neomorphism','One background colour for page AND element. A light shadow (top-left) plus a dark shadow (bottom-right) makes it pop out; the same shadows with the word inset make it look pressed in.'],
 glass:['Glassmorphism','Semi-transparent white (rgba) + backdrop-filter: blur() + a thin light border, placed over blurred coloured orbs so the blur has something to show.'],
 mini:['Minimalism','Lots of empty space, one font pair, thin 1px lines, tiny switches. Almost no colour or shadow.'],
 maxi:['Maximalism','Loud on purpose: many gradients, wiggling stickers, gradient text (background-clip:text) and animated counters.'],
 brutal:['Brutalism','Thick black borders, hard offset shadows with zero blur, monospace type, flat primary colours. On hover the card moves toward its shadow.'],
 liquid:['Liquid Glass','Glassmorphism with stronger blur+saturate, a highlight gradient on top, and morphing blob shapes (animated border-radius) behind.'],
 bento:['Bento Grid','CSS Grid with grid-column / grid-row spans so cards of different sizes tile like a lunch box.'],
 spatial:['Spatial UI','Depth with perspective + translateZ. JS tilts each card by mouse position, and data-depth changes how much each card moves.'],
 clay:['Claymorphism','Puffy, soft shapes: big border-radius, outer shadows for lift plus inset highlights/shadows for the 3D clay feel.']
};
Object.assign(INFO,{
 cyber:['Cyberpunk Neon','Dark base, cyan/magenta neon borders with glow box-shadows, scanlines from a repeating-linear-gradient, clip-path clipped corners, and a text-shadow glitch on hover.'],
 pixel:['Retro Pixel','Pixel font (Press Start 2P), border-radius 0, thick borders and hard black shadows. The coin presses down by moving 4px and shrinking its shadow.'],
 aurora:['Aurora Gradient','A big conic-gradient circle blurred with filter: blur(90px), slowly rotated, and moved by JS to follow the mouse behind frosted glass content.'],
 swiss:['Swiss / International','Strict CSS grid with 1px lines, ultra-bold Inter with tight letter-spacing, and a single red accent that fills a cell on hover.'],
 y2k:['Y2K Chrome','Glossy gel buttons from hard-stop gradients (two colours meeting at 48%/52%), chrome text with background-clip:text, candy background and a striped progress bar.'],
 term:['Terminal','Monospace green-on-black with a glow. JS reads the input on Enter and prints the result, so it behaves like a tiny shell.'],
 memphis:['Memphis Pop','Absolutely positioned geometric shapes, thick outlines, hard colour shadows. Colours are CSS variables, so one click repaints all of it.'],
 neubrut:['Neubrutalism','Brutalism softened: pastel fills, rounded corners, 3px black borders and hard offset shadows. Active tabs press in by moving to their shadow position.']
});
const RX = {skeuo:/\.skeuo-/,neo:/\.neo-/,glass:/\.glass-/,mini:/\.mini-/,maxi:/\.maxi-/,brutal:/\.brutal-/,liquid:/\.liquid-/,bento:/\.(bento-|bc\d)/,spatial:/\.spatial-/,clay:/\.clay-/};
Object.assign(RX,{cyber:/\.cy-/,pixel:/\.px-/,aurora:/\.au-/,swiss:/\.sw-/,y2k:/\.y2-/,term:/\.tm-/,memphis:/\.mm-/,neubrut:/\.nb-/});
const FONTS = (document.querySelector('link[href*="fonts.googleapis"]') || {}).href || '';
let cur = 'skeuo', rules = null, hist = [];
const $ = (t, c, p) => { const e = document.createElement(t); if (c) e.className = c; if (p) p.append(e); return e; };
const esc = s => s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

/* ---------- UI ---------- */
const root = $('div'); root.id = 'ds-chat'; document.body.append(root);
const fab = $('button', '', root); fab.id = 'ds-fab'; fab.textContent = '💬'; fab.title = 'Ask the design assistant';
const panel = $('div', '', root); panel.id = 'ds-panel';
panel.innerHTML = '<div class="ds-head"><div><b>Design Assistant</b><small id="ds-sec"></small></div><div><button id="ds-x">✕</button></div></div><div id="ds-msgs"></div><div id="ds-chips"></div><form id="ds-form"><textarea id="ds-in" placeholder="Ask about this section..."></textarea><button id="ds-send">Send</button></form>';
const msgs = panel.querySelector('#ds-msgs'), input = panel.querySelector('#ds-in');
fab.onclick = () => { panel.classList.toggle('open'); if (panel.classList.contains('open')) input.focus(); };
panel.querySelector('#ds-x').onclick = () => panel.classList.remove('open');
panel.onmouseenter = () => document.body.classList.add('over-chat');
panel.onmouseleave = () => document.body.classList.remove('over-chat');
fab.onmouseenter = panel.onmouseenter; fab.onmouseleave = panel.onmouseleave;
['Show HTML','Show CSS','Preview it','Explain it','Make it neon','Make it pixel','Make it pastel'].forEach(t => {
  const c = $('span', 'chip', panel.querySelector('#ds-chips')); c.textContent = t; c.onclick = () => ask(t);
});
panel.querySelector('#ds-form').onsubmit = e => { e.preventDefault(); const v = input.value.trim(); if (v) { input.value = ''; ask(v); } };
input.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); panel.querySelector('#ds-form').requestSubmit(); } };

function say(who, text) {
  const m = $('div', 'm ' + who, msgs); renderText(text, m); msgs.scrollTop = msgs.scrollHeight; return m;
}
function renderText(text, el) {
  const p = text.split(/```(\w*)\n?([\s\S]*?)```/g);
  for (let i = 0; i < p.length; i += 3) {
    if (p[i].trim()) { const d = $('div', '', el); d.innerHTML = esc(p[i]).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`([^`\n]+)`/g, '<code>$1</code>').replace(/\n/g, '<br>'); }
    if (i + 2 < p.length) codeBlock(el, (p[i + 1] || 'text').toLowerCase(), p[i + 2].trim());
  }
}
function codeBlock(el, lang, code, small) {
  const b = $('div', 'cb', el), top = $('div', 'cb-top', b), pre = $('pre', '', b);
  $('span', '', top).textContent = lang; pre.textContent = code;
  const btn = (t, f) => { const x = $('button', '', top); x.textContent = t; x.onclick = f; return x; };
  btn('Copy', function () { navigator.clipboard.writeText(code); this.textContent = 'Copied'; setTimeout(() => this.textContent = 'Copy', 1200); });
  if (lang === 'html') {
    btn('▶ Preview', () => { if (!b.querySelector('iframe')) { const f = $('iframe', '', b); f.sandbox = 'allow-scripts'; f.srcdoc = code; } });
    btn('Open', () => window.open(URL.createObjectURL(new Blob([code], {type: 'text/html'})), '_blank'));
    btn('Download', () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([code], {type: 'text/html'})); a.download = 'design.html'; a.click(); });
  }
}

/* ---------- section tracking ---------- */
const nm = id => INFO[id][0];
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { cur = e.target.id; panel.querySelector('#ds-sec').textContent = 'Viewing: ' + nm(cur); }
}), {rootMargin: '-45% 0px -45% 0px'});
document.querySelectorAll('.section[id]').forEach(s => INFO[s.id] && io.observe(s));
panel.querySelector('#ds-sec').textContent = 'Viewing: ' + nm(cur);

/* ---------- code extraction ---------- */
function sectionHtml(id) {
  const c = document.getElementById(id).cloneNode(true);
  return c.outerHTML.replace(/\s?reveal-delay-\d/g, '').replace(/\s?\breveal\b/g, '').replace(/\s?\bvisible\b/g, '').replace(/\sclass=""/g, '').replace(/ style="(transform|transition)[^"]*"/g, '');
}
async function sectionCss(id) {
  if (!rules) {
    const t = await (await fetch('style.css')).text();
    const sh = new CSSStyleSheet(); sh.replaceSync(t); rules = [...sh.cssRules];
  }
  const own = new RegExp('#' + id + '(?![\\w-])'), base = /^(\*|\.section(-tag|-title|-sub)?)(,|$| )/;
  const fmt = r => r.selectorText + ' {\n' + r.style.cssText.split(/;\s+/).map(x => x.trim().replace(/;$/, '')).filter(Boolean).map(x => '  ' + x + ';').join('\n') + '\n}';
  const out = rules.filter(r => r.type === 1 && (own.test(r.selectorText) || RX[id].test(r.selectorText) || base.test(r.selectorText))).map(fmt);
  const all = out.join('\n');
  rules.filter(r => r.type === 7 && all.includes(r.name)).forEach(r => out.push(r.cssText.replace(/\{ /, '{\n  ').replace(/ \}/g, '\n}')));
  return out.join('\n\n');
}
const pageDoc = (h, c) => `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link href="${FONTS}" rel="stylesheet"><style>*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:Inter,sans-serif}\n${c}\n.section{min-height:0!important;padding:40px 16px!important}*{cursor:auto!important}</style></head><body>${h}</body></html>`;

/* ---------- brain ---------- */
async function ask(q) {
  say('me', q);
  const wait = say('bot', '…');
  try {
    let a = await local(q);
    if (a === null) a = await remote(q);
    wait.remove(); say('bot', a);
  } catch (e) { wait.remove(); say('bot', e.message); }
}
/* instant answers that need no backend */
async function local(q) {
  const s = q.toLowerCase().trim(), id = cur, [name, desc] = INFO[id], short = s.split(/\s+/).length <= 5;
  const jump = Object.keys(INFO).find(k => s.includes(k) || s.includes(nm(k).toLowerCase()));
  if (/^(go|open|take|scroll)\b/.test(s) && jump) { document.getElementById(jump).scrollIntoView({behavior: 'smooth'}); return 'Scrolling to ' + nm(jump) + '.'; }
  if (/^(show |give |run )?(me )?(the )?(preview|output|demo)/.test(s)) return name + ' preview:\n```html\n' + pageDoc(sectionHtml(id), await sectionCss(id)) + '\n```';
  if (/^(show|give|print|copy|get)\b.*\b(html|css|code|markup)\b/.test(s) || (short && /\b(html|css|code|markup)\b/.test(s))) {
    const H = /html|markup/.test(s), C = /css/.test(s), both = /code/.test(s) || (H === C);
    let o = '**' + name + '**\n';
    if (H || both) o += '```html\n' + sectionHtml(id) + '\n```\n';
    if (C || both) o += '```css\n' + await sectionCss(id) + '\n```';
    return o;
  }
  if (short && /^(list|styles|all styles)/.test(s)) return Object.keys(INFO).map(nm).join(', ') + '. Say "go to clay" to jump.';
  if (short && /^(explain|what is this|about)/.test(s)) return '**' + name + '**: ' + desc;
  return null;
}
/* everything else goes to YOUR backend (see backend/ folder) */
async function remote(q) {
  const API = (window.DS_API || '').replace(/\/$/, ''), [name, info] = INFO[cur];
  const body = {message: q, section: name, info, html: sectionHtml(cur).slice(0, 15000), css: (await sectionCss(cur)).slice(0, 15000), history: hist.slice(-8)};
  let r;
  try { r = await fetch(API + '/api/chat', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)}); }
  catch (e) { throw new Error('I cannot reach the backend at ' + (API || '(not set)') + '. Start it (README step 4) or fix config.js. Local commands still work: "show code", "preview it", "explain it", "list styles".'); }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || 'Backend error ' + r.status);
  hist.push({role: 'user', content: q}, {role: 'assistant', content: j.reply});
  return j.reply;
}
say('bot', 'Hi! I know which section you are viewing. Instant commands: "show code", "preview it", "explain it". For anything else, like "make it neon" or "why does this shadow work?", I ask the backend.');
})();
