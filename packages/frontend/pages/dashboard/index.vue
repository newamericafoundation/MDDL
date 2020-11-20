<template>
  <ClientDashboard v-if="showClientDashboard" :toggle-nav="toggleNav" />
  <CboDashboard
    v-else-if="userStore.role === UserRole.CBO"
    :toggle-nav="toggleNav"
  />
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

  toggleNav() {
    this.$parent.$parent.$parent.$data.drawer = !this.$parent.$parent.$parent
      .$data.drawer
  }

  get showClientDashboard() {
    return (
      userStore.role === UserRole.CLIENT ||
      (userStore.role === UserRole.CBO && userStore.isActingAsDelegate)
    )
  }
}
</script>
