<template>
  <div>
    <AppBar v-if="hasAccepted || !$auth.loggedIn" :empty="true">
      <template v-slot:nav-action>
        <BackButton tabindex="0" />
      </template>
    </AppBar>
    <SideNav v-if="hasAccepted && $auth.loggedIn" />
    <v-divider class="mt-13 mb-0" />
    <v-container :class="{ 'mt-8': hasAccepted }">
      <v-row no-gutters align="center" justify="center">
        <v-col align="center" cols="12">
          <CityLogo v-if="$vuetify.breakpoint.xs" width="96px" class="my-12" />
          <CityLogo v-else class="my-12" />
        </v-col>
        <v-col class="px-3" cols="12">
          <MarkdownContent :content-path="markdown" />
        </v-col>
      </v-row>
      <v-row
        v-if="!hasAccepted && $auth.loggedIn"
        no-gutters
        justify="end"
        class="pa-12"
      >
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
    <SnackBar v-if="hasAccepted && $auth.loggedIn" />
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
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
  auth: false,
})
export default class TermsOfUse extends mixins(Navigation) {
  loading = false
  markdown = ''

  created() {
    const locale = this.$i18n.locale
    this.markdown = require(`@/assets/content/terms-of-use/${locale}.md`)
  }

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
