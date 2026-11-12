import { DOCUMENT } from "@angular/common";
import { Renderer2, effect, inject, type Signal } from "@angular/core";
import type { UioSheet } from "@ui-organized/angular";

/**
 * Give a sheet's popup one of the table's classes. `UioSheet` has no input for
 * a class on its popup, and the popup is attached in `UioSheet.ngOnInit`, so by
 * the time this effect runs it is in the document, found by the id the dialog
 * context gives its content part.
 */
export function addSheetPopupClass(sheet: Signal<UioSheet | undefined>, className: string): void {
  const renderer = inject(Renderer2);
  const document = inject(DOCUMENT);
  effect(() => {
    const instance = sheet();
    if (!instance) return;
    const popup = document.getElementById(instance.dialogContext.partId("content"));
    if (popup) renderer.addClass(popup, className);
  });
}
