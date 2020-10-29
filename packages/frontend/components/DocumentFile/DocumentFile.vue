<template>
  <v-skeleton-loader v-if="loading" type="image"></v-skeleton-loader>
  <iframe
    v-else-if="isPdf"
    :src="url"
    type="application/pdf"
    class="pdf viewer"
  >
    <p>PDF document: {{ document.name }}</p>
  </iframe>
  <div v-else class="d-flex justify-center image viewer">
    <img :src="url" />
  </div>
</template>

<script lang="ts">
import {
  Document,
  FileContentTypeEnum,
  DocumentFile as DocumentFileType,
  FileDownloadDispositionTypeEnum,
} from 'api-client'
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component
export default class DocumentFile extends Vue {
  @Prop({ required: true }) document: Document
  @Prop({ required: true }) file: DocumentFileType

  url = ''
  loading = true

  async mounted() {
    this.url = await this.$store.dispatch('document/downloadFile', {
      document: this.document,
      file: this.file,
      disposition: FileDownloadDispositionTypeEnum.Inline,
    })

    if (this.isTiff) {
      const UTIF = await import('utif')
      setTimeout(() => {
        UTIF.replaceIMG()
      }, 500)
    }

    this.loading = false
  }

  get isTiff() {
    return this.file.contentType === FileContentTypeEnum.ImageTiff
  }

  get isPdf() {
    return this.file.contentType === FileContentTypeEnum.ApplicationPdf
  }
}
</script>

<style scoped lang="scss">
.viewer {
  &.pdf {
    width: 100%;
    height: calc(100vh - 10.5rem);
  }
  &.image {
    img {
      width: 100%;
      object-fit: contain;
    }
  }
}
</style>
