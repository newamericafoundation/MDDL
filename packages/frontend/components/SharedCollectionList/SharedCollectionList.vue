<template>
  <div v-if="!loading">
    <template v-if="collections.length">
      <SharedCollectionCard
        v-for="(collectionListItem, i) in collections"
        :key="i"
        :collection-list-item="collectionListItem"
      />
    </template>
    <div v-else>
      <p class="d-flex justify-center capitalize">{{ $t('nothingHere') }}</p>
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
import { CollectionListItem } from 'api-client'

@Component
export default class SharedCollectionList extends Vue {
  loading = true

  async mounted() {
    this.$store.commit('user/setUserId', this.$auth.user.username)
    await this.$store.dispatch('user/getSharedCollections')
    this.loading = false
  }

  get collections() {
    return userStore.sharedCollections
  }
}
</script>

<style scoped lang="scss">
a.dashboard-link {
  text-decoration: none;
}
</style>
