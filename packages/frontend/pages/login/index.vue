<template>
  <div />
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component
export default class Login extends Vue {
  mounted() {
    this.$auth.loginWith('oauth2')
  }
}
</script>
