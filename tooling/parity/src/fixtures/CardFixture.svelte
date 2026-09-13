<script lang="ts">
  import { Card, CardHeader, CardBody, CardFooter } from "@ui-organized/svelte";
  let { ...props }: Record<string, unknown> = $props();
</script>

<Card {...props}>
  <CardHeader>Header</CardHeader>
  <CardBody>Body</CardBody>
  <CardFooter>Footer</CardFooter>
</Card>
