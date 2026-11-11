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
} from "@ui-organized/react";
import { useBuilderStore } from "../state/themeState";
import { buildThemeTokens } from "../utils/buildConfig";
import {
  deleteSavedTheme,
  saveTheme,
  useSavedThemes,
  type SavedTheme,
} from "../utils/savedThemes";
import styles from "./SavedThemes.module.css";

const SAVED_AT = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

/**
 * Save the theme in this browser and pick it back up later. Saved as the same
 * token tree `theme.json` exports, under the theme's name; saving again under
 * that name updates it.
 */
export function SavedThemes() {
  const state = useBuilderStore();
  const saved = useSavedThemes();
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [deleting, setDeleting] = useState<SavedTheme | null>(null);

  function handleSave() {
    const result = saveTheme(state.themeName, buildThemeTokens(state));
    setMessage(
      result.ok
        ? { tone: "ok", text: `${result.replaced ? "Updated" : "Saved"} “${result.theme.name}”.` }
        : { tone: "error", text: result.error },
    );
  }

  function handleLoad(entry: SavedTheme) {
    state.loadFromThemeJson(entry.theme);
    setMessage({ tone: "ok", text: `Loaded “${entry.name}”.` });
  }

  function handleDelete(entry: SavedTheme) {
    const error = deleteSavedTheme(entry.id);
    setMessage(error ? { tone: "error", text: error } : { tone: "ok", text: `Deleted “${entry.name}”.` });
  }

  return (
    <section className={styles.section}>
      <Button size="sm" intent="secondary" icon="bookmark" onClick={handleSave}>
        Save to browser
      </Button>

      {/* One live region for every outcome. Confirmations ("Saved", "Loaded")
          are announced but not shown — the list changing says it on screen. An
          error is shown too: a save the browser refused is otherwise silent. */}
      <p
        className={message?.tone === "error" ? styles.error : styles.srOnly}
        role="status"
        aria-live="polite"
      >
        {message?.text}
      </p>

      {saved.length > 0 && (
        <ul className={styles.list} aria-label="Saved themes">
          {saved.map((entry) => (
            <li key={entry.id} className={styles.item}>
              <div className={styles.meta}>
                <span className={styles.name}>{entry.name}</span>
                <span className={styles.date}>{SAVED_AT.format(entry.savedAt)}</span>
              </div>
              <Button
                size="sm"
                intent="ghost"
                aria-label={`Load ${entry.name}`}
                onClick={() => handleLoad(entry)}
              >
                Load
              </Button>
              <Button
                size="sm"
                intent="destructive-ghost"
                icon="trash-2"
                aria-label={`Delete ${entry.name}`}
                onClick={() => setDeleting(entry)}
              />
            </li>
          ))}
        </ul>
      )}

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete “{deleting?.name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            It is saved only in this browser, so it can’t be recovered once deleted.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogConfirm
              intent="destructive"
              onClick={() => {
                if (deleting) handleDelete(deleting);
                setDeleting(null);
              }}
            >
              Delete
            </AlertDialogConfirm>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
