// Imported only for its side effects: every component stylesheet, in cascade
// order, bundled by esbuild into `dist/styles.css`.
//
// Order matters and is not alphabetical — it mirrors the order the React
// package's barrel imports them, so a rule that wins on source order there wins
// here too. See tsup.config.ts.
export {};
