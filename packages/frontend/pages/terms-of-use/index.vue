<template>
  <div>
    <AppBar v-if="hasAccepted" :empty="true">
      <template v-slot:nav-action>
        <BackButton tabindex="0" />
      </template>
    </AppBar>
    <SideNav v-if="hasAccepted" />
    <v-divider class="mt-13 mb-0" />
    <v-container :class="{ 'mt-8': hasAccepted }">
      <v-row no-gutters align="center" justify="center">
        <v-col align="center" cols="12">
          <CityLogo v-if="$vuetify.breakpoint.xs" width="96px" class="my-12" />
          <CityLogo v-else class="my-12" />
        </v-col>
        <v-col v-if="page" class="px-12" cols="12">
          <article class="mt-8">
            <h1>{{ page.title }}</h1>
            <nuxt-content :document="page" />
          </article>
        </v-col>
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
import { $content as contentFunc } from '@nuxt/content'
import { IContentDocument } from '@nuxt/content/types/content'
import VueI18n, { IVueI18n } from 'vue-i18n'

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
  page: IContentDocument | IContentDocument[] | null = null

  async asyncData({
    $content,
    app,
  }: {
    $content: typeof contentFunc
    app: {
      i18n: VueI18n & IVueI18n
    }
  }) {
    const locale = app.i18n.locale
    const page = await $content(`terms-of-use/${locale}`)
      .fetch()
      .catch(async () => {
        const fallbackPage = await $content(`terms-of-use/en`).fetch()
        return fallbackPage
      })
    return { page }
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
