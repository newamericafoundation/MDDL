<template>
  <div v-if="!loading">
    <v-data-table
      v-show="$vuetify.breakpoint.smAndUp"
      :disable-pagination="true"
      :headers="headers"
      :items="collections"
      hide-default-footer
      :item-class="() => 'clickable'"
      @click:row="previewCollection"
    >
      <template v-slot:item.icon>
        <v-icon small color="primary" class="my-2">$folder</v-icon>
      </template>
    </v-data-table>
    <v-card
      v-for="(collection, i) in collections"
      v-show="$vuetify.breakpoint.xs"
      :key="`sharedOwner-${i}`"
      rounded="0"
    >
      <v-list-item class="grow py-4" @click="previewCollection(collection)">
        <v-icon left color="primary" size="24">$folder</v-icon>

        <v-list-item-content>
          <v-list-item-title class="subtitle-1">
            {{ collection.name }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-divider class="my-0" />
    </v-card>
  </div>
  <div v-else>
    <v-card
      v-for="i in new Array(5)"
      :key="i"
      class="mx-auto mb-4"
      max-width="700"
      outlined
    ></v-card>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { userStore } from '@/plugins/store-accessor'
import { format } from 'date-fns'
import { SharedCollectionListItem } from '@/types/transformed'
import { DataTableHeader } from 'vuetify'
import { RawLocation } from 'vue-router'

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
        class: 'blue-super-light',
        align: 'start',
        sortable: false,
        value: 'icon',
        width: '3rem',
      },
      {
        text: this.$t('agent.sharedFolderNameLabel') as string,
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

  previewCollection(collectionRowItem: any) {
    this.$router.push(
      this.localeRoute({
        path: `/collections/${collectionRowItem.id}/documents`,
        query: {
          owner: this.ownerId,
        },
      }) as RawLocation,
    )
  }
}
</script>
