<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" fixed temporary>
      <v-list>
        <v-list-item
          class="dashboardLink"
          @click.stop="
            () => {
              if ($route.path !== '/dashboard') {
                $router.push('/dashboard')
              } else {
                drawer = !drawer
              }
            }
          "
        >
          <v-list-item-content>
            <v-list-item-title class="capitalize">
              {{ $t('navigation.dashboard') }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <template v-for="(item, i) in navItems">
          <v-divider v-if="item.type === 'break'" :key="i" />
          <nuxt-link
            v-else-if="item.to"
            :key="i"
            class="nuxt-link"
            :to="localePath(item.to)"
          >
            <v-list-item router exact>
              <v-list-item-action v-if="item.icon" class="mr-4">
                <v-icon color="primary">{{ item.icon }}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title class="capitalize" v-text="$t(item.title)" />
              </v-list-item-content>
            </v-list-item>
          </nuxt-link>
          <v-list-item
            v-else-if="item.click !== null"
            :key="i"
            @click.stop="item.click"
          >
            <v-list-item-action v-if="item.icon" class="mr-4">
              <v-icon color="primary">{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title class="capitalize" v-text="$t(item.title)" />
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
      <v-footer fixed>
        <v-divider class="full-width" />
        <template v-if="$config.showBuildInfo">
          <p>
            <span class="font-weight-bold">Build number:</span>
            {{ $config.buildNumber }}
          </p>
          <p>
            <span class="font-weight-bold">Build time:</span>
            {{ format(new Date($config.buildTime), 'd/M/y h:mma') }}
          </p>
        </template>
        <v-list>
          <v-list-item @click.stop="logOut">
            <v-list-item-action>
              <v-icon color="primary">$sign-out</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title
                class="capitalize"
                v-text="$t('navigation.signOut')"
              />
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-footer>
    </v-navigation-drawer>
    <nuxt />
    <SnackBar />
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { format } from 'date-fns'

@Component
export default class ClientDashboard extends Vue {
  drawer = false
  format = format

  navItems = [
    {
      type: 'break',
    },
    {
      title: 'navigation.account',
      to: '/account',
      icon: '$cog',
    },
    // TODO: uncomment when implementing account activity
    // {
    //   title: 'navigation.activity',
    //   to: '/activity',
    //   icon: '$clock',
    // },
  ]

  mounted() {
    if (this.$route.params.showSnack) {
      this.$store.dispatch('snackbar/show')
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
