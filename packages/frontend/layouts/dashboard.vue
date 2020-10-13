<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" fixed temporary>
      <v-list>
        <template v-for="(item, i) in navItems">
          <v-divider v-if="item.type === 'break'" :key="i" />
          <v-list-item
            v-else
            :key="i"
            :to="item.to"
            router
            exact
            @click.stop="item.click"
          >
            <v-list-item-action v-if="item.icon">
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title v-text="item.title" />
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
        <UploadButton />
      </template>
    </AppBar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class ClientDashboard extends Vue {
  drawer = false
  navItems = [
    {
      title: 'All files',
      to: '/',
    },
    {
      type: 'break',
    },
    {
      title: 'Account',
      to: '/account',
    },
    {
      title: 'Sign out',
      click: async () => {
        await this.$auth.logout()
        this.$router.push('/')
      },
    },
  ]
}
</script>
