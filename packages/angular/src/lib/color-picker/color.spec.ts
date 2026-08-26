import { describe, it, expect } from "vitest";
import {
  channelPercent,
  channelRange,
  channelValue,
  colorToString,
  hsbToRgb,
  hslToRgb,
  isSameColor,
  parseColor,
  rgbToHsb,
  rgbToHsl,
  roundTo,
  toColorFormat,
  withChannelValue,
  type ColorFormat,
} from "./color.js";

/**
 * Values read out of a **running** `@ark-ui/react` ColorPicker in Chromium.
 *
 * Each row is one picker rendered by the parity harness, opened, and read
 * straight off the DOM: what the trigger announced, what the value swatch
 * carried, and what each of the three thumbs reported. Those are the numbers the
 * other three libraries put in the accessibility tree, so they are the reference
 * — not a restatement of anything in `color.ts`.
 *
 * The rows are corners rather than pretty colours:
 *
 *  - **black and white**, where the chroma is zero and the hue is undefined.
 *    Every library has to answer `0`, which a naive `atan2`-style derivation does
 *    not.
 *  - **`#abc`**, where each hex digit doubles.
 *  - **`#2563eb80`**, whose alpha is `0.5019607843137255` — printed in full by
 *    the trigger and rounded to `0.5` by the alpha slider, because the slider
 *    reads a *converted* colour and conversion rounds every channel to two
 *    places. Reading alpha off the raw value instead is a one-character mistake
 *    that this row is the only thing to catch.
 *  - **an HSL value**, which never passes through RGB at all and puts
 *    *lightness* on the area's second axis.
 *  - **a named colour**, resolved from the CSS Color 4 table before anything is
 *    parsed.
 *  - **`#2563eb` in all three notations**, where the same colour has to print as
 *    `rgba(37, 99, 235, 1)`, `hsla(221.21, 83.19%, 53.33%, 1)` and
 *    `hsba(221.21, 84.26%, 92.16%, 1)`.
 *
 * To regenerate: run the parity harness, open
 * `/react.html?component=ColorPicker&props={"defaultValue":…,"defaultOpen":true}`,
 * and read the trigger's `aria-label`, the value swatch's `data-value`, each
 * thumb's `aria-valuenow`/`aria-valuetext` and the root's `--value`.
 */
