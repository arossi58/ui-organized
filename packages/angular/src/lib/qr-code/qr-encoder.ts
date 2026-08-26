/**
 * A QR encoder, written out by hand.
 *
 * ── Why this file exists ────────────────────────────────────────────────────
 *
 * React, Svelte and Vue get their code from `@zag-js/qr-code`, which bundles
 * `uqr`, and the note in every one of those components says the same thing:
 * nothing there computes a single module, because three libraries hand-rolling
 * an encoder would produce three codes. This package has no zag and may take no
 * third-party dependency beyond the CDK, so the choice is between an encoder and
 * a `QRCode` that renders a frame around nothing. An encoder it is — and a
 * fourth answer to the question is only acceptable because it is *checked*
 * against the other three's, module for module, in `qr-encoder.spec.ts`.
 *
 * ── Sources ─────────────────────────────────────────────────────────────────
 *
 * The algorithm is ISO/IEC 18004 (QR Code 2005). Where a table is reproduced
 * here it names the clause it comes from, and the structure follows Project
 * Nayuki's reference implementation ("QR Code generator library", MIT), which is
 * what `uqr` is a TypeScript port of. Following the same reference is deliberate:
 * the ambiguous parts of the spec — automatic mask choice, the interleaving of
 * short and long blocks — have to be resolved the same way as `uqr` or the four
 * libraries would render *valid but different* codes for the same string.
 *
 * ── What is checked, and how ────────────────────────────────────────────────
 *
 * `qr-encoder.spec.ts` holds four independent proofs:
 *
 *  1. Published tables — the Reed-Solomon generator polynomials from ISO/IEC
 *     18004 Annex A, the alignment-pattern centres from Annex E, the format and
 *     version information bit strings from Annex C and D — asserted against
 *     values written into the spec by hand, so a transcription error here cannot
 *     agree with itself.
 *  2. A decoder, written in the spec, that reads a finished matrix back to the
 *     original string. It reverses the mask, un-interleaves the blocks, and
 *     confirms every Reed-Solomon syndrome is zero, which is what proves the
 *     error-correction codewords are a valid codeword rather than merely
 *     present.
 *  3. Structural invariants — three finder patterns, the timing rows, the always
 *     dark module.
 *  4. Fixtures generated from `uqr` itself at authoring time and checked in, so
 *     the path data this produces is compared byte for byte with what the other
 *     three libraries render. `uqr` is read to make the table and never imported
 *     by anything that ships or runs.
 */

/** The four levels, in the spelling the component's `errorCorrection` prop uses. */
export type QrErrorCorrection = "L" | "M" | "Q" | "H";

export interface QrMatrix {
  /** 1-40. */
  version: number;
  /** Edge length in modules, including the quiet-zone border. */
  size: number;
  /** The mask pattern chosen, 0-7. */
  mask: number;
  /** Row-major, `true` for a dark module. */
  modules: boolean[][];
}

export interface QrEncodeOptions {
  /** Defaults to `"L"` — uqr's default, and therefore the machine's. */
  ecc?: QrErrorCorrection;
  /**
   * Quiet zone in modules on every side. Defaults to 1, which is uqr's default
   * and so what the other three libraries render.
   *
   * The spec asks for 4. The design system supplies the rest as padding on
   * `.qr-code__frame` — see the note in `QRCode.css` — so widening it here would
   * double the margin rather than fix anything.
   */
  border?: number;
}

/**
 * Each level's two numbers: the row it occupies in the tables below, and the
 * two-bit indicator it contributes to the format information.
 *
 * They are deliberately not the same and not in the same order — ISO/IEC 18004
 * §8.9 numbers the levels M=00, L=01, H=10, Q=11 for the format bits, while the
 * capacity tables are ordered L, M, Q, H. Collapsing the two into one number is
 * the classic way to produce a code that scans as the wrong error level.
 */
