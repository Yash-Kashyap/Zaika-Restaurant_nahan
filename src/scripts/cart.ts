import menuData from '../data/menu.json';
import { siteConfig } from '../data/site';

export interface CartItemDef {
  n: string;
  p: string;
  t: string;
  d: string;
  cat: string;
}

// Build index of all dishes by name
export const DISH_INDEX: Record<string, CartItemDef> = {};
menuData.forEach((section) => {
  section.items.forEach((item) => {
    if (!DISH_INDEX[item.n]) {
      DISH_INDEX[item.n] = {
        n: item.n,
        p: item.p,
        t: item.t,
        d: item.d,
        cat: section.name,
      };
    }
  });
});

export function money(x: number): string {
  const r = Math.round(x * 100) / 100;
  return r % 1 === 0 ? String(r) : r.toFixed(2);
}

export type OrderMode = 'takeaway' | 'table' | 'room';

export interface CartState {
  cart: Record<string, number>;
  order: string[];
  mode: OrderMode;
  oName: string;
  oRef: string;
  slipOpen: boolean;
}

const STORAGE_KEY = 'zaika-order-v1';

function loadState(): CartState {
  const fallback: CartState = {
    cart: {},
    order: [],
    mode: 'takeaway',
    oName: '',
    oRef: '',
    slipOpen: false,
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      cart: parsed.cart || {},
      order: Array.isArray(parsed.order) ? parsed.order : [],
      mode: parsed.mode || 'takeaway',
      oName: parsed.oName || '',
      oRef: parsed.oRef || '',
      slipOpen: false, // Start with slip closed
    };
  } catch {
    return fallback;
  }
}

function saveState(state: CartState): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        cart: state.cart,
        order: state.order,
        mode: state.mode,
        oName: state.oName,
        oRef: state.oRef,
      })
    );
  } catch {
    // Ignore storage quota errors
  }
}

let state: CartState = loadState();

export function getCartState(): CartState {
  return state;
}

export function bumpDish(name: string, delta: number): void {
  const q = (state.cart[name] || 0) + delta;
  if (q <= 0) {
    delete state.cart[name];
    state.order = state.order.filter((x) => x !== name);
  } else {
    if (!state.cart[name]) {
      state.order.push(name);
    }
    state.cart[name] = q;
  }

  if (state.order.length === 0) {
    state.slipOpen = false;
  }

  saveState(state);
  renderCart();
}

export function setMode(mode: OrderMode): void {
  state.mode = mode;
  saveState(state);
  renderCart();
}

export function setName(name: string): void {
  state.oName = name;
  saveState(state);
  updateWhatsAppLink();
}

export function setRef(ref: string): void {
  state.oRef = ref;
  saveState(state);
  updateWhatsAppLink();
}

export function openSlip(): void {
  if (state.order.length > 0) {
    state.slipOpen = true;
    renderCart();
  }
}

export function closeSlip(): void {
  state.slipOpen = false;
  renderCart();
}

export function clearCart(): void {
  state.cart = {};
  state.order = [];
  state.slipOpen = false;
  saveState(state);
  renderCart();
}

function generateWhatsAppUrl(): string {
  const modeNames: Record<OrderMode, string> = {
    takeaway: 'Takeaway',
    table: 'At a table',
    room: 'Hotel room',
  };

  const refLabel = state.mode === 'room' ? 'Room number' : 'Table number';

  let total = 0;
  const lines: string[] = ['Hello Zaika, I would like to order:'];

  state.order.forEach((name) => {
    const qty = state.cart[name] || 0;
    const it = DISH_INDEX[name] || { p: '0' };
    total += parseFloat(it.p) * qty;
    lines.push(`• ${qty} × ${name}`);
  });

  lines.push(`Estimated total: ₹${money(total)} (Zomato prices)`);

  let modeLine = `Order type: ${modeNames[state.mode]}`;
  if (state.mode !== 'takeaway' && state.oRef.trim()) {
    modeLine += ` (${refLabel} ${state.oRef.trim()})`;
  }
  lines.push(modeLine);

  if (state.oName.trim()) {
    lines.push(`Name: ${state.oName.trim()}`);
  }

  return `https://wa.me/${siteConfig.whatsappRaw}?text=${encodeURIComponent(lines.join('\n'))}`;
}

