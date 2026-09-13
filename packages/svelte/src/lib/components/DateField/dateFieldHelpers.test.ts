import { describe, it, expect, vi, afterEach } from "vitest";
import { openDatePicker } from "./openDatePicker.js";
import { setNativeInputValue } from "./setNativeInputValue.js";

/**
 * The two browser-behaviour helpers behind the date fields.
 *
 * Neither is reachable from the SSR parity gate — one calls a method that only
 * exists in a browser, the other writes to a live DOM node — so what they
 * promise is pinned here instead. Both promises are the kind that fail silently:
 * a picker that throws takes the whole click handler down with it, and a value
 * written without an event leaves every listener believing the field is empty.
 */
describe("openDatePicker", () => {
  afterEach(() => vi.restoreAllMocks());

  it("calls showPicker on the input", () => {
    const input = document.createElement("input");
    input.type = "date";
    const showPicker = vi.fn();
    Object.assign(input, { showPicker });
    openDatePicker(input);
    expect(showPicker).toHaveBeenCalledTimes(1);
  });

  it("swallows an unsupported or blocked showPicker", () => {
    const input = document.createElement("input");
    input.type = "date";
    // Both real failures look like this: jsdom has no showPicker at all, and a
    // browser throws NotAllowedError outside a user gesture. Either must leave
    // the field typeable rather than breaking the handler that called it.
    Object.assign(input, {
      showPicker() {
        throw new Error("NotAllowedError");
      },
    });
    expect(() => openDatePicker(input)).not.toThrow();
  });

  it("does nothing for a missing or disabled input", () => {
    const input = document.createElement("input");
    input.type = "date";
    input.disabled = true;
    const showPicker = vi.fn();
    Object.assign(input, { showPicker });
    openDatePicker(input);
    openDatePicker(null);
    expect(showPicker).not.toHaveBeenCalled();
  });
});

describe("setNativeInputValue", () => {
  it("writes the value and dispatches a bubbling input event", () => {
    const input = document.createElement("input");
    input.type = "date";
    document.body.append(input);
    const onInput = vi.fn();
    document.body.addEventListener("input", onInput);

    setNativeInputValue(input, "2024-03-15");

    expect(input.value).toBe("2024-03-15");
    // Bubbling is the whole point: the listener that has to hear this may be on
    // an ancestor rather than on the input.
    expect(onInput).toHaveBeenCalledTimes(1);

    document.body.removeEventListener("input", onInput);
    input.remove();
  });

  it("is a no-op for a missing input", () => {
    expect(() => setNativeInputValue(null, "2024-03-15")).not.toThrow();
  });
});
