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
              {{ $t('dashboard') }}
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
            <v-list-item
              router
              exact
              @click.stop="item.click ? item.click : ''"
            >
              <v-list-item-action v-if="item.icon">
                <v-icon>{{ item.icon }}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title class="capitalize" v-text="item.title" />
              </v-list-item-content>
            </v-list-item>
          </nuxt-link>
          <v-list-item
            v-else
            :key="i"
            router
            exact
            @click.stop="item.click ? item.click : ''"
          >
            <v-list-item-action v-if="item.icon">
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title class="capitalize" v-text="item.title" />
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>
    <AppBar>
      <template v-slot:nav-action>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      </template>
      <template v-slot:actions>
        <UploadButton prepend-icon="$plus" />
        <nuxt-link :to="localePath('/share')" class="nuxt-link">
          <v-btn class="ml-4 text-body-1 font-weight-medium" color="primary">
            <v-icon>$send</v-icon>
            {{ $t('share') }}
          </v-btn>
        </nuxt-link>
      </template>
    </AppBar>
    <v-main>
      <v-container class="px-0">
        <nuxt />
      </v-container>
    </v-main>
    <SnackBar />
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class ClientDashboard extends Vue {
  drawer = false

  navItems = [
    {
      type: 'break',
    },
    {
      title: this.$i18n.t('account'),
      to: '/account',
    },
    {
      title: this.$i18n.t('signOut'),
      click: async () => {
        await this.$auth.logout()
        this.$router.push('/')
      },
    },
  ]

  mounted() {
    if (this.$route.params.showSnack) {
      this.$store.dispatch('snackbar/show')
    }
  }
}
</script>

<style scoped lang="scss">
.dashboardLink {
  padding-bottom: 7px;
}
</style>
