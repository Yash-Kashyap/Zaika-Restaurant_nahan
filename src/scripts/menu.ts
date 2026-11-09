import menuData from '../data/menu.json';
import { DISH_INDEX, bumpDish, getCartState } from './cart';

export function initMenu(): void {
  let activeCatIdx = 0;
  let query = '';

  const searchInput = document.querySelector<HTMLInputElement>('#menu-search-input');
  const clearBtn = document.querySelector<HTMLButtonElement>('#menu-search-clear');
  const dirEl = document.querySelector<HTMLElement>('#menu-dir');
  const titleEl = document.querySelector<HTMLElement>('#menu-title');
  const metaSubEl = document.querySelector<HTMLElement>('#menu-meta-sub');
  const emptyStateEl = document.querySelector<HTMLElement>('#menu-empty-state');
  const searchResultsList = document.querySelector<HTMLElement>('#menu-search-results');

  const sectionPanels = document.querySelectorAll<HTMLElement>('[data-menu-section]');
  const dirBtns = document.querySelectorAll<HTMLButtonElement>('[data-cat-btn]');
  const chipBtns = document.querySelectorAll<HTMLButtonElement>('[data-chip-btn]');

  function updateView(): void {
    const q = query.trim().toLowerCase();
    const isSearching = q.length > 0;

    if (clearBtn) {
      if (isSearching) {
        clearBtn.removeAttribute('hidden');
      } else {
        clearBtn.setAttribute('hidden', '');
      }
    }

    if (isSearching) {
      // Searching mode
      if (dirEl) dirEl.classList.add('dim');

      dirBtns.forEach((btn) => {
        btn.classList.remove('on');
        btn.setAttribute('aria-pressed', 'false');
      });
      chipBtns.forEach((btn) => {
        btn.classList.remove('on');
        btn.setAttribute('aria-selected', 'false');
      });

      // Hide all standard section panels
      sectionPanels.forEach((panel) => {
        panel.setAttribute('hidden', '');
      });

      // Find hits
      const seenNames = new Set<string>();
      interface SearchHit {
        n: string;
        p: string;
        d: string;
        t: string;
        cat: string;
      }
      const hits: SearchHit[] = [];

      menuData.forEach((section) => {
        section.items.forEach((item) => {
          if (seenNames.has(item.n)) return;
          const matchName = item.n.toLowerCase().includes(q);
          const matchDesc = item.d && item.d.toLowerCase().includes(q);
          const matchCat = section.name.toLowerCase().includes(q);

          if (matchName || matchDesc || matchCat) {
            seenNames.add(item.n);
            hits.push({
              n: item.n,
              p: item.p,
              d: item.d,
              t: item.t,
              cat: section.name,
            });
          }
        });
      });

      // Title & Meta
      if (titleEl) titleEl.textContent = `"${query.trim()}"`;
      if (metaSubEl) {
        metaSubEl.textContent = hits.length === 1 ? '1 dish found' : `${hits.length} dishes found`;
      }

      if (hits.length === 0) {
        if (emptyStateEl) emptyStateEl.removeAttribute('hidden');
        if (searchResultsList) {
          searchResultsList.setAttribute('hidden', '');
          searchResultsList.innerHTML = '';
        }
      } else {
        if (emptyStateEl) emptyStateEl.setAttribute('hidden', '');
        if (searchResultsList) {
          searchResultsList.removeAttribute('hidden');
          searchResultsList.innerHTML = '';

          const cart = getCartState().cart;

          hits.forEach((it) => {
            const qty = cart[it.n] || 0;
            const vmCls = it.t === 'n' ? 'vm n' : 'vm';
            const vmLabel = it.t === 'n' ? 'Non-veg' : 'Veg';

            const li = document.createElement('li');
            li.innerHTML = `
              <span class="${vmCls}" aria-label="${vmLabel}"></span>
              <span>
                <span class="nm">${it.n}</span>
                ${it.d ? `<span class="ds">${it.d}</span>` : ''}
                <span class="from">${it.cat}</span>
              </span>
              <span class="right">
                <span class="price">₹${it.p}</span>
                <span data-dish-ctrl="${it.n}">
                  <button class="add" type="button" data-dish-add aria-label="Add ${it.n} to your order" style="${qty > 0 ? 'display:none' : ''}">
                    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                      <path d="M7 2v10M2 7h10"></path>
                    </svg>Add
                  </button>
                  <span class="step" data-dish-step style="${qty > 0 ? 'display:inline-grid' : 'display:none'}">
                    <button type="button" data-dish-dec aria-label="Remove one ${it.n}">−</button>
                    <span data-dish-qty>${qty}</span>
                    <button type="button" data-dish-inc aria-label="Add one more ${it.n}">+</button>
                  </span>
                </span>
              </span>
            `;

            // Attach event listeners
            const addBtn = li.querySelector<HTMLButtonElement>('[data-dish-add]');
            const decBtn = li.querySelector<HTMLButtonElement>('[data-dish-dec]');
            const incBtn = li.querySelector<HTMLButtonElement>('[data-dish-inc]');

            addBtn?.addEventListener('click', () => bumpDish(it.n, 1));
            decBtn?.addEventListener('click', () => bumpDish(it.n, -1));
            incBtn?.addEventListener('click', () => bumpDish(it.n, 1));

            searchResultsList.appendChild(li);
          });
        }
      }
    } else {
      // Normal section browsing mode
      if (dirEl) dirEl.classList.remove('dim');
      if (emptyStateEl) emptyStateEl.setAttribute('hidden', '');
      if (searchResultsList) {
        searchResultsList.setAttribute('hidden', '');
        searchResultsList.innerHTML = '';
      }

      const activeCat = menuData[activeCatIdx];
      if (titleEl) titleEl.textContent = activeCat.name;
      if (metaSubEl) metaSubEl.textContent = `${activeCat.items.length} dishes`;

      // Update directory buttons & chips
      dirBtns.forEach((btn, idx) => {
        if (idx === activeCatIdx) {
          btn.classList.add('on');
          btn.setAttribute('aria-pressed', 'true');
        } else {
          btn.classList.remove('on');
          btn.setAttribute('aria-pressed', 'false');
        }
      });

      chipBtns.forEach((btn, idx) => {
        if (idx === activeCatIdx) {
          btn.classList.add('on');
          btn.setAttribute('aria-selected', 'true');
        } else {
          btn.classList.remove('on');
          btn.setAttribute('aria-selected', 'false');
        }
      });

      // Show only active category panel
      sectionPanels.forEach((panel, idx) => {
        if (idx === activeCatIdx) {
          panel.removeAttribute('hidden');
        } else {
          panel.setAttribute('hidden', '');
        }
      });
    }
  }

  // Bind directory buttons
  dirBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-cat-btn') || '0', 10);
      activeCatIdx = idx;
      query = '';
      if (searchInput) searchInput.value = '';
      updateView();
    });
  });

  // Bind chips
  chipBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-chip-btn') || '0', 10);
      activeCatIdx = idx;
      query = '';
      if (searchInput) searchInput.value = '';
      updateView();
    });
  });

  // Search input event
  searchInput?.addEventListener('input', (e) => {
    query = (e.target as HTMLInputElement).value;
    updateView();
  });

  // Clear button event
  clearBtn?.addEventListener('click', () => {
    query = '';
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
    }
    updateView();
  });

  updateView();
}

