<template>
  <div>
    <SharedOwnerList />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { capitalize } from '@/assets/js/stringUtils'

@Component({
  head() {
    return {
      title: capitalize(this.$t('tabTitles.shared') as string),
    }
  },
})
export default class SharedCollections extends Vue {}
</script>
