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

@Component({
  layout: 'dashboard',
})
export default class Documents extends Vue {
  loading = true
  documents: DocumentListItem[] = []

  mounted() {
    this.$store
      .dispatch('user/getDocuments')
      .then((res: DocumentListItem[]) => {
        this.documents = res
        this.loading = false
      })
  }
}
</script>

<style scoped lang="scss"></style>