const ZAG_COLORS: {
  value: string;
  format?: ColorFormat;
  /** What the trigger and the value text printed. */
  valueAsString: string;
  /** The value swatch's `data-value`. */
  hex: string;
  /** The area thumb's two channels, and what it reported for each. */
  area: [string, number, string, number];
  hue: number;
  alpha: number;
  /** The root's `--value`, which is each space's own CSS notation. */
  css: string;
}[] = [
  {
    value: "#2563eb",
    valueAsString: "rgba(37, 99, 235, 1)",
    hex: "#2563EB",
    area: ["saturation", 84.26, "brightness", 92.16],
    hue: 221.21,
    alpha: 1,
    css: "rgba(37, 99, 235, 1)",
  },
  {
    value: "#000000",
    valueAsString: "rgba(0, 0, 0, 1)",
    hex: "#000000",
    area: ["saturation", 0, "brightness", 0],
    hue: 0,
    alpha: 1,
    css: "rgba(0, 0, 0, 1)",
  },
  {
    value: "#ffffff",
    valueAsString: "rgba(255, 255, 255, 1)",
    hex: "#FFFFFF",
    area: ["saturation", 0, "brightness", 100],
    hue: 0,
    alpha: 1,
    css: "rgba(255, 255, 255, 1)",
  },
  {
    value: "#ef4444",
    valueAsString: "rgba(239, 68, 68, 1)",
    hex: "#EF4444",
    area: ["saturation", 71.55, "brightness", 93.73],
    hue: 0,
    alpha: 1,
    css: "rgba(239, 68, 68, 1)",
  },
  {
    value: "#22c55e",
    valueAsString: "rgba(34, 197, 94, 1)",
    hex: "#22C55E",
    area: ["saturation", 82.74, "brightness", 77.25],
    hue: 142.09,
    alpha: 1,
    css: "rgba(34, 197, 94, 1)",
  },
  {
    value: "#7f3fbf",
    valueAsString: "rgba(127, 63, 191, 1)",
    hex: "#7F3FBF",
    area: ["saturation", 67.02, "brightness", 74.9],
    hue: 270,
    alpha: 1,
    css: "rgba(127, 63, 191, 1)",
  },
  {
    value: "rgb(37, 99, 235)",
    valueAsString: "rgba(37, 99, 235, 1)",
    hex: "#2563EB",
    area: ["saturation", 84.26, "brightness", 92.16],
    hue: 221.21,
    alpha: 1,
    css: "rgba(37, 99, 235, 1)",
  },
  {
    value: "rgba(37, 99, 235, 0.5)",
    valueAsString: "rgba(37, 99, 235, 0.5)",
    hex: "#2563EB",
    area: ["saturation", 84.26, "brightness", 92.16],
    hue: 221.21,
    alpha: 0.5,
    css: "rgba(37, 99, 235, 0.5)",
  },
  {
    value: "#2563eb80",
    valueAsString: "rgba(37, 99, 235, 0.5019607843137255)",
    hex: "#2563EB",
    area: ["saturation", 84.26, "brightness", 92.16],
    hue: 221.21,
    alpha: 0.5,
    css: "rgba(37, 99, 235, 0.5019607843137255)",
  },
  {
    value: "#abc",
    valueAsString: "rgba(170, 187, 204, 1)",
    hex: "#AABBCC",
    area: ["saturation", 16.67, "brightness", 80],
    hue: 210,
    alpha: 1,
    css: "rgba(170, 187, 204, 1)",
  },
  {
    value: "hsl(221, 83%, 53%)",
    valueAsString: "hsla(221, 83%, 53%, 1)",
    hex: "#2463EB",
    area: ["saturation", 83, "lightness", 53],
    hue: 221,
    alpha: 1,
    css: "hsla(221, 83%, 53%, 1)",
  },
  {
    value: "hsla(120, 50%, 25%, 0.4)",
    valueAsString: "hsla(120, 50%, 25%, 0.4)",
    hex: "#206020",
    area: ["saturation", 50, "lightness", 25],
    hue: 120,
    alpha: 0.4,
    css: "hsla(120, 50%, 25%, 0.4)",
  },
  {
    value: "rebeccapurple",
    valueAsString: "rgba(102, 51, 153, 1)",
    hex: "#663399",
    area: ["saturation", 66.67, "brightness", 60],
    hue: 270,
    alpha: 1,
    css: "rgba(102, 51, 153, 1)",
  },
  {
    value: "#2563eb",
    format: "hsla",
    valueAsString: "hsla(221.21, 83.19%, 53.33%, 1)",
    hex: "#2563EB",
    area: ["saturation", 83.19, "lightness", 53.33],
    hue: 221.21,
    alpha: 1,
    css: "rgba(37, 99, 235, 1)",
  },
  {
    value: "#2563eb",
    format: "hsba",
    valueAsString: "hsba(221.21, 84.26%, 92.16%, 1)",
    hex: "#2563EB",
    area: ["saturation", 84.26, "brightness", 92.16],
    hue: 221.21,
    alpha: 1,
    css: "rgba(37, 99, 235, 1)",
  },
  {
    value: "#ef4444",
    format: "hsla",
    valueAsString: "hsla(0, 84.24%, 60.2%, 1)",
    hex: "#EF4444",
    area: ["saturation", 84.24, "lightness", 60.2],
    hue: 0,
    alpha: 1,
    css: "rgba(239, 68, 68, 1)",
  },
  {
    value: "#22c55e",
    format: "hsba",
    valueAsString: "hsba(142.09, 82.74%, 77.25%, 1)",
    hex: "#22C55E",
    area: ["saturation", 82.74, "brightness", 77.25],
    hue: 142.09,
    alpha: 1,
    css: "rgba(34, 197, 94, 1)",
  },
];

/** The machine's rule: the value's own space, unless a format is asked for. */
const formatOf = (row: (typeof ZAG_COLORS)[number]): ColorFormat =>
  row.format ?? parseColor(row.value).format;

/** The area and the sliders work in HSB, unless the format is HSL. */
const areaFormat = (row: (typeof ZAG_COLORS)[number]): ColorFormat =>
  formatOf(row) === "hsla" ? "hsla" : "hsba";

