<template>
  <v-navigation-drawer
    v-if="!$vuetify.breakpoint.xs"
    :value="true"
    clipped
    stateless
    app
    fixed
    right
    class="blue-mid-light"
  >
    <div class="pa-4">
      <slot />
    </div>
    <FooterLinks />
  </v-navigation-drawer>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component
export default class DesktopSideBar extends Vue {}
</script>
