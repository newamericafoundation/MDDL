<template>
  <div>
    <v-img
      alt=""
      :max-width="imageSize"
      class="mx-auto"
      :src="require('@/static/images/upload.svg')"
    />
    <div v-if="title || body" style="max-width: 256px" class="mx-auto">
      <p v-if="title" class="text-center font-weight-bold">{{ $t(title) }}</p>
      <p v-if="body" class="text-center">{{ $t(body) }}</p>
    </div>
    <v-row v-if="$slots.action">
      <v-col class="d-flex justify-center">
        <slot name="action" />
      </v-col>
    </v-row>
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
