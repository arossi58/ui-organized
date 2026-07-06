import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogConfirm,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  Icon,
  Input,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  Select,
} from "@ui-organized/react";
import type { ThemeSetStatus } from "@ui-organized/schema";
import { addSet, deleteSet, renameSet, reorderSets, setThemeSetStatus, useProjectDocument } from "../yjs/store.js";
import { useSelection } from "../state/SelectionContext.js";

const STATUS_OPTIONS = [
  { value: "enabled", label: "Enabled" },
  { value: "source", label: "Source" },
  { value: "disabled", label: "Disabled" },
];

export function SetsPanel() {
  const doc = useProjectDocument();
  const selection = useSelection();
  const theme = doc.themes.find((t) => t.name === selection.themeName);

  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const [renameName, setRenameName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const setNames = new Set(doc.sets.map((s) => s.name));

  function handleAdd() {
    const name = addName.trim();
    if (!name || setNames.has(name)) return;
    addSet(name);
    selection.setSetName(name);
    setAddName("");
    setAddOpen(false);
  }

  function handleRename() {
    const name = renameName.trim();
    if (!renameTarget || !name || (name !== renameTarget && setNames.has(name))) return;
    renameSet(renameTarget, name);
    if (selection.setName === renameTarget) selection.setSetName(name);
    setRenameTarget(null);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteSet(deleteTarget);
    if (selection.setName === deleteTarget) selection.setSetName("");
    setDeleteTarget(null);
  }

  return (
    <aside className="tm-pane tm-pane--sets">
      <div className="tm-pane__header">
        <span className="tm-pane__heading">Sets</span>
        <Button intent="ghost" size="sm" icon="plus" aria-label="Add set" onClick={() => setAddOpen(true)} />
      </div>

      <div className="tm-pane__scroll">
        <div className="tm-stack" style={{ gap: 4 }}>
          {doc.sets.map((set, index) => (
            <div
              key={set.name}
              className={[
                "tm-set",
                selection.setName === set.name ? "tm-set--active" : "",
                overIndex === index && dragIndex !== null ? "tm-set--dragover" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => {
                e.preventDefault();
                setOverIndex(index);
              }}
              onDrop={() => {
                if (dragIndex !== null) reorderSets(dragIndex, index);
                setDragIndex(null);
                setOverIndex(null);
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
            >
              <span className="tm-set__handle" aria-hidden="true">
                <Icon name="menu" size={14} />
              </span>
              <button
                type="button"
                className="tm-set__name"
                onClick={() => selection.setSetName(set.name)}
                title={set.name}
              >
                {set.name}
              </button>
              <div className="tm-set__status">
                <Select
                  size="sm"
                  variant="ghost"
                  options={STATUS_OPTIONS}
                  value={theme?.selectedTokenSets[set.name] ?? "disabled"}
                  onValueChange={(v) =>
                    theme && setThemeSetStatus(theme.name, set.name, v as ThemeSetStatus)
                  }
                  aria-label={`${set.name} status`}
                />
              </div>
              <Menu>
                <MenuTrigger
                  render={
                    <Button intent="ghost" size="sm" aria-label={`Actions for ${set.name}`}>
                      ⋯
                    </Button>
                  }
                />
                <MenuContent>
                  <MenuItem
                    icon="edit"
                    onSelect={() => {
                      setRenameTarget(set.name);
                      setRenameName(set.name);
                    }}
                  >
                    Rename
                  </MenuItem>
                  <MenuItem icon="trash" destructive onSelect={() => setDeleteTarget(set.name)}>
                    Delete
                  </MenuItem>
                </MenuContent>
              </Menu>
            </div>
          ))}
        </div>
      </div>

      {/* Create */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent size="sm">
          <DialogTitle>New set</DialogTitle>
          <Input
            label="Set name"
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            error={addName.trim() && setNames.has(addName.trim()) ? "A set with that name exists" : undefined}
            autoFocus
          />
          <DialogFooter>
            <DialogClose render={<Button intent="tertiary">Cancel</Button>} />
            <Button intent="primary" onClick={handleAdd}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename */}
      <Dialog open={renameTarget !== null} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent size="sm">
          <DialogTitle>Rename set</DialogTitle>
          <Input
            label="Set name"
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            autoFocus
          />
          <DialogFooter>
            <DialogClose render={<Button intent="tertiary">Cancel</Button>} />
            <Button intent="primary" onClick={handleRename}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete “{deleteTarget}”?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the set and its tokens from the project. This can be undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogConfirm intent="destructive" onClick={handleDelete}>
              Delete
            </AlertDialogConfirm>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}
