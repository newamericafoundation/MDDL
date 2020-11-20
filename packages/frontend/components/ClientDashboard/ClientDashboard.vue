<template>
  <div>
    <AppBar>
      <template v-slot:nav-action>
        <v-app-bar-nav-icon color="grey-8" @click.stop="toggleNav" />
      </template>
      <template v-slot:actions>
        <UploadButton prepend-icon="$plus" />
        <nuxt-link :to="localePath('/share')" class="nuxt-link">
          <v-btn class="ml-1 text-body-1 font-weight-medium" color="primary">
            <v-icon left small>$send</v-icon>
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
            <CollectionList />
          </v-tab-item>
        </v-tabs-items>
      </template>
    </v-main>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'nuxt-property-decorator'
import { userStore } from '@/plugins/store-accessor'

@Component
export default class ClientDashboard extends Vue {
  @Prop({ required: true }) toggleNav: () => void
  currentTab = 'tab-docs'

  mounted() {
    if (this.$route.query.tab) {
      this.currentTab = this.$route.query.tab as string
    }
  }

  get documents() {
    return userStore.documents
  }

  get collections() {
    return userStore.collections
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
