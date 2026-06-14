import { describe, expect, it } from "vitest";
import { type RoadmapData, isRoadmapEmpty, timeAgo } from "./roadmap";

const AT = Date.parse("2026-06-11T12:00:00Z");

describe("timeAgo", () => {
  it("reads under a minute as 'just now'", () => {
    expect(timeAgo("2026-06-11T11:59:30Z", AT)).toBe("just now");
  });

  it("pluralises minutes, hours, and days", () => {
    expect(timeAgo("2026-06-11T11:59:00Z", AT)).toBe("1 min ago");
    expect(timeAgo("2026-06-11T11:56:00Z", AT)).toBe("4 mins ago");
    expect(timeAgo("2026-06-11T11:00:00Z", AT)).toBe("1 hour ago");
    expect(timeAgo("2026-06-11T09:00:00Z", AT)).toBe("3 hours ago");
    expect(timeAgo("2026-06-10T12:00:00Z", AT)).toBe("1 day ago");
    expect(timeAgo("2026-06-08T12:00:00Z", AT)).toBe("3 days ago");
  });

  it("clamps a future timestamp to 'just now' and never throws", () => {
    expect(timeAgo("2026-06-11T12:05:00Z", AT)).toBe("just now");
    expect(timeAgo("not a date", AT)).toBe("unknown");
  });
});

describe("isRoadmapEmpty", () => {
  const base: RoadmapData = {
    syncedAt: "2026-06-11T12:00:00Z",
    projectUrl: "https://github.com/orgs/x/projects/1",
    doneOverflowUrl: "https://github.com/orgs/x/projects/1",
    columns: [
      { id: "backlog", title: "Backlog", items: [] },
      { id: "in-progress", title: "In progress", items: [] },
      { id: "done", title: "Done", items: [] },
    ],
  };

  it("is empty for null and for all-empty columns", () => {
    expect(isRoadmapEmpty(null)).toBe(true);
    expect(isRoadmapEmpty(base)).toBe(true);
  });

  it("is not empty once any column has a card", () => {
    const data: RoadmapData = {
      ...base,
      columns: base.columns.map((c) =>
        c.id === "backlog"
          ? { ...c, items: [{ id: "1", title: "T", type: "design", url: null, labels: [] }] }
          : c,
      ),
    };
    expect(isRoadmapEmpty(data)).toBe(false);
  });
});
