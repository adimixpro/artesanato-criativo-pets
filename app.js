const src = id => 'img/' + id + '.webp';
/* pré-carrega as próximas imagens só depois que a abertura terminou de carregar, sem disputar a internet com ela */
const pre = ids => { const go = () => ids.forEach(id => { const i = new Image(); i.src = src(id); }); if(document.readyState === 'complete') go(); else addEventListener('load', () => setTimeout(go, 400), { once: true }); };
const N = {
  laco:'Laço', gravata:'Gravata', gargantilha:'Gargantilha',
  delicada:'Princesa Delicada', moderna:'Fofura Moderna', encanto:'Jardim Encantado', dourada:'Realeza Dourada', joia:'Joia Rara', coroa:'Coroa Real',
  estiloso:'Super Estiloso', charme:'Charme Total', divertida:'Vibe Divertida', luxo:'Puro Luxo', marinheiro:'Marinheiro Chique', estrela:'Pet Star',
  ossinho:'Clássico Ossinho', pata:'Amor de 4 Patas', marca:'Patinha Charmosa', amigo:'Melhor Amigo',
  diva:'Diva Glamour', pompom:'Pompom Trendy', fashion:'Coração Florido', marsala:'Renda Marsala', pink:'Rosa Doce', confete:'Confete Pop',
  perola:'Pérola Imperial', rubi:'Coração de Rubi', radiante:'Brilho Radiante', pegada:'Pegada do Amor'
};
const ROSE = ['#ffdbe8', '#f7b6cf'], LILAC = ['#e9defe', '#cdb8f7'], GOLD = ['#fff0c2', '#f0d27c'], SAND = ['#f6ecd2', '#e2cf9b'],
      SKY = ['#dcebff', '#a9c8f5'], SLATE = ['#e3e6ee', '#bcc3d4'], PEACH = ['#fbe6d3', '#eec49d'], WINE = ['#f6dada', '#e3a3a3'], MINT = ['#d9f3ee', '#9fd9cc'];
const TINT = {
  laco:ROSE, gravata:SLATE, gargantilha:PEACH,
  delicada:ROSE, moderna:LILAC, encanto:GOLD, dourada:SAND, joia:GOLD, coroa:GOLD,
  estiloso:SLATE, charme:MINT, divertida:LILAC, luxo:SAND, marinheiro:SKY, estrela:GOLD, ossinho:PEACH, pata:PEACH, marca:SLATE, amigo:SLATE,
  diva:WINE, pompom:ROSE, fashion:ROSE, marsala:WINE, pink:ROSE, confete:SKY, perola:GOLD, rubi:WINE, radiante:ROSE, pegada:ROSE
};
const ACC = [
  {id:'laco', of:'do seu laço', styles:[
    {id:'delicada', est:['encanto', 'dourada'], apl:['joia', 'coroa']},
    {id:'moderna', est:['encanto', 'dourada'], apl:['joia', 'coroa']}]},
  {id:'gravata', of:'da sua gravata', styles:[
    {id:'estiloso', est:['divertida', 'luxo'], apl:['ossinho', 'pata']},
    {id:'charme', est:['marinheiro', 'estrela'], apl:['marca', 'amigo']}]},
  {id:'gargantilha', of:'da sua gargantilha', styles:[
    {id:'diva', est:['fashion', 'marsala'], apl:['perola', 'rubi']},
    {id:'pompom', est:['pink', 'confete'], apl:['radiante', 'pegada']}]}
];
const KEYS = ['acessorio', 'estilo', 'estampa', 'detalhe'];
const SLOT = ['Acessório', 'Estilo', 'Estampa', 'Detalhe'];
const HINT = 'Toque em um item da faixa abaixo para voltar e trocar.';
const $ = id => document.getElementById(id);
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const pick = {acessorio:null, estilo:null, estampa:null, detalhe:null};
let step = 0, focus = -1, raf = 0, busy = false, OPTS = [];

$('logo').src = src('logo');
const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch(e){} };
const acc = () => ACC.find(a => a.id === pick.acessorio);
const sty = () => acc().styles.find(s => s.id === pick.estilo);
const pic = (i, id) => src(i === 0 ? 'm-' + id : id);

