<template>
  <div v-if="!loading">
    <DocumentCard
      v-for="(document, i) in documents"
      :key="i"
      :document="document"
      class="mb-4"
    />
  </div>
  <div v-else>
    <v-card
      v-for="i in [0, 1, 2, 3, 4]"
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
import { Vue, Component } from 'nuxt-property-decorator'
import { DocumentListItem } from 'api-client'
import { userStore } from '@/plugins/store-accessor'

@Component({
  layout: 'dashboard',
})
export default class Documents extends Vue {
  loading = true

  async mounted() {
    this.$store.commit('user/setUserId', this.$auth.user.username)
    await this.$store.dispatch('user/getDocuments')
    this.loading = false
  }

  get documents() {
    return userStore.documents
  }
}
</script>

<style scoped lang="scss"></style>
