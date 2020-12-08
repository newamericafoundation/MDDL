<template>
  <LandingMessage :role="UserRole.CLIENT" />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'
import { UserRole } from '@/types/user'

@Component({
  name: 'ClientLandingPage',
  layout: 'landing',
  auth: false,
  head() {
    return {
      title: this.$t('tabTitles.welcome') as string,
    }
  },
})
export default class ClientLandingPage extends Vue {
  UserRole = UserRole
}
</script>
