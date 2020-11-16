<template>
  <LandingMessage role="community" />
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { capitalize } from '@/assets/js/stringUtils'
import { Login } from '@/mixins/login'

@Component({
  name: 'AgencyLanding',
  layout: 'landing',
  auth: false,
  mixins: [Login],
})
export default class Landing extends mixins(Login) {
  capitalize = capitalize
}
</script>