describe("the ColorPicker's colour maths, against a running zag machine", () => {
  it("prints the value the way the trigger and the value text do", () => {
    for (const row of ZAG_COLORS) {
      expect(colorToString(parseColor(row.value), formatOf(row)), row.value).toBe(
        row.valueAsString,
      );
    }
  });

  it("names the value in hex the way the value swatch does", () => {
    for (const row of ZAG_COLORS) {
      expect(colorToString(parseColor(row.value), "hex"), row.value).toBe(row.hex);
    }
  });

  it("puts the same channels on the area thumb", () => {
    for (const row of ZAG_COLORS) {
      const area = toColorFormat(parseColor(row.value), areaFormat(row));
      const [xChannel, x, yChannel, y] = row.area;
      expect(channelValue(area, xChannel), `${row.value} ${xChannel}`).toBe(x);
      expect(channelValue(area, yChannel), `${row.value} ${yChannel}`).toBe(y);
    }
  });

  it("puts the same hue and alpha on the two sliders", () => {
    for (const row of ZAG_COLORS) {
      const area = toColorFormat(parseColor(row.value), areaFormat(row));
      expect(channelValue(area, "hue"), `${row.value} hue`).toBe(row.hue);
      // Read off the *converted* colour, which is why `#2563eb80` reports 0.5
      // here and 0.5019607843137255 in the trigger's label.
      expect(channelValue(area, "alpha"), `${row.value} alpha`).toBe(row.alpha);
    }
  });

  it("prints each space's own CSS notation for the root's --value", () => {
    for (const row of ZAG_COLORS) {
      expect(colorToString(parseColor(row.value), "css"), row.value).toBe(row.css);
    }
  });
});

describe("parseColor", () => {
  it("doubles the digits of a three-digit hex", () => {
    expect(parseColor("#abc")).toEqual({
      format: "rgba",
      red: 170,
      green: 187,
      blue: 204,
      alpha: 1,
    });
  });

  it("reads a four-digit hex's alpha as a byte", () => {
    // `#0008` doubles to `#00000088`, so the alpha is 0x88 out of 255 — not
    // 8 out of 15, which is the mistake a per-digit reading makes.
    expect(parseColor("#0008").alpha).toBeCloseTo(0x88 / 255, 12);
  });

  it("clamps rgb() channels rather than trusting them", () => {
    expect(parseColor("rgb(300, -5, 128)")).toMatchObject({ red: 255, green: 0, blue: 128 });
  });

  it("wraps a hue past the circle instead of clamping it", () => {
    // 400° is 40°, not 360°: a hue is an angle, and clamping one is a different
    // colour rather than a rounded version of the same one.
    expect(parseColor("hsl(400, 50%, 50%)")).toMatchObject({ hue: 40 });
  });

  it("resolves a CSS named colour", () => {
    expect(colorToString(parseColor("rebeccapurple"), "hex")).toBe("#663399");
    expect(colorToString(parseColor("white"), "hex")).toBe("#FFFFFF");
  });

  it("refuses what it cannot read", () => {
    expect(() => parseColor("#gg0000")).toThrow(/Invalid color value/);
    expect(() => parseColor("not-a-colour")).toThrow(/Invalid color value/);
    // Only 4, 5, 7 and 9 characters are hex colours — `#rgb`, `#rgba`,
    // `#rrggbb`, `#rrggbbaa`. Anything else of that shape is not one, however
    // hexadecimal it looks, and a parser that split it into bytes anyway would
    // read `#abcde` as a colour with two and a half channels.
    expect(() => parseColor("#abcde")).toThrow(/Invalid color value/);
    expect(() => parseColor("#abcdefa")).toThrow(/Invalid color value/);
    expect(() => parseColor("#abcd")).not.toThrow();
  });
});

