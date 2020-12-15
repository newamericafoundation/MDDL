<template>
  <div>
    <v-progress-circular indeterminate color="primary" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'
import { UserRole } from '@/types/user'
import { userStore } from '../plugins/store-accessor'

@Component({
  name: 'DefaultLandingPage',
  layout: 'landing',
  auth: false,
  head() {
    return {
      title: this.$t('tabTitles.welcome') as string,
    }
  },
})
export default class DefaultLandingPage extends Vue {
  UserRole = UserRole

  mounted() {
    if (!this.$auth.loggedIn) {
      switch (userStore.role) {
        case UserRole.CBO:
          this.$router.push(this.localePath('/community'))
          break
        case UserRole.AGENT:
          this.$router.push(this.localePath('/agency'))
          break
        default:
          this.$router.push(this.localePath('/client'))
          break
      }
    }
  }
}
</script>
