<template>
  <v-app-bar fixed app>
    <slot name="nav-action" />
    <template v-if="$vuetify.breakpoint.smAndUp">
      <v-spacer />
      <v-toolbar-title>Data Locker</v-toolbar-title>
    </template>
    <v-spacer />
    <slot name="actions" />
    <template v-slot:extension>
      <slot name="extension" />
    </template>
  </v-app-bar>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component
export default class AppBar extends Vue {}
</script>
