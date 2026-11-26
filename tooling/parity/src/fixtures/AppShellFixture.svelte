<script lang="ts">
  import { AppShell, AppHeader, NavItem, Sidebar } from "@ui-organized/svelte";
  // `header` and `sidebar` stand for slot content; see cases/AppShell.tsx.
  let { header, sidebar, ...props }: Record<string, any> = $props();
</script>

{#snippet logoSnippet()}<span class="parity-logo">Acme</span>{/snippet}
{#snippet navSnippet()}<span class="parity-nav">Nav</span>{/snippet}
{#snippet actionsSnippet()}<button type="button">Sign in</button>{/snippet}
{#snippet headerSnippet()}
  <AppHeader
    logo={header.logo ? logoSnippet : undefined}
    nav={header.nav ? navSnippet : undefined}
    actions={header.actions ? actionsSnippet : undefined}
  />
{/snippet}
{#snippet sidebarSnippet()}
  <Sidebar>
    <NavItem label="Reports" />
    <NavItem label="Settings" />
  </Sidebar>
{/snippet}

<AppShell
  {...props}
  header={header ? headerSnippet : undefined}
  sidebar={sidebar ? sidebarSnippet : undefined}
>
  <p>Page</p>
</AppShell>
