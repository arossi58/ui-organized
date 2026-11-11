/**
 * Static copies of the data table's pieces, for the hero's physics layer.
 *
 * The table itself never leaves the mockup — it is one live component whose
 * toolbar, rows and pagination share state, and splitting its DOM apart would
 * break it. So when the mockup comes apart, each visible piece of the table is
 * *photographed*: a deep DOM copy taken that instant, so it falls looking
 * exactly as the visitor left it — rows selected, sorted, columns resized,
 * search typed. The copies are inert decoration; the live table, hidden in
 * place while they fly (showcase-mockup.css), is what the visitor gets back.
 *
 * A copy outside the table loses the styles that hang off the table's root
 * (size and variant classes, custom properties), and a row loses its
 * `<table>` and column widths. Each copy is wrapped in just enough of that
 * structure to render identically.
 */

/** Copy form state the DOM clone doesn't carry, and strip anything a live
 * component could mistake for its own: ids (Ark looks parts up by id) and
 * radio `name`s (which would group a copy with the real radios). */
function scrub(live: Element, copy: Element) {
  const liveFields = live.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea");
  const copyFields = copy.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea");
  copyFields.forEach((field, i) => {
    const source = liveFields[i];
    if (source) field.value = source.value;
    if (source instanceof HTMLInputElement && field instanceof HTMLInputElement) {
      field.checked = source.checked;
    }
    field.removeAttribute("name");
  });
  for (const el of [copy, ...copy.querySelectorAll("[id]")]) el.removeAttribute("id");
}

function rootFor(live: Element): HTMLElement {
  const root = document.createElement("div");
  root.className = live.closest(".data-table")?.className ?? "data-table";
  return root;
}

/** The visible part of a grid row: offset into the row, and size. */
export interface SnapshotClip {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A copy of one piece of the table, ready to drop into a physics shell.
 * `clip` cuts a grid row down to the part the grid shows. */
export function snapshot(live: HTMLElement, clip?: SnapshotClip): HTMLElement {
  const copy = live.cloneNode(true) as HTMLElement;
  scrub(live, copy);
  const root = rootFor(live);

  if (live instanceof HTMLTableRowElement) {
    // A row needs its table (fixed layout, borders) and the column widths.
    const table = live.closest("table")!;
    const tableCopy = table.cloneNode(false) as HTMLTableElement;
    tableCopy.removeAttribute("id");
    tableCopy.style.width = `${table.offsetWidth}px`;
    tableCopy.style.flexShrink = "0";
    const cols = table.querySelector("colgroup");
    if (cols) tableCopy.appendChild(cols.cloneNode(true));
    const section = (live.parentElement as HTMLElement).cloneNode(false);
    section.appendChild(copy);
    tableCopy.appendChild(section);
    root.appendChild(tableCopy);
    if (clip) {
      root.style.width = `${clip.w}px`;
      root.style.height = `${clip.h}px`;
      root.style.overflow = "hidden";
      tableCopy.style.marginLeft = `${-clip.x}px`;
      tableCopy.style.marginTop = `${-clip.y}px`;
    }
  } else {
    root.appendChild(copy);
  }
  return root;
}
