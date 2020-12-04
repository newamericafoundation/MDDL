<template>
  <v-btn
    text
    :color="color"
    @click="switchAccount"
    @keypress.enter="switchAccount"
  >
    <v-icon left :color="color" small>$switch-account</v-icon>
    {{ $t('navigation.switchAccount') }}
  </v-btn>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { RawLocation } from 'vue-router'
import { userStore } from '@/plugins/store-accessor'

@Component
export default class SwitchAccountButton extends Vue {
  @Prop({ default: 'white' }) color: string
  loading = false

  async switchAccount() {
    if (this.loading) return
    this.loading = true
    await userStore.clearOwnerId()
    this.$router.push(
      this.localeRoute({
        path: '/dashboard',
        query: {
          tab: 'switch',
        },
      }) as RawLocation,
    )
  }
}
</script>
