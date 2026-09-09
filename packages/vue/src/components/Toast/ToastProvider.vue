<!--
  Wrap your app once. Trigger toasts imperatively with the manager:

      import { useToastManager } from "@ui-organized/vue";
      const toast = useToastManager();
      toast.add({ title: "Saved", description: "Your changes are live.", type: "success" });
-->
<script setup lang="ts">
import { Toast, Toaster } from "@ark-ui/vue";
import { toastStyles } from "@ui-organized/core";
import Icon from "../Icon/Icon.vue";
import { STATUS_ICON, resolveStatus, toaster } from "./toaster.js";
import "@ui-organized/core/components/Toast/Toast.css";
</script>

<template>
  <slot />
  <Toaster v-slot="toast" :toaster="toaster" class="toast__viewport">
    <Toast.Root :class="toastStyles({ status: resolveStatus(toast.type) })">
      <span class="toast__icon">
        <Icon :name="STATUS_ICON[resolveStatus(toast.type)]" :size="20" />
      </span>
      <div class="toast__content">
        <Toast.Title class="toast__title text-strong-body-medium">{{ toast.title }}</Toast.Title>
        <Toast.Description class="toast__description text-default-body-medium">
          {{ toast.description }}
        </Toast.Description>
      </div>
      <Toast.ActionTrigger
        v-if="toast.action"
        class="toast__action text-emphasis-body-small"
      >
        {{ toast.action?.label }}
      </Toast.ActionTrigger>
      <Toast.CloseTrigger class="toast__close" aria-label="Dismiss">
        <Icon name="close" :size="20" />
      </Toast.CloseTrigger>
    </Toast.Root>
  </Toaster>
</template>