const ECC_LEVELS: Record<QrErrorCorrection, { row: number; formatBits: number }> = {
  L: { row: 0, formatBits: 1 },
  M: { row: 1, formatBits: 0 },
  Q: { row: 2, formatBits: 3 },
  H: { row: 3, formatBits: 2 },
};

/**
 * Error-correction codewords per block, by level and version.
 * ISO/IEC 18004 Table 13-22. Index 0 is padding — there is no version 0.
 */
const ECC_CODEWORDS_PER_BLOCK: readonly (readonly number[])[] = [
  // L
  [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  // M
  [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  // Q
  [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  // H
  [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
];

/**
 * Number of error-correction blocks, by level and version.
 * ISO/IEC 18004 Table 13-22, same layout as above.
 */
const ECC_BLOCKS: readonly (readonly number[])[] = [
  // L
  [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  // M
  [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  // Q
  [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  // H
  [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
];

/** ISO/IEC 18004 §7.4.1-7.4.4. `[indicator, ccBitsSmall, ccBitsMedium, ccBitsLarge]`. */
const MODE_NUMERIC = [1, 10, 12, 14] as const;
const MODE_ALPHANUMERIC = [2, 9, 11, 13] as const;
const MODE_BYTE = [4, 8, 16, 16] as const;
type Mode = typeof MODE_NUMERIC | typeof MODE_ALPHANUMERIC | typeof MODE_BYTE;

/** ISO/IEC 18004 Table 5. Position in this string *is* the value. */
const ALPHANUMERIC_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

const NUMERIC_PATTERN = /^\d*$/;
const ALPHANUMERIC_PATTERN = /^[A-Z0-9 $%*+./:-]*$/;

/** ISO/IEC 18004 §8.8.2, Table 24. */
const PENALTY_ADJACENT = 3;
const PENALTY_BLOCK = 3;
const PENALTY_FINDER_LIKE = 40;
const PENALTY_BALANCE = 10;

const MIN_VERSION = 1;
const MAX_VERSION = 40;

// ── Bits ─────────────────────────────────────────────────────────────────────

/** Append the low `length` bits of `value`, most significant first. */
function appendBits(bits: number[], value: number, length: number): void {
  for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
}

const bitAt = (value: number, index: number) => ((value >>> index) & 1) !== 0;

// ── Segments ─────────────────────────────────────────────────────────────────

interface Segment {
  mode: Mode;
  /** Characters for numeric and alphanumeric, *bytes* for byte mode. */
  count: number;
  bits: number[];
}

/**
 * How many bits the character count takes, which depends on both mode and
 * version. ISO/IEC 18004 Table 3: the three bands are versions 1-9, 10-26 and
 * 27-40.
 */
function charCountBits(mode: Mode, version: number): number {
  return mode[Math.floor((version + 7) / 17) + 1]!;
}

/**
 * UTF-8 bytes for a string.
 *
 * QR has no notion of UTF-8 — byte mode is ISO-8859-1 by the letter of the spec
 * — but every scanner in use treats a byte segment that parses as UTF-8 as UTF-8,
 * and that is what `uqr` produces (it round-trips through `encodeURI`, which is
 * UTF-8 percent-encoding). This is written out directly instead, because
 * `encodeURI` throws on a lone surrogate where `TextEncoder` substitutes U+FFFD,
 * and a QR code is not the place to raise an exception about someone's display
 * name. Well-formed input produces identical bytes either way, which is what the
 * fixture comparison in the spec covers.
 */
function toUtf8(text: string): number[] {
  return Array.from(new TextEncoder().encode(text));
}

/**
 * The single segment a string is encoded as.
 *
 * One segment for the whole string, not the optimal mixed-mode split ISO/IEC
 * 18004 Annex J allows. That is `uqr`'s choice, and matching it is the point:
 * a smarter segmentation here would produce a smaller, perfectly valid code that
 * is not the code the other three libraries render.
 */
function makeSegment(text: string): Segment[] {
  if (text === "") return [];

  if (NUMERIC_PATTERN.test(text)) {
    const bits: number[] = [];
    // Three digits to ten bits, two to seven, one to four. §7.4.3.
    for (let i = 0; i < text.length; ) {
      const take = Math.min(text.length - i, 3);
      appendBits(bits, Number.parseInt(text.substring(i, i + take), 10), take * 3 + 1);
      i += take;
    }
    return [{ mode: MODE_NUMERIC, count: text.length, bits }];
  }

  if (ALPHANUMERIC_PATTERN.test(text)) {
    const bits: number[] = [];
    // Pairs to eleven bits, a trailing odd character to six. §7.4.4.
    let i = 0;
    for (; i + 2 <= text.length; i += 2) {
      const pair =
        ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)) * 45 +
        ALPHANUMERIC_CHARSET.indexOf(text.charAt(i + 1));
      appendBits(bits, pair, 11);
    }
    if (i < text.length) appendBits(bits, ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)), 6);
    return [{ mode: MODE_ALPHANUMERIC, count: text.length, bits }];
  }

  const bytes = toUtf8(text);
  const bits: number[] = [];
  for (const byte of bytes) appendBits(bits, byte, 8);
  return [{ mode: MODE_BYTE, count: bytes.length, bits }];
}

function totalBits(segments: readonly Segment[], version: number): number {
  let total = 0;
  for (const segment of segments) {
    const ccBits = charCountBits(segment.mode, version);
    // A count that will not fit its field means this version cannot hold the
    // segment at all, whatever the capacity says.
    if (segment.count >= 1 << ccBits) return Number.POSITIVE_INFINITY;
    total += 4 + ccBits + segment.bits.length;
  }
  return total;
}

// ── Capacity ─────────────────────────────────────────────────────────────────

/**
 * Modules available to data and error correction, before the format and version
 * information is subtracted. ISO/IEC 18004 §7.3.
 *
 * The closed form is Nayuki's: the whole grid minus the function patterns, with
 * the alignment patterns' overlap with the timing rows already accounted for.
 */
function rawDataModules(version: number): number {
  let result = (16 * version + 128) * version + 64;
  if (version >= 2) {
    const alignCount = Math.floor(version / 7) + 2;
    result -= (25 * alignCount - 10) * alignCount - 55;
    // Version information: two 3x6 blocks, from version 7 on.
    if (version >= 7) result -= 36;
  }
  return result;
}

function dataCodewords(version: number, ecc: QrErrorCorrection): number {
  const { row } = ECC_LEVELS[ecc];
  return (
    Math.floor(rawDataModules(version) / 8) -
    ECC_CODEWORDS_PER_BLOCK[row]![version]! * ECC_BLOCKS[row]![version]!
  );
}

// ── Reed-Solomon over GF(2^8) ────────────────────────────────────────────────

/**
 * Multiply in GF(2^8) modulo the QR field polynomial x^8 + x^4 + x^3 + x^2 + 1
 * (0x11D). ISO/IEC 18004 §8.5.2.
 *
 * Russian-peasant multiplication with the reduction folded in, so no log/antilog
 * tables are needed and there is no table to get wrong.
 */
export function gfMultiply(x: number, y: number): number {
  let result = 0;
  for (let i = 7; i >= 0; i--) {
    // Double, reducing when the top bit falls off. 0x11D without its top bit.
    result = (result << 1) ^ ((result >>> 7) * 0x11d);
    result ^= ((y >>> i) & 1) * x;
  }
  return result & 0xff;
}

/**
 * The generator polynomial for `degree` error-correction codewords, as
 * coefficients from x^(degree-1) down to x^0. The leading 1 is implicit.
 *
 * This is the product (x - α^0)(x - α^1)…(x - α^(degree-1)). ISO/IEC 18004
 * Annex A publishes the results as α-exponents; `qr-encoder.spec.ts` holds two
 * rows of that table verbatim and checks them against what this computes, which
 * is what makes the field arithmetic above independently verified rather than
 * merely self-consistent.
 */
export function reedSolomonDivisor(degree: number): number[] {
  // Annotated, not inferred: the initialiser's `1 : 0` narrows to `(1 | 0)[]`,
  // and the Galois-field arithmetic below assigns arbitrary bytes into it.
  const divisor: number[] = Array.from({ length: degree }, (_, index) =>
    index === degree - 1 ? 1 : 0,
  );
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < divisor.length; j++) {
      divisor[j] = gfMultiply(divisor[j]!, root);
      if (j + 1 < divisor.length) divisor[j] = divisor[j]! ^ divisor[j + 1]!;
    }
    root = gfMultiply(root, 2);
  }
  return divisor;
}

/** The remainder of `data` divided by `divisor` — the error-correction codewords. */
export function reedSolomonRemainder(data: readonly number[], divisor: readonly number[]): number[] {
  const result = divisor.map(() => 0);
  for (const byte of data) {
    const factor = byte ^ result.shift()!;
    result.push(0);
    divisor.forEach((coefficient, index) => {
      result[index] = result[index]! ^ gfMultiply(coefficient, factor);
    });
  }
  return result;
}

// ── The grid ─────────────────────────────────────────────────────────────────

interface Grid {
  size: number;
  dark: boolean[][];
  /**
   * Which modules belong to a function pattern.
   *
   * The mask is applied to data modules only, and the codewords are laid into
   * the gaps between function patterns — so getting this wrong does not produce
   * a corrupt code, it produces one that a scanner reads as a *different*
   * string. Every `set` that draws a pattern marks it here.
   */
  reserved: boolean[][];
}

function makeGrid(size: number): Grid {
  return {
    size,
    dark: Array.from({ length: size }, () => Array<boolean>(size).fill(false)),
    reserved: Array.from({ length: size }, () => Array<boolean>(size).fill(false)),
  };
}

function setFunctionModule(grid: Grid, x: number, y: number, dark: boolean): void {
  grid.dark[y]![x] = dark;
  grid.reserved[y]![x] = true;
}

/**
 * Alignment-pattern centre coordinates for a version. ISO/IEC 18004 Annex E,
 * Table E.1.
 *
 * Computed rather than tabulated, which is Nayuki's approach and reproduces
 * every row of the table: the first centre is always 6, the last is always
 * size-7, and the rest are spaced evenly backwards from the last in an even
 * step. Version 32 is the one row the formula misses, and the spec's own table
 * is the authority there.
 */
export function alignmentPatternPositions(version: number): number[] {
  if (version === 1) return [];
  const count = Math.floor(version / 7) + 2;
  const step = version === 32 ? 26 : Math.ceil((version * 4 + 4) / (count * 2 - 2)) * 2;
  const positions = [6];
  for (let pos = version * 4 + 17 - 7; positions.length < count; pos -= step) {
    positions.splice(1, 0, pos);
  }
  return positions;
}

/**
 * The 15-bit format information for a level and mask. ISO/IEC 18004 §8.9.
 *
 * Five data bits, ten BCH(15,5) check bits over the generator 0b10100110111,
 * then XOR with 0b101010000010010 so that an all-zero format never produces an
 * all-zero pattern.
 */
export function formatInformation(ecc: QrErrorCorrection, mask: number): number {
  const data = (ECC_LEVELS[ecc].formatBits << 3) | mask;
  let remainder = data;
  for (let i = 0; i < 10; i++) remainder = (remainder << 1) ^ ((remainder >>> 9) * 0b10100110111);
  return ((data << 10) | remainder) ^ 0b101010000010010;
}

/**
 * The 18-bit version information for versions 7 and above. ISO/IEC 18004 §8.10.
 * Six data bits and twelve Golay(18,6) check bits over 0b1111100100101.
 */
export function versionInformation(version: number): number {
  let remainder = version;
  for (let i = 0; i < 12; i++) remainder = (remainder << 1) ^ ((remainder >>> 11) * 0b1111100100101);
  return (version << 12) | remainder;
}

function drawFormatBits(grid: Grid, ecc: QrErrorCorrection, mask: number): void {
  const bits = formatInformation(ecc, mask);
  // First copy, around the top-left finder.
  for (let i = 0; i <= 5; i++) setFunctionModule(grid, 8, i, bitAt(bits, i));
  setFunctionModule(grid, 8, 7, bitAt(bits, 6));
  setFunctionModule(grid, 8, 8, bitAt(bits, 7));
  setFunctionModule(grid, 7, 8, bitAt(bits, 8));
  for (let i = 9; i < 15; i++) setFunctionModule(grid, 14 - i, 8, bitAt(bits, i));
  // Second copy, split between the other two finders.
  for (let i = 0; i < 8; i++) setFunctionModule(grid, grid.size - 1 - i, 8, bitAt(bits, i));
  for (let i = 8; i < 15; i++) setFunctionModule(grid, 8, grid.size - 15 + i, bitAt(bits, i));
  // The module that is dark in every valid code. §8.9.
  setFunctionModule(grid, 8, grid.size - 8, true);
}

function drawVersionBits(grid: Grid, version: number): void {
  if (version < 7) return;
  const bits = versionInformation(version);
  for (let i = 0; i < 18; i++) {
    const dark = bitAt(bits, i);
    const along = grid.size - 11 + (i % 3);
    const across = Math.floor(i / 3);
    setFunctionModule(grid, along, across, dark);
    setFunctionModule(grid, across, along, dark);
  }
}

/** A finder pattern and its separator, centred on (x, y). §6.3.3. */
function drawFinder(grid: Grid, x: number, y: number): void {
  for (let dy = -4; dy <= 4; dy++) {
    for (let dx = -4; dx <= 4; dx++) {
      const distance = Math.max(Math.abs(dx), Math.abs(dy));
      const px = x + dx;
      const py = y + dy;
      if (px < 0 || px >= grid.size || py < 0 || py >= grid.size) continue;
      // Rings at distance 0, 1 and 3 are dark; 2 is the light ring and 4 the
      // separator.
      setFunctionModule(grid, px, py, distance !== 2 && distance !== 4);
    }
  }
}

/** A 5x5 alignment pattern centred on (x, y). §6.3.6. */
function drawAlignment(grid: Grid, x: number, y: number): void {
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      setFunctionModule(grid, x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
  }
}

function drawFunctionPatterns(grid: Grid, version: number, ecc: QrErrorCorrection): void {
  // Timing patterns first: the finders overwrite their own ends, which is what
  // the spec describes and what makes row and column 6 alternate cleanly
  // between the separators.
  for (let i = 0; i < grid.size; i++) {
    setFunctionModule(grid, 6, i, i % 2 === 0);
    setFunctionModule(grid, i, 6, i % 2 === 0);
  }

  drawFinder(grid, 3, 3);
  drawFinder(grid, grid.size - 4, 3);
  drawFinder(grid, 3, grid.size - 4);

  const positions = alignmentPatternPositions(version);
  const last = positions.length - 1;
  for (let i = 0; i <= last; i++) {
    for (let j = 0; j <= last; j++) {
      // The three corners already carry finder patterns.
      const isFinderCorner =
        (i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0);
      if (!isFinderCorner) drawAlignment(grid, positions[i]!, positions[j]!);
    }
  }

  // Drawn with mask 0 only to *reserve* the modules; the real bits are written
  // once a mask has been chosen.
  drawFormatBits(grid, ecc, 0);
  drawVersionBits(grid, version);
}

/**
 * Interleave the data codewords with their error correction. ISO/IEC 18004 §8.6.
 *
 * The blocks are not all the same length — the short ones are one codeword
 * shorter than the long ones — and the interleave takes one codeword from each
 * block in turn, skipping the short blocks' missing column. Nayuki's trick of
 * padding each short block with a zero and then skipping exactly that index is
 * reproduced here, because writing it as two loops instead is where an
 * off-by-one silently produces a code that only fails to scan for some inputs.
 */
function addEccAndInterleave(
  data: readonly number[],
  version: number,
  ecc: QrErrorCorrection,
): number[] {
  const { row } = ECC_LEVELS[ecc];
  const blockCount = ECC_BLOCKS[row]![version]!;
  const eccPerBlock = ECC_CODEWORDS_PER_BLOCK[row]![version]!;
  const rawCodewords = Math.floor(rawDataModules(version) / 8);
  const shortBlockCount = blockCount - (rawCodewords % blockCount);
  const shortBlockLength = Math.floor(rawCodewords / blockCount);

  const divisor = reedSolomonDivisor(eccPerBlock);
  const blocks: number[][] = [];
  for (let i = 0, taken = 0; i < blockCount; i++) {
    const length = shortBlockLength - eccPerBlock + (i < shortBlockCount ? 0 : 1);
    const block = data.slice(taken, taken + length);
    taken += block.length;
    const remainder = reedSolomonRemainder(block, divisor);
    // The placeholder that keeps every block the same length for the loop below.
    if (i < shortBlockCount) block.push(0);
    blocks.push(block.concat(remainder));
  }

  const result: number[] = [];
  for (let i = 0; i < blocks[0]!.length; i++) {
    blocks.forEach((block, index) => {
      if (i === shortBlockLength - eccPerBlock && index < shortBlockCount) return;
      result.push(block[i]!);
    });
  }
  return result;
}

/**
 * Lay the codeword stream into the grid. ISO/IEC 18004 §8.7.
 *
 * Two-module-wide columns, right to left, snaking up and down, skipping the
 * vertical timing column entirely.
 */
function drawCodewords(grid: Grid, codewords: readonly number[]): void {
  let bit = 0;
  for (let right = grid.size - 1; right >= 1; right -= 2) {
    // Column 6 is the vertical timing pattern; the pairs shift left past it.
    if (right === 6) right = 5;
    for (let vertical = 0; vertical < grid.size; vertical++) {
      for (let column = 0; column < 2; column++) {
        const x = right - column;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? grid.size - 1 - vertical : vertical;
        if (grid.reserved[y]![x] || bit >= codewords.length * 8) continue;
        grid.dark[y]![x] = bitAt(codewords[bit >>> 3]!, 7 - (bit & 7));
        bit++;
      }
    }
  }
}

/**
 * Whether module (x, y) is inverted by mask `pattern`. ISO/IEC 18004 Table 23.
 *
 * Exported so the spec can reverse it: unmasking is how a matrix is read back.
 */
export function maskInverts(pattern: number, x: number, y: number): boolean {
  switch (pattern) {
    case 0:
      return (x + y) % 2 === 0;
    case 1:
      return y % 2 === 0;
    case 2:
      return x % 3 === 0;
    case 3:
      return (x + y) % 3 === 0;
    case 4:
      return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
    case 5:
      return (((x * y) % 2) + ((x * y) % 3)) === 0;
    case 6:
      return ((((x * y) % 2) + ((x * y) % 3)) % 2) === 0;
    case 7:
      return ((((x + y) % 2) + ((x * y) % 3)) % 2) === 0;
    default:
      throw new RangeError(`qr: mask pattern ${pattern} is out of range`);
  }
}

/** XOR the mask over the data modules. Applying it twice undoes it. */
function applyMask(grid: Grid, pattern: number): void {
  for (let y = 0; y < grid.size; y++) {
    for (let x = 0; x < grid.size; x++) {
      if (grid.reserved[y]![x]) continue;
      if (maskInverts(pattern, x, y)) grid.dark[y]![x] = !grid.dark[y]![x];
    }
  }
}

/**
 * Push a run length onto the finder-pattern history, and note whether the run
 * started at the edge of the symbol.
 *
 * The edge case is the subtle half of §8.8.2: the 1:1:3:1:1 pattern also counts
 * when it is bounded by the quiet zone rather than by a light run, so the first
 * run of every line is inflated by the symbol size to stand in for that.
 */
function pushRun(history: number[], run: number, size: number): void {
  if (history[0] === 0) run += size;
  history.pop();
  history.unshift(run);
}

/** Whether the run history holds one or two finder-lookalikes. §8.8.2. */
function finderLikeCount(history: readonly number[]): number {
  const n = history[1]!;
  const core =
    n > 0 && history[2] === n && history[3] === n * 3 && history[4] === n && history[5] === n;
  return (
    (core && history[0]! >= n * 4 && history[6]! >= n ? 1 : 0) +
    (core && history[6]! >= n * 4 && history[0]! >= n ? 1 : 0)
  );
}

function terminateRun(history: number[], runDark: boolean, run: number, size: number): number {
  if (runDark) {
    pushRun(history, run, size);
    run = 0;
  }
  run += size;
  pushRun(history, run, size);
  return finderLikeCount(history);
}

/**
 * The penalty score used to choose a mask. ISO/IEC 18004 §8.8.2.
 *
 * Four rules: runs of five or more, 2x2 blocks of one colour, finder-lookalikes,
 * and the overall dark/light balance. The mask with the lowest total wins.
 */
function penaltyScore(grid: Grid): number {
  const { size, dark } = grid;
  let score = 0;

  // Rule 1 and rule 3, along rows.
  for (let y = 0; y < size; y++) {
    let runDark = false;
    let run = 0;
    const history = [0, 0, 0, 0, 0, 0, 0];
    for (let x = 0; x < size; x++) {
      if (dark[y]![x] === runDark) {
        run++;
        if (run === 5) score += PENALTY_ADJACENT;
        else if (run > 5) score++;
      } else {
        pushRun(history, run, size);
        if (!runDark) score += finderLikeCount(history) * PENALTY_FINDER_LIKE;
        runDark = dark[y]![x]!;
        run = 1;
      }
    }
    score += terminateRun(history, runDark, run, size) * PENALTY_FINDER_LIKE;
  }

  // The same, down columns.
  for (let x = 0; x < size; x++) {
    let runDark = false;
    let run = 0;
    const history = [0, 0, 0, 0, 0, 0, 0];
    for (let y = 0; y < size; y++) {
      if (dark[y]![x] === runDark) {
        run++;
        if (run === 5) score += PENALTY_ADJACENT;
        else if (run > 5) score++;
      } else {
        pushRun(history, run, size);
        if (!runDark) score += finderLikeCount(history) * PENALTY_FINDER_LIKE;
        runDark = dark[y]![x]!;
        run = 1;
      }
    }
    score += terminateRun(history, runDark, run, size) * PENALTY_FINDER_LIKE;
  }

  // Rule 2: every 2x2 block of one colour.
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const colour = dark[y]![x];
      if (
        colour === dark[y]![x + 1] &&
        colour === dark[y + 1]![x] &&
        colour === dark[y + 1]![x + 1]
      ) {
        score += PENALTY_BLOCK;
      }
    }
  }

  // Rule 4: how far the proportion of dark modules strays from 50%.
  let darkCount = 0;
  for (const row of dark) for (const module of row) if (module) darkCount++;
  const total = size * size;
  score += (Math.ceil(Math.abs(darkCount * 20 - total * 10) / total) - 1) * PENALTY_BALANCE;
  return score;
}

