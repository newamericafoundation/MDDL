<template>
  <div v-if="!loading">
    <template v-if="collections.length">
      <v-data-table
        :headers="headers"
        :items="collections"
        hide-default-footer
        :item-class="() => 'clickable'"
        @click:row="handleClick"
      >
        <template v-slot:item.icon>
          <v-icon color="primary">$profile</v-icon>
        </template>
      </v-data-table>
    </template>
    <div v-else>
      <!-- TODO: proper empty state -->
      <p class="d-flex justify-center capitalize">
        {{ $t('sharedFolder.noSharedDocuments') }}
      </p>
    </div>
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
import { Vue, Component, Prop, Watch } from 'nuxt-property-decorator'
import { userStore } from '@/plugins/store-accessor'
import { SharedCollectionListItem } from '@/types/transformed'
import { format } from 'date-fns'
import { DataTableHeader } from 'vuetify'

@Component
export default class SharedOwnerList extends Vue {
  loading = true
  headers: DataTableHeader[] = []

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
        text: this.$t('agent.clientNameLabel') as string,
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
    // TODO: created date could be any of the dates of the collections shared by an owner
    //       not necessarily most or least recent
    return userStore.sharedCollections
      .filter(
        (
          c: SharedCollectionListItem,
          i: number,
          arr: SharedCollectionListItem[],
        ) => arr.findIndex((o) => o.owner.id === c.owner.id) === i,
      )
      .map((c: SharedCollectionListItem) => ({
        ownerId: c.owner.id,
        collectionId: c.collection.id,
        name: `${c.owner.givenName} ${c.owner.familyName}`,
        createdDate: format(c.collection.createdDate, 'LLL d, yyyy'),
      }))
  }

  handleClick(ownerRowItem: any) {
    this.$router.push(
      this.localePath(`/collections/owner/${ownerRowItem.ownerId}`),
    )
  }
}
</script>

<style scoped lang="scss">
a.dashboard-link {
  text-decoration: none;
}
</style>
