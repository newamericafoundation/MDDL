<template>
  <div class="py-2">
    <template v-for="(crumb, i) in value">
      <v-btn
        v-if="crumb.to"
        :key="`crumb-${i}`"
        text
        primary
        :to="localePath(crumb.to)"
        :class="{ 'font-weight-bold': i === 0 }"
      >
        {{ $t(crumb.title) }}
      </v-btn>
      <v-btn
        v-else-if="!!crumb.click"
        :key="`crumb-${i}`"
        text
        color="primary"
        :class="{ 'font-weight-bold': i === 0 }"
        @click="crumb.click"
        @keypress.enter="crumb.click"
      >
        {{ $t(crumb.title) }}
      </v-btn>
      <div
        v-else
        :key="`crumb-${i}`"
        :class="`body-2 pl-4 primary--text d-inline${
          i === 0 ? ' font-weight-bold' : ''
        }`"
      >
        {{ $t(crumb.title) }}
      </div>
      <v-icon
        v-if="i < value.length - 1"
        :key="`crumb-chevron-${i}`"
        class="align-center"
        color="blue-light"
        size="0.6rem"
        :style="'margin-top: -0.1rem'"
      >
        $chevron-right
      </v-icon>
    </template>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { Breadcrumb } from '@/types/nav'

@Component
export default class Breadcrumbs extends Vue {
  @Prop({ required: true }) value: Breadcrumb[]
}
</script>
