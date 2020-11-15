<template>
  <div class="client-landing-container">
    <CityLogo />
    <h2 class="text-h2 mt-4 mb-4 primary--text">
      {{ capitalize($t('login.welcomeTitle')) }}
    </h2>
    <div class="body-1 welcome-message mb-8">
      {{ capitalize($t('login.welcomeMessage')) }}
    </div>
    <ButtonLarge label="Get Started" @click.native="gotoLogin" />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { capitalize } from '@/assets/js/stringUtils'

@Component({
  layout: 'centered',
  auth: false,
})
export default class Landing extends Vue {
  capitalize = capitalize

  // set client role and redirect to login
  gotoLogin() {
    sessionStorage.setItem('datalocker.role', 'client')
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
