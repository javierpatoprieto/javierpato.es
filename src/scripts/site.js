/* javierpato.es — estudio de diseño · light editorial */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

function initLenis() {
  if (reduce || typeof Lenis === 'undefined') return;
  const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length > 1 && $(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: 0, duration: 1.3 }); }
  }));
}

function initCursor() {
  if (!fine || reduce) return;
  const cur = $('.cur'); if (!cur) return;
  document.body.classList.remove('cur-hide');
  let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
  addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
  (function loop() { cx += (mx - cx) * 0.22; cy += (my - cy) * 0.22;
    cur.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`; requestAnimationFrame(loop); })();
  addEventListener('mouseleave', () => document.body.classList.add('cur-hide'));
  addEventListener('mouseenter', () => document.body.classList.remove('cur-hide'));
  $$('a, button, [data-cursor]').forEach((el) => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cur-active'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cur-active'));
  });
}

function initMagnetic() {
  if (!fine || reduce) return;
  $$('[data-magnetic]').forEach((el) => {
    const s = parseFloat(el.dataset.magnetic) || 0.3;
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * s}px, ${(e.clientY - (r.top + r.height / 2)) * s}px)`; });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

function splitLines() {
  $$('.split').forEach((el) => { if (el.dataset.split) return; el.dataset.split = '1';
    el.innerHTML = el.innerHTML.split(/<br\s*\/?>/i).map((l) => `<span class="ln"><span>${l.trim()}</span></span>`).join(''); });
}
function initReveals() {
  splitLines();
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }),
    { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal, .split, .plate.clip').forEach((el) => io.observe(el));
}

function initNav() {
  const nav = $('.nav'); if (!nav) return;
  const on = () => nav.classList.toggle('scrolled', scrollY > 30); on(); addEventListener('scroll', on, { passive: true });
  const burger = $('#burger'), links = $('#nav-links');
  if (burger && links) burger.addEventListener('click', () => { links.classList.toggle('open'); document.documentElement.classList.toggle('nav-open'); });
  $$('a', links || nav).forEach((a) => a.addEventListener('click', () => { links && links.classList.remove('open'); document.documentElement.classList.remove('nav-open'); }));
}

function start() { initLenis(); initCursor(); initMagnetic(); initReveals(); initNav(); }
if (document.readyState !== 'loading') start();
else document.addEventListener('DOMContentLoaded', start);
