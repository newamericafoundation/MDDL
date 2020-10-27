<template>
  <v-app>
    <AppBar>
      <template v-slot:nav-action>
        <v-btn icon @click="back">
          <v-icon>$chevron-left</v-icon>
        </v-btn>
      </template>
    </AppBar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class DefaultLayout extends Vue {
  back() {
    if (window.history.length) {
      this.$router.back()
    } else {
      this.$router.push(this.localePath('/dashboard'))
    }
  }
}
</script>
