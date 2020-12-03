<template>
  <v-btn x-large depressed class="ButtonLarge">
    {{ label }}
  </v-btn>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component
export default class ButtonLarge extends Vue {
  @Prop({ default: '' })
  label: string
}
</script>

<style scoped lang="scss">
#__nuxt .v-btn.ButtonLarge {
  min-width: rem(220px) !important;
  background-color: var(--primary);
  color: white;
  font-style: normal;
  font-weight: 500;
  text-align: center;
  transition: all 0.2s ease;
  font-size: 1.0625rem;
  letter-spacing: -0.03em;

  &:hover,
  &:focus {
    background-color: var(--primary-dark);
  }
}
</style>
