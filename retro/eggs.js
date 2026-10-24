/* ==========================================================================
   Easter eggs: a list of what can be found, which of them this visitor has
   found (kept in their own browser), and a small note when they find one.
   The 1991 machine's AJ menu and the pocket device's Extras show the tally.
   ========================================================================== */
window.EGGS = (function () {
  const LIST = [
    ['sudo', 'Superuser', 'Asked the terminal for more power than it gives.'],
    ['phosphor', 'Phosphor', 'Changed the terminal’s colour.'],
    ['hire', 'Good idea', 'Ran the one command that matters.'],
    ['xyzzy', 'Adventurer', 'Said the magic word.'],
    ['ascii', 'Text mode', 'Looked at a photo made of characters.'],
    ['trash', 'Dumpster diver', 'Went through the 1991 Trash.'],
    ['bomb', 'Error type 26', 'Opened the file you were told not to.'],
    ['puzzle', 'Fifteen', 'Solved the sliding puzzle.'],
    ['pattern', 'Interior design', 'Changed the desktop pattern.'],
    ['keepresume', 'Second thoughts', 'Tried to throw the resume away.'],
    ['guestbook', 'Signed', 'Signed the 1998 guestbook.'],
    ['source', 'View source', 'Read the page’s source in 1998.'],
    ['counter', 'Hit counter', 'Clicked the hit counter.'],
    ['konami', 'Cheat code', 'Entered the code everyone knows.'],
    ['hold', 'On hold', 'Flipped the pocket device’s hold switch.'],
    ['light', 'Flashlight', 'Turned the backlight all the way up.'],
    ['tune', 'Chiptune', 'Played the pocket device’s tune.'],
    ['faceplate', 'New look', 'Swapped the pocket device’s faceplate.']
  ];
  const found = new Set(window.RETRO.store.get('eggs', []));
  let toastEl = null, toastT = 0;

  const toast = (text) => {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'egg-toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = text;
    toastEl.classList.remove('is-on');
    void toastEl.offsetWidth;
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('is-on'), 3400);
  };

  const api = {
    list: LIST,
    has: (id) => found.has(id),
    count: () => found.size,
    total: LIST.length,
    find(id) {
      if (found.has(id)) return false;
      const e = LIST.find((x) => x[0] === id);
      if (!e) return false;
      found.add(id);
      window.RETRO.store.set('eggs', [...found]);
      toast(`<b>★ Easter egg ${found.size}/${LIST.length}</b><span>${window.RETRO.esc(e[1])}</span>`);
      document.dispatchEvent(new CustomEvent('egg', { detail: id }));
      return true;
    },
    toast
  };

  /* The code everyone knows, anywhere outside a text field. */
  const seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let pos = 0;
  document.addEventListener('keydown', (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    pos = k === seq[pos] ? pos + 1 : (k === seq[0] ? 1 : 0);
    if (pos === seq.length) {
      pos = 0;
      api.find('konami');
      rain();
    }
  });

  /* A shower of little floppies. */
  const rain = () => {
    const box = document.createElement('div');
    box.className = 'disk-rain';
    box.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 36; i++) {
      const d = document.createElement('i');
      d.innerHTML = window.ICONS.svg('floppy', 32);
      d.style.left = Math.random() * 100 + 'vw';
      d.style.animationDelay = Math.random() * 1.6 + 's';
      d.style.animationDuration = 2.2 + Math.random() * 1.8 + 's';
      d.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      box.appendChild(d);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 5200);
  };

  return api;
})();