// ── Encoding ─────────────────────────────────────────────────────────────────

/**
 * Encode a string into a module matrix.
 *
 * Deliberately *not* boosting the error-correction level to fill spare capacity.
 * ISO/IEC 18004 allows it and Nayuki's reference does it by default; `uqr`
 * disables it, and `@zag-js/qr-code` takes that default — so a code that quietly
 * upgraded itself from L to Q would be more robust, differently masked, and not
 * the code the other three libraries render.
 */
export function encodeQr(value: string, options: QrEncodeOptions = {}): QrMatrix {
  const ecc = options.ecc ?? "L";
  const border = options.border ?? 1;
  const segments = makeSegment(value);

  // The smallest version the data fits in.
  let version = MIN_VERSION;
  for (; ; version++) {
    if (totalBits(segments, version) <= dataCodewords(version, ecc) * 8) break;
    if (version >= MAX_VERSION) {
      throw new RangeError(`qr: ${value.length} characters do not fit at error correction ${ecc}`);
    }
  }

  // Mode indicator, character count and payload, then the terminator and pad.
  const bits: number[] = [];
  for (const segment of segments) {
    appendBits(bits, segment.mode[0], 4);
    appendBits(bits, segment.count, charCountBits(segment.mode, version));
    for (const bit of segment.bits) bits.push(bit);
  }
  const capacityBits = dataCodewords(version, ecc) * 8;
  // Up to four zero bits of terminator, then zeros to the next byte boundary.
  appendBits(bits, 0, Math.min(4, capacityBits - bits.length));
  appendBits(bits, 0, (8 - (bits.length % 8)) % 8);
  // §7.4.10's alternating pad bytes, 11101100 and 00010001.
  for (let pad = 0xec; bits.length < capacityBits; pad ^= 0xec ^ 0x11) appendBits(bits, pad, 8);

  const codewords = Array.from({ length: Math.ceil(bits.length / 8) }, () => 0);
  bits.forEach((bit, index) => {
    codewords[index >>> 3]! |= bit << (7 - (index & 7));
  });

  const grid = makeGrid(version * 4 + 17);
  drawFunctionPatterns(grid, version, ecc);
  drawCodewords(grid, addEccAndInterleave(codewords, version, ecc));

  // Every mask is tried and scored, because the spec says to and because the
  // other three libraries do: picking a fixed mask produces a valid code that
  // differs from theirs for the same string.
  let mask = 0;
  let best = Number.POSITIVE_INFINITY;
  for (let candidate = 0; candidate < 8; candidate++) {
    applyMask(grid, candidate);
    drawFormatBits(grid, ecc, candidate);
    const score = penaltyScore(grid);
    if (score < best) {
      best = score;
      mask = candidate;
    }
    applyMask(grid, candidate);
  }
  applyMask(grid, mask);
  drawFormatBits(grid, ecc, mask);

  return withBorder({ version, size: grid.size, mask, modules: grid.dark }, border);
}

