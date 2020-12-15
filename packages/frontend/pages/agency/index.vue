<template>
  <LandingMessage />
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component({
  name: 'AgencyLanding',
  layout: 'landing',
  auth: false,
  head() {
    return {
      title: this.$t('tabTitles.welcome') as string,
    }
  },
})
export default class AgencyLandingPage extends Vue {}
</script>