function options(i){
  if(i === 0) return ACC.map(a => a.id);
  if(i === 1) return acc().styles.map(s => s.id);
  return i === 2 ? sty().est : sty().apl;
}
function question(i){
  return ['Qual acessório você quer criar?', 'Escolha o estilo ' + (pick.acessorio ? acc().of : ''),
          pick.estilo === 'pompom' ? 'Quais cores combinam com a sua criação?' : 'Qual estampa combina com a sua criação?',
          'Escolha o detalhe que deixa tudo especial'][i];
}

/* palco: uma peça por vez, com entrada e saída laterais */
function showPiece(url, dir){
  const box = $('tilt');
  [...box.children].forEach(old => {
    if(dir === 'new' || calm){ old.remove(); return; }
    old.className = dir === 'R' ? 'outL' : 'outR';
    setTimeout(() => old.remove(), 300);
  });
  const im = new Image();
  im.alt = ''; im.src = url;
  im.className = dir === 'new' ? 'rise' : dir === 'R' ? 'inR' : 'inL';
  box.appendChild(im);
}

function setGhost(text){
  const g = $('ghost');
  let n = 0;
  g.innerHTML = text.split(' ').map(w => '<span class="w">' + [...w].map(ch =>
    '<span class="l" style="animation-delay:' + (n++ * 22) + 'ms">' + ch + '</span>').join('') + '</span>').join(' ');
  fitGhost();
}

/* nome pequeno e discreto no topo; a peça ocupa o palco abaixo dele */
function fitGhost(){
  const g = $('ghost');
  let size = 13;
  g.style.fontSize = size + 'px';
  const tooWide = () => [...g.children].some(w => w.offsetWidth > g.clientWidth);
  while(size > 9 && tooWide()){ size -= 2; g.style.fontSize = size + 'px'; }
  $('stage').style.setProperty('--gh', (g.offsetTop + g.offsetHeight) + 'px');
}

function setTilt(y, x, z){
  const s = $('tilt').style;
  s.setProperty('--ty', y.toFixed(1)); s.setProperty('--tx', x.toFixed(1)); s.setProperty('--tz', z.toFixed(1));
}

function paintSlots(hit){
  $('slots').innerHTML = '';
  KEYS.forEach((k, i) => {
    const id = pick[k];
    const b = document.createElement('button');
    b.className = 'slot' + (id ? ' full' : '') + (i === step ? ' now' : '') + (i === hit ? ' hit' : '');
    b.innerHTML = (id ? '<img alt="" src="' + pic(i, id) + '">' : '<span class="ph">' + (i + 1) + '</span>') + '<span>' + (id ? N[id] : (i === 2 && pick.estilo === 'pompom' ? 'Cores' : SLOT[i])) + '</span>';
    b.onclick = () => { if(!busy && (id || i <= step)) goStep(i); };
    $('slots').appendChild(b);
  });
}

function centerOn(i, smooth){
  const rail = $('rail'), el = rail.children[i];
  if(!el) return;
  rail.scrollTo({left: el.offsetLeft - (rail.clientWidth - el.offsetWidth) / 2, behavior: smooth && !calm ? 'smooth' : 'auto'});
}

/* carrega com antecedência as imagens do passo seguinte, para o clique nunca esperar */
function warm(id){
  if(step === 0) pre(ACC.find(a => a.id === id).styles.map(s => s.id));
  else if(step === 1){ const s = acc().styles.find(x => x.id === id); pre(s.est.concat(s.apl)); }
  else if(step === 3) pre(['r-' + pick.estilo + '-' + pick.estampa + '-' + id]);
}

/* setas somem nas pontas; pontinhos mostram quantas opções existem e qual está no centro */
function paintNav(){
  $('prev').classList.toggle('off', focus <= 0);
  $('next').classList.toggle('off', focus >= OPTS.length - 1);
  [...$('dots').children].forEach((d, n) => d.classList.toggle('on', n === focus));
}
let nudged = false;

