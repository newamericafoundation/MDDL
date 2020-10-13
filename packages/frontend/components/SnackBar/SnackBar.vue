<template>
  <v-snackbar
    v-model="value"
    class="snackbar"
    :color="color"
    :timeout="timeout"
    elevation="0"
  >
    <slot />
    <template v-show="false" v-slot:action="{ attrs }">
      <slot name="action" v-bind="attrs" />
      <v-btn
        v-if="dismissable"
        v-bind="attrs"
        class="px-0 py-3"
        text
        @click="value = false"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ThemeColor } from '@/types/theme'

@Component
export default class SnackBar extends Vue {
  @Prop({ required: true }) value!: boolean
  @Prop({ default: -1 }) timeout!: number
  @Prop({ default: true }) dismissable!: boolean
  @Prop({ default: ThemeColor.INFO }) color!: ThemeColor

  ThemeColor = ThemeColor
}
</script>

<style lang="scss">
.v-application {
  .snackbar {
    a {
      color: #e3f2fd;
      padding-right: 1rem;
    }

    .v-btn.v-size--default {
      height: 1rem;
      min-width: 1rem;
    }
  }
}
</style>
