<template>
  <article v-if="page">
    <h1>{{ page.title }}</h1>
    <nuxt-content :document="page" />
  </article>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { $content as contentFunc } from '@nuxt/content'
import { IContentDocument } from '@nuxt/content/types/content'
import VueI18n, { IVueI18n } from 'vue-i18n'

@Component
export default class MarkdownContent extends Vue {
  page: IContentDocument | IContentDocument[] | null = null
  @Prop({ required: true }) contentPath: string

  async fetch() {
    const locale = this.$i18n.locale
    this.page = await this.$content(`${this.contentPath}/${locale}`)
      .fetch()
      .catch(async () => {
        const fallbackPage = await this.$content(
          `${this.contentPath}/en`,
        ).fetch()
        return fallbackPage
      })
  }
}
</script>

<style lang="scss" scoped>
h1,
h2,
h3,
h4,
h5,
h6 {
  color: var(--primary);
  margin-bottom: 16px;
}
</style>
