<template>
  <v-main class="blue-super-light">
    <AppBar>
      <template v-if="onSwitchPage" v-slot:actions>
        <v-btn text color="white" :to="manageRoute">
          <v-icon left color="white" small>$cog</v-icon>
          {{ $t('navigation.manageAccounts') }}
        </v-btn>
      </template>
      <template v-slot:extensions>
        <v-row
          no-gutters
          class="white pa-1"
          align="center"
          outlined
          rounded="0"
        >
          <v-col>
            <div class="font-weight-bold grey-9--text pl-3 py-2">
              <template v-if="onSwitchPage">
                <Breadcrumbs :value="breadcrumbs" />
              </template>
              <template v-else>
                {{ closeText[0] }}
                <v-icon small class="grey-9--text">$close-bold</v-icon>
                {{ closeText[1] }}
              </template>
            </div>
          </v-col>
          <v-col
            v-show="!onSwitchPage && $vuetify.breakpoint.smAndUp"
            cols="auto"
          >
            <v-btn
              color="primary"
              class="white--text"
              :to="switchRoute"
              min-height="40px"
            >
              {{ $t('controls.done') }}
            </v-btn>
          </v-col>
        </v-row>
      </template>
    </AppBar>
    <v-window v-model="$route.query.tab">
      <v-window-item value="switch">
        <ClientList />
      </v-window-item>
      <v-window-item value="manage">
        <ClientList :deletable="true" />
      </v-window-item>
    </v-window>
  </v-main>
</template>

<script lang="ts">
import { Vue, Component, mixins } from 'nuxt-property-decorator'
import { userStore } from '@/plugins/store-accessor'
import { RawLocation } from 'vue-router'
import { Breadcrumb } from '@/types/nav'

@Component
export default class CboDashboard extends Vue {
  userStore = userStore

  breadcrumbs: Breadcrumb[] = [
    {
      title: 'navigation.clients',
    },
  ]

  get switchRoute() {
    return this.localeRoute({
      path: '/dashboard',
      query: {
        tab: 'switch',
      },
    })
  }

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
    return this.$route.query.tab !== 'manage'
  }
}
</script>
