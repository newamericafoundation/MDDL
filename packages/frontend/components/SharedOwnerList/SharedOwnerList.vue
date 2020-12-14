<template>
  <div v-if="!loading">
    <template v-if="collections.length">
      <v-data-table
        v-show="$vuetify.breakpoint.smAndUp"
        :disable-pagination="true"
        :headers="headers"
        :items="collections"
        hide-default-footer
        :item-class="itemClass"
        :class="{ 'ma-8': $vuetify.breakpoint.smAndUp }"
        @click:row="previewCollection"
      >
        <template v-slot:item.icon>
          <v-icon color="primary">$profile</v-icon>
        </template>
      </v-data-table>
      <v-card
        v-for="(collection, i) in collections"
        v-show="$vuetify.breakpoint.xs"
        :key="`sharedOwner-${i}`"
        rounded="0"
      >
        <v-list-item class="grow py-4" @click="previewCollection(collection)">
          <v-list-item-avatar>
            <v-icon size="24">$profile</v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title class="subtitle-1">
              {{ collection.name }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider class="my-0" />
      </v-card>
    </template>
    <EmptyState
      v-else
      body="sharedFolder.noSharedDocuments"
      class="ma-12"
      image-size="256px"
    />
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
        class: 'blue-super-light',
        align: 'start',
        sortable: false,
        value: 'icon',
        width: '3rem',
      },
      {
        text: this.$t('agent.clientNameLabel') as string,
        class: 'blue-super-light',
        align: 'start',
        sortable: true,
        value: 'name',
      },
      {
        text: this.$t('dateAdded') as string,
        class: 'blue-super-light',
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
        name: c.owner.name,
        createdDate: format(c.collection.createdDate, 'LLL d, yyyy'),
      }))
  }

  previewCollection(ownerRowItem: any) {
    this.$router.push(
      this.localePath(`/collections/owner/${ownerRowItem.ownerId}`),
    )
  }

  itemClass(item: SharedCollectionListItem, i: number) {
    const classes = ['clickable']
    if (i === 0) {
      classes.push('border-bottom')
    }
    return classes.join(' ')
  }
}
</script>

<style scoped lang="scss">
a.dashboard-link {
  text-decoration: none;
}
</style>
