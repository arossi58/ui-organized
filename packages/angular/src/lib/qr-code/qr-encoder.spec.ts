import { describe, it, expect } from "vitest";
import {
  alignmentPatternPositions,
  encodeQr,
  formatInformation,
  gfMultiply,
  maskInverts,
  qrPathData,
  reedSolomonDivisor,
  reedSolomonRemainder,
  versionInformation,
  type QrErrorCorrection,
  type QrMatrix,
} from "./qr-encoder.js";

/**
 * Proving a hand-written QR encoder.
 *
 * This is the one algorithm in the package with no second opinion available at
 * runtime: React, Svelte and Vue take their modules from `@zag-js/qr-code`,
 * which bundles `uqr`, and Angular may take no dependency beyond the CDK. A
 * wrong encoder does not fail loudly — it renders a perfectly plausible field of
 * black squares that no scanner reads, or worse, one that reads as a *different*
 * string. So the encoder is checked four independent ways:
 *
 *  1. **Against ISO/IEC 18004's own published tables.** The Reed-Solomon
 *     generator polynomials (Annex A), the alignment-pattern centres (Annex E),
 *     and the format and version information (Annexes C and D) are written out
 *     here by hand from the standard. Nothing in `qr-encoder.ts` was consulted
 *     to write them, which is what makes them a check rather than a restatement.
 *  2. **Against the worked example in ISO/IEC 18004 Annex I.** The standard
 *     encodes "01234567" at version 1-M and publishes both the data codewords
 *     and the error-correction codewords. Both appear below.
 *  3. **Against the finished module matrices `uqr` produces**, generated at
 *     authoring time and checked in. `uqr` is what the other three libraries
 *     render, so this is the assertion that the four agree — and it is the
 *     reason the encoder reproduces `uqr`'s *choices* (no ECC boosting, one
 *     segment per string) rather than making better ones.
 *  4. **By reading a code back.** The last test decodes a version-1 symbol out
 *     of the finished matrix: it locates the format information, checks its BCH
 *     code, reverses the mask, walks the codeword placement backwards and
 *     recovers the original string, confirming every Reed-Solomon syndrome is
 *     zero on the way. Nothing in that path calls the encoder's own placement
 *     code, so an encoder that laid its codewords out consistently but wrongly
 *     would fail here.
 *
 * `uqr` is *read* to make the fixtures below and is never imported — not by this
 * spec, not by anything that ships.
 */

// ── 1. Published tables ──────────────────────────────────────────────────────

/**
 * GF(2^8) antilog table, so the α-exponents the standard publishes can be turned
 * into the byte values the divisor is stored as.
 *
 * Built by repeated doubling from `gfMultiply`, which is itself the thing under
 * test — but only in one direction: if the field arithmetic were wrong the table
 * would be a different permutation of 1-255, and the published polynomials would
 * not come back out of it.
 */
const ANTILOG: number[] = [1];
for (let i = 1; i < 256; i++) ANTILOG.push(gfMultiply(ANTILOG[i - 1]!, 2));
const fromExponents = (exponents: readonly number[]) => exponents.map((e) => ANTILOG[e % 255]!);

describe("Reed-Solomon", () => {
  it("builds the generator polynomials ISO/IEC 18004 Annex A publishes", () => {
    // Annex A gives each polynomial as α-exponents, highest power first, with the
    // leading α^0 coefficient implicit. Three rows, chosen because they are the
    // ones versions 1-3 actually use at L, M and Q.
    expect(reedSolomonDivisor(7)).toEqual(fromExponents([87, 229, 146, 149, 238, 102, 21]));
    expect(reedSolomonDivisor(10)).toEqual(
      fromExponents([251, 67, 46, 61, 118, 70, 64, 94, 32, 45]),
    );
    expect(reedSolomonDivisor(13)).toEqual(
      fromExponents([74, 152, 176, 100, 86, 100, 106, 104, 130, 218, 206, 140, 78]),
    );
  });

  it("produces the error-correction codewords from the standard's worked example", () => {
    // ISO/IEC 18004 Annex I.2 encodes "01234567" at version 1-M. These are the
    // sixteen data codewords it publishes: mode 0001, count 8, three digit
    // groups, a terminator, and the alternating pad bytes EC/11.
    const data = [
      0x10, 0x20, 0x0c, 0x56, 0x61, 0x80, 0xec, 0x11, 0xec, 0x11, 0xec, 0x11, 0xec, 0x11, 0xec,
      0x11,
    ];
    // ...and these are the ten error-correction codewords it publishes for them.
    expect(reedSolomonRemainder(data, reedSolomonDivisor(10))).toEqual([
      165, 36, 212, 193, 237, 54, 199, 135, 44, 85,
    ]);
  });
});

