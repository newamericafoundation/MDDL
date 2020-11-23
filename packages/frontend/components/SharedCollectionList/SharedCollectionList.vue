<template>
  <div v-if="!loading">
    <v-data-table
      :headers="headers"
      :items="collections"
      hide-default-footer
      :item-class="() => 'clickable'"
      @click:row="handleClick"
    >
      <template v-slot:item.icon>
        <v-icon color="primary">$folder</v-icon>
      </template>
    </v-data-table>
  </div>
  <div v-else>
    <v-card
      v-for="i in new Array(5)"
      :key="i"
      class="mx-auto mb-4"
      max-width="700"
      outlined
    >
      <v-skeleton-loader type="list-item-two-line"></v-skeleton-loader>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { userStore } from '@/plugins/store-accessor'
import { format } from 'date-fns'
import { SharedCollectionListItem } from '@/types/transformed'
import { DataTableHeader } from 'vuetify'

@Component
export default class SharedCollectionList extends Vue {
  loading = true
  headers: DataTableHeader[] = []

  @Prop({ default: '' }) ownerId: string

  async mounted() {
    // We have to define headers in mounted function since this.$i18n is undefined otherwise
    this.headers = [
      {
        text: '',
        align: 'start',
        sortable: false,
        value: 'icon',
        width: '3rem',
      },
      {
        text: this.$t('agent.sharedFolderNameLabel') as string,
        align: 'start',
        sortable: true,
        value: 'name',
      },
      {
        text: this.$t('dateAdded') as string,
        value: 'createdDate',
        sortable: true,
      },
    ]
    await this.$store.dispatch('user/getSharedCollections')
    this.loading = false
  }

  get collections() {
    return userStore.sharedCollections
      .filter((c: SharedCollectionListItem) =>
        this.ownerId ? c.owner.id === this.$route.params.ownerid : true,
      )
      .map((c: SharedCollectionListItem) => ({
        id: c.collection.id,
        name: c.collection.name,
        createdDate: format(c.collection.createdDate, 'LLL d, yyyy'),
      }))
  }

  handleClick(collectionRowItem: any) {
    this.$router.push(this.localePath(`/collections/${collectionRowItem.id}`))
  }
}
</script>
