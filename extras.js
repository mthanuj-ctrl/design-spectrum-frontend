/* Extras: progress bar, section counter + picker (press G), keyboard nav, click ripple, and demos for the new sections */
(() => {
const $ = id => document.getElementById(id);
const secs = [...document.querySelectorAll('.section[id]')];
const nameOf = s => ((s.querySelector('.section-tag') || {}).textContent || s.id).trim();
const bar = document.createElement('div'); bar.id = 'ds-progress'; document.body.append(bar);
addEventListener('scroll', () => { const h = document.documentElement; bar.style.width = (scrollY / Math.max(1, h.scrollHeight - innerHeight) * 100) + '%'; }, {passive: true});

const cnt = document.createElement('button'); cnt.id = 'ds-count'; document.body.append(cnt);
const menu = document.createElement('div'); menu.id = 'ds-menu'; const grid = document.createElement('div'); menu.append(grid); document.body.append(menu);
secs.forEach((s, i) => {
  const b = document.createElement('button'); b.textContent = String(i + 1).padStart(2, '0') + '  ' + nameOf(s);
  b.onclick = () => { menu.classList.remove('open'); s.scrollIntoView({behavior: 'smooth'}); }; grid.append(b);
});
menu.onclick = e => { if (e.target === menu) menu.classList.remove('open'); };
cnt.onclick = () => menu.classList.add('open');
let idx = 0;
const o = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { idx = secs.indexOf(e.target); cnt.textContent = String(idx + 1).padStart(2, '0') + ' / ' + secs.length + '  ☰ (G)'; } }), {rootMargin: '-45% 0px -45% 0px'});
secs.forEach(s => o.observe(s));
document.querySelectorAll('.nav-pip').forEach(p => { const s = $(p.dataset.target); if (s) p.title = nameOf(s); });

addEventListener('keydown', e => {
  if (/input|textarea/i.test(e.target.tagName)) return;
  if (e.key === 'Escape') menu.classList.remove('open');
  if (e.key === 'g' || e.key === 'G') menu.classList.toggle('open');
  const d = {ArrowDown: 1, ArrowRight: 1, PageDown: 1, ArrowUp: -1, ArrowLeft: -1, PageUp: -1}[e.key];
  if (d) { e.preventDefault(); secs[Math.max(0, Math.min(secs.length - 1, idx + d))].scrollIntoView({behavior: 'smooth'}); }
});
document.addEventListener('click', e => {
  const r = document.createElement('span'); r.className = 'ds-ripple'; r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px';
  document.body.append(r); setTimeout(() => r.remove(), 600);
});

/* cyber */
if ($('cyBtn')) { let on = false; $('cyBtn').onclick = () => { on = !on; $('cyBar').style.width = (30 + Math.random() * 70) + '%'; const s = $('cyStat'); s.textContent = on ? 'BREACHED' : 'ONLINE'; s.style.color = on ? '#ff2bd6' : '#00f0ff'; }; }
/* pixel */
if ($('pxCoin')) { let n = 0; $('pxCoin').onclick = () => { n++; $('pxN').textContent = n; $('pxH').textContent = '♥'.repeat(Math.min(5, 3 + Math.floor(n / 10))); };
  $('pxReset').onclick = () => { n = 0; $('pxN').textContent = 0; $('pxH').textContent = '♥♥♥'; }; }
/* aurora */
if ($('aurora')) $('aurora').onmousemove = e => { const r = $('aurora').getBoundingClientRect(); $('auGlow').style.left = (e.clientX - r.left) + 'px'; $('auGlow').style.top = (e.clientY - r.top) + 'px'; };
/* y2k */
if ($('y2Btn')) $('y2Btn').onclick = () => { const p = $('y2P'); p.style.transition = 'none'; p.style.width = '0'; p.offsetWidth; p.style.transition = ''; p.style.width = '100%'; };
/* terminal */
if ($('tmIn')) { const out = $('tmOut'), inp = $('tmIn'); const pr = t => { out.textContent += '\n' + t; out.scrollTop = out.scrollHeight; };
  inp.onkeydown = e => { if (e.key !== 'Enter') return; const c = inp.value.trim(); inp.value = ''; pr('$ ' + c); const [a, ...r] = c.split(' ');
    if (a === 'help') pr('help  date  styles  go <name>  clear');
    else if (a === 'date') pr(new Date().toString());
    else if (a === 'styles') pr(secs.map(nameOf).join(', '));
    else if (a === 'clear') out.textContent = '';
    else if (a === 'go') { const q = r.join(' ').toLowerCase(); const s = q && secs.find(x => x.id.includes(q) || nameOf(x).toLowerCase().includes(q)); if (s) { pr('jumping to ' + nameOf(s)); s.scrollIntoView({behavior: 'smooth'}); } else pr('no such style'); }
    else if (c) pr('command not found: ' + a); }; }
/* memphis */
if ($('mmBtn')) { const P = [['#ff5ea8', '#ffd23f', '#2ec4b6'], ['#7c3aed', '#fb923c', '#22d3ee'], ['#ef4444', '#a3e635', '#60a5fa'], ['#14b8a6', '#f472b6', '#facc15']]; let i = 0;
  $('mmBtn').onclick = () => { i = (i + 1) % P.length; P[i].forEach((c, k) => $('memphis').style.setProperty('--c' + (k + 1), c)); }; }
/* neubrutalism */
if ($('nbCard')) { const D = [['Design the hero section', '#fde68a', '3 tasks'], ['Build the chat backend', '#a7f3d0', '1 task'], ['Ship eighteen styles', '#fbcfe8', '18 done']]; const tabs = document.querySelectorAll('.nb-tabs button');
  tabs.forEach((b, i) => b.onclick = () => { tabs.forEach(x => x.classList.remove('on')); b.classList.add('on'); const c = $('nbCard'); c.style.background = D[i][1]; c.querySelector('h3').textContent = D[i][0]; c.querySelector('.nb-pill').textContent = D[i][2]; }); }
})();
