import type { ComponentType } from "react";
import { TreeView as RTreeView } from "@ui-organized/react";
import TreeViewFixture from "../fixtures/TreeViewFixture.svelte";
import VueTreeViewFixture from "../fixtures/vue/TreeViewFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

/**
 * Every case names the tree.
 *
 * Not decoration: Ark's tree part points `aria-labelledby` at the Label part's
 * id whether or not a Label was rendered, and an unrendered one leaves a
 * reference to an id that was never issued. The contract normalises ids by
 * numbering the ones it finds, so a dangling reference survives as the literal
 * the renderer produced — React's `tree::R0::label` against Svelte's
 * `tree::s1::label` — and reports a difference that is only ever the id scheme.
 *
 * That is the `OMIT_ARIA` failure the normaliser exists to expose, and it is
 * real: an unlabelled tree ships a broken reference in all four libraries
 * alike. It belongs to Ark rather than to any port, so the cases stay on the
 * labelled path rather than allowing `aria-labelledby` — an allowance would
 * also blind the wiring these cases are here to check.
 */
const label = "Files";

const spec: ParitySpec = {
  component: "TreeView",
  react: (p) => <RTreeView {...(p as any)} />,
  svelte: TreeViewFixture as unknown as ComponentType<any>,
  vue: VueTreeViewFixture as unknown as ComponentType<any>,
  cases: (() => {
    // Three levels, so the recursion has to survive more than one hop, and a
    // leaf beside a branch at the top level so `--depth` and `aria-level` are
    // compared at the same depth from two different parents.
    const items = [
      {
        id: "src",
        label: "src",
        children: [
          { id: "app", label: "app.ts" },
          { id: "lib", label: "lib", children: [{ id: "util", label: "util.ts" }] },
        ],
      },
      { id: "readme", label: "README.md" },
    ];
    const flat = [
      { id: "one", label: "One" },
      { id: "two", label: "Two" },
    ];
    return [
      { name: "default", props: { items, label } },
      { name: "flat", props: { items: flat, label } },
      // A collapsed branch still renders its children, hidden — so expansion
      // changes attributes rather than the element list, and both are compared.
      { name: "expanded branch", props: { items, label, defaultExpandedValue: ["src"] } },
      {
        name: "expanded to the leaf",
        props: { items, label, defaultExpandedValue: ["src", "lib"] },
      },
      { name: "selected leaf", props: { items, label, defaultSelectedValue: ["app"] } },
      { name: "selected branch", props: { items, label, defaultSelectedValue: ["src"] } },
      {
        name: "controlled selection",
        props: { items, label, selectedValue: ["readme"] },
      },
      {
        name: "multiple selection",
        props: { items, label, selectionMode: "multiple", defaultSelectedValue: ["app", "readme"] },
      },
      {
        name: "disabled node",
        props: { items: [{ id: "one", label: "One", disabled: true }, ...flat.slice(1)], label },
      },
      // `check` is in the fixtures' stub icon set, so the leaf icon renders
      // rather than matching two absences.
      {
        name: "node icons",
        props: {
          items: [
            { id: "one", label: "One", icon: "check" },
            { id: "folder", label: "Folder", icon: "info", children: [{ id: "two", label: "Two" }] },
          ],
          label,
        },
      },
      { name: "no indent guides", props: { items, label, showIndentGuides: false } },
      ...SIZES.map((size) => ({ name: `size/${size}`, props: { items, label, size } })),
      ...(["default", "bordered"] as const).map((variant) => ({
        name: `variant/${variant}`,
        props: { items, label, variant },
      })),
      { name: "custom class", props: { items, label, className: "mine" } },
    ];
  })(),
  stylesheets: ["TreeView/TreeView.css"],
};

export default spec;
