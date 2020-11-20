<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" fixed temporary>
      <NavItemList :items="navItems" />
      <v-footer fixed class="pa-0">
        <div v-if="$config.showBuildInfo" class="px-4 mt-4">
          <p>
            <span class="font-weight-bold">Build number:</span>
            {{ $config.buildNumber }}
          </p>
          <span class="font-weight-bold">Build time:</span>
          {{ format(new Date($config.buildTime), 'd/M/y h:mma') }}
        </div>
        <NavItemList :items="footerNavItems" />
      </v-footer>
    </v-navigation-drawer>
    <nuxt />
    <SnackBar />
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { format } from 'date-fns'
import { userStore } from '@/plugins/store-accessor'
import { UserRole } from '@/types/user'
import { NavItem } from '@/types/nav'
import { RawLocation } from 'vue-router'

@Component
export default class DashboardLayout extends Vue {
  drawer = false
  format = format
  numDelegatedClients = 0

  activityNavItem: NavItem = {
    label: 'navigation.activity',
    to: '/activity',
    icon: '$clock',
  }

  clientNavItems: NavItem[] = [
    {
      label: 'navigation.account',
      to: '/account',
      icon: '$cog',
    },
    this.activityNavItem,
    {
      divider: true,
    },
  ]

  footerNavItems: NavItem[] = [
    {
      divider: true,
    },
    {
      label: 'navigation.signOut',
      icon: '$sign-out',
      click: this.logOut,
    },
  ]

  async mounted() {
    if (this.$route.params.showSnack) {
      this.$store.dispatch('snackbar/show')
    }
    await this.$store.dispatch('user/fetchRole')
    if (userStore.role === UserRole.CBO) {
      const delegatedClients = await this.$store.dispatch(
        'user/fetchDelegatedClients',
      )
      this.numDelegatedClients = delegatedClients.length
    }
  }

  get cboNavItems() {
    return ([] as NavItem[])
      .concat(userStore.isActingAsDelegate ? [this.activityNavItem] : [])
      .concat(
        this.numDelegatedClients > 0
          ? [
              {
                label: 'navigation.switchAccount',
                click: () => {
                  userStore.clearOwnerId()
                  this.drawer = false
                  this.$router.push(
                    this.localeRoute({
                      path: '/dashboard',
                      query: {
                        tab: 'switch',
                      },
                    }) as RawLocation,
                  )
                },
                icon: '$switch-account',
              },
              {
                label: 'navigation.manageAccounts',
                click: () => {
                  userStore.clearOwnerId()
                  this.drawer = false
                  this.$router.push(
                    this.localeRoute({
                      path: '/dashboard',
                      query: {
                        tab: 'manage',
                      },
                    }) as RawLocation,
                  )
                },
                icon: '$cog',
              },
            ]
          : [],
      )
  }

  get navItems() {
    switch (userStore.role) {
      case UserRole.CBO:
        return this.cboNavItems

      case UserRole.AGENT:
        return [] // TODO

      default:
        // UserRole.CLIENT
        return this.clientNavItems
    }
  }

  async logOut() {
    await this.$auth.logout()
    this.$router.push('/')
  }
}
</script>

<style scoped lang="scss">
.dashboardLink {
  padding-bottom: rem(7px);
}
</style>