function markFocus(i, dir){
  if(i === focus) return;
  const from = focus;
  focus = i;
  const id = OPTS[i];
  [...$('rail').children].forEach((el, n) => el.classList.toggle('on', n === i));
  showPiece(pic(step, id), dir || (i > from ? 'R' : 'L'));
  setGhost(N[id]);
  $('app').style.setProperty('--tint', TINT[id][0]);
  $('app').style.setProperty('--ghostc', TINT[id][1]);
  $('go').textContent = step === KEYS.length - 1 ? 'Ver minha criação' : 'Escolher ' + N[id];
  paintNav();
  warm(id);
  if(from >= 0) buzz(8);
}

function goStep(i, hit){
  /* o vídeo do carregamento só começa a baixar perto do fim do quiz, sem disputar a internet com a abertura */
  const lv = $('pupv'); if(i >= 2 && lv && lv.preload === 'none'){ lv.preload = 'auto'; lv.load(); }
  step = i;
  OPTS = options(i);
  const rail = $('rail');
  $('q').textContent = question(i);
  $('sub').textContent = 'Arraste ou toque na seta para ver as ' + OPTS.length + ' opções.';
  $('hint').style.visibility = i === 0 ? 'hidden' : '';
  $('count').textContent = 'Passo ' + (i + 1) + ' de 4';
  rail.innerHTML = '';
  OPTS.forEach((id, n) => {
    const b = document.createElement('button');
    b.className = 'opt';
    b.innerHTML = '<img alt="" src="' + pic(i, id) + '"><span>' + N[id] + '</span>';
    b.onclick = () => { if(n === focus) choose(); else centerOn(n, true); };
    b.onfocus = () => centerOn(n, true);
    rail.appendChild(b);
  });
  const start = Math.max(0, OPTS.indexOf(pick[KEYS[i]]));
  focus = -1;
  centerOn(start, false);
  markFocus(start, 'new');
  setTilt(0, 0, 0);
  paintSlots(hit);
  $('dots').innerHTML = OPTS.map(() => '<i></i>').join('');
  paintNav();
  /* no primeiro passo, o carrossel dá uma espiada para o lado para mostrar que dá para arrastar */
  if(!nudged && !calm){
    nudged = true;
    setTimeout(() => { $('rail').scrollBy({left: 46, behavior: 'smooth'}); }, 1100);
    setTimeout(() => centerOn(focus, true), 1600);
  }
}

/* arrastar o carrossel inclina a peça e troca o destaque */
$('rail').addEventListener('scroll', () => {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    const rail = $('rail'), mid = rail.scrollLeft + rail.clientWidth / 2;
    let best = 0, d = 1e9, off = 0;
    [...rail.children].forEach((el, n) => {
      const x = el.offsetLeft + el.offsetWidth / 2 - mid;
      if(Math.abs(x) < d){ d = Math.abs(x); best = n; off = x / el.offsetWidth; }
    });
    markFocus(best);
    setTilt(off * -70, 0, off * -14);
  });
});

/* tocar e mover no palco gira a peça */
const stage = $('stage');
stage.addEventListener('pointermove', e => {
  const r = stage.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
  setTilt(x * 50, y * -34, x * 6);
});
['pointerleave', 'pointerup', 'pointercancel'].forEach(ev => stage.addEventListener(ev, () => setTilt(0, 0, 0)));

/* a escolha voa do palco até o espaço dela na faixa */
function fly(from, url, slot){
  const target = slot && slot.querySelector('img');
  if(calm || !target || !from.width) return;
  const to = target.getBoundingClientRect();
  const f = new Image();
  f.src = url; f.className = 'flyer';
  Object.assign(f.style, {left: from.left + 'px', top: from.top + 'px', width: from.width + 'px', height: from.height + 'px'});
  document.body.appendChild(f);
  const dx = to.left + to.width / 2 - (from.left + from.width / 2), dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const k = to.width / from.width;
  const a = f.animate([
    {transform: 'translate(0,0) scale(1) rotate(0)'},
    {transform: 'translate(' + dx * .5 + 'px,' + (dy * .25 - 30) + 'px) scale(' + (1 + k) / 2 + ') rotate(-14deg)', offset: .45},
    {transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + k + ') rotate(0)'}
  ], {duration: 440, easing: 'cubic-bezier(.45,0,.3,1)'});
  a.onfinish = () => f.remove();
}

