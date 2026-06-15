/* ── Hash Router ── */
const VALID_SECTIONS = new Set([
  'hero', 'projects', 'featherrtos', 'cfd', 'orbital',
  'featherarch', 'research', 'blog', 'yt', 'about'
]);

function navigateTo(hash) {
  const target = hash || '#hero';
  const id = target.replace('#', '');
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const section = VALID_SECTIONS.has(id) ? document.querySelector(target) : document.querySelector('#notfound');
  if (section) {
    section.classList.add('active');
    const url = VALID_SECTIONS.has(id) ? target : '#notfound';
    if (location.hash !== url) history.replaceState(null, '', url);
  }
  document.querySelectorAll('.nav__link').forEach(l => {
    l.classList.toggle('active', l.getAttribute('data-nav') === id && VALID_SECTIONS.has(id));
  });
}

window.addEventListener('hashchange', () => navigateTo(location.hash));
window.addEventListener('popstate', () => navigateTo(location.hash || '#hero'));

/* ── Single delegated click handler for ALL nav links ── */
document.getElementById('navLinks').addEventListener('click', (e) => {
  const link = e.target.closest('.nav__link');
  if (!link) return;
  e.preventDefault();
  const hash = link.getAttribute('href');
  if (hash && hash.startsWith('#')) {
    history.pushState(null, '', hash);
    navigateTo(hash);
    document.getElementById('navLinks').classList.remove('open');
  }
});

/* ── Logo click ── */
document.querySelector('.nav__logo').addEventListener('click', (e) => {
  e.preventDefault();
  history.pushState(null, '', '#hero');
  navigateTo('#hero');
});

/* ── Mobile Menu Toggle ── */
(function() {
  const toggle = document.querySelector('.nav__toggle');
  const navLinks = document.getElementById('navLinks');
  if (!toggle || !navLinks) return;
  function toggleNav(e) {
    if (e.type === 'touchend') { e.preventDefault(); }
    navLinks.classList.toggle('open');
  }
  toggle.addEventListener('click', toggleNav);
  toggle.addEventListener('touchend', toggleNav, { passive: false });
})();

/* ── Project Card Click → Detail Page ── */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('click', () => {
    const project = card.getAttribute('data-project');
    if (project) {
      const hash = '#' + project;
      history.pushState(null, '', hash);
      navigateTo(hash);
    }
  });
});

/* ── Blog Read More: toggle full content ── */
document.querySelectorAll('.blog-entry__read').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const entry = link.closest('.blog-entry');
    const full = entry.querySelector('.blog-entry__full');
    if (full) {
      full.classList.toggle('visible');
      link.textContent = full.classList.contains('visible') ? 'Close ▲' : 'Read more ▸';
    }
  });
});

/* ── Scroll indicator → Projects ── */
const scrollIndicator = document.querySelector('.scroll-indicator');
if (scrollIndicator) {
  scrollIndicator.addEventListener('click', () => {
    history.pushState(null, '', '#projects');
    navigateTo('#projects');
  });
  scrollIndicator.style.cursor = 'pointer';
}

/* ── Back to Projects links ── */
document.querySelectorAll('.project-back').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const hash = link.getAttribute('href');
    history.pushState(null, '', hash);
    navigateTo(hash);
  });
});

/* ── Initial load ── */
navigateTo(location.hash || '#hero');

/* ── Parallax ── */
let px = 0, py = 0, tx = 0, ty = 0;

document.addEventListener('mousemove', (e) => {
  tx = (e.clientX / window.innerWidth - 0.5) * 2;
  ty = (e.clientY / window.innerHeight - 0.5) * 2;
});

function tickParallax() {
  px += (tx - px) * 0.1;
  py += (ty - py) * 0.1;
  const ox = px * 25;
  const oy = py * 25;
  const bg = document.getElementById('heroBg');
  if (bg) bg.style.transform = `translate3d(${ox}px, ${oy}px, 0)`;
  const an = document.getElementById('heroAnnotations');
  if (an) an.style.transform = `translate3d(${-ox * 0.6}px, ${-oy * 0.6}px, 0)`;
  requestAnimationFrame(tickParallax);
}
tickParallax();

/* ── CFD gallery carousel ── */
(function() {
  const gallery = document.getElementById('cfdGallery');
  if (!gallery) return;
  const slides = gallery.querySelectorAll('.cfd-gallery__img');
  const counter = document.getElementById('cfdGalleryCounter');
  const total = slides.length;
  if (total === 0) return;
  let current = 0;
  let timer = null;

  function show(idx) {
    slides.forEach(s => s.style.display = 'none');
    current = ((idx % total) + total) % total;
    slides[current].style.display = 'block';
    if (counter) counter.textContent = `${current + 1} / ${total}`;
  }

  function advance(dir) {
    show(current + dir);
    resetTimer();
  }

  function resetTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => show(current + 1), 5000);
  }

  gallery.querySelectorAll('.cfd-gallery__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      advance(btn.dataset.dir === 'next' ? 1 : -1);
    });
  });

  show(0);
})();

/* ── Profile age ── */
(function() {
  const el = document.getElementById('profileAge');
  if (!el) return;
  const birth = new Date(2008, 10, 16);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  el.textContent = age + ' years';
})();

/* ── YouTube latest video ── */
(function() {
  const player = document.getElementById('ytPlayer');
  if (!player) return;

  const channelId = 'UCUwJNMr9HlmiR02WJir8eUA';
  const cached = sessionStorage.getItem('ytLatest');

  if (cached) {
    player.src = `https://www.youtube.com/embed/${cached}?rel=0&autoplay=1`;
    const loading = document.getElementById('ytLoading');
    if (loading) loading.remove();
    return;
  }

  const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent('https://www.youtube.com/feeds/videos.xml?channel_id=' + channelId);

  fetch(proxyUrl)
    .then(r => r.text())
    .then(xml => {
      const id = xml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      if (!id) return;
      sessionStorage.setItem('ytLatest', id[1]);
      player.src = `https://www.youtube.com/embed/${id[1]}?rel=0&autoplay=1`;
      const loading = document.getElementById('ytLoading');
      if (loading) loading.remove();
    })
    .catch(() => {
      const loading = document.getElementById('ytLoading');
      if (loading) loading.textContent = 'Could not load video.';
    });
})();
