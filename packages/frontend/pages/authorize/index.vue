<template>
  <v-col cols="12" align="center"><h3>Logging in...</h3></v-col>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { capitalize } from '../../assets/js/stringUtils'

@Component({
  head() {
    return {
      title: capitalize(this.$t('authorizing') as string),
    }
  },
})
export default class Authorize extends Vue {}
</script>
