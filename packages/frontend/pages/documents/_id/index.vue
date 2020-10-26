<template>
  <div v-if="document">
    <div class="capitalize">{{ $t('docName') }}: {{ document.name }}</div>
    <div class="capitalize">{{ $t('createdDate') }}: {{ documentDate }}</div>
    <div class="capitalize">
      {{ $t('fileSize') }}: {{ documentContentSize }}MB
    </div>

    <v-skeleton-loader
      class="my-4"
      type="image"
      boilerplate
    ></v-skeleton-loader>
    <v-btn block :disabled="loading" @click="downloadFile">
      {{ $t('download') }}
    </v-btn>
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
import { Document } from 'api-client'
import { format } from 'date-fns'

@Component
export default class ViewDocument extends Vue {
  valid = false
  loading = true
  document: Document | null = null

  mounted() {
    this.$store
      .dispatch('document/getById', this.$route.params.id)
      .then((res: Document) => {
        this.document = res
        this.loading = false
      })
  }

  get documentDate() {
    if (this.document) {
      return format(new Date(this.document.createdDate), 'LLL d, yyyy')
    }
    return new Date()
  }

  get documentContentSize() {
    if (!this.document) return ''
    const totalBytes = this.document.files
      .map((f) => f.contentLength)
      .reduce(
        (fileContentLength, documentContentLength) =>
          fileContentLength + documentContentLength,
        0,
      )
    const mb = totalBytes / 1000000
    return mb.toFixed(2)
  }

  async downloadFile() {
    if (!this.document) return null
    this.loading = true
    const url = await this.$store.dispatch('document/download', this.document)
    window.open(url, '_blank')
    this.loading = false
    return url
  }
}
</script>

<style scoped lang="scss"></style>
