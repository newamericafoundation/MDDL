<template>
  <div>
    <AppBar>
      <template v-slot:nav-action>
        <BackButton />
      </template>
      <template v-slot:actions>
        <v-menu v-model="showMenu" absolute offset-y style="max-width: 600px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              icon
              class="ml-4 text-body-1 font-weight-medium"
              color="primary"
              v-on="on"
            >
              <v-icon>$dots-horizontal</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item>
              <v-btn text :disabled="loading" @click="download">
                <v-icon small class="mr-2" color="primary">$download</v-icon>
                {{ $t('download') }}
              </v-btn>
            </v-list-item>
          </v-list>
        </v-menu>

        <nuxt-link
          v-if="document"
          :to="
            localeRoute({
              path: '/share',
              query: {
                selected: [document.id],
              },
            })
          "
          class="nuxt-link"
        >
          <v-btn class="ml-4 text-body-1 font-weight-medium" color="primary">
            <v-icon>$send</v-icon>
            {{ $t('share') }}
          </v-btn>
        </nuxt-link>
      </template>
    </AppBar>
    <v-main>
      <v-container v-if="document" class="px-0">
        <template v-if="document.files.length === 1">
          <DocumentFile :document="document" :file="document.files[0]" />
        </template>
        <v-carousel v-else v-model="currentPage">
          <v-carousel-item
            v-for="(file, i) in document.files"
            :key="`page-${i}`"
          >
            <DocumentFile :document="document" :file="file" />
          </v-carousel-item>
        </v-carousel>
      </v-container>
      <div v-else>
        <v-skeleton-loader
          class="my-2"
          type="list-item-three-line, image, list-item"
        ></v-skeleton-loader>
      </div>
    </v-main>
  </div>
</template>

<script lang="ts">
import fs from 'fs'
import { Vue, Component } from 'nuxt-property-decorator'
import {
  Document,
  DocumentFile,
  FileContentTypeEnum,
  FileDownloadDispositionTypeEnum,
} from 'api-client'
import { format } from 'date-fns'

@Component({
  layout: 'empty',
})
export default class ViewDocument extends Vue {
  showMenu = false
  loading = true
  document: Document | null = null
  currentPage = 'page-0'

  async mounted() {
    const data = await this.$store.dispatch(
      'document/getById',
      this.$route.params.id,
    )

    this.document = data

    this.loading = false
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
      .map(f => f.contentLength)
      .reduce(
        (fileContentLength, documentContentLength) =>
          fileContentLength + documentContentLength,
        0,
      )
    const mb = totalBytes / 1000000
    return mb.toFixed(2)
  }

  async download() {
    if (!this.document) return
    this.loading = true
    const urls = await this.$store.dispatch('document/download', {
      document: this.document,
      disposition: FileDownloadDispositionTypeEnum.Attachment,
    })
    const link = document.createElement('a')
    for (let i = 0; i < this.document.files.length; i++) {
      link.href = urls[i]
      link.download = this.document.files[i].name
      link.click()
      URL.revokeObjectURL(link.href)
    }
    link.remove()
    this.loading = false
  }
}
</script>

<style lang="scss">
.container {
  min-height: calc(100vh - 4rem);
}
</style>
