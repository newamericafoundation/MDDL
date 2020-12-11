<template>
  <v-btn
    :to="
      localeRoute({
        path: '/share',
        query: {
          selected: preselected,
        },
      })
    "
    outlined
    class="ml-1 text-body-1 font-weight-medium"
    color="primary white--text"
  >
    <v-icon left>$send</v-icon>
    {{ $t('controls.share') }}
  </v-btn>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component
export default class ShareButton extends Vue {
  @Prop({ default: () => [] }) preselected: string[]
}
</script>
