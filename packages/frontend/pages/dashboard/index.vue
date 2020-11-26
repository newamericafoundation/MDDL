<template>
  <ClientDashboard v-if="showClientDashboard" />
  <CboDashboard v-else-if="userStore.role === UserRole.CBO" />
  <AgentDashboard v-else-if="userStore.role === UserRole.AGENT" />
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { userStore, snackbarStore } from '@/plugins/store-accessor'
import SnackParams from '@/types/snackbar'
import ClientDashboard from '@/layouts/dashboard.vue'
import { UserRole } from '@/types/user'
import { capitalize } from '@/assets/js/stringUtils'

@Component({
  layout: 'dashboard',
  head() {
    return {
      title: capitalize(this.$t('tabTitles.dashboard') as string),
    }
  },
})
export default class Documents extends Vue {
  userStore = userStore
  UserRole = UserRole

  mounted() {
    if (this.$route.query.showSnack) {
      snackbarStore.setVisible(true)
    }
    this.$store.dispatch('user/fetchRole')
  }

  get showClientDashboard() {
    return (
      userStore.role === UserRole.CLIENT ||
      (userStore.role === UserRole.CBO && userStore.isActingAsDelegate)
    )
  }
}
</script>
