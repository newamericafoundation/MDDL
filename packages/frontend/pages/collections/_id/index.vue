<template>
  <div v-if="loading">
    <v-skeleton-loader
      class="my-2"
      type="list-item-three-line, image, list-item"
    ></v-skeleton-loader>
  </div>
  <div v-else class="main">
    <template v-if="documents.length">
      <DocumentCard
        v-for="(document, i) in documents"
        :key="i"
        :document="document"
        :show-actions="false"
        class="mb-2"
      />
      <div v-if="$vuetify.breakpoint.xs" class="pa-4">
        <v-btn block color="primary" @click="downloadZip">
          <v-icon class="ml-2 mr-4" small left>$folder</v-icon>
          {{ $t('agent.downloadZip') }}
        </v-btn>
        <v-divider class="my-8" />
        <div v-if="sharedCollection" class="px-8">
          <span class="font-weight-bold subtitle-2">
            {{ $t('agent.dateShared') }}
          </span>
          <p class="font-weight-thin subtitle-2 grey-7--text">
            {{ sharedDate }}
          </p>
          <span class="font-weight-bold subtitle-2">
            {{ $t('agent.sharedBy') }}
          </span>
          <p class="font-weight-thin subtitle-2 grey-7--text">
            {{ sharerName }}
          </p>
        </div>
      </div>
    </template>
    <template v-else>
      <p class="d-flex justify-center">
        {{ capitalize($t('sharedFolder.emptyCollection')) }}
      </p>
      <nuxt-link
        class="d-flex justify-center nuxt-link"
        :to="localePath('/dashboard')"
      >
        <v-btn text color="primary" class="body-1 font-weight-bold">
          {{ capitalize($t('sharedFolder.returnDashboard')) }}
        </v-btn>
      </nuxt-link>
    </template>
    <v-navigation-drawer
      v-if="isAgent"
      clipped
      app
      fixed
      right
      mobile-breakpoint="xs"
    >
      <div class="pa-4">
        <v-btn block color="primary" @click="downloadZip">
          <v-icon class="ml-2 mr-4" small left>$folder</v-icon>
          {{ $t('agent.downloadZip') }}
        </v-btn>
        <v-divider class="my-8" />
        <div v-if="sharedCollection" class="px-8">
          <span class="font-weight-bold subtitle-2">
            {{ $t('agent.dateShared') }}
          </span>
          <p class="font-weight-thin subtitle-2 grey-7--text">
            {{ sharedDate }}
          </p>
          <span class="font-weight-bold subtitle-2">
            {{ $t('agent.sharedBy') }}
          </span>
          <p class="font-weight-thin subtitle-2 grey-7--text">
            {{ sharerName }}
          </p>
        </div>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import {
  Collection,
  CollectionListItem,
  DocumentListItem,
  DocumentsDownload,
  DocumentsDownloadStatusEnum,
  SharedCollectionListItem,
  User as ApiUser,
} from 'api-client'
import { userStore, snackbarStore } from '@/plugins/store-accessor'
import { capitalize } from '@/assets/js/stringUtils'
import { UserRole } from '@/types/user'
import download from '@/assets/js/download'
import { format } from 'date-fns'

@Component({
  head() {
    return {
      title: (this as ViewCollection).title,
    }
  },
})
export default class ViewCollection extends Vue {
  loading = true
  documents: DocumentListItem[] = []
  title = ''
  capitalize = capitalize
  collection: CollectionListItem | null = null
  sharedCollection: SharedCollectionListItem | null = null
  sharer: ApiUser | null

  mounted() {
    this.title = this.$t('tabTitles.shared') as string
    this.$store
      .dispatch('collection/getDocuments', this.$route.params.id)
      .then((res: DocumentListItem[]) => {
        this.documents = res
        this.loading = false
      })
    this.findCollection()
  }

  get isAgent() {
    return userStore.role === UserRole.AGENT
  }

  downloadZip() {
    snackbarStore.setParams({
      message: 'toast.downloadLoadingState',
    })
    snackbarStore.setProgress(-1)
    snackbarStore.setVisible(true)

    this.$store
      .dispatch('collection/download', this.$route.params.id)
      .then((v: DocumentsDownload) => {
        download(v.fileDownload!.href, this.collection?.name + '.zip')
        snackbarStore.setVisible(false)
      })
  }

  async findCollection() {
    let collection = (userStore.collections as CollectionListItem[]).find(
      (c) => c.id === this.$route.params.id,
    )
    let sharedCollection: SharedCollectionListItem | undefined
    if (!collection)
      sharedCollection = ((userStore.sharedCollections as unknown) as SharedCollectionListItem[]).find(
        (c) => c.collection.id === this.$route.params.id,
      )

    if (!collection && !sharedCollection) {
      await this.$store.dispatch('user/getCollections')
      await this.$store.dispatch('user/getSharedCollections')
      collection = (userStore.collections as CollectionListItem[]).find(
        (c) => c.id === this.$route.params.id,
      )
      if (!collection)
        sharedCollection = ((userStore.sharedCollections as unknown) as SharedCollectionListItem[]).find(
          (c) => c.collection.id === this.$route.params.id,
        )
    }
    if (collection) {
      this.title = collection.name
      this.collection = collection
    } else if (sharedCollection) {
      this.title = sharedCollection.collection.name
      this.sharedCollection = sharedCollection
    }
  }

  get sharedDate() {
    return this.sharedCollection
      ? format(
          new Date(this.sharedCollection.collection.createdDate),
          'LLL d, yyyy',
        )
      : ''
  }

  get sharerName() {
    return this.sharedCollection
      ? `${this.sharedCollection.owner.givenName} ${this.sharedCollection.owner.familyName}`
      : ''
  }
}
</script>

<style lang="scss">
.container {
  max-width: none !important;
  padding-left: 0;
  padding-right: 0;
}
</style>
