export function nowIST(): number {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(new Date());
    let h = 0, m = 0;
    parts.forEach((p) => {
      if (p.type === 'hour') h = parseInt(p.value, 10);
      if (p.type === 'minute') m = parseInt(p.value, 10);
    });
    return (h % 24) * 60 + m;
  } catch {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }
}

export interface StatusInfo {
  on: boolean;
  short: string;
  text: string;
}

export function getStatus(t: number = nowIST()): StatusInfo {
  const a = 8 * 60 + 15; // 8:15 am = 495
  const b = 16 * 60;     // 4:00 pm = 960
  const c = 18 * 60;     // 6:00 pm = 1080
  const d = 22 * 60 + 45; // 10:45 pm = 1365

  if (t >= a && t < b) {
    return {
      on: true,
      short: 'Open now',
      text: 'Day sitting until 4 pm. The night sitting starts at 6.',
    };
  }
  if (t >= c && t < d) {
    return {
      on: true,
      short: 'Open now',
      text: 'Night sitting until 10:45 pm.',
    };
  }
  if (t >= b && t < c) {
    return {
      on: false,
      short: 'Back at 6 pm',
      text: 'Between sittings. The kitchen reopens at 6 pm.',
    };
  }
  return {
    on: false,
    short: 'Opens 8:15 am',
    text: 'Closed for the night. The doors open again at 8:15 am.',
  };
}

export function initStatus(): void {
  function update(): void {
    const st = getStatus();

    // Update dots
    document.querySelectorAll('[data-status-dot]').forEach((el) => {
      if (st.on) {
        el.classList.add('on');
      } else {
        el.classList.remove('on');
      }
    });

    // Update text
    document.querySelectorAll('[data-status-text]').forEach((el) => {
      el.textContent = st.text;
    });

    // Update short
    document.querySelectorAll('[data-status-short]').forEach((el) => {
      el.textContent = st.short;
    });
  }

  update();
  setInterval(update, 60000);
}

