<template>
  <div>
    <AppBar>
      <template v-if="userStore.isClient" v-slot:actions>
        <v-btn text class="white--text" :to="localePath('/account')">
          <v-icon left>$cog</v-icon>
          {{ $t('navigation.account') }}
        </v-btn>
        <template v-if="$vuetify.breakpoint.xs">
          <ShareButton class="float-right" />
          <UploadButton
            prepend-icon="$plus"
            class="float-right ml-2"
            @complete="onUpload"
          />
        </template>
      </template>
      <template v-if="$vuetify.breakpoint.smAndUp" v-slot:actionsBeneath>
        <ShareButton class="float-right my-2" />
        <UploadButton
          prepend-icon="$plus"
          class="float-right my-2 ml-2"
          @complete="onUpload"
        />
      </template>
      <template v-slot:extensions>
        <v-tabs
          v-model="currentTab"
          slider-color="primary"
          color="black"
          class="ml-0 white--text"
        >
          <v-tab href="#tab-docs" class="a11y-focus">
            <span>{{ $t('controls.allFiles') }}</span>
          </v-tab>
          <v-tab href="#tab-collections" class="a11y-focus">
            <span>{{ $t('controls.shared') }}</span>
          </v-tab>
        </v-tabs>
      </template>
    </AppBar>
    <v-main>
      <template>
        <v-tabs-items v-model="currentTab">
          <v-tab-item value="tab-docs" tabindex="0">
            <DocumentList ref="documentList" class="mx-sm-8" />
          </v-tab-item>
          <v-tab-item value="tab-collections" tabindex="0">
            <CollectionList class="mx-sm-8" />
          </v-tab-item>
        </v-tabs-items>
      </template>
    </v-main>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'nuxt-property-decorator'
import { userStore } from '@/plugins/store-accessor'

@Component
export default class ClientDashboard extends Vue {
  currentTab = 'tab-docs'
  userStore = userStore

  mounted() {
    if (this.$route.query.tab) {
      this.currentTab = this.$route.query.tab as string
    }
  }

  get extendAppBar() {
    return userStore.isClient && this.$vuetify.breakpoint.smAndUp
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

  onUpload() {
    setTimeout(() => {
      ;(this.$refs.documentList as any).reload()
    }, 1000)
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
