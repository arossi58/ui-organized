import { describe, it, expect } from "vitest";
import {
  DtcgTokenSchema,
  DtcgGroupSchema,
  DtcgTypeSchema,
  valueSchemaForType,
  isFigmaSafeName,
} from "./dtcg.js";

describe("DtcgTokenSchema — primitives", () => {
  it("accepts a hex color", () => {
    expect(DtcgTokenSchema.safeParse({ $type: "color", $value: "#ff0066" }).success).toBe(true);
  });

  it("accepts a structured DTCG color object", () => {
    const token = {
      $type: "color",
      $value: { colorSpace: "srgb", components: [1, 0, 0.4], alpha: 1, hex: "#ff0066" },
    };
    expect(DtcgTokenSchema.safeParse(token).success).toBe(true);
  });

  it("accepts a reference as a color value", () => {
    expect(DtcgTokenSchema.safeParse({ $type: "color", $value: "{color.brand}" }).success).toBe(
      true,
    );
  });

  it("accepts a color modifier expression", () => {
    const token = { $type: "color", $value: "lighten({color.brand}, 0.1)" };
    expect(DtcgTokenSchema.safeParse(token).success).toBe(true);
  });

  it("rejects a malformed color value (a number)", () => {
    expect(DtcgTokenSchema.safeParse({ $type: "color", $value: 42 }).success).toBe(false);
  });

  it("accepts dimension as string and as { value, unit }", () => {
    expect(DtcgTokenSchema.safeParse({ $type: "dimension", $value: "16px" }).success).toBe(true);
    expect(
      DtcgTokenSchema.safeParse({ $type: "dimension", $value: { value: 16, unit: "px" } }).success,
    ).toBe(true);
  });

  it("accepts a math expression for dimension", () => {
    expect(
      DtcgTokenSchema.safeParse({ $type: "dimension", $value: "{spacing.base} * 2" }).success,
    ).toBe(true);
  });

  it("rejects a malformed dimension value (a boolean)", () => {
    expect(DtcgTokenSchema.safeParse({ $type: "dimension", $value: true }).success).toBe(false);
  });

  it("accepts fontWeight as number and as keyword", () => {
    expect(DtcgTokenSchema.safeParse({ $type: "fontWeight", $value: 600 }).success).toBe(true);
    expect(DtcgTokenSchema.safeParse({ $type: "fontWeight", $value: "bold" }).success).toBe(true);
  });

  it("accepts a cubicBezier 4-tuple and rejects a 3-tuple", () => {
    expect(
      DtcgTokenSchema.safeParse({ $type: "cubicBezier", $value: [0.4, 0, 0.2, 1] }).success,
    ).toBe(true);
    expect(DtcgTokenSchema.safeParse({ $type: "cubicBezier", $value: [0.4, 0, 0.2] }).success).toBe(
      false,
    );
  });
});

describe("DtcgTokenSchema — composites", () => {
  it("accepts a fully-specified typography token", () => {
    const token = {
      $type: "typography",
      $value: {
        fontFamily: "Inter",
        fontSize: "16px",
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: "0px",
      },
    };
    expect(DtcgTokenSchema.safeParse(token).success).toBe(true);
  });

  it("accepts typography sub-fields as references", () => {
    const token = {
      $type: "typography",
      $value: {
        fontFamily: "{font.body}",
        fontSize: "{size.body}",
        fontWeight: "{weight.regular}",
        lineHeight: "{leading.body}",
      },
    };
    expect(DtcgTokenSchema.safeParse(token).success).toBe(true);
  });

  it("rejects typography missing a required sub-field", () => {
    const token = { $type: "typography", $value: { fontFamily: "Inter", fontSize: "16px" } };
    expect(DtcgTokenSchema.safeParse(token).success).toBe(false);
  });

  it("accepts a shadow and an array of shadows", () => {
    const one = { color: "#000", offsetX: "0px", offsetY: "1px", blur: "2px" };
    expect(DtcgTokenSchema.safeParse({ $type: "shadow", $value: one }).success).toBe(true);
    expect(DtcgTokenSchema.safeParse({ $type: "shadow", $value: [one, one] }).success).toBe(true);
  });

  it("rejects a shadow missing color", () => {
    const bad = { offsetX: "0px", offsetY: "1px", blur: "2px" };
    expect(DtcgTokenSchema.safeParse({ $type: "shadow", $value: bad }).success).toBe(false);
  });
});

describe("DtcgTokenSchema — structural rules", () => {
  it("rejects an unknown $type", () => {
    expect(DtcgTokenSchema.safeParse({ $type: "frobnicate", $value: 1 }).success).toBe(false);
  });

  it("allows a token with no $type (type inherited from a group)", () => {
    // No $type → $value is not type-checked here; the resolver applies the
    // effective inherited type.
    expect(DtcgTokenSchema.safeParse({ $value: 9999 }).success).toBe(true);
  });

  it("rejects an object with no $value (that is a group, not a token)", () => {
    expect(DtcgTokenSchema.safeParse({ $description: "a group" }).success).toBe(false);
  });

  it("preserves $description and $extensions", () => {
    const token = {
      $type: "color",
      $value: "#fff",
      $description: "white",
      $extensions: { "com.example": { note: 1 } },
    };
    const parsed = DtcgTokenSchema.parse(token);
    expect(parsed.$description).toBe("white");
    expect(parsed.$extensions).toEqual({ "com.example": { note: 1 } });
  });
});

describe("DtcgGroupSchema", () => {
  it("validates a nested group of tokens with group-level metadata", () => {
    const group = {
      color: {
        $type: "color",
        $description: "brand ramp",
        "500": { $value: "#3355ff" },
        "600": { $value: "{color.500}" },
      },
      spacing: {
        base: { $type: "dimension", $value: "4px" },
        lg: { $type: "dimension", $value: "{spacing.base} * 4" },
      },
    };
    expect(DtcgGroupSchema.safeParse(group).success).toBe(true);
  });

  it("treats a cyclic-looking reference pair as valid strings (cycles are the resolver's job)", () => {
    const group = {
      a: { $type: "color", $value: "{b}" },
      b: { $type: "color", $value: "{a}" },
    };
    expect(DtcgGroupSchema.safeParse(group).success).toBe(true);
  });

  it("rejects a group whose child is a bare string", () => {
    expect(DtcgGroupSchema.safeParse({ broken: "not a node" }).success).toBe(false);
  });
});

describe("valueSchemaForType", () => {
  it("returns a schema that validates the matching value", () => {
    expect(valueSchemaForType("number").safeParse(3).success).toBe(true);
    expect(valueSchemaForType("number").safeParse("nope").success).toBe(false);
  });
});

describe("DtcgTypeSchema", () => {
  it("enumerates the supported types", () => {
    expect(DtcgTypeSchema.safeParse("typography").success).toBe(true);
    expect(DtcgTypeSchema.safeParse("nope").success).toBe(false);
  });
});

describe("isFigmaSafeName", () => {
  it("rejects names containing . { or }", () => {
    expect(isFigmaSafeName("color.brand")).toBe(false);
    expect(isFigmaSafeName("{x}")).toBe(false);
    expect(isFigmaSafeName("")).toBe(false);
  });

  it("accepts a plain segment name", () => {
    expect(isFigmaSafeName("brand")).toBe(true);
  });
});
