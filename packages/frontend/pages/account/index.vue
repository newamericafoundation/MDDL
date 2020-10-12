<template>
  <div>
    <v-select
      v-model="$i18n.locale"
      :items="$i18n.locales"
      :value="$i18n.locales[0]"
      label="Language"
      class="mt-4"
      dense
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component
export default class Account extends Vue {}
</script>
