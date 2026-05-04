const TRANSLATIONS = {
  en: {
    'header.title':         'LSB · Steganography Visualizer',
    'header.hint':          'Click any pixel on the left to change its color',
    'ctrl.pixels':          'Pixels',
    'ctrl.channels':        'Channels',
    'ctrl.message':         'Message',
    'ctrl.animation':       'Animation',
    'ctrl.randomize':       'Randomize colors',
    'ctrl.msg.placeholder': 'Type the secret message...',
    'legend.normal':        'Normal bit',
    'legend.avail':         'Available LSB (original)',
    'legend.changed':       'LSB replaced by message bit',
    'legend.same':          'LSB matches message bit (no change)',
    'panel.orig.title':     'Original Image',
    'panel.orig.sub':       'Click a pixel to set its color',
    'panel.steg.title':     'Steganographed Image',
    'panel.steg.sub':       'LSBs replaced with message bits',
    'footer.title':         'Message bits → embedding flow',
    'decoded.label':        'Message decoded from steganographed image',
    'msg.empty':            'Type a message to see the bits...',
    'stat.capacity':        'Capacity:',
    'stat.message':         'Message:',
    'stat.embedded':        'Embedded:',
    'stat.fits':            'Fits completely',
    'stat.truncated':       'Message truncated',
    'stat.channels':        'Channels:',
    'decoded.none':         '— (no readable data)',
    'px.prefix':            'px',
    'speed.0':              'Paused',
    'speed.1':              'Slow',
    'speed.2':              'Normal',
    'speed.3':              'Fast',
    'speed.4':              'Faster',
    'speed.5':              'Maximum',
    'lang.switch':          'Español',
  },
  es: {
    'header.title':         'LSB · Esteganografía Visual',
    'header.hint':          'Haz clic en cualquier píxel (izquierda) para cambiar su color',
    'ctrl.pixels':          'Píxeles',
    'ctrl.channels':        'Canales',
    'ctrl.message':         'Mensaje',
    'ctrl.animation':       'Animación',
    'ctrl.randomize':       'Randomizar colores',
    'ctrl.msg.placeholder': 'Escribe el mensaje secreto...',
    'legend.normal':        'Bit normal',
    'legend.avail':         'LSB disponible (original)',
    'legend.changed':       'LSB reemplazado por bit del mensaje',
    'legend.same':          'LSB igual al bit del mensaje (sin cambio)',
    'panel.orig.title':     'Imagen Original',
    'panel.orig.sub':       'Clic en un píxel para elegir su color',
    'panel.steg.title':     'Imagen Esteganografiada',
    'panel.steg.sub':       'LSBs reemplazados con bits del mensaje',
    'footer.title':         'Bits del mensaje → flujo de incrustación',
    'decoded.label':        'Mensaje decodificado desde la imagen esteganografiada',
    'msg.empty':            'Escribe un mensaje para ver los bits...',
    'stat.capacity':        'Capacidad:',
    'stat.message':         'Mensaje:',
    'stat.embedded':        'Incrustados:',
    'stat.fits':            'Cabe completo',
    'stat.truncated':       'Mensaje truncado',
    'stat.channels':        'Canales:',
    'decoded.none':         '— (sin datos legibles)',
    'px.prefix':            'px',
    'speed.0':              'Pausado',
    'speed.1':              'Lento',
    'speed.2':              'Normal',
    'speed.3':              'Rápido',
    'speed.4':              'Veloz',
    'speed.5':              'Máximo',
    'lang.switch':          'English',
  },
};

let currentLang = 'en';

function t(key) {
  return TRANSLATIONS[currentLang][key] ?? TRANSLATIONS.en[key] ?? key;
}

function applyTranslations() {
  document.documentElement.lang = currentLang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  // Speed label re-translation: the current speed index is stored on the element
  const lblAnim = document.getElementById('lblAnim');
  if (lblAnim && lblAnim.dataset.speedIndex !== undefined) {
    lblAnim.textContent = t(`speed.${lblAnim.dataset.speedIndex}`);
  }
}

function setLang(lang) {
  currentLang = lang;
  document.getElementById('selLang').value = lang;
  applyTranslations();
  if (typeof render === 'function') render();
}

document.getElementById('selLang').addEventListener('change', e => {
  setLang(e.target.value);
});

// Apply default language on load
applyTranslations();
