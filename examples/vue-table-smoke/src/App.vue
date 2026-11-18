<!--
  Get Started's App and IconProvider snippets, with the data table this gate
  renders. Unlike main.ts this file is not copied verbatim; `pnpm typecheck`
  holds the props the docs show to the library's real types.
-->
<script setup lang="ts">
import { Button, Card, IconProvider, Input } from "@ui-organized/vue";
import { DataTable, type TableColumn } from "@ui-organized/vue-table";

interface Member {
  id: string;
  name: string;
  role: string;
  seats: number;
}

/** Small enough that virtualization stays off — this gate is about the build. */
const ROWS: Member[] = [
  { id: "1", name: "Ada Lovelace", role: "Engineer", seats: 3 },
  { id: "2", name: "Grace Hopper", role: "Admin", seats: 1 },
  { id: "3", name: "Alan Turing", role: "Engineer", seats: 7 },
  { id: "4", name: "Katherine Johnson", role: "Analyst", seats: 2 },
];

const COLUMNS: TableColumn<Member>[] = [
  { accessorKey: "name", header: "Name", meta: { primary: true } },
  { accessorKey: "role", header: "Role" },
  { accessorKey: "seats", header: "Seats", meta: { align: "end" } },
];

const rowId = (row: Member) => row.id;
</script>

<template>
  <!-- icon-style, not style: Vue reserves `style` for inline CSS -->
  <IconProvider
    library="lucide"
    icon-style="outline"
    stroke-adjustment
    :base-size="24"
    :base-stroke="2"
  >
    <Card>
      <Input label="Email" placeholder="you@example.com" />
      <Button intent="primary">Save</Button>
    </Card>

    <Button icon="refresh-cw">Reload</Button>

    <main>
      <DataTable
        label="Team members"
        :columns="COLUMNS"
        :data="ROWS"
        :get-row-id="rowId"
        selection="multiple"
      />
    </main>
  </IconProvider>
</template>
