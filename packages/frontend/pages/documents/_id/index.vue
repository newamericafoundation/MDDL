<template>
  <div v-if="document">
    <v-form v-model="valid">
      <v-text-field v-model="document.name" label="Document Name" required />
    </v-form>

    <!-- TODO: remove me an display each page -->
    <h5>Pages:</h5>
    <ol>
      <template v-for="(file, i) in document.files">
        <li :key="i">{{ file.name }}</li>
      </template>
    </ol>

    <v-btn
      :loading="loading"
      :disabled="!valid || loading"
      class="mt-4"
      color="primary"
      block
      @click.stop="save"
    >
      Save Changes
    </v-btn>
  </div>
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
