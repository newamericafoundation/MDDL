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
import { Vue, Component } from 'vue-property-decorator'
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
import { DocumentListItem } from 'api-client'

@Component
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
