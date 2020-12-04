<template>
  <v-lazy height="100" width="100" class="ma-4">
    <img
      v-if="thumbnail"
      :alt="`${$t('document.thumbnailOf')} ${document.name}`"
      max-height="112"
      max-width="112"
      contain
      style="border-radius: 0.4rem"
      :src="thumbnail"
    />
    <v-skeleton-loader
      v-else
      type="image"
      height="100"
      width="100"
    ></v-skeleton-loader>
  </v-lazy>
</template>

<script lang="ts">
import { DocumentListItem } from 'api-client'
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component
export default class DocumentThumbnail extends Vue {
  @Prop({ required: true }) document: DocumentListItem
  get thumbnail() {
    return (
      this.document &&
      this.document.links.find((l) => l.rel === 'thumbnail')?.href
    )
  }
}
</script>
