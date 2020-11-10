<template>
  <div>
    <AppBar>
      <template v-slot:nav-action>
        <BackButton />
      </template>
      <template v-slot:actions>
        <DocumentMenu
          :download="download"
          :delete-doc="deleteDoc"
          :edit-details="showDetails"
        />

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
      <v-container v-if="document" class="px-2">
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
        <template v-if="document.description">
          <v-expansion-panels class="mt-4 px-2">
            <v-expansion-panel>
              <v-expansion-panel-header
                class="body-1 font-weight-medium"
                expand-icon="mdi-menu-down"
              >
                {{ capitalize($t('description')) }}
              </v-expansion-panel-header>
              <v-expansion-panel-content class="pt-4 body-1">
                {{ document.description }}
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
          <div class="vertical-space" />
        </template>
      </v-container>
      <div v-else>
        <v-skeleton-loader
          class="my-2"
          type="list-item-three-line, image, list-item"
        ></v-skeleton-loader>
      </div>
    </v-main>

    <v-dialog
      v-if="document"
      v-model="showDialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar flat>
          <v-btn
            class="mr-2"
            icon
            :disabled="loading"
            @click.stop="closeDetails"
          >
            <v-icon small>$chevron-left</v-icon>
          </v-btn>
          <v-toolbar-title>{{ $t('editDetails') }}</v-toolbar-title>
          <v-spacer />
          <v-btn
            color="primary"
            text
            :disabled="!valid || loading"
            @click="editDetails"
          >
            {{ $t('done') }}
          </v-btn>
        </v-toolbar>
        <v-container class="pa-8">
          <ValidationObserver ref="observer">
            <v-form @submit.prevent>
              <p class="subtitle-1 capitalize">{{ $t('name') }}</p>
              <ValidationProvider
                v-slot="{ errors }"
                name="name"
                rules="required|max:255"
              >
                <v-text-field
                  v-model="newName"
                  :error-messages="errors"
                  outlined
                  :placeholder="capitalize($t('enterDocumentNamePlaceholder'))"
                />
              </ValidationProvider>
              <p class="subtitle-1 capitalize">{{ $t('description') }}</p>
              <ValidationProvider
                v-slot="{ errors }"
                name="description"
                rules="max:500"
              >
                <v-textarea
                  v-model="newDescription"
                  :error-messages="errors"
                  outlined
                  :placeholder="
                    capitalize($t('enterDocumentDescriptionPlaceholder'))
                  "
                />
              </ValidationProvider>
            </v-form>
          </ValidationObserver>
        </v-container>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import fs from 'fs'
import { Vue, Component, Watch } from 'nuxt-property-decorator'
import {
  Document,
  DocumentFile,
  FileContentTypeEnum,
  FileDownloadDispositionTypeEnum,
} from 'api-client'
import { format } from 'date-fns'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import { capitalize } from '@/assets/js/stringUtils'

@Component({
  layout: 'empty',
  components: {
    ValidationObserver,
    ValidationProvider,
  },
  head() {
    return {
      title: (this as ViewDocument).title,
    }
  },
})
export default class ViewDocument extends Vue {
  capitalize = capitalize
  showMenu = false
  loading = true
  document: Document | null = null
  currentPage = 'page-0'
  showDialog = false
  newName = ''
  newDescription = ''
  recompute = false
  title = ''

  async mounted() {
    this.title = capitalize(this.$t('document') as string)
    const data: Document = await this.$store.dispatch(
      'document/getById',
      this.$route.params.id,
    )

    this.document = data
    this.newName = data.name
    this.newDescription = data.description ?? ''

    this.loading = false

    if (this.$route.query.showDetails) this.showDialog = true
    this.title = this.document.name
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

  showDetails() {
    this.showDialog = true
  }

  async editDetails() {
    this.loading = true
    this.document!.name = this.newName
    this.document!.description = this.newDescription.length
      ? this.newDescription
      : undefined
    await this.$store.dispatch('document/update', this.document)
    this.closeDetails()
    this.loading = false
  }

  async deleteDoc() {
    this.loading = true
    await this.$store.dispatch('document/delete', this.document)
    this.$router.push(this.localePath('/'))
    this.loading = false
  }

  closeDetails() {
    this.newName = this.document!.name
    this.newDescription = this.document!.description ?? ''
    this.showDialog = false
  }

  get valid() {
    // Referencing this.recompute forces this.$refs.observer to be updated
    // eslint-disable-next-line no-unused-expressions
    this.recompute
    return this.$refs.observer instanceof ValidationObserver
      ? (this.$refs.observer as any).flags.valid
      : false
  }

  /**
   * Unfortunately we need this little hack to get Vue to
   * recognise when ValidationObserver is added to the DOM
   */
  @Watch('showDialog')
  recomputer() {
    setTimeout(() => {
      this.recompute = !this.recompute
    }, 100)
  }
}
</script>

<style lang="scss">
.container {
  min-height: calc(100vh - 4rem);
  .vertical-space {
    min-height: 20rem;
  }
}
</style>