function choose(){
  if(busy) return;
  const id = OPTS[focus], last = step === KEYS.length - 1;
  const live = $('tilt').lastElementChild;
  const from = live ? live.getBoundingClientRect() : {width: 0};
  /* trocar uma escolha anterior limpa as seguintes, que dependem dela */
  if(pick[KEYS[step]] !== id) for(let n = step + 1; n < KEYS.length; n++) pick[KEYS[n]] = null;
  pick[KEYS[step]] = id;
  buzz(18);
  const slotIndex = step, url = pic(step, id);
  if(last){ busy = true; $('tilt').innerHTML = ''; paintSlots(slotIndex); }
  else goStep(step + 1, slotIndex);
  fly(from, url, $('slots').children[slotIndex]);
  if(last) setTimeout(reveal, calm ? 0 : 620);
}
$('go').onclick = choose;
$('prev').onclick = () => centerOn(focus - 1, true);
$('next').onclick = () => centerOn(focus + 1, true);

/* final em etapas: filhote caminha enquanto a barra enche, clarão, pet pula da moldura com confete */
function reveal(){
  const r = $('reveal');
  /* a moldura assume a proporção do pet: ele fica centralizado, com a cabeça um pouco acima da borda */
  $('final').onload = e => {
    const a = e.target.naturalWidth / e.target.naturalHeight;
    $('frame').style.aspectRatio = Math.min(1.25, Math.max(.74, a * 1.2)).toFixed(3);
    if($('share')) buildCard();
  };
  $('final').src = src('r-' + pick.estilo + '-' + pick.estampa + '-' + pick.detalhe);
  $('blogo').src = src('logo');
  $('name').innerHTML = N[pick.acessorio] + ' <em>' + N[pick.estilo] + '</em> com ' + N[pick.estampa] + ' e ' + N[pick.detalhe];
  $('made').innerHTML = [pick.estilo, pick.estampa, pick.detalhe].map(id => '<img alt="" src="' + src(id) + '">').join('');
  r.classList.remove('ready', 'boom', 'untie', 'open'); r.classList.add('show');
  const pv = $('pupv');
  if(pv){ pv.currentTime = 0; const p = pv.play(); if(p) p.catch(() => {}); }
  const k = calm ? 0 : 1;
  setTimeout(() => r.classList.add('boom'), 4800 * k);
  setTimeout(() => { r.classList.add('ready'); setTimeout(() => { buzz(30); confetti(); }, 750 * k); }, 5000 * k);
}

