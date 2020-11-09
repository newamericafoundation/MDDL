<template>
  <div>
    <v-select
      v-if="$i18n"
      v-model="$i18n.locale"
      :items="$i18n.locales"
      :label="$t('language')"
      class="mt-4"
      dense
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { capitalize } from '../../assets/js/stringUtils'

@Component({
  head() {
    return {
      title: capitalize(this.$t('account') as string),
    }
  },
})
export default class Account extends Vue {}
</script>
