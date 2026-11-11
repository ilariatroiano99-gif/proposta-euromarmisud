(function () {
  var menuB = document.querySelector('.menu-bottone');
  var menu = document.getElementById('menu');
  if (menuB && menu) {
    function chiudi() { menu.classList.remove('aperto'); menuB.setAttribute('aria-expanded', 'false'); }
    menuB.addEventListener('click', function () {
      var aperto = menu.classList.toggle('aperto');
      menuB.setAttribute('aria-expanded', String(aperto));
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) chiudi(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { chiudi(); } });
  }

  var disegno = document.querySelector('.disegno');
  if (disegno) {
    var stretto = window.matchMedia('(max-width: 720px)');
    var inquadra = function () { disegno.setAttribute('viewBox', stretto.matches ? '-24 -112 1008 800' : '-248 -112 1216 800'); };
    inquadra();
    stretto.addEventListener('change', inquadra);
  }

  var tavole = Array.prototype.slice.call(document.querySelectorAll('.tav'));
  var bottoniTipo = Array.prototype.slice.call(document.querySelectorAll('.filtro-tipo button'));
  var bottoniPietra = Array.prototype.slice.call(document.querySelectorAll('.campioni button'));
  var vuoto = document.querySelector('.vuoto');
  var azzera = document.querySelector('.azzera');
  if (vuoto && azzera) {
    var tipo = 'tutti';
    var pietra = null;
    var aggiorna = function () {
      var visibili = 0;
      tavole.forEach(function (t) {
        var okTipo = tipo === 'tutti' || t.dataset.tipo === tipo;
        var okPietra = !pietra || t.dataset.pietre.indexOf(pietra) !== -1;
        t.hidden = !okTipo;
        t.classList.toggle('spenta', okTipo && !okPietra);
        if (okTipo && okPietra) visibili++;
      });
      vuoto.hidden = visibili > 0;
    };
    bottoniTipo.forEach(function (b) {
      b.addEventListener('click', function () {
        tipo = b.dataset.tipo;
        bottoniTipo.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        aggiorna();
      });
    });
    bottoniPietra.forEach(function (b) {
      b.addEventListener('click', function () {
        var attivo = b.getAttribute('aria-pressed') === 'true';
        pietra = attivo ? null : b.dataset.pietra;
        bottoniPietra.forEach(function (x) { x.setAttribute('aria-pressed', String(!attivo && x === b)); });
        aggiorna();
      });
    });
    azzera.addEventListener('click', function () {
      tipo = 'tutti';
      pietra = null;
      bottoniTipo.forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.tipo === 'tutti')); });
      bottoniPietra.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      aggiorna();
    });
  }

  var nastro = document.querySelector('.nastro-lista');
  if (nastro) {
    var frecce = Array.prototype.slice.call(document.querySelectorAll('.nastro-freccia'));
    var calma = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var stato = function () {
      var max = nastro.scrollWidth - nastro.clientWidth - 2;
      frecce.forEach(function (f) { f.disabled = f.dataset.verso === '-1' ? nastro.scrollLeft <= 2 : nastro.scrollLeft >= max; });
    };
    frecce.forEach(function (f) {
      f.addEventListener('click', function () {
        nastro.scrollBy({ left: Number(f.dataset.verso) * nastro.clientWidth * 0.8, behavior: calma ? 'auto' : 'smooth' });
      });
    });
    nastro.addEventListener('scroll', stato, { passive: true });
    window.addEventListener('resize', stato);
    stato();
  }

  var lastre = Array.prototype.slice.call(document.querySelectorAll('.lastra'));
  var tutte = document.querySelector('.pila-tutte');
  if (lastre.length && nastro) {
    var carte = Array.prototype.slice.call(nastro.querySelectorAll('.tav'));
    var scegli = function (pietra) {
      lastre.forEach(function (l) { l.setAttribute('aria-pressed', String(l.dataset.pietra === pietra)); });
      carte.forEach(function (c) { c.hidden = !!pietra && (' ' + c.dataset.pietre + ' ').indexOf(' ' + pietra + ' ') === -1; });
      tutte.hidden = !pietra;
      nastro.scrollLeft = 0;
      if (typeof stato === 'function') stato();
    };
    lastre.forEach(function (l) {
      l.addEventListener('click', function () { scegli(l.getAttribute('aria-pressed') === 'true' ? null : l.dataset.pietra); });
    });
    tutte.addEventListener('click', function () { scegli(null); });
  }

  var modulo = document.getElementById('modulo');
  if (modulo) {
    var campo = function (id) { return document.getElementById(id); };
    var scelta = new URLSearchParams(location.search).get('lavoro');
    if (scelta && campo('m-lavoro').querySelector('option[value="' + CSS.escape(scelta) + '"]')) campo('m-lavoro').value = scelta;
    var segna = function (input, errore, sbagliato) {
      errore.hidden = !sbagliato;
      if (sbagliato) { input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', errore.id); }
      else { input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); }
      return sbagliato;
    };
    var controlla = function () {
      var nome = campo('m-nome'), tel = campo('m-tel'), mail = campo('m-email'), testo = campo('m-testo');
      var v = function (x) { return x.value.trim(); };
      var mailStorta = v(mail) !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v(mail));
      var errori = [
        segna(nome, campo('e-nome'), v(nome) === '') && nome,
        segna(tel, campo('e-tel'), v(tel) === '' && v(mail) === '') && tel,
        segna(mail, campo('e-email'), mailStorta) && mail,
        segna(testo, campo('e-testo'), v(testo) === '') && testo
      ].filter(Boolean);
      return errori;
    };
    modulo.addEventListener('submit', function (e) {
      e.preventDefault();
      var errori = controlla();
      var esito = modulo.querySelector('.modulo-esito');
      if (errori.length) { esito.hidden = true; errori[0].focus(); return; }
      var dato = function (id) { return campo(id).value.trim(); };
      var lavoro = campo('m-lavoro');
      var righe = [
        'Nome: ' + dato('m-nome'),
        'Telefono: ' + (dato('m-tel') || 'non indicato'),
        'Email: ' + (dato('m-email') || 'non indicata'),
        'Tipo di lavoro: ' + lavoro.options[lavoro.selectedIndex].text,
        'Pietra: ' + (dato('m-pietra') || 'da definire'),
        'Comune: ' + (dato('m-comune') || 'non indicato'),
        '',
        dato('m-testo')
      ];
      esito.hidden = false;
      location.href = 'mailto:info@euromarmisud.it?subject=' + encodeURIComponent('Richiesta di preventivo dal sito') + '&body=' + encodeURIComponent(righe.join('\n'));
    });
    modulo.addEventListener('input', function (e) {
      if (e.target.getAttribute('aria-invalid') === 'true') controlla();
    });
  }
})();
