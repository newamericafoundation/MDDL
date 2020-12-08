<template>
  <div>
    <v-divider class="my-0" />
    <article v-if="page" class="ma-8">
      <h1>{{ page.title }}</h1>
      <nuxt-content :document="page" />
    </article>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { $content as contentFunc } from '@nuxt/content'
import { IContentDocument } from '@nuxt/content/types/content'
import VueI18n, { IVueI18n } from 'vue-i18n'

@Component({
  head() {
    return {
      title: this.$t('tabTitles.about') as string,
    }
  },
})
export default class About extends Vue {
  page: IContentDocument | IContentDocument[] | null = null

  async asyncData({
    $content,
    app,
  }: {
    $content: typeof contentFunc
    app: {
      i18n: VueI18n & IVueI18n
    }
  }) {
    const locale = app.i18n.locale
    const page = await $content(`about/${locale}`)
      .fetch()
      .catch(async () => {
        const fallbackPage = await $content(`about/en`).fetch()
        return fallbackPage
      })
    return { page }
  }
}
</script>
