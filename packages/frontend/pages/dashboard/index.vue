<template>
  <ClientDashboard v-if="showClientDashboard" />
  <CboDashboard v-else-if="userStore.isCbo" />
  <AgentDashboard v-else-if="userStore.isAgent" />
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { userStore, snackbarStore } from '@/plugins/store-accessor'
import SnackParams from '@/types/snackbar'
import ClientDashboard from '@/layouts/dashboard.vue'
import { capitalize } from '@/assets/js/stringUtils'

@Component({
  layout: 'dashboard',
  head() {
    return {
      title: capitalize(this.$t('tabTitles.dashboard') as string),
    }
  },
})
export default class DashboardPage extends Vue {
  userStore = userStore

  mounted() {
    if (this.$route.query.showSnack) {
      snackbarStore.setVisible(true)
    }
    this.$store.dispatch('user/fetchRole')
  }

  get showClientDashboard() {
    return (
      userStore.isClient || (userStore.isCbo && userStore.isActingAsDelegate)
    )
  }
}
</script>
