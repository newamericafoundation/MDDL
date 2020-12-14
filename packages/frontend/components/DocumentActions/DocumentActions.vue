<template>
  <v-list>
    <v-list-item v-if="canEdit">
      <v-btn class="justify-start" text @click="editDetails">
        <v-icon class="mr-2" color="primary">$pencil</v-icon>
        {{ $t('controls.editDetails') }}
      </v-btn>
    </v-list-item>
    <v-list-item v-if="canDelete">
      <v-btn
        class="justify-start"
        text
        @click="showConfirmationDialog"
        @keydown.enter="showConfirmationDialog"
      >
        <v-icon small class="mr-2" color="primary">$delete</v-icon>
        {{ $t('controls.delete') }}
      </v-btn>
    </v-list-item>
    <v-list-item>
      <v-btn class="justify-start" text @click="download">
        <v-icon small class="mr-2" color="primary">$download</v-icon>
        {{ $t('controls.download') }}
      </v-btn>
    </v-list-item>
    <ConfirmationDialog
      v-model="showDeleteConfirmation"
      body="document.deleteConfirmationBody"
      title="document.deleteConfirmationTitle"
      :on-confirm="confirmDelete"
      :loading="loading"
      confirm-label="controls.confirmDelete"
    />
  </v-list>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import {
  Document,
  DocumentFile,
  DocumentListItem,
  FileDownloadDispositionTypeEnum,
} from 'api-client'
import download from '@/assets/js/download'

@Component
export default class DocumentActions extends Vue {
  @Prop({ required: true }) document: DocumentListItem | Document
  @Prop({ default: () => () => {} }) onDelete: () => void

  showDeleteConfirmation = false
  loading = false

  get canDelete() {
    return this.document && this.document.links.some((l) => l.rel === 'delete')
  }

  get canEdit() {
    return this.document && this.document.links.some((l) => l.rel === 'update')
  }

  async download() {
    const fullDocument: Document = await this.$store.dispatch(
      'document/getById',
      this.document.id,
    )
    const urls = await this.$store.dispatch('document/download', {
      document: fullDocument,
      disposition: FileDownloadDispositionTypeEnum.Attachment,
    })
    download(
      urls,
      fullDocument.files.map((f) => f.name),
    )
  }

  async editDetails() {
    if (
      this.$route.path.includes(
        this.localePath(`/documents/${this.document.id}`),
      )
    ) {
      // TODO: so hacky - put a variable in the store to determine whether the
      //       edit details dialog is shown instead
      await this.$router.push(
        this.localePath({
          path: `/documents/${this.document.id}`,
          query: {
            ...this.$route.query,
            showDetails: 'true',
          },
        }),
      )
      setTimeout(() => window.location.reload(), 100)
    } else {
      this.$router.push(
        this.localePath({
          path: `/documents/${this.document.id}`,
          query: {
            ...this.$route.query,
            showDetails: 'true',
          },
        }),
      )
    }
  }

  showConfirmationDialog() {
    this.showDeleteConfirmation = true
    this.$emit('focusConfirmationDialog')
  }

  async confirmDelete() {
    this.loading = true
    await this.deleteDoc()
    if (this.$route.path === this.localePath(`/documents/${this.document.id}`))
      this.$router.push(this.localePath('/dashboard'))
    this.loading = false
    this.showDeleteConfirmation = false
  }

  async deleteDoc() {
    await this.$store.dispatch('document/delete', this.document)
    this.onDelete()
  }
}
</script>