function updateWhatsAppLink(): void {
  const waBtn = document.querySelector<HTMLAnchorElement>('[data-cart-wa-btn]');
  if (waBtn) {
    waBtn.href = generateWhatsAppUrl();
  }
}

export function renderCart(): void {
  let total = 0;
  let count = 0;

  state.order.forEach((name) => {
    const qty = state.cart[name] || 0;
    const it = DISH_INDEX[name];
    if (it) {
      total += parseFloat(it.p) * qty;
      count += qty;
    }
  });

  const formattedTotal = money(total);
  const dishLabel = count === 1 ? '1 dish on your slip' : `${count} dishes on your slip`;

  // 1. Update all dish controls (Add buttons & Steppers)
  document.querySelectorAll<HTMLElement>('[data-dish-ctrl]').forEach((container) => {
    const dish = container.getAttribute('data-dish-ctrl');
    if (!dish) return;
    const qty = state.cart[dish] || 0;

    const addBtn = container.querySelector<HTMLElement>('[data-dish-add]');
    const stepBox = container.querySelector<HTMLElement>('[data-dish-step]');
    const qtyEl = container.querySelector<HTMLElement>('[data-dish-qty]');

    if (qty > 0) {
      if (addBtn) addBtn.style.display = 'none';
      if (stepBox) stepBox.style.display = 'inline-grid';
      if (qtyEl) qtyEl.textContent = String(qty);
    } else {
      if (addBtn) addBtn.style.display = '';
      if (stepBox) stepBox.style.display = 'none';
    }
  });

  // 2. Update Ticket Bar
  const ticket = document.getElementById('order-ticket');
  if (ticket) {
    if (count > 0 && !state.slipOpen) {
      ticket.removeAttribute('hidden');
      const countEl = ticket.querySelector('[data-ticket-count]');
      const totalEl = ticket.querySelector('[data-ticket-total]');
      if (countEl) countEl.textContent = dishLabel;
      if (totalEl) totalEl.textContent = `₹${formattedTotal}`;
    } else {
      ticket.setAttribute('hidden', '');
    }
  }

  // 3. Update Order Slip Drawer
  const slipWrap = document.getElementById('order-slip-wrap');
  if (slipWrap) {
    if (state.slipOpen && count > 0) {
      slipWrap.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';

      // Render slip list
      const listEl = slipWrap.querySelector('[data-slip-list]');
      if (listEl) {
        listEl.innerHTML = '';
        state.order.forEach((name) => {
          const qty = state.cart[name] || 0;
          const it = DISH_INDEX[name];
          if (!it || qty <= 0) return;
          const lineTotal = money(parseFloat(it.p) * qty);
          const vmCls = it.t === 'n' ? 'vm n' : 'vm';
          const vmLabel = it.t === 'n' ? 'Non-veg' : 'Veg';

          const li = document.createElement('li');
          li.innerHTML = `
            <span class="nm"><span class="${vmCls}" aria-label="${vmLabel}"></span>${it.n}</span>
            <span class="step">
              <button type="button" data-slip-dec="${it.n}" aria-label="Remove one ${it.n}">−</button>
              <span>${qty}</span>
              <button type="button" data-slip-inc="${it.n}" aria-label="Add one more ${it.n}">+</button>
            </span>
            <span class="sub">${qty} × ₹${it.p} = ₹${lineTotal}</span>
          `;
          listEl.appendChild(li);
        });

        // Wire up buttons in slip
        listEl.querySelectorAll<HTMLButtonElement>('[data-slip-dec]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const n = btn.getAttribute('data-slip-dec');
            if (n) bumpDish(n, -1);
          });
        });
        listEl.querySelectorAll<HTMLButtonElement>('[data-slip-inc]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const n = btn.getAttribute('data-slip-inc');
            if (n) bumpDish(n, 1);
          });
        });
      }

      // Update total
      const totalEl = slipWrap.querySelector('[data-slip-total]');
      if (totalEl) totalEl.textContent = `₹${formattedTotal}`;

      // Update mode buttons
      slipWrap.querySelectorAll<HTMLButtonElement>('[data-mode-btn]').forEach((btn) => {
        const m = btn.getAttribute('data-mode-btn') as OrderMode;
        if (m === state.mode) {
          btn.classList.add('on');
          btn.setAttribute('aria-pressed', 'true');
        } else {
          btn.classList.remove('on');
          btn.setAttribute('aria-pressed', 'false');
        }
      });

      // Update ref field visibility and labels
      const refField = slipWrap.querySelector<HTMLElement>('[data-ref-field]');
      const refLabel = slipWrap.querySelector<HTMLElement>('[data-ref-label]');
      const refInput = slipWrap.querySelector<HTMLInputElement>('[data-ref-input]');

      if (refField && refLabel && refInput) {
        if (state.mode === 'takeaway') {
          refField.style.display = 'none';
        } else {
          refField.style.display = 'flex';
          if (state.mode === 'room') {
            refLabel.textContent = 'Room number';
            refInput.placeholder = 'e.g. 204';
          } else {
            refLabel.textContent = 'Table number';
            refInput.placeholder = 'e.g. Window table 4';
          }
          refInput.value = state.oRef;
        }
      }

      const nameInput = slipWrap.querySelector<HTMLInputElement>('[data-name-input]');
      if (nameInput) {
        nameInput.value = state.oName;
      }

      updateWhatsAppLink();
    } else {
      slipWrap.setAttribute('hidden', '');
      document.body.style.overflow = '';
    }
  }
}

