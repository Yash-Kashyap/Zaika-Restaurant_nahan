export function initFloors(): void {
  // 1. Lift doors and reveal observers
  const map: Record<string, string> = { 'floor-1': 'f1', 'floor-2': 'f2', window: 'w' };

  if (typeof IntersectionObserver === 'undefined') {
    document.querySelectorAll('.doors').forEach((d) => d.classList.add('open'));
    document.querySelectorAll('.reveal').forEach((r) => r.classList.add('in'));
  } else {
    const seenObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const doors = target.querySelector('.doors');
            if (doors) doors.classList.add('open');
            target.querySelectorAll('.reveal').forEach((r) => r.classList.add('in'));
            seenObserver.unobserve(target);
          }
        });
      },
      { threshold: 0.15 }
    );

    ['floor-1', 'floor-2', 'window'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) seenObserver.observe(el);
    });

    // 2. Floor indicator tracking
    const floorObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const floor = entry.target.getAttribute('data-floor');
            if (floor) {
              document.querySelectorAll('.lift li').forEach((li) => {
                if (li.getAttribute('data-floor-label') === floor) {
                  li.classList.add('on');
                } else {
                  li.classList.remove('on');
                }
              });
            }
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );

    document.querySelectorAll('[data-floor]').forEach((el) => {
      floorObserver.observe(el);
    });
  }

  // 3. Overlay navigation (Floors menu)
  const overlay = document.getElementById('floor-overlay');
  const openBtn = document.querySelector('[data-open-nav]');
  const closeBtn = document.querySelector('[data-close-nav]');

  function openOverlay(): void {
    if (!overlay) return;
    overlay.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    const firstFocusable = overlay.querySelector<HTMLElement>('a, button');
    firstFocusable?.focus();
  }

  function closeOverlay(): void {
    if (!overlay) return;
    overlay.setAttribute('hidden', '');
    document.body.style.overflow = '';
    (openBtn as HTMLElement)?.focus();
  }

  openBtn?.addEventListener('click', openOverlay);
  closeBtn?.addEventListener('click', closeOverlay);

  overlay?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeOverlay);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay && !overlay.hasAttribute('hidden')) {
      closeOverlay();
    }
  });
}

