<template>
  <div>
    <AppBar :breadcrumbs="breadcrumbs">
      <template v-if="showActions" v-slot:actions>
        <v-btn
          v-if="$vuetify.breakpoint.smAndUp"
          text
          class="white--text"
          :to="localePath('/account')"
        >
          <v-icon left>$cog</v-icon>
          {{ $t('navigation.account') }}
        </v-btn>
        <template v-if="$vuetify.breakpoint.xs">
          <UploadButton prepend-icon="$plus" @complete="onUpload" />
          <ShareButton class="ml-2 mr-1" />
        </template>
      </template>
      <template v-slot:extensions>
        <v-divider v-if="breadcrumbs.length" class="my-0" />
        <div class="d-flex justify-space-between align-end">
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
          <div v-if="$vuetify.breakpoint.smAndUp" class="d-flex">
            <UploadButton
              prepend-icon="$plus"
              class="my-2"
              @complete="onUpload"
            />
            <ShareButton class="ma-2" />
          </div>
        </div>
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
import { Breadcrumb } from '@/types/nav'
import { DelegatedClient } from '@/types/delegate'

@Component
export default class ClientDashboard extends Vue {
  currentTab = 'tab-docs'
  userStore = userStore
  delegatedClient: DelegatedClient | null = null

  async mounted() {
    if (this.$route.query.tab) {
      this.currentTab = this.$route.query.tab as string
    }
    if (userStore.isCbo && userStore.isActingAsDelegate) {
      this.delegatedClient = await userStore.fetchImpersonatedDelegate()
    }
  }

  get breadcrumbs(): Breadcrumb[] {
    if (this.delegatedClient) {
      return [
        {
          title: 'navigation.clients',
          click: () => {
            userStore.clearOwnerId()
            this.$router.push('/dashboard')
          },
        },
        {
          title: this.delegatedClient.allowsAccessToUser.name,
        },
      ]
    }
    return []
  }

  get showActions(): Boolean {
    return userStore.isClient || userStore.isCbo
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
    setTimeout(() => {
      ;(this.$refs.documentList as any).reload()
    }, 8000)
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
