/**
 * The hero mockup's table fixture, and the column set the live table renders.
 * Deterministic rather than random, so the page reads the same on every visit.
 */

import { Input, Tag } from "@ui-organized/react";
import type { TableColumn } from "@ui-organized/react-table";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  team: string;
  status: "active" | "invited" | "suspended";
  seats: number;
  joined: string;
  location: string;
  plan: "Free" | "Pro" | "Enterprise";
  lastActive: string;
}

const ROLES = ["Owner", "Admin", "Engineer", "Designer", "Analyst"];
const TEAMS = ["Platform", "Growth", "Design", "Data", "Support"];
const STATUSES: Member["status"][] = ["active", "invited", "suspended"];
/** The crew, the family, and the people who had to deal with them. */
const NAMES = [
  "Tony Soprano",
  "Carmela Soprano",
  "Christopher Moltisanti",
  "Paulie Gualtieri",
  "Silvio Dante",
  "Meadow Soprano",
  "A.J. Soprano",
  "Adriana La Cerva",
  "Bobby Baccalieri",
  "Janice Soprano",
  "Corrado Soprano",
  "Livia Soprano",
  "Jennifer Melfi",
  "Sal Bonpensiero",
  "Johnny Sacrimoni",
  "Phil Leotardo",
  "Ralph Cifaretto",
  "Richie Aprile",
  "Furio Giunta",
  "Vito Spatafore",
  "Artie Bucco",
  "Charmaine Bucco",
  "Rosalie Aprile",
  "Patsy Parisi",
  "Benny Fazio",
  "Hesh Rabkin",
  "Gabriella Dante",
  "Feech La Manna",
  "Tony Blundetto",
  "Carlo Gervasi",
  "Eugene Pontecorvo",
  "Carmine Lupertazzi",
  "Irina Peltsin",
  "Gloria Trillo",
  "Elliot Kupferberg",
  "Phil Intintola",
];

/** "A.J. Soprano" → "aj.soprano" */
function emailFor(name: string): string {
  const [first, ...rest] = name.toLowerCase().replace(/[^a-z ]/g, "").split(" ");
  return `${first}.${rest.join("")}@example.com`;
}
const LOCATIONS = ["London", "New York", "Berlin", "Toronto", "Tokyo", "Lisbon", "Sydney"];
const PLANS: Member["plan"][] = ["Pro", "Free", "Enterprise", "Pro"];

export const MEMBERS: Member[] = NAMES.map((name, index) => ({
  id: `m-${index}`,
  name,
  email: emailFor(name),
  role: ROLES[index % ROLES.length]!,
  team: TEAMS[(index * 2) % TEAMS.length]!,
  status: STATUSES[index % STATUSES.length]!,
  seats: 1 + ((index * 7) % 12),
  joined: `20${20 + (index % 5)}-0${1 + (index % 9)}-1${index % 10}`,
  location: LOCATIONS[(index * 5) % LOCATIONS.length]!,
  plan: PLANS[index % PLANS.length]!,
  lastActive: `2026-${String(1 + ((index * 5) % 10)).padStart(2, "0")}-${String(1 + ((index * 11) % 28)).padStart(2, "0")}`,
}));

const STATUS_VARIANT: Record<Member["status"], "success" | "info" | "error"> = {
  active: "success",
  invited: "info",
  suspended: "error",
};

export const MEMBER_COLUMNS: TableColumn<Member>[] = [
  {
    accessorKey: "name",
    header: "Name",
    meta: { primary: true, width: 190, filter: true },
  },
  { accessorKey: "email", header: "Email", meta: { width: 290 } },
  { accessorKey: "role", header: "Role", meta: { width: 130, filter: { type: "enum" } } },
  { accessorKey: "team", header: "Team", meta: { width: 130, priority: 1, filter: { type: "enum" } } },
  {
    accessorKey: "status",
    header: "Status",
    meta: { width: 130, filter: { type: "enum" } },
    cell: ({ getValue }) => {
      const status = getValue<Member["status"]>();
      // Not emphasized: the solid Tag label is a known AA contrast gap, and a
      // table would multiply it.
      return (
        <Tag variant={STATUS_VARIANT[status]} size="sm" emphasized={false}>
          {status}
        </Tag>
      );
    },
  },
  {
    accessorKey: "seats",
    header: "Seats",
    meta: {
      align: "end",
      width: 100,
      filter: true,
      edit: {
        render: ({ value, setValue, commit, cancel, size }) => (
          <Input
            size={size}
            type="number"
            aria-label="Seats"
            value={String(value ?? "")}
            onChange={(event) => setValue(Number(event.target.value))}
            onBlur={commit}
            onKeyDown={(event) => event.key === "Escape" && cancel()}
          />
        ),
        validate: (value) =>
          typeof value === "number" && value > 0 ? null : "Seats must be at least 1",
      },
    },
  },
  { accessorKey: "joined", header: "Joined", meta: { width: 130, filter: true } },
  { accessorKey: "location", header: "Location", meta: { width: 140, filter: { type: "enum" } } },
  { accessorKey: "plan", header: "Plan", meta: { width: 120, filter: { type: "enum" } } },
  { accessorKey: "lastActive", header: "Last active", meta: { width: 140, filter: true } },
];
