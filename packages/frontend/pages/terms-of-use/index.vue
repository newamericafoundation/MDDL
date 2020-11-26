<template>
  <div>
    <AppBar v-if="hasAccepted">
      <template v-slot:nav-action>
        <BackButton />
      </template>
    </AppBar>
    <SideNav v-if="hasAccepted" />
    <v-container :class="{ 'mt-8': hasAccepted }">
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
      <v-row v-if="!hasAccepted" no-gutters justify="end" class="pa-12">
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
    <SnackBar v-if="hasAccepted" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, mixins } from 'nuxt-property-decorator'
import { userStore } from '@/plugins/store-accessor'
import Navigation from '@/mixins/navigation'

@Component({
  layout: 'empty',
  head() {
    return {
      title: this.$t('tabTitles.termsOfUse') as string,
    }
  },
  mixins: [Navigation],
})
export default class TermsOfUse extends mixins(Navigation) {
  loading = false

  get hasAccepted() {
    return userStore.profile && userStore.profile.termsOfUseAccepted
  }

  async accept() {
    this.loading = true
    await this.$store.dispatch('user/acceptTerms')
    this.$router.push(this.localePath('/dashboard'))
  }

  cancel() {
    this.$auth.logout()
  }

  back() {
    if (window.history.length) {
      this.$router.back()
    } else {
      this.$router.push(this.localePath('/dashboard'))
    }
  }
}
</script>