/* compartilhar a criação: cartão-imagem gerado na hora + mensagem de desafio */
const SITE = 'artesanatocriativopets.com.br';
const SHARE_URL = 'https://' + SITE + '/?utm_source=compartilhamento&utm_medium=quiz&utm_campaign=resultado';
let shareFile = null;
const creationName = () => N[pick.acessorio] + ' ' + N[pick.estilo] + ' com ' + N[pick.estampa] + ' e ' + N[pick.detalhe];
const shareText = () => 'Olha o acessório que eu criei para um pet: ' + creationName() + ' 🐶✨ Leva menos de 1 minuto. Duvido você criar um mais lindo que o meu 👉 ' + SHARE_URL;
const loadImg = s => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = s; });
function rr(c, x, y, w, h, r){ c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function wrap(c, t, maxW){
  const out = []; let line = '';
  t.split(' ').forEach(w => { const s = line ? line + ' ' + w : w; if(c.measureText(s).width > maxW && line){ out.push(line); line = w; } else line = s; });
  out.push(line); return out;
}
async function buildCard(){
  shareFile = null;
  const key = creationName();
  try{
    if(document.fonts && document.fonts.ready) await document.fonts.ready;
    const [pet, logo] = await Promise.all([loadImg($('final').src), loadImg(src('logo')).catch(() => null)]);
    const W = 1080, H = 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d');
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#fff3cf'); g.addColorStop(.55, '#fde3ee'); g.addColorStop(1, '#efe3fb');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.save(); c.translate(W / 2, 520); c.fillStyle = 'rgba(255,255,255,.45)';
    for(let i = 0; i < 18; i++){ c.rotate(Math.PI / 9); c.beginPath(); c.moveTo(0, 0); c.lineTo(-70, -1100); c.lineTo(70, -1100); c.closePath(); c.fill(); }
    c.restore();
    /* selo */
    c.font = '800 34px "Bricolage Grotesque", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const bw = c.measureText('EU CRIEI').width + 90;
    c.fillStyle = '#ffd166'; rr(c, (W - bw) / 2, 70, bw, 70, 35); c.fill();
    c.fillStyle = '#2f1533'; c.fillText('EU CRIEI', W / 2, 106);
    /* moldura com o pet */
    const fw = 680, fh = 700, fx = (W - fw) / 2, fy = 180;
    c.save(); c.shadowColor = 'rgba(226,61,124,.25)'; c.shadowBlur = 60; c.fillStyle = '#fff'; rr(c, fx - 18, fy - 18, fw + 36, fh + 36, 60); c.fill(); c.restore();
    c.save(); rr(c, fx, fy, fw, fh, 46); c.clip(); c.fillStyle = '#fffaf2'; c.fillRect(fx, fy, fw, fh);
    const s = Math.min(fw / pet.naturalWidth, fh / pet.naturalHeight), pw = pet.naturalWidth * s, ph = pet.naturalHeight * s;
    c.drawImage(pet, fx + (fw - pw) / 2, fy + (fh - ph) / 2, pw, ph); c.restore();
    c.strokeStyle = '#ffd166'; c.lineWidth = 6; rr(c, fx, fy, fw, fh, 46); c.stroke();
    /* nome da criação */
    c.fillStyle = '#2f1533'; c.font = '800 54px "Bricolage Grotesque", sans-serif';
    const lines = wrap(c, key, 940).slice(0, 3);
    lines.forEach((l, i) => c.fillText(l, W / 2, 975 + i * 62));
    /* rodapé */
    const fy2 = 975 + lines.length * 62 + 22;
    c.font = '500 34px "DM Sans", sans-serif'; c.fillStyle = '#7b6480';
    c.fillText('Duvido você criar um mais lindo 👀', W / 2, fy2);
    c.fillStyle = '#e23d7c'; rr(c, 100, H - 160, W - 200, 96, 48); c.fill();
    c.fillStyle = '#fff'; c.font = '800 32px "Bricolage Grotesque", sans-serif';
    c.fillText('Crie o seu: ' + SITE, W / 2 + (logo ? 36 : 0), H - 112);
    if(logo){ const tw = c.measureText('Crie o seu: ' + SITE).width; c.save(); c.beginPath(); c.arc(W / 2 - tw / 2 - 6, H - 112, 30, 0, 7); c.clip(); c.drawImage(logo, W / 2 - tw / 2 - 36, H - 142, 60, 60); c.restore(); }
    const blob = await new Promise(ok => cv.toBlob(ok, 'image/jpeg', .9));
    if(blob && key === creationName()) shareFile = new File([blob], 'minha-criacao-pet.jpg', { type: 'image/jpeg' });
  }catch(e){ shareFile = null; }
}
function shareToast(t){ const el = $('stoast'); el.textContent = t; el.classList.add('on'); clearTimeout(shareToast.t); shareToast.t = setTimeout(() => el.classList.remove('on'), 4200); }
function copyText(t){ try{ if(navigator.clipboard) return navigator.clipboard.writeText(t).then(() => true, () => false); }catch(e){} return Promise.resolve(false); }
function saveFile(f){ const u = URL.createObjectURL(f), a = document.createElement('a'); a.href = u; a.download = f.name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); }
if($('share')) $('share').onclick = async () => {
  /* só baixa a imagem: a pessoa continua na página; a mensagem de desafio fica copiada para quando ela quiser enviar */
  if(!shareFile) await buildCard();
  if(!shareFile){ shareToast('Não consegui gerar a imagem. Tire um print da tela 📸'); return; }
  saveFile(shareFile);
  shareToast('Imagem salva! 📸');
  if(await copyText(shareText())) shareToast('Imagem salva! A mensagem para enviar já está copiada 💬');
};