describe("function patterns", () => {
  it("places alignment patterns where ISO/IEC 18004 Table E.1 says", () => {
    expect(alignmentPatternPositions(1)).toEqual([]);
    expect(alignmentPatternPositions(2)).toEqual([6, 18]);
    expect(alignmentPatternPositions(7)).toEqual([6, 22, 38]);
    expect(alignmentPatternPositions(14)).toEqual([6, 26, 46, 66]);
    expect(alignmentPatternPositions(20)).toEqual([6, 34, 62, 90]);
    // Version 32 is the one row of the table an even-step formula gets wrong,
    // and the reason `alignmentPatternPositions` carries a special case at all.
    expect(alignmentPatternPositions(32)).toEqual([6, 34, 60, 86, 112, 138]);
    expect(alignmentPatternPositions(40)).toEqual([6, 30, 58, 86, 114, 142, 170]);
  });

  it("computes the format information ISO/IEC 18004 Annex C publishes", () => {
    const bits = (value: number, width: number) => value.toString(2).padStart(width, "0");
    expect(bits(formatInformation("L", 0), 15)).toBe("111011111000100");
    // M with mask 0 is the all-zero data word, so what is left is the XOR mask
    // itself — the reason the standard applies one at all.
    expect(bits(formatInformation("M", 0), 15)).toBe("101010000010010");
    expect(bits(formatInformation("Q", 7), 15)).toBe("010101111101101");
    expect(bits(formatInformation("H", 7), 15)).toBe("000100000111011");
  });

  it("computes the version information ISO/IEC 18004 Annex D publishes", () => {
    const bits = (value: number) => value.toString(2).padStart(18, "0");
    expect(bits(versionInformation(7))).toBe("000111110010010100");
    expect(bits(versionInformation(40))).toBe("101000110001101001");
  });

  it("draws three finders, both timing rows and the always-dark module", () => {
    const matrix = encodeQr("https://ui-organized.dev", { ecc: "M", border: 0 });
    const dark = (x: number, y: number) => matrix.modules[y]![x];

    // A finder is a 7x7 ring stack: dark border, light ring, 3x3 dark core.
    for (const [ox, oy] of [
      [0, 0],
      [matrix.size - 7, 0],
      [0, matrix.size - 7],
    ] as const) {
      for (let dy = 0; dy < 7; dy++) {
        for (let dx = 0; dx < 7; dx++) {
          const ring = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
          expect(dark(ox + dx, oy + dy), `finder at ${ox},${oy} module ${dx},${dy}`).toBe(
            ring !== 2,
          );
        }
      }
    }

    // Row and column 6 alternate between the separators. §6.3.5.
    for (let i = 8; i < matrix.size - 8; i++) {
      expect(dark(6, i), `vertical timing at ${i}`).toBe(i % 2 === 0);
      expect(dark(i, 6), `horizontal timing at ${i}`).toBe(i % 2 === 0);
    }

    // The module below the top-left corner of the bottom-left finder is dark in
    // every valid symbol. §8.9.
    expect(dark(8, matrix.size - 8)).toBe(true);
  });
});

// ── 2. Against uqr ───────────────────────────────────────────────────────────

