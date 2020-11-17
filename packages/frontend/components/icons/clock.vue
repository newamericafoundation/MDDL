<template>
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="11.1841"
      cy="10.9121"
      r="9.5"
      stroke="currentColor"
      stroke-width="2.35646"
    />
    <path
      d="M10.5 5V11.5H16"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component
export default class Clock extends Vue {}
</script>
