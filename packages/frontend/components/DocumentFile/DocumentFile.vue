<template>
  <v-skeleton-loader v-if="loading" type="image"></v-skeleton-loader>
  <iframe
    v-else-if="isPdf"
    :src="url"
    :title="`${$t('document.previewOf')} ${document.name}`"
    type="application/pdf"
    class="pdf viewer"
  >
    <p>PDF document: {{ document.name }}</p>
  </iframe>
  <div v-else class="d-flex justify-center image viewer">
    <img :src="url" :alt="fileName" />
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
      await this.processTif()
    }

    this.loading = false
  }

  get fileName() {
    return this.file.name
  }

  get isTiff() {
    return this.file.contentType === FileContentTypeEnum.ImageTiff
  }

  get isPdf() {
    return this.file.contentType === FileContentTypeEnum.ApplicationPdf
  }

  async processTif() {
    if (!this.url.endsWith('.tiff') && !this.url.endsWith('.tif')) return

    const UTIF = await import('utif')
    const req = await fetch(this.url)
    const buff = await req.arrayBuffer()
    const ifds = UTIF.decode(buff)
    let vsns = ifds
    let ma = 0
    let page = vsns[0]
    if (ifds[0].subIFD) vsns = vsns.concat(ifds[0].subIFD as any[])
    for (let i = 0; i < vsns.length; i++) {
      const img = vsns[i]
      if (img.t258 == null || (img.t258 as Array<string | number>).length < 3)
        continue
      const ar = (img.t256 as number) * (img.t257 as number)
      if (ar > ma) {
        ma = ar
        page = img
      }
    }
    UTIF.decodeImage(buff, page, ifds)
    const rgba = UTIF.toRGBA8(page)
    const w = page.width
    const h = page.height
    const cnv = document.createElement('canvas')
    cnv.width = w
    cnv.height = h
    const ctx = cnv.getContext('2d') as CanvasRenderingContext2D
    const imgd = new ImageData(new Uint8ClampedArray(rgba.buffer), w, h)
    ctx.putImageData(imgd, 0, 0)
    this.url = cnv.toDataURL()
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
