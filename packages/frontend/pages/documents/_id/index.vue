<template>
  <v-form v-if="document" v-model="valid">
    <v-text-field v-model="document.name" label="Name" required />
    <v-btn
      color="primary"
      :loading="loading"
      :disabled="!valid || loading"
      block
    >
      Save Changes
    </v-btn>
  </v-form>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { Document } from 'api-client'

@Component
export default class ViewDocument extends Vue {
  valid = false
  loading = true
  document: Document | null = null

  mounted() {
    this.$store
      .dispatch('document/getById', this.$route.params.id)
      .then((res: Document) => {
        this.document = res
        this.loading = false
      })
  }

  save() {
    this.loading = true
    this.$store.dispatch('document/update', this.document).then(() => {
      this.loading = false
    })
  }
}
</script>

<style scoped lang="scss"></style>
