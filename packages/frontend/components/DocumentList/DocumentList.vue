<template>
  <div v-if="!loading">
    <template v-if="documents.length">
      <DocumentCard
        v-for="(document, i) in documents"
        :key="i"
        v-model="selected[i]"
        :document="document"
        :class="{ 'mb-4': $vuetify.breakpoint.smAndUp }"
        :selectable="selectable"
        :reload="reload"
      />
    </template>
    <div v-else class="mx-8">
      <v-img
        max-width="30rem"
        class="mx-auto"
        :src="require('@/assets/images/upload.svg')"
      />
      <p class="capitalize text-center">{{ $t('noDocuments') }}</p>
      <UploadButton
        class="text-center"
        label="uploadFirst"
        :text-button="true"
      />
    </div>
  </div>
  <div v-else>
    <v-card
      v-for="i in new Array(5)"
      :key="i"
      outlined
      :class="[
        { 'mx-4': $vuetify.breakpoint.smAndUp },
        { 'mb-4': $vuetify.breakpoint.smAndUp },
      ]"
    >
      <v-row align="center" no-gutters>
        <v-col cols="auto">
          <v-skeleton-loader
            type="image"
            height="100"
            width="100"
            class="ma-4"
          ></v-skeleton-loader>
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
import { DocumentListItem } from 'api-client'
import { userStore } from '@/plugins/store-accessor'

@Component
export default class Documents extends Vue {
  @Prop({ default: false }) selectable: boolean
  @Prop({ default: null }) value: any
  @Prop({ default: () => [] }) preSelected: any

  loading = true
  selected: boolean[] = []

  async mounted() {
    await this.$store.commit('user/setUserId', this.$auth.user.username)
    await this.reload()
  }

  get documents() {
    // eslint-disable-next-line no-unused-expressions
    return userStore.documents
  }

  @Watch('selected')
  emitSelect() {
    this.$emit(
      'input',
      this.documents.filter(
        (_: DocumentListItem, i: number) => this.selected[i],
      ),
    )
  }

  async reload() {
    await this.$store.dispatch('user/getDocuments')
    this.selected = new Array(userStore.documents.length)
    if (this.preSelected) {
      for (const id of this.preSelected) {
        const index = userStore.documents.findIndex(
          (d: DocumentListItem) => d.id === id,
        )
        if (index >= 0) {
          this.$set(this.selected, index, true)
        }
      }
    }
    this.loading = false
  }
}
</script>

<style scoped lang="scss">
a.dashboard-link {
  text-decoration: none;
}
</style>
