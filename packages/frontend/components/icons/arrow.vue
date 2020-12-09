<template>
  <svg
    width="17"
    height="14"
    viewBox="0 0 17 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :transform="`rotate(${rotation} 2 2)`"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M14.2018 7.14936H4.2791L8.16641 3.26318C8.51368 2.91479 8.51368 2.34703 8.16641 1.99866C7.81859 1.65084 7.24916 1.65084 6.90244 1.99866L1.51408 7.38588C1.33824 7.56283 1.25279 7.79656 1.25611 8.02972C1.25611 8.03523 1.25391 8.03909 1.25391 8.0435V8.0446C1.25391 8.05067 1.25832 8.05838 1.25832 8.06555C1.26162 8.1747 1.28147 8.28329 1.32336 8.38636C1.34982 8.44865 1.39502 8.49882 1.43526 8.55449C1.46338 8.59363 1.47936 8.63993 1.51409 8.67466L6.90244 14.0619C7.24916 14.4092 7.81859 14.4092 8.16641 14.0619C8.51368 13.7135 8.51368 13.1446 8.16641 12.7974L4.30662 8.93757H14.2018C14.694 8.93757 15.0959 8.53461 15.0959 8.04458C15.0959 7.55232 14.694 7.14937 14.2018 7.14937"
      fill="currentColor"
    />
  </svg>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component
export default class ChevronLeft extends Vue {
  @Prop({ default: 0 }) rotation: number
}
</script>
