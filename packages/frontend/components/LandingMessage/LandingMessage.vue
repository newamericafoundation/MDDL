<template>
  <div class="landing-container">
    <CityLogo />
    <h2 class="text-heading-2 mt-4 mb-4 primary--text">
      {{ $t('login.welcomeTitle') }}
    </h2>
    <MarkdownContent id="welcome-copy" :content-path="welcomeMarkdown" />
    <ButtonLarge
      :label="$t('login.getStarted')"
      @click.native="logIn"
      @keydown.native.enter="logIn"
    />
    <CityLogoFooter v-if="showFooterLogo" class="mt-10 mb-3" />
    <FooterLinks
      justify="center"
      color="primary"
      background-color="none"
      :always-show="true"
      :fixed="$vuetify.breakpoint.height > 615"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'

import { UserRole } from '@/types/user'
import { userStore } from '@/plugins/store-accessor'

@Component({
  name: 'LandingMessage',
  layout: 'landing',
  auth: false,
})
export default class LandingMessage extends Vue {
  welcomeMarkdown = ''

  created() {
    const locale = this.$i18n.locale
    this.welcomeMarkdown = require(`@/assets/content/welcome/${locale}.md`)
  }

  get message() {
    return userStore.role !== null
      ? `login.welcomeMessage.${UserRole[userStore.role]}`
      : ''
  }

  get showFooterLogo(): boolean {
    return this.$config.footerLogo === '1'
  }

  logIn() {
    this.$router.push(this.localePath('/login'))
  }
}
</script>

<style lang="scss">
.v-application {
  .landing-layout-container {
    display: flex;
    flex-direction: column;
    padding: 0;
  }
  .landing-layout-container-inner {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .landing-container {
    width: rem(320px);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .welcome-message.body-1 {
    font-size: rem(15px) !important;
  }
  @media (min-height: 615px) {
    .landing-layout-container-inner {
      height: 100vh;
    }
  }
  #welcome-copy {
    margin: 10px 10px 32px !important;
  }
}
</style>
