<template>
  <LandingMessage />
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component({
  name: 'AgencyLanding',
  layout: 'landing',
  auth: false,
})
export default class AgencyLandingPage extends Vue {}
</script>
