<template>
  <v-snackbar
    v-model="value"
    class="snackbar"
    :color="color"
    :timeout="timeout"
    elevation="0"
    vertical
  >
    <slot />
    <template v-show="false" v-slot:action="{ attrs }">
      <slot name="action" v-bind="attrs" />
      <v-btn
        v-if="dismissable"
        v-bind="attrs"
        absolute
        right
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
  @Prop({ default: ThemeColor.PRIMARY }) color!: ThemeColor

  ThemeColor = ThemeColor
}
</script>

<style lang="scss">
#__nuxt .v-application .snackbar .v-snack__wrapper {
  margin-bottom: 0;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  padding: 0rem 1rem;
  .v-snack__content {
    color: var(--white);
  }

  .v-snack__action {
    margin-bottom: 1rem;
    & > *:not(:last-child) {
      padding-right: 1rem;
    }
    a {
      text-decoration: none;
      &:hover {
        color: var(--white);
        opacity: 0.8;
      }
      color: var(--white);
    }
  }

  .v-btn.v-snack__btn.v-btn--absolute {
    height: 1rem;
    min-width: 1.5rem !important;
    position: absolute;
    top: 0.75rem;
    right: 2rem;
  }

  .v-progress-linear {
    position: absolute;
    left: 0;
    bottom: 0;
  }
}
</style>
