<template>
  <div v-if="documents.length">
    <DocumentCard
      v-for="(document, i) in documents"
      :key="i"
      :document="document"
      class="mb-2"
    />
  </div>
  <div v-else>
    <v-skeleton-loader
      class="my-2"
      type="list-item-three-line, image, list-item"
    ></v-skeleton-loader>
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

<style scoped lang="scss"></style>
