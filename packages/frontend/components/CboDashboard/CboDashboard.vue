<template>
  <v-main class="blue-super-light">
    <AppBar>
      <template v-slot:extensions>
        <v-row no-gutters class="nav-message" outlined rounded="0">
          <v-col>
            <div class="pa-3 font-weight-medium grey-9--text">
              <template v-if="onSwitchPage">
                {{ $t('cbo.selectClient') }}
              </template>
              <template v-else>
                {{ closeText[0] }}
                <v-icon small>$close</v-icon>
                {{ closeText[1] }}
              </template>
            </div>
          </v-col>
          <v-col v-show="$vuetify.breakpoint.smAndUp" cols="auto">
            <v-btn v-if="onSwitchPage" text color="primary" :to="manageRoute">
              <v-icon left color="primary" small>$cog</v-icon>
              {{ $t('navigation.manageAccounts') }}
            </v-btn>
            <SwitchAccountButton v-else color="primary" />
          </v-col>
        </v-row>
      </template>
    </AppBar>
    <v-window v-model="$route.query.tab">
      <v-window-item value="switch">
        <ClientList />
      </v-window-item>
      <v-window-item value="manage">
        <ClientList :deletable="true">
          <v-divider class="full-width" />
        </ClientList>
      </v-window-item>
    </v-window>
  </v-main>
</template>

<script lang="ts">
import { Vue, Component, mixins } from 'nuxt-property-decorator'
import { userStore } from '@/plugins/store-accessor'
import { RawLocation } from 'vue-router'

@Component
export default class CboDashboard extends Vue {
  userStore = userStore

  get manageRoute() {
    return this.localeRoute({
      path: '/dashboard',
      query: {
        tab: 'manage',
      },
    })
  }

  get closeText() {
    return (this.$t('cbo.clickToRemove') as string).split('{close}')
  }

  get onSwitchPage() {
    return this.$route.query.tab === 'switch'
  }
}
</script>

<style lang="scss" scoped>
.nav-message {
  border-bottom: 1pt solid var(--grey-4);
  background-color: white !important;
}
</style>
