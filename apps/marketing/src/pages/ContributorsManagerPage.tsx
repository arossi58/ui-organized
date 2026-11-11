import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Avatar, Button, Input } from "@ui-organized/react";
import { avatarSrc, type Contributor } from "../lib/contributors";
import "./contributors-manager.css";

/** Photos are center-cropped and stored at this square size (2x the 64px avatar, with headroom). */
const AVATAR_PX = 256;

const slugify = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "contributor";

/** A slug for `name` that no other row already uses. */
function uniqueId(name: string, rows: Contributor[], self: number): string {
  const base = slugify(name);
  const taken = new Set(rows.filter((_, i) => i !== self).map((row) => row.id));
  let id = base;
  for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
  return id;
}

/** Center-crop the picked file to a square and re-encode it small. */
async function toAvatarDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = AVATAR_PX;
  canvas.getContext("2d")!.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    AVATAR_PX,
    AVATAR_PX,
  );
  bitmap.close();
  return canvas.toDataURL("image/webp", 0.86);
}

async function api<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`/__contributors${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(json.error ?? `Request failed (${response.status})`);
  return json;
}

/**
 * Dev-only editor for the homepage contributors grid. Registered only when
 * `import.meta.env.DEV`, and backed by contributors-manager/plugin.ts, which
 * writes src/content/contributors.json and public/contributors/. Nothing here
 * commits; the changes show up in git like any other edit.
 */
export function ContributorsManagerPage() {
  const [rows, setRows] = useState<Contributor[] | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const fileInputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    api<{ contributors: Contributor[] }>("/list")
      .then(({ contributors }) => setRows(contributors))
      .catch((error: Error) => setNotice({ tone: "error", text: error.message }));
  }, []);

  if (!rows) {
    return (
      <main id="main" className="contributors-manager">
        {notice && <Alert variant="error" title="Couldn't load contributors">{notice.text}</Alert>}
      </main>
    );
  }

  const update = (index: number, patch: Partial<Contributor>) => {
    setRows((current) => current!.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    setDirty(true);
    setNotice(null);
  };

  const move = (index: number, by: -1 | 1) => {
    setRows((current) => {
      const next = [...current!];
      [next[index], next[index + by]] = [next[index + by], next[index]];
      return next;
    });
    setDirty(true);
  };

  const remove = (index: number) => {
    setRows((current) => current!.filter((_, i) => i !== index));
    setDirty(true);
  };

  const add = () => {
    setRows((current) => [...current!, { id: "", name: "", url: "https://", avatar: null }]);
    setDirty(true);
  };

  async function upload(index: number, file: File | undefined) {
    if (!file) return;
    const row = rows![index];
    // A new row has no id until it has a name; mint one now so the file is named after them.
    const id = row.id || uniqueId(row.name, rows!, index);
    try {
      const dataUrl = await toAvatarDataUrl(file);
      const { avatar } = await api<{ avatar: string }>("/avatar", { id, dataUrl });
      update(index, { id, avatar });
    } catch (error) {
      setNotice({ tone: "error", text: (error as Error).message });
    }
  }

  async function save() {
    const list = rows!.map((row, i) => ({ ...row, id: row.id || uniqueId(row.name, rows!, i) }));
    setSaving(true);
    try {
      const { contributors } = await api<{ contributors: Contributor[] }>("/save", { contributors: list });
      setRows(contributors);
      setDirty(false);
      setNotice({
        tone: "success",
        text: "Saved to src/content/contributors.json. Commit it with any new photos in public/contributors/.",
      });
    } catch (error) {
      setNotice({ tone: "error", text: (error as Error).message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main id="main" className="contributors-manager">
      <header className="contributors-manager__head">
        <div>
          <h1 className="contributors-manager__title">Contributors</h1>
          <p className="contributors-manager__sub">
            Dev-only. Order here is fill order on the{" "}
            <Link to="/#contributors">homepage grid</Link>, starting top-center.
          </p>
        </div>
        <div className="contributors-manager__actions">
          <Button intent="secondary" icon="plus" onClick={add}>
            Add contributor
          </Button>
          <Button onClick={save} disabled={!dirty || saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </header>

      {notice && (
        <Alert variant={notice.tone} title={notice.tone === "success" ? "Saved" : "Something went wrong"}>
          {notice.text}
        </Alert>
      )}

      <ol className="contributors-manager__list">
        {rows.map((row, index) => (
          <li key={index} className="contributors-manager__row">
            <button
              type="button"
              className="contributors-manager__photo"
              onClick={() => fileInputs.current[index]?.click()}
              aria-label={`Upload a photo for ${row.name || "this contributor"}`}
            >
              <Avatar size="xl" name={row.name || undefined} src={avatarSrc(row.avatar)} alt="" />
            </button>
            <input
              ref={(el) => (fileInputs.current[index] = el)}
              type="file"
              accept="image/*"
              hidden
              onChange={(event) => {
                void upload(index, event.target.files?.[0]);
                event.target.value = "";
              }}
            />

            <div className="contributors-manager__fields">
              <Input
                label="Name"
                value={row.name}
                onChange={(event) => update(index, { name: event.target.value })}
              />
              <Input
                label="Website"
                type="url"
                value={row.url}
                onChange={(event) => update(index, { url: event.target.value })}
              />
            </div>

            <div className="contributors-manager__row-actions">
              <Button intent="ghost" size="sm" onClick={() => fileInputs.current[index]?.click()}>
                {row.avatar ? "Replace photo" : "Upload photo"}
              </Button>
              {row.avatar && (
                <Button intent="ghost" size="sm" onClick={() => update(index, { avatar: null })}>
                  Remove photo
                </Button>
              )}
              <Button intent="ghost" size="sm" disabled={index === 0} onClick={() => move(index, -1)}>
                Move up
              </Button>
              <Button
                intent="ghost"
                size="sm"
                disabled={index === rows.length - 1}
                onClick={() => move(index, 1)}
              >
                Move down
              </Button>
              <Button intent="destructive-ghost" size="sm" icon="trash-2" onClick={() => remove(index)}>
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
