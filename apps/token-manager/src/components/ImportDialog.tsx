import { useState } from "react";
import {
  Badge,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  TextArea,
} from "@ui-organized/react";
import type { DtcgGroup, ProjectDocument, Result } from "@ui-organized/schema";
import { importDtcg, importTokensStudio, deserializeProjectDocument } from "@ui-organized/token-io";
import { loadProjectDocument } from "../yjs/store.js";
import { useSelection } from "../state/SelectionContext.js";

/** Auto-detects the pasted format and imports it into a ProjectDocument. */
function detectAndImport(text: string, now: string): Result<ProjectDocument, Error> {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: new Error("Invalid JSON") };
  }
  if (json !== null && typeof json === "object") {
    const obj = json as Record<string, unknown>;
    if ("$metadata" in obj || "$themes" in obj) {
      return importTokensStudio(obj, { createdAt: now, updatedAt: now });
    }
    if ("version" in obj && "sets" in obj && "meta" in obj) {
      return deserializeProjectDocument(text);
    }
  }
  // Otherwise treat it as an arbitrary DTCG token tree (no pack).
  return importDtcg(json as DtcgGroup, { name: "imported", createdAt: now, updatedAt: now });
}

export function ImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const selection = useSelection();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleImport() {
    const result = detectAndImport(text, new Date().toISOString());
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    loadProjectDocument(result.value);
    selection.setSelectedPath(null);
    if (result.value.sets[0]) selection.setSetName(result.value.sets[0].name);
    setText("");
    setError(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogTitle>Import tokens</DialogTitle>
        <DialogDescription>
          Paste a Tokens Studio export, a UI Organized project document, or any DTCG token tree. The
          format is detected automatically. This replaces the current working document.
        </DialogDescription>
        <TextArea
          label="JSON"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={14}
          error={error ?? undefined}
          spellCheck={false}
          placeholder='{ "$metadata": { … }, "$themes": [ … ], "global": { … } }'
        />
        {!error && (
          <Badge variant="info" size="sm" emphasized={false}>
            Tokens Studio · UI Organized · plain DTCG
          </Badge>
        )}
        <DialogFooter>
          <DialogClose render={<Button intent="tertiary">Cancel</Button>} />
          <Button intent="primary" onClick={handleImport} disabled={!text.trim()}>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
