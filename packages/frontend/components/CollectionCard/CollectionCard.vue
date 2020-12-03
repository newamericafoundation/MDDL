<template>
  <v-card
    class="a11y-focus"
    tabindex="0"
    outlined
    :class="[
      { 'mx-4': $vuetify.breakpoint.smAndUp },
      { mobile: $vuetify.breakpoint.xs },
    ]"
    @click.native="onClick"
    @keydown.native.enter="onClick"
  >
    <v-checkbox
      v-if="selectable"
      :value="checked"
      color="primary"
      class="check"
      @change="emitChange"
    />
    <v-row align="center" no-gutters>
      <v-col class="py-0 mx-8" cols="auto">
        <v-icon>$folder</v-icon>
      </v-col>
      <v-col>
        <v-card-title>{{ collection.name }}</v-card-title>

        <v-card-subtitle>{{ collectionDate }}</v-card-subtitle>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { CollectionListItem } from 'api-client'
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { format } from 'date-fns'

@Component
export default class CollectionCard extends Vue {
  @Prop({ required: true }) collection: CollectionListItem
  @Prop({ default: false }) selectable: boolean
  @Prop({ default: null }) value: boolean
  checked = false

  get collectionDate() {
    return format(new Date(this.collection.createdDate), 'LLL d, yyyy')
  }

  onClick() {
    if (this.selectable) {
      this.checked = !this.checked
      this.emitChange(this.checked)
    } else {
      this.$router.push(this.localePath(`/collections/${this.collection.id}`))
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
}
</style>
