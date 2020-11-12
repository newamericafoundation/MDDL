<template>
  <div v-if="!loading">
    <template v-if="collections.length">
      <CollectionCard
        v-for="(collection, i) in collections"
        :key="i"
        v-model="selected[i]"
        :collection="collection"
        :selectable="selectable"
        :class="{ 'mb-4': $vuetify.breakpoint.smAndUp }"
      />
    </template>
    <div v-else>
      <p class="d-flex justify-center capitalize">
        {{ $t('sharedFolder.noCollections') }}
      </p>
      <nuxt-link
        class="body-1 font-weight-medium share-link d-flex justify-center"
        :to="localePath('/share')"
      >
        {{ capitalize($t('sharedFolder.shareFirstDocument')) }}
      </nuxt-link>
    </div>
  </div>
  <div v-else>
    <v-card
      v-for="i in new Array(5)"
      :key="i"
      outlined
      :class="[{ 'mx-4': $vuetify.breakpoint.smAndUp }, { 'mb-2': true }]"
    >
      <v-row align="center" no-gutters>
        <v-col class="py-0 mx-8" cols="auto">
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
import { capitalize } from '@/assets/js/stringUtils'

@Component
export default class CollectionList extends Vue {
  @Prop({ default: false }) selectable: boolean
  @Prop({ default: null }) value: any

  loading = true
  selected: boolean[] = []
  capitalize = capitalize

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
a.share-link {
  text-decoration: none;
}
</style>
