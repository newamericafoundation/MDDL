<template>
  <LandingMessage />
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component({
  name: 'ClientLanding',
  layout: 'landing',
  auth: false,
  head() {
    return {
      title: this.$t('tabTitles.welcome') as string,
    }
  },
})
export default class ClientLandingPage extends Vue {}
</script>
