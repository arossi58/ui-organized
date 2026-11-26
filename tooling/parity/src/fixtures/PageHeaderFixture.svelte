<script lang="ts">
  import { PageHeader } from "@ui-organized/svelte";
  // The `with*` flags stand for the slots; see cases/PageHeader.tsx.
  let { withBreadcrumbs, withActions, withTabs, ...props }: Record<string, any> = $props();
</script>

{#snippet crumbs()}<a href="/">Home</a>{/snippet}
{#snippet actions()}<button type="button">Edit</button>{/snippet}
{#snippet tabs()}<div>Overview</div>{/snippet}

<PageHeader
  {...(props as any)}
  breadcrumbs={withBreadcrumbs ? crumbs : undefined}
  actions={withActions ? actions : undefined}
  tabs={withTabs ? tabs : undefined}
/>
