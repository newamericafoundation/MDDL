<template>
  <v-app-bar fixed app>
    <slot name="nav-action" />
    <v-spacer />
    <slot name="actions" />
  </v-app-bar>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component
export default class AppBar extends Vue {}
</script>

<style scoped lang="scss"></style>
