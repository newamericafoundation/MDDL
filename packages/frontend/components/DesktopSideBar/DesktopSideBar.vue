<template>
  <v-navigation-drawer
    :value="true"
    clipped
    app
    fixed
    right
    mobile-breakpoint="xs"
    class="blue-mid-light"
  >
    <div class="pa-4">
      <slot />
    </div>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component
export default class DesktopSideBar extends Vue {}
</script>
