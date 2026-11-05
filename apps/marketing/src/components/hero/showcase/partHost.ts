/**
 * Where each of the mockup's parts physically lives in the DOM.
 *
 * A part — a dashboard control, a stat card, the data table — is mounted
 * exactly once, through a React portal into a stable node this host owns. The
 * host then moves that node between two homes: its slot in the live mockup,
 * and its shell in the hero's physics layer. React never sees the move, so the
 * component never unmounts, and everything the visitor did to it — text typed,
 * boxes checked, the table's sort, filters, selection and page — is still
 * there on the other side. That is what lets the pieces fall apart and come
 * back together as the same components, rather than look-alikes.
 *
 * A node with neither home mounted (the dashboard's parts while the Table
 * page or the Code view is showing) sits detached and keeps its state.
 */
/** Move a node into a parent, unless it's already there: re-appending a node
 * detaches and reinserts it, which throws away its scroll positions (the
 * table's grid would jump back to its top-left on every hand-off). */
function place(node: HTMLElement, parent: HTMLElement) {
  if (node.parentElement !== parent) parent.appendChild(node);
}

export class PartHost {
  private nodes = new Map<string, HTMLDivElement>();
  private slots = new Map<string, HTMLElement>();
  private shells = new Map<string, HTMLElement>();
  /** Docked: parts live in their mockup slots. Undocked: in their shells. */
  private docked = true;
  private undockedIds = new Set<string>();

  node(id: string): HTMLDivElement {
    let node = this.nodes.get(id);
    if (!node) {
      node = document.createElement("div");
      node.className = "showcase-part";
      node.dataset.showcasePart = id;
      this.nodes.set(id, node);
    }
    return node;
  }

  /** A piece's physics shell, if its layer is mounted. */
  shell(id: string): HTMLElement | undefined {
    return this.shells.get(id);
  }

  get isDocked(): boolean {
    return this.docked;
  }

  registerSlot(id: string, el: HTMLElement | null) {
    if (!el) {
      // React is removing the slot (and the node with it, if it was inside).
      this.slots.delete(id);
      return;
    }
    this.slots.set(id, el);
    if (this.docked || !this.undockedIds.has(id)) place(this.node(id), el);
  }

  registerShell(id: string, el: HTMLElement | null) {
    if (!el) {
      this.shells.delete(id);
      return;
    }
    this.shells.set(id, el);
    if (!this.docked && this.undockedIds.has(id)) place(this.node(id), el);
  }

  /** Every part back into its mockup slot, or out of the DOM if it has none. */
  dock() {
    this.docked = true;
    this.undockedIds.clear();
    for (const [id, node] of this.nodes) {
      const slot = this.slots.get(id);
      if (slot) {
        place(node, slot);
        slot.style.height = "";
      } else node.remove();
    }
  }

  /** The given parts out of the mockup and into their physics shells. */
  undock(ids: Iterable<string>) {
    this.docked = false;
    this.undockedIds = new Set(ids);
    // Hold each slot open at its part's height first. An emptied slot would
    // collapse — the stat row to nothing, the panel's columns shorter — and
    // the mockup's shell would visibly jump back when the parts land.
    for (const id of this.undockedIds) {
      const slot = this.slots.get(id);
      // The computed height, not offsetHeight: that rounds to a whole pixel,
      // and the shell would still shift by the remainder.
      if (slot?.contains(this.node(id))) slot.style.height = getComputedStyle(slot).height;
    }
    for (const id of this.undockedIds) {
      const shell = this.shells.get(id);
      if (shell) place(this.node(id), shell);
    }
  }
}
