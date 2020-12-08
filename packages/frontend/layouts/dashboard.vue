<template>
  <v-app>
    <SideNav />
    <nuxt />
    <FooterLinks />
    <SnackBar />
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class DashboardLayout extends Vue {
  mounted() {
    if (this.$route.params.showSnack) {
      this.$store.dispatch('snackbar/show')
    }
  }
}
</script>
