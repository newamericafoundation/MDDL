<template>
  <v-dialog v-model="value" width="350" persistent>
    <v-card ref="confirmationDialog" class="confirmation-card a11y-focus">
      <v-row v-if="closable" class="py-4">
        <v-btn
          class="close-button a11y-focus"
          :title="`${$t('navigation.close')}`"
          absolute
          right
          icon
          :disabled="loading"
          @click="closeDialog"
          @keydown.enter="closeDialog"
        >
          <v-icon>$close</v-icon>
        </v-btn>
        <br />
      </v-row>
      <v-card-title class="text-heading-1 mx-2">
        {{ $t(title) }}
        <slot name="post-title" />
      </v-card-title>

      <v-card-text class="ma-2">
        {{ $t(body) }}
      </v-card-text>

      <v-card-actions class="px-8 pb-8">
        <v-spacer></v-spacer>
        <v-btn
          class="a11y-focus"
          :disabled="loading"
          @click="closeDialog"
          @keydown.enter="closeDialog"
        >
          {{ $t('controls.cancel') }}
        </v-btn>
        <v-btn
          class="a11y-focus-darker"
          color="primary"
          :loading="loading"
          @click="onConfirm"
          @keydown.enter="onConfirm"
        >
          {{ $t(confirmLabel) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component
export default class ConfirmationDialog extends Vue {
  @Prop({ required: true }) title: string
  @Prop({ required: true }) body: string
  @Prop({ required: true }) onConfirm: () => void
  @Prop({ default: true }) closable: boolean
  @Prop({ default: false }) value: boolean
  @Prop({ default: false }) loading: boolean
  @Prop({ default: 'controls.confirm' }) confirmLabel: string

  mounted() {
    this.$nuxt.$on('focusConfirmationDialog', this.focusConfirmationDialog)
  }

  closeDialog() {
    this.$emit('input', false)
  }

  focusConfirmationDialog() {
    setTimeout(() => {
      const confirmationDialogEl = (this as any).$refs.confirmationDialog.$el
      confirmationDialogEl.focus()
    }, 1000) // small buffer to counter el render delay
  }
}
</script>

<style scoped lang="scss">
.confirmation-card {
  overflow-x: hidden;
}
.close-button {
  min-height: 36px !important;
}
</style>
