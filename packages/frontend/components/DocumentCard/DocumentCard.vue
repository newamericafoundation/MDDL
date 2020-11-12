<template>
  <v-card
    outlined
    :class="[
      { 'pr-8': selectable },
      { mobile: $vuetify.breakpoint.xs },
      { 'mx-4': $vuetify.breakpoint.smAndUp },
    ]"
    @click.native="onClick"
  >
    <v-checkbox
      v-if="selectable"
      :value="checked"
      color="primary"
      class="check"
      @change="emitChange"
    />
    <DocumentMenu
      v-else-if="showActions"
      :download="download"
      :delete-doc="deleteDoc"
      :edit-details="showDetails"
    />
    <v-row align="center" no-gutters>
      <v-col class="py-0" cols="auto">
        <v-lazy height="100" width="100" class="ma-4">
          <v-img
            v-if="thumbnail"
            max-height="112"
            max-width="112"
            contain
            class="thumbnail"
            :src="thumbnail"
          ></v-img>
          <v-skeleton-loader
            v-else
            type="image"
            height="100"
            width="100"
          ></v-skeleton-loader>
        </v-lazy>
      </v-col>
      <v-col cols="6">
        <v-card-title class="body-1">{{ document.name }}</v-card-title>

        <v-card-subtitle>{{ documentDate }}</v-card-subtitle>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { DocumentListItem, FileDownloadDispositionTypeEnum } from 'api-client'
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { format, roundToNearestMinutes } from 'date-fns'

@Component
export default class DocumentCard extends Vue {
  @Prop({ required: true }) document: DocumentListItem
  @Prop({ default: false }) selectable: boolean
  @Prop({ default: null }) value: boolean
  @Prop({ default: true }) showActions: boolean
  @Prop({
    default: async () => {
      // do nothing
    },
  })
  reload: () => void

  checked = false

  mounted() {
    if (this.value) this.checked = true
  }

  get documentDate() {
    return format(new Date(this.document.createdDate), 'LLL d, yyyy')
  }

  get thumbnail() {
    return (
      this.document &&
      this.document.links.find((l) => l.rel === 'thumbnail')?.href
    )
  }

  onClick() {
    if (this.selectable) {
      this.checked = !this.checked
      this.emitChange(this.checked)
    } else {
      this.$router.push(this.localePath(`/documents/${this.document.id}`))
    }
  }

  emitChange(val: any) {
    this.$emit('input', val)
  }

  async download() {
    const fullDocument = await this.$store.dispatch(
      'document/getById',
      this.document.id,
    )
    const urls = await this.$store.dispatch('document/download', {
      document: fullDocument,
      disposition: FileDownloadDispositionTypeEnum.Attachment,
    })
    const link = document.createElement('a')
    for (let i = 0; i < fullDocument.files.length; i++) {
      link.href = urls[i]
      link.download = fullDocument.files[i].name
      link.click()
      URL.revokeObjectURL(link.href)
    }
    link.remove()
  }

  showDetails() {
    this.$router.push(
      this.localePath({
        path: `documents/${this.document.id}`,
        query: {
          showDetails: 'true',
        },
      }),
    )
  }

  async deleteDoc() {
    await this.$store.dispatch('document/delete', this.document)
    this.reload()
  }
}
</script>

<style lang="scss">
.v-card {
  max-width: none !important;
  cursor: pointer;
  .thumbnail {
    border-radius: 0.4rem;
  }
  &.mobile {
    &:last-of-type {
      border-bottom: thin solid rgba(0, 0, 0, 0.12);
    }
    border-radius: 0;
    border-bottom: none;
    border-left: none;
    border-right: none;
  }
  .check {
    position: absolute;
    top: 0;
    right: 1rem;
    padding-top: 0;
    .v-input--selection-controls__input {
      margin-right: 0;
    }
  }
  .documentMenu {
    position: absolute;
    right: 1rem;
    top: 0.5rem;
  }
}
</style>
