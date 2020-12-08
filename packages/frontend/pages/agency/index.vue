<template>
  <LandingMessage :role="UserRole.AGENT" />
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { UserRole } from '@/types/user'

@Component({
  name: 'AgencyLanding',
  layout: 'landing',
  auth: false,
})
export default class AgencyLandingPage extends Vue {
  UserRole = UserRole
}
</script>
