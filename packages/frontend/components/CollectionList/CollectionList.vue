<template>
  <div v-if="!loading">
    <template v-if="collections.length">
      <v-data-table
        v-show="$vuetify.breakpoint.smAndUp"
        :disable-pagination="true"
        :headers="headers"
        :items="collections"
        hide-default-footer
        :item-class="() => 'clickable'"
        @click:row="previewCollection"
      >
        <template v-slot:item.createdDate="{ item }">
          {{ format(new Date(item.createdDate), 'LLL d, yyyy') }}
        </template>
        <template v-slot:item.icon>
          <v-icon small color="primary" class="my-2">$folder</v-icon>
        </template>
      </v-data-table>
      <CollectionCard
        v-for="(collection, i) in collections"
        v-show="$vuetify.breakpoint.xs"
        :key="i"
        v-model="selected[i]"
        :collection="collection"
        :selectable="selectable"
        :class="{ 'mb-4': $vuetify.breakpoint.smAndUp }"
      />
    </template>
    <div v-else>
      <p class="d-flex justify-center">
        {{ $t('sharedFolder.noCollections') }}
      </p>
      <nuxt-link
        class="body-1 font-weight-medium share-link d-flex justify-center"
        :to="localePath('/share')"
      >
        {{ $t('sharedFolder.shareFirstDocument') }}
      </nuxt-link>
    </div>
  </div>
  <div v-else>
    <v-card
      v-for="i in new Array(5)"
      :key="i"
      height="84"
      outlined
      :class="[{ 'mx-4': $vuetify.breakpoint.smAndUp }, { 'mb-4': true }]"
    >
      <v-row align="center" no-gutters>
        <v-col class="py-0 mx-8 mt-3" cols="auto">
          <v-icon>$folder</v-icon>
        </v-col>
        <v-col>
          <v-skeleton-loader type="list-item-two-line"></v-skeleton-loader>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'nuxt-property-decorator'
import { userStore } from '@/plugins/store-accessor'
import { CollectionListItem } from 'api-client'
import { DataTableHeader } from 'vuetify'
import { format } from 'date-fns'

@Component
export default class CollectionList extends Vue {
  @Prop({ default: false }) selectable: boolean
  @Prop({ default: null }) value: any

  format = format
  loading = true
  selected: boolean[] = []
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
        text: this.$t('name') as string,
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
    await this.$store.dispatch('user/getCollections')
    this.selected = new Array(userStore.collections.length)
    this.loading = false
  }

  get collections() {
    return userStore.collections
  }

  @Watch('selected')
  emitSelect() {
    this.$emit(
      'input',
      this.collections.filter(
        (_: CollectionListItem, i: number) => this.selected[i],
      ),
    )
  }

  previewCollection(collectionRowItem: any) {
    this.$router.push(this.localePath(`/collections/${collectionRowItem.id}`))
  }
}
</script>

<style scoped lang="scss">
a.share-link {
  text-decoration: none;
}
</style>
