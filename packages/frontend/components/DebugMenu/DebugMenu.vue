<template>
  <div>
    <!-- Note: corrupting the token doesn't really happen in normal usage -->
    <v-btn @click="expireToken">Expire token</v-btn>
    <v-btn @click="logIn">log in</v-btn>
    <v-btn @click="logOut">log out</v-btn>
    <v-btn @click="getDocuments">request documents</v-btn>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component
export default class DebugMenu extends Vue {
  mounted() {
    if (this.$auth.user)
      this.$store.commit('user/setUserId', this.$auth.user.username)
    else {
      this.$store.commit('user/setUserId', 'testUserId')
    }
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
    this.$store.dispatch('user/getDocuments').then(res => {
      console.log(res)
    })
  }
}
</script>
