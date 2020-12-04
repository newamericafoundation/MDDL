<template>
  <ActivityList class="mx-auto" />
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component({
  head() {
    return {
      title: this.$t('navigation.activity') as string,
    }
  },
})
export default class Account extends Vue {}
</script>