export function initCart(): void {
  // Wire global buttons:
  // Add buttons
  document.querySelectorAll<HTMLButtonElement>('[data-dish-add]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const container = btn.closest<HTMLElement>('[data-dish-ctrl]');
      const dish = container?.getAttribute('data-dish-ctrl');
      if (dish) bumpDish(dish, 1);
    });
  });

  // Stepper dec
  document.querySelectorAll<HTMLButtonElement>('[data-dish-dec]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const container = btn.closest<HTMLElement>('[data-dish-ctrl]');
      const dish = container?.getAttribute('data-dish-ctrl');
      if (dish) bumpDish(dish, -1);
    });
  });

  // Stepper inc
  document.querySelectorAll<HTMLButtonElement>('[data-dish-inc]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const container = btn.closest<HTMLElement>('[data-dish-ctrl]');
      const dish = container?.getAttribute('data-dish-ctrl');
      if (dish) bumpDish(dish, 1);
    });
  });

  // Open slip buttons
  document.querySelectorAll('[data-open-slip]').forEach((btn) => {
    btn.addEventListener('click', openSlip);
  });

  // Close slip buttons & backdrop
  document.querySelectorAll('[data-close-slip]').forEach((btn) => {
    btn.addEventListener('click', closeSlip);
  });

  // Clear slip button
  document.querySelectorAll('[data-clear-slip]').forEach((btn) => {
    btn.addEventListener('click', clearCart);
  });

  // Mode buttons in slip
  document.querySelectorAll<HTMLButtonElement>('[data-mode-btn]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const m = btn.getAttribute('data-mode-btn') as OrderMode;
      if (m) setMode(m);
    });
  });

  // Name & Ref inputs
  const nameInput = document.querySelector<HTMLInputElement>('[data-name-input]');
  nameInput?.addEventListener('input', (e) => {
    setName((e.target as HTMLInputElement).value);
  });

  const refInput = document.querySelector<HTMLInputElement>('[data-ref-input]');
  refInput?.addEventListener('input', (e) => {
    setRef((e.target as HTMLInputElement).value);
  });

  // Esc key closes slip
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.slipOpen) {
      closeSlip();
    }
  });

  renderCart();
}

