<template>
  <v-card
    outlined
    :class="['mx-auto', 'mb-2', { mobile: $vuetify.breakpoint.xs }]"
    @click.native="onClick"
  >
    <v-card-title class="headline">
      {{ collectionListItem.collection.name }}
    </v-card-title>
  </v-card>
</template>

<script lang="ts">
import { SharedCollectionListItem } from 'api-client'
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { format } from 'date-fns'

@Component
export default class CollectionCard extends Vue {
  @Prop({ required: true }) collectionListItem: SharedCollectionListItem

  onClick() {
    this.$router.push(
      this.localePath(`/collections/${this.collectionListItem.collection.id}`),
    )
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
