import { GeneratorsPanel } from "../components/GeneratorsPanel.js";

export function GeneratorsPage() {
  return (
    <div className="tm-page-scroll">
      <div className="tm-page-inner">
        <header className="tm-page-head">
          <div>
            <h1 className="tm-page-title">Generators</h1>
            <p className="tm-page-sub">
              Generate an opinionated foundation as plain DTCG you own. Regenerating reconciles your
              overrides non-destructively.
            </p>
          </div>
        </header>
        <GeneratorsPanel />
      </div>
    </div>
  );
}
