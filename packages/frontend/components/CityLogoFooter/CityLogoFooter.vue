<template>
  <v-img
    img="role"
    :alt="`${$t('login.footerLogoAlt')}`"
    :src="CityLogoFooter"
    :width="width"
  />
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component
export default class CityLogoFooter extends Vue {
  @Prop({ default: '62px' })
  width: string

  get CityLogoFooter(): string {
    return require('@/static/images/city-logo-footer.svg')
  }
}
</script>
