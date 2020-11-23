<template>
  <LandingMessage :role="UserRole.CBO" />
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { capitalize } from '@/assets/js/stringUtils'
import { Login } from '@/mixins/login'
import { UserRole } from '@/types/user'

@Component({
  name: 'AgencyLanding',
  layout: 'landing',
  auth: false,
  mixins: [Login],
})
export default class Landing extends mixins(Login) {
  capitalize = capitalize
  UserRole = UserRole
}
</script>
