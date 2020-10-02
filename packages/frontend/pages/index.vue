<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-card>
        <v-card-title class="headline">
          {{ $t('welcome') }} to Homeless Data Wallet
        </v-card-title>
        <v-card-text>
          <p>Current locale is {{ $i18n.locale }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" nuxt to="/documents"> Document List </v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { Vue, Component } from 'nuxt-property-decorator'
import Logo from '@/components/Logo/Logo.vue'
import VuetifyLogo from '@/components/VuetifyLogo.vue'

@Component({
  components: {
    Logo,
    VuetifyLogo
  },
  head: {
    title: 'Dashboard'
  }
})
export default class Dashboard extends Vue {}
</script>