const render = (matrix: QrMatrix) =>
  matrix.modules.map((row) => row.map((module) => (module ? "#" : ".")).join(""));

/**
 * "HELLO WORLD" at version 1-Q, mask 0 — the example every QR tutorial works
 * through, and the one whose finished matrix is published in enough places to be
 * checked by eye. Generated here from `uqr`; it agrees with the published one.
 * The outer ring of dots is the one-module quiet zone `uqr` adds by default.
 */
const HELLO_WORLD_1Q = [
  ".......................",
  ".#######.##....#######.",
  ".#.....#.#..#..#.....#.",
  ".#.###.#.#..##.#.###.#.",
  ".#.###.#.#.....#.###.#.",
  ".#.###.#.#.#...#.###.#.",
  ".#.....#...#...#.....#.",
  ".#######.#.#.#.#######.",
  ".........#.............",
  "..##.#.##....#.#.#####.",
  "..#......####....#...#.",
  "...##.###.##...#.##....",
  "..##.##.#..##.#.#.###..",
  ".#...#.#.#.###.###.#.#.",
  ".........##.#..#...#.#.",
  ".#######.#.#....#.##...",
  ".#.....#..#.##.##.#....",
  ".#.###.#.#.#...#######.",
  ".#.###.#..#.#.#.#...#..",
  ".#.###.#.#..#.###.#..#.",
  ".#.....#.#.####...#.##.",
  ".#######....#.###....#.",
  ".......................",
];

/** The standard's own example string, at the level the standard uses. */
const NUMERIC_1M = [
  ".......................",
  ".#######...###.#######.",
  ".#.....#.###...#.....#.",
  ".#.###.#..##...#.###.#.",
  ".#.###.#..#.##.#.###.#.",
  ".#.###.#.##.##.#.###.#.",
  ".#.....#....#..#.....#.",
  ".#######.#.#.#.#######.",
  ".......................",
  ".#.#.#.#...#.#...#..#..",
  ".##.#....#.##.#.#...#..",
  "....##.###.##.###.###..",
  ".##..##.#.#.###.##..#..",
  "...#..###.###.###....#.",
  ".........#.#...#....#..",
  ".#######.....#...#...#.",
  ".#.....#...#...#..#.##.",
  ".#.###.#.###.#.#.###.#.",
  ".#.###.#..#.#.#.#.###..",
  ".#.###.#.##.#.###..#.#.",
  ".#.....#....###.###....",
  ".#######.#..#.###..#.#.",
  ".......................",
];

/** A byte-mode symbol at the default level, which is 'L' rather than 'M'. */
const BYTE_1L = [
  ".......................",
  ".#######..#..#.#######.",
  ".#.....#.#..#..#.....#.",
  ".#.###.#..#....#.###.#.",
  ".#.###.#.#..#..#.###.#.",
  ".#.###.#...###.#.###.#.",
  ".#.....#.###.#.#.....#.",
  ".#######.#.#.#.#######.",
  "...........###.........",
  ".#####.####..##.#.#.#..",
  ".#.#..#....#.#..#....#.",
  "..#...###..##.#..####..",
  ".####.#.#.......##.#...",
  ".#.#.###..#.#.#..#.#.#.",
  ".........#.#####..#..#.",
  ".#######.#...#.##...#..",
  ".#.....#..######..#..#.",
  ".#.###.#.#.#.#..#..#...",
  ".#.###.#.##..#..#..#...",
  ".#.###.#.#..#.#..###...",
  ".#.....#.##.....##.#...",
  ".#######.####.#..####..",
  ".......................",
];

/**
 * FNV-1a over the path string, so the wider comparison fits in a table.
 *
 * A digest rather than the path itself because one version-39 code is 90 KB of
 * `d`. What it costs is readability of a *failure* — a mismatch says "different"
 * and not "different where" — which is why the three matrices above are spelled
 * out in full: the first thing to look at when this table goes red is whether
 * they went red too.
 */
