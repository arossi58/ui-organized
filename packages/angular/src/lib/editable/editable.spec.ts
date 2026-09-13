import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UioEditable } from "./editable.js";

/**
 * Committing an edit, and abandoning one — the difference the DOM cannot show.
 *
 * Both exits look identical a frame later: the preview is back and the input is
 * `hidden` again. What separates them is the *value*, and whether
 * `valueCommit` fired. Everything here is about that.
 *
 * It is also the only place the edit is exercised at all. `@ark-ui/react` 5.37
 * (zag 1.41) does not enter edit mode in a real browser, so the parity gate —
 * which compares against React — has no editing Editable to hold this one
 * against. See the note in `scenarios/Editable.ts`.
 *
 * Inputs are replaced with writable signals rather than bound: JIT never
 * registers initializer-based inputs. See `select.spec.ts`.
 */
@Component({
  standalone: true,
  imports: [UioEditable],
  template: `<div uioEditable></div>`,
})
class Host {
  @ViewChild(UioEditable, { static: true }) editable!: UioEditable;
}

@Component({
  standalone: true,
  imports: [UioEditable, ReactiveFormsModule],
  template: `<div uioEditable [formControl]="control"></div>`,
})
class FormHost {
  readonly control = new FormControl<string>("");
}

describe("UioEditable", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = (props: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(Host);
    const component = fixture.componentInstance.editable;
    const instance = component as unknown as Record<string, unknown>;
    for (const [key, value] of Object.entries(props)) instance[key] = signal(value);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const preview = () => host.querySelector<HTMLElement>('[data-part="preview"]')!;
    const input = () => host.querySelector<HTMLInputElement>('[data-part="input"]')!;
    const area = () => host.querySelector<HTMLElement>('[data-part="area"]')!;
    const trigger = (part: string) => host.querySelector<HTMLButtonElement>(`[data-part="${part}"]`);
    const editing = () => !input().hasAttribute("hidden");
    const typeInto = (text: string) => {
      input().value = text;
      input().dispatchEvent(new Event("input", { bubbles: true }));
      fixture.detectChanges();
    };
    const press = (key: string) => {
      input().dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
      fixture.detectChanges();
    };
    const blur = (relatedTarget: HTMLElement | null = null) => {
      input().dispatchEvent(new FocusEvent("blur", { relatedTarget }));
      fixture.detectChanges();
    };
    const click = (element: HTMLElement) => {
      element.click();
      fixture.detectChanges();
    };
    return {
      fixture,
      host,
      component,
      preview,
      input,
      area,
      trigger,
      editing,
      typeInto,
      press,
      blur,
      click,
    };
  };

  it("swaps the preview for the input, and back", () => {
    const { component, preview, editing, click } = render({
      value: "Ada",
      activationMode: "click",
    });
    expect(editing()).toBe(false);
    click(preview());
    expect(editing()).toBe(true);
    // The preview is hidden rather than removed, which is what keeps the caret
    // and the layout still across the swap.
    expect(preview().hasAttribute("hidden")).toBe(true);
    expect(component.value()).toBe("Ada");
  });

  it("starts an edit only in the mode that was asked for", () => {
    const clickMode = render({ activationMode: "click" });
    clickMode.preview().dispatchEvent(new FocusEvent("focus"));
    clickMode.fixture.detectChanges();
    // Focus is not the activation here, so focusing the preview must do nothing.
    expect(clickMode.editing()).toBe(false);
  });

  it("never starts an edit in mode none", () => {
    const { preview, editing, click } = render({ activationMode: "none", value: "Ada" });
    click(preview());
    preview().dispatchEvent(new FocusEvent("focus"));
    expect(editing()).toBe(false);
  });

  it("keeps the edit on Enter and reports it once", () => {
    const committed: string[] = [];
    const { component, preview, editing, typeInto, press, click } = render({
      value: "Ada",
      activationMode: "click",
    });
    component.valueCommit.subscribe((value) => committed.push(value));

    click(preview());
    typeInto("Grace");
    press("Enter");
    expect(editing()).toBe(false);
    expect(component.value()).toBe("Grace");
    expect(committed).toEqual(["Grace"]);
  });

  it("puts the value back on Escape, and reports no commit", () => {
    const committed: string[] = [];
    const { component, preview, editing, typeInto, press, click } = render({
      value: "Ada",
      activationMode: "click",
    });
    component.valueCommit.subscribe((value) => committed.push(value));

    click(preview());
    typeInto("Grace");
    press("Escape");
    expect(editing()).toBe(false);
    // The revert target is the value the *edit* started from, not the last
    // committed one — an edit started, abandoned and started again has to go
    // back to where the second one began.
    expect(component.value()).toBe("Ada");
    expect(committed).toEqual([]);
  });

  it("commits on blur in blur mode and reverts in enter mode", () => {
    const kept = render({ value: "Ada", activationMode: "click", submitMode: "blur" });
    kept.click(kept.preview());
    kept.typeInto("Grace");
    kept.blur();
    expect(kept.component.value()).toBe("Grace");

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });

    const reverted = render({ value: "Ada", activationMode: "click", submitMode: "enter" });
    reverted.click(reverted.preview());
    reverted.typeInto("Grace");
    reverted.blur();
    expect(reverted.component.value()).toBe("Ada");
  });

  it("ignores the blur that clicking Save or Cancel causes", () => {
    const { component, preview, trigger, typeInto, blur, click } = render({
      value: "Ada",
      activationMode: "click",
      showControls: true,
      submitMode: "blur",
    });
    click(preview());
    typeInto("Grace");
    // Clicking Cancel blurs the input first. Committing on that blur would make
    // the Cancel button commit, which is the opposite of what it says.
    blur(trigger("cancel-trigger")!);
    click(trigger("cancel-trigger")!);
    expect(component.value()).toBe("Ada");
  });

  it("swaps the three control buttons by hidden alone", () => {
    const { preview, trigger, click } = render({
      value: "Ada",
      activationMode: "click",
      showControls: true,
    });
    expect(trigger("edit-trigger")!.hasAttribute("hidden")).toBe(false);
    expect(trigger("submit-trigger")!.hasAttribute("hidden")).toBe(true);

    click(preview());
    expect(trigger("edit-trigger")!.hasAttribute("hidden")).toBe(true);
    expect(trigger("submit-trigger")!.hasAttribute("hidden")).toBe(false);
    expect(trigger("cancel-trigger")!.hasAttribute("hidden")).toBe(false);
  });

  it("stops typing at maxLength", () => {
    const { component, preview, typeInto, click } = render({
      activationMode: "click",
      maxLength: 3,
    });
    click(preview());
    typeInto("abcdef");
    expect(component.value()).toBe("abc");
  });

  it("shows the placeholder as the preview's own text, and says so", () => {
    const { preview, area } = render({ placeholder: "Add a name" });
    expect(preview().textContent?.trim()).toBe("Add a name");
    // A span has no ::placeholder, so the state is an attribute the stylesheet
    // colours off rather than a pseudo-element.
    expect(area().getAttribute("data-placeholder-shown")).toBe("");
    expect(preview().getAttribute("data-placeholder-shown")).toBe("");
  });

  it("refuses to start an edit while read-only or disabled", () => {
    const readOnly = render({ value: "Ada", activationMode: "click", readOnlyInput: true });
    readOnly.click(readOnly.preview());
    expect(readOnly.editing()).toBe(false);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });

    const disabled = render({ value: "Ada", activationMode: "click", disabledInput: true });
    disabled.click(disabled.preview());
    expect(disabled.editing()).toBe(false);
  });

  it("drives a reactive form in both directions", () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const input = host.querySelector<HTMLInputElement>('[data-part="input"]')!;

    fixture.componentInstance.control.setValue("Ada");
    fixture.detectChanges();
    expect(host.querySelector('[data-part="preview"]')!.textContent?.trim()).toBe("Ada");

    input.value = "Grace";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe("Grace");
  });
});
