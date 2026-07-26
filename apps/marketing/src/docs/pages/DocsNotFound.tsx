import { Link } from "react-router-dom";
import { DocsPageHeader, DocsProse } from "../components";

/** A docs URL that doesn't match a component — usually a stale bookmark. */
export function DocsNotFound({ slug }: { slug?: string }) {
  return (
    <>
      <DocsPageHeader eyebrow="Documentation" title="Not found" />
      <DocsProse>
        <p>
          {slug ? (
            <>
              There's no component at <code>/docs/{slug}</code>.
            </>
          ) : (
            <>That documentation page doesn't exist.</>
          )}{" "}
          Pick one from the sidebar, or start at the{" "}
          <Link to="/docs">introduction</Link>.
        </p>
      </DocsProse>
    </>
  );
}