function digest(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

/** Rebuilds the long fixture inputs, which are too long to write out. */
const repeat = (character: string, count: number) => character.repeat(count);

const UQR_FIXTURES: {
  value: string;
  ecc: QrErrorCorrection;
  version: number;
  mask: number;
  size: number;
  digest: string;
}[] = [
  { value: "", ecc: "L", version: 1, mask: 7, size: 23, digest: "56f7fffb" },
  { value: "", ecc: "M", version: 1, mask: 6, size: 23, digest: "22fbf4e4" },
  { value: "", ecc: "Q", version: 1, mask: 1, size: 23, digest: "60141d37" },
  { value: "", ecc: "H", version: 1, mask: 6, size: 23, digest: "a1d672ea" },
  { value: "1", ecc: "L", version: 1, mask: 0, size: 23, digest: "329e4d70" },
  { value: "1", ecc: "M", version: 1, mask: 0, size: 23, digest: "28569728" },
  { value: "1", ecc: "Q", version: 1, mask: 0, size: 23, digest: "f73d35d9" },
  { value: "1", ecc: "H", version: 1, mask: 0, size: 23, digest: "399c9ba9" },
  // Numeric mode, and the level that pushes the same string up three versions.
  { value: repeat("9", 40), ecc: "L", version: 1, mask: 2, size: 23, digest: "4faeda5c" },
  { value: repeat("9", 40), ecc: "M", version: 2, mask: 2, size: 27, digest: "05d0ed09" },
  { value: repeat("9", 40), ecc: "Q", version: 2, mask: 2, size: 27, digest: "2609492a" },
  { value: repeat("9", 40), ecc: "H", version: 3, mask: 1, size: 31, digest: "6c62e006" },
  // Alphanumeric mode.
  { value: "HELLO WORLD", ecc: "L", version: 1, mask: 7, size: 23, digest: "d8113285" },
  { value: "HELLO WORLD", ecc: "M", version: 1, mask: 0, size: 23, digest: "605410ba" },
  { value: "HELLO WORLD", ecc: "Q", version: 1, mask: 0, size: 23, digest: "cc58980e" },
  { value: "HELLO WORLD", ecc: "H", version: 2, mask: 5, size: 27, digest: "7a1d4335" },
  // Byte mode. Lower case alone is enough to disqualify alphanumeric.
  {
    value: "https://ui-organized.dev",
    ecc: "L",
    version: 2,
    mask: 7,
    size: 27,
    digest: "f1faff42",
  },
  {
    value: "https://ui-organized.dev",
    ecc: "M",
    version: 2,
    mask: 2,
    size: 27,
    digest: "f402e613",
  },
  {
    value: "https://ui-organized.dev",
    ecc: "Q",
    version: 3,
    mask: 7,
    size: 31,
    digest: "3067715c",
  },
  {
    value: "https://ui-organized.dev",
    ecc: "H",
    version: 3,
    mask: 6,
    size: 31,
    digest: "359e2c38",
  },
  // Multi-byte UTF-8, which is where a byte-mode encoder that counted characters
  // instead of bytes falls over.
  { value: "Ünïcödé — ✅ 中文", ecc: "L", version: 2, mask: 0, size: 27, digest: "d3afa02e" },
  { value: "Ünïcödé — ✅ 中文", ecc: "M", version: 2, mask: 7, size: 27, digest: "99407983" },
  { value: "Ünïcödé — ✅ 中文", ecc: "Q", version: 3, mask: 2, size: 31, digest: "68298115" },
  { value: "Ünïcödé — ✅ 中文", ecc: "H", version: 4, mask: 2, size: 35, digest: "120dcffd" },
  // Past version 9, where the character-count field widens, and past version 6,
  // where the version information block appears.
  { value: repeat("A", 300), ecc: "L", version: 9, mask: 2, size: 55, digest: "22d999cd" },
  { value: repeat("A", 300), ecc: "M", version: 10, mask: 2, size: 59, digest: "a2d54916" },
  { value: repeat("A", 300), ecc: "Q", version: 13, mask: 7, size: 71, digest: "6e82e9ec" },
  { value: repeat("A", 300), ecc: "H", version: 15, mask: 2, size: 79, digest: "f3494643" },
  // Past version 26, where it widens again, and up to the largest symbol with
  // enough blocks that a mistake in the interleave cannot hide.
  { value: repeat("z", 1200), ecc: "L", version: 25, mask: 1, size: 119, digest: "99d27b01" },
  { value: repeat("z", 1200), ecc: "M", version: 29, mask: 0, size: 135, digest: "466b2145" },
  { value: repeat("z", 1200), ecc: "Q", version: 34, mask: 4, size: 155, digest: "e8b8853f" },
  { value: repeat("z", 1200), ecc: "H", version: 39, mask: 1, size: 175, digest: "66b102ca" },
];

describe("against uqr, which is what the other three libraries render", () => {
  it("matches module for module on the published example", () => {
    expect(render(encodeQr("HELLO WORLD", { ecc: "Q" }))).toEqual(HELLO_WORLD_1Q);
  });

  it("matches module for module on the standard's numeric example", () => {
    expect(render(encodeQr("01234567", { ecc: "M" }))).toEqual(NUMERIC_1M);
  });

  it("defaults to error correction L, not M", () => {
    // The prop's documentation says 'M'. What the other three actually pass when
    // `errorCorrection` is absent is `encoding: undefined`, and uqr's own default
    // is 'L' — so this is what a code with no level set looks like, and matching
    // it matters more than matching the docs.
    expect(render(encodeQr("hi"))).toEqual(BYTE_1L);
    expect(render(encodeQr("hi", { ecc: "L" }))).toEqual(BYTE_1L);
  });

  it.each(UQR_FIXTURES)(
    "matches uqr for $ecc / version $version",
    ({ value, ecc, version, mask, size, digest: expected }) => {
      const matrix = encodeQr(value, { ecc });
      expect(matrix.version).toBe(version);
      // The mask is chosen by a penalty score, not stated — so it is the single
      // most sensitive number here, and the one a subtly wrong penalty rule
      // changes while leaving a perfectly scannable code behind.
      expect(matrix.mask).toBe(mask);
      expect(matrix.size).toBe(size);
      expect(digest(qrPathData(matrix, 10))).toBe(expected);
    },
  );
});

describe("path data", () => {
  it("emits one subpath per dark module, in the machine's own shape", () => {
    // `M<x>,<y>h<n>v<n>h-<n>z`, row-major. The gate cannot see `d` — it is not a
    // contract attribute — so this is the only place the four libraries' path
    // strings are held to the same shape.
    const matrix = encodeQr("hi", { ecc: "L" });
    const path = qrPathData(matrix, 7);
    const subpaths = path.match(/M\d+,\d+h7v7h-7z/g) ?? [];
    const darkModules = matrix.modules.flat().filter(Boolean).length;
    expect(subpaths).toHaveLength(darkModules);
    expect(subpaths.join("")).toBe(path);
    // The quiet zone is one module wide, so the first dark module is never at
    // the origin.
    expect(path.startsWith("M0,0")).toBe(false);
  });
});

// ── 3. Reading a code back ───────────────────────────────────────────────────

/**
 * Which modules of a version-1 symbol belong to a function pattern.
 *
 * Written out here rather than borrowed from the encoder, because borrowing it
 * would let a consistent-but-wrong layout agree with itself. Version 1 has no
 * alignment patterns and no version information, so the whole map is the three
 * finders with their separators, the two timing lines, the format information
 * and the dark module.
 */
function version1FunctionModules(size: number): boolean[][] {
  const reserved = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
  const mark = (x: number, y: number) => {
    if (x >= 0 && x < size && y >= 0 && y < size) reserved[y]![x] = true;
  };
  // Finders and their separators: an 8x8 corner each.
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      mark(i, j);
      mark(size - 1 - i, j);
      mark(i, size - 1 - j);
    }
  }
  // Timing.
  for (let i = 0; i < size; i++) {
    mark(6, i);
    mark(i, 6);
  }
  // Format information, both copies, plus the always-dark module.
  for (let i = 0; i < 9; i++) {
    mark(8, i);
    mark(i, 8);
  }
  for (let i = 0; i < 8; i++) {
    mark(size - 1 - i, 8);
    mark(8, size - 1 - i);
  }
  return reserved;
}

