<template>
  <div>
    <AppBar>
      <template v-slot:nav-action>
        <v-app-bar-nav-icon color="grey8" @click.stop="toggleNav" />
      </template>
      <template v-slot:actions>
        <UploadButton prepend-icon="$plus" />
        <nuxt-link :to="localePath('/share')" class="nuxt-link">
          <v-btn class="ml-1 text-body-1 font-weight-medium" color="primary">
            <v-icon>$send</v-icon>
            {{ $t('controls.share') }}
          </v-btn>
        </nuxt-link>
      </template>
      <template v-slot:extension>
        <v-tabs v-model="currentTab" slider-color="primary" color="#000">
          <v-tab href="#tab-docs">
            <span>{{ $t('controls.allFiles') }}</span>
          </v-tab>
          <v-tab href="#tab-collections">
            <span>{{ $t('controls.shared') }}</span>
          </v-tab>
        </v-tabs>
      </template>
    </AppBar>
    <v-main>
      <template>
        <v-tabs-items v-model="currentTab">
          <v-tab-item value="tab-docs">
            <DocumentList />
          </v-tab-item>
          <v-tab-item value="tab-collections">
            <CollectionList v-model="collections" />
          </v-tab-item>
        </v-tabs-items>
      </template>
    </v-main>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'nuxt-property-decorator'
import { DocumentListItem } from 'api-client'
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
export default class Documents extends Vue {
  currentTab = 'tab-docs'

  mounted() {
    if (this.$route.query.showSnack) {
      snackbarStore.setVisible(true)
    }
    if (this.$route.query.tab) {
      this.currentTab = this.$route.query.tab as string
    }

    this.$store.commit('user/setUserId', this.$auth.user.username)
  }

  get documents() {
    return userStore.documents
  }

  get collections() {
    return userStore.collections
  }

  toggleNav() {
    this.$parent.$parent.$parent.$data.drawer = !this.$parent.$parent.$parent
      .$data.drawer
  }

  @Watch('currentTab')
  onTabChange() {
    this.$router.push({
      path: this.$route.path,
      query: {
        tab: this.currentTab,
      },
    })
  }
}
</script>

<style scoped lang="scss">
#__nuxt {
  .v-main {
    padding-top: 1rem;
  }
  .v-window.v-tabs-items .v-window-item {
    padding: 1rem 0 6rem 0;
    background-color: var(--blue-super-light);
    min-height: 100vh;
  }
}
</style>
