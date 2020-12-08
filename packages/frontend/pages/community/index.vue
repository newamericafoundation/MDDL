<template>
  <LandingMessage :role="UserRole.CBO" />
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { UserRole } from '@/types/user'

@Component({
  name: 'CommunityLanding',
  layout: 'landing',
  auth: false,
})
export default class CommunityLandingPage extends Vue {
  UserRole = UserRole
}
</script>
