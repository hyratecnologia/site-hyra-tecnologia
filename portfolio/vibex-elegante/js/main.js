(function () {
  var hdr = document.querySelector('.hdr');
  var btn = document.getElementById('menuBtn');
  var menu = document.getElementById('menu');

  function setMenu(open) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.hidden = !open;
    hdr.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); btn.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1024 && !menu.hidden) setMenu(false); });

  function onScroll() { hdr.classList.toggle('solid', window.scrollY > 40); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var items = document.querySelectorAll('.reveal, .img-reveal, .draw');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach(function (el) {
    if (el.classList.contains('img-reveal')) {
      // clip-path esconde a figura do observer; observamos o pai
      var io2 = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { el.classList.add('in'); io2.disconnect(); } }, { rootMargin: '0px 0px -8% 0px' });
      io2.observe(el.parentElement);
    } else io.observe(el);
  });
})();
