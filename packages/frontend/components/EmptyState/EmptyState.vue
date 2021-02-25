<template>
  <div>
    <v-img
      alt=""
      :max-width="imageSize"
      class="mx-auto"
      :src="require('@/assets/images/upload.svg')"
    />
    <div v-if="title || body" style="max-width: 256px" class="mx-auto">
      <p v-if="title" class="text-center font-weight-bold">{{ $t(title) }}</p>
      <p v-if="body" class="text-center" style="white-space: pre-line">
        {{ $t(body) }}
      </p>
      <slot name="action" />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component
export default class EmptyState extends Vue {
  @Prop({ default: '' }) title: string
  @Prop({ default: '' }) body: string
  @Prop({ default: '30rem' }) imageSize: string
}
</script>

<style scoped lang="scss"></style>
