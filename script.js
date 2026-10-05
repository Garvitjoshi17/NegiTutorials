async function resolveAssetDirectory() {
  try {
    const probe = await fetch('images/negi-tutorials-logo.jpg', {
      method: 'HEAD',
      cache: 'no-store'
    });
    if (probe.ok) return;

    document.querySelectorAll('img[src^="images/"], video[poster^="images/"], video source[src^="images/"]').forEach(asset => {
      const attribute = asset.tagName === 'VIDEO' ? 'poster' : 'src';
      asset.setAttribute(attribute, asset.getAttribute(attribute).slice('images/'.length));
      if (asset.tagName === 'SOURCE') asset.closest('video')?.load();
    });
  } catch (error) {
    console.warn('Could not check the image folder; using the configured asset paths.', error);
  }
}

resolveAssetDirectory();

const header = document.querySelector('.site-header');
const menuBtn = document.querySelector('.menu-trigger');
const mobileMenu = document.querySelector('.mobile-menu');

window.addEventListener('scroll', () => {
  header.classList.toggle('is-compact', window.scrollY > 24);
}, { passive: true });

function setMenu(open) {
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.textContent = open ? '×' : '☰';
  mobileMenu.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
}

menuBtn.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open')));
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

document.querySelectorAll('.video-play-button').forEach(button => {
  button.addEventListener('click', () => {
    const video = button.closest('.video-player');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${video.dataset.videoId}?autoplay=1`;
    iframe.title = video.dataset.videoTitle;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allowFullscreen = true;
    video.replaceChildren(iframe);
  });
});

document.querySelectorAll('.achievement-marquee').forEach(gallery => {
  const track = gallery.querySelector('.achievement-track');
  const firstSet = track.querySelector('.achievement-set');
  const duplicateSet = firstSet.cloneNode(true);
  duplicateSet.setAttribute('aria-hidden', 'true');
  track.append(duplicateSet);

  let isHovered = false;
  let resumeAt = 0;
  let previousFrame = 0;
  let fractionalPixels = 0;
  const pixelsPerMillisecond = 0.025;

  function pauseForInteraction() {
    resumeAt = performance.now() + 2500;
  }

  function animateGallery(timestamp) {
    const elapsed = previousFrame ? Math.min(timestamp - previousFrame, 50) : 0;
    previousFrame = timestamp;

    if (!isHovered && !document.hidden && timestamp >= resumeAt) {
      fractionalPixels += elapsed * pixelsPerMillisecond;
      const previousScrollLeft = gallery.scrollLeft;
      gallery.scrollLeft += fractionalPixels;
      fractionalPixels -= gallery.scrollLeft - previousScrollLeft;
      const loopWidth = firstSet.getBoundingClientRect().width;
      if (loopWidth && gallery.scrollLeft >= loopWidth) gallery.scrollLeft -= loopWidth;
    }

    requestAnimationFrame(animateGallery);
  }

  gallery.addEventListener('mouseenter', () => { isHovered = true; });
  gallery.addEventListener('mouseleave', () => { isHovered = false; });
  gallery.addEventListener('pointerdown', pauseForInteraction);

  gallery.addEventListener('wheel', event => {
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    const maxScroll = gallery.scrollWidth - gallery.clientWidth;
    const canScroll = delta < 0 ? gallery.scrollLeft > 0 : gallery.scrollLeft < maxScroll;
    if (canScroll && delta !== 0) {
      event.preventDefault();
      gallery.scrollLeft += delta;
      pauseForInteraction();
    }
  }, { passive: false });

  gallery.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    gallery.scrollBy({ left: event.key === 'ArrowRight' ? 280 : -280, behavior: 'smooth' });
    pauseForInteraction();
  });

  requestAnimationFrame(animateGallery);
});

const form = document.querySelector('.contact-form');
const formMessage = document.querySelector('.form-message');
form.addEventListener('submit', e => {
  e.preventDefault();
  const name = form.elements.name.value.trim();
  const phone = form.elements.phone.value.trim();
  const message = form.elements.message.value.trim();
  if (name.length < 2 || !/^[+\d()\s-]{7,}$/.test(phone) || message.length < 8) {
    formMessage.className = 'form-message error';
    formMessage.innerHTML = 'Please enter your name, a valid phone number and a message of at least 8 characters.';
    formMessage.hidden = false;
    return;
  }
  formMessage.className = 'form-message';
  formMessage.innerHTML = '✓ Your note is complete. This form is a preview and has not been sent—please contact the institute directly.';
  formMessage.hidden = false;
});
document.querySelector('.mobile-close').addEventListener('click', () => setMenu(false));
