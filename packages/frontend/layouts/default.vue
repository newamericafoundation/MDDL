<template>
  <v-app>
    <AppBar>
      <template v-slot:nav-action>
        <BackButton />
      </template>
    </AppBar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
    <SnackBar />
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class DefaultLayout extends Vue {}
</script>
