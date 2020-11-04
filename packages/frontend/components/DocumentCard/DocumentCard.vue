<template>
  <v-card
    outlined
    :class="[
      'mx-auto',
      { 'pr-8': selectable },
      { mobile: $vuetify.breakpoint.xs },
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
      v-else
      :download="download"
      :delete-doc="deleteDoc"
      :edit-details="showDetails"
    />
    <v-row align="center" no-gutters>
      <v-col class="py-0" xs="6" sm="5">
        <v-img
          v-if="thumbnail"
          :src="thumbnail"
          max-height="200"
          max-width="200"
          contain
          class="ma-4"
        ></v-img>
        <v-skeleton-loader
          v-else
          class="pa-4"
          boilerplate
          type="image"
          tile
        ></v-skeleton-loader>
      </v-col>
      <v-col>
        <v-card-title class="headline">{{ document.name }}</v-card-title>

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
      this.document.links.find(l => l.rel === 'thumbnail')?.href
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
  max-width: 40rem;
  cursor: pointer;
  &.mobile {
    &:first-of-type {
      border-bottom: initial;
    }
    border-radius: 0;
    border-bottom: none;
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
