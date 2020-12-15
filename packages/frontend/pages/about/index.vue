<template>
  <div>
    <AppBar :empty="true">
      <template v-slot:nav-action>
        <BackButton tabindex="0" />
      </template>
    </AppBar>
    <MarkdownContent content-path="about" class="ma-8" />
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
  auth: false,
})
export default class AboutPage extends Vue {}
</script>
