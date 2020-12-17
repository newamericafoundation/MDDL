<template>
  <v-footer
    v-show="shouldShow"
    :fixed="fixed"
    :class="[`justify-${justify}`, 'pa-0']"
    style="pointer-events: none"
  >
    <div
      :class="[backgroundColor, 'px-4', 'd-flex', 'align-center']"
      style="pointer-events: all"
    >
      <v-btn
        min-height="12px"
        :class="[`${color}--text`, 'px-1']"
        text
        :to="localePath('/terms-of-use')"
      >
        {{ $t('navigation.termsOfUse') }}
      </v-btn>
      <v-icon small :class="['d-inline', `${color}--text`]">
        mdi-circle-small
      </v-icon>
      <v-btn
        min-height="12px"
        :class="[`${color}--text`, 'px-1']"
        text
        :to="localePath('/about')"
      >
        {{ $t('navigation.about') }}
      </v-btn>
      <v-icon small :class="['d-inline', `${color}--text`]">
        mdi-circle-small
      </v-icon>
      <v-btn
        min-height="12px"
        :class="[`${color}--text`, 'px-1']"
        text
        :to="localePath('/faq')"
      >
        {{ $t('navigation.faq') }}
      </v-btn>
    </div>
  </v-footer>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component
export default class FooterLinks extends Vue {
  @Prop({ default: 'grey-5' }) color: string
  @Prop({ default: 'blue-mid-light' }) backgroundColor: string
  @Prop({ default: 'end' }) justify: string
  @Prop({ default: false }) alwaysShow: boolean
  @Prop({ default: true }) fixed: boolean

  get shouldShow() {
    return this.alwaysShow || this.$vuetify.breakpoint.smAndUp
  }
}
</script>

<style scoped lang="scss">
// .dot {
//   margin-top: 1px;
// }
</style>
