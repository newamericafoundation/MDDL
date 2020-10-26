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
    <v-row align="center" no-gutters>
      <v-col class="py-0" xs="6" sm="5">
        <v-skeleton-loader
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
import { DocumentListItem } from 'api-client'
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { format } from 'date-fns'

@Component
export default class DocumentCard extends Vue {
  @Prop({ required: true }) document: DocumentListItem
  @Prop({ default: false }) selectable: boolean
  @Prop({ default: null }) value: boolean
  checked = false

  get documentDate() {
    return format(new Date(this.document.createdDate), 'LLL d, yyyy')
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
}
</style>
