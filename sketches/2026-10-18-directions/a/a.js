import { works, originalPrice, printPrice, protect, detailDialog, statementHTML, inFrame } from '/shared.js';

// The page works without the room: the painting, label, walk and dialogs are all plain DOM.
// room.js (three.js) is loaded afterwards as an enhancement; if it fails, nothing here changes.

const root = document.documentElement;
const img = document.querySelector('.hang .art');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let current = 0;
let room = null;
let busy = false;

if (inFrame()) {
  document.querySelector('[data-proto]').hidden = true;
  root.style.setProperty('--proto', '0px');
}
protect('.art');

const at = i => (i + works.length) % works.length;
const rectOf = () => img.getBoundingClientRect();

function setImage(work) {
  img.src = work.src;
  img.width = work.width;
  img.height = work.height;
  img.alt = work.alt;
  img.style.setProperty('--nw', `${work.width}px`);
  img.style.setProperty('--nh', `${work.height}px`);
  img.style.setProperty('--r', String(work.height / work.width));
  img.classList.toggle('land', work.landscape);
}

function setLabel(i) {
  const work = works[i];
  document.querySelector('[data-pos]').textContent = `Painting ${i + 1} of ${works.length}`;
  document.querySelector('[data-title]').textContent = work.title;
  document.querySelector('[data-original]').textContent = originalPrice(work);
  document.querySelector('[data-print]').textContent = printPrice(work);
  document.querySelector('[data-to="-1"]').textContent = works[at(i - 1)].title;
  document.querySelector('[data-to="1"]').textContent = works[at(i + 1)].title;
  for (const item of document.querySelectorAll('#index [data-i]')) {
    if (Number(item.dataset.i) === i) item.setAttribute('aria-current', 'true');
    else item.removeAttribute('aria-current');
  }
}

async function go(next) {
  next = at(next);
  if (busy || next === current) return;
  const from = current;
  current = next;
  setLabel(next);
  const neighbour = Math.abs(next - from) === 1;
  if (room && neighbour && !reduced.matches && room.ready(from, next)) {
    busy = true;
    try {
      room.lift(from);            // the 3D copy under the DOM image takes over
      img.style.visibility = 'hidden';
      setImage(works[next]);      // its CSS box is known before the file decodes
      await room.move(from, next, rectOf());
      await img.decode().catch(() => {});
    } finally {
      img.style.visibility = '';
      room?.place(next, rectOf());
      busy = false;
    }
  } else {
    setImage(works[next]);
    room?.place(next, rectOf());
  }
}

document.querySelectorAll('[data-step]').forEach(button =>
  button.addEventListener('click', () => go(current + Number(button.dataset.step))));

document.addEventListener('keydown', event => {
  if (document.querySelector('dialog[open]') || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target instanceof Element && event.target.closest('input, textarea, select')) return;
  if (event.key === 'ArrowRight') { event.preventDefault(); go(current + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); go(current - 1); }
});

// Dialogs
const openDetail = detailDialog(document.getElementById('detail'));
document.querySelector('[data-details]').addEventListener('click', () => openDetail(works[current]));
img.addEventListener('click', () => openDetail(works[current]));

for (const id of ['index', 'about']) {
  const dialog = document.getElementById(id);
  document.querySelector(`[data-open="${id}"]`).addEventListener('click', () => dialog.showModal());
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
}
document.querySelector('[data-statement]').innerHTML = statementHTML;

const list = document.querySelector('#index [data-list]');
works.forEach((work, i) => {
  const item = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.i = String(i);
  const title = document.createElement('span');
  title.textContent = work.title;
  const price = document.createElement('span');
  price.className = 'price';
  price.textContent = originalPrice(work);
  button.append(title, price);
  button.addEventListener('click', () => { document.getElementById('index').close(); go(i); });
  item.append(button);
  list.append(item);
});
setLabel(0);

// The room: loaded after first paint, never required.
function flat() {
  root.classList.remove('spatial');
  room = null;
}

async function loadRoom() {
  if (!('WebGL2RenderingContext' in window)) return;
  try {
    const { createRoom } = await import('./room.js');
    room = await createRoom(document.querySelector('canvas.room'), works, { onLost: flat });
    root.classList.add('spatial');
    room.place(current, rectOf());
  } catch (error) {
    console.warn('Room unavailable, showing the flat hang.', error);
    flat();
  }
}

// The canvas is fixed; if a short screen scrolls the page, the camera follows the painting's box.
let pending = 0;
const follow = () => {
  cancelAnimationFrame(pending);
  pending = requestAnimationFrame(() => { if (room && !busy) room.place(current, rectOf()); });
};
addEventListener('resize', follow);
addEventListener('scroll', follow, { passive: true });

requestAnimationFrame(() => setTimeout(loadRoom, 0));
