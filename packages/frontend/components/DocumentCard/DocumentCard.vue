<template>
  <v-card
    outlined
    class="a11y-focus"
    tabindex="0"
    :class="[
      { 'pr-8': selectable },
      { mobile: $vuetify.breakpoint.xs },
      { 'mx-4': $vuetify.breakpoint.smAndUp },
    ]"
    @click.native.stop="onClick"
    @keydown.native.self.stop.enter="onClick"
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
      class="a11y-focus"
      :on-delete="reload"
      :document="document"
    />
    <v-row align="center" no-gutters>
      <v-col class="py-0" cols="auto">
        <DocumentThumbnail :document="document" />
      </v-col>
      <v-col cols="6">
        <v-card-title class="body-1">{{ document.name }}</v-card-title>

        <v-card-subtitle>{{ documentDate }}</v-card-subtitle>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { DocumentFile, DocumentListItem, Owner } from 'api-client'
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { format, roundToNearestMinutes } from 'date-fns'

import { RawLocation } from 'vue-router'

@Component
export default class DocumentCard extends Vue {
  @Prop({ required: true }) document: DocumentListItem
  @Prop({ default: false }) selectable: boolean
  @Prop({ default: null }) value: DocumentListItem[]
  @Prop({ default: null }) owner: Owner | null
  @Prop({ default: true }) showActions: boolean
  @Prop({
    default: async () => {
      // do nothing
    },
  })
  reload: () => void

  checked = false

  mounted() {
    this.checked = this.value
      .map((document: DocumentListItem) => document.id)
      .includes(this.document.id)
  }

  get documentDate() {
    return format(new Date(this.document.createdDate), 'LLL d, yyyy')
  }

  onClick() {
    if (this.selectable) {
      if (this.checked) {
        this.emitChange(
          this.value.filter(
            (document: DocumentListItem) => document.id !== this.document.id,
          ),
        )
      } else {
        this.emitChange(this.value.concat([this.document]))
      }
      this.checked = !this.checked
    } else if (this.owner) {
      this.$router.push(
        this.localeRoute({
          path: `/documents/${this.document.id}`,
          query: {
            ownerId: this.owner.id,
            ownerName: `${this.owner?.name}`,
          },
        }) as RawLocation,
      )
    } else {
      this.$router.push(this.localePath(`/documents/${this.document.id}`))
    }
  }

  emitChange(val: any) {
    this.$emit('input', val)
  }
}
</script>

<style scoped lang="scss">
.v-card {
  max-width: none !important;
  cursor: pointer;
  &.mobile {
    &:last-of-type {
      border-bottom: thin solid var(--grey-4);
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
  &::v-deep .documentMenu {
    position: absolute;
    right: 1rem;
    top: 0.5rem;
    min-height: 36px !important;
  }
}
</style>
