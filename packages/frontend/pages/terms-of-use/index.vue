<template>
  <v-container>
    <v-row no-gutters align="center" justify="center">
      <v-col align="center" cols="12">
        <CityLogo v-if="$vuetify.breakpoint.xs" width="96px" class="my-12" />
        <CityLogo v-else class="my-12" />
      </v-col>
      <v-col class="px-12 mb-4 text-heading-2 primary--text" cols="12">
        {{ $t('termsOfUse.title') }}
      </v-col>
      <v-col class="px-12" cols="12">{{ $t('termsOfUse.body') }}</v-col>
    </v-row>
    <v-row no-gutters justify="end" class="pa-12">
      <v-btn
        :disabled="loading"
        outlined
        class="mx-2 px-6 grey-5--text"
        @click="cancel"
      >
        {{ $t('controls.declineAndLogOut') }}
      </v-btn>
      <v-btn :loading="loading" class="mx-2 primary px-10" @click="accept">
        {{ $t('controls.accept') }}
      </v-btn>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component({
  layout: 'empty',
  head() {
    return {
      title: this.$t('tabTitles.termsOfUse') as string,
    }
  },
})
export default class TermsOfUse extends Vue {
  loading = false

  async accept() {
    this.loading = true
    await this.$store.dispatch('user/acceptTerms')
    this.$router.push(this.localePath('/dashboard'))
  }

  cancel() {
    this.$auth.logout()
  }
}
</script>
