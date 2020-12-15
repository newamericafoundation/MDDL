<template>
  <article v-if="markdown" class="ma-8">
    <VueShowdown :markdown="markdown.default" />
  </article>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component
export default class MarkdownContent extends Vue {
  @Prop({ required: true }) contentPath: string
  markdown = ''

  created() {
    this.markdown = this.contentPath
  }
}
</script>

<style lang="scss">
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