/* o quadro do resultado inclina de leve acompanhando o dedo */
$('reveal').addEventListener('pointermove', e => {
  if(calm) return;
  const r = $('reveal').getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
  $('frame').style.transform = 'perspective(700px) rotateY(' + (x * 16).toFixed(1) + 'deg) rotateX(' + (y * -12).toFixed(1) + 'deg)';
});
$('reveal').addEventListener('pointerleave', () => { $('frame').style.transform = ''; });


/* experiência da oferta: tudo reage à rolagem */
let offerReady = false;
function setupOffer(){
  if(offerReady) return; offerReady = true;
  const root = $('offer');
  root.querySelectorAll('video[data-poster]').forEach(v => { v.poster = v.dataset.poster; });
  /* título do topo entra palavra por palavra */
  const h = root.querySelector('h2.big');
  if(!calm){
    let n = 0;
    h.innerHTML = [...h.childNodes].map(node => node.nodeType === 3
      ? node.textContent.split(/(\s+)/).map(w => w.trim() ? '<span class="hw" style="animation-delay:' + (300 + n++ * 70) + 'ms">' + w + '</span>' : w).join('')
      : '<em>' + node.textContent.split(/(\s+)/).map(w => w.trim() ? '<span class="hw" style="animation-delay:' + (300 + n++ * 70) + 'ms">' + w + '</span>' : w).join('') + '</em>').join('');
  }
  /* frase que acende conforme a pessoa rola */
  const say = $('say');
  const words = say.textContent.trim().split(' ');
  say.innerHTML = words.map((w, i) => '<span' + (i >= 2 ? ' class="hot"' : '') + '>' + w + '</span>').join(' ');
  const lit = [...say.children];
  if(calm) lit.forEach(s => s.classList.add('lit'));
  /* elementos surgem ao entrar na tela, em sequência */
  if(!calm && 'IntersectionObserver' in window){
    const els = root.querySelectorAll('.sec h2:not(.big), .endphoto, .bub, .thinkbox img, .grp, .sec > p:not(.say), .vframe, .mine, .box, .steps li, .qa div, .uses div, .teach img, .gets li, .seal, .sec .buy, .cap, .swipe, .eyebrow, .under, .endpet, .offer details');
    const io = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }), {root, rootMargin: '0px 0px -7% 0px'});
    els.forEach(el => {
      const sibs = [...el.parentElement.children].filter(x => x.matches('h2,p,div,li,button,img,details,ul,ol'));
      el.style.setProperty('--d', Math.min(sibs.indexOf(el), 4) * 80 + 'ms');
      el.classList.add('rv'); io.observe(el);
    });
    [...root.querySelectorAll('.vs > div')].forEach((el, i) => { el.style.setProperty('--d', i * 90 + 'ms'); el.classList.add('rv'); io.observe(el); });
    /* o preço entra girando, como a carta do resultado, com confete */
    const price = $('price'); price.classList.add('pwait');
    new IntersectionObserver((es, o) => es.forEach(e => { if(e.isIntersecting){ o.disconnect(); price.classList.remove('pwait'); price.classList.add('spin'); setTimeout(() => { buzz(20); confetti($('fx'), .45); }, 900); } }), {root, threshold: .55}).observe(price);
    /* vídeos tocam sozinhos, sem som, enquanto estão na tela */
    const vo = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if(e.isIntersecting){ const p = v.play(); p && p.catch(() => { v.controls = true; }); } else v.pause(); }), {root, threshold: .55});
    root.querySelectorAll('video').forEach(v => { vo.observe(v); v.onclick = () => { v.paused ? v.play() : v.pause(); }; });
  } else root.querySelectorAll('video').forEach(v => { v.controls = true; });
  /* carrossel dos três tipos com foco no cartão do centro */
  root.querySelectorAll('.rail2').forEach(rail => {
    const focusCard = () => {
      const mid = rail.scrollLeft + rail.clientWidth / 2; let best = null, d = 1e9;
      [...rail.children].forEach(c => { const x = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if(x < d){ d = x; best = c; } });
      [...rail.children].forEach(c => c.classList.toggle('on', c === best));
    };
    rail.addEventListener('scroll', () => requestAnimationFrame(focusCard)); focusCard();
  });
  /* barra de progresso, barra de compra e frase acompanham a rolagem */
  let tick = 0;
  const onScroll = () => {
    cancelAnimationFrame(tick);
    tick = requestAnimationFrame(() => {
      const max = root.scrollHeight - root.clientHeight;
      $('prog').style.transform = 'scaleX(' + (max > 0 ? root.scrollTop / max : 0).toFixed(3) + ')';
      $('bar').classList.toggle('hide', root.scrollTop < 420);
      if(!calm){
        const r = say.getBoundingClientRect(), vr = root.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, (vr.top + vr.height * .82 - r.top) / (vr.height * .5)));
        const n = Math.round(p * lit.length);
        lit.forEach((s, i) => s.classList.toggle('lit', i < n));
      }
    });
  };
  root.addEventListener('scroll', onScroll); onScroll();
}

