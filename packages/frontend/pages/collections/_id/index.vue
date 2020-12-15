<template>
  <div v-if="loading">
    <v-skeleton-loader
      class="ma-2"
      type="list-item-three-line, image, list-item"
    />
  </div>
  <div v-else class="px-sm-8 pt-8 blue-super-light">
    <AppBar :breadcrumbs="breadcrumbs">
      <template v-if="userStore.isClient" v-slot:actions>
        <v-btn text class="white--text" :to="localePath('/account')">
          <v-icon left>$cog</v-icon>
          {{ $t('navigation.account') }}
        </v-btn>
        <template v-if="$vuetify.breakpoint.xs">
          <ShareButton class="float-right my-2" />
          <UploadButton prepend-icon="$plus" class="float-right ml-2" />
        </template>
      </template>
      <template
        v-if="userStore.isClient && $vuetify.breakpoint.smAndUp"
        v-slot:actionsBeneath
      >
        <ShareButton class="float-right my-2" />
        <UploadButton prepend-icon="$plus" class="float-right ml-2 my-2" />
      </template>
      <template v-slot:extensions>
        <div class="text-heading-2 pa-4">{{ name }}</div>
      </template>
    </AppBar>
    <div v-if="loading">
      <v-skeleton-loader
        class="my-2"
        type="list-item-three-line, image, list-item"
      ></v-skeleton-loader>
    </div>
    <div v-else>
      <template v-if="documents.length">
        <DocumentList
          :fetch-documents="fetchDocuments"
          :owner="sharedCollection ? sharedCollection.owner : null"
        />
        <div v-if="$vuetify.breakpoint.xs && userStore.isAgent" class="pa-4">
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
          {{ $t('sharedFolder.emptyCollection') }}
        </p>
        <nuxt-link
          class="d-flex justify-center nuxt-link"
          :to="localePath('/dashboard')"
        >
          <v-btn text color="primary" class="body-1 font-weight-bold">
            {{ $t('sharedFolder.returnDashboard') }}
          </v-btn>
        </nuxt-link>
      </template>
      <DesktopSideBar>
        <template v-if="userStore.isAgent">
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
        </template>
      </DesktopSideBar>
    </div>
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

  collection: CollectionListItem | null = null
  sharedCollection: SharedCollectionListItem | null = null
  sharer: ApiUser | null
  userStore = userStore

  mounted() {
    this.title = this.$t('tabTitles.shared') as string
    this.fetchDocuments().then((res: DocumentListItem[]) => {
      this.documents = res
      this.loading = false
    })
    this.findCollection()
  }

  fetchDocuments() {
    return this.$store.dispatch(
      'collection/getDocuments',
      this.$route.params.id,
    )
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
        download(v.fileDownload!.href, this.name || 'collection' + '.zip')
        snackbarStore.setVisible(false)
      })
  }

  async findCollection() {
    let collection = (userStore.collections as CollectionListItem[]).find(
      (c) => c.id === this.$route.params.id,
    )
    let sharedCollection: SharedCollectionListItem | undefined
    sharedCollection = ((userStore.sharedCollections as unknown) as SharedCollectionListItem[]).find(
      (c) => c.collection.id === this.$route.params.id,
    )

    if (!collection || !sharedCollection) {
      await this.$store.dispatch('user/getCollections')
      await this.$store.dispatch('user/getSharedCollections')
      collection = (userStore.collections as CollectionListItem[]).find(
        (c) => c.id === this.$route.params.id,
      )
      sharedCollection = ((userStore.sharedCollections as unknown) as SharedCollectionListItem[]).find(
        (c) => c.collection.id === this.$route.params.id,
      )
    }
    if (collection) {
      this.title = collection.name
      this.collection = collection
    }
    if (sharedCollection) {
      this.sharedCollection = sharedCollection
      if (!this.collection) this.title = sharedCollection.collection.name
    }
  }

  get name() {
    if (this.collection) return this.collection.name
    if (this.sharedCollection) return this.sharedCollection.collection.name
    return ''
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
    return this.sharedCollection ? this.sharedCollection.owner.name : ''
  }

  get breadcrumbs() {
    if (this.sharedCollection && this.collection)
      return [
        {
          title: 'navigation.clients',
          to: '/',
        },
        {
          title: this.sharerName,
          to: `/collections/owner/${this.sharedCollection.owner.id}`,
        },
        {
          title: this.collection.name,
        },
      ]
    return []
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
