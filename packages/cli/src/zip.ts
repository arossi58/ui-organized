import { inflateRawSync } from "node:zlib";

/**
 * A minimal ZIP reader, built on Node's zlib.
 *
 * Deliberately dependency-free. This CLI is designed to be run as
 * `npx @ui-organized/cli` with no install step, so every dependency is bytes a
 * user waits on before anything happens — and the alternatives are not small
 * (fflate unpacks to ~800 KB, JSZip more). Reading a theme bundle needs a few
 * dozen lines of the format, all of it stable since 1989.
 *
 * Scope is deliberately narrow: stored and deflated entries in a
 * non-encrypted, non-ZIP64 archive, which is what the Theme Builder produces.
 * Anything outside that is *detected and named* rather than mis-parsed — see
 * `UnsupportedZipError`, which the CLI turns into "unzip it yourself and use
 * --from <dir>".
 */

/** Signals a zip this reader deliberately doesn't handle. Carries advice, not blame. */
export class UnsupportedZipError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = "UnsupportedZipError";
  }
}

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const LOCAL_SIGNATURE = 0x04034b50;
const ZIP64_EOCD_LOCATOR = 0x07064b50;

/** Max bytes the End Of Central Directory record can occupy (22 + 64 KB comment). */
const EOCD_MAX_SCAN = 22 + 0xffff;

export interface ZipEntry {
  name: string;
  /** Decompressed bytes. Directory entries are excluded before this point. */
  data: Buffer;
}

/**
 * Read every file entry from a zip.
 *
 * Sizes and offsets come from the **central directory**, never the local file
 * header: when an archiver streams output it sets the "data descriptor" flag and
 * writes zeroes for the sizes in the local header, filling in the real values
 * afterwards. JSZip — which produces our bundles — does exactly that. Trusting
 * the local header there yields empty files with no error at all.
 */
export function readZip(buffer: Buffer): ZipEntry[] {
  const eocd = findEocd(buffer);

  // A ZIP64 locator sits immediately before the EOCD when the archive needs it.
  if (eocd >= 20 && buffer.readUInt32LE(eocd - 20) === ZIP64_EOCD_LOCATOR) {
    throw new UnsupportedZipError("the archive is ZIP64");
  }

  const entryCount = buffer.readUInt16LE(eocd + 10);
  const centralSize = buffer.readUInt32LE(eocd + 12);
  const centralOffset = buffer.readUInt32LE(eocd + 16);

  if (centralOffset + centralSize > buffer.length) {
    throw new UnsupportedZipError("the central directory is truncated or the file is corrupt");
  }

  const entries: ZipEntry[] = [];
  let cursor = centralOffset;

  for (let i = 0; i < entryCount; i++) {
    if (buffer.readUInt32LE(cursor) !== CENTRAL_SIGNATURE) {
      throw new UnsupportedZipError("the central directory is malformed");
    }

    const flags = buffer.readUInt16LE(cursor + 8);
    const method = buffer.readUInt16LE(cursor + 10);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const localOffset = buffer.readUInt32LE(cursor + 42);
    const name = buffer.toString("utf8", cursor + 46, cursor + 46 + nameLength);

    // Bit 0 is the encryption flag; there is no sensible way to guess a password.
    if (flags & 0x1) throw new UnsupportedZipError(`"${name}" is encrypted`);

    cursor += 46 + nameLength + extraLength + commentLength;

    // Directory entries carry no content. Skip rather than emit empty files.
    if (name.endsWith("/")) continue;

    entries.push({ name, data: readLocalEntry(buffer, localOffset, method, compressedSize, name) });
  }

  return entries;
}

/** Read one entry's bytes, using the size the central directory reported. */
function readLocalEntry(
  buffer: Buffer,
  offset: number,
  method: number,
  compressedSize: number,
  name: string,
): Buffer {
  if (buffer.readUInt32LE(offset) !== LOCAL_SIGNATURE) {
    throw new UnsupportedZipError(`the local header for "${name}" is malformed`);
  }

  const nameLength = buffer.readUInt16LE(offset + 26);
  const extraLength = buffer.readUInt16LE(offset + 28);
  const start = offset + 30 + nameLength + extraLength;
  const body = buffer.subarray(start, start + compressedSize);

  if (method === 0) return Buffer.from(body); // stored
  if (method === 8) return inflateRawSync(body); // deflate

  throw new UnsupportedZipError(
    `"${name}" uses compression method ${method}, which this reader doesn't implement`,
  );
}

/** Locate the End Of Central Directory record by scanning back from the tail. */
function findEocd(buffer: Buffer): number {
  if (buffer.length < 22) throw new UnsupportedZipError("the file is too small to be a zip");

  const floor = Math.max(0, buffer.length - EOCD_MAX_SCAN);
  for (let i = buffer.length - 22; i >= floor; i--) {
    if (buffer.readUInt32LE(i) === EOCD_SIGNATURE) return i;
  }
  throw new UnsupportedZipError("no zip end-of-archive record was found — is this really a zip?");
}
