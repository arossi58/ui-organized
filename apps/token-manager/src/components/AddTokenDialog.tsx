import { useState } from "react";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  Input,
  Select,
} from "@ui-organized/react";
import { DTCG_TYPES, type DtcgType } from "@ui-organized/schema";
import { upsertToken, useProjectDocument } from "../yjs/store.js";
import { hasTokenAt, makeToken } from "../lib/dtcgTree.js";
import { useSelection } from "../state/SelectionContext.js";

interface AddTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setName: string;
}

const TYPE_OPTIONS = DTCG_TYPES.map((t) => ({ value: t, label: t }));

export function AddTokenDialog({ open, onOpenChange, setName }: AddTokenDialogProps) {
  const doc = useProjectDocument();
  const selection = useSelection();
  const [path, setPath] = useState("");
  const [type, setType] = useState<DtcgType>("color");

  const set = doc.sets.find((s) => s.name === setName);
  const trimmed = path.trim();
  const exists = set ? hasTokenAt(set.tokens, trimmed) : false;

  function handleCreate() {
    if (!trimmed || exists) return;
    upsertToken(setName, trimmed, makeToken(type));
    selection.setSelectedPath(trimmed);
    selection.setView("list");
    setPath("");
    setType("color");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogTitle>Add token</DialogTitle>
        <DialogDescription>
          Adds a token to “{setName}”. Use dot paths to nest (e.g. <code>color.brand.500</code>).
        </DialogDescription>
        <div className="tm-stack">
          <Input
            label="Token path"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="color.brand.500"
            error={exists ? "A token already exists at this path" : undefined}
            autoFocus
            spellCheck={false}
          />
          <Select
            label="Type"
            options={TYPE_OPTIONS}
            value={type}
            onValueChange={(v) => setType(v as DtcgType)}
          />
        </div>
        <DialogFooter>
          <DialogClose render={<Button intent="tertiary">Cancel</Button>} />
          <Button intent="primary" onClick={handleCreate} disabled={!trimmed || exists}>
            Add token
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
