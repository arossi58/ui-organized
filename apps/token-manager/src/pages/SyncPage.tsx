import { useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogConfirm,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  Badge,
  Button,
  Input,
  PasswordInput,
} from "@ui-organized/react";
import type { ProjectDocument } from "@ui-organized/schema";
import { readProject, commitProject, openPullRequest, diffProjects, type ProjectDiff } from "@ui-organized/token-io";
import { loadProjectDocument, readProjectDocument } from "../yjs/store.js";
import {
  clearConnection,
  getBaseline,
  getClient,
  getRepo,
  getWorkingBranch,
  isConnected,
  setBaseline,
  setRepo,
  setToken,
} from "../github/connection.js";

type Status = { kind: "info" | "success" | "error"; text: string } | null;

export function SyncPage() {
  const [token, setTokenValue] = useState("");
  const [owner, setOwner] = useState("");
  const [repoName, setRepoName] = useState("");
  const [branch, setBranch] = useState("main");
  const [message, setMessage] = useState("Update design tokens");
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);
  const [pr, setPr] = useState<{ number: number; url: string } | null>(null);
  const [diff, setDiff] = useState<ProjectDiff | null>(null);
  const [confirmPR, setConfirmPR] = useState(false);
  const [connected, setConnected] = useState(isConnected());
  const pendingRemote = useRef<ProjectDocument | null>(null);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setStatus(null);
    try {
      await fn();
    } catch (error) {
      setStatus({ kind: "error", text: error instanceof Error ? error.message : String(error) });
    } finally {
      setBusy(false);
    }
  }

  function connectRead() {
    void run(async () => {
      if (!token.trim() || !owner.trim() || !repoName.trim()) {
        setStatus({ kind: "error", text: "Token, owner and repository are required." });
        return;
      }
      setToken(token.trim());
      const ref = { owner: owner.trim(), repo: repoName.trim(), branch: branch.trim() || "main" };
      const client = getClient()!;
      const result = await readProject(client, ref);
      if (!result.ok) {
        if (result.error.message.includes("manifest.json")) {
          setRepo(ref);
          setBaseline(null);
          setConnected(true);
          setStatus({ kind: "info", text: "No tokens in this repo yet — Commit to initialize it." });
          return;
        }
        setStatus({ kind: "error", text: result.error.message });
        return;
      }
      setRepo(ref);
      setBaseline(result.value);
      loadProjectDocument(result.value);
      setConnected(true);
      setStatus({ kind: "success", text: `Loaded ${result.value.sets.length} set(s) from ${ref.owner}/${ref.repo}@${ref.branch}.` });
    });
  }

  function commit() {
    void run(async () => {
      const client = getClient();
      const ref = getRepo();
      if (!client || !ref) return;
      const result = await commitProject(client, ref, readProjectDocument(), {
        workingBranch: getWorkingBranch(),
        message: message.trim() || "Update tokens",
        previous: getBaseline() ?? undefined,
      });
      setBaseline(readProjectDocument());
      setStatus({
        kind: result.changedPaths.length ? "success" : "info",
        text: result.changedPaths.length
          ? `Committed ${result.changedPaths.length} file(s) to ${getWorkingBranch()}.`
          : "No changes to commit.",
      });
    });
  }

  function confirmOpenPR() {
    setConfirmPR(false);
    void run(async () => {
      const client = getClient();
      const ref = getRepo();
      if (!client || !ref) return;
      const result = await openPullRequest(client, ref, {
        workingBranch: getWorkingBranch(),
        title: message.trim() || "Update design tokens",
      });
      setPr(result);
      setStatus({ kind: "success", text: `Opened PR #${result.number}.` });
    });
  }

  function pull() {
    void run(async () => {
      const client = getClient();
      const ref = getRepo();
      if (!client || !ref) return;
      const result = await readProject(client, ref);
      if (!result.ok) {
        setStatus({ kind: "error", text: result.error.message });
        return;
      }
      const d = diffProjects(readProjectDocument(), result.value);
      pendingRemote.current = result.value;
      setDiff(d.hasChanges ? d : null);
      setStatus({ kind: "info", text: d.hasChanges ? "Remote changes found — review below." : "Already up to date." });
    });
  }

  function applyRemote() {
    if (!pendingRemote.current) return;
    loadProjectDocument(pendingRemote.current);
    setBaseline(pendingRemote.current);
    setDiff(null);
    setStatus({ kind: "success", text: "Applied remote changes to the working document." });
  }

  function disconnect() {
    clearConnection();
    setConnected(false);
    setPr(null);
    setDiff(null);
    setStatus({ kind: "info", text: "Disconnected. The token was cleared from memory." });
  }

  return (
    <div className="tm-page-scroll">
      <div className="tm-page-inner">
        <header className="tm-page-head">
          <div>
            <h1 className="tm-page-title">Sync</h1>
            <p className="tm-page-sub">
              Connect a GitHub repo as the canonical store. The token is held in memory only, never
              persisted. Opening a PR is always confirmed and never auto-merged.
            </p>
          </div>
        </header>

        <div className="tm-card">
          <span className="tm-card__title">Connection</span>
          <div className="tm-stack">
            <PasswordInput
              label="Access token (fine-grained PAT)"
              value={token}
              onChange={(e) => setTokenValue(e.target.value)}
              helperText="Scope to the single repo: Contents + Pull requests (read/write)."
              autoComplete="off"
            />
            <div className="tm-grid-fields">
              <Input label="Owner" value={owner} onChange={(e) => setOwner(e.target.value)} spellCheck={false} />
              <Input label="Repository" value={repoName} onChange={(e) => setRepoName(e.target.value)} spellCheck={false} />
              <Input label="Branch" value={branch} onChange={(e) => setBranch(e.target.value)} spellCheck={false} />
            </div>
            <div>
              <Button intent="primary" onClick={connectRead} disabled={busy}>
                {connected ? "Re-read repository" : "Connect & read"}
              </Button>
            </div>
          </div>
        </div>

        {connected && (
          <div className="tm-card">
            <span className="tm-card__title">Working branch &amp; PR</span>
            <div className="tm-stack">
              <Input label="Commit / PR message" value={message} onChange={(e) => setMessage(e.target.value)} />
              <div className="tm-row-controls">
                <Button intent="secondary" onClick={commit} disabled={busy}>
                  Commit to {getWorkingBranch()}
                </Button>
                <Button intent="secondary" onClick={() => setConfirmPR(true)} disabled={busy}>
                  Open PR…
                </Button>
                <Button intent="tertiary" onClick={pull} disabled={busy}>
                  Pull
                </Button>
                <Button intent="ghost" onClick={disconnect} disabled={busy}>
                  Disconnect
                </Button>
              </div>
            </div>
          </div>
        )}

        {status && (
          <Badge variant={status.kind === "error" ? "error" : status.kind === "success" ? "success" : "info"} emphasized={false}>
            {status.text}
          </Badge>
        )}

        {pr && (
          <p className="tm-muted">
            PR #{pr.number}:{" "}
            <a href={pr.url} target="_blank" rel="noreferrer">
              {pr.url}
            </a>
          </p>
        )}

        {diff && (
          <div className="tm-card">
            <span className="tm-card__title">Remote changes</span>
            <div className="tm-stack" style={{ gap: 4 }}>
              {diff.setsAdded.length > 0 && <p className="tm-muted">Added sets: {diff.setsAdded.join(", ")}</p>}
              {diff.setsRemoved.length > 0 && <p className="tm-muted">Removed sets: {diff.setsRemoved.join(", ")}</p>}
              {diff.setsChanged.map((name) => {
                const t = diff.tokens[name]!;
                return (
                  <p key={name} className="tm-muted">
                    {name}: +{t.added.length} / −{t.removed.length} / ~{t.changed.length}
                  </p>
                );
              })}
              {diff.themesOrModesChanged && <p className="tm-muted">Themes/modes changed.</p>}
              <div>
                <Button intent="primary" size="sm" onClick={applyRemote} disabled={busy}>
                  Apply remote to working doc
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={confirmPR} onOpenChange={(o) => !o && setConfirmPR(false)}>
        <AlertDialogContent>
          <AlertDialogTitle>Open a pull request?</AlertDialogTitle>
          <AlertDialogDescription>
            This opens a PR from <strong>{getWorkingBranch()}</strong> into <strong>{getRepo()?.branch}</strong>. It will
            not be merged automatically.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogConfirm onClick={confirmOpenPR}>Open PR</AlertDialogConfirm>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
