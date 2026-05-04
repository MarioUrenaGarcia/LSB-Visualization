/* ══════════════════════════════════════════
   STATE
══════════════════════════════════════════ */
let pixels    = [];
let numPixels = 6;
let channels  = new Set(['r', 'g', 'b']);
let message   = 'Hello';
let animSpeed = 0;
let lastTick  = 0;
let prevSteg  = [];

/* ══════════════════════════════════════════
   UTILS
══════════════════════════════════════════ */
const toBin8   = n => (n >>> 0).toString(2).padStart(8, '0');
const toHex    = (r, g, b) => '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
const hexToRgb = h => ({ r: parseInt(h.slice(1,3), 16), g: parseInt(h.slice(3,5), 16), b: parseInt(h.slice(5,7), 16) });
const randPx   = () => ({ r: Math.random() * 256 | 0, g: Math.random() * 256 | 0, b: Math.random() * 256 | 0 });
const driftPx  = px => ({
  r: Math.max(0, Math.min(255, px.r + ((Math.random() - .5) * 28) | 0)),
  g: Math.max(0, Math.min(255, px.g + ((Math.random() - .5) * 28) | 0)),
  b: Math.max(0, Math.min(255, px.b + ((Math.random() - .5) * 28) | 0)),
});

/* ══════════════════════════════════════════
   CODEC
══════════════════════════════════════════ */
function textToBits(text) {
  const bits = [];
  for (const ch of text) {
    const c = ch.charCodeAt(0);
    for (let i = 7; i >= 0; i--) bits.push((c >> i) & 1);
  }
  return bits;
}

function bitsToText(bits) {
  let out = '';
  for (let i = 0; i + 7 < bits.length; i += 8) {
    let code = 0;
    for (let b = 0; b < 8; b++) code = (code << 1) | bits[i + b];
    if (code === 0) break;
    out += String.fromCharCode(code);
  }
  return out;
}

function encodePixels(orig, msgBits) {
  const ch  = ['r', 'g', 'b'].filter(c => channels.has(c));
  const res = orig.map(p => ({ ...p }));
  let bi = 0;
  for (const px of res)
    for (const c of ch)
      if (bi < msgBits.length) px[c] = (px[c] & 0xFE) | msgBits[bi++];
  return res;
}

function decodePixels(steg) {
  const ch   = ['r', 'g', 'b'].filter(c => channels.has(c));
  const bits = [];
  for (const px of steg) for (const c of ch) bits.push(px[c] & 1);
  return bitsToText(bits);
}

/* ══════════════════════════════════════════
   RENDER
══════════════════════════════════════════ */
function buildCard(px, i, isSteg, origPx) {
  const chColor = { r: 'r', g: 'g', b: 'b' };
  let rows = '';

  for (const ch of ['r', 'g', 'b']) {
    const val = px[ch];
    const bin = toBin8(val);
    let bitsHtml = '';

    for (let b = 0; b < 8; b++) {
      const isLsb = b === 7;
      const chOn  = channels.has(ch);
      let cls = '';

      if (isLsb && chOn) {
        if (!isSteg) {
          cls = 'avail';
        } else {
          const origLsb = origPx[ch] & 1;
          const newLsb  = val & 1;
          cls = origLsb !== newLsb ? 'change' : 'same';
          const pp = prevSteg[i];
          if (pp && (pp[ch] & 1) !== newLsb) cls += ' just-changed';
        }
      }
      bitsHtml += `<span class="bit ${cls}">${bin[b]}</span>`;
    }

    const hexStr = val.toString(16).padStart(2, '0').toUpperCase();
    rows += `
      <div class="bit-row">
        <span class="bl ${chColor[ch]}">${ch.toUpperCase()}</span>
        <div class="bits">${bitsHtml}</div>
        <span class="dec-val">${val}</span>
        <span class="hex-val">${hexStr}</span>
      </div>`;
  }

  const bg        = `rgb(${px.r},${px.g},${px.b})`;
  const hex       = toHex(px.r, px.g, px.b);
  const swatchCls = isSteg ? '' : 'clickable';

  return `
    <div class="px-card" data-idx="${i}">
      <div class="px-swatch ${swatchCls}" style="background:${bg}" data-idx="${i}">
        <span class="px-idx">${t('px.prefix')} ${i + 1}</span>
        <span class="px-hex">${hex.toUpperCase()}</span>
      </div>
      <div class="px-body">${rows}</div>
    </div>`;
}

function render() {
  const msgBits  = textToBits(message);
  const steg     = encodePixels(pixels, msgBits);
  const chArr    = ['r', 'g', 'b'].filter(c => channels.has(c));
  const capacity = pixels.length * chArr.length;
  const embedded = Math.min(msgBits.length, capacity);
  const fits     = msgBits.length <= capacity;
  const pct      = capacity > 0 ? Math.min(100, msgBits.length / capacity * 100) : 0;

  document.getElementById('origGrid').innerHTML =
    pixels.map((px, i) => buildCard(px, i, false, null)).join('');
  document.getElementById('stegGrid').innerHTML =
    steg.map((px, i) => buildCard(px, i, true, pixels[i])).join('');

  renderMessageFlow(msgBits, embedded);
  renderStats(capacity, msgBits.length, embedded, fits, chArr, pct);
  renderDecoded(steg);

  prevSteg = steg;
}

