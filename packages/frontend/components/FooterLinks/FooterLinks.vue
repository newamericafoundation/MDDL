<template>
  <v-footer v-show="$vuetify.breakpoint.smAndUp" fixed class="justify-end pa-0">
    <div class="blue-mid-light px-4 d-flex align-center">
      <v-btn
        min-height="12px"
        class="grey-5--text px-1"
        text
        :to="localePath('/terms-of-use')"
      >
        {{ $t('navigation.termsOfUse') }}
      </v-btn>
      <div class="d-inline grey-5--text">·</div>
      <v-btn
        min-height="12px"
        class="grey-5--text px-1"
        text
        :to="localePath('/about')"
      >
        {{ $t('navigation.about') }}
      </v-btn>
      <div class="d-inline grey-5--text">·</div>
      <v-btn
        min-height="12px"
        class="grey-5--text px-1"
        text
        :to="localePath('/faq')"
      >
        {{ $t('navigation.faq') }}
      </v-btn>
    </div>
  </v-footer>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component
export default class FooterLinks extends Vue {}
</script>
