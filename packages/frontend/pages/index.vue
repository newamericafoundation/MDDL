<template>
  <div class="client-landing-container">
    <CityLogo />
    <h2 class="text-heading-2 mt-4 mb-4 primary--text">
      {{ capitalize($t('login.welcomeTitle')) }}
    </h2>
    <div class="body-1 welcome-message mb-8">
      {{ capitalize($t('login.welcomeMessage.CLIENT')) }}
    </div>
    <ButtonLarge
      :label="$t('login.getStarted')"
      @click.native="gotoLogin"
      @keydown.native.enter="gotoLogin"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { capitalize } from '@/assets/js/stringUtils'
import { UserRole } from '@/types/user'

@Component({
  layout: 'centered',
  auth: false,
  head() {
    return {
      title: this.$t('tabTitles.welcome') as string,
    }
  },
})
export default class Landing extends Vue {
  capitalize = capitalize

  // set client role and redirect to login
  gotoLogin() {
    this.$store.dispatch('user/setRole', UserRole.CLIENT)
    this.$router.push('/login')
  }
}
</script>

<style scoped lang="scss">
.client-landing-container {
  width: rem(240px);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.welcome-message {
  font-size: rem(15px) !important;
}
</style>
