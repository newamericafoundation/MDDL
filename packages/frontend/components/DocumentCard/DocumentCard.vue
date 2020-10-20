<template>
  <nuxt-link
    :to="localePath(`/documents/${document.id}`)"
    :class="['nuxt-link', 'mx-auto', { mobile: $vuetify.breakpoint.xs }]"
  >
    <v-card outlined>
      <v-row align="center">
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
  </nuxt-link>
</template>

<script lang="ts">
import { DocumentListItem } from 'api-client'
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { format } from 'date-fns'

@Component
export default class DocumentCard extends Vue {
  @Prop({ required: true }) document!: DocumentListItem

  get documentDate() {
    return format(new Date(this.document.createdDate), 'LLL d, yyyy')
  }
}
</script>

<style lang="scss">
.nuxt-link {
  max-width: 40rem;
  &.mobile {
    &:first-of-type .v-card {
      border-bottom: initial;
    }
    .v-card {
      border-radius: 0;
      border-bottom: none;
    }
  }
}
</style>
