<template>
  <div v-if="!loading">
    <template v-if="collections.length">
      <CollectionCard
        v-for="(collection, i) in collections"
        :key="i"
        v-model="selected[i]"
        :collection="collection"
        :selectable="selectable"
      />
    </template>
    <div v-else>
      <p class="d-flex justify-center capitalize">{{ $t('nothingHere') }}</p>
      <nuxt-link
        class="body-1 font-weight-medium dashboard-link d-flex justify-center capitalize"
        :to="localePath('/dashboard')"
      >
        {{ $t('returnDashboard') }}
      </nuxt-link>
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
      <v-row align="center">
        <v-col class="py-0" xs="6" sm="4">
          <v-skeleton-loader type="image"></v-skeleton-loader>
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

@Component
export default class CollectionList extends Vue {
  @Prop({ default: false }) selectable: boolean
  @Prop({ default: null }) value: any

  loading = true
  selected: boolean[] = []

  async mounted() {
    this.$store.commit('user/setUserId', this.$auth.user.username)
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
}
</script>

<style scoped lang="scss">
a.dashboard-link {
  text-decoration: none;
}
</style>
