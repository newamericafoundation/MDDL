<template>
  <v-snackbar
    v-model="isVisible"
    :color="color"
    :timeout="-1"
    :class="['snackbar', { mobile: $vuetify.breakpoint.xs }]"
    elevation="0"
    vertical
    :right="$vuetify.breakpoint.smAndUp"
  >
    <v-row>
      <!-- Whitespace matters next line, using white-space: pre-line -->
      <v-col class="message">{{ capitalize($t(message)) }}</v-col>
      <v-col cols="auto">
        <v-row justify="end">
          <v-btn
            :title="`${$t('navigation.close')}`"
            v-if="isDismissable"
            class="px-0 close-button"
            text
            @click="close"
          >
            <v-icon small>$closeBold</v-icon>
          </v-btn>
        </v-row>
        <v-row
          v-for="(action, i) in linkActions"
          :key="`link-${i}`"
          justify="end"
          class="mr-1"
        >
          <nuxt-link
            :to="
              localeRoute({
                path: action.to,
                query: action.query ? action.query : {},
              })
            "
            class="font-weight-bold capitalize"
          >
            {{ $t(action.name) }}
          </nuxt-link>
        </v-row>

        <v-row v-for="(action, i) in clickActions" :key="`click-${i}`">
          <v-btn class="font-weight-bold capitalize" text @click="action.do">
            {{ $t(action.name) }}
          </v-btn>
        </v-row>
      </v-col>
    </v-row>
    <v-progress-linear
      v-if="progress !== null"
      :value="progress >= 0 ? progress : null"
      :indeterminate="progress === -1"
      color="success"
      class="mb-0"
    ></v-progress-linear>
  </v-snackbar>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { snackbarStore } from '@/plugins/store-accessor'
import { capitalize } from '@/assets/js/stringUtils'

@Component
export default class SnackBar extends Vue {
  capitalize = capitalize

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
#__nuxt .v-application .snackbar {
  &.mobile .v-snack__wrapper {
    width: 100vw;
    margin: 0;
  }
  .v-snack__wrapper {
    margin-bottom: 0;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    box-shadow: 0px 0px 8.51385px rgba(0, 0, 0, 0.21) !important;

    .v-snack__content {
      color: var(--white);
      margin-right: 0;
      padding: 0rem 1.5rem 0 1.5rem !important;
      width: 100%;
      .message {
        padding-top: 1rem;
        white-space: pre-line;
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

    .v-snack__action {
      display: none;
    }
    .v-btn {
      min-height: 0.4rem;
      height: 2rem;
      min-width: 2rem !important;
      &.close-button {
        padding: 0 0;
        margin-right: 0.5rem;
        .v-btn__content {
          margin-left: 0.5rem;
        }
      }
    }

    .v-progress-linear {
      position: absolute;
      left: 0;
      bottom: 0;
    }
  }
}
</style>
