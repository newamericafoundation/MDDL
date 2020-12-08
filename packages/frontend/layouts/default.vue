<template>
  <v-app>
    <AppBar :empty="true">
      <template v-slot:nav-action>
        <BackButton tabindex="0" />
      </template>
    </AppBar>
    <v-main class="blue-super-light">
      <v-container>
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
