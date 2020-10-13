<template>
  <div>
    <DocumentCard
      v-for="(document, i) in documents"
      :key="i"
      :document="document"
      class="mb-4"
    />
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

  mounted() {
    this.$store
      .dispatch('user/getDocuments')
      .then((res: DocumentListItem[]) => {
        this.loading = false
      })
  }

  get documents() {
    return userStore.documents
  }
}
</script>

<style scoped lang="scss"></style>
