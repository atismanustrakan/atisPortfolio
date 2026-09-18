// Enhance the page without hiding content when JavaScript is unavailable.
const skills = document.querySelector('.skills-list');
if (skills) {
  const rows = [...skills.children];
  const filters = document.createElement('div');
  filters.className = 'skill-filters';
  filters.setAttribute('role', 'group');
  filters.setAttribute('aria-label', 'Filter skills');
  const labels = ['All', ...rows.map(row => row.querySelector('dt').textContent)];
  labels.forEach((label, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.setAttribute('aria-pressed', String(index === 0));
    button.addEventListener('click', () => {
      filters.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      rows.forEach((row, rowIndex) => { row.hidden = index !== 0 && rowIndex !== index - 1; });
    });
    filters.append(button);
  });
  skills.before(filters);
}

const dialog = document.createElement('dialog');
dialog.className = 'image-dialog';
dialog.setAttribute('aria-labelledby', 'preview-title');
dialog.innerHTML = '<div class="preview-heading"><h2 id="preview-title"></h2><button type="button" autofocus>Close <span aria-hidden="true">×</span></button></div><img alt="">';
document.body.append(dialog);
let opener;
const closePreview = () => dialog.close();
dialog.querySelector('button').addEventListener('click', closePreview);
dialog.addEventListener('click', event => { if (event.target === dialog) {
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closePreview();
} });
dialog.addEventListener('close', () => { document.body.classList.remove('preview-open'); opener?.focus(); });
document.querySelectorAll('.project-visual').forEach(figure => {
  const img = figure.querySelector('img');
  const name = figure.closest('article').querySelector('h3').textContent;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'preview-trigger';
  button.setAttribute('aria-label', `Enlarge ${name} preview`);
  button.setAttribute('aria-haspopup', 'dialog');
  button.dataset.cursor = 'VIEW ↗';
  img.before(button);
  button.append(img);
  const hint = document.createElement('span');
  hint.className = 'preview-hint';
  hint.textContent = 'Explore preview ↗';
  button.append(hint);
  button.addEventListener('click', () => {
    opener = button;
    dialog.querySelector('h2').textContent = `${name} · live interface`;
    const enlarged = dialog.querySelector('img');
    enlarged.src = img.src;
    enlarged.alt = img.alt;
    dialog.showModal();
    document.body.classList.add('preview-open');
  });
});

if (matchMedia('(pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const cursorLabel = document.createElement('div');
  cursorLabel.className = 'cursor-label';
  cursorLabel.setAttribute('aria-hidden', 'true');
  document.body.append(cursorLabel);
  let cursorFrame = 0;
  let cursorX = 0;
  let cursorY = 0;
  const paintCursor = () => {
    cursorLabel.style.setProperty('--cursor-x', `${cursorX}px`);
    cursorLabel.style.setProperty('--cursor-y', `${cursorY}px`);
    cursorFrame = 0;
  };
  document.querySelectorAll('[data-cursor], a[href*="github.com"]').forEach(target => {
    if (!target.dataset.cursor) target.dataset.cursor = 'CODE ↗';
    target.addEventListener('pointerenter', () => {
      cursorLabel.textContent = target.dataset.cursor;
      cursorLabel.classList.add('is-visible');
    });
    target.addEventListener('pointermove', event => {
      cursorX = event.clientX;
      cursorY = event.clientY;
      if (!cursorFrame) cursorFrame = requestAnimationFrame(paintCursor);
    });
    target.addEventListener('pointerleave', () => cursorLabel.classList.remove('is-visible'));
  });
}

const contactForm = document.querySelector('.contact-form');
contactForm.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const name = data.get('name').trim();
  const email = data.get('email').trim();
  const message = data.get('body').trim();
  if (!name || !message) {
    contactForm.querySelector('.contact-form-status').textContent = 'Please add your name and a message.';
    return;
  }
  const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
  const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nEmail: ${email}`);
  window.location.href = `mailto:atismanustrakan1@gmail.com?subject=${subject}&body=${body}`;
  contactForm.querySelector('.contact-form-status').textContent = 'Your email draft is ready to open. If your email app doesn’t open, use the email address alongside this form.';
});

const sections = [...document.querySelectorAll('main > section[id]')];
const links = [...document.querySelectorAll('nav a')];
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const marquee = document.querySelector('.tech-marquee');
if (marquee && 'IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    marquee.classList.toggle('is-offscreen', !entry.isIntersecting);
  }).observe(marquee);
}
const progress = document.createElement('div');
progress.className = 'reading-progress';
progress.setAttribute('aria-hidden', 'true');
document.body.append(progress);
const rail = document.createElement('nav');
rail.className = 'chapter-rail';
rail.setAttribute('aria-label', 'Page sections');
sections.forEach((section, index) => {
  const link = document.createElement('a');
  link.href = `#${section.id}`;
  const title = section.querySelector('h2').textContent;
  link.setAttribute('aria-label', title);
  const number = document.createElement('span');
  number.textContent = String(index + 1).padStart(2, '0');
  const label = document.createElement('span');
  label.className = 'chapter-label';
  label.textContent = title;
  link.append(number, label);
  rail.append(link);
});
document.body.append(rail);
const chapterLinks = [...rail.querySelectorAll('a')];
// Reveal whole sections once, in reading order, without hiding content from
// keyboard users or requiring motion when reduced motion is enabled.
const revealSection = section => section.classList.add('is-revealed');
if ('IntersectionObserver' in window && !motionPreference.matches) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        revealSection(entry.target);
        sectionObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
  sections.forEach(section => {
    section.classList.add('section-reveal');
    if (section.getBoundingClientRect().top < window.innerHeight * .92) revealSection(section);
    else sectionObserver.observe(section);
    section.addEventListener('focusin', () => revealSection(section));
  });
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) {
      sections.forEach(revealSection);
      sectionObserver.disconnect();
    }
  });
}
let scheduled = false;
function updateNavigation() {
  const viewport = window.innerHeight;
  const current = sections.filter(section => section.getBoundingClientRect().top <= Math.min(240, viewport * .35)).at(-1);
  [...links, ...chapterLinks].forEach(link => {
    if (current && link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  const range = document.documentElement.scrollHeight - viewport;
  progress.style.transform = `scaleX(${range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0})`;
  document.querySelector('.header').classList.toggle('is-scrolled', window.scrollY > 24);
  scheduled = false;
}
function scheduleUpdate() {
  if (!scheduled) { scheduled = true; requestAnimationFrame(updateNavigation); }
}
window.addEventListener('scroll', scheduleUpdate, { passive: true });
window.addEventListener('resize', scheduleUpdate);
motionPreference.addEventListener('change', scheduleUpdate);
document.addEventListener('toggle', scheduleUpdate, true);
document.addEventListener('click', scheduleUpdate);
window.addEventListener('load', scheduleUpdate);
if ('ResizeObserver' in window) new ResizeObserver(scheduleUpdate).observe(document.querySelector('main'));
updateNavigation();
