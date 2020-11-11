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
    </template>
    <template v-else>
      <p class="d-flex justify-center">
        {{ capitalize($t('emptyCollection')) }}
      </p>
      <nuxt-link
        class="d-flex justify-center nuxt-link"
        :to="localePath('/dashboard')"
      >
        <v-btn text color="primary" class="body-1 font-weight-bold">
          {{ capitalize($t('returnDashboard')) }}
        </v-btn>
      </nuxt-link>
    </template>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import {
  CollectionListItem,
  DocumentListItem,
  SharedCollectionListItem,
} from 'api-client'
import { userStore } from '@/plugins/store-accessor'
import { capitalize } from '@/assets/js/stringUtils'

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

  mounted() {
    this.title = this.$t('shared') as string
    this.$store
      .dispatch('collection/getDocuments', this.$route.params.id)
      .then((res: DocumentListItem[]) => {
        this.documents = res
        this.loading = false
      })
    const collection = (userStore.collections as CollectionListItem[]).find(
      c => c.id === this.$route.params.id,
    )
    if (collection) {
      this.title = collection.name
    }
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
