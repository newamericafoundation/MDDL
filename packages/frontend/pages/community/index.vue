<template>
  <LandingMessage />
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component({
  name: 'CommunityLanding',
  layout: 'landing',
  auth: false,
})
export default class CommunityLandingPage extends Vue {}
</script>