describe("a finished code reads back", () => {
  it("recovers the string, the level and the mask from the matrix alone", () => {
    const source = "01234567";
    const matrix = encodeQr(source, { ecc: "M", border: 0 });
    const { size, modules } = matrix;
    expect(size).toBe(21);

    // The first copy of the format information, in the order §8.9 lays it out.
    const formatBits: number[] = [];
    for (let i = 0; i <= 5; i++) formatBits.push(modules[i]![8] ? 1 : 0);
    formatBits.push(modules[7]![8] ? 1 : 0);
    formatBits.push(modules[8]![8] ? 1 : 0);
    formatBits.push(modules[8]![7] ? 1 : 0);
    for (let i = 9; i < 15; i++) formatBits.push(modules[8]![14 - i] ? 1 : 0);
    const format = formatBits.reduce((value, bit, index) => value | (bit << index), 0);
    // Recovered rather than assumed: the level and mask are read out of the
    // symbol by matching against every legal format word, which is what a
    // scanner does.
    const levels: QrErrorCorrection[] = ["L", "M", "Q", "H"];
    const decoded = levels.flatMap((ecc) =>
      [0, 1, 2, 3, 4, 5, 6, 7].map((mask) => ({ ecc, mask, bits: formatInformation(ecc, mask) })),
    );
    const identity = decoded.find((candidate) => candidate.bits === format);
    expect(identity, "the format information is not a legal code word").toBeDefined();
    expect(identity!.ecc).toBe("M");
    expect(identity!.mask).toBe(matrix.mask);

    // Unmask, then walk the placement backwards. Version 1-M is a single block,
    // so there is no interleaving to undo.
    const reserved = version1FunctionModules(size);
    const bits: number[] = [];
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vertical = 0; vertical < size; vertical++) {
        for (let column = 0; column < 2; column++) {
          const x = right - column;
          const upward = ((right + 1) & 2) === 0;
          const y = upward ? size - 1 - vertical : vertical;
          if (reserved[y]![x]) continue;
          const dark = modules[y]![x] !== maskInverts(identity!.mask, x, y);
          bits.push(dark ? 1 : 0);
        }
      }
    }

    const codewords: number[] = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
      codewords.push(bits.slice(i, i + 8).reduce((value, bit) => (value << 1) | bit, 0));
    }
    // 16 data + 10 error-correction codewords. §7.5, Table 13.
    expect(codewords).toHaveLength(26);

    // The whole 26-codeword block must divide cleanly by the generator — a
    // remainder of zero is what "these error-correction codewords are valid"
    // means, and nothing weaker would catch an off-by-one in the remainder.
    expect(reedSolomonRemainder(codewords, reedSolomonDivisor(10))).toEqual(Array(10).fill(0));

    // Mode 0001 is numeric; the count field is ten bits at this version.
    expect(bits.slice(0, 4).join("")).toBe("0001");
    const count = bits.slice(4, 14).reduce((value, bit) => (value << 1) | bit, 0);
    expect(count).toBe(source.length);

    // Three digits per ten bits, with the remainder in seven or four.
    let cursor = 14;
    let text = "";
    for (let left = count; left > 0; ) {
      const take = Math.min(left, 3);
      const width = take * 3 + 1;
      const group = bits.slice(cursor, cursor + width).reduce((v, bit) => (v << 1) | bit, 0);
      text += String(group).padStart(take, "0");
      cursor += width;
      left -= take;
    }
    expect(text).toBe(source);
  });
});
