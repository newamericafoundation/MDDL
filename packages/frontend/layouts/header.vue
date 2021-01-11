<template>
  <v-app>
    <v-main class="blue-super-light">
      <v-container>
        <SideNav />
        <nuxt />
      </v-container>
    </v-main>
    <FooterLinks />
    <SnackBar />
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class DefaultLayout extends Vue {}
</script>
