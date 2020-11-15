<template>
  <div
    class="logo"
    :style="`background-image: url(${cityLogo}); width: ${width}; height: ${height}`"
  />
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component
export default class CityLogo extends Vue {
  @Prop({ default: '155px' })
  width: string

  @Prop({ default: '155px' })
  height: string

  get cityLogo(): string {
    return this.$config.cityLogo
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
