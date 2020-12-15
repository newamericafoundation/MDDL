<template>
  <div>
    <AppBar :empty="true">
      <template v-slot:nav-action>
        <BackButton tabindex="0" />
      </template>
    </AppBar>
    <MarkdownContent :content-path="markdown" />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component({
  head() {
    return {
      title: this.$t('tabTitles.faq') as string,
    }
  },
  auth: false,
})
export default class FaqPage extends Vue {
  markdown = ''

  created() {
    const locale = this.$i18n.locale
    this.markdown = require(`@/assets/content/faq/${locale}.md`)
  }
}
</script>
