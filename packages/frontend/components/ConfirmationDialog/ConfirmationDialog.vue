<template>
  <v-dialog v-model="value" width="350">
    <v-card>
      <v-row v-if="closable" class="py-4">
        <v-btn absolute right icon :disabled="loading" @click="closeDialog">
          <v-icon>$close</v-icon>
        </v-btn>
        <br />
      </v-row>
      <v-card-title class="text-heading-1 mx-2">
        {{ capitalize($t(title)) }}
      </v-card-title>

      <v-card-text class="ma-2">
        {{ capitalize($t(body)) }}
      </v-card-text>

      <v-card-actions class="px-8 pb-8">
        <v-spacer></v-spacer>
        <v-btn :disabled="loading" @click="closeDialog">
          {{ capitalize($t('controls.cancel')) }}
        </v-btn>
        <v-btn color="primary" :loading="loading" @click="onConfirm">
          {{ capitalize($t('controls.confirm')) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { capitalize } from '@/assets/js/stringUtils'

@Component
export default class ConfirmationDialog extends Vue {
  @Prop({ required: true }) title: string
  @Prop({ required: true }) body: string
  @Prop({ required: true }) onConfirm: () => void
  @Prop({ default: true }) closable: boolean
  @Prop({ default: false }) value: boolean
  @Prop({ default: false }) loading: boolean

  capitalize = capitalize

  closeDialog() {
    this.$emit('input', false)
  }
}
</script>
