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
import { DocumentListItem, SharedCollectionListItem } from 'api-client'
import { format } from 'date-fns'
import { userStore } from '@/plugins/store-accessor'

@Component
export default class ViewCollection extends Vue {
  loading = true
  documents: DocumentListItem[] = []

  mounted() {
    this.$store
      .dispatch('collection/getDocuments', this.$route.params.id)
      .then((res: DocumentListItem[]) => {
        this.documents = res
        this.loading = false
      })
  }
}
</script>

<style scoped lang="scss"></style>
