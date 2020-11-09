<template>
  <v-btn icon @click="back">
    <v-icon small>$chevron-left</v-icon>
  </v-btn>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component
export default class BackButton extends Vue {
  back() {
    if (window.history.length) {
      this.$router.back()
    } else {
      this.$router.push(this.localePath('/dashboard'))
    }
  }
}
</script>