describe("the conversions round-trip", () => {
  /**
   * Every reference colour, out to the other two spaces and back.
   *
   * A conversion that is self-consistent and wrong passes this and fails the
   * table above, which is why both are here: the table pins the *values*, and
   * this pins that nothing drifts on the way home. The tolerance is one unit of
   * the channel, which is what two conversions each rounding to two decimal
   * places can cost.
   */
  it("through HSB", () => {
    for (const row of ZAG_COLORS) {
      const rgb = toColorFormat(parseColor(row.value), "rgba");
      const back = hsbToRgb(rgbToHsb(rgb as never));
      expect(back.red, `${row.value} red`).toBeCloseTo(channelValue(rgb, "red"), -0.5);
      expect(back.green, `${row.value} green`).toBeCloseTo(channelValue(rgb, "green"), -0.5);
      expect(back.blue, `${row.value} blue`).toBeCloseTo(channelValue(rgb, "blue"), -0.5);
    }
  });

  it("through HSL", () => {
    for (const row of ZAG_COLORS) {
      const rgb = toColorFormat(parseColor(row.value), "rgba");
      const back = hslToRgb(rgbToHsl(rgb as never));
      expect(back.red, `${row.value} red`).toBeCloseTo(channelValue(rgb, "red"), -0.5);
      expect(back.green, `${row.value} green`).toBeCloseTo(channelValue(rgb, "green"), -0.5);
      expect(back.blue, `${row.value} blue`).toBeCloseTo(channelValue(rgb, "blue"), -0.5);
    }
  });

  it("between HSB and HSL", () => {
    for (const row of ZAG_COLORS) {
      const hsb = toColorFormat(parseColor(row.value), "hsba");
      const back = toColorFormat(toColorFormat(hsb, "hsla"), "hsba");
      expect(channelValue(back, "hue"), `${row.value} hue`).toBeCloseTo(
        channelValue(hsb, "hue"),
        1,
      );
      expect(channelValue(back, "saturation"), `${row.value} saturation`).toBeCloseTo(
        channelValue(hsb, "saturation"),
        1,
      );
      expect(channelValue(back, "brightness"), `${row.value} brightness`).toBeCloseTo(
        channelValue(hsb, "brightness"),
        1,
      );
    }
  });
});

describe("channels", () => {
  it("gives each one the range its slider reports", () => {
    expect(channelRange("hue")).toEqual({ minValue: 0, maxValue: 360, step: 1 });
    expect(channelRange("alpha")).toEqual({ minValue: 0, maxValue: 1, step: 0.01 });
    expect(channelRange("red")).toEqual({ minValue: 0, maxValue: 255, step: 1 });
    expect(channelRange("saturation")).toEqual({ minValue: 0, maxValue: 100, step: 1 });
    expect(() => channelRange("nope")).toThrow(/Unknown color channel/);
  });

  it("places a thumb as a fraction of its own range", () => {
    const blue = toColorFormat(parseColor("#2563eb"), "hsba");
    expect(channelPercent(blue, "hue")).toBeCloseTo(221.21 / 360, 10);
    expect(channelPercent(blue, "alpha")).toBe(1);
  });

  it("clamps a channel it is asked to set", () => {
    const blue = toColorFormat(parseColor("#2563eb"), "hsba");
    expect(channelValue(withChannelValue(blue, "hue", 900), "hue")).toBe(360);
    expect(channelValue(withChannelValue(blue, "alpha", -1), "alpha")).toBe(0);
  });

  it("refuses a channel the colour's space does not have", () => {
    const rgb = parseColor("#2563eb");
    expect(() => channelValue(rgb, "hue")).toThrow(/Unsupported color channel/);
  });
});

describe("isSameColor", () => {
  it("is false across spaces, however equivalent the colour", () => {
    // The comparison the value swatch makes, and the reason a picker in `hsla`
    // reports its own swatch `unchecked`.
    expect(isSameColor(parseColor("#2563eb"), parseColor("hsla(221.21, 83.19%, 53.33%, 1)"))).toBe(
      false,
    );
  });

  it("is true for the same colour written two ways in one space", () => {
    expect(isSameColor(parseColor("#2563eb"), parseColor("rgb(37, 99, 235)"))).toBe(true);
  });

  it("counts alpha", () => {
    expect(isSameColor(parseColor("rgba(0,0,0,1)"), parseColor("rgba(0,0,0,0.5)"))).toBe(false);
  });
});

describe("roundTo", () => {
  it("is the two-place rule every conversion goes through", () => {
    expect(roundTo(221.21212121, 2)).toBe(221.21);
    expect(roundTo(83.19328, 2)).toBe(83.19);
    expect(roundTo(0.5019607843137255, 2)).toBe(0.5);
    expect(roundTo(92.155, 2)).toBe(92.16);
    expect(roundTo(1.5)).toBe(2);
  });
});
