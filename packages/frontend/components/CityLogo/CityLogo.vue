<template>
  <v-img :src="cityLogo" :width="width" />
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component
export default class CityLogo extends Vue {
  @Prop({ default: '155px' })
  width: string

  get cityLogo(): string {
    return require('@/static/images/city-logo.svg')
  }
}
</script>

<style scoped lang="scss">
.logo {
  display: block;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center center;
}
</style>
