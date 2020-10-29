<template>
  <v-snackbar
    v-model="isVisible"
    :color="color"
    :timeout="-1"
    class="snackbar"
    elevation="0"
    vertical
  >
    {{ $t(message) }}

    <template v-slot:action="{ attrs }">
      <nuxt-link
        v-for="(action, i) in linkActions"
        :key="`link-${i}`"
        v-bind="attrs"
        :to="localePath(action.to)"
        class="font-weight-bold capitalize"
      >
        {{ $t(action.name) }}
      </nuxt-link>

      <v-btn
        v-for="(action, i) in clickActions"
        :key="`click-${i}`"
        v-bind="attrs"
        right
        class="font-weight-bold capitalize"
        text
        @click="action.do"
      >
        <v-icon>$close</v-icon>
      </v-btn>

      <v-btn
        v-if="isDismissable"
        v-bind="attrs"
        absolute
        right
        class="px-0 py-3"
        text
        @click="close"
      >
        <v-icon>$close</v-icon>
      </v-btn>
      <v-progress-linear
        v-if="progress !== null"
        :value="progress"
        color="success"
        class="mb-0"
      ></v-progress-linear>
    </template>
  </v-snackbar>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { snackbarStore } from '@/plugins/store-accessor'

@Component
export default class SnackBar extends Vue {
  get isVisible() {
    return snackbarStore.isVisible
  }

  get message() {
    return snackbarStore.message
  }

  get linkActions() {
    return snackbarStore.linkActions
  }

  get clickActions() {
    return snackbarStore.clickActions
  }

  get isDismissable() {
    return snackbarStore.isDismissable
  }

  get color() {
    return snackbarStore.color
  }

  get progress() {
    return snackbarStore.progress
  }

  close() {
    snackbarStore.setVisible(false)
  }
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
    padding-right: 3rem;
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
