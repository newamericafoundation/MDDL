<template>
  <v-app-bar fixed app>
    <slot name="nav-action" />
    <template v-if="$vuetify.breakpoint.smAndUp">
      <v-spacer />
    </template>
    <v-spacer />
    <slot name="actions" />
    <template v-if="!!this.$slots.extension" v-slot:extension>
      <slot name="extension" />
    </template>
  </v-app-bar>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component
export default class AppBar extends Vue {}
</script>
