<template>
  <svg
    width="11"
    height="16"
    viewBox="0 0 11 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="mb-1"
    :transform="`rotate(${rotation} 2 2)`"
  >
    >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M10.0048 2.32964L8.20175 0.526611L0.529297 8.19906L8.20175 15.8715L10.0048 14.0685L4.14814 8.19906L10.0048 2.32964Z"
      fill="black"
    />
  </svg>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component
export default class ChevronLeft extends Vue {
  @Prop({ default: 0 }) rotation: number
}
// <style lang="scss" scoped>
// svg {
// }
// </style>
</script>
