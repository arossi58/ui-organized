<!--
  Writes the dismiss callback the two ways a consumer would: once as an event
  listener, once as a plain prop.

  A real template rather than an `h()` call, because what is being pinned is the
  *compiler*'s output — `@dismiss` becomes an `onDismiss` key, and the question
  is whether prop resolution routes that key to Alert's declared prop or drops
  it as an unlistened emit.
-->
<script setup lang="ts">
import Alert from "./Alert.vue";

const noop = () => {};
</script>

<template>
  <Alert data-case="listener" @dismiss="noop">Listener</Alert>
  <Alert data-case="prop" :on-dismiss="noop">Prop</Alert>
  <Alert data-case="neither">Neither</Alert>
</template>
