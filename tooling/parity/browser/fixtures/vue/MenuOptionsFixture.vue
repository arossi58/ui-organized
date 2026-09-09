<script setup lang="ts">
import { ref } from "vue";
import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
} from "@ui-organized/vue";

// v-model rather than a static attribute: Vue's radio group takes `modelValue`,
// and the harness needs the group to arrive already holding a value.
const direction = ref("asc");
// The checkbox item reports changes rather than owning them, as in every library.
const columns = ref<Record<string, boolean>>({ name: true, email: false });
</script>

<template>
  <Menu>
    <MenuTrigger>Open</MenuTrigger>
    <MenuContent>
      <MenuGroup>
        <MenuGroupLabel>Columns</MenuGroupLabel>
        <MenuCheckboxItem
          value="name"
          :checked="columns.name"
          @checked-change="columns.name = $event"
          >Name</MenuCheckboxItem
        >
        <MenuCheckboxItem
          value="email"
          :checked="columns.email"
          @checked-change="columns.email = $event"
          >Email</MenuCheckboxItem
        >
      </MenuGroup>
      <MenuRadioGroup v-model="direction">
        <MenuGroupLabel>Direction</MenuGroupLabel>
        <MenuRadioItem value="asc">Ascending</MenuRadioItem>
        <MenuRadioItem value="desc">Descending</MenuRadioItem>
      </MenuRadioGroup>
    </MenuContent>
  </Menu>
</template>
