<template>
  <div>
    <!-- Note: corrupting the token doesn't really happen in normal usage -->
    <v-btn @click="expireToken">Expire token</v-btn>
    <v-btn @click="logIn">log in</v-btn>
    <v-btn @click="logOut">log out</v-btn>
    <v-btn @click="getDocuments">request documents</v-btn>
    <v-btn @click="sendEvent">send test upload event</v-btn>
    <v-select :items="userRoles" :value="initialRole" @change="setUserRole" />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { UserRole } from '@/types/user'

@Component
export default class DebugMenu extends Vue {
  userRoles = [
    {
      text: 'client',
      value: UserRole.CLIENT,
    },
    {
      text: 'cbo',
      value: UserRole.CBO,
    },
    {
      text: 'agent',
      value: UserRole.AGENT,
    },
  ]

  initialRole = UserRole.CLIENT

  mounted() {
    if (this.$auth.user)
      this.$store.commit('user/setUserId', this.$auth.user.username)
    else {
      this.$store.commit('user/setUserId', 'testUserId')
    }
    this.$store.dispatch('user/fetchRole').then((role: UserRole) => {
      this.initialRole = role
    })
  }

  expireToken() {
    this.$auth.setToken('oauth2', 'bleh')
  }

  logIn() {
    this.$auth.login()
  }

  logOut() {
    this.$auth.logout()
  }

  getDocuments() {
    this.$store.dispatch('user/getDocuments').then((res) => {
      console.log(res)
    })
  }

  setUserRole(v: UserRole) {
    this.$store.dispatch('user/setRole', v)
  }

  sendEvent() {
    console.log('analytics instance:', this.$ga)
    this.$ga.event({
      eventCategory: 'upload',
      eventAction: 'file-input',
      eventLabel: 'client',
    })
  }
}
</script>