/* página de oferta: abre a partir do resultado e mostra a criação da pessoa no topo */
$('cta').onclick = () => {
  document.querySelectorAll('.offer video').forEach(v => { v.pause(); });
  $('offer').classList.add('show');
  $('offer').scrollTop = 0;
  setupOffer();
};
/* cole aqui o link do checkout da Cakto; enquanto estiver vazio, os botões mostram um aviso */
const CHECKOUT_URL = 'https://pay.cakto.com.br/36ukvy6_557712';
let toastT = 0;
document.querySelectorAll('.offer .buy').forEach(b => { b.onclick = () => {
  /* leva junto as marcações do anúncio (utm), para a Cakto saber de qual anúncio veio a venda */
  if(CHECKOUT_URL){ location.href = CHECKOUT_URL + location.search; return; }
  $('toast').classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => $('toast').classList.remove('on'), 2600);
}; });
if($('again')) $('again').onclick = () => {
  KEYS.forEach(k => { pick[k] = null; });
  busy = false;
  $('reveal').classList.remove('show', 'ready', 'boom', 'untie', 'open');
  goStep(0);
};

function confetti(cv, oy){
  if(calm) return;
  const c = cv || $('confetti'), box = c.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
  c.width = box.width * dpr; c.height = box.height * dpr;
  const x = c.getContext('2d'); x.scale(dpr, dpr);
  const cols = ['#ffc233', '#e23d7c', '#b79cf0', '#6cc5f0', '#ff9ec4'];
  const ps = Array.from({length: 160}, () => ({
    x: box.width / 2, y: box.height * (oy || .34), vx: (Math.random() - .5) * 15, vy: -Math.random() * 14 - 3,
    s: 5 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: cols[Math.random() * cols.length | 0]}));
  const t0 = performance.now();
  (function tick(t){
    const life = (t - t0) / 3600;
    x.clearRect(0, 0, box.width, box.height);
    if(life >= 1) return;
    ps.forEach(p => {
      p.vy += .26; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      x.save(); x.globalAlpha = 1 - life * life; x.translate(p.x, p.y); x.rotate(p.r);
      x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.restore();
    });
    requestAnimationFrame(tick);
  })(t0);
}

/* abertura: os cinco pets se revezam no centro */
$('logo2').src = src('logo');
$('trio').innerHTML = ['pet1', 'pet2', 'pet4', 'pet5', 'pet3'].map((id, n) => '<img alt="" data-p="' + n + '" src="' + src(id) + '">').join('');
let turn = 0;
const spin = on => {
  clearInterval(turn);
  turn = on && !calm ? setInterval(() => {
    [...$('trio').children].forEach(im => { im.dataset.p = (+im.dataset.p + 4) % 5; });
  }, 2400) : 0;
};
spin(true);
$('start').onclick = () => {
  spin(false);
  buzz(18);
  $('intro').classList.add('leave');
};

goStep(0);
addEventListener('resize', () => { centerOn(focus, false); fitGhost(); });
if(document.fonts && document.fonts.ready) document.fonts.ready.then(fitGhost);
