<template>
  <div />
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component
export default class Logout extends Vue {
  mounted() {
    localStorage.clear()
    this.$auth.logout()
  }
}
</script>