/** Surround the symbol with `border` modules of quiet zone. */
function withBorder(matrix: QrMatrix, border: number): QrMatrix {
  if (!border) return matrix;
  const size = matrix.size + border * 2;
  const blank = () => Array<boolean>(size).fill(false);
  const modules = matrix.modules.map((row) => [
    ...Array<boolean>(border).fill(false),
    ...row,
    ...Array<boolean>(border).fill(false),
  ]);
  for (let i = 0; i < border; i++) {
    modules.unshift(blank());
    modules.push(blank());
  }
  return { ...matrix, size, modules };
}

/**
 * The matrix as one SVG path, one square per dark module.
 *
 * The shape of each subpath — `M<x>,<y>h<n>v<n>h-<n>z` — and the row-major order
 * are the machine's, not a choice: the other three libraries publish exactly
 * this string, and `qr-encoder.spec.ts` compares it against theirs character for
 * character. A path built any other way would render the same code and fail that
 * comparison, which is the point of having it.
 */
export function qrPathData(matrix: QrMatrix, pixelSize: number): string {
  const parts: string[] = [];
  for (let row = 0; row < matrix.size; row++) {
    for (let column = 0; column < matrix.size; column++) {
      if (!matrix.modules[row]![column]) continue;
      const x = column * pixelSize;
      const y = row * pixelSize;
      parts.push(`M${x},${y}h${pixelSize}v${pixelSize}h-${pixelSize}z`);
    }
  }
  return parts.join("");
}
