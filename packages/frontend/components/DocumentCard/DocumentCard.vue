<template>
  <v-card
    class="mx-auto"
    max-width="344"
    outlined
    :to="`/documents/${document.id}`"
  >
    <v-row align="center">
      <v-col class="py-0">
        <v-skeleton-loader boilerplate type="image" tile></v-skeleton-loader>
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
  @Prop({ required: true }) document!: DocumentListItem

  get documentDate() {
    return format(new Date(this.document.createdDate), 'do LLL yyyy')
  }
}
</script>

<style scoped lang="scss"></style>
