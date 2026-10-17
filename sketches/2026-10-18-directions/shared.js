// Shared by both prototypes: catalogue data, price text, casual-save deterrent and the detail dialog.
// Facts copied from src/artworks.ts (catalogue order is display order). No DOM access at import time.

const entries = [
  { slug: 'figure-with-skull', title: 'Figure with Skull', price: 1400, width: 944, height: 1303, description: 'A dark-haired woman holds a skull against her cheek, drawn in charcoal over layers of white and pale pink.' },
  { slug: 'over-the-shoulder', title: 'Over the Shoulder', price: 1200, width: 903, height: 1232, description: 'A woman looks back over a bare shoulder, in soft layers of grey, black and warm neutral tones.' },
  { slug: 'portrait-with-rose', title: 'Rose Sitter', price: 1400, width: 806, height: 1258, description: 'A woman holds a dark rose to her chest, lit warm against ochre, charcoal and broken white marks.' },
  { slug: 'new-painting-2026', title: 'Vigil', price: 1200, width: 887, height: 1269, description: 'A seated woman lets a dark garment slip from her shoulders, against a rose ground of deep red and pale marks.' },
  { slug: 'abstract-blue-loops', title: 'Blue Undertow', price: 950, width: 2384, height: 1575, description: 'Heavy black loops sweep across a blue-grey ground banded with gold, violet and rose.' },
  { slug: 'figure-exhaling-red', title: 'Red Breath', price: 1400, width: 1862, height: 2400, description: 'A bald figure tips its head back as a cloud of red breath rises into a scraped black ground.' },
  { slug: 'woman-cigarette', title: 'Last Light', price: 1200, width: 636, height: 800, description: 'A woman lights a cigarette, the flame glowing orange on her face, with smoke curling into her dark hair.' },
  { slug: 'purple-splatter', title: 'Bruise', price: 950, width: 1001, height: 1240, description: 'Tangled white lines of poured paint cross a black ground flecked with violet.' },
  { slug: 'black-splatter', title: 'Pitch', price: 950, width: 1817, height: 2178, description: 'Dense loops of white and grey poured paint over a black ground.' },
  { slug: 'woman-cigarette-easel', title: 'Smoke at the Easel', price: 1400, width: 1048, height: 1482, description: 'A woman with loosely pinned dark hair looks down, a cigarette in her hand, in grey and charcoal tones.' },
];

export const works = entries.map(entry => {
  const landscape = entry.width > entry.height;
  return {
    ...entry,
    year: 2026,
    medium: 'Acrylic, charcoal and pastel on canvas',
    landscape,
    size: landscape ? '90 × 60 cm' : '60 × 90 cm',
    src: `/art/${entry.slug}-web.jpg`,
    alt: `${entry.title}, a painting by Harrison Ferraro. ${entry.description}`,
  };
});

// Harry's statement, verbatim from src/app/about/page.tsx. The word "red" is wrapped for the one red accent.
export const statementHTML = 'I paint people in the moments they don’t perform: an exhale, a turned shoulder, smoke hanging in the air. I work in acrylic, charcoal and pastel on canvas, building the surface up and tearing it back until what’s left feels honest. The palette stays dark, with <span class="red">red</span> used only where it hurts. Every piece is an original, made in Melbourne.';

export const EDITION = 10;

// Same format as artworkPrice() in src/artworks.ts.
export const originalPrice = work => `$${work.price.toLocaleString('en-AU')} AUD`;

// A third of the original. Shown to the cent, with "about" when the third does not divide evenly.
// Rounding is provisional for this prototype; Harry confirms final print prices.
export function printPrice(work) {
  const third = work.price / 3;
  const exact = Number.isInteger(third);
  const amount = exact
    ? third.toLocaleString('en-AU')
    : third.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${exact ? '' : 'about '}$${amount} AUD`;
}

// Deters casual saving only. A screenshot cannot be blocked and nothing here claims otherwise.
export function protect(selector = '.art') {
  const guarded = event => event.target instanceof Element && event.target.closest(selector);
  document.addEventListener('contextmenu', event => { if (guarded(event)) event.preventDefault(); });
  document.addEventListener('dragstart', event => { if (guarded(event)) event.preventDefault(); });
}

export function artImage(work, className = 'art') {
  const img = document.createElement('img');
  img.className = className;
  img.src = work.src;
  img.alt = work.alt;
  img.width = work.width;
  img.height = work.height;
  img.draggable = false;
  img.decoding = 'async';
  img.style.setProperty('--nw', `${work.width}px`);
  img.style.setProperty('--nh', `${work.height}px`);
  img.style.setProperty('--r', String(work.height / work.width));
  return img;
}

// Fills a page's own <dialog> markup. Hooks: [data-f=...] text slots, [data-art] image slot,
// input[name=kind] radios, [data-summary], [data-enquire], [data-status], [data-zoom], [data-close].
export function detailDialog(dialog) {
  const slot = name => dialog.querySelector(`[data-f="${name}"]`);
  const radios = [...dialog.querySelectorAll('input[name="kind"]')];
  const summary = dialog.querySelector('[data-summary]');
  const enquire = dialog.querySelector('[data-enquire]');
  const status = dialog.querySelector('[data-status]');
  const zoom = dialog.querySelector('[data-zoom]');
  const frame = dialog.querySelector('[data-art]');
  let work = works[0];

  function render() {
    const kind = radios.find(radio => radio.checked)?.value ?? 'original';
    if (kind === 'original') {
      summary.textContent = `The original painting, ${work.size}, ${work.medium.toLowerCase()}, ${work.year}. ${originalPrice(work)}.`;
      enquire.firstChild.textContent = 'Enquire about the original ';
    } else {
      summary.textContent = `A signed print from a limited edition of ${EDITION}, at a third of the original’s ${originalPrice(work)}: ${printPrice(work)}. Print size, paper and framing are not confirmed yet.`;
      enquire.firstChild.textContent = 'Enquire about a print ';
    }
    status.textContent = '';
  }

  radios.forEach(radio => radio.addEventListener('change', render));
  enquire.addEventListener('click', () => { status.textContent = 'Design preview only; ordering is not connected.'; });
  dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
  // A click on the backdrop (the dialog element itself, outside its content) closes it.
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  zoom?.addEventListener('click', () => {
    const on = frame.classList.toggle('actual');
    zoom.setAttribute('aria-pressed', String(on));
    zoom.textContent = on ? 'Fit to screen' : 'Actual pixels';
    frame.tabIndex = on ? 0 : -1;
  });

  return function open(next) {
    work = next;
    slot('title').textContent = work.title;
    slot('year').textContent = String(work.year);
    slot('medium').textContent = work.medium;
    slot('size').textContent = work.size;
    slot('original').textContent = originalPrice(work);
    slot('print').textContent = printPrice(work);
    frame.replaceChildren(artImage(work));
    frame.classList.remove('actual');
    frame.tabIndex = -1;
    if (zoom) { zoom.setAttribute('aria-pressed', 'false'); zoom.textContent = 'Actual pixels'; }
    radios[0].checked = true;
    render();
    dialog.showModal();
  };
}

export const inFrame = () => { try { return window.self !== window.top; } catch { return true; } };
