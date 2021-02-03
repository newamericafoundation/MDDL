<template>
  <v-img
    img="role"
    :alt="`${$t('myDigitalDataLocker')}`"
    :src="cityLogo"
    :width="width"
  />
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component
export default class CityLogo extends Vue {
  @Prop({ default: '200px' })
  width: string

  get cityLogo(): string {
    return require('@/assets/images/city-logo.svg')
  }
}
</script>