function renderMessageFlow(msgBits, embedded) {
  if (!message) {
    document.getElementById('msgFlow').innerHTML =
      `<span style="color:var(--dim);font-size:.8em">${t('msg.empty')}</span>`;
    return;
  }

  let html = '';
  let bi   = 0;
  for (let ci = 0; ci < message.length; ci++) {
    let cbits = '';
    for (let b = 0; b < 8; b++, bi++) {
      cbits += `<span class="mbit ${bi < embedded ? 'emb' : 'pend'}">${msgBits[bi]}</span>`;
    }
    const ch  = message[ci];
    const lbl = ch === ' ' ? '·' : (ch.charCodeAt(0) < 32 ? '?' : ch);
    html += `
      <div class="char-group">
        <div class="cg-lbl">'${lbl}' ${message.charCodeAt(ci)}</div>
        <div class="cg-bits">${cbits}</div>
      </div>`;
  }
  document.getElementById('msgFlow').innerHTML = html;
}

function renderStats(capacity, msgLen, embedded, fits, chArr, pct) {
  document.getElementById('statsRow').innerHTML = `
    <div class="stat">${t('stat.capacity')} <span>${capacity} bits · ${(capacity / 8) | 0} chars</span></div>
    <div class="stat">${t('stat.message')} <span>${msgLen} bits · ${message.length} chars</span></div>
    <div class="stat">${t('stat.embedded')} <span class="${fits ? 'ok' : 'warn'}">${embedded}/${msgLen} bits ${fits ? t('stat.fits') : t('stat.truncated')}</span></div>
    <div class="stat">${t('stat.channels')} <span>${chArr.join('+').toUpperCase() || '—'}</span></div>`;
  document.getElementById('capFill').style.width = pct + '%';
}

function renderDecoded(steg) {
  const dec  = decodePixels(steg);
  const dOut = document.getElementById('decOut');
  dOut.textContent = dec ? `"${dec}"` : t('decoded.none');
  dOut.style.color  = dec ? 'var(--accent)' : 'var(--dim)';
}

/* ══════════════════════════════════════════
   COLOR PICKER
══════════════════════════════════════════ */
document.getElementById('origGrid').addEventListener('click', e => {
  const swatch = e.target.closest('.px-swatch.clickable');
  if (!swatch) return;

  const idx = parseInt(swatch.dataset.idx);
  const inp = document.createElement('input');
  inp.type  = 'color';
  inp.value = toHex(pixels[idx].r, pixels[idx].g, pixels[idx].b);
  inp.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
  document.body.appendChild(inp);
  inp.addEventListener('input',  ev => { pixels[idx] = hexToRgb(ev.target.value); render(); });
  inp.addEventListener('change', ()  => inp.remove());
  inp.click();
});

/* ══════════════════════════════════════════
   CONTROLS
══════════════════════════════════════════ */
document.getElementById('slPixels').addEventListener('input', e => {
  numPixels = +e.target.value;
  document.getElementById('lblPixels').textContent = numPixels;
  while (pixels.length < numPixels) pixels.push(randPx());
  pixels = pixels.slice(0, numPixels);
  render();
});

document.getElementById('inpMsg').addEventListener('input', e => {
  message = e.target.value;
  render();
});

document.getElementById('slAnim').addEventListener('input', e => {
  animSpeed = +e.target.value;
  const lbl = document.getElementById('lblAnim');
  lbl.dataset.speedIndex = animSpeed;
  lbl.textContent = t(`speed.${animSpeed}`);
});

document.querySelectorAll('.ch-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const ch = btn.dataset.ch;
    if (channels.has(ch)) {
      if (channels.size > 1) { channels.delete(ch); btn.className = 'ch-btn'; }
    } else {
      channels.add(ch);
      btn.className = `ch-btn on-${ch}`;
    }
    render();
  });
});

document.getElementById('btnRand').addEventListener('click', () => {
  pixels   = Array.from({ length: numPixels }, randPx);
  prevSteg = [];
  render();
});

/* ══════════════════════════════════════════
   ANIMATION LOOP
══════════════════════════════════════════ */
function loop(ts) {
  if (animSpeed > 0 && ts - lastTick >= [Infinity,1800,700,250,80,20][animSpeed]) {
    pixels   = pixels.map(driftPx);
    lastTick = ts;
    render();
  }
  requestAnimationFrame(loop);
}

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
pixels = Array.from({ length: numPixels }, randPx);

// Store initial speed index so i18n can re-translate it on lang switch
document.getElementById('lblAnim').dataset.speedIndex = animSpeed;

render();
requestAnimationFrame(loop);
