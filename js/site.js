/* Coty · portfolio — interacciones del sitio (menú, volver arriba, destacados y filtro de proyectos) */
(function () {
  var en = document.documentElement.lang === 'en';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var behavior = reduce ? 'auto' : 'smooth';

  // Menú móvil
  var CLOSE_ICON = '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M14.5 9.5L9.5 14.5"></path><path d="M9.5 9.5L14.5 14.5"></path><path d="M7 3.34A10 10 0 1 1 3.34 7"></path></svg>';
  Array.prototype.forEach.call(document.querySelectorAll('.cy-nav'), function (nav) {
    var btn = nav.querySelector('.cy-nav-burger');
    var panel = nav.querySelector('.cy-nav-panel');
    if (!btn || !panel) return;
    var openIcon = btn.innerHTML;
    function set(open) {
      nav.classList.toggle('is-open', open);
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? (en ? 'Close menu' : 'Cerrar menú') : (en ? 'Open menu' : 'Abrir menú'));
      btn.innerHTML = open ? CLOSE_ICON : openIcon;
    }
    btn.addEventListener('click', function () { set(!nav.classList.contains('is-open')); });
    Array.prototype.forEach.call(panel.querySelectorAll('a'), function (a) { a.addEventListener('click', function () { set(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { set(false); btn.focus(); } });
  });

  // Volver arriba
  var top = document.querySelector('.to-top');
  if (top) {
    var onScroll = function () { top.classList.toggle('is-visible', (window.scrollY || document.documentElement.scrollTop || 0) > 480); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: behavior }); });
  }

  // Destacados (abrir / cerrar descripción)
  Array.prototype.forEach.call(document.querySelectorAll('.feat-toggle'), function (btn) {
    var body = document.getElementById(btn.getAttribute('aria-controls'));
    var item = btn.closest('.feat-item');
    var title = item ? item.querySelector('.feat-title').textContent.trim() : '';
    var img = btn.querySelector('img');
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', (open ? (en ? 'Hide' : 'Ocultar') : (en ? 'Show' : 'Mostrar')) + (en ? ' description of ' : ' descripción de ') + title);
      if (body) { body.style.gridTemplateRows = open ? '1fr' : '0fr'; body.style.visibility = open ? 'visible' : 'hidden'; }
      if (img) img.style.transform = 'rotate(' + (open ? 180 : 0) + 'deg)';
    });
  });

  // Filtro de proyectos + "ver más"
  var section = document.getElementById('proyectos');
  var grid = section && section.querySelector('.cy-grid');
  if (!grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.cy-card'));
  var chips = Array.prototype.slice.call(section.querySelectorAll('.cy-chip'));
  var more = section.querySelector('.js-more');
  var LIMIT = 6;
  var state = { filter: 'todos', expanded: false };
  function catsOf(card) { var d = card.getAttribute('data-cats'); if (d) return d.split(' '); var m = card.className.match(/cy-card-(ux|branding|marketing|grafico)/); return m ? [m[1]] : []; }
  function keyOf(chip) { var m = chip.className.match(/cy-chip-h-(\w+)/); return m ? m[1] : 'todos'; }
  function render() {
    var list = cards.filter(function (c) { return state.filter === 'todos' || catsOf(c).indexOf(state.filter) >= 0; });
    cards.forEach(function (c) { c.hidden = true; });
    list.forEach(function (c, i) { c.hidden = !state.expanded && i >= LIMIT; });
    chips.forEach(function (chip) {
      var k = keyOf(chip), on = k === state.filter;
      chip.setAttribute('aria-pressed', String(on));
      chip.classList.toggle('is-on', on);
      ['ux', 'branding', 'marketing', 'grafico'].forEach(function (c) { chip.classList.remove('cy-chip-' + c); });
      if (on && k !== 'todos') chip.classList.add('cy-chip-' + k);
    });
    if (more) {
      more.parentNode.hidden = list.length <= LIMIT;
      more.querySelector('span').textContent = state.expanded ? (en ? 'Show less' : 'Ver menos') : (en ? 'See more projects' : 'Ver más proyectos');
      more.setAttribute('aria-expanded', String(state.expanded));
    }
  }
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () { state.filter = keyOf(chip); state.expanded = false; render(); });
  });
  if (more) more.addEventListener('click', function () { state.expanded = !state.expanded; render(); });

  // Llegar con la categoría filtrada: /#proyectos-ux
  function fromHash() {
    var m = (window.location.hash || '').match(/^#proyectos-(ux|branding|marketing|grafico)$/);
    if (!m) return false;
    state.filter = m[1]; state.expanded = false; render();
    setTimeout(function () { section.scrollIntoView({ behavior: behavior }); }, 60);
    return true;
  }
  window.addEventListener('hashchange', fromHash);
  if (!fromHash()) render();
})();
