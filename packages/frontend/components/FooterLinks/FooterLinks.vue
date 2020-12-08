<template>
  <v-footer v-show="$vuetify.breakpoint.smAndUp" fixed class="justify-end">
    <v-btn class="grey-5--text px-1" text :to="localePath('/terms-of-use')">
      {{ $t('navigation.termsOfUse') }}
    </v-btn>
    <span class="grey-5--text">·</span>
    <v-btn class="grey-5--text px-1" text :to="localePath('/about')">
      {{ $t('navigation.about') }}
    </v-btn>
  </v-footer>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component
export default class FooterLinks extends Vue {}
</script>
