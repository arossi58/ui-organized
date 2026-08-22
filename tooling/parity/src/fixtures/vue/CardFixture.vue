<script setup lang="ts">
import { Card, CardHeader, CardBody, CardFooter } from "@ui-organized/vue";
</script>

<template>
  <Card v-bind="$attrs">
    <CardHeader>Header</CardHeader>
    <CardBody>Body</CardBody>
    <CardFooter>Footer</CardFooter>
  </Card>
</template>
