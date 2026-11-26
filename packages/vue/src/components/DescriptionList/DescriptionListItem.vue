<!-- One term and its details; the default slot is the details. -->
<script setup lang="ts">
import type { DescriptionListItemProps } from "./DescriptionList.types.js";

defineProps<DescriptionListItemProps>();
</script>

<template>
  <div class="description-list__item">
    <dt class="description-list__term">{{ term }}</dt>
    <dd class="description-list__details"><slot /></dd>
  </div>
</template>
